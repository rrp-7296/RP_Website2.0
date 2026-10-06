<?php
/**
 * routes/contact.php — Public endpoints for contact form, visitor profile tracking, subscriptions, and email verification.
 */

$db = get_db();

// GET or POST /verify — Verify Email Link for contact, subscriber, or visitor
if (($method === 'GET' || $method === 'POST') && ($path === '/verify' || str_starts_with($path, '/verify'))) {
    $token = $_GET['token'] ?? null;
    $type  = $_GET['type'] ?? null;
    if ($method === 'POST') {
        $body  = get_body();
        $token = $token ?: ($body['token'] ?? null);
        $type  = $type ?: ($body['type'] ?? null);
    }

    if (!$token || !is_string($token)) {
        json_error('Verification token is required.', 400);
    }

    $verified = verify_email_token($db, trim($token), $type ? trim($type) : null);
    if (!$verified) {
        json_error('This confirmation link is invalid or has expired. Please submit your request again.', 400);
    }

    $actionType = $verified['action_type'];
    $email      = $verified['email'];
    $payload    = $verified['payload'] ?? [];
    $name       = $payload['name'] ?? '';

    if ($actionType === 'contact') {
        $msgId   = (int)($payload['message_id'] ?? 0);
        $subject = $payload['subject'] ?? '';
        $msgText = $payload['message'] ?? '';

        // Mark message verified in database
        if ($msgId > 0) {
            $db->prepare('UPDATE contact_messages SET is_verified = 1 WHERE id = ?')->execute([$msgId]);
        } else {
            $db->prepare('UPDATE contact_messages SET is_verified = 1 WHERE email = ? AND is_verified = 0')->execute([$email]);
        }

        // Now trigger admin notification, FCM push, and email
        $notifText = "New verified contact message from: {$name} ({$email})";
        $db->prepare("INSERT INTO notifications (type, post_id, item_id, message) VALUES ('message', NULL, ?, ?)")
           ->execute([$msgId, $notifText]);

        broadcast_fcm_notification('📩 New Contact Message', $notifText);
        @send_admin_contact_notification($name, $email, $subject, $msgText);

        json_success([
            'verified' => true,
            'type'     => 'contact',
            'email'    => $email,
            'message'  => 'Your email has been verified! Your message has been safely delivered to Rakeshwar Pandey\'s office.'
        ]);
    }

    if ($actionType === 'subscriber') {
        $phone = $payload['phone'] ?? null;

        // Activate or insert subscription
        $check = $db->prepare('SELECT id FROM subscriptions WHERE email = ? LIMIT 1');
        $check->execute([$email]);
        if ($sub = $check->fetch()) {
            $db->prepare("UPDATE subscriptions SET status = 'active', name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?")
               ->execute([$name ?: null, $phone ?: null, $sub['id']]);
        } else {
            $db->prepare("INSERT INTO subscriptions (name, email, phone, status) VALUES (?, ?, ?, 'active')")
               ->execute([$name ?: null, $email, $phone ?: null]);
        }

        // Also sync visitor_profiles
        try {
            $db->prepare("UPDATE visitor_profiles SET is_subscribed = 1 WHERE email = ?")->execute([$email]);
        } catch (Exception $e) {}

        // Admin notification
        $notifMsg = "New verified subscriber: " . ($name ? "{$name} ({$email})" : $email);
        $db->prepare("INSERT INTO notifications (type, post_id, item_id, message) VALUES ('subscription', NULL, NULL, ?)")
           ->execute([$notifMsg]);

        broadcast_fcm_notification('🔔 New Subscriber', $notifMsg);

        // Send welcome email to subscriber
        @send_subscriber_welcome_email($email, $name);

        json_success([
            'verified' => true,
            'type'     => 'subscriber',
            'email'    => $email,
            'message'  => 'Your email has been verified! Welcome to the official newsletter network of Rakeshwar Pandey.'
        ]);
    }

    if ($actionType === 'visitor') {
        $visitorId = (int)($payload['visitor_id'] ?? 0);
        $phone     = $payload['phone'] ?? null;
        $isSub     = !empty($payload['is_subscribed']) ? 1 : 0;

        if ($visitorId > 0) {
            $db->prepare('UPDATE visitor_profiles SET is_verified = 1 WHERE id = ?')->execute([$visitorId]);
        } else {
            $db->prepare('UPDATE visitor_profiles SET is_verified = 1 WHERE email = ?')->execute([$email]);
        }

        if ($isSub) {
            $check = $db->prepare('SELECT id FROM subscriptions WHERE email = ? LIMIT 1');
            $check->execute([$email]);
            if ($sub = $check->fetch()) {
                $db->prepare("UPDATE subscriptions SET status = 'active', name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?")
                   ->execute([$name ?: null, $phone ?: null, $sub['id']]);
            } else {
                $db->prepare("INSERT INTO subscriptions (name, email, phone, status) VALUES (?, ?, ?, 'active')")
                   ->execute([$name ?: null, $email, $phone ?: null]);
            }
            @send_subscriber_welcome_email($email, $name);
        }

        $notifMsg = "Verified visitor registered: '{$name}' ({$email})";
        $db->prepare("INSERT INTO notifications (type, post_id, item_id, message) VALUES ('visitor', NULL, ?, ?)")
           ->execute([$visitorId, $notifMsg]);

        broadcast_fcm_notification('👤 Verified Visitor', $notifMsg);

        json_success([
            'verified' => true,
            'type'     => 'visitor',
            'email'    => $email,
            'message'  => 'Your email has been verified! Welcome to the official portal.'
        ]);
    }

    json_success([
        'verified' => true,
        'type'     => $actionType,
        'email'    => $email,
        'message'  => 'Your email has been verified successfully.'
    ]);
}

// POST /messages (Contact Form Submission)
if ($method === 'POST' && ($path === '/messages' || $path === '/contact')) {
    $body = get_body();

    // Security Layers: Rate Limiting, Honeypot, Time-gate
    check_rate_limit('contact_form', 5, 600, 1800);
    verify_honeypot($body);
    verify_time_gate($body, 2.5);

    $name    = require_field($body, 'name');
    $email   = require_field($body, 'email');
    $subject = optional_field($body, 'subject', '');
    $message = require_field($body, 'message');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address', 422);
    }

    if (is_disposable_email($email)) {
        json_error('Please use a valid personal or business email address.', 422);
    }

    // Clean text fields
    $name    = sanitize_clean_text($name, 100);
    $subject = sanitize_clean_text($subject, 200);
    $message = sanitize_clean_text($message, 5000);

    // Save as unverified (is_verified = 0) so spam/bots cannot enter inbox or trigger FCM alerts
    $stmt = $db->prepare(
        'INSERT INTO contact_messages (name, email, subject, message, is_verified) VALUES (?, ?, ?, ?, 0)'
    );
    $stmt->execute([$name, $email, $subject, $message]);
    $msgId = (int) $db->lastInsertId();

    // Issue verification token
    $tokenInfo = create_verification_token($db, $email, 'contact', [
        'message_id' => $msgId,
        'name'       => $name,
        'email'      => $email,
        'subject'    => $subject,
        'message'    => $message
    ], 24);

    // Dispatch verification link email
    send_verification_email($email, $name, $tokenInfo['verify_url'], 'contact', ['subject' => $subject]);

    $resp = [
        'requires_verification' => true,
        'email'                 => $email,
        'message'               => "A confirmation link has been sent to {$email}. Please click the link in your email to verify and deliver your message."
    ];
    if (defined('DEBUG') && DEBUG) {
        $resp['debug_verify_url'] = $tokenInfo['verify_url'];
    }

    json_success($resp);
}

// POST /visitors — Save visitor profile & newsletter subscription (No duplicate entries, verifies email)
if ($method === 'POST' && $path === '/visitors') {
    $body = get_body();

    // Security Layers: Rate Limiting, Honeypot, Time-gate
    check_rate_limit('visitor_register', 10, 600, 1800);
    verify_honeypot($body);
    verify_time_gate($body, 1.5);

    $name         = require_field($body, 'name');
    $email        = optional_field($body, 'email', '');
    $phone        = optional_field($body, 'phone', '');
    $isSubscribed = isset($body['is_subscribed']) ? ((bool) $body['is_subscribed'] ? 1 : 0) : 1;

    $name = sanitize_clean_text($name, 100);
    if ($email && is_disposable_email($email)) {
        json_error('Please provide a valid permanent email address.', 422);
    }

    if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Check if already registered and verified
        $checkVis = $db->prepare('SELECT id, is_verified FROM visitor_profiles WHERE email = ? LIMIT 1');
        $checkVis->execute([$email]);
        $rowVis = $checkVis->fetch();

        if ($rowVis && !empty($rowVis['is_verified'])) {
            // Already verified visitor! Simply update profile
            $visitorId = (int)$rowVis['id'];
            $db->prepare('UPDATE visitor_profiles SET name = ?, phone = COALESCE(?, phone), is_subscribed = ? WHERE id = ?')
               ->execute([$name, $phone ?: null, $isSubscribed, $visitorId]);

            json_success([
                'message'               => 'Welcome back! Profile updated.',
                'is_existing'           => true,
                'requires_verification' => false,
                'visitor'               => [
                    'id'            => $visitorId,
                    'name'          => $name,
                    'email'         => $email,
                    'phone'         => $phone,
                    'is_subscribed' => (bool)$isSubscribed
                ]
            ]);
        }

        // New or unverified visitor: insert / update as is_verified = 0
        if ($rowVis) {
            $visitorId = (int)$rowVis['id'];
            $db->prepare('UPDATE visitor_profiles SET name = ?, phone = COALESCE(?, phone), is_subscribed = ?, is_verified = 0 WHERE id = ?')
               ->execute([$name, $phone ?: null, $isSubscribed, $visitorId]);
        } else {
            $stmt = $db->prepare('INSERT INTO visitor_profiles (name, email, phone, is_subscribed, is_verified) VALUES (?, ?, ?, ?, 0)');
            $stmt->execute([$name, $email, $phone ?: null, $isSubscribed]);
            $visitorId = (int) $db->lastInsertId();
        }

        // Issue verification token
        $tokenInfo = create_verification_token($db, $email, 'visitor', [
            'visitor_id'    => $visitorId,
            'name'          => $name,
            'email'         => $email,
            'phone'         => $phone,
            'is_subscribed' => $isSubscribed
        ], 24);

        send_verification_email($email, $name, $tokenInfo['verify_url'], 'visitor');

        $resp = [
            'message'               => "A confirmation link has been sent to {$email}. Please click it to verify your profile.",
            'requires_verification' => true,
            'email'                 => $email,
            'visitor'               => [
                'id'            => $visitorId,
                'name'          => $name,
                'email'         => $email,
                'phone'         => $phone,
                'is_subscribed' => (bool)$isSubscribed
            ]
        ];
        if (defined('DEBUG') && DEBUG) {
            $resp['debug_verify_url'] = $tokenInfo['verify_url'];
        }
        json_success($resp);
    }

    // Name-only visitor without email
    $stmt = $db->prepare('INSERT INTO visitor_profiles (name, email, phone, is_subscribed, is_verified) VALUES (?, NULL, ?, ?, 1)');
    $stmt->execute([$name, $phone ?: null, $isSubscribed]);
    $visitorId = (int) $db->lastInsertId();

    json_success([
        'message'               => 'Visitor profile saved successfully',
        'is_existing'           => false,
        'requires_verification' => false,
        'visitor'               => [
            'id'            => $visitorId,
            'name'          => $name,
            'email'         => '',
            'phone'         => $phone,
            'is_subscribed' => (bool)$isSubscribed
        ]
    ]);
}

// POST /unsubscribe
if ($method === 'POST' && ($path === '/unsubscribe' || $path === '/subscriptions/unsubscribe')) {
    $body  = get_body();
    $email = $_GET['email'] ?? optional_field($body, 'email', '');
    if (!$email) json_error('Email address is required', 422);

    $stmt = $db->prepare("UPDATE subscriptions SET status = 'unsubscribed' WHERE email = ?");
    $stmt->execute([$email]);

    $db->prepare("UPDATE visitor_profiles SET is_subscribed = 0 WHERE email = ?")->execute([$email]);

    $db->prepare(
        "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('unsubscribe', NULL, NULL, ?)"
    )->execute(["Subscriber unsubscribed: {$email}"]);

    json_message('You have been unsubscribed successfully.');
}

// POST /resubscribe
if ($method === 'POST' && ($path === '/resubscribe' || $path === '/subscriptions/resubscribe')) {
    $body  = get_body();
    $email = $_GET['email'] ?? optional_field($body, 'email', '');
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Valid email address is required', 422);
    }

    $stmt = $db->prepare('SELECT id, name FROM subscriptions WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $sub = $stmt->fetch();

    if ($sub) {
        $db->prepare("UPDATE subscriptions SET status = 'active' WHERE id = ?")->execute([$sub['id']]);
        $name = $sub['name'] ?? '';
    } else {
        $db->prepare("INSERT INTO subscriptions (email, status) VALUES (?, 'active')")->execute([$email]);
        $name = '';
    }

    $db->prepare("UPDATE visitor_profiles SET is_subscribed = 1 WHERE email = ?")->execute([$email]);

    $db->prepare(
        "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('subscription', NULL, NULL, ?)"
    )->execute(["Subscriber resubscribed: {$email}"]);

    // Send Welcome / Resubscribe confirmation email
    send_subscriber_welcome_email($email, $name);

    json_message('Welcome back! You have been resubscribed successfully.');
}

// POST /subscriptions (JSON body style)
if ($method === 'POST' && $path === '/subscriptions') {
    $body  = get_body();
    $email = require_field($body, 'email');
    $name  = optional_field($body, 'name', '');
    $phone = optional_field($body, 'phone', '');
    handle_subscription($db, $email, $name, $phone, $body);
}

// POST /subscribe (query-param style)
if ($method === 'POST' && $path === '/subscribe') {
    $body  = get_body();
    $email = $_GET['email'] ?? require_field($body, 'email');
    $name  = $_GET['name'] ?? optional_field($body, 'name', '');
    $phone = $_GET['phone'] ?? optional_field($body, 'phone', '');
    handle_subscription($db, $email, $name, $phone, $body);
}

function handle_subscription(PDO $db, string $email, string $name = '', string $phone = '', array $body = []): void {
    // Security Layers: Rate Limiting, Honeypot, Time-gate
    check_rate_limit('newsletter_subscribe', 5, 600, 1800);
    verify_honeypot($body);
    verify_time_gate($body, 2.0);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address', 422);
    }

    if (is_disposable_email($email)) {
        json_error('Please use a valid personal or business email address.', 422);
    }

    $name = sanitize_clean_text($name, 100);

    $stmt = $db->prepare('SELECT id, status FROM subscriptions WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing && ($existing['status'] ?? 'active') === 'active') {
        json_message('You are already subscribed!');
    }

    // If existing and pending or unsubscribed, or totally new
    if ($existing) {
        $db->prepare("UPDATE subscriptions SET status = 'pending', name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?")
           ->execute([$name ?: null, $phone ?: null, $existing['id']]);
    } else {
        $db->prepare("INSERT INTO subscriptions (name, email, phone, status) VALUES (?, ?, ?, 'pending')")
           ->execute([$name ?: null, $email, $phone ?: null]);
    }

    // Issue verification token
    $tokenInfo = create_verification_token($db, $email, 'subscriber', [
        'name'  => $name,
        'email' => $email,
        'phone' => $phone
    ], 24);

    send_verification_email($email, $name, $tokenInfo['verify_url'], 'subscriber');

    $resp = [
        'requires_verification' => true,
        'email'                 => $email,
        'message'               => "A confirmation link has been sent to {$email}. Please click the link to confirm your subscription."
    ];
    if (defined('DEBUG') && DEBUG) {
        $resp['debug_verify_url'] = $tokenInfo['verify_url'];
    }

    json_success($resp);
}

/**
 * Send notification email to admin using HTML email helper.
 */
function send_notification_email(string $name, string $email, string $subject, string $message): void {
    send_admin_contact_notification($name, $email, $subject, $message);
}

json_error("Not found: [$method] $path", 404);

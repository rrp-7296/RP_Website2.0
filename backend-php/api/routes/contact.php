<?php
/**
 * routes/contact.php — Public contact and subscription endpoints.
 *
 * POST /messages      — submit contact form
 * POST /contact       — alias for /messages
 * POST /subscriptions — subscribe with JSON body {"email": "..."}
 * POST /subscribe     — subscribe with query param ?email=...
 */

$db = get_db();

// POST /messages or /contact
if ($method === 'POST' && ($path === '/messages' || $path === '/contact')) {
    $body    = get_body();
    $name    = require_field($body, 'name');
    $email   = require_field($body, 'email');
    $subject = optional_field($body, 'subject', '');
    $message = require_field($body, 'message');

    // Basic email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address', 422);
    }

    $stmt = $db->prepare(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$name, $email, $subject, $message]);
    $msgId = (int) $db->lastInsertId();

    // Create notification for admin dashboard
    $db->prepare(
        "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('message', NULL, ?, ?)"
    )->execute([$msgId, "New contact message from: {$name} ({$email})"]);

    // Best-effort notification email (don't fail if email fails)
    @send_notification_email($name, $email, $subject, $message);

    json_message('Thank you! Your message has been submitted successfully.');
}

// POST /visitors — Save visitor profile & newsletter subscription (No duplicate entries)
if ($method === 'POST' && $path === '/visitors') {
    $body         = get_body();
    $name         = require_field($body, 'name');
    $email        = optional_field($body, 'email', '');
    $phone        = optional_field($body, 'phone', '');
    $isSubscribed = isset($body['is_subscribed']) ? ((bool) $body['is_subscribed'] ? 1 : 0) : 1;

    $isExisting = false;
    $visitorId  = 0;

    // Check if email already exists in visitor_profiles or subscriptions
    if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $checkVis = $db->prepare('SELECT id FROM visitor_profiles WHERE email = ? LIMIT 1');
        $checkVis->execute([$email]);
        if ($rowVis = $checkVis->fetch()) {
            $isExisting = true;
            $visitorId  = (int) $rowVis['id'];
            $db->prepare('UPDATE visitor_profiles SET name = ?, phone = COALESCE(?, phone), is_subscribed = ? WHERE id = ?')
               ->execute([$name, $phone ?: null, $isSubscribed, $visitorId]);
        }

        $checkSub = $db->prepare('SELECT id FROM subscriptions WHERE email = ? LIMIT 1');
        $checkSub->execute([$email]);
        if ($rowSub = $checkSub->fetch()) {
            $isExisting = true;
            if ($isSubscribed) {
                $db->prepare("UPDATE subscriptions SET name = COALESCE(?, name), phone = COALESCE(?, phone), status = 'active' WHERE id = ?")
                   ->execute([$name ?: null, $phone ?: null, $rowSub['id']]);
            }
        } elseif ($isSubscribed) {
            $db->prepare("INSERT INTO subscriptions (name, email, phone, status) VALUES (?, ?, ?, 'active')")
               ->execute([$name ?: null, $email, $phone ?: null]);
        }
    }

    if (!$visitorId) {
        $stmt = $db->prepare('INSERT INTO visitor_profiles (name, email, phone, is_subscribed) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email ?: null, $phone ?: null, $isSubscribed]);
        $visitorId = (int) $db->lastInsertId();
    }

    // Add notification for admin dashboard if it's a new visitor
    if (!$isExisting) {
        $contactInfo = array_filter([$email, $phone]);
        $infoStr = !empty($contactInfo) ? ' (' . implode(', ', $contactInfo) . ')' : '';
        $db->prepare(
            "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('visitor', NULL, ?, ?)"
        )->execute([$visitorId, "New visitor registered: '{$name}'{$infoStr}"]);
    }

    json_success([
        'message'     => $isExisting ? 'Welcome back! Profile updated.' : 'Visitor profile saved successfully',
        'is_existing' => $isExisting,
        'visitor'     => [
            'id'            => $visitorId,
            'name'          => $name,
            'email'         => $email,
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

    json_message('You have been unsubscribed from email updates.');
}

// POST /resubscribe
if ($method === 'POST' && ($path === '/resubscribe' || $path === '/subscriptions/resubscribe')) {
    $body  = get_body();
    $email = $_GET['email'] ?? optional_field($body, 'email', '');
    if (!$email) json_error('Email address is required', 422);

    $stmt = $db->prepare("UPDATE subscriptions SET status = 'active' WHERE email = ?");
    $stmt->execute([$email]);

    $db->prepare("UPDATE visitor_profiles SET is_subscribed = 1 WHERE email = ?")->execute([$email]);

    json_message('You have been resubscribed to email updates!');
}

// POST /subscriptions
if ($method === 'POST' && $path === '/subscriptions') {
    $body  = get_body();
    $email = require_field($body, 'email');
    $name  = optional_field($body, 'name', '');
    $phone = optional_field($body, 'phone', '');
    handle_subscription($db, $email, $name, $phone);
}

// POST /subscribe (query-param style)
if ($method === 'POST' && $path === '/subscribe') {
    $body  = get_body();
    $email = $_GET['email'] ?? require_field($body, 'email');
    $name  = $_GET['name'] ?? optional_field($body, 'name', '');
    $phone = $_GET['phone'] ?? optional_field($body, 'phone', '');
    handle_subscription($db, $email, $name, $phone);
}

function handle_subscription(PDO $db, string $email, string $name = '', string $phone = ''): void {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address', 422);
    }

    $stmt = $db->prepare('SELECT id FROM subscriptions WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_message('You are already subscribed!');
    }

    $db->prepare('INSERT INTO subscriptions (name, email, phone) VALUES (?, ?, ?)')->execute([$name ?: null, $email, $phone ?: null]);
    
    // Add notification
    $db->prepare(
        "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('subscription', NULL, NULL, ?)"
    )->execute(["New newsletter subscriber: " . ($name ? "{$name} ({$email})" : $email)]);

    json_message('You are subscribed! Thank you.');
}

/**
 * Send a simple notification email using PHP mail().
 * Uses native mail() — no SMTP library needed for most cPanel hosts.
 */
function send_notification_email(string $name, string $email, string $subject, string $message): void {
    $to      = CONTACT_NOTIFY_EMAIL;
    $subj    = APP_NAME . ' — New Contact: ' . ($subject ?: 'No Subject');
    $body    = "New message from: $name <$email>\nSubject: $subject\n\n$message";
    $headers = "From: noreply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n" .
               "Reply-To: $email\r\n" .
               "X-Mailer: PHP/" . PHP_VERSION;
    @mail($to, $subj, $body, $headers);
}

json_error("Not found: [$method] $path", 404);

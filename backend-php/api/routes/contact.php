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

    // Best-effort notification email (don't fail if email fails)
    @send_notification_email($name, $email, $subject, $message);

    json_message('Thank you! Your message has been submitted successfully.');
}

// POST /subscriptions
if ($method === 'POST' && $path === '/subscriptions') {
    $body  = get_body();
    $email = require_field($body, 'email');
    handle_subscription($db, $email);
}

// POST /subscribe (query-param style)
if ($method === 'POST' && $path === '/subscribe') {
    $email = $_GET['email'] ?? require_field(get_body(), 'email');
    handle_subscription($db, $email);
}

function handle_subscription(PDO $db, string $email): void {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address', 422);
    }

    $stmt = $db->prepare('SELECT id FROM subscriptions WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_message('You are already subscribed!');
    }

    $db->prepare('INSERT INTO subscriptions (email) VALUES (?)')->execute([$email]);
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

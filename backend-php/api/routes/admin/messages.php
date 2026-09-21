<?php
/**
 * routes/admin/messages.php — Admin contact message management.
 *
 * GET   /admin/messages                   — paginated list
 * PATCH /admin/messages/{id}/read         — mark as read
 * POST  /admin/messages/{id}/reply        — reply via email + mark replied
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// GET /admin/messages
if ($method === 'GET' && $adminPath === '/messages') {
    $page  = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(max(1, (int) ($_GET['limit'] ?? 20)), 100);

    $result = paginate(
        $db,
        'SELECT COUNT(*) FROM contact_messages WHERE is_deleted = 0',
        'SELECT id, name, email, subject, message, is_read, is_replied, reply_message, replied_at, created_at
         FROM contact_messages
         WHERE is_deleted = 0
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?',
        [],
        $page,
        $limit
    );

    json_success($result);
}

// PATCH /admin/messages/{id}/read
if ($method === 'PATCH' && ($m = match_route('/admin/messages/{id}/read', $adminPath)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM contact_messages WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Message not found', 404);

    $db->prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?')->execute([$id]);
    json_message('Message marked as read');
}

// POST /admin/messages/{id}/reply
if ($method === 'POST' && ($m = match_route('/admin/messages/{id}/reply', $adminPath)) !== false) {
    $id   = (int) $m['id'];
    $body = get_body();
    $replyMessage = require_field($body, 'reply_message');

    $stmt = $db->prepare('SELECT id, name, email, subject FROM contact_messages WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $msg = $stmt->fetch();
    if (!$msg) json_error('Message not found', 404);

    // Send reply email
    $sent = send_reply_email(
        $msg['email'], $msg['name'], $msg['subject'] ?? '', $replyMessage
    );

    if (!$sent) {
        json_error('Failed to send email. Check mail server settings.', 500);
    }

    // Update DB
    $db->prepare(
        'UPDATE contact_messages SET is_replied = 1, reply_message = ?, replied_at = NOW(), is_read = 1 WHERE id = ?'
    )->execute([$replyMessage, $id]);

    json_message('Reply email sent successfully and recorded.');
}

/**
 * Send a reply email to the contact form sender.
 */
function send_reply_email(string $toEmail, string $toName, string $originalSubject, string $replyBody): bool {
    $to      = "$toName <$toEmail>";
    $subject = 'Re: ' . ($originalSubject ?: 'Your message to ' . APP_NAME);
    $body    = "Dear $toName,\n\n$replyBody\n\nBest regards,\n" . APP_NAME;
    $headers = "From: " . APP_NAME . " <" . SMTP_USER . ">\r\n" .
               "Reply-To: " . SMTP_USER . "\r\n" .
               "X-Mailer: PHP/" . PHP_VERSION;

    return @mail($to, $subject, $body, $headers);
}

json_error("Not found: [$method] $path", 404);

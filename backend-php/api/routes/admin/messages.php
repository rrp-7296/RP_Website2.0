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
        'SELECT COUNT(*) FROM contact_messages WHERE (is_deleted = 0 OR is_deleted IS NULL)',
        'SELECT id, name, email, subject, message, is_read, is_replied, reply_message, replied_at, created_at
         FROM contact_messages
         WHERE (is_deleted = 0 OR is_deleted IS NULL)
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?',
        [],
        $page,
        $limit
    );

    // Ensure boolean fields are strict booleans for JavaScript clients
    foreach ($result['items'] as &$item) {
        $item['is_read'] = ((int)($item['is_read'] ?? 0)) === 1;
        $item['is_replied'] = ((int)($item['is_replied'] ?? 0)) === 1;
    }

    json_success($result);
}

// PATCH /admin/messages/{id}/read
if ($method === 'PATCH' && ($m = match_route('/admin/messages/{id}/read', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM contact_messages WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Message not found', 404);

    $db->prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?')->execute([$id]);
    json_message('Message marked as read');
}

// POST /admin/messages/{id}/reply
if ($method === 'POST' && ($m = match_route('/admin/messages/{id}/reply', $path)) !== false) {
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
        'UPDATE contact_messages SET is_replied = 1, reply_message = ?, replied_at = CURRENT_TIMESTAMP, is_read = 1 WHERE id = ?'
    )->execute([$replyMessage, $id]);

    json_message('Reply email sent successfully and recorded.');
}

json_error("Not found: [$method] $path", 404);

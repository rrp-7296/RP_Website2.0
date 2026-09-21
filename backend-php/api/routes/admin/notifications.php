<?php
/**
 * routes/admin/notifications.php — Admin notification management.
 *
 * GET    /admin/notifications             — list all notifications
 * PATCH  /admin/notifications/{id}/read   — mark one as read
 * POST   /admin/notifications/read-all    — mark all as read
 * DELETE /admin/notifications/{id}        — delete a notification
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// GET /admin/notifications
if ($method === 'GET' && $adminPath === '/notifications') {
    $stmt = $db->query(
        'SELECT id, type, post_id, item_id, message, is_read, created_at
         FROM notifications
         ORDER BY created_at DESC'
    );
    json_success($stmt->fetchAll());
}

// POST /admin/notifications/read-all  — must come before /{id}/read match
if ($method === 'POST' && $adminPath === '/notifications/read-all') {
    $db->exec('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    json_message('All notifications marked as read');
}

// PATCH /admin/notifications/{id}/read
if ($method === 'PATCH' && ($m = match_route('/notifications/{id}/read', $adminPath)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM notifications WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Notification not found', 404);

    $db->prepare('UPDATE notifications SET is_read = 1 WHERE id = ?')->execute([$id]);
    json_message('Notification marked as read');
}

// DELETE /admin/notifications/{id}
if ($method === 'DELETE' && ($m = match_route('/notifications/{id}', $adminPath)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM notifications WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Notification not found', 404);

    $db->prepare('DELETE FROM notifications WHERE id = ?')->execute([$id]);
    json_message('Notification deleted');
}

json_error("Not found: [$method] $path", 404);

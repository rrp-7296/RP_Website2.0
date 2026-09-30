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

// POST /admin/fcm-token — Save FCM device token for admin closed-app push notifications
if ($method === 'POST' && ($adminPath === '/fcm-token' || $path === '/admin/fcm-token')) {
    $body = get_body();
    $fcmToken = require_field($body, 'fcm_token');

    try {
        $stmt = $db->prepare('INSERT INTO admin_fcm_tokens (username, fcm_token) VALUES (?, ?)');
        $stmt->execute([$username, $fcmToken]);
    } catch (Exception $e) {
        $db->prepare('UPDATE admin_fcm_tokens SET updated_at = CURRENT_TIMESTAMP WHERE fcm_token = ?')->execute([$fcmToken]);
    }

    json_success(['message' => 'FCM Token registered successfully']);
}

// POST /admin/notifications/test-push — Send a test FCM push to verify background delivery
if ($method === 'POST' && ($adminPath === '/notifications/test-push' || $adminPath === '/test-push')) {
    broadcast_fcm_notification(
        '🧪 Test Push Notification',
        'If you see this when the app is CLOSED, background push is working!'
    );

    // Also check FCM status for debugging
    $tokenCount = $db->query('SELECT COUNT(*) FROM admin_fcm_tokens')->fetchColumn();

    $serviceAccountExists = false;
    foreach ([
        __DIR__ . '/../../firebase-service-account.json',
        __DIR__ . '/../../config/firebase-service-account.json',
        __DIR__ . '/../../../firebase-service-account.json',
    ] as $p) {
        if (file_exists($p)) { $serviceAccountExists = true; break; }
    }

    // Check for debug log
    $logFile = __DIR__ . '/../../logs/fcm_debug.log';
    $lastLogLines = '';
    if (file_exists($logFile)) {
        $lines = file($logFile);
        $lastLogLines = implode('', array_slice($lines, -10));
    }

    json_success([
        'message' => 'Test push notification sent! Close the app completely and wait a few seconds.',
        'debug' => [
            'fcm_tokens_registered' => (int) $tokenCount,
            'firebase_service_account_found' => $serviceAccountExists,
            'recent_fcm_log' => $lastLogLines,
        ]
    ]);
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

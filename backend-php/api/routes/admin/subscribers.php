<?php
/**
 * routes/admin/subscribers.php — Admin subscriber & recipient management.
 *
 * GET   /admin/subscribers              — list subscribers
 * PATCH /admin/subscribers/{id}/status  — toggle active / unsubscribed status (no deletion)
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// GET /admin/subscribers
if ($method === 'GET' && $adminPath === '/subscribers') {
    $page  = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(max(1, (int) ($_GET['limit'] ?? 20)), 100);

    $result = paginate(
        $db,
        'SELECT COUNT(*) FROM subscriptions',
        "SELECT id, name, email, phone, COALESCE(status, 'active') AS status, COALESCE(subscribed_at, CURRENT_TIMESTAMP) AS created_at
         FROM subscriptions
         ORDER BY id DESC
         LIMIT ? OFFSET ?",
        [],
        $page,
        $limit
    );

    json_success($result);
}

// PATCH /admin/subscribers/{id}/status
if ($method === 'PATCH' && ($m = match_route('/subscribers/{id}/status', $adminPath)) !== false) {
    $id   = (int) $m['id'];
    $body = get_body();
    $newStatus = strtolower(optional_field($body, 'status', 'active'));

    if (!in_array($newStatus, ['active', 'unsubscribed'], true)) {
        json_error('Invalid status value. Allowed: active, unsubscribed', 422);
    }

    $stmt = $db->prepare('SELECT id, email FROM subscriptions WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $sub = $stmt->fetch();
    if (!$sub) {
        json_error('Subscriber not found', 404);
    }

    // Update status in subscriptions
    $db->prepare('UPDATE subscriptions SET status = ? WHERE id = ?')->execute([$newStatus, $id]);

    // Also update visitor_profiles if matching email exists
    if ($sub['email']) {
        $isSubscribed = ($newStatus === 'active') ? 1 : 0;
        $db->prepare('UPDATE visitor_profiles SET is_subscribed = ? WHERE email = ?')->execute([$isSubscribed, $sub['email']]);
    }

    json_success([
        'id' => $id,
        'status' => $newStatus,
        'message' => "Subscriber status updated to {$newStatus}"
    ]);
}

json_error("Not found: [$method] $path", 404);

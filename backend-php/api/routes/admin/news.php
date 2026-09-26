<?php
/**
 * routes/admin/news.php — Admin news CRUD.
 *
 * POST   /admin/news       — create news item
 * DELETE /admin/news/{id}  — soft delete
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// POST /admin/news
if ($method === 'POST' && $adminPath === '/news') {
    $title    = require_field($_POST, 'title');
    $text     = require_field($_POST, 'text');
    $url      = optional_field($_POST, 'url', '');
    $filename = save_upload('image', 'news');

    $stmt = $db->prepare(
        'INSERT INTO news_items (title, text, url, image, is_published, is_deleted) VALUES (?, ?, ?, ?, 1, 0)'
    );
    $stmt->execute([$title, $text, $url, $filename]);

    $id = (int) $db->lastInsertId();

    $notify = filter_var($_POST['notify_subscribers'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
    $sentStats = null;
    if ($notify && $id) {
        $siteUrl = defined('APP_URL') ? APP_URL : 'https://rakeshwarpandey.com';
        $postLink = rtrim($siteUrl, '/') . '/#/news';
        $sentStats = broadcast_email_to_subscribers($db, $title, $text, $postLink, 'News Item');
    }

    json_success([
        'id' => $id,
        'message' => 'News item created successfully' . ($sentStats ? " ({$sentStats['sent']}/{$sentStats['total']} emails sent)" : '')
    ]);
}

// DELETE /admin/news/{id}
if ($method === 'DELETE' && ($m = match_route('/admin/news/{id}', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM news_items WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('News item not found', 404);

    $db->prepare('UPDATE news_items SET is_deleted = 1 WHERE id = ?')->execute([$id]);
    json_message('News item deleted');
}

json_error("Not found: [$method] $path", 404);

<?php
/**
 * routes/admin/timeline.php — Admin timeline CRUD.
 *
 * POST   /admin/timeline       — create event (with optional gallery auto-add)
 * DELETE /admin/timeline/{id}  — soft delete event + remove linked gallery entry
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// POST /admin/timeline
if ($method === 'POST' && $adminPath === '/timeline') {
    $text          = require_field($_POST, 'text');
    $location      = optional_field($_POST, 'location', '');
    $add_to_gallery = filter_var($_POST['add_to_gallery'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true;

    $filename = save_upload('image', 'timeline');

    $stmt = $db->prepare(
        'INSERT INTO timeline_events (text, location, image, add_to_gallery, is_published, is_deleted) VALUES (?, ?, ?, ?, 1, 0)'
    );
    $stmt->execute([$text, $location, $filename, (int) $add_to_gallery]);

    $eventId = (int) $db->lastInsertId();

    // Auto-add to gallery
    if ($add_to_gallery && $filename) {
        $caption = mb_substr($text, 0, 200);
        $db->prepare(
            "INSERT INTO gallery_images (filename, tag, caption, source_timeline_id, is_published) VALUES (?, 'timeline', ?, ?, 1)"
        )->execute([$filename, $caption, $eventId]);

    }

    $notify = filter_var($_POST['notify_subscribers'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
    $sentStats = null;
    if ($notify && $eventId) {
        $siteUrl = defined('APP_URL') ? APP_URL : 'https://rakeshwarpandey.com';
        $postLink = rtrim($siteUrl, '/') . '/#/timeline';
        $titleSnippet = 'Timeline: ' . mb_substr($text, 0, 60);
        $sentStats = broadcast_email_to_subscribers($db, $titleSnippet, $text, $postLink, 'Timeline Event');
    }

    json_success([
        'id' => $eventId,
        'message' => 'Timeline event created successfully' . ($sentStats ? " ({$sentStats['sent']}/{$sentStats['total']} emails sent)" : '')
    ]);
}

// DELETE /admin/timeline/{id}
if ($method === 'DELETE' && ($m = match_route('/admin/timeline/{id}', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM timeline_events WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Timeline event not found', 404);

    // Soft-delete event
    $db->prepare('UPDATE timeline_events SET is_deleted = 1 WHERE id = ?')->execute([$id]);

    // Remove linked gallery image
    $gStmt = $db->prepare('SELECT id, filename FROM gallery_images WHERE source_timeline_id = ? LIMIT 1');
    $gStmt->execute([$id]);
    $galImg = $gStmt->fetch();
    if ($galImg) {
        delete_upload($galImg['filename'], 'timeline');
        $db->prepare('DELETE FROM gallery_images WHERE id = ?')->execute([$galImg['id']]);
    }

    json_message('Timeline event deleted');
}

json_error("Not found: [$method] $path", 404);

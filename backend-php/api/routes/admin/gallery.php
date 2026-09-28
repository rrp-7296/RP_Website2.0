<?php
/**
 * routes/admin/gallery.php — Admin gallery management.
 *
 * POST   /admin/gallery       — upload a new gallery image
 * DELETE /admin/gallery/{id}  — hard delete image + file
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// POST /admin/gallery
if ($method === 'POST' && $adminPath === '/gallery') {
    $tag     = optional_field($_POST, 'tag', 'others');
    $caption = optional_field($_POST, 'caption', '');

    $uploadedImages = save_multiple_uploads('images', 'gallery');
    if (empty($uploadedImages)) {
        json_error('At least one image file is required', 422);
    }

    $inserted = [];
    $stmt = $db->prepare(
        'INSERT INTO gallery_images (filename, original_name, tag, caption, is_published) VALUES (?, ?, ?, ?, 1)'
    );

    foreach ($uploadedImages as $idx => $filename) {
        $origName = is_array($_FILES['images']['name'] ?? null) ? ($_FILES['images']['name'][$idx] ?? '') : ($_FILES['image']['name'] ?? '');
        $stmt->execute([$filename, $origName, strtolower($tag), $caption]);
        $inserted[] = ['id' => (int) $db->lastInsertId(), 'filename' => $filename];
    }

    json_success([
        'items' => $inserted,
        'count' => count($inserted),
        'message' => count($inserted) . ' image(s) uploaded successfully'
    ]);
}

// DELETE /admin/gallery/{id} or POST /admin/gallery/{id}/delete
if (($method === 'DELETE' || ($method === 'POST' && str_ends_with($path, '/delete'))) && 
    ($m = match_route('/admin/gallery/{id}', $path) ?: match_route('/admin/gallery/{id}/delete', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id, filename FROM gallery_images WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $img = $stmt->fetch();
    if (!$img) json_error('Image not found', 404);

    if (!empty($img['filename'])) {
        delete_upload((string) $img['filename'], 'gallery');
    }
    $db->prepare('DELETE FROM gallery_images WHERE id = ?')->execute([$id]);

    json_message('Image deleted');
}

json_error("Not found: [$method] $path", 404);

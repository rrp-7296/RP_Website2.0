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

    // Image is required for gallery upload
    if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        json_error('Image file is required', 422);
    }

    $originalName = $_FILES['image']['name'] ?? '';
    $filename     = save_upload('image', 'gallery');

    $stmt = $db->prepare(
        'INSERT INTO gallery_images (filename, original_name, tag, caption) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$filename, $originalName, strtolower($tag), $caption]);
    $id = (int) $db->lastInsertId();

    json_success(['id' => $id, 'filename' => $filename, 'message' => 'Image uploaded successfully']);
}

// DELETE /admin/gallery/{id}
if ($method === 'DELETE' && ($m = match_route('/admin/gallery/{id}', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id, filename FROM gallery_images WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $img = $stmt->fetch();
    if (!$img) json_error('Image not found', 404);

    delete_upload($img['filename'], 'gallery');
    $db->prepare('DELETE FROM gallery_images WHERE id = ?')->execute([$id]);

    json_message('Image deleted');
}

json_error("Not found: [$method] $path", 404);

<?php
/**
 * routes/admin/blogs.php — Admin blog CRUD.
 *
 * POST   /admin/blogs          — create with optional image
 * PUT    /admin/blogs/{id}     — update fields / image
 * DELETE /admin/blogs/{id}     — soft delete
 */

$username = require_admin();
$db = get_db();
$adminPath = substr($path, strlen('/admin'));

// POST /admin/blogs
if ($method === 'POST' && $adminPath === '/blogs') {
    $title       = require_field($_POST, 'title');
    $description = optional_field($_POST, 'description', '');
    $main_body   = require_field($_POST, 'main_body');

    $filename = save_upload('image', 'blog');

    $stmt = $db->prepare(
        'INSERT INTO blog_posts (title, description, main_body, image) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$title, $description, $main_body, $filename]);
    $id = (int) $db->lastInsertId();

    json_success(['id' => $id, 'message' => 'Blog post created successfully'], 200);
}

// PUT /admin/blogs/{id}
if ($method === 'PUT' && ($m = match_route('/admin/blogs/{id}', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id, image FROM blog_posts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $post = $stmt->fetch();
    if (!$post) json_error('Blog post not found', 404);

    $fields = [];
    $values = [];

    // Support both form data and JSON body for fields
    $body = $_POST ?: get_body();

    if (isset($body['title']) && $body['title'] !== '')        { $fields[] = 'title = ?';        $values[] = $body['title']; }
    if (array_key_exists('description', $body))                { $fields[] = 'description = ?';  $values[] = $body['description']; }
    if (isset($body['main_body']) && $body['main_body'] !== '') { $fields[] = 'main_body = ?';    $values[] = $body['main_body']; }
    if (isset($body['is_published']))                           { $fields[] = 'is_published = ?'; $values[] = (int)(bool)$body['is_published']; }

    // Handle new image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($post['image']) delete_upload($post['image'], 'blog');
        $newFile  = save_upload('image', 'blog');
        $fields[] = 'image = ?';
        $values[] = $newFile;
    }

    if (!empty($fields)) {
        $values[] = $id;
        $db->prepare('UPDATE blog_posts SET ' . implode(', ', $fields) . ' WHERE id = ?')
           ->execute($values);
    }

    json_success(['id' => $id, 'message' => 'Blog post updated successfully']);
}

// DELETE /admin/blogs/{id}
if ($method === 'DELETE' && ($m = match_route('/admin/blogs/{id}', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM blog_posts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Blog post not found', 404);

    $db->prepare('UPDATE blog_posts SET is_deleted = 1 WHERE id = ?')->execute([$id]);
    json_message('Blog post deleted');
}

json_error("Not found: [$method] $path", 404);

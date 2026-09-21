<?php
/**
 * routes/admin/comments.php — Admin comment moderation.
 *
 * GET    /admin/comments              — list pending (unapproved) comments
 * PATCH  /admin/comments/{id}/approve — approve a comment
 * DELETE /admin/comments/{id}         — hard delete a comment
 */

$username  = require_admin();
$db        = get_db();
$adminPath = substr($path, strlen('/admin'));

// GET /admin/comments
if ($method === 'GET' && $adminPath === '/comments') {
    $stmt = $db->query(
        'SELECT id, post_id, name, email, comment, is_approved, created_at
         FROM blog_comments
         WHERE is_approved = 0
         ORDER BY created_at DESC'
    );
    json_success($stmt->fetchAll());
}

// PATCH /admin/comments/{id}/approve
if ($method === 'PATCH' && ($m = match_route('/comments/{id}/approve', $adminPath)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM blog_comments WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Comment not found', 404);

    $db->prepare('UPDATE blog_comments SET is_approved = 1 WHERE id = ?')->execute([$id]);
    json_message('Comment approved');
}

// DELETE /admin/comments/{id}
if ($method === 'DELETE' && ($m = match_route('/comments/{id}', $adminPath)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare('SELECT id FROM blog_comments WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) json_error('Comment not found', 404);

    $db->prepare('DELETE FROM blog_comments WHERE id = ?')->execute([$id]);
    json_message('Comment deleted');
}

json_error("Not found: [$method] $path", 404);

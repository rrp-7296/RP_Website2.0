<?php
/**
 * routes/blogs.php — Public blog endpoints.
 *
 * GET  /blogs                  — paginated published posts
 * GET  /blogs/popular          — top posts by likes
 * GET  /blogs/{id}             — single post + approved comments
 * POST /blogs/{id}/like        — like a post
 * POST /blogs/{id}/comments    — submit a comment (needs approval)
 */

$db = get_db();

// GET /blogs/popular
if ($method === 'GET' && $path === '/blogs/popular') {
    $limit = min((int) ($_GET['limit'] ?? 3), 10);

    $stmt = $db->prepare(
        'SELECT id, title, description, image, date, likes_count, view_count
         FROM blog_posts
         WHERE is_published = 1 AND is_deleted = 0
         ORDER BY likes_count DESC
         LIMIT ?'
    );
    $stmt->execute([$limit]);
    json_success($stmt->fetchAll());
}

// GET /blogs (paginated)
if ($method === 'GET' && $path === '/blogs') {
    $page  = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(max(1, (int) ($_GET['limit'] ?? 10)), 100);

    $result = paginate(
        $db,
        'SELECT COUNT(*) FROM blog_posts WHERE is_published = 1 AND is_deleted = 0',
        'SELECT id, title, description, image, date, likes_count, view_count
         FROM blog_posts
         WHERE is_published = 1 AND is_deleted = 0
         ORDER BY date DESC
         LIMIT ? OFFSET ?',
        [],
        $page,
        $limit
    );

    json_success($result);
}

// GET /blogs/{id}
if ($method === 'GET' && ($m = match_route('/blogs/{id}', $path)) !== false) {
    $id = (int) $m['id'];

    $stmt = $db->prepare(
        'SELECT id, title, description, main_body, image, date, likes_count, view_count
         FROM blog_posts WHERE id = ? AND is_deleted = 0 LIMIT 1'
    );
    $stmt->execute([$id]);
    $post = $stmt->fetch();

    if (!$post) {
        json_error('Blog post not found', 404);
    }

    // Increment view count
    $db->prepare('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?')->execute([$id]);

    // Fetch approved comments
    $cStmt = $db->prepare(
        'SELECT id, name, comment, created_at FROM blog_comments
         WHERE post_id = ? AND is_approved = 1 ORDER BY created_at DESC'
    );
    $cStmt->execute([$id]);
    $post['comments'] = $cStmt->fetchAll();

    json_success($post);
}

// POST /blogs/{id}/like
if ($method === 'POST' && ($m = match_route('/blogs/{id}/like', $path)) !== false) {
    $id   = (int) $m['id'];
    $body = get_body();
    $name = optional_field($body, 'name', 'Anonymous');

    $stmt = $db->prepare('SELECT id, title, likes_count FROM blog_posts WHERE id = ? AND is_deleted = 0 LIMIT 1');
    $stmt->execute([$id]);
    $post = $stmt->fetch();

    if (!$post) {
        json_error('Blog post not found', 404);
    }

    $db->beginTransaction();
    try {
        // Insert like
        $db->prepare('INSERT INTO blog_likes (post_id, name) VALUES (?, ?)')->execute([$id, $name]);
        $likeId = (int) $db->lastInsertId();

        // Increment counter
        $db->prepare('UPDATE blog_posts SET likes_count = likes_count + 1 WHERE id = ?')->execute([$id]);
        $newCount = $post['likes_count'] + 1;

        // Create notification
        $db->prepare(
            "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('like', ?, ?, ?)"
        )->execute([$id, $likeId, "'{$name}' liked your post '{$post['title']}'"]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        json_error('Failed to record like', 500);
    }

    json_message("Post liked! Total likes: $newCount");
}

// POST /blogs/{id}/comments
if ($method === 'POST' && ($m = match_route('/blogs/{id}/comments', $path)) !== false) {
    $id   = (int) $m['id'];
    $body = get_body();
    $name    = require_field($body, 'name');
    $email   = require_field($body, 'email');
    $comment = require_field($body, 'comment');

    $stmt = $db->prepare('SELECT id, title FROM blog_posts WHERE id = ? AND is_deleted = 0 LIMIT 1');
    $stmt->execute([$id]);
    $post = $stmt->fetch();

    if (!$post) {
        json_error('Blog post not found', 404);
    }

    $db->beginTransaction();
    try {
        $db->prepare(
            'INSERT INTO blog_comments (post_id, name, email, comment, is_approved) VALUES (?, ?, ?, ?, 0)'
        )->execute([$id, $name, $email, $comment]);
        $commentId = (int) $db->lastInsertId();

        // Notification
        $db->prepare(
            "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('comment', ?, ?, ?)"
        )->execute([$id, $commentId, "New comment from '{$name}' on '{$post['title']}'"]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        json_error('Failed to submit comment', 500);
    }

    json_message('Comment submitted! It will appear after approval.');
}

json_error("Not found: [$method] $path", 404);

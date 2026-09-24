<?php
/**
 * routes/news.php — Public news endpoints.
 *
 * GET /news       — paginated published news items
 * GET /news/{id}  — single news item
 */

$db = get_db();

if ($method === 'GET' && $path === '/news') {
    $page  = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(max(1, (int) ($_GET['limit'] ?? 10)), 100);

    $result = paginate(
        $db,
        'SELECT COUNT(*) FROM news_items WHERE (is_published = 1 OR is_published IS NULL) AND (is_deleted = 0 OR is_deleted IS NULL)',
        'SELECT id, title, text, url, image, date, likes_count, created_at
         FROM news_items
         WHERE (is_published = 1 OR is_published IS NULL) AND (is_deleted = 0 OR is_deleted IS NULL)
         ORDER BY COALESCE(date, created_at) DESC, id DESC
         LIMIT ? OFFSET ?',
        [],
        $page,
        $limit
    );

    foreach ($result['items'] as &$item) {
        $item['likes'] = (int) ($item['likes_count'] ?? 0);
        $item['likes_count'] = $item['likes'];
    }

    json_success($result);
}

// GET /news/{id}
if ($method === 'GET' && ($m = match_route('/news/{id}', $path)) !== false) {
    $id   = (int) $m['id'];

    $stmt = $db->prepare(
        'SELECT id, title, text, url, image, date, likes_count, created_at
         FROM news_items WHERE id = ? AND is_deleted = 0 LIMIT 1'
    );
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) {
        json_error('News item not found', 404);
    }

    $item['likes'] = (int) ($item['likes_count'] ?? 0);
    $item['likes_count'] = $item['likes'];

    json_success($item);
}

// POST /news/{id}/like
if ($method === 'POST' && ($m = match_route('/news/{id}/like', $path)) !== false) {
    $id   = (int) $m['id'];
    $body = get_body();
    $name = optional_field($body, 'name', 'Anonymous');

    $stmt = $db->prepare('SELECT id, title, likes_count FROM news_items WHERE id = ? AND is_deleted = 0 LIMIT 1');
    $stmt->execute([$id]);
    $article = $stmt->fetch();

    if (!$article) {
        json_error('News item not found', 404);
    }

    $db->beginTransaction();
    try {
        $db->prepare('INSERT INTO news_likes (news_id, name) VALUES (?, ?)')->execute([$id, $name]);
        $likeId = (int) $db->lastInsertId();

        $db->prepare('UPDATE news_items SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?')->execute([$id]);
        $newCount = ((int) ($article['likes_count'] ?? 0)) + 1;

        $db->prepare(
            "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('news_like', NULL, ?, ?)"
        )->execute([$likeId, "'{$name}' liked news article '{$article['title']}'"]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        json_error('Failed to record like', 500);
    }

    json_success(['likes' => $newCount, 'likes_count' => $newCount, 'message' => "News article liked! Total likes: $newCount"]);
}

json_error("Not found: [$method] $path", 404);


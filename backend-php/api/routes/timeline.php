<?php
/**
 * routes/timeline.php — Public timeline endpoints.
 *
 * GET /timeline — paginated published events
 */

$db = get_db();

if ($method === 'GET' && $path === '/timeline') {
    $page  = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(max(1, (int) ($_GET['limit'] ?? 10)), 100);

    $result = paginate(
        $db,
        'SELECT COUNT(*) FROM timeline_events WHERE (is_published = 1 OR is_published IS NULL) AND (is_deleted = 0 OR is_deleted IS NULL)',
        'SELECT id, text, location, image, date, likes_count, add_to_gallery, created_at
         FROM timeline_events
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

// POST /timeline/{id}/like
if ($method === 'POST' && ($m = match_route('/timeline/{id}/like', $path)) !== false) {
    $id   = (int) $m['id'];
    $body = get_body();
    $name = optional_field($body, 'name', 'Anonymous');

    $stmt = $db->prepare('SELECT id, text, likes_count FROM timeline_events WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL) LIMIT 1');
    $stmt->execute([$id]);
    $event = $stmt->fetch();

    if (!$event) {
        json_error('Timeline event not found', 404);
    }

    $db->beginTransaction();
    try {
        $db->prepare('INSERT INTO timeline_likes (event_id, name) VALUES (?, ?)')->execute([$id, $name]);
        $likeId = (int) $db->lastInsertId();

        $db->prepare('UPDATE timeline_events SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?')->execute([$id]);
        $newCount = ((int) ($event['likes_count'] ?? 0)) + 1;

        $snippet = mb_substr($event['text'], 0, 50);
        $db->prepare(
            "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('timeline_like', NULL, ?, ?)"
        )->execute([$likeId, "'{$name}' liked timeline event '{$snippet}...'"]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        json_error('Failed to record like', 500);
    }

    json_success(['likes' => $newCount, 'likes_count' => $newCount, 'message' => "Timeline event liked! Total likes: $newCount"]);
}

json_error("Not found: [$method] $path", 404);


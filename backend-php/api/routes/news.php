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
        'SELECT COUNT(*) FROM news_items WHERE is_published = 1 AND is_deleted = 0',
        'SELECT id, title, text, url, image, date
         FROM news_items
         WHERE is_published = 1 AND is_deleted = 0
         ORDER BY date DESC
         LIMIT ? OFFSET ?',
        [],
        $page,
        $limit
    );

    json_success($result);
}

if ($method === 'GET' && ($m = match_route('/news/{id}', $path)) !== false) {
    $id   = (int) $m['id'];

    $stmt = $db->prepare(
        'SELECT id, title, text, url, image, date
         FROM news_items WHERE id = ? AND is_deleted = 0 LIMIT 1'
    );
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) {
        json_error('News item not found', 404);
    }

    json_success($item);
}

json_error("Not found: [$method] $path", 404);

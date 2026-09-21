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
        'SELECT COUNT(*) FROM timeline_events WHERE is_published = 1 AND is_deleted = 0',
        'SELECT id, text, location, image, date, add_to_gallery
         FROM timeline_events
         WHERE is_published = 1 AND is_deleted = 0
         ORDER BY date DESC
         LIMIT ? OFFSET ?',
        [],
        $page,
        $limit
    );

    json_success($result);
}

json_error("Not found: [$method] $path", 404);

<?php
/**
 * routes/gallery.php — Public gallery endpoints.
 *
 * GET /gallery       — list images (filter by tag)
 * GET /gallery/tags  — available tag list
 */

$db = get_db();

// GET /gallery/tags  — must come before /gallery catch
if ($method === 'GET' && $path === '/gallery/tags') {
    json_success([
        'tags' => [
            ['value' => 'all',           'label' => 'All'],
            ['value' => 'international', 'label' => 'International'],
            ['value' => 'intuc',         'label' => 'INTUC'],
            ['value' => 'union',         'label' => 'Unions'],
            ['value' => 'press',         'label' => 'Press Release'],
            ['value' => 'timeline',      'label' => 'Timeline'],
            ['value' => 'others',        'label' => 'Others'],
        ]
    ]);
}

// GET /gallery
if ($method === 'GET' && $path === '/gallery') {
    $tag   = $_GET['tag'] ?? null;
    $limit = min(max(1, (int) ($_GET['limit'] ?? 50)), 200);

    if ($tag && strtolower($tag) !== 'all') {
        $stmt = $db->prepare(
            'SELECT id, filename, original_name, tag, caption, uploaded_at, source_timeline_id
             FROM gallery_images
             WHERE is_published = 1 AND tag = ?
             ORDER BY uploaded_at DESC
             LIMIT ?'
        );
        $stmt->execute([strtolower($tag), $limit]);
    } else {
        $stmt = $db->prepare(
            'SELECT id, filename, original_name, tag, caption, uploaded_at, source_timeline_id
             FROM gallery_images
             WHERE is_published = 1
             ORDER BY uploaded_at DESC
             LIMIT ?'
        );
        $stmt->execute([$limit]);
    }

    json_success($stmt->fetchAll());
}

json_error("Not found: [$method] $path", 404);

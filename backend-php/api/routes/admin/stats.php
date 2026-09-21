<?php
/**
 * routes/admin/stats.php — GET /admin/stats
 */

$username = require_admin();
$db = get_db();

$counts = [];

$queries = [
    'total_blogs'          => 'SELECT COUNT(*) FROM blog_posts WHERE is_deleted = 0',
    'total_timeline'       => 'SELECT COUNT(*) FROM timeline_events WHERE is_deleted = 0',
    'total_news'           => 'SELECT COUNT(*) FROM news_items WHERE is_deleted = 0',
    'total_gallery'        => 'SELECT COUNT(*) FROM gallery_images',
    'unread_messages'      => 'SELECT COUNT(*) FROM contact_messages WHERE is_read = 0 AND is_deleted = 0',
    'pending_comments'     => 'SELECT COUNT(*) FROM blog_comments WHERE is_approved = 0',
    'total_subscribers'    => 'SELECT COUNT(*) FROM subscriptions',
    'unread_notifications' => 'SELECT COUNT(*) FROM notifications WHERE is_read = 0',
];

foreach ($queries as $key => $sql) {
    $stmt = $db->query($sql);
    $counts[$key] = (int) $stmt->fetchColumn();
}

json_success($counts);

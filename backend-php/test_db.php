<?php
require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/helpers/db.php';

$db = get_db();

try {
    $db->exec("CREATE TABLE IF NOT EXISTS timeline_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT DEFAULT 'Anonymous',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $db->exec("CREATE TABLE IF NOT EXISTS news_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        news_id INTEGER NOT NULL,
        name TEXT DEFAULT 'Anonymous',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    echo "Tables ensured successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

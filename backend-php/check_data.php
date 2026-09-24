<?php
require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/helpers/db.php';

$db = get_db();

$msgs = $db->query('SELECT * FROM contact_messages ORDER BY id DESC')->fetchAll();
$subs = $db->query('SELECT * FROM subscriptions ORDER BY id DESC')->fetchAll();
$visitors = $db->query('SELECT * FROM visitor_profiles ORDER BY id DESC')->fetchAll();

echo "=== CONTACT MESSAGES (" . count($msgs) . ") ===\n";
print_r($msgs);

echo "=== SUBSCRIPTIONS (" . count($subs) . ") ===\n";
print_r($subs);

echo "=== VISITOR PROFILES (" . count($visitors) . ") ===\n";
print_r($visitors);

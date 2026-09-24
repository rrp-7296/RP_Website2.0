<?php
try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/database.sqlite');
    $stmt = $pdo->query("PRAGMA table_info(blog_comments)");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}

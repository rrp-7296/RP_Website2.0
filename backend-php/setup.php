<?php
declare(strict_types=1);
/**
 * setup.php — One-time database schema installer + admin seeder.
 *
 * USAGE:
 *   1. Upload this file to your server's web root or accessible path.
 *   2. Visit: https://yourdomain.com/api/setup.php
 *   3. After success, IMMEDIATELY delete this file from the server.
 *
 * ⚠ SECURITY WARNING: Delete this file after first run!
 *   Anyone who visits this URL can reset your database!
 */

// Simple security token — change this before uploading if you want extra protection
define('SETUP_TOKEN', 'setup_ok_please_delete_me_after_use');
require_once __DIR__ . '/api/config.php';

// Allow access only with the token OR directly (for private servers)
// Uncomment the lines below if you want token protection:
// if (($_GET['token'] ?? '') !== SETUP_TOKEN) {
//     http_response_code(403); die('Access denied. Add ?token=setup_ok_please_delete_me_after_use to the URL.');
// }

header('Content-Type: text/html; charset=utf-8');

$dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    die('<h2>❌ Database connection failed</h2><p>' . htmlspecialchars($e->getMessage()) . '</p>
         <p>Check your <code>api/config.php</code> credentials.</p>');
}

$results = [];

function run_sql(PDO $pdo, string $description, string $sql): void {
    global $results;
    try {
        $pdo->exec($sql);
        $results[] = "✅ $description";
    } catch (PDOException $e) {
        $results[] = "⚠️  $description — " . $e->getMessage();
    }
}

// ─── Create Tables ────────────────────────────────────────────────────────

run_sql($pdo, 'Create admin_users table', "
CREATE TABLE IF NOT EXISTS admin_users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(200) DEFAULT 'Admin',
    email        VARCHAR(255) NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create blog_posts table', "
CREATE TABLE IF NOT EXISTS blog_posts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(500) NOT NULL,
    description  TEXT NULL,
    main_body    TEXT NOT NULL,
    image        VARCHAR(500) NULL,
    date         DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes_count  INT DEFAULT 0,
    view_count   INT DEFAULT 0,
    is_published TINYINT(1) DEFAULT 1,
    is_deleted   TINYINT(1) DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create blog_comments table', "
CREATE TABLE IF NOT EXISTS blog_comments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    post_id     INT NOT NULL,
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(255) NULL,
    comment     TEXT NOT NULL,
    is_approved TINYINT(1) DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create blog_likes table', "
CREATE TABLE IF NOT EXISTS blog_likes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    post_id    INT NOT NULL,
    name       VARCHAR(200) DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create timeline_events table', "
CREATE TABLE IF NOT EXISTS timeline_events (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    text            TEXT NOT NULL,
    location        VARCHAR(500) DEFAULT '',
    image           VARCHAR(500) NULL,
    date            DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes_count     INT DEFAULT 0,
    add_to_gallery  TINYINT(1) DEFAULT 1,
    is_published    TINYINT(1) DEFAULT 1,
    is_deleted      TINYINT(1) DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create timeline_likes table', "
CREATE TABLE IF NOT EXISTS timeline_likes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    event_id   INT NOT NULL,
    name       VARCHAR(200) DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_id (event_id),
    FOREIGN KEY (event_id) REFERENCES timeline_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create news_items table', "
CREATE TABLE IF NOT EXISTS news_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(500) NOT NULL,
    text         TEXT NOT NULL,
    url          VARCHAR(1000) DEFAULT '',
    image        VARCHAR(500) NULL,
    date         DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes_count  INT DEFAULT 0,
    is_published TINYINT(1) DEFAULT 1,
    is_deleted   TINYINT(1) DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create news_likes table', "
CREATE TABLE IF NOT EXISTS news_likes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    news_id    INT NOT NULL,
    name       VARCHAR(200) DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),
    FOREIGN KEY (news_id) REFERENCES news_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");


run_sql($pdo, 'Create gallery_images table', "
CREATE TABLE IF NOT EXISTS gallery_images (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    filename           VARCHAR(500) NOT NULL,
    original_name      VARCHAR(500) NULL,
    tag                ENUM('international','intuc','union','press','timeline','others') DEFAULT 'others',
    caption            VARCHAR(1000) NULL,
    source_timeline_id INT NULL,
    is_published       TINYINT(1) DEFAULT 1,
    uploaded_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create contact_messages table', "
CREATE TABLE IF NOT EXISTS contact_messages (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    subject       VARCHAR(500) DEFAULT '',
    message       TEXT NOT NULL,
    is_read       TINYINT(1) DEFAULT 0,
    is_replied    TINYINT(1) DEFAULT 0,
    reply_message TEXT NULL,
    replied_at    DATETIME NULL,
    is_deleted    TINYINT(1) DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create subscriptions table', "
CREATE TABLE IF NOT EXISTS subscriptions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(200) NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create visitor_profiles table', "
CREATE TABLE IF NOT EXISTS visitor_profiles (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NULL,
    phone         VARCHAR(100) NULL,
    is_subscribed TINYINT(1) DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create notifications table', "
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    type       VARCHAR(50) NOT NULL,
    post_id    INT NULL,
    item_id    INT NULL,
    message    TEXT NOT NULL,
    is_read    TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// ─── Seed Admin User ──────────────────────────────────────────────────────

$stmt = $pdo->query('SELECT COUNT(*) FROM admin_users');
if ((int) $stmt->fetchColumn() === 0) {
    $passwordHash = password_hash('admin123', PASSWORD_BCRYPT);
    $pdo->prepare(
        "INSERT INTO admin_users (username, password_hash, display_name, email) VALUES (?, ?, ?, ?)"
    )->execute(['admin', $passwordHash, 'Rakeshwar Pandey', 'rakeshwarpandey@gmail.com']);
    $results[] = "✅ Admin user created: username='admin', password='admin123' — ⚠️ <strong>CHANGE THIS PASSWORD IMMEDIATELY!</strong>";
} else {
    $results[] = "ℹ️  Admin user already exists, skipping seed.";
}

// ─── Seed Sample Blog Posts ───────────────────────────────────────────────

$stmt = $pdo->query('SELECT COUNT(*) FROM blog_posts');
if ((int) $stmt->fetchColumn() === 0) {
    $blogs = [
        [
            'The Role of Trade Unions in the Post-Pandemic Era',
            'Analyzing the shifting paradigms of worker rights and collective bargaining in the wake of global industrial disruption.',
            "Analyzing the shifting paradigms of worker rights, safety standards, and collective bargaining agreements in the wake of global industrial disruption.\n\nWorkers and industries are not rivals, but are to help each other. They need to coordinate and coexist for the growth and betterment of society.",
            null, 48, 142,
        ],
        [
            'Empowering Rural Jharkhand Through Education',
            'Local initiatives, charity schools, and vocational training aimed at bridging the digital divide for rural youths.',
            "An overview of local initiatives, charity schools, and vocational training centers aimed at providing quality learning tools for rural youths in Jamshedpur.\n\nEducation is the most powerful weapon which you can use to change the world.",
            null, 36, 95,
        ],
        [
            'Industrial Growth and Labor Coexistence',
            'Labor and industry are not rivals, but two wheels of the same chariot.',
            "Labor and industry are not rivals, but two wheels of the same chariot. Exploration of how collaborative union-management policies drive long-term productivity.\n\nFor industrial growth to be sustainable, it must be inclusive.",
            null, 54, 120,
        ],
    ];

    $stmt = $pdo->prepare(
        'INSERT INTO blog_posts (title, description, main_body, image, likes_count, view_count, is_published) VALUES (?, ?, ?, ?, ?, ?, 1)'
    );
    foreach ($blogs as $b) {
        $stmt->execute($b);
    }
    $results[] = "✅ Sample blog posts seeded.";
} else {
    $results[] = "ℹ️  Blog posts already exist, skipping seed.";
}

// ─── Output ───────────────────────────────────────────────────────────────
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Setup — <?= htmlspecialchars(APP_NAME) ?></title>
<style>
  body { font-family: monospace; max-width: 700px; margin: 40px auto; background: #0f172a; color: #e2e8f0; padding: 20px; }
  h1 { color: #38bdf8; }
  .result { padding: 8px; margin: 4px 0; border-radius: 4px; background: #1e293b; }
  .warn { background: #7f1d1d; color: #fca5a5; padding: 16px; margin-top: 20px; border-radius: 8px; font-weight: bold; }
</style>
</head>
<body>
<h1>🚀 <?= htmlspecialchars(APP_NAME) ?> — Setup</h1>
<p>Database: <strong><?= htmlspecialchars(DB_NAME) ?></strong> on <strong><?= htmlspecialchars(DB_HOST) ?></strong></p>
<hr>
<?php foreach ($results as $r): ?>
  <div class="result"><?= $r ?></div>
<?php endforeach; ?>
<hr>
<div class="warn">
  ⚠️ SECURITY: DELETE THIS FILE (<code>setup.php</code>) FROM YOUR SERVER NOW!<br>
  Anyone who visits this URL can re-run the setup.
</div>
<p style="color:#94a3b8;">Default credentials: <code>admin</code> / <code>admin123</code></p>
</body>
</html>

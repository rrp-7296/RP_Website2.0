<?php
declare(strict_types=1);
/**
 * setup.php — One-time database schema installer + admin seeder.
 */

// Enable error display for setup diagnostics
ini_set('display_errors', '1');
error_reporting(E_ALL);

// Smart include of config.php whether placed in public_html/ or public_html/api/
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
} elseif (file_exists(__DIR__ . '/api/config.php')) {
    require_once __DIR__ . '/api/config.php';
} elseif (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
} else {
    die('<h2>❌ Setup Error: Could not locate config.php</h2><p>Please make sure <code>config.php</code> is present in your <code>api/</code> folder.</p>');
}

header('Content-Type: text/html; charset=utf-8');

if (defined('DB_DRIVER') && DB_DRIVER === 'sqlite') {
    $dbPath = DB_SQLITE_PATH;
    $dsn = 'sqlite:' . $dbPath;
    try {
        $pdo = new PDO($dsn, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } catch (PDOException $e) {
        die('<h2>❌ SQLite connection failed</h2><p>' . htmlspecialchars($e->getMessage()) . '</p>');
    }
} else {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    } catch (PDOException $e) {
        die('<h2>❌ MySQL Database connection failed</h2>' .
            '<p style="color:#ef4444; font-weight:bold;">Error: ' . htmlspecialchars($e->getMessage()) . '</p>' .
            '<p><strong>Troubleshooting Checklist:</strong></p>' .
            '<ul>' .
            '<li>Check your database credentials in <code>api/config.php</code>.</li>' .
            '<li>Ensure DB_NAME is: <code>' . htmlspecialchars(DB_NAME) . '</code></li>' .
            '<li>Ensure DB_USER is: <code>' . htmlspecialchars(DB_USER) . '</code></li>' .
            '<li>Ensure you added the user to the database in cPanel and granted <strong>ALL PRIVILEGES</strong>.</li>' .
            '</ul>');
    }
}

$results = [];

function run_sql(PDO $pdo, string $description, string $sql): void {
    global $results;
    try {
        $pdo->exec($sql);
        $results[] = "✅ $description";
    } catch (PDOException $e) {
        $results[] = "⚠️  $description — " . htmlspecialchars($e->getMessage());
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
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

run_sql($pdo, 'Create blog_likes table', "
CREATE TABLE IF NOT EXISTS blog_likes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    post_id    INT NOT NULL,
    name       VARCHAR(200) DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id)
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
    INDEX idx_event_id (event_id)
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
    INDEX idx_news_id (news_id)
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
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(200) NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone        VARCHAR(100) NULL,
    status       VARCHAR(50) DEFAULT 'active',
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    $passwordHash = password_hash('adminpassword', PASSWORD_BCRYPT);
    $pdo->prepare(
        "INSERT INTO admin_users (username, password_hash, display_name, email) VALUES (?, ?, ?, ?)"
    )->execute(['admin', $passwordHash, 'Rakeshwar Pandey', 'rakeshwarpandey@gmail.com']);
    $results[] = "✅ Admin user created: username='admin', password='adminpassword' — ⚠️ <strong>CHANGE THIS PASSWORD AFTER LOGGING IN!</strong>";
} else {
    $results[] = "ℹ️  Admin user already exists, skipping seed.";
}

// ─── Output ───────────────────────────────────────────────────────────────
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Setup — <?= htmlspecialchars(defined('APP_NAME') ? APP_NAME : 'Portfolio') ?></title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 700px; margin: 40px auto; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px; }
  h1 { color: #FF9933; margin-top: 0; }
  .result { padding: 10px 14px; margin: 6px 0; border-radius: 6px; background: #1e293b; font-size: 14px; }
  .warn { background: #7f1d1d; color: #fca5a5; padding: 16px; margin-top: 24px; border-radius: 8px; font-weight: bold; line-height: 1.5; }
</style>
</head>
<body>
<h1>🚀 Setup — <?= htmlspecialchars(defined('APP_NAME') ? APP_NAME : 'Portfolio') ?></h1>
<p>Database: <strong><?= htmlspecialchars(DB_NAME) ?></strong> (Host: <strong><?= htmlspecialchars(DB_HOST) ?></strong>)</p>
<hr style="border-color: #334155; margin: 16px 0;">
<?php foreach ($results as $r): ?>
  <div class="result"><?= $r ?></div>
<?php endforeach; ?>
<hr style="border-color: #334155; margin: 16px 0;">
<div class="warn">
  ⚠️ SECURITY WARNING: DELETE THIS FILE (<code>setup.php</code>) FROM YOUR SERVER NOW!<br>
  Anyone who visits this URL can re-run the table creation setup.
</div>
<p style="color:#94a3b8; font-size: 14px;">Default admin credentials: <code>admin</code> / <code>adminpassword</code></p>
</body>
</html>

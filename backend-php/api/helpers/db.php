<?php
/**
 * helpers/db.php — PDO database connection singleton.
 */

function get_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $driver = defined('DB_DRIVER') ? DB_DRIVER : 'mysql';

            if ($driver === 'sqlite') {
                $sqlitePath = defined('DB_SQLITE_PATH') ? DB_SQLITE_PATH : __DIR__ . '/../database.sqlite';
                $dir = dirname($sqlitePath);
                if (!is_dir($dir)) {
                    @mkdir($dir, 0755, true);
                }
                $pdo = new PDO('sqlite:' . $sqlitePath, null, null, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                $pdo->exec('PRAGMA foreign_keys = ON;');
            } else {
                $port = defined('DB_PORT') ? (int)DB_PORT : 3306;
                $dsn = sprintf(
                    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                    DB_HOST, $port, DB_NAME, DB_CHARSET
                );
                $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            }

            // Ensure database tables & images columns exist automatically
            ensure_tables_exist($pdo);
        } catch (Exception $e) {
            $errMsg = defined('DEBUG') && DEBUG ? ('Database connection failed: ' . $e->getMessage()) : 'Database connection failed.';
            json_error($errMsg, 500);
            exit;
        }
    }
    return $pdo;
}

/**
 * Auto-create database tables and seed default admin user if missing.
 */
function ensure_tables_exist(PDO $pdo): void {
    static $initialized = false;
    if ($initialized) return;
    $initialized = true;

    $isSQLite = (defined('DB_DRIVER') && DB_DRIVER === 'sqlite');
    $pkAuto   = $isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
    $engine   = $isSQLite ? '' : 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    try {
        // 1. admin_users
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admin_users (
                id            {$pkAuto},
                username      VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                display_name  VARCHAR(200) DEFAULT 'Admin',
                email         VARCHAR(255) NULL,
                created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // Seed default admin user if table empty
        $stmt = $pdo->query('SELECT COUNT(*) FROM admin_users');
        if ($stmt && (int) $stmt->fetchColumn() === 0) {
            $hash = password_hash('adminpassword', PASSWORD_BCRYPT);
            $pdo->prepare(
                'INSERT INTO admin_users (username, password_hash, display_name, email) VALUES (?, ?, ?, ?)'
            )->execute(['admin', $hash, 'Rakeshwar Pandey', 'rakeshwarpandey@gmail.com']);
        }

        // 2. blog_posts
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS blog_posts (
                id           {$pkAuto},
                title        VARCHAR(500) NOT NULL,
                description  TEXT NULL,
                main_body    TEXT NOT NULL,
                image        VARCHAR(500) NULL,
                images       TEXT NULL,
                date         DATETIME DEFAULT CURRENT_TIMESTAMP,
                likes_count  INT DEFAULT 0,
                view_count   INT DEFAULT 0,
                is_published TINYINT(1) DEFAULT 1,
                is_deleted   TINYINT(1) DEFAULT 0,
                created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // 3. timeline_events
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS timeline_events (
                id              {$pkAuto},
                text            TEXT NOT NULL,
                location        VARCHAR(500) DEFAULT '',
                image           VARCHAR(500) NULL,
                images          TEXT NULL,
                date            DATETIME DEFAULT CURRENT_TIMESTAMP,
                likes_count     INT DEFAULT 0,
                add_to_gallery  TINYINT(1) DEFAULT 1,
                is_published    TINYINT(1) DEFAULT 1,
                is_deleted      TINYINT(1) DEFAULT 0,
                created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // 4. news_items
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS news_items (
                id           {$pkAuto},
                title        VARCHAR(500) NOT NULL,
                text         TEXT NOT NULL,
                url          VARCHAR(1000) DEFAULT '',
                image        VARCHAR(500) NULL,
                images       TEXT NULL,
                date         DATETIME DEFAULT CURRENT_TIMESTAMP,
                likes_count  INT DEFAULT 0,
                is_published TINYINT(1) DEFAULT 1,
                is_deleted   TINYINT(1) DEFAULT 0,
                created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // 5. gallery_images
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS gallery_images (
                id                 {$pkAuto},
                filename           VARCHAR(500) NOT NULL,
                original_name      VARCHAR(500) NULL,
                tag                VARCHAR(100) DEFAULT 'others',
                caption            VARCHAR(1000) NULL,
                source_timeline_id INT NULL,
                images             TEXT NULL,
                is_published       TINYINT(1) DEFAULT 1,
                uploaded_at        DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // 6. newsletter_subscribers
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id            {$pkAuto},
                name          VARCHAR(200) NULL,
                email         VARCHAR(255) NOT NULL UNIQUE,
                phone         VARCHAR(100) NULL,
                status        VARCHAR(50) DEFAULT 'active',
                subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // 7. visitor_profiles
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS visitor_profiles (
                id            {$pkAuto},
                name          VARCHAR(200) NOT NULL,
                email         VARCHAR(255) NULL,
                phone         VARCHAR(100) NULL,
                is_subscribed TINYINT(1) DEFAULT 1,
                created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");

        // 8. admin_fcm_tokens (use VARCHAR(255) because MySQL does not support UNIQUE on TEXT without key length)
        ensure_fcm_tokens_table($pdo);

        // 9. analytics tables (sessions & daily summaries)
        ensure_analytics_tables($pdo);
    } catch (Exception $e) {
        // Log or silently continue if tables already created
    }

    ensure_images_columns($pdo);
}

/**
 * Ensure analytics tables exist for tracking unique visitors and session flows.
 */
function ensure_analytics_tables(PDO $pdo): void {
    $isSQLite = (defined('DB_DRIVER') && DB_DRIVER === 'sqlite');
    $engine   = $isSQLite ? '' : 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
    try {
        $indexClause = $isSQLite ? '' : ', INDEX idx_visitor (visitor_id), INDEX idx_started (started_at), INDEX idx_last_seen (last_seen_at)';
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS analytics_sessions (
                session_id       VARCHAR(64) PRIMARY KEY,
                visitor_id       VARCHAR(64) NOT NULL,
                visitor_name     VARCHAR(100) NULL,
                started_at       DATETIME NOT NULL,
                last_seen_at     DATETIME NOT NULL,
                duration_seconds INT DEFAULT 0,
                pageviews_count  INT DEFAULT 1,
                entry_page       VARCHAR(150) NOT NULL,
                pages_visited    TEXT NOT NULL,
                device_type      VARCHAR(20) DEFAULT 'desktop',
                browser          VARCHAR(50) DEFAULT '',
                os               VARCHAR(50) DEFAULT '',
                referrer         VARCHAR(255) DEFAULT '',
                ip_hash          VARCHAR(64) NULL
                {$indexClause}
            ) {$engine};
        ");

        if ($isSQLite) {
            $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_sessions(visitor_id);");
            $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_started ON analytics_sessions(started_at);");
            $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_last_seen ON analytics_sessions(last_seen_at);");
        }

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS analytics_daily_summary (
                date                 DATE PRIMARY KEY,
                unique_visitors      INT DEFAULT 0,
                total_sessions       INT DEFAULT 0,
                total_pageviews      INT DEFAULT 0,
                avg_duration_seconds INT DEFAULT 0,
                top_pages_json       TEXT NULL,
                devices_json         TEXT NULL
            ) {$engine};
        ");
    } catch (Exception $e) {
        // Log or continue
    }
}

/**
 * Ensure admin_fcm_tokens table exists with valid MySQL / SQLite schema.
 */
function ensure_fcm_tokens_table(PDO $pdo): void {
    $isSQLite = (defined('DB_DRIVER') && DB_DRIVER === 'sqlite');
    $pkAuto   = $isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
    $engine   = $isSQLite ? '' : 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admin_fcm_tokens (
                id            {$pkAuto},
                username      VARCHAR(100) NOT NULL,
                fcm_token     VARCHAR(255) NOT NULL UNIQUE,
                updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
            ) {$engine};
        ");
    } catch (Exception $e) {
        // Log or continue
    }
}

/**
 * Auto-migrate database tables to add `images TEXT NULL` column if missing.
 */
function ensure_images_columns(PDO $pdo): void {
    static $migrated = false;
    if ($migrated) return;
    $migrated = true;

    $tables = ['blog_posts', 'news_items', 'timeline_events', 'gallery_images'];
    foreach ($tables as $t) {
        try {
            $pdo->exec("ALTER TABLE {$t} ADD COLUMN images TEXT NULL");
        } catch (Exception $e) {
            // Column already exists or table doesn't exist yet
        }
    }
}



/**
 * Paginate a query and return items + metadata.
 *
 * @param PDO    $db
 * @param string $countSql   COUNT(*) query
 * @param string $itemsSql   Items query with LIMIT and OFFSET placeholders
 * @param array  $params     Bound parameters shared by both queries
 * @param int    $page
 * @param int    $limit
 */
function paginate(PDO $db, string $countSql, string $itemsSql, array $params, int $page, int $limit): array {
    $stmt = $db->prepare($countSql);
    $stmt->execute($params);
    $total = (int) $stmt->fetchColumn();

    $offset = ($page - 1) * $limit;
    $stmt2 = $db->prepare($itemsSql);
    $stmt2->execute(array_merge($params, [$limit, $offset]));
    $items = $stmt2->fetchAll();

    return [
        'items'       => $items,
        'total'       => $total,
        'page'        => $page,
        'limit'       => $limit,
        'total_pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
    ];
}

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
        } catch (Exception $e) {
            if (DEBUG) {
                json_error('Database connection failed: ' . $e->getMessage(), 500);
            } else {
                json_error('Database connection failed.', 500);
            }
            exit;
        }
    }
    return $pdo;
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

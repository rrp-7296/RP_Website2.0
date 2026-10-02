<?php
/**
 * routes/analytics.php — Ingestion beacon and admin analytics metrics.
 *
 * Endpoints:
 *  - POST /analytics/beacon   (Public beacon, zero-overhead single row upsert)
 *  - GET  /admin/analytics    (Admin protected, aggregated analytics & recent journeys)
 */

declare(strict_types=1);

$db = get_db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Determine subpath: either /analytics/beacon or /admin/analytics
$uri = $_SERVER['REQUEST_URI'] ?? '';
$pathOnly = strtok($uri, '?');

// ─────────────────────────────────────────────────────────────────────────────
// 1. BEACON INGESTION (Public)
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    // Read raw body (supports application/json and text/plain sendBeacon)
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        // Fallback to $_POST
        $payload = $_POST;
    }

    $sessionId = trim($payload['session_id'] ?? '');
    $visitorId = trim($payload['visitor_id'] ?? '');

    if (!$sessionId || !$visitorId) {
        json_error('session_id and visitor_id are required', 400);
        exit;
    }

    // Sanitize fields
    $sessionId       = substr($sessionId, 0, 64);
    $visitorId       = substr($visitorId, 0, 64);
    $visitorName     = !empty($payload['visitor_name']) ? substr(trim($payload['visitor_name']), 0, 100) : null;
    $entryPage       = substr(trim($payload['entry_page'] ?? '/'), 0, 150) ?: '/';
    $durationSeconds = max(0, (int)($payload['duration_seconds'] ?? 0));
    $pageviewsCount  = max(1, (int)($payload['pageviews_count'] ?? 1));
    $deviceType      = in_array($payload['device_type'] ?? '', ['mobile', 'tablet', 'desktop'], true) ? $payload['device_type'] : 'desktop';
    $browser         = substr(trim($payload['browser'] ?? ''), 0, 50);
    $os              = substr(trim($payload['os'] ?? ''), 0, 50);
    $referrer        = substr(trim($payload['referrer'] ?? ''), 0, 255);

    // Encode pages visited JSON
    $pagesVisited = '[]';
    if (!empty($payload['pages_visited'])) {
        if (is_array($payload['pages_visited'])) {
            $pagesVisited = json_encode(array_slice($payload['pages_visited'], 0, 50), JSON_UNESCAPED_SLASHES);
        } elseif (is_string($payload['pages_visited'])) {
            $pagesVisited = $payload['pages_visited'];
        }
    }

    // Privacy-conscious IP hash
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '';
    $ipHash = $clientIp ? substr(hash('sha256', $clientIp . date('Y-m')), 0, 32) : null;

    $now = date('Y-m-d H:i:s');
    $isSQLite = (defined('DB_DRIVER') && DB_DRIVER === 'sqlite');

    try {
        if ($isSQLite) {
            $sql = "
                INSERT INTO analytics_sessions
                (session_id, visitor_id, visitor_name, started_at, last_seen_at, duration_seconds, pageviews_count, entry_page, pages_visited, device_type, browser, os, referrer, ip_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                  last_seen_at = excluded.last_seen_at,
                  duration_seconds = MAX(duration_seconds, excluded.duration_seconds),
                  pageviews_count = MAX(pageviews_count, excluded.pageviews_count),
                  pages_visited = excluded.pages_visited,
                  visitor_name = COALESCE(excluded.visitor_name, analytics_sessions.visitor_name)
            ";
        } else {
            $sql = "
                INSERT INTO analytics_sessions
                (session_id, visitor_id, visitor_name, started_at, last_seen_at, duration_seconds, pageviews_count, entry_page, pages_visited, device_type, browser, os, referrer, ip_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  last_seen_at = VALUES(last_seen_at),
                  duration_seconds = GREATEST(duration_seconds, VALUES(duration_seconds)),
                  pageviews_count = GREATEST(pageviews_count, VALUES(pageviews_count)),
                  pages_visited = VALUES(pages_visited),
                  visitor_name = COALESCE(VALUES(visitor_name), visitor_name)
            ";
        }

        $stmt = $db->prepare($sql);
        $stmt->execute([
            $sessionId,
            $visitorId,
            $visitorName,
            $now, // started_at (only used if new row)
            $now, // last_seen_at
            $durationSeconds,
            $pageviewsCount,
            $entryPage,
            $pagesVisited,
            $deviceType,
            $browser,
            $os,
            $referrer,
            $ipHash
        ]);

        json_success(['status' => 'recorded', 'session_id' => $sessionId]);
    } catch (Exception $e) {
        if (defined('DEBUG') && DEBUG) {
            json_error('Beacon error: ' . $e->getMessage(), 500);
        } else {
            json_success(['status' => 'ignored']);
        }
    }
    exit;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ADMIN ANALYTICS METRICS (Protected)
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $username = require_admin();

    $range = $_GET['range'] ?? '7d';
    switch ($range) {
        case 'today':
            $since = date('Y-m-d 00:00:00');
            break;
        case '30d':
            $since = date('Y-m-d H:i:s', strtotime('-30 days'));
            break;
        case 'all':
            $since = '2000-01-01 00:00:00';
            break;
        case '7d':
        default:
            $since = date('Y-m-d H:i:s', strtotime('-7 days'));
            $range = '7d';
            break;
    }

    try {
        // 1. KPI Counts
        $stmt = $db->prepare("
            SELECT
                COUNT(DISTINCT visitor_id) AS unique_visitors,
                COUNT(*) AS total_sessions,
                COALESCE(SUM(pageviews_count), 0) AS total_pageviews,
                COALESCE(ROUND(AVG(duration_seconds)), 0) AS avg_duration_seconds
            FROM analytics_sessions
            WHERE started_at >= ?
        ");
        $stmt->execute([$since]);
        $kpi = $stmt->fetch() ?: [
            'unique_visitors' => 0,
            'total_sessions' => 0,
            'total_pageviews' => 0,
            'avg_duration_seconds' => 0,
        ];

        // Unique today count for quick badge/menu
        $todayStart = date('Y-m-d 00:00:00');
        $stmtToday = $db->prepare("SELECT COUNT(DISTINCT visitor_id) FROM analytics_sessions WHERE started_at >= ?");
        $stmtToday->execute([$todayStart]);
        $uniqueToday = (int) $stmtToday->fetchColumn();

        // 2. Device Breakdown
        $stmtDev = $db->prepare("
            SELECT device_type, COUNT(*) as count
            FROM analytics_sessions
            WHERE started_at >= ?
            GROUP BY device_type
        ");
        $stmtDev->execute([$since]);
        $deviceRows = $stmtDev->fetchAll();
        $deviceBreakdown = [];
        foreach ($deviceRows as $row) {
            $deviceBreakdown[$row['device_type'] ?: 'desktop'] = (int) $row['count'];
        }

        // 3. Top Pages and Usage Patterns
        // We aggregate from pages_visited JSON stored across the sessions in range
        $stmtPages = $db->prepare("
            SELECT pages_visited, entry_page
            FROM analytics_sessions
            WHERE started_at >= ?
            LIMIT 500
        ");
        $stmtPages->execute([$since]);
        $sessions = $stmtPages->fetchAll();

        $pageCounts = [];
        $entryCounts = [];

        foreach ($sessions as $s) {
            $entry = $s['entry_page'] ?: '/';
            $entryCounts[$entry] = ($entryCounts[$entry] ?? 0) + 1;

            $pages = json_decode($s['pages_visited'] ?? '[]', true);
            if (is_array($pages)) {
                $visitedInSession = [];
                foreach ($pages as $p) {
                    $path = is_array($p) ? ($p['path'] ?? '') : (string)$p;
                    if ($path && !isset($visitedInSession[$path])) {
                        $visitedInSession[$path] = true;
                        $pageCounts[$path] = ($pageCounts[$path] ?? 0) + 1;
                    }
                }
            } else {
                $pageCounts[$entry] = ($pageCounts[$entry] ?? 0) + 1;
            }
        }

        arsort($pageCounts);
        arsort($entryCounts);

        $topPages = [];
        $rank = 0;
        foreach ($pageCounts as $path => $count) {
            $topPages[] = ['path' => $path, 'views' => $count];
            if (++$rank >= 10) break;
        }

        $topEntryPages = [];
        $rank = 0;
        foreach ($entryCounts as $path => $count) {
            $topEntryPages[] = ['path' => $path, 'count' => $count];
            if (++$rank >= 8) break;
        }

        // 4. Recent Visitor Journeys
        $stmtRecent = $db->prepare("
            SELECT
                session_id,
                visitor_id,
                visitor_name,
                started_at,
                last_seen_at,
                duration_seconds,
                pageviews_count,
                entry_page,
                pages_visited,
                device_type,
                browser,
                os,
                referrer
            FROM analytics_sessions
            ORDER BY last_seen_at DESC
            LIMIT 30
        ");
        $stmtRecent->execute();
        $recentSessions = $stmtRecent->fetchAll();

        foreach ($recentSessions as &$sess) {
            $decoded = json_decode($sess['pages_visited'] ?? '[]', true);
            $sess['pages_list'] = is_array($decoded) ? $decoded : [$sess['entry_page']];
        }
        unset($sess);

        json_success([
            'range' => $range,
            'kpis' => [
                'unique_visitors'      => (int) $kpi['unique_visitors'],
                'unique_today'         => $uniqueToday,
                'total_sessions'       => (int) $kpi['total_sessions'],
                'total_pageviews'      => (int) $kpi['total_pageviews'],
                'avg_duration_seconds' => (int) $kpi['avg_duration_seconds'],
            ],
            'device_breakdown' => $deviceBreakdown,
            'top_pages'        => $topPages,
            'top_entry_pages'  => $topEntryPages,
            'recent_sessions'  => $recentSessions,
        ]);
    } catch (Exception $e) {
        json_error('Failed to load analytics: ' . $e->getMessage(), 500);
    }
    exit;
}

json_error('Method not allowed', 405);

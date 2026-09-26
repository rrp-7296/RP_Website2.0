<?php
/**
 * index.php — Main router/dispatcher for the PHP backend.
 * All /api/* requests are rewritten here by .htaccess.
 */

declare(strict_types=1);

// ─── Bootstrap & Smart Path Detection ──────────────────────────────────────
$baseDir = __DIR__;

// Locate config.php
if (file_exists($baseDir . '/config.php')) {
    require_once $baseDir . '/config.php';
} elseif (file_exists($baseDir . '/../config.php')) {
    require_once $baseDir . '/../config.php';
} else {
    http_response_code(500);
    die('<h2>❌ Configuration Error</h2><p>Could not locate <code>config.php</code>. Please make sure <code>config.php</code> is placed inside your <code>public_html/api/</code> folder.</p>');
}

// Locate helpers directory
$helpersDir = file_exists($baseDir . '/helpers') ? ($baseDir . '/helpers') : (file_exists($baseDir . '/../helpers') ? ($baseDir . '/../helpers') : null);

if (!$helpersDir) {
    http_response_code(500);
    die('<h2>❌ Folder Structure Error: Missing <code>helpers</code> folder</h2>' .
        '<p>The <code>helpers</code> folder was not found inside <code>public_html/api/</code>.</p>' .
        '<p><strong>Correct Folder Structure on cPanel:</strong></p>' .
        '<pre>public_html/\n  └── api/\n        ├── index.php\n        ├── config.php\n        ├── helpers/   <-- (auth.php, db.php, mail.php, response.php, upload.php)\n        └── routes/    <-- (auth.php, blogs.php, news.php, admin/...)</pre>');
}

require_once $helpersDir . '/response.php';
require_once $helpersDir . '/db.php';
require_once $helpersDir . '/auth.php';
require_once $helpersDir . '/upload.php';
require_once $helpersDir . '/mail.php';

// ─── CORS ─────────────────────────────────────────────────────────────────
set_cors_headers();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Parse URI ────────────────────────────────────────────────────────────
$requestUri  = $_SERVER['REQUEST_URI'] ?? '/';
$rawPath     = strtok($requestUri, '?');

// If running in a subdirectory under index.php, strip script directory
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
if (str_contains($scriptName, 'index.php')) {
    $scriptDir = str_replace('\\', '/', dirname($scriptName));
    if ($scriptDir !== '/' && str_starts_with($rawPath, $scriptDir)) {
        $rawPath = substr($rawPath, strlen($scriptDir));
    }
}

// Strip optional prefixes (/index.php or /api)
$path = preg_replace('#^/index\.php#', '', $rawPath);
if (str_starts_with($path, '/api/')) {
    $path = substr($path, 4);
} elseif ($path === '/api') {
    $path = '/';
}
$path = rtrim($path, '/') ?: '/';
$method = strtoupper($_SERVER['REQUEST_METHOD']);


// ─── Route Matching Helper ────────────────────────────────────────────────
$routeParams = [];

/**
 * Match a URL pattern against a path and return named params, or false if no match.
 * @return array<string,string>|false
 */
function match_route(string $pattern, string $path) {
    $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
    $regex = preg_replace('/:(\w+)/', '(?P<$1>[^/]+)', $regex);
    $regex = '#^' . $regex . '$#';

    if (preg_match($regex, $path, $matches)) {
        return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
    }
    return false;
}

// Locate routes directory
$routesDir = file_exists($baseDir . '/routes') ? ($baseDir . '/routes') : (file_exists($baseDir . '/../routes') ? ($baseDir . '/../routes') : null);

if (!$routesDir) {
    json_error('Server Error: Missing routes directory. Please ensure public_html/api/routes/ exists.', 500);
}

// ─── Routing Table ────────────────────────────────────────────────────────

// Health check
if ($method === 'GET' && $path === '/health') {
    json_success(['status' => 'healthy', 'version' => APP_VERSION]);
}

// ── Serve Uploaded Files ──────────────────────────────────────────────────
if (str_starts_with($path, '/uploads/')) {
    $fileRelative = substr($path, strlen('/uploads/'));
    $filePath = UPLOAD_DIR . '/' . $fileRelative;

    if (file_exists($filePath) && is_file($filePath)) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $filePath) ?: 'application/octet-stream';
        finfo_close($finfo);

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=86400');
        readfile($filePath);
        exit;
    }
    json_error('Upload file not found', 404);
}

// ── Auth ──────────────────────────────────────────────────────────────────
if (str_starts_with($path, '/auth')) {
    require_once $routesDir . '/auth.php';
    exit;
}

// ── Blogs (public) ────────────────────────────────────────────────────────
if (str_starts_with($path, '/blogs')) {
    require_once $routesDir . '/blogs.php';
    exit;
}

// ── Timeline (public) ─────────────────────────────────────────────────────
if (str_starts_with($path, '/timeline')) {
    require_once $routesDir . '/timeline.php';
    exit;
}

// ── News (public) ─────────────────────────────────────────────────────────
if (str_starts_with($path, '/news')) {
    require_once $routesDir . '/news.php';
    exit;
}

// ── Gallery (public) ──────────────────────────────────────────────────────
if (str_starts_with($path, '/gallery')) {
    require_once $routesDir . '/gallery.php';
    exit;
}

// ── Contact / Messages / Subscriptions / Visitors (public) ────────────────
if ($path === '/messages' || $path === '/contact' || $path === '/subscribe' || str_starts_with($path, '/subscriptions') || str_starts_with($path, '/unsubscribe') || str_starts_with($path, '/resubscribe') || $path === '/visitors') {
    require_once $routesDir . '/contact.php';
    exit;
}

// ── Admin routes (protected) ──────────────────────────────────────────────
if (str_starts_with($path, '/admin')) {
    $adminPath = substr($path, strlen('/admin'));

    if ($adminPath === '/stats' && $method === 'GET') {
        require_once $routesDir . '/admin/stats.php';
        exit;
    }
    if (str_starts_with($adminPath, '/blogs')) {
        require_once $routesDir . '/admin/blogs.php';
        exit;
    }
    if (str_starts_with($adminPath, '/timeline')) {
        require_once $routesDir . '/admin/timeline.php';
        exit;
    }
    if (str_starts_with($adminPath, '/news')) {
        require_once $routesDir . '/admin/news.php';
        exit;
    }
    if (str_starts_with($adminPath, '/gallery')) {
        require_once $routesDir . '/admin/gallery.php';
        exit;
    }
    if (str_starts_with($adminPath, '/messages')) {
        require_once $routesDir . '/admin/messages.php';
        exit;
    }
    if (str_starts_with($adminPath, '/comments')) {
        require_once $routesDir . '/admin/comments.php';
        exit;
    }
    if (str_starts_with($adminPath, '/notifications')) {
        require_once $routesDir . '/admin/notifications.php';
        exit;
    }
    if (str_starts_with($adminPath, '/subscribers')) {
        require_once $routesDir . '/admin/subscribers.php';
        exit;
    }
}

// ─── 404 Fallback ─────────────────────────────────────────────────────────
json_error("Route not found: [$method] $path", 404);

<?php
/**
 * index.php — Main router/dispatcher for the PHP backend.
 * All /api/* requests are rewritten here by .htaccess.
 */

declare(strict_types=1);

// ─── Bootstrap ────────────────────────────────────────────────────────────
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/db.php';
require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/helpers/upload.php';

// ─── CORS ─────────────────────────────────────────────────────────────────
set_cors_headers();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Parse URI ────────────────────────────────────────────────────────────
$requestUri  = $_SERVER['REQUEST_URI'] ?? '/';
$scriptName  = dirname($_SERVER['SCRIPT_NAME']);

// Strip script directory prefix (so it works in a subdirectory)
if ($scriptName !== '/' && str_starts_with($requestUri, $scriptName)) {
    $requestUri = substr($requestUri, strlen($scriptName));
}

// Remove query string and strip prefixes (/index.php or /api)
$path = strtok($requestUri, '?');
$path = preg_replace('#^/index\.php#', '', $path);
$path = preg_replace('#^/api#', '', $path);
$path = rtrim($path, '/') ?: '/';
$method = strtoupper($_SERVER['REQUEST_METHOD']);



// ─── Route Matching Helper ────────────────────────────────────────────────
$routeParams = [];

/**
 * Match a URL pattern against a path and return named params, or false if no match.
 * @return array<string,string>|false
 */
function match_route(string $pattern, string $path) {
    // Convert :param and {param} style placeholders to named capture groups
    $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
    $regex = preg_replace('/:(\w+)/', '(?P<$1>[^/]+)', $regex);
    $regex = '#^' . $regex . '$#';

    if (preg_match($regex, $path, $matches)) {
        // Return only string-named matches
        return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
    }
    return false;
}

// ─── Routing Table ────────────────────────────────────────────────────────

// Health check
if ($method === 'GET' && $path === '/health') {
    json_success(['status' => 'healthy', 'version' => APP_VERSION]);
}

// ── Auth ──────────────────────────────────────────────────────────────────
if (str_starts_with($path, '/auth')) {
    require_once __DIR__ . '/routes/auth.php';
    exit;
}

// ── Blogs (public) ────────────────────────────────────────────────────────
if (str_starts_with($path, '/blogs')) {
    require_once __DIR__ . '/routes/blogs.php';
    exit;
}

// ── Timeline (public) ─────────────────────────────────────────────────────
if (str_starts_with($path, '/timeline')) {
    require_once __DIR__ . '/routes/timeline.php';
    exit;
}

// ── News (public) ─────────────────────────────────────────────────────────
if (str_starts_with($path, '/news')) {
    require_once __DIR__ . '/routes/news.php';
    exit;
}

// ── Gallery (public) ──────────────────────────────────────────────────────
if (str_starts_with($path, '/gallery')) {
    require_once __DIR__ . '/routes/gallery.php';
    exit;
}

// ── Contact / Messages / Subscriptions (public) ───────────────────────────
if ($path === '/messages' || $path === '/contact' || $path === '/subscribe' || $path === '/subscriptions') {
    require_once __DIR__ . '/routes/contact.php';
    exit;
}

// ── Admin routes (protected) ──────────────────────────────────────────────
if (str_starts_with($path, '/admin')) {
    $adminPath = substr($path, strlen('/admin'));

    if ($adminPath === '/stats' && $method === 'GET') {
        require_once __DIR__ . '/routes/admin/stats.php';
        exit;
    }
    if (str_starts_with($adminPath, '/blogs')) {
        require_once __DIR__ . '/routes/admin/blogs.php';
        exit;
    }
    if (str_starts_with($adminPath, '/timeline')) {
        require_once __DIR__ . '/routes/admin/timeline.php';
        exit;
    }
    if (str_starts_with($adminPath, '/news')) {
        require_once __DIR__ . '/routes/admin/news.php';
        exit;
    }
    if (str_starts_with($adminPath, '/gallery')) {
        require_once __DIR__ . '/routes/admin/gallery.php';
        exit;
    }
    if (str_starts_with($adminPath, '/messages')) {
        require_once __DIR__ . '/routes/admin/messages.php';
        exit;
    }
    if (str_starts_with($adminPath, '/comments')) {
        require_once __DIR__ . '/routes/admin/comments.php';
        exit;
    }
    if (str_starts_with($adminPath, '/notifications')) {
        require_once __DIR__ . '/routes/admin/notifications.php';
        exit;
    }
}

// ─── 404 Fallback ─────────────────────────────────────────────────────────
json_error("Route not found: [$method] $path", 404);

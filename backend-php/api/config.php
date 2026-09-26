<?php
/**
 * config.php — Central configuration for the PHP backend.
 * Edit these values before deploying to your server.
 */

// ─── Database Configuration ────────────────────────────────────────────────
// Set DB_DRIVER to 'sqlite' for zero-config local development, or 'mysql' for cPanel production.
define('DB_DRIVER', 'sqlite'); 
define('DB_SQLITE_PATH', __DIR__ . '/../database.sqlite');

// MySQL Settings (used when DB_DRIVER === 'mysql')
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'your_db_name');       // e.g. cpanelusername_rakeshwar
define('DB_USER', 'your_db_user');       // e.g. cpanelusername_rp
define('DB_PASS', 'YourStrongPassword'); // Set a strong password
define('DB_CHARSET', 'utf8mb4');


// ─── JWT Authentication ────────────────────────────────────────────────────
// Generate with: php -r "echo bin2hex(random_bytes(32));"
define('JWT_SECRET', 'change-this-to-a-very-long-random-secret-key-64-chars-min');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRY_MINUTES', 1440); // 24 hours

// ─── File Uploads ──────────────────────────────────────────────────────────
// Absolute path to the uploads directory on the server
// On cPanel: /home/your_username/public_html/uploads
define('UPLOAD_DIR', __DIR__ . '/../uploads');
define('UPLOAD_URL_PREFIX', '/uploads'); // URL prefix for serving uploads
define('MAX_UPLOAD_MB', 10);
define('MAX_IMAGE_WIDTH', 1200); // Max width for resized images

// ─── CORS Allowed Origins ─────────────────────────────────────────────────
define('CORS_ORIGINS', [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:5174',
    'http://localhost:8000',
    'capacitor://localhost',
]);

// ─── Email (SMTP for contact form) ────────────────────────────────────────
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-app-password');
define('CONTACT_NOTIFY_EMAIL', 'rakeshwarpandey@gmail.com');

// ─── App ───────────────────────────────────────────────────────────────────
define('APP_NAME', 'Rakeshwar Pandey Portfolio');
define('APP_VERSION', '2.0.0');
define('DEBUG', true); // Set to true for initial deployment troubleshooting

// ─── PHP 8 Compatibility Polyfills ───────────────────────────────────────
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}
if (!function_exists('str_ends_with')) {
    function str_ends_with(string $haystack, string $needle): bool {
        return $needle === '' || (string)$needle === '' || substr($haystack, -strlen($needle)) === $needle;
    }
}
if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
}


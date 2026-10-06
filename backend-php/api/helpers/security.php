<?php
/**
 * helpers/security.php — Anti-bot, Honeypot, Time-gate, and Rate limiting protection.
 */

declare(strict_types=1);

/**
 * Get client IP address accurately, handling Cloudflare, proxies, and standard headers.
 */
function get_client_ip(): string {
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_REAL_IP',
        'HTTP_X_FORWARDED_FOR',
        'REMOTE_ADDR'
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', (string)$_SERVER[$header]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Ensure rate_limits table exists in database.
 */
function ensure_rate_limits_table(PDO $pdo): void {
    static $done = false;
    if ($done) return;
    $done = true;

    $isSQLite = (defined('DB_DRIVER') && DB_DRIVER === 'sqlite');
    $pkAuto   = $isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
    $engine   = $isSQLite ? '' : 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS rate_limits (
                id               {$pkAuto},
                ip_address       VARCHAR(45) NOT NULL,
                action           VARCHAR(64) NOT NULL,
                attempts         INTEGER DEFAULT 1,
                first_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_attempt_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                blocked_until    DATETIME NULL
            ) {$engine};
        ");

        if ($isSQLite) {
            $pdo->exec("CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON rate_limits (ip_address, action);");
        } else {
            // MySQL index check
            $pdo->exec("CREATE INDEX idx_rate_limits_ip_action ON rate_limits (ip_address, action);");
        }
    } catch (Exception $e) {
        // Index or table already exists
    }
}

/**
 * Check and enforce IP rate limiting.
 *
 * @param string $action        e.g. 'contact_form', 'newsletter_subscribe', 'blog_comment'
 * @param int    $maxAttempts   Max allowed requests in window (e.g. 5)
 * @param int    $windowSeconds Time window in seconds (e.g. 600 for 10 min)
 * @param int    $blockSeconds  Block duration in seconds if exceeded (e.g. 1800 for 30 min)
 */
function check_rate_limit(string $action, int $maxAttempts = 5, int $windowSeconds = 600, int $blockSeconds = 1800): void {
    $db = get_db();
    ensure_rate_limits_table($db);

    $ip = get_client_ip();
    $now = time();
    $nowStr = date('Y-m-d H:i:s', $now);

    // 1. Check if IP has an existing record
    $stmt = $db->prepare('SELECT id, attempts, first_attempt_at, last_attempt_at, blocked_until FROM rate_limits WHERE ip_address = ? AND action = ? LIMIT 1');
    $stmt->execute([$ip, $action]);
    $record = $stmt->fetch();

    if ($record) {
        // If currently blocked
        if (!empty($record['blocked_until'])) {
            $blockedUntil = strtotime($record['blocked_until']);
            if ($blockedUntil > $now) {
                $waitMinutes = max(1, (int) ceil(($blockedUntil - $now) / 60));
                json_error("Too many submissions received from your connection. Please wait {$waitMinutes} minute(s) before trying again.", 429);
                exit;
            }
        }

        $firstAttempt = strtotime($record['first_attempt_at']);
        // Still inside window
        if (($now - $firstAttempt) < $windowSeconds) {
            $attempts = (int) $record['attempts'] + 1;
            if ($attempts > $maxAttempts) {
                // Block the IP
                $blockedUntilStr = date('Y-m-d H:i:s', $now + $blockSeconds);
                $db->prepare('UPDATE rate_limits SET attempts = ?, last_attempt_at = ?, blocked_until = ? WHERE id = ?')
                   ->execute([$attempts, $nowStr, $blockedUntilStr, $record['id']]);

                $waitMinutes = (int) ceil($blockSeconds / 60);
                json_error("Submission rate limit exceeded. Your connection has been temporarily paused. Please wait {$waitMinutes} minutes.", 429);
                exit;
            }

            // Increment attempt count
            $db->prepare('UPDATE rate_limits SET attempts = ?, last_attempt_at = ? WHERE id = ?')
               ->execute([$attempts, $nowStr, $record['id']]);
        } else {
            // Window expired, reset window
            $db->prepare('UPDATE rate_limits SET attempts = 1, first_attempt_at = ?, last_attempt_at = ?, blocked_until = NULL WHERE id = ?')
               ->execute([$nowStr, $nowStr, $record['id']]);
        }
    } else {
        // First attempt in this window
        $db->prepare('INSERT INTO rate_limits (ip_address, action, attempts, first_attempt_at, last_attempt_at) VALUES (?, ?, 1, ?, ?)')
           ->execute([$ip, $action, $nowStr, $nowStr]);
    }
}

/**
 * Honeypot Verification:
 * Checks for hidden bot trap fields ('website_hp', 'hp_check', 'company_name_verify').
 * If filled, silently terminates with a fake 200 OK message so the bot thinks it succeeded,
 * without touching the database, sending push notifications, or sending emails.
 */
function verify_honeypot(array $body): void {
    $trapFields = ['website_hp', 'hp_check', 'company_name_verify', 'fax_number_hp'];

    foreach ($trapFields as $field) {
        if (!empty($body[$field])) {
            $val = trim((string)$body[$field]);
            if ($val !== '') {
                error_log("[SECURITY] Bot trapped via honeypot field '{$field}' with value '{$val}' from IP: " . get_client_ip());
                // Return silent simulated success so bot does not retry
                json_message('Thank you! Your submission has been received.');
                exit;
            }
        }
    }
}

/**
 * Time-Gate Verification:
 * Ensures human took a realistic amount of time (> 2.0s) between form render and submit.
 *
 * @param array $body        Input payload containing '_t' (timestamp in milliseconds or seconds)
 * @param float $minSeconds  Minimum human submission time in seconds
 */
function verify_time_gate(array $body, float $minSeconds = 2.0): void {
    $rawToken = $body['_t'] ?? $body['time_token'] ?? null;
    if ($rawToken === null) {
        return;
    }

    $timestamp = is_numeric($rawToken) ? (float)$rawToken : 0;
    if ($timestamp > 1000000000000) {
        // In milliseconds (JS Date.now())
        $timestamp = $timestamp / 1000.0;
    }

    $now = (float) microtime(true);
    $elapsed = $now - $timestamp;

    if ($elapsed < $minSeconds && $elapsed >= 0) {
        error_log("[SECURITY] Bot caught by time-gate (took {$elapsed}s < {$minSeconds}s) from IP: " . get_client_ip());
        // Return simulated success
        json_message('Thank you! Your submission has been received.');
        exit;
    }
}

/**
 * Disposable & Throwaway Email Domain Detection.
 */
function is_disposable_email(string $email): bool {
    $parts = explode('@', strtolower(trim($email)));
    if (count($parts) < 2) return true;
    $domain = end($parts);

    static $disposableDomains = [
        'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'throwawaymail.com', 'trashmail.com', 'yopmail.com', 'sharklasers.com',
        'dispostable.com', 'getairmail.com', 'fakemailgenerator.com', 'mohmal.com',
        'crazymailing.com', 'mytemp.email', 'tempail.com', 'burnermail.io',
        'nada.ltd', 'inboxkitten.com', 'emailondeck.com', 'generator.email',
        'temp-mail.org', 'tempmail.net', 'fakemail.net', 'maildrop.cc',
        'harakirimail.com', 'disposablemail.com', 'throwawayemail.com'
    ];

    return in_array($domain, $disposableDomains, true);
}

/**
 * Sanitize plain string input (strips HTML tags and normalizes whitespace).
 */
function sanitize_clean_text(string $text, int $maxLen = 2000): string {
    $stripped = strip_tags($text);
    return substr(trim($stripped), 0, $maxLen);
}

/**
 * Detect frontend base URL for verification links (supports local dev server, Capacitor, or production domain).
 */
function get_site_frontend_url(): string {
    if (!empty($_SERVER['HTTP_ORIGIN']) && (str_contains($_SERVER['HTTP_ORIGIN'], 'localhost') || str_contains($_SERVER['HTTP_ORIGIN'], '127.0.0.1'))) {
        return rtrim($_SERVER['HTTP_ORIGIN'], '/');
    }
    if (!empty($_SERVER['HTTP_REFERER']) && (str_contains($_SERVER['HTTP_REFERER'], 'localhost') || str_contains($_SERVER['HTTP_REFERER'], '127.0.0.1'))) {
        $parsed = parse_url($_SERVER['HTTP_REFERER']);
        if (!empty($parsed['scheme']) && !empty($parsed['host'])) {
            $port = !empty($parsed['port']) ? ':' . $parsed['port'] : '';
            return $parsed['scheme'] . '://' . $parsed['host'] . $port;
        }
    }
    return defined('APP_URL') ? rtrim(APP_URL, '/') : 'https://rakeshwarpandey.com';
}

/**
 * Generate and store a secure verification token for subscriber/contact/visitor.
 *
 * @param PDO    $db
 * @param string $email
 * @param string $actionType   'contact' | 'subscriber' | 'visitor'
 * @param array  $payload      Metadata to associate with the verification
 * @param int    $expiryHours  Link validity duration (default 24h)
 * @return array ['token' => string, 'verify_url' => string, 'expires_at' => string]
 */
function create_verification_token(PDO $db, string $email, string $actionType, array $payload, int $expiryHours = 24): array {
    ensure_verification_tables($db);

    $token = bin2hex(random_bytes(32)); // 64 hex characters
    $expiresAt = date('Y-m-d H:i:s', time() + ($expiryHours * 3600));
    $payloadJson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    $stmt = $db->prepare('INSERT INTO verification_tokens (token, action_type, email, payload, is_verified, expires_at) VALUES (?, ?, ?, ?, 0, ?)');
    $stmt->execute([$token, $actionType, $email, $payloadJson, $expiresAt]);

    $siteUrl = get_site_frontend_url();
    $verifyUrl = "{$siteUrl}/#/verify?token=" . urlencode($token) . "&type=" . urlencode($actionType);

    return [
        'token'      => $token,
        'verify_url' => $verifyUrl,
        'expires_at' => $expiresAt
    ];
}

/**
 * Validate and consume a verification token.
 *
 * @param PDO         $db
 * @param string      $token
 * @param string|null $expectedType
 * @return array|null Returns record array with decoded 'payload' if valid, null otherwise
 */
function verify_email_token(PDO $db, string $token, ?string $expectedType = null): ?array {
    ensure_verification_tables($db);

    $sql = 'SELECT * FROM verification_tokens WHERE token = ? AND is_verified = 0 LIMIT 1';
    $stmt = $db->prepare($sql);
    $stmt->execute([$token]);
    $record = $stmt->fetch();

    if (!$record) {
        return null;
    }

    if ($expectedType !== null && $record['action_type'] !== $expectedType) {
        return null;
    }

    // Check expiration
    if (strtotime($record['expires_at']) < time()) {
        return null;
    }

    // Mark as verified & consumed
    $nowStr = date('Y-m-d H:i:s');
    $db->prepare('UPDATE verification_tokens SET is_verified = 1, verified_at = ? WHERE id = ?')
       ->execute([$nowStr, $record['id']]);

    $record['payload'] = json_decode($record['payload'] ?? '{}', true) ?: [];
    return $record;
}


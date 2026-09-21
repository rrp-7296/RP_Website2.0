<?php
/**
 * helpers/auth.php — Pure-PHP JWT (HS256) + password helpers.
 * No external dependencies required.
 */

// ─── JWT Helpers ──────────────────────────────────────────────────────────

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwt_decode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $sig] = $parts;

    // Verify signature
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;

    $data = json_decode(base64url_decode($payload), true);
    if (!$data) return null;

    // Check expiry
    if (isset($data['exp']) && $data['exp'] < time()) return null;

    return $data;
}

function create_token(string $username): string {
    return jwt_encode([
        'sub' => $username,
        'iat' => time(),
        'exp' => time() + (JWT_EXPIRY_MINUTES * 60),
    ]);
}

// ─── Password Helpers ─────────────────────────────────────────────────────

function hash_password(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verify_password(string $plain, string $hash): bool {
    return password_verify($plain, $hash);
}

// ─── Middleware: Require Admin JWT ────────────────────────────────────────

/**
 * Call at the top of any protected route.
 * Returns the username from the token, or exits with 401.
 */
function require_admin(): string {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }

    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
        json_error('Authentication required', 401);
        exit;
    }

    $payload = jwt_decode($m[1]);
    if (!$payload || empty($payload['sub'])) {
        json_error('Invalid or expired token', 401);
        exit;
    }

    // Verify user still exists in DB
    $db = get_db();
    $stmt = $db->prepare('SELECT username FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$payload['sub']]);
    if (!$stmt->fetch()) {
        json_error('User not found', 401);
        exit;
    }

    return $payload['sub'];
}

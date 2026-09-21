<?php
/**
 * routes/auth.php — POST /auth/login, GET /auth/me
 */

$db = get_db();

// POST /auth/login
if ($method === 'POST' && $path === '/auth/login') {
    $body = get_body();
    $username = require_field($body, 'username');
    $password = require_field($body, 'password');

    $stmt = $db->prepare('SELECT id, username, display_name, email, password_hash FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !verify_password($password, $user['password_hash'])) {
        json_error('Invalid username or password', 401);
    }

    $token = create_token($user['username']);

    json_success([
        'access_token' => $token,
        'token_type'   => 'bearer',
        'expires_in'   => JWT_EXPIRY_MINUTES * 60,
    ]);
}

// GET /auth/me
if ($method === 'GET' && $path === '/auth/me') {
    $username = require_admin();

    $stmt = $db->prepare('SELECT id, username, display_name, email FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        json_error('User not found', 404);
    }

    json_success($user);
}

json_error("Not found: [$method] $path", 404);

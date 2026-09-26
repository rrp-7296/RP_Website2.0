<?php
/**
 * routes/auth.php — POST /auth/login, GET /auth/me, POST /auth/change-password
 */

$db = get_db();

// POST /auth/login
if ($method === 'POST' && $path === '/auth/login') {
    $body = get_body();
    $username = trim((string)require_field($body, 'username'));
    $password = (string)require_field($body, 'password');

    $stmt = $db->prepare('SELECT id, username, display_name, email, password_hash FROM admin_users WHERE LOWER(username) = LOWER(?) LIMIT 1');
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

// POST /auth/change-password
if ($method === 'POST' && $path === '/auth/change-password') {
    $username = require_admin();
    $body = get_body();
    $currentPassword = require_field($body, 'current_password');
    $newPassword     = require_field($body, 'new_password');

    $stmt = $db->prepare('SELECT password_hash FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !verify_password($currentPassword, $user['password_hash'])) {
        json_error('Current password is incorrect', 400);
    }

    $newHash = hash_password($newPassword);
    $updateStmt = $db->prepare('UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?');
    $updateStmt->execute([$newHash, $username]);

    json_success(['message' => 'Password changed successfully']);
}

json_error("Not found: [$method] $path", 404);

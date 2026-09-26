<?php
/**
 * change_password.php — Simple script to update admin password directly in MySQL.
 * Usage: Visit https://rakeshwarpandey.com/api/change_password.php?new=YOUR_NEW_PASSWORD
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/db.php';
require_once __DIR__ . '/helpers/auth.php';

header('Content-Type: text/html; charset=utf-8');

$newPassword = $_GET['new'] ?? null;

if (!$newPassword || strlen($newPassword) < 6) {
    die('<div style="font-family:sans-serif; padding:30px; background:#0f172a; color:#fff;">' .
        '<h2 style="color:#ef4444;">⚠️ Password Change Utility</h2>' .
        '<p>Pass your desired password in the URL parameter <code>?new=YOUR_PASSWORD</code></p>' .
        '<p><strong>Example:</strong> <code>https://rakeshwarpandey.com/api/change_password.php?new=MySuperSecretPass123</code></p>' .
        '</div>');
}

$hash = hash_password($newPassword);
$db = get_db();
$stmt = $db->prepare('UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?');
$stmt->execute([$hash, 'admin']);

echo '<div style="font-family:sans-serif; padding:30px; background:#0f172a; color:#fff;">' .
     '<h2 style="color:#22c55e;">✅ Admin Password Updated Successfully!</h2>' .
     '<p>Your new password for username <code>admin</code> is set to: <code>' . htmlspecialchars($newPassword) . '</code></p>' .
     '<p><a href="/#/admin" style="color:#38bdf8;">Click here to go to Admin Login</a></p>' .
     '<hr style="border-color:#334155;">' .
     '<p style="color:#ef4444; font-weight:bold;">⚠️ Security Warning: Delete <code>change_password.php</code> from your server after use!</p>' .
     '</div>';

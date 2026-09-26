<?php
/**
 * create_admin.php — Script to create or reset an admin user with custom credentials.
 * Delete this file after use!
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/db.php';
require_once __DIR__ . '/helpers/auth.php';

header('Content-Type: text/html; charset=utf-8');

$message = null;
$error   = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['username'], $_GET['password'])) {
    $username    = trim($_POST['username'] ?? $_GET['username'] ?? '');
    $password    = trim($_POST['password'] ?? $_GET['password'] ?? '');
    $displayName = trim($_POST['display_name'] ?? $_GET['display_name'] ?? 'Rakeshwar Pandey');
    $email       = trim($_POST['email'] ?? $_GET['email'] ?? 'rakeshwarpandey@gmail.com');

    if (empty($username) || empty($password)) {
        $error = "Username and Password are required.";
    } else {
        try {
            $db = get_db();
            $passwordHash = hash_password($password);

            // Check if username exists
            $stmt = $db->prepare('SELECT id FROM admin_users WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Update existing user
                $updateStmt = $db->prepare('UPDATE admin_users SET password_hash = ?, display_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?');
                $updateStmt->execute([$passwordHash, $displayName, $email, $username]);
                $message = "✅ Admin user <strong>" . htmlspecialchars($username) . "</strong> updated successfully!";
            } else {
                // Create new admin user
                $insertStmt = $db->prepare('INSERT INTO admin_users (username, password_hash, display_name, email) VALUES (?, ?, ?, ?)');
                $insertStmt->execute([$username, $passwordHash, $displayName, $email]);
                $message = "✅ Admin user <strong>" . htmlspecialchars($username) . "</strong> created successfully!";
            }
        } catch (Exception $e) {
            $error = "Database Error: " . htmlspecialchars($e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Create Admin User — <?= htmlspecialchars(defined('APP_NAME') ? APP_NAME : 'Portfolio') ?></title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 500px; margin: 40px auto; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px; }
  h2 { color: #38bdf8; margin-top: 0; }
  label { display: block; margin-top: 14px; font-size: 14px; color: #94a3b8; }
  input[type="text"], input[type="password"], input[type="email"] { width: 100%; padding: 10px; margin-top: 6px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #fff; box-sizing: border-box; }
  button { width: 100%; margin-top: 20px; padding: 12px; border-radius: 6px; border: none; background: #0284c7; color: white; font-weight: bold; cursor: pointer; font-size: 16px; }
  button:hover { background: #0369a1; }
  .alert-success { background: #14532d; color: #4ade80; padding: 14px; border-radius: 6px; margin-bottom: 16px; }
  .alert-error { background: #7f1d1d; color: #fca5a5; padding: 14px; border-radius: 6px; margin-bottom: 16px; }
  .warn { background: #7f1d1d; color: #fca5a5; padding: 12px; margin-top: 24px; border-radius: 6px; font-size: 13px; font-weight: bold; }
</style>
</head>
<body>
<h2>👤 Create / Reset Admin User</h2>

<?php if ($message): ?>
  <div class="alert-success"><?= $message ?></div>
  <p><a href="/#/admin" style="color:#38bdf8; font-weight:bold;">👉 Click here to login to Admin Panel</a></p>
<?php endif; ?>

<?php if ($error): ?>
  <div class="alert-error"><?= $error ?></div>
<?php endif; ?>

<form method="POST">
  <label>Username</label>
  <input type="text" name="username" value="admin" required>

  <label>New Password</label>
  <input type="password" name="password" placeholder="Enter new password" required>

  <label>Display Name</label>
  <input type="text" name="display_name" value="Rakeshwar Pandey">

  <label>Email Address</label>
  <input type="email" name="email" value="rakeshwarpandey@gmail.com">

  <button type="submit">Create / Update Admin User</button>
</form>

<div class="warn">
  ⚠️ SECURITY WARNING: Delete <code>create_admin.php</code> from your server after use!
</div>
</body>
</html>

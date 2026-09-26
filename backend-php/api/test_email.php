<?php
/**
 * test_email.php — Web-based test script to verify SMTP / Email delivery.
 * Visit: https://rakeshwarpandey.com/api/test_email.php?to=your_email@gmail.com
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/mail.php';

header('Content-Type: text/html; charset=utf-8');

$toEmail = $_GET['to'] ?? null;
$resultMessage = null;

if ($toEmail && filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
    $subject = "SMTP Email Test — " . APP_NAME;
    $body = "
    <h2>SMTP & Email Delivery Test</h2>
    <p>This is a test email sent from <strong>" . htmlspecialchars(APP_NAME) . "</strong> to verify that your email settings are working properly.</p>
    <p><strong>SMTP Host:</strong> " . htmlspecialchars(defined('SMTP_HOST') ? SMTP_HOST : 'Default') . "</p>
    <p><strong>SMTP User:</strong> " . htmlspecialchars(defined('SMTP_USER') ? SMTP_USER : 'Not set') . "</p>
    <p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>
    ";

    $success = send_html_email($toEmail, 'Test User', $subject, $body);

    if ($success) {
        $resultMessage = '<div style="background:#14532d; color:#4ade80; padding:16px; border-radius:8px; margin-bottom:20px;">' .
                         '✅ Test email sent successfully to <strong>' . htmlspecialchars($toEmail) . '</strong>! Please check your inbox / spam folder.' .
                         '</div>';
    } else {
        $resultMessage = '<div style="background:#7f1d1d; color:#fca5a5; padding:16px; border-radius:8px; margin-bottom:20px;">' .
                         '❌ Failed to send email. Check your SMTP settings in <code>api/config.php</code> or web server error logs.' .
                         '</div>';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Test Email — <?= htmlspecialchars(defined('APP_NAME') ? APP_NAME : 'Portfolio') ?></title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 550px; margin: 40px auto; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px; }
  h2 { color: #ff9933; margin-top: 0; }
  label { display: block; margin-top: 14px; font-size: 14px; color: #94a3b8; }
  input[type="email"] { width: 100%; padding: 12px; margin-top: 6px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #fff; box-sizing: border-box; }
  button { width: 100%; margin-top: 20px; padding: 12px; border-radius: 6px; border: none; background: #ff9933; color: white; font-weight: bold; cursor: pointer; font-size: 16px; }
  button:hover { background: #e68a00; }
  .info-card { background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9933; font-size: 14px; line-height: 1.6; }
</style>
</head>
<body>
<h2>📧 SMTP & Email Delivery Test</h2>

<div class="info-card">
  <strong>Current Configuration:</strong><br>
  • Host: <code><?= htmlspecialchars(defined('SMTP_HOST') ? SMTP_HOST : 'Default') ?></code><br>
  • Port: <code><?= htmlspecialchars((string)(defined('SMTP_PORT') ? SMTP_PORT : 587)) ?></code><br>
  • Sender Email: <code><?= htmlspecialchars(defined('SMTP_USER') ? SMTP_USER : 'Native Mail') ?></code>
</div>

<?= $resultMessage ?>

<form method="GET">
  <label>Enter Recipient Email Address to Send Test Email:</label>
  <input type="email" name="to" placeholder="your_email@gmail.com" required value="<?= htmlspecialchars($toEmail ?: '') ?>">
  <button type="submit">Send Test Email 🚀</button>
</form>
</body>
</html>

<?php
/**
 * helpers/mail.php — Centralized email dispatch (SMTP + Native Mail), HTML templates, and subscriber broadcasting.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

/**
 * Robust SMTP Socket + Native Mail Fallback Dispatcher
 */
function send_html_email(string $toEmail, string $toName, string $subject, string $htmlBody): bool {
    $host = defined('SMTP_HOST') ? SMTP_HOST : 'smtp.gmail.com';
    $port = defined('SMTP_PORT') ? (int)SMTP_PORT : 587;
    $username = defined('SMTP_USER') ? SMTP_USER : '';
    $password = defined('SMTP_PASS') ? SMTP_PASS : '';
    $fromEmail = (!empty($username) && filter_var($username, FILTER_VALIDATE_EMAIL)) 
        ? $username 
        : ('noreply@' . ($_SERVER['HTTP_HOST'] ?? 'rakeshwarpandey.com'));
    $replyTo = (defined('CONTACT_NOTIFY_EMAIL') && filter_var(CONTACT_NOTIFY_EMAIL, FILTER_VALIDATE_EMAIL)) 
        ? CONTACT_NOTIFY_EMAIL 
        : $fromEmail;

    // If SMTP credentials are not set or left as defaults, fallback to PHP mail()
    if (empty($password) || str_contains($password, 'your-app-password') || str_contains($username, 'your-email@')) {
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Rakeshwar Pandey <{$fromEmail}>\r\n";
        $headers .= "Reply-To: {$replyTo}\r\n";
        $headers .= "X-Mailer: PHP/" . PHP_VERSION;
        return @mail($toEmail, $subject, $htmlBody, $headers);
    }

    // Perform direct SMTP Socket Connection
    try {
        $prefix = ($port === 465) ? 'ssl://' : '';
        $socket = @fsockopen($prefix . $host, $port, $errno, $errstr, 12);
        if (!$socket) {
            // Fallback to PHP mail() if socket connection refused
            $headers  = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: Rakeshwar Pandey <{$fromEmail}>\r\nReply-To: {$replyTo}\r\n";
            return @mail($toEmail, $subject, $htmlBody, $headers);
        }

        $read = function() use ($socket) { return fgets($socket, 512); };
        $write = function($cmd) use ($socket) { fputs($socket, $cmd . "\r\n"); };

        $read();
        $write("EHLO " . gethostname());
        $read();

        if ($port === 587) {
            $write("STARTTLS");
            $startTlsResp = $read();
            if (str_starts_with($startTlsResp, '220')) {
                stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                $write("EHLO " . gethostname());
                $read();
            }
        }

        $write("AUTH LOGIN");
        $read();
        $write(base64_encode($username));
        $read();
        $write(base64_encode($password));
        $authResp = $read();

        if (!str_starts_with($authResp, '235')) {
            fclose($socket);
            // Fallback to mail() if auth fails
            $headers  = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: Rakeshwar Pandey <{$fromEmail}>\r\nReply-To: {$replyTo}\r\n";
            return @mail($toEmail, $subject, $htmlBody, $headers);
        }

        $write("MAIL FROM: <{$fromEmail}>");
        $read();
        $write("RCPT TO: <{$toEmail}>");
        $read();
        $write("DATA");
        $read();

        $message  = "MIME-Version: 1.0\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "From: Rakeshwar Pandey <{$fromEmail}>\r\n";
        $message .= "Reply-To: {$replyTo}\r\n";
        $message .= "To: {$toName} <{$toEmail}>\r\n";
        $message .= "Subject: {$subject}\r\n\r\n";
        $message .= $htmlBody . "\r\n.";

        $write($message);
        $sendResp = $read();

        $write("QUIT");
        fclose($socket);

        return str_starts_with($sendResp, '250');
    } catch (Exception $e) {
        $headers  = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: Rakeshwar Pandey <{$fromEmail}>\r\nReply-To: {$replyTo}\r\n";
        return @mail($toEmail, $subject, $htmlBody, $headers);
    }
}

/**
 * Send an HTML reply email to a visitor who submitted a contact form.
 */
function send_reply_email(string $toEmail, string $toName, string $originalSubject, string $replyBody): bool {
    $toNameEsc  = htmlspecialchars($toName ?: 'Valued Visitor', ENT_QUOTES, 'UTF-8');
    $subjectEsc = htmlspecialchars($originalSubject ?: 'Your message to ' . APP_NAME, ENT_QUOTES, 'UTF-8');
    $replyHtml  = nl2br(htmlspecialchars($replyBody, ENT_QUOTES, 'UTF-8'));
    $subject    = 'Re: ' . ($originalSubject ?: 'Your message to ' . APP_NAME);

    $htmlBody = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='utf-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>{$subjectEsc}</title>
    </head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #1e293b;'>
      <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>
        
        <!-- Header Banner -->
        <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
          <h2 style='margin: 0; font-size: 22px; font-weight: 800; color: #FF9933; letter-spacing: 0.5px;'>RAKESHWAR PANDEY</h2>
          <p style='margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;'>President — INTUC Jharkhand | Trade Union Leader</p>
        </div>

        <!-- Content Body -->
        <div style='padding: 32px 28px;'>
          <p style='font-size: 16px; color: #1e293b; font-weight: 600; margin-top: 0;'>Dear {$toNameEsc},</p>
          
          <p style='font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.5;'>
            Thank you for reaching out through our official website. In response to your message regarding <strong>\"{$subjectEsc}\"</strong>:
          </p>

          <!-- Reply Box -->
          <div style='background: #fff7ed; border-left: 4px solid #FF9933; padding: 20px; border-radius: 8px; margin-bottom: 28px;'>
            <p style='margin: 0; font-size: 15px; color: #334155; line-height: 1.7;'>{$replyHtml}</p>
          </div>

          <p style='font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px;'>
            If you have any further questions or follow-ups, please feel free to reply directly to this message.
          </p>

          <!-- Signature Block -->
          <div style='border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px;'>
            <p style='margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;'>Warm regards,</p>
            <p style='margin: 2px 0 0 0; font-size: 15px; font-weight: 800; color: #FF9933;'>Office of Rakeshwar Pandey</p>
            <p style='margin: 2px 0 0 0; font-size: 12px; color: #64748b;'>INTUC Jharkhand & Labor Welfare Association</p>
          </div>
        </div>

        <!-- Footer -->
        <div style='background: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;'>
          <p style='margin: 0;'>This email was sent in response to your inquiry on the official portfolio website.</p>
        </div>

      </div>
    </body>
    </html>
    ";

    return send_html_email($toEmail, $toName, $subject, $htmlBody);
}

/**
 * Broadcast an HTML update email to all active subscribers.
 */
function broadcast_email_to_subscribers(PDO $db, string $title, string $summary, string $link, string $postType = 'Update'): array {
    $stmt = $db->query("SELECT id, name, email FROM subscriptions WHERE (status = 'active' OR status IS NULL) AND email IS NOT NULL AND email != ''");
    $subscribers = $stmt->fetchAll();

    if (empty($subscribers)) {
        return ['sent' => 0, 'total' => 0];
    }

    $sentCount = 0;
    $total = count($subscribers);
    $siteUrl = defined('APP_URL') ? APP_URL : (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'https://rakeshwarpandey.com');

    $titleEsc   = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $summaryEsc = nl2br(htmlspecialchars(mb_substr(strip_tags($summary), 0, 320), ENT_QUOTES, 'UTF-8')) . '...';
    $postTypeEsc= htmlspecialchars($postType, ENT_QUOTES, 'UTF-8');
    $linkEsc    = htmlspecialchars($link, ENT_QUOTES, 'UTF-8');

    foreach ($subscribers as $sub) {
        $toEmail = $sub['email'];
        $toName  = $sub['name'] ? htmlspecialchars($sub['name'], ENT_QUOTES, 'UTF-8') : 'Subscriber';
        $unsubUrl = rtrim($siteUrl, '/') . '/#/unsubscribe?email=' . urlencode($toEmail);
        $unsubUrlEsc = htmlspecialchars($unsubUrl, ENT_QUOTES, 'UTF-8');

        $subject = "Rakeshwar Pandey — New {$postType}: {$title}";

        $htmlBody = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
          <meta charset='utf-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>{$titleEsc}</title>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #1e293b;'>
          <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>
            
            <!-- Header Banner -->
            <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
              <h2 style='margin: 0; font-size: 22px; font-weight: 800; color: #FF9933; letter-spacing: 0.5px;'>RAKESHWAR PANDEY</h2>
              <p style='margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;'>President — INTUC Jharkhand | Trade Union Leader</p>
            </div>

            <!-- Content Body -->
            <div style='padding: 32px 28px;'>
              <span style='display: inline-block; background: #fff7ed; color: #c2410c; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #ffedd5;'>
                NEW {$postTypeEsc}
              </span>

              <h1 style='font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.4;'>
                {$titleEsc}
              </h1>

              <p style='font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 28px;'>
                {$summaryEsc}
              </p>

              <div style='text-align: center; margin: 32px 0 24px 0;'>
                <a href='{$linkEsc}' style='background: linear-gradient(135deg, #FF9933 0%, #e65100 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(255, 153, 51, 0.35);'>
                  Read Full {$postTypeEsc} →
                </a>
              </div>
            </div>

            <!-- Footer with Unsubscribe -->
            <div style='background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;'>
              <p style='margin: 0 0 8px 0;'>You are receiving this update because you subscribed to notifications on the official website of Rakeshwar Pandey.</p>
              <p style='margin: 0;'>
                Want to opt out? <a href='{$unsubUrlEsc}' style='color: #c2410c; text-decoration: underline; font-weight: 600;'>Click here to Unsubscribe</a>
              </p>
            </div>

          </div>
        </body>
        </html>
        ";

        if (send_html_email($toEmail, $toName, $subject, $htmlBody)) {
            $sentCount++;
        }
    }

    $db->prepare(
        "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('broadcast', NULL, NULL, ?)"
    )->execute(["Broadcast sent for '{$title}': {$sentCount}/{$total} emails delivered."]);

    return ['sent' => $sentCount, 'total' => $total];
}

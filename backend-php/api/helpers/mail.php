<?php
/**
 * helpers/mail.php — Centralized email dispatch (SMTP + Native Mail), HTML templates, and subscriber broadcasting.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

/**
 * Polyfill helper check
 */
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}
if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
}

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

    // Perform direct SMTP Socket Connection inside a bulletproof Throwable try-catch block
    try {
        $prefix = ($port === 465) ? 'ssl://' : '';
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);
        
        $socket = @stream_socket_client($prefix . $host . ':' . $port, $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $context);
        if (!$socket) {
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
            if (str_starts_with((string)$startTlsResp, '220')) {
                $cryptoMethod = STREAM_CRYPTO_METHOD_TLS_CLIENT;
                if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
                    $cryptoMethod = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
                }
                @stream_socket_enable_crypto($socket, true, $cryptoMethod);
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

        if (!str_starts_with((string)$authResp, '235')) {
            fclose($socket);
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

        return str_starts_with((string)$sendResp, '250');
    } catch (Throwable $e) {
        $headers  = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: Rakeshwar Pandey <{$fromEmail}>\r\nReply-To: {$replyTo}\r\n";
        return @mail($toEmail, $subject, $htmlBody, $headers);
    }
}

/**
 * 1. Admin Notification Email: Sent to site owner when a new contact message is received.
 */
function send_admin_contact_notification(string $name, string $email, string $subject, string $message): bool {
    $toEmail = CONTACT_NOTIFY_EMAIL;
    $nameEsc = htmlspecialchars($name ?: 'Anonymous Visitor', ENT_QUOTES, 'UTF-8');
    $emailEsc = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $subjectEsc = htmlspecialchars($subject ?: 'No Subject', ENT_QUOTES, 'UTF-8');
    $msgHtml = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
    $emailSubject = "📩 New Contact Form Message from {$nameEsc}: {$subjectEsc}";

    $adminUrl = "https://rakeshwarpandey.com/#/admin";

    $htmlBody = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='utf-8'>
      <title>{$emailSubject}</title>
    </head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #1e293b;'>
      <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
          <h2 style='margin: 0; font-size: 20px; font-weight: 800; color: #FF9933;'>NEW INCOMING MESSAGE</h2>
          <p style='margin: 4px 0 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase;'>Rakeshwar Pandey Official Website</p>
        </div>

        <!-- Details Box -->
        <div style='padding: 28px 24px;'>
          <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;'>
            <tr>
              <td style='padding: 8px 0; color: #64748b; font-weight: 600; width: 100px;'>Sender Name:</td>
              <td style='padding: 8px 0; color: #0f172a; font-weight: 700;'>{$nameEsc}</td>
            </tr>
            <tr>
              <td style='padding: 8px 0; color: #64748b; font-weight: 600;'>Email:</td>
              <td style='padding: 8px 0; color: #0284c7; font-weight: 700;'><a href='mailto:{$emailEsc}' style='color: #0284c7; text-decoration: none;'>{$emailEsc}</a></td>
            </tr>
            <tr>
              <td style='padding: 8px 0; color: #64748b; font-weight: 600;'>Subject:</td>
              <td style='padding: 8px 0; color: #0f172a; font-weight: 700;'>{$subjectEsc}</td>
            </tr>
          </table>

          <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #FF9933; padding: 18px; border-radius: 8px; margin-bottom: 24px;'>
            <p style='margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;'>Message Content:</p>
            <p style='margin: 0; font-size: 15px; color: #334155; line-height: 1.6;'>{$msgHtml}</p>
          </div>

          <div style='text-align: center; margin-top: 24px;'>
            <a href='{$adminUrl}' style='background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;'>
              Reply via Admin Dashboard →
            </a>
          </div>
        </div>

      </div>
    </body>
    </html>
    ";

    return send_html_email($toEmail, 'Rakeshwar Pandey', $emailSubject, $htmlBody);
}

/**
 * 2. Visitor Reply Email: Sent to visitor when admin replies to their message.
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
      <title>{$subjectEsc}</title>
    </head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #1e293b;'>
      <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>
        
        <!-- Header Banner -->
        <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
          <h2 style='margin: 0; font-size: 22px; font-weight: 800; color: #FF9933; letter-spacing: 0.5px;'>RAKESHWAR PANDEY</h2>
          <p style='margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase;'>President — INTUC Jharkhand | Trade Union Leader</p>
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
            If you have any further questions, feel free to reply directly to this email.
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
 * 3. Subscriber Welcome Email: Sent to a new newsletter subscriber.
 */
function send_subscriber_welcome_email(string $toEmail, string $toName = ''): bool {
    $toNameEsc = htmlspecialchars($toName ?: 'Subscriber', ENT_QUOTES, 'UTF-8');
    $unsubUrl = 'https://rakeshwarpandey.com/#/unsubscribe?email=' . urlencode($toEmail);
    $subject = "Welcome to the Official Network of Rakeshwar Pandey";

    $htmlBody = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='utf-8'>
      <title>{$subject}</title>
    </head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #1e293b;'>
      <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>
        
        <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
          <h2 style='margin: 0; font-size: 22px; font-weight: 800; color: #FF9933;'>RAKESHWAR PANDEY</h2>
          <p style='margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase;'>President — INTUC Jharkhand</p>
        </div>

        <div style='padding: 32px 28px;'>
          <h3 style='margin-top: 0; color: #0f172a; font-size: 18px;'>Welcome, {$toNameEsc}! 🎉</h3>
          <p style='font-size: 15px; color: #475569; line-height: 1.6;'>
            Thank you for joining our official updates list. You will now receive timely updates on trade union initiatives, key speeches, press releases, and community welfare programs.
          </p>

          <div style='text-align: center; margin: 28px 0;'>
            <a href='https://rakeshwarpandey.com' style='background: linear-gradient(135deg, #FF9933 0%, #e65100 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-weight: 700; font-size: 14px; display: inline-block;'>
              Visit Official Website →
            </a>
          </div>
        </div>

        <div style='background: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;'>
          <p style='margin: 0;'>Want to unsubscribe? <a href='{$unsubUrl}' style='color: #c2410c; text-decoration: underline;'>Click here to Unsubscribe</a></p>
        </div>

      </div>
    </body>
    </html>
    ";

    return send_html_email($toEmail, $toName, $subject, $htmlBody);
}

/**
 * 4. Subscriber Broadcast Update Email: Sent to all active subscribers on new content.
 */
function broadcast_email_to_subscribers(PDO $db, string $title, string $summary, string $link, string $postType = 'Update'): array {
    $stmt = $db->query("SELECT id, name, email FROM subscriptions WHERE (status = 'active' OR status IS NULL) AND email IS NOT NULL AND email != ''");
    $subscribers = $stmt->fetchAll();

    if (empty($subscribers)) {
        return ['sent' => 0, 'total' => 0];
    }

    $sentCount = 0;
    $total = count($subscribers);
    $siteUrl = 'https://rakeshwarpandey.com';

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
          <title>{$titleEsc}</title>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #1e293b;'>
          <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>
            
            <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
              <h2 style='margin: 0; font-size: 22px; font-weight: 800; color: #FF9933;'>RAKESHWAR PANDEY</h2>
              <p style='margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase;'>President — INTUC Jharkhand</p>
            </div>

            <div style='padding: 32px 28px;'>
              <span style='display: inline-block; background: #fff7ed; color: #c2410c; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase; margin-bottom: 16px; border: 1px solid #ffedd5;'>
                NEW {$postTypeEsc}
              </span>

              <h1 style='font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.4;'>
                {$titleEsc}
              </h1>

              <p style='font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 28px;'>
                {$summaryEsc}
              </p>

              <div style='text-align: center; margin: 32px 0 24px 0;'>
                <a href='{$linkEsc}' style='background: linear-gradient(135deg, #FF9933 0%, #e65100 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 15px; display: inline-block;'>
                  Read Full {$postTypeEsc} →
                </a>
              </div>
            </div>

            <div style='background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;'>
              <p style='margin: 0 0 8px 0;'>You are receiving this update because you subscribed on the official website of Rakeshwar Pandey.</p>
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

/**
 * 5. Email Verification Link Dispatcher:
 * Sends an email with a secure verification button to block junk/bot submissions.
 *
 * @param string $toEmail
 * @param string $toName
 * @param string $verifyUrl
 * @param string $actionType   'contact' | 'subscriber' | 'visitor'
 * @param array  $details      Optional details to display in the email
 */
function send_verification_email(string $toEmail, string $toName, string $verifyUrl, string $actionType, array $details = []): bool {
    $toNameEsc = htmlspecialchars($toName ?: 'there', ENT_QUOTES, 'UTF-8');
    $verifyUrlEsc = htmlspecialchars($verifyUrl, ENT_QUOTES, 'UTF-8');

    switch ($actionType) {
        case 'contact':
            $subject = 'Confirm your message to Rakeshwar Pandey';
            $badgeText = 'MESSAGE VERIFICATION';
            $heading = 'Confirm Your Message';
            $buttonText = 'Verify & Send Message →';
            $desc = 'Thank you for reaching out through the official website. To protect against automated spam and ensure your message reaches Rakeshwar Pandey’s office, please confirm your email address by clicking the button below.';
            break;
        case 'visitor':
            $subject = 'Confirm your visitor profile — Rakeshwar Pandey';
            $badgeText = 'VISITOR VERIFICATION';
            $heading = 'Confirm Your Profile';
            $buttonText = 'Confirm Profile →';
            $desc = 'Thank you for registering on the official portal of Rakeshwar Pandey. Please verify your email address to complete your visitor registration.';
            break;
        case 'subscriber':
        default:
            $subject = 'Confirm your newsletter subscription — Rakeshwar Pandey';
            $badgeText = 'NEWSLETTER SUBSCRIPTION';
            $heading = 'Confirm Your Subscription';
            $buttonText = 'Confirm Subscription →';
            $desc = 'Thank you for joining our updates list. To ensure you requested this subscription, please verify your email address by clicking the button below.';
            break;
    }

    $detailsHtml = '';
    if (!empty($details['subject'])) {
        $subjectPreview = htmlspecialchars($details['subject'], ENT_QUOTES, 'UTF-8');
        $detailsHtml .= "<p style='margin: 12px 0 0 0; font-size: 13px; color: #64748b;'><strong>Topic / Subject:</strong> {$subjectPreview}</p>";
    }

    $htmlBody = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='utf-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>{$subject}</title>
    </head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 32px 16px; color: #1e293b;'>
      <div style='max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.25);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #FF9933;'>
          <h2 style='margin: 0; font-size: 22px; font-weight: 800; color: #FF9933; letter-spacing: 0.5px;'>RAKESHWAR PANDEY</h2>
          <p style='margin: 4px 0 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase;'>President — INTUC Jharkhand | Official Portal</p>
        </div>

        <!-- Content Body -->
        <div style='padding: 36px 30px;'>
          <div style='text-align: center; margin-bottom: 24px;'>
            <span style='display: inline-block; background: #fff7ed; color: #c2410c; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #ffedd5;'>
              {$badgeText}
            </span>
            <h1 style='font-size: 24px; font-weight: 800; color: #0f172a; margin: 16px 0 8px 0;'>
              {$heading}
            </h1>
            <p style='font-size: 15px; color: #475569; line-height: 1.6; margin: 0;'>
              Hello {$toNameEsc},
            </p>
          </div>

          <p style='font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 24px 0; text-align: center;'>
            {$desc}
          </p>

          {$detailsHtml}

          <!-- Verification CTA Button -->
          <div style='text-align: center; margin: 32px 0;'>
            <a href='{$verifyUrlEsc}' style='background: linear-gradient(135deg, #FF9933 0%, #e65100 100%); color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 153, 51, 0.4);'>
              {$buttonText}
            </a>
          </div>

          <!-- Fallback Link -->
          <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 24px 0 16px 0; font-size: 12px; color: #64748b; word-break: break-all;'>
            <p style='margin: 0 0 6px 0; font-weight: 600; color: #475569;'>Button not working? Copy and paste this link into your browser:</p>
            <a href='{$verifyUrlEsc}' style='color: #0284c7; text-decoration: underline;'>{$verifyUrlEsc}</a>
          </div>

          <p style='font-size: 12px; color: #94a3b8; text-align: center; margin: 20px 0 0 0;'>
            ⏱️ This verification link is valid for <strong>24 hours</strong>. If you did not make this submission, no action is needed and this request will expire automatically.
          </p>
        </div>

        <!-- Footer -->
        <div style='background: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;'>
          <p style='margin: 0;'>Official Website of Rakeshwar Pandey • INTUC Central Office, Jamshedpur</p>
        </div>

      </div>
    </body>
    </html>
    ";

    return send_html_email($toEmail, $toName, $subject, $htmlBody);
}


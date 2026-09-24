<?php
/**
 * helpers/mail.php — Centralized email dispatch, HTML email templates, and subscriber broadcasting.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

/**
 * Send an HTML reply email to a visitor who submitted a contact form.
 */
function send_reply_email(string $toEmail, string $toName, string $originalSubject, string $replyBody): bool {
    $toNameEsc  = htmlspecialchars($toName ?: 'Valued Visitor', ENT_QUOTES, 'UTF-8');
    $subjectEsc = htmlspecialchars($originalSubject ?: 'Your message to ' . APP_NAME, ENT_QUOTES, 'UTF-8');
    $replyHtml  = nl2br(htmlspecialchars($replyBody, ENT_QUOTES, 'UTF-8'));
    $subject    = 'Re: ' . ($originalSubject ?: 'Your message to ' . APP_NAME);

    $fromEmail  = (defined('SMTP_USER') && filter_var(SMTP_USER, FILTER_VALIDATE_EMAIL)) ? SMTP_USER : ('noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $replyTo    = (defined('CONTACT_NOTIFY_EMAIL') && filter_var(CONTACT_NOTIFY_EMAIL, FILTER_VALIDATE_EMAIL)) ? CONTACT_NOTIFY_EMAIL : $fromEmail;

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

    $toFormatted = "$toNameEsc <$toEmail>";
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Rakeshwar Pandey <{$fromEmail}>\r\n";
    $headers .= "Reply-To: {$replyTo}\r\n";
    $headers .= "X-Mailer: PHP/" . PHP_VERSION;

    return @mail($toEmail, $subject, $htmlBody, $headers);
}

/**
 * Broadcast an HTML update email to all active subscribers.
 *
 * @param PDO    $db       Database connection
 * @param string $title    Title of the blog, news, or timeline post
 * @param string $summary  Brief description/summary
 * @param string $link     Direct URL link to view the post
 * @param string $postType 'Blog Post', 'News Article', 'Timeline Event'
 * @return array{sent: int, total: int}
 */
function broadcast_email_to_subscribers(PDO $db, string $title, string $summary, string $link, string $postType = 'Update'): array {
    // Fetch active subscribers who have a valid email address
    $stmt = $db->query("SELECT id, name, email FROM subscriptions WHERE (status = 'active' OR status IS NULL) AND email IS NOT NULL AND email != ''");
    $subscribers = $stmt->fetchAll();

    if (empty($subscribers)) {
        return ['sent' => 0, 'total' => 0];
    }

    $sentCount = 0;
    $total = count($subscribers);
    $siteUrl = defined('APP_URL') ? APP_URL : (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost:5173');

    $fromEmail = (defined('SMTP_USER') && filter_var(SMTP_USER, FILTER_VALIDATE_EMAIL)) ? SMTP_USER : ('noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $replyTo   = (defined('CONTACT_NOTIFY_EMAIL') && filter_var(CONTACT_NOTIFY_EMAIL, FILTER_VALIDATE_EMAIL)) ? CONTACT_NOTIFY_EMAIL : $fromEmail;

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

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Rakeshwar Pandey <{$fromEmail}>\r\n";
        $headers .= "Reply-To: {$replyTo}\r\n";
        $headers .= "List-Unsubscribe: <{$unsubUrl}>\r\n";
        $headers .= "X-Mailer: PHP/" . PHP_VERSION;

        if (@mail($toEmail, $subject, $htmlBody, $headers)) {
            $sentCount++;
        }
    }

    // Record notification for admin dashboard
    $db->prepare(
        "INSERT INTO notifications (type, post_id, item_id, message) VALUES ('broadcast', NULL, NULL, ?)"
    )->execute(["Broadcast sent for '{$title}': {$sentCount}/{$total} emails delivered."]);

    return ['sent' => $sentCount, 'total' => $total];
}

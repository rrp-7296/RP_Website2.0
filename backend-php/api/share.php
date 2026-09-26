<?php
/**
 * share.php — Server-Side Open Graph (OG) Social Share Gateway.
 * Generates rich HTML preview cards with Title, Excerpt, and Image for WhatsApp, Twitter, Facebook, & LinkedIn.
 * 
 * Usage: https://rakeshwarpandey.com/api/share.php?type=blog&id=12
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/db.php';

$type = strtolower($_GET['type'] ?? 'blog');
$id   = (int) ($_GET['id'] ?? 0);

$siteName = defined('APP_NAME') ? APP_NAME : 'Rakeshwar Pandey Portfolio';
$baseUrl  = defined('APP_URL')  ? APP_URL  : 'https://rakeshwarpandey.com';
$baseUrl  = rtrim($baseUrl, '/');

// Defaults
$title       = "Rakeshwar Pandey — Official Website & Updates";
$description = "Trade Union Leader, President INTUC Jharkhand & Labor Welfare Association.";
$image       = $baseUrl . "/assets/og-default.jpg";
$targetUrl   = $baseUrl . "/#/";

if ($id > 0) {
    try {
        $db = get_db();

        if ($type === 'blog') {
            $stmt = $db->prepare("SELECT title, description, main_body, image FROM blog_posts WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            if ($post = $stmt->fetch()) {
                $title       = $post['title'] . " — " . $siteName;
                $rawDesc     = $post['description'] ?: $post['main_body'];
                $description = mb_substr(strip_tags($rawDesc), 0, 200) . "...";
                if (!empty($post['image'])) {
                    $image = str_starts_with($post['image'], 'http') 
                        ? $post['image'] 
                        : $baseUrl . "/uploads/" . ltrim($post['image'], '/');
                }
                $targetUrl = $baseUrl . "/#/blog/" . $id;
            }
        } elseif ($type === 'news') {
            $stmt = $db->prepare("SELECT title, text, image FROM news_items WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            if ($item = $stmt->fetch()) {
                $title       = $item['title'] . " — Latest News";
                $description = mb_substr(strip_tags($item['text']), 0, 200) . "...";
                if (!empty($item['image'])) {
                    $image = str_starts_with($item['image'], 'http') 
                        ? $item['image'] 
                        : $baseUrl . "/uploads/" . ltrim($item['image'], '/');
                }
                $targetUrl = $baseUrl . "/#/news";
            }
        } elseif ($type === 'timeline') {
            $stmt = $db->prepare("SELECT text, location, image FROM timeline_events WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            if ($ev = $stmt->fetch()) {
                $title       = "Journey Milestone — " . $siteName;
                $description = mb_substr(strip_tags($ev['text']), 0, 200) . ($ev['location'] ? " ({$ev['location']})" : "");
                if (!empty($ev['image'])) {
                    $image = str_starts_with($ev['image'], 'http') 
                        ? $ev['image'] 
                        : $baseUrl . "/uploads/" . ltrim($ev['image'], '/');
                }
                $targetUrl = $baseUrl . "/#/timeline";
            }
        }
    } catch (Exception $e) {
        // Fall back to defaults on DB error
    }
}

$shareUrl = $baseUrl . "/api/share.php?type=" . urlencode($type) . "&id=" . $id;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
    
    <!-- Standard Meta -->
    <meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="author" content="Rakeshwar Pandey">

    <!-- Open Graph / WhatsApp / Facebook / LinkedIn -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="<?= htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:secure_url" content="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:url" content="<?= htmlspecialchars($shareUrl, ENT_QUOTES, 'UTF-8') ?>">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($image, ENT_QUOTES, 'UTF-8') ?>">

    <!-- Fast Client Redirect for Real Visitors -->
    <script>
        window.location.replace("<?= $targetUrl ?>");
    </script>
    <meta http-equiv="refresh" content="0;url=<?= $targetUrl ?>">
    
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 20px; }
        .card { background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #ff9933; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h2 { color: #ff9933; margin-top: 0; font-size: 1.25rem; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
        a { display: inline-block; margin-top: 16px; color: #ffffff; background: #ff9933; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Opening Update...</h2>
        <p><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></p>
        <a href="<?= $targetUrl ?>">Click here if not redirected automatically</a>
    </div>
</body>
</html>

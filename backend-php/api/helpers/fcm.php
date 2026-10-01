<?php
/**
 * helpers/fcm.php — Firebase Cloud Messaging (FCM) Push Notifications Helper.
 * Sends native push notifications to registered admin Android devices even when app is closed.
 *
 * IMPORTANT: For background notifications to work, the file
 * 'firebase-service-account.json' MUST be uploaded to the server
 * in one of these locations:
 *   - api/firebase-service-account.json
 *   - api/config/firebase-service-account.json
 *   - public_html/firebase-service-account.json
 */

/**
 * Debug logger for FCM — writes to a log file so we can troubleshoot push delivery.
 */
function fcm_log(string $message): void {
    if (!defined('DEBUG') || !DEBUG) return;
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
    $logFile = $logDir . '/fcm_debug.log';
    $timestamp = date('Y-m-d H:i:s');
    @file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

function broadcast_fcm_notification(string $title, string $message, array $extraData = []): void {
    try {
        $db = get_db();
        $stmt = $db->query('SELECT fcm_token FROM admin_fcm_tokens');
        $tokens = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($tokens)) {
            fcm_log("No FCM tokens registered — skipping push.");
            return;
        }

        fcm_log("Found " . count($tokens) . " FCM token(s) to notify.");

        // Check where firebase-service-account.json is located (api/, api/config/, or public_html/)
        $possiblePaths = [
            __DIR__ . '/../firebase-service-account.json',
            __DIR__ . '/../config/firebase-service-account.json',
            __DIR__ . '/../../firebase-service-account.json',
        ];

        $serviceAccountPath = null;
        foreach ($possiblePaths as $p) {
            if (file_exists($p)) {
                $serviceAccountPath = $p;
                break;
            }
        }

        if (!$serviceAccountPath) {
            fcm_log("ERROR: firebase-service-account.json NOT FOUND on server! Checked: " . implode(', ', $possiblePaths));
            fcm_log("Upload firebase-service-account.json to the server via cPanel File Manager.");
            return;
        }

        fcm_log("Using service account: $serviceAccountPath");

        $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
        if (!$serviceAccount || empty($serviceAccount['project_id']) || empty($serviceAccount['private_key'])) {
            fcm_log("ERROR: firebase-service-account.json is invalid or missing project_id/private_key.");
            return;
        }

        $accessToken = get_fcm_oauth_token($serviceAccount);
        if (!$accessToken) {
            fcm_log("ERROR: Failed to get FCM OAuth2 access token. Check private_key and client_email in service account JSON.");
            return;
        }

        fcm_log("OAuth2 token obtained successfully for project: " . $serviceAccount['project_id']);

        $projectId = $serviceAccount['project_id'];
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $successCount = 0;
        $failCount = 0;

        foreach ($tokens as $fcmToken) {
            if (empty($fcmToken)) continue;

            // Build FCM v1 payload with both notification (for background display)
            // and data (for foreground handling).
            // CRITICAL: The 'notification' key is what makes Android display the
            // notification automatically when the app is closed/in background.
            // Format extra data to ensure all values are strings (required by FCM HTTP v1 spec)
            $dataPayload = [
                'title'   => (string) $title,
                'message' => (string) $message,
            ];
            foreach ($extraData as $k => $v) {
                $dataPayload[(string) $k] = is_array($v) ? json_encode($v) : (string) $v;
            }

            // Build FCM v1 payload compliant with Android system notification manager
            $payload = [
                'message' => [
                    'token' => $fcmToken,
                    'notification' => [
                        'title' => $title,
                        'body'  => mb_substr($message, 0, 200),
                    ],
                    'android' => [
                        'priority' => 'HIGH',
                        'notification' => [
                            'sound' => 'default',
                            'channel_id' => 'admin_alerts',
                            'default_sound' => true,
                            'default_vibrate_timings' => true,
                            'notification_priority' => 'PRIORITY_MAX',
                            'visibility' => 'PUBLIC',
                        ]
                    ],
                    'data' => $dataPayload
                ]
            ];

            $resp = send_http_request($url, json_encode($payload), [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json'
            ]);

            if ($resp) {
                $respData = json_decode($resp, true);
                if (isset($respData['name'])) {
                    $successCount++;
                    fcm_log("SUCCESS: Sent to token " . substr($fcmToken, 0, 20) . "... — Message ID: " . $respData['name']);
                } else {
                    $failCount++;
                    fcm_log("FAILED: Token " . substr($fcmToken, 0, 20) . "... — Response: $resp");

                    // If token is invalid/unregistered, clean it up
                    if (isset($respData['error']['details'])) {
                        foreach ($respData['error']['details'] as $detail) {
                            if (isset($detail['errorCode']) && in_array($detail['errorCode'], ['UNREGISTERED', 'INVALID_ARGUMENT'])) {
                                $db->prepare('DELETE FROM admin_fcm_tokens WHERE fcm_token = ?')->execute([$fcmToken]);
                                fcm_log("Removed invalid/unregistered token: " . substr($fcmToken, 0, 20) . "...");
                            }
                        }
                    }
                }
            } else {
                $failCount++;
                fcm_log("FAILED: No response from FCM API for token " . substr($fcmToken, 0, 20) . "...");
            }
        }

        fcm_log("Push broadcast complete: $successCount success, $failCount failed out of " . count($tokens) . " tokens.");

    } catch (Throwable $e) {
        fcm_log("EXCEPTION in broadcast_fcm_notification: " . $e->getMessage());
    }
}

/**
 * Generate OAuth2 Access Token for Firebase Cloud Messaging HTTP v1 API
 */
function get_fcm_oauth_token(array $serviceAccount): ?string {
    $now = time();
    $header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claim = base64url_encode(json_encode([
        'iss'   => $serviceAccount['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'exp'   => $now + 3600,
        'iat'   => $now
    ]));

    $key = $serviceAccount['private_key'];
    $signature = '';
    if (!openssl_sign("$header.$claim", $signature, $key, 'SHA256')) {
        fcm_log("ERROR: openssl_sign failed — check private_key format.");
        return null;
    }

    $jwt = "$header.$claim." . base64url_encode($signature);

    $postFields = http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt
    ]);

    $resp = send_http_request('https://oauth2.googleapis.com/token', $postFields, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    if (!$resp) {
        fcm_log("ERROR: OAuth2 token request returned empty response.");
        return null;
    }

    $data = json_decode($resp, true);
    if (isset($data['error'])) {
        fcm_log("ERROR: OAuth2 token error: " . ($data['error_description'] ?? $data['error']));
        return null;
    }

    return $data['access_token'] ?? null;
}

function send_http_request(string $url, string $body, array $headers): ?string {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        fcm_log("CURL ERROR ($httpCode): $curlError");
    }

    return $result ?: null;
}

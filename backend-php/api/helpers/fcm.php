<?php
/**
 * helpers/fcm.php — Firebase Cloud Messaging (FCM) Push Notifications Helper.
 * Sends native push notifications to registered admin Android devices even when app is closed.
 */

function broadcast_fcm_notification(string $title, string $message, array $extraData = []): void {
    try {
        $db = get_db();
        $stmt = $db->query('SELECT fcm_token FROM admin_fcm_tokens');
        $tokens = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($tokens)) {
            return;
        }

        // Check if firebase-service-account.json exists in public_html/api/config/
        $serviceAccountPath = __DIR__ . '/../config/firebase-service-account.json';
        if (!file_exists($serviceAccountPath)) {
            // Service account JSON not uploaded yet
            return;
        }

        $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
        if (!$serviceAccount || empty($serviceAccount['project_id']) || empty($serviceAccount['private_key'])) {
            return;
        }

        $accessToken = get_fcm_oauth_token($serviceAccount);
        if (!$accessToken) {
            return;
        }

        $projectId = $serviceAccount['project_id'];
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        foreach ($tokens as $fcmToken) {
            if (empty($fcmToken)) continue;

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
                            'click_action' => 'TOP_STORY_ACTIVITY',
                            'channel_id' => 'admin_alerts',
                        ]
                    ],
                    'data' => array_merge(['title' => $title, 'message' => $message], $extraData)
                ]
            ];

            send_http_request($url, json_encode($payload), [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json'
            ]);
        }
    } catch (Throwable $e) {
        // Suppress push errors to prevent interrupting user web flow
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

    if (!$resp) return null;
    $data = json_decode($resp, true);
    return $data['access_token'] ?? null;
}

function send_http_request(string $url, string $body, array $headers): ?string {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result ?: null;
}

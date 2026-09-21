<?php
/**
 * helpers/response.php — JSON response helpers and CORS headers.
 */

function set_cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = defined('CORS_ORIGINS') ? CORS_ORIGINS : [];

    if (in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

function set_json_headers(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
}

/**
 * @param mixed $data
 */
function json_success($data, int $status = 200): void {
    http_response_code($status);
    set_json_headers();
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $detail, int $status = 400): void {
    http_response_code($status);
    set_json_headers();
    echo json_encode(['detail' => $detail]);
    exit;
}

function json_message(string $message, bool $success = true, int $status = 200): void {
    http_response_code($status);
    set_json_headers();
    echo json_encode(['message' => $message, 'success' => $success]);
    exit;
}

/**
 * Parse JSON request body, or form data for multipart requests.
 * Returns an array.
 */
function get_body(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
    return $_POST;
}

/**
 * Get a required field from $data, or abort with 422.
 * @return mixed
 */
function require_field(array $data, string $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        json_error("Field '$field' is required", 422);
    }
    return $data[$field];
}

/**
 * Get an optional field with a default.
 * @param mixed $default
 * @return mixed
 */
function optional_field(array $data, string $field, $default = null) {
    return isset($data[$field]) && $data[$field] !== '' ? $data[$field] : $default;
}


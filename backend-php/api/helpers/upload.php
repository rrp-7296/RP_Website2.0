<?php
/**
 * helpers/upload.php — File upload handler with GD image resizing.
 */

/**
 * Handle a file upload from $_FILES.
 *
 * @param string $fileKey  Key in $_FILES (e.g. 'image')
 * @param string $category Subdirectory: 'blog', 'gallery', 'news', 'timeline'
 * @return string|null     The saved filename (uuid.ext), or null if no file uploaded
 */
function save_upload(string $fileKey, string $category): ?string {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $file = $_FILES[$fileKey];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_error('File upload error: ' . upload_error_message($file['error']), 400);
    }

    // Validate file size
    $maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        json_error("File exceeds maximum size of " . MAX_UPLOAD_MB . "MB", 400);
    }

    // Validate MIME type
    $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowedMimes, true)) {
        json_error("Invalid file type: $mime. Allowed: jpg, png, gif, webp", 400);
    }

    // Determine extension
    $extMap = [
        'image/jpeg' => 'jpg', 'image/jpg' => 'jpg',
        'image/png'  => 'png', 'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];
    $ext = $extMap[$mime] ?? 'jpg';

    // Generate unique filename
    $filename = bin2hex(random_bytes(16)) . '.' . $ext;

    // Ensure destination directory exists
    $destDir = UPLOAD_DIR . '/' . $category;
    if (!is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }

    $destPath = $destDir . '/' . $filename;

    // Resize and save using GD (if available), otherwise just move
    if (extension_loaded('gd') && in_array($mime, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])) {
        resize_and_save($file['tmp_name'], $destPath, $mime, MAX_IMAGE_WIDTH);
    } else {
        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            json_error('Failed to save uploaded file.', 500);
        }
    }

    return $filename;
}

/**
 * Delete an uploaded file.
 */
function delete_upload(string $filename, string $category): void {
    $path = UPLOAD_DIR . '/' . $category . '/' . $filename;
    if (file_exists($path)) {
        @unlink($path);
    }
}

/**
 * Resize an image to a max width, preserving aspect ratio.
 */
function resize_and_save(string $srcPath, string $destPath, string $mime, int $maxWidth): void {
    [$origW, $origH] = getimagesize($srcPath);

    if ($origW <= $maxWidth) {
        // No resize needed, just copy
        copy($srcPath, $destPath);
        return;
    }

    $ratio  = $maxWidth / $origW;
    $newW   = $maxWidth;
    $newH   = (int) ($origH * $ratio);

    if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
        $src = imagecreatefromjpeg($srcPath);
    } elseif ($mime === 'image/png') {
        $src = imagecreatefrompng($srcPath);
    } elseif ($mime === 'image/webp') {
        $src = imagecreatefromwebp($srcPath);
    } else {
        $src = null;
    }

    if (!$src) {
        copy($srcPath, $destPath);
        return;
    }

    $dst = imagecreatetruecolor($newW, $newH);

    // Preserve transparency for PNG
    if ($mime === 'image/png') {
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
    }

    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

    if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
        imagejpeg($dst, $destPath, 85);
    } elseif ($mime === 'image/png') {
        imagepng($dst, $destPath, 8);
    } elseif ($mime === 'image/webp') {
        imagewebp($dst, $destPath, 85);
    } else {
        copy($srcPath, $destPath);
    }

    imagedestroy($src);
    imagedestroy($dst);
}

/**
 * Human-readable PHP upload error messages.
 */
function upload_error_message(int $code): string {
    switch ($code) {
        case UPLOAD_ERR_INI_SIZE:   return 'File exceeds server upload_max_filesize';
        case UPLOAD_ERR_FORM_SIZE:  return 'File exceeds form MAX_FILE_SIZE';
        case UPLOAD_ERR_PARTIAL:    return 'File was only partially uploaded';
        case UPLOAD_ERR_NO_TMP_DIR: return 'No temporary folder';
        case UPLOAD_ERR_CANT_WRITE: return 'Failed to write to disk';
        case UPLOAD_ERR_EXTENSION:  return 'Upload blocked by extension';
        default:                    return "Unknown error code $code";
    }
}

<?php
// Videos live on InMotion. Supabase is used only to verify the existing login.
header('Content-Type: application/json');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond($status, $body) {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Use the article Upload button to upload a video.']);
}

$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer ([A-Za-z0-9._-]+)$/', $authorization, $matches)) {
    respond(401, ['error' => 'Please sign in before uploading a video.']);
}

$configPath = __DIR__ . '/upload-config.php';
if (!is_file($configPath) || !function_exists('curl_init')) {
    respond(503, ['error' => 'Video uploads are not configured on the server yet.']);
}
$config = require $configPath;
$auth = curl_init($config['url'] . '/auth/v1/user');
curl_setopt_array($auth, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'apikey: ' . $config['key'],
        'Authorization: Bearer ' . $matches[1],
    ],
]);
$authBody = curl_exec($auth);
$authStatus = curl_getinfo($auth, CURLINFO_HTTP_CODE);
curl_close($auth);
if ($authStatus === 0 || $authStatus >= 500) {
    respond(503, ['error' => 'Could not verify your login. Please try again.']);
}
$user = json_decode($authBody ?: '{}', true);
if ($authStatus !== 200 || empty($user['id']) || !empty($user['is_anonymous'])) {
    respond(401, ['error' => 'Your login has expired. Please sign in again.']);
}

$file = $_FILES['video'] ?? null;
if (!$file || !isset($file['error']) || is_array($file['error'])) {
    respond(400, ['error' => 'No video received. The file may exceed the server upload limit.']);
}
if ($file['error'] !== UPLOAD_ERR_OK) {
    respond(400, ['error' => 'Video upload failed. Please choose a file up to 50MB and try again.']);
}
if ($file['size'] <= 0 || $file['size'] > 50 * 1024 * 1024 || !is_uploaded_file($file['tmp_name'])) {
    respond(413, ['error' => 'Please choose a video up to 50MB.']);
}
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$extensions = [
    'video/mp4' => 'mp4',
    'video/webm' => 'webm',
    'video/ogg' => 'ogv',
    'application/ogg' => 'ogv',
    'video/quicktime' => 'mov',
];
if (!isset($extensions[$mime])) {
    respond(415, ['error' => 'This file is not a supported MP4, WebM, Ogg, or MOV video.']);
}

$directory = dirname(__DIR__) . '/videos';
if (!is_dir($directory) || !is_writable($directory)) {
    respond(503, ['error' => 'The video folder is not writable. Please contact the site administrator.']);
}
$name = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) {
    respond(500, ['error' => 'Could not save the video. Please try again.']);
}
chmod($directory . '/' . $name, 0644);
respond(201, ['url' => '/videos/' . $name]);

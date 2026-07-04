<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

$storageDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage';
$commentsFile = $storageDirectory . DIRECTORY_SEPARATOR . 'comments.json';
$rateLimitFile = $storageDirectory . DIRECTORY_SEPARATOR . 'comment-rate.json';

function respond(int $status, array $payload): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $expectsJson = strpos($accept, 'application/json') !== false
        || strpos($contentType, 'application/json') !== false;

    if ($method === 'POST' && !$expectsJson) {
        $result = !empty($payload['ok']) ? 'submitted' : 'error';
        header("Location: /?comment={$result}#comments", true, 303);
        exit;
    }

    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function clean_text($value): string
{
    if (!is_string($value)) {
        return '';
    }

    $value = strip_tags($value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    $value = preg_replace('/\s+/u', ' ', trim($value)) ?? '';
    return $value;
}

function read_json_file(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $contents = file_get_contents($path);
    if ($contents === false || trim($contents) === '') {
        return [];
    }

    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : [];
}

function update_json_file(string $path, callable $mutator): array
{
    $handle = fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        respond(503, ['ok' => false, 'message' => 'ذخیره نظر موقتاً در دسترس نیست.']);
    }

    rewind($handle);
    $contents = stream_get_contents($handle);
    $data = is_string($contents) && trim($contents) !== '' ? json_decode($contents, true) : [];
    if (!is_array($data)) {
        $data = [];
    }

    $updated = $mutator($data);
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($updated, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $updated;
}

if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0750, true) && !is_dir($storageDirectory)) {
    respond(503, ['ok' => false, 'message' => 'فضای ذخیره نظر آماده نیست.']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $comments = array_values(array_filter(
        read_json_file($commentsFile),
        static fn($comment): bool => is_array($comment) && ($comment['status'] ?? '') === 'approved'
    ));

    usort($comments, static fn(array $first, array $second): int =>
        strcmp((string) ($second['createdAt'] ?? ''), (string) ($first['createdAt'] ?? ''))
    );

    $publicComments = array_map(static fn(array $comment): array => [
        'name' => (string) ($comment['name'] ?? ''),
        'city' => (string) ($comment['city'] ?? ''),
        'message' => (string) ($comment['message'] ?? ''),
        'createdAt' => (string) ($comment['createdAt'] ?? '')
    ], array_slice($comments, 0, 12));

    respond(200, ['ok' => true, 'comments' => $publicComments]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['ok' => false, 'message' => 'روش درخواست پشتیبانی نمی‌شود.']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$payload = strpos($contentType, 'application/json') !== false
    ? json_decode(file_get_contents('php://input') ?: '{}', true)
    : $_POST;

if (!is_array($payload)) {
    respond(400, ['ok' => false, 'message' => 'اطلاعات فرم معتبر نیست.']);
}

if (clean_text($payload['website'] ?? '') !== '') {
    respond(202, ['ok' => true, 'message' => 'نظر شما دریافت شد و پس از بررسی منتشر می‌شود.']);
}

$startedAt = (int) ($payload['startedAt'] ?? 0);
$elapsed = (int) floor(microtime(true) * 1000) - $startedAt;
if ($startedAt <= 0 || $elapsed < 2500 || $elapsed > 86400000) {
    respond(400, ['ok' => false, 'message' => 'لطفاً فرم را دوباره باز و با دقت تکمیل کنید.']);
}

$name = clean_text($payload['name'] ?? '');
$city = clean_text($payload['city'] ?? '');
$message = clean_text($payload['message'] ?? '');
$consent = filter_var($payload['consent'] ?? false, FILTER_VALIDATE_BOOLEAN);

if (text_length($name) < 2 || text_length($name) > 60) {
    respond(422, ['ok' => false, 'field' => 'name', 'message' => 'نام باید بین ۲ تا ۶۰ نویسه باشد.']);
}
if ($city !== '' && (text_length($city) < 2 || text_length($city) > 50)) {
    respond(422, ['ok' => false, 'field' => 'city', 'message' => 'نام شهر یا محله معتبر نیست.']);
}
if (text_length($message) < 12 || text_length($message) > 600) {
    respond(422, ['ok' => false, 'field' => 'message', 'message' => 'متن نظر باید بین ۱۲ تا ۶۰۰ نویسه باشد.']);
}
if (!$consent) {
    respond(422, ['ok' => false, 'field' => 'consent', 'message' => 'برای انتشار نظر باید رضایت خود را تأیید کنید.']);
}

$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$visitorKey = hash_hmac('sha256', $ipAddress, 'deposazegar-public-comments-v1');
$now = time();
$rateLimited = false;

update_json_file($rateLimitFile, static function (array $limits) use ($visitorKey, $now, &$rateLimited): array {
    $limits = array_filter($limits, static fn($timestamp): bool => is_int($timestamp) && $timestamp > $now - 86400);
    $lastSubmission = (int) ($limits[$visitorKey] ?? 0);
    if ($lastSubmission > $now - 600) {
        $rateLimited = true;
        return $limits;
    }
    $limits[$visitorKey] = $now;
    return $limits;
});

if ($rateLimited) {
    respond(429, ['ok' => false, 'message' => 'نظر شما دریافت شده است؛ برای ارسال نظر بعدی کمی صبر کنید.']);
}

$comment = [
    'id' => bin2hex(random_bytes(8)),
    'name' => $name,
    'city' => $city,
    'message' => $message,
    'createdAt' => gmdate('c'),
    'status' => 'pending'
];

update_json_file($commentsFile, static function (array $comments) use ($comment): array {
    $comments[] = $comment;
    return array_slice($comments, -500);
});

respond(202, ['ok' => true, 'message' => 'نظر شما دریافت شد و پس از بررسی مدیر منتشر می‌شود.']);

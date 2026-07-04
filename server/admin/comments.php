<?php
declare(strict_types=1);

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
ini_set('session.use_strict_mode', '1');
session_name('deposazegar_comment_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/admin',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'self'; style-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");

$storageDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage';
$commentsFile = $storageDirectory . DIRECTORY_SEPARATOR . 'comments.json';
$adminFile = $storageDirectory . DIRECTORY_SEPARATOR . 'admin.json';
$setupTokenFile = $storageDirectory . DIRECTORY_SEPARATOR . '.admin-setup-token';
$loginRateFile = $storageDirectory . DIRECTORY_SEPARATOR . 'admin-login-rate.json';

function admin_escape($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function admin_read_json(string $path): array
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

function admin_update_json(string $path, callable $mutator): array
{
    $handle = fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        throw new RuntimeException('امکان نوشتن در فضای ذخیره‌سازی وجود ندارد.');
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

function admin_write_json(string $path, array $data): void
{
    admin_update_json($path, static fn(array $current): array => $data);
}

function admin_csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return (string) $_SESSION['csrf'];
}

function admin_valid_csrf(): bool
{
    $provided = isset($_POST['csrf']) ? (string) $_POST['csrf'] : '';
    return $provided !== '' && hash_equals(admin_csrf_token(), $provided);
}

function admin_flash(string $message, string $state = 'success'): void
{
    $_SESSION['flash'] = ['message' => $message, 'state' => $state];
}

function admin_redirect(string $query = ''): void
{
    header('Location: comments.php' . $query, true, 303);
    exit;
}

function admin_text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function admin_format_date(string $date): string
{
    $timestamp = strtotime($date);
    return $timestamp ? date('Y/m/d - H:i', $timestamp) : 'بدون تاریخ';
}

if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0750, true) && !is_dir($storageDirectory)) {
    http_response_code(503);
    exit('پوشه ذخیره‌سازی قابل ایجاد نیست.');
}

$csrf = admin_csrf_token();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = isset($_POST['action']) ? (string) $_POST['action'] : '';
$setupError = '';
$loginError = '';
$adminConfig = admin_read_json($adminFile);
$isConfigured = !empty($adminConfig['username']) && !empty($adminConfig['passwordHash']);

if (!$isConfigured && $method === 'POST' && $action === 'setup') {
    if (!admin_valid_csrf()) {
        $setupError = 'نشست منقضی شده است؛ صفحه را تازه‌سازی کنید.';
    } else {
        $setupToken = trim((string) ($_POST['setupToken'] ?? ''));
        $expectedToken = is_file($setupTokenFile) ? trim((string) file_get_contents($setupTokenFile)) : '';
        $username = trim((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $passwordConfirm = (string) ($_POST['passwordConfirm'] ?? '');

        if ($expectedToken === '' || !hash_equals($expectedToken, $setupToken)) {
            $setupError = 'کد راه‌اندازی صحیح نیست.';
        } elseif (!preg_match('/^[\p{L}\p{N}_.-]{3,40}$/u', $username)) {
            $setupError = 'نام کاربری باید ۳ تا ۴۰ نویسه و بدون فاصله باشد.';
        } elseif (admin_text_length($password) < 12) {
            $setupError = 'رمز عبور باید حداقل ۱۲ نویسه باشد.';
        } elseif ($password !== $passwordConfirm) {
            $setupError = 'تکرار رمز عبور یکسان نیست.';
        } else {
            try {
                admin_write_json($adminFile, [
                    'username' => $username,
                    'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
                    'createdAt' => gmdate('c'),
                    'updatedAt' => gmdate('c')
                ]);
                if (is_file($setupTokenFile)) {
                    unlink($setupTokenFile);
                }
                session_regenerate_id(true);
                $_SESSION['admin_authenticated'] = true;
                $_SESSION['admin_username'] = $username;
                admin_flash('حساب مدیر ساخته شد. پنل مدیریت آماده است.');
                admin_redirect();
            } catch (Throwable $error) {
                $setupError = $error->getMessage();
            }
        }
    }
}

if ($isConfigured && $method === 'POST' && $action === 'login') {
    if (!admin_valid_csrf()) {
        $loginError = 'نشست منقضی شده است؛ صفحه را تازه‌سازی کنید.';
    } else {
        $now = time();
        $visitorKey = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', 'deposazegar-admin-login-v1');
        $rateLimits = admin_read_json($loginRateFile);
        $entry = isset($rateLimits[$visitorKey]) && is_array($rateLimits[$visitorKey]) ? $rateLimits[$visitorKey] : [];
        $blockedUntil = (int) ($entry['blockedUntil'] ?? 0);

        if ($blockedUntil > $now) {
            $loginError = 'تلاش‌های ناموفق زیاد بوده است؛ ۱۵ دقیقه بعد دوباره امتحان کنید.';
        } else {
            $username = trim((string) ($_POST['username'] ?? ''));
            $password = (string) ($_POST['password'] ?? '');
            $validLogin = hash_equals((string) $adminConfig['username'], $username)
                && password_verify($password, (string) $adminConfig['passwordHash']);

            if ($validLogin) {
                admin_update_json($loginRateFile, static function (array $limits) use ($visitorKey): array {
                    unset($limits[$visitorKey]);
                    return $limits;
                });
                if (password_needs_rehash((string) $adminConfig['passwordHash'], PASSWORD_DEFAULT)) {
                    $adminConfig['passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
                    $adminConfig['updatedAt'] = gmdate('c');
                    admin_write_json($adminFile, $adminConfig);
                }
                session_regenerate_id(true);
                $_SESSION['admin_authenticated'] = true;
                $_SESSION['admin_username'] = $username;
                admin_flash('خوش آمدید؛ نظرهای در انتظار بررسی نمایش داده شدند.');
                admin_redirect();
            } else {
                admin_update_json($loginRateFile, static function (array $limits) use ($visitorKey, $now): array {
                    $current = isset($limits[$visitorKey]) && is_array($limits[$visitorKey]) ? $limits[$visitorKey] : [];
                    $lastAttempt = (int) ($current['lastAttempt'] ?? 0);
                    $attempts = $lastAttempt < $now - 900 ? 0 : (int) ($current['attempts'] ?? 0);
                    $attempts += 1;
                    $limits[$visitorKey] = [
                        'attempts' => $attempts,
                        'lastAttempt' => $now,
                        'blockedUntil' => $attempts >= 5 ? $now + 900 : 0
                    ];
                    return $limits;
                });
                $loginError = 'نام کاربری یا رمز عبور صحیح نیست.';
            }
        }
    }
}

$isAuthenticated = !empty($_SESSION['admin_authenticated']) && $isConfigured;

if ($isAuthenticated && $method === 'POST' && $action === 'logout') {
    if (admin_valid_csrf()) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], '', (bool) $params['secure'], true);
        }
        session_destroy();
    }
    admin_redirect();
}

if ($isAuthenticated && $method === 'POST' && in_array($action, ['approve', 'reject', 'delete'], true)) {
    if (!admin_valid_csrf()) {
        admin_flash('درخواست معتبر نبود؛ دوباره تلاش کنید.', 'error');
        admin_redirect();
    }
    $commentId = (string) ($_POST['commentId'] ?? '');
    try {
        $found = false;
        admin_update_json($commentsFile, static function (array $comments) use ($action, $commentId, &$found): array {
            $updated = [];
            foreach ($comments as $comment) {
                if (!is_array($comment) || ($comment['id'] ?? '') !== $commentId) {
                    $updated[] = $comment;
                    continue;
                }
                $found = true;
                if ($action === 'delete') {
                    continue;
                }
                $comment['status'] = $action === 'approve' ? 'approved' : 'rejected';
                $comment['moderatedAt'] = gmdate('c');
                $updated[] = $comment;
            }
            return $updated;
        });
        admin_flash($found ? ($action === 'approve' ? 'نظر منتشر شد.' : ($action === 'reject' ? 'نظر رد شد.' : 'نظر برای همیشه حذف شد.')) : 'نظر موردنظر پیدا نشد.', $found ? 'success' : 'error');
    } catch (Throwable $error) {
        admin_flash($error->getMessage(), 'error');
    }
    $returnFilter = preg_replace('/[^a-z]/', '', (string) ($_POST['returnFilter'] ?? 'pending')) ?: 'pending';
    admin_redirect('?filter=' . rawurlencode($returnFilter));
}

if ($isAuthenticated && $method === 'POST' && $action === 'change-password') {
    if (!admin_valid_csrf()) {
        admin_flash('درخواست معتبر نبود؛ دوباره تلاش کنید.', 'error');
        admin_redirect();
    }
    $currentPassword = (string) ($_POST['currentPassword'] ?? '');
    $newPassword = (string) ($_POST['newPassword'] ?? '');
    $newPasswordConfirm = (string) ($_POST['newPasswordConfirm'] ?? '');
    if (!password_verify($currentPassword, (string) $adminConfig['passwordHash'])) {
        admin_flash('رمز فعلی صحیح نیست.', 'error');
    } elseif (admin_text_length($newPassword) < 12) {
        admin_flash('رمز جدید باید حداقل ۱۲ نویسه باشد.', 'error');
    } elseif ($newPassword !== $newPasswordConfirm) {
        admin_flash('تکرار رمز جدید یکسان نیست.', 'error');
    } else {
        $adminConfig['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
        $adminConfig['updatedAt'] = gmdate('c');
        admin_write_json($adminFile, $adminConfig);
        session_regenerate_id(true);
        admin_flash('رمز عبور مدیر تغییر کرد.');
    }
    admin_redirect();
}

$flash = isset($_SESSION['flash']) && is_array($_SESSION['flash']) ? $_SESSION['flash'] : null;
unset($_SESSION['flash']);

$comments = $isAuthenticated ? admin_read_json($commentsFile) : [];
$stats = ['all' => 0, 'pending' => 0, 'approved' => 0, 'rejected' => 0];
foreach ($comments as $comment) {
    if (!is_array($comment)) {
        continue;
    }
    $stats['all'] += 1;
    $status = (string) ($comment['status'] ?? 'pending');
    if (isset($stats[$status])) {
        $stats[$status] += 1;
    }
}

$filter = isset($_GET['filter']) ? (string) $_GET['filter'] : 'pending';
if (!array_key_exists($filter, $stats)) {
    $filter = 'pending';
}
$search = trim((string) ($_GET['q'] ?? ''));
$visibleComments = array_values(array_filter($comments, static function ($comment) use ($filter, $search): bool {
    if (!is_array($comment)) {
        return false;
    }
    $statusMatches = $filter === 'all' || ($comment['status'] ?? 'pending') === $filter;
    if (!$statusMatches || $search === '') {
        return $statusMatches;
    }
    $haystack = implode(' ', [(string) ($comment['name'] ?? ''), (string) ($comment['city'] ?? ''), (string) ($comment['message'] ?? '')]);
    return function_exists('mb_stripos') ? mb_stripos($haystack, $search, 0, 'UTF-8') !== false : stripos($haystack, $search) !== false;
}));
usort($visibleComments, static fn(array $first, array $second): int =>
    strcmp((string) ($second['createdAt'] ?? ''), (string) ($first['createdAt'] ?? ''))
);

$statusLabels = ['pending' => 'در انتظار', 'approved' => 'منتشرشده', 'rejected' => 'ردشده'];
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title><?= $isAuthenticated ? 'مدیریت نظرها' : ($isConfigured ? 'ورود مدیر' : 'راه‌اندازی مدیر') ?> | دپو سازگار</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="stylesheet" href="admin.css?v=2">
</head>
<body class="<?= $isAuthenticated ? 'dashboard-page' : 'auth-page' ?>">
<?php if (!$isConfigured): ?>
  <main class="auth-shell">
    <section class="auth-brand">
      <img src="/assets/images/brand-mark.svg" width="512" height="512" alt="">
      <span class="auth-kicker">راه‌اندازی یک‌باره</span>
      <h1>حساب مدیر نظرها را بسازید</h1>
      <p>رمز عبور فقط به‌صورت Hash ذخیره می‌شود. پس از ساخت حساب، کد راه‌اندازی خودکار حذف خواهد شد.</p>
      <ol>
        <li>در File Manager هاست وارد پوشه <code>storage</code> شوید.</li>
        <li>محتوای فایل <code>.admin-setup-token</code> را کپی کنید.</li>
        <li>کد را همراه نام کاربری و رمز دلخواه در فرم وارد کنید.</li>
      </ol>
    </section>
    <section class="auth-card">
      <span class="card-index">01 / Setup</span>
      <h2>ساخت حساب امن</h2>
      <?php if ($setupError): ?><div class="alert alert-error"><?= admin_escape($setupError) ?></div><?php endif; ?>
      <form method="post" action="comments.php">
        <input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>">
        <input type="hidden" name="action" value="setup">
        <label><span>کد راه‌اندازی</span><input type="text" name="setupToken" required autocomplete="off"></label>
        <label><span>نام کاربری مدیر</span><input type="text" name="username" minlength="3" maxlength="40" required autocomplete="username"></label>
        <label><span>رمز عبور؛ حداقل ۱۲ نویسه</span><input type="password" name="password" minlength="12" required autocomplete="new-password"></label>
        <label><span>تکرار رمز عبور</span><input type="password" name="passwordConfirm" minlength="12" required autocomplete="new-password"></label>
        <button class="primary-button" type="submit">ساخت حساب و ورود</button>
      </form>
    </section>
  </main>
<?php elseif (!$isAuthenticated): ?>
  <main class="auth-shell login-shell">
    <section class="auth-brand">
      <img src="/assets/images/brand-mark.svg" width="512" height="512" alt="">
      <span class="auth-kicker">پنل خصوصی دپو سازگار</span>
      <h1>مدیریت نظرهای کاربران</h1>
      <p>نظرهای تازه را بررسی، منتشر، رد یا حذف کنید. این صفحه در نتایج جست‌وجو ایندکس نمی‌شود.</p>
    </section>
    <section class="auth-card">
      <span class="card-index">Admin Access</span>
      <h2>ورود مدیر</h2>
      <?php if ($loginError): ?><div class="alert alert-error"><?= admin_escape($loginError) ?></div><?php endif; ?>
      <form method="post" action="comments.php">
        <input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>">
        <input type="hidden" name="action" value="login">
        <label><span>نام کاربری</span><input type="text" name="username" required autocomplete="username" autofocus></label>
        <label><span>رمز عبور</span><input type="password" name="password" required autocomplete="current-password"></label>
        <button class="primary-button" type="submit">ورود به پنل</button>
      </form>
      <a class="back-link" href="/">بازگشت به سایت</a>
    </section>
  </main>
<?php else: ?>
  <header class="admin-header">
    <a class="admin-brand" href="/"><img src="/assets/images/brand-mark.svg" width="512" height="512" alt=""><span><strong>دپو سازگار</strong><small>مدیریت نظرها</small></span></a>
    <div class="admin-account">
      <span>مدیر: <?= admin_escape($_SESSION['admin_username'] ?? '') ?></span>
      <form method="post" action="comments.php">
        <input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>">
        <input type="hidden" name="action" value="logout">
        <button type="submit">خروج امن</button>
      </form>
    </div>
  </header>
  <main class="admin-main">
    <?php if ($flash): ?><div class="alert <?= ($flash['state'] ?? '') === 'error' ? 'alert-error' : 'alert-success' ?>"><?= admin_escape($flash['message'] ?? '') ?></div><?php endif; ?>
    <section class="dashboard-heading">
      <div><span class="auth-kicker">اتاق کنترل بازخوردها</span><h1>نظرهای کاربران</h1><p>پیش از انتشار، متن را از نظر اطلاعات خصوصی، تبلیغ و محتوای نامرتبط بررسی کنید.</p></div>
      <div class="pending-orbit"><strong><?= (int) $stats['pending'] ?></strong><span>نظر در انتظار</span></div>
    </section>

    <section class="stats-grid" aria-label="آمار نظرها">
      <?php foreach (['all' => 'همه نظرها', 'pending' => 'در انتظار', 'approved' => 'منتشرشده', 'rejected' => 'ردشده'] as $status => $label): ?>
        <a class="<?= $filter === $status ? 'active' : '' ?>" href="?filter=<?= admin_escape($status) ?>"><span><?= admin_escape($label) ?></span><strong><?= (int) $stats[$status] ?></strong></a>
      <?php endforeach; ?>
    </section>

    <section class="comments-panel">
      <div class="panel-toolbar">
        <div><h2><?= admin_escape($statusLabels[$filter] ?? 'همه نظرها') ?></h2><span><?= count($visibleComments) ?> مورد نمایش داده می‌شود</span></div>
        <form class="search-form" method="get" action="comments.php">
          <input type="hidden" name="filter" value="<?= admin_escape($filter) ?>">
          <input type="search" name="q" value="<?= admin_escape($search) ?>" placeholder="جست‌وجو در نام، شهر یا متن">
          <button type="submit">جست‌وجو</button>
        </form>
      </div>

      <div class="admin-comment-list">
        <?php if (!$visibleComments): ?>
          <div class="empty-state"><strong>موردی پیدا نشد</strong><p>در این وضعیت هنوز نظری وجود ندارد یا عبارت جست‌وجو نتیجه‌ای نداشت.</p></div>
        <?php endif; ?>
        <?php foreach ($visibleComments as $comment): $status = (string) ($comment['status'] ?? 'pending'); ?>
          <article class="admin-comment-card">
            <header>
              <span class="comment-avatar"><?= admin_escape(function_exists('mb_substr') ? mb_substr((string) ($comment['name'] ?? 'م'), 0, 1, 'UTF-8') : substr((string) ($comment['name'] ?? 'م'), 0, 1)) ?></span>
              <div><strong><?= admin_escape($comment['name'] ?? 'بدون نام') ?></strong><span><?= admin_escape($comment['city'] ?? 'بدون شهر') ?> · <?= admin_escape(admin_format_date((string) ($comment['createdAt'] ?? ''))) ?></span></div>
              <b class="status status-<?= admin_escape($status) ?>"><?= admin_escape($statusLabels[$status] ?? 'در انتظار') ?></b>
            </header>
            <p><?= nl2br(admin_escape($comment['message'] ?? '')) ?></p>
            <footer>
              <div class="moderation-actions">
                <?php if ($status !== 'approved'): ?>
                  <form method="post" action="comments.php"><input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>"><input type="hidden" name="action" value="approve"><input type="hidden" name="commentId" value="<?= admin_escape($comment['id'] ?? '') ?>"><input type="hidden" name="returnFilter" value="<?= admin_escape($filter) ?>"><button class="approve-button" type="submit">تأیید و انتشار</button></form>
                <?php endif; ?>
                <?php if ($status !== 'rejected'): ?>
                  <form method="post" action="comments.php"><input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>"><input type="hidden" name="action" value="reject"><input type="hidden" name="commentId" value="<?= admin_escape($comment['id'] ?? '') ?>"><input type="hidden" name="returnFilter" value="<?= admin_escape($filter) ?>"><button class="reject-button" type="submit">رد کردن</button></form>
                <?php endif; ?>
              </div>
              <details class="delete-control"><summary>حذف دائمی</summary><form method="post" action="comments.php"><input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="commentId" value="<?= admin_escape($comment['id'] ?? '') ?>"><input type="hidden" name="returnFilter" value="<?= admin_escape($filter) ?>"><span>این عملیات برگشت‌پذیر نیست.</span><button type="submit">تأیید حذف</button></form></details>
            </footer>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <details class="security-panel">
      <summary>تنظیمات امنیتی و تغییر رمز</summary>
      <form method="post" action="comments.php">
        <input type="hidden" name="csrf" value="<?= admin_escape($csrf) ?>">
        <input type="hidden" name="action" value="change-password">
        <label><span>رمز فعلی</span><input type="password" name="currentPassword" required autocomplete="current-password"></label>
        <label><span>رمز جدید؛ حداقل ۱۲ نویسه</span><input type="password" name="newPassword" minlength="12" required autocomplete="new-password"></label>
        <label><span>تکرار رمز جدید</span><input type="password" name="newPasswordConfirm" minlength="12" required autocomplete="new-password"></label>
        <button class="primary-button" type="submit">ذخیره رمز جدید</button>
      </form>
    </details>
  </main>
<?php endif; ?>
</body>
</html>

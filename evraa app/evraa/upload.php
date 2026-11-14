<?php
// Replaces "EVRAA 2027 Final Summary Fin.xlsx" (the final budget) with an uploaded workbook.
// Every open dashboard re-checks that file every few seconds, so viewers update on their own.

header('Content-Type: application/json');
header('Cache-Control: no-store');

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'message' => 'Use POST.']);
}

$config = @include __DIR__ . '/upload-config.php';
$hash = is_array($config) ? ($config['passcode_hash'] ?? '') : '';
if ($hash === '') {
    reply(500, ['ok' => false, 'message' => 'Uploads are not set up yet (missing passcode in upload-config.php).']);
}

// Slow down passcode guessing
$attemptsFile = sys_get_temp_dir() . '/evraa-upload-' . md5($_SERVER['REMOTE_ADDR'] ?? '') . '.json';
$attempts = json_decode((string) @file_get_contents($attemptsFile), true) ?: ['count' => 0, 'since' => time()];
if (time() - $attempts['since'] > 900) {
    $attempts = ['count' => 0, 'since' => time()];
}
if ($attempts['count'] >= 10) {
    reply(429, ['ok' => false, 'message' => 'Too many wrong passcodes. Try again in 15 minutes.']);
}
if (!password_verify((string) ($_POST['passcode'] ?? ''), $hash)) {
    $attempts['count']++;
    @file_put_contents($attemptsFile, json_encode($attempts));
    reply(403, ['ok' => false, 'message' => 'Wrong passcode.']);
}
@unlink($attemptsFile);

$file = $_FILES['workbook'] ?? null;
if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
    reply(400, ['ok' => false, 'message' => 'No file received (it may be larger than the server allows).']);
}
if (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'xlsx') {
    reply(400, ['ok' => false, 'message' => 'Please upload an .xlsx workbook.']);
}
if ($file['size'] > 10 * 1024 * 1024) {
    reply(400, ['ok' => false, 'message' => 'File is larger than 10 MB.']);
}
// .xlsx files are zip archives and start with "PK"
$fh = fopen($file['tmp_name'], 'rb');
$magic = fread($fh, 2);
fclose($fh);
if ($magic !== 'PK') {
    reply(400, ['ok' => false, 'message' => 'That file is not a valid .xlsx workbook.']);
}

$target = __DIR__ . '/EVRAA 2027 Final Summary Fin.xlsx';
$backups = __DIR__ . '/backups';
if (!is_dir($backups)) {
    @mkdir($backups, 0755, true);
}
if (is_file($target)) {
    @copy($target, $backups . '/EVRAA 2027 Final Summary Fin ' . date('Y-m-d His') . '.xlsx');
}

// Write to a temp file first, then swap it in so viewers never read a half-written workbook
$temp = $target . '.uploading';
if (!move_uploaded_file($file['tmp_name'], $temp) || !rename($temp, $target)) {
    @unlink($temp);
    reply(500, ['ok' => false, 'message' => 'Could not save the file. Check that the evraa folder is writable.']);
}
@chmod($target, 0644);

reply(200, ['ok' => true, 'message' => 'Workbook updated.', 'name' => $file['name']]);

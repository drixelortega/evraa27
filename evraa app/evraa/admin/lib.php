<?php
// EVRAA 2027 admin: the database, the sign-in, the users and their roles, and what each tab's table looks like.
//
// The content lives in a SQLite database (data/evraa-<random code>.sqlite, created with the starting content the first time the
// admin page is opened). Every save also rewrites ../assets/data-live.js, the file the public pages read,
// so the pages themselves stay plain HTML and never touch the database.
declare(strict_types=1);
defined('EVRAA_ADMIN') || exit;

const DATA_DIR = __DIR__ . '/data';
const LIVE_FILE = __DIR__ . '/../assets/data-live.js';
const DEFAULT_PASSWORD = 'EVRAA2027cyp';
const SESSION_IDLE = 7200;          // signed out after two hours without activity
const LOGIN_TRIES = 5;              // wrong passwords allowed...
const LOGIN_WINDOW = 600;           // ...within ten minutes, per account and device

const ACCENT_CHOICES = [
    'var(--green)' => 'Green', 'var(--teal)' => 'Teal', 'var(--sky)' => 'Blue', 'var(--gold)' => 'Gold', 'var(--flame)' => 'Orange',
];

// The roles a user can be given. The Admin adds users on the Users tab and picks one of these for each.
const ROLES = ['admin' => 'Admin', 'records' => 'Records', 'secretary' => 'Secretary'];

// The first user, created with the database: [username, name shown, role]. New users start with the default password.
const FIRST_USER = ['drixel.ortega', 'Drixel Ortega', 'admin'];

// Tabs: id => [label, the tables on it, the public page it updates]
const TABS = [
    'announcements' => ['Announcements', ['announcements'], '../announcements.html'],
    'directory' => ['Directory', ['places', 'hotlines', 'contacts'], '../directory.html'],
    'tally' => ['Medal Tally', ['tally'], '../medal-tally.html'],
    'schedule' => ['Games Schedule', ['schedule'], '../games.html'],
    'events' => ['Special Events', ['events'], '../special-events.html'],
    'users' => ['Users', [], ''],
    'account' => ['My password', [], ''],
];

// Which tabs each role sees
const ROLE_TABS = [
    'admin' => ['announcements', 'directory', 'tally', 'schedule', 'events', 'users', 'account'],
    'records' => ['tally', 'schedule', 'account'],
    'secretary' => ['announcements', 'directory', 'events', 'account'],
];

// The tables. Each column: [label, type, maximum length, required, hint].
// Types: text, textarea, date, number, accent (a colour), link (a page on this site or an https address), sport (one of SPORTS in data.js),
// team (one of the delegations in the Medal Tally table; the two team columns are shown together as “VS”)
const TABLES = [
    'announcements' => [
        'title' => 'Announcements',
        'help' => 'Newest first. The tag “New” is highlighted, and a new first announcement brings back the dot on the Home page card.',
        'columns' => [
            'tag' => ['Tag', 'text', 30, true, 'New, Pinned, Advisory…'],
            'date' => ['Date shown', 'text', 40, false, 'e.g. March 1, 2027'],
            'title' => ['Title', 'text', 160, true, ''],
            'body' => ['Text', 'textarea', 800, false, ''],
            'link_label' => ['Link text', 'text', 60, false, 'optional'],
            'link_url' => ['Link address', 'link', 200, false, 'evraa/games.html or https://…'],
            'accent' => ['Colour', 'accent', 20, true, ''],
        ],
    ],
    'places' => [
        'title' => 'Directions / Locations',
        'help' => 'Each place gets an “Open in Google Maps” link that searches for the text in the last column.',
        'columns' => [
            'name' => ['Place', 'text', 80, true, ''],
            'note' => ['Description', 'textarea', 300, false, ''],
            'query' => ['Google Maps search', 'text', 120, true, 'e.g. Calbayog Airport, Samar'],
            'accent' => ['Colour', 'accent', 20, true, ''],
        ],
    ],
    'hotlines' => [
        'title' => 'Hotlines',
        'help' => 'Leave the number empty to show “To be announced”.',
        'columns' => [
            'label' => ['Office / service', 'text', 80, true, ''],
            'number' => ['Number', 'text', 40, false, ''],
            'accent' => ['Colour', 'accent', 20, true, ''],
        ],
    ],
    'contacts' => [
        'title' => 'Contact Persons',
        'help' => 'Only the name is required.',
        'columns' => [
            'name' => ['Name', 'text', 80, true, ''],
            'position' => ['Position', 'text', 80, false, ''],
            'topic' => ['For queries on', 'text', 120, false, ''],
            'phone' => ['Mobile number', 'text', 40, false, ''],
            'email' => ['Email', 'email', 120, false, ''],
        ],
    ],
    'tally' => [
        'title' => 'Medal Tally',
        'help' => 'Type each delegation’s medal counts. The page ranks them by gold, then silver, then bronze, so the order here does not matter.',
        'columns' => [
            'name' => ['Delegation', 'text', 60, true, ''],
            'gold' => ['Gold', 'number', 4, true, ''],
            'silver' => ['Silver', 'number', 4, true, ''],
            'bronze' => ['Bronze', 'number', 4, true, ''],
        ],
    ],
    'schedule' => [
        'title' => 'Games Schedule',
        'help' => 'One row per game or event. For a match between two teams, choose them under VS (the teams are the delegations on the Medal Tally tab); leave both empty for events without opposing teams. Sports without any row show “To be announced”. The page sorts each sport’s games by date.',
        'columns' => [
            'sport' => ['Sport', 'sport', 60, true, ''],
            'date' => ['Date', 'date', 10, true, ''],
            'time' => ['Time', 'text', 30, false, 'e.g. 8:00 AM'],
            'what' => ['Game / event', 'text', 160, false, 'e.g. 100m final'],
            'team_a' => ['Team', 'team', 60, false, ''],
            'team_b' => ['vs Team', 'team', 60, false, ''],
        ],
    ],
    'events' => [
        'title' => 'Special Events',
        'help' => 'Shown in this order. Leave the date empty to show “To be announced”.',
        'columns' => [
            'title' => ['Event', 'text', 120, true, ''],
            'date' => ['Date', 'date', 10, false, ''],
            'body' => ['Description', 'textarea', 500, false, ''],
        ],
    ],
];

// ---------- Database ----------

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    if (!extension_loaded('pdo_sqlite')) {
        throw new RuntimeException('This server does not have SQLite turned on for PHP (the pdo_sqlite extension).');
    }
    $dir = DATA_DIR;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        throw new RuntimeException('The folder evraa/admin/data could not be created.');
    }
    if (!is_writable($dir)) {
        throw new RuntimeException('The folder evraa/admin/data is not writable.');
    }
    $file = db_file();
    $new = !is_file($file);
    $pdo = new PDO('sqlite:' . $file, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA busy_timeout = 4000');
    if ($new || !$pdo->query("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'users'")->fetch()) {
        install($pdo);
    } else {
        upgrade($pdo);
    }
    return $pdo;
}

// Adds columns that were introduced after a database was created (e.g. the VS teams of the Games Schedule), keeping its content
function upgrade(PDO $pdo): void
{
    $added = false;
    foreach (TABLES as $table => $spec) {
        $have = array_column($pdo->query("PRAGMA table_info($table)")->fetchAll(), 'name');
        foreach ($spec['columns'] as $col => [, $type]) {
            if (!in_array($col, $have, true)) {
                $pdo->exec("ALTER TABLE $table ADD COLUMN $col " . ($type === 'number' ? 'INTEGER NOT NULL DEFAULT 0' : "TEXT NOT NULL DEFAULT ''"));
                $added = true;
            }
        }
    }
    if ($added) {
        publish($pdo);
    }
}

// The delegations, for choosing the teams of a game
function team_names(): array
{
    static $names = null;
    return $names ??= db()->query('SELECT name FROM tally ORDER BY name')->fetchAll(PDO::FETCH_COLUMN);
}

// Where the database is. Its file name ends in a long random code kept in data/config.php (a PHP file, so browsers cannot read it):
// nobody can download the database by guessing its address, even on a host that ignores the .htaccess in that folder.
function db_file(): string
{
    $config = DATA_DIR . '/config.php';
    $name = is_file($config) ? (include $config)['db'] ?? '' : '';
    if (!is_string($name) || !preg_match('/^evraa-[a-f0-9]{40}\.sqlite$/', $name)) {
        $name = 'evraa-' . bin2hex(random_bytes(20)) . '.sqlite';
        if (@file_put_contents($config, "<?php\n// Made by the admin page: the name of the database file. Keep this file.\nreturn ['db' => '$name'];\n", LOCK_EX) === false) {
            throw new RuntimeException('The folder evraa/admin/data is not writable.');
        }
        if (function_exists('opcache_invalidate')) {
            @opcache_invalidate($config, true);
        }
        // A database made before this protection keeps its content under the new name
        if (is_file(DATA_DIR . '/evraa.sqlite')) {
            @rename(DATA_DIR . '/evraa.sqlite', DATA_DIR . '/' . $name);
        }
    }
    return DATA_DIR . '/' . $name;
}

// Creates the tables and fills them with the content the site had when the admin page was added
function install(PDO $pdo): void
{
    $pdo->beginTransaction();
    $pdo->exec('CREATE TABLE users (
        id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, role TEXT NOT NULL, name TEXT NOT NULL,
        password_hash TEXT NOT NULL, is_default INTEGER NOT NULL DEFAULT 1, updated_at INTEGER NOT NULL)');
    $pdo->exec('CREATE TABLE login_attempts (id INTEGER PRIMARY KEY, username TEXT NOT NULL, ip TEXT NOT NULL, at INTEGER NOT NULL)');
    $pdo->exec('CREATE TABLE saves (dataset TEXT PRIMARY KEY, username TEXT NOT NULL, at INTEGER NOT NULL)');
    foreach (TABLES as $table => $spec) {
        $cols = [];
        foreach ($spec['columns'] as $col => [, $type]) {
            $cols[] = $type === 'number' ? "$col INTEGER NOT NULL DEFAULT 0" : "$col TEXT NOT NULL DEFAULT ''";
        }
        $pdo->exec("CREATE TABLE $table (id INTEGER PRIMARY KEY, sort INTEGER NOT NULL, " . implode(', ', $cols) . ')');
    }
    [$username, $name, $role] = FIRST_USER;
    $pdo->prepare('INSERT INTO users (username, role, name, password_hash, is_default, updated_at) VALUES (?, ?, ?, ?, 1, ?)')
        ->execute([$username, $role, $name, password_hash(DEFAULT_PASSWORD, PASSWORD_DEFAULT), time()]);
    foreach (starting_content() as $table => $rows) {
        write_rows($pdo, $table, $rows);
    }
    $pdo->commit();
    publish($pdo);
}

function starting_content(): array
{
    $tally = [];
    foreach (['Baybay City', 'Biliran', 'Borongan City', 'Calbayog City', 'Catbalogan City', 'Eastern Samar', 'Leyte', 'Maasin City',
        'Northern Samar', 'Ormoc City', 'Samar', 'Southern Leyte', 'Tacloban City'] as $name) {
        $tally[] = ['name' => $name, 'gold' => 0, 'silver' => 0, 'bronze' => 0];
    }
    return [
        'announcements' => [
            ['tag' => 'New', 'date' => 'October 13, 2026', 'title' => 'New on the site: Directory, Medal Tally, Games and Special Events', 'body' => 'Schedules, playing venues, hotlines and more will be posted in these sections as committees confirm them.', 'link_label' => '', 'link_url' => '', 'accent' => 'var(--flame)'],
            ['tag' => 'Pinned', 'date' => '', 'title' => 'EVRAA 2027 runs March 31 – April 5, 2027', 'body' => 'Calbayog City and Catbalogan City are hosting this year\'s Eastern Visayas Regional Athletic Association meet.', 'link_label' => '', 'link_url' => '', 'accent' => 'var(--gold)'],
            ['tag' => 'Billeting', 'date' => '', 'title' => '14 billeting schools in Calbayog City', 'body' => 'Delegations will stay in 14 schools across Calbayog City. See the list and map on the Billeting Areas page.', 'link_label' => 'See the billeting schools', 'link_url' => 'evraa/billeting.html', 'accent' => 'var(--teal)'],
        ],
        'places' => [
            ['name' => 'Calbayog City', 'note' => 'Host city and home of the 14 billeting schools.', 'query' => 'Calbayog City, Samar', 'accent' => 'var(--teal)'],
            ['name' => 'Catbalogan City', 'note' => 'Co-host city, the capital of Samar province.', 'query' => 'Catbalogan City, Samar', 'accent' => 'var(--sky)'],
            ['name' => 'Calbayog Airport', 'note' => 'The airport serving Calbayog City.', 'query' => 'Calbayog Airport, Samar', 'accent' => 'var(--gold)'],
        ],
        'hotlines' => [
            ['label' => 'National Emergency Hotline', 'number' => '911', 'accent' => 'var(--flame)'],
            ['label' => 'EVRAA 2027 Secretariat', 'number' => '', 'accent' => 'var(--green)'],
            ['label' => 'Medical Services', 'number' => '', 'accent' => 'var(--teal)'],
            ['label' => 'Security & Safety (PNP)', 'number' => '', 'accent' => 'var(--sky)'],
            ['label' => 'CDRRMO', 'number' => '', 'accent' => 'var(--gold)'],
            ['label' => 'Transportation & Traffic', 'number' => '', 'accent' => 'var(--green)'],
        ],
        'contacts' => [],
        'tally' => $tally,
        'schedule' => [],
        'events' => [
            ['title' => '100 Days Countdown', 'date' => '2026-12-21', 'body' => 'Marks 100 days to go before the opening of EVRAA 2027.'],
            ['title' => 'Opening Ceremony & Parade', 'date' => '2027-03-31', 'body' => 'The parade of delegations and the official opening of the games.'],
            ['title' => 'Solidarity Meeting / Conference', 'date' => '', 'body' => 'Delegation heads and officials meet before the competitions begin.'],
            ['title' => 'Welcome Night', 'date' => '', 'body' => 'An evening welcoming the delegations to the host cities.'],
            ['title' => 'Cultural Shows', 'date' => '', 'body' => 'Performances celebrating the culture of Eastern Visayas, including Calbayog\'s Hadang Festival and Catbalogan\'s Manaragat Festival.'],
            ['title' => 'Tourism Expo & Souvenirs', 'date' => '', 'body' => 'Local products, tourism booths and EVRAA 2027 souvenirs.'],
            ['title' => 'EVRAA Street Party', 'date' => '', 'body' => 'A street celebration for delegates, guests and the host communities.'],
        ],
    ];
}

function read_rows(PDO $pdo, string $table): array
{
    $cols = implode(', ', array_keys(TABLES[$table]['columns']));
    return $pdo->query("SELECT $cols FROM $table ORDER BY sort, id")->fetchAll();
}

// Replaces the whole table with the rows given, in their order
function write_rows(PDO $pdo, string $table, array $rows): void
{
    $cols = array_keys(TABLES[$table]['columns']);
    $pdo->exec("DELETE FROM $table");
    $insert = $pdo->prepare("INSERT INTO $table (sort, " . implode(', ', $cols) . ') VALUES (?' . str_repeat(', ?', count($cols)) . ')');
    foreach (array_values($rows) as $i => $row) {
        $insert->execute([$i, ...array_map(fn ($col) => $row[$col], $cols)]);
    }
}

// Checks what was typed into a table. Returns [clean rows, problems keyed by "row.column"]; rows left completely empty are dropped.
function check_rows(string $table, mixed $input): array
{
    $columns = TABLES[$table]['columns'];
    $rows = [];
    $problems = [];
    if (!is_array($input)) {
        return [[], []];
    }
    foreach (array_slice(array_values($input), 0, 500) as $raw) {
        if (!is_array($raw)) {
            continue;
        }
        $row = [];
        $blank = true;
        foreach ($columns as $col => [$label, $type, $max, $required]) {
            $value = is_string($raw[$col] ?? null) ? trim(preg_replace('/\s+/u', ' ', $raw[$col]) ?? '') : '';
            if ($value !== '' && !in_array($type, ['accent', 'number', 'sport', 'team'], true)) {
                $blank = false;
            }
            $row[$col] = $value;
        }
        if ($blank) {
            continue;
        }
        $n = count($rows);
        foreach ($columns as $col => [$label, $type, $max, $required]) {
            $value = $row[$col];
            $problem = '';
            if ($type === 'number') {
                $value = $value === '' ? '0' : $value;
                if (!preg_match('/^\d{1,4}$/', $value)) {
                    $problem = "$label must be a whole number from 0 to 9999.";
                }
                $row[$col] = (int) $value;
            } elseif ($value === '') {
                $problem = $required ? "$label is required." : '';
            } elseif (mb_strlen($value) > $max) {
                $problem = "$label is too long (at most $max characters).";
            } elseif ($type === 'date' && !(preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m) && checkdate((int) $m[2], (int) $m[3], (int) $m[1]))) {
                $problem = "$label must be a date.";
            } elseif ($type === 'accent' && !isset(ACCENT_CHOICES[$value])) {
                $problem = "Choose a colour.";
            } elseif ($type === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $problem = "$label is not a valid email address.";
            } elseif ($type === 'link' && !preg_match('~^(https?://[^\s"\'<>]+|(?!/)[A-Za-z0-9_\-./%#?=&]+)$~', $value)) {
                $problem = "$label must be a page on this site (like evraa/games.html) or start with https://";
            }
            if ($problem !== '') {
                $problems["$n.$col"] = $problem;
            }
        }
        if ($table === 'schedule' && ($row['team_a'] === '') !== ($row['team_b'] === '')) {
            $problems["$n.team_b"] = 'Choose both teams, or leave both empty.';
        } elseif ($table === 'schedule' && $row['team_a'] !== '' && $row['team_a'] === $row['team_b']) {
            $problems["$n.team_b"] = 'The two teams must be different.';
        }
        if ($table === 'announcements' && ($row['link_label'] === '') !== ($row['link_url'] === '')) {
            $problems["$n.link_url"] = 'A link needs both its text and its address (or leave both empty).';
        }
        $rows[] = $row;
    }
    return [$rows, $problems];
}

// Writes evraa/assets/data-live.js from the database: the lists the public pages read
function publish(PDO $pdo): void
{
    $announcements = array_map(function ($a) {
        $item = ['tag' => $a['tag']];
        if ($a['date'] !== '') {
            $item['date'] = $a['date'];
        }
        $item += ['title' => $a['title'], 'body' => $a['body']];
        if ($a['link_label'] !== '' && $a['link_url'] !== '') {
            $item['link'] = [$a['link_label'], $a['link_url']];
        }
        return $item + ['accent' => $a['accent']];
    }, read_rows($pdo, 'announcements'));

    $schedule = [];
    foreach (read_rows($pdo, 'schedule') as $g) {
        $schedule[$g['sport']][] = [$g['date'], $g['time'], $g['what'], $g['team_a'], $g['team_b']];
    }
    $lists = fn (string $table) => array_map('array_values', read_rows($pdo, $table));
    $tally = array_map(fn ($r) => [$r['name'], (int) $r['gold'], (int) $r['silver'], (int) $r['bronze']], read_rows($pdo, 'tally'));

    $js = "// EVRAA 2027 content managed on the admin page (evraa/admin). This file is rewritten on every save there:\n"
        . "// do not edit it by hand, your changes would be lost. The other lists (sports and venues, billeting schools, logos) are in data.js.\n"
        . '// Last saved: ' . date('F j, Y g:i A') . " (Philippine time)\n\n";
    $block = function (string $comment, string $name, array $items, bool $object = false) use (&$js) {
        $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG;
        $js .= "// $comment\nconst $name = " . ($object ? '{' : '[') . "\n";
        foreach ($items as $key => $item) {
            $js .= '  ' . ($object ? json_encode((string) $key, $flags) . ': ' : '') . json_encode($item, $flags) . ",\n";
        }
        $js .= ($object ? '}' : ']') . ";\n\n";
    };
    $block('Announcements page, newest first', 'ANNOUNCEMENTS', $announcements);
    $block('Game schedule per sport: [date, time, what\'s on, team, versus team] (the teams are empty for events without opposing teams)', 'SCHEDULE', $schedule, true);
    $block('Directory → Directions / Locations: name, description, Google Maps search, accent colour', 'PLACES', $lists('places'));
    $block('Directory → Hotlines: label, number (empty = to be announced), accent colour', 'HOTLINES', $lists('hotlines'));
    $block('Directory → Contact Persons: name, position, what to ask them about, mobile number, email', 'CONTACTS', $lists('contacts'));
    $block('Medal Tally: delegation, gold, silver, bronze', 'TALLY', $tally);
    $block('Special Events: title, date (YYYY-MM-DD or empty), description', 'EVENTS', $lists('events'));

    $tmp = LIVE_FILE . '.tmp';
    if (@file_put_contents($tmp, rtrim($js) . "\n", LOCK_EX) === false || !@rename($tmp, LIVE_FILE)) {
        @unlink($tmp);
        throw new RuntimeException('Saved to the database, but evraa/assets/data-live.js could not be written, so the public pages still show the old content. Check that the evraa/assets folder is writable.');
    }
}

// ---------- Sign-in ----------

function start_session(): void
{
    session_name('evraa_admin');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

// The signed-in user, or null. Signing out happens by itself after two idle hours, or when the password is changed elsewhere.
function current_user(): ?array
{
    if (empty($_SESSION['uid'])) {
        return null;
    }
    $find = db()->prepare('SELECT * FROM users WHERE id = ?');
    $find->execute([$_SESSION['uid']]);
    $user = $find->fetch();
    if (!$user || (int) $user['updated_at'] !== (int) ($_SESSION['stamp'] ?? -1) || time() - (int) ($_SESSION['seen'] ?? 0) > SESSION_IDLE) {
        sign_out();
        return null;
    }
    $_SESSION['seen'] = time();
    return $user;
}

function client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);
}

// Returns an error message, or '' once signed in
function sign_in(string $username, string $password): string
{
    $pdo = db();
    $username = strtolower(trim($username));
    $pdo->prepare('DELETE FROM login_attempts WHERE at < ?')->execute([time() - LOGIN_WINDOW]);
    $count = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE username = ? AND ip = ?');
    $count->execute([$username, client_ip()]);
    if ((int) $count->fetchColumn() >= LOGIN_TRIES) {
        return 'Too many wrong passwords. Please wait ten minutes and try again.';
    }
    $find = $pdo->prepare('SELECT * FROM users WHERE username = ?');
    $find->execute([$username]);
    $user = $find->fetch();
    // Check a hash even for an unknown username, so both cases take the same time
    $hash = $user['password_hash'] ?? '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';
    if (!password_verify($password, $hash) || !$user) {
        $pdo->prepare('INSERT INTO login_attempts (username, ip, at) VALUES (?, ?, ?)')->execute([substr($username, 0, 40), client_ip(), time()]);
        return 'Wrong username or password.';
    }
    $pdo->prepare('DELETE FROM login_attempts WHERE username = ? AND ip = ?')->execute([$username, client_ip()]);
    session_regenerate_id(true);
    $_SESSION = ['uid' => (int) $user['id'], 'stamp' => (int) $user['updated_at'], 'seen' => time(), 'csrf' => bin2hex(random_bytes(32))];
    return '';
}

function sign_out(): void
{
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

// Sets a user's password; $password null puts back the default. Returns an error message or ''.
function set_password(array $actor, int $userId, ?string $password, string $confirm = ''): string
{
    if ($actor['role'] !== 'admin') {
        return 'Only an Admin can change other users’ passwords.';
    }
    if ($password !== null) {
        if (strlen($password) < 8) {
            return 'The new password must be at least 8 characters.';
        }
        if (strlen($password) > 200) {
            return 'The new password is too long.';
        }
        if ($password !== $confirm) {
            return 'The two passwords do not match.';
        }
    }
    $stamp = time();
    // A different stamp signs that user out everywhere
    $update = db()->prepare('UPDATE users SET password_hash = ?, is_default = ?, updated_at = CASE WHEN updated_at >= ? THEN updated_at + 1 ELSE ? END WHERE id = ?');
    $update->execute([password_hash($password ?? DEFAULT_PASSWORD, PASSWORD_DEFAULT), $password === null || $password === DEFAULT_PASSWORD ? 1 : 0, $stamp, $stamp, $userId]);
    if (!$update->rowCount()) {
        return 'That user was not found.';
    }
    if ($userId === (int) $actor['id']) {
        $_SESSION['stamp'] = (int) db()->query('SELECT updated_at FROM users WHERE id = ' . $userId)->fetchColumn();
    }
    return '';
}

// A user changing their own password: needs the current one. Returns an error message or ''.
function change_own_password(array $user, string $current, string $password, string $confirm): string
{
    if (!password_verify($current, $user['password_hash'])) {
        return 'The current password is not right.';
    }
    if (strlen($password) < 8 || strlen($password) > 200) {
        return 'The new password must be at least 8 characters.';
    }
    if ($password !== $confirm) {
        return 'The two new passwords do not match.';
    }
    if ($password === DEFAULT_PASSWORD) {
        return 'Choose a password other than the default one.';
    }
    $stamp = max(time(), (int) $user['updated_at'] + 1);
    db()->prepare('UPDATE users SET password_hash = ?, is_default = 0, updated_at = ? WHERE id = ?')->execute([password_hash($password, PASSWORD_DEFAULT), $stamp, $user['id']]);
    $_SESSION['stamp'] = $stamp;   // stays signed in here, signed out on other devices
    return '';
}

// ---------- Users (Admin only). Each returns an error message or ''. ----------

function admins_left(int $exceptId): int
{
    $count = db()->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin' AND id <> ?");
    $count->execute([$exceptId]);
    return (int) $count->fetchColumn();
}

// A new user starts with the default password
function add_user(array $actor, string $username, string $name, string $role): string
{
    if ($actor['role'] !== 'admin') {
        return 'Only an Admin can add users.';
    }
    $username = strtolower(trim($username));
    $name = trim(preg_replace('/\s+/u', ' ', $name) ?? '');
    if (!preg_match('/^[a-z0-9][a-z0-9._-]{2,39}$/', $username)) {
        return 'The username must be 3 to 40 characters: letters, numbers, dots, dashes or underscores, with no spaces.';
    }
    if ($name === '' || mb_strlen($name) > 60) {
        return 'Type the person’s name (at most 60 characters).';
    }
    if (!isset(ROLES[$role])) {
        return 'Choose a role.';
    }
    $find = db()->prepare('SELECT 1 FROM users WHERE username = ?');
    $find->execute([$username]);
    if ($find->fetch()) {
        return "The username $username is already taken.";
    }
    db()->prepare('INSERT INTO users (username, role, name, password_hash, is_default, updated_at) VALUES (?, ?, ?, ?, 1, ?)')
        ->execute([$username, $role, $name, password_hash(DEFAULT_PASSWORD, PASSWORD_DEFAULT), time()]);
    return '';
}

function change_role(array $actor, int $userId, string $role): string
{
    if ($actor['role'] !== 'admin') {
        return 'Only an Admin can change roles.';
    }
    if (!isset(ROLES[$role])) {
        return 'Choose a role.';
    }
    if ($role !== 'admin' && !admins_left($userId)) {
        return 'There must always be at least one Admin.';
    }
    $update = db()->prepare('UPDATE users SET role = ? WHERE id = ?');
    $update->execute([$role, $userId]);
    return $update->rowCount() ? '' : 'That user was not found.';
}

function delete_user(array $actor, int $userId): string
{
    if ($actor['role'] !== 'admin') {
        return 'Only an Admin can remove users.';
    }
    if ($userId === (int) $actor['id']) {
        return 'You cannot remove your own account.';
    }
    if (!admins_left($userId)) {
        return 'There must always be at least one Admin.';
    }
    $delete = db()->prepare('DELETE FROM users WHERE id = ?');
    $delete->execute([$userId]);
    return $delete->rowCount() ? '' : 'That user was not found.';
}

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

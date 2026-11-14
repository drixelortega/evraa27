<?php
// EVRAA 2027 admin page: sign in, then edit the tables your account is allowed to (see ROLE_TABS in lib.php).
declare(strict_types=1);
const EVRAA_ADMIN = true;
date_default_timezone_set('Asia/Manila');
require __DIR__ . '/lib.php';

header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");

$here = strtok((string) ($_SERVER['REQUEST_URI'] ?? 'index.php'), '?');
function go(string $query = ''): never
{
    global $here;
    header('Location: ' . $here . ($query === '' ? '' : "?$query"), true, 303);
    exit;
}
function flash(string $type, string $message): void
{
    $_SESSION['flash'] = [$type, $message];
}

$fatal = '';
$user = null;
try {
    start_session();
    db();
    $user = current_user();
} catch (Throwable $error) {
    $fatal = $error instanceof RuntimeException ? $error->getMessage() : 'The database could not be opened.';
}

$tabs = $user ? ROLE_TABS[$user['role']] ?? [] : [];
$tab = in_array($_GET['tab'] ?? '', $tabs, true) ? $_GET['tab'] : ($tabs[0] ?? '');
$typed = [];      // what was typed into a table that did not pass the checks: table => rows
$problems = [];   // table => ["row.column" => message]
$loginError = '';

if (!$fatal && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');
    if (!hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''))) {
        flash('error', 'This page was open for too long. Please try again.');
        go($user ? "tab=$tab" : '');
    }
    try {
        if ($action === 'login') {
            $loginError = sign_in((string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''));
            if ($loginError === '') {
                go();
            }
        } elseif ($action === 'logout') {
            sign_out();
            go();
        } elseif (!$user) {
            go();
        } elseif ($action === 'save') {
            $table = (string) ($_POST['table'] ?? '');
            $owner = '';
            foreach ($tabs as $id) {
                if (in_array($table, TABS[$id][1], true)) {
                    $owner = $id;
                }
            }
            if ($owner === '') {
                flash('error', 'Your account cannot change that table.');
                go("tab=$tab");
            }
            $tab = $owner;
            [$rows, $found] = check_rows($table, $_POST['rows'] ?? []);
            if ($found) {
                $typed[$table] = $rows;
                $problems[$table] = $found;
            } else {
                $pdo = db();
                $pdo->beginTransaction();
                write_rows($pdo, $table, $rows);
                $pdo->prepare('INSERT OR REPLACE INTO saves (dataset, username, at) VALUES (?, ?, ?)')->execute([$table, $user['name'], time()]);
                $pdo->commit();
                publish($pdo);
                flash('ok', TABLES[$table]['title'] . ' saved. The ' . TABS[$owner][0] . ' page now shows the changes.');
                go("tab=$owner#$table");
            }
        } elseif ($action === 'password' || $action === 'reset') {
            $target = (int) ($_POST['user'] ?? 0);
            $error = $action === 'reset'
                ? set_password($user, $target, null)
                : set_password($user, $target, (string) ($_POST['password'] ?? ''), (string) ($_POST['confirm'] ?? ''));
            flash($error === '' ? 'ok' : 'error', $error !== '' ? $error : ($action === 'reset' ? 'Password put back to the default.' : 'Password changed.'));
            go('tab=users');
        } elseif ($action === 'user_add' || $action === 'user_role' || $action === 'user_delete') {
            $target = (int) ($_POST['user'] ?? 0);
            [$error, $done] = match ($action) {
                'user_add' => [add_user($user, (string) ($_POST['username'] ?? ''), (string) ($_POST['name'] ?? ''), (string) ($_POST['role'] ?? '')), 'User added. Their password is the default one until it is changed.'],
                'user_role' => [change_role($user, $target, (string) ($_POST['role'] ?? '')), 'Role changed.'],
                'user_delete' => [delete_user($user, $target), 'User removed.'],
            };
            flash($error === '' ? 'ok' : 'error', $error !== '' ? $error : $done);
            go('tab=users');
        } elseif ($action === 'own_password') {
            $error = change_own_password($user, (string) ($_POST['current'] ?? ''), (string) ($_POST['password'] ?? ''), (string) ($_POST['confirm'] ?? ''));
            flash($error === '' ? 'ok' : 'error', $error !== '' ? $error : 'Your password is changed.');
            go('tab=account');
        }
    } catch (Throwable $error) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        flash('error', $error instanceof RuntimeException ? $error->getMessage() : 'That could not be saved. Please try again.');
        go($user ? "tab=$tab" : '');
    }
}

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
$csrf = $_SESSION['csrf'] ?? '';

// One cell of an editable table
function field(string $table, int|string $i, string $col, array $spec, mixed $value, string $problem): string
{
    [$label, $type, $max, $required, $hint] = $spec;
    $name = "rows[$i][$col]";
    $common = 'name="' . e($name) . '" data-col="' . e($col) . '" aria-label="' . e($label) . '"' . ($problem !== '' ? ' aria-invalid="true"' : '');
    $value = (string) $value;
    $html = match ($type) {
        'textarea' => "<textarea $common rows=\"2\" maxlength=\"$max\" placeholder=\"" . e($hint) . '">' . e($value) . '</textarea>',
        'number' => "<input $common type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"9999\" step=\"1\" value=\"" . e($value === '' ? '0' : $value) . '">',
        'date' => "<input $common type=\"date\" value=\"" . e($value) . '"' . ($required ? ' required' : '') . '>',
        'checkbox' => "<label class=\"switch\"><input $common type=\"checkbox\" value=\"1\"" . ($value !== '' ? ' checked' : '') . '><span>Home</span></label>',
        'accent' => "<select $common>" . implode('', array_map(
            fn ($key, $text) => '<option value="' . e($key) . '"' . ($key === $value ? ' selected' : '') . '>' . e($text) . '</option>',
            array_keys(ACCENT_CHOICES), ACCENT_CHOICES)) . '</select>',
        // The list of sports is filled in by admin.js from SPORTS in data.js
        'sport' => "<select $common data-sports required>" . ($value !== '' ? '<option selected>' . e($value) . '</option>' : '<option value="">Choose…</option>') . '</select>',
        'team' => "<select $common>" . '<option value="">—</option>' . implode('', array_map(
            fn ($team) => '<option' . ($team === $value ? ' selected' : '') . '>' . e($team) . '</option>',
            array_values(array_unique([...team_names(), ...($value !== '' ? [$value] : [])])))) . '</select>',
        default => "<input $common type=\"" . ($type === 'email' ? 'email' : 'text') . "\" maxlength=\"$max\" value=\"" . e($value) . '" placeholder="' . e($hint) . '"' . ($required ? ' required' : '') . '>',
    };
    $short = in_array($type, ['number', 'date', 'accent', 'checkbox'], true) ? ' is-short' : '';
    // The second team of a game follows a small “vs”
    $vs = $col === 'team_b' ? '<span class="vs" aria-hidden="true">vs</span>' : '';
    return '<td class="cell cell-' . e($type) . $short . ($vs ? ' has-vs' : '') . '" data-label="' . e($label) . '">' . $vs . $html
        . ($problem !== '' ? '<p class="problem">' . e($problem) . '</p>' : '') . '</td>';
}

function table_row(string $table, int|string $i, array $row, array $problems): string
{
    $cells = '';
    foreach (TABLES[$table]['columns'] as $col => $spec) {
        $cells .= field($table, $i, $col, $spec, $row[$col] ?? ($spec[1] === 'accent' ? 'var(--green)' : ''), $problems["$i.$col"] ?? '');
    }
    return '<tr>' . $cells . '<td class="cell-tools"><div class="tools">'
        . '<button type="button" class="tool" data-move="-1" title="Move up" aria-label="Move up">↑</button>'
        . '<button type="button" class="tool" data-move="1" title="Move down" aria-label="Move down">↓</button>'
        . '<button type="button" class="tool is-danger" data-remove title="Remove this row" aria-label="Remove this row">✕</button>'
        . '</div></td></tr>';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#123f26">
  <title>Admin | EVRAA 2027</title>
  <link rel="icon" href="../images/logo-header.png">
  <link rel="stylesheet" href="admin.css?v=3">
</head>
<body>
<?php if ($fatal): ?>
  <main class="login">
    <div class="login-card">
      <h1>Admin page unavailable</h1>
      <p class="alert is-error" role="alert"><?= e($fatal) ?></p>
    </div>
  </main>

<?php elseif (!$user): ?>
  <main class="login">
    <form class="login-card" method="post" autocomplete="on">
      <img src="../images/logo-header.png" alt="" width="102" height="120">
      <p class="eyebrow">EVRAA 2027</p>
      <h1>Admin sign in</h1>
      <?php if ($loginError): ?><p class="alert is-error" role="alert"><?= e($loginError) ?></p><?php endif ?>
      <?php if ($flash): ?><p class="alert is-<?= e($flash[0]) ?>" role="status"><?= e($flash[1]) ?></p><?php endif ?>
      <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
      <input type="hidden" name="action" value="login">
      <label>Username
        <input type="text" name="username" required autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="40" value="<?= e(is_string($_POST['username'] ?? null) ? $_POST['username'] : '') ?>" autofocus>
      </label>
      <label>Password
        <input type="password" name="password" required autocomplete="current-password">
      </label>
      <button class="btn is-primary" type="submit">Sign in</button>
      <a class="quiet-link" href="../../index.html">← Back to the EVRAA 2027 site</a>
    </form>
  </main>

<?php else: ?>
  <header class="bar">
    <a class="brand" href="../../index.html" title="Open the public site"><img src="../images/logo-header.png" alt="" width="102" height="120"><span>EVRAA 2027 <b>Admin</b></span></a>
    <form method="post" class="who">
      <span>Signed in as <b><?= e($user['name']) ?></b> · <?= e(ROLES[$user['role']] ?? '') ?></span>
      <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
      <input type="hidden" name="action" value="logout">
      <button class="btn" type="submit">Sign out</button>
    </form>
  </header>

  <nav class="tabs" aria-label="Tables you can edit">
    <?php foreach ($tabs as $id): ?>
      <a href="?tab=<?= e($id) ?>"<?= $id === $tab ? ' class="is-active" aria-current="page"' : '' ?>><?= e(TABS[$id][0]) ?></a>
    <?php endforeach ?>
  </nav>

  <main class="main">
    <?php if ($flash): ?><p class="alert is-<?= e($flash[0]) ?>" role="status"><?= e($flash[1]) ?></p><?php endif ?>
    <?php if ($user['is_default']): ?>
      <p class="alert is-warn">Your account still uses the default password. <a href="?tab=account">Change it on the “My password” tab.</a></p>
    <?php endif ?>

    <?php if ($tab === 'users'): ?>
      <div class="head">
        <h1>Users</h1>
        <p>Add the people who will update the site and choose what each one may edit. New users sign in with the default password and should change it on their “My password” tab.</p>
      </div>

      <form class="panel add-user" method="post" autocomplete="off">
        <h2>Add a user</h2>
        <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
        <div class="add-fields">
          <label>Username <input type="text" name="username" required maxlength="40" pattern="[A-Za-z0-9][A-Za-z0-9._\-]{2,39}" autocapitalize="none" spellcheck="false" placeholder="e.g. juan.delacruz"></label>
          <label>Name <input type="text" name="name" required maxlength="60" placeholder="e.g. Juan dela Cruz"></label>
          <label>Role
            <select name="role" required>
              <?php foreach (ROLES as $role => $label): ?>
                <option value="<?= e($role) ?>"<?= $role === 'records' ? ' selected' : '' ?>><?= e($label) ?> — <?= e(implode(', ', array_map(fn ($id) => TABS[$id][0], array_diff(ROLE_TABS[$role], ['account'])))) ?></option>
              <?php endforeach ?>
            </select>
          </label>
          <button class="btn is-primary" type="submit" name="action" value="user_add">Add user</button>
        </div>
      </form>

      <div class="users">
        <?php foreach (db()->query('SELECT * FROM users ORDER BY id') as $account): $self = (int) $account['id'] === (int) $user['id']; ?>
          <section class="panel user">
            <div>
              <h2><?= e($account['name']) ?><?= $self ? ' <span class="pill">You</span>' : '' ?></h2>
              <p class="muted"><?= e($account['username']) ?> · <?= $account['is_default'] ? '<span class="pill is-warn">Default password</span>' : 'password set' ?></p>
            </div>
            <form method="post" class="inline">
              <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
              <input type="hidden" name="user" value="<?= (int) $account['id'] ?>">
              <label>Role
                <select name="role">
                  <?php foreach (ROLES as $role => $label): ?>
                    <option value="<?= e($role) ?>"<?= $role === $account['role'] ? ' selected' : '' ?>><?= e($label) ?></option>
                  <?php endforeach ?>
                </select>
              </label>
              <button class="btn" type="submit" name="action" value="user_role">Change role</button>
            </form>
            <p class="muted">Can edit: <?= e(implode(', ', array_map(fn ($id) => TABS[$id][0], array_diff(ROLE_TABS[$account['role']], ['account'])))) ?></p>
            <details>
              <summary>Password<?= $self ? '' : ' and removal' ?></summary>
              <form method="post" class="pw">
                <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                <input type="hidden" name="user" value="<?= (int) $account['id'] ?>">
                <label>New password <input type="password" name="password" minlength="8" required autocomplete="new-password"></label>
                <label>Type it again <input type="password" name="confirm" minlength="8" required autocomplete="new-password"></label>
                <button class="btn is-primary" type="submit" name="action" value="password">Change password</button>
              </form>
              <form method="post" class="pw" data-confirm="Put <?= e($account['name']) ?>’s password back to the default?">
                <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                <input type="hidden" name="user" value="<?= (int) $account['id'] ?>">
                <input type="hidden" name="action" value="reset">
                <button class="btn" type="submit"<?= $account['is_default'] ? ' disabled' : '' ?>>Reset to default password</button>
              </form>
              <?php if (!$self): ?>
                <form method="post" class="pw" data-confirm="Remove <?= e($account['name']) ?>? They will no longer be able to sign in.">
                  <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                  <input type="hidden" name="user" value="<?= (int) $account['id'] ?>">
                  <input type="hidden" name="action" value="user_delete">
                  <button class="btn is-danger" type="submit">Remove this user</button>
                </form>
              <?php endif ?>
            </details>
          </section>
        <?php endforeach ?>
      </div>

    <?php elseif ($tab === 'account'): ?>
      <div class="head">
        <h1>My password</h1>
        <p>Signed in as <?= e($user['username']) ?>. Changing your password signs you out on other devices.</p>
      </div>
      <form class="panel pw narrow" method="post">
        <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
        <label>Current password <input type="password" name="current" required autocomplete="current-password"></label>
        <label>New password (at least 8 characters) <input type="password" name="password" minlength="8" required autocomplete="new-password"></label>
        <label>Type the new password again <input type="password" name="confirm" minlength="8" required autocomplete="new-password"></label>
        <button class="btn is-primary" type="submit" name="action" value="own_password">Change my password</button>
      </form>

    <?php else: ?>
      <div class="head">
        <h1><?= e(TABS[$tab][0]) ?></h1>
        <a class="quiet-link" href="<?= e(TABS[$tab][2]) ?>" target="_blank" rel="noopener">View the public page ↗</a>
      </div>
      <?php
      $saves = [];
      foreach (db()->query('SELECT * FROM saves') as $save) {
          $saves[$save['dataset']] = $save;
      }
      foreach (TABS[$tab][1] as $table):
          $spec = TABLES[$table];
          $rows = $typed[$table] ?? read_rows(db(), $table);
          $found = $problems[$table] ?? [];
      ?>
        <form class="panel editor" method="post" id="<?= e($table) ?>" data-editor novalidate>
          <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
          <input type="hidden" name="action" value="save">
          <input type="hidden" name="table" value="<?= e($table) ?>">
          <div class="panel-head">
            <div>
              <h2><?= e($spec['title']) ?></h2>
              <p class="muted"><?= e($spec['help']) ?></p>
            </div>
          </div>
          <?php if ($found): ?>
            <p class="alert is-error" role="alert">Not saved yet: please fix the <?= count($found) === 1 ? 'field' : count($found) . ' fields' ?> marked in red, then save again.</p>
          <?php endif ?>
          <div class="table-wrap">
            <table class="grid grid-<?= e($table) ?>">
              <thead><tr>
                <?php foreach ($spec['columns'] as $col => [$label, $type, , $required]): ?>
                  <?php if ($col === 'team_b') { continue; } ?>
                  <?php if ($type === 'team'): ?>
                    <th class="th-team" colspan="2">VS <span class="th-note">(teams playing)</span></th>
                  <?php else: ?>
                    <th class="th-<?= e($type) ?>"><?= e($label) ?><?= $required && $type !== 'accent' && $type !== 'number' ? ' <span class="req" title="Required">*</span>' : '' ?></th>
                  <?php endif ?>
                <?php endforeach ?>
                <th class="th-tools"><span class="sr">Row tools</span></th>
              </tr></thead>
              <tbody data-rows>
                <?php foreach ($rows as $i => $row) { echo table_row($table, $i, $row, $found); } ?>
              </tbody>
            </table>
            <p class="empty" data-empty<?= $rows ? ' hidden' : '' ?>>No rows yet. Use “Add a row” to start.</p>
          </div>
          <template data-blank><?= table_row($table, '__i__', [], []) ?></template>
          <div class="actions">
            <button type="button" class="btn" data-add>+ Add a row</button>
            <span class="saved" data-status>
              <?= isset($saves[$table]) ? 'Last saved by ' . e($saves[$table]['username']) . ', ' . e(date('M j, Y g:i A', (int) $saves[$table]['at'])) : 'Not changed yet' ?>
            </span>
            <button type="submit" class="btn is-primary">Save <?= e($spec['title']) ?></button>
          </div>
        </form>
      <?php endforeach ?>
    <?php endif ?>
  </main>
  <!-- data.js provides the list of sports for the Games Schedule table -->
  <script src="../assets/data.js"></script>
<?php endif ?>
  <script src="admin.js?v=2"></script>
</body>
</html>

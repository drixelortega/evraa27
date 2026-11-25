<?php
// EVRAA 2027: the site is the static pages (index.html and the evraa folder), which work offline and install as an app.
// The earlier PHP version of the site (index.php?page=games, ...) is retired: its addresses now open the matching page,
// so old links and bookmarks keep working. Many hosts open index.php first, so the bare address gets the home page.
// (includes/ and assets/app.* belonged to that version and are no longer used.)
declare(strict_types=1);

$page = (string) ($_GET['page'] ?? '');
$tab = (string) ($_GET['tab'] ?? '');

if ($page === '' || $page === 'home') {
    if (is_file(__DIR__ . '/index.html')) {
        header('Content-Type: text/html; charset=UTF-8');
        header('Cache-Control: no-cache, must-revalidate');
        readfile(__DIR__ . '/index.html');
        exit;
    }
    $target = 'index.html';
} else {
    $target = match (true) {
        $page === 'announcements' => 'evraa/announcements.html',
        $page === 'directory' && $tab === 'billeting' => 'evraa/billeting.html',
        $page === 'directory' && preg_match('/^[a-z]+$/', $tab) === 1 => 'evraa/directory.html#' . $tab,
        $page === 'directory' => 'evraa/directory.html',
        $page === 'games' && $tab === 'venues' => 'evraa/playing-venues.html',
        $page === 'games' => 'evraa/games.html',
        $page === 'medal-tally' => 'evraa/medal-tally.html',
        $page === 'background' => 'evraa/background.html',
        default => 'index.html',
    };
}

// 302, not 301: browsers do not remember it, so the addresses stay free to use again
header('Location: ' . $target, true, 302);
exit;

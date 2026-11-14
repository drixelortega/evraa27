<?php
// EVRAA 2027 app shell: sticky top bar, the current page, and the bottom navigation bar.
// Every page is rendered here on the server (index.php?page=games works on its own, even without JavaScript).
// assets/app.js then keeps it a single-page app: links fetch index.php?page=...&partial=1, which returns only
// that page's section, and swap it in with a View Transition.
declare(strict_types=1);

// The home page is index.html. Many hosts open index.php first when both exist, so a visit to the bare address
// is handed the static home page here; the older PHP version below still answers at index.php?page=home, ?page=games, ...
if (!isset($_GET['page']) && is_file(__DIR__ . '/index.html')) {
    header('Content-Type: text/html; charset=UTF-8');
    readfile(__DIR__ . '/index.html');
    exit;
}
const EVRAA = true;
require __DIR__ . '/includes/bootstrap.php';

header('Cache-Control: no-cache, must-revalidate');

$page = (string) ($_GET['page'] ?? 'home');
if (!isset(PAGES[$page])) {
    http_response_code(404);
}

// Runs a page's include and returns its HTML; problems with data.js show as a message instead of a blank page
function render_page(string $page): string
{
    ob_start();
    try {
        if (!isset(PAGES[$page])) {
            require __DIR__ . '/includes/not-found.php';
        } else {
            require __DIR__ . '/includes/' . PAGES[$page][1];
        }
        return ob_get_clean();
    } catch (Throwable $error) {
        ob_end_clean();
        error_log('EVRAA page "' . $page . '": ' . $error->getMessage());
        http_response_code(500);
        $message = $error instanceof RuntimeException ? $error->getMessage() : 'Something went wrong while building this page.';
        return '<section data-page="' . e($page) . '" data-title="Error" class="view"><div class="card border-l-4 border-ev-flame p-5">'
            . '<p class="eyebrow">This page could not load</p><h1 class="mt-1 text-xl font-extrabold text-ev-ink">Please check the site content</h1>'
            . '<p class="mt-2 text-[15px] text-ev-muted">' . e($message) . '</p></div></section>';
    }
}

$body = render_page($page);

// Only the page section, for the in-app navigation (and the Medal Tally's live refresh)
if (isset($_GET['partial'])) {
    header('Content-Type: text/html; charset=utf-8');
    echo $body;
    exit;
}

$title = isset(PAGES[$page]) ? PAGES[$page][0] : 'Page not found';
$cd = countdown();
$badge = $cd['phase'] === 'soon' ? number_format($cd['days']) . ' days' : ($cd['phase'] === 'live' ? 'Live now' : 'Concluded');
$latest = content()['ANNOUNCEMENTS'][0]['title'] ?? '';
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#123f26">
  <meta name="description" content="Eastern Visayas Regional Athletic Association (EVRAA) 2027, March 31 – April 5, 2027, hosted by Calbayog City and Catbalogan City.">
  <title><?= e($page === 'home' ? 'EVRAA 2027 | Calbayog' : "{$title} | EVRAA 2027") ?></title>
  <link rel="icon" href="evraa/images/EVRAA%2027%20Logo.png?v=2">
  <link rel="apple-touch-icon" href="evraa/images/EVRAA%2027%20Logo.png?v=2">

  <!-- Tailwind (Play CDN). Brand colours: bg-ev-forest, text-ev-flame, ...; shadow-soft for cards -->
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ev: { paper: '#f4f6f1', ink: '#0f2117', muted: '#4a5a51', line: '#dde5da', forest: '#123f26', green: '#1d6b3a', leaf: '#c9ec7a', flame: '#ef6a1f', gold: '#f2b330', teal: '#139fbf', sky: '#2c7fd6' },
          },
          boxShadow: {
            soft: '0 1px 2px rgba(15, 33, 23, .05), 0 8px 24px rgba(15, 33, 23, .07)',
            lift: '0 2px 4px rgba(15, 33, 23, .06), 0 16px 36px rgba(15, 33, 23, .12)',
          },
          fontFamily: { sans: ['"Avenir Next"', 'Avenir', '"Segoe UI"', 'system-ui', 'sans-serif'] },
        },
      },
    };
  </script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
  <link rel="stylesheet" href="assets/app.css?v=1">
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <script defer src="assets/app.js?v=1"></script>
</head>
<body class="min-h-screen bg-ev-paper font-sans text-ev-ink antialiased" data-opening="<?= e(OPENING) ?>" data-closing="<?= e(CLOSING) ?>">
  <a href="#view" class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ev-forest focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
  <div class="progress" id="progress" aria-hidden="true"></div>

  <!-- ===== Top bar ===== -->
  <header class="topbar sticky top-0 z-40 border-b border-ev-line/80 bg-ev-paper/85 backdrop-blur-md" style="padding-top: env(safe-area-inset-top)">
    <div class="spectrum h-1"></div>
    <div class="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
      <a href="./" class="tap flex items-center gap-2.5 rounded-xl">
        <img src="evraa/images/EVRAA%2027%20Logo.png?v=2" alt="" width="34" height="40" class="h-9 w-auto">
        <span class="text-[15px] font-extrabold tracking-[.08em] text-ev-forest">EVRAA 2027</span>
      </a>
      <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Sections">
        <?php foreach (PAGES as $id => [, , $label]): ?>
          <a href="<?= e(page_url($id)) ?>" data-nav="<?= e($id) ?>" class="nav-pill tap"<?= $id === $page ? ' aria-current="page"' : '' ?>><?= e($id === 'announcements' ? 'Announcements' : $label) ?></a>
        <?php endforeach ?>
      </nav>
      <a href="./" class="tap ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ev-gold to-ev-flame px-3 py-1.5 text-xs font-extrabold text-ev-ink shadow-soft" data-countdown-badge
         aria-label="<?= e($cd['phase'] === 'soon' ? "{$badge} until the opening ceremony" : $badge) ?>">
        <span class="h-1.5 w-1.5 rounded-full bg-ev-ink<?= $cd['phase'] === 'live' ? ' animate-ping' : '' ?>"></span>
        <span class="tabular-nums" data-badge-text><?= e($badge) ?></span>
      </a>
    </div>
  </header>

  <!-- ===== Current page ===== -->
  <main id="view" class="view-root mx-auto max-w-5xl px-4 pb-10 pt-5 focus:outline-none" tabindex="-1">
    <?= $body ?>
  </main>

  <footer class="pb-nav mx-auto max-w-5xl px-4">
    <div class="flex flex-col gap-1 border-t border-ev-line pt-4 text-xs text-ev-muted sm:flex-row sm:justify-between">
      <span>Eastern Visayas Regional Athletic Association 2027</span>
      <span>Calbayog City · March 31 – April 5, 2027</span>
    </div>
  </footer>

  <!-- ===== Bottom navigation (phones and tablets) ===== -->
  <nav class="tabbar fixed inset-x-0 bottom-0 z-40 border-t border-ev-line bg-white/95 backdrop-blur-md lg:hidden" style="padding-bottom: env(safe-area-inset-bottom)" aria-label="Main" data-latest="<?= e($latest) ?>">
    <div class="mx-auto grid h-16 max-w-lg grid-cols-5">
      <?php foreach (BOTTOM_NAV as $id): [, , $label, $ico] = PAGES[$id]; ?>
        <a href="<?= e(page_url($id)) ?>" data-nav="<?= e($id) ?>" class="tab-item tap"<?= $id === $page ? ' aria-current="page"' : '' ?>>
          <span class="tab-icon"><?= icon($ico, 'h-[22px] w-[22px]') ?></span>
          <span><?= e($label) ?></span>
          <?php if ($id === 'announcements'): ?><span class="new-dot" hidden data-news-dot aria-label="new"></span><?php endif ?>
        </a>
      <?php endforeach ?>
    </div>
  </nav>

  <!-- Game schedule sheet, filled from the sport's <template> on the Games page -->
  <dialog id="sheet" class="sheet" aria-labelledby="sheet-title"></dialog>
</body>
</html>

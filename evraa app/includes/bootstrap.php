<?php
// EVRAA 2027 app: shared setup for index.php and the pages in this folder.
// Content is read from evraa/assets/data.js, the same file the older evraa/*.html pages use,
// so announcements, venues, hotlines and the medal tally are still edited in one place.
declare(strict_types=1);
defined('EVRAA') || exit;

date_default_timezone_set('Asia/Manila');

const DATA_FILE = __DIR__ . '/../evraa/assets/data.js';
const OPENING = '2027-03-31T14:00:00+08:00';
const CLOSING = '2027-04-06T00:00:00+08:00';

// id => [page title, include file, short nav label, icon]. The order sets the slide direction between pages.
const PAGES = [
    'home' => ['Home', 'home.php', 'Home', 'home'],
    'announcements' => ['Announcements', 'announcements.php', 'News', 'bell'],
    'directory' => ['Directory', 'directory.php', 'Directory', 'map'],
    'games' => ['Games & Venues', 'games.php', 'Games', 'ball'],
    'medal-tally' => ['Medal Tally', 'medal-tally.php', 'Medals', 'medal'],
    'background' => ['EVRAA 2027 Background', 'background.php', 'About', 'info'],
];
// Pages in the bottom bar on phones (the header shows all of them on larger screens)
const BOTTOM_NAV = ['home', 'announcements', 'directory', 'games', 'medal-tally'];

// Card accents, matching the colours data.js uses (var(--green), var(--flame), ...)
const ACCENTS = ['var(--green)', 'var(--teal)', 'var(--gold)', 'var(--flame)', 'var(--sky)'];

// Medal Tally logos in assets/logos (small copies of evraa/DO Logos)
const LOGOS = [
    'Baybay City' => 'baybay-city', 'Biliran' => 'biliran', 'Borongan City' => 'borongan', 'Calbayog City' => 'calbayog',
    'Catbalogan City' => 'catbalogan', 'Eastern Samar' => 'eastern-samar', 'Leyte' => 'leyte', 'Maasin City' => 'maasin',
    'Northern Samar' => 'northern-samar', 'Ormoc City' => 'ormoc', 'Samar' => 'samar', 'Southern Leyte' => 'southern-leyte',
    'Tacloban City' => 'tacloban',
];

// ---------- Output helpers ----------

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Link to a page of the app; extra query values (e.g. ['tab' => 'hotlines']) are appended
function page_url(string $page, array $query = []): string
{
    $query = $page === 'home' ? $query : ['page' => $page] + $query;
    return $query ? '?' . http_build_query($query) : './';
}

// Links written in data.js for the older pages (index.html#billeting, evraa/games.html) open the matching page here
function content_link(string $path): string
{
    $moved = [
        'index.html#billeting' => page_url('directory', ['tab' => 'billeting']),
        'evraa/background.html#billeting' => page_url('directory', ['tab' => 'billeting']),
        'evraa/background.html' => page_url('background'),
        'evraa/announcements.html' => page_url('announcements'),
        'evraa/directory.html' => page_url('directory'),
        'evraa/medal-tally.html' => page_url('medal-tally'),
        'evraa/games.html' => page_url('games'),
        'evraa/playing-venues.html' => page_url('games', ['tab' => 'venues']) . '#venues',
        'evraa/special-events.html' => page_url('announcements') . '#events',
        'index.html' => page_url('home'),
    ];
    return $moved[$path] ?? $path;
}

function slug(string $text): string
{
    return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($text)), '-');
}

function maps_search(string $query): string
{
    return 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($query);
}

function maps_directions(float $lat, float $lng): string
{
    return "https://www.google.com/maps/dir/?api=1&destination={$lat},{$lng}";
}

function tel_link(string $number): string
{
    return 'tel:' . preg_replace('/[^\d+]/', '', $number);
}

// ---------- Dates, in Philippine time ----------

function ph_date(string $iso, string $format = 'F j, Y'): string
{
    return (new DateTimeImmutable("{$iso} 12:00"))->format($format);
}

// Whole calendar days from today to $iso (negative once it has passed)
function days_until(string $iso): int
{
    $today = new DateTimeImmutable('today');
    $day = new DateTimeImmutable($iso);
    return (int) $today->diff($day)->format('%r%a');
}

// The opening-ceremony countdown as rendered on first load; assets/app.js keeps it ticking
function countdown(): array
{
    $now = time();
    $left = strtotime(OPENING) - $now;
    if ($left <= 0) {
        return ['phase' => $now < strtotime(CLOSING) ? 'live' : 'done'];
    }
    return [
        'phase' => 'soon',
        'days' => intdiv($left, 86400),
        'hours' => sprintf('%02d', intdiv($left % 86400, 3600)),
        'mins' => sprintf('%02d', intdiv($left % 3600, 60)),
        'secs' => sprintf('%02d', $left % 60),
    ];
}

// ---------- Content from data.js ----------

// Every list in data.js, keyed by its name (ANNOUNCEMENTS, SPORTS, SCHOOLS, ...)
function content(): array
{
    static $data = null;
    if ($data === null) {
        $source = @file_get_contents(DATA_FILE);
        // The lists edited on the admin page (evraa/admin) are saved next to it
        $live = @file_get_contents(dirname(DATA_FILE) . '/data-live.js');
        $source = $source === false ? false : $source . "\n" . ($live === false ? '' : $live);
        if ($source === false) {
            throw new RuntimeException('evraa/assets/data.js could not be read.');
        }
        $data = JsData::parse($source) + [
            'ANNOUNCEMENTS' => [], 'SPORTS' => [], 'SCHEDULE' => [], 'SCHOOLS' => [], 'PLACES' => [],
            'HOTLINES' => [], 'CONTACTS' => [], 'TALLY' => [], 'EVENTS' => [],
        ];
    }
    return $data;
}

// Sports with their venues and schedule. Each venue: name, lat, lng (null until located), approx
function sports(): array
{
    $schedule = content()['SCHEDULE'];
    $list = [];
    foreach (content()['SPORTS'] as $i => $row) {
        [$sport, $venues] = $row + [1 => []];
        $games = $schedule[$sport] ?? [];
        usort($games, fn ($a, $b) => strcmp($a[0], $b[0]));
        $list[] = [
            'i' => $i,
            'sport' => $sport,
            'slug' => slug($sport),
            'note' => $row[2] ?? '',
            'accent' => ACCENTS[$i % count(ACCENTS)],
            'schedule' => $games,
            'venues' => array_map(fn ($v) => [
                'name' => $v[0],
                'lat' => is_numeric($v[1] ?? null) ? (float) $v[1] : null,
                'lng' => is_numeric($v[2] ?? null) ? (float) $v[2] : null,
                'approx' => !empty($v[3]),
            ], $venues),
        ];
    }
    return $list;
}

// Medal standings: ranked by gold, then silver, then bronze; tied delegations share a rank
function standings(): array
{
    $rows = array_map(fn ($r) => [
        'name' => $r[0], 'g' => (int) $r[1], 's' => (int) $r[2], 'b' => (int) $r[3],
        't' => (int) $r[1] + (int) $r[2] + (int) $r[3],
        'logo' => isset(LOGOS[$r[0]]) ? 'assets/logos/' . LOGOS[$r[0]] . '.png' : '',
    ], content()['TALLY']);
    usort($rows, fn ($x, $y) => [$y['g'], $y['s'], $y['b'], $x['name']] <=> [$x['g'], $x['s'], $x['b'], $y['name']]);
    foreach ($rows as $i => &$row) {
        $prev = $rows[$i - 1] ?? null;
        $row['rank'] = $prev && [$prev['g'], $prev['s'], $prev['b']] === [$row['g'], $row['s'], $row['b']] ? $prev['rank'] : $i + 1;
    }
    return $rows;
}

// Reads the `const NAME = [...]` lists in data.js: arrays, objects, quoted strings, numbers, true/false/null,
// comments and trailing commas. Anything else stops with the line number, so a typo is easy to find.
final class JsData
{
    private int $i = 0;
    private int $n;

    private function __construct(private string $s)
    {
        $this->n = strlen($s);
    }

    public static function parse(string $source): array
    {
        $p = new self($source);
        $out = [];
        while (true) {
            $p->space();
            if ($p->i >= $p->n) {
                return $out;
            }
            if (!preg_match('/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/A', $p->s, $m, 0, $p->i)) {
                $p->fail('expected a list like "const NAME = [ ... ];"');
            }
            $p->i += strlen($m[0]);
            $out[$m[1]] = $p->value();
            $p->space();
            if (($p->s[$p->i] ?? '') === ';') {
                $p->i++;
            }
        }
    }

    private function value(): mixed
    {
        $this->space();
        $c = $this->s[$this->i] ?? '';
        if ($c === '[') {
            return $this->items(']', fn () => $this->value());
        }
        if ($c === '{') {
            $object = [];
            $this->items('}', function () use (&$object) {
                $key = $this->key();
                $this->space();
                $this->expect(':');
                $object[$key] = $this->value();
            });
            return $object;
        }
        if ($c === "'" || $c === '"') {
            return $this->string();
        }
        if (preg_match('/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/A', $this->s, $m, 0, $this->i)) {
            $this->i += strlen($m[0]);
            return str_contains($m[0], '.') || stripos($m[0], 'e') !== false ? (float) $m[0] : (int) $m[0];
        }
        foreach (['true' => true, 'false' => false, 'null' => null] as $word => $literal) {
            if (substr_compare($this->s, $word, $this->i, strlen($word)) === 0) {
                $this->i += strlen($word);
                return $literal;
            }
        }
        $this->fail('unexpected "' . substr($this->s, $this->i, 12) . '"');
    }

    // Comma-separated entries up to $close; a trailing comma is fine
    private function items(string $close, callable $entry): array
    {
        $list = [];
        $this->i++;
        while (true) {
            $this->space();
            if (($this->s[$this->i] ?? '') === $close) {
                $this->i++;
                return $list;
            }
            $value = $entry();
            if ($close === ']') {
                $list[] = $value;
            }
            $this->space();
            $c = $this->s[$this->i] ?? '';
            if ($c === ',') {
                $this->i++;
            } elseif ($c !== $close) {
                $this->fail("expected a comma or \"{$close}\"");
            }
        }
    }

    private function key(): string
    {
        $this->space();
        $c = $this->s[$this->i] ?? '';
        if ($c === "'" || $c === '"') {
            return $this->string();
        }
        if (!preg_match('/[A-Za-z_$][\w$]*/A', $this->s, $m, 0, $this->i)) {
            $this->fail('expected a field name');
        }
        $this->i += strlen($m[0]);
        return $m[0];
    }

    private function string(): string
    {
        $quote = $this->s[$this->i++];
        $out = '';
        $escapes = ['n' => "\n", 't' => "\t", 'r' => "\r", 'b' => "\x08", 'f' => "\f", 'v' => "\v", '0' => "\0"];
        while ($this->i < $this->n) {
            $c = $this->s[$this->i++];
            if ($c === $quote) {
                return $out;
            }
            if ($c === "\n") {
                $this->fail('a text value is missing its closing quote');
            }
            if ($c !== '\\') {
                $out .= $c;
                continue;
            }
            $c = $this->s[$this->i++] ?? '';
            if (isset($escapes[$c])) {
                $out .= $escapes[$c];
            } elseif ($c === 'u' && preg_match('/\{([0-9a-fA-F]+)\}|[0-9a-fA-F]{4}/A', $this->s, $m, 0, $this->i)) {
                $this->i += strlen($m[0]);
                $out .= mb_chr(hexdec($m[1] ?? $m[0]), 'UTF-8');
            } elseif ($c === 'x' && preg_match('/[0-9a-fA-F]{2}/A', $this->s, $m, 0, $this->i)) {
                $this->i += 2;
                $out .= mb_chr(hexdec($m[0]), 'UTF-8');
            } elseif ($c !== "\n") {
                $out .= $c; // \' \" \\ and any other escaped character stand for themselves
            }
        }
        $this->fail('a text value is missing its closing quote');
    }

    private function space(): void
    {
        while (preg_match('/\s+|\/\/[^\n]*|\/\*.*?\*\//As', $this->s, $m, 0, $this->i)) {
            $this->i += strlen($m[0]);
        }
    }

    private function expect(string $char): void
    {
        if (($this->s[$this->i] ?? '') !== $char) {
            $this->fail("expected \"{$char}\"");
        }
        $this->i++;
    }

    private function fail(string $message): never
    {
        $line = substr_count($this->s, "\n", 0, min($this->i, $this->n)) + 1;
        throw new RuntimeException("evraa/assets/data.js, line {$line}: {$message}.");
    }
}

// ---------- Icons (24×24 line icons, drawn in currentColor) ----------

const ICONS = [
    'home' => '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    'bell' => '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    'map' => '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    'ball' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/><path d="M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8"/>',
    'medal' => '<path d="M7 3h4l1 5M17 3h-4l-1 5"/><circle cx="12" cy="15" r="6"/><path d="M12 12.5v5"/>',
    'info' => '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    'phone' => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    'bed' => '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
    'bus' => '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v2M16 18v2"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>',
    'pin' => '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    'user' => '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    'school' => '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c2.5 2 7.5 2 10 0v-4.5"/>',
    'star' => '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    'torch' => '<path d="M9 11h6l-1.5 10h-3z"/><path d="M12 3c2.5 2 3 4.5 1.5 6.5M12 3c-2.5 2-3 4.5-1.5 6.5"/>',
    'search' => '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    'arrow' => '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'external' => '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    'close' => '<path d="M6 6l12 12M18 6L6 18"/>',
    'calendar' => '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'qr' => '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2"/>',
];

// Sport icons, the same set the older pages use
const SPORT_ICONS = [
    'Archery' => '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4.5"/><circle cx="11" cy="13" r="1"/><path d="M11 13l9-9M17 4h3v3"/>',
    'Arnis' => '<path d="M5 19L19 5M5 5l14 14"/><path d="M3.5 17.5l3 3M17.5 3.5l3 3M3.5 6.5l3-3M17.5 20.5l3-3"/>',
    'Athletics' => '<circle cx="15" cy="4.5" r="2"/><path d="M13.5 8L10.5 13.5l3.5 2.5-1 5"/><path d="M7.5 10l4-2.5 3 3h3"/><path d="M10.5 13.5l-2 3.5H5"/>',
    'Badminton' => '<circle cx="12" cy="18.5" r="2.5"/><path d="M10 16.5L7 5M14 16.5L17 5M12 16V4.5"/><path d="M7 5q5-2 10 0M8.3 10.5h7.4"/>',
    'Baseball' => '<circle cx="12" cy="12" r="9"/><path d="M6.5 5c2.6 3.8 2.6 10.2 0 14M17.5 5c-2.6 3.8-2.6 10.2 0 14"/>',
    'Softball' => '<path d="M7.5 16.5L16 8a2.1 2.1 0 0 1 3 3l-8.5 8.5z"/><path d="M8.5 18l-4 4M3.5 21l2 2"/><circle cx="7" cy="7" r="3"/>',
    'Basketball' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/><path d="M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8"/>',
    'Boxing' => '<path d="M8 16V8a5 5 0 0 1 5-5h1a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9a1 1 0 0 1-1-1z"/><path d="M8 10H6.5a2 2 0 0 0 0 4H11"/><path d="M9 17v4h8v-4.5"/>',
    'Football' => '<circle cx="12" cy="12" r="9"/><path d="M12 8.5l3.3 2.4-1.3 3.9h-4l-1.3-3.9z"/><path d="M12 8.5V3M15.3 10.9l5.2-1.7M14 14.8l3.2 4.4M10 14.8l-3.2 4.4M8.7 10.9L3.5 9.2"/>',
    'Gymnastics' => '<path d="M8 2v10M16 2v10"/><circle cx="8" cy="15.5" r="3.5"/><circle cx="16" cy="15.5" r="3.5"/>',
    'Special Games' => '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    'Taekwondo' => '<path d="M3 9.5h18v3H3z"/><path d="M10 8.5h4v5h-4z"/><path d="M10.5 13.5L8 20.5M13.5 13.5l2.5 7"/>',
    'Lawn Tennis' => '<ellipse cx="10" cy="10" rx="5.5" ry="6.5" transform="rotate(-45 10 10)"/><path d="M14 14l6 6"/><path d="M7 8.5l4.5 4.5M8.5 7l4.5 4.5"/><circle cx="19" cy="5" r="1.8"/>',
    'Volleyball' => '<circle cx="12" cy="12" r="9"/><path d="M12 12V3"/><path d="M12 12l7.8 4.5"/><path d="M12 12l-7.8 4.5"/><path d="M8 4c-.5 4 1 7 4 8M20.6 9.5c-3.5-1.5-6.8-.6-8.6 2.5M7.4 19.5c3-2.4 4.6-5.3 4.6-7.5"/>',
    'Wrestling' => '<path d="M8.5 3v3.5a3.5 3.5 0 0 0 7 0V3"/><path d="M8.5 6.5L7 21h4l1-6 1 6h4L15.5 6.5"/>',
    'Wushu' => '<circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9"/><circle cx="12" cy="7.5" r=".8"/><circle cx="12" cy="16.5" r=".8"/>',
    'Weightlifting' => '<path d="M5 12h14"/><path d="M5 7.5v9M8 6v12M16 6v12M19 7.5v9"/><path d="M5 7.5H3.5v9H5M19 7.5h1.5v9H19" /><path d="M2.5 12h1M20.5 12h1"/>',
];

function svg(string $paths, string $class = 'h-6 w-6', float $stroke = 1.8): string
{
    return '<svg class="' . e($class) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' . $stroke
        . '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $paths . '</svg>';
}

function icon(string $name, string $class = 'h-6 w-6', float $stroke = 1.8): string
{
    return svg(ICONS[$name] ?? '', $class, $stroke);
}

// A sport's icon, or its first letter when there isn't one
function sport_icon(string $sport, string $class = 'h-6 w-6'): string
{
    return isset(SPORT_ICONS[$sport]) ? svg(SPORT_ICONS[$sport], $class) : '<span class="font-extrabold">' . e(mb_substr($sport, 0, 1)) . '</span>';
}

// Small shared pieces of markup used by several pages

function page_head(string $eyebrow, string $title, string $lead = ''): string
{
    return '<header class="mb-5"><p class="eyebrow">' . e($eyebrow) . '</p><h1 class="mt-1 text-[1.75rem] font-extrabold leading-tight text-ev-ink sm:text-4xl">'
        . e($title) . '</h1>' . ($lead !== '' ? '<p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-ev-muted">' . e($lead) . '</p>' : '') . '</header>';
}

function tba(): string
{
    return '<span class="tba">To be announced</span>';
}

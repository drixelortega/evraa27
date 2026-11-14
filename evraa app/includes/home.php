<?php
// Home: welcome card, live countdown to the opening ceremony, and quick-access cards to every section
defined('EVRAA') || exit;

$data = content();
$cd = countdown();
$latest = $data['ANNOUNCEMENTS'][0] ?? null;
$sports = sports();
$venueCount = count(array_unique(array_merge(...array_map(fn ($s) => array_column($s['venues'], 'name'), $sports ?: [['venues' => []]]))));

$cards = [
    ['background', page_url('background'), 'EVRAA 2027 Background', 'Theme, logo meaning, mascots, medals & trophies', 'torch', 'var(--flame)'],
    ['directory', page_url('directory'), 'Directory', count($data['SCHOOLS']) . ' billeting schools, hotlines & shuttle', 'map', 'var(--teal)'],
    ['medal-tally', page_url('medal-tally'), 'Medal Tally', count($data['TALLY']) . ' delegations · live standings', 'medal', 'var(--gold)'],
    ['games', page_url('games'), 'Games', count($sports) . " sports · {$venueCount} playing venues", 'ball', 'var(--green)'],
    ['announcements', page_url('announcements'), 'Announcements', $latest ? $latest['title'] : 'News and advisories', 'bell', 'var(--sky)'],
];
?>
<section class="view space-y-4" data-page="home" data-title="EVRAA 2027 | Calbayog &amp; Catbalogan">

  <!-- Welcome -->
  <div class="card stagger relative overflow-hidden p-5 sm:p-7">
    <div class="flex items-center gap-4 sm:gap-8">
      <div class="min-w-0 flex-1">
        <p class="eyebrow">March 31 – April 5, 2027</p>
        <h1 class="mt-1.5 text-[2rem] font-extrabold leading-[1.05] text-ev-forest sm:text-5xl">EVRAA 2027</h1>
        <p class="mt-1 text-[15px] font-bold text-ev-green sm:text-lg">Eastern Visayas Regional Athletic Association</p>
        <p class="mt-3 text-[15px] leading-relaxed text-ev-muted">One Region. One Spirit. One Victory.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="chip"><span class="h-2 w-2 rounded-full bg-ev-flame"></span>Calbayog City</span>
          <span class="chip"><span class="h-2 w-2 rounded-full bg-ev-teal"></span>Catbalogan City</span>
        </div>
      </div>
      <img src="evraa/images/Animated%20EVRAA27.gif?v=1" alt="EVRAA 2027 animated logo — One Region. One Spirit. One Victory. Calbayog | Catbalogan"
           width="400" height="490" class="h-36 w-auto shrink-0 object-cover object-[50%_32%] mix-blend-multiply [aspect-ratio:400/490] sm:h-56">
    </div>
  </div>

  <!-- Countdown -->
  <div class="countdown-card relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-ev-forest to-ev-green p-5 text-white shadow-lift sm:p-7" data-countdown role="timer"
       aria-label="<?= e($cd['phase'] === 'soon' ? "{$cd['days']} days left until the EVRAA 2027 opening ceremony" : 'EVRAA 2027') ?>">
    <div class="spectrum absolute inset-x-0 top-0 h-1"></div>
    <div data-phase="soon"<?= $cd['phase'] === 'soon' ? '' : ' hidden' ?>>
      <p class="text-xs font-extrabold uppercase tracking-[.14em] text-ev-leaf">Countdown to the opening ceremony</p>
      <div class="mt-3 grid grid-cols-4 gap-2 text-center sm:gap-3">
        <?php foreach (['days' => 'Days', 'hours' => 'Hours', 'mins' => 'Mins', 'secs' => 'Secs'] as $unit => $label): ?>
          <div class="rounded-2xl bg-white/10 px-1 py-3 ring-1 ring-inset ring-white/15">
            <strong class="block text-[1.65rem] font-extrabold leading-none tabular-nums sm:text-5xl" data-unit="<?= $unit ?>"><?= e($cd[$unit] ?? '—') ?></strong>
            <span class="mt-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/75"><?= $label ?></span>
          </div>
        <?php endforeach ?>
      </div>
      <p class="mt-3 text-sm text-white/85">The games open March 31, 2027 in Calbayog City and Catbalogan City.</p>
    </div>
    <div data-phase="live"<?= $cd['phase'] === 'live' ? '' : ' hidden' ?>>
      <p class="text-xs font-extrabold uppercase tracking-[.14em] text-ev-leaf">Happening now</p>
      <p class="mt-1 text-2xl font-extrabold">EVRAA 2027 is underway!</p>
      <p class="mt-1 text-sm text-white/85">March 31 – April 5, 2027 · Calbayog City and Catbalogan City</p>
    </div>
    <div data-phase="done"<?= $cd['phase'] === 'done' ? '' : ' hidden' ?>>
      <p class="text-xs font-extrabold uppercase tracking-[.14em] text-ev-leaf">Thank you, Eastern Visayas</p>
      <p class="mt-1 text-2xl font-extrabold">EVRAA 2027 has concluded</p>
      <p class="mt-1 text-sm text-white/85">One Region. One Spirit. One Victory.</p>
    </div>
  </div>

  <!-- Quick access -->
  <div>
    <h2 class="mb-3 mt-2 px-1 text-xs font-extrabold uppercase tracking-[.14em] text-ev-muted">Quick access</h2>
    <ul class="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
      <?php foreach ($cards as [$id, $href, $label, $note, $ico, $accent]): ?>
        <li>
          <a href="<?= e($href) ?>" class="card tap flex h-full min-h-[148px] flex-col p-4" style="--accent: <?= e($accent) ?>">
            <span class="accent-tile"><?= icon($ico) ?></span>
            <?php if ($id === 'announcements'): ?><span class="new-badge" hidden data-news-dot>New</span><?php endif ?>
            <strong class="mt-auto pt-4 text-[15px] font-extrabold leading-tight text-ev-ink"><?= e($label) ?></strong>
            <span class="mt-1 line-clamp-2 text-[13px] leading-snug text-ev-muted"><?= e($note) ?></span>
          </a>
        </li>
      <?php endforeach ?>
    </ul>
  </div>

  <!-- About -->
  <a href="<?= e(page_url('background')) ?>" class="card tap block p-5">
    <p class="text-[15px] leading-relaxed text-ev-muted"><strong class="text-ev-ink">EVRAA 2027 is more than a sporting event.</strong>
      It is our commitment to excellence, our celebration of unity, and our opportunity to showcase the very best of Calbayog City and Catbalogan City.</p>
    <span class="link mt-3">Read the background <?= icon('arrow', 'h-4 w-4') ?></span>
  </a>

  <!-- QR code -->
  <div class="card flex items-center gap-4 p-4 sm:p-5">
    <img src="evraa/images/QR.png?v=1" alt="QR code that opens the EVRAA 2027 website" width="724" height="724" loading="lazy" class="h-24 w-24 shrink-0 rounded-xl bg-white p-1 ring-1 ring-ev-line sm:h-28 sm:w-28">
    <div>
      <p class="eyebrow">Follow along on your phone</p>
      <h2 class="mt-1 text-lg font-extrabold leading-tight text-ev-ink">Scan to open this site</h2>
      <p class="mt-1 text-sm leading-relaxed text-ev-muted">Point your phone's camera at the code for the games schedule, the playing venues and live medal standings.</p>
    </div>
  </div>
</section>

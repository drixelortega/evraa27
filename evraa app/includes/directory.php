<?php
// Directory: billeting schools with their map, hotlines, accommodation and food, shuttle routes, directions and contacts.
// Each tab is its own link (?page=directory&tab=hotlines); assets/app.js switches tabs in place without reloading.
defined('EVRAA') || exit;

$data = content();
$tabs = [
    'billeting' => ['Billeting', 'school'],
    'hotlines' => ['Hotlines', 'phone'],
    'stay' => ['Stay & eat', 'bed'],
    'shuttle' => ['Shuttle', 'bus'],
    'directions' => ['Directions', 'pin'],
    'contacts' => ['Contacts', 'user'],
];
$tab = isset($tabs[$_GET['tab'] ?? '']) ? $_GET['tab'] : 'billeting';

$schools = array_map(fn ($s) => [
    'name' => $s[0], 'lat' => (float) $s[1], 'lng' => (float) $s[2], 'approx' => !empty($s[3]),
    'directions' => !empty($s[3]) ? maps_search("{$s[0]}, Calbayog City, Samar") : maps_directions((float) $s[1], (float) $s[2]),
], $data['SCHOOLS']);

// An empty-state card for sections still being prepared
function coming_soon(string $ico, string $title, string $text, string $link = '', string $linkText = ''): string
{
    return '<div class="card border-2 border-dashed border-ev-line p-6 text-center shadow-none">'
        . '<span class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ev-paper text-ev-green">' . icon($ico) . '</span>'
        . '<h3 class="mt-3 text-lg font-extrabold text-ev-ink">' . e($title) . '</h3>'
        . '<p class="mx-auto mt-1 max-w-md text-[15px] leading-relaxed text-ev-muted">' . e($text) . '</p>'
        . ($link ? '<a href="' . e($link) . '" class="link mt-3 justify-center">' . e($linkText) . ' ' . icon('arrow', 'h-4 w-4') . '</a>' : '')
        . '</div>';
}
?>
<section class="view" data-page="directory" data-title="Directory | EVRAA 2027">
  <?= page_head('Getting around', 'Directory', 'Where delegations stay, who to call, and how to get around Calbayog City and Catbalogan City.') ?>

  <nav class="no-scrollbar sticky top-[calc(3.75rem+env(safe-area-inset-top))] z-20 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-ev-paper/90 px-4 py-2 backdrop-blur-md" aria-label="Directory sections" data-tabs>
    <?php foreach ($tabs as $id => [$label, $ico]): ?>
      <a href="<?= e(page_url('directory', ['tab' => $id])) ?>" data-tab="<?= $id ?>" class="seg tap"<?= $id === $tab ? ' aria-current="page"' : '' ?>><?= icon($ico, 'h-4 w-4') ?><?= e($label) ?></a>
    <?php endforeach ?>
  </nav>

  <!-- Billeting schools and map -->
  <div class="panel" data-panel="billeting"<?= $tab === 'billeting' ? '' : ' hidden' ?>>
    <p class="mb-3 text-[15px] text-ev-muted"><?= count($schools) ?> schools in Calbayog City serve as billeting quarters. Tap a school to find it on the map.</p>
    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div class="card overflow-hidden md:order-2 md:sticky md:top-32 md:self-start" data-module="billeting-map">
        <div class="map h-[300px] md:h-[480px]" role="region" aria-label="Map of the billeting schools"></div>
        <script type="application/json"><?= json_encode($schools, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?></script>
      </div>
      <ol class="space-y-2" data-school-list>
        <?php foreach ($schools as $i => $s): ?>
          <li class="row">
            <button type="button" class="row-main tap" data-school="<?= $i ?>">
              <span class="pin-num<?= $s['approx'] ? ' is-approx' : '' ?>"><?= $i + 1 ?></span>
              <span class="min-w-0 flex-1 font-bold leading-snug text-ev-ink"><?= e($s['name']) ?><?php if ($s['approx']): ?><small class="block text-xs font-semibold text-ev-muted">Approximate location</small><?php endif ?></span>
            </button>
            <a href="<?= e($s['directions']) ?>" target="_blank" rel="noopener" class="row-action tap" aria-label="Directions to <?= e($s['name']) ?> in Google Maps"><?= icon('external', 'h-5 w-5') ?></a>
          </li>
        <?php endforeach ?>
      </ol>
    </div>
    <p class="mt-3 text-xs text-ev-muted">Map data © OpenStreetMap contributors. Gray pins are approximate.</p>
  </div>

  <!-- Hotlines -->
  <div class="panel" data-panel="hotlines"<?= $tab === 'hotlines' ? '' : ' hidden' ?>>
    <div class="mb-3 flex items-center gap-3 rounded-2xl bg-ev-flame px-4 py-3 text-white shadow-soft">
      <?= icon('phone', 'h-5 w-5 shrink-0') ?>
      <p class="text-[15px] font-bold">In an emergency, call <a href="tel:911" class="underline decoration-2 underline-offset-2">911</a> first.</p>
    </div>
    <ul class="grid gap-3 sm:grid-cols-2">
      <?php foreach ($data['HOTLINES'] as [$label, $number, $accent]): ?>
        <li class="card flex items-center gap-3 p-4" style="--accent: <?= e($accent) ?>">
          <span class="accent-tile h-11 w-11 shrink-0"><?= icon('phone', 'h-5 w-5') ?></span>
          <div class="min-w-0 flex-1">
            <h3 class="font-extrabold leading-snug text-ev-ink"><?= e($label) ?></h3>
            <?= $number !== '' ? '<a href="' . e(tel_link($number)) . '" class="text-lg font-extrabold tabular-nums text-ev-green">' . e($number) . '</a>' : tba() ?>
          </div>
          <?php if ($number !== ''): ?>
            <a href="<?= e(tel_link($number)) ?>" class="btn tap shrink-0" aria-label="Call <?= e($label) ?>">Call</a>
          <?php endif ?>
        </li>
      <?php endforeach ?>
    </ul>
  </div>

  <!-- Accommodation and food -->
  <div class="panel space-y-3" data-panel="stay"<?= $tab === 'stay' ? '' : ' hidden' ?>>
    <?= coming_soon('bed', 'Hotels & lodging coming soon', 'A list of hotels, inns and lodging houses in Calbayog City and Catbalogan City will be posted here for guests, parents and visiting officials.', page_url('directory', ['tab' => 'billeting']), 'Delegations: see the billeting schools') ?>
    <?= coming_soon('star', 'Food hub & restaurant guide coming soon', 'Where to eat near the playing venues and billeting schools, including food stalls, restaurants and local delicacies from Calbayog and Catbalogan.') ?>
  </div>

  <!-- Shuttle -->
  <div class="panel" data-panel="shuttle"<?= $tab === 'shuttle' ? '' : ' hidden' ?>>
    <div class="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-ev-teal to-ev-sky p-5 text-white shadow-lift">
      <span class="absolute -right-4 -top-4 opacity-20"><?= icon('bus', 'h-28 w-28', 1.4) ?></span>
      <p class="text-xs font-extrabold uppercase tracking-[.14em] text-white/80">Free shuttle service</p>
      <h3 class="mt-1 text-xl font-extrabold">Getting between schools and venues</h3>
      <p class="mt-1 max-w-lg text-[15px] text-white/90">Shuttles will run during the games between the billeting schools and the playing venues. Routes, pick-up points and trip times will be posted here.</p>
    </div>
    <ul class="mt-3 grid gap-3 sm:grid-cols-3">
      <?php foreach ([
          ['Routes', 'Shuttle lines connecting the billeting schools and playing venues.', 'var(--teal)', 'map'],
          ['Pick-up points', 'Where to wait for the shuttle at each school and venue.', 'var(--gold)', 'pin'],
          ['Trip times', 'First and last trips each day, and how often shuttles run.', 'var(--flame)', 'calendar'],
      ] as [$name, $text, $accent, $ico]): ?>
        <li class="card p-4" style="--accent: <?= $accent ?>">
          <div class="flex items-center justify-between"><span class="accent-tile h-10 w-10"><?= icon($ico, 'h-5 w-5') ?></span><?= tba() ?></div>
          <h3 class="mt-3 font-extrabold text-ev-ink"><?= e($name) ?></h3>
          <p class="mt-1 text-sm leading-relaxed text-ev-muted"><?= e($text) ?></p>
        </li>
      <?php endforeach ?>
    </ul>
  </div>

  <!-- Directions -->
  <div class="panel" data-panel="directions"<?= $tab === 'directions' ? '' : ' hidden' ?>>
    <ul class="grid gap-3 sm:grid-cols-2">
      <?php foreach ($data['PLACES'] as [$name, $note, $query, $accent]): ?>
        <li class="card accent-stripe p-4 pl-5" style="--accent: <?= e($accent) ?>">
          <h3 class="font-extrabold text-ev-ink"><?= e($name) ?></h3>
          <p class="mt-1 text-[15px] text-ev-muted"><?= e($note) ?></p>
          <a href="<?= e(maps_search($query)) ?>" target="_blank" rel="noopener" class="link mt-2">Open in Google Maps <?= icon('external', 'h-4 w-4') ?></a>
        </li>
      <?php endforeach ?>
      <li class="card accent-stripe p-4 pl-5" style="--accent: var(--flame)">
        <h3 class="font-extrabold text-ev-ink">Billeting schools</h3>
        <p class="mt-1 text-[15px] text-ev-muted">Map and directions to each of the <?= count($schools) ?> billeting schools.</p>
        <a href="<?= e(page_url('directory', ['tab' => 'billeting'])) ?>" data-tab-link="billeting" class="link mt-2">See the map <?= icon('arrow', 'h-4 w-4') ?></a>
      </li>
      <li class="card accent-stripe p-4 pl-5" style="--accent: var(--green)">
        <h3 class="font-extrabold text-ev-ink">Playing venues</h3>
        <p class="mt-1 text-[15px] text-ev-muted">Where each sport is played, with a map of every venue.</p>
        <a href="<?= e(page_url('games')) ?>#venues" class="link mt-2">See the venues <?= icon('arrow', 'h-4 w-4') ?></a>
      </li>
    </ul>
  </div>

  <!-- Contact persons -->
  <div class="panel" data-panel="contacts"<?= $tab === 'contacts' ? '' : ' hidden' ?>>
    <?php if ($data['CONTACTS']): ?>
      <ul class="grid gap-3 sm:grid-cols-2">
        <?php foreach ($data['CONTACTS'] as $c): [$name, $position, $topic, $phone, $email] = $c + ['', '', '', '', '']; ?>
          <li class="card p-4">
            <h3 class="font-extrabold text-ev-ink"><?= e($name) ?></h3>
            <p class="text-sm text-ev-muted"><?= e(implode(' · ', array_filter([$position, $topic ? "For: {$topic}" : '']))) ?></p>
            <div class="mt-3 flex flex-wrap gap-2">
              <?php if ($phone): ?><a href="<?= e(tel_link($phone)) ?>" class="btn tap"><?= e($phone) ?></a><?php endif ?>
              <?php if ($email): ?><a href="mailto:<?= e($email) ?>" class="btn-quiet tap"><?= e($email) ?></a><?php endif ?>
              <?php if (!$phone && !$email): ?><?= tba() ?><?php endif ?>
            </div>
          </li>
        <?php endforeach ?>
      </ul>
    <?php else: ?>
      <?= coming_soon('user', 'Contact persons list coming soon', 'The EVRAA 2027 personnel to contact for queries, with their numbers and emails, will be posted here. For urgent concerns, see Hotlines.', page_url('directory', ['tab' => 'hotlines']), 'Go to Hotlines') ?>
    <?php endif ?>
  </div>
</section>

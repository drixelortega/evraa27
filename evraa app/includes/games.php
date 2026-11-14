<?php
// Games & Venues: a card per sport in SPORTS (data.js). Tapping one opens its schedule sheet (from the <template>s below);
// the Playing Venues map marks every venue with its sport's icon, and sports that share a venue share a pin.
defined('EVRAA') || exit;

$sports = sports();

// Venues at the same coordinates share one pin
$pins = [];
$pinsOf = [];
foreach ($sports as $s) {
    foreach ($s['venues'] as $v) {
        if ($v['lat'] === null || $v['lng'] === null) {
            continue;
        }
        $key = "{$v['lat']},{$v['lng']}";
        $pins[$key] ??= ['lat' => $v['lat'], 'lng' => $v['lng'], 'approx' => $v['approx'], 'icon' => sport_icon($s['sport'], 'h-4 w-4'), 'stops' => [],
            'directions' => maps_directions($v['lat'], $v['lng'])];
        $pins[$key]['stops'][] = ['sport' => $s['sport'], 'venue' => $v['name']];
        $pinsOf[$s['slug']][] = array_search($key, array_keys($pins), true);
    }
}
$map = ['pins' => array_values($pins), 'sports' => $pinsOf];
$scheduled = count(array_filter($sports, fn ($s) => $s['schedule']));
?>
<section class="view" data-page="games" data-title="Games &amp; Venues | EVRAA 2027">
  <?= page_head('The sports', 'Games & Venues', count($sports) . ' sports in Calbayog City. Tap a sport for its game schedule and playing venues.') ?>

  <!-- The search bar stays in view only while scrolling through the sports -->
  <div>
  <div class="sticky top-[calc(3.75rem+env(safe-area-inset-top))] z-20 -mx-4 mb-3 flex items-center gap-2 bg-ev-paper/95 px-4 py-2 backdrop-blur-md">
    <label class="relative min-w-0 flex-1">
      <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ev-muted"><?= icon('search', 'h-5 w-5') ?></span>
      <input type="search" class="search" placeholder="Search sports" aria-label="Search sports" data-games-search autocomplete="off">
    </label>
    <span class="chip shrink-0 tabular-nums" data-games-count><?= count($sports) ?> sports</span>
  </div>

  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-module="games">
    <?php foreach ($sports as $s): ?>
      <li data-name="<?= e(strtolower($s['sport'])) ?>">
        <a href="<?= e(page_url('games', ['sport' => $s['slug']])) ?>" data-sport="<?= e($s['slug']) ?>" class="card tap flex h-full items-center gap-3 p-3" style="--accent: <?= e($s['accent']) ?>" aria-haspopup="dialog">
          <span class="accent-tile h-12 w-12 shrink-0"><?= sport_icon($s['sport']) ?></span>
          <span class="min-w-0">
            <strong class="block truncate text-[15px] font-extrabold text-ev-ink"><?= e($s['sport']) ?></strong>
            <span class="block truncate text-xs text-ev-muted"><?= $s['schedule'] ? count($s['schedule']) . (count($s['schedule']) === 1 ? ' game' : ' games') : 'Schedule to follow' ?></span>
          </span>
        </a>
      </li>
    <?php endforeach ?>
    <li class="col-span-full" hidden data-games-empty><div class="card p-6 text-center text-[15px] text-ev-muted">No sport matches your search.</div></li>
  </ul>
  <?php if (!$scheduled): ?>
    <p class="mt-3 text-sm text-ev-muted">Game schedules will be posted once the Sports and Site Management Committee finalizes them.</p>
  <?php endif ?>
  </div>

  <!-- Playing venues -->
  <h2 class="section-title" id="venues">Playing venues</h2>
  <p class="section-lead">Every venue on one map. Tap a sport to light up its venues.</p>
  <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
    <div class="card overflow-hidden md:order-2 md:sticky md:top-32 md:self-start" data-module="venue-map">
      <div class="map h-[320px] md:h-[520px]" role="region" aria-label="Map of the playing venues"></div>
      <script type="application/json"><?= json_encode($map, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?></script>
    </div>
    <ul class="space-y-2" data-venue-list>
      <?php foreach ($sports as $s): $located = !empty($pinsOf[$s['slug']]); ?>
        <li class="row" style="--accent: <?= e($s['accent']) ?>">
          <button type="button" class="row-main tap items-start" data-venue-sport="<?= e($s['slug']) ?>"<?= $located ? '' : ' disabled' ?>>
            <span class="accent-tile mt-0.5 h-9 w-9 shrink-0 rounded-xl"><?= sport_icon($s['sport'], 'h-5 w-5') ?></span>
            <span class="min-w-0 flex-1">
              <strong class="block font-extrabold text-ev-ink"><?= e($s['sport']) ?><?php if ($s['note']): ?> <small class="font-semibold text-ev-muted">· <?= e($s['note']) ?></small><?php endif ?></strong>
              <span class="block text-sm leading-snug text-ev-muted"><?= $s['venues'] ? e(implode(' · ', array_column($s['venues'], 'name'))) : 'Venue to be announced' ?></span>
            </span>
          </button>
        </li>
      <?php endforeach ?>
    </ul>
  </div>
  <p class="mt-3 text-xs text-ev-muted">Map data © OpenStreetMap contributors. Gray pins with a dashed ring are approximate (only the campus or barangay is mapped).</p>

  <!-- Schedule sheets, one per sport -->
  <?php foreach ($sports as $s): ?>
    <template data-sheet="<?= e($s['slug']) ?>">
      <div class="p-5" style="--accent: <?= e($s['accent']) ?>">
        <div class="mx-auto -mt-1 mb-4 h-1.5 w-10 rounded-full bg-ev-line sm:hidden" aria-hidden="true"></div>
        <div class="flex items-center gap-3">
          <span class="accent-tile h-12 w-12 shrink-0"><?= sport_icon($s['sport'], 'h-7 w-7') ?></span>
          <div class="min-w-0 flex-1">
            <p class="eyebrow">Game schedule</p>
            <h2 id="sheet-title" class="text-xl font-extrabold leading-tight text-ev-ink"><?= e($s['sport']) ?></h2>
          </div>
          <button type="button" class="icon-btn tap" data-sheet-close aria-label="Close"><?= icon('close', 'h-5 w-5', 2.2) ?></button>
        </div>

        <?php if ($s['schedule']): ?>
          <ol class="mt-4 space-y-2">
            <?php foreach ($s['schedule'] as $g): [$iso, $time, $what] = $g + ['', '', '']; ?>
              <li class="flex items-center gap-3 rounded-2xl bg-ev-paper p-3">
                <div class="w-12 shrink-0 rounded-xl bg-white py-1 text-center shadow-soft">
                  <strong class="block text-lg leading-tight text-ev-ink"><?= ph_date($iso, 'j') ?></strong>
                  <span class="text-[11px] font-bold uppercase text-ev-muted"><?= ph_date($iso, 'M') ?></span>
                </div>
                <div><b class="block text-[15px] text-ev-ink"><?= e($what ?: $s['sport']) ?></b><small class="text-sm text-ev-muted"><?= ph_date($iso, 'l') ?><?= $time ? ' · ' . e($time) : '' ?></small></div>
              </li>
            <?php endforeach ?>
          </ol>
        <?php else: ?>
          <div class="mt-4 rounded-2xl bg-ev-paper p-4 text-center">
            <?= tba() ?>
            <p class="mt-2 text-[15px] leading-relaxed text-ev-muted">The <?= e($s['sport']) ?> schedule will be posted once the Sports and Site Management Committee finalizes it.</p>
          </div>
        <?php endif ?>

        <h3 class="mt-5 text-xs font-extrabold uppercase tracking-[.12em] text-ev-muted">Playing venue<?= count($s['venues']) === 1 ? '' : 's' ?><?= $s['note'] ? ' · ' . e($s['note']) : '' ?></h3>
        <ul class="mt-2 divide-y divide-ev-line rounded-2xl ring-1 ring-ev-line">
          <?php foreach ($s['venues'] as $v): ?>
            <li class="flex items-center gap-3 px-4 py-3">
              <span class="min-w-0 flex-1 text-[15px] font-bold text-ev-ink"><?= e($v['name']) ?><?php if ($v['approx']): ?><small class="block text-xs font-semibold text-ev-muted">Approximate location</small><?php endif ?></span>
              <?php if ($v['lat'] !== null): ?>
                <a href="<?= e(maps_directions($v['lat'], $v['lng'])) ?>" target="_blank" rel="noopener" class="row-action tap" aria-label="Directions to <?= e($v['name']) ?> in Google Maps"><?= icon('external', 'h-5 w-5') ?></a>
              <?php endif ?>
            </li>
          <?php endforeach ?>
          <?php if (!$s['venues']): ?><li class="px-4 py-3"><?= tba() ?></li><?php endif ?>
        </ul>
        <?php if (!empty($pinsOf[$s['slug']])): ?>
          <button type="button" class="btn tap mt-4 w-full justify-center py-3" data-show-venues="<?= e($s['slug']) ?>"><?= icon('map', 'h-5 w-5') ?>Show on the venue map</button>
        <?php endif ?>
      </div>
    </template>
  <?php endforeach ?>
</section>

<?php
// Medal Tally: standings from TALLY in data.js, ranked by gold, then silver, then bronze.
// The table refreshes itself every minute while the page is open (index.php?page=medal-tally&partial=1&fragment=table),
// so an update to data.js shows up without anyone reloading.
defined('EVRAA') || exit;

$rows = standings();
$started = array_sum(array_column($rows, 't')) > 0;
$max = max(1, ...array_column($rows, 't'));
$sums = ['g' => array_sum(array_column($rows, 'g')), 's' => array_sum(array_column($rows, 's')), 'b' => array_sum(array_column($rows, 'b'))];
$medals = [['g', 'Gold', 'medal-gold'], ['s', 'Silver', 'medal-silver'], ['b', 'Bronze', 'medal-bronze']];

ob_start();
?>
<div data-tally-table>
  <div class="mb-3 grid grid-cols-3 gap-2 sm:gap-3">
    <?php foreach ($medals as [$k, $label, $class]): ?>
      <div class="card flex items-center gap-2.5 p-3 sm:p-4">
        <span class="coin <?= $class ?>" aria-hidden="true"><?= $label[0] ?></span>
        <div class="min-w-0"><strong class="block text-xl font-extrabold leading-none tabular-nums text-ev-ink sm:text-2xl"><?= $sums[$k] ?></strong><span class="text-xs font-semibold text-ev-muted"><?= $label ?></span></div>
      </div>
    <?php endforeach ?>
  </div>

  <div class="card overflow-hidden">
    <table class="tally w-full text-left">
      <caption class="sr-only">Medal standings by delegation</caption>
      <thead>
        <tr>
          <th scope="col" class="w-10 text-center">#</th>
          <th scope="col">Delegation</th>
          <th scope="col" class="num"><span class="dot medal-gold" aria-hidden="true"></span><span class="sr-only">Gold</span></th>
          <th scope="col" class="num"><span class="dot medal-silver" aria-hidden="true"></span><span class="sr-only">Silver</span></th>
          <th scope="col" class="num"><span class="dot medal-bronze" aria-hidden="true"></span><span class="sr-only">Bronze</span></th>
          <th scope="col" class="num">Total</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $r): $podium = $started && $r['rank'] <= 3 ? $r['rank'] : 0; ?>
          <tr<?= $podium ? " class=\"podium-{$podium}\"" : '' ?> data-row="<?= e(slug($r['name'])) ?>" data-score="<?= "{$r['g']}-{$r['s']}-{$r['b']}" ?>">
            <td class="text-center"><span class="rank"><?= $started ? $r['rank'] : '–' ?></span></td>
            <th scope="row">
              <div class="flex items-center gap-2 sm:gap-2.5">
                <?php if ($r['logo']): ?><img src="<?= e($r['logo']) ?>" alt="" width="36" height="36" loading="lazy" class="h-8 w-8 shrink-0 rounded-full bg-white object-contain ring-1 ring-ev-line sm:h-9 sm:w-9"><?php endif ?>
                <div class="min-w-0">
                  <span class="block text-[14px] font-bold leading-snug text-ev-ink sm:text-[15px]"><?= e($r['name']) ?></span>
                  <span class="bar" aria-hidden="true">
                    <i class="medal-gold" style="width: <?= round($r['g'] / $max * 100, 1) ?>%"></i><i class="medal-silver" style="width: <?= round($r['s'] / $max * 100, 1) ?>%"></i><i class="medal-bronze" style="width: <?= round($r['b'] / $max * 100, 1) ?>%"></i>
                  </span>
                </div>
              </div>
            </th>
            <td class="num"><?= $r['g'] ?></td>
            <td class="num"><?= $r['s'] ?></td>
            <td class="num"><?= $r['b'] ?></td>
            <td class="num"><strong class="total"><?= $r['t'] ?></strong></td>
          </tr>
        <?php endforeach ?>
      </tbody>
    </table>
  </div>
  <p class="mt-3 text-xs text-ev-muted" data-updated="<?= date('c') ?>">Updated <?= date('g:i A') ?>, Philippine time</p>
</div>
<?php
$table = ob_get_clean();

// The live refresh only needs the table
if (($_GET['fragment'] ?? '') === 'table') {
    echo $table;
    return;
}
?>
<section class="view" data-page="medal-tally" data-title="Medal Tally | EVRAA 2027">
  <div class="mb-5 flex items-start justify-between gap-3">
    <div>
      <p class="eyebrow">Standings</p>
      <h1 class="mt-1 text-[1.75rem] font-extrabold leading-tight text-ev-ink sm:text-4xl">Medal Tally</h1>
      <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-ev-muted">
        <?= $started ? 'Ranked by gold, then silver, then bronze. The standings update by themselves as results come in.'
                     : 'The tally opens once the games begin. Delegations are ranked by gold, then silver, then bronze.' ?>
      </p>
    </div>
    <span class="live-pill" title="This table refreshes every minute"><span class="live-dot"></span>Live</span>
  </div>
  <div data-module="tally-live" data-src="<?= e(page_url('medal-tally', ['partial' => 1, 'fragment' => 'table'])) ?>">
    <?= $table ?>
  </div>
</section>

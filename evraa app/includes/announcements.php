<?php
// Announcements: news from ANNOUNCEMENTS (newest first) and the Special Events timeline from EVENTS (data.js)
defined('EVRAA') || exit;

$data = content();
$events = array_map(function ($row, $i) {
    [$title, $iso, $body] = $row + ['', '', ''];
    $left = $iso !== '' ? days_until($iso) : null;
    return [
        'title' => $title, 'body' => $body, 'accent' => ACCENTS[($i + 1) % count(ACCENTS)],
        'date' => $iso !== '' ? ph_date($iso) : '',
        'status' => $left === null ? '' : ($left > 1 ? "In {$left} days" : ($left === 1 ? 'Tomorrow' : ($left === 0 ? 'Today' : 'Done'))),
        'hot' => $left === 0 || $left === 1,
        'past' => $left !== null && $left < 0,
    ];
}, $data['EVENTS'], array_keys($data['EVENTS']));
?>
<section class="view" data-page="announcements" data-title="Announcements | EVRAA 2027">
  <?= page_head('From the EVRAA 2027 Secretariat', 'Announcements', 'News and advisories for delegations, officials and guests. Check back often as the games approach.') ?>

  <div class="space-y-3">
    <?php foreach ($data['ANNOUNCEMENTS'] as $a): ?>
      <article class="card accent-stripe p-4 pl-5 sm:p-5 sm:pl-6" style="--accent: <?= e($a['accent'] ?? 'var(--green)') ?>">
        <div class="flex flex-wrap items-center gap-2">
          <span class="tag<?= ($a['tag'] ?? '') === 'New' ? ' is-hot' : '' ?>"><?= e($a['tag'] ?? 'News') ?></span>
          <?php if (!empty($a['date'])): ?><time class="text-xs font-semibold text-ev-muted"><?= e($a['date']) ?></time><?php endif ?>
        </div>
        <h2 class="mt-2 text-lg font-extrabold leading-snug text-ev-ink"><?= e($a['title']) ?></h2>
        <p class="mt-1 text-[15px] leading-relaxed text-ev-muted"><?= e($a['body'] ?? '') ?></p>
        <?php if (!empty($a['link'])): ?>
          <a href="<?= e(content_link($a['link'][1])) ?>" class="link mt-3"><?= e($a['link'][0]) ?> <?= icon('arrow', 'h-4 w-4') ?></a>
        <?php endif ?>
      </article>
    <?php endforeach ?>
  </div>

  <h2 class="section-title" id="events">Special events</h2>
  <p class="section-lead">Ceremonies, celebrations and cultural showcases leading up to and during EVRAA 2027.</p>
  <ol class="relative space-y-3 pl-7 before:absolute before:bottom-3 before:left-[9px] before:top-3 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-ev-sky before:via-ev-gold before:to-ev-flame">
    <?php foreach ($events as $ev): ?>
      <li class="card relative p-4<?= $ev['past'] ? ' opacity-60' : '' ?>" style="--accent: <?= e($ev['accent']) ?>">
        <span class="accent-dot absolute -left-[26px] top-5 h-4 w-4 ring-4 ring-ev-paper" aria-hidden="true"></span>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <?php if ($ev['date']): ?><span class="font-bold text-ev-ink"><?= e($ev['date']) ?></span><?php endif ?>
          <?= $ev['status'] !== '' ? '<span class="tag' . ($ev['hot'] ? ' is-hot' : '') . '">' . e($ev['status']) . '</span>' : tba() ?>
        </div>
        <h3 class="mt-1.5 font-extrabold text-ev-ink"><?= e($ev['title']) ?></h3>
        <p class="mt-1 text-[15px] leading-relaxed text-ev-muted"><?= e($ev['body']) ?></p>
      </li>
    <?php endforeach ?>
  </ol>
</section>

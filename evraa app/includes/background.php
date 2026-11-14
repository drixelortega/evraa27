<?php
// EVRAA 2027 Background: the theme, what the logo means, the mascots, and the medals and trophies
defined('EVRAA') || exit;

$pillars = [
    ['One Region', 'Whatever province, city or school they represent, every delegate belongs to one regional community with a shared vision of excellence and development.', 'var(--teal)'],
    ['One Spirit', 'Sportsmanship, discipline, teamwork, respect and perseverance: the values that unite every athlete, coach, official and supporter beyond the competition.', 'var(--gold)'],
    ['One Victory', 'The real triumph goes beyond medals: building character, lifelong friendships and unity, and inspiring the youth toward excellence in sports and in life, for a stronger, healthier, more united Eastern Visayas.', 'var(--flame)'],
];
// Logo elements: title, meaning (may hold <strong>), accent
$elements = [
    ['The figure 8', 'Stands for Region VIII. Its infinity-inspired form signifies the region\'s enduring unity, limitless potential and continuous pursuit of excellence, and it celebrates every province, city, municipality and school.', 'var(--teal)'],
    ['The EVRAA lettering', 'Bold and forward-leaning for strength, momentum and progress. Its green stands for growth, harmony and resilience.', 'var(--green)'],
    ['Feather &amp; fish scales', 'The golden feather honors Calbayog\'s <strong>Hadang Festival</strong>: grace, creativity and cultural pride. The blue fish scales honor Catbalogan\'s <strong>Manaragat Festival</strong>: the sea, fishing heritage, abundance and resilience.', 'var(--gold)'],
    ['The torch', 'The universal symbol of sport. Its rising yellow-to-red flame carries the region\'s hope and aspirations, and the energy, passion and courage of everyone in the games.', 'var(--flame)'],
];
?>
<section class="view" data-page="background" data-title="EVRAA 2027 Background | EVRAA 2027">
  <?= page_head('About the games', 'EVRAA 2027 Background') ?>

  <div class="card border-l-4 border-ev-gold p-5">
    <p class="text-[15px] leading-relaxed text-ev-muted"><strong class="text-ev-ink">EVRAA 2027 is more than a sporting event.</strong>
      It is our commitment to excellence, our celebration of unity, and our opportunity to showcase the very best of Calbayog City and Catbalogan City,
      hosts of the Eastern Visayas Regional Athletic Association meet from March 31 to April 5, 2027.</p>
  </div>

  <!-- Theme -->
  <h2 class="section-title">The theme</h2>
  <p class="section-lead">One Region. One Spirit. One Victory.</p>
  <div class="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
    <?php foreach ($pillars as $i => [$name, $text, $accent]): ?>
      <article class="card w-[82%] shrink-0 snap-center p-5 md:w-auto" style="--accent: <?= $accent ?>">
        <span class="accent-text text-3xl font-extrabold tabular-nums"><?= sprintf('%02d', $i + 1) ?></span>
        <h3 class="mt-1 text-lg font-extrabold text-ev-ink"><?= e($name) ?></h3>
        <p class="mt-1.5 text-[15px] leading-relaxed text-ev-muted"><?= e($text) ?></p>
      </article>
    <?php endforeach ?>
  </div>

  <!-- Logo -->
  <h2 class="section-title">The logo</h2>
  <p class="section-lead">Every element honors the region and its two host cities. Together they carry the theme: all of Eastern Visayas coming together as one regional family, united by shared values and cultural pride.</p>
  <div class="grid gap-3 md:grid-cols-[280px_1fr]">
    <a href="evraa/images/EVRAA%2027%20Logo.png?v=2" target="_blank" rel="noopener" class="card tap grid place-items-center p-5" aria-label="Open the EVRAA 2027 logo full size">
      <img src="evraa/images/EVRAA%2027%20Logo.png?v=2" alt="EVRAA 2027 logo" width="1949" height="2282" loading="lazy" class="h-56 w-auto mix-blend-multiply md:h-auto">
    </a>
    <ul class="grid gap-3 sm:grid-cols-2">
      <?php foreach ($elements as [$name, $text, $accent]): ?>
        <li class="card accent-stripe p-4 pl-5" style="--accent: <?= $accent ?>">
          <h3 class="flex items-center gap-2 font-extrabold text-ev-ink"><span class="accent-dot"></span><?= $name ?></h3>
          <p class="mt-1.5 text-[15px] leading-relaxed text-ev-muted"><?= $text ?></p>
        </li>
      <?php endforeach ?>
    </ul>
  </div>

  <!-- Mascots -->
  <h2 class="section-title">The mascots</h2>
  <p class="section-lead">Meet Khal and Khat, the official mascots of EVRAA 2027.</p>
  <figure class="card overflow-hidden">
    <a href="evraa/images/mascot.jpg?v=2" target="_blank" rel="noopener" class="block" aria-label="Open the mascot photo full size">
      <img src="evraa/images/mascot.jpg?v=2" alt="EVRAA 2027 mascot plushies Khal, a rooster, and Khat, a fish, each wearing an EVRAA 2027 vest" width="1248" height="864" loading="lazy" class="aspect-[3/2] w-full object-cover">
    </a>
    <figcaption class="grid gap-3 p-4 sm:grid-cols-2">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ev-flame/15 text-lg font-extrabold text-ev-flame">K</span>
        <div><strong class="block text-ev-ink">Khal</strong><span class="text-sm text-ev-muted">A rooster, wearing the EVRAA 2027 vest</span></div>
      </div>
      <div class="flex items-start gap-3">
        <span class="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ev-teal/15 text-lg font-extrabold text-ev-teal">K</span>
        <div><strong class="block text-ev-ink">Khat</strong><span class="text-sm text-ev-muted">A fish, wearing the EVRAA 2027 vest</span></div>
      </div>
    </figcaption>
  </figure>

  <!-- Medals & trophies -->
  <h2 class="section-title">Medals &amp; trophies</h2>
  <p class="section-lead">What the champions of EVRAA 2027 take home.</p>
  <div class="grid grid-cols-2 gap-3">
    <?php foreach ([
        ['evraa/images/medal.jpg?v=2', 'Medals', 'Gold, silver and bronze', 'EVRAA 2027 gold, silver and bronze medals with rainbow ribbons'],
        ['evraa/images/trophy.jpg?v=2', 'Trophies', 'Championship trophy and cups', 'EVRAA 2027 trophies: a large glass centerpiece with gold, silver and bronze cups'],
    ] as [$src, $name, $note, $alt]): ?>
      <figure class="card overflow-hidden">
        <a href="<?= $src ?>" target="_blank" rel="noopener" class="block" aria-label="Open the <?= e(strtolower($name)) ?> photo full size">
          <img src="<?= $src ?>" alt="<?= e($alt) ?>" width="1024" height="1024" loading="lazy" class="aspect-square w-full object-cover">
        </a>
        <figcaption class="p-3.5"><strong class="block text-ev-ink"><?= e($name) ?></strong><span class="text-sm text-ev-muted"><?= e($note) ?></span></figcaption>
      </figure>
    <?php endforeach ?>
  </div>
</section>

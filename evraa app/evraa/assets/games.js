// Games Schedule page: one card per sport in SPORTS (data.js), tinted by its category; the chips filter by category.
// Tapping a card opens its SCHEDULE (edited on the admin page) and links to its playing venue. On phones the schedule is a bottom sheet.
(() => {
  const { $, esc, tba, phDate, slug, url, sportIcon } = EVRAA;

  // Category of each sport: name, colour, sports. A sport not listed here falls under "Other".
  const CATEGORIES = [
    ['Ball games', 'var(--green)', ['Basketball', 'Volleyball', 'Football', 'Futsal', 'Baseball', 'Softball', 'Sepak Takraw']],
    ['Racket sports', 'var(--teal)', ['Badminton', 'Lawn Tennis', 'Table Tennis']],
    ['Combat sports', 'var(--flame)', ['Arnis', 'Boxing', 'Taekwondo', 'Wrestling', 'Wushu', 'Pencak Silat', 'Karatedo']],
    ['Athletics & gymnastics', 'var(--gold)', ['Athletics', 'Gymnastics', 'Archery', 'Weightlifting', 'Dancesport']],
    ['Aquatics', 'var(--sky)', ['Swimming', 'Aquatics']],
    ['Special Games', '#7c5cc4', ['Special Games']],
  ];
  const OTHER = ['Other', 'var(--muted)', []];
  const categoryOf = (sport) => CATEGORIES.find(([, , sports]) => sports.includes(sport)) || OTHER;

  // ---------- Sport cards ----------
  const games = SPORTS.map(([sport], i) => {
    const [category, color] = categoryOf(sport);
    const count = (SCHEDULE[sport] || []).length;
    return { sport, category, html: `
    <li class="info-card sport" style="--accent: ${color}"><button type="button" class="sport-btn" data-sport="${i}" aria-haspopup="dialog">
      <span class="sport-badge" aria-hidden="true">${sportIcon(sport)}</span>
      <div><h3>${esc(sport)}</h3><span class="cat-pill">${esc(category)}</span>${count ? `<p>${count} scheduled ${count === 1 ? 'game' : 'games'}</p>` : tba}</div><span class="more" aria-hidden="true">›</span></button></li>` };
  });

  // Quick-filter chips: All, then each category that has a sport
  let active = '';
  const used = [...CATEGORIES, OTHER].filter(([name]) => games.some((g) => g.category === name));
  document.querySelector('.games-tools').insertAdjacentHTML('afterend', `<div class="chips" id="games-chips" role="group" aria-label="Filter by category">
    <button type="button" class="chip-btn is-active" data-cat="" aria-pressed="true">All sports</button>
    ${used.map(([name, color]) => `<button type="button" class="chip-btn" data-cat="${esc(name)}" style="--accent: ${color}" aria-pressed="false"><i aria-hidden="true"></i>${esc(name)}</button>`).join('')}</div>`);

  function renderGames() {
    const q = $('games-search').value.trim().toLowerCase();
    const shown = games.filter((g) => g.sport.toLowerCase().includes(q) && (!active || g.category === active));
    $('games-grid').innerHTML = shown.length ? shown.map((g) => g.html).join('') : '<li class="empty-state" style="grid-column: 1 / -1"><p>No sport matches.</p></li>';
    [...$('games-grid').children].forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('pop'); });
    $('games-count').textContent = `${shown.length} ${shown.length === 1 ? 'sport' : 'sports'}`;
  }
  $('games-search').addEventListener('input', renderGames);
  $('games-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip-btn');
    if (!chip) return;
    active = chip.dataset.cat;
    $('games-chips').querySelectorAll('.chip-btn').forEach((el) => { const on = el === chip; el.classList.toggle('is-active', on); el.setAttribute('aria-pressed', on); });
    chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    renderGames();
  });
  renderGames();

  // ---------- Schedule pop-up ----------
  const dialog = $('sport-dialog');
  function openSport(i) {
    const [sport, venues, note] = SPORTS[i];
    const list = [...(SCHEDULE[sport] || [])].sort((a, b) => a[0].localeCompare(b[0]));
    dialog.style.setProperty('--accent', categoryOf(sport)[1]);
    $('sport-dialog-icon').innerHTML = sportIcon(sport);
    $('sport-dialog-title').textContent = sport;
    $('sport-dialog-schedule').innerHTML = list.length
      ? `<ol class="sched-list">${list.map(([iso, time, what, team, versus]) => `<li><div class="sched-date"><strong>${phDate(iso, { day: 'numeric' })}</strong><span>${phDate(iso, { month: 'short' })}</span></div>
        <div><b>${team && versus ? `${esc(team)} <i class="vs">vs</i> ${esc(versus)}` : esc(what || sport)}</b><small>${team && versus && what ? `${esc(what)} · ` : ''}${phDate(iso, { weekday: 'long' })}${time ? ` · ${esc(time)}` : ''}</small></div></li>`).join('')}</ol>`
      : `<p class="sched-empty">${tba}<br>The ${esc(sport)} schedule will be posted once the Sports and Site Management Committee finalizes it.</p>`;
    $('sport-dialog-address').innerHTML = venues.length ? venues.map(([name]) => esc(name)).join('<br>') + (note ? ` <small>(${esc(note)})</small>` : '') : tba;
    // Playing Venues reads the #sport and points out its row and map pin
    $('sport-dialog-venue').href = `${url('evraa/playing-venues.html')}#${slug(sport)}`;
    dialog.style.transform = '';
    dialog.showModal();
  }
  $('games-grid').addEventListener('click', (event) => {
    const btn = event.target.closest('.sport-btn');
    if (btn) openSport(Number(btn.dataset.sport));
  });
  $('sport-dialog-close').addEventListener('click', () => dialog.close());
  // Clicking the dimmed backdrop (outside the box) closes it too
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  // On phones the pop-up is a bottom sheet: dragging its top down past a third of its height closes it
  const head = dialog.querySelector('.sport-dialog-head');
  let drag = null;
  head.addEventListener('pointerdown', (event) => {
    if (window.innerWidth > 600 || event.target.closest('button')) return;
    drag = { y: event.clientY, dy: 0 };
    head.setPointerCapture(event.pointerId);
    dialog.style.transition = 'none';
  });
  head.addEventListener('pointermove', (event) => {
    if (!drag) return;
    drag.dy = Math.max(0, event.clientY - drag.y);
    dialog.style.transform = `translateY(${drag.dy}px)`;
  });
  const drop = () => {
    if (!drag) return;
    const close = drag.dy > Math.min(140, dialog.offsetHeight / 3);
    drag = null;
    dialog.style.transition = '';
    if (close) { dialog.style.transform = 'translateY(100%)'; setTimeout(() => { dialog.close(); dialog.style.transform = ''; }, 180); } else dialog.style.transform = '';
  };
  head.addEventListener('pointerup', drop);
  head.addEventListener('pointercancel', drop);
})();

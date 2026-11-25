// Games Schedule page. Two views of SPORTS (data.js) and SCHEDULE (edited on the admin page, saved in data-live.js):
// - By sport: one card per sport, tinted by its category; the chips filter by category. Tapping a card opens its schedule,
//   with directions to each venue and "Add to calendar" for each game. On phones the schedule is a bottom sheet.
// - By day: every game of one day across all sports, in time order, with Now / Next during the games (#day-2027-04-01 opens that day).
// "My delegation" (picked on the Home page) highlights that delegation's games and can filter to them.
// The schedule refreshes by itself every two minutes while the page is open.
(() => {
  const {
    $, esc, tba, phDate, slug, url, sportIcon, mapsLink, liveBar, GAME_DAYS, todayLive, allGames, gameTitle, gameStatus,
    addToCalendar, myDelegation, sameTeam, enter, mineTag, sheet,
  } = EVRAA;

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
  const venuesOf = (sport) => (SPORTS.find(([name]) => name === sport) || [, []])[1];
  const directions = ([name, lat, lng, approx]) => (typeof lat === 'number' && !approx
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : mapsLink(`${name}, Calbayog City, Samar`));

  let schedule = SCHEDULE;
  let games = allGames(schedule);
  let mine = myDelegation();
  let onlyMine = false;
  let category = '';
  let view = 'sport';
  let day = GAME_DAYS.includes(todayLive()) ? todayLive() : GAME_DAYS[0];
  const isMine = (g) => Boolean(mine) && (sameTeam(g.team, mine) || sameTeam(g.versus, mine));
  const query = () => $('games-search').value.trim().toLowerCase();
  const matches = (g, q) => !q || [g.sport, g.team, g.versus, g.what].some((v) => String(v || '').toLowerCase().includes(q));
  const calIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>';

  // ---------- Filter chips: All, each category that has a sport, and "My delegation's games" once one is picked ----------
  const used = [...CATEGORIES, OTHER].filter(([name]) => SPORTS.some(([sport]) => categoryOf(sport)[0] === name));
  document.querySelector('.games-tools').insertAdjacentHTML('afterend', '<div class="chips" id="games-chips" role="group" aria-label="Filter"></div>');
  function renderChips() {
    $('games-chips').innerHTML = `
      ${mine ? `<button type="button" class="chip-btn mine-chip${onlyMine ? ' is-active' : ''}" data-mine aria-pressed="${onlyMine}"><span aria-hidden="true">★</span>${esc(mine)}'s games</button>`
        : `<a class="chip-btn mine-chip" href="${url('index.html')}#team"><span aria-hidden="true">★</span>Pick my delegation</a>`}
      <button type="button" class="chip-btn${category ? '' : ' is-active'}" data-cat="" aria-pressed="${!category}">All sports</button>
      ${used.map(([name, color]) => `<button type="button" class="chip-btn${category === name ? ' is-active' : ''}" data-cat="${esc(name)}" style="--accent: ${color}" aria-pressed="${category === name}"><i aria-hidden="true"></i>${esc(name)}</button>`).join('')}`;
  }
  $('games-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip-btn');
    if (!chip || chip.tagName === 'A') return;
    if (chip.hasAttribute('data-mine')) onlyMine = !onlyMine; else category = chip.dataset.cat;
    renderChips();
    $('games-chips').querySelector(chip.hasAttribute('data-mine') ? '[data-mine]' : `[data-cat="${CSS.escape(category)}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    render();
  });
  renderChips();

  // ---------- By sport ----------
  // While no schedule is posted, one notice above the cards replaces a "To be announced" pill on each of them
  function notice() {
    const el = $('games-notice');
    el.hidden = games.length > 0;
    el.innerHTML = '<strong>Schedules are coming.</strong> Game times are posted here as the Sports and Site Management Committee confirms them. Tap a sport for its playing venue.';
  }
  const noMatch = (q) => `<div class="empty-state no-match"><h3>${onlyMine ? `No games for ${esc(mine)} yet` : `No sports or teams match “${esc(q)}”`}</h3>
    <button type="button" class="outline-btn" data-clear>${onlyMine ? 'Show all games' : 'Clear search'}</button></div>`;
  function renderSports() {
    const q = query();
    notice();
    const shown = SPORTS.map(([sport], i) => ({ sport, i, list: games.filter((g) => g.sport === sport) }))
      .filter(({ sport, list }) => (!category || categoryOf(sport)[0] === category)
        && (!q || sport.toLowerCase().includes(q) || list.some((g) => matches(g, q)))
        && (!onlyMine || list.some(isMine)));
    $('games-grid').innerHTML = shown.length ? shown.map(({ sport, i, list }) => {
      const [cat, color] = categoryOf(sport);
      const venues = venuesOf(sport);
      const own = list.filter(isMine).length;
      return `
      <li class="info-card sport${own ? ' has-mine' : ''}" style="--accent: ${color}"><button type="button" class="sport-btn" data-sport="${i}" aria-haspopup="dialog">
        <span class="sport-badge" aria-hidden="true">${sportIcon(sport)}</span>
        <div><h3>${esc(sport)}</h3><span class="cat-pill">${esc(cat)}</span>
          ${venues.length ? `<p class="sport-venue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>${esc(venues[0][0])}${venues.length > 1 ? ` <span>+${venues.length - 1} more</span>` : ''}</p>` : ''}
          ${list.length ? `<p>${list.length} scheduled ${list.length === 1 ? 'game' : 'games'}${own ? ` · <strong class="mine-count">★ ${own} for ${esc(mine)}</strong>` : ''}</p>` : games.length ? '<p class="soon-note">Schedule to follow</p>' : ''}
        </div><span class="more" aria-hidden="true">›</span></button></li>`;
    }).join('') : `<li style="grid-column: 1 / -1">${noMatch(q)}</li>`;
    [...$('games-grid').children].forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('pop'); });
    $('games-count').textContent = `${shown.length} ${shown.length === 1 ? 'sport' : 'sports'}`;
  }

  // ---------- By day ----------
  const gameRow = (g, next, withSport = true) => {
    const venue = venuesOf(g.sport)[0];
    const status = gameStatus(g);
    return `<li class="game-row${isMine(g) ? ' is-mine' : ''}${status === 'done' ? ' is-done' : ''}" style="--accent: ${categoryOf(g.sport)[1]}">
      <div class="game-time">${g.time ? esc(g.time) : '<span class="muted">TBA</span>'}</div>
      ${withSport ? `<span class="game-icon" aria-hidden="true">${sportIcon(g.sport)}</span>` : ''}
      <div class="game-main">
        <b>${g.team && g.versus ? `${esc(g.team)} <i class="vs">vs</i> ${esc(g.versus)}` : esc(g.what || g.sport)}</b>
        <small>${withSport ? `${esc(g.sport)} · ` : ''}${g.team && g.versus && g.what ? `${esc(g.what)} · ` : ''}${venue ? esc(venue[0]) : 'Venue to follow'}</small>
        ${isMine(g) ? mineTag : ''}
      </div>
      ${status === 'now' ? '<span class="live-tag">Now</span>' : next ? '<span class="next-tag">Next</span>' : ''}
      <button type="button" class="cal-btn" data-game="${games.indexOf(g)}" aria-label="Add ${esc(g.sport)}: ${esc(gameTitle(g))} to my calendar" title="Add to calendar">${calIcon}</button>
    </li>`;
  };
  function renderDay() {
    const q = query();
    const days = [...new Set([...GAME_DAYS, ...games.map((g) => g.iso)])].sort();
    const filter = (g) => matches(g, q) && (!category || categoryOf(g.sport)[0] === category) && (!onlyMine || isMine(g));
    $('day-tabs').innerHTML = days.map((iso) => {
      const count = games.filter((g) => g.iso === iso && filter(g)).length;
      return `<a class="day-tab${iso === day ? ' is-active' : ''}${iso === todayLive() ? ' is-today' : ''}" href="#day-${iso}"${iso === day ? ' aria-current="date"' : ''}>
        <span>${iso === todayLive() ? 'Today' : phDate(iso, { weekday: 'short' })}</span><strong>${phDate(iso, { day: 'numeric' })}</strong><small>${phDate(iso, { month: 'short' })}</small>
        <em>${count ? `${count} ${count === 1 ? 'game' : 'games'}` : '—'}</em></a>`;
    }).join('');
    const list = games.filter((g) => g.iso === day && filter(g));
    const next = list.findIndex((g) => gameStatus(g) === 'later');
    $('day-list').innerHTML = list.length
      ? `<ol class="game-list">${list.map((g, i) => gameRow(g, i === next)).join('')}</ol>`
      : games.some((g) => g.iso === day) ? noMatch(q)
        : `<div class="empty-state"><h3>No games listed for ${phDate(day, { weekday: 'long', month: 'long', day: 'numeric' })} yet</h3>
        <p>${games.length ? 'Try another day.' : 'Game times are posted here as the Sports and Site Management Committee confirms them.'}</p></div>`;
    $('games-count').textContent = `${list.length} ${list.length === 1 ? 'game' : 'games'}`;
    $('day-tabs').querySelector('.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function render() { if (view === 'day') renderDay(); else renderSports(); }
  $('games-search').addEventListener('input', render);
  // "Clear search" / "Show all games" in the no-results message
  $('games-views').addEventListener('click', (event) => {
    if (!event.target.closest('[data-clear]')) return;
    $('games-search').value = '';
    onlyMine = false;
    category = '';
    renderChips();
    render();
    $('games-search').focus();
  });

  // ---------- Switching views (by the address, so Back works and Home can link to today) ----------
  function route() {
    const hash = location.hash.slice(1);
    const wanted = hash.startsWith('day-') || hash === 'by-day' ? 'day' : 'sport';
    if (hash.startsWith('day-') && /^\d{4}-\d{2}-\d{2}$/.test(hash.slice(4))) day = hash.slice(4);
    const changed = wanted !== view;
    view = wanted;
    $('sport-view').hidden = view !== 'sport';
    $('day-view').hidden = view !== 'day';
    document.querySelectorAll('.view-btn').forEach((btn) => {
      const on = btn.dataset.view === view;
      btn.classList.toggle('is-active', on);
      if (on) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
    });
    render();
    if (changed) enter($(view === 'day' ? 'day-view' : 'sport-view'));
  }
  window.addEventListener('hashchange', route);
  view = '';
  route();

  // ---------- Schedule pop-up ----------
  const dialog = $('sport-dialog');
  let popup;
  let openIndex = -1;
  function openSport(i, show = true) {
    openIndex = i;
    const [sport, venues, note] = SPORTS[i];
    const list = games.filter((g) => g.sport === sport);
    dialog.style.setProperty('--accent', categoryOf(sport)[1]);
    $('sport-dialog-icon').innerHTML = sportIcon(sport);
    $('sport-dialog-title').textContent = sport;
    const next = list.findIndex((g) => gameStatus(g) === 'later');
    $('sport-dialog-schedule').innerHTML = list.length
      ? `<ol class="sched-list">${list.map((g, n) => `<li class="${isMine(g) ? 'is-mine' : ''}${gameStatus(g) === 'done' ? ' is-done' : ''}"><div class="sched-date"><strong>${phDate(g.iso, { day: 'numeric' })}</strong><span>${phDate(g.iso, { month: 'short' })}</span></div>
        <div><b>${g.team && g.versus ? `${esc(g.team)} <i class="vs">vs</i> ${esc(g.versus)}` : esc(g.what || sport)}</b><small>${g.team && g.versus && g.what ? `${esc(g.what)} · ` : ''}${phDate(g.iso, { weekday: 'long' })}${g.time ? ` · ${esc(g.time)}` : ''}</small>
          ${gameStatus(g) === 'now' ? '<span class="live-tag">Now</span>' : n === next ? '<span class="next-tag">Next</span>' : ''}${isMine(g) ? mineTag : ''}</div>
        <button type="button" class="cal-btn" data-game="${games.indexOf(g)}" aria-label="Add this game to my calendar" title="Add to calendar">${calIcon}</button></li>`).join('')}</ol>`
      : `<p class="sched-empty"><strong>Schedule to follow.</strong> ${esc(sport)} game times are posted here once the Sports and Site Management Committee confirms them.</p>`;
    $('sport-dialog-venues').innerHTML = venues.length
      ? venues.map((v) => `<li><span>${esc(v[0])}${v[3] ? ' <small>(approximate)</small>' : ''}</span><a class="dir-btn" href="${directions(v)}" target="_blank" rel="noopener">Directions ↗</a></li>`).join('')
        + (note ? `<li class="venue-note">${esc(note)}</li>` : '')
      : `<li>${tba}</li>`;
    // Playing Venues reads the #sport and points out its row and map pin
    $('sport-dialog-venue').href = `${url('evraa/playing-venues.html')}#${slug(sport)}`;
    if (!show) return;
    popup.open();
  }
  $('games-grid').addEventListener('click', (event) => {
    const btn = event.target.closest('.sport-btn');
    if (btn) openSport(Number(btn.dataset.sport));
  });
  // Add to calendar, in the day list and in the pop-up
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.cal-btn');
    if (!btn) return;
    const g = games[Number(btn.dataset.game)];
    if (g) addToCalendar(g, (venuesOf(g.sport)[0] || [''])[0]);
  });
  // The phone's Back, the ×, the backdrop and dragging the top down all close it (site.js)
  popup = sheet(dialog);

  // ---------- Fresh schedule without reloading ----------
  liveBar({
    target: $('games-views'),
    every: 120000,
    render: (data) => {
      schedule = data.SCHEDULE;
      games = allGames(schedule);
      render();
      if (dialog.open && openIndex > -1) openSport(openIndex, false);
    },
  });
})();

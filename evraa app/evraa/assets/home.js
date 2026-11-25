// Home page (index.html): countdown to the opening, and a card for each section in the menu (MENU in site.js)
(() => {
  const {
    $, esc, url, MENU, phDate, daysUntil, ACCENT, pageIcon, reduceMotion, OPENING, GAME_DAYS, now, phase, todayLive,
    allGames, gameTitle, gameStatus, sportIcon, logoImg, myDelegation, sameTeam, medalCounts, mineTag, sheet,
  } = EVRAA;

  // ---------- Theme song ----------
  // The button on the logo plays and pauses evraa/audio/theme-song.mp3; it shows moving bars while the song plays.
  // Phones also show it on the lock screen (Media Session). The song stops when another page is opened.
  const song = $('theme-song');
  const songBtn = $('song-btn');
  if (song && songBtn) {
    const show = () => {
      const playing = !song.paused && !song.ended;
      songBtn.classList.toggle('is-playing', playing);
      songBtn.setAttribute('aria-pressed', String(playing));
      songBtn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} the EVRAA 2027 theme song`);
    };
    songBtn.addEventListener('click', async () => {
      if (!song.paused) { song.pause(); return; }
      songBtn.classList.add('is-loading');
      try {
        await song.play();
        if (!songBtn.dataset.told) { songBtn.dataset.told = '1'; EVRAA.toast('♪ EVRAA 2027 theme song: plays while this page is open'); }
      } catch (error) {
        EVRAA.toast(navigator.onLine ? 'The theme song could not be played' : 'The theme song needs a connection');
      }
      songBtn.classList.remove('is-loading');
    });
    ['play', 'pause', 'ended'].forEach((type) => song.addEventListener(type, show));
    song.addEventListener('waiting', () => songBtn.classList.add('is-loading'));
    song.addEventListener('playing', () => songBtn.classList.remove('is-loading'));
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'EVRAA 2027 Theme Song', artist: 'EVRAA 2027 · Calbayog City',
        artwork: [{ src: url('evraa/images/icons/icon-512.png'), sizes: '512x512', type: 'image/png' }],
      });
    }
  }

  // ---------- Countdown to the opening ceremony: March 31, 2027, 2:00 PM Philippine time (UTC+8) ----------
  // During the games it becomes "Day 3 of 6" with a track of the six days; afterwards a thank-you
  const pad = (n) => String(n).padStart(2, '0');
  let timer;
  function tick() {
    if (phase() !== 'soon') {
      clearInterval(timer);
      if (!$('countdown-units')) return;
      const live = phase() === 'live';
      const day = GAME_DAYS.indexOf(todayLive()) + 1;
      $('countdown-label').textContent = live ? 'Happening now' : 'Thank you, Eastern Visayas';
      $('countdown-title').textContent = live ? `Day ${day} of ${GAME_DAYS.length}` : 'EVRAA 2027 has concluded';
      $('countdown-note').textContent = live ? `${phDate(todayLive(), { weekday: 'long', month: 'long', day: 'numeric' })} · Calbayog City` : 'One Region. One Spirit. One Victory.';
      $('countdown').removeAttribute('aria-label');
      $('countdown-units').outerHTML = live
        ? `<div><ol class="day-track" aria-label="Day ${day} of ${GAME_DAYS.length}">${GAME_DAYS.map((iso, i) => `<li class="${i + 1 < day ? 'is-past' : i + 1 === day ? 'is-today' : ''}"><strong>${phDate(iso, { day: 'numeric' })}</strong><span>${phDate(iso, { month: 'short' })}</span></li>`).join('')}</ol>
          <a class="countdown-link" href="${url('evraa/games.html')}#day-${todayLive()}">Today's games <span aria-hidden="true">→</span></a></div>`
        : `<a class="countdown-link" href="${url('evraa/medal-tally.html')}">See the final medal tally <span aria-hidden="true">→</span></a>`;
      return;
    }
    const left = Math.floor((OPENING - now()) / 1000);
    const days = Math.floor(left / 86400);
    $('cd-days').textContent = new Intl.NumberFormat().format(days);
    $('cd-hours').textContent = pad(Math.floor(left % 86400 / 3600));
    $('cd-mins').textContent = pad(Math.floor(left % 3600 / 60));
    $('cd-secs').textContent = pad(left % 60);
    $('countdown').setAttribute('aria-label', `${days} days left until the EVRAA 2027 opening ceremony`);
  }
  tick();
  timer = setInterval(tick, 1000);

  // ---------- Important announcements ----------
  // Announcements ticked “Push to Home” on the admin page (push: true in data-live.js) stand out above the section cards
  const pushed = ANNOUNCEMENTS.filter((a) => a.push);
  if (pushed.length) {
    const external = (link) => /^https?:/.test(link);
    const megaphone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/></svg>';
    $('home-alerts').innerHTML = pushed.map((a, i) => {
      const [label, href] = a.link || ['See all announcements', 'evraa/announcements.html'];
      const out = external(href);
      return `
      <article class="home-alert" style="--i: ${i}">
        <span class="home-alert-icon">${megaphone}</span>
        <div class="home-alert-text">
          <div class="home-alert-meta"><span class="home-alert-flag">Important</span><span class="home-alert-tag">${esc(a.tag)}</span>${a.date ? `<span class="home-alert-date">${esc(a.date)}</span>` : ''}</div>
          <h2>${esc(a.title)}</h2>
          ${a.body ? `<p>${esc(a.body)}</p>` : ''}
          <a class="home-alert-link" href="${esc(out ? href : url(href))}"${out ? ' target="_blank" rel="noopener"' : ''}>${esc(label)} <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    }).join('');
    $('home-alerts').hidden = false;
  }

  // ---------- Section cards ----------
  // The icon and accent colour of each page are in site.js; this adds a short live summary. A page added to MENU gets a card too
  const venues = new Set(SPORTS.flatMap(([, list]) => list.map(([name]) => name))).size;
  const next = EVENTS.find(([, iso]) => iso && daysUntil(iso) >= 0);
  const NOTES = {
    announcements: ANNOUNCEMENTS[0] ? ANNOUNCEMENTS[0].title : 'News and advisories',
    directory: 'Hotels, hotlines, directions & more',
    'medal-tally': `Live standings of ${TALLY.length} delegations`,
    games: `${SPORTS.length} sports: schedules & venues`,
    'playing-venues': `${venues} venues on the map`,
    'special-events': next ? `Next: ${next[0]}, ${phDate(next[1], { month: 'long', day: 'numeric' })}` : 'Ceremonies, celebrations and cultural shows',
    billeting: `${SCHOOLS.length} schools in Calbayog City, on the map`,
    background: 'Theme, logo, mascots & medals',
  };
  // Two groups: what matters during the games, then planning the trip. A page added to MENU but not listed here joins the second group.
  const GROUPS = [
    ['During the games', ['announcements', 'games', 'medal-tally', 'playing-venues']],
    ['Plan your stay', ['directory', 'billeting', 'special-events', 'background']],
  ];
  const listed = GROUPS.flatMap(([, ids]) => ids);
  GROUPS[1][1].push(...MENU.map(([id]) => id).filter((id) => id !== 'home' && !listed.includes(id)));
  let n = 0;
  const card = (id) => {
    const [, label, path] = MENU.find(([key]) => key === id);
    const unread = id === 'announcements' ? EVRAA.unread().length : 0;
    return `
    <li class="tab-card" style="--i: ${n++}; --accent: ${ACCENT[id] || 'var(--green)'}">
      <a href="${url(path)}">
        <span class="tab-card-icon">${pageIcon(id, esc(label))}</span>
        ${unread ? `<span class="new-count" aria-label="${unread} new">${unread}</span>` : ''}
        <span class="tab-card-go" aria-hidden="true">→</span>
        <strong>${esc(label)}</strong>
        <span class="tab-card-note">${esc(NOTES[id] || '')}</span>
      </a>
    </li>`;
  };
  $('home-sections').innerHTML = GROUPS.map(([title, ids], g) => `
    <section class="card-group" aria-labelledby="group-${g}"><h2 class="group-title" id="group-${g}">${title}</h2>
      <ul class="tab-cards">${ids.filter((id) => MENU.some(([key]) => key === id)).map(card).join('')}</ul></section>`).join('');

  // ---------- During the games: today's games, the medal leaders and the hotlines ----------
  function renderToday() {
    if (phase() === 'soon') return;
    const live = phase() === 'live';
    const today = todayLive();
    const mine = myDelegation();
    const games = allGames().filter((g) => g.iso === today);
    const status = games.map(gameStatus);
    // Now and next first; games already over drop off the list
    const ahead = games.map((g, i) => ({ ...g, status: status[i] })).filter((g) => g.status !== 'done');
    const nextAt = ahead.findIndex((g) => g.status !== 'now');
    const leaders = EVRAA.rankTally().filter((r) => r.t > 0).slice(0, 3);
    const gamesPanel = live ? `
      <article class="today-panel today-games">
        <header><h2>Today's games</h2><a href="${url('evraa/games.html')}#day-${today}">Full day <span aria-hidden="true">→</span></a></header>
        ${ahead.length ? `<ol class="today-list">${ahead.slice(0, 5).map((g, i) => `
          <li class="${g.team && (sameTeam(g.team, mine) || sameTeam(g.versus, mine)) ? 'is-mine' : ''}">
            <span class="today-sport" aria-hidden="true">${sportIcon(g.sport)}</span>
            <div><b>${esc(g.sport)}: ${esc(gameTitle(g))}</b><small>${g.time ? esc(g.time) : 'Time to follow'}</small>${g.team && (sameTeam(g.team, mine) || sameTeam(g.versus, mine)) ? mineTag : ''}</div>
            ${g.status === 'now' ? '<span class="live-tag">Now</span>' : i === nextAt ? '<span class="next-tag">Next</span>' : ''}
          </li>`).join('')}</ol>`
          : `<p class="today-empty">${games.length ? 'That was the last game today.' : 'No games are listed for today yet.'} <a href="${url('evraa/games.html')}">See the schedule</a></p>`}
      </article>` : '';
    const medalsPanel = `
      <article class="today-panel today-medals">
        <header><h2>${live ? 'Medal leaders' : 'Final standings'}</h2><a href="${url('evraa/medal-tally.html')}">Medal tally <span aria-hidden="true">→</span></a></header>
        ${leaders.length ? `<ol class="leader-list">${leaders.map((r) => `
          <li class="${r.name === mine ? 'is-mine' : ''}"><span class="leader-rank">${r.rank}</span>${logoImg(r.name)}<strong>${esc(r.name)}</strong>
            <span class="leader-medals">${medalCounts(r)}</span></li>`).join('')}</ol>`
          : '<p class="today-empty">No medals awarded yet.</p>'}
      </article>`;
    const helpPanel = live ? `
      <article class="today-panel today-help">
        <header><h2>Need help?</h2></header>
        <a class="sos-call" href="tel:911"><span aria-hidden="true">☎</span> Emergency: call 911</a>
        <a class="today-help-link" href="${url('evraa/directory.html')}#hotlines">All hotlines <span aria-hidden="true">→</span></a>
        <a class="today-help-link" href="${url('evraa/playing-venues.html')}">Playing venues map <span aria-hidden="true">→</span></a>
      </article>` : '';
    $('home-today').innerHTML = gamesPanel + medalsPanel + helpPanel;
    $('home-today').classList.toggle('is-done', !live);
    $('home-today').hidden = false;
  }
  renderToday();

  // ---------- My delegation ----------
  // Picking a delegation recolours the app (site.js) and highlights its games and medal standing. Home shows one row:
  // "Pick your delegation" until a choice is made, then the choice with a Change button; the choices open in a bottom sheet.
  // "No team" keeps the default EVRAA colours.
  // CHOSEN_KEY tells "picked No team" apart from "has not picked yet".
  const CHOSEN_KEY = 'evraa-team-chosen';
  const EVRAA_TEAM = ['', 'Default colours', '#1d6b3a', '#f2b330'];
  const teamSheet = sheet($('team-sheet'));
  // Each delegation shows its moniker logo; No team shows the EVRAA logo
  const logo = (name, cls = 'team-opt-logo') => (name ? EVRAA.monikerImg(name, cls, true) : `<img class="${cls}" src="${url('evraa/images/logo-header.png')}" alt="" width="102" height="120">`);
  function renderTeam() {
    const mine = EVRAA.myDelegation();
    const team = EVRAA.teamOf(mine);
    const chosen = Boolean(team) || EVRAA.store.get(CHOSEN_KEY) === '1';
    $('team').classList.toggle('is-picked', chosen);
    $('team').innerHTML = chosen
      ? `<div class="team-pick-head">${logo(team ? mine : '', 'team-current-logo')}
          <div class="team-current"><span class="eyebrow">My delegation</span><h2 id="team-title">${team ? `${esc(mine)} <span>${esc(team[1])}</span>` : 'No team <span>Default colours</span>'}</h2></div>
          <button type="button" class="team-change" data-pick aria-haspopup="dialog">Change</button></div>`
      : `<button type="button" class="team-ask" data-pick aria-haspopup="dialog">
          <span class="team-ask-star" aria-hidden="true">★</span>
          <span><strong id="team-title">Pick your delegation</strong><small>Get its colours, and see its games and standing first</small></span>
          <span class="team-ask-go" aria-hidden="true">›</span></button>`;
    // The choices, in the sheet: one line each, the moniker under the selected one
    $('team-options').innerHTML = [EVRAA_TEAM, ...(typeof DELEGATIONS !== 'undefined' ? DELEGATIONS : [])].map(([name, moniker, primary]) => {
      const on = chosen && name === (team ? mine : '');
      return `<li><button type="button" class="team-opt" data-team="${esc(name)}" aria-pressed="${on}" style="--p: ${primary}">
        ${logo(name)}<span class="team-opt-text"><strong>${name ? esc(name) : 'No team'}</strong>${on || !name ? `<small>${esc(moniker)}</small>` : ''}</span></button></li>`;
    }).join('');
  }
  $('team').addEventListener('click', (event) => {
    if (!event.target.closest('[data-pick]')) return;
    teamSheet.open();
    $('team-options').querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'center' });
  });
  $('team-options').addEventListener('click', (event) => {
    const option = event.target.closest('.team-opt');
    if (!option) return;
    const change = () => {
      EVRAA.store.set(CHOSEN_KEY, '1');
      EVRAA.setMyDelegation(option.dataset.team);
      renderTeam();
      renderToday();
    };
    teamSheet.close();
    // The new colours fade in across the page where the browser can
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(change); else change();
  });
  renderTeam();

  // ---------- Acknowledgement carousel ----------
  // The logos stand evenly around a ring that turns slowly. Each logo's angle on the ring gives its place, size and opacity:
  // the one at the front is in the middle and largest; they shrink and fade as they travel round the back.
  // It pauses while pointed at, and can be dragged or swiped. With reduced motion it does not turn by itself.
  if (typeof ACKNOWLEDGEMENTS !== 'undefined' && ACKNOWLEDGEMENTS.length) {
    const carousel = $('logo-carousel');
    // Open sponsor slots (SPONSOR_SLOTS in data.js) stand between the logos as blank "Your logo here" tiles,
    // so prospective sponsors see where theirs would be highlighted
    const slots = typeof SPONSOR_SLOTS === 'number' ? SPONSOR_SLOTS : 0;
    const logos = ACKNOWLEDGEMENTS.map(([name, file]) => `<li class="logo-item">
      <span class="logo-tile"><img src="${url(`evraa/images/Acknowledgement/${encodeURIComponent(file)}`)}" alt="${esc(name)}" decoding="async" draggable="false"></span>
      <span class="logo-name">${esc(name)}</span></li>`);
    const slot = `<li class="logo-item is-slot"><span class="logo-tile is-slot"><span class="slot-plus" aria-hidden="true">+</span><span class="slot-text">Your logo here</span></span>
      <span class="logo-name">Sponsor</span></li>`;
    const ring = [];
    for (let i = 0; i < Math.max(logos.length, slots); i += 1) {
      if (logos[i]) ring.push(logos[i]);
      if (i < slots) ring.push(slot);
    }
    carousel.innerHTML = `<ul class="logo-ring">${ring.join('')}</ul>`;
    $('thanks').hidden = false;

    const items = [...carousel.querySelectorAll('.logo-item')];
    const step = 360 / items.length;   // evenly spaced around the ring
    const SPEED = 13;                 // degrees a second
    let turn = 0;                     // how far the ring has turned, in degrees
    let radius = 300;
    let lift = 40;                    // how much higher the back of the ring sits, in pixels
    let paused = false;
    let stopped = reduceMotion;       // the Pause button (WCAG 2.2.2: moving content can be paused)
    let visible = false;
    let drag = null;
    let last = 0;
    const measure = () => { radius = Math.min(carousel.clientWidth / 2 - items[0].offsetWidth * 0.36, 440); lift = items[0].offsetWidth * 0.22; };
    const place = () => {
      items.forEach((item, i) => {
        const angle = (i * step + turn) * Math.PI / 180;
        const near = (Math.cos(angle) + 1) / 2;          // 1 at the front of the ring, 0 at the back
        // The ring is seen from slightly above: logos at the back sit higher, smaller and fainter, behind the front ones
        item.style.transform = `translate(${(Math.sin(angle) * radius).toFixed(1)}px, ${((near - 1) * lift).toFixed(1)}px) scale(${(0.4 + 0.6 * near ** 1.4).toFixed(3)})`;
        const fade = (0.28 + 0.72 * near ** 1.2).toFixed(3);
        // Blank sponsor tiles stay solid (so the logos behind them do not show through) and fade their colours instead
        if (item.classList.contains('is-slot')) { item.style.opacity = 1; item.style.setProperty('--fade', fade); } else item.style.opacity = fade;
        item.style.zIndex = Math.round(near * 100) + 1;
        item.lastElementChild.style.opacity = Math.min(1, Math.max(0, (near - 0.55) / 0.3)).toFixed(3);   // only the front logos show their names
      });
    };
    const frame = (now) => {
      if (!visible) { last = 0; return; }
      if (last && !paused && !stopped && !drag) turn -= SPEED * Math.min(now - last, 100) / 1000;
      last = now;
      place();
      requestAnimationFrame(frame);
    };
    measure();
    place();
    window.addEventListener('resize', () => { measure(); place(); });
    window.addEventListener('load', () => { measure(); place(); });
    // Only runs while the ring is on screen
    new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) requestAnimationFrame(frame);
    }).observe(carousel);
    carousel.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') paused = true; });
    const pause = $('logo-pause');
    const label = () => {
      pause.setAttribute('aria-pressed', String(stopped));
      pause.innerHTML = stopped ? '<span aria-hidden="true">▶</span> Play' : '<span aria-hidden="true">❚❚</span> Pause';
      pause.setAttribute('aria-label', stopped ? 'Turn the logos' : 'Stop the logos turning');
    };
    pause.hidden = false;
    label();
    pause.addEventListener('click', () => { stopped = !stopped; label(); });
    carousel.addEventListener('pointerleave', () => { paused = false; });
    // Dragging sideways turns the ring by hand
    carousel.addEventListener('pointerdown', (event) => { drag = { x: event.clientX, turn, moved: false }; });
    window.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      drag.moved = true;
      carousel.classList.add('is-dragging');
      turn = drag.turn + dx / radius * 180 / Math.PI;
    });
    const release = () => { drag = null; carousel.classList.remove('is-dragging'); };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
  }

  // ---------- Opening a card ----------
  // The tapped card takes the page's transition names (site.css), so the browser grows it into the page it opens
  const grid = $('home-sections');
  const cards = [...grid.querySelectorAll('.tab-card')];
  const pair = (card, on) => {
    card.querySelector('a').style.viewTransitionName = on ? 'page-card' : '';
    card.querySelector('.tab-card-icon').style.viewTransitionName = on ? 'page-icon' : '';
  };
  const reset = () => {
    grid.classList.remove('is-leaving');
    cards.forEach((card) => { card.classList.remove('is-launching'); card.querySelectorAll('.ripple').forEach((el) => el.remove()); });
  };
  grid.addEventListener('click', (event) => {
    const link = event.target.closest('.tab-card a');
    if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const card = link.parentElement;
    cards.forEach((other) => pair(other, other === card));
    if (reduceMotion || grid.classList.contains('is-leaving')) return;
    event.preventDefault();
    // A wave from where the card was touched (from its middle when opened with the keyboard)
    const box = link.getBoundingClientRect();
    const x = event.clientX ? event.clientX - box.left : box.width / 2;
    const y = event.clientY ? event.clientY - box.top : box.height / 2;
    const radius = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y));
    const wave = document.createElement('span');
    wave.className = 'ripple';
    wave.style.cssText = `left:${x - radius}px;top:${y - radius}px;width:${radius * 2}px;height:${radius * 2}px`;
    link.prepend(wave);
    card.classList.add('is-launching');
    grid.classList.add('is-leaving');
    setTimeout(() => { location.href = link.href; }, 120);
  });
  // Coming back from a page: it shrinks into its card again
  const activation = window.navigation && window.navigation.activation;
  if (activation && activation.from && activation.navigationType !== 'reload') {
    const from = new URL(activation.from.url).pathname;
    const card = cards.find((item) => new URL(item.querySelector('a').href).pathname === from);
    if (card) { pair(card, true); card.classList.add('is-return'); }
  }
  window.addEventListener('pageshow', (event) => { if (event.persisted) reset(); });
})();

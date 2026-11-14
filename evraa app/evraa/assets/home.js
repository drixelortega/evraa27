// Home page (index.html): countdown to the opening, and a card for each section in the menu (MENU in site.js)
(() => {
  const { $, esc, url, MENU, phDate, daysUntil, ACCENT, pageIcon, reduceMotion } = EVRAA;

  // ---------- Countdown to the opening ceremony: March 31, 2027, 2:00 PM Philippine time (UTC+8) ----------
  const OPENING = Date.parse('2027-03-31T14:00:00+08:00');
  const CLOSING = Date.parse('2027-04-06T00:00:00+08:00');
  const pad = (n) => String(n).padStart(2, '0');
  let timer;
  function tick() {
    const now = Date.now();
    if (now >= OPENING) {
      clearInterval(timer);
      $('countdown-units').hidden = true;
      const live = now < CLOSING;
      $('countdown-label').textContent = live ? 'Happening now' : 'Thank you, Eastern Visayas';
      $('countdown-title').textContent = live ? 'EVRAA 2027 is underway!' : 'EVRAA 2027 has concluded';
      $('countdown-note').textContent = live ? 'March 31 – April 5, 2027 · Calbayog City' : 'One Region. One Spirit. One Victory.';
      return;
    }
    const left = Math.floor((OPENING - now) / 1000);
    const days = Math.floor(left / 86400);
    $('cd-days').textContent = new Intl.NumberFormat().format(days);
    $('cd-hours').textContent = pad(Math.floor(left % 86400 / 3600));
    $('cd-mins').textContent = pad(Math.floor(left % 3600 / 60));
    $('cd-secs').textContent = pad(left % 60);
    $('countdown').setAttribute('aria-label', `${days} days left until the EVRAA 2027 opening ceremony`);
  }
  tick();
  timer = setInterval(tick, 1000);

  // ---------- Section cards ----------
  // The icon and accent colour of each page are in site.js; this adds a short live summary. A page added to MENU gets a card too
  const venues = new Set(SPORTS.flatMap(([, list]) => list.map(([name]) => name))).size;
  const next = EVENTS.find(([, iso]) => iso && daysUntil(iso) >= 0);
  const NOTES = {
    announcements: ANNOUNCEMENTS[0] ? ANNOUNCEMENTS[0].title : 'News and advisories',
    directory: 'Hotels, food hub, directions, shuttle, hotlines & contacts',
    'medal-tally': `${TALLY.length} delegations, ranked by gold, silver and bronze`,
    games: `${SPORTS.length} sports — tap one for its game schedule`,
    'playing-venues': `${venues} venues on the map`,
    'special-events': next ? `Next: ${next[0]}, ${phDate(next[1], { month: 'long', day: 'numeric' })}` : 'Ceremonies, celebrations and cultural shows',
    billeting: `${SCHOOLS.length} schools in Calbayog City, on the map`,
    background: 'Theme, logo meaning, mascots, medals & trophies',
  };
  $('tab-cards').innerHTML = MENU.filter(([id]) => id !== 'home').map(([id, label, path], i) => `
    <li class="tab-card" style="--i: ${i}; --accent: ${ACCENT[id] || 'var(--green)'}">
      <a href="${url(path)}">
        <span class="tab-card-icon">${pageIcon(id, esc(label))}</span>
        ${id === 'announcements' && EVRAA.newsDot ? '<span class="new-dot" aria-label="new"></span>' : ''}
        <span class="tab-card-go" aria-hidden="true">→</span>
        <strong>${esc(label)}</strong>
        <span class="tab-card-note">${esc(NOTES[id] || '')}</span>
      </a>
    </li>`).join('');

  // ---------- Acknowledgement carousel ----------
  // The logos stand evenly around a ring that turns slowly. Each logo's angle on the ring gives its place, size and opacity:
  // the one at the front is in the middle and largest; they shrink and fade as they travel round the back.
  // It pauses while pointed at, and can be dragged or swiped. With reduced motion it does not turn by itself.
  if (typeof ACKNOWLEDGEMENTS !== 'undefined' && ACKNOWLEDGEMENTS.length) {
    const carousel = $('logo-carousel');
    carousel.innerHTML = `<ul class="logo-ring">${ACKNOWLEDGEMENTS.map(([name, file]) => `<li class="logo-item">
      <span class="logo-tile"><img src="${url(`evraa/images/Acknowledgement/${encodeURIComponent(file)}`)}" alt="${esc(name)}" decoding="async" draggable="false"></span>
      <span class="logo-name">${esc(name)}</span></li>`).join('')}</ul>`;
    $('thanks').hidden = false;

    const items = [...carousel.querySelectorAll('.logo-item')];
    const step = 360 / items.length;   // evenly spaced around the ring
    const SPEED = 13;                 // degrees a second
    let turn = 0;                     // how far the ring has turned, in degrees
    let radius = 300;
    let lift = 40;                    // how much higher the back of the ring sits, in pixels
    let paused = false;
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
        item.style.opacity = (0.28 + 0.72 * near ** 1.2).toFixed(3);
        item.style.zIndex = Math.round(near * 100) + 1;
        item.lastElementChild.style.opacity = Math.min(1, Math.max(0, (near - 0.55) / 0.3)).toFixed(3);   // only the front logos show their names
      });
    };
    const frame = (now) => {
      if (!visible) { last = 0; return; }
      if (last && !paused && !drag && !reduceMotion) turn -= SPEED * Math.min(now - last, 100) / 1000;
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
  const grid = $('tab-cards');
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
    setTimeout(() => { location.href = link.href; }, 260);
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

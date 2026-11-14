// Shared by every page: draws the header (a Back button to Home on the other pages, and the EVRAA logo) and footer, and provides small helpers (window.EVRAA) for the page scripts.
// Load it right after data.js at the top of <main>; the page says which menu item it is and where the site root is:
//   <body data-page="games" data-root="../">   (data-root is "" for index.html, "../" for pages in the evraa folder)
// To add a page: add it to MENU (the Home page shows a card for each), copy one of the pages in the evraa folder, and change its data-page.
(() => {
  // id (matches <body data-page>), menu label, path from the site root
  const MENU = [
    ['home', 'Home', 'index.html'],
    ['announcements', 'Announcements', 'evraa/announcements.html'],
    ['directory', 'Directory', 'evraa/directory.html'],
    ['billeting', 'Billeting Areas', 'evraa/billeting.html'],
    ['medal-tally', 'Medal Tally', 'evraa/medal-tally.html'],
    ['games', 'Games Schedule', 'evraa/games.html'],
    ['playing-venues', 'Playing Venues', 'evraa/playing-venues.html'],
    ['special-events', 'Special Events', 'evraa/special-events.html'],
    ['background', 'Background', 'evraa/background.html'],
  ];

  // Icon (24×24 line art) and accent colour of each page: used by the Home cards and above each page's heading
  const ICONS = {
    home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v10h4v-5h4v5h4V10"/>',
    announcements: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    directory: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    billeting: '<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M10 21v-5h4v5"/><path d="M9 11h.01M15 11h.01"/>',
    'medal-tally': '<path d="M7 3h4l1 5M17 3h-4l-1 5"/><circle cx="12" cy="15" r="6"/><path d="M12 12.5v5"/>',
    games: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'playing-venues': '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    'special-events': '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    background: '<path d="M9 11h6l-1.5 10h-3z"/><path d="M12 3c2.5 2 3 4.5 1.5 6.5M12 3c-2.5 2-3 4.5-1.5 6.5"/>',
  };
  const ACCENT = {
    announcements: 'var(--flame)', directory: 'var(--teal)', billeting: '#0f766e', 'medal-tally': 'var(--gold)', games: 'var(--green)',
    'playing-venues': 'var(--sky)', 'special-events': '#c2410c', background: '#a16207',
  };
  const pageIcon = (id, label = '') => (ICONS[id]
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id]}</svg>`
    : label.slice(0, 1));

  // ---------- Light / dark mode ----------
  // Starts from the device setting; the header button switches it and the choice is remembered for every page
  const THEME_KEY = 'evraa-theme';
  const html = document.documentElement;
  let theme = '';
  try { theme = localStorage.getItem(THEME_KEY) || ''; } catch (error) { /* storage blocked: follow the device */ }
  if (theme !== 'dark' && theme !== 'light') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.dataset.theme = theme;

  const page = document.body.dataset.page;
  const root = document.body.dataset.root || '';
  const url = (path) => root + path;

  // Links from the old one-page site (index.html#games, index.html#directory/hotlines, ...) open the page that now holds them
  if (page === 'home' && location.hash.length > 1) {
    const MOVED = { 'directory/schedule': 'games', 'directory/venues': 'playing-venues', };
    const [id, sub] = (MOVED[location.hash.slice(1)] || location.hash.slice(1)).split('/');
    const target = MENU.find(([key]) => key === id && key !== 'home');
    if (target) location.replace(url(target[2]) + (sub ? `#${sub}` : ''));
  }

  if (page === 'background' && location.hash === '#billeting') location.replace(url('evraa/billeting.html'));

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tba = '<span class="tba">To be announced</span>';
  const ACCENTS = ['var(--green)', 'var(--teal)', 'var(--gold)', 'var(--flame)', 'var(--sky)'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Dates are shown and compared in Philippine time, whatever the viewer's own time zone
  const phDate = (iso, opts) => new Date(`${iso}T12:00:00+08:00`).toLocaleDateString('en-US', { timeZone: 'Asia/Manila', ...opts });
  const todayPH = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const daysUntil = (iso) => Math.round((Date.parse(`${iso}T00:00:00+08:00`) - Date.parse(`${todayPH}T00:00:00+08:00`)) / 86400000);
  const mapsLink = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Slides the pill behind the active tab (Directory sub-tabs)
  function moveIndicator(nav, active) {
    const bar = nav.querySelector('.tab-indicator');
    if (!active || !active.offsetWidth) return;
    bar.style.width = `${active.offsetWidth}px`;
    bar.style.height = `${active.offsetHeight}px`;
    bar.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    requestAnimationFrame(() => bar.classList.add('ready'));
  }
  // Children of el rise in one after another; dir slides them in from the side (-1 left, 1 right)
  function enter(el, dir = 0) {
    el.classList.remove('enter');
    if (reduceMotion) return;
    el.style.setProperty('--dx', `${dir * 28}px`);
    [...el.children].forEach((child, i) => child.style.setProperty('--i', i));
    void el.offsetWidth;
    el.classList.add('enter');
  }

  // Leaflet maps (load leaflet.min.js before the page script); pins are numbered circles
  function pinMap(id) {
    const map = L.map(id, { scrollWheelZoom: false, zoomSnap: 0.25 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    return map;
  }
  const pinIcon = (label, cls = '') => L.divIcon({ className: '', html: `<span class="map-pin ${cls}">${label}</span>`, iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14] });
  const mapFailed = (card) => { card.innerHTML = '<p style="padding:20px;color:var(--muted)">The map could not load. Check your connection and refresh the page.</p>'; };

  // Minimal line icons for each sport (24×24, drawn in white on a coloured badge); a sport without one shows its first letter
  const SPORT_ICONS = {
    'Archery': '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4.5"/><circle cx="11" cy="13" r="1"/><path d="M11 13l9-9M17 4h3v3"/>',
    'Arnis': '<path d="M5 19L19 5M5 5l14 14"/><path d="M3.5 17.5l3 3M17.5 3.5l3 3M3.5 6.5l3-3M17.5 20.5l3-3"/>',
    'Athletics': '<circle cx="15" cy="4.5" r="2"/><path d="M13.5 8L10.5 13.5l3.5 2.5-1 5"/><path d="M7.5 10l4-2.5 3 3h3"/><path d="M10.5 13.5l-2 3.5H5"/>',
    'Badminton': '<circle cx="12" cy="18.5" r="2.5"/><path d="M10 16.5L7 5M14 16.5L17 5M12 16V4.5"/><path d="M7 5q5-2 10 0M8.3 10.5h7.4"/>',
    'Baseball': '<circle cx="12" cy="12" r="9"/><path d="M6.5 5c2.6 3.8 2.6 10.2 0 14M17.5 5c-2.6 3.8-2.6 10.2 0 14"/>',
    'Softball': '<path d="M7.5 16.5L16 8a2.1 2.1 0 0 1 3 3l-8.5 8.5z"/><path d="M8.5 18l-4 4M3.5 21l2 2"/><circle cx="7" cy="7" r="3"/>',
    'Basketball': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/><path d="M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8"/>',
    'Boxing': '<path d="M8 16V8a5 5 0 0 1 5-5h1a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9a1 1 0 0 1-1-1z"/><path d="M8 10H6.5a2 2 0 0 0 0 4H11"/><path d="M9 17v4h8v-4.5"/>',
    'Football': '<circle cx="12" cy="12" r="9"/><path d="M12 8.5l3.3 2.4-1.3 3.9h-4l-1.3-3.9z"/><path d="M12 8.5V3M15.3 10.9l5.2-1.7M14 14.8l3.2 4.4M10 14.8l-3.2 4.4M8.7 10.9L3.5 9.2"/>',
    'Gymnastics': '<path d="M8 2v10M16 2v10"/><circle cx="8" cy="15.5" r="3.5"/><circle cx="16" cy="15.5" r="3.5"/>',
    'Special Games': '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    'Taekwondo': '<path d="M3 9.5h18v3H3z"/><path d="M10 8.5h4v5h-4z"/><path d="M10.5 13.5L8 20.5M13.5 13.5l2.5 7"/>',
    'Lawn Tennis': '<ellipse cx="10" cy="10" rx="5.5" ry="6.5" transform="rotate(-45 10 10)"/><path d="M14 14l6 6"/><path d="M7 8.5l4.5 4.5M8.5 7l4.5 4.5"/><circle cx="19" cy="5" r="1.8"/>',
    'Volleyball': '<circle cx="12" cy="12" r="9"/><path d="M12 12V3"/><path d="M12 12l7.8 4.5"/><path d="M12 12l-7.8 4.5"/><path d="M8 4c-.5 4 1 7 4 8M20.6 9.5c-3.5-1.5-6.8-.6-8.6 2.5M7.4 19.5c3-2.4 4.6-5.3 4.6-7.5"/>',
    'Wrestling': '<path d="M8.5 3v3.5a3.5 3.5 0 0 0 7 0V3"/><path d="M8.5 6.5L7 21h4l1-6 1 6h4L15.5 6.5"/>',
    'Wushu': '<circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9"/><circle cx="12" cy="7.5" r=".8"/><circle cx="12" cy="16.5" r=".8"/>',
    'Weightlifting': '<path d="M5 12h14"/><path d="M5 7.5v9M8 6v12M16 6v12M19 7.5v9"/><path d="M5 7.5H3.5v9H5M19 7.5h1.5v9H19" /><path d="M2.5 12h1M20.5 12h1"/>',
  };
  const sportIcon = (sport) => SPORT_ICONS[sport]
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${SPORT_ICONS[sport]}</svg>`
    : esc(sport[0]);

  // ---------- Fresh content without reloading ----------
  // Reads data-live.js again (the lists saved on the admin page) and returns them
  async function fetchLive() {
    const response = await fetch(`${url('evraa/assets/data-live.js')}?t=${Date.now()}`, { cache: 'no-store' });
    const text = await response.text();
    // A saved copy handed back by the service worker while offline does not count as fresh
    if (!response.ok || response.headers.has('X-Evraa-Saved') || !text.includes('const TALLY')) throw new Error('data-live.js could not be read');
    return new Function(`${text}\nreturn { ANNOUNCEMENTS, SCHEDULE, PLACES, HOTLINES, CONTACTS, TALLY, EVENTS };`)();
  }
  // "Updated just now" with a Refresh button, under the page heading. render(data) redraws the page from fresh content;
  // target dims with a shimmer when the connection takes more than a moment; every (ms) also refreshes by itself.
  function liveBar({ target, render, every = 0 }) {
    const head = document.querySelector('.page-head');
    head.insertAdjacentHTML('beforeend', `<div class="live-bar"><span class="live-dot" aria-hidden="true"></span><span class="live-text" role="status">Updated just now</span>
      <button type="button" class="refresh-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>Refresh</button></div>`);
    const bar = head.lastElementChild;
    const text = bar.querySelector('.live-text');
    const button = bar.querySelector('.refresh-btn');
    let at = Date.now();
    let failed = false;
    let busy = false;
    const label = () => {
      const minutes = Math.floor((Date.now() - at) / 60000);
      const ago = minutes < 1 ? 'just now' : minutes === 1 ? '1 minute ago' : minutes < 60 ? `${minutes} minutes ago` : 'over an hour ago';
      text.textContent = failed ? `No connection · last updated ${ago}` : `Updated ${ago}`;
      bar.classList.toggle('is-stale', failed);
    };
    async function refresh() {
      if (busy) return;
      busy = true;
      button.classList.add('is-spinning');
      const started = Date.now();
      const slow = setTimeout(() => target.classList.add('is-loading'), 200);
      try { render(await fetchLive()); at = Date.now(); failed = false; } catch (error) { failed = true; }
      clearTimeout(slow);
      // Let the spin finish a turn so a fast refresh is still seen
      setTimeout(() => { target.classList.remove('is-loading'); button.classList.remove('is-spinning'); busy = false; label(); }, Math.max(0, 600 - (Date.now() - started)));
    }
    button.addEventListener('click', refresh);
    setInterval(label, 20000);
    if (every) {
      setInterval(() => { if (!document.hidden) refresh(); }, every);
      document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - at > every) refresh(); });
    }
  }

  window.EVRAA = { MENU, page, url, $, esc, tba, ACCENTS, reduceMotion, phDate, todayPH, daysUntil, mapsLink, slug, moveIndicator, enter, pinMap, pinIcon, mapFailed, sportIcon, ACCENT, pageIcon, liveBar };

  // ---------- Header ----------
  // The dot on the Home page's Announcements card shows until the newest announcement has been seen in this browser
  const SEEN_KEY = 'evraa-seen-announcement';
  const latest = typeof ANNOUNCEMENTS !== 'undefined' && ANNOUNCEMENTS[0] ? ANNOUNCEMENTS[0].title : '';
  let seen = '';
  try {
    seen = localStorage.getItem(SEEN_KEY) || '';
    if (page === 'announcements') localStorage.setItem(SEEN_KEY, latest);
  } catch (error) { /* storage blocked: show the dot */ }
  const showDot = latest && seen !== latest && page !== 'announcements';
  EVRAA.newsDot = showDot;

  document.currentScript.insertAdjacentHTML('beforebegin', `
    <header class="topbar">
      ${page === 'home' ? '' : `<a class="back-btn" href="${url('index.html')}" aria-label="Back to the home page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>Back</a>`}
      <a class="brand" href="${url('index.html')}"><img class="brand-logo" src="${url('evraa/images/logo-header.png')}" alt="" width="102" height="120"><span>EVRAA 2027</span></a>
      <button class="install-btn" id="install-btn" type="button" aria-label="Install app" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>Install app</button>
      <button class="theme-btn" id="theme-btn" type="button">
        <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
        <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.700 6.300l1.400-1.400"/></svg>
      </button>
    </header>`);

  const themeBtn = $('theme-btn');
  const labelTheme = () => themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  labelTheme();
  themeBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, theme); } catch (error) { /* not remembered */ }
    const apply = () => { html.dataset.theme = theme; labelTheme(); };
    if (!document.startViewTransition || reduceMotion) { apply(); return; }
    // The new colours spread out in a circle from the button
    const box = themeBtn.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    html.classList.add('theme-switching');
    const transition = document.startViewTransition(apply);
    transition.ready.then(() => html.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    )).catch(() => {});
    transition.finished.finally(() => html.classList.remove('theme-switching'));
  });

  // ---------- Installable app ----------
  // The service worker (sw.js at the site root) keeps visited pages working offline. Browsers that can install the site
  // offer it through the "Install app" button; on iPhone it is Share → Add to Home Screen.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register(url('sw.js')).catch(() => {}));
  }
  const installBtn = $('install-btn');
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; installBtn.hidden = false; });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; });
  installBtn.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installBtn.hidden = true;
  });

  // ---------- Bottom bar (phones) ----------
  const BAR = [['home', 'Home'], ['announcements', 'News'], ['games', 'Games'], ['medal-tally', 'Medals'], ['directory', 'Directory']];
  const tabbar = `<nav class="tabbar" aria-label="Main sections">${BAR.map(([id, label]) => {
    const item = MENU.find(([key]) => key === id);
    return `<a href="${url(item[2])}"${id === page ? ' class="is-active" aria-current="page"' : ''}><span class="tabbar-icon">${pageIcon(id)}${id === 'announcements' && showDot ? '<i class="new-dot"></i>' : ''}</span>${label}</a>`;
  }).join('')}</nav>`;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', tabbar);
    const main = document.querySelector('main');
    main.insertAdjacentHTML('beforeend', '<footer class="footer"><span>Eastern Visayas Regional Athletic Association 2027</span><span>Calbayog City</span></footer>');
    const content = document.querySelector('.page');
    const head = content && content.querySelector('.page-head');
    if (head) head.insertAdjacentHTML('afterbegin', `<span class="page-icon" style="--accent: ${ACCENT[page] || 'var(--green)'}">${pageIcon(page)}</span>`);
    if (content) enter(content);
  });
})();

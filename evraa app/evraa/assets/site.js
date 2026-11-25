// Shared by every page: draws the header (a Back button to Home on the other pages, and the EVRAA logo) and footer, and provides small helpers (window.EVRAA) for the page scripts.
// Load it right after data.js at the top of <main>; the page says which menu item it is and where the site root is:
//   <body data-page="games" data-root="../">   (data-root is "" for index.html, "../" for pages in the evraa folder)
// To add a page: add it to MENU (the Home page shows a card for each), copy one of the pages in the evraa folder, and change its data-page.
(() => {
  // id (matches <body data-page>), menu label, path from the site root
  const MENU = [
    ['home', 'Home', 'index.html'],
    ['announcements', 'News & Announcements', 'evraa/announcements.html'],
    ['directory', 'Directory', 'evraa/directory.html'],
    ['billeting', 'Billeting Areas', 'evraa/billeting.html'],
    ['medal-tally', 'Medal Tally', 'evraa/medal-tally.html'],
    ['games', 'Games Schedule', 'evraa/games.html'],
    ['playing-venues', 'Playing Venues', 'evraa/playing-venues.html'],
    ['special-events', 'Special Events', 'evraa/special-events.html'],
    ['background', 'About EVRAA 2027', 'evraa/background.html'],
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
  // Short labels for the menu across the top on computers and tablets
  const SHORT = {
    home: 'Home', announcements: 'News', games: 'Games', 'playing-venues': 'Venues', 'medal-tally': 'Medals',
    directory: 'Directory', billeting: 'Billeting', 'special-events': 'Events', background: 'About',
  };
  // Small logo of each delegation (evraa/images/logos, resized copies of evraa/images/DO Logos)
  const LOGOS = {
    'Baybay City': 'baybay-city', 'Biliran': 'biliran', 'Borongan City': 'borongan', 'Calbayog City': 'calbayog',
    'Catbalogan City': 'catbalogan', 'Eastern Samar': 'eastern-samar', 'Leyte': 'leyte', 'Maasin City': 'maasin',
    'Northern Samar': 'northern-samar', 'Ormoc City': 'ormoc', 'Samar': 'samar', 'Southern Leyte': 'southern-leyte',
    'Tacloban City': 'tacloban',
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
      try {
        render(await fetchLive());
        at = Date.now();
        failed = false;
        EVRAA.store.set('evraa-online-at', String(at));
        EVRAA.offlineNotice(false);
      } catch (error) { failed = true; if (!navigator.onLine) EVRAA.offlineNotice(true); }
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

  // ---------- Small shared pieces ----------
  // Remembered on this device; never required (storage can be blocked in private windows)
  const store = {
    get(key, fallback = '') { try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (error) { return fallback; } },
    set(key, value) { try { if (value === '' || value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (error) { /* not remembered */ } },
  };
  const logoOf = (name) => (LOGOS[name] ? url(`evraa/images/logos/${LOGOS[name]}.webp`) : '');
  const logoImg = (name, cls = 'team-logo') => (LOGOS[name] ? `<img class="${cls}" src="${logoOf(name)}" alt="" width="96" height="96" loading="lazy" decoding="async">` : '');
  // A delegation's moniker logo (evraa/images/monikers, from DELEGATIONS in data.js); falls back to its division logo
  // decorative: alt="" where the name is already written beside it
  const monikerImg = (name, cls = 'moniker-logo', decorative = false) => {
    const team = typeof DELEGATIONS !== 'undefined' && DELEGATIONS.find(([key]) => key === name);
    return team && team[4]
      ? `<img class="${cls}" src="${url(`evraa/images/monikers/${team[4]}.webp`)}" alt="${decorative ? '' : esc(`${name} ${team[1]}`)}" loading="lazy" decoding="async">`
      : logoImg(name, cls);
  };
  const medalImg = (kind) => `<img src="${url(`evraa/images/medals/${kind.toLowerCase()}.webp`)}" alt="" width="120" height="168" decoding="async">`;

  // "My delegation": picked on the Home page only, and used across the app
  const MINE_KEY = 'evraa-my-delegation';
  const myDelegation = () => store.get(MINE_KEY);
  // ---------- Delegation colours ----------
  // The delegation picked on the Home page (DELEGATIONS in data.js) recolours the app: its primary colour takes the place of the
  // EVRAA greens (headers, buttons, the countdown, tables) and its accent the place of the gold highlights. No team: the EVRAA green.
  const teamOf = (name) => (typeof DELEGATIONS !== 'undefined' ? DELEGATIONS.find(([key]) => key === name) : null);
  // Delegation colours are darkened just enough for white text and links on white to pass WCAG AA (4.5:1)
  const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const luminance = (rgb) => {
    const [r, g, b] = rgb.map((c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const readable = (hex) => {
    let rgb = rgbOf(hex);
    for (let i = 0; i < 20 && 1.05 / (luminance(rgb) + 0.05) < 4.6; i += 1) rgb = rgb.map((c) => Math.round(c * 0.92));
    return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  };
  const THEME_VARS = ['--forest', '--green', '--link', '--tint', '--tint-2', '--team-accent', '--team-on-accent', '--team-glow', '--team-moniker'];
  function applyTeam(name) {
    const team = teamOf(name);
    const style = html.style;
    THEME_VARS.forEach((v) => style.removeProperty(v));
    delete html.dataset.team;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!team) { if (meta) meta.content = '#123f26'; return; }
    const [, , primary, accent, moniker] = team;
    // The moniker logo, washed out behind the Home countdown (a full address, as the stylesheet is in another folder)
    if (moniker) style.setProperty('--team-moniker', `url("${new URL(url(`evraa/images/monikers/${moniker}.webp`), location.href).href}")`);
    const dark = theme === 'dark';
    const strong = readable(primary);
    style.setProperty('--green', strong);
    style.setProperty('--forest', `color-mix(in srgb, ${primary} 72%, #000)`);
    style.setProperty('--link', dark ? `color-mix(in srgb, ${primary} 45%, #fff)` : strong);
    style.setProperty('--tint', dark ? `color-mix(in srgb, ${primary} 14%, #141f18)` : `color-mix(in srgb, ${primary} 6%, #fff)`);
    style.setProperty('--tint-2', dark ? `color-mix(in srgb, ${primary} 22%, #141f18)` : `color-mix(in srgb, ${primary} 12%, #fff)`);
    style.setProperty('--team-accent', accent);
    // Dark text on light accents (gold, aqua), white on dark ones (navy)
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(accent.slice(i, i + 2), 16));
    const light = 0.299 * r + 0.587 * g + 0.114 * b > 150;
    style.setProperty('--team-on-accent', light ? '#1a1a1a' : '#fff');
    // On the dark countdown card a dark accent (navy) would not show, so it is lightened there
    style.setProperty('--team-glow', light ? accent : `color-mix(in srgb, ${accent} 35%, #fff)`);
    html.dataset.team = slug(name);
    if (meta) meta.content = primary;
  }
  const setMyDelegation = (name) => { store.set(MINE_KEY, name); applyTeam(name); };
  applyTeam(myDelegation());
  // Schedule team names are typed by hand ("Calbayog", "Calbayog City", "CALBAYOG CITY"), so compare them loosely
  const teamKey = (name) => String(name || '').toLowerCase().replace(/\bcity\b|\bdivision\b|[^a-z]/g, '');
  const sameTeam = (a, b) => Boolean(teamKey(a)) && teamKey(a) === teamKey(b);

  // A short message at the bottom of the screen ("Link copied"); action: { label, run } adds a button such as Undo
  function toast(message, action = null, ms = 0) {
    let el = $('toast');
    if (!el) {
      document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status" aria-live="polite"></div>');
      el = $('toast');
    }
    el.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button" class="toast-btn">${esc(action.label)}</button>` : ''}`;
    if (action) el.querySelector('.toast-btn').addEventListener('click', () => { el.classList.remove('is-shown'); action.run(); });
    el.classList.add('is-shown');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('is-shown'), ms || (action ? 6000 : 2800));
  }
  // The phone's share sheet (Messenger, SMS, ...); on computers the text and link are copied instead
  async function share({ title, text, link = location.href }) {
    if (navigator.share) {
      try { await navigator.share({ title, text, url: link }); } catch (error) { /* closed without sharing */ }
      return;
    }
    try { await navigator.clipboard.writeText(`${text}\n${link}`); toast('Copied — paste it in a message'); } catch (error) { toast('Sharing is not available in this browser'); }
  }
  const shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

  // ---------- The days of the games, and game times ----------
  const OPENING = Date.parse('2027-03-31T14:00:00+08:00');
  const CLOSING = Date.parse('2027-04-06T00:00:00+08:00');
  const GAME_DAYS = ['2027-03-31', '2027-04-01', '2027-04-02', '2027-04-03', '2027-04-04', '2027-04-05'];
  // For trying the in-games layout before March 31: add ?preview=2027-04-01T09:30 to any page's address
  const preview = new URLSearchParams(location.search).get('preview');
  const previewAt = preview && Date.parse(`${preview.length === 10 ? `${preview}T08:00` : preview}:00+08:00`);
  const now = () => previewAt || Date.now();
  const phase = () => (now() < OPENING ? 'soon' : now() < CLOSING ? 'live' : 'done');
  const todayLive = () => new Date(now()).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  // Minutes after midnight from a time typed on the admin page ("8:00 AM", "1:30PM", "14:00"); null when there is none
  function gameMinutes(time) {
    const text = String(time || '');
    const m = text.match(/(\d{1,2})(?:[:.](\d{2}))?\s*([ap])\.?\s*m\b/i) || text.match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2] || 0);
    if (m[3]) h = (h % 12) + (m[3].toLowerCase() === 'p' ? 12 : 0);
    return h > 23 || min > 59 ? null : h * 60 + min;
  }
  // Every game in SCHEDULE as one list: { sport, iso, time, minutes, what, team, versus }, in date and time order
  const allGames = (schedule = SCHEDULE) => Object.entries(schedule)
    .flatMap(([sport, list]) => list.map(([iso, time, what, team, versus]) => ({ sport, iso, time, minutes: gameMinutes(time), what, team, versus })))
    .sort((a, b) => a.iso.localeCompare(b.iso) || (a.minutes ?? 1e4) - (b.minutes ?? 1e4) || a.sport.localeCompare(b.sport));
  // Medal standings: by gold, then silver, then bronze; tied delegations share a rank
  const rankTally = (tally = TALLY) => {
    const rows = tally.map(([name, g, s, b]) => ({ name, g, s, b, t: g + s + b }))
      .sort((x, y) => y.g - x.g || y.s - x.s || y.b - x.b || x.name.localeCompare(y.name));
    rows.forEach((r, i) => { const prev = rows[i - 1]; r.rank = prev && prev.g === r.g && prev.s === r.s && prev.b === r.b ? prev.rank : i + 1; });
    return rows;
  };
  const gameTitle = (g) => (g.team && g.versus ? `${g.team} vs ${g.versus}` : g.what || g.sport);
  // A game counts as on now for 90 minutes after its start (the schedule has no end times)
  const gameStatus = (g) => {
    if (g.iso !== todayLive() || g.minutes === null) return '';
    const [h, m] = new Date(now()).toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false }).split(':').map(Number);
    const at = h * 60 + m;
    return at >= g.minutes + 90 ? 'done' : at >= g.minutes ? 'now' : 'later';
  };
  // An .ics file the phone opens in its calendar app
  function addToCalendar(g, venue = '') {
    const day = g.iso.replace(/-/g, '');
    const pad = (n) => String(n).padStart(2, '0');
    const when = g.minutes === null
      ? `DTSTART;VALUE=DATE:${day}`
      : `DTSTART;TZID=Asia/Manila:${day}T${pad(Math.floor(g.minutes / 60))}${pad(g.minutes % 60)}00\r\nDURATION:PT1H30M`;
    const text = (s) => String(s).replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EVRAA 2027//Games//EN', 'BEGIN:VEVENT',
      `UID:${day}-${slug(g.sport)}-${slug(gameTitle(g))}@evraa2027`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, when,
      `SUMMARY:${text(`${g.sport}: ${gameTitle(g)}`)}`, venue ? `LOCATION:${text(`${venue}, Calbayog City`)}` : '',
      `DESCRIPTION:${text(`EVRAA 2027${g.team && g.versus && g.what ? ` · ${g.what}` : ''}`)}`, 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    link.download = `EVRAA ${g.sport} ${g.iso}.ics`;
    document.body.append(link);
    link.click();
    setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  }

  // ---------- Announcements read on this device ----------
  // Each announcement is "new" until the Announcements page has shown it here (remembered by title)
  const SEEN_KEY = 'evraa-seen-announcements';
  const seenTitles = () => {
    let list = [];
    try { list = JSON.parse(store.get(SEEN_KEY, '[]')); } catch (error) { list = []; }
    // Earlier versions remembered only the newest title: whoever saw it had seen the ones below it too
    const old = store.get('evraa-seen-announcement');
    if (!list.length && old && typeof ANNOUNCEMENTS !== 'undefined') {
      const at = ANNOUNCEMENTS.findIndex((a) => a.title === old);
      if (at > -1) list = ANNOUNCEMENTS.slice(at).map((a) => a.title);
    }
    // A first visit: everything is new to this visitor, so only announcements from the last 7 days are marked new
    // (an announcement without a date counts as old); remembered so it is decided only once
    if (store.get(SEEN_KEY) === '' && !old && typeof ANNOUNCEMENTS !== 'undefined') {
      const recent = (a) => { const at = Date.parse(a.date || ''); return Number.isFinite(at) && Date.now() - at < 7 * 86400000; };
      list = ANNOUNCEMENTS.filter((a) => !recent(a)).map((a) => a.title);
      store.set(SEEN_KEY, JSON.stringify(list.length ? list : ['']));
    }
    return new Set(list);
  };
  const markSeen = (list) => store.set(SEEN_KEY, JSON.stringify([...new Set([...seenTitles(), ...list.map((a) => a.title)])].slice(-200)));
  const unread = (list = typeof ANNOUNCEMENTS !== 'undefined' ? ANNOUNCEMENTS : []) => { const seen = seenTitles(); return list.filter((a) => !seen.has(a.title)); };

  const medalCounts = (r) => [['gold', 'Gold', r.g], ['silver', 'Silver', r.s], ['bronze', 'Bronze', r.b]]
    .map(([cls, label, n]) => `<span class="mc ${cls}" title="${label}">${n}<span class="visually-hidden"> ${label.toLowerCase()}</span></span>`).join('');
  const mineTag = '<span class="mine-tag"><span aria-hidden="true">★</span> Your team</span>';

  window.EVRAA = {
    MENU, page, url, $, esc, tba, ACCENTS, reduceMotion, phDate, todayPH, daysUntil, mapsLink, slug, moveIndicator, enter, pinMap, pinIcon, mapFailed,
    sportIcon, ACCENT, pageIcon, liveBar, store, logoOf, logoImg, monikerImg, medalImg, myDelegation, setMyDelegation, teamOf, sameTeam, toast, share, shareIcon,
    OPENING, CLOSING, GAME_DAYS, now, phase, todayLive, gameMinutes, allGames, rankTally, gameTitle, gameStatus, addToCalendar, seenTitles, markSeen, unread,
    medalCounts, mineTag, readable,
  };

  // ---------- Header ----------
  // The dot on the Announcements card and tab shows while an announcement has not been seen on this device
  const showDot = page !== 'announcements' && unread().length > 0;
  EVRAA.newsDot = showDot;

  const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>';
  // On computers and tablets every section is one click away in the menu under the logo (phones have the bottom bar)
  const NAV = ['home', 'announcements', 'games', 'playing-venues', 'medal-tally', 'directory', 'billeting', 'special-events', 'background'];
  const topnav = `<nav class="topnav" aria-label="Sections">${NAV.map((id) => {
    const item = MENU.find(([key]) => key === id);
    return `<a href="${url(item[2])}"${id === page ? ' class="is-active" aria-current="page"' : ''}>${SHORT[id]}${id === 'announcements' && showDot ? '<i class="new-dot" aria-label="new"></i>' : ''}</a>`;
  }).join('')}</nav>`;

  document.currentScript.insertAdjacentHTML('beforebegin', `
    <header class="topbar">
      ${page === 'home' ? '' : `<a class="back-btn" href="${url('index.html')}" data-back aria-label="Go back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>Back</a>`}
      <a class="brand" href="${url('index.html')}"><img class="brand-logo" src="${url('evraa/images/logo-header.png')}" alt="" width="102" height="120"><span>EVRAA 2027</span></a>
      <a class="sos-btn" href="${url('evraa/directory.html')}#hotlines" aria-label="Help: emergency hotlines">${phoneIcon}<span class="sos-long">Hotlines</span><span class="sos-short">Help</span></a>
      <button class="install-btn" id="install-btn" type="button" aria-label="Install app" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>Install app</button>
      <button class="theme-btn" id="theme-btn" type="button">
        <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
        <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.700 6.300l1.400-1.400"/></svg>
      </button>
      ${topnav}
    </header>`);

  const themeBtn = $('theme-btn');
  const labelTheme = () => themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  labelTheme();
  themeBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, theme); } catch (error) { /* not remembered */ }
    const apply = () => { html.dataset.theme = theme; labelTheme(); applyTeam(myDelegation()); };
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
  installBtn.addEventListener('click', () => installApp());

  // ---------- Bottom bar (phones) ----------
  // The four places people look most during the games, and More for the rest (News, Directory, Hotels, ...)
  const BAR = [['home', 'Home'], ['games', 'Games'], ['playing-venues', 'Venues'], ['medal-tally', 'Medals']];
  const MORE = [
    ['announcements', 'News & Announcements', 'evraa/announcements.html'],
    ['directory', 'Directory', 'evraa/directory.html'],
    ['billeting', 'Hotels', 'evraa/directory.html#hotels', 'Places to stay in Calbayog City'],
    ['directory', 'Hotlines', 'evraa/directory.html#hotlines', 'Emergency and EVRAA numbers'],
    ['billeting', 'Billeting Areas', 'evraa/billeting.html'],
    ['special-events', 'Special Events', 'evraa/special-events.html'],
    ['background', 'About EVRAA 2027', 'evraa/background.html'],
  ];
  const inBar = BAR.some(([id]) => id === page);
  const moreIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
  const newCount = unread().length;
  const tabbar = `<nav class="tabbar" aria-label="Main sections">${BAR.map(([id, label]) => {
    const item = MENU.find(([key]) => key === id);
    return `<a href="${url(item[2])}"${id === page ? ' class="is-active" aria-current="page"' : ''}><span class="tabbar-icon">${pageIcon(id)}</span>${label}</a>`;
  }).join('')}<button type="button" class="tabbar-more${inBar ? '' : ' is-active'}" id="more-btn" aria-haspopup="dialog"${inBar ? '' : ' aria-current="page"'}>
    <span class="tabbar-icon">${moreIcon}${showDot ? '<i class="new-dot"></i>' : ''}</span>More${showDot ? `<span class="visually-hidden">, ${newCount} new announcements</span>` : ''}</button></nav>
  <dialog class="sport-dialog more-sheet" id="more-sheet" aria-labelledby="more-title">
    <div class="sport-dialog-head"><div><div class="eyebrow">EVRAA 2027</div><h3 id="more-title">More</h3></div>
      <button type="button" class="dialog-close" data-close aria-label="Close">×</button></div>
    <ul class="more-list">${MORE.map(([icon, label, path, note]) => `<li><a href="${url(path)}"${page === icon && !path.includes('#') ? ' aria-current="page"' : ''}>
      <span class="more-icon" style="--accent: ${ACCENT[icon] || 'var(--green)'}">${pageIcon(icon)}</span>
      <span><strong>${esc(label)}</strong>${note ? `<small>${esc(note)}</small>` : ''}</span>
      ${icon === 'announcements' && newCount && page !== 'announcements' ? `<span class="new-count" aria-label="${newCount} new">${newCount}</span>` : '<span class="more-go" aria-hidden="true">›</span>'}</a></li>`).join('')}</ul>
  </dialog>`;

  // ---------- Pop-ups (bottom sheets on phones) ----------
  // Shared by every pop-up: the phone's Back closes it (instead of leaving the page), tapping the dimmed backdrop closes it,
  // and on phones dragging its top down past a third of its height closes it.
  function sheet(dialog) {
    if (!dialog || dialog.dataset.sheet) return dialog && dialog.sheet;
    dialog.dataset.sheet = '1';
    let entry = false;
    const open = () => {
      dialog.style.transform = '';
      if (!dialog.open) dialog.showModal();
      if (!entry) { history.pushState({ sheet: dialog.id }, ''); entry = true; }
    };
    dialog.addEventListener('close', () => {
      // Closed by the × or the backdrop: take back the history entry the pop-up added
      if (entry) { entry = false; if (history.state && history.state.sheet === dialog.id) history.back(); }
    });
    window.addEventListener('popstate', () => { if (dialog.open && entry) { entry = false; dialog.close(); } });
    dialog.addEventListener('click', (event) => { if (event.target === dialog || event.target.closest('[data-close]')) dialog.close(); });
    // A link inside that opens another page: leave without stepping back first
    dialog.addEventListener('click', (event) => { const link = event.target.closest('a[href]'); if (link && !link.target && !link.hash.startsWith('#install')) entry = false; });
    const head = dialog.querySelector('.sport-dialog-head');
    let drag = null;
    if (head) {
      head.addEventListener('pointerdown', (event) => {
        if (window.innerWidth > 600 || event.target.closest('button, a')) return;
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
    }
    dialog.sheet = { open, close: () => dialog.close() };
    return dialog.sheet;
  }
  EVRAA.sheet = sheet;

  // ---------- Install the app (also the #install link an announcement can use) ----------
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installBtn.hidden = true;
    } else if (standalone()) {
      toast('The EVRAA 2027 app is already installed on this device');
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      toast('To install: tap Share, then "Add to Home Screen"', null, 7000);
    } else {
      toast('To install: open your browser menu (⋮) and tap "Install app" or "Add to Home screen"', null, 7000);
    }
  }
  EVRAA.installApp = installApp;
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href$="#install"]');
    if (!link) return;
    event.preventDefault();
    installApp();
  });

  // ---------- Offline notice ----------
  // Every page can open from the copy saved on the phone (sw.js); a strip under the header says so, and from when that copy is
  const ONLINE_KEY = 'evraa-online-at';
  if (navigator.onLine) store.set(ONLINE_KEY, String(Date.now()));
  function offlineNotice(off) {
    let bar = $('offline-bar');
    if (!off) { if (bar) bar.hidden = true; return; }
    const at = Number(store.get(ONLINE_KEY, '0'));
    const when = at ? new Date(at).toLocaleString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
    if (!bar) {
      document.querySelector('.topbar').insertAdjacentHTML('afterend', '<p class="offline-bar" id="offline-bar" role="status"></p>');
      bar = $('offline-bar');
    }
    bar.innerHTML = `<strong>You're offline.</strong> Showing the information saved on this device${when ? ` (last updated ${esc(when)})` : ''}. It refreshes once you're back online.`;
    bar.hidden = false;
  }
  EVRAA.offlineNotice = offlineNotice;
  window.addEventListener('offline', () => offlineNotice(true));
  window.addEventListener('online', () => { store.set(ONLINE_KEY, String(Date.now())); offlineNotice(false); });

  // ---------- Back button within thumb's reach (phones) ----------
  // Floats just above the bottom bar on every page but Home. It goes back to the page before (as the phone's own Back would),
  // or to Home when this page was opened directly (from a shared link, or the installed app's start).
  const fab = page === 'home' ? '' : `<button type="button" class="fab-back" id="fab-back" aria-label="Go back">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg><span>Back</span></button>`;
  const cameFromSite = () => { try { return document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1; } catch (error) { return false; } };

  document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.onLine) offlineNotice(true);
    document.body.insertAdjacentHTML('beforeend', fab + tabbar);
    const goBack = (event) => { if (event) event.preventDefault(); if (cameFromSite()) history.back(); else location.href = url('index.html'); };
    if (fab) $('fab-back').addEventListener('click', () => goBack());
    document.querySelector('[data-back]')?.addEventListener('click', goBack);
    if (fab) {
      let lastY = window.scrollY;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (Math.abs(y - lastY) < 8) return;
        $('fab-back').classList.toggle('is-tucked', y > lastY && y > 120);
        lastY = y;
      }, { passive: true });
    }
    // More: the other sections, in a sheet
    const more = sheet($('more-sheet'));
    $('more-btn').addEventListener('click', () => more.open());
    // The menu across the top fades at its edge while more of it is out of view
    const nav = document.querySelector('.topnav');
    const edge = () => nav && nav.classList.toggle('has-more', nav.scrollWidth - nav.clientWidth - nav.scrollLeft > 4);
    if (nav) { nav.addEventListener('scroll', edge, { passive: true }); window.addEventListener('resize', edge); edge(); }
    const main = document.querySelector('main');
    // The footer's first line is also the (unmarked) way in to the admin page, evraa/admin; it looks like plain text
    main.insertAdjacentHTML('beforeend', `<footer class="footer"><a class="footer-quiet" href="${url('evraa/admin/')}" rel="nofollow">Eastern Visayas Regional Athletic Association 2027</a><span>Calbayog City</span></footer>`);
    const content = document.querySelector('.page');
    const head = content && content.querySelector('.page-head');
    if (head) head.insertAdjacentHTML('afterbegin', `<span class="page-icon" style="--accent: ${ACCENT[page] || 'var(--green)'}">${pageIcon(page)}</span>`);
    if (content) enter(content);
  });
})();

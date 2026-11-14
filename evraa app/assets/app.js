// EVRAA 2027 app (index.php): turns the server-rendered pages into a single-page app.
// - Links to other pages fetch index.php?page=...&partial=1 and swap the page in with a View Transition
//   (sliding forward or back by menu order); Back and Forward work as usual.
// - Each page's interactive parts are "modules" (data-module="..."), started after every swap and stopped before the next.
(() => {
  const main = document.getElementById('view');
  const root = document.documentElement;
  const ORDER = ['home', 'announcements', 'directory', 'games', 'medal-tally', 'background'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canTransition = 'startViewTransition' in document && !reduceMotion;
  root.classList.toggle('no-vt', !canTransition);
  history.scrollRestoration = 'manual';

  const currentPage = () => main.firstElementChild?.dataset.page || 'home';
  // The app answers at both /folder/ and /folder/index.php
  const base = location.pathname.replace(/index\.php$/, '');
  const isAppUrl = (url) => url.origin === location.origin && (url.pathname === base || url.pathname === `${base}index.php`);

  // ---------- Router ----------
  const progress = document.getElementById('progress');
  let loading = null;

  async function navigate(href, { push = true, scrollY = 0 } = {}) {
    const url = new URL(href, location.href);
    loading?.abort();
    const controller = (loading = new AbortController());
    const slow = setTimeout(() => progress.className = 'progress is-loading', 120);
    let html;
    try {
      const partial = new URL(url);
      partial.hash = '';
      partial.searchParams.set('partial', '1');
      // A 404 or 500 still returns a page section worth showing
      html = await (await fetch(partial, { signal: controller.signal })).text();
    } catch (error) {
      clearTimeout(slow);
      if (error.name !== 'AbortError') location.href = url.href;
      return;
    }
    clearTimeout(slow);
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    const view = tpl.content.querySelector('[data-page]');
    if (!view) { location.href = url.href; return; }

    const from = currentPage();
    const to = view.dataset.page;
    if (push) {
      history.replaceState({ ...history.state, y: window.scrollY }, '');
      history.pushState({ y: 0 }, '', url.href);
    }
    root.dataset.nav = from === to ? 'fade' : ORDER.indexOf(to) < ORDER.indexOf(from) ? 'back' : 'forward';
    const swap = () => {
      unmount();
      main.replaceChildren(tpl.content);
      document.title = view.dataset.title;
      setNav(to);
      const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) target.scrollIntoView(); else window.scrollTo(0, scrollY);
    };
    if (canTransition) {
      await document.startViewTransition(swap).updateCallbackDone;
    } else {
      swap();
      view.classList.add('is-entering');
    }
    main.focus({ preventScroll: true });
    progress.className = 'progress is-done';
    mount(main);
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (!isAppUrl(url)) return;
    // A jump within the same page (#venues) is left to the browser
    if (url.hash && url.search === location.search && isAppUrl(new URL(location.href))) return;
    event.preventDefault();
    navigate(url.href);
  });

  // Back/Forward: an open sheet closes first; otherwise load the page from history
  const popHooks = [];
  window.addEventListener('popstate', (event) => {
    if (popHooks.some((hook) => hook(event.state))) return;
    navigate(location.href, { push: false, scrollY: event.state?.y || 0 });
  });

  function setNav(page) {
    document.querySelectorAll('[data-nav]').forEach((link) => {
      if (link.dataset.nav === page) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    updateNewsDot(page);
  }

  // ---------- Modules ----------
  let cleanups = [];
  function mount(scope) {
    scope.querySelectorAll('[data-module]').forEach((el) => {
      const start = MODULES[el.dataset.module];
      if (!start) return;
      try {
        const stop = start(el);
        if (typeof stop === 'function') cleanups.push(stop);
      } catch (error) {
        console.error(`EVRAA ${el.dataset.module}:`, error);
      }
    });
    startTabs(scope);
    tick();
  }
  function unmount() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // Runs fn once el can be measured (a map inside a hidden Directory tab waits until the tab opens)
  function whenVisible(el, fn) {
    const panel = el.closest('[data-panel]');
    if (!panel || !panel.hidden) return fn();
    panel.addEventListener('panel-shown', fn, { once: true });
  }

  // ---------- Countdown (Home card and the badge in the top bar) ----------
  const OPENING = Date.parse(document.body.dataset.opening);
  const CLOSING = Date.parse(document.body.dataset.closing);
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const now = Date.now();
    const left = Math.floor((OPENING - now) / 1000);
    const phase = left > 0 ? 'soon' : now < CLOSING ? 'live' : 'done';
    const days = Math.max(0, Math.floor(left / 86400));
    const badge = phase === 'soon' ? `${days.toLocaleString()} days` : phase === 'live' ? 'Live now' : 'Concluded';
    document.querySelectorAll('[data-badge-text]').forEach((el) => { if (el.textContent !== badge) el.textContent = badge; });
    const card = main.querySelector('[data-countdown]');
    if (!card) return;
    card.querySelectorAll('[data-phase]').forEach((el) => { el.hidden = el.dataset.phase !== phase; });
    if (phase !== 'soon') return;
    const units = { days: days.toLocaleString(), hours: pad(Math.floor(left % 86400 / 3600)), mins: pad(Math.floor(left % 3600 / 60)), secs: pad(left % 60) };
    card.querySelectorAll('[data-unit]').forEach((el) => { el.textContent = units[el.dataset.unit]; });
  }
  setInterval(tick, 1000);

  // ---------- "New" dot on Announcements, until the newest one has been seen in this browser ----------
  const SEEN_KEY = 'evraa-seen-announcement'; // the same key the older pages use
  const latest = document.querySelector('[data-latest]')?.dataset.latest || '';
  function updateNewsDot(page) {
    let seen = '';
    try {
      if (page === 'announcements') localStorage.setItem(SEEN_KEY, latest);
      seen = localStorage.getItem(SEEN_KEY) || '';
    } catch (error) { /* storage blocked: keep showing the dot */ }
    const show = latest && seen !== latest && page !== 'announcements';
    document.querySelectorAll('[data-news-dot]').forEach((dot) => { dot.hidden = !show; });
  }

  // ---------- Directory tabs: switch in place and keep the address in step ----------
  function startTabs(scope) {
    const nav = scope.querySelector('[data-tabs]');
    if (!nav) return;
    const show = (id, href) => {
      const panel = scope.querySelector(`[data-panel="${id}"]`);
      if (!panel) return false;
      scope.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p !== panel; });
      nav.querySelectorAll('[data-tab]').forEach((tab) => {
        if (tab.dataset.tab === id) { tab.setAttribute('aria-current', 'page'); tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); } else tab.removeAttribute('aria-current');
      });
      history.replaceState(history.state, '', href);
      panel.dispatchEvent(new Event('panel-shown'));
      // Coming from far down a long tab, start the new one at its top
      const top = nav.getBoundingClientRect().bottom;
      if (panel.getBoundingClientRect().top < top) window.scrollBy(0, panel.getBoundingClientRect().top - top - 8);
      return true;
    };
    // Listen on the page section (replaced on every navigation), not on <main>, which stays
    nav.closest('[data-page]').addEventListener('click', (event) => {
      const link = event.target.closest('[data-tab], [data-tab-link]');
      if (!link || event.metaKey || event.ctrlKey) return;
      if (show(link.dataset.tab || link.dataset.tabLink, link.href)) event.preventDefault();
    });
    // Center the selected tab on load
    nav.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  // ---------- Leaflet helpers ----------
  function pinMap(el) {
    const map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    return map;
  }
  const pin = (html, cls = '') => L.divIcon({ className: '', html: `<span class="mpin ${cls}">${html}</span>`, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16] });
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const readJson = (el) => JSON.parse(el.querySelector('script[type="application/json"]').textContent);
  const mapFailed = (el) => { el.querySelector('.map').innerHTML = '<p class="map-message">The map could not load. Check your connection and refresh the page.</p>'; };
  const onPhone = () => window.innerWidth < 768;

  const MODULES = {
    // Billeting schools: numbered pins; tapping a school in the list flies to it
    'billeting-map'(el) {
      if (!window.L) return mapFailed(el);
      const schools = readJson(el);
      const list = main.querySelector('[data-school-list]');
      let map, markers, active = -1;
      const icon = (i, on) => pin(i + 1, [schools[i].approx && 'is-approx', on && 'is-active'].filter(Boolean).join(' '));
      const fitAll = () => map.fitBounds(L.latLngBounds(schools.map((s) => [s.lat, s.lng])), { padding: [28, 28] });
      function select(i, fly = true) {
        if (active > -1) markers[active].setIcon(icon(active, false));
        active = i;
        markers[i].setIcon(icon(i, true));
        list.querySelectorAll('.row').forEach((row, r) => row.classList.toggle('is-active', r === i));
        if (!fly) return;
        if (onPhone()) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        map.flyTo(markers[i].getLatLng(), 16, { duration: reduceMotion ? 0 : 0.8 });
        markers[i].openPopup();
      }
      whenVisible(el, () => {
        map = pinMap(el.querySelector('.map'));
        markers = schools.map((s, i) => L.marker([s.lat, s.lng], { icon: icon(i, false), title: s.name, alt: s.name })
          .addTo(map)
          .bindPopup(`<strong>${i + 1}. ${esc(s.name)}</strong>${s.approx ? 'Approximate location<br>' : ''}<a href="${esc(s.directions)}" target="_blank" rel="noopener">Directions in Google Maps ↗</a>`)
          .on('click', () => select(i, false)));
        fitAll();
        el.closest('[data-panel]')?.addEventListener('panel-shown', () => map.invalidateSize());
      });
      const onClick = (event) => {
        const btn = event.target.closest('[data-school]');
        if (btn && map) select(Number(btn.dataset.school));
      };
      list.addEventListener('click', onClick);
      return () => map?.remove();
    },

    // Playing venues: one pin per location with its sport's icon; a sport lights up all of its venues
    'venue-map'(el) {
      if (!window.L) return mapFailed(el);
      const { pins, sports } = readJson(el);
      const list = main.querySelector('[data-venue-list]');
      const map = pinMap(el.querySelector('.map'));
      const icon = (p, cls = '') => pin(p.icon + (p.stops.length > 1 ? `<b>${p.stops.length}</b>` : ''), [p.approx && 'is-approx', cls].filter(Boolean).join(' '));
      const markers = pins.map((p) => L.marker([p.lat, p.lng], { icon: icon(p), title: p.stops.map((s) => s.sport).join(', '), alt: p.stops.map((s) => s.sport).join(', ') })
        .addTo(map)
        .bindPopup(`${p.stops.map((s) => `<strong>${esc(s.sport)}</strong>${esc(s.venue)}`).join('<br>')}${p.approx ? '<br><em>Approximate location</em>' : ''}<br><a href="${esc(p.directions)}" target="_blank" rel="noopener">Directions in Google Maps ↗</a>`));
      const fitAll = () => pins.length ? map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [30, 30] }) : map.setView([12.0667, 124.6], 13);
      fitAll();

      function showSport(slug, { scroll = false } = {}) {
        const on = new Set(sports[slug] || []);
        markers.forEach((m, i) => m.setIcon(icon(pins[i], on.size ? (on.has(i) ? 'is-active' : 'is-dim') : '')));
        list.querySelectorAll('.row').forEach((row) => row.classList.toggle('is-active', row.querySelector('[data-venue-sport]')?.dataset.venueSport === slug));
        if (scroll || onPhone()) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        const points = [...on].map((i) => markers[i].getLatLng());
        if (points.length === 1) { map.flyTo(points[0], 16, { duration: reduceMotion ? 0 : 0.8 }); markers[[...on][0]].openPopup(); } else if (points.length) map.flyToBounds(L.latLngBounds(points), { padding: [40, 40], duration: reduceMotion ? 0 : 0.8 });
      }
      list.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-venue-sport]');
        if (btn) showSport(btn.dataset.venueSport);
      });
      const onShow = (event) => showSport(event.detail, { scroll: true });
      window.addEventListener('show-venues', onShow);
      return () => { window.removeEventListener('show-venues', onShow); map.remove(); };
    },

    // Sport search, and the schedule sheet (#sheet in index.php, filled from the sport's <template>)
    games(el) {
      const search = main.querySelector('[data-games-search]');
      const count = main.querySelector('[data-games-count]');
      const empty = el.querySelector('[data-games-empty]');
      const items = [...el.querySelectorAll('li[data-name]')];
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        let shown = 0;
        items.forEach((li) => { li.hidden = !li.dataset.name.includes(q); shown += li.hidden ? 0 : 1; });
        count.textContent = `${shown} ${shown === 1 ? 'sport' : 'sports'}`;
        empty.hidden = shown > 0;
      });

      const sheet = document.getElementById('sheet');
      let afterClose = null;
      const sportUrl = (slug) => { const u = new URL(location.href); u.hash = ''; if (slug) u.searchParams.set('sport', slug); else u.searchParams.delete('sport'); return u.href; };
      function open(slug, push) {
        const tpl = main.querySelector(`template[data-sheet="${CSS.escape(slug)}"]`);
        if (!tpl) return;
        sheet.replaceChildren(tpl.content.cloneNode(true));
        sheet.classList.remove('is-closing');
        if (!sheet.open) sheet.showModal();
        if (push) history.pushState({ sheet: slug, y: window.scrollY }, '', sportUrl(slug));
      }
      // Plays the slide-down, then really closes
      function finishClose() {
        if (!sheet.open) return;
        const done = () => { sheet.classList.remove('is-closing'); sheet.close(); afterClose?.(); afterClose = null; };
        if (reduceMotion) return done();
        sheet.classList.add('is-closing');
        sheet.addEventListener('animationend', done, { once: true });
      }
      // Closing from the sheet steps back through history, so the phone's Back button and the × behave the same
      function close() {
        if (history.state?.sheet) history.back(); else { history.replaceState(history.state, '', sportUrl('')); finishClose(); }
      }
      const onPop = (state) => {
        if (sheet.open && !state?.sheet) { finishClose(); return true; }
        if (state?.sheet) { open(state.sheet, false); return true; }
        return false;
      };
      popHooks.push(onPop);

      el.addEventListener('click', (event) => {
        const card = event.target.closest('[data-sport]');
        if (!card || event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        open(card.dataset.sport, true);
      });
      const onSheetClick = (event) => {
        if (event.target === sheet || event.target.closest('[data-sheet-close]')) close();
        const show = event.target.closest('[data-show-venues]');
        if (show) { afterClose = () => window.dispatchEvent(new CustomEvent('show-venues', { detail: show.dataset.showVenues })); close(); }
      };
      const onCancel = (event) => { event.preventDefault(); close(); };
      sheet.addEventListener('click', onSheetClick);
      sheet.addEventListener('cancel', onCancel);

      // Opened from a link like ?page=games&sport=athletics
      const linked = new URL(location.href).searchParams.get('sport');
      if (linked) open(linked, false);

      return () => {
        popHooks.splice(popHooks.indexOf(onPop), 1);
        sheet.removeEventListener('click', onSheetClick);
        sheet.removeEventListener('cancel', onCancel);
        if (sheet.open) sheet.close();
      };
    },

    // Medal Tally: re-fetch the table every minute while the page is visible, and flash rows whose medals changed
    'tally-live'(el) {
      let last = Date.now();
      async function refresh() {
        if (document.hidden) return;
        last = Date.now();
        try {
          const res = await fetch(el.dataset.src, { cache: 'no-store' });
          if (!res.ok) return;
          const before = Object.fromEntries([...el.querySelectorAll('tr[data-row]')].map((tr) => [tr.dataset.row, tr.dataset.score]));
          el.innerHTML = await res.text();
          el.querySelectorAll('tr[data-row]').forEach((tr) => { if (before[tr.dataset.row] && before[tr.dataset.row] !== tr.dataset.score) tr.classList.add('flash'); });
        } catch (error) { /* offline: keep the last standings */ }
      }
      const timer = setInterval(refresh, 60000);
      const onVisible = () => { if (!document.hidden && Date.now() - last > 60000) refresh(); };
      document.addEventListener('visibilitychange', onVisible);
      return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
    },
  };

  // ---------- Start ----------
  setNav(currentPage());
  mount(main);
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
})();

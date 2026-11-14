// EVRAA 2027 service worker: makes the site installable and keeps it usable on weak stadium signal or offline.
// - Pages and the admin-managed content (data-live.js) come from the network first, so they are always fresh;
//   the last copy seen is shown when there is no signal.
// - Styles, scripts and images are shown from the saved copy at once and refreshed in the background.
// - The admin page and anything PHP is never saved or intercepted.
// Change VERSION after uploading new files if phones should drop their saved copies right away.
const VERSION = 'evraa-v2';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const ROOT = new URL('./', self.location).pathname;

const CORE = [
  'index.html', 'offline.html', 'manifest.json',
  'evraa/announcements.html', 'evraa/directory.html', 'evraa/billeting.html', 'evraa/medal-tally.html', 'evraa/games.html',
  'evraa/playing-venues.html', 'evraa/special-events.html', 'evraa/background.html',
  'evraa/assets/site.css', 'evraa/assets/site.js', 'evraa/assets/data.js', 'evraa/assets/data-live.js', 'evraa/assets/home.js',
  'evraa/assets/announcements.js', 'evraa/assets/directory.js', 'evraa/assets/billeting.js', 'evraa/assets/medal-tally.js',
  'evraa/assets/games.js', 'evraa/assets/playing-venues.js', 'evraa/assets/special-events.js',
  'evraa/images/logo-header.png', 'evraa/images/icons/icon-192.png',
  'evraa/images/Medal_Gold_Ribbon.png', 'evraa/images/Medal_Silver_Ribbon.png', 'evraa/images/Medal_Bronze_Ribbon.png',
];

// Free hosts sometimes answer with a "checking your browser" page instead of the file; that must never be saved as the file
const usable = async (response, wantsHtml) => {
  if (!response || !response.ok) return false;
  const type = response.headers.get('content-type') || '';
  if (!wantsHtml) return !type.includes('text/html');
  const text = await response.clone().text();
  return !text.includes('/aes.js');
};
// Saved under the address without its ?v= / ?t= / ?i= part, so one copy is kept per file
const keyOf = (url) => url.origin + url.pathname;
const save = async (cacheName, url, response) => (await caches.open(cacheName)).put(keyOf(url), response);
const saved = async (url) => caches.match(keyOf(url));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await Promise.all(CORE.map(async (path) => {
      try {
        const url = new URL(ROOT + path, self.location.origin);
        const response = await fetch(url, { cache: 'reload' });
        if (await usable(response, path.endsWith('.html'))) await save(path.endsWith('.html') ? PAGES : ASSETS, url, response);
      } catch (error) { /* picked up later, when it is first opened */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('evraa-') && !name.startsWith(VERSION)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const networkFirst = async (request, url, cacheName, wantsHtml) => {
  try {
    const response = await fetch(request);
    if (await usable(response, wantsHtml)) save(cacheName, url, response.clone());
    return response;
  } catch (error) {
    const hit = await saved(url);
    if (wantsHtml) return hit || saved(new URL(`${ROOT}offline.html`, url.origin));
    if (!hit) return Response.error();
    // Marked, so the page can say "no connection" instead of "updated just now"
    const headers = new Headers(hit.headers);
    headers.set('X-Evraa-Saved', '1');
    return new Response(await hit.blob(), { status: hit.status, statusText: hit.statusText, headers });
  }
};
const savedFirst = async (event, url, refresh) => {
  const hit = await saved(url);
  const fresh = fetch(event.request).then(async (response) => {
    if (await usable(response, false)) save(ASSETS, url, response.clone());
    return response;
  });
  if (!hit) return fresh;
  if (refresh) event.waitUntil(fresh.catch(() => {})); else fresh.catch(() => {});
  return hit;
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // The map library is kept too, so the map pages open offline (the map tiles themselves need a connection)
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'cdnjs.cloudflare.com') event.respondWith(savedFirst(event, url, false));
    return;
  }
  if (!url.pathname.startsWith(ROOT) || /\/admin\/|\.php$|\/upload|\/passcode|\/backups\//.test(url.pathname) || url.searchParams.has('page')) return;

  if (request.mode === 'navigate') {
    const page = url.pathname.endsWith('/') ? new URL(`${url.pathname}index.html`, url.origin) : url;
    event.respondWith(networkFirst(request, page, PAGES, true));
  } else if (url.pathname.endsWith('/data-live.js')) {
    event.respondWith(networkFirst(request, url, ASSETS, false));
  } else if (/\.(?:css|js|json)$/.test(url.pathname)) {
    event.respondWith(savedFirst(event, url, true));
  } else if (/\.(?:png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(savedFirst(event, url, false));
  }
});

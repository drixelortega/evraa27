// Announcements page: renders ANNOUNCEMENTS (edited on the admin page, saved in data-live.js).
// Each one not yet seen on this device is marked "New" (site.js remembers them by title); the chips filter by tag;
// each has a Share button and its own link (announcements.html#a-<title>), which scrolls to it and highlights it.
(() => {
  const { $, esc, url, slug, liveBar, unread, markSeen, share, shareIcon } = EVRAA;
  const external = (link) => /^https?:/.test(link);
  const idOf = (a) => `a-${slug(a.title).slice(0, 60)}`;
  let list = ANNOUNCEMENTS;
  let tag = '';
  // Kept for this visit, so the "New" marks stay until the page is left even though they are now remembered as seen
  const fresh = new Set(unread(list).map((a) => a.title));

  function renderChips() {
    const tags = [...new Set(list.map((a) => a.tag).filter(Boolean))];
    if (tag && !tags.includes(tag)) tag = '';
    // Filters only help once there are a few announcements under different tags
    $('announce-chips').hidden = list.length < 4 || tags.length < 2;
    $('announce-chips').innerHTML = `<button type="button" class="chip-btn${tag ? '' : ' is-active'}" data-tag="" aria-pressed="${!tag}">All</button>`
      + tags.map((t) => `<button type="button" class="chip-btn${tag === t ? ' is-active' : ''}" data-tag="${esc(t)}" aria-pressed="${tag === t}">${esc(t)}</button>`).join('');
  }

  function render() {
    renderChips();
    const shown = list.filter((a) => !tag || a.tag === tag);
    $('announce-list').innerHTML = shown.length ? shown.map((a) => `
      <article class="announce${fresh.has(a.title) ? ' is-new' : ''}" id="${idOf(a)}" style="--accent: ${esc(a.accent)}"><div>
        <div class="meta">${fresh.has(a.title) && a.tag !== 'New' ? '<span class="chip is-hot">New</span>' : ''}<span class="chip${a.tag === 'New' ? ' is-hot' : ''}">${esc(a.tag)}</span>${a.date ? ` <span class="panel-date">${esc(a.date)}</span>` : ''}</div>
        <h3>${esc(a.title)}</h3>${a.body ? `<p>${esc(a.body)}</p>` : ''}
        <div class="announce-actions">
          ${a.link ? `<a class="card-link" href="${esc(external(a.link[1]) ? a.link[1] : url(a.link[1]))}"${external(a.link[1]) ? ' target="_blank" rel="noopener"' : ''}>${esc(a.link[0])} <span aria-hidden="true">→</span></a>` : ''}
          <button type="button" class="share-btn" data-share="${esc(a.title)}" aria-label="Share: ${esc(a.title)}">${shareIcon}Share</button>
        </div>
      </div></article>`).join('') : '<div class="empty-state"><h3>No announcements yet</h3><p>News and advisories will be posted here.</p></div>';
    // Reading the page clears the "new" dot on the Home card and the menus
    markSeen(list);
  }

  $('announce-list').insertAdjacentHTML('beforebegin', '<div class="chips" id="announce-chips" role="group" aria-label="Filter by tag" hidden></div>');
  $('announce-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip-btn');
    if (!chip) return;
    tag = chip.dataset.tag;
    render();
  });
  $('announce-list').addEventListener('click', (event) => {
    const btn = event.target.closest('.share-btn');
    if (!btn) return;
    const a = list.find((item) => item.title === btn.dataset.share);
    if (a) share({ title: 'EVRAA 2027', text: `${a.title}${a.body ? ` — ${a.body}` : ''}`, link: `${location.href.split('#')[0]}#${idOf(a)}` });
  });

  // A shared link points out its announcement
  function showLinked() {
    const el = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (!el || !el.classList.contains('announce')) return;
    el.classList.remove('is-linked');
    void el.offsetWidth;
    el.classList.add('is-linked');
    el.scrollIntoView({ behavior: EVRAA.reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }
  render();
  showLinked();
  window.addEventListener('hashchange', showLinked);

  liveBar({
    target: $('announce-list'),
    every: 120000,
    render: (data) => {
      // Announcements that arrive while the page is open are marked "New" too
      unread(data.ANNOUNCEMENTS).forEach((a) => fresh.add(a.title));
      list = data.ANNOUNCEMENTS;
      render();
    },
  });
})();

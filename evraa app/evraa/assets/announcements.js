// Announcements page: renders ANNOUNCEMENTS (edited on the admin page, saved in data-live.js)
(() => {
  const { $, esc, url, liveBar } = EVRAA;
  const SEEN_KEY = 'evraa-seen-announcement';
  const external = (link) => /^https?:/.test(link);
  function render(list) {
    $('announce-list').innerHTML = list.length ? list.map((a) => `
      <article class="announce" style="--accent: ${esc(a.accent)}"><div>
        <div class="meta"><span class="chip${a.tag === 'New' ? ' is-hot' : ''}">${esc(a.tag)}</span>${a.date ? ` <span class="panel-date">${esc(a.date)}</span>` : ''}</div>
        <h3>${esc(a.title)}</h3><p>${esc(a.body)}</p>
        ${a.link ? `<a class="card-link" href="${esc(external(a.link[1]) ? a.link[1] : url(a.link[1]))}"${external(a.link[1]) ? ' target="_blank" rel="noopener"' : ''}>${esc(a.link[0])} <span aria-hidden="true">→</span></a>` : ''}
      </div></article>`).join('') : '<div class="empty-state"><h3>No announcements yet</h3><p>News and advisories will be posted here.</p></div>';
    // Reading the page clears the "new" dot on the Home card and the bottom bar
    try { if (list[0]) localStorage.setItem(SEEN_KEY, list[0].title); } catch (error) { /* storage blocked */ }
  }
  render(ANNOUNCEMENTS);
  liveBar({ target: $('announce-list'), render: (data) => render(data.ANNOUNCEMENTS), every: 120000 });
})();

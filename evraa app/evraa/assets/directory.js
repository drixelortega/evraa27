// Directory page: sub-tabs switch by the link's #section, and the lists come from PLACES, HOTLINES and CONTACTS in data.js
(() => {
  const { $, esc, tba, url, mapsLink, moveIndicator, enter } = EVRAA;
  const tel = (number) => `tel:${esc(number.replace(/[^\d+]/g, ''))}`;

  // ---------- Content ----------
  $('direction-cards').innerHTML = PLACES.map(([name, note, query, accent]) => `
    <li class="info-card" style="--accent: ${accent}"><h3>${esc(name)}</h3><p>${esc(note)}</p><a class="card-link" href="${mapsLink(query)}" target="_blank" rel="noopener">Open in Google Maps ↗</a></li>`).join('')
    + `<li class="info-card" style="--accent: var(--flame)"><h3>Billeting schools</h3><p>Map and directions to each of the 14 billeting schools.</p><a class="card-link" href="${url('evraa/billeting.html')}">See the map <span aria-hidden="true">→</span></a></li>`
    + `<li class="info-card" style="--accent: var(--green)"><h3>Playing venues</h3><p>Addresses and map of the playing venues for each sport.</p><a class="card-link" href="${url('evraa/playing-venues.html')}">See the venues <span aria-hidden="true">→</span></a></li>`;

  $('hotline-cards').innerHTML = HOTLINES.map(([label, number, accent]) => `
    <li class="info-card hotline" style="--accent: ${accent}"><span class="hotline-icon" aria-hidden="true">☎</span><div><h3>${esc(label)}</h3>
      ${number ? `<a class="hotline-num" href="${tel(number)}">${esc(number)}</a>` : tba}</div></li>`).join('');

  $('contacts-area').innerHTML = CONTACTS.length
    ? `<div class="table-card"><table><thead><tr><th>Name</th><th>Position</th><th>For queries on</th><th>Contact</th></tr></thead><tbody>${CONTACTS.map(([name, position, topic, phone, email]) => `
      <tr><td><strong>${esc(name)}</strong></td><td>${position ? esc(position) : '—'}</td><td>${topic ? esc(topic) : '—'}</td>
      <td>${[phone && `<a class="card-link" style="margin:0" href="${tel(phone)}">${esc(phone)}</a>`, email && `<a class="card-link" style="margin:0" href="mailto:${esc(email)}">${esc(email)}</a>`].filter(Boolean).join('<br>') || tba}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="empty-state"><span class="empty-icon" aria-hidden="true">C</span><h3>Contact persons list coming soon</h3>
      <p>The EVRAA 2027 personnel to contact for queries, with their numbers and emails, will be posted here. For urgent concerns, see the HOTLINES tab.</p>
      <a class="card-link" href="#hotlines">Go to HOTLINES <span aria-hidden="true">→</span></a></div>`;

  // ---------- Sub-tabs ----------
  const subtabs = $('subtabs');
  const SUBS = [...subtabs.querySelectorAll('.tab')].map((tab) => tab.dataset.sub);
  let current = null;
  function route() {
    const sub = SUBS.includes(location.hash.slice(1)) ? location.hash.slice(1) : (current || SUBS[0]);
    if (sub === current) return;
    document.querySelectorAll('.subpage').forEach((el) => { el.hidden = el.dataset.sub !== sub; });
    let active = null;
    subtabs.querySelectorAll('.tab').forEach((tab) => {
      const on = tab.dataset.sub === sub;
      tab.classList.toggle('is-active', on);
      if (on) { tab.setAttribute('aria-current', 'page'); active = tab; } else tab.removeAttribute('aria-current');
    });
    moveIndicator(subtabs, active);
    // Slide the new section in from the side of the tab that was clicked (the whole page already rises in on first load)
    if (current !== null) enter(document.querySelector(`.subpage[data-sub="${sub}"]`), Math.sign(SUBS.indexOf(sub) - SUBS.indexOf(current)));
    current = sub;
  }
  window.addEventListener('hashchange', route);
  route();
  const place = () => moveIndicator(subtabs, subtabs.querySelector('.tab.is-active'));
  window.addEventListener('resize', place);
  window.addEventListener('load', place);
  document.fonts?.ready.then(place);
})();

// Directory page: sub-tabs switch by the link's #section, and the lists come from PLACES, HOTLINES, CONTACTS and HOTELS in data.js.
// Hotels: a card per hotel with its facade photo (images/hotels/<photo>.webp, a placeholder if missing) and a Google Maps link;
// tapping a card opens its details.
(() => {
  const { $, esc, tba, url, mapsLink, moveIndicator, enter, share, shareIcon, sheet } = EVRAA;
  const tel = (number) => `tel:${esc(number.replace(/[^\d+]/g, ''))}`;

  // ---------- Content ----------
  $('direction-cards').innerHTML = PLACES.map(([name, note, query, accent]) => `
    <li class="info-card" style="--accent: ${accent}"><h3>${esc(name)}</h3><p>${esc(note)}</p><a class="card-link" href="${mapsLink(query)}" target="_blank" rel="noopener">Open in Google Maps ↗</a></li>`).join('')
    + `<li class="info-card" style="--accent: var(--flame)"><h3>Billeting schools</h3><p>Map and directions to each of the 14 billeting schools.</p><a class="card-link" href="${url('evraa/billeting.html')}">See the map <span aria-hidden="true">→</span></a></li>`
    + `<li class="info-card" style="--accent: var(--green)"><h3>Playing venues</h3><p>Addresses and map of the playing venues for each sport.</p><a class="card-link" href="${url('evraa/playing-venues.html')}">See the venues <span aria-hidden="true">→</span></a></li>`;

  // 911 has its own large button above the cards
  $('hotline-cards').innerHTML = HOTLINES.filter(([, number]) => number.replace(/\D/g, '') !== '911').map(([label, number, accent]) => `
    <li class="info-card hotline" style="--accent: ${accent}"><span class="hotline-icon" aria-hidden="true">☎</span><div><h3>${esc(label)}</h3>
      ${number ? `<a class="hotline-num" href="${tel(number)}">${esc(number)}</a>` : '<span class="soon-note">Number to follow</span>'}</div></li>`).join('');
  // Numbers not yet confirmed: one note under the cards instead of a "To be announced" pill on each
  if (HOTLINES.some(([, number]) => !number)) $('hotline-cards').insertAdjacentHTML('afterend', '<p class="page-note">The remaining numbers are posted here as the offices confirm them.</p>');

  $('contacts-area').innerHTML = CONTACTS.length
    ? `<div class="table-card"><table><thead><tr><th>Name</th><th>Position</th><th>For queries on</th><th>Contact</th></tr></thead><tbody>${CONTACTS.map(([name, position, topic, phone, email]) => `
      <tr><td><strong>${esc(name)}</strong></td><td>${position ? esc(position) : '—'}</td><td>${topic ? esc(topic) : '—'}</td>
      <td>${[phone && `<a class="card-link" style="margin:0" href="${tel(phone)}">${esc(phone)}</a>`, email && `<a class="card-link" style="margin:0" href="mailto:${esc(email)}">${esc(email)}</a>`].filter(Boolean).join('<br>') || tba}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="empty-state"><span class="empty-icon" aria-hidden="true">C</span><h3>Contact persons list coming soon</h3>
      <p>The EVRAA 2027 personnel to contact for queries, with their numbers and emails, will be posted here. For urgent concerns, see the Hotlines tab.</p>
      <a class="card-link" href="#hotlines">Go to Hotlines <span aria-hidden="true">→</span></a></div>`;

  // ---------- Hotels ----------
  const hotels = typeof HOTELS !== 'undefined' ? HOTELS : [];
  const building = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/><path d="M11 21v-3h2v3"/></svg>';
  // The lowest price listed, for "From ₱1,190" on the card (a rate like "2,900 / 4,050" counts its first number)
  const priceOf = (text) => Number(String(text).split('/')[0].replace(/[^\d]/g, '')) || Infinity;
  // A short-stay rate (3, 6 or 12 hours) says so, so it is not mistaken for a night's rate
  const fromPrice = (h) => {
    const rooms = h.rates.filter(([title]) => !/extra|additional|function/i.test(title)).flatMap(([, rows]) => rows).filter(([room]) => !/extra/i.test(room));
    const cheapest = rooms.reduce((best, row) => (priceOf(row[2]) < priceOf(best[2]) ? row : best), rooms[0]);
    if (!cheapest || !Number.isFinite(priceOf(cheapest[2]))) return '';
    const hours = String(cheapest[0]).match(/^(\d+)\s*hours?$/i);
    return `From ₱${priceOf(cheapest[2]).toLocaleString('en-US')}${hours && hours[1] !== '24' ? ` / ${hours[1]} hrs` : ''}`;
  };
  // The photo, or (until it is added, or if it does not load) a tinted placeholder with the hotel's initials
  // Google Maps finds the hotel by its name and address
  const hotelMap = (h) => mapsLink(`${h.name}, ${h.address}`);
  const pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  const initials = (name) => name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const photo = (h, i, cls) => `<div class="${cls}" style="--hue: ${(i * 47) % 360}">
      <span class="hotel-ph" aria-hidden="true">${building}<b>${esc(initials(h.name))}</b></span>
      <img src="${url(`evraa/images/hotels/${encodeURIComponent(h.photo)}.webp`)}" alt="Facade of ${esc(h.name)}" loading="lazy" decoding="async" onerror="this.remove()">
    </div>`;
  $('hotel-cards').innerHTML = hotels.map((h, i) => `
    <li class="hotel-card"><button type="button" class="hotel-btn" data-hotel="${i}" aria-haspopup="dialog">
      ${photo(h, i, 'hotel-photo')}
      <span class="hotel-info">
        <strong>${esc(h.name)}</strong>
        <span class="hotel-area">${esc(h.area)}</span>
        <span class="hotel-meta">${fromPrice(h) ? `<span class="hotel-price">${fromPrice(h)}</span>` : ''}<span class="hotel-more">Rooms &amp; rates <span aria-hidden="true">→</span></span></span>
      </span>
    </button>
    <a class="hotel-map" href="${hotelMap(h)}" target="_blank" rel="noopener">${pin}Open in Google Maps <span aria-hidden="true">↗</span><span class="visually-hidden">: ${esc(h.name)}</span></a></li>`).join('');

  const dialog = $('hotel-dialog');
  let openHotel = -1;
  function showHotel(i) {
    const h = hotels[i];
    openHotel = i;
    $('hotel-dialog-photo').innerHTML = photo(h, i, 'hotel-photo is-large');
    $('hotel-dialog-area').textContent = `${h.area} · Calbayog City`;
    $('hotel-dialog-title').textContent = h.name;
    $('hotel-dialog-body').innerHTML = `
      <div class="hotel-actions">
        ${h.phones.map((p) => `<a class="hotel-call" href="${tel(p)}"><span aria-hidden="true">☎</span> ${esc(p)}</a>`).join('')}
        <a class="dir-btn" href="${hotelMap(h)}" target="_blank" rel="noopener">Google Maps ↗</a>
        ${h.facebook ? `<a class="dir-btn" href="${esc(h.facebook)}" target="_blank" rel="noopener">Facebook ↗</a>` : ''}
        <button type="button" class="share-btn" id="hotel-share">${shareIcon}Share</button>
      </div>
      <div class="hotel-about">${h.about.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <h4 class="hotel-h">Room rates <small>(₱)</small></h4>
      ${h.rates.map(([title, rows]) => `<div class="rate-group"><div class="dialog-label">${esc(title)}</div>
        <ul class="rate-list">${rows.map(([room, detail, price]) => `<li><span><b>${esc(room)}</b>${detail ? `<small>${esc(detail)}</small>` : ''}</span><strong>${esc(price)}</strong></li>`).join('')}</ul></div>`).join('')}
      ${h.amenities.length ? `<h4 class="hotel-h">Amenities</h4><ul class="amenities">${h.amenities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
      <h4 class="hotel-h">Address</h4><p class="hotel-address">${esc(h.address)}</p>
      <a class="hotel-map-big" href="${hotelMap(h)}" target="_blank" rel="noopener">${pin}Open in Google Maps <span aria-hidden="true">↗</span></a>`;
    dialog.scrollTop = 0;
    popup.open();
  }
  // The phone's Back, the ×, the backdrop and dragging the top down all close it (site.js)
  const popup = sheet(dialog);
  $('hotel-cards').addEventListener('click', (event) => {
    const btn = event.target.closest('.hotel-btn');
    if (btn) showHotel(Number(btn.dataset.hotel));
  });
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('#hotel-share')) {
      const h = hotels[openHotel];
      share({ title: h.name, text: `${h.name}, ${h.address} · ${h.phones.join(' / ')}`, link: `${location.href.split('#')[0]}#hotels` });
    }
  });

  // ---------- Sub-tabs ----------
  // Tabs with nothing in them yet (data-soon, and Contact Persons while CONTACTS is empty) are hidden, and one line
  // under the tabs says what is coming; their links (directory.html#shuttle) still open them
  const subtabs = $('subtabs');
  const empty = [...subtabs.querySelectorAll('.tab')].filter((tab) => tab.hasAttribute('data-soon') || (tab.dataset.sub === 'contacts' && !CONTACTS.length));
  empty.forEach((tab) => { tab.hidden = true; });
  if (empty.length) subtabs.insertAdjacentHTML('afterend', `<p class="soon-line"><strong>Coming soon:</strong> ${empty.map((tab) => esc(tab.dataset.soonName || tab.textContent.trim())).join(', ')}.</p>`);
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

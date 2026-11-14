// Billeting Areas page (evraa/billeting.html): the billeting schools and their map (schools are listed in data.js)
(() => {
  const { $, esc, reduceMotion, pinMap, pinIcon, mapFailed } = EVRAA;

  // ---------- Billeting schools map ----------
  const list = $('school-list');
  const card = $('school-map-card');
  list.innerHTML = SCHOOLS.map(([name], i) => `<li><button type="button" class="school" data-i="${i}"><span class="school-num">${i + 1}</span><span>${esc(name)}</span></button></li>`).join('');
  if (!window.L) { mapFailed(card); return; }

  const map = pinMap('school-map');
  const icon = (i, active) => pinIcon(i + 1, `${active ? 'is-active' : ''} ${SCHOOLS[i][3] ? 'is-approx' : ''}`);
  const markers = SCHOOLS.map(([name, lat, lng, approx], i) => {
    const directions = approx
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, Calbayog City, Samar`)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    return L.marker([lat, lng], { icon: icon(i, false), title: name, alt: name })
      .addTo(map)
      .bindPopup(`<strong>${i + 1}. ${esc(name)}</strong>${approx ? 'Approximate location<br>' : ''}<a href="${directions}" target="_blank" rel="noopener">Open in Google Maps ↗</a>`)
      .on('click', () => select(i, false));
  });
  const fitAll = () => map.fitBounds(L.latLngBounds(SCHOOLS.map(([, lat, lng]) => [lat, lng])), { padding: [30, 30] });
  fitAll();

  let active = -1;
  function select(i, fly = true) {
    if (active > -1) markers[active].setIcon(icon(active, false));
    active = i;
    markers[i].setIcon(icon(i, true));
    list.querySelectorAll('.school').forEach((btn) => btn.classList.toggle('is-active', Number(btn.dataset.i) === i));
    if (fly) {
      map.flyTo(markers[i].getLatLng(), 16, { duration: reduceMotion ? 0 : 0.8 });
      markers[i].openPopup();
      if (window.innerWidth <= 860) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  list.addEventListener('click', (event) => {
    const btn = event.target.closest('.school');
    if (btn) select(Number(btn.dataset.i));
  });
  // Re-measure once the layout settles so the tiles fill the card
  window.addEventListener('load', () => { map.invalidateSize(); if (active === -1) fitAll(); });
})();

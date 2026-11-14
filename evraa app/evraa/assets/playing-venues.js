// Playing Venues page: Sport | Venue table beside a map that marks each venue in SPORTS (data.js) with its sport's icon.
// Tapping a sport lights up all of its venues (Basketball, Football, Lawn Tennis and Special Games have more than one);
// tapping a venue goes to that one pin. A link ending in #<sport> (e.g. #special-games, from the Games Schedule pop-up) points out that sport.
(() => {
  const { $, esc, tba, slug, reduceMotion, pinMap, mapFailed, sportIcon } = EVRAA;
  // Shown when no venue has a pin yet: Calbayog City and Catbalogan City
  const HOST_CITIES = [[12.0667, 124.6000], [11.7753, 124.8861]];

  // ---------- Locations ----------
  // Venues at the same coordinates share a pin; each pin keeps the sports played there
  const locations = [];
  const pinsOf = SPORTS.map(([sport, venues]) => venues.map(([venue, lat, lng, approx]) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return -1;
    let pin = locations.findIndex((l) => l.lat === lat && l.lng === lng);
    if (pin === -1) pin = locations.push({ lat, lng, approx: !!approx, stops: [] }) - 1;
    locations[pin].stops.push({ sport, venue });
    return pin;
  }));

  // ---------- Table ----------
  const rows = $('venue-rows');
  rows.innerHTML = SPORTS.map(([sport, venues, note], i) => {
    const located = pinsOf[i].some((pin) => pin > -1);
    const label = `<span class="venue-icon" aria-hidden="true">${sportIcon(sport)}</span><span>${esc(sport)}${note ? `<small>${esc(note)}</small>` : ''}</span>`;
    const name = located
      ? `<button type="button" class="venue-sport" data-sport="${i}">${label}</button>`
      : `<span class="venue-sport is-empty">${label}</span>`;
    const places = venues.length
      ? `<ul class="venue-places">${venues.map(([venue], v) => {
        const pin = pinsOf[i][v];
        return `<li>${pin > -1 ? `<button type="button" class="venue-place" data-pin="${pin}">${esc(venue)}</button>` : `${esc(venue)} <span class="venue-flag">Pin to follow</span>`}</li>`;
      }).join('')}</ul>`
      : tba;
    return `<tr data-sport="${i}"><td>${name}</td><td>${places}</td></tr>`;
  }).join('');
  const highlightRows = (match) => rows.querySelectorAll('tr').forEach((tr) => tr.classList.toggle('is-active', match(Number(tr.dataset.sport))));

  // ---------- Map ----------
  const card = $('venue-map-card');
  let showPins = () => {};
  if (window.L) {
    const map = pinMap('venue-map');
    // One round icon per sport at the location, side by side in a pill when several sports share it
    const icon = ({ stops, approx }, cls) => {
      const sports = [...new Set(stops.map((s) => s.sport))];
      return L.divIcon({
        className: '',
        html: `<span class="venue-pin${approx ? ' is-approx' : ''}${cls ? ` ${cls}` : ''}">${sports.map((s) => `<i>${sportIcon(s)}</i>`).join('')}</span>`,
        iconSize: [sports.length * 26 + 8, 34],
        iconAnchor: [(sports.length * 26 + 8) / 2, 17],
        popupAnchor: [0, -16],
      });
    };
    const popup = ({ lat, lng, approx, stops }) => `${stops.map(({ sport, venue }) => `<strong>${esc(sport)}</strong>${esc(venue)}<br>`).join('')}`
      + `${approx ? '<em>Approximate location</em><br>' : ''}<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener">Open in Google Maps ↗</a>`;
    const markers = locations.map((loc, i) => L.marker([loc.lat, loc.lng], { icon: icon(loc, ''), title: loc.stops.map((s) => s.sport).join(', '), alt: loc.stops.map((s) => `${s.sport}: ${s.venue}`).join('; ') })
      .addTo(map)
      .bindPopup(popup(loc))
      .on('click', () => showPins([i], null, false)));
    const fit = (points, maxZoom = 16) => {
      if (points.length === 1) map.setView(points[0], maxZoom);
      else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom });
    };
    const fitAll = () => fit(locations.length ? locations.map(({ lat, lng }) => [lat, lng]) : HOST_CITIES);
    fitAll();

    let active = null;
    // Lights up the given pins and dims the rest; sport is the table row to highlight (null: rows of every sport at those pins)
    showPins = (pins, sport, fly = true) => {
      active = pins;
      markers.forEach((marker, i) => {
        const on = pins.includes(i);
        marker.setIcon(icon(locations[i], on ? 'is-active' : 'is-dim'));
        marker.setZIndexOffset(on ? 1000 : 0);
      });
      highlightRows((i) => sport === null ? pins.some((pin) => pinsOf[i].includes(pin)) : i === sport);
      if (!fly) return;
      const points = pins.map((i) => markers[i].getLatLng());
      if (points.length === 1) {
        map.flyTo(points[0], 16, { duration: reduceMotion ? 0 : 0.8 });
        markers[pins[0]].openPopup();
      } else {
        map.closePopup();
        map.flyToBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 16, duration: reduceMotion ? 0 : 0.8 });
      }
      if (window.innerWidth <= 860) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    // Re-measure once the layout settles so the tiles fill the card
    window.addEventListener('load', () => { map.invalidateSize(); if (!active) fitAll(); });
  } else {
    mapFailed(card);
  }
  const sportPins = (i) => [...new Set(pinsOf[i].filter((pin) => pin > -1))];
  rows.addEventListener('click', (event) => {
    const place = event.target.closest('button[data-pin]');
    if (place) { showPins([Number(place.dataset.pin)], Number(place.closest('tr').dataset.sport)); return; }
    const btn = event.target.closest('button[data-sport]');
    if (btn) showPins(sportPins(Number(btn.dataset.sport)), Number(btn.dataset.sport));
  });

  // ---------- #sport from the Games Schedule ----------
  function showSport() {
    const hash = location.hash.slice(1);
    // Older links used #tennis before it was renamed Lawn Tennis
    const i = SPORTS.findIndex(([sport]) => slug(sport) === hash || slug(sport).endsWith(`-${hash}`));
    if (i === -1) return;
    if (sportPins(i).length && window.L) { showPins(sportPins(i), i); return; }
    const row = rows.querySelector(`tr[data-sport="${i}"]`);
    highlightRows((n) => n === i);
    setTimeout(() => row.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }), 300);
  }
  window.addEventListener('hashchange', showSport);
  // Wait for the map to size itself before flying to the pins
  window.addEventListener('load', showSport);
})();

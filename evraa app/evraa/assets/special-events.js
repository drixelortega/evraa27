// Special Events page: renders EVENTS from data.js as a timeline with a days-to-go chip
(() => {
  const { $, esc, tba, ACCENTS, phDate, daysUntil } = EVRAA;
  $('event-list').innerHTML = EVENTS.map(([title, iso, body], i) => {
    const left = iso ? daysUntil(iso) : null;
    // Count whole days left the same way as the Home countdown
    const whole = iso ? Math.floor((Date.parse(`${iso}T00:00:00+08:00`) - Date.now()) / 86400000) : 0;
    const status = left === null ? tba
      : left > 1 ? `<span class="chip">In ${whole} days</span>` : left === 1 ? '<span class="chip is-hot">Tomorrow</span>'
      : left === 0 ? '<span class="chip is-hot">Today</span>' : '<span class="chip">Done</span>';
    return `<li class="info-card" style="--accent: ${ACCENTS[(i + 1) % ACCENTS.length]}">
      <div class="meta">${iso ? `<span>${phDate(iso, { month: 'long', day: 'numeric', year: 'numeric' })}</span>` : ''}${status}</div>
      <h3>${esc(title)}</h3><p>${esc(body)}</p></li>`;
  }).join('');
})();

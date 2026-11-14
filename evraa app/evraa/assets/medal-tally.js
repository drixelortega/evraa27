// Medal Tally page: ranks TALLY (edited on the admin page, saved in data-live.js) by gold, then silver, then bronze;
// tied delegations share a rank. Once medals are awarded the top three stand on a podium above the table.
// The star beside a delegation pins it as "my delegation" (remembered on this device): its row is tinted and its standing shown on top.
(() => {
  const { $, esc, url, liveBar } = EVRAA;
  const PIN_KEY = 'evraa-my-delegation';
  let mine = '';
  try { mine = localStorage.getItem(PIN_KEY) || ''; } catch (error) { /* not remembered */ }
  let tally = TALLY;
  let first = true;
  const medal = (kind) => `<img src="${url(`evraa/images/Medal_${kind}_Ribbon.png`)}" alt="" width="372" height="521">`;
  const counts = (r) => `<span class="mc gold" title="Gold">${r.g}</span><span class="mc silver" title="Silver">${r.s}</span><span class="mc bronze" title="Bronze">${r.b}</span>`;

  function render(fresh = tally) {
    tally = fresh;
    const rows = tally.map(([name, g, s, b]) => ({ name, g, s, b, t: g + s + b }))
      .sort((x, y) => y.g - x.g || y.s - x.s || y.b - x.b || x.name.localeCompare(y.name));
    const started = rows.some((r) => r.t > 0);
    const maxTotal = Math.max(1, ...rows.map((r) => r.t));
    rows.forEach((r, i) => { const prev = rows[i - 1]; r.rank = prev && prev.g === r.g && prev.s === r.s && prev.b === r.b ? prev.rank : i + 1; });
    const me = rows.find((r) => r.name === mine);

    $('medals-lead').textContent = started ? 'Ranked by gold, then silver, then bronze. The tally updates as results come in during the games.'
      : 'The tally opens once the games begin. Delegations are ranked by gold, then silver, then bronze.';
    $('tally-top').innerHTML = (me ? `
      <div class="my-team"><span class="my-team-star" aria-hidden="true">★</span>
        <div><small>My delegation</small><strong>${esc(me.name)}</strong></div>
        <div class="my-team-rank"><small>Rank</small><strong>${started ? me.rank : '—'}</strong></div>
        <div class="my-team-medals">${counts(me)}</div></div>` : '')
      + (started ? `<ol class="podium" aria-label="Top three delegations">${rows.slice(0, 3).map((r, i) => `
        <li class="podium-card p${i + 1}${r.name === mine ? ' is-mine' : ''}">
          <span class="podium-medal">${medal(['Gold', 'Silver', 'Bronze'][i])}</span>
          <span class="podium-rank">${r.rank}</span>
          <strong>${esc(r.name)}</strong>
          <div class="podium-medals">${counts(r)}</div>
          <small>${r.t} ${r.t === 1 ? 'medal' : 'medals'}</small></li>`).join('')}</ol>` : '');

    $('tally-rows').innerHTML = rows.map((r) => `
      <tr class="top-${started ? r.rank : 0}${r.name === mine ? ' is-mine' : ''}"><td class="rank">${started ? r.rank : '—'}</td>
        <td><div class="team"><button type="button" class="pin-btn" data-pin="${esc(r.name)}" aria-pressed="${r.name === mine}" aria-label="${r.name === mine ? 'Unpin' : 'Pin'} ${esc(r.name)} as my delegation">${r.name === mine ? '★' : '☆'}</button><strong>${esc(r.name)}</strong></div></td>
        <td class="num">${r.g}</td><td class="num">${r.s}</td><td class="num">${r.b}</td><td class="num"><strong>${r.t}</strong></td>
        <td class="bar-col"><div class="tally-bar">${[['gold', r.g], ['silver', r.s], ['bronze', r.b]].map(([c, n]) => `<span class="${c}" data-w="${n / maxTotal * 100}"></span>`).join('')}</div></td></tr>`).join('');
    $('tally-hint').hidden = Boolean(me);

    // The bars grow from zero the first time, and just take their new width after a refresh
    const grow = () => document.querySelectorAll('.tally-bar span').forEach((bar) => { bar.style.width = `${bar.dataset.w}%`; });
    if (first) requestAnimationFrame(() => requestAnimationFrame(grow)); else grow();
    first = false;
  }

  $('tally-rows').addEventListener('click', (event) => {
    const button = event.target.closest('.pin-btn');
    if (!button) return;
    mine = mine === button.dataset.pin ? '' : button.dataset.pin;
    try { if (mine) localStorage.setItem(PIN_KEY, mine); else localStorage.removeItem(PIN_KEY); } catch (error) { /* not remembered */ }
    render();
  });
  render();
  // Checks for new results every minute while the page is open
  liveBar({ target: document.querySelector('.tally'), render: (data) => render(data.TALLY), every: 60000 });
})();

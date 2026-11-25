// Medal Tally page: ranks TALLY (edited on the admin page, saved in data-live.js) by gold, then silver, then bronze;
// tied delegations share a rank. Once medals are awarded the top three stand on a podium above the table.
// The delegation picked on the Home page (the only place to pick it) is "my delegation": its row is tinted and marked ★, and its standing is shown on top
// with a button to share it. Each delegation shows its logo.
// Since the last time this device saw the tally, rows that moved show ▲/▼ and counts that changed flash once.
(() => {
  const { $, esc, liveBar, rankTally, logoImg, medalImg, myDelegation, store, share, shareIcon } = EVRAA;
  const SEEN_KEY = 'evraa-tally-seen';
  let mine = myDelegation();
  let tally = TALLY;
  let first = true;
  let shown = null;
  // What this device last saw: { name: [rank, gold, silver, bronze] } (only kept once medals have been awarded)
  let seen = {};
  try { seen = JSON.parse(store.get(SEEN_KEY, '{}')) || {}; } catch (error) { seen = {}; }
  // Medal counts that read aloud as "5 gold, 2 silver, 1 bronze" (site.js)
  const counts = (r) => EVRAA.medalCounts(r);
  const move = (r) => {
    const before = seen[r.name];
    if (!before || before[0] === r.rank) return '';
    const up = before[0] > r.rank;
    const by = Math.abs(before[0] - r.rank);
    return `<span class="rank-move ${up ? 'is-up' : 'is-down'}" title="${up ? 'Up' : 'Down'} ${by} since you last looked"><span aria-hidden="true">${up ? '▲' : '▼'}</span>${by}<span class="visually-hidden"> ${up ? 'up' : 'down'}</span></span>`;
  };
  const changed = (r) => { const before = seen[r.name]; return Boolean(before) && (before[1] !== r.g || before[2] !== r.s || before[3] !== r.b); };

  function render(fresh = tally) {
    tally = fresh;
    const rows = rankTally(tally);
    const started = rows.some((r) => r.t > 0);
    const maxTotal = Math.max(1, ...rows.map((r) => r.t));
    const me = rows.find((r) => r.name === mine);
    // When fresh results differ from what is on screen, the arrows compare with what was on screen
    const snapshot = Object.fromEntries(rows.map((r) => [r.name, [r.rank, r.g, r.s, r.b]]));
    if (shown && JSON.stringify(shown) !== JSON.stringify(snapshot)) seen = shown;

    $('medals-lead').textContent = started ? 'Ranked by gold, then silver, then bronze. The tally updates as results come in during the games.'
      : 'The tally opens once the games begin. Delegations are ranked by gold, then silver, then bronze.';
    $('tally-top').innerHTML = (me ? `
      <div class="my-team">${EVRAA.monikerImg(me.name, 'my-team-moniker', true) || '<span class="my-team-star" aria-hidden="true">★</span>'}
        <div><small>My delegation</small><strong>${esc(me.name)}</strong>${EVRAA.teamOf(me.name) ? `<span class="my-team-moniker-name">${esc(EVRAA.teamOf(me.name)[1])}</span>` : ''}</div>
        <div class="my-team-rank"><small>Rank</small><strong>${started ? me.rank : '—'}${started ? move(me) : ''}</strong></div>
        <div class="my-team-medals">${counts(me)}</div>
        ${started ? `<button type="button" class="share-btn" id="share-mine">${shareIcon}Share</button>` : ''}</div>` : '')
      + (started ? `<ol class="podium" aria-label="Top three delegations">${rows.slice(0, 3).map((r, i) => `
        <li class="podium-card p${i + 1}${r.name === mine ? ' is-mine' : ''}">
          <span class="podium-medal">${medalImg(['Gold', 'Silver', 'Bronze'][i])}</span>
          ${logoImg(r.name, 'podium-logo')}
          <span class="podium-rank">${r.rank}</span>
          <strong>${esc(r.name)}</strong>
          <div class="podium-medals">${counts(r)}</div>
          <small>${r.t} ${r.t === 1 ? 'medal' : 'medals'}</small></li>`).join('')}</ol>` : '');

    $('tally-rows').innerHTML = rows.map((r) => `
      <tr class="top-${started ? r.rank : 0}${r.name === mine ? ' is-mine' : ''}${started && changed(r) ? ' is-changed' : ''}"><td class="rank">${started ? r.rank : '—'}${started ? move(r) : ''}</td>
        <td><div class="team">${r.name === mine ? '<span class="mine-star" aria-hidden="true">★</span>' : ''}${logoImg(r.name)}<strong>${esc(r.name)}</strong>${r.name === mine ? '<span class="visually-hidden"> (your delegation)</span>' : ''}</div></td>
        ${started ? `<td class="num">${r.g}</td><td class="num">${r.s}</td><td class="num">${r.b}</td><td class="num"><strong>${r.t}</strong></td>`
          : '<td class="num is-empty">–</td><td class="num is-empty">–</td><td class="num is-empty">–</td><td class="num is-empty">–</td>'}
        <td class="bar-col"><div class="tally-bar">${[['gold', r.g], ['silver', r.s], ['bronze', r.b]].map(([c, n]) => `<span class="${c}" data-w="${n / maxTotal * 100}"></span>`).join('')}</div></td></tr>`).join('');
    $('tally-hint').hidden = Boolean(me);

    // The bars grow from zero the first time, and just take their new width after a refresh
    const grow = () => document.querySelectorAll('.tally-bar span').forEach((bar) => { bar.style.width = `${bar.dataset.w}%`; });
    if (first) requestAnimationFrame(() => requestAnimationFrame(grow)); else grow();
    first = false;

    // Remember what was shown, for the arrows next time this device opens the page
    if (started) { shown = snapshot; store.set(SEEN_KEY, JSON.stringify(snapshot)); }
  }

  $('tally-top').addEventListener('click', (event) => {
    if (!event.target.closest('#share-mine')) return;
    const me = rankTally(tally).find((r) => r.name === mine);
    if (!me) return;
    const ord = (n) => { const end = ['th', 'st', 'nd', 'rd']; const v = n % 100; return n + (end[(v - 20) % 10] || end[v] || end[0]); };
    share({
      title: 'EVRAA 2027 Medal Tally',
      text: `${me.name} is ${ord(me.rank)} in the EVRAA 2027 medal tally: ${me.g} gold, ${me.s} silver, ${me.b} bronze.`,
      link: location.href.split('#')[0],
    });
  });
  render();
  // Checks for new results every minute while the page is open
  liveBar({ target: document.querySelector('.tally'), render: (data) => render(data.TALLY), every: 60000 });
})();

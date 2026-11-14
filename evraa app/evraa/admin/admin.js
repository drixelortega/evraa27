// EVRAA 2027 admin page: adding, removing and re-ordering table rows, and a warning before leaving with unsaved changes.
// Nothing is stored until "Save" is pressed; the server checks everything again.
(() => {
  // Same light / dark choice as the public site
  try {
    const saved = localStorage.getItem('evraa-theme');
    const theme = saved === 'dark' || saved === 'light' ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (error) { /* stays light */ }

  // "Are you sure?" on the reset-password buttons
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (event) => { if (!window.confirm(form.dataset.confirm)) event.preventDefault(); });
  });

  const sports = typeof SPORTS !== 'undefined' ? SPORTS.map(([sport]) => sport) : [];
  const fillSports = (scope) => scope.querySelectorAll('select[data-sports]').forEach((select) => {
    const current = select.value;
    const names = current && !sports.includes(current) ? [current, ...sports] : sports;
    select.innerHTML = '<option value="">Choose…</option>';
    names.forEach((name) => select.add(new Option(name, name, false, name === current)));
  });

  let dirty = false;
  document.querySelectorAll('form[data-editor]').forEach((form) => {
    const body = form.querySelector('[data-rows]');
    const blank = form.querySelector('template[data-blank]');
    const empty = form.querySelector('[data-empty]');
    const status = form.querySelector('[data-status]');
    fillSports(form);

    // Rows are numbered again in their on-screen order, which is the order they are saved in
    const renumber = () => {
      [...body.rows].forEach((row, i) => row.querySelectorAll('[data-col]').forEach((input) => { input.name = `rows[${i}][${input.dataset.col}]`; }));
      empty.hidden = body.rows.length > 0;
    };
    const changed = () => {
      dirty = true;
      form.classList.add('is-dirty');
      status.textContent = 'Unsaved changes';
    };

    form.querySelector('[data-add]').addEventListener('click', () => {
      body.insertAdjacentHTML('beforeend', blank.innerHTML);
      const row = body.rows[body.rows.length - 1];
      fillSports(row);
      // A new game starts on the same sport and date as the row above it
      const above = row.previousElementSibling;
      if (above) ['sport', 'date'].forEach((col) => { const from = above.querySelector(`[data-col="${col}"]`); const to = row.querySelector(`[data-col="${col}"]`); if (from && to) to.value = from.value; });
      renumber();
      changed();
      row.classList.add('is-new');
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const first = row.querySelector('input:not([type="number"]):not([type="checkbox"]), textarea, select');
      if (first) first.focus({ preventScroll: true });
    });

    body.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const row = button.closest('tr');
      if (button.hasAttribute('data-remove')) {
        const filled = [...row.querySelectorAll('input:not([type="number"]):not([type="checkbox"]), textarea')].some((input) => input.value.trim() !== '');
        if (filled && !window.confirm('Remove this row? It is deleted when you save.')) return;
        row.remove();
      } else if (button.dataset.move) {
        const other = button.dataset.move === '-1' ? row.previousElementSibling : row.nextElementSibling;
        if (!other) return;
        if (button.dataset.move === '-1') other.before(row); else other.after(row);
        button.focus();
      } else return;
      renumber();
      changed();
    });
    body.addEventListener('input', changed);

    form.addEventListener('submit', (event) => {
      renumber();
      // Point out the first empty required field instead of sending the form
      const missing = [...body.querySelectorAll('[required]')].find((input) => {
        const rowHasText = [...input.closest('tr').querySelectorAll('input:not([type="number"]):not([type="checkbox"]), textarea')].some((field) => field.value.trim() !== '');
        return rowHasText && !input.value.trim();
      });
      if (missing) {
        event.preventDefault();
        missing.setAttribute('aria-invalid', 'true');
        missing.focus();
        status.textContent = 'Fill in the highlighted field first';
        return;
      }
      dirty = false;
    });
    if (form.querySelector('.problem')) changed();
  });

  window.addEventListener('beforeunload', (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
})();

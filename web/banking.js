const screens = ['home', 'charge', 'choose', 'voice', 'report', 'saved'];
function show(name) {
  for (const screen of screens) document.getElementById(screen).hidden = screen !== name;
  document.querySelector('.phone').scrollTop = 0;
  const heading = document.querySelector(`#${name} h1`);
  heading.tabIndex = -1;
  heading.focus({preventScroll: true});
}
document.querySelectorAll('[data-back]').forEach(button => button.onclick = () => show(button.dataset.back));
document.getElementById('open-charge').onclick = () => show('charge');
document.getElementById('dispute-charge').onclick = () => show('choose');
document.getElementById('choose-voice').onclick = () => show('voice');
document.getElementById('choose-form').onclick = () => show('report');
document.getElementById('report-form').onsubmit = event => {
  event.preventDefault();
  const draft = {transaction: 'T-204', reason: document.getElementById('reason').value, statement: document.getElementById('statement').value.trim()};
  if (!draft.statement) { document.getElementById('statement').focus(); return; }
  try { localStorage.setItem('apex-dispute-draft', JSON.stringify(draft)); }
  catch { alert('Draft could not be saved. Check browser storage and try again.'); return; }
  document.getElementById('saved-reason').textContent = draft.reason;
  document.getElementById('saved-statement').textContent = draft.statement;
  show('saved');
};
try {
  const draft = JSON.parse(localStorage.getItem('apex-dispute-draft'));
  if (draft?.transaction === 'T-204') {
    document.getElementById('reason').value = draft.reason;
    document.getElementById('statement').value = draft.statement;
  }
} catch { /* The form remains usable when storage is unavailable. */ }

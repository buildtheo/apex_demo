const screens = ['home', 'charge', 'choose', 'voice', 'report', 'saved'];
const $ = id => document.getElementById(id);
let session, sessionToken, busy = false, retryTurn;
const reasons = {unauthorized: "I didn't authorize this purchase", duplicate: 'Duplicate charge', amount: 'Incorrect amount', goods: 'Goods or services issue'};
function show(name) {
  for (const screen of screens) $(screen).hidden = screen !== name;
  $(name).scrollTop = 0;
  const heading = document.querySelector(`#${name} h1`);
  heading.tabIndex = -1; heading.focus({preventScroll: true});
}
function notice(text) { $('intake-notice').textContent = text; }
function setBusy(value) {
  busy = value;
  for (const id of ['choose-form', 'send-message', 'confirm-report', 'statement']) $(id).disabled = value;
}
async function api(path, data) {
  const response = await fetch(path, {method: data ? 'POST' : 'GET', headers: {
    'Content-Type': 'application/json', 'X-Apex-Demo': 'local', ...(sessionToken ? {'X-Apex-Session': sessionToken} : {}),
  }, ...(data ? {body: JSON.stringify(data)} : {})});
  const result = await response.json();
  if (!response.ok) {
    if (result.error === 'demo_restarted') {
      sessionStorage.removeItem('apex-intake-session'); sessionStorage.removeItem('apex-customer-preview');
      location.reload(); throw Error('The demo restarted. Opening the fresh banking app.');
    }
    const messages = {content_blocked: "That message couldn't be accepted. Remove card numbers, security codes or other secrets and try again.",
      preview_expired: "This demo preview has expired. Reopen Martha's app from Apex review.",
      intake_model_unavailable: 'Support is temporarily unavailable. Your report has not been submitted. Please try again.',
      conversation_limit: 'This demo has reached its conversation limit. No report was submitted.',
      duplicate_dispute: 'A report for this purchase already exists. Continue from the browser tab where you submitted it.',
      stale_confirmation: 'Your report changed. Review the latest details before confirming.'};
    throw Error(messages[result.error] || `Request could not be completed (${result.error || response.status}).`);
  }
  return result;
}
function remember() {
  try { sessionStorage.setItem('apex-intake-session', JSON.stringify({session_id: session.session_id, token: sessionToken, demo_run: session.demo_run})); }
  catch { /* The current flow works in memory; refreshing will not restore it. */ }
}
function renderConversation() {
  $('conversation').replaceChildren();
  for (const message of session.messages) {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${message.role}`; bubble.textContent = message.content;
    $('conversation').append(bubble);
  }
  $('review').hidden = !session.review || !!session.case_id;
  if (session.review) {
    $('review-reason').textContent = reasons[session.review.reason];
    $('review-statement').textContent = session.review.statement;
    if (!session.case_id) $('review').scrollIntoView({block: 'end'});
  }
}
async function refreshSession() {
  session = await api(`/api/intake/session?session_id=${encodeURIComponent(session.session_id)}`);
  renderConversation();
}
async function saved() {
  const record = await api(`/api/customer-case?session_id=${encodeURIComponent(session.session_id)}`);
  if (!record.case_id || record.case_id !== session.case_id) throw Error('Submission could not be verified. Check status before retrying.');
  $('saved-case').textContent = `Case reference: ${record.case_id}`;
  $('preview-notice').hidden=!session.customer_preview;
  const resolution=record.resolution;
  const posted=record.status==='CREDIT_POSTED'&&resolution?.amount_cents===64850&&resolution.currency==='USD'&&resolution.id;
  $('resolution').hidden=!posted;
  $('credit-activity').hidden=!posted;
  $('view-report').hidden=false;
  $('saved-label').textContent=posted?'DISPUTE RESOLVED':'REPORT SUBMITTED';
  $('saved-title').textContent=posted?'Your credit is here.':"We've received your report.";
  $('saved-intro').textContent=posted?'Your dispute has been resolved. You can see the credit in your account activity.':'Your report is with our dispute team. Submission is not a decision or a credit.';
  $('saved-status').textContent=posted?'Resolved · Credit posted':record.status === 'INTAKE_RECEIVED' ? 'Received by the dispute team' : 'Under review';
  $('card-balance').textContent=posted?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(resolution.card_balance_cents/100):'$2,184.72';
  if(posted){
    $('resolution-explanation').textContent=resolution.customer_explanation;
    $('resolution-reference').textContent=`Credit reference: ${resolution.id}`;
  }
  show('saved');
}
document.querySelectorAll('[data-back]').forEach(button => button.onclick = () => show(button.dataset.back));
$('open-charge').onclick = () => show('charge');
$('dispute-charge').onclick = () => show('choose');
$('choose-voice').onclick = () => show('voice');
$('choose-form').onclick = async () => {
  if (busy) return;
  show('report'); setBusy(true); notice('Connecting to support...');
  try {
    if (session) await refreshSession();
    else {
      session = await api('/api/intake/start', {transaction_id: 'T-204'});
      sessionToken = session.token; delete session.token; remember(); renderConversation();
    }
    notice(''); if (session.case_id) await saved();
  } catch (error) { notice(error.message); }
  finally { setBusy(false); }
};
$('report-form').onsubmit = async event => {
  event.preventDefault();
  if (busy || !session || session.case_id) return;
  const message = $('statement').value.trim();
  if (!message) return;
  if (!retryTurn || retryTurn.message !== message) retryTurn = {turn_id: crypto.randomUUID(), message};
  setBusy(true); $('review').hidden = true; notice('Support is responding...');
  try {
    session = await api('/api/intake/turn', {session_id: session.session_id, revision: session.revision, ...retryTurn});
    retryTurn = null; $('statement').value = ''; renderConversation(); notice('');
  } catch (error) {
    notice(error.message);
    try { await refreshSession(); } catch { /* Keep the last known session and retry ID. */ }
  } finally { setBusy(false); }
};
$('confirm-report').onclick = async () => {
  if (busy || !session?.review) return;
  setBusy(true); notice('Submitting your confirmed report...');
  try {
    const result = await api('/api/intake/confirm', {session_id: session.session_id, revision: session.revision, nonce: session.review.nonce});
    session.case_id = result.case_id; await saved(); notice('');
  } catch (error) { notice(error.message); }
  finally { setBusy(false); }
};
function hideUnverifiedCredit(error){
  $('resolution').hidden=true; $('credit-activity').hidden=true;
  $('card-balance').textContent='Balance unavailable';
  $('saved-title').textContent='We could not confirm the latest status.';
  $('saved-status').textContent=error.message;
  $('saved-intro').textContent='Please check again. No completion is being claimed while verification is unavailable.';
}
$('check-report').onclick = () => saved().catch(hideUnverifiedCredit);
$('view-report').onclick = () => saved().catch(error=>{show('saved');hideUnverifiedCredit(error);});
window.addEventListener('focus',()=>{
  if (!session) return;
  api('/api/demo-run').then(current => {
    if ((session.demo_run || null) !== current.run_id) {
      sessionStorage.removeItem('apex-intake-session'); sessionStorage.removeItem('apex-customer-preview');
      location.reload(); return;
    }
    if(session.case_id&&!$('saved').hidden)return saved();
  }).catch(hideUnverifiedCredit);
});
async function restoreBankingSession() {
  setBusy(true);
  try {
    const current = await api('/api/demo-run');
    const stored = JSON.parse(sessionStorage.getItem('apex-customer-preview')||sessionStorage.getItem('apex-intake-session'));
    if (stored && (stored.demo_run || null) !== current.run_id) {
      sessionStorage.removeItem('apex-customer-preview'); sessionStorage.removeItem('apex-intake-session');
    } else if (stored?.session_id && stored?.token) {
      session = {session_id: stored.session_id}; sessionToken = stored.token;
      await refreshSession(); if (session.case_id) await saved();
    }
  } catch (error) { notice(error.message); }
  finally { setBusy(false); }
}
restoreBankingSession();

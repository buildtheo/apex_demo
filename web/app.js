let state;
const selectedCase = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('case_id') : null;
const caseUrl = path => selectedCase ? path + '?case_id=' + encodeURIComponent(selectedCase) : path;
let caseGeneration = 0, assessmentRequest = 0;
let caseLoading = false;
const emptyAssessment = 'Select a question to inspect the fixed demo reasoning and source references.';
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function invalidateAssessment() {
  caseGeneration += 1;
  assessmentRequest += 1;
  $('analysis').textContent = emptyAssessment;
}
async function load() {
  // A refresh supersedes any assessment already in flight, even after a reset
  // that reuses the same case ID and evidence version.
  invalidateAssessment();
  const generation = caseGeneration;
  caseLoading = true;
  try {
    const r = await fetch(caseUrl('/api/case'));
    if (!r.ok) throw Error('Case read failed');
    const next = await r.json();
    if (generation !== caseGeneration) return;
    state = next;
    render();
  } finally {
    if (generation === caseGeneration) caseLoading = false;
  }
}
function render(){
 $('amount').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(state.amount);
 $('merchant').textContent=state.merchant;
 $('facts').innerHTML=[['Cardholder',state.customer],['Case',state.id],['Status',state.status.replaceAll('_',' ')],['Owner',state.assigned_to||'Local demo operator']].map(([k,v])=>`<dt>${safe(k)}</dt><dd>${safe(v)}</dd>`).join('');
 $('snapshot').textContent='Evidence v'+state.version;
 $('evidence').innerHTML=state.evidence.map(e=>`<details ${e.available?'':'class="unavailable"'}><summary><span class="source">${safe(e.id)}</span> ${safe(e.title)} <span class="pill">${e.available?safe(e.kind):'Not received'}</span></summary><p>${safe(e.available?e.text:'Request this record to verify the supporting reference.')}</p><small>${safe(e.source)}</small></details>`).join('');
 $('timeline').innerHTML=state.timeline.map(t=>`<div class="event"><small>${safe(new Date(t.at).toLocaleTimeString())}</small><p>${safe(t.message)}</p></div>`).reverse().join('');
 $('request').disabled=state.status!=='IN_REVIEW';$('response').disabled=state.status!=='PENDING_EVIDENCE';$('escalate').disabled=state.status!=='EVIDENCE_RECEIVED';
 const d=state.draft;$('approval').hidden=!d;
 if(d){$('approval').innerHTML=`<p class="eyebrow">REVIEW EXACT ACTION · LOCAL DEMO APPROVAL</p><h2>${safe(d.kind.replaceAll('_',' '))}</h2><p>Case ${safe(d.case_id)} · Evidence v${d.version}</p><pre>${safe(JSON.stringify(d.payload,null,2))}</pre><p class="small">This action changes only the local synthetic case. Production identity and authorization are not implemented.</p><button id="approve">Approve & execute in demo</button>`;$('approve').onclick=()=>act('approve',{draft_id:d.id},d);}
}
async function act(action,extra={},approved=null){invalidateAssessment();try{document.querySelectorAll('button').forEach(b=>b.disabled=true);const r=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Apex-Demo':'local'},body:JSON.stringify({action,...extra,...(selectedCase?{case_id:selectedCase}:{})})});const j=await r.json();if(!r.ok)throw Error(j.error);await load();if(action==='approve'){const v=verifyEffect(state,approved);if(!v.ok)throw Error('Execution acknowledged, but the saved case record could not be verified: '+v.reason+'.');$('notice').textContent='Verified against the saved case record: '+v.summary+'.';}else $('notice').textContent=action==='response'?'Simulated response received. Re-run the comparison to reassess.':'Case updated.';}catch(e){$('notice').textContent=e.message;}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false);if(state)render();}}
async function ask(kind) {
  if (!state || caseLoading) return;
  const generation = caseGeneration, request = ++assessmentRequest;
  const expectedCase = state.id, expectedVersion = state.version;
  const current = () => generation === caseGeneration && request === assessmentRequest;
  $('analysis').textContent = 'Loading fixed assessment...';
  try {
    const r = await fetch(caseUrl('/api/analysis/' + kind));
    if (!current()) return;
    if (!r.ok) throw Error('Fixed assessment unavailable');
    const result = await r.json();
    if (!current()) return;
    if (result.case_id !== expectedCase || result.evidence_version !== expectedVersion) {
      $('analysis').textContent = 'Case evidence changed. Refresh the case and request a new assessment.';
      return;
    }
    $('analysis').textContent = result.text;
  } catch (e) {
    if (!current()) return;
    $('analysis').textContent = 'Fixed assessment unavailable. Try again.';
    $('notice').textContent = e.message;
  }
}
$('compare').onclick=()=>ask('compare');
$('gap').onclick=()=>ask('gap');
$('request').onclick=()=>act('draft',{kind:'REQUEST_EVIDENCE'});$('response').onclick=()=>act('response');$('escalate').onclick=()=>act('draft',{kind:'ESCALATE_REVIEW'});$('reset').onclick=()=>{if(confirm('Reset this local demo case and its history?'))act('reset');};
load().catch(e=>$('notice').textContent=e.message);


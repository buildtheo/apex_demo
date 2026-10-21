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
 $('case-label').textContent='YOUR WORK QUEUE / '+state.id;
 $('reset').hidden=Boolean(state.intake_id);$('escalate').hidden=Boolean(state.intake_id);
 $('legacy-aids').hidden=Boolean(state.intake_id);
 $('evidence').innerHTML=state.evidence.map(e=>`<details ${e.available?'':'class="unavailable"'}><summary><span class="source">${safe(e.id)}</span> ${safe(e.title)} <span class="pill">${e.available?safe(e.kind):'Not received'}</span></summary><p>${safe(e.available?e.text:'Request this record to verify the supporting reference.')}</p><small>${safe(e.source)}${e.received_at?` · Received ${safe(new Date(e.received_at).toLocaleString())} · Response version ${safe(e.document_version)} · Corrects ${safe(e.correction_of)} · Request ${safe(e.request_id)}`:''}</small></details>`).join('');
 $('timeline').innerHTML=state.timeline.map(t=>`<div class="event"><small>${safe(new Date(t.at).toLocaleTimeString())}</small><p>${safe(t.message)}</p></div>`).reverse().join('');
 const followup=Boolean(state.intake_id)&&state.status==='EVIDENCE_RECEIVED';
 $('request').textContent=followup||state.processor_request?'Prepare processor follow-up':'Stage evidence request locally';
 $('request').disabled=state.status!=='IN_REVIEW'&&!followup;
 $('response').textContent=state.status==='PROCESSOR_PENDING'?'Show later processor response (simulation)':'Simulate later response';
 $('response').disabled=!['PENDING_EVIDENCE','PROCESSOR_PENDING'].includes(state.status);$('escalate').disabled=state.status!=='EVIDENCE_RECEIVED';
 const pending=state.processor_request||state.request;
 $('request-status').hidden=!pending;
 if(pending){
  const waiting=pending.status==='OPEN', processor=Boolean(state.processor_request);
  $('request-status').innerHTML=`<p class="eyebrow">${waiting?'WAITING FOR EVIDENCE':'RESPONSE RECEIVED'}</p><h2>${waiting?(processor?'We have requested evidence for this purchase.':'We have requested the authentication lookup.'):(processor?'The processor has provided a corrected response.':'The authentication lookup has arrived.')}</h2><p>${waiting?'The request is saved. No response has arrived yet.':processor?'Open the corrected processor response below (E-005). The original export is unchanged.':'Open the lookup result above (E-004), then return to ChatGPT to review it.'}</p>${waiting?'<p class="small">For this demo, use the simulation button to move forward to the later response. No external processor is contacted.</p>':''}`;
 }
 const d=state.draft;$('approval').hidden=!d;
 if(d){
  const note=d.contract?'This saves a synthetic request only. It does not return evidence or approve credit. Production identity is not implemented.':'This action changes only the local synthetic case. Production identity and authorization are not implemented.';
  const request=d.contract==='mcp_request_v1';
  const payload=request?`<p class="request-question">${safe(d.payload.question)}</p><dl class="request-facts">${[
   ['Send to',d.payload.queue],['Authentication record',d.payload.auth_record_id],
   ['Disputed transaction',d.payload.disputed_transaction_id],['Evidence sources',d.payload.source_ids.join(', ')],
   ['Action ID',d.id],...(d.payload.preserve_original?[['Original evidence','Keep E-003 unchanged; add a separately versioned correction']]:[])
  ].map(([label,value])=>`<div><dt>${safe(label)}</dt><dd>${safe(value)}</dd></div>`).join('')}</dl><p>Approve only this evidence request. This does not decide the dispute or issue a credit.</p><details class="technical-payload"><summary>Technical details</summary><p>Exact payload hash: ${safe(d.payload_hash)}</p><pre>${safe(JSON.stringify(d.payload,null,2))}</pre></details>`:`<pre>${safe(JSON.stringify(d.payload,null,2))}</pre>`;
  $('approval').innerHTML=`<p class="eyebrow">REVIEW EXACT ACTION · ${d.contract?'BARBARA / SIMULATED IDENTITY':'LOCAL DEMO APPROVAL'}</p><h2>${d.kind==='REQUEST_PROCESSOR_EVIDENCE'?'Ask the processor for more evidence':request?'Review evidence request':safe(d.kind.replaceAll('_',' '))}</h2><p>Case ${safe(d.case_id)} · Evidence v${d.version}</p>${payload}${d.expires_at?`<p>Review expires: ${safe(new Date(d.expires_at*1000).toLocaleTimeString())}</p>`:''}<p class="small">${safe(note)}</p><button id="approve">${d.kind==='REQUEST_PROCESSOR_EVIDENCE'?'Approve request in demo':'Approve & execute in demo'}</button>`;
  $('approve').onclick=()=>act('approve',{draft_id:d.id},d);
 }
}
async function act(action,extra={},approved=null){
 invalidateAssessment();
 try{
  document.querySelectorAll('button').forEach(b=>b.disabled=true);
  const reviewed=action==='approve'&&approved?.contract==='mcp_request_v1';
  const r=await fetch(reviewed?'/api/review-action':'/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Apex-Demo':'local'},
   body:JSON.stringify({action,...extra,...(selectedCase?{case_id:selectedCase}:{}),...(reviewed?{case_id:approved.case_id,version:approved.version,payload_hash:approved.payload_hash}:{})})});
  const j=await r.json();if(!r.ok)throw Error(j.error);await load();
  if(action==='approve'){
   const v=verifyEffect(state,approved);if(!v.ok)throw Error('Execution acknowledged, but the saved case record could not be verified: '+v.reason+'.');
   $('notice').textContent='Verified against the saved case record: '+v.summary+'.';
 }else $('notice').textContent=['response','processor_response'].includes(action)?'Later response received (simulation). Return to ChatGPT to review the new evidence.':'Case updated.';
 }catch(e){$('notice').textContent=e.message;}
 finally{document.querySelectorAll('button').forEach(b=>b.disabled=false);if(state)render();}
}
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
$('refresh-case').onclick=()=>load().catch(e=>$('notice').textContent=e.message);
$('gap').onclick=()=>ask('gap');
$('request').onclick=()=>act('draft',{kind:state.intake_id&&state.status==='EVIDENCE_RECEIVED'?'REQUEST_PROCESSOR_EVIDENCE':'REQUEST_EVIDENCE'});$('response').onclick=()=>act(state.status==='PROCESSOR_PENDING'?'processor_response':'response');$('escalate').onclick=()=>act('draft',{kind:'ESCALATE_REVIEW'});$('reset').onclick=()=>{if(confirm('Reset this local demo case and its history?'))act('reset');};
load().catch(e=>$('notice').textContent=e.message);


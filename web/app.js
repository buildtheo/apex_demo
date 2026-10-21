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
    if(next.decision?.draft_id){
      try{
        const check=await fetch(`/api/action-result?case_id=${encodeURIComponent(next.id)}&action_id=${encodeURIComponent(next.decision.draft_id)}`,{headers:{'X-Apex-Actor':'demo:barbara'}});
        if(check.ok)next.credit_check=await check.json();
      }catch{/* Never show completion without the separate ledger/decision read. */}
    }
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
 $('customer-preview').hidden=true;
 $('request-status').hidden=!pending;
 if(pending){
  const waiting=pending.status==='OPEN', processor=Boolean(state.processor_request);
  $('request-status').innerHTML=`<p class="eyebrow">${waiting?'WAITING FOR EVIDENCE':'RESPONSE RECEIVED'}</p><h2>${waiting?(processor?'We have requested evidence for this purchase.':'We have requested the authentication lookup.'):(processor?'The processor has provided a corrected response.':'The authentication lookup has arrived.')}</h2><p>${waiting?'The request is saved. No response has arrived yet.':processor?'Open the corrected processor response below (E-005). The original export is unchanged.':'Open the lookup result above (E-004), then return to ChatGPT to review it.'}</p>${waiting?'<p class="small">For this demo, use the simulation button to move forward to the later response. No external processor is contacted.</p>':''}`;
 }
 if(state.decision){
  const approved=state.staged_actions?.[state.decision.draft_id];
  const verified=verifyEffect(state,approved,state.credit_check).ok;
  $('customer-preview').hidden=!verified;
  $('request-status').hidden=false;
  $('request-status').innerHTML=verified?'<p class="eyebrow">CREDIT VERIFIED</p><h2>Martha\'s $648.50 credit is posted.</h2><p>The synthetic ledger and reviewed case decision match. Return to Martha\'s banking app to see her resolution.</p>':'<h2>Credit verification is pending.</h2><p>Do not report completion or retry posting. Refresh the case to reconcile the saved ledger and decision.</p>';
 }
 const d=state.draft;$('approval').hidden=!d;
 if(d){
  if(d.kind==='POST_CREDIT'){
   const p=d.payload;
   $('approval').innerHTML=`<p class="eyebrow">BARBARA'S REVIEW · SYNTHETIC CREDIT</p><h2>Credit Martha $${safe((p.amount_cents/100).toFixed(2))}?</h2><p>JCPenney · Card ending 8821 · Case ${safe(d.case_id)}</p><h3>Why this is recommended</h3><p>${safe(p.rationale)}</p><h3>What Martha will see</h3><p>${safe(p.customer_explanation)}</p><p>Sources: ${safe(p.source_ids.join(', '))}</p><p class="small">Fictional policy ${safe(p.policy_id)} permits Barbara to approve supported disputes strictly below $1,000. Missing evidence alone is not eligibility or proof of fraud. Identity and ledger are simulated.</p><label class="credit-attestation"><input id="supports-dispute" type="checkbox"> I reviewed the cited evidence and explanation and find that they support this customer-favorable decision under the fictional policy.</label><details class="technical-payload"><summary>Action details</summary><p>Action ${safe(d.id)} · Evidence v${d.version} · Account ${safe(p.account_ref)} · Expires ${safe(new Date(d.expires_at*1000).toLocaleTimeString())}</p><pre>${safe(JSON.stringify(p,null,2))}</pre></details><button id="approve" disabled>Approve $648.50 credit in demo</button>`;
   $('supports-dispute').onchange=()=>{$('approve').disabled=!$('supports-dispute').checked;};
   $('approve').onclick=()=>act('approve',{draft_id:d.id,supports_dispute:$('supports-dispute').checked},d);
   return;
  }
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
  const reviewed=action==='approve'&&['mcp_request_v1','mcp_credit_v1'].includes(approved?.contract);
  const r=await fetch(reviewed?'/api/review-action':'/api/action',{method:'POST',headers:{'Content-Type':'application/json','X-Apex-Demo':'local'},
   body:JSON.stringify({action,...extra,...(selectedCase?{case_id:selectedCase}:{}),...(reviewed?{case_id:approved.case_id,version:approved.version,payload_hash:approved.payload_hash}:{})})});
  const j=await r.json();if(!r.ok)throw Error(j.error);await load();
  if(action==='approve'){
   const v=verifyEffect(state,approved,state.credit_check);if(!v.ok)throw Error('Execution acknowledged, but the saved case record could not be verified: '+v.reason+'.');
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
$('customer-preview').onclick=async()=>{
 $('customer-preview').disabled=true;
 try{
  const r=await fetch('/api/customer-preview',{method:'POST',headers:{'Content-Type':'application/json','X-Apex-Demo':'local'},body:JSON.stringify({case_id:state.id})});
  const preview=await r.json();if(!r.ok)throw Error(preview.error||'Customer preview unavailable');
  sessionStorage.setItem('apex-customer-preview',JSON.stringify({session_id:preview.session_id,token:preview.token,demo_run:preview.demo_run}));
  location.assign('/');
 }catch(error){$('notice').textContent=error.message;$('customer-preview').disabled=false;}
};
$('request').onclick=()=>act('draft',{kind:state.intake_id&&state.status==='EVIDENCE_RECEIVED'?'REQUEST_PROCESSOR_EVIDENCE':'REQUEST_EVIDENCE'});$('response').onclick=()=>act(state.status==='PROCESSOR_PENDING'?'processor_response':'response');$('escalate').onclick=()=>act('draft',{kind:'ESCALATE_REVIEW'});$('reset').onclick=()=>{if(confirm('Reset this local demo case and its history?'))act('reset');};
load().catch(e=>$('notice').textContent=e.message);


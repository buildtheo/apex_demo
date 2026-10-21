const rows = document.getElementById('cases'), notice = document.getElementById('notice');
async function load() {
  const response = await fetch('/api/cases');
  if (!response.ok) throw Error('Queue could not be loaded.');
  rows.replaceChildren();
  for (const record of await response.json()) {
    const row = document.createElement('tr');
    for (const value of [`${record.case_id} / ${record.customer}`, `${record.merchant} / $${record.amount.toFixed(2)}`, record.status.replaceAll('_', ' ')]) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    const actions = document.createElement('td');
    if (record.credit_review_pending || record.status === 'CREDIT_POSTED' || record.case_id === 'APX-001') {
      const link = document.createElement('a');
      link.href = `/ops?case_id=${encodeURIComponent(record.case_id)}`;
      link.textContent = record.credit_review_pending ? 'Review credit' : record.status === 'CREDIT_POSTED' ? 'View resolution' : 'Legacy prototype';
      actions.append(link);
    } else {
      const button = document.createElement('button'); button.textContent = 'Investigate in ChatGPT';
      button.onclick = () => window.apexInvestigate(record.case_id);
      actions.append(button);
    }
    row.append(actions); rows.append(row);
  }
}
document.getElementById('refresh').onclick = () => load().catch(error => { notice.textContent = error.message; });
load().catch(error => { notice.textContent = error.message; });

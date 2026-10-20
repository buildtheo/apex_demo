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
    const actions = document.createElement('td'), link = document.createElement('a');
    link.href = `/ops?case_id=${encodeURIComponent(record.case_id)}`; link.textContent = 'Open case'; actions.append(link);
    if (record.status === 'INTAKE_RECEIVED') {
      const label = document.createElement('small'); label.textContent = 'Simulation: advance to later processor evidence';
      const button = document.createElement('button'); button.textContent = 'Attach later packet';
      button.onclick = async () => {
        button.disabled = true;
        try {
          const result = await fetch('/api/action', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Apex-Demo': 'local'},
            body: JSON.stringify({action: 'review_packet', case_id: record.case_id})});
          if (!result.ok) throw Error('Later packet was not attached. Refresh before retrying.');
          await load(); notice.textContent = 'Simulated later processor packet saved. Read the same case in ChatGPT at its new version.';
        } catch (error) { notice.textContent = error.message; button.disabled = false; }
      };
      actions.append(label, button);
    }
    row.append(actions); rows.append(row);
  }
}
document.getElementById('refresh').onclick = () => load().catch(error => { notice.textContent = error.message; });
load().catch(error => { notice.textContent = error.message; });

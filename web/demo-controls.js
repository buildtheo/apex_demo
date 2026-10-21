(() => {
  const button = document.getElementById('restart-demo');
  const status = document.getElementById('restart-notice');
  let requestId;
  button.onclick = async () => {
    if (!requestId && !confirm('Start a fresh practice run? Earlier cases and credits stay saved. Old practice tabs cannot change the new run.')) return;
    requestId ||= crypto.randomUUID();
    button.disabled = true;
    status.textContent = 'Starting a fresh demo...';
    try {
      const response = await fetch('/api/restart-demo', {method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-Apex-Demo': 'local'},
        body: JSON.stringify({request_id: requestId})});
      const result = await response.json();
      if (!response.ok) throw Error('Restart could not be confirmed. Retry this button or refresh the page.');
      sessionStorage.removeItem('apex-intake-session');
      sessionStorage.removeItem('apex-customer-preview');
      location.assign('/');
    } catch (error) {
      status.textContent = error.message;
      button.disabled = false;
    }
  };
})();

(() => {
  const panel = document.getElementById('chatgpt-handoff');
  const prompt = document.getElementById('chatgpt-prompt');
  const status = document.getElementById('handoff-status');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.value);
      status.textContent = 'Prompt copied. In ChatGPT, select your Apex connection, paste and send.';
    } catch {
      status.textContent = 'Select and copy the prompt below, then paste it in ChatGPT with your Apex connection selected.';
      prompt.focus(); prompt.select();
    }
  };
  document.getElementById('copy-chatgpt-prompt').onclick = copy;
  window.apexInvestigate = caseId => {
    prompt.value = `Use my Apex connection to open case ${caseId}. Help me investigate Martha's disputed purchase. Keep each answer conversational and brief: what we know, what doesn't add up, sources, and the next useful step. Read current released evidence before making findings. I can ask you to request the bounded internal lookup and purchase-specific processor evidence here; those requests don't need separate Apex business approval. Only advance simulated time when I explicitly ask to show a later response. Never infer fraud or credit eligibility from missing evidence alone. Prepare any credit recommendation for my separate approval in Apex, never approve or post it.`;
    panel.hidden = false;
    // No undocumented prompt URL or automatic message submission. The plain link is the fallback.
    void copy();
    window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
  };
})();

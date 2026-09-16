(() => {
  const button = document.querySelector('#install-app');
  const dialog = document.querySelector('#install-dialog');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let pendingPrompt = null;
  const installed = () => standalone.matches || navigator.standalone === true;
  function update() {
    button.textContent = installed() ? '✓ App installed' : '↓ Install app';
    button.disabled = installed();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingPrompt = event;
    update();
  });
  window.addEventListener('appinstalled', () => {
    pendingPrompt = null;
    button.textContent = '✓ App installed';
    button.disabled = true;
    if (dialog.open) dialog.close();
  });
  standalone.addEventListener('change', update);
  button.addEventListener('click', async () => {
    if (pendingPrompt) {
      const prompt = pendingPrompt;
      pendingPrompt = null;
      try {
        await prompt.prompt();
        await prompt.userChoice;
        return;
      } catch { /* Browser installation help remains available. */ }
    }
    document.querySelector('#install-local-note').hidden = location.protocol === 'https:';
    dialog.showModal();
  });
  document.querySelector('#close-install').addEventListener('click', () => dialog.close());
  if ('serviceWorker' in navigator && window.isSecureContext && /https?:/.test(location.protocol)) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      document.querySelector('#offline-note').textContent = 'Offline setup could not finish. Reopen the app online to retry.';
    });
  }
  update();
})();

const Activation = (() => {
  const FREE_LIMIT = 12;
  const storageKey = 'trackly-activation-v1';
  let active = false;
  let customer = '';
  const decode = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
  async function verify(code) {
    if (!crypto.subtle) throw Error('Activation needs a supported browser on HTTPS or localhost. Open the published app link and try again.');
    if (typeof code !== 'string' || code.length > 2000 || !/^TRACKLY1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(code)) throw Error('Invalid activation code. Paste the complete code supplied by the seller.');
    const [prefix, payload, signature] = code.split('.');
    try {
      const key = await crypto.subtle.importKey('jwk', ACTIVATION_PUBLIC_KEY, {name:'ECDSA',namedCurve:'P-256'}, false, ['verify']);
      const valid = await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'}, key, decode(signature), new TextEncoder().encode(prefix + '.' + payload));
      if (!valid) throw Error();
      const license = JSON.parse(new TextDecoder().decode(decode(payload)));
      if (license.v !== 1 || license.app !== 'trackly-home' || license.plan !== 'unlimited' || typeof license.id !== 'string' || !license.id || typeof license.customer !== 'string' || !license.customer.trim() || license.customer.length > 120) throw Error();
      return license;
    } catch { throw Error('Invalid activation code. Check the code or contact the seller.'); }
  }
  const ready = (async () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) { const license = await verify(saved); active = true; customer = license.customer; }
    } catch { /* Invalid or unavailable storage never grants activation. */ }
  })();
  async function activate(value) {
    await ready;
    const code = String(value || '').replace(/\s+/g, '');
    const license = await verify(code);
    try { localStorage.setItem(storageKey, code); }
    catch { throw Error('Activation could not be saved on this device. Free browser storage and try again.'); }
    active = true; customer = license.customer;
  }
  let resume = null;
  function open(afterActivation) {
    resume = typeof afterActivation === 'function' ? afterActivation : null;
    document.querySelector('#activation-code').value = '';
    document.querySelector('#activation-error').textContent = '';
    document.querySelector('#activation-dialog').showModal();
    document.querySelector('#activation-code').focus();
  }
  function bind(onChange) {
    const dialog = document.querySelector('#activation-dialog');
    const form = document.querySelector('#activation-form');
    const button = document.querySelector('#activate-submit');
    document.querySelectorAll('[data-close-activation]').forEach(control => control.onclick = () => dialog.close());
    dialog.addEventListener('close', () => { resume = null; });
    form.onsubmit = async event => {
      event.preventDefault(); button.disabled = true;
      document.querySelector('#activation-error').textContent = '';
      try {
        await activate(document.querySelector('#activation-code').value);
        const next = resume; resume = null; dialog.close(); onChange();
        if (next) await next();
      } catch (error) { document.querySelector('#activation-error').textContent = error.message; }
      finally { button.disabled = false; }
    };
    ready.then(onChange);
  }
  return Object.freeze({FREE_LIMIT, ready, activate, open, bind, isActive:() => active, customer:() => customer, allows:count => active || count <= FREE_LIMIT});
})();

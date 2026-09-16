(() => {
  const key = 'trackly-profile';
  const dialog = document.querySelector('#profile-dialog');
  const form = document.querySelector('#profile-form');
  const input = document.querySelector('#profile-name');
  const error = document.querySelector('#profile-error');
  let name = 'Jamie Davis';
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (typeof saved?.name === 'string' && saved.name.trim() && saved.name.length <= 80) {
      name = saved.name.trim();
    }
  } catch { /* The default profile remains editable. */ }

  function renderProfile() {
    const words = name.split(/\s+/);
    const initials = (Array.from(words[0])[0] + (words.length > 1 ? Array.from(words[words.length - 1])[0] : '')).toLocaleUpperCase();
    document.querySelectorAll('[data-profile-name]').forEach(label => { label.textContent = name; label.title = name; });
    document.querySelectorAll('[data-profile-initials]').forEach(avatar => { avatar.textContent = initials; });
  }

  document.querySelectorAll('[data-edit-profile]').forEach(button => {
    button.addEventListener('click', () => {
      const menu = document.querySelector('#menu-toggle');
      if (menu.getAttribute('aria-expanded') === 'true') menu.click();
      input.value = name;
      input.setCustomValidity('');
      error.textContent = '';
      dialog.showModal();
      input.focus();
      input.select();
    });
  });
  document.querySelectorAll('[data-close-profile]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  input.addEventListener('input', () => { input.setCustomValidity(''); error.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const next = input.value.trim().replace(/\s+/g, ' ');
    if (!next || next.length > 80) {
      input.setCustomValidity('Enter a name between 1 and 80 characters.');
      input.reportValidity();
      return;
    }
    try { localStorage.setItem(key, JSON.stringify({ name: next })); }
    catch {
      error.textContent = 'Your name could not be saved. Device storage may be full or unavailable. Please try again.';
      return;
    }
    name = next;
    renderProfile();
    dialog.close();
    notify('Your profile has been updated');
  });
  renderProfile();
})();

(() => {
  const toggle = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  const sidebar = document.querySelector('aside');
  const mobile = window.matchMedia('(max-width: 650px)');

  function setOpen(open, restoreFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navigation.hidden = mobile.matches && !open;
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  navigation.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('button[data-page]')) setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (mobile.matches && !sidebar.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (mobile.matches && event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });
  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false);
})();

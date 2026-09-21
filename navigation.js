(() => {
  const nav = document.getElementById('nav-pill');
  if (!nav) return;
  const toggle = nav.querySelector('.nav-toggle');
  const mobile = window.matchMedia('(max-width: 760px)');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && mobile.matches) setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget)) setOpen(false);
  });
  const syncLayout = () => {
    const active = document.activeElement;
    toggle.hidden = !mobile.matches;
    setOpen(false);
    if (mobile.matches && active && active.closest('.nav-links') && nav.contains(active)) toggle.focus();
    if (!mobile.matches && active === toggle) nav.querySelector('.nav-logo').focus();
  };
  mobile.addEventListener('change', syncLayout);
  syncLayout();
  nav.classList.add('nav-enhanced');
})();

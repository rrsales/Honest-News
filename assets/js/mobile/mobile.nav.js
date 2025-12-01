// assets/js/mobile/mobile.nav.js

document.addEventListener('DOMContentLoaded', () => {
  const body   = document.body;
  const drawer = document.querySelector('[data-mobile-nav-drawer]');
  if (!drawer) return;

  const openTriggers  = document.querySelectorAll('[data-mobile-nav-open]');
  const closeTriggers = drawer.querySelectorAll('[data-mobile-nav-close]');
  const overlay       = document.querySelector('[data-mobile-menu-overlay]'); // reuse overlay if present

  function openDrawer() {
    drawer.classList.add('open');
    body.classList.add('hn-no-scroll');
    if (overlay) {
      overlay.classList.add('open');
    }
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    body.classList.remove('hn-no-scroll');
    if (overlay) {
      overlay.classList.remove('open');
    }
  }

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });
  });

  closeTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
    });
  });

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
});

// assets/js/mobile.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("mobileMenuToggle");
  const menu = document.getElementById("mobileMenu");
  const body = document.body;

  if (!toggle || !menu) return;

  function openMenu() {
    body.classList.add("mobile-menu-open");
    menu.classList.add("is-open");
  }

  function closeMenu() {
    body.classList.remove("mobile-menu-open");
    menu.classList.remove("is-open");
  }

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on X button
  const closeBtn = document.getElementById("mobileMenuClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Close when clicking a link
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      closeMenu();
    }
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
});

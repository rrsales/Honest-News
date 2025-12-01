// =====================================================
// Honest News Mobile Framework (FULL OVERWRITE)
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
});

/* ========================================
   MOBILE MENU
======================================== */
function initMobileMenu() {
  const openBtn = document.getElementById("mobileMenuBtn");
  const closeBtn = document.getElementById("mobileCloseBtn");
  const panel = document.getElementById("mobileMenu");

  if (!openBtn || !closeBtn || !panel) return;

  openBtn.addEventListener("click", () => {
    document.body.classList.add("menu-open");
    panel.classList.add("open");
  });

  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    panel.classList.remove("open");
  });
}

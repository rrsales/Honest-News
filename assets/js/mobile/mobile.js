/* ============================================================
   Honest News Mobile Navigation Framework
   Works on *all* pages
   Auto-wired with live.js → site-data.json
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("mobileMenuToggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("mobileMenuClose");
  const mobileNav = document.getElementById("mobileNavMenu");

  /* Create overlay once */
  let overlay = document.querySelector(".hn-mobile-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "hn-mobile-overlay";
    document.body.appendChild(overlay);
  }

  /* ===============================
       OPEN / CLOSE MENU
  =============================== */
  function openMenu() {
    menu.classList.add("open");
    overlay.classList.add("visible");
    document.body.classList.add("hn-menu-open");
  }

  function closeMenu() {
    menu.classList.remove("open");
    overlay.classList.remove("visible");
    document.body.classList.remove("hn-menu-open");
  }

  if (toggle) toggle.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  /* Close menu on ESC */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ===============================
       BUILD MENU FROM live.js
       This part simply waits for
       live.js to finish injecting.
  =============================== */
  function syncMobileMenu() {
    const desktop = document.getElementById("nav-menu");
    const mobile = mobileNav;

    if (!desktop || !mobile) return;

    const html = desktop.innerHTML.trim();
    if (!html) return;

    mobile.innerHTML = html;
  }

  // Try repeatedly for first 1.2s because live.js loads async
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    syncMobileMenu();
    if (attempts > 20) clearInterval(interval);
  }, 60);

  /* Re-sync after small delay when resizing */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncMobileMenu, 200);
  });
});



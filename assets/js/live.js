// =========================================================
// Honest News live.js FULL OVERWRITE
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const slug = body.getAttribute("data-page") || "home";

  const hero =
    document.querySelector(".hero") ||
    document.querySelector(".hero-carousel") ||
    document.querySelector("[data-hero]");

  const header = document.getElementById("siteHeader");
  const blocksTarget = document.querySelector("[data-blocks-target]");

  /* =============================================================
     HYBRID LOADER (RAW GitHub → Fallback Local)
  ============================================================= */
  async function loadSiteData() {
    const RAW =
      "https://raw.githubusercontent.com/rrsales/Honest-News/main/site-data.json?cb=" +
      Date.now();
    const LOCAL = "site-data.json?cb=" + Date.now();

    try {
      const r = await fetch(RAW, { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch (e) {}

    const r2 = await fetch(LOCAL, { cache: "no-store" });
    return await r2.json();
  }

  loadSiteData().then((site) => {
    if (!site || !site.pages) return;

    let page = site.pages.find((p) => p.slug === slug);
    if (!page) page = site.pages[0];

    applyTheme(body, page);
    buildDesktopMenu(site.menu || [], slug);
    buildMobileMenu(site.menu || []);

    applyHero(hero, header, page.hero || {});
    if (blocksTarget) renderBlocks(blocksTarget, page.blocks || []);
  });

  /* =============================================================
     THEME
  ============================================================= */
  function applyTheme(body, page) {
    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(page.theme === "light" ? "theme-light" : "theme-dark");
  }

  /* =============================================================
     DESKTOP MENU
  ============================================================= */
  function buildDesktopMenu(items, currentSlug) {
    const menu = document.getElementById("nav-menu");
    if (!menu) return;

    menu.innerHTML = items
      .map((item) => {
        const isActive = item.slug === currentSlug;
        return `<li><a href="${item.url}" class="${isActive ? "active" : ""}">${item.label}</a></li>`;
      })
      .join("");
  }

  /* =============================================================
     MOBILE MENU
  ============================================================= */
  function buildMobileMenu(items) {
    const list = document.getElementById("mobileMenuList");
    if (!list) return;

    list.innerHTML = items
      .map((item) => `<a href="${item.url}">${item.label}</a>`)
      .join("");
  }

  /* =============================================================
     HERO
  ============================================================= */
  function applyHero(heroEl, headerEl, h) {
    if (!heroEl) return;

    // Transparent header behavior
    if (h.transparentMenu) {
      headerEl.classList.add("header--transparent");
      body.classList.add("hero-transparent");
    } else {
      headerEl.classList.remove("header--transparent");
      body.classList.remove("hero-transparent");
    }

    // Background
    if (h.bg) {
      heroEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('${h.bg}')`;
    }

    // Size
    const sizes = {
      small: "40vh",
      medium: "60vh",
      large: "80vh",
      full: "100vh",
      custom: h.customHeight || "100vh",
    };
    heroEl.style.height = sizes[h.size] || "100vh";

    // Text changes
    const title = heroEl.querySelector("h1");
    const sub = heroEl.querySelector("p");
    if (title && h.overlay) title.textContent = h.overlay;
    if (sub && h.sub) sub.textContent = h.sub;
  }

  /* =============================================================
     BLOCKS
  ============================================================= */
  function renderBlocks(target, blocks) {
    target.innerHTML = blocks
      .map((b) => {
        switch (b.type) {
          case "heading":
            return `<section class="block block-heading"><h2>${b.content}</h2></section>`;
          case "paragraph":
            return `<section class="block block-paragraph"><p>${b.content.replace(/\n/g, "<br>")}</p></section>`;
          case "image":
            return `<section class="block block-image"><img src="${b.content}" /></section>`;
          case "button":
            return `<section class="block block-button"><a href="${b.url}" class="btn-block">${b.text}</a></section>`;
        }
      })
      .join("");
  }
});


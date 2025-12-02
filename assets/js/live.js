// assets/js/live.js
// Front-end "live engine": menu + mega menu + hero + blocks
// Uses site-data.json that you edit from the Dashboard.

(function () {
  const SITE_JSON = "site-data.json";

  const FALLBACK_SITE = {
    menu: [],
    pages: [],
    theme: {},
    heroSlides: []
  };

  let site = FALLBACK_SITE;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getCurrentSlug() {
    const body = document.body;
    return (body && body.getAttribute("data-page")) || "home";
  }

  async function loadSiteData() {
    try {
      const res = await fetch(SITE_JSON + "?v=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          site = Object.assign({}, FALLBACK_SITE, data);
        }
      }
    } catch (e) {
      console.warn("Could not load site-data.json, using defaults", e);
    }
  }

  function applyTheme(page) {
    const body = document.body;
    if (!body) return;

    body.classList.remove("theme-light", "theme-dark");

    const theme = (page && page.theme) || "dark";
    if (theme === "light") {
      body.classList.add("theme-light");
    } else {
      body.classList.add("theme-dark");
    }
  }

  /* =========================
     MENU (DESKTOP + MOBILE)
  ========================== */

  function urlsMatch(url, slug) {
    if (!url) return false;

    // podcast.html -> slug "podcast"
    const m = url.match(/^([^\.]+)\.html$/);
    if (m && m[1] === slug) return true;

    if (typeof window !== "undefined") {
      if (window.location.pathname.endsWith(url)) return true;
    }
    return false;
  }

  function isItemActive(item, slug) {
    if (!item) return false;
    const url = item.url || "";

    if (!url && item.slug) {
      return item.slug === slug;
    }

    if (urlsMatch(url, slug)) return true;

    // for mega item: active if any child url matches current slug
    if (item.type === "mega" && Array.isArray(item.subItems)) {
      return item.subItems.some((s) => urlsMatch(s.url, slug));
    }

    return false;
  }

  function renderDesktopItem(item, currentSlug) {
    const label = escapeHtml(item.label || item.title || "Item");
    const isActive = isItemActive(item, currentSlug);

    // MEGA ITEM
    if (item.type === "mega") {
      const subItems = Array.isArray(item.subItems) ? item.subItems : [];
      let subHtml = "";

      if (subItems.length) {
        subHtml =
          '<div class="mega-panel">' +
          subItems
            .map((s) => {
              const sLabel = escapeHtml(s.label || s.title || "");
              const sUrl = escapeHtml(s.url || "#");
              const sDesc = s.description
                ? `<div class="mega-link-desc">${escapeHtml(
                    s.description
                  )}</div>`
                : "";
              return `
                <a class="mega-link" href="${sUrl}">
                  <div class="mega-link-title">${sLabel}</div>
                  ${sDesc}
                </a>
              `;
            })
            .join("") +
          "</div>";
      }

      return `
        <li class="nav-item nav-item--mega ${isActive ? "active" : ""}">
          <button class="nav-link nav-link--mega" type="button">
            <span>${label}</span>
            <i class="fa-solid fa-chevron-down mega-caret"></i>
          </button>
          ${subHtml}
        </li>
      `;
    }

    // NORMAL LINK
    const href = escapeHtml(item.url || "#");
    return `
      <li class="nav-item">
        <a class="${isActive ? "active" : ""}" href="${href}">
          ${label}
        </a>
      </li>
    `;
  }

  function renderMobileItem(item, currentSlug) {
    const label = escapeHtml(item.label || item.title || "Item");
    const isActive = isItemActive(item, currentSlug);

    // MEGA ON MOBILE = section with children links stacked
    if (item.type === "mega") {
      const subs = Array.isArray(item.subItems) ? item.subItems : [];
      let html = `
        <li class="nav-mobile-item nav-mobile-item--mega">
          <div class="nav-mobile-mega-label">${label}</div>
      `;
      subs.forEach((s) => {
        const sLabel = escapeHtml(s.label || s.title || "");
        const sUrl = escapeHtml(s.url || "#");
        const sDesc = s.description
          ? `<div class="nav-mobile-link-desc">${escapeHtml(
              s.description
            )}</div>`
          : "";
        html += `
          <a class="nav-mobile-link" href="${sUrl}">
            <div class="nav-mobile-link-title">${sLabel}</div>
            ${sDesc}
          </a>
        `;
      });
      html += "</li>";
      return html;
    }

    // NORMAL MOBILE LINK
    const href = escapeHtml(item.url || "#");
    return `
      <li>
        <a class="${isActive ? "active" : ""}" href="${href}">
          ${label}
        </a>
      </li>
    `;
  }

  function buildMenus(currentSlug) {
    const desktopUL = document.getElementById("menuList");
    const mobileUL = document.getElementById("mobileNavMenu");

    const menu = Array.isArray(site.menu) ? site.menu : [];

    if (desktopUL) {
      desktopUL.innerHTML = menu
        .filter((m) => m.showOn !== "mobile") // default: both/desktop
        .map((m) => renderDesktopItem(m, currentSlug))
        .join("");
    }
    if (mobileUL) {
      mobileUL.innerHTML = menu
        .filter((m) => m.showOn !== "desktop") // default: both/mobile
        .map((m) => renderMobileItem(m, currentSlug))
        .join("");
    }

    setupMegaInteractions();
  }

  function setupMegaInteractions() {
    const nav = document.querySelector('nav[aria-label="Main"]');
    if (!nav) return;

    const megaItems = nav.querySelectorAll(".nav-item--mega");

    megaItems.forEach((item) => {
      const button = item.querySelector(".nav-link--mega");
      const panel = item.querySelector(".mega-panel");
      if (!button || !panel) return;

      // Hover for desktop
      item.addEventListener("mouseenter", () => {
        item.classList.add("open");
      });
      item.addEventListener("mouseleave", () => {
        item.classList.remove("open");
      });

      // Click toggle for tap / keyboard
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains("open");
        // close others
        megaItems.forEach((other) => other.classList.remove("open"));
        if (!isOpen) {
          item.classList.add("open");
        }
      });
    });

    // Close mega if click outside
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target)) {
        megaItems.forEach((item) => item.classList.remove("open"));
      }
    });
  }

  /* =========================
     HERO
  ========================== */
  function renderHero(page) {
    const heroSection = document.querySelector("section.hero[data-hero]");
    if (!heroSection) return;

    const h = (page && page.hero) || {};
    const overlayTitle = h.overlay || page?.title || "Honest News";
    const sub = h.sub || "Biblical Truth · Podcast · Resources";

    const heroInner = heroSection.querySelector(".hero-inner");
    if (!heroInner) return;

    const eyebrowEl = heroInner.querySelector(".hero-eyebrow");
    const h1 = heroInner.querySelector("h1");
    const p = heroInner.querySelector("p");

    if (eyebrowEl) {
      eyebrowEl.textContent = "Honest News";
    }
    if (h1) {
      h1.textContent = overlayTitle;
    }
    if (p) {
      p.textContent = sub;
    }

    // Background
    if (h.bg) {
      heroSection.style.backgroundImage = `url("${h.bg}")`;
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
    } else {
      heroSection.style.backgroundImage =
        "radial-gradient(circle at top,#1f2937,#020617)";
    }

    // Height (size)
    let height = "70vh";
    const size = h.size || "full";
    if (size === "small") height = "40vh";
    else if (size === "medium") height = "60vh";
    else if (size === "large") height = "80vh";
    else if (size === "full") height = "100vh";
    else if (size === "custom" && h.customHeight) {
      height = h.customHeight;
    }
    heroSection.style.minHeight = height;

    // Transparent header toggle
    const header = document.querySelector("header.site-header");
    if (header) {
      if (h.transparentMenu) {
        header.classList.add("header--transparent");
      } else {
        header.classList.remove("header--transparent");
      }
    }

    // HERO MOTION (parallax / float)
    const behavior = h.behavior || "still";
    window.addEventListener("scroll", () => {
      const y = window.scrollY || 0;

      if (behavior === "parallax-slow") {
        heroSection.style.backgroundPositionY = `${y * -0.15}px`;
      } else if (behavior === "parallax-medium") {
        heroSection.style.backgroundPositionY = `${y * -0.3}px`;
      } else if (behavior === "float-up") {
        heroInner.style.transform = `translate3d(0, ${y * -0.08}px, 0)`;
      } else {
        heroSection.style.backgroundPositionY = "";
        heroInner.style.transform = "";
      }
    });
  }

  /* =========================
     BLOCKS (content sections)
  ========================== */
  function renderBlocks(page) {
    const container = document.querySelector("[data-blocks-target]");
    if (!container) return;

    const blocks = (page && Array.isArray(page.blocks) && page.blocks) || [];
    let html = "";

    blocks.forEach((b) => {
      const motion = b.motion || "fade";

      if (b.type === "heading") {
        html += `
          <section class="block block-heading block-motion-${motion}">
            <h2>${escapeHtml(b.content || "")}</h2>
          </section>
        `;
      } else if (b.type === "paragraph") {
        const text = (b.content || "").replace(/\n/g, "<br>");
        html += `
          <section class="block block-paragraph block-motion-${motion}">
            <p>${text}</p>
          </section>
        `;
      } else if (b.type === "image" && b.content) {
        html += `
          <section class="block block-image block-motion-${motion}">
            <img src="${escapeHtml(
              b.content
            )}" alt="" style="max-width:100%;border-radius:16px;display:block;margin:0 auto;">
          </section>
        `;
      } else if (b.type === "button") {
        html += `
          <section class="block block-button block-motion-${motion}">
            <a href="${escapeHtml(b.url || "#")}"
               class="hn-btn-primary">
              ${escapeHtml(b.text || "Learn more")}
            </a>
          </section>
        `;
      } else if (b.type === "product") {
        html += `
          <section class="block block-product block-motion-${motion}">
            <div class="product-card">
              ${
                b.image
                  ? `<img src="${escapeHtml(
                      b.image
                    )}" alt="" class="product-card-image">`
                  : ""
              }
              <div class="product-card-body">
                <h3 class="product-card-title">${escapeHtml(
                  b.title || ""
                )}</h3>
                <p class="product-card-text">${escapeHtml(b.text || "")}</p>
                ${
                  b.url
                    ? `<a class="product-card-link" href="${escapeHtml(
                        b.url
                      )}" target="_blank" rel="noopener noreferrer">
                         Buy on Amazon
                       </a>`
                    : ""
                }
              </div>
            </div>
          </section>
        `;
      } else if (b.type === "podcast" && b.embed) {
        html += `
          <section class="block block-podcast block-motion-${motion}">
            ${
              b.title
                ? `<h3 class="block-podcast-title">${escapeHtml(
                    b.title
                  )}</h3>`
                : ""
            }
            <iframe src="${escapeHtml(
              b.embed
            )}" style="width:100%;height:150px;border:none;border-radius:12px;background:#0f172a;" allow="autoplay"></iframe>
          </section>
        `;
      } else if (b.type === "youtube" && b.videoId) {
        let id = b.videoId.trim();
        const m = id.match(/v=([^&]+)/);
        if (m) id = m[1];
        html += `
          <section class="block block-youtube block-motion-${motion}">
            ${
              b.title
                ? `<h3 class="block-youtube-title">${escapeHtml(
                    b.title
                  )}</h3>`
                : ""
            }
            <div class="youtube-frame">
              <iframe src="https://www.youtube.com/embed/${escapeHtml(
                id
              )}" allowfullscreen frameborder="0"></iframe>
            </div>
          </section>
        `;
      }
    });

    container.innerHTML = html;
  }

  /* =========================
     INIT
  ========================== */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadSiteData();
    const slug = getCurrentSlug();
    const pages = Array.isArray(site.pages) ? site.pages : [];
    const currentPage =
      pages.find((p) => p.slug === slug) || pages[0] || null;

    applyTheme(currentPage);
    buildMenus(slug);
    renderHero(currentPage);
    renderBlocks(currentPage);
  });
})();









/* assets/js/live.js
   Honest News – Live runtime
   - Loads site-data.json
   - Builds navigation into:
       #menuList (desktop)
       #mobileNavMenu (mobile)
   - Applies hero (title, subtitle, background, height)
   - Renders blocks for the current page

   This file is "frozen" to MENU + HERO + BLOCKS.
   Mobile slide-out behavior stays in assets/js/mobile/mobile.js.
*/
(function () {
  "use strict";

  const SITE_DATA_URL = "site-data.json";

  const HN = {
    site: null,
    currentPage: null
  };
  window.HN = HN; // exposed for debugging if needed

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      const site = await loadSiteData();
      HN.site = site;
      HN.currentPage = getCurrentPage(site);

      buildMenu(site.menu || []);
      applyTheme(HN.currentPage);
      applyHero(HN.currentPage);
      renderBlocks(HN.currentPage);
    } catch (err) {
      console.error("HN live.js init error:", err);
    }
  }

  /* ============================
     LOAD site-data.json
  ============================ */
  async function loadSiteData() {
    const url = SITE_DATA_URL + "?_=" + Date.now(); // avoid cache while editing
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.warn("Could not load site-data.json, status:", res.status);
        return fallbackSite();
      }
      const json = await res.json();
      if (!json || typeof json !== "object") {
        console.warn("site-data.json not an object, using fallback");
        return fallbackSite();
      }
      return json;
    } catch (e) {
      console.warn("Failed to fetch site-data.json, using fallback", e);
      return fallbackSite();
    }
  }

  function fallbackSite() {
    return {
      menu: [
        {
          id: "home",
          label: "Home",
          url: "index.html",
          type: "link",
          showOn: "both",
          subItems: []
        }
      ],
      pages: [
        {
          title: "Home",
          slug: "home",
          theme: "dark",
          hero: {
            bg: "",
            overlay: "Honest News. Biblical Truth.",
            sub: "Fallback hero text from live.js",
            transparentMenu: false,
            behavior: "still",
            size: "full",
            customHeight: ""
          },
          blocks: []
        }
      ]
    };
  }

  /* ============================
     PAGE DETECTION
  ============================ */
  function getCurrentPage(site) {
    const pages = site.pages || [];
    if (!pages.length) return null;

    const body = document.body || document.querySelector("body");
    const slugAttr =
      body && body.dataset && body.dataset.page ? body.dataset.page : null;

    if (!slugAttr) return pages[0];

    const slug = String(slugAttr).toLowerCase();
    const found = pages.find(
      (p) => String(p.slug || "").toLowerCase() === slug
    );
    return found || pages[0];
  }

  /* ============================
     MENU (DESKTOP + MOBILE)
     - Desktop: #menuList
     - Mobile:  #mobileNavMenu
  ============================ */
  function buildMenu(menuItems) {
    const desktopUl = document.getElementById("menuList");
    const mobileUl = document.getElementById("mobileNavMenu");

    if (desktopUl) desktopUl.innerHTML = "";
    if (mobileUl) mobileUl.innerHTML = "";

    if (!Array.isArray(menuItems)) return;

    menuItems.forEach((item) => {
      if (!item) return;

      const showOn = item.showOn || "both";
      const label = item.label || item.title || "Item";
      const url = item.url || "#";
      const active = isNavItemActive(item);

      const showDesktop = showOn === "both" || showOn === "desktop";
      const showMobile = showOn === "both" || showOn === "mobile";

      if (desktopUl && showDesktop) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.textContent = label;
        if (active) a.classList.add("active");
        li.appendChild(a);
        desktopUl.appendChild(li);
      }

      if (mobileUl && showMobile) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.textContent = label;
        if (active) a.classList.add("active");
        li.appendChild(a);
        mobileUl.appendChild(li);
      }
    });
  }

  function isNavItemActive(item) {
    const page = HN.currentPage;
    if (!page || !item) return false;

    const slug = String(page.slug || "").toLowerCase();
    if (!slug) return false;

    const id = item.id ? String(item.id).toLowerCase() : "";
    const url = item.url ? String(item.url).toLowerCase() : "";

    // Match by id first (cleanest)
    if (id && id === slug) return true;

    // Home special-case
    if (slug === "home") {
      if (
        url === "index.html" ||
        url === "/" ||
        url === "./" ||
        url === "" ||
        url === "home.html"
      ) {
        return true;
      }
    }

    // Fallback: slug contained in URL
    if (url && url.indexOf(slug) !== -1) return true;

    return false;
  }

  /* ============================
     THEME (light / dark)
  ============================ */
  function applyTheme(page) {
    if (!page) return;
    const body = document.body || document.querySelector("body");
    if (!body) return;

    const theme = page.theme || "dark";
    body.classList.remove("theme-light", "theme-dark");
    if (theme === "light") {
      body.classList.add("theme-light");
    } else {
      body.classList.add("theme-dark");
    }
  }

  /* ============================
     HERO
     - Uses: [data-hero]
     - Reads: page.hero.{bg,overlay,sub,transparentMenu,size,customHeight}
  ============================ */
  function applyHero(page) {
    const heroSection = document.querySelector("[data-hero]");
    if (!heroSection) return;

    const header = document.querySelector("header.site-header");
    const h1 = heroSection.querySelector(".hero-inner h1");
    const p = heroSection.querySelector(".hero-inner p");
    const eyebrow = heroSection.querySelector(".hero-eyebrow");

    const hero = page && page.hero ? page.hero : {};

    // Eyebrow: use page title if available
    if (eyebrow && page && page.title) {
      eyebrow.textContent = page.title;
    }

    // Title + subtitle
    if (h1 && hero.overlay) {
      h1.textContent = hero.overlay;
    }
    if (p && hero.sub) {
      p.textContent = hero.sub;
    }

    // Background image (if provided)
    if (hero.bg) {
      heroSection.style.backgroundImage =
        'url("' + String(hero.bg).replace(/"/g, '\\"') + '")';
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
    }

    // Height (size)
    let height;
    const size = hero.size || "full";
    if (size === "small") height = "40vh";
    else if (size === "medium") height = "60vh";
    else if (size === "large") height = "80vh";
    else if (size === "custom" && hero.customHeight) {
      height = hero.customHeight;
    } else {
      height = "70vh";
    }
    heroSection.style.minHeight = height;

    // Transparent header toggle
    if (header) {
      if (hero.transparentMenu) {
        header.classList.add("header--transparent");
      } else {
        header.classList.remove("header--transparent");
      }
    }
  }

  /* ============================
     BLOCKS
     - Uses: [data-blocks-target]
     - Renders blocks from page.blocks[]
  ============================ */
  function renderBlocks(page) {
    const target = document.querySelector("[data-blocks-target]");
    if (!target) return;

    const blocks = page && Array.isArray(page.blocks) ? page.blocks : [];
    if (!blocks.length) {
      target.innerHTML = "";
      return;
    }

    let html = "";

    blocks.forEach((b) => {
      if (!b || !b.type) return;

      if (b.type === "heading") {
        html +=
          '<div class="block block-heading"><h2>' +
          escapeHtml(b.content || "") +
          "</h2></div>";
      } else if (b.type === "paragraph") {
        const text = (b.content || "").replace(/\n/g, "<br>");
        html +=
          '<div class="block block-paragraph"><p>' + text + "</p></div>";
      } else if (b.type === "image" && b.content) {
        html +=
          '<div class="block block-image"><img src="' +
          escapeHtml(b.content) +
          '" alt="" style="max-width:100%;border-radius:12px;"></div>';
      } else if (b.type === "button") {
        html +=
          '<div class="block block-button">' +
          '<a href="' +
          escapeHtml(b.url || "#") +
          '" style="display:inline-block;margin-top:.6rem;padding:.6rem 1.6rem;border-radius:999px;background:#22c55e;color:#022c22;text-decoration:none;font-weight:600;font-size:.9rem;">' +
          escapeHtml(b.text || "Learn more") +
          "</a>" +
          "</div>";
      } else if (b.type === "product") {
        html +=
          '<div class="block block-product" style="background:#020617;border-radius:14px;margin:0.8rem 0;padding:0.9rem;display:flex;gap:0.9rem;align-items:flex-start;border:1px solid rgba(55,65,81,.9);">' +
          (b.image
            ? '<img src="' +
              escapeHtml(b.image) +
              '" alt="" style="width:110px;border-radius:10px;object-fit:cover;">'
            : "") +
          "<div>" +
          '<h3 style="margin:0 0 .3rem;font-size:.96rem;color:#e5e7eb;">' +
          escapeHtml(b.title || "") +
          "</h3>" +
          '<p style="margin:0 0 .5rem;font-size:.8rem;color:#9ca3af;">' +
          escapeHtml(b.text || "") +
          "</p>" +
          (b.url
            ? '<a href="' +
              escapeHtml(b.url) +
              '" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:0.2rem;padding:0.45rem 1.4rem;border-radius:999px;background:#22c55e;color:#022c22;font-size:.8rem;font-weight:600;text-decoration:none;">Buy on Amazon</a>'
            : "") +
          "</div>" +
          "</div>";
      } else if (b.type === "podcast" && b.embed) {
        const raw = String(b.embed).trim();
        const looksLikeIframe = raw.startsWith("<");
        if (!looksLikeIframe) {
          // treat embed as src URL
          html +=
            '<div class="block block-podcast" style="margin:1.2rem 0;">' +
            '<h3 style="margin:0 0 .3rem;color:#e5e7eb;">' +
            escapeHtml(b.title || "") +
            "</h3>" +
            '<iframe src="' +
            escapeHtml(raw) +
            '" style="width:100%;height:150px;border:none;border-radius:10px;background:#0f172a;" allow="autoplay"></iframe>' +
            "</div>";
        } else {
          // user pasted full iframe, just drop it in
          html +=
            '<div class="block block-podcast" style="margin:1.2rem 0;">' +
            '<h3 style="margin:0 0 .3rem;color:#e5e7eb;">' +
            escapeHtml(b.title || "") +
            "</h3>" +
            raw +
            "</div>";
        }
      } else if (b.type === "youtube" && b.videoId) {
        let id = String(b.videoId).trim();
        const m = id.match(/v=([^&]+)/);
        if (m) id = m[1];
        html +=
          '<div class="block block-youtube" style="margin:1.2rem 0;">' +
          '<h3 style="margin:0 0 .3rem;color:#e5e7eb;">' +
          escapeHtml(b.title || "") +
          "</h3>" +
          '<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden;">' +
          '<iframe src="https://www.youtube.com/embed/' +
          escapeHtml(id) +
          '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>' +
          "</div>" +
          "</div>";
      }
    });

    target.innerHTML = html;
  }

  /* ============================
     UTIL
  ============================ */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();







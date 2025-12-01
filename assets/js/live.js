// assets/js/live.js
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const slug = body.getAttribute("data-page") || "home";

  // Flexible hero + header selection
  const hero =
    document.querySelector(".hero") ||
    document.querySelector(".hero-carousel") ||
    document.querySelector("[data-hero]");

  const header =
    document.querySelector("header.site-header") ||
    document.querySelector("header.hn-header") ||
    document.querySelector("header");

  // Where to render dynamic blocks on the page
  const blocksTarget = document.querySelector("[data-blocks-target]");

  /* =============================================================
     HYBRID LOADER — ALWAYS GET MOST RECENT site-data.json
     1) RAW GitHub (always fresh)
     2) Fallback: Local GitHub Pages copy
  ============================================================= */
  async function loadSiteData() {
    const RAW =
      "https://raw.githubusercontent.com/rrsales/Honest-News/main/site-data.json?cb=" +
      Date.now();
    const LOCAL = "site-data.json?cb=" + Date.now();

    // Attempt LIVE GitHub
    try {
      const r = await fetch(RAW, { cache: "no-store" });
      if (r.ok) {
        console.log(
          "%cLoaded site-data.json from RAW GitHub (fresh)",
          "color:#22c55e"
        );
        return await r.json();
      } else {
        console.warn("RAW GitHub responded", r.status);
      }
    } catch (e) {
      console.warn("RAW GitHub failed → fallback to local", e);
    }

    // Fallback to GitHub Pages copy
    const r2 = await fetch(LOCAL, { cache: "no-store" });
    if (!r2.ok) {
      throw new Error("Could not load site-data.json from RAW or LOCAL");
    }
    console.log(
      "%cLoaded site-data.json from GitHub Pages copy",
      "color:#38bdf8"
    );
    return await r2.json();
  }

  /* =============================================================
     Fetch + render site data
  ============================================================= */
  loadSiteData()
    .then((site) => {
      if (!site || !site.pages || !Array.isArray(site.pages)) {
        console.warn("site-data.json missing pages array");
        return;
      }

      // pick page by slug (data-page on <body>)
      let page = site.pages.find((p) => p.slug === slug);
      if (!page) page = site.pages[0];

      const headerConfig = site.header || {
        style: "apple",       // default style
        mobileMenu: "slide-left"
      };

      applyTheme(page);
      applyHeaderStyle(header, headerConfig);
      buildMenu(site.menu || [], slug);
      applyHero(hero, header, page.hero || {});
      if (blocksTarget) renderBlocks(blocksTarget, page.blocks || []);
    })
    .catch((err) => {
      console.error("live.js error while loading site-data:", err);
    });

  /* =============================================================
     THEME
  ============================================================= */
  function applyTheme(page) {
    body.classList.remove("theme-light", "theme-dark");
    if (page.theme === "light") body.classList.add("theme-light");
    else body.classList.add("theme-dark");
  }

  /* =============================================================
     HEADER STYLE ENGINE
     style = apple | webflow | podbean | minimal | floating
  ============================================================= */
  function applyHeaderStyle(headerEl, headerConfig) {
    if (!headerEl) return;

    const style = (headerConfig && headerConfig.style) || "apple";

    headerEl.classList.add("hn-header");
    headerEl.classList.remove(
      "hn-header--apple",
      "hn-header--webflow",
      "hn-header--podbean",
      "hn-header--minimal",
      "hn-header--floating"
    );

    headerEl.classList.add("hn-header--" + style);

    // store for mobile.js to read if needed
    document.body.dataset.mobileMenuStyle =
      (headerConfig && headerConfig.mobileMenu) || "slide-left";

    // Scroll shadow effect for .site-header
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        headerEl.classList.add("scrolled");
      } else {
        headerEl.classList.remove("scrolled");
      }
    });
  }

  /* =============================================================
     MENU BUILDER (desktop + mobile)
  ============================================================= */
  function buildMenu(items, currentSlug) {
    const desktopMenu =
      document.getElementById("nav-menu") ||
      document.getElementById("menuList");
    const mobileMenu = document.getElementById("mobileNavMenu");

    if (!desktopMenu && !mobileMenu) return;

    const currentFile = location.pathname.split("/").pop() || "index.html";

    const html = items
      .map((item) => {
        const label = item.label || item.title || "Item";
        const url = item.url || "#";

        const isHomeSlug = currentSlug === "home";
        const isHomeFile =
          url === "index.html" &&
          (currentFile === "" || currentFile === "index.html");
        const isActive =
          currentFile === url || (isHomeSlug && isHomeFile);

        return `
          <li>
            <a href="${url}" class="${isActive ? "active" : ""}">
              ${label}
            </a>
          </li>
        `;
      })
      .join("");

    if (desktopMenu) desktopMenu.innerHTML = html;
    if (mobileMenu) mobileMenu.innerHTML = html;
  }

  /* =============================================================
     HERO SETUP
  ============================================================= */
  function applyHero(heroEl, headerEl, h) {
    if (!heroEl) return;

    // Background image
    if (h.bg) {
      heroEl.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url('${h.bg}')`;
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
      heroEl.style.backgroundAttachment = "fixed";
    }

    // Height behavior
    let height = "100vh";
    switch (h.size) {
      case "small":
        height = "40vh";
        break;
      case "medium":
        height = "60vh";
        break;
      case "large":
        height = "80vh";
        break;
      case "full":
        height = "100vh";
        break;
      case "custom":
        height = h.customHeight || "100vh";
        break;
      default:
        height = "100vh";
    }
    heroEl.style.height = height;

    // Text content (live override)
    const title = heroEl.querySelector("h1");
    const sub = heroEl.querySelector("p");

    if (title && h.overlay) title.textContent = h.overlay;
    if (sub && typeof h.sub === "string") sub.textContent = h.sub;

    // Transparent header handling
    if (headerEl) {
      if (h.transparentMenu) {
        headerEl.classList.add("hn-header--transparent");
        document.body.classList.add("has-transparent-header");
        document.body.classList.remove("has-solid-header");
        heroEl.style.marginTop = "0";
      } else {
        headerEl.classList.remove("hn-header--transparent");
        document.body.classList.remove("has-transparent-header");
        document.body.classList.add("has-solid-header");
        heroEl.style.marginTop = "var(--hn-header-offset, 72px)";
      }
    }

    // Behavior animations
    if (h.behavior === "parallax-medium" || h.behavior === "parallax-slow") {
      const rate = h.behavior === "parallax-slow" ? 0.15 : 0.3;
      window.addEventListener("scroll", () => {
        const offset = window.scrollY * rate * -1;
        heroEl.style.transform = `translateY(${offset}px)`;
      });
    } else if (h.behavior === "float-up") {
      heroEl.style.transition =
        "transform 1.1s ease-out, opacity 1.1s ease-out";
      heroEl.style.transform = "translateY(40px)";
      heroEl.style.opacity = "0";
      requestAnimationFrame(() => {
        setTimeout(() => {
          heroEl.style.transform = "translateY(0)";
          heroEl.style.opacity = "1";
        }, 60);
      });
    } else {
      heroEl.style.transform = "none";
    }
  }

  /* =============================================================
     BLOCK RENDERING
  ============================================================= */
  function renderBlocks(target, blocks) {
    if (!blocks || !blocks.length) {
      target.innerHTML = "";
      return;
    }

    let html = "";
    blocks.forEach((b) => {
      if (b.type === "heading") {
        html += `
          <section class="block block-heading">
            <h2>${escapeHtml(b.content || "")}</h2>
          </section>`;
      } else if (b.type === "paragraph") {
        const text = (b.content || "").replace(/\n/g, "<br>");
        html += `
          <section class="block block-paragraph">
            <p>${text}</p>
          </section>`;
      } else if (b.type === "image" && b.content) {
        html += `
          <section class="block block-image">
            <img src="${escapeHtml(b.content)}" alt="" />
          </section>`;
      } else if (b.type === "button") {
        html += `
          <section class="block block-button">
            <a href="${escapeHtml(b.url || "#")}" class="btn-block">
              ${escapeHtml(b.text || "Learn more")}
            </a>
          </section>`;
      } else if (b.type === "product") {
        html += `
          <section class="block block-product">
            <div class="product-card">
              ${b.image ? `<img src="${escapeHtml(b.image)}" class="product-image" />` : ""}
              <div class="product-info">
                <h3>${escapeHtml(b.title || "")}</h3>
                <p>${escapeHtml(b.text || "")}</p>
                ${
                  b.url
                    ? `<a href="${escapeHtml(
                        b.url
                      )}" target="_blank" rel="noopener noreferrer" class="product-btn">
                         Buy on Amazon
                       </a>`
                    : ""
                }
              </div>
            </div>
          </section>`;
      } else if (b.type === "podcast" && b.embed) {
        html += `
          <section class="block block-podcast">
            <h3>${escapeHtml(b.title || "")}</h3>
            <iframe src="${escapeHtml(
              b.embed
            )}" allow="autoplay" loading="lazy"></iframe>
          </section>`;
      } else if (b.type === "youtube" && b.videoId) {
        let id = b.videoId.trim();
        const m = id.match(/v=([^&]+)/);
        if (m) id = m[1];

        html += `
          <section class="block block-youtube">
            <h3>${escapeHtml(b.title || "")}</h3>
            <div class="video-wrap">
              <iframe src="https://www.youtube.com/embed/${escapeHtml(
                id
              )}" allowfullscreen loading="lazy"></iframe>
            </div>
          </section>`;
      }
    });

    target.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});




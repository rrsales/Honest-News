// assets/js/live.js
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const slug = body.getAttribute("data-page") || "home";

  const hero =
    document.querySelector(".hero") ||
    document.querySelector(".hero-carousel") ||
    document.querySelector("[data-hero]");

  const header = document.querySelector("header");
  const mainEl = document.querySelector("main, [data-main]");

  const blocksTarget = document.querySelector("[data-blocks-target]");

  async function loadSiteData() {
    const RAW =
      "https://raw.githubusercontent.com/rrsales/Honest-News/main/site-data.json?cb=" +
      Date.now();
    const LOCAL = "site-data.json?cb=" + Date.now();

    try {
      const r = await fetch(RAW, { cache: "no-store" });
      if (r.ok) {
        console.log("%cRAW GitHub loaded", "color:#22c55e");
        return await r.json();
      }
    } catch (e) {
      console.warn("RAW GitHub fallback", e);
    }

    const r2 = await fetch(LOCAL, { cache: "no-store" });
    console.log("%cLocal GitHub Pages loaded", "color:#38bdf8");
    return await r2.json();
  }

  loadSiteData().then((site) => {
    if (!site || !site.pages) return;

    let page = site.pages.find((p) => p.slug === slug);
    if (!page) page = site.pages[0];

    applyTheme(body, page);
    buildMenu(site.menu || [], slug);
    applyHero(hero, header, mainEl, page.hero || {});
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
     MENU BUILDER
  ============================================================= */
  function buildMenu(items, currentSlug) {
    const menuList =
      document.getElementById("menuList") ||
      document.getElementById("nav-menu");

    if (!menuList) return;

    const currentFile = location.pathname.split("/").pop() || "index.html";

    menuList.innerHTML = items
      .map((item) => {
        const isHomeSlug = currentSlug === "home";
        const isHomeFile =
          item.url === "index.html" &&
          (currentFile === "" || currentFile === "index.html");
        const isActive =
          currentFile === item.url || (isHomeSlug && isHomeFile);

        return `
          <li>
            <a href="${item.url}" class="${isActive ? "active" : ""}">
              ${item.label || item.title}
            </a>
          </li>
        `;
      })
      .join("");
  }

  /* =============================================================
     HERO + HEADER TRANSPARENCY
  ============================================================= */
  function applyHero(heroEl, headerEl, mainEl, h) {
    if (!heroEl) return;

    // Background
    if (h.bg) {
      heroEl.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url('${h.bg}')`;
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
      heroEl.style.backgroundAttachment = "fixed";
    }

    // Force hero to top if FULL + TRANSPARENT
    if (headerEl && mainEl) {
      if (h.transparentMenu) {
        headerEl.classList.add("header--transparent");

        if (h.size === "full") {
          // HERO MUST TOUCH TOP
          mainEl.style.marginTop = "0px";
          heroEl.style.marginTop = "0px";
        } else {
          // Apply ONLY minimal spacing
          mainEl.style.marginTop = "0px";
        }
      } else {
        headerEl.classList.remove("header--transparent");
        mainEl.style.marginTop = "72px"; // default header height
      }
    }

    // Height
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
    }
    heroEl.style.height = height;

    // Text
    const title = heroEl.querySelector("h1");
    const sub = heroEl.querySelector("p");

    if (title && h.overlay) title.textContent = h.overlay;
    if (sub) sub.textContent = h.sub || "";

    // Hero motion
    heroEl.style.transform = "none";

    if (h.behavior === "parallax-medium" || h.behavior === "parallax-slow") {
      const rate = h.behavior === "parallax-slow" ? 0.15 : 0.3;
      window.addEventListener("scroll", () => {
        heroEl.style.transform = `translateY(${window.scrollY * rate * -1}px)`;
      });
    }

    if (h.behavior === "float-up") {
      heroEl.style.opacity = "0";
      heroEl.style.transform = "translateY(40px)";
      heroEl.style.transition = "transform 1s ease-out, opacity 1s ease-out";

      requestAnimationFrame(() => {
        heroEl.style.opacity = "1";
        heroEl.style.transform = "translateY(0)";
      });
    }
  }

  /* =============================================================
     BLOCKS
  ============================================================= */
  function renderBlocks(target, blocks) {
    if (!blocks.length) {
      target.innerHTML = "";
      return;
    }

    let html = "";

    blocks.forEach((b) => {
      if (b.type === "heading")
        html += `<section class="block"><h2>${escapeHtml(
          b.content
        )}</h2></section>`;

      else if (b.type === "paragraph")
        html += `<section class="block"><p>${escapeHtml(b.content)
          .replace(/\n/g, "<br>")}</p></section>`;

      else if (b.type === "image")
        html += `<section class="block block-image">
            <img src="${escapeHtml(b.content)}" alt="">
          </section>`;

      else if (b.type === "button")
        html += `<section class="block block-button">
            <a href="${escapeHtml(b.url)}" class="btn-block">${escapeHtml(
          b.text
        )}</a>
          </section>`;

      else if (b.type === "product")
        html += `<section class="block block-product">
            <div class="product-card">
              ${
                b.image
                  ? `<img src="${escapeHtml(
                      b.image
                    )}" class="product-image" alt="">`
                  : ""
              }
              <div>
                <h3>${escapeHtml(b.title)}</h3>
                <p>${escapeHtml(b.text)}</p>
                ${
                  b.url
                    ? `<a href="${escapeHtml(
                        b.url
                      )}" class="product-btn" target="_blank">Buy on Amazon</a>`
                    : ""
                }
              </div>
            </div>
          </section>`;

      else if (b.type === "podcast")
        html += `<section class="block block-podcast">
            <h3>${escapeHtml(b.title)}</h3>
            <iframe src="${escapeHtml(b.embed)}"></iframe>
          </section>`;

      else if (b.type === "youtube") {
        let id = b.videoId;
        const match = id.match(/v=([^&]+)/);
        if (match) id = match[1];

        html += `<section class="block block-youtube">
            <h3>${escapeHtml(b.title)}</h3>
            <div class="video-wrap">
              <iframe src="https://www.youtube.com/embed/${escapeHtml(
                id
              )}" allowfullscreen></iframe>
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

// assets/js/live.js
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const slug = body.getAttribute("data-page") || "home";

  // Try to find the hero and header in a flexible way
  const hero =
    document.querySelector(".hero") ||
    document.querySelector(".hero-carousel") ||
    document.querySelector("[data-hero]");

  const header = document.querySelector("header");

  // Where to render dynamic blocks (optional)
  const blocksTarget = document.querySelector("[data-blocks-target]");

  fetch("site-data.json", { cache: "no-store" })
    .then(r => r.json())
    .then(site => {
      if (!site || !site.pages) return;

      // Pick page by slug (fallback = first page)
      let page = site.pages.find(p => p.slug === slug);
      if (!page) page = site.pages[0];

      // THEME (light / dark)
      applyTheme(body, page);

      // MENU
      buildMenu(site.menu || [], slug);

      // HERO
      applyHero(hero, header, page.hero || {});

      // BLOCKS
      if (blocksTarget) {
        renderBlocks(blocksTarget, page.blocks || []);
      }
    })
    .catch(err => {
      console.log("live.js error:", err);
    });

  /* =======================
     THEME
  ======================== */
  function applyTheme(body, page) {
    body.classList.remove("theme-light", "theme-dark");
    if (page.theme === "light") {
      body.classList.add("theme-light");
    } else {
      body.classList.add("theme-dark");
    }
  }

  /* =======================
     MENU
  ======================== */
  function buildMenu(items, currentSlug) {
    // Support both: <ul id="menuList"> and <ul id="nav-menu">
    const menuList =
      document.getElementById("menuList") ||
      document.getElementById("nav-menu");

    if (!menuList) return;

    const currentFile = location.pathname.split("/").pop() || "index.html";

    menuList.innerHTML = items
      .map(item => {
        const isHomeSlug = currentSlug === "home";
        const isHomeFile =
          item.url === "index.html" && (currentFile === "" || currentFile === "index.html");

        const isActive =
          currentFile === item.url || (isHomeSlug && isHomeFile);

        return `
          <li>
            <a href="${item.url}" class="${isActive ? "active" : ""}">
              ${item.title}
            </a>
          </li>
        `;
      })
      .join("");
  }

  /* =======================
     HERO
  ======================== */
  function applyHero(heroEl, headerEl, h) {
    if (!heroEl) return;

    // Background
    if (h.bg) {
      heroEl.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url('${h.bg}')`;
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
      heroEl.style.backgroundAttachment = "fixed";
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
      default:
        height = "100vh";
    }
    heroEl.style.height = height;

    // Text
    const title = heroEl.querySelector("h1");
    const sub = heroEl.querySelector("p");

    if (title && h.overlay) title.textContent = h.overlay;
    if (sub && typeof h.sub === "string") sub.textContent = h.sub;

    // Header transparency
    if (headerEl) {
      if (h.transparentMenu) {
        headerEl.classList.add("header--transparent");
      } else {
        headerEl.classList.remove("header--transparent");
      }
    }

    // Parallax / float / still
    if (h.behavior === "parallax-medium" || h.behavior === "parallax-slow") {
      const rate = h.behavior === "parallax-slow" ? 0.15 : 0.3;
      window.addEventListener("scroll", () => {
        const offset = window.scrollY * rate * -1;
        heroEl.style.transform = `translateY(${offset}px)`;
      });
    } else if (h.behavior === "float-up") {
      heroEl.style.transition = "transform 1.1s ease-out, opacity 1.1s ease-out";
      heroEl.style.transform = "translateY(40px)";
      heroEl.style.opacity = "0";
      requestAnimationFrame(() => {
        setTimeout(() => {
          heroEl.style.transform = "translateY(0)";
          heroEl.style.opacity = "1";
        }, 60);
      });
    } else {
      // still
      heroEl.style.transform = "none";
    }
  }

  /* =======================
     BLOCK RENDERING
  ======================== */
  function renderBlocks(target, blocks) {
    if (!blocks || !blocks.length) {
      target.innerHTML = "";
      return;
    }

    let html = "";
    blocks.forEach(b => {
      if (b.type === "heading") {
        html += `
          <section class="block block-heading">
            <h2>${escapeHtml(b.content || "")}</h2>
          </section>
        `;
      } else if (b.type === "paragraph") {
        const text = (b.content || "").replace(/\n/g, "<br>");
        html += `
          <section class="block block-paragraph">
            <p>${text}</p>
          </section>
        `;
      } else if (b.type === "image" && b.content) {
        html += `
          <section class="block block-image">
            <img src="${escapeHtml(b.content)}" alt="" />
          </section>
        `;
      } else if (b.type === "button") {
        html += `
          <section class="block block-button">
            <a href="${escapeHtml(b.url || "#")}" class="btn-block">
              ${escapeHtml(b.text || "Learn more")}
            </a>
          </section>
        `;
      } else if (b.type === "product") {
        html += `
          <section class="block block-product">
            <div class="product-card">
              ${b.image ? `<img src="${escapeHtml(b.image)}" alt="" class="product-image" />` : ""}
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
          </section>
        `;
      } else if (b.type === "podcast" && b.embed) {
        html += `
          <section class="block block-podcast">
            <h3>${escapeHtml(b.title || "")}</h3>
            <iframe src="${escapeHtml(
              b.embed
            )}" allow="autoplay" loading="lazy"></iframe>
          </section>
        `;
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
          </section>
        `;
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



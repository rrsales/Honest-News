// Page library – hero + blocks from JSON
window.HN = window.HN || {};

(function (HN) {
  function applyHero(page) {
    const heroEl = document.querySelector("[data-hero]");
    if (!heroEl || !page.hero) return;

    const { eyebrow, title, subtitle, style, transparentHeader, backgroundImage } = page.hero;

    // Background image
    if (backgroundImage) {
      heroEl.style.backgroundImage = `url('${backgroundImage}')`;
    }

    // Basic Apple-style vs simple toggle via classes
    heroEl.classList.toggle("hero--apple", style === "apple");
    heroEl.classList.toggle("hero--simple", style !== "apple");

    const eyebrowEl = heroEl.querySelector(".hero-eyebrow");
    const h1 = heroEl.querySelector("h1");
    const p = heroEl.querySelector("p");

    if (eyebrowEl && eyebrow) eyebrowEl.textContent = eyebrow;
    if (h1 && title) h1.textContent = title;
    if (p && subtitle) p.textContent = subtitle;

    // Transparent header toggle (adds class the CSS can use)
    const header = document.querySelector("header.site-header");
    if (header) {
      if (transparentHeader) header.classList.add("header--transparent");
      else header.classList.remove("header--transparent");
    }
  }

  function renderTextBlock(block) {
    const section = document.createElement("section");
    section.className = "hn-block hn-block--text";

    if (block.heading) {
      const h2 = document.createElement("h2");
      h2.textContent = block.heading;
      section.appendChild(h2);
    }
    if (block.body) {
      const p = document.createElement("p");
      p.textContent = block.body;
      section.appendChild(p);
    }
    return section;
  }

  HN.renderBlocks = function (page) {
    const target = document.querySelector("[data-blocks-target]");
    if (!target) return;
    target.innerHTML = "";

    if (!page.blocks || !page.blocks.length) return;

    page.blocks.forEach((block) => {
      let el = null;
      switch (block.type) {
        case "text":
        default:
          el = renderTextBlock(block);
          break;
      }
      if (el) target.appendChild(el);
    });
  };

  HN.renderPage = function (data) {
    const pageId = HN.getCurrentPageId();
    const page = data.pages && data.pages[pageId];
    if (!page) {
      console.warn("HN.renderPage: no page in JSON for", pageId);
      return;
    }

    applyHero(page);
    HN.renderBlocks(page);
  };
})(window.HN);

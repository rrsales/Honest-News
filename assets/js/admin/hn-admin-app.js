// HN Admin App (CMS 2.0 shell)
// Wires admin library into the dashboard containers

window.HNAdmin = window.HNAdmin || {};

(function (HNAdmin) {
  async function init() {
    // Load data (from local snapshot or site-data.json)
    let data = await HNAdmin.loadSiteData();
    HNAdmin.saveLocalSnapshot(data);

    const pageListEl = document.getElementById("hn-page-list");
    const addPageBtn = document.getElementById("hn-add-page-btn");

    const currentPageLabel = document.getElementById("hn-current-page-label");
    const heroEyebrow = document.getElementById("hn-hero-eyebrow");
    const heroTitle = document.getElementById("hn-hero-title");
    const heroSubtitle = document.getElementById("hn-hero-subtitle");
    const heroStyle = document.getElementById("hn-hero-style");
    const heroTransparent = document.getElementById("hn-hero-transparent");
    const heroBg = document.getElementById("hn-hero-bg");
    const heroSaveBtn = document.getElementById("hn-hero-save-btn");

    const blocksListEl = document.getElementById("hn-blocks-list");
    const addTextBlockBtn = document.getElementById("hn-add-text-block-btn");

    const exportBtn = document.getElementById("hn-export-json-btn");
    const clearLocalBtn = document.getElementById("hn-clear-local-btn");

    let currentPageId = null;

    // --- Page list rendering ---
    function renderPageList() {
      if (!pageListEl) return;
      pageListEl.innerHTML = "";

      const ids = Object.keys(data.pages || {});
      ids.forEach((id) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = data.pages[id].title || id;
        btn.addEventListener("click", () => selectPage(id));
        li.appendChild(btn);
        pageListEl.appendChild(li);
      });
    }

    function selectPage(id) {
      currentPageId = id;
      const page = data.pages[id];
      if (!page) return;

      if (currentPageLabel) {
        currentPageLabel.textContent = page.title || id;
      }

      const hero = page.hero || {};
      if (heroEyebrow) heroEyebrow.value = hero.eyebrow || "";
      if (heroTitle) heroTitle.value = hero.title || "";
      if (heroSubtitle) heroSubtitle.value = hero.subtitle || "";
      if (heroStyle) heroStyle.value = hero.style || "simple";
      if (heroTransparent) heroTransparent.checked = !!hero.transparentHeader;
      if (heroBg) heroBg.value = hero.backgroundImage || "";

      renderBlocksList();
    }

    // --- Blocks rendering ---
    function renderBlocksList() {
      if (!blocksListEl || !currentPageId) return;
      blocksListEl.innerHTML = "";

      const page = data.pages[currentPageId];
      if (!page || !Array.isArray(page.blocks)) return;

      page.blocks.forEach((block) => {
        const li = document.createElement("li");
        li.textContent = block.id + " (" + block.type + ")";
        blocksListEl.appendChild(li);
      });
    }

    // --- Hero Save ---
    if (heroSaveBtn) {
      heroSaveBtn.addEventListener("click", () => {
        if (!currentPageId) return;

        data = HNAdmin.updateHero(data, currentPageId, {
          eyebrow: heroEyebrow ? heroEyebrow.value : "",
          title: heroTitle ? heroTitle.value : "",
          subtitle: heroSubtitle ? heroSubtitle.value : "",
          style: heroStyle ? heroStyle.value : "simple",
          transparentHeader: heroTransparent ? heroTransparent.checked : false,
          backgroundImage: heroBg ? heroBg.value : ""
        });

        HNAdmin.saveLocalSnapshot(data);
        alert("Hero updated for " + currentPageId);
      });
    }

    // --- Add Text Block ---
    if (addTextBlockBtn) {
      addTextBlockBtn.addEventListener("click", () => {
        if (!currentPageId) return;

        const id = prompt("Block ID (e.g. home-intro):");
        if (!id) return;
        const heading = prompt("Heading:");
        const body = prompt("Body text:");

        data = HNAdmin.addBlock(data, currentPageId, {
          type: "text",
          id,
          heading,
          body
        });

        HNAdmin.saveLocalSnapshot(data);
        renderBlocksList();
      });
    }

    // --- Add Page ---
    if (addPageBtn) {
      addPageBtn.addEventListener("click", () => {
        const id = prompt("Page ID (e.g. about, podcast, shop):");
        if (!id) return;
        const label = prompt("Menu Label:", id.charAt(0).toUpperCase() + id.slice(1));
        if (!label) return;

        const href = id === "home" ? "index.html" : id + ".html";

        try {
          data = HNAdmin.addPage(data, { id, label, href });
          HNAdmin.saveLocalSnapshot(data);
          renderPageList();
          alert("Page added: " + id + "\nRemember to create " + href + " using the base shell.");
        } catch (e) {
          alert(e.message);
        }
      });
    }

    // --- Export + Clear buttons ---
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        HNAdmin.exportSiteData(data);
      });
    }

    if (clearLocalBtn) {
      clearLocalBtn.addEventListener("click", () => {
        HNAdmin.clearLocalSnapshot();
        alert("Local draft cleared. Reload admin to re-sync from repo.");
      });
    }

    // Initial render
    renderPageList();
    if (data.pages && data.pages.home) {
      selectPage("home");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})(window.HNAdmin);

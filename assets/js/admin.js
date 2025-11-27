// assets/js/admin.js
document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Config & Storage
  // =========================
  const ADMIN_PASSWORD = "admin123";
  const STORAGE_KEY = "honestnews_siteData_v1";

  const defaultData = {
    pages: [
      { title: "Home", url: "index.html" },
      { title: "About", url: "about.html" },
      { title: "Blog", url: "blog.html" },
      { title: "Podcast", url: "podcast.html" },
      { title: "Products", url: "products.html" },
      { title: "Contact", url: "contact.html" }
    ],
    heroes: {},           // per-page hero settings
    menu: [],             // custom menu (fallback: pages)
    images: [],           // uploaded images (dataURL)
    settings: {
      primaryColor: "#0070f3",
      secondaryColor: "#ffffff",
      accentColor: "#0070f3",
      transparentMenu: false
    }
  };

  let siteData = loadSiteData();

  function loadSiteData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load site data, using defaults", e);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  function saveSiteData(showAlert = false) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    console.log("Site data saved", siteData);
    renderPagesList();
    renderMenuList();
    populateHeroPageSelect();
    renderImageGrid();
    if (showAlert) alert("Changes saved.");
  }

  // =========================
  // DOM References
  // =========================
  const loginPanel = document.getElementById("adminLogin");
  const adminPanel = document.getElementById("adminPanel");
  const loginBtn = document.getElementById("loginBtn");
  const loginMsg = document.getElementById("loginMsg");
  const adminPasswordInput = document.getElementById("adminPassword");

  const sidebarBtns = document.querySelectorAll(".sidebar-btn[data-tab]");
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Tabs
  const pagesTab = document.getElementById("pagesTab");
  const heroesTab = document.getElementById("heroesTab");
  const menuTab = document.getElementById("menuTab");
  const colorsTab = document.getElementById("colorsTab");
  const imagesTab = document.getElementById("imagesTab");

  // Pages tab
  const pageListDiv = document.getElementById("pageList");
  const addPageTitleInput = document.getElementById("addPageTitle");
  const addPageURLInput = document.getElementById("addPageURL");
  const addPageBtn = document.getElementById("addPageBtn");

  // Heroes tab
  const heroPageSelect = document.getElementById("heroPageSelect");
  const heroBehavior = document.getElementById("heroBehavior");
  const heroImageSettings = document.getElementById("heroImageSettings");
  const heroImageInput = document.getElementById("heroImageInput");
  const heroPreview = document.getElementById("heroPreview");
  const heroVideoSettings = document.getElementById("heroVideoSettings");
  const heroVideoInput = document.getElementById("heroVideoInput");
  const heroTransparentMenu = document.getElementById("heroTransparentMenu");
  const heroHeight = document.getElementById("heroHeight");
  const saveHeroSettingsBtn = document.getElementById("saveHeroSettings");

  // Menu tab
  const menuListDiv = document.getElementById("menuList");
  const addMenuItemBtn = document.getElementById("addMenuItemBtn");

  // Colors tab
  const primaryColorPicker = document.getElementById("primaryColorPicker");
  const secondaryColorPicker = document.getElementById("secondaryColorPicker");
  const accentColorPicker = document.getElementById("accentColorPicker");
  const enableMenuTransparency = document.getElementById("enableMenuTransparency");
  const saveColorSettingsBtn = document.getElementById("saveColorSettings");

  // Images tab
  const imageUploadInput = document.getElementById("imageUpload");
  const uploadImageBtn = document.getElementById("uploadImageBtn");
  const imageGridDiv = document.getElementById("imageGrid");

  // =========================
  // Login
  // =========================
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const pwd = adminPasswordInput.value || "";
      if (pwd === ADMIN_PASSWORD) {
        loginPanel.style.display = "none";
        adminPanel.style.display = "block";
        console.log("Admin unlocked");
        initAdmin();
      } else {
        loginMsg.textContent = "Incorrect password";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      adminPanel.style.display = "none";
      loginPanel.style.display = "flex";
      adminPasswordInput.value = "";
    });
  }

  // =========================
  // Tabs
  // =========================
  function showTab(id) {
    [pagesTab, heroesTab, menuTab, colorsTab, imagesTab].forEach(tab => {
      if (!tab) return;
      tab.style.display = (tab.id === id) ? "block" : "none";
    });
  }

  sidebarBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) showTab(tabId);
    });
  });

  // Show Pages tab by default
  showTab("pagesTab");

  // =========================
  // Pages Management
  // =========================
  function renderPagesList() {
    if (!pageListDiv) return;
    pageListDiv.innerHTML = "";

    if (!siteData.pages || siteData.pages.length === 0) {
      pageListDiv.textContent = "No pages yet.";
      return;
    }

    siteData.pages.forEach((p, index) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid #eee";

      const left = document.createElement("div");
      left.textContent = `${p.title} (${p.url})`;
      row.appendChild(left);

      const right = document.createElement("div");

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.marginRight = "6px";
      editBtn.addEventListener("click", () => {
        const newTitle = prompt("Page title:", p.title);
        if (newTitle === null) return;
        const newUrl = prompt("Page URL (e.g., about.html):", p.url);
        if (newUrl === null) return;
        p.title = newTitle.trim();
        p.url = newUrl.trim();
        saveSiteData();
      });
      right.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.background = "#ff4d4d";
      delBtn.style.color = "#fff";
      delBtn.addEventListener("click", () => {
        if (!confirm(`Delete page "${p.title}"?`)) return;
        siteData.pages.splice(index, 1);
        delete siteData.heroes[p.url];
        saveSiteData();
      });
      right.appendChild(delBtn);

      row.appendChild(right);
      pageListDiv.appendChild(row);
    });
  }

  if (addPageBtn) {
    addPageBtn.addEventListener("click", () => {
      const title = (addPageTitleInput.value || "").trim();
      let url = (addPageURLInput.value || "").trim();
      if (!title) return alert("Enter a page title.");
      if (!url) {
        url = title.toLowerCase().replace(/\s+/g, "-") + ".html";
      }
      if (siteData.pages.some(p => p.url === url)) {
        alert("A page with that URL already exists.");
        return;
      }
      siteData.pages.push({ title, url });
      addPageTitleInput.value = "";
      addPageURLInput.value = "";
      saveSiteData(true);
    });
  }

  // =========================
  // Hero Settings
  // =========================
  function populateHeroPageSelect() {
    if (!heroPageSelect) return;
    heroPageSelect.innerHTML = "";
    siteData.pages.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.url;
      opt.textContent = p.title;
      heroPageSelect.appendChild(opt);
    });
    if (heroPageSelect.options.length > 0) {
      heroPageSelect.selectedIndex = 0;
      loadHeroForm(heroPageSelect.value);
    }
  }

  function updateHeroUIVisibility() {
    if (!heroBehavior) return;
    const behavior = heroBehavior.value;
    if (heroImageSettings) {
      heroImageSettings.style.display =
        (behavior === "still" || behavior === "parallax" || behavior === "slider") ? "block" : "none";
    }
    if (heroVideoSettings) {
      heroVideoSettings.style.display =
        (behavior === "video") ? "block" : "none";
    }
  }

  function loadHeroForm(pageUrl) {
    const hero = siteData.heroes[pageUrl] || {};
    if (heroBehavior) heroBehavior.value = hero.behavior || "none";
    if (heroImageInput) heroImageInput.value = hero.behavior === "video" ? "" : (hero.mediaUrl || "");
    if (heroVideoInput) heroVideoInput.value = hero.behavior === "video" ? (hero.mediaUrl || "") : "";
    if (heroTransparentMenu) heroTransparentMenu.checked = !!hero.transparentMenu;
    if (heroHeight) heroHeight.value = hero.height || "80vh";

    updateHeroUIVisibility();

    if (heroPreview) {
      if (hero.mediaUrl && hero.behavior !== "video") {
        heroPreview.src = hero.mediaUrl;
        heroPreview.style.display = "block";
      } else {
        heroPreview.src = "";
        heroPreview.style.display = "none";
      }
    }
  }

  if (heroPageSelect) {
    heroPageSelect.addEventListener("change", () => {
      loadHeroForm(heroPageSelect.value);
    });
  }

  if (heroBehavior) {
    heroBehavior.addEventListener("change", updateHeroUIVisibility);
  }

  if (heroImageInput && heroPreview) {
    heroImageInput.addEventListener("input", () => {
      const val = heroImageInput.value.trim();
      if (val) {
        heroPreview.src = val;
        heroPreview.style.display = "block";
      } else {
        heroPreview.src = "";
        heroPreview.style.display = "none";
      }
    });
  }

  if (saveHeroSettingsBtn) {
    saveHeroSettingsBtn.addEventListener("click", () => {
      if (!heroPageSelect) return;
      const page = heroPageSelect.value;
      if (!page) { alert("Select a page first."); return; }

      const behavior = heroBehavior ? heroBehavior.value : "none";
      let mediaUrl = "";
      if (behavior === "video") {
        mediaUrl = heroVideoInput ? heroVideoInput.value.trim() : "";
      } else {
        mediaUrl = heroImageInput ? heroImageInput.value.trim() : "";
      }

      const height = heroHeight ? heroHeight.value.trim() || "80vh" : "80vh";
      const transparent = heroTransparentMenu ? heroTransparentMenu.checked : false;

      siteData.heroes[page] = {
        behavior,
        mediaUrl,
        height,
        transparentMenu: transparent
      };

      saveSiteData(true);
    });
  }

  // =========================
  // Menu Management
  // =========================
  function getMenuItems() {
    return (siteData.menu && siteData.menu.length)
      ? siteData.menu
      : siteData.pages.map(p => ({ title: p.title, url: p.url }));
  }

  function renderMenuList() {
    if (!menuListDiv) return;
    menuListDiv.innerHTML = "";
    const items = getMenuItems();
    items.forEach((m, idx) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid #eee";

      const left = document.createElement("div");
      left.textContent = `${m.title} (${m.url})`;
      row.appendChild(left);

      const right = document.createElement("div");

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.marginRight = "6px";
      editBtn.addEventListener("click", () => {
        const newTitle = prompt("Menu title:", m.title);
        if (newTitle === null) return;
        const newUrl = prompt("Menu URL:", m.url);
        if (newUrl === null) return;
        ensureMenuArray();
        siteData.menu[idx] = { title: newTitle.trim(), url: newUrl.trim() };
        saveSiteData();
      });
      right.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.background = "#ff4d4d";
      delBtn.style.color = "#fff";
      delBtn.addEventListener("click", () => {
        ensureMenuArray();
        siteData.menu.splice(idx, 1);
        saveSiteData();
      });
      right.appendChild(delBtn);

      row.appendChild(right);
      menuListDiv.appendChild(row);
    });
  }

  function ensureMenuArray() {
    if (!siteData.menu || !siteData.menu.length) {
      siteData.menu = siteData.pages.map(p => ({ title: p.title, url: p.url }));
    }
  }

  if (addMenuItemBtn) {
    addMenuItemBtn.addEventListener("click", () => {
      const title = prompt("Menu item title:");
      if (!title) return;
      const url = prompt("Menu item URL (e.g. about.html or https://...)");
      if (!url) return;
      ensureMenuArray();
      siteData.menu.push({ title: title.trim(), url: url.trim() });
      saveSiteData(true);
    });
  }

  // =========================
  // Colors / Appearance
  // =========================
  function loadColorPickers() {
    if (primaryColorPicker) primaryColorPicker.value = siteData.settings.primaryColor || "#0070f3";
    if (secondaryColorPicker) secondaryColorPicker.value = siteData.settings.secondaryColor || "#ffffff";
    if (accentColorPicker) accentColorPicker.value = siteData.settings.accentColor || "#0070f3";
    if (enableMenuTransparency) enableMenuTransparency.checked = !!siteData.settings.transparentMenu;
  }

  if (saveColorSettingsBtn) {
    saveColorSettingsBtn.addEventListener("click", () => {
      if (primaryColorPicker) siteData.settings.primaryColor = primaryColorPicker.value;
      if (secondaryColorPicker) siteData.settings.secondaryColor = secondaryColorPicker.value;
      if (accentColorPicker) siteData.settings.accentColor = accentColorPicker.value;
      if (enableMenuTransparency) siteData.settings.transparentMenu = enableMenuTransparency.checked;
      saveSiteData(true);
    });
  }

  // =========================
  // Image Library
  // =========================
  function renderImageGrid() {
    if (!imageGridDiv) return;
    imageGridDiv.innerHTML = "";
    siteData.images = siteData.images || [];

    siteData.images.forEach(img => {
      const wrap = document.createElement("div");
      wrap.style.border = "1px solid #ddd";
      wrap.style.padding = "6px";
      wrap.style.borderRadius = "6px";
      wrap.style.textAlign = "center";

      const el = document.createElement("img");
      el.src = img.dataUrl;
      el.style.maxWidth = "140px";
      el.style.height = "auto";
      el.style.display = "block";
      el.style.margin = "0 auto 8px";
      wrap.appendChild(el);

      const name = document.createElement("div");
      name.textContent = img.name;
      name.style.fontSize = "12px";
      name.style.marginBottom = "6px";
      wrap.appendChild(name);

      const del = document.createElement("button");
      del.textContent = "Delete";
      del.style.background = "#ff4d4d";
      del.style.color = "#fff";
      del.addEventListener("click", () => {
        if (!confirm("Delete image?")) return;
        siteData.images = siteData.images.filter(x => x.id !== img.id);
        saveSiteData();
      });
      wrap.appendChild(del);

      imageGridDiv.appendChild(wrap);
    });
  }

  function uid() {
    return "img_" + Math.random().toString(36).slice(2, 9);
  }

  if (uploadImageBtn && imageUploadInput) {
    uploadImageBtn.addEventListener("click", () => {
      const file = imageUploadInput.files && imageUploadInput.files[0];
      if (!file) { alert("Choose an image first."); return; }
      const reader = new FileReader();
      reader.onload = e => {
        siteData.images = siteData.images || [];
        siteData.images.push({ id: uid(), name: file.name, dataUrl: e.target.result });
        saveSiteData(true);
      };
      reader.readAsDataURL(file);
    });
  }

  // =========================
  // Save Button
  // =========================
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", () => {
      saveSiteData(true);
    });
  }

  // =========================
  // Init after login
  // =========================
  function initAdmin() {
    // Ensure structure
    siteData.pages = siteData.pages || defaultData.pages.slice();
    siteData.heroes = siteData.heroes || {};
    siteData.menu = siteData.menu || [];
    siteData.images = siteData.images || [];
    siteData.settings = siteData.settings || defaultData.settings;

    renderPagesList();
    renderMenuList();
    populateHeroPageSelect();
    loadColorPickers();
    renderImageGrid();
  }

  // Expose for debugging
  window.__HONESTNEWS_ADMIN = {
    getData: () => siteData,
    save: () => saveSiteData(true),
    reset: () => {
      siteData = JSON.parse(JSON.stringify(defaultData));
      saveSiteData(true);
    }
  };
});









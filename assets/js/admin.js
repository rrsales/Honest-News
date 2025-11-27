// admin.js — full admin panel engine
(() => {
  /*********************************
   Configuration
  *********************************/
  const ADMIN_PASSWORD = 'admin123'; // change this before publishing
  const STORAGE_KEY = 'honestnews_siteData_v1';

  /*********************************
   Default data model
  *********************************/
  const defaultData = {
    pages: [
      { title: 'Home', url: 'index.html' },
      { title: 'About', url: 'about.html' },
      { title: 'Blog', url: 'blog.html' },
      { title: 'Podcast', url: 'podcast.html' },
      { title: 'Products', url: 'products.html' },
      { title: 'Contact', url: 'contact.html' }
    ],
    menu: [], // optional custom ordering / external links
    heroes: {
      // 'about.html': { behavior:'still', mediaUrl:'...', transparent: true, height:'60vh', slides:[], overlayColor:'#000000', textColor:'#fff', title:'', subtitle:'' }
    },
    images: [], // { id, name, dataUrl }
    settings: {
      siteName: 'Honest News Network',
      primaryColor: '#0070f3',
      secondaryColor: '#ffffff',
      accentColor: '#0070f3',
      transparentMenu: false
    }
  };

  /*********************************
   State & helpers
  *********************************/
  let siteData = loadSiteData();

  function saveSiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    console.log('Site data saved.');
    // Update site UI if admin also embeds preview
    renderPagesList();
    populateHeroPageSelect();
    renderMenuList();
    renderImageGrid();
  }

  function loadSiteData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load site data, using defaults.', err);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  function resetToDefaults() {
    siteData = JSON.parse(JSON.stringify(defaultData));
    saveSiteData();
  }

  function uid(prefix = '') {
    return prefix + Math.random().toString(36).slice(2, 9);
  }

  /*********************************
   DOM references
  *********************************/
  const loginPanel = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const loginMsg = document.getElementById('loginMsg');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminPasswordInput = document.getElementById('adminPassword');

  // Tab buttons
  const tabBtns = document.querySelectorAll('.tabBtn');
  // Tabs content containers have ids: pagesTab, heroTab, menuTab, colorsTab, imagesTab
  const tabs = {
    pages: document.getElementById('pagesTab'),
    heroes: document.getElementById('heroTab'),
    menu: document.getElementById('menuTab'),
    colors: document.getElementById('colorsTab'),
    images: document.getElementById('imagesTab')
  };

  // Pages tab elements
  const addPageBtn = document.getElementById('addPageBtn');
  const pageListDiv = document.getElementById('pageList');

  // Hero tab elements
  const heroPageSelect = document.getElementById('heroPageSelect');
  const heroBehavior = document.getElementById('heroBehavior');
  const heroImageInput = document.getElementById('heroImageInput');
  const heroPreview = document.getElementById('heroPreview');
  const heroVideoInput = document.getElementById('heroVideoInput');
  const heroHeight = document.getElementById('heroHeight');
  const heroTransparentMenu = document.getElementById('heroTransparentMenu');
  const saveHeroSettingsBtn = document.getElementById('saveHeroSettings');

  // Menu tab elements
  const menuListDiv = document.getElementById('menuList');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');

  // Colors tab elements
  const primaryColorPicker = document.getElementById('primaryColorPicker');
  const secondaryColorPicker = document.getElementById('secondaryColorPicker');
  const accentColorPicker = document.getElementById('accentColorPicker');
  const enableMenuTransparency = document.getElementById('enableMenuTransparency');
  const saveColorSettingsBtn = document.getElementById('saveColorSettings');

  // Images tab elements
  const imageUploadInput = document.getElementById('imageUpload');
  const uploadImageBtn = document.getElementById('uploadImageBtn');
  const imageGridDiv = document.getElementById('imageGrid');

  // Save changes quick button (sidebar) - optional hook
  const saveChangesBtn = document.querySelector('.sidebar-btn[style*="Save Changes"], .sidebar-btn[aria-label="save"]');

  /*********************************
   Login / Authentication (front-end)
  *********************************/
  loginBtn && loginBtn.addEventListener('click', () => {
    const pwd = adminPasswordInput.value || '';
    if (pwd === ADMIN_PASSWORD) {
      loginPanel.style.display = 'none';
      adminPanel.style.display = '';
      console.log('Admin unlocked.');
      initAdmin();
    } else {
      loginMsg.textContent = 'Incorrect password';
    }
  });

  logoutBtn && logoutBtn.addEventListener('click', () => {
    adminPanel.style.display = 'none';
    loginPanel.style.display = 'flex';
    adminPasswordInput.value = '';
  });

  /*********************************
   Tab switching
  *********************************/
  function initTabButtons() {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        showTab(tab);
      });
    });
    // show pages tab by default
    showTab('pagesTab');
  }

  function showTab(tabId) {
    // tabId is like 'pagesTab' etc.
    const all = ['pagesTab','heroTab','menuTab','colorsTab','imagesTab'];
    all.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = (id === tabId) ? 'block' : 'none';
    });
  }

  /*********************************
   Pages Management
  *********************************/
  function renderPagesList() {
    pageListDiv.innerHTML = '';
    if (!siteData.pages || !siteData.pages.length) {
      pageListDiv.textContent = 'No pages yet.';
      return;
    }

    siteData.pages.forEach((p, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 0';
      row.style.borderBottom = '1px solid #eee';

      const left = document.createElement('div');
      left.innerHTML = `<strong>${escapeHtml(p.title)}</strong> <small style="color:#666">(${escapeHtml(p.url)})</small>`;
      row.appendChild(left);

      const right = document.createElement('div');

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginRight = '8px';
      editBtn.addEventListener('click', () => openEditPageDialog(idx));
      right.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.background = '#ff4d4d';
      delBtn.style.color = '#fff';
      delBtn.addEventListener('click', () => {
        if (!confirm(`Delete page "${p.title}"?`)) return;
        siteData.pages.splice(idx, 1);
        // remove hero for that page too
        delete siteData.heroes[p.url];
        saveSiteData();
      });
      right.appendChild(delBtn);

      row.appendChild(right);
      pageListDiv.appendChild(row);
    });

    // ensure hero dropdown pages are current
    populateHeroPageSelect();
    renderMenuList();
  }

  // Add page
  addPageBtn && addPageBtn.addEventListener('click', () => {
    const title = prompt('Page Title (example: About)');
    if (!title) return;
    let slug = prompt('Page URL (example: about.html) — keep lowercase and include .html');
    if (!slug) return;
    slug = slug.trim();
    // validate uniqueness
    if (siteData.pages.some(p => p.url === slug)) {
      alert('A page with that URL already exists.');
      return;
    }
    siteData.pages.push({ title: title.trim(), url: slug });
    saveSiteData();
  });

  // Edit page dialog (uses prompt for speed)
  function openEditPageDialog(index) {
    const p = siteData.pages[index];
    const newTitle = prompt('Edit title', p.title);
    if (newTitle === null) return;
    const newUrl = prompt('Edit URL (filename)', p.url);
    if (newUrl === null) return;
    // ensure no duplicate url (unless same page)
    if (siteData.pages.some((x, i) => i !== index && x.url === newUrl.trim())) {
      alert('Another page uses that URL.');
      return;
    }
    p.title = newTitle.trim();
    p.url = newUrl.trim();
    saveSiteData();
  }

  /*********************************
   Hero Settings (per page)
  *********************************/
  function populateHeroPageSelect() {
    if (!heroPageSelect) return;
    heroPageSelect.innerHTML = '';
    siteData.pages.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.url;
      opt.textContent = p.title;
      heroPageSelect.appendChild(opt);
    });
    // if heroes exist, select first page
    if (heroPageSelect.options.length) heroPageSelect.selectedIndex = 0;
    loadHeroFormForSelectedPage();
  }

  function loadHeroFormForSelectedPage() {
    const page = (heroPageSelect && heroPageSelect.value) || siteData.pages[0] && siteData.pages[0].url;
    if (!page) return;
    const h = siteData.heroes[page] || {};

    heroBehavior && (heroBehavior.value = h.behavior || 'none');
    heroImageInput && (heroImageInput.value = h.mediaUrl || '');
    heroVideoInput && (heroVideoInput.value = h.mediaUrl || '');
    heroHeight && (heroHeight.value = h.height || 'medium');
    heroTransparentMenu && (heroTransparentMenu.checked = !!h.transparentMenu);

    // show/hide fields depending on behavior
    updateHeroFieldsVisibility();

    // update preview image if available
    if (h.mediaUrl && heroPreview) {
      heroPreview.src = h.mediaUrl;
      heroPreview.style.display = 'block';
    } else if (heroPreview) {
      heroPreview.style.display = 'none';
      heroPreview.src = '';
    }
  }

  function updateHeroFieldsVisibility() {
    const behavior = heroBehavior && heroBehavior.value;
    const imgWrap = document.getElementById('heroImageSettings');
    const vidWrap = document.getElementById('heroVideoSettings');

    if (imgWrap) imgWrap.style.display = (behavior === 'still' || behavior === 'parallax' || behavior === 'slider') ? '' : 'none';
    if (vidWrap) vidWrap.style.display = (behavior === 'video') ? '' : 'none';
  }

  heroPageSelect && heroPageSelect.addEventListener('change', loadHeroFormForSelectedPage);
  heroBehavior && heroBehavior.addEventListener('change', updateHeroFieldsVisibility);

  // live thumbnail when user types image URL
  heroImageInput && heroImageInput.addEventListener('input', () => {
    if (heroImageInput.value.trim() && heroPreview) {
      heroPreview.src = heroImageInput.value.trim();
      heroPreview.style.display = 'block';
    } else if (heroPreview) {
      heroPreview.style.display = 'none';
    }
  });

  // Save hero settings
  saveHeroSettingsBtn && saveHeroSettingsBtn.addEventListener('click', () => {
    const page = heroPageSelect.value;
    if (!page) { alert('Select a page first'); return; }
    const behavior = heroBehavior.value;
    const mediaUrl = (behavior === 'video') ? (heroVideoInput.value.trim() || '') : (heroImageInput.value.trim() || '');
    const height = heroHeight.value;
    const transparentMenu = !!heroTransparentMenu.checked;

    siteData.heroes[page] = siteData.heroes[page] || {};
    Object.assign(siteData.heroes[page], {
      behavior,
      mediaUrl,
      height,
      transparentMenu
    });

    saveSiteData();
    alert('Hero settings saved.');
  });

  /*********************************
   Menu Management
  *********************************/
  function renderMenuList() {
    menuListDiv.innerHTML = '';
    // If menu array empty, render pages as default menu
    const items = (siteData.menu && siteData.menu.length) ? siteData.menu : siteData.pages.map(p => ({ title: p.title, url: p.url }));
    items.forEach((m, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 0';
      row.style.borderBottom = '1px solid #eee';

      const left = document.createElement('div');
      left.textContent = `${m.title} (${m.url})`;
      row.appendChild(left);

      const right = document.createElement('div');
      const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.style.marginRight = '8px';
      edit.addEventListener('click', () => {
        const newTitle = prompt('Menu item title', m.title);
        if (newTitle === null) return;
        const newUrl = prompt('Menu item URL', m.url);
        if (newUrl === null) return;
        if (!siteData.menu) siteData.menu = [];
        siteData.menu[idx] = { title: newTitle.trim(), url: newUrl.trim() };
        saveSiteData();
      });
      right.appendChild(edit);

      const del = document.createElement('button'); del.textContent = 'Delete'; del.style.background = '#ff4d4d'; del.style.color = '#fff';
      del.addEventListener('click', () => {
        if (!siteData.menu || !siteData.menu.length) {
          // if menu empty, create one from pages first
          siteData.menu = siteData.pages.map(p => ({ title: p.title, url: p.url }));
        }
        siteData.menu.splice(idx, 1);
        saveSiteData();
      });
      right.appendChild(del);

      row.appendChild(right);
      menuListDiv.appendChild(row);
    });
  }

  addMenuItemBtn && addMenuItemBtn.addEventListener('click', () => {
    const title = prompt('Menu title');
    if (!title) return;
    const url = prompt('Menu URL (e.g., page.html or https://...)');
    if (!url) return;
    if (!siteData.menu) siteData.menu = [];
    siteData.menu.push({ title: title.trim(), url: url.trim() });
    saveSiteData();
  });

  /*********************************
   Color / Appearance
  *********************************/
  function loadColorPickers() {
    primaryColorPicker && (primaryColorPicker.value = siteData.settings.primaryColor || '#0070f3');
    secondaryColorPicker && (secondaryColorPicker.value = siteData.settings.secondaryColor || '#ffffff');
    accentColorPicker && (accentColorPicker.value = siteData.settings.accentColor || '#0070f3');
    enableMenuTransparency && (enableMenuTransparency.checked = !!siteData.settings.transparentMenu);
  }

  saveColorSettingsBtn && saveColorSettingsBtn.addEventListener('click', () => {
    siteData.settings.primaryColor = primaryColorPicker.value;
    siteData.settings.secondaryColor = secondaryColorPicker.value;
    siteData.settings.accentColor = accentColorPicker.value;
    siteData.settings.transparentMenu = enableMenuTransparency.checked;
    saveSiteData();
    alert('Appearance saved.');
  });

  /*********************************
   Image Library — FileReader -> dataURL storage
  *********************************/
  uploadImageBtn && uploadImageBtn.addEventListener('click', () => {
    const file = imageUploadInput.files && imageUploadInput.files[0];
    if (!file) { alert('Choose an image to upload.'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      const id = uid('img_');
      siteData.images = siteData.images || [];
      siteData.images.push({ id, name: file.name, dataUrl: e.target.result });
      saveSiteData();
      alert('Image uploaded and saved to library.');
    };
    reader.readAsDataURL(file);
  });

  function renderImageGrid() {
    imageGridDiv.innerHTML = '';
    siteData.images = siteData.images || [];
    siteData.images.forEach(img => {
      const wrap = document.createElement('div');
      wrap.style.border = '1px solid #ddd';
      wrap.style.padding = '6px';
      wrap.style.borderRadius = '6px';
      wrap.style.textAlign = 'center';

      const el = document.createElement('img');
      el.src = img.dataUrl;
      el.style.maxWidth = '140px';
      el.style.height = 'auto';
      el.style.display = 'block';
      el.style.margin = '0 auto 8px';
      wrap.appendChild(el);

      const name = document.createElement('div');
      name.textContent = img.name;
      name.style.fontSize = '12px';
      name.style.marginBottom = '6px';
      wrap.appendChild(name);

      const choose = document.createElement('button');
      choose.textContent = 'Select';
      choose.addEventListener('click', () => {
        // when an image is selected, set the current hero input if open
        if (heroImageInput) {
          heroImageInput.value = img.dataUrl;
          heroPreview.src = img.dataUrl;
          heroPreview.style.display = 'block';
        }
        alert('Image selected for hero field.');
      });
      wrap.appendChild(choose);

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style.marginLeft = '6px';
      del.style.background = '#ff4d4d';
      del.style.color = '#fff';
      del.addEventListener('click', () => {
        if (!confirm('Delete image from library?')) return;
        siteData.images = siteData.images.filter(x => x.id !== img.id);
        saveSiteData();
      });
      wrap.appendChild(del);

      imageGridDiv.appendChild(wrap);
    });
  }

  /*********************************
   Export / Import (download / upload data.json)
  *********************************/
  function downloadDataJSON() {
    const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function uploadDataJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        // minimal validation
        if (!parsed.pages) throw new Error('Invalid data file');
        siteData = parsed;
        saveSiteData();
        alert('Imported site-data.json successfully.');
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /*********************************
   Quick helpers & DOM wiring
  *********************************/
  function escapeHtml(s = '') {
    return String(s).replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Tab initialization and default UI population
  function initAdmin() {
    initTabButtons();
    renderPagesList();
    populateHeroPageSelect();
    loadColorPickers();
    renderMenuList();
    renderImageGrid();
    bindMiscButtons();
  }

  function bindMiscButtons() {
    // Save changes sidebar button (if present)
    if (saveChangesBtn) saveChangesBtn.addEventListener('click', saveSiteData);

    // Menu: add item button
    if (addMenuItemBtn) addMenuItemBtn.addEventListener('click', () => {
      const title = prompt('Menu title');
      if (!title) return;
      const url = prompt('Menu URL (relative or absolute)');
      if (!url) return;
      siteData.menu = siteData.menu || [];
      siteData.menu.push({ title: title.trim(), url: url.trim() });
      saveSiteData();
    });

    // Color save handled earlier

    // Images upload handled earlier

    // Export / import quick links (create small UI buttons)
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export site-data.json';
    exportBtn.style.marginTop = '12px';
    exportBtn.addEventListener('click', downloadDataJSON);
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.style.marginTop = '8px';
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      uploadDataJSON(file);
    });
    // append to sidebar
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.appendChild(exportBtn);
      sidebar.appendChild(importInput);
    }
  }

  /*********************************
   Auto update dynamic menu for preview pages (if admin opens root pages)
   This attempts to populate any <nav class="nav-menu"> found on the admin page
   so you can preview the menu live in admin. It does not alter site pages.
  *********************************/
  function updatePreviewNavs() {
    const navs = document.querySelectorAll('.nav-menu');
    navs.forEach(nav => {
      nav.innerHTML = '';
      const items = (siteData.menu && siteData.menu.length) ? siteData.menu : siteData.pages.map(p => ({ title: p.title, url: p.url }));
      items.forEach(item => {
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.title;
        a.style.marginRight = '12px';
        nav.appendChild(a);
      });
    });
  }

  /*********************************
   Init on load if admin is visible already (rare)
  *********************************/
  document.addEventListener('DOMContentLoaded', () => {
    // If admin already unlocked via previous session (we don't persist unlocked state)
    // Keep admin hidden until login for safety
    // But populate some controls if wanted
    // Rendered only when login completes via initAdmin()

    // Also wire hero field visibility here in case DOM loaded
    if (heroBehavior) heroBehavior.addEventListener('change', updateHeroFieldsVisibility);

    // update preview navs (useful if admin includes nav in layout)
    setTimeout(updatePreviewNavs, 200);
  });

  /*********************************
   Small UX helpers
  *********************************/
  function updateHeroFieldsVisibility() {
    const behavior = heroBehavior && heroBehavior.value;
    const imgWrap = document.getElementById('heroImageSettings');
    const vidWrap = document.getElementById('heroVideoSettings');
    if (imgWrap) imgWrap.style.display = (behavior === 'still' || behavior === 'parallax' || behavior === 'slider') ? '' : 'none';
    if (vidWrap) vidWrap.style.display = (behavior === 'video') ? '' : 'none';
  }

  /*********************************
   Kick off (ensure defaults saved)
  *********************************/
  // ensure siteData has required keys
  siteData.pages = siteData.pages || defaultData.pages.slice();
  siteData.heroes = siteData.heroes || {};
  siteData.images = siteData.images || [];
  siteData.menu = siteData.menu || [];
  siteData.settings = siteData.settings || defaultData.settings;

  // save defaults if first time
  saveSiteData();

  // expose for debugging
  window.__HONESTNEWS_ADMIN = {
    getData: () => siteData,
    save: saveSiteData,
    reset: resetToDefaults
  };
  <script src="assets/js/site-config.js"></script>
<script src="assets/js/pages.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/products.js"></script>
<script src="assets/js/nav.js"></script>
<script src="assets/js/admin.js"></script>
})();


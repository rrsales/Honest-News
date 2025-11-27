// assets/js/admin.js
(function () {
  const ADMIN_PASSWORD = 'admin123';
  const STORAGE_KEY = 'honestnews_siteData_v1';

  // -------------------------
  // Default data
  // -------------------------
  const defaultData = {
    pages: [
      { title: 'Home', url: 'index.html' },
      { title: 'About', url: 'about.html' },
      { title: 'Blog', url: 'blog.html' },
      { title: 'Podcast', url: 'podcast.html' },
      { title: 'Products', url: 'products.html' },
      { title: 'Contact', url: 'contact.html' }
    ],
    heroes: {},
    menu: [],
    images: [],
    settings: {
      primaryColor: '#0070f3',
      secondaryColor: '#ffffff',
      accentColor: '#0070f3',
      transparentMenu: false
    }
  };

  // -------------------------
  // Storage helpers
  // -------------------------
  function loadSiteData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load site data, using defaults.', e);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  let siteData = loadSiteData();

  function saveSiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    console.log('Site data saved.');
    renderPages();
    renderMenu();
    renderImages();
    populateHeroPageSelect();
  }

  // -------------------------
  // DOM ready
  // -------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const loginPanel = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    const loginBtn = document.getElementById('loginBtn');
    const loginMsg = document.getElementById('loginMsg');
    const adminPasswordInput = document.getElementById('adminPassword');
    const logoutBtn = document.getElementById('logoutBtn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');

    if (!loginPanel || !adminPanel || !loginBtn) {
      console.warn('Admin HTML structure not found on this page.');
      return;
    }

    // Tabs
    const sidebarBtns = document.querySelectorAll('.sidebar-btn[data-tab]');
    const tabs = {
      pagesTab: document.getElementById('pagesTab'),
      heroesTab: document.getElementById('heroesTab'),
      menuTab: document.getElementById('menuTab'),
      colorsTab: document.getElementById('colorsTab'),
      imagesTab: document.getElementById('imagesTab')
    };

    // Pages tab
    const pageListDiv = document.getElementById('pageList');
    const addPageTitle = document.getElementById('addPageTitle');
    const addPageURL = document.getElementById('addPageURL');
    const addPageBtn = document.getElementById('addPageBtn');

    // Heroes tab
    const heroPageSelect = document.getElementById('heroPageSelect');
    const heroBehavior = document.getElementById('heroBehavior');
    const heroImageInput = document.getElementById('heroImageInput');
    const heroPreview = document.getElementById('heroPreview');
    const heroVideoInput = document.getElementById('heroVideoInput');
    const heroTransparentMenu = document.getElementById('heroTransparentMenu');
    const heroHeight = document.getElementById('heroHeight');
    const saveHeroSettingsBtn = document.getElementById('saveHeroSettings');

    // Menu tab
    const menuListDiv = document.getElementById('menuList');
    const addMenuItemBtn = document.getElementById('addMenuItemBtn');

    // Colors tab
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const secondaryColorPicker = document.getElementById('secondaryColorPicker');
    const accentColorPicker = document.getElementById('accentColorPicker');
    const enableMenuTransparency = document.getElementById('enableMenuTransparency');
    const saveColorSettingsBtn = document.getElementById('saveColorSettings');

    // Images tab
    const imageUploadInput = document.getElementById('imageUpload');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageGridDiv = document.getElementById('imageGrid');

    // -------------------------
    // Login / logout
    // -------------------------
    loginBtn.addEventListener('click', () => {
      if (adminPasswordInput.value === ADMIN_PASSWORD) {
        loginPanel.style.display = 'none';
        adminPanel.style.display = '';
        console.log('Admin unlocked');
        initAdmin();
      } else {
        loginMsg.textContent = 'Incorrect password';
      }
    });

    logoutBtn.addEventListener('click', () => {
      adminPanel.style.display = 'none';
      loginPanel.style.display = 'flex';
      adminPasswordInput.value = '';
    });

    // -------------------------
    // Tabs switching
    // -------------------------
    function showTab(tabId) {
      Object.keys(tabs).forEach(id => {
        if (!tabs[id]) return;
        tabs[id].style.display = (id === tabId) ? 'block' : 'none';
      });
    }

    sidebarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        if (tabs[tabId]) showTab(tabId);
      });
    });

    // default tab
    showTab('pagesTab');

    // -------------------------
    // Pages
    // -------------------------
    function renderPages() {
      if (!pageListDiv) return;
      pageListDiv.innerHTML = '';

      if (!siteData.pages || !siteData.pages.length) {
        pageListDiv.textContent = 'No pages yet.';
        return;
      }

      siteData.pages.forEach((p, index) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0';
        row.style.borderBottom = '1px solid #eee';

        const left = document.createElement('div');
        left.innerHTML = `<strong>${escapeHtml(p.title)}</strong> <small style="color:#666">(${escapeHtml(p.url)})</small>`;
        row.appendChild(left);

        const right = document.createElement('div');

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Rename';
        editBtn.style.marginRight = '6px';
        editBtn.addEventListener('click', () => {
          const newTitle = prompt('New title', p.title);
          if (newTitle === null) return;
          p.title = newTitle.trim();
          saveSiteData();
        });
        right.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.background = '#ff4d4d';
        delBtn.style.color = '#fff';
        delBtn.addEventListener('click', () => {
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
      addPageBtn.addEventListener('click', () => {
        const title = (addPageTitle.value || '').trim();
        const url = (addPageURL.value || '').trim();
        if (!title || !url) {
          alert('Title and URL are required.');
          return;
        }
        if (siteData.pages.some(p => p.url === url)) {
          alert('That URL is already used by another page.');
          return;
        }
        siteData.pages.push({ title, url });
        addPageTitle.value = '';
        addPageURL.value = '';
        saveSiteData();
      });
    }

    // -------------------------
    // Heroes
    // -------------------------
    function populateHeroPageSelect() {
      if (!heroPageSelect) return;
      heroPageSelect.innerHTML = '';
      siteData.pages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.url;
        opt.textContent = p.title;
        heroPageSelect.appendChild(opt);
      });
      if (heroPageSelect.options.length) {
        heroPageSelect.selectedIndex = 0;
        loadHeroForm(heroPageSelect.value);
      }
    }

    function loadHeroForm(pageUrl) {
      if (!pageUrl) return;
      const hero = siteData.heroes[pageUrl] || {};
      if (heroBehavior) heroBehavior.value = hero.behavior || 'none';
      if (heroImageInput) heroImageInput.value = hero.behavior === 'video' ? '' : (hero.mediaUrl || '');
      if (heroVideoInput) heroVideoInput.value = hero.behavior === 'video' ? (hero.mediaUrl || '') : '';
      if (heroTransparentMenu) heroTransparentMenu.checked = !!hero.transparentMenu;
      if (heroHeight) heroHeight.value = hero.height || '80vh';

      updateHeroFieldVisibility();

      if (heroPreview) {
        if (hero.mediaUrl && hero.behavior !== 'video') {
          heroPreview.src = hero.mediaUrl;
          heroPreview.style.display = 'block';
        } else {
          heroPreview.src = '';
          heroPreview.style.display = 'none';
        }
      }
    }

    function updateHeroFieldVisibility() {
      if (!heroBehavior) return;
      const behavior = heroBehavior.value;
      const imageWrap = document.getElementById('heroImageSettings');
      const videoWrap = document.getElementById('heroVideoSettings');

      if (imageWrap) {
        imageWrap.style.display = (behavior === 'still' || behavior === 'parallax' || behavior === 'slider') ? 'block' : 'none';
      }
      if (videoWrap) {
        videoWrap.style.display = (behavior === 'video') ? 'block' : 'none';
      }
    }

    if (heroBehavior) {
      heroBehavior.addEventListener('change', updateHeroFieldVisibility);
    }

    if (heroImageInput && heroPreview) {
      heroImageInput.addEventListener('input', () => {
        const val = heroImageInput.value.trim();
        if (val) {
          heroPreview.src = val;
          heroPreview.style.display = 'block';
        } else {
          heroPreview.src = '';
          heroPreview.style.display = 'none';
        }
      });
    }

    if (heroPageSelect) {
      heroPageSelect.addEventListener('change', () => loadHeroForm(heroPageSelect.value));
    }

    if (saveHeroSettingsBtn) {
      saveHeroSettingsBtn.addEventListener('click', () => {
        if (!heroPageSelect) return;
        const pageUrl = heroPageSelect.value;
        if (!pageUrl) {
          alert('Select a page first.');
          return;
        }
        const behavior = heroBehavior ? heroBehavior.value : 'none';
        let mediaUrl = '';
        if (behavior === 'video' && heroVideoInput) {
          mediaUrl = heroVideoInput.value.trim();
        } else if (heroImageInput) {
          mediaUrl = heroImageInput.value.trim();
        }
        const height = heroHeight ? heroHeight.value.trim() || '80vh' : '80vh';

        siteData.heroes[pageUrl] = {
          behavior,
          mediaUrl,
          transparentMenu: heroTransparentMenu ? heroTransparentMenu.checked : false,
          height
        };

        saveSiteData();
        alert('Hero settings saved.');
      });
    }

    // -------------------------
    // Menu
    // -------------------------
    function renderMenu() {
      if (!menuListDiv) return;
      menuListDiv.innerHTML = '';
      const items = (siteData.menu && siteData.menu.length)
        ? siteData.menu
        : siteData.pages.map(p => ({ title: p.title, url: p.url }));

      items.forEach((m, idx) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0';
        row.style.borderBottom = '1px solid #eee';

        const left = document.createElement('div');
        left.textContent = `${m.title} (${m.url})`;
        row.appendChild(left);

        const right = document.createElement('div');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.marginRight = '6px';
        editBtn.addEventListener('click', () => {
          const newTitle = prompt('Menu title', m.title);
          if (newTitle === null) return;
          const newUrl = prompt('Menu URL', m.url);
          if (newUrl === null) return;
          if (!siteData.menu || !siteData.menu.length) {
            siteData.menu = items.slice();
          }
          siteData.menu[idx] = { title: newTitle.trim(), url: newUrl.trim() };
          saveSiteData();
        });
        right.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.background = '#ff4d4d';
        delBtn.style.color = '#fff';
        delBtn.addEventListener('click', () => {
          if (!siteData.menu || !siteData.menu.length) {
            siteData.menu = items.slice();
          }
          siteData.menu.splice(idx, 1);
          saveSiteData();
        });
        right.appendChild(delBtn);

        row.appendChild(right);
        menuListDiv.appendChild(row);
      });
    }

    if (addMenuItemBtn) {
      addMenuItemBtn.addEventListener('click', () => {
        const title = prompt('Menu item title');
        if (!title) return;
        const url = prompt('Menu item URL (page.html or https://...)');
        if (!url) return;
        siteData.menu = siteData.menu || [];
        siteData.menu.push({ title: title.trim(), url: url.trim() });
        saveSiteData();
      });
    }

    // -------------------------
    // Colors / appearance
    // -------------------------
    function loadColors() {
      if (primaryColorPicker) primaryColorPicker.value = siteData.settings.primaryColor || '#0070f3';
      if (secondaryColorPicker) secondaryColorPicker.value = siteData.settings.secondaryColor || '#ffffff';
      if (accentColorPicker) accentColorPicker.value = siteData.settings.accentColor || '#0070f3';
      if (enableMenuTransparency) enableMenuTransparency.checked = !!siteData.settings.transparentMenu;
    }

    if (saveColorSettingsBtn) {
      saveColorSettingsBtn.addEventListener('click', () => {
        if (primaryColorPicker) siteData.settings.primaryColor = primaryColorPicker.value;
        if (secondaryColorPicker) siteData.settings.secondaryColor = secondaryColorPicker.value;
        if (accentColorPicker) siteData.settings.accentColor = accentColorPicker.value;
        if (enableMenuTransparency) siteData.settings.transparentMenu = enableMenuTransparency.checked;
        saveSiteData();
        alert('Color settings saved.');
      });
    }

    // -------------------------
    // Images
    // -------------------------
    function renderImages() {
      if (!imageGridDiv) return;
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

        const del = document.createElement('button');
        del.textContent = 'Delete';
        del.style.background = '#ff4d4d';
        del.style.color = '#fff';
        del.addEventListener('click', () => {
          if (!confirm('Delete image?')) return;
          siteData.images = siteData.images.filter(x => x.id !== img.id);
          saveSiteData();
        });
        wrap.appendChild(del);

        imageGridDiv.appendChild(wrap);
      });
    }

    if (uploadImageBtn) {
      uploadImageBtn.addEventListener('click', () => {
        const file = imageUploadInput.files && imageUploadInput.files[0];
        if (!file) {
          alert('Choose an image first.');
          return;
        }
        const reader = new FileReader();
        reader.onload = e => {
          const id = 'img_' + Math.random().toString(36).slice(2, 9);
          siteData.images = siteData.images || [];
          siteData.images.push({ id, name: file.name, dataUrl: e.target.result });
          saveSiteData();
        };
        reader.readAsDataURL(file);
      });
    }

    // -------------------------
    // Save button
    // -------------------------
    if (saveChangesBtn) {
      saveChangesBtn.addEventListener('click', () => {
        saveSiteData();
        alert('All changes saved.');
      });
    }

    // -------------------------
    // Helpers
    // -------------------------
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // -------------------------
    // Init after login
    // -------------------------
    function initAdmin() {
      // Make sure core keys exist
      siteData.pages = siteData.pages || defaultData.pages.slice();
      siteData.heroes = siteData.heroes || {};
      siteData.menu = siteData.menu || [];
      siteData.images = siteData.images || [];
      siteData.settings = siteData.settings || defaultData.settings;

      renderPages();
      renderMenu();
      renderImages();
      populateHeroPageSelect();
      loadColors();
    }

    // Expose for debugging
    window.__HONESTNEWS_ADMIN = {
      getData: () => siteData,
      save: saveSiteData
    };
  });
})();












(() => {
  /*********************************
   CONFIGURATION
  *********************************/
  const ADMIN_PASSWORD = 'admin123';
  const STORAGE_KEY = 'honestnews_siteData_v1';

  /*********************************
   DEFAULT DATA
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
    heroes: {}, // per page hero settings
    images: [],
    settings: {
      siteName: 'Honest News Network',
      primaryColor: '#0070f3',
      secondaryColor: '#ffffff',
      accentColor: '#0070f3',
      transparentMenu: false
    }
  };

  /*********************************
   STATE & HELPERS
  *********************************/
  let siteData = loadSiteData();

  function loadSiteData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load site data', err);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  function saveSiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    renderPagesList();
    renderHeroPageSelect();
    renderImageGrid();
    console.log('Site data saved.');
  }

  function uid(prefix = '') {
    return prefix + Math.random().toString(36).slice(2, 9);
  }

  /*********************************
   DOM ELEMENTS
  *********************************/
  const loginPanel = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const loginMsg = document.getElementById('loginMsg');
  const adminPasswordInput = document.getElementById('adminPassword');

  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  const sections = document.querySelectorAll('.admin-section');

  const pagesListDiv = document.getElementById('pagesList');
  const addPageBtn = document.getElementById('addPageBtn');
  const newPageTitle = document.getElementById('newPageTitle');

  const heroType = document.getElementById('heroType');
  const heroImageURL = document.getElementById('heroImageURL');
  const heroVideoURL = document.getElementById('heroVideoURL');
  const heroImagePreview = document.getElementById('heroImagePreview');
  const transparentMenu = document.getElementById('transparentMenu');
  const heroPageSelect = document.getElementById('heroPageSelect');

  const navColor = document.getElementById('navColor');
  const bgColor = document.getElementById('bgColor');

  const imageUpload = document.getElementById('imageUpload');
  const uploadImageBtn = document.getElementById('uploadImageBtn');
  const imageGridDiv = document.getElementById('imageGrid');

  /*********************************
   LOGIN
  *********************************/
  loginBtn && loginBtn.addEventListener('click', () => {
    const pwd = adminPasswordInput.value || '';
    if (pwd === ADMIN_PASSWORD) {
      loginPanel.style.display = 'none';
      adminPanel.style.display = 'grid';
      initAdmin();
    } else {
      loginMsg.textContent = 'Incorrect password';
    }
  });

  /*********************************
   SIDEBAR NAVIGATION
  *********************************/
  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-section');
      sections.forEach(sec => {
        sec.style.display = (sec.id === 'section-' + target) ? 'block' : 'none';
      });
    });
  });

  /*********************************
   PAGES
  *********************************/
  function renderPagesList() {
    if (!pagesListDiv) return;
    pagesListDiv.innerHTML = '';
    siteData.pages.forEach((p, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.marginBottom = '8px';
      row.innerHTML = `
        <div>${p.title} (${p.url})</div>
        <div>
          <button class="editBtn">Edit</button>
          <button class="delBtn" style="background:#ff4d4d;color:#fff;">Delete</button>
        </div>`;
      const editBtn = row.querySelector('.editBtn');
      const delBtn = row.querySelector('.delBtn');

      editBtn.addEventListener('click', () => editPage(idx));
      delBtn.addEventListener('click', () => {
        if (!confirm(`Delete page "${p.title}"?`)) return;
        siteData.pages.splice(idx, 1);
        delete siteData.heroes[p.url];
        saveSiteData();
      });

      pagesListDiv.appendChild(row);
    });
  }

  addPageBtn && addPageBtn.addEventListener('click', () => {
    if (!newPageTitle.value.trim()) return alert('Enter a page title');
    const slug = prompt('Page URL (example: about.html)');
    if (!slug) return;
    if (siteData.pages.some(p => p.url === slug.trim())) return alert('Page URL exists');
    siteData.pages.push({ title: newPageTitle.value.trim(), url: slug.trim() });
    newPageTitle.value = '';
    saveSiteData();
  });

  function editPage(idx) {
    const page = siteData.pages[idx];
    const newTitle = prompt('Edit title', page.title);
    if (!newTitle) return;
    const newUrl = prompt('Edit URL', page.url);
    if (!newUrl) return;
    // Update hero settings key if URL changes
    if (siteData.heroes[page.url]) {
      siteData.heroes[newUrl] = siteData.heroes[page.url];
      delete siteData.heroes[page.url];
    }
    page.title = newTitle.trim();
    page.url = newUrl.trim();
    saveSiteData();
  }

  /*********************************
   HERO SETTINGS
  *********************************/
  function renderHeroPageSelect() {
    if (!heroPageSelect) return;
    heroPageSelect.innerHTML = '';
    siteData.pages.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.url;
      opt.textContent = p.title;
      heroPageSelect.appendChild(opt);
    });
    // Load first page hero settings
    if (heroPageSelect.value) loadHeroSettings(heroPageSelect.value);
  }

  function loadHeroSettings(pageUrl) {
    const hero = siteData.heroes[pageUrl] || { type: 'none', image: '', video: '', transparentMenu: false };
    heroType.value = hero.type;
    heroImageURL.value = hero.image;
    heroVideoURL.value = hero.video;
    heroImagePreview.src = hero.image;
    heroImagePreview.style.display = hero.image ? 'block' : 'none';
    transparentMenu.checked = hero.transparentMenu;
    toggleHeroFields(heroType.value);
  }

  function saveHeroSettings(pageUrl) {
    siteData.heroes[pageUrl] = {
      type: heroType.value,
      image: heroImageURL.value,
      video: heroVideoURL.value,
      transparentMenu: transparentMenu.checked
    };
    saveSiteData();
  }

  function toggleHeroFields(type) {
    if (type === 'image' || type === 'parallax' || type === 'slideshow') {
      document.getElementById('heroImageField').style.display = 'block';
      document.getElementById('heroVideoField').style.display = 'none';
    } else if (type === 'video') {
      document.getElementById('heroImageField').style.display = 'none';
      document.getElementById('heroVideoField').style.display = 'block';
    } else {
      document.getElementById('heroImageField').style.display = 'none';
      document.getElementById('heroVideoField').style.display = 'none';
    }
  }

  heroPageSelect && heroPageSelect.addEventListener('change', () => {
    loadHeroSettings(heroPageSelect.value);
  });

  heroType && heroType.addEventListener('change', () => {
    toggleHeroFields(heroType.value);
    saveHeroSettings(heroPageSelect.value);
  });

  heroImageURL && heroImageURL.addEventListener('input', () => {
    heroImagePreview.src = heroImageURL.value;
    heroImagePreview.style.display = heroImageURL.value ? 'block' : 'none';
    saveHeroSettings(heroPageSelect.value);
  });

  heroVideoURL && heroVideoURL.addEventListener('input', () => {
    saveHeroSettings(heroPageSelect.value);
  });

  transparentMenu && transparentMenu.addEventListener('change', () => {
    saveHeroSettings(heroPageSelect.value);
  });

  /*********************************
   APPEARANCE
  *********************************/
  if (navColor) navColor.value = siteData.settings.primaryColor || '#0070f3';
  if (bgColor) bgColor.value = siteData.settings.secondaryColor || '#ffffff';
  [navColor, bgColor].forEach(input => {
    input && input.addEventListener('input', () => {
      siteData.settings.primaryColor = navColor.value;
      siteData.settings.secondaryColor = bgColor.value;
      saveSiteData();
    });
  });

  /*********************************
   MEDIA LIBRARY
  *********************************/
  uploadImageBtn && uploadImageBtn.addEventListener('click', () => {
    const file = imageUpload.files[0];
    if (!file) return alert('Select an image');
    const reader = new FileReader();
    reader.onload = e => {
      siteData.images.push({ id: uid('img_'), name: file.name, dataUrl: e.target.result });
      saveSiteData();
    };
    reader.readAsDataURL(file);
  });

  function renderImageGrid() {
    if (!imageGridDiv) return;
    imageGridDiv.innerHTML = '';
    siteData.images.forEach(img => {
      const wrap = document.createElement('div');
      wrap.style.marginBottom = '10px';
      wrap.innerHTML = `
        <img src="${img.dataUrl}" style="max-width:120px;display:block;margin-bottom:5px;">
        <div>${img.name}</div>
        <button class="selectBtn">Select</button>
        <button class="delBtn" style="background:#ff4d4d;color:#fff;">Delete</button>
      `;
      wrap.querySelector('.selectBtn').addEventListener('click', () => {
        heroImageURL.value = img.dataUrl;
        heroImagePreview.src = img.dataUrl;
        heroImagePreview.style.display = 'block';
        saveHeroSettings(heroPageSelect.value);
      });
      wrap.querySelector('.delBtn').addEventListener('click', () => {
        siteData.images = siteData.images.filter(i => i.id !== img.id);
        saveSiteData();
      });
      imageGridDiv.appendChild(wrap);
    });
  }

  /*********************************
   INITIALIZATION
  *********************************/
  function initAdmin() {
    renderPagesList();
    renderHeroPageSelect();
    renderImageGrid();
  }

})();




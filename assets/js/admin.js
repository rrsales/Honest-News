(() => {
  // =========================
  // Configuration
  // =========================
  const ADMIN_PASSWORD = 'admin123';
  const STORAGE_KEY = 'honestnews_siteData_v1';

  // =========================
  // Default site data
  // =========================
  const defaultData = {
    pages: [
      { title: 'Home', url: 'index.html', content: '' },
      { title: 'About', url: 'about.html', content: '' },
      { title: 'Blog', url: 'blog.html', content: '' },
      { title: 'Podcast', url: 'podcast.html', content: '' },
      { title: 'Products', url: 'products.html', content: '' },
      { title: 'Contact', url: 'contact.html', content: '' }
    ],
    heroes: {},
    menu: [],
    images: [],
    settings: {
      siteName: 'Honest News Network',
      primaryColor: '#0070f3',
      secondaryColor: '#ffffff',
      accentColor: '#0070f3',
      transparentMenu: false
    }
  };

  // =========================
  // State
  // =========================
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
      console.error(err);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  function saveSiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    console.log('Site data saved.');
    renderPagesList();
    populateHeroPageSelect();
    renderMenuList();
    renderImageGrid();
  }

  // =========================
  // DOM references
  // =========================
  const loginPanel = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const loginMsg = document.getElementById('loginMsg');
  const adminPasswordInput = document.getElementById('adminPassword');

  // Tabs
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  const sections = {
    pages: document.getElementById('section-pages'),
    editPage: document.getElementById('section-editPage'),
    heroes: document.getElementById('section-heroes'),
    appearance: document.getElementById('section-appearance'),
    media: document.getElementById('section-media')
  };

  // Pages tab elements
  const pagesList = document.getElementById('pagesList');
  const addPageBtn = document.getElementById('addPageBtn');
  const newPageTitle = document.getElementById('newPageTitle');

  // Hero tab elements
  const heroType = document.getElementById('heroType');
  const heroImageField = document.getElementById('heroImageField');
  const heroVideoField = document.getElementById('heroVideoField');
  const heroImageURL = document.getElementById('heroImageURL');
  const heroVideoURL = document.getElementById('heroVideoURL');
  const heroImagePreview = document.getElementById('heroImagePreview');
  const transparentMenuCheckbox = document.getElementById('transparentMenu');
  const heroPageSelect = document.getElementById('heroPageSelect');

  // Appearance tab
  const navColor = document.getElementById('navColor');
  const bgColor = document.getElementById('bgColor');

  // =========================
  // Login logic
  // =========================
  loginBtn.addEventListener('click', () => {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
      loginPanel.style.display = 'none';
      adminPanel.style.display = '';
      initAdmin();
    } else {
      loginMsg.textContent = 'Incorrect password';
    }
  });

  // =========================
  // Tab switching
  // =========================
  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      Object.values(sections).forEach(s => s.style.display = 'none');
      if (sections[section]) sections[section].style.display = '';
    });
  });

  // =========================
  // Pages management
  // =========================
  function renderPagesList() {
    pagesList.innerHTML = '';
    siteData.pages.forEach((p, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.marginBottom = '6px';
      row.innerHTML = `<span>${p.title} (${p.url})</span>`;
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '6px';
      editBtn.onclick = () => openEditPage(idx);
      row.appendChild(editBtn);
      pagesList.appendChild(row);
    });
  }

  addPageBtn.addEventListener('click', () => {
    const title = newPageTitle.value.trim();
    if (!title) return alert('Enter a title');
    const url = title.toLowerCase().replace(/\s+/g,'-')+'.html';
    siteData.pages.push({ title, url, content: '' });
    newPageTitle.value = '';
    saveSiteData();
  });

  function openEditPage(index) {
    sections.editPage.style.display = '';
    const p = siteData.pages[index];
    document.getElementById('editPageTitle').value = p.title;
    document.getElementById('editPageSlug').value = p.url;
    heroPageSelect.value = p.url;
    loadHeroForm(p.url);
  }

  // =========================
  // Hero management
  // =========================
  function loadHeroForm(pageUrl) {
    const hero = siteData.heroes[pageUrl] || {};
    heroType.value = hero.behavior || 'none';
    heroImageURL.value = hero.mediaUrl || '';
    heroVideoURL.value = hero.mediaUrl || '';
    transparentMenuCheckbox.checked = !!hero.transparentMenu;
    updateHeroFields();
    if (hero.mediaUrl) heroImagePreview.src = hero.mediaUrl;
  }

  heroType.addEventListener('change', updateHeroFields);
  function updateHeroFields() {
    const type = heroType.value;
    heroImageField.style.display = (type==='image'||type==='parallax'||type==='slideshow') ? '' : 'none';
    heroVideoField.style.display = (type==='video') ? '' : 'none';
  }

  // =========================
  // Media library
  // =========================
  function renderImageGrid() {
    // Placeholder: implement image uploads later
  }

  // =========================
  // Appearance
  // =========================
  function loadAppearance() {
    navColor.value = siteData.settings.primaryColor;
    bgColor.value = siteData.settings.secondaryColor;
  }

  navColor.addEventListener('input', () => {
    siteData.settings.primaryColor = navColor.value;
    saveSiteData();
  });
  bgColor.addEventListener('input', () => {
    siteData.settings.secondaryColor = bgColor.value;
    saveSiteData();
  });

  // =========================
  // Initialization
  // =========================
  function initAdmin() {
    renderPagesList();
    loadAppearance();
    populateHeroPageSelect();
    renderImageGrid();
  }

  function populateHeroPageSelect() {
    if (!heroPageSelect) return;
    heroPageSelect.innerHTML = '';
    siteData.pages.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.url;
      opt.textContent = p.title;
      heroPageSelect.appendChild(opt);
    });
    heroPageSelect.addEventListener('change', e => loadHeroForm(e.target.value));
  }

})();







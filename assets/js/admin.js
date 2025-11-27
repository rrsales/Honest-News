// assets/js/admin.js – fixed for YOUR current admin.html (November 2025)
(function () {
  const ADMIN_PASSWORD = 'admin123';               // ← change this!
  const STORAGE_KEY = 'honestnews_siteData_v1';

  const defaultData = {
    pages: [
      { title: 'Home',      url: 'index.html' },
      { title: 'Podcast',   url: 'podcast.html' },
      { title: 'Support',   url: 'support.html' }
    ],
    heroes: {},
    settings: {
      primaryColor: '#0066cc',
      bgColor: '#ffffff'
    }
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error(e);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  let data = loadData();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Saved');
    renderAll();
  }

  function renderAll() {
    renderPagesList();
    populateHeroSelect();
  }

  // ────────────────────────────────
  // Login
  // ────────────────────────────────
  document.getElementById('loginBtn').addEventListener('click', () => {
    if (document.getElementById('adminPassword').value === ADMIN_PASSWORD) {
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      console.log('Admin unlocked');
      init();
    } else {
      document.getElementById('loginMsg').textContent = 'Wrong password';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPassword').value = '';
  });

  // ────────────────────────────────
  // Sidebar (data-section)
  // ────────────────────────────────
  document.querySelectorAll('.sidebar-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
      const target = btn.getAttribute('data-section');
      document.getElementById('section-' + target).style.display = 'block';
    });
  });

  // ────────────────────────────────
  // Pages section
  // ────────────────────────────────
  function renderPagesList() {
    const list = document.getElementById('pagesList');
    list.innerHTML = '';
    data.pages.forEach((p, i) => {
      const div = document.createElement('div');
      div.style = 'padding:8px 0; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;';
      div.innerHTML = `<strong>${p.title}</strong> <small>(${p.url})</small>`;
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style = 'background:#c33; color:white; border:none; padding:4px 8px;';
      del.onclick = () => {
        if (confirm('Delete this page?')) {
          data.pages.splice(i, 1);
          delete data.heroes[p.url];
          save();
        }
      };
      div.appendChild(del);
      list.appendChild(div);
    });
  }

  document.getElementById('addPageBtn').addEventListener('click', () => {
    const title = document.getElementById('newPageTitle').value.trim();
    if (!title) return alert('Title required');
    const slug = prompt('Slug (filename without .html)', title.toLowerCase().replace(/[^a-z0-9]/g,'-'));
    if (!slug) return;
    const url = slug + '.html';
    if (data.pages.some(p => p.url === url)) return alert('URL already exists');
    data.pages.push({ title, url });
    document.getElementById('newPageTitle').value = '';
    save();
  });

  // ────────────────────────────────
  // Hero Settings section
  // ────────────────────────────────
  function populateHeroSelect() {
    const sel = document.getElementById('heroPageSelect');
    sel.innerHTML = '';
    data.pages.forEach(p => {
      const opt = new Option(p.title, p.url);
      sel.appendChild(opt);
    });
    if (data.pages.length) loadHeroForPage(data.pages[0].url);
  }

  function loadHeroForPage(url) {
    const h = data.heroes[url] || {};
    document.getElementById('heroType').value = h.type || 'none';
    document.getElementById('heroImageURL').value = h.image || '';
    document.getElementById('heroVideoURL').value = h.video || '';
    document.getElementById('transparentMenu').checked = !!h.transparent;
    document.getElementById('heroImagePreview').src = h.image || '';
    toggleHeroFields();
  }

  function toggleHeroFields() {
    const type = document.getElementById('heroType').value;
    document.getElementById('heroImageField').style.display = (type === 'image' || type === 'parallax' || type === 'slideshow') ? 'block' : 'none';
    document.getElementById('heroVideoField').style.display = (type === 'video') ? 'block' : 'none';
  }

  document.getElementById('heroType').addEventListener('change', toggleHeroFields);
  document.getElementById('heroImageURL').addEventListener('input', e => {
    document.getElementById('heroImagePreview').src = e.target.value;
  });
  document.getElementById('heroPageSelect').addEventListener('change', e => {
    loadHeroForPage(e.target.value);
  });

  // Save hero button is not in your HTML → we add the logic directly on change
  document.querySelector('#section-heroes').addEventListener('change', () => {
    const url = document.getElementById('heroPageSelect').value;
    const type = document.getElementById('heroType').value;
    const image = document.getElementById('heroImageURL').value.trim();
    const video = document.getElementById('heroVideoURL').value.trim();
    data.heroes[url] = {
      type,
      image: (type !== 'video') ? image : '',
      video: (type === 'video') ? video : '',
      transparent: document.getElementById('transparentMenu').checked
    };
    save();
  });

  // ────────────────────────────────
  // Appearance section
  // ────────────────────────────────
  document.getElementById('navColor').addEventListener('input', e => {
    data.settings.primaryColor = e.target.value;
    document.documentElement.style.setProperty('--primary-color', e.target.value);
    save();
  });
  document.getElementById('bgColor').addEventListener('input', e => {
    data.settings.bgColor = e.target.value;
    document.body.style.background = e.target.value;
    save();
  });

  // ────────────────────────────────
  // Init
  // ────────────────────────────────
  function init() {
    renderAll();
    // apply saved colors
    document.documentElement.style.setProperty('--primary-color', data.settings.primaryColor);
    document.body.style.background = data.settings.bgColor || '#ffffff';
    // default to Pages section
    document.querySelector('.sidebar-btn[data-section="pages"]').click();
  }

  // auto-login if you refresh (optional)
  if (localStorage.getItem('adminAuth') === 'yes') {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    console.log('Admin unlocked (session)');
    init();
  }

})();












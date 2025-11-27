// admin.js — Full Podbean-style admin panel
(() => {
  const ADMIN_PASSWORD = 'admin123';
  const STORAGE_KEY = 'honestnews_siteData_v2';

  // Default site data model
  const defaultData = {
    pages: [
      { title: 'Home', url: 'index.html', content: [] },
      { title: 'About', url: 'about.html', content: [] },
      { title: 'Blog', url: 'blog.html', content: [] },
      { title: 'Podcast', url: 'podcast.html', content: [] },
      { title: 'Products', url: 'products.html', content: [] },
      { title: 'Contact', url: 'contact.html', content: [] }
    ],
    menu: [],
    heroes: {},
    images: [],
    settings: {
      siteName: 'Honest News Network',
      primaryColor: '#0070f3',
      secondaryColor: '#ffffff',
      accentColor: '#0070f3',
      transparentMenu: false
    }
  };

  let siteData = loadSiteData();

  // Load and save
  function loadSiteData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
      }
      return JSON.parse(raw);
    } catch { return JSON.parse(JSON.stringify(defaultData)); }
  }

  function saveSiteData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    renderPagesList();
    populateHeroPageSelect();
    renderMenuList();
    renderImageGrid();
  }

  function uid(prefix='') { return prefix + Math.random().toString(36).slice(2,9); }

  // DOM refs
  const loginPanel = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const loginMsg = document.getElementById('loginMsg');
  const adminPasswordInput = document.getElementById('adminPassword');
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  const sections = document.querySelectorAll('.admin-section');

  // Login
  loginBtn.addEventListener('click',()=>{
    if(adminPasswordInput.value===ADMIN_PASSWORD){
      loginPanel.style.display='none';
      adminPanel.style.display='';
      initAdmin();
    } else { loginMsg.textContent='Incorrect password'; }
  });

  // Sidebar tab switching
  sidebarBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const section = btn.getAttribute('data-section');
      sections.forEach(s=>s.style.display='none');
      const active = document.getElementById('section-'+section);
      if(active) active.style.display='block';
    });
  });

  // Pages Management
  const pagesListDiv = document.getElementById('pagesList');
  const addPageBtn = document.getElementById('addPageBtn');

  function renderPagesList(){
    pagesListDiv.innerHTML='';
    siteData.pages.forEach((p,i)=>{
      const row=document.createElement('div');
      row.style.display='flex'; row.style.justifyContent='space-between'; row.style.padding='6px 0';
      row.innerHTML=`<strong>${p.title}</strong> (${p.url}) <button data-idx='${i}'>Edit</button> <button data-del='${i}' style='background:#ff4d4d;color:#fff;'>Delete</button>`;
      pagesListDiv.appendChild(row);
    });
    pagesListDiv.querySelectorAll('button[data-idx]').forEach(btn=>{
      btn.addEventListener('click',()=>{ openEditPageDialog(parseInt(btn.getAttribute('data-idx'))) });
    });
    pagesListDiv.querySelectorAll('button[data-del]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(confirm('Delete page?')){
          const idx=parseInt(btn.getAttribute('data-del'));
          siteData.pages.splice(idx,1);
          saveSiteData();
        }
      });
    });
  }

  addPageBtn.addEventListener('click',()=>{
    const title=document.getElementById('newPageTitle').value.trim();
    if(!title) return alert('Enter title');
    const slug=prompt('Page URL (example: about.html)');
    if(!slug) return;
    siteData.pages.push({title, url:slug, content:[]});
    saveSiteData();
  });

  // Edit Page Dialog
  const editPageTitle=document.getElementById('editPageTitle');
  const editPageSlug=document.getElementById('editPageSlug');
  const heroType=document.getElementById('heroType');
  const heroImageField=document.getElementById('heroImageField');
  const heroVideoField=document.getElementById('heroVideoField');
  const heroImageURL=document.getElementById('heroImageURL');
  const heroImagePreview=document.getElementById('heroImagePreview');
  const heroVideoURL=document.getElementById('heroVideoURL');
  const transparentMenu=document.getElementById('transparentMenu');
  let currentEditPage=null;

  function openEditPageDialog(idx){
    const p=siteData.pages[idx];
    currentEditPage=idx;
    editPageTitle.value=p.title;
    editPageSlug.value=p.url;
    const hero=siteData.heroes[p.url]||{};
    heroType.value=hero.behavior||'none';
    heroImageURL.value=(hero.behavior!=='video')?hero.mediaUrl||'':'';
    heroVideoURL.value=(hero.behavior==='video')?hero.mediaUrl||'':'';
    transparentMenu.checked=!!hero.transparentMenu;
    heroImageField.style.display=(heroType.value==='image' || heroType.value==='parallax' || heroType.value==='slideshow')?'block':'none';
    heroVideoField.style.display=(heroType.value==='video')?'block':'none';
    if(heroImagePreview && heroImageURL.value) { heroImagePreview.src=heroImageURL.value; heroImagePreview.style.display='block'; }
  }

  heroType.addEventListener('change',()=>{
    heroImageField.style.display=(heroType.value==='image' || heroType.value==='parallax' || heroType.value==='slideshow')?'block':'none';
    heroVideoField.style.display=(heroType.value==='video')?'block':'none';
  });

  heroImageURL.addEventListener('input',()=>{ if(heroImagePreview) { heroImagePreview.src=heroImageURL.value; heroImagePreview.style.display=heroImageURL.value?'block':'none'; } });

  // Hero Page Select
  const heroPageSelect=document.getElementById('heroPageSelect');
  function populateHeroPageSelect(){
    if(!heroPageSelect) return;
    heroPageSelect.innerHTML='';
    siteData.pages.forEach(p=>{ const opt=document.createElement('option'); opt.value=p.url; opt.textContent=p.title; heroPageSelect.appendChild(opt); });
  }

  // Media Library
  const imageUploadInput=document.getElementById('imageUpload');
  const uploadImageBtn=document.getElementById('uploadImageBtn');
  const imageGridDiv=document.getElementById('imageGrid');
  function renderImageGrid(){
    if(!imageGridDiv) return;
    imageGridDiv.innerHTML='';
    siteData.images.forEach(img=>{
      const wrap=document.createElement('div'); wrap.style.margin='6px';
      const el=document.createElement('img'); el.src=img.dataUrl; el.style.maxWidth='140px'; wrap.appendChild(el);
      const name=document.createElement('div'); name.textContent=img.name; wrap.appendChild(name);
      const del=document.createElement('button'); del.textContent='Delete';
      del.addEventListener('click',()=>{ siteData.images=siteData.images.filter(x=>x.id!==img.id); saveSiteData(); });
      wrap.appendChild(del);
      imageGridDiv.appendChild(wrap);
    });
  }
  if(uploadImageBtn) uploadImageBtn.addEventListener('click',()=>{
    const file=imageUploadInput.files[0];
    if(!file) return alert('Choose image');
    const reader=new FileReader();
    reader.onload=e=>{
      siteData.images.push({id:uid('img_'), name:file.name, dataUrl:e.target.result});
      saveSiteData();
      alert('Uploaded');
    };
    reader.readAsDataURL(file);
  });

  // Init Admin
  function initAdmin(){
    renderPagesList();
    populateHeroPageSelect();
    renderImageGrid();
  }

  window.__HONESTNEWS_ADMIN={getData:()=>siteData, save:saveSiteData};
})();






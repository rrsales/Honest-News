// assets/js/admin.js – Full WordPress-like Admin (2025 version)
const PASSWORD = "jesus2025"; // ← put whatever you want here
const STORE = "honestnews_full_v2";

let db = {
  pages: [{ id:"home", title:"Home", slug:"index", content:[] }],
  heroes: {},
  theme: { primary:"#0066cc", bg:"#ffffff" }
};

function load() {
  const raw = localStorage.getItem(STORE);
  if (raw) db = JSON.parse(raw);
  db.pages ??= []; db.heroes ??= {}; db.theme ??= {};
  renderPagesList();
  populateHeroSelect();
  applyTheme();
}
function save() { localStorage.setItem(STORE, JSON.stringify(db)); }

document.addEventListener('DOMContentLoaded', () => {
  const login = document.getElementById('loginBtn');
  login.onclick = () => {
    if (document.getElementById('adminPass').value === PASSWORD) {
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      load();
    } else alert("Wrong password");
  };

  // Sidebar
  document.querySelectorAll('.menu-item').forEach(item => {
    item.onclick = () => {
      document.querySelectorAll('.menu-item').forEach(i=>i.classList.remove('active'));
      item.classList.add('active');
      const view = item.dataset.view + 'View';
      document.querySelectorAll('.editor-panel, .preview-panel > *').forEach(v=>v.classList.add('hidden'));
      document.getElementById(view).classList.remove('hidden');
      if (view === 'pagesView') renderPagesList();
    };
  });
  document.querySelector('.logout').onclick = () => location.reload();

  // === PAGES LIST ===
  function renderPagesList() {
    const list = document.getElementById('pagesList');
    list.innerHTML = '';
    db.pages.forEach(p => {
      const div = document.createElement('div');
      div.style = 'padding:12px; background:white; margin:8px 0; border-radius:6px; display:flex; justify-content:space-between;';
      div.innerHTML = `<strong>${p.title}</strong> <small>/${p.slug}.html</small>`;
      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.onclick = () => openPageEditor(p.id);
      div.appendChild(edit);
      list.appendChild(div);
    });
  }

  document.getElementById('newPageBtn').onclick = () => {
    const title = prompt("Page title?");
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-');
    const id = Date.now().toString(36);
    db.pages.push({ id, title, slug, content: [] });
    save();
    openPageEditor(id);
  };

  // === BLOCK EDITOR ===
  const blocks = ['Heading','Paragraph','Image','YouTube','Button'];
  document.getElementById('addBlockBtn').onclick = () => {
    const type = prompt("Block type:\n" + blocks.join(', '));
    if (!blocks.includes(type)) return;
    const block = { type, id: Math.random().toString(36) };
    if (type==='Heading') block.text = "New Heading";
    if (type==='Paragraph') block.text = "Write something...";
    if (type==='Image') block.src = "";
    if (type==='YouTube') block.url = "";
    if (type==='Button') { block.text="Click me"; block.url="#"; }
    currentPage.content.push(block);
    renderBlocks();
    save();
  };

  let currentPage = null;
  function openPageEditor(id) {
    currentPage = db.pages.find(p=>p.id===id);
    document.getElementById('pageTitle').textContent = currentPage.title;
    document.getElementById('pageTitleInput').value = currentPage.title;
    document.getElementById('pageSlugInput').value = currentPage.slug + '.html';
    renderBlocks();
    document.getElementById('pageEditor').classList.remove('hidden');
    generatePreview();
  }

  function renderBlocks() {
    const con = document.getElementById('blocksContainer');
    con.innerHTML = '';
    currentPage.content.forEach(block => {
      const div = document.createElement('div');
      div.className = 'block';
      if (block.type === 'Heading') div.innerHTML = `<h2 contenteditable>${block.text}</h2>`;
      if (block.type === 'Paragraph') div.innerHTML = `<p contenteditable>${block.text}</p>`;
      if (block.type === 'Image') div.innerHTML = `<img src="${block.src||''}" style="max-width:100%">`;
      if (block.type === 'YouTube') div.innerHTML = `<iframe src="https://www.youtube.com/embed/${extractYouTubeID(block.url||'')}" style="width:100%;height:315px;"></iframe>`;
      if (block.type === 'Button') div.innerHTML = `<a href="${block.url}" style="padding:10px 20px; background:var(--primary); color:white; border-radius:4px; display:inline-block;" contenteditable>${block.text}</a>`;

      const tools = document.createElement('div');
      tools.className = 'block-tools';
      const up = document.createElement('button'); up.textContent='↑'; up.onclick=()=>moveBlock(block.id,-1);
      const down = document.createElement('button'); down.textContent='↓'; down.onclick=()=>moveBlock(block.id,1);
      const del = document.createElement('button'); del.textContent='×'; del.onclick=()=>deleteBlock(block.id);
      tools.append(up,down,del);
      div.appendChild(tools);
      con.appendChild(div);

      div.querySelectorAll('[contenteditable]').forEach(el => {
        el.onblur = () => { block.text = el.innerText; save(); generatePreview(); };
      });
      if (block.type==='Image') {
        const input = document.createElement('input');
        input.type='file'; input.accept='image/*';
        input.onchange = e => {
          const f = e.target.files[0];
          const r = new FileReader();
          r.onload = () => { block.src = r.result; renderBlocks(); save(); generatePreview(); };
          r.readAsDataURL(f);
        };
        div.appendChild(input);
      }
    });
  }

  // === HERO WITH LIVE PREVIEW ===
  document.getElementById('heroPageSelect').onchange = () => loadHero();
  document.getElementById('heroType').onchange = () => {
    document.getElementById('heroImageBox').classList.toggle('hidden', ['none','video'].includes(this.value));
    document.getElementById('heroVideoBox').classList.toggle('hidden', this.value !== 'video');
  };
  document.getElementById('heroUpload').onchange = e => {
    const f = e.target.files[0];
    const r = new FileReader();
    r.onload = () => {
      document.getElementById('heroImageURL').value = r.result;
      document.getElementById('heroPreview').src = r.result;
      document.getElementById('heroPreview').style.display = 'block';
    };
    r.readAsDataURL(f);
  };
  document.getElementById('heroImageURL').oninput = e => {
    document.getElementById('heroPreview').src = e.target.value;
    document.getElementById('heroPreview').style.display = e.target.value ? 'block' : 'none';
  };

  // === SAVE EVERYTHING BUTTON ===
  document.getElementById('saveAllBtn').onclick = () => { save(); alert("All changes saved!"); };

  // Start on Pages tab
  document.querySelector('[data-view="pages"]').click();
});












const PASSWORD = "jesus2025"; // ← change this anytime
let db = { pages: [], heroes: {}, theme: { primary: "#0066cc" } };
let currentPageId = null;

function load() {
  const saved = localStorage.getItem("honestnews_editor_v3");
  if (saved) db = JSON.parse(saved);
  if (db.pages.length === 0) {
    db.pages = [{ id: "home", title: "Home", blocks: [{ type: "heading", content: "Welcome to Honest News" }, { type: "paragraph", content: "Start editing..." }] }];
  }
  renderPageList();
}
function save() { localStorage.setItem("honestnews_editor_v3", JSON.stringify(db)); }

document.addEventListener('DOMContentLoaded', () => {
  // Login
  document.getElementById('loginBtn').onclick = () => {
    if (document.getElementById('adminPass').value === PASSWORD) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('editor').style.display = 'flex';
      load();
    } else document.getElementById('msg').textContent = "Wrong password";
  };

  // Tabs
  document.querySelectorAll('.tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('canvas').innerHTML = '<h1>' + t.textContent + '</h1>';
      if (t.dataset.tab === 'pages') showPagesUI();
      if (t.dataset.tab === 'hero') showHeroUI();
      if (t.dataset.tab === 'theme') showThemeUI();
    };
  });

  function showPagesUI() {
    let html = `<h1>All Pages</h1>`;
    db.pages.forEach(p => {
      html += `<button style="display:block;width:100%;padding:15px;margin:8px 0;background:white;border:1px solid #ddd;" onclick="openPage('${p.id}')">${p.title}</button>`;
    });
    html += `<br><button id="newPageBtn" style="width:100%;padding:20px;background:var(--blue);color:white;">+ New Page</button>`;
    document.getElementById('canvas').innerHTML = html;
    document.getElementById('newPageBtn').onclick = () => {
      const title = prompt("Page title?");
      if (title) {
        const id = Date.now().toString(36);
        db.pages.push({ id, title, blocks: [] });
        save(); openPage(id);
      }
    };
  }

  window.openPage = function(id) {
    const page = db.pages.find(p => p.id === id);
    currentPageId = id;
    document.getElementById('pageTitleDisplay').textContent = page.title + " (editing)";
    renderBlocks(page.blocks);
    updatePreview();
  };

  function renderBlocks(blocks) {
    const container = document.getElementById('blocks');
    container.innerHTML = '';
    blocks.forEach((b, i) => {
      const div = document.createElement('div');
      div.className = 'block';
      div.dataset.index = i;
      div.innerHTML = blockHTML(b);
      div.onclick = () => selectBlock(i);
      container.appendChild(div);
    });
  }

  function blockHTML(b) {
    if (b.type === 'heading') return `<h2 contenteditable>${b.content}</h2>`;
    if (b.type === 'paragraph') return `<p contenteditable>${b.content}</p>`;
    if (b.type === 'image') return `<img src="${b.src}" style="max-width:100%;">`;
    return '';
  }

  document.getElementById('addBlock').onclick = () => {
    const type = prompt("Block type: heading, paragraph, image");
    if (!currentPageId) return alert("Open a page first");
    const page = db.pages.find(p => p.id === currentPageId);
    page.blocks.push({ type, content: type === 'image' ? '' : 'New ' + type });
    renderBlocks(page.blocks);
    save(); updatePreview();
  };

  document.getElementById('saveAll').onclick = () => { save(); alert("Saved!"); };

  // Live preview (including parallax hero)
  function updatePreview() {
    const page = db.pages.find(p => p.id === currentPageId) || db.pages[0];
    const hero = db.heroes[page.id] || { type:"none" };
    let html = `<!DOCTYPE html><html><head><style>body{margin:0;background:#fff;font-family:sans-serif;}</style></head><body>`;
    if (hero.type === 'image') html += `<div style="height:100vh;background:url(${hero.src}) center/cover no-repeat fixed; display:flex;align-items:center;justify-content:center;color:white;text-align:center;"><h1 style="font-size:4rem;text-shadow:0 0 20px #000;">${page.title}</h1></div>`;
    page.blocks.forEach(b => {
      if (b.type === 'heading') html += `<h1 style="text-align:center;padding:40px;">${b.content}</h1>`;
      if (b.type === 'paragraph') html += `<p style="max-width:800px;margin:40px auto;line-height:1.8;font-size:1.2rem;">${b.content}</p>`;
    });
    html += `</body></html>`;
    const blob = new Blob([html], {type: 'text/html'});
    document.getElementById('previewFrame').src = URL.createObjectURL(blob);
  }

  // Start
  showPagesUI();
});












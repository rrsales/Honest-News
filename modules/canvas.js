// modules/canvas.js
// Handles the central canvas preview and live updates

const canvas = document.getElementById("canvasContent");

let currentPage = null;

// ---------- Render Canvas ----------
export function renderCanvas(page = null) {
  if (!page) {
    canvas.innerHTML = `<div class="placeholder">Select a page to preview its content.</div>`;
    return;
  }

  currentPage = page;
  const hero = page.hero || {};
  const behavior = hero.behavior || "still";
  const size = hero.size || "medium";
  const transparent = hero.transparentHeader ? "On" : "Off";

  canvas.innerHTML = `
    <div class="canvasInner">
      <section class="hero hero-${behavior} hero-${size}">
        <div class="heroInfo">
          <h1>${page.title}</h1>
          <p>Hero behavior: <strong>${behavior}</strong></p>
          <p>Hero size: <strong>${size}</strong></p>
          <p>Transparent header: <strong>${transparent}</strong></p>
        </div>
      </section>
      <section class="contentBlocks">
        <p>This is where content blocks will appear.</p>
      </section>
    </div>
  `;
}

// ---------- Respond to Page Selection ----------
window.addEventListener("pageSelected", e => renderCanvas(e.detail));

// ---------- Respond to Inspector Updates ----------
window.addEventListener("pageUpdated", e => renderCanvas(e.detail));

// ---------- Init ----------
window.addEventListener("load", () => {
  renderCanvas(null);
});

// ---------- Styles ----------
const style = document.createElement("style");
style.textContent = `
#canvasContent {
  flex:1;
  overflow:auto;
  padding:1rem;
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--text);
}

.canvasInner {
  width:100%;
  max-width:900px;
  background:#0f172a;
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow-soft);
  overflow:hidden;
}

.hero {
  padding:3rem 2rem;
  text-align:center;
  background:linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%);
  color:white;
}
.hero-small {padding:2rem;}
.hero-medium {padding:3rem;}
.hero-large {padding:5rem;}
.hero-full {padding:8rem 2rem;}

.heroInfo h1 {margin:0;font-size:1.8rem;}
.contentBlocks {padding:2rem;color:#cbd5e1;}
.placeholder {opacity:.5;text-align:center;}
`;
document.head.appendChild(style);

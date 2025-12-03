// modules/containers.js
// CMS-connected Content Block Manager

import { getPages, updatePages } from "./dataService.js";

let activePage = null;
const canvasContent = document.getElementById("canvasContent");

// ---------- RENDER ----------
function renderBlocks() {
  if (!activePage) {
    canvasContent.innerHTML = `<div class="placeholder">Select a page to manage content.</div>`;
    return;
  }

  const blocks = activePage.blocks || [];
  canvasContent.innerHTML = `
    <div class="canvasInner">
      <section class="hero-preview">
        <h2>${activePage.title}</h2>
        <p>Theme: ${activePage.theme}</p>
        <p>Hero: ${activePage.hero?.behavior || "none"}</p>
      </section>

      <div id="contentBlocks">
        <h3>Content Blocks</h3>
        <ul>
          ${blocks
            .map(
              (b, i) => `
            <li data-index="${i}">
              <span>${b.type.toUpperCase()}</span>
              <div class="actions">
                <button class="editBlock"><i class="fa fa-pen"></i></button>
                <button class="deleteBlock"><i class="fa fa-trash"></i></button>
              </div>
            </li>`
            )
            .join("")}
        </ul>
        <button id="addBlockBtn"><i class="fa fa-plus"></i> Add Block</button>
      </div>
    </div>
  `;

  attachListeners();
}

// ---------- LISTENERS ----------
function attachListeners() {
  document.querySelectorAll(".editBlock").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const index = parseInt(li.dataset.index);
      editBlock(index);
    };
  });

  document.querySelectorAll(".deleteBlock").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const index = parseInt(li.dataset.index);
      if (confirm("Delete this block?")) deleteBlock(index);
    };
  });

  const addBtn = document.getElementById("addBlockBtn");
  if (addBtn) addBtn.onclick = () => addBlock();
}

// ---------- CRUD ----------
function addBlock() {
  const type = prompt("Block type (text/image/embed):", "text");
  if (!type) return;

  const newBlock =
    type === "text"
      ? { type: "text", content: "New text..." }
      : { type, content: "" };

  if (!activePage.blocks) activePage.blocks = [];
  activePage.blocks.push(newBlock);
  savePage();
  renderBlocks();
}

function editBlock(index) {
  const block = activePage.blocks[index];
  if (block.type === "text") {
    const newText = prompt("Edit text content:", block.content);
    if (newText !== null) {
      block.content = newText;
      savePage();
      renderBlocks();
    }
  } else {
    alert("Editing for this block type coming soon!");
  }
}

function deleteBlock(index) {
  activePage.blocks.splice(index, 1);
  savePage();
  renderBlocks();
}

// ---------- SAVE ----------
function savePage() {
  const pages = getPages();
  const idx = pages.findIndex(p => p.slug === activePage.slug);
  if (idx > -1) {
    pages[idx] = activePage;
    updatePages(pages);
  }
}

// ---------- LISTENERS FROM OTHER MODULES ----------
window.addEventListener("pageSelected", e => {
  activePage = e.detail;
  renderBlocks();
});

window.addEventListener("pageUpdated", e => {
  activePage = e.detail;
  renderBlocks();
});

// ---------- STYLES ----------
const style = document.createElement("style");
style.textContent = `
#canvasCon


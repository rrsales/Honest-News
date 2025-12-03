// modules/main.js
// Main controller: initializes dashboard, loads modules, handles UI toggles

import { setPages } from "./pages.js";
import { renderMenuPanel } from "./menu.js";
import { renderInspector } from "./inspector.js";
import { renderCanvas } from "./canvas.js";
import { initContainers } from "./containers.js";
import { renderTextEditor } from "./textEditor.js";

// ---------- UI ELEMENTS ----------
const leftPanel = document.getElementById("leftPanel");
const rightPanel = document.getElementById("rightPanel");
const toggleLeft = document.getElementById("toggleLeft");
const toggleRight = document.getElementById("toggleRight");

// ---------- Sidebar Toggles ----------
toggleLeft.addEventListener("click", () => {
  leftPanel.classList.toggle("show");
});

toggleRight.addEventListener("click", () => {
  rightPanel.classList.toggle("show");
});

// ---------- Initialization ----------
window.addEventListener("load", () => {
  console.log("🚀 Honest News CMS loaded");

  // Load pages from storage or set default
  const savedPages = JSON.parse(localStorage.getItem("hn_pages") || "[]");
  if (savedPages.length) setPages(savedPages);

  // Render menu
  renderMenuPanel();

  // Initialize empty inspector and canvas
  renderInspector(null);
  renderCanvas(null);

  // Initialize containers (content blocks)
  initContainers();

  // Initialize text editor
  renderTextEditor(null);
});

// ---------- Cross-Module Event Handling ----------

// When a block is updated, re-render the canvas
window.addEventListener("blockUpdated", e => {
  const updated = e.detail;
  console.log("Block updated:", updated);
  // Just refresh the canvas visually
  renderCanvas(JSON.parse(localStorage.getItem("hn_pages"))?.find(p =>
    p.blocks?.some(b => b.content === updated.content)
  ));
});

// ---------- Hotkey: ESC closes panels ----------
window.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    leftPanel.classList.remove("show");
    rightPanel.classList.remove("show");
  }
});

// ---------- Optional: Auto-resize behavior ----------
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    leftPanel.classList.remove("show");
    rightPanel.classList.remove("show");
  }
});

// ---------- Styles for overall behavior ----------
const style = document.createElement("style");
style.textContent = `
/* Smooth transitions for panels */
#leftPanel, #rightPanel {
  transition: transform 0.3s ease;
}
#leftPanel.show { transform: translateX(0); }
#rightPanel.show { transform: translateX(0); }

/* Scrollbars */
::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-thumb { background:#1e293b;border-radius:3px; }
`;
document.head.appendChild(style);

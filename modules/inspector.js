// modules/inspector.js
import { getPages, updatePages } from "./dataService.js";

const inspectorPanel = document.getElementById("inspectorPanel");
let current = null;

export function renderInspector(page = null) {
  if (!page) {
    inspectorPanel.innerHTML = `<p>Select a page.</p>`;
    return;
  }

  current = page;
  const theme = page.theme || "light";
  const tm = page.hero && page.hero.transparentMenu ? "checked" : "";

  inspectorPanel.innerHTML = `
    <div class="panelHeader"><h2>Inspector</h2></div>
    <label>
      Title
      <input id="inpTitle" value="${escapeHtml(page.title || "")}">
    </label>
    <label>
      Theme
      <select id="inpTheme">
        <option value="light"${theme === "light" ? " selected" : ""}>Light</option>
        <option value="dark"${theme === "dark" ? " selected" : ""}>Dark</option>
      </select>
    </label>
    <label>
      <input type="checkbox" id="inpTrans" ${tm}> Transparent Menu
    </label>
    <button id="saveIns">Save</button>
  `;

  document.getElementById("saveIns").onclick = () => {
    const all = getPages();
    const idx = all.findIndex(p => p.slug === current.slug);

    current.title = document.getElementById("inpTitle").value;
    current.theme = document.getElementById("inpTheme").value;
    if (!current.hero) current.hero = {};
    current.hero.transparentMenu = document.getElementById("inpTrans").checked;

    if (idx !== -1) {
      all[idx] = current;
      updatePages(all);
    }

    window.dispatchEvent(new CustomEvent("pageUpdated", { detail: current }));
  };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s];
  });
}

window.addEventListener("pageSelected", e => renderInspector(e.detail));
window.addEventListener("load", () => renderInspector(null));






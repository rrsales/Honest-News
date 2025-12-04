// modules/inspector.js
import { getPages, updatePages } from "./dataService.js";

const inspectorPanel = document.getElementById("inspectorPanel");
let current = null;

export function renderInspector(page=null) {
  if (!page) {
    inspectorPanel.innerHTML = `<p>Select a page.</p>`;
    return;
  }
  current = page;
  const tm = page.hero.transparentMenu?"checked":"";
  const th = page.theme||"light";
  inspectorPanel.innerHTML = `
    <div class="panelHeader"><h2>Inspector</h2></div>
    <label>Title<input id="inpTitle" value="${page.title}"></label>
    <label>Theme<select id="inpTheme">
      <option value="light"${th==="light"?" selected":""}>Light</option>
      <option value="dark"${th==="dark"?" selected":""}>Dark</option>
    </select></label>
    <label><input type="checkbox" id="inpTrans" ${tm}> Transparent Menu</label>
    <button id="saveIns">Save</button>`;
  document.getElementById("saveIns").onclick = () => {
    current.title = document.getElementById("inpTitle").value;
    current.theme = document.getElementById("inpTheme").value;
    current.hero.transparentMenu = document.getElementById("inpTrans").checked;
    const all = getPages();
    const idx = all.findIndex(p=>p.slug===current.slug);
    all[idx] = current;
    updatePages(all);
    window.dispatchEvent(new CustomEvent("pageUpdated",{detail:current}));
  };
}

window.addEventListener("pageSelected",e=>renderInspector(e.detail));
window.addEventListener("load",()=>renderInspector(null));




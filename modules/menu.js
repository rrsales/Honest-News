// modules/menu.js
// Connected to dataService.js to manage site menu + mega menu items

import { getMenu, updateMenu } from "./dataService.js";

const menuPanel = document.getElementById("menuPanel");
let menuData = [];

// ---------- RENDER ----------
export function renderMenuPanel(data = null) {
  menuData = data || getMenu();

  menuPanel.innerHTML = `
    <div class="panelHeader">
      <h2>Menu</h2>
      <button id="addMenuItem"><i class="fa fa-plus"></i></button>
    </div>

    <ul id="menuList">
      ${menuData
        .map(
          (item, i) => `
        <li data-index="${i}">
          <div class="menuLabel">
            <strong>${item.label}</strong>
            <span class="type">${item.type}</span>
          </div>
          <div class="actions">
            <button class="editItem"><i class="fa fa-pen"></i></button>
            <button class="deleteItem"><i class="fa fa-trash"></i></button>
          </div>

          ${
            item.type === "mega"
              ? `
            <ul class="subList">
              ${item.subItems
                .map(
                  (sub, j) => `
                <li data-parent="${i}" data-subindex="${j}">
                  <span>${sub.label}</span>
                  <div class="actions">
                    <button class="editSub"><i class="fa fa-pen"></i></button>
                    <button class="deleteSub"><i class="fa fa-trash"></i></button>
                  </div>
                </li>`
                )
                .join("")}
              <li class="addSub" data-parent="${i}">
                <button><i class="fa fa-plus"></i> Add Sub-Item</button>
              </li>
            </ul>`
              : ""
          }
        </li>`
        )
        .join("")}
    </ul>
  `;

  attachMenuListeners();
}

// ---------- EVENT HANDLERS ----------
function attachMenuListeners() {
  const addBtn = document.getElementById("addMenuItem");
  if (addBtn) addBtn.onclick = () => addMenuItem();

  // Main items
  menuPanel.querySelectorAll(".editItem").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const i = parseInt(li.dataset.index);
      editMenuItem(i);
    };
  });

  menuPanel.querySelectorAll(".deleteItem").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const i = parseInt(li.dataset.index);
      if (confirm("Delete this menu item?")) deleteMenuItem(i);
    };
  });

  // Sub items
  menuPanel.querySelectorAll(".editSub").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const parent = parseInt(li.dataset.parent);
      const subindex = parseInt(li.dataset.subindex);
      editSubItem(parent, subindex);
    };
  });

  menuPanel.querySelectorAll(".deleteSub").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const parent = parseInt(li.dataset.parent);
      const subindex = parseInt(li.dataset.subindex);
      if (confirm("Delete this sub-item?")) deleteSubItem(parent, subindex);
    };
  });

  menuPanel.querySelectorAll(".addSub button").forEach(btn => {
    btn.onclick = e => {
      const parent = parseInt(e.target.closest(".addSub").dataset.parent);
      addSubItem(parent);
    };
  });
}

// ---------- CRUD ----------
function addMenuItem() {
  const label = prompt("Label for new menu item:");
  if (!label) return;
  const type = prompt("Type: link or mega?", "link");

  if (type === "mega") {
    menuData.push({ label, type: "mega", subItems: [] });
  } else {
    const url = prompt("Enter link URL (e.g. about.html):");
    menuData.push({ label, url, type: "link" });
  }

  updateMenu(menuData);
  renderMenuPanel(menuData);
}

function editMenuItem(index) {
  const item = menuData[index];
  const newLabel = prompt("Edit label:", item.label);
  if (!newLabel) return;

  if (item.type === "link") {
    const newUrl = prompt("Edit URL:", item.url);
    menuData[index] = { ...item, label: newLabel, url: newUrl };
  } else {
    menuData[index].label = newLabel;
  }

  updateMenu(menuData);
  renderMenuPanel(menuData);
}

function deleteMenuItem(index) {
  menuData.splice(index, 1);
  updateMenu(menuData);
  renderMenuPanel(menuData);
}

// ---------- SubItem functions ----------
function addSubItem(parent) {
  const label = prompt("Sub-item label:");
  const url = prompt("Sub-item URL:");
  if (!label || !url) return;

  menuData[parent].subItems.push({ label, url });
  updateMenu(menuData);
  renderMenuPanel(menuData);
}

function editSubItem(parent, subindex) {
  const sub = menuData[parent].subItems[subindex];
  const newLabel = prompt("Edit sub-item label:", sub.label);
  const newUrl = prompt("Edit sub-item URL:", sub.url);
  if (!newLabel || !newUrl) return;

  menuData[parent].subItems[subindex] = { label: newLabel, url: newUrl };
  updateMenu(menuData);
  renderMenuPanel(menuData);
}

function deleteSubItem(parent, subindex) {
  menuData[parent].subItems.splice(subindex, 1);
  updateMenu(menuData);
  renderMenuPanel(menuData);
}

// ---------- INIT ----------
window.addEventListener("load", () => {
  renderMenuPanel(getMenu());
});

// ---------- STYLES ----------
const style = document.createElement("style");
style.textContent = `
#menuPanel {padding:1rem;}
#menuPanel .panelHeader {display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;}
#menuPanel h2 {font-size:1rem;margin:0;color:var(--accent);}
#menuPanel ul {list-style:none;padding:0;margin:0;}
#menuPanel > ul > li {margin-bottom:.4rem;padding:.3rem;border-radius:.4rem;transition:background .2s;}
#menuPanel > ul > li:hover {background:rgba(255,255,255,0.05);}
#menuPanel .menuLabel {display:flex;align-items:center;justify-content:space-between;}
#menuPanel .type {font-size:.75rem;opacity:.6;margin-left:.5rem;}
#menuPanel .actions button {background:none;border:none;color:var(--text);cursor:pointer;margin-left:.3rem;}
#menuPanel .subList {margin-left:1rem;margin-top:.4rem;border-left:1px solid var(--border);padding-left:.6rem;}
#menuPanel .subList li {display:flex;align-items:center;justify-content:space-between;padding:.2rem 0;}
#menuPanel .subList .actions button {font-size:.8rem;}
#menuPanel .addSub button {background:none;border:1px solid var(--border);border-radius:.4rem;padding:.2rem .5rem;color:var(--text);cursor:pointer;}
`;
document.head.appendChild(style);


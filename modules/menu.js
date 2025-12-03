// modules/menu.js
// Handles the site navigation + mega menu editor

const menuPanel = document.getElementById("menuPanel");

let menuData = {
  regular: [
    { label: "Home", link: "index.html" },
    { label: "About Us", link: "about.html" },
    { label: "Contact", link: "contact.html" }
  ],
  mega: [
    {
      label: "Resources",
      columns: [
        ["Podcasts", "Books"],
        ["Articles", "News"]
      ]
    }
  ]
};

// ---------- RENDER ----------
export function renderMenuPanel() {
  menuPanel.innerHTML = `
    <div class="panelHeader">
      <h2>Menu</h2>
      <button id="addMenuItem"><i class="fa fa-plus"></i></button>
    </div>

    <h3>Regular Menu</h3>
    <ul id="regularMenuList">
      ${menuData.regular
        .map(
          (item, i) => `
          <li data-type="regular" data-index="${i}">
            <span class="menuLabel">${item.label}</span>
            <div class="actions">
              <button class="editItem"><i class="fa fa-pen"></i></button>
              <button class="deleteItem"><i class="fa fa-trash"></i></button>
            </div>
          </li>`
        )
        .join("")}
    </ul>

    <h3>Mega Menu</h3>
    <ul id="megaMenuList">
      ${menuData.mega
        .map(
          (item, i) => `
          <li data-type="mega" data-index="${i}">
            <span class="menuLabel">${item.label}</span>
            <div class="actions">
              <button class="editItem"><i class="fa fa-pen"></i></button>
              <button class="deleteItem"><i class="fa fa-trash"></i></button>
            </div>
          </li>`
        )
        .join("")}
    </ul>
  `;
  attachMenuListeners();
}

// ---------- EVENT HANDLERS ----------
function attachMenuListeners() {
  menuPanel.querySelector("#addMenuItem").onclick = () => addRegularItem();

  menuPanel.querySelectorAll(".editItem").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const type = li.dataset.type;
      const index = parseInt(li.dataset.index);
      if (type === "regular") editRegularItem(index);
      else editMegaItem(index);
    };
  });

  menuPanel.querySelectorAll(".deleteItem").forEach(btn => {
    btn.onclick = e => {
      const li = e.target.closest("li");
      const type = li.dataset.type;
      const index = parseInt(li.dataset.index);
      if (confirm("Delete this item?")) deleteMenuItem(type, index);
    };
  });
}

// ---------- CRUD ----------
function addRegularItem() {
  const label = prompt("Label:");
  const link = prompt("Link (e.g., about.html):");
  if (!label || !link) return;
  menuData.regular.push({ label, link });
  saveMenu();
  renderMenuPanel();
}

function editRegularItem(index) {
  const item = menuData.regular[index];
  const label = prompt("Edit Label:", item.label);
  const link = prompt("Edit Link:", item.link);
  if (!label || !link) return;
  menuData.regular[index] = { label, link };
  saveMenu();
  renderMenuPanel();
}

function editMegaItem(index) {
  const item = menuData.mega[index];
  const label = prompt("Mega menu title:", item.label || "Mega Menu");
  let columnsText = item.columns.map(col => col.join(", ")).join(" | ");
  const newCols = prompt(
    "Edit columns (use commas between items, | between columns):",
    columnsText
  );
  if (!newCols) return;
  const columns = newCols.split("|").map(c => c.split(",").map(s => s.trim()));
  menuData.mega[index] = { label, columns };
  saveMenu();
  renderMenuPanel();
}

function deleteMenuItem(type, index) {
  menuData[type].splice(index, 1);
  saveMenu();
  renderMenuPanel();
}

// ---------- STORAGE ----------
function saveMenu() {
  localStorage.setItem("hn_menu", JSON.stringify(menuData));
}

function loadMenu() {
  const saved = localStorage.getItem("hn_menu");
  if (saved) menuData = JSON.parse(saved);
}

// ---------- INIT ----------
window.addEventListener("load", () => {
  loadMenu();
  renderMenuPanel();
});

// ---------- STYLES ----------
const style = document.createElement("style");
style.textContent = `
#menuPanel {padding:1rem;}
#menuPanel .panelHeader {display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;}
#menuPanel h2 {font-size:1rem;margin:0;color:var(--accent);}
#menuPanel h3 {font-size:.9rem;color:var(--text);margin:.6rem 0 .2rem;}
#menuPanel ul {list-style:none;padding:0;margin:0;}
#menuPanel li {display:flex;align-items:center;justify-content:space-between;padding:.35rem .25rem;border-radius:.5rem;transition:background .2s;}
#menuPanel li:hover {background:rgba(255,255,255,0.05);}
#menuPanel .menuLabel {cursor:pointer;}
#menuPanel .actions button {margin-left:.3rem;background:none;border:none;color:var(--text);cursor:pointer;font-size:.9rem;}
`;
document.head.appendChild(style);

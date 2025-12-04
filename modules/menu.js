// modules/menu.js
import { getMenu, updateMenu } from "./dataService.js";

const menuPanel = document.getElementById("menuPanel");
let menuData = [];

export function renderMenuPanel(data=null) {
  menuData = data || getMenu();
  menuPanel.innerHTML = `
    <div class="panelHeader">
      <h2>Menu</h2><button id="addMenuItem"><i class="fa fa-plus"></i></button>
    </div>
    <ul id="menuList">
      ${menuData.map((it,i)=>`
        <li data-index="${i}">
          <span>${it.label} <em>${it.type}</em></span>
          <div class="actions">
            <button class="editItem"><i class="fa fa-pen"></i></button>
            <button class="deleteItem"><i class="fa fa-trash"></i></button>
          </div>
        </li>`).join("")}
    </ul>`;
  attachListeners();
}

function attachListeners() {
  document.getElementById("addMenuItem").onclick = ()=> {
    const lbl = prompt("Label:");
    if (!lbl) return;
    const type = prompt("Type (link or mega):","link");
    if (type==="mega") {
      menuData.push({ label: lbl, type:"mega", subItems:[] });
    } else {
      const url = prompt("URL:");
      menuData.push({ label: lbl, type:"link", url });
    }
    save();
  };
  menuPanel.querySelectorAll(".editItem").forEach(btn=>{
    btn.onclick = e => {
      const i = +e.target.closest("li").dataset.index;
      const item = menuData[i];
      const lbl = prompt("Label:", item.label);
      if (!lbl) return;
      if (item.type==="link") {
        const url = prompt("URL:", item.url);
        menuData[i] = { label:lbl, type:"link", url };
      } else {
        menuData[i].label = lbl;
      }
      save();
    };
  });
  menuPanel.querySelectorAll(".deleteItem").forEach(btn=>{
    btn.onclick = e => {
      const i = +e.target.closest("li").dataset.index;
      if (confirm("Delete this item?")) {
        menuData.splice(i,1);
        save();
      }
    };
  });
}

function save() {
  updateMenu(menuData);
  renderMenuPanel(menuData);
}

window.addEventListener("load",()=>renderMenuPanel(getMenu()));






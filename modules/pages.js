// modules/pages.js
import { getPages, updatePages } from "./dataService.js";

const pagesPanel = document.getElementById("pagesPanel");
let pages = [];

export function setPages(data) {
  pages = data || getPages();
  renderPages();
}

function renderPages() {
  pagesPanel.innerHTML = `
    <div class="panelHeader">
      <h2>Pages</h2>
      <button id="addPageBtn"><i class="fa fa-plus"></i></button>
    </div>
    <ul id="pagesList">
      ${pages
        .map((p, i) => `
      <li data-index="${i}">
        <span class="pageTitle">${p.title}</span>
        <div class="actions">
          <button class="renamePage"><i class="fa fa-pen"></i></button>
          <button class="deletePage"><i class="fa fa-trash"></i></button>
        </div>
      </li>`)
        .join("")}
    </ul>
  `;
  attachListeners();
}

function attachListeners() {
  document.getElementById("addPageBtn").onclick = () => {
    const title = prompt("New page title:");
    if (title) addPage(title);
  };

  document.querySelectorAll(".renamePage").forEach((btn) => {
    btn.onclick = (e) => {
      const li = e.target.closest("li");
      const i = +li.dataset.index;
      const t = prompt("Rename page:", pages[i].title);
      if (t) {
        pages[i].title = t;
        pages[i].slug = t.toLowerCase().replace(/\s+/g, "-");
        save();
      }
    };
  });

  document.querySelectorAll(".deletePage").forEach((btn) => {
    btn.onclick = (e) => {
      const i = +e.target.closest("li").dataset.index;
      if (confirm("Delete this page?")) {
        pages.splice(i, 1);
        save();
      }
    };
  });

  document.querySelectorAll(".pageTitle").forEach((span) => {
    span.onclick = (e) => {
      const p = pages[+e.target.closest("li").dataset.index];
      window.dispatchEvent(new CustomEvent("pageSelected", { detail: p }));
    };
  });
}

function addPage(title) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  pages.push({ title, slug, theme: "light", hero: { transparentMenu: false }, blocks: [] });
  save();
}

function save() {
  updatePages(pages);
  renderPages();
}

window.addEventListener("load", () => setPages(getPages()));




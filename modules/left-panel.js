// left-panel.js
// 0Builder CMS Platform 1.0

import { subscribe, publish } from "./core.js";

const leftPanel = document.getElementById("leftPanel");
const pagesPanel = document.getElementById("pagesPanel");
const menuPanel = document.getElementById("menuPanel");

function showPanel(panelName) {
  if (!leftPanel) return;
  pagesPanel.style.display = panelName === "pages" ? "block" : "none";
  menuPanel.style.display = panelName === "menu" ? "block" : "none";
}

export { showPanel };


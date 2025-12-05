// pages.js
// 0Builder CMS Platform 1.0

import { publish } from "./core.js";

let current = null;
let site = { pages: [] };

function setSiteData(data) { site = data; }
function getCurrentPage() { return current; }
function selectPage(index) {
  current = site.pages[index];
  publish("pageSelected", current);
}

export { selectPage, getCurrentPage, setSiteData };


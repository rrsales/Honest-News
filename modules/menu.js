// menu.js
// 0Builder CMS Platform 1.0

import { publish } from "./core.js";

let menu = [];

function setMenu(data) { menu = data; publish("menuUpdated", menu); }
function addMenuItem(item) { menu.push(item); publish("menuUpdated", menu); }

export { setMenu, addMenuItem };

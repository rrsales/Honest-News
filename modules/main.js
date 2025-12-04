// modules/main.js
import { loadCMSData, getMenu, getPages, exportData } from "./dataService.js";
import { setPages } from "./pages.js";
import { renderMenuPanel } from "./menu.js";
import { renderInspector } from "./inspector.js";
import { renderCanvas } from "./canvas.js";

async function init() {
  console.log("🚀 Honest News CMS loading…");
  await loadCMSData();
  setPages(getPages());
  renderMenuPanel(getMenu());
  renderInspector(null);
  renderCanvas(null);
  injectPublish();
}

function injectPublish() {
  const hdr = document.querySelector("header");
  const btn = document.createElement("button");
  btn.textContent = "Publish JSON";
  btn.onclick = () => {
    const blob = new Blob([exportData()],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.json";
    a.click();
  };
  hdr.appendChild(btn);
}

window.addEventListener("load", init);
document.getElementById("toggleLeft").onclick = () =>
  document.getElementById("leftPanel").classList.toggle("show");
document.getElementById("toggleRight").onclick = () =>
  document.getElementById("rightPanel").classList.toggle("show");





// modules/main.js
import { loadCMSData, getPages, getMenu, exportData } from "./dataService.js";
import { setPages } from "./pages.js";
import { renderMenuPanel } from "./menu.js";
import { renderInspector } from "./inspector.js";
import { renderCanvas } from "./canvas.js";

async function init(){
  await loadCMSData();
  setPages(getPages());
  renderMenuPanel(getMenu());
  renderInspector(null);
  renderCanvas(null);
  injectPublish();
}
function injectPublish(){
  let hdr=document.querySelector("header"),btn=document.createElement("button");
  btn.textContent="Publish JSON";
  btn.onclick=()=>{
    let blob=new Blob([exportData()],{type:"application/json"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download="data.json";a.click();
  };
  hdr.appendChild(btn);
}
window.addEventListener("load",init);
document.getElementById("toggleLeft").onclick=()=>document.getElementById("leftPanel").classList.toggle("show");
document.getElementById("toggleRight").onclick=()=>document.getElementById("rightPanel").classList.toggle("show");



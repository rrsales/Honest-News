// right-panel.js
// 0Builder CMS Platform 1.0

import { subscribe, publish } from "./core.js";

const panel = document.getElementById("inspectorPanel");
const handle = document.getElementById("panelHandle");
const closeBtn = document.getElementById("closePanelBtn");

let panelBehavior = localStorage.getItem("hn_panel_behavior") || "auto";

function isPanelOpen() { return panel && panel.classList.contains("open"); }
function openPanel(reason){
  if (!panel || !handle) return;
  if (panelBehavior === "manual" && reason !== "manual") return;
  panel.classList.add("open");
  handle.style.display = "none";
}
function closePanel(reason){
  if (!panel || !handle) return;
  if (panelBehavior === "pinned") return;
  panel.classList.remove("open");
  handle.style.display = "flex";
}
function togglePanelManual(){ if(isPanelOpen()) closePanel("manual"); else openPanel("manual"); }
function applyPanelBehavior(){
  if (!panel || !handle) return;
  if(panelBehavior === "pinned"){ panel.classList.add("open"); handle.style.display="none"; }
  else { handle.style.display = isPanelOpen() ? "none" : "flex"; }
}

if (handle) handle.addEventListener("click", ()=>togglePanelManual());
if (closeBtn) closeBtn.addEventListener("click", ()=>closePanel("manual"));
document.addEventListener("keydown", (e)=>{
  if(e.shiftKey && e.key.toLowerCase()==="p") togglePanelManual();
});

export { openPanel, closePanel, applyPanelBehavior };


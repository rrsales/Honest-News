// left-panel.js
// 0Builder CMS Platform 1.0
// (c) 2025 0Builder.LLC

/*
  LEFT PANEL: Pages accordion, nav/raw editor (left sidebar)
*/

import { site, current, markDirty, escapeHtml, publish } from "./core.js";

// Accordion for sidebar sections
export function toggleSidebarSection(which){
  const body    = document.getElementById(which + "Section");
  const chevron = document.getElementById(which + "Chevron");
  if (!body) return;
  const wasClosed = body.classList.contains("closed");
  // Close all
  document.querySelectorAll(".sidebar-section-body").forEach(el=>{
    el.classList.add("closed");
  });
  document.querySelectorAll(".sidebar-chevron").forEach(el=>{
    el.classList.remove("rotated");
  });
  // If it was closed, open it
  if (wasClosed){
    body.classList.remove("closed");
    if (chevron) chevron.classList.add("rotated");
  }
}
export function openSidebarSection(which){
  const body    = document.getElementById(which + "Section");
  const chevron = document.getElementById(which + "Chevron");
  if (!body) return;
  document.querySelectorAll(".sidebar-section-body").forEach(el=>{
    el.classList.add("closed");
  });
  document.querySelectorAll(".sidebar-chevron").forEach(el=>{
    el.classList.remove("rotated");
  });
  body.classList.remove("closed");
  if (chevron) chevron.classList.add("rotated");
}

// Pages (for left panel list)
export function renderPages(){
  const container = document.getElementById("pages");
  const pagesArr = site.pages || [];
  if (!container) return;
  container.innerHTML = pagesArr.map((p,i)=>`
    <div class="page ${p===current?'active':''}" onclick="_obuilder_selectPage(${i})">
      <div class="page-main">
        <span class="title">${p.title || 'Untitled'}</span>
        <span class="slug">${p.slug || ''}</span>
      </div>
      <button class="page-delete-btn" title="Delete page"
        onclick="event.stopPropagation();_obuilder_deletePage(${i});">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
  `).join("");
  rawFromMenu();
}

// Raw nav editor
export function rawFromMenu(){
  const ta = document.getElementById("menuRaw");
  if(!ta) return;
  const menuArr = site.menu || [];
  ta.value = menuArr.map(m=>`${m.label || m.title || 'Item'} | ${m.url || "#"}`).join("\n");
}
export function menuFromRaw(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  site.menu = lines.map((l,idx)=>{
    const [title,url] = l.split("|").map(s=>(s||"").trim());
    return {
      id: (title || "item-"+idx).toLowerCase().replace(/\s+/g,"-"),
      label: title || "Item",
      url: url || "#",
      type:"link",
      showOn:"both",
      subItems:[]
    };
  });
  markDirty();
  publish("menuChanged");
}

// Expose for HTML
window.toggleSidebarSection = toggleSidebarSection;
window.openSidebarSection = openSidebarSection;
window.menuFromRaw = menuFromRaw;
window._obuilder_renderPages = renderPages;
window._obuilder_rawFromMenu = rawFromMenu;

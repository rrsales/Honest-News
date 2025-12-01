/* =========================================
   SECTION 3: SAVE STATUS + PANEL (RIGHT)
   ========================================= */

function markDirty(){
  isDirty = true;
  if (saveStatusRight){
    saveStatusRight.textContent = "Unsaved changes";
    saveStatusRight.classList.add("dirty");
    saveStatusRight.classList.remove("saved");
  }
}
function markSavedLocal(){
  isDirty = false;
  if (saveStatusRight){
    saveStatusRight.textContent = "Saved to cloud";
    saveStatusRight.classList.remove("dirty");
    saveStatusRight.classList.add("saved");
  }
}

function isPanelOpen(){
  return panel.classList.contains("open");
}
function openPanel(reason){
  if (panelBehavior === "manual" && reason !== "manual") {
    return; // respect manual mode
  }
  panel.classList.add("open");
  handle.style.display = "none";
}
function closePanel(reason){
  if (panelBehavior === "pinned") {
    return; // pinned cannot close
  }
  panel.classList.remove("open");
  handle.style.display = "flex";
}
function togglePanelManual(){
  if (isPanelOpen()) closePanel("manual");
  else openPanel("manual");
}
function applyPanelBehavior(){
  if (panelBehavior === "pinned") {
    panel.classList.add("open");
    handle.style.display = "none";
  } else {
    handle.style.display = isPanelOpen() ? "none" : "flex";
  }
}

/* handle + close button + keyboard */
handle.addEventListener("click", ()=>togglePanelManual());
closeBtn.addEventListener("click", ()=>closePanel("manual"));
document.addEventListener("keydown", (e)=>{
  if(e.shiftKey && e.key.toLowerCase()==="p"){
    togglePanelManual();
  }
/* =========================================
   SECTION 4: PAGES (LEFT PANEL) + DELETE
   ========================================= */

// Helper: always treat pages as array
function getPagesArray() {
  if (!site || !site.pages) return [];
  if (Array.isArray(site.pages)) return site.pages;

  if (typeof site.pages === "object") {
    return Object.keys(site.pages).map(k => site.pages[k]);
  }
  return [];
}

function renderPages(){
  const container = document.getElementById("pages");
  if (!container) return;

  const pages = getPagesArray();

  container.innerHTML = pages
    .map((p,i)=> {
      const isActive = (current === p);
      const title = p.title || "Untitled";
      const slug  = p.slug  || "";
      return `
        <div class="page ${isActive ? "active" : ""}">
          <div class="page-main" onclick="selectPage(${i})">
            <span class="title">${escapeHtml(title)}</span>
            <span class="slug">${escapeHtml(slug)}</span>
          </div>
          <button
            type="button"
            class="page-delete-btn"
            title="Delete page"
            onclick="deletePage(${i}, event)"
          >
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;
    })
    .join("");

  rawFromMenu();
}

function newPage(){
  if (!site) site = {};
  if (!Array.isArray(site.pages)) {
    site.pages = getPagesArray();
  }

  const t = prompt("Page title?");
  if (!t) return;

  const slug = t
    .toLowerCase()
    .trim()
    .replace(/\s+/g,"-")
    .replace(/[^a-z0-9\-]/g,"");

  const page = {
    title:t,
    slug:slug || "page-" + (site.pages.length + 1),
    theme:"dark",
    hero:{
      bg:"",
      overlay:t,
      sub:"",
      transparentMenu:false,
      behavior:"still",
      size:"full",
      customHeight:""
    },
    blocks:[]
  };

  site.pages.push(page);
  markDirty();
  renderPages();
  selectPage(site.pages.length - 1);
}

function selectPage(i){
  const pages = getPagesArray();
  const page  = pages[i];
  if (!page) return;

  current = page;
  renderPages();
  updatePreviewHeader();
  renderPreview();
  renderInspectorTab();

  if (["auto","pinned","smart"].includes(panelBehavior)){
    openPanel("auto");
  }
}

function deletePage(index, evt){
  if (evt && evt.stopPropagation) evt.stopPropagation();
  if (!site || !site.pages) return;

  if (!Array.isArray(site.pages)) {
    site.pages = getPagesArray();
  }
  const pages = site.pages;
  const page  = pages[index];
  if (!page) return;

  if (pages.length <= 1) {
    alert("You must keep at least one page in the site.");
    return;
  }

  const label = page.title || page.slug || "Untitled page";
  const ok = confirm(
    `Delete page "${label}"?\n\nThis will remove it from the CMS and site-data.json.`
  );
  if (!ok) return;

  pages.splice(index,1);

  if (current === page) {
    current = pages[0] || null;
  }

  markDirty();
  renderPages();
  updatePreviewHeader();
  renderPreview();
  renderInspectorTab();
}});

// modules/dataService.js
let cmsData = { menu: [], pages: [] };

export async function loadCMSData() {
  try {
    const res = await fetch("./data.json?cb=" + Date.now());
    cmsData = await res.json();
    console.log("✅ CMS data loaded", cmsData);
  } catch (err) {
    console.error("❌ Failed to load data.json:", err);
  }
}

export function getMenu() {
  return cmsData.menu || [];
}
export function getPages() {
  return cmsData.pages || [];
}
export function updateMenu(m) {
  cmsData.menu = m;
}
export function updatePages(p) {
  cmsData.pages = p;
}
export function exportData() {
  return JSON.stringify(cmsData, null, 2);
}




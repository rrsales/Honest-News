// 0Builder CMS Platform 1.0
// (c) 2025 0Builder.LLC

/*
  CORE: State, Data Load/Save, Dirty Status, Draft, Backup, Cloud Publish
  ---------------------------------------------------
  Shared by all modules in the platform.
*/

export const PLATFORM_NAME = "0Builder CMS Platform 1.0";
export const COMPANY_NAME = "0Builder.LLC";
export const DRAFT_KEY = "obuilder_cms_draft_v1";
export const SAVE_ENDPOINT = "https://honest-news.onrender.com/save"; // Update if you use a different endpoint

// Platform-wide state object
export let site = {
  menu: [],
  pages: [],
  theme: {},
  heroSlides: []
};
export let current = null;
export let isDirty = false;

export let activeInspectorTab = "page";
export let panelBehavior = localStorage.getItem("obuilder_panel_behavior") || "auto";

// Utilities for event subscriptions (other modules can listen for events)
const subscribers = {};
export function subscribe(event, fn) {
  if (!subscribers[event]) subscribers[event] = [];
  subscribers[event].push(fn);
}
export function publish(event, data) {
  (subscribers[event] || []).forEach(fn => fn(data));
}

/* =======================
   LOAD site-data.json
======================= */
export async function loadSiteData() {
  let loadedFromServer = false;
  try {
    const res = await fetch("site-data.json?cache-bust=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        Object.assign(site, data);
        loadedFromServer = true;
      }
    }
  } catch (e) {
    console.warn("Could not load site-data.json, will try local draft instead", e);
  }

  if (!loadedFromServer) {
    restoreDraftIfAny();
  }

  publish("dataLoaded", site);
}

/* =======================
   SAVE STATUS
======================= */
export function markDirty() {
  isDirty = true;
  publish("dirty", true);
}
export function markSavedLocal() {
  isDirty = false;
  publish("saved", true);
}

/* =======================
   DRAFT SAVE / RESTORE
======================= */
export function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(site));
    markSavedLocal();
    alert("Draft saved locally (this browser).");
  } catch (e) {
    alert("Could not save draft locally.");
  }
}
export function restoreDraftIfAny() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      Object.assign(site, parsed);
    }
  } catch (e) {
    console.warn("No valid draft to restore");
  }
}

/* =======================
   DOWNLOAD / BACKUP
======================= */
export function downloadJson() {
  const blob = new Blob([JSON.stringify(site, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "site-data.json";
  a.click();
}

export async function backupAll() {
  const zip = new JSZip();
  zip.file("site-data.json", JSON.stringify(site, null, 2));
  const files = [
    "index.html",
    "podcast.html",
    "shop.html",
    "contact.html",
    "support.html",
    "admin.html",
    "0builder-Dashboard.html",
    "assets/js/live.js"
  ];
  for (const f of files) {
    try {
      const res = await fetch(f, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        zip.file(f, text);
      }
    } catch (e) {
      console.warn("Could not add to backup:", f);
    }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "0builder-full-backup.zip";
  a.click();
}

/* =======================
   PUBLISH (Cloud)
======================= */
export async function saveToCloud() {
  if (!confirm("Publish your changes to GitHub?")) return;
  try {
    const res = await fetch(SAVE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || ("HTTP " + res.status));
    }
    markSavedLocal();
    alert("✔ Published.\n0Builder CMS Platform 1.0: site-data.json updated.");
  } catch (e) {
    console.error(e);
    alert("❌ Publish failed.\n" + e.message);
  }
}

/* =======================
   UTIL
======================= */
export function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

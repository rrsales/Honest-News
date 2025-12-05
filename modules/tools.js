// tools.js
// 0Builder CMS Platform 1.0
// (c) 2025 0Builder.LLC

/*
  TOOLS: Publish, save draft, download JSON, full backup
*/

import {
  saveToCloud,
  saveDraft,
  downloadJson,
  backupAll
} from "./core.js";

document.addEventListener("DOMContentLoaded", () => {
  const publishBtn = document.getElementById("publishBtn");
  if (publishBtn) publishBtn.addEventListener("click", saveToCloud);
  const draftBtn = document.getElementById("saveDraftBtn2");
  if (draftBtn) draftBtn.addEventListener("click", saveDraft);
  const downloadBtn = document.getElementById("downloadBtn2");
  if (downloadBtn) downloadBtn.addEventListener("click", downloadJson);
  const backupBtn = document.getElementById("backupBtn2");
  if (backupBtn) backupBtn.addEventListener("click", backupAll);
});

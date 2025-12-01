// ==============================
// Honest News – Storage & Cloud
// ==============================

function wireFooterButtons() {
  const saveDraftBtn = document.getElementById("saveDraftBtn2");
  const downloadBtn  = document.getElementById("downloadBtn2");
  const backupBtn    = document.getElementById("backupBtn2");
  const saveLocalBtn = document.getElementById("saveLocalBtn");

  if (saveDraftBtn) saveDraftBtn.addEventListener("click", saveDraft);
  if (downloadBtn)  downloadBtn.addEventListener("click", downloadJson);
  if (backupBtn)    backupBtn.addEventListener("click", backupAll);
  if (saveLocalBtn) saveLocalBtn.addEventListener("click", saveToCloud);
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(site));
    markSavedLocal();
  } catch (e) {
    alert("Could not save draft locally.");
  }
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(site, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "site-data.json";
  a.click();
}

async function backupAll() {
  const zip = new JSZip();
  zip.file("site-data.json", JSON.stringify(site, null, 2));

  const files = [
    "index.html",
    "podcast.html",
    "shop.html",
    "contact.html",
    "support.html",
    "admin.html",
    "dashboard.html",
    "assets/js/live.js"
  ];

  for (const f of files) {
    try {
      const res = await fetch(f, { cache:"no-store" });
      if (res.ok) {
        const text = await res.text();
        zip.file(f, text);
      }
    } catch (e) {
      console.warn("Could not add to backup:", f);
    }
  }

  const blob = await zip.generateAsync({ type:"blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "honest-news-full-backup.zip";
  a.click();
}

async function saveToCloud() {
  if (!confirm("Save your changes to GitHub via Honest News Cloud CMS (Render)?")) return;

  try {
    const res = await fetch(SAVE_ENDPOINT, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(site)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || ("HTTP " + res.status));
    }

    markSavedLocal();
    alert("✔ Saved to cloud.\nRender → GitHub site-data.json updated.");
  } catch (e) {
    console.error(e);
    alert("❌ Save failed.\n" + e.message);
  }
}

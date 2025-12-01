// HN Admin Data Library
// - Load site-data.json
// - Keep a local copy
// - Export updated JSON so you can commit it to GitHub

window.HNAdmin = window.HNAdmin || {};

(function (HNAdmin) {
  var DATA_URL = "assets/data/site-data.json";
  var STORAGE_KEY = "hn_admin_site_data_v1";
  var _cache = null;

  // Load from server or localStorage fallback
  HNAdmin.loadSiteData = async function () {
    // Prefer cache in memory
    if (_cache) return _cache;

    // Try localStorage snapshot first
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        _cache = JSON.parse(stored);
        return _cache;
      }
    } catch (e) {
      console.warn("HNAdmin: could not read localStorage snapshot", e);
    }

    // Fallback: fetch from repo
    var res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("HNAdmin: Failed to load " + DATA_URL + " (" + res.status + ")");
    }
    _cache = await res.json();
    return _cache;
  };

  // Save to localStorage (for in-browser editing session)
  HNAdmin.saveLocalSnapshot = function (data) {
    _cache = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("HNAdmin: could not write to localStorage", e);
    }
  };

  // Clear local snapshot (e.g., after you sync with GitHub)
  HNAdmin.clearLocalSnapshot = function () {
    _cache = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("HNAdmin: could not clear localStorage", e);
    }
  };

  // Export JSON as a downloadable file (for GitHub commit)
  HNAdmin.exportSiteData = function (data) {
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: "application/json" );
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = "site-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };
})(window.HNAdmin);

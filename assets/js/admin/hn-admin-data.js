window.HNAdmin = window.HNAdmin || {};

(function (HNAdmin) {
  const DATA_URL = "assets/data/site-data.json";

  HNAdmin.loadSiteData = async function () {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load site-data.json");
    return await res.json();
  };

  // NOTE: On GitHub Pages we can't write directly.
  // We produce JSON text and the user uploads/commits it.
  HNAdmin.exportSiteData = function (data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "site-data.json";
    a.click();

    URL.revokeObjectURL(url);
  };
})(window.HNAdmin);

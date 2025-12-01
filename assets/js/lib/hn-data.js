// Simple data loader / cache
window.HN = window.HN || {};

(function (HN) {
  const DATA_URL = "assets/data/site-data.json";
  let _cache = null;

  HN.loadData = async function () {
    if (_cache) return _cache;
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) {
      console.error("HN.loadData failed", res.status);
      throw new Error("Failed to load site-data.json");
    }
    _cache = await res.json();
    return _cache;
  };

  HN.getCurrentPageId = function () {
    const body = document.body;
    return body.getAttribute("data-page") || "home";
  };
})(window.HN);

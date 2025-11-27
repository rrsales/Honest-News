// pages.js
// Fallback pages (used if admin hasn't created pages yet)
const PAGES_FALLBACK = [
  { title: "Home", url: "index.html" },
  { title: "About", url: "about.html" },
  { title: "Blog", url: "blog.html" },
  { title: "Podcast", url: "podcast.html" },
  { title: "Products", url: "products.html" },
  { title: "Contact", url: "contact.html" }
];

// Helper: get siteData from localStorage if present (admin writes this)
function getSiteData() {
  try {
    const raw = localStorage.getItem(SITE_CONFIG.storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse siteData", e);
    return null;
  }
}

// Get pages: prefer admin-managed pages, fall back to hard-coded
function getPages() {
  const sd = getSiteData();
  if (sd && Array.isArray(sd.pages) && sd.pages.length) return sd.pages;
  return PAGES_FALLBACK;
}

// Expose small helper
window.SitePages = {
  getPages
};

// pages.js - default pages list (used by nav/admin if no saved pages)
const DEFAULT_PAGES = [
  { title: "Home", url: "index.html" },
  { title: "About", url: "about.html" },
  { title: "Blog", url: "blog.html" },
  { title: "Podcast", url: "podcast.html" },
  { title: "Shop", url: "shop.html" },
  { title: "Contact", url: "contact.html" }
];




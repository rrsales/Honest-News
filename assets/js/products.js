// products.js
const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    title: "Battleground Prophetic Handbook",
    desc: "Devotional guide and prophetic insights by Joseph B. Skinner.",
    image: "assets/images/products/product1.jpg",
    url: "#"
  },
  {
    id: "p2",
    title: "Overcoming Faith Collection",
    desc: "Collection of ministry teachings and resources.",
    image: "assets/images/products/product2.jpg",
    url: "#"
  },
  {
    id: "p3",
    title: "Foundations of Prophecy",
    desc: "An introductory book on prophetic ministry.",
    image: "assets/images/products/product3.jpg",
    url: "#"
  }
];

function getProductsFromSiteData() {
  try {
    const raw = localStorage.getItem(SITE_CONFIG.storageKey);
    if (!raw) return DEFAULT_PRODUCTS;
    const sd = JSON.parse(raw);
    return sd.products && sd.products.length ? sd.products : DEFAULT_PRODUCTS;
  } catch (e) {
    console.warn("products: failed to load siteData", e);
    return DEFAULT_PRODUCTS;
  }
}

function renderProductGrid(selector = ".product-grid") {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = "";
  const products = getProductsFromSiteData();
  products.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.title)}">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <a class="btn-small" href="${p.url}" target="_blank" rel="noopener">Buy on Amazon</a>
    `;
    container.appendChild(card);
  });
}

// small helper escape
function escapeHtml(s=""){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

window.SiteProducts = {
  renderProductGrid,
  getProductsFromSiteData
};




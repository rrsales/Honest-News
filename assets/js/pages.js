// pages.js — dynamic navigation
const pages = [
  { title: "Home", url: "index.html" },
  { title: "About", url: "about.html" },
  { title: "Blog", url: "blog.html" },
  { title: "Podcast", url: "podcast.html" },
  { title: "Shop", url: "shop.html" },
  { title: "Products", url: "products.html" },
  { title: "Contact", url: "contact.html" },
  { title: "Donate", url: "donate.html" },
  { title: "Events", url: "events.html" },
  { title: "Privacy", url: "privacy.html" },
  { title: "Support", url: "support.html" },
  { title: "Admin", url: "site-admin.html" }
];

function generateNav() {
  const navs = document.querySelectorAll(".nav-menu");
  navs.forEach(nav => {
    nav.innerHTML = "";
    pages.forEach(page => {
      const link = document.createElement("a");
      link.href = page.url;
      link.textContent = page.title;
      nav.appendChild(link);
    });
  });
}

document.addEventListener("DOMContentLoaded", generateNav);






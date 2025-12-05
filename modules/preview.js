// preview.js
// 0Builder CMS Platform 1.0

import { escapeHtml } from "./core.js";

const previewFrame = document.getElementById("previewFrame");
const heroPreview = document.getElementById("heroPreview");
const blockPreview = document.getElementById("blockPreview");

function renderPreview(currentPage) {
  if (!currentPage || !heroPreview || !blockPreview) return;

  const hero = currentPage.hero || {};
  heroPreview.style.backgroundImage = hero.bg ? `url('${escapeHtml(hero.bg)}')` : "none";
  heroPreview.style.height = hero.size === "small" ? "40vh" : hero.size === "medium" ? "60vh" : hero.size === "large" ? "80vh" : "100vh";

  // Render blocks
  let html = "";
  (currentPage.blocks || []).forEach(b => {
    if (b.type === "heading") html += `<h2>${escapeHtml(b.content || "")}</h2>`;
    if (b.type === "paragraph") html += `<p>${escapeHtml(b.content || "")}</p>`;
    if (b.type === "image" && b.content) html += `<img src="${escapeHtml(b.content)}" style="max-width:100%;">`;
  });
  blockPreview.innerHTML = html;
}

export { renderPreview };


// modules/canvas.js
const canvas = document.getElementById("canvasContent");

export function renderCanvas(page = null) {
  if (!page) {
    canvas.innerHTML = `<p>No page selected.</p>`;
    return;
  }

  const theme = page.theme || "light";
  const transparent =
    page.hero && page.hero.transparentMenu ? "On" : "Off";

  canvas.innerHTML = `
    <div class="canvasPreview">
      <h2>${escapeHtml(page.title || "")}</h2>
      <p>Theme: <strong>${theme}</strong></p>
      <p>Transparent Menu: <strong>${transparent}</strong></p>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s];
  });
}

window.addEventListener("pageSelected", e => renderCanvas(e.detail));
window.addEventListener("pageUpdated", e => renderCanvas(e.detail));
window.addEventListener("load", () => renderCanvas(null));


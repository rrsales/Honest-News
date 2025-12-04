// modules/canvas.js
const canvas = document.getElementById("canvasContent");

export function renderCanvas(page=null) {
  if (!page) {
    canvas.innerHTML = `<p>No page selected.</p>`;
    return;
  }
  canvas.innerHTML = `
    <h2>${page.title}</h2>
    <p>Theme: ${page.theme}</p>
    <p>Transparent Menu: ${page.hero.transparentMenu}</p>`;
}

window.addEventListener("pageSelected",e=>renderCanvas(e.detail));
window.addEventListener("pageUpdated",e=>renderCanvas(e.detail));
window.addEventListener("load",()=>renderCanvas(null));

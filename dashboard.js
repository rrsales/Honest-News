// dashboard.js — PURE JS, no HTML markup at top level

document.addEventListener("DOMContentLoaded", function () {
  // Panels
  document.getElementById("pagesPanel").textContent = "Pages go here";
  document.getElementById("menuPanel").textContent = "Menu settings here";
  document.getElementById("canvasContent").textContent = "Canvas content here";
  document.getElementById("inspectorPanel").textContent = "Inspector info here";
  document.getElementById("textEditorPanel").innerHTML =
    `<b>Text Editor</b><br>
     <textarea style="width:100%;height:100px;">Edit HTML here...</textarea>
     <br><button onclick="alert('Save!')">Save</button>`;
});

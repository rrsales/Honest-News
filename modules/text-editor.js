// text-editor.js
// 0Builder CMS Platform 1.0

import { publish } from "./core.js";

const editorBox = document.getElementById("editorBox");
const saveBtn = document.getElementById("saveBtn");

function getContent() { return editorBox ? editorBox.value : ""; }
function setContent(content){ if(editorBox) editorBox.value = content; }

if (saveBtn) saveBtn.addEventListener("click", () => {
  publish("editorSaved", getContent());
});

export { getContent, setContent };

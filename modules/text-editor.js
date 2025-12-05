// text-editor.js
// 0Builder CMS Platform 1.0
// (c) 2025 0Builder.LLC

/*
  TEXT EDITOR: Inline/block text editor for paragraph/heading blocks
*/

import { current, markDirty, publish } from "./core.js";

let editorModal = null;

export function showTextEditor(blockIndex, type = "paragraph") {
  if (!current || !current.blocks || !current.blocks[blockIndex]) return;
  const block = current.blocks[blockIndex];
  if (block.type !== "heading" && block.type !== "paragraph") return;
  if (!editorModal) {
    editorModal = document.createElement("div");
    editorModal.id = "obuilder-text-editor-modal";
    // ... (same modal setup as before)
    document.body.appendChild(editorModal);
  }
  // ... (rest of modal logic)
}
window._obuilder_showTextEditor = showTextEditor;

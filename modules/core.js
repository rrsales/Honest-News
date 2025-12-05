// core.js
// 0Builder CMS Platform 1.0
// (c) 2025 0Builder.LLC

/*
  CORE: Pub/Sub, state, utility functions
*/

const events = {};

function subscribe(event, fn) {
  if (!events[event]) events[event] = [];
  events[event].push(fn);
}

function publish(event, data) {
  if (!events[event]) return;
  events[event].forEach(fn => fn(data));
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

export { subscribe, publish, escapeHtml };


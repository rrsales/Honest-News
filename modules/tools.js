// tools.js
// 0Builder CMS Platform 1.0

import { publish } from "./core.js";

function runTool(name, payload) { publish("toolRun", {name, payload}); }

export { runTool };

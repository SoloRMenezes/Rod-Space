const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.resolve(__dirname, "../arcade-immersive.css"), "utf8");
assert.match(css, /body\[data-game="mines"\] \.mine-cell \{[^}]*background:#a8a8a8/);
assert.match(css, /body\[data-game="mines"\] \.mine-cell\.revealed \{[^}]*background:#e2e2e2/);

console.log("PASS: Minesweeper hidden and revealed squares have strong contrast");

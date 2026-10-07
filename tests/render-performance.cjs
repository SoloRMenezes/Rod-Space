const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const cappedDpr = /setPixelRatio\(Math\.min\(window\.devicePixelRatio \|\| 1, ?1\.5\)\)/;

for (const file of [
  'pac-man-3d.html',
  'pac-man-3d-2.html',
  'backrooms.html',
  'backrooms-level1.html',
  'backrooms-level7.html',
  'backrooms-level10.html',
  'card-wars/three-board.js',
  'multiplayer.html'
]) {
  assert.match(read(file), cappedDpr, `${file} should cap Retina rendering`);
}

for (const file of ['pac-man-3d.html', 'pac-man-3d-2.html']) {
  const source = read(file);
  assert.doesNotMatch(source, /updateMiniSmooth/);
  assert.match(source, /now - lastMapDraw >= 66/);
}

const relic = read('relic_rush.html');
assert.match(relic, /renderDpr = Math\.min\(window\.devicePixelRatio \|\| 1, 1\.5\)/);
assert.match(relic, /canvas\.width \/ renderDpr/);

console.log('PASS: heavy games cap Retina rendering and Pac-Man uses one animation loop.');

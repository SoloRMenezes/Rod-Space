const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const gameEntry = fs.readFileSync(require('node:path').join(__dirname, '..', 'fingerboard-3d.js'), 'utf8');

test('the app entry keeps tricks inline so the native server can load it', () => {
  assert.doesNotMatch(gameEntry, /from ['"][^'"]+\.mjs['"]/);
  assert.match(gameEntry, /function releaseTrick\(/);
  assert.match(gameEntry, /function arrowReleaseTrick\(/);
  assert.match(gameEntry, /function airTrickForArrow\(/);
});

let controls;
test.before(async () => {
  controls = await import('../fingerboard-controls.mjs');
});

test('front then back lifts within the window trigger an ollie', () => {
  const first = controls.releaseTrick([], 'front', 100);
  const second = controls.releaseTrick(first.sequence, 'back', 700);
  assert.equal(second.trick, 'OLLIE');
  assert.deepEqual(second.sequence, []);
});

test('back then front lifts trigger a nollie', () => {
  const first = controls.releaseTrick([], 'back', 100);
  const second = controls.releaseTrick(first.sequence, 'front', 700);
  assert.equal(second.trick, 'NOLLIE');
});

test('an expired lift cannot combine with a later lift', () => {
  const first = controls.releaseTrick([], 'front', 100);
  const second = controls.releaseTrick(first.sequence, 'back', 1400);
  assert.equal(second.trick, null);
  assert.deepEqual(second.sequence, [{ role: 'back', time: 1400 }]);
});

test('arrow key release order uses the same ollie and nollie mapping', () => {
  assert.equal(controls.arrowReleaseTrick([], 'UP', 100).trick, null);
  const ollie = controls.arrowReleaseTrick([{ direction: 'UP', time: 100 }], 'DOWN', 400);
  const nollie = controls.arrowReleaseTrick([{ direction: 'DOWN', time: 100 }], 'UP', 400);
  assert.equal(ollie.trick, 'OLLIE');
  assert.equal(nollie.trick, 'NOLLIE');
});

test('left and right arrows trigger one flip only while airborne', () => {
  assert.equal(controls.airTrickForArrow('ArrowLeft', false, false), null);
  assert.equal(controls.airTrickForArrow('ArrowRight', true, true), null);
  assert.equal(controls.airTrickForArrow('ArrowLeft', true, false), 'KICKFLIP');
  assert.equal(controls.airTrickForArrow('ArrowRight', true, false), 'HEELFLIP');
});

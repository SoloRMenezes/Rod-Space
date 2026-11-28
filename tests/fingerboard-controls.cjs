const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const gameEntry = fs.readFileSync(require('node:path').join(__dirname, '..', 'fingerboard-3d.js'), 'utf8');
const gamePage = fs.readFileSync(require('node:path').join(__dirname, '..', 'fingerboard.html'), 'utf8');

test('the app entry keeps tricks inline so the native server can load it', () => {
  assert.doesNotMatch(gameEntry, /from ['"][^'"]+\.mjs['"]/);
  assert.match(gameEntry, /function releaseTrick\(/);
  assert.match(gameEntry, /function arrowReleaseTrick\(/);
  assert.match(gameEntry, /function airTrickForArrow\(/);
  assert.match(gameEntry, /async function loadWorld\(/);
  assert.match(gameEntry, /Promise\.all\(parkModules\.map/);
  assert.doesNotMatch(gameEntry, /loadPark\(|cycleParkId\(|previous-park|next-park/);
  assert.match(gameEntry, /window\.webkit\?\.messageHandlers\?\.rodSpaceControls/);
  assert.match(gameEntry, /window\.__rodSpaceNativeMouse\s*=/);
  assert.doesNotMatch(gameEntry, /\$\('#(?:ollie|nollie|flip)'\)/);
  assert.doesNotMatch(gamePage, /class="controls"|id="(?:ollie|nollie|flip)"/);
  assert.match(gameEntry, /contactUp\(event\.pointerId\)/);
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

test('horizontal finger flicks trigger flips only while airborne and above the swipe threshold', () => {
  assert.equal(controls.airTrickForFlick(-40, 36, true, false), 'KICKFLIP');
  assert.equal(controls.airTrickForFlick(40, 36, true, false), 'HEELFLIP');
  assert.equal(controls.airTrickForFlick(20, 36, true, false), null);
  assert.equal(controls.airTrickForFlick(-40, 36, false, false), null);
  assert.equal(controls.airTrickForFlick(-40, 36, true, true), null);
});

test('horizontal mouse drags steer in opposite directions and scale with viewport width', () => {
  assert.ok(controls.mouseYawDelta(120, 1200) > 0);
  assert.ok(controls.mouseYawDelta(-120, 1200) < 0);
  assert.equal(controls.mouseYawDelta(120, 1200), controls.mouseYawDelta(60, 600));
  assert.equal(controls.mouseYawDelta(120, 0), 0);
  assert.equal(controls.mouseYawDelta(120, 1200), Math.PI * 2 * .1);
});

test('locked mouse steering uses movement delta while the cursor stays fixed', () => {
  assert.equal(controls.mousePointerDelta({ movementX: 32, clientX: 640 }, true, 600), 32);
  assert.equal(controls.mousePointerDelta({ movementX: 0, clientX: 640 }, false, 600), 40);
});

test('holding the mouse brake stops keyboard and touch movement', () => {
  assert.equal(controls.shouldDrive(true, true, 1), false);
  assert.equal(controls.shouldDrive(true, false, 1), false);
  assert.equal(controls.shouldDrive(false, true, 0), true);
  assert.equal(controls.shouldDrive(false, false, -1), true);
  assert.equal(controls.shouldDrive(false, false, 0), false);
});

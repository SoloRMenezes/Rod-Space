const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'web_weavers.js'), 'utf8');
const context = vm.createContext({console});
vm.runInContext(fs.readFileSync(path.join(root, 'assets/vendor/offline-25023b521d77.js'), 'utf8'), context);
function definition(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  const end = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, end < 0 ? undefined : end);
}
const constants = source.slice(source.indexOf('const GRAVITY ='), source.indexOf('const GRAVITY =') + 5000)
  .split('\n').filter(line => /^const (AIR_MAX_SPEED|SWING_MAX_SPEED|SWING_MAX_RISE_SPEED|MAX_RISE_SPEED|MAX_FALL_SPEED|MAX_TRAVERSAL_SPEED) =/.test(line)).join('\n');
vm.runInContext(`${constants}
const P={state:'swing',vel:new THREE.Vector3(),swingAssisted:true,
 swingWebs:{left:{},right:{}},swingGroundPullAnchors:{},cooldowns:{swing:0}};
${definition('releaseSwing')}
${definition('limitHorizontalSpeed')}
${definition('clampPlayerVelocity')}
`, context);
for (const velocity of [[58,0,0], [40,20,0], [35,-15,20]]) {
  const result = vm.runInContext(`P.state='swing';P.swingAssisted=true;P.vel.fromArray(${JSON.stringify(velocity)});
    releaseSwing();clampPlayerVelocity();JSON.stringify(P.vel.toArray());`, context);
  assert.deepEqual(JSON.parse(result), velocity, 'release preserves legal incoming velocity');
}
console.log('Web Weavers release momentum checks passed');

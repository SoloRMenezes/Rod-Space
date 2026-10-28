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
  .split('\n').filter(line => /^const (AIR_MAX_SPEED|SWING_MAX_SPEED|SWING_MAX_RISE_SPEED|MAX_RISE_SPEED|MAX_FALL_SPEED|MAX_TRAVERSAL_SPEED|SWING_INPUT_TURN_RATE|SWING_LOOK_TURN_RATE|SWING_FORWARD_ACCEL|SWING_POWERED_SPEED) =/.test(line)).join('\n');
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

vm.runInContext(`
const keys={},bindings={forward:'KeyW'};
function cameraForwardFlat(){return new THREE.Vector3(1,0,0);}
${definition('steerSwingVelocity')}
`,context);
const turn=JSON.parse(vm.runInContext(`
P.vel.set(0,0,40);P.swingPhase='descent';
const radial=new THREE.Vector3(.6,-.8,0);
for(let i=0;i<60;i++)steerSwingVelocity(radial,new THREE.Vector3(1,0,0),1/60);
JSON.stringify({speed:P.vel.length(),radial:P.vel.dot(radial),turn:P.vel.x});
`,context));
assert.ok(Math.abs(turn.speed-40)<1e-8,'unpowered steering conserves speed');
assert.ok(Math.abs(turn.radial)<1e-8,'steering introduces no radial velocity');
assert.ok(turn.turn>20,'directional control produces a meaningful turn');
console.log('Web Weavers tangent steering checks passed');

vm.runInContext(`${definition('giveSwingEntryMomentum')}`,context);
for(const velocity of [[-10,-5,0],[3,4,2],[0,-20,0]]){
 const incoming=JSON.parse(vm.runInContext(`P.vel.fromArray(${JSON.stringify(velocity)});giveSwingEntryMomentum(false,30);JSON.stringify(P.vel.toArray());`,context));
 assert.deepEqual(incoming,velocity,'airborne attachment adds no launch impulse');
}
console.log('Web Weavers airborne catch momentum checks passed');

vm.runInContext(`
function nearbyBuildings(){return [{minX:0,maxX:10,minZ:0,maxZ:10,h:20}];}
${definition('swingWebObstructed')}
`,context);
for(const [from,to,blocked] of [
 [[-5,10,5],[0,10,5],false],
 [[-5,10,5],[15,10,5],true],
 [[-5,25,5],[15,25,5],false],
 [[-5,10,-1],[15,10,-1],false],
 [[5,10,5],[15,10,5],true],
 [[-5,10,5],[-.03,10,5],false]
]){
 assert.equal(vm.runInContext(`swingWebObstructed(new THREE.Vector3(...${JSON.stringify(from)}),new THREE.Vector3(...${JSON.stringify(to)}))`,context),blocked,'web obstruction geometry');
}
console.log('Web Weavers web obstruction checks passed');

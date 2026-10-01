const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const nico=read('nicos_nextbots.html');
assert.match(nico,/const FLOOR_COUNT=5;/);
assert.match(nico,/const SPAWN_FLOOR_INDEX=2;/);
assert.match(nico,/for\(const floorY of FLOOR_LEVELS\.slice\(1\)\)/);
assert.match(nico,/for\(const ramp of RAMPS\)for\(let tier=0;tier<FLOOR_COUNT-1;tier\+\+\)/);
assert.match(nico,/player\.floorY = SPAWN_FLOOR_Y;/);

const blackjack=read('Blackjack.html');
const scoreCode=['getCardValue','calculateScore'].map(name=>blackjack.match(new RegExp(`function ${name}\\([^]*?\\n        \\}`))[0]).join('\n');
const scoreContext={};vm.createContext(scoreContext);vm.runInContext(scoreCode,scoreContext);
assert.equal(vm.runInContext(`calculateScore([{value:'A'},{value:'A'},{value:'9'}])`,scoreContext),21);
assert.equal(vm.runInContext(`calculateScore([{value:'K'},{value:'7'},{value:'8'}])`,scoreContext),25);
assert.match(blackjack,/if \(pScore === 21\) setTimeout\(startDealerTurn, 500\)/);
assert.match(blackjack,/localStorage\.setItem\('blackjack-record'/);

const weavers=read('web_weavers.html');
assert.match(weavers,/const RESPAWN_TIME = 18;/);
assert.match(weavers,/const previous=p\.pos\.clone\(\);/);
assert.match(weavers,/raycaster\.intersectObjects\(collidables\(\),false\)/);
assert.match(weavers,/updatePatrolStatus\(\)/);
assert.match(weavers,/#topButtons\{[^}]*display:flex/);
assert.match(weavers,/if\(!zipDown && lastZip && P\.state==='zip'\) cancelZip\(\)/);
assert.match(weavers,/const horizontalRadial=radial\.clone\(\);horizontalRadial\.y=0;/);
assert.match(weavers,/travelDir\.lerp\(mv,\.16\)\.normalize\(\)/);
assert.match(weavers,/P\.vel\.copy\(exitDir\)\.multiplyScalar\(18\)/);
assert.match(weavers,/swingLeft:'KeyQ', swingRight:'KeyE'/);
assert.match(weavers,/trySwing\('left','abSwingLeft'\)/);
assert.match(weavers,/trySwing\('right','abSwingRight'\)/);
assert.match(weavers,/const SWING_RELEASE_CARRY = \.82;/);
assert.match(weavers,/limitHorizontalSpeed\(SWING_RELEASE_MAX_SPEED\)/);
assert.match(weavers,/const GLIDE_MAX_SPEED = 40;/);
assert.match(weavers,/const flareLift=flareInput\*THREE\.MathUtils\.clamp\(glideSpeed\*0\.32,0,8\)/);
assert.match(weavers,/P\.webshotPoseT=0\.34;/);
assert.match(weavers,/P\.pullPoseT=0\.5;/);
assert.match(weavers,/new THREE\.SphereGeometry\(0\.38,16,12\)/);
assert.match(weavers,/new THREE\.CylinderGeometry\(0\.42,0\.34,1\.08,8\)/);

for(const [name,html] of [['nicos_nextbots.html',nico],['Blackjack.html',blackjack],['web_weavers.html',weavers]]){
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]).filter(script=>script.trim());
  scripts.forEach((script,index)=>new vm.Script(script,{filename:`${name}#${index+1}`}));
}

console.log('PASS: Nico five floors and Floor 3 spawn, Blackjack scoring/natural flow, Web Weavers patrol and swept web shots.');

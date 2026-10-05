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
assert.match(nico,/mobileRenderer\?1:1\.5/);
assert.match(nico,/const slopeStep=targetRamp\?1\.05:\.65/);
assert.match(nico,/if\(activeRamp\)player\.y=THREE\.MathUtils\.clamp/);

const blackjack=read('Blackjack.html');
const scoreCode=['getCardValue','calculateScore'].map(name=>blackjack.match(new RegExp(`function ${name}\\([^]*?\\n        \\}`))[0]).join('\n');
const scoreContext={};vm.createContext(scoreContext);vm.runInContext(scoreCode,scoreContext);
assert.equal(vm.runInContext(`calculateScore([{value:'A'},{value:'A'},{value:'9'}])`,scoreContext),21);
assert.equal(vm.runInContext(`calculateScore([{value:'K'},{value:'7'},{value:'8'}])`,scoreContext),25);
assert.match(blackjack,/if \(pScore === 21\) setTimeout\(startDealerTurn, 500\)/);
assert.match(blackjack,/localStorage\.setItem\('blackjack-record'/);
assert.match(blackjack,/isHidden \? 'card-back'/);
assert.doesNotMatch(blackjack,/\.card\.hidden/);

const weavers=read('web_weavers.html');
assert.ok(fs.statSync(path.join(root,'assets/models/web-weavers-r15.glb')).size>100000);
assert.ok(fs.statSync(path.join(root,'assets/vendor/GLTFLoader-r128.js')).size>90000);
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
assert.match(weavers,/const SWING_RELEASE_CARRY = \.96;/);
assert.match(weavers,/const SWING_DESCENT_PUMP = 4\.5;/);
assert.match(weavers,/web\.physicsPivot=web\.anchor\.clone\(\)/);
assert.match(weavers,/P\.vel\.x\+=swingSteer\.x\*5\*dt/);
assert.doesNotMatch(weavers,/losingRise[^\n]*autoReleaseSwing\(\)/);
assert.match(weavers,/limitHorizontalSpeed\(SWING_RELEASE_MAX_SPEED\)/);
assert.match(weavers,/const GLIDE_MAX_SPEED = 40;/);
assert.match(weavers,/const flareLift=flareInput\*THREE\.MathUtils\.clamp\(glideSpeed\*0\.32,0,8\)/);
assert.match(weavers,/P\.webshotPoseT=0\.34;/);
assert.match(weavers,/P\.pullPoseT=0\.5;/);
assert.match(weavers,/new THREE\.SphereGeometry\(0\.38,16,12\)/);
assert.match(weavers,/new THREE\.CylinderGeometry\(0\.42,0\.34,1\.08,8\)/);
assert.match(weavers,/new THREE\.GLTFLoader\(\)\.load/);
assert.match(weavers,/const r15VisualBone=/);
assert.match(weavers,/applyR15VisualBone\(r15VisualBone\.leftLowerArm/);
assert.match(weavers,/const breath=Math\.sin\(animClock\*1\.8\)/);
assert.match(weavers,/torsoRot\.x = running \? -0\.22 : -0\.07/);
assert.match(weavers,/const swingReachElbow=0\.08/);
assert.match(weavers,/const swingFreeElbow=0\.72/);
assert.match(weavers,/rigPitch=-fastSwing\*0\.3-riseRatio\*0\.16/);
assert.match(weavers,/targetRigRoll=THREE\.MathUtils\.clamp\(-P\.vel\.dot\(visualRight\)\*0\.024,-0\.46,0\.46\)/);
assert.match(weavers,/if\(P\.blocking\) leftElbow=rightElbow=1\.28/);
assert.match(weavers,/const strikingElbow=THREE\.MathUtils\.lerp\(1\.18,0\.38,strike\)/);
assert.match(weavers,/visibleWebHandWorld\('left',handL\)/);
assert.match(weavers,/gameHand==='left'\?r15VisualBone\.leftHand:r15VisualBone\.rightHand/);
assert.match(weavers,/const sideSign=hand==='left'\?1:-1/);
assert.doesNotMatch(weavers,/const facadeStart=groundStart/);
assert.match(weavers,/if\(groundStart && forwardDot<0\.18\) continue/);
assert.match(weavers,/Math\.min\(dist\*0\.96,maxClearRope\)/);
assert.match(weavers,/const SWING_LANE_SPRING = 2\.4/);
assert.match(weavers,/P\.swingLaneCenter\.copy\(P\.pos\)/);
assert.match(weavers,/laneOffset\*SWING_LANE_SPRING-laneSpeed\*SWING_LANE_DAMPING/);

const sling=read('sling_champ.html');
assert.match(sling,/\.5\*\(other\.mass\|\|1\)\*speed\*speed/);
assert.match(sling,/pig\.hitPoints=30/);
assert.match(sling,/item-rocket/);assert.match(sling,/item-split/);
assert.match(sling,/col< nCols\/2|col<nCols\/2/);

const hood=read('hood_brawlers.html'),hoodJs=read('hood-brawlers.js');
assert.doesNotMatch(hood,/id="p1-pickers"/);
assert.match(hood,/id="cpu-difficulty"/);
assert.match(hood,/id="phone-placement-toolbar"/);
assert.match(hoodJs,/easy:\{think:15/);
assert.match(hoodJs,/selectPlacement\('dpad'\)/);

const drift=read('3d_drift_racer.html');
assert.match(drift,/gridRoadHalfWidth = 8\.2/);
assert.match(drift,/practiceBottleSpots\.length < 16/);
assert.match(drift,/col\.map==='training'\?30000:nitroBottleRespawnMs/);

for(const [name,html] of [['nicos_nextbots.html',nico],['Blackjack.html',blackjack],['web_weavers.html',weavers]]){
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]).filter(script=>script.trim());
  scripts.forEach((script,index)=>new vm.Script(script,{filename:`${name}#${index+1}`}));
}

console.log('PASS: Nico five floors and Floor 3 spawn, Blackjack scoring/natural flow, Web Weavers patrol and swept web shots.');

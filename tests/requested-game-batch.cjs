const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const relic=read('relic_rush.html');
assert.match(relic,/if \(active && !wasActiveRef\.current\)/,'new expeditions reset engine state');
assert.match(relic,/getBoundingClientRect\(\)[\s\S]*rect\.width \/ 2/,'camera centers using CSS pixels');
assert.match(relic,/Math\.min\(s\.player\.maxHp, s\.player\.hp \+ s\.player\.regen/,'regeneration cannot exceed max HP');
const orbitCoordinates=relic.indexOf('const px = s.player.worldX - s.camera.x');
const orbitRenderer=relic.indexOf('// Orbit saws drone logic');
assert.ok(orbitCoordinates>=0&&orbitCoordinates<orbitRenderer,'orbit upgrade receives player screen coordinates before rendering');
const skillsSource=relic.match(/const baseSkills = (\[[\s\S]*?\n      \]);/)[1];
const skills=vm.runInNewContext(skillsSource);
for(const skill of skills){
  const player={bulletDamage:30,speed:3,fireRate:35,pickupRange:85,bulletCount:1,orbitSaws:0,lifesteal:0,laserLevel:0,laserCooldown:7000,lastLaserTime:0};
  assert.doesNotThrow(()=>skill.effect(player),`${skill.title} effect should not throw`);
  for(const [key,value] of Object.entries(player))assert.ok(Number.isFinite(value),`${skill.title} keeps ${key} finite`);
}

const parkour=read('multiplayer.html');
assert.match(parkour,/Reuse Web Weavers' compact rounded character construction/);
assert.match(parkour,/new THREE\.CylinderGeometry\(\.82,\.68,2,8\)/);
assert.match(parkour,/new THREE\.SphereGeometry\(\.68,16,12\)/);

const nico=read('nicos_nextbots.html');
assert.match(nico,/garage:\{vertical:/);
assert.match(nico,/annex:\{vertical:/);
assert.match(nico,/FREIGHT ANNEX/);
assert.match(nico,/assets\/models\/web-weavers-r15\.glb/);
assert.match(nico,/createWebWeaversAvatar/);

const cardWars=read('card-wars/app.js');
const start=cardWars.indexOf('function shuffleCards');
const end=cardWars.indexOf('function getStartingHp');
const cardCatalog=[
  {id:'corn',faction:'Corn Fields'},
  {id:'blue',faction:'Blue Plains'},
  {id:'rainbow',faction:'Rainbow'},
  {id:'blocked',faction:'Corn Fields',playable:false}
];
const context={Math,cardCatalog,getCard:id=>cardCatalog.find(card=>card.id===id)};
vm.createContext(context);
vm.runInContext(cardWars.slice(start,end),context);
const enemyDeck=context.buildEnemyBattleDeck(['Corn Fields'],17);
assert.equal(enemyDeck.length,17);
assert.ok(enemyDeck.every(id=>id==='corn'||id==='rainbow'),'AI deck only contains playable matching factions');
assert.match(cardWars,/card\.variant === slot \+ 1/,'opponent receives one landscape for every numbered slot');

console.log('PASS: Relic Rush run reset/camera/regen, shared Web Weavers avatars, two Nextbots maps, and legal Card Wars AI decks.');

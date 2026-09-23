const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const cards=vm.runInNewContext(fs.readFileSync(root+'/disaster-cards.js','utf8')+'\nDISASTER_CARDS');
const rules=require('../disaster-game.js');
const lan=require('../disaster-lan.js');
const pairing={type:'offer',sdp:'v=0\r\na=candidate:local network ✓'};
const nicoHtml=fs.readFileSync(root+'/nicos_nextbots.html','utf8');
assert.match(nicoHtml,/const width = 140, height = 96/);
assert.match(nicoHtml,/new THREE\.InstancedMesh/);
assert.match(nicoHtml,/assets\/nextbot-chaser\.png/);
assert.match(nicoHtml,/Gentle separation keeps overlapping chasers/);
assert.match(nicoHtml,/Proper parking bays and centre-lane markings/);
assert.match(nicoHtml,/Fluorescent fixtures are emissive-looking props only/);
assert.match(nicoHtml,/Low-poly parked cars create cover/);
assert.match(nicoHtml,/makeConcreteTexture/);
assert(nicoHtml.includes('performance.now()+30000'), 'Nico bots should give players a 30 second head start');
assert(nicoHtml.includes('targetId:null'), 'Nico bots should keep an acquired target');
assert(nicoHtml.includes('bot.vx*=.992'), 'Nico bots should use low-friction movement');
assert(nicoHtml.includes('BOTS RELEASE IN'), 'Nico HUD should show the release countdown');
assert(nicoHtml.includes("PartyRooms.createHost({game:'nicos-nextbots'"), 'Nico should create discoverable multiplayer rooms');
assert(nicoHtml.includes("roomSession.client.send('player'"), 'Nico guests should send their player state');
assert(nicoHtml.includes("roomSession.lan.broadcast('world'"), 'Nico host should synchronize players and bots');
assert(!nicoHtml.includes('RingGeometry'), 'Nico bots should not have ground warning rings');
assert(nicoHtml.includes('ceiling.position.set(MAP_SIZE_X,11,MAP_SIZE_Y)'), 'Nico garage should use the higher ceiling');
assert(nicoHtml.includes("cell===2&&player.z>=1.55"), 'Nico cars should block running but allow a high jump');
assert(nicoHtml.includes("new THREE.SpriteMaterial({color:0xf4f1e8"), 'Nico portraits should have a visible backing');
assert(nicoHtml.includes('new THREE.PerspectiveCamera(95,'), 'Nico should use a fixed 95 degree FOV');
assert(!nicoHtml.includes('id="fov-slider"'), 'Nico should not expose a variable FOV control');
assert.match(nicoHtml,/speed: 0\.12/);
assert.match(nicoHtml,/baseSpeed: 34/);
assert.ok(fs.statSync(root+'/assets/nextbot-chaser.png').size<400_000,'optimized chaser texture');
assert.match(fs.readFileSync(root+'/disaster-lan.js','utf8'),/CompressionStream\('deflate-raw'\)/);
const spiralHtml=fs.readFileSync(root+'/shit-spiral.html','utf8');assert.match(spiralHtml,/data-password="3112" data-title="Shit Spiral"/);
assert.match(spiralHtml,/id="single-player">Single player<\/button><button id="multiplayer">Multiplayer<\/button><button id="lan-play">LAN<\/button>/);
const partyHtml=fs.readFileSync(root+'/party.html','utf8');assert.match(partyHtml,/href="shit-spiral\.html"/);assert.match(fs.readFileSync(root+'/index.html','utf8'),/href="\.\/party\.html"/);
assert.equal(cards.length,200);assert.equal(new Set(cards.map(c=>c.text)).size,200);assert.equal(new Set(cards.map(c=>c.score)).size,200);assert.equal(Math.min(...cards.map(c=>c.score)),.5);assert.equal(Math.max(...cards.map(c=>c.score)),100);
const correctSlot=g=>g.players[g.active].lane.filter(id=>cards[id].score<cards[g.current].score).length;
let game=rules.create(['One','Two','Three'],cards,()=>.4),original=game.current;
for(let i=0;i<3;i++){assert.equal(game.active,i);let wrong=(correctSlot(game)+1)%(game.players[i].lane.length+1);rules.guess(game,wrong,cards);assert.equal(game.result.kind,i===2?'discard':'pass');assert.equal(game.current,original);rules.next(game);}
assert.equal(game.discarded.length,1);assert.equal(game.starter,1);assert.notEqual(game.current,original);
game=rules.create(['One','Two'],cards,()=>.3);rules.guess(game,(correctSlot(game)+1)%4,cards);rules.next(game);assert.equal(game.active,1);rules.guess(game,correctSlot(game),cards);assert.equal(game.players[1].lane.length,4);rules.next(game);assert.equal(game.starter,1);
for(const count of [2,4,8]){game=rules.create(Array.from({length:count},(_,i)=>'Player '+i),cards);let turns=0;while(game.phase!=='end'){rules.guess(game,correctSlot(game),cards);rules.next(game);assert.ok(++turns<100);}assert.equal(game.players[game.winners[0]].lane.length,10);const all=[...game.deck,...game.discarded,...game.players.flatMap(p=>p.lane)];assert.equal(all.length,200);assert.equal(new Set(all).size,200);}
game=rules.create(['Solo'],cards,()=>.2);assert.equal(game.players.length,1);for(let i=0;i<5;i++){const wrong=(correctSlot(game)+1)%(game.players[0].lane.length+1);rules.guess(game,wrong,cards);assert.equal(game.result.kind,'discard');rules.next(game);}assert.equal(game.phase,'guess');assert.equal(game.discarded.length,5);assert.equal('mistakes' in game,false);
game=rules.create(['Solo'],cards,()=>.7);while(game.phase!=='end'){rules.guess(game,correctSlot(game),cards);rules.next(game);}assert.equal(game.winners[0],0);assert.equal(game.players[0].lane.length,10);
game=rules.create(['One','Two'],cards);while(game.phase!=='end'){rules.guess(game,(correctSlot(game)+1)%4,cards);rules.next(game);}assert.equal(game.discarded.length,194);assert.equal(game.winners.length,2);
// Real Orbit script under a canvas host: RAF queue must stay one, even after minutes/restarts.
const events={},queue=[],elements=new Map();let now=0;
const drawing=new Proxy({}, {get:()=>()=>{},set:()=>true});
const element=id=>{if(!elements.has(id))elements.set(id,{getContext:()=>drawing,style:{},classList:{add(){},remove(){}},innerHTML:'',innerText:''});return elements.get(id);};
const context={console,Math,innerWidth:390,innerHeight:844,performance:{now:()=>now},document:{hidden:false,getElementById:element,addEventListener:(n,fn)=>events[n]=fn},addEventListener:(n,fn)=>events[n]=fn,requestAnimationFrame:fn=>queue.push(fn)};
vm.createContext(context);const orbit=fs.readFileSync(root+'/orbit-boss.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];vm.runInContext(orbit,context);events.pointerdown();let peak=0;
for(let i=0;i<7200;i++){assert.equal(queue.length,1);now+=1000/60;queue.shift()(now);peak=Math.max(peak,vm.runInContext('bullets.length',context));if(!vm.runInContext('state.running',context))events.pointerdown();}
assert.ok(peak<100,'bounded projectile count');assert.equal(queue.length,1);
vm.runInContext('shields=1;invincible=0;player.currentSpeed=0;bullets.push({x:state.cx+Math.cos(player.ang)*player.r,y:state.cy+Math.sin(player.ang)*player.r,vx:0,vy:0,p:false});update(0);',context);assert.equal(vm.runInContext('state.running',context),false);events.pointerdown();assert.equal(vm.runInContext('shields',context),3);assert.equal(vm.runInContext('state.lvl',context),1);
console.log('PASS: 200 unique half-point cards, unlimited solo attempts, passing without reveal, discard, stealing, wins for 2/4/8 players, deck exhaustion, Orbit single RAF over 7200 frames, bounded bullets, shield loss and replay.');
// Exercise touch chords, sliding, sustain and release with a deterministic audio host.
const pianoEvents={},nodes=new Map();let pointed=null;
function node(){return {dataset:{},style:{},children:[],listeners:{},classList:{toggle(){}},setAttribute(k,v){this[k]=v},append(v){this.children.push(v)},addEventListener(n,f){this.listeners[n]=f},contains(k){return this.children.includes(k)},setPointerCapture(){},hasPointerCapture(){return true},value:65};}
for(const id of ['piano','sustain','volume','status'])nodes.set(id,node());
function audioNode(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}},frequency:{value:0},connect(){},disconnect(){},start(){},stop(){}};}
class Audio{constructor(){this.currentTime=0;this.state='running';this.destination={};}createGain(){return audioNode()}createDynamicsCompressor(){return audioNode()}createOscillator(){return audioNode()}}
const pianoContext={console,Math,Map,Set,window:{AudioContext:Audio},document:{getElementById:id=>nodes.get(id),createElement:node,elementFromPoint:()=>({closest:()=>pointed}),addEventListener:(n,f)=>pianoEvents[n]=f},addEventListener:(n,f)=>pianoEvents[n]=f};vm.createContext(pianoContext);
vm.runInContext(fs.readFileSync(root+'/piano.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1],pianoContext);
const keyboard=nodes.get('piano');assert.equal(keyboard.children.length,17);
function down(id,key){keyboard.listeners.pointerdown({button:0,pointerId:id,target:{closest:()=>key},preventDefault(){}})}
down(1,keyboard.children[0]);down(2,keyboard.children[4]);assert.equal(vm.runInContext('held.size',pianoContext),2);
pointed=keyboard.children[2];keyboard.listeners.pointermove({pointerId:1,clientX:10,clientY:20});assert.equal(vm.runInContext('held.size',pianoContext),2);assert.equal(vm.runInContext("held.get('p1').key.dataset.midi",pianoContext),62);
nodes.get('sustain').onclick();keyboard.listeners.pointerup({pointerId:1});assert.equal(vm.runInContext('[...voices].filter(v=>!v.released).length',pianoContext),2);
nodes.get('sustain').onclick();assert.equal(vm.runInContext('[...voices].filter(v=>!v.released).length',pianoContext),1);keyboard.listeners.pointercancel({pointerId:2});assert.equal(vm.runInContext('held.size',pianoContext),0);assert.equal(vm.runInContext('[...voices].filter(v=>!v.released).length',pianoContext),0);
assert.doesNotThrow(()=>pianoEvents.keydown({key:'"',code:'Quote',target:{matches:()=>false}}));
console.log('PASS: piano 17-key range, simultaneous touch notes, glissando, sustain, cancellation, safe keyboard lookup.');

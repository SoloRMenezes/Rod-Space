/* =========================================================================================
   WEB WEAVERS — Spider-Man-inspired open world traversal + combat prototype
   Single-file Three.js prototype. Placeholder art, arcade physics.

   NOTE ON THE CITY: This build cannot pull live OpenStreetMap data at runtime (the
   sandboxed environment this artifact runs in has no outbound network access, and my
   own tools can't hit the Overpass API on your behalf). Instead the city below is
   PROCEDURALLY GENERATED to evoke Forest Hills / Queens: a numbered-street grid,
   mostly low/mid-rise apartment blocks and rowhouses, with a few taller towers near
   "subway hub" intersections — rather than skyscraper Manhattan. If you want the real
   footprints, the cleanest path is: export a bounding box from openstreetmap.org as
   .osm/.geojson yourself, and I can write you an importer that reads that file and
   builds the exact same building array this prototype already consumes.
   ========================================================================================= */

// ---------------------------------------------------------------------------------------
// INPUT / KEYBINDS  (fully rebindable at runtime — see #bindPanel)
// ---------------------------------------------------------------------------------------
const bindings = {
  forward:'KeyW', back:'KeyS', left:'KeyA', right:'KeyD',
  jump:'Space', traversal:'ShiftLeft', zip:'KeyE', webshot:'KeyX', pull:'KeyR', dive:'KeyC', melee:'KeyQ',
  block:'KeyF', toggleRun:'ControlLeft', shiftLock:'KeyV', menu:'Escape',
  zoomIn:'KeyI', zoomOut:'KeyO', debug:'Backquote'
};
const defaultBindings = {...bindings};
const SETTINGS_KEY = 'webSlingerPrototypeSettings';
const keys = {};
let listeningFor = null;
let running = true;       // Ctrl toggles this
let shiftLocked = false;
let paused = true;
let gameActive = false;
let debugOn = false;
let mouseSensitivity = 1;
let cameraDistance = 7.5;
let renderDistance = 520;
const MAX_CITY_RENDER_DISTANCE=5600;
let traversalHoldDelay=0.28;
let combinedTraversal=false;
let resolutionScale=1;
let animatedWater=true;
let soundEnabled=true;
let audioContext=null;
let hitStopT=0;
let cameraShakeT=0;
let cameraCollisionDistance = null;
let firstPersonAutoLock = false;
let cash=Math.max(0,parseInt(localStorage.getItem('webWeaversCash'))||0);
const SKIN_KEY='webWeaversSkinsV1';
const PLAYER_SKINS=[
  {id:'midtown',name:'MIDTOWN',price:0,primary:0x16263f,secondary:0x8f2638,legs:0x263143,shoes:0xf2f4f7,accent:0x596579,skin:0xb97858},
  {id:'shadow',name:'SHADOW',price:120,primary:0x12151d,secondary:0x513575,legs:0x20242d,shoes:0x0c0e13,accent:0x9a7bd1,skin:0x8d5138},
  {id:'velocity',name:'VELOCITY',price:180,primary:0x123a67,secondary:0x18a9d6,legs:0x101c2d,shoes:0xe6fbff,accent:0x6ee7ff,skin:0xd39a78},
  {id:'solar',name:'SOLAR',price:240,primary:0x6f1f32,secondary:0xe3a72f,legs:0x382331,shoes:0xffe4a1,accent:0xffcc45,skin:0xb97858},
  {id:'toxic',name:'TOXIC',price:300,primary:0x16201b,secondary:0x4bbf45,legs:0x202923,shoes:0xb8ff6a,accent:0x7bf05b,skin:0x6f3f30},
  {id:'arctic',name:'ARCTIC',price:360,primary:0xe8f2f7,secondary:0x72b7d6,legs:0x1d3555,shoes:0xffffff,accent:0xbdefff,skin:0xd39a78}
];
let skinSave={owned:['midtown'],selected:'midtown'};
try{skinSave={...skinSave,...JSON.parse(localStorage.getItem(SKIN_KEY)||'{}')};}catch{}
skinSave.owned=Array.isArray(skinSave.owned)?skinSave.owned.filter(id=>PLAYER_SKINS.some(s=>s.id===id)):['midtown'];
if(!skinSave.owned.includes('midtown'))skinSave.owned.unshift('midtown');
if(!skinSave.owned.includes(skinSave.selected))skinSave.selected='midtown';
const skinThumbnails=new Map();
let pendingSkinPurchase=null;
const PROGRESS_KEY='webWeaversProgressV1';
const UPGRADE_MAX=5;
let progress={health:0,damage:0,traversal:0,kills:0,gangs:0,missions:0,swingDistance:0,missionIndex:0};
try{progress={...progress,...JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}')};}catch{}
['health','damage','traversal'].forEach(k=>progress[k]=THREE.MathUtils.clamp(Math.floor(Number(progress[k])||0),0,UPGRADE_MAX));
['kills','gangs','missions','swingDistance','missionIndex'].forEach(k=>progress[k]=Math.max(0,Number(progress[k])||0));
function saveProgress(){localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));}
const missions=[
  {name:'CITY SWING',text:'Swing 500 metres',stat:'swingDistance',step:500,reward:60},
  {name:'STREET PATROL',text:'Stop 10 gang members',stat:'kills',step:10,reward:75},
  {name:'CLEAR THE BLOCKS',text:'Clear 2 gangs',stat:'gangs',step:2,reward:100},
];
let missionStart=0;
let lastSwingMissionBucket=-1;
function currentMission(){return missions[Math.floor(progress.missionIndex)%missions.length];}
function updateMissionUI(){
  const m=currentMission(),value=Math.max(0,progress[m.stat]-missionStart),ratio=Math.min(1,value/m.step);
  document.getElementById('missionTitle').textContent=m.name;
  document.getElementById('missionText').textContent=`${m.text} · ${Math.floor(value)}/${m.step} · $${m.reward}`;
  document.querySelector('#missionProgress span').style.width=(ratio*100)+'%';
  if(ratio>=1){addCash(m.reward,'OBJECTIVE COMPLETE');progress.missions++;progress.missionIndex++;missionStart=progress[currentMission().stat];saveProgress();updateMissionUI();}
}
function upgradeCost(kind,level=progress[kind]){return ({health:100,damage:140,traversal:160}[kind]||100)+level*80;}
function updateShopUI(){
  document.querySelectorAll('.shopBuy').forEach(btn=>{const k=btn.dataset.upgrade,l=progress[k];btn.disabled=l>=UPGRADE_MAX;btn.textContent=l>=UPGRADE_MAX?`MAX · LV ${l}`:`$${upgradeCost(k)} · LV ${l}`;});
  const stats=document.getElementById('careerStats');
  if(stats)stats.textContent=`${Math.floor(progress.swingDistance)}m swung · ${progress.kills} enemies · ${progress.gangs} gangs · ${progress.missions} missions`;
}

function updateCashUI(){
  const el=document.getElementById('cashValue');
  if(el) el.textContent=cash.toLocaleString('en-GB');
  const skinsCash=document.getElementById('skinsCashValue');
  if(skinsCash)skinsCash.textContent=cash.toLocaleString('en-GB');
}
function addCash(amount,label){
  cash+=amount;
  localStorage.setItem('webWeaversCash',String(cash));
  updateCashUI();
  if(label) flashMsg(`${label}  +$${amount}`);
}

loadSettings();
syncBindingLabels();
syncSensitivityUI();
syncRenderDistanceUI();
syncSwingDelayUI();
syncQualityUI();
updateCashUI();

window.addEventListener('keydown', e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
  if(!listeningFor && gameActive && !e.repeat && e.code==='KeyM'){
    e.preventDefault();setFullMapOpen(!fullMapOpen);return;
  }
  if(fullMapOpen){
    if(e.code==='Escape')setFullMapOpen(false);
    e.preventDefault();return;
  }
  if(listeningFor){
    bindings[listeningFor] = e.code;
    document.querySelector(`.keybtn[data-action="${listeningFor}"]`).textContent = prettyKey(e.code);
    document.querySelector(`.keybtn[data-action="${listeningFor}"]`).classList.remove('listening');
    listeningFor = null;
    saveSettings();
    return;
  }
  const already = keys[e.code];
  keys[e.code] = true;
  // Zipping is a committed burst only while the player gives it no other
  // instruction. Any fresh key except the zip key immediately returns control
  // with the current momentum intact.
  if(gameActive && !paused && !already && P.state==='zip' && e.code!==bindings.zip){
    cancelZip();
  }
  if(e.code === bindings.menu && !already && gameActive){ togglePause(); }
  if(!gameActive || paused) return;
  if(e.code === bindings.debug) toggleDebug();
  if(e.code === bindings.toggleRun && !already){ running = !running; saveSettings(); flashMsg(running?'RUN':'WALK'); }
  if(e.code === bindings.shiftLock && !already){ setShiftLock(!shiftLocked); }
  if(e.code === bindings.zoomIn && !already){ adjustCameraZoom(-0.65, true); }
  if(e.code === bindings.zoomOut && !already){ adjustCameraZoom(0.65, true); }
});
window.addEventListener('keyup', e=>{
  keys[e.code]=false;
  if(e.code === bindings.zoomIn || e.code === bindings.zoomOut) saveSettings();
});

function flashMsg(text){
  const el=document.getElementById('msgCenter');
  el.textContent=text; el.style.opacity=1;
  clearTimeout(flashMsg._t);
  flashMsg._t=setTimeout(()=>{ el.style.opacity=0; },700);
}
function ensureAudio(){
  if(!soundEnabled)return null;
  if(!audioContext){
    const AudioCtor=window.AudioContext||window.webkitAudioContext;
    if(AudioCtor)audioContext=new AudioCtor();
  }
  if(audioContext&&audioContext.state==='suspended')audioContext.resume();
  return audioContext;
}
function playSfx(type){
  const ctx=ensureAudio();if(!ctx)return;
  const profile={
    web:[230,520,.09,'sine'],hit:[105,55,.07,'square'],parry:[760,1180,.12,'triangle'],
    jump:[180,300,.08,'triangle'],hurt:[130,70,.13,'sawtooth']
  }[type];
  if(!profile)return;
  const [start,end,duration,wave]=profile;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain();
  oscillator.type=wave;oscillator.frequency.setValueAtTime(start,ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,end),ctx.currentTime+duration);
  gain.gain.setValueAtTime(.055,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
  oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+duration);
}
function setShiftLock(on){
  if(cameraDistance<=0.6){
    shiftLocked=false;
    firstPersonAutoLock=true;
    if(gameActive && !paused) requestMouseLock();
    return;
  }
  firstPersonAutoLock=false;
  shiftLocked = on;
  cameraCollisionDistance=null;
  if(on){
    pitch=THREE.MathUtils.clamp(pitch,-0.55,0.65);
    requestMouseLock();
    document.getElementById('lockHint').style.display='none';
  }
  else releaseMouseLock();
}
function togglePause(){
  if(!gameActive) return;
  if(document.getElementById('deathOverlay').style.display==='flex') return;
  paused = !paused;
  document.getElementById('pauseOverlay').style.display = paused?'flex':'none';
  if(paused) releaseMouseLock();
  if(paused) clearHeldInputs();
  else if(cameraDistance<=0.6){
    firstPersonAutoLock=true;
    requestMouseLock();
  }
}
function adjustCameraZoom(delta, persist=false){
  const wasFirstPerson=cameraDistance<=0.6;
  cameraDistance = THREE.MathUtils.clamp(cameraDistance + delta, 0.15, 18);
  const isFirstPerson=cameraDistance<=0.6;
  if(gameActive && !paused && isFirstPerson && !wasFirstPerson){
    shiftLocked=false;
    firstPersonAutoLock=true;
    requestMouseLock();
  } else if(wasFirstPerson && !isFirstPerson && firstPersonAutoLock){
    firstPersonAutoLock=false;
    releaseMouseLock();
  }
  if(persist) saveSettings();
}
function prettyKey(code){
  return code.replace('Key','').replace('Digit','').replace('Left','').replace('Space','SPACE').replace('Backquote','`');
}
function readSavedSettings(){
  try{
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  }catch{
    return {};
  }
}
function writeSavedSettings(data){
  try{
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  }catch{}
}
function loadSettings(){
  const saved = readSavedSettings();
  if(saved && typeof saved === 'object'){
    if(saved.bindings && typeof saved.bindings === 'object'){
      Object.keys(defaultBindings).forEach(k=>{
        if(typeof saved.bindings[k] === 'string') bindings[k] = saved.bindings[k];
      });
      // The traversal redesign intentionally replaces the old Q/E/Z layout.
      if(typeof saved.bindings.traversal !== 'string') bindings.traversal='ShiftLeft';
      if(typeof saved.bindings.dive !== 'string') bindings.dive='KeyC';
      if(saved.bindings.shiftLock==='ShiftLeft') bindings.shiftLock='KeyV';
    }
    if(typeof saved.running === 'boolean') running = saved.running;
    if(typeof saved.debugOn === 'boolean') debugOn = saved.debugOn;
    if(Number.isFinite(saved.mouseSensitivity)) mouseSensitivity = THREE.MathUtils.clamp(saved.mouseSensitivity, 0.5, 1.8);
    if(Number.isFinite(saved.cameraDistance)) cameraDistance = THREE.MathUtils.clamp(saved.cameraDistance, 0.15, 18);
    if(Number.isFinite(saved.renderDistance)) renderDistance = THREE.MathUtils.clamp(saved.renderDistance,220,MAX_CITY_RENDER_DISTANCE);
    if(Number.isFinite(saved.traversalHoldDelay)) traversalHoldDelay=THREE.MathUtils.clamp(saved.traversalHoldDelay,0.12,0.42);
    if(Number.isFinite(saved.resolutionScale)) resolutionScale=THREE.MathUtils.clamp(saved.resolutionScale,0.6,1);
    if(typeof saved.animatedWater==='boolean') animatedWater=saved.animatedWater;
    if(typeof saved.soundEnabled==='boolean') soundEnabled=saved.soundEnabled;
  }
}
function saveSettings(){
  writeSavedSettings({bindings, running, debugOn, mouseSensitivity, cameraDistance, renderDistance, traversalHoldDelay, combinedTraversal, resolutionScale, animatedWater, soundEnabled});
}
function syncBindingLabels(){
  ['shiftLock','toggleRun','jump','traversal','zip','webshot','pull','dive','melee','block','zoomIn','zoomOut','debug']
    .forEach(a=>{
      const el = document.querySelector(`.keybtn[data-action="${a}"]`);
      if(el) el.textContent = prettyKey(bindings[a]);
    });
}
function syncTraversalUI(){
  document.querySelector('#abSwingLeft .key').textContent=prettyKey(bindings.traversal);
  document.querySelector('#abSwingRight .key').textContent=prettyKey(bindings.zip);
}
document.querySelectorAll('.keybtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.keybtn').forEach(b=>b.classList.remove('listening'));
    btn.classList.add('listening');
    listeningFor = btn.dataset.action;
  });
});
document.getElementById('btnControls').onclick = ()=>{
  document.getElementById('bindPanel').style.display =
    document.getElementById('bindPanel').style.display==='block' ? 'none' : 'block';
};
document.getElementById('btnCloseBind').onclick = ()=>{
  document.getElementById('bindPanel').style.display='none';
  document.body.classList.remove('settings-open');
};
function syncSensitivityUI(){
  const slider = document.getElementById('sensitivitySlider');
  const label = document.getElementById('sensitivityValue');
  if(!slider || !label) return;
  slider.value = Math.round(mouseSensitivity * 100);
  label.textContent = slider.value + '%';
}
document.getElementById('sensitivitySlider').addEventListener('input', e=>{
  mouseSensitivity = THREE.MathUtils.clamp(Number(e.target.value)/100, 0.5, 1.8);
  syncSensitivityUI();
  saveSettings();
});
function syncRenderDistanceUI(){
  const slider=document.getElementById('renderDistanceSlider');
  const label=document.getElementById('renderDistanceValue');
  if(!slider||!label)return;
  slider.value=Math.round(renderDistance);
  label.textContent=renderDistance>=MAX_CITY_RENDER_DISTANCE?'WHOLE MAP':Math.round(renderDistance);
}
document.getElementById('renderDistanceSlider').addEventListener('input',e=>{
  renderDistance=THREE.MathUtils.clamp(Number(e.target.value),220,MAX_CITY_RENDER_DISTANCE);
  syncRenderDistanceUI();
  applyRenderDistance();
  saveSettings();
});
function syncSwingDelayUI(){
  const slider=document.getElementById('swingDelaySlider');
  const label=document.getElementById('swingDelayValue');
  if(!slider||!label)return;
  slider.value=Math.round(traversalHoldDelay*1000);
  label.textContent=Math.round(traversalHoldDelay*1000)+'ms';
}
document.getElementById('swingDelaySlider')?.addEventListener('input',e=>{
  traversalHoldDelay=THREE.MathUtils.clamp(Number(e.target.value)/1000,0.12,0.42);
  syncSwingDelayUI();
  saveSettings();
});
function syncQualityUI(){
  const slider=document.getElementById('resolutionSlider');
  const label=document.getElementById('resolutionValue');
  const water=document.getElementById('waterToggle');
  const sound=document.getElementById('soundToggle');
  if(slider) slider.value=Math.round(resolutionScale*100);
  if(label) label.textContent=Math.round(resolutionScale*100)+'%';
  if(water) water.checked=animatedWater;
  if(sound) sound.checked=soundEnabled;
}
document.getElementById('resolutionSlider').addEventListener('input',e=>{
  resolutionScale=THREE.MathUtils.clamp(Number(e.target.value)/100,0.6,1);
  syncQualityUI();
  resizeRenderer();
  saveSettings();
});
document.getElementById('waterToggle').addEventListener('change',e=>{
  animatedWater=e.target.checked;
  saveSettings();
});
document.getElementById('soundToggle').addEventListener('change',e=>{
  soundEnabled=e.target.checked;
  if(soundEnabled)ensureAudio();
  saveSettings();
});
syncTraversalUI();
missionStart=progress[currentMission().stat];
updateMissionUI();
updateShopUI();

let mouseDown = {0:false,2:false};
window.addEventListener('mousedown', e=>{
  mouseDown[e.button]=true;
  if(e.button===2){ e.preventDefault(); document.getElementById('lockHint').style.display='none'; }
});
window.addEventListener('mouseup', e=>{
  mouseDown[e.button]=false;
});
window.addEventListener('contextmenu', e=>e.preventDefault());
window.addEventListener('wheel', e=>{
  if(fullMapOpen || (e.target.closest && e.target.closest('#bindPanel'))) return;
  e.preventDefault();
  const pinchMultiplier = e.ctrlKey ? 0.027 : 0.009;
  adjustCameraZoom(e.deltaY * pinchMultiplier, true);
}, {passive:false});
let gestureStartScale = 1;
window.addEventListener('gesturestart', e=>{
  e.preventDefault();
  gestureStartScale = e.scale || 1;
}, {passive:false});
window.addEventListener('gesturechange', e=>{
  e.preventDefault();
  const scale = e.scale || 1;
  adjustCameraZoom((gestureStartScale - scale) * 3.2, true);
  gestureStartScale = scale;
}, {passive:false});

function toggleDebug(){
  debugOn=!debugOn;
  applyDebugVisibility();
  saveSettings();
}
function applyDebugVisibility(){
  document.getElementById('debugPanel').style.display = debugOn?'block':'none';
  const debugToggle=document.getElementById('debugToggle');
  if(debugToggle) debugToggle.checked=debugOn;
  if(typeof spawnMarkers !== 'undefined') spawnMarkers.forEach(m=>m.visible=debugOn);
  if(typeof anchorMarkers !== 'undefined') anchorMarkers.forEach(m=>m.visible=debugOn);
}
document.getElementById('btnResume').onclick = togglePause;
document.getElementById('debugToggle').addEventListener('change',e=>{
  debugOn=!!e.target.checked;
  applyDebugVisibility();
  saveSettings();
});
document.getElementById('btnStartSettings').onclick = ()=>{
  document.body.classList.add('settings-open');
  document.getElementById('bindPanel').style.display='block';
};

function skinById(id){return PLAYER_SKINS.find(s=>s.id===id)||PLAYER_SKINS[0];}
function saveSkins(){localStorage.setItem(SKIN_KEY,JSON.stringify(skinSave));}
function renderSkinMenu(){
  document.getElementById('skinsCashValue').textContent=cash.toLocaleString('en-GB');
  const grid=document.getElementById('skinGrid');
  grid.innerHTML='';
  PLAYER_SKINS.forEach(option=>{
    const hasSkin=skinSave.owned.includes(option.id);
    const equipped=skinSave.selected===option.id;
    const card=document.createElement('article');
    card.className=`skinCard${hasSkin?'':' locked'}${equipped?' equipped':''}`;
    const modelButton=document.createElement('button');
    modelButton.className='skinModelButton';
    modelButton.type='button';
    modelButton.disabled=!hasSkin;
    modelButton.setAttribute('aria-label',hasSkin?`Equip ${option.name}`:`${option.name} is locked`);
    const image=document.createElement('img');
    image.alt=`${option.name} player model`;
    image.src=skinThumbnails.get(option.id)||'';
    modelButton.appendChild(image);
    if(hasSkin)modelButton.onclick=()=>{
      skinSave.selected=option.id;
      saveSkins();
      applyPlayerSkin(option.id);
      renderSkinMenu();
    };
    const name=document.createElement('div');
    name.className='skinModelName';
    name.textContent=option.name;
    card.append(modelButton,name);
    if(hasSkin){
      const status=document.createElement('div');
      status.className='skinOwned';
      status.textContent=equipped?'EQUIPPED':'OWNED · CLICK MODEL TO EQUIP';
      card.appendChild(status);
    }else{
      const price=document.createElement('button');
      price.type='button';
      price.className='skinPrice';
      price.textContent=`$${option.price}`;
      price.onclick=()=>openSkinConfirm(option.id);
      card.appendChild(price);
    }
    grid.appendChild(card);
  });
}
function openSkinConfirm(id){
  const skin=skinById(id);
  pendingSkinPurchase=skin.id;
  const affordable=cash>=skin.price;
  document.getElementById('skinConfirmText').textContent=affordable
    ?`Buy ${skin.name} for $${skin.price}?`
    :`${skin.name} costs $${skin.price}. You need $${skin.price-cash} more.`;
  document.getElementById('btnConfirmSkin').disabled=!affordable;
  const confirm=document.getElementById('skinConfirm');
  confirm.classList.add('open');
  confirm.setAttribute('aria-hidden','false');
}
function closeSkinConfirm(){
  pendingSkinPurchase=null;
  const confirm=document.getElementById('skinConfirm');
  confirm.classList.remove('open');
  confirm.setAttribute('aria-hidden','true');
}
function confirmSkinPurchase(){
  if(!pendingSkinPurchase)return;
  const skin=skinById(pendingSkinPurchase);
  if(skinSave.owned.includes(skin.id)){closeSkinConfirm();return;}
  if(cash<skin.price){openSkinConfirm(skin.id);return;}
  cash-=skin.price;
  localStorage.setItem('webWeaversCash',String(cash));
  skinSave.owned.push(skin.id);
  skinSave.selected=skin.id;
  saveSkins();
  applyPlayerSkin(skin.id);
  updateCashUI();
  closeSkinConfirm();
  renderSkinMenu();
}
function openSkins(){
  document.getElementById('startCard').style.display='none';
  const panel=document.getElementById('skinsPanel');
  panel.classList.add('open');panel.setAttribute('aria-hidden','false');
  renderSkinMenu();
}
function closeSkins(){
  closeSkinConfirm();
  const panel=document.getElementById('skinsPanel');
  panel.classList.remove('open');panel.setAttribute('aria-hidden','true');
  document.getElementById('startCard').style.display='block';
}
document.getElementById('btnSkins').onclick=openSkins;
document.getElementById('btnCloseSkins').onclick=closeSkins;
document.getElementById('btnConfirmSkin').onclick=confirmSkinPurchase;
document.getElementById('btnCancelSkin').onclick=closeSkinConfirm;

function startGame(){
  if(P.state==='defeated') resetDefeatedPlayer();
  gameActive=true;
  paused=false;
  document.body.classList.remove('settings-open');
  document.getElementById('startScreen').style.display='none';
  document.getElementById('gameCanvas').style.visibility='visible';
  document.getElementById('hud').style.display='block';
  document.getElementById('pauseOverlay').style.display='none';
  document.getElementById('deathOverlay').style.display='none';
  clearHeldInputs();
  if(cameraDistance<=0.6){
    firstPersonAutoLock=true;
    requestMouseLock();
  }
}

function showStartScreen(){
  gameActive=false;
  paused=true;
  document.body.classList.remove('settings-open');
  document.getElementById('bindPanel').style.display='none';
  document.getElementById('pauseOverlay').style.display='none';
  document.getElementById('deathOverlay').style.display='none';
  document.getElementById('hud').style.display='none';
  document.getElementById('gameCanvas').style.visibility='hidden';
  document.getElementById('startScreen').style.display='flex';
  closeSkins();
  releaseMouseLock();
  firstPersonAutoLock=false;
  shiftLocked=false;
  clearHeldInputs();
}

document.getElementById('btnPlay').onclick=()=>{ensureAudio();startGame();};
document.getElementById('btnMainMenu').onclick=showStartScreen;
document.getElementById('btnDeathMainMenu').onclick=showStartScreen;

function resetDefeatedPlayer(){
  P.pos.copy(PLAYER_SPAWN);
  P.vel.set(0,0,0);
  cameraLead.set(0,0,0);
  P.hp=P.maxHp;
  P.invuln=1.5;
  P.state='ground';
  P.gliding=false;
  P.wingCooldown=0;
  P.climbNormal=null;
  P.climbBuilding=null;
  P.climbVisualAngle=0;
  P.wallRunAutoT=0;
  P.wallRunDirection.set(0,0);
  P.wallRunEntrySpeed=0;
  P.wallRunFromSwing=false;
  P.wallRunMomentum=0;
  P.meleeT=0;
  P.parryT=0;
  P.wallFlipT=0;
  P.wallDetachT=0;
  P.pendingFallDamage=0;
  P.recoveryT=0;
  P.recoverLock=false;
  P.traversalHoldT=0;
  P.traversalSwingStarted=false;
  P.traversalSearchAttempted=false;
  P.jumpChargeT=0;
  P.jumpCharging=false;
  P.diving=false;
  P.swingHistoryT=0;
  P.swingReleaseHand=null;
  P.quickRecoveryT=0;
  P.recoveryRollT=0;
  P.recoveryLaunchPending=false;
  P.recoveryVelocity.set(0,0,0);
  P.peakY=P.pos.y;
  P.swingWebs.left.anchor=null;
  P.swingWebs.right.anchor=null;
  P.swingWebs.left.physicsPivot=null;
  P.swingWebs.right.physicsPivot=null;
  P.swingWebs.left.auto=false;
  P.swingWebs.right.auto=false;
  P.swingWebs.left.fallCatch=false;
  P.swingWebs.right.fallCatch=false;
  P.activeSwingHand=null;
  P.nextSwingHand='left';
  P.swingRequireRelease=false;
  P.swingPhase='entry';
  P.swingPhaseT=0;
  P.swingAge=0;
  P.swingHasDescended=false;
  P.swingClimbedAfterDescent=false;
  P.swingLastVy=0;
  P.swingBottomSpeed=0;
  P.swingPeakRise=0;
  P.swingTelemetry=null;
  P.swingGroundPullT=0;
  P.swingGroundPullAnchor=null;
  P.swingGroundPullAnchors.left=null;
  P.swingGroundPullAnchors.right=null;
  pullTarget=null;
  combatTarget=null;
  comboChainTarget=null;
  comboChainMode=null;
  zipTarget=null;
  zipDir=null;
  zipEnemyTarget=null;
}

function respawnPlayer(){
  resetDefeatedPlayer();
  paused=false;
  document.getElementById('deathOverlay').style.display='none';
  clearHeldInputs();
  flashMsg('BACK ON PATROL');
  if(cameraDistance<=0.6){
    firstPersonAutoLock=true;
    requestMouseLock();
  }
}

function showDeathScreen(){
  paused=true;
  document.getElementById('deathOverlay').style.display='flex';
  releaseMouseLock();
  shiftLocked=false;
  firstPersonAutoLock=false;
  clearHeldInputs();
}

document.getElementById('btnRespawn').onclick=respawnPlayer;

// Mouse-look: RMB-drag rotates the camera using the mouse's raw movementX/Y — this works
// immediately on every browser and doesn't depend on the Pointer Lock API succeeding.
// Shift toggles a persistent lock (Pointer Lock, for unlimited drag distance) as an
// optional alternative to holding RMB the whole time.
const canvas = document.getElementById('gameCanvas');
let yaw = 0, pitch = -0.15;
let cursorClientX=innerWidth*0.5, cursorClientY=innerHeight*0.5;
const nativeMouseHandler=window.webkit?.messageHandlers?.rodSpaceControls;
const hasNativeMouse=Boolean(window.__rodSpaceMacApp&&nativeMouseHandler);
function requestMouseLock(){
  if(hasNativeMouse)nativeMouseHandler.postMessage({type:'mouseLock',enabled:true});
  else if(document.pointerLockElement!==canvas)canvas.requestPointerLock?.().catch?.(()=>{});
}
function releaseMouseLock(){
  if(hasNativeMouse)nativeMouseHandler.postMessage({type:'mouseLock',enabled:false});
  else if(document.pointerLockElement===canvas)document.exitPointerLock?.();
}
function applyLookDelta(dx,dy){
  if(!gameActive||paused)return;
  const firstPersonLook=cameraDistance<=0.6;
  if(!mouseDown[2]&&!shiftLocked&&!firstPersonLook)return;
  const lookRate=0.0028*mouseSensitivity;
  yaw-=dx*lookRate;
  pitch=THREE.MathUtils.clamp(pitch-dy*lookRate,-1.52,1.52);
}
window.__rodSpaceNativeMouse={move:applyLookDelta};

function aimScreenPoint(){
  // Every aimed action follows the over-shoulder reticle. The old free-cursor
  // ray made a web appear to attach only after the camera/input state changed.
  return {x:0,y:0};
}
document.addEventListener('pointerlockchange', ()=>{
  if(!hasNativeMouse&&document.pointerLockElement!==canvas) shiftLocked = false;
});
document.addEventListener('mousemove', e=>{
  cursorClientX=e.clientX;
  cursorClientY=e.clientY;
  if(!hasNativeMouse)applyLookDelta(e.movementX,e.movementY);
});

// ---------------------------------------------------------------------------------------
// THREE SCENE
// ---------------------------------------------------------------------------------------
const MAX_PIXEL_RATIO = window.__rodSpaceMacApp ? 0.9 : 1.5; // reduce WebKit GPU fill cost; HUD unaffected
const renderer = new THREE.WebGLRenderer({canvas, antialias:!window.__rodSpaceMacApp,powerPreference:'high-performance'});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,MAX_PIXEL_RATIO)*resolutionScale);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd3ff);
scene.fog = new THREE.Fog(0x8fd3ff, renderDistance*0.58, renderDistance);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, renderDistance);
const cameraLead = new THREE.Vector3();
const cameraLeadTarget = new THREE.Vector3();
function applyRenderDistance(){
  if(typeof camera==='undefined'||typeof scene==='undefined') return;
  camera.far=renderDistance;
  camera.updateProjectionMatrix();
  scene.fog.near=renderDistance>=MAX_CITY_RENDER_DISTANCE?renderDistance*1.02:renderDistance*.58;
  scene.fog.far=renderDistance>=MAX_CITY_RENDER_DISTANCE?renderDistance*1.25:renderDistance;
  if(window.__wwCityReady) updateRenderVisibility();
}
function resizeRenderer(){
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio,MAX_PIXEL_RATIO)*resolutionScale);
  renderer.setSize(w, h);
}
window.addEventListener('resize', resizeRenderer);
applyRenderDistance();

const hemi = new THREE.HemisphereLight(0xffffff, 0x3a3a55, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2c0, 1.05);
sun.position.set(120,180,80);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff,0.25));

// ---------------------------------------------------------------------------------------
// CITY GENERATION  (long Manhattan-style island with unequal avenues/blocks)
// ---------------------------------------------------------------------------------------
const BLOCKS_X = 20;
const BLOCKS_Z = 75;           // 2.5× wider and longer than the 8 × 30 island
const BLOCK_X = 64;             // long east/west blocks
const BLOCK_Z = 42;             // shorter north/south blocks
const STREET_X = 28;            // broad avenues with room for traversal and traffic
const STREET_Z = 22;            // wider cross streets
const TILE_X = BLOCK_X+STREET_X;
const TILE_Z = BLOCK_Z+STREET_Z;
const HALF_CITY_X = (BLOCKS_X*TILE_X)/2;
const HALF_CITY_Z = (BLOCKS_Z*TILE_Z)/2;
const HALF_CITY = Math.max(HALF_CITY_X,HALF_CITY_Z);
const PLAYER_SPAWN = new THREE.Vector3(0, 0, 0); // central avenue intersection, never inside a lot
const ISLAND_RADIUS_X = HALF_CITY_X + 58;
const ISLAND_RADIUS_Z = HALF_CITY_Z + 52;
const WATER_LEVEL = -3.2;
const OCEAN_FLOOR = -24;

// Higher clouds: above the highest rooftops, distributed across the entire
// island, with feathered alpha rather than opaque white square sprites.
const cloudCanvas=document.createElement('canvas');
cloudCanvas.width=256;cloudCanvas.height=128;
const cloudCtx=cloudCanvas.getContext('2d');
for(const [x,y,rx,ry,opacity] of [
  [76,66,56,31,.78],[128,46,63,35,.92],[180,68,55,28,.82],
  [126,81,81,29,.65]
]){
  cloudCtx.save();
  cloudCtx.translate(x,y);cloudCtx.scale(rx,ry);
  const glow=cloudCtx.createRadialGradient(0,0,.12,0,0,1);
  glow.addColorStop(0,'rgba(255,255,255,'+opacity+')');
  glow.addColorStop(.58,'rgba(255,255,255,'+(opacity*.72)+')');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  cloudCtx.fillStyle=glow;cloudCtx.beginPath();cloudCtx.arc(0,0,1,0,Math.PI*2);cloudCtx.fill();
  cloudCtx.restore();
}
const cloudTexture=new THREE.CanvasTexture(cloudCanvas);
const skyClouds=[];
for(let i=0;i<24;i++){
  const cloud=new THREE.Sprite(new THREE.SpriteMaterial({
    map:cloudTexture,transparent:true,opacity:.76,depthWrite:false
  }));
  cloud.position.set(
    (Math.random()-.5)*(HALF_CITY_X*2+260),
    540+Math.random()*190,
    (Math.random()-.5)*(HALF_CITY_Z*2+260)
  );
  const size=155+Math.random()*130;
  cloud.scale.set(size,size*.5,1);
  scene.add(cloud);skyClouds.push(cloud);
}

function isOverIsland(x,z, extra=0){
  const rx=ISLAND_RADIUS_X+extra, rz=ISLAND_RADIUS_Z+extra;
  return Math.pow(Math.abs(x)/rx,6)+Math.pow(Math.abs(z)/rz,6) <= 1;
}

function makeIslandShape(rx,rz){
  const shape=new THREE.Shape();
  const power=2/6;
  for(let i=0;i<=128;i++){
    const t=(i/128)*Math.PI*2;
    const c=Math.cos(t), s=Math.sin(t);
    const x=rx*Math.sign(c)*Math.pow(Math.abs(c),power);
    const z=rz*Math.sign(s)*Math.pow(Math.abs(s),power);
    if(i===0) shape.moveTo(x,z); else shape.lineTo(x,z);
  }
  shape.closePath();
  return shape;
}

const buildingMeshes = [];      // visual bounds and collision bounds are identical
const BUILDING_GRID_CELL = 72;
const buildingSpatialGrid = new Map();
const parkAreas = [];
const anchorEdges = [];         // continuous upper perimeters for swing debug viz
const anchorMarkers = [];
const colorPalette = [0xc9564f,0xe0a458,0x6a8caf,0xc7b198,0x8fae6b,0xb46a5a,0x9aa5b1];
const dockPiers=[];
const shoreFenceColliders=[];
const districtStats={
  skyscrapers:{blocks:0,buildings:0,minHeight:Infinity,maxHeight:0},
  centralPark:{blocks:0,trees:0},
  lowerClass:{blocks:0,buildings:0,minHeight:Infinity,maxHeight:0},
  docks:{blocks:0,warehouses:0}
};

// One connected inland park, high-rise north/west, lower-rise south/east,
// and a separate working waterfront at the south-east shoreline.
const PARK_BOUNDS={
  minX:-HALF_CITY_X+7*TILE_X,
  maxX:-HALF_CITY_X+13*TILE_X-STREET_X,
  minZ:-HALF_CITY_Z+27*TILE_Z,
  maxZ:-HALF_CITY_Z+48*TILE_Z-STREET_Z
};
function districtForBlock(ix,iz){
  // Waterfront warehouses are confined to the south-east bank. Three rows
  // of lower-rise neighborhood separate the docks from the park.
  if(ix>=BLOCKS_X-2 && iz>=59 && iz<=70) return 'docks';
  // One contiguous 6-by-21-block park, with three or more full blocks of
  // neighborhood between it and the working waterfront.
  if(ix>=7 && ix<=12 && iz>=27 && iz<=47) return 'centralPark';
  if(iz<=26 || (ix<=4 && iz<=49)) return 'skyscrapers';
  return 'lowerClass';
}

const cityGroup = new THREE.Group();
scene.add(cityGroup);

// A rounded island and shoreline replace the old square map border.
const oceanUniforms={time:{value:0}};
const ocean = new THREE.Mesh(
  new THREE.PlaneGeometry(7300,7300,112,112),
  new THREE.ShaderMaterial({
    uniforms:oceanUniforms,
    vertexShader:`
      uniform float time;
      varying vec2 vUv;
      varying float vWave;
      varying vec3 vWorld;
      void main(){
        vUv=uv;
        vec3 p=position;
        float broad=sin(p.x*0.028+time*0.72)+cos(p.y*0.033-time*0.58);
        float chop=sin((p.x+p.y)*0.067-time*1.05)*0.42;
        p.z=(broad*0.34)+(chop*0.22);
        vWave=p.z;
        vWorld=(modelMatrix*vec4(p,1.0)).xyz;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }
    `,
    fragmentShader:`
      uniform float time;
      varying vec2 vUv;
      varying float vWave;
      varying vec3 vWorld;
      void main(){
        float ripple=sin(vWorld.x*0.42+time*1.9)+sin(vWorld.z*0.36-time*1.5);
        float crossing=sin((vWorld.x-vWorld.z)*0.22+time*1.2);
        float crest=smoothstep(1.35,2.05,ripple+crossing*0.55+vWave*1.8);
        float depth=0.5+0.5*sin((vUv.x+vUv.y)*8.0);
        vec3 deep=mix(vec3(0.012,0.13,0.25),vec3(0.025,0.30,0.43),depth);
        float sunGlint=pow(max(0.0,sin(vWorld.x*0.055+time*0.25)*cos(vWorld.z*0.047-time*0.18)),10.0);
        vec3 water=mix(deep,vec3(0.42,0.86,0.94),crest*0.72);
        water+=vec3(1.0,0.86,0.55)*sunGlint*0.28;
        gl_FragColor=vec4(water,1.0);
      }
    `
  })
);
ocean.rotation.x=-Math.PI/2;
ocean.position.y=WATER_LEVEL;
scene.add(ocean);

const shore = new THREE.Mesh(
  new THREE.ShapeGeometry(makeIslandShape(ISLAND_RADIUS_X+9,ISLAND_RADIUS_Z+9)),
  new THREE.MeshLambertMaterial({color:0xb9c3c5})
);
shore.rotation.x=-Math.PI/2;
shore.position.y=-0.18;
scene.add(shore);

const groundMat = new THREE.MeshLambertMaterial({color:0x3d3f46});
const ground = new THREE.Mesh(
  new THREE.ShapeGeometry(makeIslandShape(ISLAND_RADIUS_X,ISLAND_RADIUS_Z)),
  groundMat
);
ground.rotation.x = -Math.PI/2;
ground.position.y=0;
scene.add(ground);

function makeSkylineTexture(seed){
  const canvas=document.createElement('canvas');
  canvas.width=1024; canvas.height=256;
  const ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,256);
  sky.addColorStop(0,'rgba(135,206,242,0)');
  sky.addColorStop(0.35,'rgba(135,206,242,0.08)');
  sky.addColorStop(1,'rgba(76,132,166,0.48)');
  ctx.fillStyle=sky; ctx.fillRect(0,0,1024,256);
  let x=-20, n=seed*9973;
  const rand=()=>{ n=(n*1664525+1013904223)>>>0; return n/4294967296; };
  while(x<1044){
    const w=18+rand()*48, h=42+rand()*120;
    ctx.fillStyle=`rgba(${55+rand()*28|0},${83+rand()*35|0},${112+rand()*38|0},0.72)`;
    ctx.fillRect(x,256-h,w,h);
    if(rand()>.45){
      ctx.fillStyle='rgba(255,226,139,0.48)';
      for(let wy=256-h+12;wy<246;wy+=17){
        for(let wx=x+7;wx<x+w-5;wx+=12){
          if(rand()>.56) ctx.fillRect(wx,wy,4,6);
        }
      }
    }
    x+=w+3+rand()*8;
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

// A cylindrical panorama has no corner gaps: every route toward the shoreline
// sees another borough across the water instead of an empty horizon.
const skylineTexture=makeSkylineTexture(7);
skylineTexture.wrapS=THREE.RepeatWrapping;
skylineTexture.repeat.set(4,1);
const distantSkyline=new THREE.Mesh(
  new THREE.CylinderGeometry(ISLAND_RADIUS_Z+500,ISLAND_RADIUS_Z+500,210,96,1,true),
  new THREE.MeshBasicMaterial({
    map:skylineTexture,
    transparent:true,
    depthWrite:false,
    side:THREE.BackSide
  })
);
distantSkyline.position.y=82;
distantSkyline.renderOrder=-2;
scene.add(distantSkyline);

// sidewalks/lots (lighter tint under each block so streets read as darker grid lines)
const lotMat = new THREE.MeshLambertMaterial({color:0x55575e,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
const parkMat = new THREE.MeshLambertMaterial({color:0x587747,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const trunkMat = new THREE.MeshLambertMaterial({color:0x594332});
const leavesMat = new THREE.MeshLambertMaterial({color:0x4d7d49});
const treeTrunkGeo=new THREE.CylinderGeometry(0.42,0.55,3.4,6);
const treeCrownGeo=new THREE.DodecahedronGeometry(2.2,0);
const rooftopMetalMat=new THREE.MeshLambertMaterial({color:0x6f7b83});
const rooftopDarkMat=new THREE.MeshLambertMaterial({color:0x333b43});
const lampMat=new THREE.MeshLambertMaterial({color:0x20252b});
const lampGlowMat=new THREE.MeshBasicMaterial({color:0xffe39a});

const facadeTextures=Array.from({length:4},(_,style)=>{
  const canvas=document.createElement('canvas');
  canvas.width=128;canvas.height=256;
  const ctx=canvas.getContext('2d');
  const bases=['#b4b7ba','#b6a392','#93a0ae','#aeb5a6'];
  ctx.fillStyle=bases[style];ctx.fillRect(0,0,128,256);
  // Brick mortar / stone floor courses prevent the flat checkerboard look.
  for(let y=0;y<256;y+=16){
    ctx.fillStyle=style===1?'#8a7d73':'#87919b';ctx.fillRect(0,y,128,1);
    if(style===1)for(let x=(y%32===0?0:12);x<128;x+=24)
      ctx.fillRect(x,y,1,16);
  }
  for(let row=0;row<14;row++){
    const y=row*18+4;
    for(let col=0;col<5;col++){
      const x=col*25+5;
      // Lintels, sill shadows, frames and reflective split-pane glass.
      ctx.fillStyle='#535c64';ctx.fillRect(x-2,y-2,19,16);
      const lit=((row*11+col*7+style*3)%13)<4;
      ctx.fillStyle=lit?'#d5b77c':'#223b52';
      ctx.fillRect(x,y,15,11);
      ctx.fillStyle=lit?'#efdbaf':'#638296';
      ctx.fillRect(x+1,y+1,6,3);
      ctx.fillStyle='#81919b';ctx.fillRect(x+7,y,1,11);
      ctx.fillStyle='#5d6670';ctx.fillRect(x-3,y+12,21,2);
    }
  }
  const tex=new THREE.CanvasTexture(canvas);
  tex.encoding=THREE.sRGBEncoding;
  tex.minFilter=THREE.LinearMipmapLinearFilter;
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(2,3);
  return tex;
});
const buildingMaterialSets=colorPalette.map((color,i)=>{
  const wall=new THREE.MeshLambertMaterial({
    color,map:facadeTextures[i%facadeTextures.length],
    emissive:new THREE.Color(color),emissiveIntensity:.18
  });
  const roof=new THREE.MeshLambertMaterial({color:new THREE.Color(color).multiplyScalar(.62)});
  return [wall,wall,roof,roof,wall,wall];
});

// Grid-only Manhattan: no giant diagonal avenue through Central Park.

function addEdges(mesh, color=0x111111){
  const eg = new THREE.EdgesGeometry(mesh.geometry, 20);
  const line = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({color}));
  mesh.add(line);
}

function makeBuilding(cx, cz, w, d, h, colorIdx){
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = buildingMaterialSets[colorIdx % buildingMaterialSets.length];
  // Six material groups caused six draw calls per tower. Use one facade
  // material and a separate roof cap, reducing it to two while preserving
  // the original wall tint, windows, and roof colour.
  const mesh = new THREE.Mesh(geo, mat[0]);
  const roofCap=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat[2]);
  roofCap.rotation.x=-Math.PI/2;
  roofCap.position.y=h/2+0.025;
  mesh.add(roofCap);
  mesh.position.set(cx, h/2, cz);
  // Narrow roofline coping gives the silhouette a recognizable cornice.
  if(h>38){
    const coping=new THREE.Mesh(
      new THREE.BoxGeometry(w+.55,.5,d+.55),rooftopMetalMat);
    coping.position.set(0,h/2+.26,0);mesh.add(coping);
  }
  addEdges(mesh);
  // Street-facing entrances and lightweight fire escapes add scale without
  // joining the physics mesh, so traversal collision stays predictable.
  const door=new THREE.Mesh(new THREE.BoxGeometry(Math.min(3.2,w*.16),4.2,.18),rooftopDarkMat);
  door.position.set(0,-h/2+2.1,d/2+.1);mesh.add(door);
  if(h>85&&colorIdx%3===0){
    for(let fy=12;fy<Math.min(h-8,70);fy+=12){
      const escape=new THREE.Mesh(new THREE.BoxGeometry(Math.min(8,w*.42),.22,1.35),rooftopMetalMat);
      escape.position.set(w*.2,-h/2+fy,d/2+.75);mesh.add(escape);
    }
  }
  // Roof silhouettes make towers readable while swinging without adding new
  // collision shapes that could snag the player.
  if(h>105){
    const roofRoom=new THREE.Mesh(
      new THREE.BoxGeometry(Math.min(10,w*.25),3.2,Math.min(8,d*.28)),
      rooftopDarkMat
    );
    roofRoom.position.set((colorIdx%3-1)*w*.12,h/2+1.6,0);
    mesh.add(roofRoom);
  }
  if(h>150 && colorIdx%2===0){
    const tank=new THREE.Group();
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,4.2,10),rooftopMetalMat);
    barrel.position.y=4.4;
    const legs=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,4.2,5),rooftopDarkMat);
    legs.position.y=2.1;
    tank.add(barrel,legs);
    tank.position.set(-w*.22,h/2,d*.18);
    mesh.add(tank);
  }
  cityGroup.add(mesh);
  const minX = cx-w/2, maxX = cx+w/2, minZ = cz-d/2, maxZ = cz+d/2;
  const rec = {
    mesh, minX, maxX, minZ, maxZ, h,
    materialVariant:colorIdx%colorPalette.length,proxyIndex:-1,
    hitMinX:minX, hitMaxX:maxX,
    hitMinZ:minZ, hitMaxZ:maxZ
  };
  mesh.userData.buildingRecord=rec;
  buildingMeshes.push(rec);
  const minGX=Math.floor(rec.hitMinX/BUILDING_GRID_CELL);
  const maxGX=Math.floor(rec.hitMaxX/BUILDING_GRID_CELL);
  const minGZ=Math.floor(rec.hitMinZ/BUILDING_GRID_CELL);
  const maxGZ=Math.floor(rec.hitMaxZ/BUILDING_GRID_CELL);
  for(let gx=minGX;gx<=maxGX;gx++){
    for(let gz=minGZ;gz<=maxGZ;gz++){
      const key=`${gx},${gz}`;
      if(!buildingSpatialGrid.has(key)) buildingSpatialGrid.set(key,[]);
      buildingSpatialGrid.get(key).push(rec);
    }
  }
  anchorEdges.push([
    new THREE.Vector3(minX,h-0.65,minZ),
    new THREE.Vector3(maxX,h-0.65,minZ),
    new THREE.Vector3(maxX,h-0.65,maxZ),
    new THREE.Vector3(minX,h-0.65,maxZ)
  ]);
  return rec;
}

// Low world geometry participates in movement collision and height queries but
// deliberately has no buildingRecord userData, so it cannot become a web anchor.
function registerWorldCollider(mesh,minX,maxX,minZ,maxZ,h){
  const rec={mesh,minX,maxX,minZ,maxZ,h,hitMinX:minX,hitMaxX:maxX,hitMinZ:minZ,hitMaxZ:maxZ,worldOnly:true};
  buildingMeshes.push(rec);
  const minGX=Math.floor(minX/BUILDING_GRID_CELL),maxGX=Math.floor(maxX/BUILDING_GRID_CELL);
  const minGZ=Math.floor(minZ/BUILDING_GRID_CELL),maxGZ=Math.floor(maxZ/BUILDING_GRID_CELL);
  for(let gx=minGX;gx<=maxGX;gx++)for(let gz=minGZ;gz<=maxGZ;gz++){
    const key=`${gx},${gz}`;
    if(!buildingSpatialGrid.has(key))buildingSpatialGrid.set(key,[]);
    buildingSpatialGrid.get(key).push(rec);
  }
  return rec;
}

function addCentralPark(){
  // One green surface across all former block boundaries.
  const b=PARK_BOUNDS;
  const w=b.maxX-b.minX,d=b.maxZ-b.minZ;
  const cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(w,d),parkMat);
  grass.rotation.x=-Math.PI/2;
  grass.position.set(cx,0.40,cz);
  scene.add(grass);
  parkAreas.push({minX:b.minX,maxX:b.maxX,minZ:b.minZ,maxZ:b.maxZ});
  const pathMat=new THREE.MeshLambertMaterial({color:0xc1ae87,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  function parkPath(x,z,width,depth){
    const path=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),pathMat);
    path.rotation.x=-Math.PI/2;
    path.position.set(x,.48,z);
    scene.add(path);
  }
  parkPath(cx,cz,5.5,d*.94);
  parkPath(cx,cz,w*.93,5.5);
  const pond=new THREE.Mesh(
    new THREE.CircleGeometry(22,40),
    new THREE.MeshLambertMaterial({color:0x438eaf,emissive:0x15394e,emissiveIntensity:.28,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})
  );
  pond.rotation.x=-Math.PI/2;
  pond.scale.set(1.38,.82,1);
  pond.position.set(cx-w*.27,.56,cz+d*.27);
  scene.add(pond);
  const treeCount=300; // trees are instanced: constant two draw calls
  const trunks=new THREE.InstancedMesh(treeTrunkGeo,trunkMat,treeCount);
  const crowns=new THREE.InstancedMesh(treeCrownGeo,leavesMat,treeCount);
  const dummy=new THREE.Object3D();
  let count=0,attempts=0;
  while(count<treeCount && attempts<treeCount*20){
    attempts++;
    const x=b.minX+9+cityRandom()*(w-18);
    const z=b.minZ+9+cityRandom()*(d-18);
    if(Math.abs(x-cx)<9 || Math.abs(z-cz)<9)continue;
    if(Math.pow((x-(cx-w*.27))/(22*1.38+7),2)+Math.pow((z-(cz+d*.27))/(22*.82+7),2)<1)continue;
    const scale=.76+cityRandom()*.66;
    dummy.rotation.set(0,0,0);
    dummy.scale.setScalar(scale);
    dummy.position.set(x,1.7*scale,z);dummy.updateMatrix();
    trunks.setMatrixAt(count,dummy.matrix);
    dummy.position.y=4.5*scale;dummy.updateMatrix();
    crowns.setMatrixAt(count,dummy.matrix);
    count++;
  }
  trunks.count=crowns.count=count;
  trunks.instanceMatrix.needsUpdate=crowns.instanceMatrix.needsUpdate=true;
  trunks.frustumCulled=crowns.frustumCulled=false;
  scene.add(trunks,crowns);
  districtStats.centralPark.trees=count;
}

function recordDistrictBuilding(district,rec){
  const stats=districtStats[district];
  stats.buildings++;
  stats.minHeight=Math.min(stats.minHeight,rec.h);
  stats.maxHeight=Math.max(stats.maxHeight,rec.h);
  return rec;
}

function addStreetFurniture(){
  // Static geometry: only three draw calls instead of one for each lamp/stripe.
  const lampCount=Math.floor(BLOCKS_X/2)*Math.floor(BLOCKS_Z/2);
  const poleGeo=new THREE.CylinderGeometry(.18,.22,5.6,6);
  const bulbGeo=new THREE.SphereGeometry(.42,8,6);
  const stripeGeo=new THREE.PlaneGeometry(1.25,STREET_Z*.68);
  const stripeMat=new THREE.MeshBasicMaterial({color:0xd8d5c9});
  const poles=new THREE.InstancedMesh(poleGeo,lampMat,lampCount);
  const bulbs=new THREE.InstancedMesh(bulbGeo,lampGlowMat,lampCount);
  const crossings=new THREE.InstancedMesh(stripeGeo,stripeMat,lampCount*5);
  poles.frustumCulled=bulbs.frustumCulled=crossings.frustumCulled=false;
  const dummy=new THREE.Object3D();
  let lampIndex=0,stripeIndex=0;
  for(let ix=1;ix<BLOCKS_X;ix+=2){
    for(let iz=1;iz<BLOCKS_Z;iz+=2){
      const x=-HALF_CITY_X+ix*TILE_X+STREET_X*.28;
      const z=-HALF_CITY_Z+iz*TILE_Z+STREET_Z*.28;
      if(x>PARK_BOUNDS.minX && x<PARK_BOUNDS.maxX &&
         z>PARK_BOUNDS.minZ && z<PARK_BOUNDS.maxZ)continue;
      dummy.rotation.set(0,0,0);
      dummy.position.set(x,2.8,z);
      dummy.updateMatrix();
      poles.setMatrixAt(lampIndex,dummy.matrix);
      dummy.position.y=5.65;
      dummy.updateMatrix();
      bulbs.setMatrixAt(lampIndex++,dummy.matrix);
      for(let stripe=0;stripe<5;stripe++){
        dummy.rotation.set(-Math.PI/2,0,0);
        dummy.position.set(x-STREET_X*.55+stripe*2.4,0.075,z-STREET_Z*.28);
        dummy.updateMatrix();
        crossings.setMatrixAt(stripeIndex++,dummy.matrix);
      }
    }
  }
  poles.count=bulbs.count=lampIndex;
  crossings.count=stripeIndex;
  poles.instanceMatrix.needsUpdate=true;
  bulbs.instanceMatrix.needsUpdate=true;
  crossings.instanceMatrix.needsUpdate=true;
  scene.add(poles,bulbs,crossings);
}
const streetPeople=[];
function addStreetLife(){
  const carColors=[0xd33b32,0x2767a8,0xe7b62f,0xe9ecef,0x252a33];
  for(let i=0;i<18;i++){
    const car=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(3.8,1.05,1.8),new THREE.MeshLambertMaterial({color:carColors[i%carColors.length]}));
    body.position.y=.75;
    const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.1,.8,1.55),new THREE.MeshLambertMaterial({color:0x394c5e}));
    cabin.position.set(-.2,1.55,0);car.add(body,cabin);
    const horizontal=i%2===0;
    car.position.set(horizontal?-HALF_CITY_X+(i%8)*TILE_X+10:-HALF_CITY_X+(i%BLOCKS_X)*TILE_X+3,0,horizontal?-HALF_CITY_Z+(i%BLOCKS_Z)*TILE_Z+4:-HALF_CITY_Z+(i%10)*TILE_Z+8);
    if(horizontal)car.rotation.y=Math.PI/2;
    scene.add(car);
  }
  for(let i=0;i<20;i++){
    const person=new THREE.Group();
    const shirt=new THREE.Mesh(new THREE.CylinderGeometry(.27,.34,1.05,7),new THREE.MeshLambertMaterial({color:carColors[(i+2)%carColors.length]}));shirt.position.y=.8;
    const face=new THREE.Mesh(new THREE.SphereGeometry(.27,8,6),new THREE.MeshLambertMaterial({color:i%2?0xb97858:0x70422f}));face.position.y=1.55;
    person.add(shirt,face);person.position.set(-HALF_CITY_X+(i%BLOCKS_X)*TILE_X+BLOCK_X*.46,0,-HALF_CITY_Z+(i%BLOCKS_Z)*TILE_Z+8);scene.add(person);
    streetPeople.push({root:person,index:i,placeholder:[shirt,face]});
  }
}

let citySeed=0x5f3759df;
const cityRandom=()=>{citySeed=(citySeed*1664525+1013904223)>>>0;return citySeed/4294967296;};
const lotPositions=[];
for(let ix=0; ix<BLOCKS_X; ix++){
  for(let iz=0; iz<BLOCKS_Z; iz++){
    const district=districtForBlock(ix,iz);
    districtStats[district].blocks++;
    const bx = -HALF_CITY_X + ix*TILE_X + TILE_X/2 + (cityRandom()-0.5)*5;
    const bz = -HALF_CITY_Z + iz*TILE_Z + TILE_Z/2 + (cityRandom()-0.5)*4;

    if(district!=='centralPark')lotPositions.push([bx,bz]);

    if(district==='centralPark')continue; // one continuous green surface
    if(district==='docks'){
      const warehouse=makeBuilding(bx,bz,BLOCK_X*.82,BLOCK_Z*.78,24+cityRandom()*14,ix+iz+3);
      districtStats.docks.warehouses++;
      warehouse.mesh.material=warehouse.mesh.material.clone();
      warehouse.mesh.material.color.multiplyScalar(.72);
      warehouse.mesh.material.emissive.multiplyScalar(.72);
      continue;
    }
    if(district==='skyscrapers'){
      recordDistrictBuilding(district,makeBuilding(
        bx,bz,BLOCK_X*(.62+cityRandom()*.1),BLOCK_Z*(.76+cityRandom()*.1),185+cityRandom()*165,ix+iz
      ));
    }else{
      const layout=cityRandom();
      if(layout<.55){
        recordDistrictBuilding(district,makeBuilding(bx-BLOCK_X*.24,bz,BLOCK_X*.46,BLOCK_Z*.88,72+cityRandom()*68,ix));
        recordDistrictBuilding(district,makeBuilding(bx+BLOCK_X*.24,bz,BLOCK_X*.46,BLOCK_Z*.88,68+cityRandom()*76,iz+2));
      }else{
        const d=BLOCK_Z*.42;
        recordDistrictBuilding(district,makeBuilding(bx-BLOCK_X*.25,bz-BLOCK_Z*.23,BLOCK_X*.43,d,65+cityRandom()*72,ix));
        recordDistrictBuilding(district,makeBuilding(bx+BLOCK_X*.25,bz-BLOCK_Z*.23,BLOCK_X*.43,d,72+cityRandom()*73,iz+2));
        recordDistrictBuilding(district,makeBuilding(bx,bz+BLOCK_Z*.24,BLOCK_X*.9,d,78+cityRandom()*72,ix+iz+4));
      }
    }
  }
}
// One instanced ground mesh rather than a separate Three.js object per lot.
const lotMesh=new THREE.InstancedMesh(
  new THREE.PlaneGeometry(BLOCK_X,BLOCK_Z),lotMat,lotPositions.length
);
const lotDummy=new THREE.Object3D();
lotDummy.rotation.x=-Math.PI/2;
for(let i=0;i<lotPositions.length;i++){
  lotDummy.position.set(lotPositions[i][0],0.20,lotPositions[i][1]);
  lotDummy.updateMatrix();
  lotMesh.setMatrixAt(i,lotDummy.matrix);
}
lotMesh.instanceMatrix.needsUpdate=true;
lotMesh.frustumCulled=false;
scene.add(lotMesh);
addCentralPark();

const dockDeckMat=new THREE.MeshLambertMaterial({color:0x8b6a46});
for(const z of [60,64,68].map(iz=>-HALF_CITY_Z+iz*TILE_Z)){
  for(const [x,length] of [[HALF_CITY_X+30,80],[ISLAND_RADIUS_X+18,58]]){
    const pier=new THREE.Mesh(new THREE.BoxGeometry(length,1.1,11),dockDeckMat);
    pier.position.set(x,.55,z);addEdges(pier,0x2f2419);scene.add(pier);dockPiers.push(pier);
    registerWorldCollider(pier,x-length/2,x+length/2,z-5.5,z+5.5,1.1);
  }
}

const fenceMat=new THREE.MeshLambertMaterial({color:0x6e7980});
const fencePostMat=new THREE.MeshLambertMaterial({color:0x343b40});
const fencePoints=[];
for(let i=0;i<72;i++){
  const t=(i/72)*Math.PI*2,c=Math.cos(t),s=Math.sin(t),power=2/6;
  fencePoints.push(new THREE.Vector3(
    (ISLAND_RADIUS_X-2)*Math.sign(c)*Math.pow(Math.abs(c),power),0,
    (ISLAND_RADIUS_Z-2)*Math.sign(s)*Math.pow(Math.abs(s),power)
  ));
}
for(let i=0;i<fencePoints.length;i++){
  const a=fencePoints[i],b=fencePoints[(i+1)%fencePoints.length];
  const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
  const rail=new THREE.Mesh(new THREE.BoxGeometry(length,1.25,.22),fenceMat);
  rail.position.set((a.x+b.x)/2,.72,(a.z+b.z)/2);
  rail.rotation.y=Math.atan2(-dz,dx);
  const post=new THREE.Mesh(new THREE.BoxGeometry(.28,1.45,.28),fencePostMat);
  post.position.set(a.x,.725,a.z);scene.add(rail,post);
  shoreFenceColliders.push({mesh:rail,a:a.clone(),b:b.clone(),h:1.45});
}
addStreetFurniture();
addStreetLife();

// Start above the central avenue instead of at street level. Pick a broad,
// central roof so the first input can immediately flow into traversal.
const spawnRoof=buildingMeshes
  .filter(b=>!b.worldOnly&&b.h>35)
  .sort((a,b)=>{
    const ax=(a.minX+a.maxX)*.5,az=(a.minZ+a.maxZ)*.5;
    const bx=(b.minX+b.maxX)*.5,bz=(b.minZ+b.maxZ)*.5;
    // Find a nearby, accessible tall roof beside the park, not an arbitrary
    // building at the far north tip when all central blocks are parkland.
    return Math.hypot(ax,az)-Math.hypot(bx,bz)+.03*(b.h-a.h);
  })[0];
if(spawnRoof)PLAYER_SPAWN.set((spawnRoof.minX+spawnRoof.maxX)*.5,spawnRoof.h+.08,(spawnRoof.minZ+spawnRoof.maxZ)*.5);

// Debug mode shows the actual continuous target surface instead of implying
// that the web can only grab four discrete rooftop corners.
const anchorMat = new THREE.LineBasicMaterial({color:0xffe600});
// Anchor outlines are optional diagnostics; spatial collision records and
// swing anchor selection still cover the entire island. Avoid thousands of
// hidden LineLoop meshes on the much larger map.
anchorEdges.length=0;

// ---------------------------------------------------------------------------------------
// PLAYER
// ---------------------------------------------------------------------------------------
const player = new THREE.Group();
player.rotation.order='YXZ';
const playerRig = new THREE.Group();
playerRig.rotation.order='YXZ';
// P.pos is the exact collision-floor contact. The longer R6 boots extend 0.34
// units below their limb origin, so lift only the rendered rig to place their
// soles on that contact plane without changing movement or landing physics.
const PLAYER_RIG_GROUND_OFFSET=0.34;
playerRig.position.y=PLAYER_RIG_GROUND_OFFSET;
player.add(playerRig);
const bodyMat = new THREE.MeshLambertMaterial({color:0xd12b2b});
const limbMat = new THREE.MeshLambertMaterial({color:0x1b4fa0});
const suitBlueDarkMat = new THREE.MeshLambertMaterial({color:0x12366f});
const suitBlackMat=new THREE.MeshBasicMaterial({color:0x11151d});
const suitWhiteMat=new THREE.MeshBasicMaterial({color:0xf5fbff});
const r15SkinMeshes=[];
function r15SkinRegion(name){
  const n=name.toLowerCase();
  if(n.includes('head')||n.includes('hand'))return 'skin';
  if(n.includes('foot'))return 'shoes';
  if(n.includes('leg'))return 'legs';
  if(n.includes('arm'))return 'secondary';
  if(n.includes('torso'))return 'primary';
  return 'accent';
}
function applyPlayerSkin(id){
  const skin=skinById(id);
  bodyMat.color.setHex(skin.primary);
  limbMat.color.setHex(skin.secondary);
  suitBlueDarkMat.color.setHex(skin.accent);
  suitWhiteMat.color.setHex(skin.shoes);
  r15SkinMeshes.forEach(mesh=>{
    const colour=skin[mesh.userData.skinRegion]??skin.accent;
    if(mesh.material&&mesh.material.color)mesh.material.color.setHex(colour);
  });
}
function generateSkinThumbnails(model){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  renderer.setSize(300,360,false);
  renderer.setClearColor(0x000000,0);
  const previewScene=new THREE.Scene();
  previewScene.add(new THREE.HemisphereLight(0xffffff,0x58709a,1.55));
  const keyLight=new THREE.DirectionalLight(0xffffff,1.35);
  keyLight.position.set(-3,5,5);
  previewScene.add(keyLight);
  const camera=new THREE.PerspectiveCamera(28,300/360,.01,100);
  PLAYER_SKINS.forEach(skin=>{
    const clone=model.clone(true);
    clone.traverse(node=>{
      if(!node.isMesh)return;
      const source=Array.isArray(node.material)?node.material:[node.material];
      const copies=source.map(material=>{
        const copy=material.clone();
        if(copy.color)copy.color.setHex(skin[r15SkinRegion(node.name)]??skin.accent);
        if('roughness' in copy)copy.roughness=.82;
        return copy;
      });
      node.material=Array.isArray(node.material)?copies:copies[0];
    });
    previewScene.add(clone);
    clone.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(clone);
    const centre=bounds.getCenter(new THREE.Vector3());
    const size=bounds.getSize(new THREE.Vector3());
    clone.position.sub(centre);
    clone.updateMatrixWorld(true);
    const height=Math.max(size.y,.1);
    camera.position.set(height*.72,height*.12,height*2.35);
    camera.lookAt(0,height*.02,0);
    camera.near=.01;
    camera.far=height*8;
    camera.updateProjectionMatrix();
    renderer.render(previewScene,camera);
    skinThumbnails.set(skin.id,renderer.domElement.toDataURL('image/png'));
    previewScene.remove(clone);
    clone.traverse(node=>{
      if(!node.isMesh)return;
      const materials=Array.isArray(node.material)?node.material:[node.material];
      materials.forEach(material=>material.dispose());
    });
  });
  renderer.dispose();
}
// A compact stylised Spider-Man rather than the old block avatar. The limb
// groups remain simple pivots so traversal poses stay readable at game scale.
const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.34,1.08,8),bodyMat);
torso.position.y=1.15; addEdges(torso); playerRig.add(torso);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.38,16,12),bodyMat);
head.scale.set(0.9,1.04,0.82);
head.position.y=2.02; addEdges(head); playerRig.add(head);

// Blue side panels, waist break and mask/chest web seams give the suit a
// recognisable silhouette without adding texture downloads or heavy models.
for(const side of [-1,1]){
  const panel=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.66,0.43),suitBlueDarkMat);
  panel.position.set(side*0.36,-0.12,0); torso.add(panel);
}
const waistBand=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.12,8),suitBlueDarkMat);
waistBand.position.y=-0.48; torso.add(waistBand);
for(const x of [-0.22,0,0.22]){
  const seam=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.78,0.018),suitBlackMat);
  seam.position.set(x,0.08,0.425); seam.rotation.z=x*0.65; torso.add(seam);
}
for(const y of [-0.26,0.02,0.3]){
  const seam=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.018,0.018),suitBlackMat);
  seam.position.set(0,y,0.425); torso.add(seam);
}

function addMaskEye(side){
  const outline=new THREE.Mesh(new THREE.SphereGeometry(0.125,10,8),suitBlackMat);
  outline.scale.set(0.72,1.35,0.18);
  outline.position.set(side*0.14,0.035,0.315);
  outline.rotation.z=-side*0.18;
  const lens=new THREE.Mesh(new THREE.SphereGeometry(0.096,10,8),suitWhiteMat);
  lens.scale.set(0.68,1.32,0.2);
  lens.position.z=0.045;
  outline.add(lens);
  head.add(outline);
}
addMaskEye(-1); addMaskEye(1);

function makeSuitArm(side){
  const arm=new THREE.Group();
  arm.position.set(side*0.67,1.58,0);
  const limb=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.13,1.02,8),limbMat);
  limb.position.y=-0.43;
  addEdges(limb);
  arm.add(limb);
  const shoulder=new THREE.Mesh(new THREE.SphereGeometry(0.18,10,8),bodyMat);
  shoulder.position.y=-0.09;
  arm.add(shoulder);
  const glove=new THREE.Mesh(new THREE.SphereGeometry(0.17,10,8),bodyMat);
  glove.scale.y=1.15;
  glove.position.y=-0.8;
  arm.add(glove);
  return arm;
}
function makeSuitLeg(side){
  const leg=new THREE.Group();
  leg.position.set(side*0.25,0.9,0);
  const limb=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.145,1.18,8),limbMat);
  limb.position.y=-0.58; addEdges(limb); leg.add(limb);
  const boot=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.32,0.46),bodyMat);
  boot.position.set(0,-1.08,0.07); leg.add(boot);
  const foot=new THREE.Object3D();
  foot.position.set(0,-1.14,0.13); leg.add(foot);
  leg.userData.foot=foot;
  return leg;
}
const armL=makeSuitArm(-1), armR=makeSuitArm(1);
const legL=makeSuitLeg(-1), legR=makeSuitLeg(1);
playerRig.add(armL,armR,legL,legR);
const handL=new THREE.Object3D(), handR=new THREE.Object3D();
handL.position.set(0,-0.99,0.04);
handR.position.set(0,-0.99,0.04);
armL.add(handL);
armR.add(handR);

function addSpiderEmblem(z,colorMat,scale=1){
  const emblem=new THREE.Group();
  emblem.position.set(0,0.05,z);
  if(z<0) emblem.rotation.y=Math.PI;
  emblem.scale.setScalar(scale);
  const abdomen=new THREE.Mesh(new THREE.SphereGeometry(0.075,8,6),colorMat);
  abdomen.scale.y=1.65; emblem.add(abdomen);
  for(const side of [-1,1]){
    for(let i=0;i<4;i++){
      const leg=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.25,0.025),colorMat);
      leg.position.set(side*(0.08+i*0.018),0.1-i*0.065,0);
      leg.rotation.z=side*(0.55+i*0.18);
      emblem.add(leg);
    }
  }
  torso.add(emblem);
}
addSpiderEmblem(0.26,suitBlackMat,0.9);
addSpiderEmblem(-0.26,suitWhiteMat,1.08);

function makeWebWingTexture(){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='rgba(240,252,255,0.82)';
  ctx.fillRect(0,0,128,128);
  ctx.strokeStyle='rgba(119,205,232,0.9)';
  ctx.lineWidth=3;
  for(let i=0;i<=4;i++){
    ctx.beginPath(); ctx.moveTo(64,128); ctx.lineTo(i*32,0); ctx.stroke();
  }
  for(let y=26;y<112;y+=24){
    ctx.beginPath(); ctx.arc(64,128,128-y,Math.PI*1.15,Math.PI*1.85); ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
  return texture;
}
const webWingTexture=makeWebWingTexture();

function makeWebWing(side){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute([
    0,0,0,
    side*0.62,-0.08,0,
    side*0.5,-1.28,0,
    side*0.08,-1.08,0
  ],3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0.5,1,side<0?0:1,0.92,side<0?0.08:0.92,0,0.5,0.14],2));
  geometry.setIndex([0,1,2,0,2,3]);
  geometry.computeVertexNormals();
  const material=new THREE.MeshBasicMaterial({map:webWingTexture,transparent:true,opacity:0.94,side:THREE.DoubleSide,color:0xdff8ff});
  const wing=new THREE.Mesh(geometry,material);
  wing.position.set(side*0.08,1.72,-0.29);
  wing.visible=false;
  playerRig.add(wing);
  return wing;
}
const webWingL=makeWebWing(-1);
const webWingR=makeWebWing(1);
applyPlayerSkin(skinSave.selected);

function updateWebWings(){
  const visible=P.state==='air' && P.gliding;
  webWingL.visible=visible;
  webWingR.visible=visible;
  if(!visible) return;
  // Two rigid back-mounted panels replace the stretched limb membranes. They
  // fold and bank as one elytra-like glider without changing size on screen.
  const fold=THREE.MathUtils.clamp(Math.abs(P.glidePitch)*0.13,0,0.16);
  webWingL.rotation.set(-0.08-P.glidePitch*0.08,0.2+fold,0.08-P.glideBank*0.1);
  webWingR.rotation.set(-0.08-P.glidePitch*0.08,-0.2-fold,-0.08-P.glideBank*0.1);
}
player.position.copy(PLAYER_SPAWN);
scene.add(player);

const playerParts = {torso, head, armL, armR, legL, legR};
const basePose = {};
Object.entries(playerParts).forEach(([name, part])=>{
  basePose[name] = {pos:part.position.clone(), rot:part.rotation.clone()};
});
let animClock = 0;

// The supplied R15 file is exported once to GLB and loaded as the visible
// avatar. The procedural avatar remains as a safe fallback and as lightweight
// attachment points for web wings while the asset is loading.
const r15AvatarRoot=new THREE.Group();
r15AvatarRoot.position.y=-0.34;
r15AvatarRoot.scale.setScalar(0.56);
playerRig.add(r15AvatarRoot);
const r15Bones={};
const r15Rest={};
let r15Ready=false;
let r15EnemyTemplate=null;
// R15 motion library authored for this exact Blender / Roblox skeleton.
let r15Mixer=null;
const r15Actions=new Map();
let r15CurrentClip='';
let r15LastState='ground';
let r15TakeoffT=0;
let r15LandingT=0;
let r15GlideDeployT=0;
let r15WasGliding=false;

function selectR15Clip(name,fade=0.13){
  const next=r15Actions.get('WW_'+name);
  if(!next || r15CurrentClip==='WW_'+name) return;
  const previous=r15Actions.get(r15CurrentClip);
  next.reset();
  next.enabled=true;
  next.setEffectiveWeight(1);
  next.setEffectiveTimeScale(1);
  if(previous && previous!==next){
    previous.fadeOut(fade);
    next.fadeIn(fade);
  }
  next.play();
  r15CurrentClip='WW_'+name;
}
function tickR15Clips(dt,moveVec,flatSpeed){
  if(!r15Mixer) return false;
  const state=P.state;
  const nowGliding=state==='air' && P.gliding;
  if(nowGliding&&!r15WasGliding)r15GlideDeployT=.64;
  r15WasGliding=nowGliding;
  r15GlideDeployT=Math.max(0,r15GlideDeployT-dt);
  if(state==='air' && r15LastState==='ground' && P.vel.y>3) r15TakeoffT=0.23;
  if(state==='ground' && r15LastState==='air') r15LandingT=0.20;
  r15LastState=state;
  r15TakeoffT=Math.max(0,r15TakeoffT-dt);
  r15LandingT=Math.max(0,r15LandingT-dt);
  const movement=moveVec.lengthSq()>0.04||flatSpeed>0.9;
  let clip='Idle';
  if(state==='ground'){
    if(P.recoveryRollT>0) clip='Air_Flip';
    else if(P.jumpCharging) clip='Jump_Takeoff';
    else if(P.landPoseT>0||r15LandingT>0) clip='Jump_Land';
    else if(movement) clip=(running||flatSpeed>9)?'Run':'Walk';
  }else if(state==='climb'){
    const crawling=moveVec.lengthSq()>0.04||P.wallRunAutoT>0;
    clip=crawling?(running||P.wallRunAutoT>0?'Wall_Run':'Wall_Crawl'):'Wall_Cling';
  }else if(state==='swing'){
    if(P.swingPhase==='entry'&&P.swingAge<0.46) clip='Swing_Attach';
    else clip=P.vel.length()>14?'Swing_Pump':'Swing_Hang';
  }else if(state==='zip'){
    clip='Swing_Hang';
  }else if(state==='air'){
    if(P.wallFlipT>0.02) clip='Air_Flip';
    else if(P.swingReleaseT>0.05) clip='Swing_Release';
    else if(P.gliding){
      clip=r15GlideDeployT>0?'Air_Glide_Deploy'
        :P.glidePitch>0.28?'Air_Glide_Dive'
        :P.glidePitch<-.24?'Air_Glide_Brake'
        :P.glideBank>.27?'Air_Glide_Right'
        :P.glideBank<-.27?'Air_Glide_Left'
        :'Air_Glide';
    }
    else if(P.diving || P.vel.y<-2) clip='Air_Fall';
    else if(r15TakeoffT>0 || P.jumpPoseT>0.2) clip='Jump_Takeoff';
    else clip='Jump_Air';
  }else if(state==='downed'||state==='defeated'){
    clip='Jump_Land';
  }
  selectR15Clip(clip);
  r15Mixer.update(dt);
  return true;
}

function r15Bone(name){ return r15Bones[name]||null; }

function applyR15Bone(name,rot,amount){
  const bone=r15Bone(name), rest=r15Rest[name];
  if(!bone||!rest) return;
  const offset=new THREE.Quaternion().setFromEuler(new THREE.Euler(rot.x||0,rot.y||0,rot.z||0,'XYZ'));
  const target=rest.clone().multiply(offset);
  bone.quaternion.slerp(target,amount);
}

// Blender's R15 export is mirrored on the X axis: the bones named "Left"
// render on the player's right side. Keep gameplay poses in camera/player
// space and translate them only at the model boundary. This also guarantees
// that the arm reaching for a Q/E web is the arm the strand visibly leaves.
const r15VisualBone={
  leftUpperArm:'RightUpperArm', rightUpperArm:'LeftUpperArm',
  leftLowerArm:'RightLowerArm', rightLowerArm:'LeftLowerArm',
  leftHand:'RightHand', rightHand:'LeftHand',
  leftUpperLeg:'RightUpperLeg', rightUpperLeg:'LeftUpperLeg',
  leftLowerLeg:'RightLowerLeg', rightLowerLeg:'LeftLowerLeg',
  leftFoot:'RightFoot', rightFoot:'LeftFoot'
};

function applyR15VisualBone(name,rot,amount){
  // The Blender export faces down the opposite local forward axis. Mirror all
  // three pose axes at the model boundary so forward strides, punches and web
  // reaches do not animate behind the avatar.
  applyR15Bone(name,{x:-(rot.x||0),y:-(rot.y||0),z:-(rot.z||0)},amount);
}

function swingWebObstructed(from,to){
  const midpoint=from.clone().add(to).multiplyScalar(0.5);
  const radius=Math.hypot(to.x-from.x,to.z-from.z)*0.5+1;
  const length=from.distanceTo(to);
  if(length<0.2) return false;
  // Segment/box tests use the same building bounds as targeting and collision.
  // Exclude the endpoint margin so the attached face is not an obstruction.
  for(const b of nearbyBuildings(midpoint,radius)){
    let enter=0,exit=1-0.12/length;
    for(const [start,delta,min,max] of [
      [from.x,to.x-from.x,b.minX,b.maxX],
      [from.y,to.y-from.y,0,b.h],
      [from.z,to.z-from.z,b.minZ,b.maxZ]
    ]){
      if(Math.abs(delta)<1e-8){if(start<min || start>max){exit=-1;break;}continue;}
      let near=(min-start)/delta,far=(max-start)/delta;
      if(near>far)[near,far]=[far,near];
      enter=Math.max(enter,near);exit=Math.min(exit,far);
      if(enter>exit)break;
    }
    if(enter<=exit && exit>=0)return true;
  }
  return false;
}

function visibleWebHandWorld(gameHand,fallback){
  const exportedName=gameHand==='left'?r15VisualBone.leftHand:r15VisualBone.rightHand;
  const bone=r15Ready&&r15Bone(exportedName);
  return bone?bone.getWorldPosition(new THREE.Vector3()):fallback.getWorldPosition(new THREE.Vector3());
}

// Aim the authored shoulder/hand chain in its parent's coordinate system.
// Using the actual joints avoids assumptions about this export's mirrored axes.
const swingArmAim={from:new THREE.Vector3(),to:new THREE.Vector3(),rotation:new THREE.Quaternion()};
function aimR15SwingArm(hand,dt){
  const anchor=P.swingWebs[hand].anchor;
  const shoulder=r15Bone(r15VisualBone[hand+'UpperArm']);
  const wrist=r15Bone(r15VisualBone[hand+'Hand']);
  if(!anchor || !shoulder || !wrist) return;
  shoulder.updateWorldMatrix(true,true);
  wrist.getWorldPosition(swingArmAim.from);
  shoulder.parent.worldToLocal(swingArmAim.from).sub(shoulder.position);
  swingArmAim.to.copy(anchor);
  shoulder.parent.worldToLocal(swingArmAim.to).sub(shoulder.position);
  if(swingArmAim.from.lengthSq()<1e-6 || swingArmAim.to.lengthSq()<1e-6) return;
  swingArmAim.rotation.setFromUnitVectors(swingArmAim.from.normalize(),swingArmAim.to.normalize());
  swingArmAim.rotation.multiply(shoulder.quaternion);
  shoulder.quaternion.slerp(swingArmAim.rotation,1-Math.exp(-18*dt));
  shoulder.updateMatrixWorld(true);
}

new THREE.GLTFLoader().load(
  './assets/models/web-weavers-r15.glb',
  gltf=>{
    r15AvatarRoot.add(gltf.scene);
    gltf.scene.traverse(node=>{
      if(node.isBone && !r15Bones[node.name]){
        r15Bones[node.name]=node;
        r15Rest[node.name]=node.quaternion.clone();
      }
      if(node.isMesh){
        node.material=node.material.clone();
        // The downloaded rig's checker/FRONT UV guide is not a finished suit.
        node.material.map=null;
        node.material.emissiveMap=null;
        node.material.transparent=false;
        node.material.opacity=1;
        node.material.depthWrite=true;
        node.material.needsUpdate=true;
        node.userData.skinRegion=r15SkinRegion(node.name);
        r15SkinMeshes.push(node);
        node.material.roughness=.82;
        node.castShadow=true;
        node.receiveShadow=true;
      }
    });
    if(gltf.animations && gltf.animations.length){
      r15Mixer=new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(clip=>{
        const action=r15Mixer.clipAction(clip);
        const once=/^WW_(Jump_Takeoff|Jump_Land|Swing_Attach|Swing_Release|Air_Flip|Air_Twist)$/.test(clip.name);
        action.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);
        action.clampWhenFinished=once;
        r15Actions.set(clip.name,action);
      });
      if(r15Actions.has('WW_Idle'))selectR15Clip('Idle',0);
      console.info('Web Weavers R15 clips loaded:',r15Actions.size);
    }
    generateSkinThumbnails(gltf.scene);
    torso.visible=head.visible=armL.visible=armR.visible=legL.visible=legR.visible=false;
    r15Ready=true;
    applyPlayerSkin(skinSave.selected);
    r15EnemyTemplate=gltf.scene;
    // Reserve costly R15 models for nearby actors, not the entire city.
    updateActorLOD();
    document.getElementById('startLoadStatus').textContent='READY';
    document.getElementById('btnPlay').disabled=false;
    document.getElementById('btnSkins').disabled=false;
  },
  undefined,
  error=>{
    console.warn('R15 model unavailable; using fallback avatar.',error);
    document.getElementById('startLoadStatus').textContent='READY · FALLBACK CHARACTER';
    document.getElementById('btnPlay').disabled=false;
  }
);

const P = {
  pos: player.position,
  vel: new THREE.Vector3(),
  state: 'ground',         // air | ground | swing | zip | climb | downed | defeated
  hp: 100, maxHp:100,
  swingWebs:{
    left:{anchor:null,physicsPivot:null,length:0,targetLength:0,retry:0,auto:false,fallCatch:false},
    right:{anchor:null,physicsPivot:null,length:0,targetLength:0,retry:0,auto:false,fallCatch:false}
  },
  activeSwingHand:null,
  nextSwingHand:'left',
  swingAssisted:false,
  swingPhase:'entry',
  swingPhaseT:0,
  swingAge:0,
  swingHasDescended:false,
  swingClimbedAfterDescent:false,
  swingLastVy:0,
  swingBottomSpeed:0,
  swingPeakRise:0,
  swingTelemetry:null,
  swingGroundPullT:0,
  swingGroundPullAnchor:null,
  swingGroundPullAnchors:{left:null,right:null},
  swingLaneCenter:new THREE.Vector3(),
  swingLaneRight:new THREE.Vector3(1,0,0),
  swingPeakFlat:0,
  swingRequireRelease:false,
  swingReleaseT:0,
  swingReleaseHand:null,
  climbNormal: null,
  climbBuilding: null,
  climbVisualAngle:0,
  wallRunAutoT:0,
  wallRunDirection:new THREE.Vector2(),
  wallRunEntrySpeed:0,
  wallRunFromSwing:false,
  wallRunMomentum:0,
  wallFlipT:0,
  wallDetachT:0,
  meleeT:0,
  meleeSide:1,
  jumpPoseT:0,
  webshotPoseT:0,
  pullPoseT:0,
  landPoseT:0,
  glideBank:0,
  glidePitch:0,
  invuln:0,
  facing: 0,
  gliding:false, wingCooldown:0, peakY:0, downedT:0, pendingFallDamage:0, recoveryT:0, recoverLock:false,
  traversalHoldT:0, traversalSwingStarted:false, traversalSearchAttempted:false,
  jumpChargeT:0, jumpCharging:false, diving:false,
  swingHistoryT:0, quickRecoveryT:0, recoveryRollT:0, recoveryLaunchPending:false,
  recoveryVelocity:new THREE.Vector3(),
  defeatedT:0, recoverPressed:false, blocking:false, parryT:0,
  lastDamageT:0,
  cooldowns:{swing:0, zip:0, pull:0, melee:0, webshot:0, parry:0},
};
P.maxHp=100+progress.health*15;
P.hp=P.maxHp;
document.getElementById('btnShop').onclick=()=>{document.getElementById('shopPanel').style.display='block';updateShopUI();};
document.getElementById('btnCloseShop').onclick=()=>document.getElementById('shopPanel').style.display='none';
document.querySelectorAll('.shopBuy').forEach(btn=>btn.onclick=()=>{
  const kind=btn.dataset.upgrade,level=progress[kind],cost=upgradeCost(kind,level);
  if(level>=UPGRADE_MAX)return;
  if(cash<cost){flashMsg('NOT ENOUGH CASH');return;}
  cash-=cost;localStorage.setItem('webWeaversCash',String(cash));progress[kind]++;
  if(kind==='health'){const old=P.maxHp;P.maxHp=100+progress.health*15;P.hp=Math.min(P.maxHp,P.hp+P.maxHp-old);}
  saveProgress();updateCashUI();updateShopUI();flashMsg(`${kind.toUpperCase()} UPGRADED`);
});

const GRAVITY = -30;
const RUN_SPEED = 13;
const JUMP_SPEED = 13.5;
const SWING_MAX_RANGE = 300;
const SWING_MIN_RANGE = 12;
const MIN_SWING_ANCHOR_RISE = 4; // world units above the player's feet, even during a dive
const ZIP_RANGE = 240;
const ZIP_SPEED = 72;
const PULL_RANGE = 26;
const WEBSHOT_RANGE = 46;
const WEBSHOT_SPEED = 95;
const MELEE_RANGE = 3.0;
const CLIMB_SPEED = 8.5;
const WALL_CRAWL_SPEED = 6.2;
const WALL_RUN_SPEED = 14.5;
const PLAYER_RADIUS = 0.55;
const CLIMB_WALL_OFFSET = 0.3;
const AIR_CONTROL = 18;
const AIR_DRAG = 0.997;
// Air and swing share the traversal envelope: releasing must not brake a fast arc.
const AIR_MAX_SPEED = 60;
const GLIDE_MIN_SPEED = 11;
const GLIDE_MAX_SPEED = 40;
const GLIDE_TURN_RATE = 3.25;
const GLIDE_MAX_SINK = 11;
const SWING_MAX_SPEED = 72;
const SWING_RELEASE_MAX_SPEED = 66;
const SWING_RELEASE_APEX_VY = 4.5;
const SWING_RELEASE_WINDOW = 3.5;
const SWING_SHORT_ARC_MAX_AGE = 1.15;
const SWING_ENTRY_MAX_TIME = 0.55;
const SWING_MIN_GROUND_CLEARANCE = 2.8;
const SWING_GROUND_REEL_START = 13;
const SWING_GROUND_REEL_RATE = 12;
const SWING_LOOK_TURN_RATE = 1.7;
const SWING_INPUT_TURN_RATE = 4.8;
const SWING_FORWARD_ACCEL = 7;
const SWING_POWERED_SPEED = 58;
const SWING_ATTACH_REEL_RATE = 9;
const SWING_GROUND_PULL_TIME = 0.2;
const MAX_JUMP_CHARGE = 0.85;
const CHARGED_JUMP_BONUS = 10;
const DIVE_FORWARD_ACCEL = 13;
const DIVE_DOWN_ACCEL = 22;
const QUICK_RECOVERY_WINDOW = 0.85;
const QUICK_RECOVERY_ROLL_TIME = 0.28;
const MAX_TRAVERSAL_SPEED = 60;
const MAX_FALL_SPEED = -58;
const KEY_ZOOM_SPEED = 8.5;
const WING_MIN_CLEARANCE = 5;

// Orient the whole R15 rig to the wall plane, not merely its torso.
// Local Y points along travel and local Z faces the wall; yaw/pitch of the
// camera are deliberately unaffected. Handles up, down and all diagonals.
function orientPlayerToWall(normal,travel,dt){
  const forward=normal.clone().negate().normalize();
  // Remove any motion into the wall; the pose is always tangent to its plane.
  const along=travel.clone().addScaledVector(normal,-travel.dot(normal));
  if(along.lengthSq()<0.02)along.set(0,1,0);
  along.normalize();
  const right=new THREE.Vector3().crossVectors(along,forward).normalize();
  const up=new THREE.Vector3().crossVectors(forward,right).normalize();
  const basis=new THREE.Matrix4().makeBasis(right,up,forward);
  const target=new THREE.Quaternion().setFromRotationMatrix(basis);
  player.quaternion.slerp(target,1-Math.exp(-12*dt));
}

// ---------------------------------------------------------------------------------------
// RAYCASTING HELPERS (ground height, wall proximity, crosshair target)
// ---------------------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const buildingCollidables=buildingMeshes.filter(b=>!b.worldOnly).map(b=>b.mesh);
const collidables = () => buildingCollidables;

function nearbyBuildings(point,radius){
  const found=new Set();
  const minGX=Math.floor((point.x-radius)/BUILDING_GRID_CELL);
  const maxGX=Math.floor((point.x+radius)/BUILDING_GRID_CELL);
  const minGZ=Math.floor((point.z-radius)/BUILDING_GRID_CELL);
  const maxGZ=Math.floor((point.z+radius)/BUILDING_GRID_CELL);
  for(let gx=minGX;gx<=maxGX;gx++){
    for(let gz=minGZ;gz<=maxGZ;gz++){
      const bucket=buildingSpatialGrid.get(`${gx},${gz}`);
      if(bucket) bucket.forEach(building=>found.add(building));
    }
  }
  return [...found].filter(building=>
    building.hitMaxX>=point.x-radius && building.hitMinX<=point.x+radius &&
    building.hitMaxZ>=point.z-radius && building.hitMinZ<=point.z+radius
  );
}

function nearbyBuildingMeshes(point,radius){
  return nearbyBuildings(point,radius).map(building=>building.mesh);
}

function objectBelongsTo(object,root){
  for(let node=object;node;node=node.parent){
    if(node===root) return true;
  }
  return false;
}

function buildingForObject(object){
  for(let node=object;node;node=node.parent){
    if(node.userData&&node.userData.buildingRecord) return node.userData.buildingRecord;
  }
  return null;
}

function enemyForObject(object){
  return enemies.find(e=>e.alive && objectBelongsTo(object,e.mesh)) || null;
}

function heightAt(x,z, ignoreAboveY=Infinity){
  // returns highest surface (rooftop or ground) at x,z that's at/under ignoreAboveY+0.1
  let best = isOverIsland(x,z) ? 0 : -Infinity;
  for(const b of nearbyBuildings({x,z},1)){
    if(x>b.hitMinX && x<b.hitMaxX && z>b.hitMinZ && z<b.hitMaxZ){
      if(b.h <= ignoreAboveY+0.15 && b.h>best) best = b.h;
    }
  }
  return best;
}

function wallAhead(px,pz, dirYaw, dist=0.9){
  const dx = Math.sin(dirYaw), dz = Math.cos(dirYaw);
  for(const b of nearbyBuildings({x:px+dx*dist,z:pz+dz*dist},dist+PLAYER_RADIUS)){
    // does the point (px+dx*dist, pz+dz*dist) fall inside a taller-than-player building, while current point is outside?
    const nx = px+dx*dist, nz = pz+dz*dist;
    const inside = nx>b.hitMinX && nx<b.hitMaxX && nz>b.hitMinZ && nz<b.hitMaxZ;
    const wasOutside = !(px>b.hitMinX && px<b.hitMaxX && pz>b.hitMinZ && pz<b.hitMaxZ);
    if(inside && wasOutside && b.h > P.pos.y+1) return b;
  }
  return null;
}

function wallContact(px,pz, dirYaw, dist=0.9){
  const b = wallAhead(px,pz,dirYaw,dist);
  if(!b) return null;
  const probe = new THREE.Vector3(px + Math.sin(dirYaw)*dist, 0, pz + Math.cos(dirYaw)*dist);
  const distances = [
    {d:Math.abs(probe.x-b.hitMinX), n:new THREE.Vector3(-1,0,0)},
    {d:Math.abs(probe.x-b.hitMaxX), n:new THREE.Vector3(1,0,0)},
    {d:Math.abs(probe.z-b.hitMinZ), n:new THREE.Vector3(0,0,-1)},
    {d:Math.abs(probe.z-b.hitMaxZ), n:new THREE.Vector3(0,0,1)}
  ];
  distances.sort((a,b)=>a.d-b.d);
  return {building:b, normal:distances[0].n};
}

// Horizontal hitbox: pushes the player out of any building that's taller than they
// currently are (buildings short enough to just stand on are handled by heightAt instead).
function segmentAabbEntry(from,to,minX,maxX,minZ,maxZ){
  const dx=to.x-from.x,dz=to.z-from.z;
  let entry=0,exit=1,normal=null;
  const axes=[
    {start:from.x,delta:dx,min:minX,max:maxX,negative:new THREE.Vector3(-1,0,0),positive:new THREE.Vector3(1,0,0)},
    {start:from.z,delta:dz,min:minZ,max:maxZ,negative:new THREE.Vector3(0,0,-1),positive:new THREE.Vector3(0,0,1)}
  ];
  for(const axis of axes){
    if(Math.abs(axis.delta)<1e-7){
      if(axis.start<=axis.min||axis.start>=axis.max)return null;
      continue;
    }
    let near=(axis.min-axis.start)/axis.delta;
    let far=(axis.max-axis.start)/axis.delta;
    let nearNormal=axis.negative;
    if(near>far){[near,far]=[far,near];nearNormal=axis.positive;}
    if(near>entry){entry=near;normal=nearNormal;}
    exit=Math.min(exit,far);
    if(entry>exit)return null;
  }
  return normal&&entry>=0&&entry<=1?{t:entry,normal}:null;
}

function resolveShoreFenceCollision(pos,previousPos=null){
  const clearance=PLAYER_RADIUS+.12;
  const from=previousPos||pos;
  const travel=new THREE.Vector2(pos.x-from.x,pos.z-from.z);
  const cross=(a,b)=>a.x*b.y-a.y*b.x;
  for(const fence of shoreFenceColliders){
    if(fence.h<=pos.y+1)continue;
    const a=new THREE.Vector2(fence.a.x,fence.a.z),b=new THREE.Vector2(fence.b.x,fence.b.z);
    const edge=b.clone().sub(a);
    const current=new THREE.Vector2(pos.x,pos.z);
    const edgeLengthSq=edge.lengthSq();
    const along=THREE.MathUtils.clamp(current.clone().sub(a).dot(edge)/edgeLengthSq,0,1);
    const nearest=a.clone().addScaledVector(edge,along);
    const separation=current.clone().sub(nearest);
    let normal=null;
    if(separation.length()<clearance){
      normal=separation.lengthSq()>.0001
        ? new THREE.Vector3(separation.x,0,separation.y).normalize()
        : new THREE.Vector3(-edge.y,0,edge.x).normalize();
      pos.x=nearest.x+normal.x*clearance;
      pos.z=nearest.y+normal.z*clearance;
    }else if(previousPos&&travel.lengthSq()>.0001){
      const offset=a.clone().sub(new THREE.Vector2(from.x,from.z));
      const denominator=cross(travel,edge);
      if(Math.abs(denominator)>.000001){
        const t=cross(offset,edge)/denominator;
        const u=cross(offset,travel)/denominator;
        if(t>=0&&t<=1&&u>=0&&u<=1){
          const side=new THREE.Vector2(from.x,from.z).sub(a);
          normal=new THREE.Vector3(-edge.y,0,edge.x).normalize();
          if(normal.x*side.x+normal.z*side.y<0)normal.multiplyScalar(-1);
          const intersection=new THREE.Vector2(from.x,from.z).addScaledVector(travel,Math.max(0,t-.001));
          pos.x=intersection.x+normal.x*clearance;
          pos.z=intersection.y+normal.z*clearance;
        }
      }
    }
    if(normal){
      if(pos===P.pos){
        const inward=P.vel.dot(normal);
        if(inward<0)P.vel.addScaledVector(normal,-inward);
      }
      return {normal,fence};
    }
  }
  return null;
}

function resolveWallCollision(pos, previousPos=null){
  let hitNormal = null;
  let hitBuilding = null;
  const fenceHit=resolveShoreFenceCollision(pos,previousPos);
  if(fenceHit)hitNormal=fenceHit.normal;
  const midpoint=previousPos?pos.clone().add(previousPos).multiplyScalar(0.5):pos;
  const travelRadius=previousPos?Math.hypot(pos.x-previousPos.x,pos.z-previousPos.z)*0.5+PLAYER_RADIUS+1:PLAYER_RADIUS+1;
  for(const b of nearbyBuildings(midpoint,travelRadius)){
    if(b.h <= pos.y + 1.0) continue;
    const minX=b.hitMinX-PLAYER_RADIUS, maxX=b.hitMaxX+PLAYER_RADIUS, minZ=b.hitMinZ-PLAYER_RADIUS, maxZ=b.hitMaxZ+PLAYER_RADIUS;
    const inside=pos.x>minX && pos.x<maxX && pos.z>minZ && pos.z<maxZ;
    const sweep=!inside&&previousPos?segmentAabbEntry(previousPos,pos,minX,maxX,minZ,maxZ):null;
    if(inside||sweep){
      let normal;
      if(sweep){
        const t=Math.max(0,sweep.t-0.001);
        pos.x=THREE.MathUtils.lerp(previousPos.x,pos.x,t);
        pos.z=THREE.MathUtils.lerp(previousPos.z,pos.z,t);
        normal=sweep.normal;
      }
      else if(previousPos && previousPos.x<=minX){ pos.x=minX; normal=new THREE.Vector3(-1,0,0); }
      else if(previousPos && previousPos.x>=maxX){ pos.x=maxX; normal=new THREE.Vector3(1,0,0); }
      else if(previousPos && previousPos.z<=minZ){ pos.z=minZ; normal=new THREE.Vector3(0,0,-1); }
      else if(previousPos && previousPos.z>=maxZ){ pos.z=maxZ; normal=new THREE.Vector3(0,0,1); }
      else {
        const options = [
          {d:pos.x-minX, set:()=>{ pos.x=minX; }, n:new THREE.Vector3(-1,0,0)},
          {d:maxX-pos.x, set:()=>{ pos.x=maxX; }, n:new THREE.Vector3(1,0,0)},
          {d:pos.z-minZ, set:()=>{ pos.z=minZ; }, n:new THREE.Vector3(0,0,-1)},
          {d:maxZ-pos.z, set:()=>{ pos.z=maxZ; }, n:new THREE.Vector3(0,0,1)}
        ];
        options.sort((a,b)=>a.d-b.d);
        options[0].set();
        normal=options[0].n;
      }
      hitNormal = normal;
      hitBuilding = b;
      if(pos===P.pos){
        const inwardSpeed = P.vel.dot(normal);
        if(inwardSpeed<0) P.vel.addScaledVector(normal, -inwardSpeed);
      }
    }
  }
  return hitNormal ? {normal:hitNormal,building:hitBuilding} : null;
}

function crosshairHit(maxDist, includeEnemies=true){
  raycaster.setFromCamera(aimScreenPoint(), camera);
  const nearbyMeshes=nearbyBuildingMeshes(P.pos,maxDist);
  const targets = includeEnemies
    ? nearbyMeshes.concat(enemies.filter(e=>e.alive).map(e=>e.mesh))
    : nearbyMeshes;
  const hits = raycaster.intersectObjects(targets,true).filter(hit=>hit.object.type!=='LineSegments');
  if(hits.length && hits[0].distance<=maxDist) return hits[0];
  return null;
}

function zipCrosshairHit(maxDist){
  raycaster.setFromCamera(aimScreenPoint(),camera);
  const targets=nearbyBuildingMeshes(P.pos,maxDist)
    .concat([ground],enemies.filter(enemy=>enemy.alive).map(enemy=>enemy.mesh));
  const hits=raycaster.intersectObjects(targets,true).filter(hit=>hit.object.type!=='LineSegments');
  if(hits.length && hits[0].distance<=maxDist) return hits[0];
  return null;
}

function nearestPointOnBuilding(b, source){
  const x = THREE.MathUtils.clamp(source.x, b.minX, b.maxX);
  const y = THREE.MathUtils.clamp(source.y, 3, b.h);
  const z = THREE.MathUtils.clamp(source.z, b.minZ, b.maxZ);
  const faces = [
    {d:Math.abs(source.x-b.minX), p:new THREE.Vector3(b.minX,y,z)},
    {d:Math.abs(source.x-b.maxX), p:new THREE.Vector3(b.maxX,y,z)},
    {d:Math.abs(source.z-b.minZ), p:new THREE.Vector3(x,y,b.minZ)},
    {d:Math.abs(source.z-b.maxZ), p:new THREE.Vector3(x,y,b.maxZ)},
    {d:Math.abs(source.y-b.h), p:new THREE.Vector3(x,b.h,z)}
  ];
  faces.sort((a,b)=>a.d-b.d);
  return faces[0].p;
}

function upperBuildingEdgePoints(b,source){
  const y=Math.max(3,b.h-0.65);
  const x=THREE.MathUtils.clamp(source.x,b.minX,b.maxX);
  const z=THREE.MathUtils.clamp(source.z,b.minZ,b.maxZ);
  return [
    new THREE.Vector3(b.minX,y,z),
    new THREE.Vector3(b.maxX,y,z),
    new THREE.Vector3(x,y,b.minZ),
    new THREE.Vector3(x,y,b.maxZ)
  ];
}

function rooftopAnchorPoints(b,source,forward,right,sideSign){
  const inset=Math.min(3,Math.max(0.8,Math.min(b.maxX-b.minX,b.maxZ-b.minZ)*0.08));
  const y=b.h+0.08;
  const clampRoof=point=>new THREE.Vector3(
    THREE.MathUtils.clamp(point.x,b.minX+inset,b.maxX-inset),y,
    THREE.MathUtils.clamp(point.z,b.minZ+inset,b.maxZ-inset)
  );
  const projected=clampRoof(source);
  const towardRoute=clampRoof(source.clone().addScaledVector(forward,12).addScaledVector(right,sideSign*7));
  const centre=new THREE.Vector3((b.minX+b.maxX)/2,y,(b.minZ+b.maxZ)/2);
  return [projected,towardRoute,centre];
}

function upperBuildingEdgeRayPoints(b,origin,direction){
  const dir=new THREE.Vector2(direction.x,direction.z);
  if(dir.lengthSq()<0.0001) return [];
  dir.normalize();
  let tMin=-Infinity;
  let tMax=Infinity;
  const updateSlab=(value,delta,min,max)=>{
    if(Math.abs(delta)<0.0001) return value>=min && value<=max;
    const t1=(min-value)/delta;
    const t2=(max-value)/delta;
    tMin=Math.max(tMin,Math.min(t1,t2));
    tMax=Math.min(tMax,Math.max(t1,t2));
    return tMin<=tMax;
  };
  if(!updateSlab(origin.x,dir.x,b.minX,b.maxX) ||
     !updateSlab(origin.z,dir.y,b.minZ,b.maxZ) || tMax<0) return [];
  const y=Math.max(3,b.h-0.65);
  const times=[];
  if(tMin>=0) times.push(tMin);
  if(tMax>=0 && Math.abs(tMax-tMin)>0.01) times.push(tMax);
  return times.map(t=>new THREE.Vector3(origin.x+dir.x*t,y,origin.z+dir.y*t));
}

function upperEdgeInteriorClearance(point,b){
  const onX=Math.abs(point.x-b.minX)<0.03 || Math.abs(point.x-b.maxX)<0.03;
  return onX
    ? Math.min(point.z-b.minZ,b.maxZ-point.z)
    : Math.min(point.x-b.minX,b.maxX-point.x);
}

function buildingForUpperEdgePoint(point){
  return nearbyBuildings(point,0.2).find(b=>{
    if(Math.abs(point.y-(b.h-0.65))>0.08) return false;
    const onX=(Math.abs(point.x-b.minX)<0.08 || Math.abs(point.x-b.maxX)<0.08) &&
      point.z>=b.minZ-0.08 && point.z<=b.maxZ+0.08;
    const onZ=(Math.abs(point.z-b.minZ)<0.08 || Math.abs(point.z-b.maxZ)<0.08) &&
      point.x>=b.minX-0.08 && point.x<=b.maxX+0.08;
    return onX||onZ;
  });
}

function lowerGroundPullAnchor(choice,hand){
  if(!choice?.point) return null;
  const b=buildingForUpperEdgePoint(choice.point);
  if(!b) return choice.point.clone();
  const point=choice.point.clone();
  // Camera space is mirrored by the third-person rig: positive camera-right is
  // the player's visual left. Keep the requested hand aligned with the screen.
  const sideSign=hand==='left'?1:-1;
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),cameraForwardFlat()).normalize();
  const sideShift=right.multiplyScalar(sideSign*2.4);
  const onX=Math.abs(point.x-b.minX)<0.08 || Math.abs(point.x-b.maxX)<0.08;
  if(onX) point.z=THREE.MathUtils.clamp(point.z+sideShift.z,b.minZ+0.35,b.maxZ-0.35);
  else point.x=THREE.MathUtils.clamp(point.x+sideShift.x,b.minX+0.35,b.maxX-0.35);
  // Startup pull strands hit the forward facade well below the roof. Their job
  // is to lift the player into the arc; the regular swing web takes the high
  // roof-edge target only after this short pull finishes.
  const rise=THREE.MathUtils.clamp(b.h*0.22,10,20);
  point.y=THREE.MathUtils.clamp(P.pos.y+rise,5,Math.max(5,b.h-5));
  return point;
}

function addUniqueAnchorCandidates(target,points){
  points.forEach(point=>{
    if(!target.some(existing=>existing.distanceToSquared(point)<0.01)) target.push(point);
  });
}

function highSwingAnchorY(point,b,playerEye,playerGround){
  const nearTopY=THREE.MathUtils.clamp(
    Math.max(playerEye.y+34,playerGround+44,b.h*0.86),
    6,b.h-1
  );
  const distance=Math.hypot(point.x-playerEye.x,nearTopY-playerEye.y,point.z-playerEye.z);
  return distance<=SWING_MAX_RANGE-2 ? nearTopY : null;
}

function findAssistedSwingAnchor(hand='center',excludePoint=null){
  const cameraForward=cameraForwardFlat();
  const momentumForward=new THREE.Vector3(P.vel.x,0,P.vel.z);
  if(momentumForward.lengthSq()>16) momentumForward.normalize().lerp(cameraForward,0.65).normalize();
  else momentumForward.copy(cameraForward);
  const sideSign=hand==='left'?1:-1;
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),momentumForward).normalize();
  const playerEye=P.pos.clone().add(new THREE.Vector3(0,1.35,0));
  const playerGround=heightAt(P.pos.x,P.pos.z,P.pos.y+2);
  const groundStart=P.state==='ground' || P.pos.y-playerGround<1.5;
  // Search mostly down the travel corridor. A large sideways bias picked deep
  // facade anchors and made the rope feel like it was winching into a wall.
  const searchPoint=playerEye.clone().addScaledVector(momentumForward,48).addScaledVector(right,sideSign*6);
  const highFalling=P.vel.y<-10;
  const fallSearchDistance=THREE.MathUtils.clamp(54+Math.abs(P.vel.y)*0.45,58,76);
  const fallSearchPoint=playerEye.clone()
    .addScaledVector(momentumForward,fallSearchDistance)
    .addScaledVector(right,sideSign*8);
  let best=null;
  let bestScore=-Infinity;
  const candidateBuildings=nearbyBuildings(playerEye,SWING_MAX_RANGE)
    .filter(building=>!building.worldOnly && building.h>=P.pos.y+MIN_SWING_ANCHOR_RISE)
    .map(building=>{
      const dx=Math.max(building.hitMinX-playerEye.x,0,playerEye.x-building.hitMaxX);
      const dz=Math.max(building.hitMinZ-playerEye.z,0,playerEye.z-building.hitMaxZ);
      return {building,distanceSq:dx*dx+dz*dz};
    })
    .sort((a,b)=>a.distanceSq-b.distanceSq)
    .slice(0,24);

  for(const entry of candidateBuildings){
    const b=entry.building;
    const candidates=[];
    if(groundStart){
      const upperFacadeSource=searchPoint.clone();
      upperFacadeSource.y=Math.max(6,b.h-1.2);
      addUniqueAnchorCandidates(candidates,[nearestPointOnBuilding(b,upperFacadeSource)]);
    }
    addUniqueAnchorCandidates(candidates,rooftopAnchorPoints(b,searchPoint,momentumForward,right,sideSign));
    addUniqueAnchorCandidates(candidates,upperBuildingEdgePoints(b,searchPoint));
    addUniqueAnchorCandidates(candidates,upperBuildingEdgePoints(b,playerEye));
    // Intersections between the player's forward corridor and the complete
    // rooftop perimeter provide continuously sliding targets between corners.
    for(const offset of [sideSign*4,sideSign*8,0]){
      const corridorOrigin=playerEye.clone().addScaledVector(right,offset);
      addUniqueAnchorCandidates(candidates,upperBuildingEdgeRayPoints(b,corridorOrigin,momentumForward));
    }

    for(const candidate of candidates){
      const point=candidate.clone();
      if(point.y<P.pos.y+MIN_SWING_ANCHOR_RISE) continue;
      if(excludePoint && point.distanceTo(excludePoint)<12) continue;
      const to=point.clone().sub(playerEye);
      const dist=to.length();
      if(dist<SWING_MIN_RANGE || dist>SWING_MAX_RANGE) continue;
      const horizontal=new THREE.Vector3(to.x,0,to.z);
      const horizontalDist=horizontal.length();
      if(horizontalDist<14) continue;
      horizontal.normalize();
      const forwardDot=horizontal.dot(momentumForward);
      const sideDot=horizontal.dot(right)*sideSign;
      if(forwardDot<-0.28) continue;
      // From street level, choose a roof edge ahead of the player rather than
      // the nearest side wall. A mostly lateral anchor turns the rope into a
      // winch and drags the character into the facade.
      if(groundStart && forwardDot<0.18) continue;
      // A side candidate must actually live on that side of the travel corridor.
      // This makes hand choice deterministic instead of allowing both searches to
      // return the same building with slightly different scores.
      if(sideDot<0.02) continue;

      // Reject anchors hidden behind another building or on a far-facing wall.
      raycaster.set(playerEye,to.clone().normalize());
      raycaster.far=dist+1;
      const rayMidpoint=playerEye.clone().addScaledVector(to,0.5);
      const sightHits=raycaster.intersectObjects(nearbyBuildingMeshes(rayMidpoint,dist*0.5+8),false);
      raycaster.far=Infinity;
      if(!sightHits.length || sightHits[0].object!==b.mesh || Math.abs(sightHits[0].distance-dist)>6) continue;
      // Roof candidates are slightly inset. From below, their sightline hits
      // the facade first: attach there rather than drawing through the roof.
      // Falling catches must pass the same visibility test as every other web.
      point.copy(sightHits[0].point);
      point.addScaledVector(to,-0.03/dist);
      // Candidate height alone is not enough: a ray can intersect a much lower
      // facade on its way to a high roof. Validate the ACTUAL visible hit.
      if(point.y<P.pos.y+MIN_SWING_ANCHOR_RISE) continue;

      // Keep the bottom of an assisted arc comfortably above the surface instead
      // of allowing a nearly ground-level rope that turns swinging into fast walking.
      const maxClearRope=point.y-playerGround-12;
      if(maxClearRope<SWING_MIN_RANGE) continue;
      const idealLength=Math.min(dist*0.96,maxClearRope);
      const ropeLength=Math.max(SWING_MIN_RANGE,idealLength);
      const roofInterior=Math.min(point.x-b.minX,b.maxX-point.x,point.z-b.minZ,b.maxZ-point.z);
      const interiorBonus=Math.min(26,Math.max(0,roofInterior)*1.8);
      // Favor nearby visible anchors for ordinary traversal. Fast-fall catches
      // additionally account for the speed the rope constraint would discard.
      // During a fast fall, a nearby overhead anchor can discard nearly all
      // descending speed at the first taut frame. Prefer geometry that carries
      // the incoming trajectory into the arc instead of ranking distance alone.
      const catchRadial=P.pos.clone().sub(point).normalize();
      const outwardSpeed=Math.max(0,P.vel.dot(catchRadial));
      const catchLoss=highFalling?outwardSpeed*outwardSpeed/Math.max(1,P.vel.lengthSq()):0;
      // Prefer higher real attachment points, but retain distance/forward
      // scoring so the rope does not snap to a faraway tower unnecessarily.
      const heightBonus=Math.min(180,Math.max(0,point.y-P.pos.y-MIN_SWING_ANCHOR_RISE)*2.5);
      const score=1200-dist*9+forwardDot*(groundStart?240:110)+
        Math.max(0,sideDot)*3+interiorBonus+heightBonus-catchLoss*2000;
      if(score>bestScore){ bestScore=score; best={point:point.clone(),length:ropeLength,score}; }
    }
  }
  return best;
}

function findLookSwingAnchor(){
  raycaster.setFromCamera(aimScreenPoint(),camera);
  raycaster.far=SWING_MAX_RANGE;
  const hit=raycaster.intersectObjects(nearbyBuildingMeshes(P.pos,SWING_MAX_RANGE),false)[0];
  raycaster.far=Infinity;
  if(!hit)return null;
  const b=hit.object.userData.buildingRecord;
  if(!b)return null;
  // Aimed webs use the actual surface under the reticle. Promoting a wall
  // hit to an inset rooftop could put the strand straight through the building.
  const point=hit.point.clone();
  if(hit.face) point.addScaledVector(hit.face.normal.clone().transformDirection(hit.object.matrixWorld),0.03);
  const eye=P.pos.clone().add(new THREE.Vector3(0,1.35,0));
  const to=point.clone().sub(eye),distance=to.length();
  if(distance<SWING_MIN_RANGE||distance>SWING_MAX_RANGE)return null;
  if(point.y<P.pos.y+MIN_SWING_ANCHOR_RISE || to.y/distance<0.35)return null;
  raycaster.set(eye,to.multiplyScalar(1/distance));
  raycaster.far=distance+0.1;
  const visible=raycaster.intersectObjects(nearbyBuildingMeshes(eye,distance+2),false)[0];
  raycaster.far=Infinity;
  if(!visible || visible.object!==b.mesh || Math.abs(visible.distance-distance)>0.15)return null;
  const ground=heightAt(P.pos.x,P.pos.z,P.pos.y+2);
  const safeLength=Math.max(SWING_MIN_RANGE,Math.min(distance*0.96,point.y-ground-9));
  return {point,length:safeLength,score:Infinity,targeted:true};
}

// ---------------------------------------------------------------------------------------
// ENEMIES + SPAWN GROUPS
// ---------------------------------------------------------------------------------------
const spawnPoints = [];
for(let i=0;i<36;i++){
  // More patrol points, systematically distributed from north to south.
  // Every spawn stays on an intersection instead of appearing inside buildings.
  const ix = 1+((i*7+3)%(BLOCKS_X-2));
  const iz = 1+((i*13+5)%(BLOCKS_Z-2));
  const x = -HALF_CITY_X + ix*TILE_X;
  const z = -HALF_CITY_Z + iz*TILE_Z;
  spawnPoints.push(new THREE.Vector3(x,0,z));
}
const spawnMarkers = [];
const spawnMat = new THREE.MeshBasicMaterial({color:0x00e5ff, transparent:true, opacity:0.7,side:THREE.DoubleSide});
spawnPoints.forEach(p=>{
  // Debug-only enemy spawn marker. Keep it as a thin ring so it cannot be
  // mistaken for a collectible or a pool placed in the street.
  const m = new THREE.Mesh(new THREE.RingGeometry(2.25,2.65,20), spawnMat);
  m.rotation.x=-Math.PI/2;
  m.position.set(p.x,0.15,p.z); m.visible=false;
  scene.add(m); spawnMarkers.push(m);
});
applyDebugVisibility();

const enemies = [];
const groups = []; // {points:[..], members:[enemy idx], defeatedAt:null, homeIdx}

const enemyGeo = new THREE.BoxGeometry(0.9,1.0,0.5);
const ENEMY_RADIUS = 0.62;
const ENEMY_HEIGHT = 2.15;

// Object3D.clone() leaves SkinnedMesh skeletons pointing at the source bones.
// Rebind every cloned mesh to its matching cloned bones so each street enemy
// can use the player model without copying the player's pose.
function cloneSkinnedAvatar(source){
  const clone=source.clone(true);
  const sourceNodes={},cloneNodes={};
  source.traverse(node=>{ if(node.name) sourceNodes[node.name]=node; });
  clone.traverse(node=>{ if(node.name) cloneNodes[node.name]=node; });
  source.traverse(node=>{
    if(!node.isSkinnedMesh || !node.name || !cloneNodes[node.name]) return;
    const clonedMesh=cloneNodes[node.name];
    const clonedSkeleton=node.skeleton.clone();
    clonedSkeleton.bones=node.skeleton.bones.map(bone=>cloneNodes[bone.name]||bone);
    clonedMesh.bind(clonedSkeleton,node.bindMatrix.clone());
  });
  return clone;
}

function attachEnemyAvatar(e){
  if(!r15EnemyTemplate||e.avatar) return;
  [...e.mesh.children].forEach(child=>child.visible=false);
  e.mat.transparent=true;
  e.mat.opacity=0;
  e.mat.depthWrite=false;
  const avatar=cloneSkinnedAvatar(r15EnemyTemplate);
  avatar.scale.setScalar(0.56);
  avatar.position.y=-0.8;
  const materials=[];
  const bones={};
  const rest={};
  avatar.traverse(node=>{
    if(node.isBone && !bones[node.name]){
      bones[node.name]=node;
      rest[node.name]=node.quaternion.clone();
    }
    if(!node.isMesh) return;
    node.material=node.material.clone();
    if(node.material.color){
      const region=r15SkinRegion(node.name);
      node.material.color.setHex(e.avatarPalette[region]??e.avatarPalette.accent);
    }
    materials.push(node.material);
  });
  e.avatar=avatar;
  e.avatarMaterials=materials;
  e.avatarBones=bones;
  e.avatarRest=rest;
  e.mesh.add(avatar);
}

function attachStreetAvatar(person){
  if(!r15EnemyTemplate||person.avatar)return;
  person.placeholder.forEach(part=>part.visible=false);
  const avatar=cloneSkinnedAvatar(r15EnemyTemplate);
  avatar.scale.setScalar(.48);
  avatar.position.y=0;
  const shirts=[0x296da8,0xd16a32,0x4d8b57,0x7b4f9f,0xd2a72f,0x56717d];
  const trousers=[0x1e2938,0x33313a,0x233244,0x44352e];
  const skins=[0x6f3f30,0x8d5138,0xb97858,0xd39a78];
  const palette={primary:shirts[person.index%shirts.length],secondary:shirts[(person.index+2)%shirts.length],legs:trousers[person.index%trousers.length],shoes:0x17191f,skin:skins[person.index%skins.length],accent:0x5b6574};
  avatar.traverse(node=>{
    if(!node.isMesh)return;
    node.material=node.material.clone();
    if(node.material.color)node.material.color.setHex(palette[r15SkinRegion(node.name)]??palette.accent);
  });
  person.avatar=avatar;
  person.root.add(avatar);
}

function poseEnemyBone(e,name,rot,amount){
  const bone=e.avatarBones?.[name],rest=e.avatarRest?.[name];
  if(!bone||!rest)return;
  const offset=new THREE.Quaternion().setFromEuler(new THREE.Euler(rot.x||0,rot.y||0,rot.z||0,'XYZ'));
  bone.quaternion.slerp(rest.clone().multiply(offset),amount);
}

function poseEnemyVisualBone(e,name,rot,amount){
  poseEnemyBone(e,name,{x:-(rot.x||0),y:-(rot.y||0),z:-(rot.z||0)},amount);
}

function setEnemyFlash(e,on){
  if(e.avatarMaterials?.length){
    e.avatarMaterials.forEach(material=>{
      if(!material.color)return;
      if(on){
        if(!material.userData.baseColor) material.userData.baseColor=material.color.clone();
        material.color.setHex(0xffffff);
      } else if(material.userData.baseColor) material.color.copy(material.userData.baseColor);
    });
  } else e.mat.color.setHex(on?0xffffff:e.outfitColor);
}
function makeEnemy(pos, groupId, kind='brawler'){
  kind='brawler';
  const outfitColors=[0x7a3b3b,0x36506f,0x55426e,0x52613b];
  const mat = new THREE.MeshLambertMaterial({color:outfitColors[groupId%outfitColors.length]});
  const pantsMat = new THREE.MeshLambertMaterial({color:0x252a34});
  const skinColors=[0x8d5138,0xb97858,0xd39a78,0x6f3f30];
  const hairColors=[0x171313,0x35251d,0x161b24,0x5a3826];
  const skinMat = new THREE.MeshLambertMaterial({color:skinColors[(groupId+enemies.length)%skinColors.length]});
  const hairMat = new THREE.MeshLambertMaterial({color:hairColors[(groupId*2+enemies.length)%hairColors.length]});
  const shoeMat = new THREE.MeshLambertMaterial({color:0x11151c});
  const mesh = new THREE.Mesh(enemyGeo, mat);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.58,0.56),skinMat);
  head.position.y=0.82; addEdges(head);
  const hair=new THREE.Mesh(new THREE.BoxGeometry(0.64,0.18,0.58),hairMat);
  hair.position.y=0.22; head.add(hair);
  const eyeMat=new THREE.MeshBasicMaterial({color:0x12161c});
  for(const side of [-1,1]){
    const eye=new THREE.Mesh(new THREE.BoxGeometry(0.045,0.07,0.025),eyeMat);
    eye.position.set(side*0.105,0.035,0.293); head.add(eye);
  }
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.025,0.025),eyeMat);
  mouth.position.set(0,-0.105,0.294); head.add(mouth);

  function makeEnemyArm(side){
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.96,0.34),mat);
    arm.position.set(side*0.61,0,0); addEdges(arm);
    const hand=new THREE.Mesh(new THREE.BoxGeometry(0.325,0.28,0.345),skinMat);
    hand.position.y=-0.35; arm.add(hand);
    return arm;
  }
  function makeEnemyLeg(side){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.82,0.4),pantsMat);
    leg.position.set(side*0.23,-0.7,0); addEdges(leg);
    const shoe=new THREE.Mesh(new THREE.BoxGeometry(0.385,0.24,0.48),shoeMat);
    shoe.position.set(0,-0.3,0.04); leg.add(shoe);
    return leg;
  }
  const armL=makeEnemyArm(-1), armR=makeEnemyArm(1);
  const legL=makeEnemyLeg(-1), legR=makeEnemyLeg(1);
  addEdges(mesh);
  mesh.add(head,armL,armR,legL,legR);
  const shirtDetail=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.56,0.025),pantsMat);
  shirtDetail.position.set(0,0.05,0.263); mesh.add(shirtDetail);
  mesh.position.copy(pos); mesh.position.y=1.0;
  scene.add(mesh);
  const archetypes={runner:{hp:28,speed:8.4,damage:5,scale:.9},brawler:{hp:40,speed:6.5,damage:7,scale:1},brute:{hp:78,speed:4.5,damage:13,scale:1.16},boss:{hp:180,speed:5.2,damage:16,scale:1.3}};
  const stats=archetypes[kind]||archetypes.brawler;
  mesh.scale.setScalar(stats.scale);
  const e = {
    mesh, mat, kind, hp:stats.hp, maxHp:stats.hp, moveSpeed:stats.speed, attackDamage:stats.damage, state:'idle', groupId,
    home:pos.clone(), vel:new THREE.Vector3(), stunT:0, attackCd:0, alertT:0,
    wanderTarget:pos.clone(), wanderT:Math.random()*2.5,
    hitRadius:ENEMY_RADIUS, hitHeight:ENEMY_HEIGHT,
    alive:true, hpEl:null, parts:{head,armL,armR,legL,legR}, outfitColor:outfitColors[groupId%outfitColors.length],
    avatarPalette:{
      primary:outfitColors[(groupId+1)%outfitColors.length],
      secondary:outfitColors[(groupId+3+enemies.length)%outfitColors.length],
      legs:0x222a36,shoes:0x101319,
      skin:skinColors[(groupId+enemies.length)%skinColors.length],
      accent:hairColors[(groupId*2+enemies.length)%hairColors.length]
    },
  };
  const hpEl = document.createElement('div');
  hpEl.className='enemyHp';
  hpEl.innerHTML = '<div class="fill" style="width:100%"></div>';
  document.getElementById('enemyHpLayer').appendChild(hpEl);
  e.hpEl = hpEl;
  enemies.push(e);
  // Full-detail R15 created lazily when the actor is nearby.
  return e;
}

function spawnGroup(spawnIdx){
  const base = spawnPoints[spawnIdx];
  const count = 3+((Math.random()*2)|0);
  const g = {spawnIdx, members:[], defeatedAt:null};
  for(let i=0;i<count;i++){
    const off = new THREE.Vector3((Math.random()-0.5)*8,0,(Math.random()-0.5)*8);
    const e = makeEnemy(base.clone().add(off), groups.length,'brawler');
    g.members.push(e);
  }
  groups.push(g);
}
// Nine active gangs across the larger island; distance-based NPC LOD keeps
// only nearby enemies fully animated. Cleared gangs respawn normally.
[0,3,7,11,15,19,23,28,33].forEach(i=>spawnGroup(i));

// A five-minute empty map killed the patrol loop. Cleared groups now regroup quickly.
const RESPAWN_TIME = 30;

function removeEnemy(e){
  scene.remove(e.mesh);
  if(e.hpEl) e.hpEl.remove();
  const idx = enemies.indexOf(e);
  if(idx !== -1) enemies.splice(idx, 1);
}

function updateGroups(dt){
  groups.forEach(g=>{
    const anyAlive = g.members.some(e=>e.alive);
    if(!anyAlive && g.defeatedAt===null){
      g.defeatedAt = performance.now();
      addCash(20,'GANG CLEARED');
      progress.gangs++;saveProgress();updateMissionUI();updateShopUI();
    }
    if(!anyAlive && g.defeatedAt!==null){
      const elapsed = (performance.now()-g.defeatedAt)/1000;
      if(elapsed >= RESPAWN_TIME){
        // respawn at a random valid point away from player
        let idx;
        do{ idx = (Math.random()*spawnPoints.length)|0; }
        while(spawnPoints[idx].distanceTo(P.pos) < 20);
        g.members.forEach(removeEnemy);
        g.members = [];
        g.spawnIdx = idx;
        g.defeatedAt = null;
        const base = spawnPoints[idx];
        const count = 3+((Math.random()*2)|0);
        for(let i=0;i<count;i++){
          const off = new THREE.Vector3((Math.random()-0.5)*8,0,(Math.random()-0.5)*8);
          const e = makeEnemy(base.clone().add(off), groups.indexOf(g),'brawler');
          g.members.push(e);
        }
      }
    }
  });
}

const ALERT_RADIUS = 16;
const CHASE_SPEED = 6.5;
const ATTACK_RANGE = 2.0;

function applyEnemyVelocity(e, dt){
  if(e.vel.lengthSq() < 0.001) return;
  e.mesh.position.x += e.vel.x * dt;
  e.mesh.position.z += e.vel.z * dt;
  e.vel.multiplyScalar(Math.pow(0.08, dt));
}

function resolveEnemyHitboxes(){
  const alive=enemies.filter(e=>e.alive);
  for(let i=0;i<alive.length;i++){
    const a=alive[i];
    for(let j=i+1;j<alive.length;j++){
      const b=alive[j];
      const dx=b.mesh.position.x-a.mesh.position.x;
      const dz=b.mesh.position.z-a.mesh.position.z;
      const dist=Math.hypot(dx,dz);
      const minimum=a.hitRadius+b.hitRadius;
      if(dist>=minimum) continue;
      const nx=dist>0.001?dx/dist:1;
      const nz=dist>0.001?dz/dist:0;
      const push=(minimum-dist)*0.5;
      a.mesh.position.x-=nx*push; a.mesh.position.z-=nz*push;
      b.mesh.position.x+=nx*push; b.mesh.position.z+=nz*push;
    }
  }

  // Traversal owns the player's trajectory. Enemies only body-block grounded,
  // low-speed combat movement, never a swing, zip, wall run, glide, or fly-by.
  if(P.state!=='ground' || Math.hypot(P.vel.x,P.vel.z)>8 || pullTarget) return;
  for(const e of alive){
    const playerCenterY=P.pos.y+0.95;
    if(Math.abs(playerCenterY-e.mesh.position.y)>ENEMY_HEIGHT*0.75) continue;
    const dx=P.pos.x-e.mesh.position.x;
    const dz=P.pos.z-e.mesh.position.z;
    const dist=Math.hypot(dx,dz);
    const minimum=PLAYER_RADIUS+e.hitRadius;
    if(dist>=minimum) continue;
    const nx=dist>0.001?dx/dist:Math.sin(P.facing);
    const nz=dist>0.001?dz/dist:Math.cos(P.facing);
    const push=minimum-dist;
    P.pos.x+=nx*push;
    P.pos.z+=nz*push;
    const inward=P.vel.x*nx+P.vel.z*nz;
    if(inward<0){ P.vel.x-=nx*inward; P.vel.z-=nz*inward; }
  }
}

function animateEnemy(e,dt){
  if(!e.mesh.visible)return;
  const phase=performance.now()*0.009+e.home.x*0.12;
  const walking=e.state==='chasing'||(e.state==='idle'&&e.vel.lengthSq()>0.08);
  const runCycle=e.state==='chasing';
  const stride=walking ? Math.sin(phase*(runCycle?1.15:0.72))*(runCycle?0.72:0.42) : 0;
  let armL=stride, armR=-stride, legL=-stride, legR=stride;
  if(e.state==='attacking') armR=-1.35;
  if(e.stunT>0){ armL=0.75; armR=-0.75; legL=0.22; legR=-0.22; }
  const blend=1-Math.exp(-12*dt);
  if(e.avatar){
    e.avatar.position.y=-0.8+(walking?Math.abs(Math.sin(phase))*0.055:0);
    const targetPitch=e.state==='attacking'?-0.22:e.stunT>0?0.28:0;
    e.avatar.rotation.x=THREE.MathUtils.lerp(e.avatar.rotation.x,targetPitch,blend);
    e.avatar.rotation.z=THREE.MathUtils.lerp(e.avatar.rotation.z,walking?Math.sin(phase)*0.035:0,blend);
    const attackWindup=e.state==='attacking'?THREE.MathUtils.clamp(1-e.attackCd/0.65,0,1):0;
    const punch=Math.sin(attackWindup*Math.PI);
    const runLean=walking?-0.16:0;
    poseEnemyBone(e,'UpperTorso',{x:-runLean,y:punch*0.2,z:0},blend);
    poseEnemyBone(e,'Head',{x:walking?-0.05:0,y:-punch*0.08,z:0},blend);
    poseEnemyVisualBone(e,r15VisualBone.leftUpperArm,
      {x:walking?stride*0.72:-0.04,y:0,z:walking?-0.05:-0.02},blend);
    poseEnemyVisualBone(e,r15VisualBone.rightUpperArm,
      {x:e.state==='attacking'?-0.72-punch*0.5:walking?-stride*0.72:-0.04,y:0,z:e.state==='attacking'?0.18:0.02},blend);
    poseEnemyVisualBone(e,r15VisualBone.leftLowerArm,{x:walking?-0.5:-0.16,y:0,z:0},blend);
    poseEnemyVisualBone(e,r15VisualBone.rightLowerArm,{x:e.state==='attacking'?-THREE.MathUtils.lerp(1.2,0.64,punch):walking?-0.5:-0.16,y:0,z:0},blend);
    poseEnemyVisualBone(e,r15VisualBone.leftUpperLeg,{x:walking?-stride:0,y:0,z:0},blend);
    poseEnemyVisualBone(e,r15VisualBone.rightUpperLeg,{x:walking?stride:0,y:0,z:0},blend);
    poseEnemyVisualBone(e,r15VisualBone.leftLowerLeg,{x:walking?Math.max(0,stride)*0.55:0,y:0,z:0},blend);
    poseEnemyVisualBone(e,r15VisualBone.rightLowerLeg,{x:walking?Math.max(0,-stride)*0.55:0,y:0,z:0},blend);
  }
  e.parts.armL.rotation.x=THREE.MathUtils.lerp(e.parts.armL.rotation.x,armL,blend);
  e.parts.armR.rotation.x=THREE.MathUtils.lerp(e.parts.armR.rotation.x,armR,blend);
  e.parts.legL.rotation.x=THREE.MathUtils.lerp(e.parts.legL.rotation.x,legL,blend);
  e.parts.legR.rotation.x=THREE.MathUtils.lerp(e.parts.legR.rotation.x,legR,blend);
}

function enemyHasClearHit(e){
  const origin=e.mesh.position.clone().add(new THREE.Vector3(0,0.85,0));
  const target=P.pos.clone().add(new THREE.Vector3(0,0.95,0));
  const toPlayer=target.sub(origin);
  const distance=toPlayer.length();
  if(distance>ATTACK_RANGE*1.65) return false;
  raycaster.set(origin,toPlayer.normalize());
  raycaster.far=distance;
  const obstruction=raycaster.intersectObjects(nearbyBuildingMeshes(origin,distance+2),false)[0];
  raycaster.far=Infinity;
  return !obstruction || obstruction.distance>=distance-0.35;
}

function enemyRouteDirection(e,desired){
  if(desired.lengthSq()<0.001)return desired;
  const base=Math.atan2(desired.x,desired.z);
  const choices=[0,.42,-.42,.82,-.82,1.25,-1.25,Math.PI];
  const localBuildings=nearbyBuildings(e.mesh.position,9).filter(b=>b.h>1.6);
  let best=null,bestScore=-Infinity;
  for(const offset of choices){
    const dir=new THREE.Vector3(Math.sin(base+offset),0,Math.cos(base+offset));
    const probe=e.mesh.position.clone().addScaledVector(dir,3.2);
    const blocked=localBuildings.some(b=>
      probe.x>b.hitMinX-.75&&probe.x<b.hitMaxX+.75&&probe.z>b.hitMinZ-.75&&probe.z<b.hitMaxZ+.75
    );
    if(blocked||!isOverIsland(probe.x,probe.z,-1))continue;
    const score=dir.dot(desired)-Math.abs(offset)*.08;
    if(score>bestScore){bestScore=score;best=dir;}
  }
  return best||desired.clone().multiplyScalar(-1);
}

function updateEnemies(dt){
  enemies.forEach(e=>{
    if(!e.alive) return;
    const enemyBeforeMove=e.mesh.position.clone();
    applyEnemyVelocity(e, dt);
    if(e.stunT>0){
      e.stunT-=dt;
      e.mat.color.setHex(0x3355ff);
      e.mesh.position.y = 0.8;
      animateEnemy(e,dt);
      resolveWallCollision(e.mesh.position,enemyBeforeMove);
      return;
    }
    e.mat.color.setHex(e.outfitColor);

    const verticalGap=Math.abs((P.pos.y+0.95)-(e.mesh.position.y+0.85));
    const sameLevel=verticalGap<2.6;
    const toPlayer = new THREE.Vector3().subVectors(P.pos, e.mesh.position);
    toPlayer.y=0;
    const dist = toPlayer.length();

    if(e.state==='idle'){
      if(sameLevel && dist < ALERT_RADIUS){ e.state='alert'; e.alertT=0.5; }
      else {
        // Gangs mill around their corner instead of standing like target dummies.
        e.wanderT-=dt;
        const toWander=e.wanderTarget.clone().sub(e.mesh.position).setY(0);
        if(e.wanderT<=0||toWander.length()<0.8){
          const angle=Math.random()*Math.PI*2;
          const radius=2+Math.random()*5;
          e.wanderTarget.copy(e.home).add(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));
          e.wanderT=2.2+Math.random()*3.4;
        } else {
          toWander.normalize();
          const route=enemyRouteDirection(e,toWander);
          e.vel.lerp(route.multiplyScalar(1.8),1-Math.exp(-5*dt));
          e.mesh.lookAt(e.wanderTarget.x,e.mesh.position.y,e.wanderTarget.z);
        }
      }
    } else if(e.state==='alert'){
      e.alertT -= dt;
      e.mat.color.setHex(0xd18a1c);
      if(!sameLevel) e.state='idle';
      else if(e.alertT<=0) e.state='chasing';
      if(dist>ALERT_RADIUS*1.6) e.state='idle';
    } else if(e.state==='chasing'){
      if(!sameLevel){ e.state='idle'; }
      else if(dist < ATTACK_RANGE){ e.state='attacking'; e.attackCd=0.6; }
      else if(dist>ALERT_RADIUS*2.2){ e.state='idle'; }
      else {
        toPlayer.normalize();
        const route=enemyRouteDirection(e,toPlayer);
        e.mesh.position.addScaledVector(route, e.moveSpeed*dt);
        e.mesh.lookAt(P.pos.x, e.mesh.position.y, P.pos.z);
      }
    } else if(e.state==='attacking'){
      e.attackCd -= dt;
      if(!sameLevel){ e.state='idle'; }
      else if(dist>ATTACK_RANGE*1.4){ e.state='chasing'; }
      else if(e.attackCd<=0){
        e.attackCd = 1.35;
        if(P.invuln<=0 && P.state!=='downed' && enemyHasClearHit(e)){
          if(P.parryT>0){
            P.parryT=0;
            P.blocking=false;
            e.stunT=1.25;
            e.vel.addScaledVector(toPlayer.lengthSq()>0.001?toPlayer.clone().normalize().multiplyScalar(-1):new THREE.Vector3(0,0,-1),7);
            playSfx('parry');
            flashMsg('PARRY');
          } else damagePlayer(e.attackDamage);
        }
      }
    }
    e.mesh.position.y = 0.8;
    animateEnemy(e,dt);
    resolveWallCollision(e.mesh.position,enemyBeforeMove);
  });
  resolveEnemyHitboxes();
}

// ---------------------------------------------------------------------------------------
// WEB PROJECTILES (web-shot + rope visual)
// ---------------------------------------------------------------------------------------
const projectiles = [];
const webshotGeo = new THREE.SphereGeometry(0.18,8,8);
const webshotMat = new THREE.MeshBasicMaterial({color:0xdff8ff});
const swingRopeGeo = new THREE.CylinderGeometry(0.075,0.075,1,7);
const swingRopeMat = new THREE.MeshBasicMaterial({color:0xf4fbff});
const ropeLine = new THREE.Mesh(swingRopeGeo,swingRopeMat);
ropeLine.visible=false;
scene.add(ropeLine);

const ropeLineRight=ropeLine.clone();
ropeLineRight.visible=false;
scene.add(ropeLineRight);

const comboLine=ropeLine.clone();
comboLine.visible=false;
scene.add(comboLine);

// Zip keeps its existing line renderer and mechanics; swing webs use real geometry
// because WebGL ignores lineWidth on most browsers.
const zipLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),
  new THREE.LineBasicMaterial({color:0xbfe9ff})
);
zipLine.visible=false;
scene.add(zipLine);

const ropeUp=new THREE.Vector3(0,1,0);
function setSwingRope(mesh,start,end){
  const delta=end.clone().sub(start);
  const length=delta.length();
  if(length<0.01){ mesh.visible=false; return; }
  mesh.visible=true;
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.scale.set(1,length,1);
  mesh.quaternion.setFromUnitVectors(ropeUp,delta.multiplyScalar(1/length));
}

function fireWebshot(){
  raycaster.setFromCamera(aimScreenPoint(),camera);
  const dir=raycaster.ray.direction.clone();
  const origin = player.position.clone().add(new THREE.Vector3(0,1.3,0));
  const mesh = new THREE.Mesh(webshotGeo, webshotMat);
  mesh.position.copy(origin);
  scene.add(mesh);
  projectiles.push({pos:origin, dir, life:1.0, mesh});
}

function removeProjectile(index){
  const p = projectiles[index];
  if(p.mesh) scene.remove(p.mesh);
  projectiles.splice(index,1);
}

// ---------------------------------------------------------------------------------------
// ABILITY LOGIC
// ---------------------------------------------------------------------------------------
let zipTarget=null;
let zipDir=null;
let zipEnemyTarget=null;
let pullTarget=null;
let combatTarget=null;
let comboChainTarget=null;
let comboChainMode=null;

// A held traversal input chooses the stronger valid side automatically. Traversal
// webs still require city geometry; enemies remain combat targets only.
function trySwing(hand,abilId,chosenOverride=null){
  if(P.state==='downed' || P.state==='defeated') return;
  if(P.activeSwingHand || P.cooldowns.swing>0) return false;
  const chosen=chosenOverride || findAssistedSwingAnchor(hand,null);
  // Final safeguard: no swing may attach below player height, even if a
  // previously selected target became invalid while the player was moving.
  if(!chosen || chosen.point.y<P.pos.y+MIN_SWING_ANCHOR_RISE)return false;
  const otherHand=hand==='left'?'right':'left';
  const web=P.swingWebs[hand];
  if(chosen){
    if(P.gliding){
      P.gliding=false;
      P.wingCooldown=5;
    }
    const wasGround = P.state==='ground';
    const entryGround=heightAt(P.pos.x,P.pos.z,P.pos.y+2);
    const groundClearance=Math.max(0,P.pos.y-entryGround);
    const groundPull=wasGround || groundClearance<1.5;
    P.swingWebs[otherHand].anchor=null;
    P.swingWebs[otherHand].physicsPivot=null;
    P.swingWebs[otherHand].auto=false;
    web.anchor=chosen.point.clone();
    web.momentumCatch=P.vel.y<-10;
    web.fallCatch=web.momentumCatch && web.anchor.y<P.pos.y-2;
    // Swing around the point the strand visibly touches. The previous hidden
    // corridor pivot made the body move around a different centre than the web.
    web.physicsPivot=web.anchor.clone();
    web.length=P.pos.distanceTo(web.physicsPivot);
    // Retain the native build's limited slack take-up, never a radius snap.
    web.targetLength=Math.min(web.length,Math.max(chosen.length,web.length-10,SWING_MIN_RANGE));
    web.auto=false;
    P.swingGroundPullT=groundPull?SWING_GROUND_PULL_TIME:0;
    // One input creates one strand, including from the ground. A second fake
    // startup strand made the launch feel like an assisted slingshot.
    P.swingGroundPullAnchor=null;
    P.swingGroundPullAnchors.left=null;
    P.swingGroundPullAnchors.right=null;
    P.activeSwingHand=hand;
    P.swingReleaseHand=null;
    // Prefer the opposite hand next time. The chooser only honours this when
    // both sides have a valid anchor, so a blocked side never prevents swinging.
    P.nextSwingHand=otherHand;
    P.swingLaneCenter.copy(P.pos);
    P.swingLaneRight.crossVectors(new THREE.Vector3(0,1,0),cameraForwardFlat()).normalize();
    P.state='swing';
    P.swingAssisted=true;
    P.swingPhaseT=0;
    P.swingAge=0;
    giveSwingEntryMomentum(wasGround,groundClearance);
    P.swingHasDescended=P.vel.y<-1.5;
    P.swingClimbedAfterDescent=false;
    P.swingPeakFlat=Math.hypot(P.vel.x,P.vel.z);
    P.swingLastVy=P.vel.y;
    P.swingBottomSpeed=0;
    P.swingPeakRise=Math.max(0,P.vel.y);
    P.swingPhase=P.swingHasDescended?'descent':'entry';
    P.swingTelemetry={
      phase:P.swingPhase,
      entryVelocity:P.vel.clone(),
      attachPosition:P.pos.clone(),
      visualAnchor:web.anchor.clone(),
      physicsPivot:web.physicsPivot.clone(),
      samples:[]
    };
    pulse(abilId);
    return true;
  }
  return false;
}

function trySmartSwing(){
  const aimed=findLookSwingAnchor();
  const left=findAssistedSwingAnchor('left',null);
  const right=findAssistedSwingAnchor('right',null);
  if(aimed){
    const toAim=aimed.point.clone().sub(P.pos);
    const cameraRight=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),cameraForwardFlat()).normalize();
    const aimSide=toAim.dot(cameraRight);
    // Alternate near the reticle centre, but let a deliberate side aim use
    // the hand already nearest that surface. Crossing the body with the
    // opposite strand makes the shot read as attached to the wrong building.
    let hand=aimSide>=0?'left':'right';
    if(Math.abs(aimSide)<6 && left&&right)hand=P.nextSwingHand;
    return trySwing(hand,hand==='left'?'abSwingLeft':'abSwingRight',aimed);
  }
  if(!left && !right) return false;
  let hand=P.nextSwingHand;
  if(!left)hand='right';
  else if(!right)hand='left';
  else if(P.vel.y<-10 && Math.abs(left.score-right.score)>20){
    // Alternate hands only when both catches are comparably useful.
    hand=left.score>right.score?'left':'right';
  }
  const chosen=hand==='left'?left:right;
  return trySwing(hand,hand==='left'?'abSwingLeft':'abSwingRight',chosen);
}

function cameraForwardFlat(){
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y=0;
  if(forward.lengthSq()<0.001) forward.set(Math.sin(P.facing),0,Math.cos(P.facing));
  return forward.normalize();
}

function cameraForward3D(){
  return new THREE.Vector3(
    Math.sin(yaw)*Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw)*Math.cos(pitch)
  ).normalize();
}

function giveSwingEntryMomentum(fromGround=false,groundClearance=Infinity){
  const forward = cameraForwardFlat();
  const flatSpeed = Math.hypot(P.vel.x,P.vel.z);
  // Only street-level starts need launch assistance. Mid-air catches preserve
  // incoming velocity, including slow motion opposite the camera direction.
  if(flatSpeed<15 && (fromGround || groundClearance<1.5)){
    const assist=15-flatSpeed;
    P.vel.x += forward.x*assist;
    P.vel.z += forward.z*assist;
  }
  // A street-level start has no room to descend. Give it only enough clearance
  // to establish the rope, then let gravity create the normal downward arc.
  if(fromGround || groundClearance<1.5) P.vel.y=Math.max(P.vel.y,7.5);
}

function swingConstraint(activeWebs){
  const web=activeWebs[0];
  return {anchor:web.physicsPivot||web.anchor,length:web.length};
}

function steerSwingVelocity(radial,mv,dt){
  // Steer within the rope's tangent plane. Rotating only X/Z creates
  // outward velocity that the constraint immediately deletes, braking turns.
  const radialSpeed=P.vel.dot(radial);
  const tangent=P.vel.clone().addScaledVector(radial,-radialSpeed);
  const tangentSpeed=tangent.length();
  if(tangentSpeed>0.25){
    const steerIntent=cameraForwardFlat();
    if(mv.lengthSq()>0.001) steerIntent.multiplyScalar(0.35).addScaledVector(mv,0.9).normalize();
    steerIntent.addScaledVector(radial,-steerIntent.dot(radial));
    if(steerIntent.lengthSq()>0.001){
      steerIntent.normalize();
      tangent.multiplyScalar(1/tangentSpeed);
      const angle=Math.atan2(radial.dot(tangent.clone().cross(steerIntent)),
        THREE.MathUtils.clamp(tangent.dot(steerIntent),-1,1));
      const turnRate=mv.lengthSq()>0.001?SWING_INPUT_TURN_RATE:SWING_LOOK_TURN_RATE;
      tangent.applyAxisAngle(radial,angle*(1-Math.exp(-turnRate*dt)));
      const phasePower=P.swingPhase==='descent'?THREE.MathUtils.clamp(-P.vel.y/18,0,1):0;
      const pumpedSpeed=keys[bindings.forward] && tangentSpeed<SWING_POWERED_SPEED
        ? Math.min(SWING_POWERED_SPEED,tangentSpeed+SWING_FORWARD_ACCEL*phasePower*dt)
        : tangentSpeed;
      P.vel.copy(tangent).multiplyScalar(pumpedSpeed).addScaledVector(radial,radialSpeed);
    }
  }
}

function enforceSwingConstraint(activeWebs){
  if(!activeWebs.length) return;
  const constraint=swingConstraint(activeWebs);
  const offset=P.pos.clone().sub(constraint.anchor);
  const distance=offset.length();
  if(distance<=constraint.length || distance<0.001) return;
  const radial=offset.multiplyScalar(1/distance);
  P.pos.copy(constraint.anchor).addScaledVector(radial,constraint.length);
  const outwardSpeed=P.vel.dot(radial);
  if(outwardSpeed>0){
    const catchSpeed=P.vel.length();
    P.vel.addScaledVector(radial,-outwardSpeed);
    // On the first taut frame of a high fall, redirect the catch impulse into
    // the rope tangent instead of deleting it. Later constraint corrections do
    // not receive this assist, so ordinary pendulum motion cannot gain energy.
    if(activeWebs[0].momentumCatch && P.swingAge<.16 && P.vel.lengthSq()>.001){
      P.vel.setLength(Math.min(catchSpeed,SWING_MAX_SPEED));
    }
  }
}

function swingReleaseAssist(age,phase,verticalSpeed,flatSpeed){
  if(phase!=='ascent' || verticalSpeed<=1 || verticalSpeed>=SWING_RELEASE_APEX_VY+SWING_RELEASE_WINDOW){
    return {quality:0,hop:0,speedBonus:0};
  }
  const quality=THREE.MathUtils.clamp(
    1-Math.abs(verticalSpeed-SWING_RELEASE_APEX_VY)/SWING_RELEASE_WINDOW,
    0,1
  );
  if(quality<=0) return {quality:0,hop:0,speedBonus:0};
  const hop=quality*(1.35+Math.min(Math.max(flatSpeed,0),60)*0.025);
  const shortArc=Math.max(0,1-age/SWING_SHORT_ARC_MAX_AGE);
  return {quality,hop,speedBonus:quality*shortArc*5.5};
}

function releaseSwing(hand=null,applyTimingAssist=true){
  const wallSwing=P.state==='climb' && P.wallRunFromSwing;
  if(P.state!=='swing' && !wallSwing) return;
  if(hand && P.activeSwingHand!==hand) return;
  const flatSpeed=Math.hypot(P.vel.x,P.vel.z);
  const assist=applyTimingAssist
    ? swingReleaseAssist(P.swingAge,P.swingPhase,P.vel.y,flatSpeed)
    : {quality:0,hop:0,speedBonus:0};
  P.swingReleaseHand=P.activeSwingHand;
  P.swingWebs.left.anchor=null;
  P.swingWebs.right.anchor=null;
  P.swingWebs.left.physicsPivot=null;
  P.swingWebs.right.physicsPivot=null;
  P.swingWebs.left.auto=false;
  P.swingWebs.right.auto=false;
  P.swingWebs.left.fallCatch=false;
  P.swingWebs.right.fallCatch=false;
  P.swingWebs.left.momentumCatch=false;
  P.swingWebs.right.momentumCatch=false;
  P.swingGroundPullT=0;
  P.swingGroundPullAnchor=null;
  P.swingGroundPullAnchors.left=null;
  P.swingGroundPullAnchors.right=null;
  P.activeSwingHand=null;
  if(wallSwing){
    P.wallRunFromSwing=false;
    P.wallRunMomentum=0;
    P.swingAssisted=false;
    P.swingPhase='release';
    P.cooldowns.swing=Math.max(P.cooldowns.swing,0.25);
    P.swingRequireRelease=true;
    return;
  }
  // Releasing is the skill gate: velocity is never replaced, but a short arc
  // released late in the ascent earns a small hop and tangential carry.
  P.state='air';
  if(assist.speedBonus>0 && flatSpeed>0.001){
    const boostedFlat=Math.min(SWING_RELEASE_MAX_SPEED,flatSpeed+assist.speedBonus);
    P.vel.x*=boostedFlat/flatSpeed;
    P.vel.z*=boostedFlat/flatSpeed;
  }
  P.vel.y+=assist.hop;
  P.swingAssisted=false;
  P.swingPhase='release';
  P.swingReleaseT=0.35;
  P.cooldowns.swing=Math.max(P.cooldowns.swing,0.25);
  P.swingRequireRelease=true;
}

function setSwingPhase(phase){
  if(P.swingPhase===phase) return;
  P.swingPhase=phase;
  P.swingPhaseT=0;
}

function limitHorizontalSpeed(maxSpeed){
  const flat = Math.hypot(P.vel.x, P.vel.z);
  if(flat > maxSpeed){
    const s = maxSpeed / flat;
    P.vel.x *= s;
    P.vel.z *= s;
  }
}

function clampPlayerVelocity(){
  // Upward travel shares the total speed envelope with horizontal motion.
  // A separate rise cap deleted momentum gained through the downswing and
  // changed the release direction even when total speed was already legal.
  P.vel.y = Math.max(P.vel.y, MAX_FALL_SPEED);
  if(P.state === 'swing') limitHorizontalSpeed(SWING_MAX_SPEED);
  else if(P.state !== 'zip') limitHorizontalSpeed(AIR_MAX_SPEED);
  if(P.state!=='zip' && P.vel.length()>MAX_TRAVERSAL_SPEED) P.vel.setLength(MAX_TRAVERSAL_SPEED);
}

function tryZip(){
  if(P.state==='downed' || P.state==='defeated') return false;
  const hit = zipCrosshairHit(ZIP_RANGE);
  if(!hit) return false;
  comboChainTarget=null;
  comboChainMode=null;
  zipEnemyTarget=enemyForObject(hit.object);
  if(!zipEnemyTarget && hit.point.y<P.pos.y+MIN_SWING_ANCHOR_RISE) return false;
  if(zipEnemyTarget){
    combatTarget=zipEnemyTarget;
    if(P.state==='ground'){
      P.pullPoseT=0.5;
      pullTarget=zipEnemyTarget;
      zipEnemyTarget=null;
      pulse('abSwingRight');
      return true;
    }
  }
  // A zip replaces the current strand. Leaving its hand occupied prevented
  // the next swing after an airborne zip or a cancelled zip.
  if(P.state==='swing' || (P.state==='climb' && P.wallRunFromSwing)){
    releaseSwing(null,false);
    P.traversalSwingStarted=false;
  }
  zipTarget = zipEnemyTarget
    ? zipEnemyTarget.mesh.position.clone().add(new THREE.Vector3(0,0.8,0))
    : hit.point.clone();
  zipDir = zipTarget.clone().sub(P.pos);
  if(zipDir.lengthSq()>0.001) zipDir.normalize();
  else camera.getWorldDirection(zipDir);
  P.state='zip';
  pulse('abSwingRight');
  return true;
}

function cancelZip(){
  if(P.state!=='zip') return;
  P.state='air';
  zipTarget=null;
  zipDir=null;
  zipEnemyTarget=null;
  P.cooldowns.zip=Math.min(P.cooldowns.zip,0.08);
}

function beginTraversalWallRun(normal,building,incoming){
  const entryVelocity=incoming.clone();
  const fromSwing=P.state==='swing' && !!P.activeSwingHand && !!P.swingWebs[P.activeSwingHand].anchor;
  if(P.state==='zip') cancelZip();
  if(!fromSwing){
    P.swingWebs.left.anchor=null;
    P.swingWebs.right.anchor=null;
    P.swingWebs.left.physicsPivot=null;
    P.swingWebs.right.physicsPivot=null;
    P.swingWebs.left.fallCatch=false;
    P.swingWebs.right.fallCatch=false;
    P.activeSwingHand=null;
  }
  zipTarget=null;
  zipDir=null;
  zipEnemyTarget=null;
  comboChainTarget=null;
  comboChainMode=null;

  const wallRight=new THREE.Vector3().crossVectors(normal,new THREE.Vector3(0,1,0)).normalize();
  const across=entryVelocity.dot(wallRight);
  const wallMotion=new THREE.Vector2(across,entryVelocity.y);
  // Preserve the direction along the facade, including vertical and descending
  // approaches. A head-on approach has no usable tangent: run upward instead
  // of inventing an arbitrary left/right turn.
  const tangentSpeed=wallMotion.length();
  if(tangentSpeed<3) wallMotion.set(0,1);
  else wallMotion.multiplyScalar(1/tangentSpeed);
  const entrySpeed=THREE.MathUtils.clamp(tangentSpeed,11,22);
  P.state='climb';
  P.gliding=false;
  P.climbNormal=normal.clone();
  P.climbBuilding=building;
  P.wallRunAutoT=4;
  P.wallRunDirection.copy(wallMotion);
  P.wallRunEntrySpeed=entrySpeed;
  P.wallRunFromSwing=fromSwing;
  P.swingGroundPullT=0;
  P.swingGroundPullAnchor=null;
  P.swingGroundPullAnchors.left=null;
  P.swingGroundPullAnchors.right=null;
  P.wallRunMomentum=fromSwing?Math.max(entryVelocity.length(),P.swingPeakFlat,entrySpeed):0;
  P.climbVisualAngle=-Math.atan2(wallMotion.x,Math.abs(wallMotion.y));
  P.vel.copy(wallRight).multiplyScalar(wallMotion.x*entrySpeed);
  P.vel.y=wallMotion.y*entrySpeed;
}

function resumeSwingFromWall(jumpBoost=false){
  const web=P.activeSwingHand?P.swingWebs[P.activeSwingHand]:null;
  if(!P.wallRunFromSwing || !web || !web.anchor) return false;
  const normal=P.climbNormal?P.climbNormal.clone():cameraForwardFlat().multiplyScalar(-1);
  const wallRight=new THREE.Vector3().crossVectors(normal,new THREE.Vector3(0,1,0)).normalize();
  const speed=THREE.MathUtils.clamp(Math.max(P.wallRunMomentum,P.wallRunEntrySpeed,14),14,SWING_MAX_SPEED);
  const travel=wallRight.multiplyScalar(P.wallRunDirection.x);
  travel.y=P.wallRunDirection.y;
  if(travel.lengthSq()<0.001) travel.copy(cameraForwardFlat());
  travel.normalize();
  P.vel.copy(travel).multiplyScalar(speed);
  if(jumpBoost){
    P.vel.addScaledVector(normal,4.5);
    P.vel.y=Math.max(P.vel.y,10);
    P.wallFlipT=0.65;
  }
  P.state='swing';
  P.swingPhase=P.vel.y<-1?'descent':(P.swingHasDescended?'ascent':'entry');
  P.swingPhaseT=0;
  P.swingLastVy=P.vel.y;
  P.swingPeakFlat=Math.max(P.swingPeakFlat,Math.hypot(P.vel.x,P.vel.z));
  P.wallDetachT=0.3;
  P.wallRunAutoT=0;
  P.wallRunFromSwing=false;
  P.wallRunMomentum=0;
  P.climbBuilding=null;
  P.climbNormal=null;
  return true;
}

function jumpFromWallEdge(right,direction,speed){
  P.pos.addScaledVector(P.climbNormal,0.45);
  if(resumeSwingFromWall(true)) return;
  P.state='air';
  P.vel.copy(right).multiplyScalar(direction.x*speed);
  P.vel.y=Math.max(9,direction.y*speed+5);
  P.vel.addScaledVector(P.climbNormal,5.5);
  P.wallFlipT=0.65;
  P.wallDetachT=0.3;
  P.wallRunAutoT=0;
  P.climbBuilding=null;
  P.climbNormal=null;
}

function tryWebshot(){
  if(P.state==='downed' || P.state==='defeated') return;
  P.webshotPoseT=0.34;
  fireWebshot();
  playSfx('web');
  pulse('abWebshot');
}

function tryPull(){
  if(P.state==='downed' || P.state==='defeated') return;
  const hit = crosshairHit(PULL_RANGE);
  if(!hit) return;
  const enemy=enemyForObject(hit.object);
  if(enemy){
    P.pullPoseT=0.5;
    comboChainTarget=null;
    comboChainMode=null;
    pullTarget = enemy;
    combatTarget = enemy;
    pulse('abPull');
  }
}

function tryMelee(){
  if(P.state==='downed' || P.state==='defeated') return;
  P.meleeT=0.34;
  P.meleeSide*=-1;
  const fwd = new THREE.Vector3(Math.sin(P.facing),0,Math.cos(P.facing));
  if(combatTarget && (!combatTarget.alive || combatTarget.mesh.position.distanceTo(P.pos)>14)) combatTarget=null;
  if(!combatTarget){
    let best=null;
    let bestD=Infinity;
    enemies.forEach(e=>{
      if(!e.alive) return;
      const to=new THREE.Vector3().subVectors(e.mesh.position,P.pos); to.y=0;
      const d=to.length();
      if(d<MELEE_RANGE && d<bestD && to.normalize().dot(fwd)>0.35){ best=e; bestD=d; }
    });
    combatTarget=best;
  }
  if(combatTarget){
    const e=combatTarget;
    const to = new THREE.Vector3().subVectors(e.mesh.position, P.pos); to.y=0;
    const d = to.length();
    if(d<MELEE_RANGE){
      const attackDir=to.lengthSq()>0.001 ? to.normalize() : fwd;
      P.facing=Math.atan2(attackDir.x,attackDir.z);
      damageEnemy(e, 18, true);
      e.vel.addScaledVector(attackDir,9);
    }
  }
  pulse('abMelee');
}

function damageEnemy(e, amount, fromMelee=false){
  amount*=1+progress.damage*0.12;
  playSfx('hit');
  if(fromMelee){hitStopT=Math.max(hitStopT,.045);cameraShakeT=Math.max(cameraShakeT,.11);}
  e.hp -= amount;
  setEnemyFlash(e,true);
  setTimeout(()=>{ if(e.alive) setEnemyFlash(e,false); },80);
  if(e.hp<=0 && e.alive){
    e.alive=false;
    progress.kills++;saveProgress();updateMissionUI();updateShopUI();
    addCash(5,'ENEMY STOPPED');
    e.mesh.visible=false;
    e.hpEl.style.display='none';
    if(combatTarget===e) combatTarget=null;
  }
}

function beginComboChain(defeated){
  let best=null;
  let bestD=Infinity;
  enemies.forEach(e=>{
    if(!e.alive) return;
    const dPlayer=e.mesh.position.distanceTo(P.pos);
    const dOrigin=e.mesh.position.distanceTo(defeated.mesh.position);
    if(dPlayer<13 && dOrigin<16 && dPlayer<bestD){ best=e; bestD=dPlayer; }
  });
  if(!best) return;
  combatTarget=best;
  comboChainTarget=best;
  best.stunT=Math.max(best.stunT,0.8);
  const toEnemy=best.mesh.position.clone().sub(P.pos);
  toEnemy.y=0;
  if(toEnemy.lengthSq()>0.01){
    P.facing=Math.atan2(toEnemy.x,toEnemy.z);
    yaw=P.facing;
  }
  if(bestD>5){
    comboChainMode='zip';
    zipEnemyTarget=best;
    zipTarget=best.mesh.position.clone().add(new THREE.Vector3(0,0.8,0));
    zipDir=zipTarget.clone().sub(P.pos).normalize();
    P.state='zip';
  } else {
    comboChainMode='pull';
    pullTarget=best;
  }
}

function finishComboChain(e){
  if(!e || !e.alive) return;
  comboChainTarget=null;
  comboChainMode=null;
  combatTarget=e;
  const toEnemy=e.mesh.position.clone().sub(P.pos);
  toEnemy.y=0;
  const attackDir=toEnemy.lengthSq()>0.001?toEnemy.normalize():cameraForwardFlat();
  P.facing=Math.atan2(attackDir.x,attackDir.z);
  P.meleeT=0.34;
  P.meleeSide*=-1;
  e.stunT=Math.max(e.stunT,0.7);
  damageEnemy(e,18,true);
  e.vel.addScaledVector(attackDir,7);
}

function flashDamage(){
  document.getElementById('healthBarInner').style.filter='brightness(2)';
  setTimeout(()=>document.getElementById('healthBarInner').style.filter='',120);
}

function damagePlayer(amount, grace=0.65, ignoreInvuln=false){
  if((P.invuln>0 && !ignoreInvuln) || P.state==='downed' || P.state==='defeated') return false;
  P.hp = Math.max(0, P.hp-amount);
  P.lastDamageT=4;
  P.invuln = grace;
  playSfx('hurt');
  flashDamage();
  if(P.hp<=0){
    P.state='defeated';
    P.defeatedT=3;
    P.gliding=false;
    P.pendingFallDamage=0;
    P.recoveryT=0;
    P.swingWebs.left.anchor=null;
    P.swingWebs.right.anchor=null;
    P.swingWebs.left.physicsPivot=null;
    P.swingWebs.right.physicsPivot=null;
    P.swingWebs.left.fallCatch=false;
    P.swingWebs.right.fallCatch=false;
    P.swingGroundPullT=0;
    P.swingGroundPullAnchor=null;
    P.swingGroundPullAnchors.left=null;
    P.swingGroundPullAnchors.right=null;
    P.activeSwingHand=null;
    P.vel.set(0,0,0);
    combatTarget=null;
    pullTarget=null;
    zipTarget=null;
    zipDir=null;
    zipEnemyTarget=null;
    flashMsg('DEFEATED');
    showDeathScreen();
  }
  return true;
}

function playerInCombat(){
  if(P.invuln>0 || P.pendingFallDamage>0 || P.state==='downed' || P.state==='defeated' || P.hp<=0) return true;
  return enemies.some(e=>{
    if(!e.alive) return false;
    const dist = e.mesh.position.distanceTo(P.pos);
    return dist < ALERT_RADIUS * 1.4 && (e.state==='alert' || e.state==='chasing' || e.state==='attacking');
  });
}

function pulse(id){
  const el = document.getElementById(id);
  el.style.transform='scale(1.12)';
  setTimeout(()=>el.style.transform='scale(1)',100);
}

function blendPart(part, base, rot, posOffset, amt){
  part.rotation.x = THREE.MathUtils.lerp(part.rotation.x, base.rot.x + (rot.x||0), amt);
  part.rotation.y = THREE.MathUtils.lerp(part.rotation.y, base.rot.y + (rot.y||0), amt);
  part.rotation.z = THREE.MathUtils.lerp(part.rotation.z, base.rot.z + (rot.z||0), amt);
  part.position.x = THREE.MathUtils.lerp(part.position.x, base.pos.x + (posOffset.x||0), amt);
  part.position.y = THREE.MathUtils.lerp(part.position.y, base.pos.y + (posOffset.y||0), amt);
  part.position.z = THREE.MathUtils.lerp(part.position.z, base.pos.z + (posOffset.z||0), amt);
}

// Every player state supplies a complete target pose to the same R15 joints.
// Root motion remains owned by physics; this only changes the visible rig.
function animatePlayer(dt, moveVec){
  const clamp=THREE.MathUtils.clamp;
  const flatSpeed=Math.hypot(P.vel.x,P.vel.z);
  const speed=P.vel.length();
  const onWall=P.state==='climb';
  const wallRun=onWall && (running || P.wallRunAutoT>0);
  const moving=P.state==='ground' ? flatSpeed>0.8 : onWall ? speed>0.2 : false;
  const gaitSpeed=onWall?speed:flatSpeed;
  animClock+=dt*(moving?clamp(gaitSpeed*0.82,4.2,15):0.8);
  const step=Math.sin(animClock), otherStep=-step;
  const blend=1-Math.exp(-13*dt);
  const pose={torso:{x:0,y:0,z:0},head:{x:0,y:0,z:0},
    leftArm:{x:0,y:0,z:-0.08},rightArm:{x:0,y:0,z:0.08},
    leftLeg:{x:0,y:0,z:0},rightLeg:{x:0,y:0,z:0},
    leftElbow:0.18,rightElbow:0.18,leftKnee:0.08,rightKnee:0.08,
    rootY:0,rootZ:0,rootPitch:0,rootRoll:0};
  const velRight=P.vel.x*Math.cos(P.facing)-P.vel.z*Math.sin(P.facing);
  const lateral=clamp(velRight/28,-1,1);
  const diagonalStrafe=moveVec.lengthSq()>0.04
    ? clamp((moveVec.x*Math.cos(P.facing)-moveVec.z*Math.sin(P.facing)),-1,1)
    : 0;
  const vertical=clamp(P.vel.y/24,-1,1);
  const sway=Math.sin(animClock*1.7);
  if(P.state==='ground'){
    if(P.recoveryRollT>0){
      const progress=1-P.recoveryRollT/QUICK_RECOVERY_ROLL_TIME;
      pose.rootPitch=-progress*Math.PI*2;
      pose.torso.x=0.3;pose.rootY=-0.23;
      pose.leftArm.x=pose.rightArm.x=-0.8;
      pose.leftLeg.x=pose.rightLeg.x=0.8;
      pose.leftKnee=pose.rightKnee=0.85;
    }else if(P.jumpCharging){
      const charge=clamp(P.jumpChargeT/MAX_JUMP_CHARGE,0,1);
      pose.rootY=-0.12-charge*0.22;
      pose.torso.x=0.13+charge*0.14;
      pose.leftArm.x=pose.rightArm.x=-0.35-charge*0.2;
      pose.leftArm.z=-0.24;pose.rightArm.z=0.24;
      pose.leftLeg.x=pose.rightLeg.x=0.32+charge*0.22;
      pose.leftKnee=pose.rightKnee=0.48+charge*0.4;
    }else if(P.landPoseT>0){
      const impact=clamp(P.landPoseT/0.22,0,1);
      pose.rootY=-0.22*impact;pose.torso.x=0.27*impact;
      pose.leftArm.x=-0.48*impact;pose.rightArm.x=-0.38*impact;
      pose.leftLeg.x=pose.rightLeg.x=0.42*impact;
      pose.leftKnee=pose.rightKnee=0.7*impact;
    }else if(moving){
      const sprint=running?1:0;
      const stride=(0.48+sprint*0.36)*clamp(flatSpeed/(running?12:7),0.55,1.12);
      pose.rootY=Math.abs(step)*(0.025+sprint*0.045);
      pose.torso.x=-0.05-sprint*0.16;
      pose.torso.y=step*(0.025+sprint*0.07);
      pose.torso.z=step*(0.025+sprint*0.055)-lateral*0.08;
      pose.head.y=-pose.torso.y*0.4;
      pose.leftArm.x=step*stride*0.72;
      pose.rightArm.x=otherStep*stride*0.72;
      pose.leftElbow=0.38+sprint*0.18;
      pose.rightElbow=pose.leftElbow;
      pose.leftLeg.x=otherStep*stride;
      pose.rightLeg.x=step*stride;
      pose.leftKnee=0.1+Math.max(0,step)*0.55;
      pose.rightKnee=0.1+Math.max(0,otherStep)*0.55;
      pose.rootRoll=-lateral*0.08-diagonalStrafe*0.09;
      pose.torso.y+=diagonalStrafe*0.11;
      pose.head.y-=diagonalStrafe*0.055;
    }else{
      pose.rootY=sway*0.012;
      pose.leftArm.x=pose.rightArm.x=-0.03+sway*0.012;
      pose.head.x=-sway*0.012;
    }
  }else if(P.state==='swing'){
    const entry=P.swingPhase==='entry';
    const fast=clamp((speed-8)/38,0,1);
    const pull=P.swingGroundPullT>0;
    pose.rootPitch=-0.08-fast*0.23-vertical*0.2;
    pose.rootRoll=clamp(-lateral*0.28,-0.28,0.28);
    pose.torso.x=-0.1-vertical*0.18;
    pose.torso.z=-lateral*0.28;
    pose.head.x=0.1+vertical*0.08;
    pose.leftArm.x=P.swingWebs.left.anchor||pull?-1.05:-0.2;
    pose.rightArm.x=P.swingWebs.right.anchor||pull?-1.05:-0.2;
    pose.leftArm.z=P.swingWebs.left.anchor||pull?-0.8:-0.32;
    pose.rightArm.z=P.swingWebs.right.anchor||pull?0.8:0.32;
    pose.leftElbow=P.swingWebs.left.anchor||pull?0.1:0.72;
    pose.rightElbow=P.swingWebs.right.anchor||pull?0.1:0.72;
    // A long, asymmetric trail reads as velocity; climbing the arc folds the knees.
    const tuck=clamp((vertical+0.15)*0.75,0,0.8);
    pose.leftLeg.x=(entry?0.58:0.38)+fast*0.18+tuck*0.3;
    pose.rightLeg.x=(entry?-0.18:-0.32)+fast*0.12+tuck*0.16;
    pose.leftLeg.z=-0.25-lateral*0.12;
    pose.rightLeg.z=0.19-lateral*0.12;
    pose.leftKnee=0.58+tuck*0.34;
    pose.rightKnee=0.2+tuck*0.24;
    pose.torso.y=P.activeSwingHand==='left'?-0.1:0.1;
  }else if(P.state==='air'){
    if(P.diving){
      pose.rootPitch=1.13;pose.rootRoll=-lateral*0.12;
      pose.torso.x=-0.16;pose.head.x=0.19;
      pose.leftArm.x=pose.rightArm.x=0.72;
      pose.leftArm.z=-0.18;pose.rightArm.z=0.18;
      pose.leftElbow=pose.rightElbow=0.12;
      pose.leftLeg.x=-0.1;pose.rightLeg.x=0.08;
      pose.leftKnee=pose.rightKnee=0.07;
    }else if(P.gliding){
      pose.rootPitch=Math.PI/2+P.glidePitch*0.48;
      pose.rootRoll=-P.glideBank*0.6;
      pose.torso.x=-0.08;pose.head.x=0.13;
      pose.leftArm.x=pose.rightArm.x=0.27;
      pose.leftArm.z=-0.5;pose.rightArm.z=0.5;
      pose.leftElbow=pose.rightElbow=0.2;
      pose.leftLeg.x=-0.08;pose.rightLeg.x=0.08;
      pose.leftLeg.z=-0.25;pose.rightLeg.z=0.25;
    }else if(P.swingReleaseT>0){
      const fade=clamp(P.swingReleaseT/0.35,0,1);
      const left=P.swingReleaseHand==='left';
      pose.rootPitch=-0.17-vertical*0.18;
      pose.rootRoll=-lateral*0.17;
      pose.torso.x=-0.15;pose.torso.y=left?-0.12:0.12;
      pose.leftArm.x=left?-1.2*fade:-0.2;
      pose.rightArm.x=left?-0.2:-1.2*fade;
      pose.leftArm.z=left?-0.65:-0.27;
      pose.rightArm.z=left?0.27:0.65;
      pose.leftElbow=left?0.16:0.55;
      pose.rightElbow=left?0.55:0.16;
      pose.leftLeg.x=0.22+vertical*0.13;
      pose.rightLeg.x=-0.12;
      pose.leftKnee=0.34;pose.rightKnee=0.18;
    }else if(P.vel.y>1.5 || P.jumpPoseT>0){
      const rise=clamp(P.vel.y/20,0,1);
      pose.rootPitch=-0.16-rise*0.1;
      pose.torso.x=-0.12;pose.head.x=0.07;
      pose.leftArm.x=-0.25-rise*0.18;
      pose.rightArm.x=-0.12-rise*0.12;
      pose.leftArm.z=-0.38;pose.rightArm.z=0.34;
      pose.leftElbow=0.35;pose.rightElbow=0.42;
      pose.leftLeg.x=0.45;pose.rightLeg.x=-0.04;
      pose.leftKnee=0.72;pose.rightKnee=0.23;
    }else{
      const fall=clamp(-P.vel.y/28,0,1);
      const clearance=P.pos.y-heightAt(P.pos.x,P.pos.z,P.pos.y+2);
      const prepare=clamp((9-clearance)/7,0,1)*fall;
      pose.rootPitch=fall*0.18;pose.rootRoll=-lateral*0.12;
      pose.torso.x=-0.1;pose.head.x=0.13;
      pose.leftArm.x=0.18+fall*0.18;
      pose.rightArm.x=0.12+fall*0.22;
      pose.leftArm.z=-0.24;pose.rightArm.z=0.24;
      pose.leftElbow=0.48+fall*0.18;
      pose.rightElbow=0.48+fall*0.18;
      pose.leftLeg.x=0.05+prepare*0.32;
      pose.rightLeg.x=-0.1+prepare*0.28;
      pose.leftKnee=0.16+prepare*0.72;
      pose.rightKnee=0.2+prepare*0.65;
    }
  }else if(P.state==='zip'){
    pose.rootPitch=-0.33;pose.rootRoll=-lateral*0.11;
    pose.torso.x=-0.18;pose.head.x=0.12;
    pose.leftArm.x=pose.rightArm.x=-1.1;
    pose.leftArm.z=-0.28;pose.rightArm.z=0.28;
    pose.leftElbow=pose.rightElbow=0.28;
    pose.leftLeg.x=0.25;pose.rightLeg.x=-0.05;
    pose.leftKnee=0.48;pose.rightKnee=0.32;
  }else if(onWall){
    const verticalRun=wallRun && Math.abs(P.wallRunDirection.y)>=Math.abs(P.wallRunDirection.x)*0.72;
    // Wall orientation is handled by a full body quaternion in the movement
    // state; do not apply a second pitch/roll or the limbs appear inside-out.
    pose.rootRoll=0;
    pose.rootPitch=0;
    pose.rootZ=0;
    if(wallRun && moving){
      const stride=verticalRun?0.78:0.68;
      const cycle=step*(verticalRun?(Math.sign(P.wallRunDirection.y)||1):1);
      pose.torso.x=-0.16;
      pose.torso.y=cycle*0.045;
      pose.head.x=0.1;
      pose.leftArm.x=cycle*stride*0.65;
      pose.rightArm.x=-cycle*stride*0.65;
      pose.leftElbow=pose.rightElbow=0.52;
      pose.leftLeg.x=-cycle*stride;
      pose.rightLeg.x=cycle*stride;
      pose.leftKnee=0.2+Math.max(0,-cycle)*0.58;
      pose.rightKnee=0.2+Math.max(0,cycle)*0.58;
    }else if(moving){
      pose.torso.x=-0.1;
      pose.leftArm.x=-1.13+step*0.34;
      pose.rightArm.x=-1.13-step*0.34;
      pose.leftArm.z=-0.42;pose.rightArm.z=0.42;
      pose.leftElbow=pose.rightElbow=0.42;
      pose.leftLeg.x=-0.58-step*0.29;
      pose.rightLeg.x=-0.58+step*0.29;
      pose.leftLeg.z=-0.25;pose.rightLeg.z=0.25;
      pose.leftKnee=0.4+Math.max(0,-step)*0.27;
      pose.rightKnee=0.4+Math.max(0,step)*0.27;
    }else{
      pose.rootY=-0.05+sway*0.01;
      pose.torso.x=-0.1;
      pose.leftArm.x=-1.36;pose.rightArm.x=-1.3;
      pose.leftArm.z=-0.25;pose.rightArm.z=0.25;
      pose.leftElbow=pose.rightElbow=0.55;
      pose.leftLeg.x=0.48;pose.rightLeg.x=0.55;
      pose.leftKnee=pose.rightKnee=0.68;
    }
  }else if(P.state==='downed' || P.state==='defeated'){
    pose.rootY=-0.22;
    pose.torso.x=0.32;pose.torso.z=P.state==='defeated'?-1.4:0;
    pose.leftArm.x=pose.rightArm.x=-0.75;
    pose.leftLeg.x=pose.rightLeg.x=0.9;
    pose.leftKnee=pose.rightKnee=0.72;
  }
  if(P.wallFlipT>0)pose.rootPitch=-(1-P.wallFlipT/0.65)*Math.PI*2;
  if(P.meleeT>0 && P.state!=='downed' && P.state!=='defeated'){
    const hit=Math.sin(clamp(1-P.meleeT/0.34,0,1)*Math.PI);
    const right=P.meleeSide>0;
    pose[right?'rightArm':'leftArm'].x=-0.95-hit*0.65;
    pose[right?'leftArm':'rightArm'].x=-0.72;
    pose[right?'rightElbow':'leftElbow']=0.95-hit*0.62;
    pose.torso.y=(right?-1:1)*hit*0.22;
  }
  if(P.webshotPoseT>0 && P.state!=='downed' && P.state!=='defeated'){
    const shot=Math.sin(clamp(1-P.webshotPoseT/0.34,0,1)*Math.PI);
    pose.rightArm.x=-1.3-shot*0.32;pose.rightElbow=0.14;
    pose.leftArm.x=-0.42;pose.torso.y=-0.16*shot;
  }
  if(P.pullPoseT>0 && P.state!=='downed' && P.state!=='defeated'){
    const pull=Math.sin(clamp(1-P.pullPoseT/0.5,0,1)*Math.PI);
    pose.leftArm.x=pose.rightArm.x=-1.48+pull*0.55;
    pose.leftElbow=pose.rightElbow=0.75;
    pose.torso.x=0.18*pull;
  }
  if(P.blocking){
    pose.leftArm.x=pose.rightArm.x=-0.82;
    pose.leftArm.z=-0.18;pose.rightArm.z=0.18;
    pose.leftElbow=pose.rightElbow=1.35;
  }
  // Smooth the root and each joint toward one complete pose. The web shoulder
  // is then aimed at the anchor; the strand starts at that animated hand.
  playerRig.position.z=THREE.MathUtils.lerp(playerRig.position.z,pose.rootZ,blend);
  playerRig.rotation.x=THREE.MathUtils.lerp(playerRig.rotation.x,pose.rootPitch,blend);
  const rollDelta=Math.atan2(Math.sin(pose.rootRoll-playerRig.rotation.z),Math.cos(pose.rootRoll-playerRig.rotation.z));
  playerRig.rotation.z+=rollDelta*blend;
  const zero={x:0,y:0,z:0};
  blendPart(torso,basePose.torso,pose.torso,{x:0,y:pose.rootY,z:0},blend);
  blendPart(head,basePose.head,pose.head,zero,blend);
  blendPart(armL,basePose.armL,pose.leftArm,zero,blend);
  blendPart(armR,basePose.armR,pose.rightArm,zero,blend);
  blendPart(legL,basePose.legL,pose.leftLeg,zero,blend);
  blendPart(legR,basePose.legR,pose.rightLeg,zero,blend);
  if(!r15Ready)return;
  if(tickR15Clips(dt,moveVec,flatSpeed)){
    // Advanced traversal effects and combat remain procedural overlays so
    // swinging attaches to the correct hand and combat still responds instantly.
    const upperBodyOverride=P.meleeT>0||P.webshotPoseT>0||P.pullPoseT>0||P.blocking;
    if(upperBodyOverride){
      applyR15Bone('UpperTorso',{x:-pose.torso.x,y:pose.torso.y,z:pose.torso.z},blend);
      for(const hand of ['left','right']){
        applyR15VisualBone(r15VisualBone[hand+'UpperArm'],pose[hand+'Arm'],blend);
        applyR15VisualBone(r15VisualBone[hand+'LowerArm'],{x:-pose[hand+'Elbow'],y:0,z:0},blend);
      }
    }
    if(P.state==='swing'){
      aimR15SwingArm('left',dt);
      aimR15SwingArm('right',dt);
    }
    return;
  }
  applyR15Bone('UpperTorso',{x:-pose.torso.x,y:pose.torso.y,z:pose.torso.z},blend);
  applyR15Bone('Head',{x:-pose.head.x,y:pose.head.y,z:pose.head.z},blend);
  for(const hand of ['left','right']){
    if(P.state!=='swing' || !P.swingWebs[hand].anchor)
      applyR15VisualBone(r15VisualBone[hand+'UpperArm'],pose[hand+'Arm'],blend);
    applyR15VisualBone(r15VisualBone[hand+'LowerArm'],{x:-pose[hand+'Elbow'],y:0,z:0},blend);
    applyR15VisualBone(r15VisualBone[hand+'Hand'],{x:0,y:0,z:0},blend);
    applyR15VisualBone(r15VisualBone[hand+'UpperLeg'],pose[hand+'Leg'],blend);
    applyR15VisualBone(r15VisualBone[hand+'LowerLeg'],{x:pose[hand+'Knee'],y:0,z:0},blend);
    applyR15VisualBone(r15VisualBone[hand+'Foot'],{x:-pose[hand+'Knee']*0.33,y:0,z:0},blend);
  }
  if(P.state==='swing'){
    aimR15SwingArm('left',dt);
    aimR15SwingArm('right',dt);
  }
}

// ---------------------------------------------------------------------------------------
// MAIN UPDATE LOOP
// ---------------------------------------------------------------------------------------
let lastTraversal=false,lastZip=false,lastPull=false,lastJump=false,lastDive=false,lastMelee=false,lastWebshot=false,lastBlock=false;
const WALK_SPEED = 6.5;

function launchChargedJump(){
  const charge=THREE.MathUtils.clamp(P.jumpChargeT/MAX_JUMP_CHARGE,0,1);
  const jumpingFromWall=P.state==='climb';
  const wallNormal=jumpingFromWall&&P.climbNormal?P.climbNormal.clone():null;
  if(jumpingFromWall){
    // A jump leaves the wall independently of its old strand. Clear the
    // occupied hand before changing state so held Swing can catch again.
    if(P.wallRunFromSwing) releaseSwing(null,false);
    P.traversalSwingStarted=false;
    P.wallRunAutoT=0;
  }
  P.vel.y=Math.max(P.vel.y,JUMP_SPEED+charge*CHARGED_JUMP_BONUS)*(jumpingFromWall?0.9:1);
  playSfx('jump');
  if(wallNormal){
    P.vel.addScaledVector(wallNormal,8+charge*3);
    P.pos.addScaledVector(wallNormal,0.45);
    P.wallFlipT=0.65;
    P.wallDetachT=0.3;
  }
  P.climbNormal=null;
  P.climbBuilding=null;
  P.wallRunFromSwing=false;
  P.state='air';
  P.gliding=false;
  P.jumpPoseT=0.36;
  P.peakY=P.pos.y;
  if(charge>0.45) flashMsg('CHARGED JUMP');
  P.jumpChargeT=0;
  P.jumpCharging=false;
}

function jumpOutOfSwing(){
  const direction=P.vel.clone();
  if(direction.lengthSq()<1) direction.copy(cameraForwardFlat());
  direction.normalize();
  const carriedSpeed=Math.max(12,P.vel.length());
  releaseSwing(null,false);
  P.vel.addScaledVector(direction,Math.min(9,3+carriedSpeed*0.12));
  P.swingReleaseT=0.42;
  P.jumpPoseT=0.34;
  P.swingHistoryT=1;
}

function beginQuickRecovery(){
  P.recoveryRollT=QUICK_RECOVERY_ROLL_TIME;
  P.recoveryLaunchPending=true;
  P.quickRecoveryT=0;
  P.landPoseT=0;
  flashMsg('QUICK RECOVERY');
}

function clearHeldInputs(){
  Object.keys(keys).forEach(code=>{ keys[code] = false; });
  mouseDown[0] = false;
  mouseDown[2] = false;
  lastTraversal = false;
  lastZip = false;
  lastPull = false;
  lastJump = false;
  lastDive = false;
  lastMelee = false;
  lastWebshot = false;
  lastBlock = false;
  P.blocking = false;
  P.parryT=0;
  P.traversalHoldT=0;
  P.traversalSwingStarted=false;
  P.traversalSearchAttempted=false;
  P.jumpCharging=false;
  P.diving=false;
  if(P.state === 'swing' || (P.state==='climb' && P.wallRunFromSwing)) releaseSwing(null,false);
  if(P.state === 'zip') cancelZip();
}
window.addEventListener('blur', clearHeldInputs);
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden) clearHeldInputs();
});

// Bound physics steps independently of display refresh. Input edges are consumed
// by the first step; the expensive rig pose is updated only once per render.
function updatePlayer(dt){
  const elapsed=Math.min(Math.max(dt,0),0.05);
  if(!elapsed || paused) return;
  const steps=Math.ceil(elapsed/(1/120));
  const step=elapsed/steps;
  for(let i=0;i<steps;i++) stepPlayer(step,i===steps-1?elapsed:0);
}

function stepPlayer(dt,visualDt=dt){
  if(paused) return;

  // The ocean surface has no collision. Crossing the low fence is allowed;
  // falling far below it uses the normal defeat/respawn flow.
  if(P.state!=='defeated' && !isOverIsland(P.pos.x,P.pos.z) && P.pos.y<OCEAN_FLOOR-8){
    damagePlayer(P.maxHp,0,true);
    return;
  }

  const keyboardLookSpeed=1.85*dt;
  if(keys.ArrowLeft)yaw+=keyboardLookSpeed;
  if(keys.ArrowRight)yaw-=keyboardLookSpeed;
  if(keys.ArrowUp)pitch+=keyboardLookSpeed;
  if(keys.ArrowDown)pitch-=keyboardLookSpeed;
  pitch=THREE.MathUtils.clamp(pitch,-1.52,1.52);

  // cooldown timers
  for(const k in P.cooldowns) P.cooldowns[k]=Math.max(0,P.cooldowns[k]-dt);
  P.swingWebs.left.retry=Math.max(0,P.swingWebs.left.retry-dt);
  P.swingWebs.right.retry=Math.max(0,P.swingWebs.right.retry-dt);
  P.swingReleaseT=Math.max(0,P.swingReleaseT-dt);
  P.wingCooldown=Math.max(0,P.wingCooldown-dt);
  const wallFlipWasActive=P.wallFlipT>0;
  P.wallFlipT=Math.max(0,P.wallFlipT-dt);
  // A completed backflip is the same orientation as zero. Reset the Euler value
  // at that exact moment so interpolation cannot visibly unwind it as a front flip.
  if(wallFlipWasActive && P.wallFlipT===0) playerRig.rotation.x=0;
  P.wallDetachT=Math.max(0,P.wallDetachT-dt);
  P.wallRunAutoT=Math.max(0,P.wallRunAutoT-dt);
  P.meleeT=Math.max(0,P.meleeT-dt);
  P.jumpPoseT=Math.max(0,P.jumpPoseT-dt);
  P.webshotPoseT=Math.max(0,P.webshotPoseT-dt);
  P.pullPoseT=Math.max(0,P.pullPoseT-dt);
  P.landPoseT=Math.max(0,P.landPoseT-dt);
  P.invuln = Math.max(0, P.invuln-dt);
  P.parryT=Math.max(0,P.parryT-dt);
  P.lastDamageT=Math.max(0,P.lastDamageT-dt);
  if(P.lastDamageT===0&&P.hp>0&&P.hp<P.maxHp) P.hp=Math.min(P.maxHp,P.hp+7*dt);
  P.swingHistoryT=Math.max(0,P.swingHistoryT-dt);
  P.quickRecoveryT=Math.max(0,P.quickRecoveryT-dt);
  const rollWasActive=P.recoveryRollT>0;
  P.recoveryRollT=Math.max(0,P.recoveryRollT-dt);
  if(rollWasActive && P.recoveryRollT===0 && P.recoveryLaunchPending){
    const recoveryFlat=new THREE.Vector3(P.recoveryVelocity.x,0,P.recoveryVelocity.z);
    if(recoveryFlat.lengthSq()<4) recoveryFlat.copy(cameraForwardFlat()).multiplyScalar(13);
    else if(recoveryFlat.length()<13) recoveryFlat.setLength(13);
    P.vel.x=recoveryFlat.x;
    P.vel.z=recoveryFlat.z;
    P.vel.y=18;
    P.pos.y+=0.08;
    P.state='air';
    P.jumpPoseT=0.42;
    P.peakY=P.pos.y;
    P.recoveryLaunchPending=false;
  }

  // Swing is strictly single-hand, including after interrupted input frames.
  if(P.swingWebs.left.anchor && P.swingWebs.right.anchor){
    const keep=P.activeSwingHand || 'left';
    const discard=keep==='left'?'right':'left';
    P.swingWebs[discard].anchor=null;
    P.swingWebs[discard].physicsPivot=null;
    P.swingWebs[discard].fallCatch=false;
    P.swingWebs[discard].auto=false;
  }
  if(P.activeSwingHand && !P.swingWebs[P.activeSwingHand].anchor) P.activeSwingHand=null;

  // input edge detection
  const traversalDown = !!keys[bindings.traversal];
  const zipDown = !!keys[bindings.zip];
  const pullDown = !!keys[bindings.pull];
  const webshotDown = keys[bindings.webshot];
  const jumpDown = keys[bindings.jump];
  const diveDown = !!keys[bindings.dive];
  const meleeDown = mouseDown[0] || !!keys[bindings.melee];
  const blockDown=!!keys[bindings.block];
  if(blockDown&&!lastBlock&&P.cooldowns.parry<=0&&P.state!=='downed'&&P.state!=='defeated'){
    P.parryT=0.24;
    P.cooldowns.parry=0.72;
    pulse('abBlock');
  }
  P.blocking=P.parryT>0;

  if(traversalDown&&!lastTraversal){
    P.traversalSearchAttempted=true;
    P.traversalSwingStarted=trySmartSwing();
    P.swingWebs.left.retry=P.swingWebs.right.retry=0.1;
  }
  if(traversalDown){
    // A quick re-press during cooldown or just outside anchor range stays queued.
    // Retry at 10 Hz rather than raycasting the city every simulation step.
    if(!P.traversalSwingStarted && P.cooldowns.swing<=0 &&
       P.swingWebs.left.retry<=0 && P.swingWebs.right.retry<=0 &&
       (P.state==='air' || P.state==='ground')){
      P.traversalSwingStarted=trySmartSwing();
      P.swingWebs.left.retry=P.swingWebs.right.retry=0.1;
    }
    P.traversalHoldT+=dt;
  }
  if(!traversalDown&&lastTraversal){
    if(P.traversalSwingStarted || P.state==='swing' || (P.state==='climb'&&P.wallRunFromSwing)){
      P.swingHistoryT=1;
      releaseSwing(null);
    }
    P.traversalHoldT=0;
    P.traversalSwingStarted=false;
    P.traversalSearchAttempted=false;
  }
  if(!combinedTraversal && zipDown&&!lastZip&&P.cooldowns.zip<=0&&P.state!=='zip'){
    if(tryZip())P.cooldowns.zip=.15;
  }
  if(pullDown&&!lastPull&&P.cooldowns.pull<=0){tryPull();P.cooldowns.pull=.45;}
  if(webshotDown && !lastWebshot && P.cooldowns.webshot<=0){ tryWebshot(); P.cooldowns.webshot=0.5; }
  if(meleeDown && !lastMelee && P.cooldowns.melee<=0 && P.state!=='swing'){ tryMelee(); P.cooldowns.melee=0.45; }
  if(jumpDown && !lastJump){
    if(P.state==='swing'){
      jumpOutOfSwing();
    } else if(P.quickRecoveryT>0 && P.state==='ground'){
      beginQuickRecovery();
    } else if(P.state==='zip'){
      const zipMomentum=P.vel.clone();
      cancelZip();
      P.vel.copy(zipMomentum);
      P.vel.y=Math.max(P.vel.y,4.5);
    } else if(P.state==='ground'||P.state==='climb'){
      P.jumpCharging=true;
      P.jumpChargeT=0;
    } else if(P.state==='air'){
      // Wings may be closed at any time, but only opened when the player is high
      // enough above the next surface for an unprotected landing to cause damage.
      const wingGround=heightAt(P.pos.x,P.pos.z,P.pos.y+0.15);
      const canOpenWings=P.pos.y-wingGround>WING_MIN_CLEARANCE;
      if(P.gliding){
        P.gliding=false;
        P.wingCooldown=5;
      } else if(canOpenWings && P.wingCooldown<=0){
        P.gliding=true;
        if(P.vel.y<0) P.vel.y = Math.max(P.vel.y, -8);
      }
    }
  }
  if(P.jumpCharging && jumpDown) P.jumpChargeT=Math.min(MAX_JUMP_CHARGE,P.jumpChargeT+dt);
  if(P.jumpCharging && !jumpDown && lastJump) launchChargedJump();
  P.diving=diveDown && P.state==='air';
  if(P.diving){
    P.gliding=false;
    const diveForward=Math.hypot(P.vel.x,P.vel.z)>1
      ? new THREE.Vector3(P.vel.x,0,P.vel.z).normalize()
      : cameraForwardFlat();
    P.vel.addScaledVector(diveForward,DIVE_FORWARD_ACCEL*dt);
    P.vel.y-=DIVE_DOWN_ACCEL*dt;
  }

  lastTraversal=traversalDown;lastZip=zipDown;lastPull=pullDown;lastWebshot=webshotDown;
  lastJump=jumpDown;lastDive=diveDown;lastMelee=meleeDown;lastBlock=blockDown;

  // movement input vector (camera relative)
  const mv = new THREE.Vector3(
    (keys[bindings.left]?1:0)-(keys[bindings.right]?1:0), 0,
    (keys[bindings.forward]?1:0)-(keys[bindings.back]?1:0)
  );
  if(mv.lengthSq()>0) mv.normalize();
  mv.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
  const moveSpeed = (running?RUN_SPEED:WALK_SPEED) * (P.blocking?0.5:1);

  const facingLocked=shiftLocked || firstPersonAutoLock || cameraDistance<=0.6;
  if(facingLocked){
    P.facing=yaw;
  } else if(mv.lengthSq()>0.01 && (P.state==='ground'||P.state==='air') && !P.gliding){
    const targetFacing=Math.atan2(mv.x,mv.z);
    const turnDelta=Math.atan2(Math.sin(targetFacing-P.facing),Math.cos(targetFacing-P.facing));
    P.facing+=turnDelta*(1-Math.exp(-8.5*dt));
  }
  // Smooth only the character rotation; yaw and the camera remain input-driven.
  // In shift-lock, P.facing stays aligned with the aim/camera, but the visible
  // body can face a diagonal WASD direction. This is an animation choice only.
  const visualFacing=P.state==='ground' && mv.lengthSq()>0.01
    ? Math.atan2(mv.x,mv.z) : P.facing;
  if(P.state!=='climb'){
    const target=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),visualFacing);
    // Eases out of wall orientation as well as smoothing diagonal turns.
    player.quaternion.slerp(target,1-Math.exp(-10*dt));
  }

  // ---------------- STATE MACHINE ----------------
  if(P.state==='defeated'){
    P.vel.set(0,0,0);
  }
  else if(P.state==='downed'){
    P.state='ground';
    P.downedT=0;
  }
  else if(P.state==='swing'){
    progress.swingDistance+=P.vel.length()*dt;
    const missionBucket=Math.floor(progress.swingDistance/25);
    if(missionBucket!==lastSwingMissionBucket){
      lastSwingMissionBucket=missionBucket;
      updateMissionUI();
    }
    P.swingHistoryT=1;
    P.swingAge+=dt;
    P.swingPhaseT+=dt;
    P.swingPeakFlat=Math.max(P.swingPeakFlat,Math.hypot(P.vel.x,P.vel.z));
    const previousVy=P.vel.y;
    P.vel.y += GRAVITY*dt;
    let activeWebs=[P.swingWebs.left,P.swingWebs.right].filter(web=>web.anchor);
    if(!activeWebs.length){
      P.state='air';
      P.swingAssisted=false;
    } else {
    let constraint=swingConstraint(activeWebs);
    activeWebs.forEach(web=>{
      if(!web.fallCatch || !web.physicsPivot) return;
      // A forward rooftop below the player initially creates slack. Take that
      // slack up without applying force so the first outward part of the fall
      // immediately becomes a taut, energy-preserving pendulum.
      const catchDistance=P.pos.distanceTo(web.physicsPivot);
      if(catchDistance<web.length){
        web.length=catchDistance;
        web.targetLength=Math.min(web.targetLength,catchDistance);
      }
    });
    constraint=swingConstraint(activeWebs);
    const radial=P.pos.clone().sub(constraint.anchor).normalize();
    const forwardTangent=cameraForwardFlat();
    forwardTangent.addScaledVector(radial,-forwardTangent.dot(radial));

    // Take up at most the limited attachment slack at the native build's rate.
    activeWebs.forEach(web=>{
      if(web.length>web.targetLength) web.length=Math.max(web.targetLength,web.length-SWING_ATTACH_REEL_RATE*dt);
    });
    constraint=swingConstraint(activeWebs);

    // One short launch impulse is the only assisted part of a ground start.
    // Once airborne, gravity plus the rope constraint form an ordinary
    // pendulum: no lane spring, automatic pumping, lift or continuous reeling.
    if(P.swingGroundPullT>0){
      P.swingGroundPullT=Math.max(0,P.swingGroundPullT-dt);
      P.vel.y+=9*dt;
      if(forwardTangent.lengthSq()>0.001){
        P.vel.addScaledVector(forwardTangent.normalize(),5*dt);
      }
    }

    if(P.swingPhase==='entry'){
      if(P.vel.y<-0.75 || (P.swingPhaseT>=SWING_ENTRY_MAX_TIME && P.vel.y<=0.5)){
        P.swingHasDescended=true;
        setSwingPhase('descent');
      }
    }

    if(P.swingPhase==='descent'){
      if(P.vel.y<-0.5) P.swingHasDescended=true;
    } else if(P.swingPhase==='ascent'){
      P.swingPeakRise=Math.max(P.swingPeakRise,P.vel.y);
    }

    // A slack strand cannot redirect falling momentum. Use ordinary air input
    // until the next step reaches the rope radius, then steer along the arc.
    const nextRopeDistance=P.pos.clone().addScaledVector(P.vel,dt).distanceTo(constraint.anchor);
    if(nextRopeDistance>=constraint.length-0.05) steerSwingVelocity(radial,mv,dt);
    else if(mv.lengthSq()>0.001) P.vel.addScaledVector(mv,AIR_CONTROL*dt);

    // As the bottom of the arc approaches a surface, reel the strand in
    // gradually. The shorter radius pulls the player upward through the rope
    // constraint and stores height for the following downswing; it does not
    // inject an artificial upward velocity.
    const predictedSwingPos=P.pos.clone().addScaledVector(P.vel,dt);
    const predictedGround=heightAt(predictedSwingPos.x,predictedSwingPos.z,predictedSwingPos.y+2);
    const predictedClearance=predictedSwingPos.y-predictedGround;
    if(predictedClearance<SWING_GROUND_REEL_START && constraint.anchor.y>predictedGround+SWING_MIN_GROUND_CLEARANCE+3){
      const reelDanger=THREE.MathUtils.clamp(
        (SWING_GROUND_REEL_START-predictedClearance)/(SWING_GROUND_REEL_START-SWING_MIN_GROUND_CLEARANCE),0,1
      );
      const reelAmount=SWING_GROUND_REEL_RATE*(0.25+reelDanger*0.75)*dt;
      activeWebs.forEach(web=>{
        // Slack carries no tension. Take it up to the predicted position before
        // applying the bounded safety reel, rather than winding empty rope
        // while the player slides along the ground under a distant anchor.
        const distance=predictedSwingPos.distanceTo(web.physicsPivot||web.anchor);
        web.length=Math.max(SWING_MIN_RANGE,Math.min(web.length,distance)-reelAmount);
        web.targetLength=Math.min(web.targetLength,web.length);
      });
      constraint=swingConstraint(activeWebs);
    }
    const beforeSwingMove = P.pos.clone();
    P.pos.addScaledVector(P.vel, dt);
    const constrainedWebs=[P.swingWebs.left,P.swingWebs.right].filter(web=>web.anchor);
    enforceSwingConstraint(constrainedWebs);
    const swingImpactVelocity=P.vel.clone();
    const swingWall=resolveWallCollision(P.pos,beforeSwingMove);
    if(swingWall){
      if(P.wallDetachT<=0 && mv.dot(swingWall.normal)<-0.35){
        // Deliberately steering into a facade enters wall movement. The old
        // strand is released so a later jump can queue a fresh visible catch.
        releaseSwing(null,false);
        P.traversalSwingStarted=false;
        beginTraversalWallRun(swingWall.normal,swingWall.building,swingImpactVelocity);
      } else {
        // A glancing hit keeps sliding instead of forcing an unwanted wall run.
        P.pos.addScaledVector(swingWall.normal,.08);
      }
    }
    // Numerical fallback only. Normal ground avoidance happens by reeling above;
    // this catches a large frame or a terrain edge without restoring the old
    // upward bounce.
    const landingGround=heightAt(P.pos.x,P.pos.z,P.pos.y+2);
    if(P.state==='swing' && P.pos.y<landingGround+SWING_MIN_GROUND_CLEARANCE){
      P.pos.y=landingGround+SWING_MIN_GROUND_CLEARANCE;
      P.vel.y=Math.max(P.vel.y,0);
      constrainedWebs.forEach(web=>{
        if(web.physicsPivot)web.length=Math.max(web.length,P.pos.distanceTo(web.physicsPivot));
      });
    }
    if(P.state==='swing'){
      const currentVy=P.vel.y;
      if(P.swingPhase==='entry' && currentVy<-0.75){
        P.swingHasDescended=true;
        setSwingPhase('descent');
      }
      if(P.swingPhase==='descent'){
        const crossedBottom=P.swingHasDescended && previousVy<-0.35 && currentVy>=-0.35;
        if(crossedBottom || (P.swingHasDescended && currentVy>0.9)){
          P.swingBottomSpeed=P.vel.length();
          P.swingPeakRise=Math.max(0,currentVy);
          setSwingPhase('ascent');
        }
      }
      if(P.swingPhase==='ascent'){
        P.swingPeakRise=Math.max(P.swingPeakRise,currentVy);
        if(currentVy>2.5) P.swingClimbedAfterDescent=true;
        // Holding the web keeps it attached. Releasing Q/E is the only normal
        // release, so the player can let go at any point in the arc.
      }
      P.swingLastVy=P.vel.y;
      if(P.swingTelemetry && visualDt>0){
        P.swingTelemetry.phase=P.swingPhase;
        const samples=P.swingTelemetry.samples;
        samples.push({t:P.swingAge,phase:P.swingPhase,y:P.pos.y,vy:P.vel.y,
          speed:P.vel.length(),flat:Math.hypot(P.vel.x,P.vel.z),rope:constraint.length,
          clearance:P.pos.y-heightAt(P.pos.x,P.pos.z,P.pos.y+2)});
        if(samples.length>240) samples.shift();
      }
    }
    }
  }
  else if(P.state==='zip'){
    if(zipEnemyTarget && zipEnemyTarget.alive){
      zipTarget.copy(zipEnemyTarget.mesh.position).add(new THREE.Vector3(0,0.8,0));
    } else if(zipEnemyTarget){
      zipEnemyTarget=null;
    }
    const toT = new THREE.Vector3().subVectors(zipTarget, P.pos);
    const d = toT.length();
    if(d < 2.2){
      const arrivedEnemy=zipEnemyTarget;
      const completesCombo=comboChainMode==='zip' && comboChainTarget===arrivedEnemy;
      const exitDir = zipDir && zipDir.lengthSq()>0.001 ? zipDir : new THREE.Vector3(Math.sin(P.facing),0,Math.cos(P.facing));
      P.state='air';
      P.vel.copy(exitDir).multiplyScalar(18);
      zipTarget = null;
      zipDir = null;
      if(arrivedEnemy) arrivedEnemy.stunT=Math.max(arrivedEnemy.stunT,0.6);
      zipEnemyTarget=null;
      if(completesCombo) finishComboChain(arrivedEnemy);
    }
    else {
      toT.normalize();
      // WASD bends the zip without replacing its destination. Forward gives a
      // small speed push, back brakes, and sideways input curves the approach.
      const travelDir=toT.clone();
      if(mv.lengthSq()>0.001)travelDir.lerp(mv,.16).normalize();
      const zipSpeed=ZIP_SPEED*(keys[bindings.forward] ? 1.06 : keys[bindings.back] ? .82 : 1);
      zipDir = travelDir.clone();
      const beforeZipMove = P.pos.clone();
      const zipImpactVelocity=travelDir.clone().multiplyScalar(zipSpeed);
      P.pos.addScaledVector(travelDir,zipSpeed*dt);
      P.vel.copy(travelDir).multiplyScalar(zipSpeed*.72);
      const zipWall=resolveWallCollision(P.pos, beforeZipMove);
      if(zipWall) beginTraversalWallRun(zipWall.normal,zipWall.building,zipImpactVelocity);
    }
  }
  else if(P.state==='climb'){
    if(!P.climbNormal || !P.climbBuilding){
      if(!resumeSwingFromWall(false)) P.state='air';
      return;
    }
    // W/S travel vertically and A/D travel across the wall. The run toggle changes
    // wall crawling into a faster wall run, matching movement on the street.
    const manualClimbMove = new THREE.Vector3(
      (keys[bindings.left]?1:0)-(keys[bindings.right]?1:0),
      (keys[bindings.forward]?1:0)-(keys[bindings.back]?1:0), 0
    );
    if(manualClimbMove.lengthSq()>0.01) P.wallRunAutoT=0;
    const autoWallRunning=P.wallRunAutoT>0 && manualClimbMove.lengthSq()<0.01;
    const climbMove=autoWallRunning
      ? new THREE.Vector3(P.wallRunDirection.x,P.wallRunDirection.y,0)
      : manualClimbMove;
    if(climbMove.lengthSq()>1) climbMove.normalize();
    if(climbMove.lengthSq()>0.01){
      // Continuous tangent angle: vertical, horizontal, and all diagonals
      // share one smoothly interpolated wall-facing animation.
      P.climbVisualAngle=-Math.atan2(climbMove.x,Math.abs(climbMove.y));
      P.wallRunDirection.set(climbMove.x,climbMove.y).normalize();
    }
    const wallRunning=running || autoWallRunning;
    const wallSpeed=autoWallRunning?Math.max(WALL_RUN_SPEED,P.wallRunEntrySpeed):(wallRunning?WALL_RUN_SPEED:WALL_CRAWL_SPEED);
    if(P.wallRunFromSwing) P.wallRunMomentum=Math.max(P.wallRunMomentum,wallSpeed);
    const right = new THREE.Vector3().crossVectors(P.climbNormal, new THREE.Vector3(0,1,0)).normalize();
    const wallTravel=right.clone().multiplyScalar(climbMove.x);
    wallTravel.y=climbMove.y;
    // Keep velocity consistent with wall travel so jumps, releases and the
    // animation cycle inherit the motion the player actually sees.
    P.vel.copy(wallTravel).multiplyScalar(wallSpeed);
    P.pos.addScaledVector(P.vel,dt);

    const b=P.climbBuilding;
    const n=P.climbNormal;
    if(n.x<0) P.pos.x=b.hitMinX-CLIMB_WALL_OFFSET;
    else if(n.x>0) P.pos.x=b.hitMaxX+CLIMB_WALL_OFFSET;
    else if(n.z<0) P.pos.z=b.hitMinZ-CLIMB_WALL_OFFSET;
    else P.pos.z=b.hitMaxZ+CLIMB_WALL_OFFSET;
    const alongWall=n.x!==0
      ? P.pos.z>=b.hitMinZ-PLAYER_RADIUS && P.pos.z<=b.hitMaxZ+PLAYER_RADIUS
      : P.pos.x>=b.hitMinX-PLAYER_RADIUS && P.pos.x<=b.hitMaxX+PLAYER_RADIUS;
    const sidewaysWallRun=wallRunning && Math.abs(climbMove.x)>Math.abs(climbMove.y)*0.72;
    P.facing=sidewaysWallRun && wallTravel.lengthSq()>0.01
      ? Math.atan2(wallTravel.x,wallTravel.z)
      : Math.atan2(-n.x,-n.z);
    orientPlayerToWall(n,wallTravel,dt);

    // The collision normal points away from the wall, so sample and step in the
    // opposite direction to mantle onto the actual rooftop.
    const roofX=P.pos.x-P.climbNormal.x*1.3;
    const roofZ=P.pos.z-P.climbNormal.z*1.3;
    const roofH=heightAt(roofX,roofZ);
    if(P.pos.y>=roofH-0.2 && roofH>0){
      if(P.wallRunFromSwing || (wallRunning && climbMove.lengthSq()>0.01)){
        const exitDirection=climbMove.lengthSq()>0.01?climbMove:new THREE.Vector3(P.wallRunDirection.x,P.wallRunDirection.y,0);
        P.pos.x=roofX;
        P.pos.z=roofZ;
        P.pos.y=roofH+0.35;
        jumpFromWallEdge(right,exitDirection,wallSpeed);
      } else {
        P.pos.x=roofX;
        P.pos.z=roofZ;
        P.pos.y=roofH;
        P.vel.set(0,0,0);
        P.state='ground';
        P.climbBuilding=null;
        P.climbNormal=null;
        P.peakY=roofH;
      }
    }
    else if(!alongWall || P.pos.y<0.15){
      if(P.wallRunFromSwing || (P.pos.y>=0.15 && wallRunning && climbMove.lengthSq()>0.01)){
        const exitDirection=climbMove.lengthSq()>0.01?climbMove:new THREE.Vector3(P.wallRunDirection.x,P.wallRunDirection.y,0);
        jumpFromWallEdge(right,exitDirection,wallSpeed);
      } else {
        P.state=P.pos.y<0.15?'ground':'air';
        P.pos.y=Math.max(0,P.pos.y);
        P.wallRunAutoT=0;
        P.climbBuilding=null;
        P.climbNormal=null;
      }
    }
  }
  else { // ground / air
    if(P.state === 'ground'){
      if(P.recoveryRollT>0){
        const recoveryFlat=new THREE.Vector3(P.recoveryVelocity.x,0,P.recoveryVelocity.z);
        if(recoveryFlat.lengthSq()<4) recoveryFlat.copy(cameraForwardFlat()).multiplyScalar(12);
        P.vel.x=recoveryFlat.x;
        P.vel.z=recoveryFlat.z;
      } else {
        P.vel.x = mv.x*moveSpeed;
        P.vel.z = mv.z*moveSpeed;
      }
    } else {
      if(mv.lengthSq()>0) P.vel.addScaledVector(mv, AIR_CONTROL*dt);
      P.vel.x *= Math.pow(AIR_DRAG, dt*60);
      P.vel.z *= Math.pow(AIR_DRAG, dt*60);
    }
    const activelyGliding=P.state==='air' && P.gliding;
    if(!activelyGliding) P.vel.y += GRAVITY*dt;
    clampPlayerVelocity();
    if(activelyGliding){
      const bankInput=(keys[bindings.right]?1:0)-(keys[bindings.left]?1:0);
      const cameraAim=cameraForward3D();
      const steerToward=new THREE.Vector3(cameraAim.x,0,cameraAim.z).normalize();
      const glideVelocity=new THREE.Vector3(P.vel.x,0,P.vel.z);
      let glideSpeed=Math.max(GLIDE_MIN_SPEED,glideVelocity.length());
      const pitchIntent=THREE.MathUtils.clamp(cameraAim.y,-0.72,0.48);
      // Looking down trades height for speed; looking up bleeds speed. Direction
      // comes from the camera rather than WASD, like an elytra flight line.
      glideSpeed+=(-pitchIntent*11-0.8)*dt;
      glideSpeed=THREE.MathUtils.clamp(glideSpeed,GLIDE_MIN_SPEED,GLIDE_MAX_SPEED);
      if(glideVelocity.lengthSq()<0.01) glideVelocity.copy(steerToward);
      else glideVelocity.normalize().lerp(steerToward,1-Math.exp(-GLIDE_TURN_RATE*dt)).normalize();
      const targetVertical=THREE.MathUtils.clamp(pitchIntent*glideSpeed*0.58,-GLIDE_MAX_SINK,4.2);
      P.vel.y=THREE.MathUtils.lerp(P.vel.y,targetVertical,1-Math.exp(-3.4*dt));
      P.vel.y+=GRAVITY*0.08*dt;
      P.vel.y=THREE.MathUtils.clamp(P.vel.y,-GLIDE_MAX_SINK,4.2);
      P.vel.x=glideVelocity.x*glideSpeed;
      P.vel.z=glideVelocity.z*glideSpeed;
      P.glideBank=THREE.MathUtils.lerp(P.glideBank,bankInput,1-Math.exp(-5*dt));
      P.glidePitch=THREE.MathUtils.lerp(P.glidePitch,-pitchIntent,1-Math.exp(-4*dt));
      P.facing=Math.atan2(glideVelocity.x,glideVelocity.z);
      player.rotation.y=P.facing;
    } else {
      P.glideBank=THREE.MathUtils.lerp(P.glideBank,0,1-Math.exp(-7*dt));
      P.glidePitch=THREE.MathUtils.lerp(P.glidePitch,0,1-Math.exp(-7*dt));
    }
    const beforeMove = P.pos.clone();
    P.pos.addScaledVector(new THREE.Vector3(P.vel.x,0,P.vel.z), dt);
    P.pos.y += P.vel.y*dt;
    resolveWallCollision(P.pos, beforeMove);

    if(P.state==='air') P.peakY = Math.max(P.peakY, P.pos.y);

    const groundH = heightAt(P.pos.x,P.pos.z, P.pos.y+1.5);
    if(P.pos.y<=groundH){
      const landingVelocity=P.vel.clone();
      const landingSpeed=Math.abs(P.vel.y);
      P.pos.y=groundH; P.vel.y=0;
      P.state='ground'; P.gliding=false;
      if(landingSpeed>4) P.landPoseT=0.22;
      // Falling is never punished with health loss. A recent swing instead
      // opens a short Space recovery window that preserves travel momentum.
      if(P.swingHistoryT>0 && landingSpeed>5){
        P.quickRecoveryT=QUICK_RECOVERY_WINDOW;
        P.recoveryVelocity.copy(landingVelocity);
        if(Math.hypot(P.recoveryVelocity.x,P.recoveryVelocity.z)<8){
          P.recoveryVelocity.copy(cameraForwardFlat()).multiplyScalar(12);
        }
        flashMsg('SPACE: RECOVER');
      }
      P.pendingFallDamage=0;
      P.recoveryT=0;
      P.recoverLock=false;
      P.peakY = P.pos.y;
    }
    else {
      if(P.state==='ground') P.peakY = P.pos.y;
      P.state='air';
    }

    // Moving into a wall from either the street or the air starts a wall crawl/run.
    if((P.state==='air'||P.state==='ground') && P.wallDetachT<=0 && mv.lengthSq()>0.1){
      const wc = wallContact(P.pos.x,P.pos.z,P.facing,1.0);
      if(wc){
        P.state='climb'; P.gliding=false;
        P.climbNormal = wc.normal.clone();
        P.climbBuilding = wc.building;
        P.vel.set(0,0,0);
      }
    }
  }

  clampPlayerVelocity();

  // pull ability resolution (enemy flies to player)
  if(pullTarget){
    const e = pullTarget;
    if(!e.alive){
      pullTarget=null;
      if(comboChainTarget===e){ comboChainTarget=null; comboChainMode=null; }
    }
    else {
      const to = new THREE.Vector3().subVectors(P.pos, e.mesh.position); to.y=0;
      const d = to.length();
      if(d<2.2){
        const completesCombo=comboChainMode==='pull' && comboChainTarget===e;
        e.stunT = 1.5;
        pullTarget=null;
        if(completesCombo) finishComboChain(e);
        else damageEnemy(e,12);
      } else {
        to.normalize();
        e.mesh.position.addScaledVector(to, 30*dt);
      }
    }
  }

  if(P.state!=='downed') P.downedT = 0;

  if(visualDt>0){
    animatePlayer(visualDt, mv);
    updateWebWings();
    if(P.state==='swing' && P.activeSwingHand){
      const hand=P.activeSwingHand,web=P.swingWebs[hand];
      const origin=visibleWebHandWorld(hand,hand==='left'?handL:handR);
      if(swingWebObstructed(origin,web.anchor)){
        // Break an obstructed strand without redirecting momentum. A held
        // traversal input queues the next visible catch through the normal retry.
        releaseSwing(null,false);
        P.traversalSwingStarted=false;
      }
    }
  }

  // health regen (slow) when not in combat
  if(P.hp>0 && P.state!=='defeated' && !playerInCombat()) P.hp = Math.min(P.maxHp, P.hp + dt*0.6);
}

function updateProjectiles(dt){
  for(let i=projectiles.length-1;i>=0;i--){
    const p = projectiles[i];
    p.life -= dt;
    const previous=p.pos.clone();
    const travel=WEBSHOT_SPEED*dt;
    p.pos.addScaledVector(p.dir,travel);
    if(p.mesh) p.mesh.position.copy(p.pos);
    let hit=false;
    for(const e of enemies){
      if(!e.alive) continue;
      const target=e.mesh.position.clone().add(new THREE.Vector3(0,.4,0));
      const segment=p.pos.clone().sub(previous),lengthSq=segment.lengthSq();
      const along=lengthSq?THREE.MathUtils.clamp(target.clone().sub(previous).dot(segment)/lengthSq,0,1):0;
      const nearest=previous.clone().addScaledVector(segment,along);
      if(nearest.distanceTo(target) < 1.25){
        combatTarget=e;
        damageEnemy(e, 10);
        e.stunT = 2.2;
        e.vel.addScaledVector(p.dir,4);
        hit=true;
        break;
      }
    }
    if(!hit){
      raycaster.set(previous,p.dir);raycaster.far=travel;
      hit=raycaster.intersectObjects(nearbyBuildingMeshes(previous,travel+2),false).length>0;
      raycaster.far=Infinity;
    }
    if(hit || p.life<=0) removeProjectile(i);
  }
}

function pointInsideBuildingVolume(point){
  return nearbyBuildings(point,1).some(b =>
    point.x > b.hitMinX &&
    point.x < b.hitMaxX &&
    point.z > b.hitMinZ &&
    point.z < b.hitMaxZ &&
    point.y > 0 &&
    point.y < b.h
  );
}

function pushPointOutOfBuildingVolume(point, clearance=0.45){
  for(const b of nearbyBuildings(point,clearance+1)){
    const inside =
      point.x > b.hitMinX &&
      point.x < b.hitMaxX &&
      point.z > b.hitMinZ &&
      point.z < b.hitMaxZ &&
      point.y > 0 &&
      point.y < b.h;
    if(!inside) continue;
    const options = [
      {d:point.x-b.hitMinX, set:()=>{ point.x = b.hitMinX-clearance; }},
      {d:b.hitMaxX-point.x, set:()=>{ point.x = b.hitMaxX+clearance; }},
      {d:point.z-b.hitMinZ, set:()=>{ point.z = b.hitMinZ-clearance; }},
      {d:b.hitMaxZ-point.z, set:()=>{ point.z = b.hitMaxZ+clearance; }},
      {d:b.h-point.y, set:()=>{ point.y = b.h+clearance; }}
    ];
    options.sort((a,b)=>a.d-b.d);
    options[0].set();
  }
  return point;
}

const speedLineOverlay=document.getElementById('speedLines');
let speedLineVisualIntensity=0;

function speedLineIntensityForSpeed(speed){
  if(!Number.isFinite(speed)||speed<=48)return 0;
  const handoff=THREE.MathUtils.smoothstep(speed,48,58)*0.5;
  const overdrive=THREE.MathUtils.clamp((speed-58)/42,0,1)*0.5;
  return THREE.MathUtils.clamp(handoff+overdrive,0,1);
}

function updateSpeedLines(dt=1/60){
  if(!speedLineOverlay)return;
  const active=gameActive&&!paused;
  if(!active){
    speedLineVisualIntensity=0;
  }else{
    const safeDt=THREE.MathUtils.clamp(Number.isFinite(dt)?dt:1/60,0,0.1);
    const target=speedLineIntensityForSpeed(P.vel.length());
    speedLineVisualIntensity=THREE.MathUtils.lerp(speedLineVisualIntensity,target,1-Math.exp(-9*safeDt));
  }
  const intensity=THREE.MathUtils.clamp(speedLineVisualIntensity,0,1);
  const burst=THREE.MathUtils.smoothstep(intensity,0.72,1);
  speedLineOverlay.style.setProperty('--speed-line-base-opacity',(intensity*0.82).toFixed(3));
  speedLineOverlay.style.setProperty('--speed-line-burst-opacity',(burst*0.92).toFixed(3));
  speedLineOverlay.style.setProperty('--speed-line-scale',(1+intensity*0.06).toFixed(3));
}

function updateCamera(dt=1/60){
  const firstPerson = cameraDistance <= 0.6;
  player.visible = !firstPerson;

  const traversalSpeed=P.vel.length();
  const targetFov=70+THREE.MathUtils.clamp((traversalSpeed-14)*0.18,0,8);
  const nextFov=THREE.MathUtils.lerp(camera.fov,targetFov,1-Math.exp(-5*dt));
  if(Math.abs(nextFov-camera.fov)>0.01){
    camera.fov=nextFov;
    camera.updateProjectionMatrix();
  }

  const lookDir = new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch)
  ).normalize();
  const focus = new THREE.Vector3(P.pos.x, P.pos.y + 1.45, P.pos.z);
  cameraLeadTarget.set(0,0,0);
  if(!firstPerson && traversalSpeed>12){
    cameraLeadTarget.set(P.vel.x,0,P.vel.z);
    if(cameraLeadTarget.lengthSq()>0.001)
      cameraLeadTarget.normalize().multiplyScalar(Math.min(1.8,(traversalSpeed-12)*0.035));
  }
  // Blend only the automatic lookahead. Mouse orbit remains immediate, while
  // a catch or wall transition cannot whip the framing to a new velocity axis.
  cameraLead.lerp(cameraLeadTarget,1-Math.exp(-9*dt));
  if(!firstPerson) focus.add(cameraLead);

  if(firstPerson){
    cameraCollisionDistance=null;
    const eye = new THREE.Vector3(P.pos.x, P.pos.y + 1.62, P.pos.z);
    camera.position.lerp(eye, 1-Math.exp(-26*dt));
    camera.lookAt(eye.clone().addScaledVector(lookDir, 12));
    return;
  }

  const dist = cameraDistance;
  const flatForward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const shoulderRight=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  let desired;
  if(shiftLocked){
    // Keep the normal orbiting third-person camera and only nudge it over the
    // right shoulder. Pitch, zoom and collision therefore behave exactly as
    // they do with shift-lock off instead of switching to a separate camera.
    const camOffset=new THREE.Vector3(
      -Math.sin(yaw)*Math.cos(pitch)*dist,
      1.75-Math.sin(pitch)*dist,
      -Math.cos(yaw)*Math.cos(pitch)*dist
    );
    desired=P.pos.clone().add(camOffset).addScaledVector(shoulderRight,-.58);
    desired.y+=.28;
  } else {
    const camOffset=new THREE.Vector3(
      -Math.sin(yaw)*Math.cos(pitch)*dist,
      1.75-Math.sin(pitch)*dist,
      -Math.cos(yaw)*Math.cos(pitch)*dist
    );
    desired=P.pos.clone().add(camOffset);
  }
  // Preserve mouse camera direction but give the third-person view some room
  // outside the wall so its texture doesn't fill the entire screen.
  if(P.state==='climb' && P.climbNormal && dist>1.5){
    desired.addScaledVector(P.climbNormal,Math.min(3.2,dist*.42));
  }
  const fromFocus = desired.clone().sub(focus);
  const desiredDist = fromFocus.length();
  const cameraRay = fromFocus.clone().normalize();
  let clearDistance = desiredDist;

  if(desiredDist > 0.1){
    raycaster.set(focus, cameraRay);
    raycaster.far = desiredDist;
    const hits = raycaster.intersectObjects(nearbyBuildingMeshes(focus,desiredDist+2), false);
    if(hits.length) clearDistance=Math.min(clearDistance,Math.max(0.45,hits[0].distance-0.4));
    raycaster.far = Infinity;

    // Keep the camera above whichever surface is below it: island or ocean.
    const cameraFloor=(isOverIsland(desired.x,desired.z) ? 0 : WATER_LEVEL)+0.32;
    if(cameraRay.y<0 && desired.y<cameraFloor){
      const groundDistance=(focus.y-cameraFloor)/-cameraRay.y;
      clearDistance=Math.min(clearDistance,Math.max(0.45,groundDistance));
    }
  }

  if(cameraCollisionDistance===null) cameraCollisionDistance=clearDistance;
  // An obstruction is a hard limit, not a smoothing target. Easing inward
  // leaves the camera inside a facade for several frames during fast turns.
  // Only the return to the requested distance is eased.
  cameraCollisionDistance=Math.min(clearDistance,
    THREE.MathUtils.lerp(cameraCollisionDistance,clearDistance,1-Math.exp(-7*dt)));
  camera.position.copy(focus).addScaledVector(cameraRay,cameraCollisionDistance);
  camera.lookAt(shiftLocked?camera.position.clone().addScaledVector(lookDir,30):focus);
}

function updateZoomInput(dt){
  let delta = 0;
  if(keys[bindings.zoomIn]) delta -= KEY_ZOOM_SPEED * dt;
  if(keys[bindings.zoomOut]) delta += KEY_ZOOM_SPEED * dt;
  if(delta !== 0) adjustCameraZoom(delta);
}

// ---------------------------------------------------------------------------------------
// HUD / MINIMAP / DEBUG
// ---------------------------------------------------------------------------------------
const mmCanvas = document.getElementById('minimap');
const mmCtx = mmCanvas.getContext('2d');
let fullMapOpen=false;
let fullMapWasPaused=false;
let fullMapHadShiftLock=false;
const fullMapOverlay=document.getElementById('fullMapOverlay');
const fullMapPanel=document.getElementById('fullMapPanel');
const fullMapCanvas=document.getElementById('fullMapCanvas');
let fullMapAnimation=null;
let fullMapBackdropAnimation=null;
let fullMapFinishTimer=null;
let fullMapMotionId=0;
// An independent map canvas: the minimap's zoom, pixels and viewport are never
// reused. The minimap is only the visual origin for the opening transition.
function animateFullMapPanel(opening){
  const sequence=++fullMapMotionId;
  if(fullMapAnimation){
    fullMapAnimation.cancel();
    fullMapAnimation=null;
  }
  if(fullMapBackdropAnimation){
    fullMapBackdropAnimation.cancel();
    fullMapBackdropAnimation=null;
  }
  if(fullMapFinishTimer!==null){
    clearTimeout(fullMapFinishTimer);
    fullMapFinishTimer=null;
  }
  const mini=document.getElementById('minimapWrap').getBoundingClientRect();
  const expanded=fullMapPanel.getBoundingClientRect();
  const miniCX=mini.left+mini.width/2;
  const miniCY=mini.top+mini.height/2;
  const expandedCX=expanded.left+expanded.width/2;
  const expandedCY=expanded.top+expanded.height/2;
  const sx=Math.max(.05,mini.width/expanded.width);
  const sy=Math.max(.05,mini.height/expanded.height);
  const collapsed='translate('+(miniCX-expandedCX)+'px,'+
    (miniCY-expandedCY)+'px) scale('+sx+','+sy+')';
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const duration=reduced?0:340;
  const frames=opening
    ?[{transform:collapsed,opacity:.65},{transform:'none',opacity:1}]
    :[{transform:'none',opacity:1},{transform:collapsed,opacity:.65}];
  if(!duration || typeof fullMapPanel.animate!=='function'){
    if(!opening){fullMapOverlay.hidden=true;}
    return;
  }
  fullMapAnimation=fullMapPanel.animate(frames,{
    duration,easing:'cubic-bezier(.22,.85,.27,1)',fill:'both'
  });
  const backdrop=opening
    ?[{backgroundColor:'rgba(8,15,30,0)'},{backgroundColor:'rgba(8,15,30,.9)'}]
    :[{backgroundColor:'rgba(8,15,30,.9)'},{backgroundColor:'rgba(8,15,30,0)'}];
  fullMapBackdropAnimation=fullMapOverlay.animate(backdrop,{
    duration,easing:'ease-out',fill:'both'
  });
  const finish=()=>{
    if(sequence!==fullMapMotionId)return;
    if(fullMapFinishTimer!==null)clearTimeout(fullMapFinishTimer);
    fullMapFinishTimer=null;
    if(fullMapAnimation){fullMapAnimation.cancel();fullMapAnimation=null;}
    if(fullMapBackdropAnimation){fullMapBackdropAnimation.cancel();fullMapBackdropAnimation=null;}
    if(!opening)fullMapOverlay.hidden=true;
  };
  fullMapAnimation.onfinish=finish;
  // WebKit can delay animation-finish callbacks when the GPU is saturated.
  // A timed fallback ensures the full-map overlay never blocks the game.
  fullMapFinishTimer=setTimeout(finish,duration+180);
}

const fullMapContext=fullMapCanvas.getContext('2d');
const fullMapView={
  zoom:1,baseScale:1,scale:1,
  centerX:0,centerZ:0,
  width:800,height:600,
  dragging:false,pointerX:0,pointerY:0
};
function resizeFullMap(){
  if(!fullMapOpen)return;
  const rect=fullMapCanvas.getBoundingClientRect();
  const ratio=Math.min(1.5,window.devicePixelRatio||1);
  fullMapView.width=Math.max(1,rect.width);
  fullMapView.height=Math.max(1,rect.height);
  fullMapCanvas.width=Math.round(fullMapView.width*ratio);
  fullMapCanvas.height=Math.round(fullMapView.height*ratio);
  fullMapContext.setTransform(ratio,0,0,ratio,0,0);
  fullMapView.baseScale=Math.min(
    (fullMapView.width-36)/(ISLAND_RADIUS_Z*2),
    (fullMapView.height-36)/(ISLAND_RADIUS_X*2)
  );
  fullMapView.scale=fullMapView.baseScale*fullMapView.zoom;
  clampFullMapCenter();
  drawFullMap();
}
function clampFullMapCenter(){
  const map=fullMapView;
  const limitX=Math.max(0,ISLAND_RADIUS_X-(map.height/2-18)/map.scale);
  const limitZ=Math.max(0,ISLAND_RADIUS_Z-(map.width/2-18)/map.scale);
  map.centerX=THREE.MathUtils.clamp(map.centerX,-limitX,limitX);
  map.centerZ=THREE.MathUtils.clamp(map.centerZ,-limitZ,limitZ);
  if(map.zoom<=1.00001){
    map.centerX=0;map.centerZ=0;
  }
}
function fullMapToScreen(x,z){
  const m=fullMapView;
  return [m.width/2+(z-m.centerZ)*m.scale,
          m.height/2+(x-m.centerX)*m.scale];
}
const fullMapMarkers=[];
function drawFullMap(){
  if(!fullMapOpen)return;
  const m=fullMapView,ctx=fullMapContext,w=m.width,h=m.height;
  fullMapMarkers.length=0;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#10253c';ctx.fillRect(0,0,w,h);
  ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
  const minX=m.centerX-h/(2*m.scale),maxX=m.centerX+h/(2*m.scale);
  const minZ=m.centerZ-w/(2*m.scale),maxZ=m.centerZ+w/(2*m.scale);
  ctx.beginPath();
  for(let i=0;i<=160;i++){
    const t=i/160*Math.PI*2,c=Math.cos(t),v=Math.sin(t),power=1/3;
    const [px,py]=fullMapToScreen(
      ISLAND_RADIUS_X*Math.sign(c)*Math.pow(Math.abs(c),power),
      ISLAND_RADIUS_Z*Math.sign(v)*Math.pow(Math.abs(v),power));
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  }
  ctx.closePath();ctx.fillStyle='#263a49';ctx.fill();
  ctx.strokeStyle='#9fb2c3';ctx.lineWidth=2;ctx.stroke();
  ctx.clip();
  ctx.strokeStyle='#697887';
  const firstX=Math.max(0,Math.floor((minX+HALF_CITY_X)/TILE_X));
  const lastX=Math.min(BLOCKS_X,Math.ceil((maxX+HALF_CITY_X)/TILE_X));
  ctx.lineWidth=Math.max(1.3,STREET_X*m.scale*.55);
  for(let ix=firstX;ix<=lastX;ix++){
    const [,py]=fullMapToScreen(-HALF_CITY_X+ix*TILE_X,0);
    ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(w,py);ctx.stroke();
  }
  const firstZ=Math.max(0,Math.floor((minZ+HALF_CITY_Z)/TILE_Z));
  const lastZ=Math.min(BLOCKS_Z,Math.ceil((maxZ+HALF_CITY_Z)/TILE_Z));
  ctx.lineWidth=Math.max(1.3,STREET_Z*m.scale*.55);
  for(let iz=firstZ;iz<=lastZ;iz++){
    const [px]=fullMapToScreen(0,-HALF_CITY_Z+iz*TILE_Z);
    ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,h);ctx.stroke();
  }
  for(const park of parkAreas){
    const [x1,y1]=fullMapToScreen(park.minX,park.minZ);
    const [x2,y2]=fullMapToScreen(park.maxX,park.maxZ);
    ctx.fillStyle='#548d59';ctx.fillRect(x1,y1,x2-x1,y2-y1);
  }
  for(const b of buildingMeshes){
    if(b.worldOnly||b.maxX<minX||b.minX>maxX||b.maxZ<minZ||b.minZ>maxZ)continue;
    const [x1,y1]=fullMapToScreen(b.minX,b.minZ);
    const [x2,y2]=fullMapToScreen(b.maxX,b.maxZ);
    const shade=Math.round(64+Math.min(88,b.h*.26));
    ctx.fillStyle='rgb('+shade+','+(shade+8)+','+(shade+18)+')';
    ctx.fillRect(x1,y1,x2-x1,y2-y1);
  }
  function marker(x,z,color,label,radius=4,ring=false){
    const [px,py]=fullMapToScreen(x,z);
    if(px<-14||px>w+14||py<-14||py>h+14)return;
    ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);
    ctx.lineWidth=2;ctx.strokeStyle=ring?color:'#122132';
    if(ring)ctx.stroke();else{ctx.fillStyle=color;ctx.fill();ctx.stroke();}
    fullMapMarkers.push({px,py,label,x,z});
  }
  for(let i=0;i<spawnPoints.length;i++){
    const p=spawnPoints[i];marker(p.x,p.z,'#04d4ec','Bandit patrol spawn '+(i+1),3);
  }
  for(const [i,g] of groups.entries()){
    if(g.defeatedAt!==null)continue;
    const p=spawnPoints[g.spawnIdx];if(!p)continue;
    const alive=g.members.filter(e=>e.alive).length;
    marker(p.x,p.z,'#ffcb39','Active gang '+(i+1)+' · '+alive+' members',7,true);
  }
  for(const [i,p] of dockPiers.entries()){
    marker(p.position.x,p.position.z,'#dbb38a','Dock pier '+(i+1),4);
  }
  if(parkAreas[0]){
    const p=parkAreas[0];
    marker((p.minX+p.maxX)/2,(p.minZ+p.maxZ)/2,'#88f2a3','Central Park',5);
  }
  marker(P.pos.x,P.pos.z,'#ee3243','You are here',4);
  const [px,py]=fullMapToScreen(P.pos.x,P.pos.z);
  ctx.translate(px,py);ctx.rotate(Math.PI/2+yaw);
  ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(7,9);ctx.lineTo(-7,9);ctx.closePath();
  ctx.fillStyle='#ef303e';ctx.strokeStyle='#141923';ctx.lineWidth=2;ctx.fill();ctx.stroke();
  ctx.restore();
}
function fullMapSelectPoint(px,py){
  const info=document.getElementById('fullMapInfo');
  let nearest=null,best=18;
  for(let i=fullMapMarkers.length-1;i>=0;i--){
    const p=fullMapMarkers[i],distance=Math.hypot(px-p.px,py-p.py);
    if(distance<best){best=distance;nearest=p;}
  }
  if(nearest){info.textContent=nearest.label;return info.textContent;}
  const x=fullMapView.centerX+(py-fullMapView.height/2)/fullMapView.scale;
  const z=fullMapView.centerZ+(px-fullMapView.width/2)/fullMapView.scale;
  if(!isOverIsland(x,z)){info.textContent='Waterfront · surrounding river';return info.textContent;}
  const ix=Math.floor((x+HALF_CITY_X)/TILE_X),iz=Math.floor((z+HALF_CITY_Z)/TILE_Z);
  const names={skyscrapers:'Skyscraper district',centralPark:'Central Park',
    lowerClass:'Residential neighborhood',docks:'Industrial docks'};
  const b=nearbyBuildings(new THREE.Vector3(x,0,z),4)
    .find(t=>x>=t.minX&&x<=t.maxX&&z>=t.minZ&&z<=t.maxZ);
  info.textContent=(names[districtForBlock(ix,iz)]||'City street')+
    (b?' · '+Math.round(b.h)+'-unit building':'');
  return info.textContent;
}

function setFullMapOpen(on){
  if(!gameActive)return;
  if(fullMapOpen===on)return;
  fullMapOpen=!!on;
  fullMapOverlay.setAttribute('aria-hidden',fullMapOpen?'false':'true');
  if(fullMapOpen){
    fullMapOverlay.hidden=false;
    fullMapWasPaused=paused;
    fullMapHadShiftLock=shiftLocked;
    paused=true;
    clearHeldInputs();
    releaseMouseLock();
    fullMapView.zoom=1;
    fullMapView.centerX=0;fullMapView.centerZ=0;
    resizeFullMap();
    animateFullMapPanel(true);
  }else{
    fullMapView.dragging=false;
    animateFullMapPanel(false);
    paused=fullMapWasPaused;
    if(!paused && fullMapHadShiftLock)requestMouseLock();
  }
}
function zoomFullMap(factor,localX,localY){
  const m=fullMapView;
  const oldScale=m.scale;
  const previousX=m.centerX+(localY-m.height/2)/oldScale;
  const previousZ=m.centerZ+(localX-m.width/2)/oldScale;
  m.zoom=THREE.MathUtils.clamp(m.zoom*factor,1,14);
  m.scale=m.baseScale*m.zoom;
  m.centerX=previousX-(localY-m.height/2)/m.scale;
  m.centerZ=previousZ-(localX-m.width/2)/m.scale;
  clampFullMapCenter();drawFullMap();
}
fullMapCanvas.addEventListener('wheel',e=>{
  e.preventDefault();e.stopPropagation();
  const bounds=fullMapCanvas.getBoundingClientRect();
  zoomFullMap(Math.exp(-e.deltaY*.00135),e.clientX-bounds.left,e.clientY-bounds.top);
},{passive:false});
fullMapCanvas.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  fullMapView.dragging=true;
  fullMapView.pointerX=e.clientX;
  fullMapView.pointerY=e.clientY;
  fullMapView.downX=e.clientX;
  fullMapView.downY=e.clientY;
  fullMapView.moved=false;
  fullMapCanvas.setPointerCapture(e.pointerId);
});
fullMapCanvas.addEventListener('pointermove',e=>{
  if(!fullMapView.dragging)return;
  const m=fullMapView;
  if(Math.hypot(e.clientX-m.downX,e.clientY-m.downY)>6)m.moved=true;
  m.centerX-=(e.clientY-m.pointerY)/m.scale;
  m.centerZ-=(e.clientX-m.pointerX)/m.scale;
  m.pointerX=e.clientX;m.pointerY=e.clientY;
  clampFullMapCenter();drawFullMap();
});
fullMapCanvas.addEventListener('pointerup',e=>{
  if(fullMapView.dragging&&!fullMapView.moved){
    const rect=fullMapCanvas.getBoundingClientRect();
    fullMapSelectPoint(e.clientX-rect.left,e.clientY-rect.top);
  }
  fullMapView.dragging=false;
  if(fullMapCanvas.hasPointerCapture(e.pointerId))
    fullMapCanvas.releasePointerCapture(e.pointerId);
});
fullMapCanvas.addEventListener('pointercancel',()=>{fullMapView.dragging=false;});
document.getElementById('fullMapClose').addEventListener('click',()=>{
  setFullMapOpen(false);
});
document.getElementById('fullMapCenter').addEventListener('click',()=>{
  fullMapView.centerX=P.pos.x;fullMapView.centerZ=P.pos.z;
  if(fullMapView.zoom<=1)fullMapView.zoom=Math.min(4,14);
  fullMapView.scale=fullMapView.baseScale*fullMapView.zoom;
  clampFullMapCenter();drawFullMap();
});
window.addEventListener('resize',()=>{if(fullMapOpen)resizeFullMap();});

// Player-centred 8-by-8 block window. The island can grow without shrinking
// the minimap to an unreadable full-city thumbnail.
function drawMinimap(){
  const S=190;
  const viewBlocks=8;
  const scaleX=S/(viewBlocks*TILE_X);
  const scaleZ=S/(viewBlocks*TILE_Z);
  const centerX=P.pos.x, centerZ=P.pos.z;
  const rangeX=S/(2*scaleX),rangeZ=S/(2*scaleZ);
  const toMM=(x,z)=>[S/2+(x-centerX)*scaleX,S/2+(z-centerZ)*scaleZ];
  mmCtx.clearRect(0,0,S,S);
  mmCtx.fillStyle='#102740';mmCtx.fillRect(0,0,S,S);
  mmCtx.save();
  mmCtx.beginPath();mmCtx.rect(0,0,S,S);mmCtx.clip();

  // Coastline appears only when the player is near the waterfront.
  mmCtx.beginPath();
  for(let i=0;i<=128;i++){
    const t=i/128*Math.PI*2,c=Math.cos(t),v=Math.sin(t),power=2/6;
    const x=ISLAND_RADIUS_X*Math.sign(c)*Math.pow(Math.abs(c),power);
    const z=ISLAND_RADIUS_Z*Math.sign(v)*Math.pow(Math.abs(v),power);
    const [mx,mz]=toMM(x,z);
    if(i===0)mmCtx.moveTo(mx,mz);else mmCtx.lineTo(mx,mz);
  }
  mmCtx.closePath();mmCtx.fillStyle='#293d51';mmCtx.fill();
  mmCtx.strokeStyle='#8c9caa';mmCtx.lineWidth=1;mmCtx.stroke();

  // Draw only streets intersecting the 8x8-block viewport.
  mmCtx.strokeStyle='#758391';
  mmCtx.lineWidth=Math.max(3,STREET_X*scaleX*.52);
  const firstX=Math.max(0,Math.floor((centerX-rangeX+HALF_CITY_X)/TILE_X));
  const lastX=Math.min(BLOCKS_X,Math.ceil((centerX+rangeX+HALF_CITY_X)/TILE_X));
  for(let ix=firstX;ix<=lastX;ix++){
    const x=-HALF_CITY_X+ix*TILE_X;
    const [px]=toMM(x,centerZ);
    mmCtx.beginPath();mmCtx.moveTo(px,0);mmCtx.lineTo(px,S);mmCtx.stroke();
  }
  mmCtx.lineWidth=Math.max(3,STREET_Z*scaleZ*.52);
  const firstZ=Math.max(0,Math.floor((centerZ-rangeZ+HALF_CITY_Z)/TILE_Z));
  const lastZ=Math.min(BLOCKS_Z,Math.ceil((centerZ+rangeZ+HALF_CITY_Z)/TILE_Z));
  for(let iz=firstZ;iz<=lastZ;iz++){
    const z=-HALF_CITY_Z+iz*TILE_Z;
    const [,pz]=toMM(centerX,z);
    mmCtx.beginPath();mmCtx.moveTo(0,pz);mmCtx.lineTo(S,pz);mmCtx.stroke();
  }
  parkAreas.forEach(park=>{
    if(park.maxX<centerX-rangeX||park.minX>centerX+rangeX ||
       park.maxZ<centerZ-rangeZ||park.minZ>centerZ+rangeZ)return;
    const [x1,z1]=toMM(park.minX,park.minZ);
    const [x2,z2]=toMM(park.maxX,park.maxZ);
    mmCtx.fillStyle='#538d57';mmCtx.fillRect(x1,z1,x2-x1,z2-z1);
  });
  nearbyBuildings(P.pos,Math.max(rangeX,rangeZ)+100).forEach(building=>{
    if(building.worldOnly || building.maxX<centerX-rangeX ||
       building.minX>centerX+rangeX || building.maxZ<centerZ-rangeZ ||
       building.minZ>centerZ+rangeZ)return;
    const [x1,z1]=toMM(building.minX,building.minZ);
    const [x2,z2]=toMM(building.maxX,building.maxZ);
    const shade=Math.round(58+Math.min(90,building.h*.28));
    mmCtx.fillStyle='rgb('+shade+','+(shade+7)+','+(shade+18)+')';
    mmCtx.fillRect(x1,z1,x2-x1,z2-z1);
  });
  groups.forEach(group=>{
    if(group.defeatedAt!==null)return;
    const home=spawnPoints[group.spawnIdx];if(!home)return;
    const [x,z]=toMM(home.x,home.z);
    if(x<0||x>S||z<0||z>S)return;
    mmCtx.strokeStyle='#ffcf33';mmCtx.lineWidth=1.5;
    mmCtx.beginPath();mmCtx.arc(x,z,5,0,2*Math.PI);mmCtx.stroke();
  });
  spawnPoints.forEach(point=>{
    const [x,z]=toMM(point.x,point.z);
    if(x<0||x>S||z<0||z>S)return;
    mmCtx.fillStyle='#00e5ff';mmCtx.beginPath();mmCtx.arc(x,z,2.7,0,2*Math.PI);mmCtx.fill();
  });
  enemies.forEach(enemy=>{
    if(!enemy.alive)return;
    const [x,z]=toMM(enemy.mesh.position.x,enemy.mesh.position.z);
    if(x<0||x>S||z<0||z>S)return;
    mmCtx.fillStyle=enemy.state==='idle'?'#888':enemy.state==='alert'?'#ffcc00':
      enemy.stunT>0?'#3355ff':'#ff3030';
    mmCtx.beginPath();mmCtx.arc(x,z,2.6,0,2*Math.PI);mmCtx.fill();
  });

  // The player stays centred; only the direction arrow rotates.
  mmCtx.translate(S/2,S/2);mmCtx.rotate(Math.PI-yaw);
  mmCtx.fillStyle='#ef303e';mmCtx.strokeStyle='#161b29';mmCtx.lineWidth=1.5;
  mmCtx.beginPath();mmCtx.moveTo(0,-7);mmCtx.lineTo(5,6);
  mmCtx.lineTo(-5,6);mmCtx.closePath();mmCtx.fill();mmCtx.stroke();
  mmCtx.restore();
}

function updateCrosshair(){
  const wrap=document.getElementById('crosshairWrap');
  const aimingLocked=gameActive && !paused && (shiftLocked || firstPersonAutoLock || cameraDistance<=0.6);
  wrap.style.display=aimingLocked?'block':'none';
  if(!aimingLocked) return;
  const hit = zipCrosshairHit(Math.max(SWING_MAX_RANGE,WEBSHOT_RANGE,ZIP_RANGE));
  const el = document.getElementById('crosshair');
  if(!hit){ el.className='none'; return; }
  el.className='zip';
}

// Close actors retain animated R15 bodies; far actors use existing low-poly
// bodies. Hysteresis avoids constant swaps during high-speed swinging.
function updateActorLOD(){
  const nearEnemy2=38*38, farEnemy2=48*48;
  const nearPed2=27*27, farPed2=35*35;
  for(const e of enemies){
    if(!e.alive) continue;
    const dx=e.mesh.position.x-P.pos.x,dy=e.mesh.position.y-P.pos.y,dz=e.mesh.position.z-P.pos.z;
    const distance2=dx*dx+dy*dy+dz*dz;
    const detailed=e.avatarHighDetail ? distance2<farEnemy2 : distance2<nearEnemy2;
    if(detailed && r15EnemyTemplate && !e.avatar) attachEnemyAvatar(e);
    if(!e.avatar || e.avatarHighDetail===detailed) continue;
    e.avatarHighDetail=detailed;
    e.avatar.visible=detailed;
    for(const part of e.mesh.children){
      if(part!==e.avatar)part.visible=!detailed;
    }
    e.mat.transparent=detailed;
    e.mat.opacity=detailed?0:1;
    e.mat.depthWrite=!detailed;
    e.mat.needsUpdate=true;
  }
  for(const person of streetPeople){
    const dx=person.root.position.x-P.pos.x,dy=person.root.position.y-P.pos.y,dz=person.root.position.z-P.pos.z;
    const distance2=dx*dx+dy*dy+dz*dz;
    const detailed=person.avatarHighDetail ? distance2<farPed2 : distance2<nearPed2;
    if(detailed && r15EnemyTemplate && !person.avatar) attachStreetAvatar(person);
    if(!person.avatar || person.avatarHighDetail===detailed) continue;
    person.avatarHighDetail=detailed;
    person.avatar.visible=detailed;
    person.placeholder.forEach(part=>part.visible=!detailed);
  }
}

const cityProxyBatches=[];
function buildCityProxyBatches(){
  if(cityProxyBatches.length)return;
  const records=buildingMeshes.filter(b=>!b.worldOnly && b.materialVariant!==undefined);
  const bucket=Array.from({length:colorPalette.length},()=>[]);
  for(const b of records)bucket[b.materialVariant].push(b);
  for(let i=0;i<bucket.length;i++){
    const mesh=new THREE.InstancedMesh(
      new THREE.BoxGeometry(1,1,1),buildingMaterialSets[i][0],bucket[i].length);
    mesh.frustumCulled=false;
    mesh.count=bucket[i].length;
    for(let j=0;j<bucket[i].length;j++)bucket[i][j].proxyIndex=j;
    cityProxyBatches.push({mesh,buildings:bucket[i]});
    scene.add(mesh);
  }
}
const proxyDummy=new THREE.Object3D();
function updateRenderVisibility(){
  window.__wwCityReady=true;
  updateActorLOD();
  buildCityProxyBatches();
  const wholeCity=renderDistance>=MAX_CITY_RENDER_DISTANCE;
  const detailLimitSq=Math.pow(wholeCity?700:renderDistance+80,2);
  const fullLimitSq=Math.pow(renderDistance+80,2);
  buildingMeshes.forEach(b=>{
    const dx=(b.minX+b.maxX)*.5-P.pos.x,dz=(b.minZ+b.maxZ)*.5-P.pos.z;
    const dist2=dx*dx+dz*dz;
    b.mesh.visible=dist2<=detailLimitSq;
  });
  for(const batch of cityProxyBatches){
    const {mesh,buildings}=batch;
    for(const b of buildings){
      const dx=(b.minX+b.maxX)*.5-P.pos.x,dz=(b.minZ+b.maxZ)*.5-P.pos.z;
      const dist2=dx*dx+dz*dz;
      const distant=wholeCity&&dist2>detailLimitSq&&dist2<=fullLimitSq;
      proxyDummy.position.copy(b.mesh.position);
      proxyDummy.rotation.set(0,0,0);
      proxyDummy.scale.set(distant?b.maxX-b.minX:0,
                           distant?b.h:0,distant?b.maxZ-b.minZ:0);
      proxyDummy.updateMatrix();
      mesh.setMatrixAt(b.proxyIndex,proxyDummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
    mesh.visible=wholeCity;
  }
  const actorLimitSq=Math.pow(Math.min(renderDistance+35,260),2);
  enemies.forEach(e=>{
    const dx=e.mesh.position.x-P.pos.x,dz=e.mesh.position.z-P.pos.z;
    e.mesh.visible=e.alive&&dx*dx+dz*dz<=actorLimitSq;
  });
  streetPeople.forEach(person=>{
    const dx=person.root.position.x-P.pos.x,dz=person.root.position.z-P.pos.z;
    person.root.visible=dx*dx+dz*dz<=actorLimitSq;
  });
}

function updateEnemyHpBars(){
  const v = new THREE.Vector3();
  enemies.forEach(e=>{
    if(!e.alive||!e.mesh.visible){ e.hpEl.style.display='none'; return; }
    const worldPoint=e.mesh.position.clone().add(new THREE.Vector3(0,1.9,0));
    const eye=camera.getWorldPosition(new THREE.Vector3());
    const toEnemy=worldPoint.clone().sub(eye);
    const distance=toEnemy.length();
    if(distance>42){ e.hpEl.style.display='none'; return; }
    raycaster.set(eye,toEnemy.normalize());
    raycaster.far=distance;
    const obstruction=raycaster.intersectObjects(nearbyBuildingMeshes(eye,distance+2),false)[0];
    raycaster.far=Infinity;
    if(obstruction&&obstruction.distance<distance-0.6){ e.hpEl.style.display='none'; return; }
    v.copy(worldPoint);
    v.project(camera);
    if(v.z<-1||v.z>1||Math.abs(v.x)>1.12||Math.abs(v.y)>1.12){ e.hpEl.style.display='none'; return; }
    const x=(v.x*0.5+0.5)*innerWidth, y=(-v.y*0.5+0.5)*innerHeight;
    e.hpEl.style.display='block';
    e.hpEl.style.left=x+'px'; e.hpEl.style.top=y+'px';
    e.hpEl.querySelector('.fill').style.width = Math.max(0,(e.hp/e.maxHp*100))+'%';
  });
}

function updateDebugPanel(){
  if(!debugOn) return;
  const list = document.getElementById('debugList');
  list.innerHTML='';
  groups.forEach((g,i)=>{
    const alive = g.members.filter(e=>e.alive).length;
    let status;
    if(alive>0) status = alive+' active';
    else {
      const remain = Math.max(0, RESPAWN_TIME - (performance.now()-(g.defeatedAt||performance.now()))/1000);
      status = 'respawn in '+remain.toFixed(0)+'s';
    }
    const row=document.createElement('div');
    row.className='row';
    row.innerHTML = `<span>Group ${i}</span><span>${status}</span>`;
    list.appendChild(row);
  });
}

function updateAbilityCooldownUI(){
  const map = {abSwingLeft:'swing',abSwingRight:'zip',abWebshot:'webshot',abMelee:'melee'};
  const maxes = {swing:0.25, zip:0.15, webshot:0.5, melee:0.45};
  for(const id in map){
    const cd = P.cooldowns[map[id]];
    const pct = Math.max(0,Math.min(1, cd/maxes[map[id]]))*100;
    document.querySelector('#'+id+' .cd').style.height = pct+'%';
  }
  document.querySelector('#abZip .cd').style.height = P.jumpCharging ? Math.min(100,P.jumpChargeT/MAX_JUMP_CHARGE*100)+'%' : '0%';
  document.querySelector('#abPull .cd').style.height = P.diving ? '100%' : '0%';
  document.querySelector('#abBlock .cd').style.height = P.blocking
    ? '100%'
    : Math.max(0,Math.min(1,P.cooldowns.parry/0.72))*100+'%';
}

// ---------------------------------------------------------------------------------------
// GAME LOOP
// ---------------------------------------------------------------------------------------
let last = performance.now();
let hudFrame=0;
function tick(){
  requestAnimationFrame(tick);
  const now = performance.now();
  let dt = (now-last)/1000; last=now;
  dt = Math.min(dt, 0.05);
  if(animatedWater) oceanUniforms.time.value=now*0.001;

  updateZoomInput(dt);
  if(hitStopT>0)hitStopT=Math.max(0,hitStopT-dt);
  else if(!paused){
    updatePlayer(dt);
    updateEnemies(dt);
    updateGroups(dt);
    updateProjectiles(dt);
  }
  updateSpeedLines(dt);
  updateCamera(dt);
  if(cameraShakeT>0){
    cameraShakeT=Math.max(0,cameraShakeT-dt);
    const strength=cameraShakeT*0.9;
    camera.position.x+=(Math.random()-.5)*strength;
    camera.position.y+=(Math.random()-.5)*strength;
  }

  // rope visuals
  player.updateMatrixWorld(true);
  const leftOrigin=visibleWebHandWorld('left',handL);
  const rightOrigin=visibleWebHandWorld('right',handR);
  const swingWebVisible=P.state==='swing' || (P.state==='climb' && P.wallRunFromSwing);
  if(swingWebVisible && P.swingGroundPullT>0 && P.swingGroundPullAnchors.left){
    setSwingRope(ropeLine,leftOrigin,P.swingGroundPullAnchors.left);
  } else if(swingWebVisible && P.swingWebs.left.anchor){
    setSwingRope(ropeLine,leftOrigin,P.swingWebs.left.anchor);
  } else ropeLine.visible=false;
  if(swingWebVisible && P.swingGroundPullT>0 && P.swingGroundPullAnchors.right){
    setSwingRope(ropeLineRight,rightOrigin,P.swingGroundPullAnchors.right);
  } else if(swingWebVisible && P.swingWebs.right.anchor){
    setSwingRope(ropeLineRight,rightOrigin,P.swingWebs.right.anchor);
  } else ropeLineRight.visible=false;
  if(P.state==='zip' && zipTarget){
    zipLine.visible=true;
    zipLine.geometry.setFromPoints([player.position.clone().add(new THREE.Vector3(0,1.2,0)), zipTarget]);
  } else zipLine.visible=false;
  if(comboChainMode==='pull' && pullTarget && pullTarget.alive){
    setSwingRope(comboLine,rightOrigin,pullTarget.mesh.position.clone().add(new THREE.Vector3(0,0.8,0)));
  } else comboLine.visible=false;

  document.getElementById('healthBarInner').style.width = P.hp+'%';
  // UI targeting does not need a full scene raycast at render-frame frequency.
  // Ability activation still performs its own immediate accurate raycast.
  if((hudFrame&1)===0) updateCrosshair();
  if((hudFrame++&3)===0){
    // Player-local map needn't redraw 15×/second on this much larger world.
    if((hudFrame&7)===1)drawMinimap();
    updateEnemyHpBars();
    updateDebugPanel();
  }
  if((hudFrame%16)===0) updateRenderVisibility();
  if((hudFrame&1)===0) updateAbilityCooldownUI();

  renderer.render(scene, camera);
}
if(new URLSearchParams(location.search).has('qa')){
  window.__webWeaversQA={
    start:startGame,
    syntheticSwing(){
      startGame();
      P.pos.copy(PLAYER_SPAWN).add(new THREE.Vector3(0,28,0));
      cameraLead.set(0,0,0);
      P.vel.set(0,-3,-20);
      P.state='swing';
      P.activeSwingHand='left';
      const web=P.swingWebs.left;
      web.anchor=P.pos.clone().add(new THREE.Vector3(-8,30,-24));
      web.physicsPivot=web.anchor.clone();
      web.length=P.pos.distanceTo(web.anchor);
      web.targetLength=web.length-7;
      web.fallCatch=false;
      P.swingAssisted=true;
      P.swingPhase='descent';
      P.swingHasDescended=true;
      P.swingAge=P.swingPhaseT=0;
      P.swingPeakFlat=Math.hypot(P.vel.x,P.vel.z);
      P.swingBottomSpeed=0;
      return this.snapshot();
    },
    setInput(code,on){keys[code]=on;},
    release(){releaseSwing(null,true);},
    step(seconds){
      const wasPaused=paused;paused=false;
      for(let remaining=seconds;remaining>0;remaining-=1/120)updatePlayer(Math.min(1/120,remaining));
      paused=wasPaused;
      return this.snapshot();
    },
    snapshot(){
      const web=P.activeSwingHand?P.swingWebs[P.activeSwingHand]:null;
      return {state:P.state,phase:P.swingPhase,pos:P.pos.toArray(),vel:P.vel.toArray(),speed:P.vel.length(),
        ropeLength:web?.length||0,anchorDistance:web?.anchor?P.pos.distanceTo(web.anchor):0,activeHand:P.activeSwingHand};
    }
  };
}
// Cull distant city buildings before the FIRST render of the expanded island.
updateRenderVisibility();
tick();

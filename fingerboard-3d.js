import * as THREE from './assets/vendor/three160/three.module.js';
import { GLTFLoader } from './assets/vendor/three160/loaders/GLTFLoader.js';

// Keep trick helpers inline: the native app server serves .mjs as binary, so
// WebKit rejects an imported .mjs module before the park picker can initialize.
function releaseTrick(sequence, role, time, windowMs = 1000) {
  const recent = sequence.filter(item => time - item.time <= windowMs);
  recent.push({ role, time });
  const pair = recent.slice(-2).map(item => item.role).join(',');
  const trick = pair === 'front,back' ? 'OLLIE' : pair === 'back,front' ? 'NOLLIE' : null;
  return { trick, sequence: trick ? [] : recent.slice(-1) };
}

function arrowReleaseTrick(sequence, direction, time, windowMs = 1000) {
  const recent = sequence.filter(item => time - item.time <= windowMs);
  recent.push({ direction, time });
  const pair = recent.slice(-2).map(item => item.direction).join(',');
  const trick = pair === 'UP,DOWN' ? 'OLLIE' : pair === 'DOWN,UP' ? 'NOLLIE' : null;
  return { trick, sequence: trick ? [] : recent.slice(-1) };
}

function airTrickForArrow(code, airborne, alreadyFlipped) {
  if (!airborne || alreadyFlipped) return null;
  return code === 'ArrowLeft' ? 'KICKFLIP' : code === 'ArrowRight' ? 'HEELFLIP' : null;
}

function mouseYawDelta(deltaX, viewportWidth) {
  return viewportWidth > 0 ? -(deltaX / viewportWidth) * Math.PI * .9 : 0;
}

function shouldDrive(mousePressed, touchDriving, keyboardDirection) {
  return !mousePressed && (touchDriving || keyboardDirection !== 0);
}

function cycleParkId(parkIds, selectedId, direction) {
  if (!parkIds.length) return null;
  const selectedIndex = parkIds.indexOf(selectedId);
  const index = selectedIndex < 0 ? 0 : (selectedIndex + Math.sign(direction) + parkIds.length) % parkIds.length;
  return parkIds[index];
}

const $ = selector => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TAU = Math.PI * 2;
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x64736d);
scene.fog = new THREE.Fog(0x64736d, 48, 100);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 4.8, 21.8);
camera.lookAt(0, 0, 2);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
function resizeViewport() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = 48;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
}
resizeViewport();
document.body.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x625f54, 2.15));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-8, 15, 10);
sun.castShadow = false;
scene.add(sun);

const parkOptions = [
  { id: 'dartford', name: 'Dartford Central', file: './assets/models/fingerboard-parks/dartford.glb', rotate: false },
  { id: 'gravesend', name: 'Gravesend', file: './assets/models/fingerboard-parks/gravesend.glb', rotate: true },
  { id: 'finsbury', name: 'Finsbury Park', file: './assets/models/fingerboard-parks/finsbury.glb', rotate: true }
];
let selectedPark = localStorage.twoFingersPark || 'dartford';
let parkReady = false;
const parkGroup = new THREE.Group();
scene.add(parkGroup);
let parkBaseY = 0, activeParkPlacement = null, surfaceCheckTimer = 0;
const parkRaycaster = new THREE.Raycaster();
const loader = new GLTFLoader();
const parkGround = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x68736a, roughness: 1 }));
parkGround.rotation.x = -Math.PI / 2; parkGround.position.y = -.45; parkGround.receiveShadow = true; scene.add(parkGround);
function loadPark(id) {
  const park = parkOptions.find(item => item.id === id) || parkOptions[0];
  selectedPark = park.id; localStorage.twoFingersPark = park.id;
  parkReady = false;
  const startButton = $('#start');
  if (startButton) { startButton.disabled = true; startButton.textContent = `Loading ${park.name}…`; }
  $('#park-name').textContent = park.name;
  $('#park-label').textContent = park.name;
  while (parkGroup.children.length) parkGroup.remove(parkGroup.children[0]);
  loader.load(park.file, gltf => {
    if (selectedPark !== park.id) return;
    const model = gltf.scene;
    const oriented = new THREE.Group();
    oriented.rotation.y = park.rotate ? Math.PI / 2 : 0;
    oriented.add(model);
    const bounds = new THREE.Box3().setFromObject(oriented);
    const center = bounds.getCenter(new THREE.Vector3());
    const dimensions = bounds.getSize(new THREE.Vector3());
    const span = Math.max(dimensions.x, dimensions.z);
    const scale = 39 / span;
    const placement = new THREE.Group();
    const verticalScale = Math.min(scale, 4.8 / Math.max(dimensions.y, .001));
    placement.scale.set(scale, verticalScale, scale);
    placement.position.set(-center.x * scale, -bounds.min.y * verticalScale - .62, -center.z * scale);
    placement.add(oriented);
    model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    parkGroup.add(placement);
    activeParkPlacement = placement;
    parkReady = true;
    if (startButton) { startButton.disabled = false; startButton.textContent = 'Start skating ↗'; }
    placement.updateMatrixWorld(true);
    parkRaycaster.set(new THREE.Vector3(0, 40, 8.5), new THREE.Vector3(0, -1, 0));
    const groundHit = parkRaycaster.intersectObject(placement, true)[0];
    parkBaseY = groundHit ? groundHit.point.y : 0;
    if (!state.air) state.y = parkBaseY + .34;
    $('#park-name').textContent = park.name;
    $('#park-label').textContent = park.name;
  }, event => { if (event.total) { const percent = Math.round(event.loaded / event.total * 100); $('#park-name').textContent = `${park.name} · ${percent}%`; if (startButton) startButton.textContent = `Loading · ${percent}%`; } }, error => { $('#park-name').textContent = `${park.name} · unavailable`; if (startButton) { startButton.disabled = false; startButton.textContent = 'Retry map'; } console.error(`Could not load ${park.name}.`, error); });
}

function makeBoard() {
  const root = new THREE.Group();
  const deckMaterial = new THREE.MeshStandardMaterial({ color: 0xd8ff38, roughness: .48, metalness: .03 });
  const underside = new THREE.MeshStandardMaterial({ color: 0xff4b35, roughness: .55 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(.64, .12, 2.15, 3, 1, 8), [deckMaterial, deckMaterial, deckMaterial, underside, deckMaterial, deckMaterial]);
  deck.castShadow = true;
  root.add(deck);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(.63, .11, .33), deckMaterial);
  nose.position.z = -1.08; nose.rotation.x = -.18; nose.position.y = .06; nose.castShadow = true; root.add(nose);
  const tail = nose.clone(); tail.position.z = 1.08; tail.rotation.x = .18; root.add(tail);
  const truckMaterial = new THREE.MeshStandardMaterial({ color: 0xd5d6d0, roughness: .28, metalness: .78 });
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: .58 });
  for (const z of [-.72, .72]) {
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .82, 10), truckMaterial);
    axle.rotation.z = Math.PI / 2; axle.position.set(0, -.15, z); axle.castShadow = true; root.add(axle);
    const base = new THREE.Mesh(new THREE.BoxGeometry(.35, .09, .3), truckMaterial);
    base.position.set(0, -.1, z); root.add(base);
    for (const x of [-.43, .43]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .1, 14), wheelMaterial);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, -.18, z); wheel.castShadow = true; root.add(wheel);
    }
  }
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(.18, 1.15), new THREE.MeshBasicMaterial({ color: 0x171717 }));
  mark.rotation.x = -Math.PI / 2; mark.position.y = .066; root.add(mark);
  root.scale.setScalar(.86);
  return root;
}

const boardMesh = new THREE.Group();
const fallbackBoard = makeBoard();
boardMesh.add(fallbackBoard);
scene.add(boardMesh);

new GLTFLoader().load(
  './assets/models/skateboard-free-model.glb',
  gltf => {
    const model = gltf.scene;
    let bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());

    // The downloaded model's longest horizontal axis becomes the board's travel axis.
    if (size.x > size.z) model.rotation.y = Math.PI / 2;
    bounds = new THREE.Box3().setFromObject(model);
    bounds.getSize(size);
    model.scale.setScalar(1.9 / Math.max(size.x, size.z));

    bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y += -.27 - bounds.min.y;
    model.traverse(child => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });

    boardMesh.add(model);
    boardMesh.remove(fallbackBoard);
  },
  undefined,
  error => console.error('Could not load the skateboard model.', error)
);

const state = {
  x: 0, y: .34, z: 8.5, vy: 0, pitch: 0, roll: 0, yaw: 0,
  pitchV: 0, rollV: 0, yawV: 0, air: false, flipTurns: 0,
  popTime: 0, popName: 'OLLIE', grinding: false, grindTime: 0
};

const particles = [];
function burst(color = 0xd8ff38, amount = 15) {
  for (let i = 0; i < amount; i++) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, .05), new THREE.MeshBasicMaterial({ color }));
    mesh.position.set(state.x, state.y, state.z);
    scene.add(mesh);
    particles.push({ mesh, velocity: new THREE.Vector3((Math.random() - .5) * 3, Math.random() * 2.5, (Math.random() - .5) * 3), life: .55 + Math.random() * .35 });
  }
}

let running = false, paused = false, score = 0, best = Number(localStorage.twoFingers3DBest) || 0;
let speed = 5.4, elapsed = 0, last = performance.now(), trickTimer = 0, soundOn = true;
$('#best').textContent = best;

function tone(frequency, duration = .07, type = 'square', volume = .035) {
  if (!soundOn) return;
  try {
    const audio = tone.audio || (tone.audio = new AudioContext());
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
  } catch {}
}

function showTrick(name, points, bank = true) {
  $('#trick span').textContent = name;
  $('#trick small').textContent = points ? `+${points}` : 'square it up';
  $('#trick').classList.add('show');
  trickTimer = 1.25;
  if (bank) tone(460, .08);
}

function reset() {
  Object.assign(state, { x: 0, y: parkBaseY + .34, z: 8.5, vy: 0, pitch: 0, roll: 0, yaw: 0, pitchV: 0, rollV: 0, yawV: 0, air: false, flipTurns: 0, popTime: 0, popName: 'OLLIE', grinding: false, grindTime: 0 });
  arrowReleases = [];
  contactReleases = [];
  score = elapsed = 0; speed = 5.4;
  $('#score').textContent = '0';
}

function start() {
  if (!parkReady) { loadPark(selectedPark); return; }
  reset(); running = true; paused = false;
  $('#intro').classList.add('hidden'); $('#gameover').classList.add('hidden'); $('#paused').classList.add('hidden');
}

function finish() {
  if (!running) return;
  running = false; tone(82, .28, 'sawtooth', .06); burst(0xff4b35, 24);
  best = Math.max(best, Math.floor(score)); localStorage.twoFingers3DBest = best; $('#best').textContent = best;
  $('#final').textContent = `${Math.floor(score).toLocaleString()} points · ${Math.floor(elapsed)} second run`;
  $('#gameover').classList.remove('hidden');
}

function pop(name = 'OLLIE', power = 7.4) {
  if (!running || paused || state.air) return;
  window.dispatchEvent(new CustomEvent('two-fingers-pop', { detail: name }));
  state.air = true; state.grinding = false; state.vy = power;
  state.pitchV = name === 'NOLLIE' ? 1.1 : -1.1;
  state.flipTurns = 0; state.popTime = elapsed; state.popName = name;
  tone(150, .06, 'square', .055); burst(0xff4b35, 9);
}

function land(surface = parkBaseY + .34) {
  const pitch = Math.abs(wrap(state.pitch)), roll = Math.abs(wrap(state.roll));
  if (state.flipTurns && (pitch > .43 || roll > .4)) { finish(); return; }
  state.y = surface; state.vy = state.pitchV = state.rollV = state.yawV = 0;
  state.pitch = state.roll = 0; state.air = false;
  let name = elapsed - state.popTime > .55 ? `BIG ${state.popName}` : state.popName;
  let points = state.flipTurns ? 520 : Math.round((elapsed - state.popTime) * 240);
  score += points; showTrick(name, points); burst(state.flipTurns ? 0xd8ff38 : 0x3274ff, 17);
}

const pointers = new Map();
const nativeTrackpadIDs = new Set();
let backId = null, frontId = null;
let contactReleases = [];
let mousePressed = false, mouseLastX = null;
function assignPointers() {
  const list = [...pointers.values()];
  if (list.length !== 2 || list.some(pointer => pointer.role === 'front' || pointer.role === 'back')) return;
  list.sort((a, b) => a.y - b.y);
  frontId = list[0].id; backId = list[1].id;
  list[0].role = 'front'; list[1].role = 'back';
}
function contactDown(id, x, y, source = 'screen') {
  pointers.set(id, { id, x, y, sx: x, sy: y, time: performance.now(), role: 'extra', source });
  assignPointers();
}
function contactMove(id, x, y) {
  const pointer = pointers.get(id); if (!pointer) return;
  pointer.x = x; pointer.y = y;
}
function contactUp(id) {
  const lifted = pointers.get(id);
  if (!lifted) return;
  const now = performance.now();
  if (lifted.role === 'front' || lifted.role === 'back') {
    const result = releaseTrick(contactReleases, lifted.role, now);
    contactReleases = result.sequence;
    if (result.trick) pop(result.trick);
  }
  pointers.delete(id);
  if (id === frontId) frontId = null;
  if (id === backId) backId = null;
  if (!pointers.size) { frontId = backId = null; }
  assignPointers();
}
function pointerDown(event) {
  if (event.pointerType === 'mouse') {
    if (event.button !== 0) return;
    event.preventDefault();
    mousePressed = true;
    mouseLastX = event.clientX;
    renderer.domElement.setPointerCapture?.(event.pointerId);
    return;
  }
  event.preventDefault();
  contactDown(event.pointerId, event.clientX, event.clientY);
  renderer.domElement.setPointerCapture?.(event.pointerId);
}
function pointerMove(event) {
  if (event.pointerType === 'mouse') {
    if (mouseLastX === null) return;
    event.preventDefault();
    state.yaw = wrap(state.yaw + mouseYawDelta(event.clientX - mouseLastX, innerWidth));
    mouseLastX = event.clientX;
    return;
  }
  event.preventDefault();
  contactMove(event.pointerId, event.clientX, event.clientY);
}
function pointerUp(event) {
  if (event.pointerType === 'mouse') {
    mousePressed = false;
    mouseLastX = null;
    return;
  }
  contactUp(event.pointerId);
}
renderer.domElement.addEventListener('pointerdown', pointerDown, { passive: false });
renderer.domElement.addEventListener('pointermove', pointerMove, { passive: false });
renderer.domElement.addEventListener('pointerup', pointerUp, { passive: false });
renderer.domElement.addEventListener('pointercancel', pointerUp, { passive: false });

let nativeTrackpadReady = false;
window.__rodSpaceNativeTrackpad = {
  update(touches) {
    if (!nativeTrackpadReady) {
      nativeTrackpadReady = true;
      const label = document.querySelector('#input-label');
      const hint = document.querySelector('#input-hint');
      if (label) label.textContent = 'Trackpad: two fingers';
      if (hint) hint.textContent = 'resting contacts detected';
    }

    const nextIDs = new Set();
    for (const touch of touches) {
      const id = `trackpad-${touch.id}`;
      const x = touch.x * innerWidth;
      const y = (1 - touch.y) * innerHeight;
      nextIDs.add(id);
      if (nativeTrackpadIDs.has(id)) contactMove(id, x, y);
      else contactDown(id, x, y, 'trackpad');
    }
    for (const id of nativeTrackpadIDs) {
      if (!nextIDs.has(id)) contactUp(id);
    }
    nativeTrackpadIDs.clear();
    for (const id of nextIDs) nativeTrackpadIDs.add(id);
  }
};

renderer.domElement.addEventListener('wheel', event => {
  event.preventDefault();
}, { passive: false });

const keys = new Set();
let arrowReleases = [];
addEventListener('keydown', event => {
  keys.add(event.code);
  if (!running && ['Enter', 'Space'].includes(event.code)) start();
  if (event.code.startsWith('Arrow')) event.preventDefault();
  const airTrick = airTrickForArrow(event.code, state.air, state.flipTurns > 0);
  if (airTrick) { state.rollV = airTrick === 'KICKFLIP' ? -19 : 19; state.flipTurns = 1; showTrick(airTrick, 0, false); }
  if (event.code === 'Escape') togglePause();
});
addEventListener('keyup', event => {
  keys.delete(event.code);
  if (event.code !== 'ArrowUp' && event.code !== 'ArrowDown') return;
  event.preventDefault();
  const now = performance.now();
  const direction = event.code === 'ArrowUp' ? 'UP' : 'DOWN';
  const result = arrowReleaseTrick(arrowReleases, direction, now);
  arrowReleases = result.sequence;
  if (result.trick) pop(result.trick);
});

function nearbySurface() {
  return parkBaseY + .34;
}

function update(dt) {
  const keyboardDirection = keys.has('KeyW') && keys.has('KeyS') ? 1 : 0;
  const touchDriving = pointers.size >= 2;
  const brakingOnTail = mousePressed || (pointers.size === 1 && [...pointers.values()][0]?.role === 'back');
  const driving = shouldDrive(brakingOnTail, touchDriving, keyboardDirection);
  const direction = touchDriving ? 1 : keyboardDirection;
  if (keys.has('KeyA')) state.yaw = wrap(state.yaw + 2.15 * dt);
  if (keys.has('KeyD')) state.yaw = wrap(state.yaw - 2.15 * dt);
  if (touchDriving) {
    const boardContacts = [pointers.get(frontId), pointers.get(backId)].filter(Boolean);
    const trackpadCentre = boardContacts.reduce((sum, pointer) => sum + pointer.x / innerWidth, 0) / boardContacts.length;
    const offset = trackpadCentre - .5;
    const deadZone = .12;
    const steering = Math.abs(offset) <= deadZone
      ? 0
      : Math.sign(offset) * Math.min(1, (Math.abs(offset) - deadZone) / (.5 - deadZone));
    state.yaw = wrap(state.yaw - steering * 2.15 * dt);
  }
  surfaceCheckTimer -= dt;
  if (surfaceCheckTimer <= 0 && activeParkPlacement) {
    surfaceCheckTimer = .08;
    parkRaycaster.set(new THREE.Vector3(state.x, 40, state.z), new THREE.Vector3(0, -1, 0));
    const hit = parkRaycaster.intersectObject(activeParkPlacement, true)[0];
    if (hit) parkBaseY = hit.point.y;
  }
  elapsed += dt; speed = 5.4; if (driving) score += dt * 9;
  trickTimer -= dt; if (trickTimer < 0) $('#trick').classList.remove('show');

  // The board moves through the selected scanned park.
  if (driving) {
    state.x -= Math.sin(state.yaw) * speed * dt * direction;
    state.z -= Math.cos(state.yaw) * speed * dt * direction;
  }
  if (Math.abs(state.x) > 14.3 || Math.abs(state.z) > 21.3) finish();

  if (state.air) {
    state.vy -= 15.8 * dt; state.y += state.vy * dt;
    state.pitch += state.pitchV * dt; state.roll += state.rollV * dt; state.yaw += state.yawV * dt;
    state.pitchV *= Math.pow(.987, dt * 60); state.rollV *= Math.pow(.992, dt * 60); state.yawV *= Math.pow(.985, dt * 60);
    if (pointers.size < 2) { state.pitchV -= wrap(state.pitch) * dt * 3.2; state.rollV -= wrap(state.roll) * dt * .75; }
    if (Math.abs(state.roll) >= TAU && !state.flipTurns) { state.flipTurns = 1; showTrick(state.roll > 0 ? 'HEELFLIP' : 'KICKFLIP', 0, false); }
  }
  const surface = nearbySurface();
  if (state.air && state.vy <= 0 && state.y <= surface) land(surface);
  if (!state.air) {
    state.y = surface;
    state.pitch += ((brakingOnTail ? .24 : 0) - state.pitch) * Math.min(1, dt * 11);
  }

  state.yaw = wrap(state.yaw);
  boardMesh.position.set(state.x, state.y, state.z);
  boardMesh.rotation.order = 'YXZ';
  boardMesh.rotation.set(state.pitch, state.yaw, state.roll);
  const cameraOffset = new THREE.Vector3(0, 4.8, 4.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
  const desiredCamera = new THREE.Vector3(state.x, state.y, state.z).add(cameraOffset);
  camera.position.lerp(desiredCamera, Math.min(1, dt * 4.5));
  camera.lookAt(state.x - Math.sin(state.yaw) * 2.2, state.y + .2, state.z - Math.cos(state.yaw) * 2.2);
  $('#score').textContent = Math.floor(score).toLocaleString();
}

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(.025, (now - last) / 1000 || 0); last = now;
  if (running && !paused) update(dt);
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i]; particle.life -= dt; particle.velocity.y -= 5 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.scale.setScalar(clamp(particle.life * 1.8, 0, 1));
    if (particle.life <= 0) { scene.remove(particle.mesh); particles.splice(i, 1); }
  }
  renderer.render(scene, camera);
}

function togglePause() {
  if (!running) return; paused = !paused; $('#paused').classList.toggle('hidden', !paused);
}
$('#start').addEventListener('click', start);
$('#again').addEventListener('click', start);
$('#previous-park').addEventListener('click', () => loadPark(cycleParkId(parkOptions.map(park => park.id), selectedPark, -1)));
$('#next-park').addEventListener('click', () => loadPark(cycleParkId(parkOptions.map(park => park.id), selectedPark, 1)));
$('#pause').addEventListener('click', togglePause);
$('#resume').addEventListener('click', togglePause);
$('#sound').addEventListener('click', () => { soundOn = !soundOn; $('#sound').textContent = soundOn ? '♪' : '×'; });
$('#ollie').addEventListener('click', () => pop('OLLIE'));
$('#nollie').addEventListener('click', () => pop('NOLLIE'));
$('#flip').addEventListener('click', () => {
  if (!state.air || state.flipTurns) return;
  state.rollV = -19; state.flipTurns = 1; showTrick('KICKFLIP', 0, false);
});
loadPark(selectedPark);
addEventListener('resize', resizeViewport);

boardMesh.position.set(state.x, state.y, state.z);
requestAnimationFrame(animate);

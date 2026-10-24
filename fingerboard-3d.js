import * as THREE from './assets/vendor/three160/three.module.js';
import { GLTFLoader } from './assets/vendor/three160/loaders/GLTFLoader.js';

const $ = selector => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TAU = Math.PI * 2;
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeadc);
scene.fog = new THREE.Fog(0xeeeadc, 38, 78);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 4.8, 21.8);
camera.lookAt(0, 0, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x625f54, 2.15));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-8, 15, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -8;
scene.add(sun);

function concreteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d');
  c.fillStyle = '#b7b3a7';
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1500; i++) {
    const shade = 145 + Math.random() * 70;
    c.fillStyle = `rgba(${shade},${shade},${shade - 5},${Math.random() * .11})`;
    c.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 2 + .4, Math.random() * 2 + .4);
  }
  c.strokeStyle = 'rgba(40,40,35,.16)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, 128); c.lineTo(256, 128); c.moveTo(128, 0); c.lineTo(128, 256); c.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const floorMaterial = new THREE.MeshStandardMaterial({ map: concreteTexture(), roughness: .94, metalness: .02 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 44), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
floor.receiveShadow = true;
scene.add(floor);

const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x393936, roughness: .88 });
for (const x of [-15.2, 15.2]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(.4, 2.4, 44), sideMaterial);
  wall.position.set(x, 1.2, 0);
  wall.receiveShadow = wall.castShadow = true;
  scene.add(wall);
}

for (const z of [-22.2, 22.2]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(30.8, 2.4, .4), sideMaterial);
  wall.position.set(0, 1.2, z); wall.receiveShadow = wall.castShadow = true; scene.add(wall);
}

// Warehouse frame and roof beams make the park read as one contained map.
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x555650, roughness: .55, metalness: .45 });
for (const x of [-14.7, 14.7]) for (const z of [-21.7, -7.3, 7.3, 21.7]) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(.22, 6.5, .22), frameMaterial);
  post.position.set(x, 3.25, z); post.castShadow = true; scene.add(post);
}
for (const z of [-21.7, -7.3, 7.3, 21.7]) {
  const beam = new THREE.Mesh(new THREE.BoxGeometry(30, .22, .28), frameMaterial);
  beam.position.set(0, 6.45, z); beam.castShadow = true; scene.add(beam);
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
  x: 0, y: .34, z: 17, vy: 0, pitch: 0, roll: 0, yaw: 0,
  pitchV: 0, rollV: 0, yawV: 0, air: false, flipTurns: 0,
  popTime: 0, popName: 'OLLIE', grinding: false, grindTime: 0
};

const obstacles = [];
const obstacleGroup = new THREE.Group();
scene.add(obstacleGroup);
const materials = {
  red: new THREE.MeshStandardMaterial({ color: 0xff4b35, roughness: .58 }),
  acid: new THREE.MeshStandardMaterial({ color: 0xd8ff38, roughness: .54 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1a1a19, roughness: .8 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xc2c3bd, roughness: .26, metalness: .82 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x8e8c84, roughness: .92 })
};

function addBox(parent, size, position, material, rotation = null) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createObstacle(type, z, forcedX = null) {
  const root = new THREE.Group();
  root.position.z = z;
  let x = 0, width = 2.6, height = .7, length = 5;
  if (type === 'rail') {
    x = forcedX ?? (Math.random() - .5) * 3.4;
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, 4.8, 10), materials.steel);
    rail.rotation.x = Math.PI / 2; rail.position.set(x, .72, 0); rail.castShadow = true; root.add(rail);
    for (const dz of [-1.9, 1.9]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .72, 8), materials.steel);
      leg.position.set(x, .36, dz); root.add(leg);
    }
    width = .5; height = .72;
  } else if (type === 'ledge') {
    x = forcedX ?? (Math.random() < .5 ? -2.3 : 2.3);
    addBox(root, [3, .68, 4.4], [x, .34, 0], materials.concrete);
    addBox(root, [3.05, .08, 4.45], [x, .72, 0], materials.acid);
    width = 3; height = .76; length = 4.4;
  } else if (type === 'cone') {
    x = forcedX ?? (Math.random() - .5) * 4.2;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.36, 1.25, 16), materials.red);
    cone.position.set(x, .63, 0); cone.castShadow = true; root.add(cone);
    addBox(root, [.85, .08, .85], [x, .04, 0], materials.dark);
    width = .8; height = 1.25; length = 1;
  } else if (type === 'gap') {
    addBox(root, [20, .025, 4.8], [0, .015, 0], materials.dark);
    for (const side of [-2.38, 2.38]) addBox(root, [20, .06, .08], [0, .05, side], materials.red);
    width = 20; height = -4; length = 4.8;
  } else {
    x = forcedX ?? (Math.random() - .5) * 3;
    const ramp = addBox(root, [3.3, .25, 4], [x, .4, 0], materials.concrete, [-.18, 0, 0]);
    ramp.geometry.translate(0, 0, 0);
    width = 3.3; height = .75; length = 4;
  }
  obstacleGroup.add(root);
  obstacles.push({ type, root, x, width, height, length, hit: false, scored: false });
}

function populate() {
  while (obstacleGroup.children.length) obstacleGroup.remove(obstacleGroup.children[0]);
  obstacles.length = 0;
  createObstacle('rail', 10, -3.2);
  createObstacle('ledge', 7, 5.3);
  createObstacle('ramp', 2, -5.8);
  createObstacle('rail', -1.5, 2.8);
  createObstacle('cone', -5, -1.6);
  createObstacle('ledge', -8.5, -5.5);
  createObstacle('ramp', -13, 3.8);
  createObstacle('rail', -16, 0);
  // Two small gap strips create jump lines without turning the map into a corridor.
  createObstacle('gap', -11, 0);
}

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
  Object.assign(state, { x: 0, y: .34, z: 17, vy: 0, pitch: 0, roll: 0, yaw: 0, pitchV: 0, rollV: 0, yawV: 0, air: false, flipTurns: 0, popTime: 0, popName: 'OLLIE', grinding: false, grindTime: 0 });
  arrowReleases = [];
  contactReleases = [];
  score = elapsed = 0; speed = 5.4; populate();
  $('#score').textContent = '0';
}

function start() {
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
  state.air = true; state.grinding = false; state.vy = power;
  state.pitchV = name === 'NOLLIE' ? 1.1 : -1.1;
  state.flipTurns = 0; state.popTime = elapsed; state.popName = name;
  tone(150, .06, 'square', .055); burst(0xff4b35, 9);
}

function land(surface = .34, obstacle = null) {
  const pitch = Math.abs(wrap(state.pitch)), roll = Math.abs(wrap(state.roll));
  if (state.flipTurns && (pitch > .43 || roll > .4)) { finish(); return; }
  state.y = surface; state.vy = state.pitchV = state.rollV = state.yawV = 0;
  state.pitch = state.roll = 0; state.air = false;
  let name = elapsed - state.popTime > .55 ? `BIG ${state.popName}` : state.popName;
  let points = state.flipTurns ? 520 : Math.round((elapsed - state.popTime) * 240);
  if (obstacle?.type === 'rail') { name = '50–50 GRIND'; points += 600; state.grinding = true; state.grindTime = .7; }
  score += points; showTrick(name, points); burst(state.flipTurns ? 0xd8ff38 : 0x3274ff, 17);
}

const pointers = new Map();
const nativeTrackpadIDs = new Set();
let backId = null, frontId = null;
let contactReleases = [];
function assignPointers() {
  const list = [...pointers.values()].sort((a, b) => a.x - b.x);
  if (list.length === 1 && (list[0].role === 'back' || list[0].role === 'front')) {
    backId = list[0].role === 'back' ? list[0].id : null;
    frontId = list[0].role === 'front' ? list[0].id : null;
    return;
  }
  backId = list[0]?.id ?? null; frontId = list.at(-1)?.id ?? null;
  list.forEach(p => p.role = p.id === backId ? 'back' : p.id === frontId ? 'front' : 'extra');
}
function contactDown(id, x, y, source = 'screen') {
  pointers.set(id, { id, x, y, sx: x, sy: y, time: performance.now(), role: 'extra', source });
  assignPointers();
}
function contactMove(id, x, y) {
  const pointer = pointers.get(id); if (!pointer) return;
  const dx = x - pointer.x;
  pointer.x = x; pointer.y = y;
  if (!running || paused) return;
  if (pointers.size >= 2) state.yaw = wrap(state.yaw - dx * .0024);
}
function contactUp(id) {
  const lifted = pointers.get(id);
  if (!lifted) return;
  const now = performance.now();
  if (lifted.role === 'front' || lifted.role === 'back') {
    contactReleases = contactReleases.filter(input => now - input.time < 650);
    contactReleases.push({ role: lifted.role, time: now });
    const sequence = contactReleases.slice(-2).map(input => input.role).join(',');
    if (sequence === 'back,front') { pop('OLLIE'); contactReleases = []; }
    if (sequence === 'front,back') { pop('NOLLIE'); contactReleases = []; }
  }
  pointers.delete(id); assignPointers();
}
function pointerDown(event) {
  if (event.pointerType === 'mouse') return;
  event.preventDefault();
  contactDown(event.pointerId, event.clientX, event.clientY);
  renderer.domElement.setPointerCapture?.(event.pointerId);
}
function pointerMove(event) {
  if (event.pointerType === 'mouse') return;
  event.preventDefault();
  contactMove(event.pointerId, event.clientX, event.clientY);
}
function pointerUp(event) {
  if (event.pointerType === 'mouse') return;
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
  if (event.code === 'ArrowUp' || event.code === 'ArrowDown') event.preventDefault();
  if (event.code === 'Escape') togglePause();
});
addEventListener('keyup', event => {
  keys.delete(event.code);
  if (event.code !== 'ArrowUp' && event.code !== 'ArrowDown') return;
  event.preventDefault();
  const now = performance.now();
  const direction = event.code === 'ArrowUp' ? 'UP' : 'DOWN';
  arrowReleases = arrowReleases.filter(input => now - input.time < 700);
  arrowReleases.push({ direction, time: now });
  const sequence = arrowReleases.slice(-2).map(input => input.direction).join(',');
  if (sequence === 'UP,DOWN') { pop('OLLIE'); arrowReleases = []; }
  if (sequence === 'DOWN,UP') { pop('NOLLIE'); arrowReleases = []; }
});

function nearbySurface() {
  let surface = .34, object = null;
  for (const obstacle of obstacles) {
    const dz = Math.abs(obstacle.root.position.z - state.z);
    const inLength = dz < obstacle.length * .5 + .45;
    const inWidth = Math.abs(state.x - obstacle.x) < obstacle.width * .5;
    if (!inLength || !inWidth) continue;
    object = obstacle;
    if (obstacle.type === 'gap') surface = -5;
    else if (obstacle.type === 'ledge') surface = obstacle.height + .31;
    else if (obstacle.type === 'rail' && Math.abs(state.x - obstacle.x) < .26) surface = obstacle.height + .28;
    else if (obstacle.type === 'ramp') surface = .72;
  }
  return { surface, object };
}

function update(dt) {
  const keyboardDirection = keys.has('KeyW') && keys.has('KeyS') ? 1 : 0;
  const touchDriving = pointers.size >= 2;
  const driving = touchDriving || keyboardDirection !== 0;
  const direction = touchDriving ? 1 : keyboardDirection;
  if (keys.has('KeyA')) state.yaw = wrap(state.yaw + 2.15 * dt);
  if (keys.has('KeyD')) state.yaw = wrap(state.yaw - 2.15 * dt);
  elapsed += dt; speed = 5.4; if (driving) score += dt * 9;
  trickTimer -= dt; if (trickTimer < 0) $('#trick').classList.remove('show');

  // The board moves through one persistent park; the obstacles do not scroll past it.
  if (driving) {
    state.x -= Math.sin(state.yaw) * speed * dt * direction;
    state.z -= Math.cos(state.yaw) * speed * dt * direction;
  }
  if (Math.abs(state.x) > 14.3 || Math.abs(state.z) > 21.3) finish();

  if (state.grinding) {
    state.grindTime -= dt; score += dt * 260; state.y = .99; state.roll = state.pitch = 0;
    if (state.grindTime <= 0) { state.grinding = false; state.air = true; state.vy = 1.5; }
  } else {
    if (state.air) {
      state.vy -= 15.8 * dt; state.y += state.vy * dt;
      state.pitch += state.pitchV * dt; state.roll += state.rollV * dt; state.yaw += state.yawV * dt;
      state.pitchV *= Math.pow(.987, dt * 60); state.rollV *= Math.pow(.992, dt * 60); state.yawV *= Math.pow(.985, dt * 60);
      if (pointers.size < 2) { state.pitchV -= wrap(state.pitch) * dt * 3.2; state.rollV -= wrap(state.roll) * dt * .75; }
      if (Math.abs(state.roll) >= TAU && !state.flipTurns) { state.flipTurns = 1; showTrick(state.roll > 0 ? 'HEEFLIP' : 'KICKFLIP', 0, false); }
    }
    const { surface, object } = nearbySurface();
    if (state.air && state.vy <= 0 && state.y <= surface) land(surface, object);
    if (!state.air) {
      state.y = surface;
      const brakingOnTail = pointers.size === 1 && [...pointers.values()][0]?.role === 'back';
      state.pitch += ((brakingOnTail ? .24 : 0) - state.pitch) * Math.min(1, dt * 11);
    }
    if (surface < -1 && !state.air) finish();
    if (object?.type === 'cone' && Math.abs(object.root.position.z - state.z) < .72 && state.y < 1.25) finish();
    if (object?.type === 'ledge' && Math.abs(object.root.position.z - state.z) < object.length * .45 && state.y < object.height && !state.air) finish();
  }

  state.yaw = wrap(state.yaw);
  boardMesh.position.set(state.x, state.y, state.z);
  boardMesh.rotation.order = 'YXZ';
  boardMesh.rotation.set(state.pitch, state.yaw, state.roll);
  // Equal vertical and horizontal offsets make the follow camera roughly 45 degrees down.
  const cameraOffset = new THREE.Vector3(0, 4.8, 4.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
  const desiredCamera = new THREE.Vector3(state.x, 0, state.z).add(cameraOffset);
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
$('#pause').addEventListener('click', togglePause);
$('#resume').addEventListener('click', togglePause);
$('#sound').addEventListener('click', () => { soundOn = !soundOn; $('#sound').textContent = soundOn ? '♪' : '×'; });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
});

populate();
boardMesh.position.set(state.x, state.y, state.z);
requestAnimationFrame(animate);

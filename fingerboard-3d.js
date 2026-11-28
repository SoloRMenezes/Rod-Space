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

function airTrickForFlick(deltaX, threshold, airborne, alreadyFlipped) {
  if (!airborne || alreadyFlipped || Math.abs(deltaX) < threshold) return null;
  return deltaX < 0 ? 'KICKFLIP' : 'HEELFLIP';
}

function mouseYawDelta(deltaX, viewportWidth) {
  return viewportWidth > 0 ? (deltaX / viewportWidth) * Math.PI * 2 : 0;
}

function mousePointerDelta(event, pointerLocked, lastX) {
  return pointerLocked ? event.movementX : event.clientX - lastX;
}

function shouldDrive(mousePressed, touchDriving, keyboardDirection) {
  return !mousePressed && (touchDriving || keyboardDirection !== 0);
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

const parkModules = [
  { id: 'dartford', name: 'Dartford Central', file: './assets/models/fingerboard-parks/dartford.glb', rotate: false, position: [0, 0] },
  { id: 'finsbury', name: 'Finsbury Park', file: './assets/models/fingerboard-parks/finsbury.glb', rotate: true, position: [0, -86] },
  { id: 'gravesend', name: 'Gravesend', file: './assets/models/fingerboard-parks/gravesend.glb', rotate: true, position: [80, -86] }
];
const parkSpan = 54;
const parkPaths = [
  [[0, -26], [2, -34], [2, -50], [0, -59]],
  [[8, -86], [24, -80], [43, -80], [61, -86]]
];
let parkReady = false;
const parkGroup = new THREE.Group();
scene.add(parkGroup);
const parkDecor = new THREE.Group();
scene.add(parkDecor);
let parkBaseY = 0, activeParkPlacement = null, surfaceCheckTimer = 0;
let worldLoadToken = 0;
let worldBounds = { minX: -32, maxX: 112, minZ: -126, maxZ: 40 };
const parkRaycaster = new THREE.Raycaster();
const loader = new GLTFLoader();
function makeGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#657853'; context.fillRect(0, 0, 128, 128);
  let seed = 1234567;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 1800; i++) {
    const shade = Math.round(83 + random() * 48);
    context.fillStyle = `rgba(${shade - 18},${shade},${shade - 30},${.12 + random() * .2})`;
    const x = random() * 128, y = random() * 128;
    context.fillRect(x, y, .5 + random() * 2.5, .5 + random() * 2.5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(36, 34);
  return texture;
}

function makeRollingGround() {
  const geometry = new THREE.PlaneGeometry(280, 270, 84, 81);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) + 36;
    const z = -positions.getY(i) - 43;
    const nearPark = parkModules.some(park => Math.max(Math.abs(x - park.position[0]), Math.abs(z - park.position[1])) < parkSpan * .58);
    const relief = nearPark ? 0 : (Math.sin(x * .045) * Math.cos(z * .052) + Math.sin((x + z) * .031) * .45) * .5;
    positions.setZ(i, relief);
  }
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: makeGrassTexture(), color: 0xffffff, roughness: 1 }));
  ground.position.set(36, -1.2, -43);
  ground.receiveShadow = true;
  return ground;
}

function makePathRibbon(points, width = 8) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const segments = 72;
  const vertices = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const sideX = tangent.z * width * .5;
    const sideZ = -tangent.x * width * .5;
    vertices.push(point.x + sideX, -.55, point.z + sideZ, point.x - sideX, -.55, point.z - sideZ);
    uvs.push(t * 5, 0, t * 5, 1);
    if (i < segments) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xaaa99b, roughness: 1, side: THREE.DoubleSide }));
}

function makeTree() {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, 1.8, 7), new THREE.MeshStandardMaterial({ color: 0x624936, roughness: 1 }));
  trunk.position.y = .9;
  tree.add(trunk);
  for (const [y, radius, height, color] of [[1.65, 1.1, 1.8, 0x49694b], [2.55, .82, 1.55, 0x5d8054], [3.25, .54, 1.1, 0x739163]]) {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), new THREE.MeshStandardMaterial({ color, roughness: 1 }));
    crown.position.y = y;
    tree.add(crown);
  }
  return tree;
}

function addParkDecor() {
  parkDecor.clear();
  const placements = [
    [-10, -33], [10, -37], [-11, -45], [11, -52], [-10, -55],
    [20, -76], [32, -75], [45, -76], [54, -75], [20, -94], [33, -95], [47, -94], [56, -95]
  ];
  for (const [x, z] of placements) {
    const tree = makeTree();
    tree.position.set(x, -.82, z);
    parkDecor.add(tree);
  }
}

async function loadWorld() {
  parkReady = false;
  const token = ++worldLoadToken;
  const startButton = $('#start');
  if (startButton) { startButton.disabled = true; startButton.textContent = 'Loading parks…'; }
  $('#park-name').textContent = 'Three parks connected';
  $('#park-label').textContent = 'Connected park';
  parkGroup.clear(); parkDecor.clear();
  try {
    const models = await Promise.all(parkModules.map(park => loader.loadAsync(park.file)));
    if (token !== worldLoadToken) return;
    const worldBox = new THREE.Box3();
    models.forEach((gltf, index) => {
      const park = parkModules[index];
      const model = gltf.scene;
      const oriented = new THREE.Group();
      oriented.rotation.y = park.rotate ? Math.PI / 2 : 0;
      oriented.add(model);
      const bounds = new THREE.Box3().setFromObject(oriented);
      const center = bounds.getCenter(new THREE.Vector3());
      const dimensions = bounds.getSize(new THREE.Vector3());
      const scale = parkSpan / Math.max(dimensions.x, dimensions.z);
      const verticalScale = Math.min(scale, 6.4 / Math.max(dimensions.y, .001));
      const placement = new THREE.Group();
      placement.scale.set(scale, verticalScale, scale);
      placement.position.set(park.position[0] - center.x * scale, -bounds.min.y * verticalScale - .62, park.position[1] - center.z * scale);
      placement.add(oriented);
      model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      parkGroup.add(placement);
      parkGroup.updateMatrixWorld(true);
      worldBox.expandByObject(placement);
    });
    for (const points of parkPaths) {
      const path = makePathRibbon(points);
      parkGroup.add(path);
      worldBox.expandByObject(path);
    }
    parkGroup.add(makeRollingGround());
    worldBounds = { minX: worldBox.min.x - 12, maxX: worldBox.max.x + 12, minZ: worldBox.min.z - 12, maxZ: worldBox.max.z + 12 };
    addParkDecor();
    activeParkPlacement = parkGroup;
    parkGroup.updateMatrixWorld(true);
    parkReady = true;
    if (startButton) { startButton.disabled = false; startButton.textContent = 'Start skating ↗'; }
    parkRaycaster.set(new THREE.Vector3(0, 40, 8.5), new THREE.Vector3(0, -1, 0));
    const groundHit = parkRaycaster.intersectObject(parkGroup, true)[0];
    parkBaseY = groundHit ? groundHit.point.y : 0;
    if (!state.air) state.y = parkBaseY + .34;
  } catch (error) {
    if (token !== worldLoadToken) return;
    $('#park-name').textContent = 'Park unavailable';
    if (startButton) { startButton.disabled = false; startButton.textContent = 'Retry parks'; }
    console.error('Could not load the connected skatepark.', error);
  }
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
  if (!parkReady) { loadWorld(); return; }
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
let mouseWasPointerLocked = false, nativeMouseLocked = false;
const nativeMouseHandler = window.webkit?.messageHandlers?.rodSpaceControls;
const hasNativeMouse = Boolean(window.__rodSpaceMacApp && nativeMouseHandler);
function setNativeMouseLock(enabled) {
  if (!hasNativeMouse || nativeMouseLocked === enabled) return;
  nativeMouseLocked = enabled;
  nativeMouseHandler.postMessage({ type: 'mouseLock', enabled });
}
window.__rodSpaceNativeMouse = {
  move(deltaX) {
    if (!nativeMouseLocked || !mousePressed) return;
    state.yaw = wrap(state.yaw + mouseYawDelta(deltaX, innerWidth));
  }
};
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
    if (hasNativeMouse) {
      setNativeMouseLock(true);
      return;
    }
    try {
      const lockRequest = renderer.domElement.requestPointerLock?.();
      lockRequest?.catch?.(() => {});
    } catch {}
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
    if (nativeMouseLocked) return;
    const pointerLocked = document.pointerLockElement === renderer.domElement;
    const deltaX = mousePointerDelta(event, pointerLocked, mouseLastX);
    state.yaw = wrap(state.yaw + mouseYawDelta(deltaX, innerWidth));
    if (!pointerLocked) mouseLastX = event.clientX;
    return;
  }
  event.preventDefault();
  const pointer = pointers.get(event.pointerId);
  if (pointer && pointers.size === 1 && state.air) {
    const trick = airTrickForFlick(event.clientX - pointer.sx, Math.max(28, innerWidth * .035), true, state.flipTurns > 0);
    if (trick) { state.rollV = trick === 'KICKFLIP' ? -19 : 19; state.flipTurns = 1; showTrick(trick, 0, false); }
  }
  contactMove(event.pointerId, event.clientX, event.clientY);
}
function pointerUp(event) {
  if (event.pointerType === 'mouse') {
    mousePressed = false;
    mouseLastX = null;
    setNativeMouseLock(false);
    if (document.pointerLockElement === renderer.domElement) document.exitPointerLock?.();
    return;
  }
  contactUp(event.pointerId);
}
renderer.domElement.addEventListener('pointerdown', pointerDown, { passive: false });
renderer.domElement.addEventListener('pointermove', pointerMove, { passive: false });
renderer.domElement.addEventListener('pointerup', pointerUp, { passive: false });
renderer.domElement.addEventListener('pointercancel', pointerUp, { passive: false });
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === renderer.domElement) {
    mouseWasPointerLocked = true;
  } else if (mouseWasPointerLocked && mousePressed) {
    mouseWasPointerLocked = false;
    mousePressed = false;
    mouseLastX = null;
  }
});
addEventListener('blur', () => {
  mousePressed = false;
  mouseLastX = null;
  setNativeMouseLock(false);
});

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
  if (event.code === 'Escape') {
    if (nativeMouseLocked) {
      mousePressed = false;
      mouseLastX = null;
      setNativeMouseLock(false);
    } else if (document.pointerLockElement === renderer.domElement) {
      mousePressed = false;
      mouseLastX = null;
      document.exitPointerLock?.();
    } else togglePause();
  }
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
  if (state.x < worldBounds.minX || state.x > worldBounds.maxX || state.z < worldBounds.minZ || state.z > worldBounds.maxZ) finish();

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
$('#pause').addEventListener('click', togglePause);
$('#resume').addEventListener('click', togglePause);
$('#sound').addEventListener('click', () => { soundOn = !soundOn; $('#sound').textContent = soundOn ? '♪' : '×'; });
loadWorld();
addEventListener('resize', resizeViewport);

boardMesh.position.set(state.x, state.y, state.z);
requestAnimationFrame(animate);

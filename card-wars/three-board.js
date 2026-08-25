import * as THREE from "./assets/vendor/three.module.min.js";

const USE_PLACEHOLDER_CREATURE_MODELS = true;

const canvas = document.querySelector("#threeBoardLayer");
const arena = document.querySelector("#battleLandscape");
const board = document.querySelector(".board-mat");
const tableStage = document.querySelector("#tableStage");

if (canvas && arena && board && tableStage) startThreeBoard();
if (document.querySelector("#hologramTestCanvas")) startHologramTestBoard();

function startThreeBoard() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.warn("Card Wars 3D projections are unavailable.", error);
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2400);
  camera.position.set(0, 0, 1200);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xfff6c9, 0x244f42, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffe99b, 2.8);
  keyLight.position.set(-3, 6, 8);
  scene.add(keyLight);

  const projectionRoot = new THREE.Group();
  scene.add(projectionRoot);
  let rebuildQueued = true;
  let anchors = [];

  const findAnchor = (owner, lane) => anchors.find((anchor) => anchor.owner === owner && anchor.lane === Number(lane));
  const setDragPoint = (anchor, detail) => {
    if (!anchor) return;
    anchor.dragging = true;
    anchor.returning = false;
    anchor.pointerX = detail.x;
    anchor.pointerY = detail.y;
  };

  window.addEventListener("cardwars:holo-drag-start", (event) => setDragPoint(findAnchor(event.detail.owner, event.detail.lane), event.detail));
  window.addEventListener("cardwars:holo-drag-move", (event) => setDragPoint(findAnchor(event.detail.owner, event.detail.lane), event.detail));
  window.addEventListener("cardwars:holo-drag-cancel", (event) => {
    const anchor = findAnchor(event.detail.owner, event.detail.lane);
    if (anchor) { anchor.dragging = false; anchor.returning = true; }
  });
  window.addEventListener("cardwars:holo-attack", (event) => {
    const anchor = findAnchor(event.detail.owner, event.detail.lane);
    const target = board.querySelector(`.card-slot[data-owner="${event.detail.targetOwner}"][data-lane="${event.detail.targetLane}"]`);
    if (!anchor || !target) return;
    const rect = target.getBoundingClientRect();
    anchor.dragging = true;
    anchor.returning = false;
    anchor.pointerX = rect.left + rect.width / 2;
    anchor.pointerY = rect.top + rect.height / 2;
    anchor.attackUntil = performance.now() + (Number(event.detail.duration) || 720);
  });

  new MutationObserver(() => { rebuildQueued = true; }).observe(board, { childList: true, subtree: true });
  new ResizeObserver(resize).observe(arena);
  resize();
  document.body.classList.add("three-board-ready");
  canvas.dataset.engine = "three";
  renderer.setAnimationLoop(renderFrame);

  function resize() {
    const rect = arena.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  }

  function rebuild() {
    clearGroup(projectionRoot);
    anchors = [];
    board.querySelectorAll(".card-slot.occupied .board-piece").forEach((element, index) => {
      const type = element.classList.contains("board-piece-building") ? "building" : element.classList.contains("board-piece-spell") ? "spell" : "creature";
      if (type !== "creature") return;
      const creatureKind = getCreatureKind(element);
      const baseColor = getPieceColor(element);
      const color = creatureColor(baseColor, creatureKind);
      const model = USE_PLACEHOLDER_CREATURE_MODELS ? makePlaceholderModel() : makeCreature(color, creatureKind);
      projectionRoot.add(model);
      const slot = element.closest(".card-slot");
      anchors.push({ element, model, kind: type, phase: index * 0.77, owner: slot?.dataset.owner, lane: Number(slot?.dataset.lane) });
    });
    canvas.dataset.objectCount = String(anchors.length);
    rebuildQueued = false;
  }

  function renderFrame(timestamp) {
    if (rebuildQueued) rebuild();
    const time = timestamp / 1000;
    const arenaRect = arena.getBoundingClientRect();
    const reducedMotion = document.body.classList.contains("reduce-motion");
    const visible = !tableStage.classList.contains("camera-top") && arena.dataset.holograms !== "off";
    const stageStyle = getComputedStyle(tableStage);
    const boardZoom = parseFloat(stageStyle.getPropertyValue("--camera-scale")) || 1;
    canvas.hidden = !visible;
    if (!visible) return;
    anchors.forEach((anchor) => syncAnchor(anchor, arenaRect, time, timestamp, reducedMotion, boardZoom));
    renderer.render(scene, camera);
    canvas.dataset.rendered = "true";
  }
}

function makePlaceholderModel() {
  const root = new THREE.Group();
  const core = new THREE.Group();
  root.add(core);
  root.userData = {
    core,
    rings: [],
    legs: [],
    beam: { material: { opacity: 0 } },
    motionParts: []
  };
  return root;
}

function syncAnchor(anchor, arenaRect, time, timestamp, reducedMotion, boardZoom) {
  const rect = anchor.element.getBoundingClientRect();
  const visible = rect.width > 2 && rect.height > 2 && rect.bottom > arenaRect.top && rect.top < arenaRect.bottom;
  anchor.model.visible = visible;
  if (!visible) return;
  const x = rect.left - arenaRect.left + rect.width / 2 - arenaRect.width / 2;
  const y = arenaRect.height / 2 - (rect.top - arenaRect.top + rect.height / 2);
  const nominalSize = Math.min(anchor.element.offsetWidth, anchor.element.offsetHeight);
  // Keep projections inside their physical card. Terrain is a miniature
  // scene; creatures are smaller still so they read as inhabitants of it.
  const scaleFactor = anchor.kind === "landscape" ? 0.95 : anchor.kind === "creature" ? 0.29 : 0.42;
  const heightFactor = anchor.kind === "landscape" ? 0.64 : anchor.kind === "creature" ? 1.02 : 1.08;
  const size = nominalSize * boardZoom * scaleFactor;
  const restZ = anchor.kind === "landscape" ? 8 : 34;
  if (anchor.attackUntil && timestamp >= anchor.attackUntil) {
    anchor.attackUntil = 0;
    anchor.dragging = false;
    anchor.returning = true;
  }
  let targetX = x;
  let targetY = y;
  let targetZ = restZ;
  if (anchor.dragging) {
    targetX = anchor.pointerX - arenaRect.left - arenaRect.width / 2;
    targetY = arenaRect.height / 2 - (anchor.pointerY - arenaRect.top);
    targetZ = restZ + 58;
  }
  if (anchor.dragging || anchor.returning) {
    const speed = anchor.dragging ? 0.24 : 0.18;
    anchor.model.position.x += (targetX - anchor.model.position.x) * speed;
    anchor.model.position.y += (targetY - anchor.model.position.y) * speed;
    anchor.model.position.z += (targetZ - anchor.model.position.z) * speed;
    if (anchor.returning && Math.hypot(x - anchor.model.position.x, y - anchor.model.position.y) < 1.5) {
      anchor.returning = false;
      anchor.model.position.set(x, y, restZ);
    }
  } else {
    anchor.model.position.set(x, y, restZ);
  }
  anchor.model.scale.set(size, size * heightFactor, size);
  // Holograms are anchored objects, not billboards. Keep their local 3D
  // orientation stable while the CSS board camera orbits around them.
  anchor.model.rotation.set(0, 0, 0);

  const motion = reducedMotion ? 0 : 1;
  const core = anchor.model.userData.core;
  core.position.y = 0;
  core.scale.y = 1 + Math.sin(time * 1.9 + anchor.phase) * 0.018 * motion;

  if (!anchor.model.userData.motionParts.length) {
    anchor.model.userData.motionParts = core.children.filter((part) => part.isMesh);
    anchor.model.userData.motionParts.forEach((part) => {
      part.userData.restY = part.position.y;
    });
  }
  anchor.model.userData.motionParts.forEach((part, index) => {
    const wave = Math.sin(time * (1.45 + (index % 3) * 0.16) + anchor.phase + index * 0.72) * motion;
    part.position.y = part.userData.restY + wave * (anchor.kind === "landscape" ? 0.025 : 0.012);
  });
  anchor.model.userData.rings.forEach((ring, index) => {
    const shimmer = Math.sin(time * 2.6 + anchor.phase + index);
    const pulse = 1 + shimmer * 0.085 * motion;
    ring.scale.setScalar(pulse);
    ring.material.opacity = 0.56 + shimmer * 0.12 * motion;
  });
  anchor.model.userData.beam.material.opacity =
    0.075 + Math.sin(time * 3.4 + anchor.phase) * 0.025 * motion;
  if (anchor.kind === "creature") {
    anchor.model.userData.legs.forEach((leg, index) => {
      const walking = anchor.dragging || anchor.returning;
      leg.rotation.z = Math.sin(time * (walking ? 13 : 5.2) + index * Math.PI) * (walking ? 0.34 : 0.18) * motion;
    });
  }
}

function makeLandscape(faction, seed) {
  const color = factionColor(faction);
  const root = makeLandscapeRoot(color);
  const core = root.userData.core;
  const material = holoMaterial(color, 0.18);
  const accent = holoMaterial(color, 0.42);
  addBiomeGround(core, faction);
  if (faction === "blue-plains") {
    buildBluePlainsTerrain(core, material, accent, seed);
  } else if (faction === "useless-swamp") {
    buildSwampTerrain(core, material, accent);
  } else if (faction === "nice-lands") {
    buildNiceLandsTerrain(core, material, accent);
  } else if (faction === "sandy-lands") {
    buildSandyLandsTerrain(core, material, accent);
  } else if (faction === "icy-lands") {
    buildIcyLandsTerrain(core, material, accent, seed);
  } else if (faction === "lava-flats") {
    buildLavaFlatsTerrain(core, material, accent, seed);
  } else {
    buildCornfieldTerrain(core, material, accent);
  }
  core.rotation.y = 0;
  return root;
}

function addBiomeGround(core, faction) {
  const color = {
    "corn-fields": 0x6f9f31,
    "blue-plains": 0x527da1,
    "useless-swamp": 0x4d743f,
    "nice-lands": 0xb4779e,
    "sandy-lands": 0xa47c4c,
    "icy-lands": 0xb8e6f4,
    "lava-flats": 0x9b331f
  }[faction] || 0x6f9f31;
  const ground = addMesh(core, new THREE.BoxGeometry(2.36, 1.52, 0.12), new THREE.MeshBasicMaterial({
    color,
    depthWrite: true
  }));
  ground.position.z = -0.14;
}

function makeLandscapeRoot(color) {
  const root = new THREE.Group();
  const core = new THREE.Group();
  root.add(core);
  root.userData = {
    core,
    rings: [],
    legs: [],
    beam: { material: { opacity: 0 } },
    motionParts: []
  };
  return root;
}

function buildCornfieldTerrain(core, material, accent) {
  const rows = [
    [-0.9, -0.48, 5],
    [-0.72, -0.22, 6],
    [-0.98, 0.05, 5],
    [-0.62, 0.33, 6],
    [0.18, -0.52, 5],
    [0.42, -0.24, 6],
    [0.12, 0.05, 5],
    [0.58, 0.34, 6]
  ];
  rows.forEach(([startX, y, count], rowIndex) => {
    for (let i = 0; i < count; i += 1) {
      addCornStalk(core, material, accent, startX + i * 0.18, y + ((i + rowIndex) % 2) * 0.025, 0.26 + ((i + rowIndex) % 3) * 0.035);
    }
  });
  for (let i = 0; i < 14; i += 1) {
    const x = -1.05 + (i % 7) * 0.34 + (i > 6 ? 0.08 : 0);
    const y = -0.67 + Math.floor(i / 7) * 1.24 + (i % 2) * 0.03;
    addGrassBlade(core, material, x, y, 0.16 + (i % 3) * 0.03);
  }
}

function addCornStalk(core, material, accent, x, y, height) {
  const stalk = addMesh(core, new THREE.CylinderGeometry(0.009, 0.014, height, 4), material);
  stalk.position.set(x, y + height / 2, 0.08);
  stalk.rotation.z = (Math.sin(x * 13 + y * 7) * 0.12);
  const cob = addMesh(core, new THREE.CapsuleGeometry(0.022, 0.07, 3, 5), accent);
  cob.position.set(x + 0.025, y + height * 0.63, 0.11);
  cob.rotation.z = -0.35;
  [-1, 1].forEach((side) => {
    const leaf = addMesh(core, new THREE.ConeGeometry(0.028, 0.16, 3), material);
    leaf.position.set(x + side * 0.035, y + height * 0.48, 0.09);
    leaf.rotation.z = side * 0.9;
  });
}

function addGrassBlade(core, material, x, y, height) {
  const grass = addMesh(core, new THREE.CylinderGeometry(0.006, 0.009, height, 4), material);
  grass.position.set(x, y + height / 2, 0.07);
  grass.rotation.z = Math.sin(x * 9) * 0.2;
}

function buildBluePlainsTerrain(core, material, accent, variant = 0) {
  if (variant === 1) {
    for (let i = 0; i < 5; i += 1) {
      const mountain = addMesh(core, new THREE.ConeGeometry(0.18 + (i % 2) * 0.055, 0.42 + (i % 3) * 0.08, 7), i % 2 ? accent : material);
      mountain.scale.x = 1.6;
      mountain.scale.z = 0.38;
      mountain.position.set(-0.86 + i * 0.43, -0.34 + (i % 2) * 0.2, 0.1);
    }
    return;
  }
  if (variant === 3) {
    const gray = holoMaterial(0x87919a, 0.32);
    for (let i = 0; i < 18; i += 1) {
      const x = -1.02 + (i % 9) * 0.25;
      const y = -0.58 + Math.floor(i / 9) * 0.62 + (i % 2) * 0.05;
      addGrassBlade(core, gray, x, y, 0.2 + (i % 3) * 0.04);
      if (i % 2 === 0) addGrassBlade(core, accent, x + 0.035, y + 0.02, 0.14);
    }
    return;
  }
  const count = variant === 2 ? 14 : 8;
  for (let i = 0; i < count; i += 1) {
    const hill = addMesh(core, new THREE.SphereGeometry(0.14, 9, 6), i % 2 ? accent : material);
    hill.scale.set(1.65, 0.34, 0.32);
    hill.position.set(-0.95 + (i % 7) * 0.32, -0.5 + Math.floor(i / 7) * 0.72 + (i % 2) * 0.07, 0.06);
  }
}

function buildSwampTerrain(core, material, accent) {
  for (let i = 0; i < 9; i += 1) {
    const puddle = addMesh(core, new THREE.CircleGeometry(0.12 + (i % 3) * 0.035, 16), i % 2 ? accent : material);
    puddle.scale.set(1.55, 0.58, 1);
    puddle.position.set(-0.9 + (i % 3) * 0.58, -0.48 + Math.floor(i / 3) * 0.42, 0.05);
  }
  for (let i = 0; i < 18; i += 1) {
    addGrassBlade(core, material, -1 + (i % 6) * 0.38, -0.62 + Math.floor(i / 6) * 0.5, 0.13 + (i % 3) * 0.035);
  }
}

function buildNiceLandsTerrain(core, material, accent) {
  for (let i = 0; i < 9; i += 1) {
    const puff = addMesh(core, new THREE.SphereGeometry(0.13 + (i % 2) * 0.04, 10, 6), i % 2 ? accent : material);
    puff.scale.set(1.35, 0.62, 0.32);
    puff.position.set(-0.9 + (i % 3) * 0.58, -0.45 + Math.floor(i / 3) * 0.43, 0.08);
  }
}

function buildSandyLandsTerrain(core, material, accent) {
  for (let i = 0; i < 11; i += 1) {
    const dune = addMesh(core, new THREE.TorusGeometry(0.17 + (i % 2) * 0.035, 0.026, 5, 18, Math.PI), i % 2 ? accent : material);
    dune.scale.set(1.8, 0.65, 0.34);
    dune.position.set(-0.95 + (i % 4) * 0.62, -0.5 + Math.floor(i / 4) * 0.42, 0.08);
    dune.rotation.z = (i % 3 - 1) * 0.12;
  }
}

function buildIcyLandsTerrain(core, material, accent, variant = 0) {
  for (let i = 0; i < 7; i += 1) {
    const drift = addMesh(core, new THREE.SphereGeometry(0.18 + (i % 3) * 0.035, 12, 7), i % 2 ? accent : material);
    drift.scale.set(2.1, 0.28, 0.28);
    drift.position.set(-1.02 + (i % 4) * 0.62, -0.5 + Math.floor(i / 4) * 0.64, 0.07);
  }
  if (variant % 2 === 0) {
    for (let i = 0; i < 5; i += 1) {
      const crystal = addMesh(core, new THREE.ConeGeometry(0.11 + (i % 2) * 0.04, 0.48 + (i % 3) * 0.08, 5), accent);
      crystal.scale.z = 0.5;
      crystal.position.set(-0.78 + i * 0.38, -0.18 + (i % 2) * 0.27, 0.16);
      crystal.rotation.z = (i % 3 - 1) * 0.13;
    }
  } else {
    for (let i = 0; i < 10; i += 1) {
      const flake = addMesh(core, new THREE.OctahedronGeometry(0.055 + (i % 2) * 0.015), accent);
      flake.position.set(-1 + (i % 5) * 0.5, -0.54 + Math.floor(i / 5) * 0.8, 0.16);
    }
  }
}

function buildLavaFlatsTerrain(core, material, accent, variant = 0) {
  for (let i = 0; i < 8; i += 1) {
    const rock = addMesh(core, new THREE.DodecahedronGeometry(0.1 + (i % 3) * 0.035), material);
    rock.scale.set(1.35, 0.42, 0.9);
    rock.position.set(-1.02 + (i % 4) * 0.64, -0.52 + Math.floor(i / 4) * 0.72, 0.09);
  }
  for (let i = 0; i < 5; i += 1) {
    const flow = addMesh(core, new THREE.TorusGeometry(0.24 + (i % 2) * 0.04, 0.032, 5, 24, Math.PI * 1.12), accent);
    flow.scale.set(1.8, 0.42, 0.28);
    flow.position.set(-0.88 + i * 0.43, -0.42 + ((i + variant) % 3) * 0.31, 0.12);
    flow.rotation.z = (i % 2 ? 0.2 : -0.18);
  }
  const volcano = addMesh(core, new THREE.ConeGeometry(0.22, 0.5, 7), material);
  volcano.scale.z = 0.55;
  volcano.position.set(0.7, 0.35, 0.18);
  const plume = addMesh(core, new THREE.SphereGeometry(0.1, 9, 6), accent);
  plume.scale.set(1.6, 0.72, 0.45);
  plume.position.set(0.7, 0.62, 0.24);
}

function makeCreature(color, kind) {
  const root = makeHologramRoot(color);
  const core = root.userData.core;
  const material = holoMaterial(color, 0.34);
  const bright = holoMaterial(color, 0.56);
  const legs = root.userData.legs;

  const soundsLike = (words) => words.some((word) => kind.includes(word));
  if (["the-pig", "the-big-pig"].includes(kind) || soundsLike(["pig", "hog", "boar"])) {
    buildPig(core, material, bright, legs, kind === "the-big-pig" ? 1.18 : 0.86);
  } else if (["corn-dog", "cool-dog"].includes(kind) || soundsLike(["dog", "collie", "hound", "pup"])) {
    buildDog(core, material, bright, legs, kind === "cool-dog");
  } else if (["sand-angel", "angel-heart", "sand-eyebat"].includes(kind) || soundsLike(["angel", "bat", "bird", "wing"])) {
    buildWinged(core, material, bright, kind);
  } else if (["sandsnake", "shark", "niceasaurus-rex"].includes(kind) || soundsLike(["snake", "serpent", "shark", "saurus", "dragon", "lizard"])) {
    buildBeast(core, material, bright, legs, kind);
  } else if (["bog-bum", "wandering-bald-man"].includes(kind) || soundsLike(["blob", "slime", "ooze", "bum"])) {
    buildOddball(core, material, bright, legs, kind);
  } else if (["field-stalker", "bouncing-zebracorn"].includes(kind) || soundsLike(["stalker", "spider", "bug", "beetle", "zebra", "horse"])) {
    buildRunner(core, material, bright, legs, kind);
  } else if (soundsLike(["knight", "scholar", "man", "ogre", "witch", "chief", "archer", "mummy", "reaper", "doctor", "cobblin"])) {
    buildHumanoid(core, material, bright, legs, kind);
  } else {
    const variant = creatureHash(kind) % 6;
    if (variant === 0) buildDog(core, material, bright, legs, false);
    else if (variant === 1) buildWinged(core, material, bright, "unknown-winged");
    else if (variant === 2) buildBeast(core, material, bright, legs, "unknown-beast");
    else if (variant === 3) buildOddball(core, material, bright, legs, "bog-bum");
    else if (variant === 4) buildRunner(core, material, bright, legs, "unknown-runner");
    else buildHumanoid(core, material, bright, legs, kind);
  }
  return root;
}

function buildPig(core, material, bright, legs, scale) {
  const body = addMesh(core, new THREE.SphereGeometry(0.43 * scale, 14, 10), material);
  body.scale.set(1.22, 0.76, 0.86);
  body.position.y = 0.55 * scale;
  const head = addMesh(core, new THREE.SphereGeometry(0.25 * scale, 12, 9), bright);
  head.position.set(0.37 * scale, 0.69 * scale, 0);
  const snout = addMesh(core, new THREE.CylinderGeometry(0.1 * scale, 0.13 * scale, 0.17 * scale, 10), bright);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(0.57 * scale, 0.65 * scale, 0);
  addQuadrupedLegs(core, material, legs, scale, 0.25);
  const tail = addMesh(core, new THREE.TorusGeometry(0.13 * scale, 0.03 * scale, 6, 16, Math.PI * 1.55), bright);
  tail.position.set(-0.48 * scale, 0.59 * scale, 0);
  tail.rotation.z = -0.5;
}

function buildDog(core, material, bright, legs, cool) {
  const body = addMesh(core, new THREE.CapsuleGeometry(0.26, 0.52, 6, 10), material);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.58;
  const head = addMesh(core, new THREE.SphereGeometry(0.25, 12, 9), bright);
  head.scale.set(1.05, cool ? 0.82 : 1, 0.82);
  head.position.set(0.49, 0.68, 0);
  const muzzle = addMesh(core, new THREE.ConeGeometry(0.14, 0.3, 8), bright);
  muzzle.rotation.z = -Math.PI / 2;
  muzzle.position.set(0.72, 0.63, 0);
  [-0.12, 0.12].forEach((z) => {
    const ear = addMesh(core, new THREE.ConeGeometry(0.08, cool ? 0.3 : 0.2, 6), material);
    ear.position.set(0.43, 0.94, z);
  });
  addQuadrupedLegs(core, material, legs, 0.9, 0.29);
  const tail = addMesh(core, new THREE.ConeGeometry(0.08, 0.42, 7), bright);
  tail.position.set(-0.53, 0.75, 0);
  tail.rotation.z = 1.05;
}

function buildWinged(core, material, bright, kind) {
  const isEye = kind === "sand-eyebat";
  const body = addMesh(core, isEye ? new THREE.SphereGeometry(0.3, 14, 10) : new THREE.CapsuleGeometry(0.18, 0.45, 6, 9), bright);
  body.position.y = isEye ? 0.7 : 0.58;
  const wingGeometry = new THREE.ConeGeometry(isEye ? 0.3 : 0.38, isEye ? 0.65 : 0.78, 3);
  [-1, 1].forEach((side) => {
    const wing = addMesh(core, wingGeometry, material);
    wing.scale.z = 0.28;
    wing.position.set(side * 0.42, 0.72, 0);
    wing.rotation.z = side * -1.02;
  });
  if (!isEye) {
    const head = addMesh(core, kind === "angel-heart" ? new THREE.OctahedronGeometry(0.24) : new THREE.SphereGeometry(0.2, 10, 8), bright);
    head.position.y = 1.02;
  } else {
    const pupil = addMesh(core, new THREE.SphereGeometry(0.12, 10, 8), material);
    pupil.position.set(0, 0.7, 0.26);
  }
}

function buildBeast(core, material, bright, legs, kind) {
  if (kind === "sandsnake") {
    for (let i = 0; i < 6; i += 1) {
      const segment = addMesh(core, new THREE.SphereGeometry(0.18 - i * 0.012, 9, 7), i < 2 ? bright : material);
      segment.position.set((i - 2.5) * 0.19, 0.32 + Math.sin(i * 1.2) * 0.17, 0);
    }
    return;
  }
  if (kind === "shark") {
    const body = addMesh(core, new THREE.CapsuleGeometry(0.27, 0.62, 6, 10), material);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.62;
    const fin = addMesh(core, new THREE.ConeGeometry(0.18, 0.4, 3), bright);
    fin.position.set(-0.05, 0.94, 0);
    const tail = addMesh(core, new THREE.ConeGeometry(0.27, 0.46, 3), bright);
    tail.rotation.z = -Math.PI / 2;
    tail.position.set(-0.61, 0.62, 0);
    return;
  }
  const body = addMesh(core, new THREE.CapsuleGeometry(0.31, 0.65, 7, 11), material);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.62;
  const head = addMesh(core, new THREE.BoxGeometry(0.42, 0.34, 0.34), bright);
  head.position.set(0.58, 0.75, 0);
  addQuadrupedLegs(core, material, legs, 1, 0.32);
  const tail = addMesh(core, new THREE.ConeGeometry(0.11, 0.72, 7), bright);
  tail.position.set(-0.67, 0.66, 0);
  tail.rotation.z = 1.28;
}

function buildOddball(core, material, bright, legs, kind) {
  if (kind === "bog-bum") {
    const blob = addMesh(core, new THREE.SphereGeometry(0.48, 12, 9), material);
    blob.scale.set(1.1, 0.7, 0.9);
    blob.position.y = 0.4;
    [0.18, 0.42, 0.65].forEach((y, index) => {
      const bubble = addMesh(core, new THREE.SphereGeometry(0.12 + index * 0.03, 8, 6), bright);
      bubble.position.set((index - 1) * 0.25, y, index % 2 ? 0.12 : -0.08);
    });
    return;
  }
  buildHumanoid(core, material, bright, legs, "wandering-bald-man");
}

function buildRunner(core, material, bright, legs, kind) {
  const body = addMesh(core, new THREE.CapsuleGeometry(0.2, 0.58, 6, 9), material);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.62;
  const head = addMesh(core, new THREE.SphereGeometry(0.2, 10, 8), bright);
  head.position.set(0.47, 0.73, 0);
  const legCount = kind === "field-stalker" ? 6 : 4;
  for (let i = 0; i < legCount; i += 1) {
    const leg = addMesh(core, new THREE.CylinderGeometry(0.035, 0.05, 0.5, 6), material);
    leg.position.set(-0.34 + (i % 3) * 0.34, 0.25, i % 2 ? 0.18 : -0.18);
    leg.rotation.z = (i % 2 ? 1 : -1) * 0.22;
    legs.push(leg);
  }
  if (kind === "bouncing-zebracorn") {
    const horn = addMesh(core, new THREE.ConeGeometry(0.055, 0.36, 7), bright);
    horn.position.set(0.58, 0.96, 0);
    horn.rotation.z = -0.58;
  }
}

function buildHumanoid(core, material, bright, legs, kind) {
  const bulky = ["green-party-ogre", "woadic-chief"].includes(kind);
  const skeletal = kind === "dr-death";
  const robed = ["sandwitch", "field-reaper", "ancient-scholar"].includes(kind);
  const torso = addMesh(core, robed ? new THREE.ConeGeometry(0.3, 0.72, 8) : new THREE.CapsuleGeometry(bulky ? 0.27 : 0.18, 0.46, 6, 9), material);
  torso.position.y = 0.65;
  torso.scale.x = skeletal ? 0.65 : 1;
  const head = addMesh(core, new THREE.SphereGeometry(bulky ? 0.25 : 0.19, 10, 8), bright);
  head.position.y = 1.12;
  [-0.13, 0.13].forEach((x) => {
    const leg = addMesh(core, new THREE.CylinderGeometry(skeletal ? 0.035 : 0.055, 0.07, 0.44, 6), material);
    leg.position.set(x, 0.22, 0);
    legs.push(leg);
  });
  [-1, 1].forEach((side) => {
    const arm = addMesh(core, new THREE.CylinderGeometry(0.035, 0.055, 0.52, 6), bright);
    arm.position.set(side * (bulky ? 0.33 : 0.25), 0.72, 0);
    arm.rotation.z = side * -0.28;
  });
  if (["husker-knight", "corn-ronin", "sand-knights", "woadic-chief"].includes(kind)) {
    const helmet = addMesh(core, new THREE.ConeGeometry(0.24, 0.38, kind === "corn-ronin" ? 4 : 7), material);
    helmet.position.y = 1.42;
    const weapon = addMesh(core, new THREE.CylinderGeometry(0.025, 0.035, 1.12, 6), bright);
    weapon.position.set(0.4, 0.72, 0);
    weapon.rotation.z = -0.16;
  } else if (["sandwitch", "field-reaper"].includes(kind)) {
    const hat = addMesh(core, new THREE.ConeGeometry(0.34, 0.64, 9), bright);
    hat.position.y = 1.48;
  } else if (kind === "ancient-scholar") {
    const book = addMesh(core, new THREE.BoxGeometry(0.44, 0.32, 0.09), bright);
    book.position.set(0, 0.7, 0.28);
  } else if (kind === "archer-dan") {
    const bow = addMesh(core, new THREE.TorusGeometry(0.35, 0.025, 6, 18, Math.PI), bright);
    bow.position.set(0.35, 0.72, 0);
    bow.rotation.z = Math.PI / 2;
  } else if (kind === "beach-mummy") {
    for (let i = 0; i < 4; i += 1) {
      const wrap = addMesh(core, new THREE.TorusGeometry(0.2, 0.022, 5, 18), bright);
      wrap.position.y = 0.48 + i * 0.18;
      wrap.rotation.x = Math.PI / 2;
    }
  }
}

function addQuadrupedLegs(core, material, legs, scale, spread) {
  [-spread, spread].forEach((x, index) => {
    const leg = addMesh(core, new THREE.CylinderGeometry(0.05 * scale, 0.07 * scale, 0.38 * scale, 7), material);
    leg.position.set(x, 0.2 * scale, index ? 0.15 : -0.12);
    legs.push(leg);
  });
}

function makeBuilding(color) {
  const root = makeHologramRoot(color);
  const core = root.userData.core;
  const material = holoMaterial(color, 0.31);
  const bright = holoMaterial(color, 0.52);
  const base = addMesh(core, new THREE.BoxGeometry(1.2, 0.42, 0.7), material);
  base.position.y = 0.25;
  [-0.42, 0, 0.42].forEach((x, index) => {
    const tower = addMesh(core, new THREE.CylinderGeometry(0.14, 0.2, 0.85 + index * 0.13, 7), material);
    tower.position.set(x, 0.75 + index * 0.065, 0);
    const roof = addMesh(core, new THREE.ConeGeometry(0.24, 0.45, 7), bright);
    roof.position.set(x, 1.37 + index * 0.13, 0);
  });
  return root;
}

function makeSpell(color) {
  const root = makeHologramRoot(color);
  const orb = addMesh(root.userData.core, new THREE.IcosahedronGeometry(0.56, 1), holoMaterial(color, 0.4));
  orb.position.y = 0.78;
  return root;
}

function makeHologramRoot(color) {
  const root = new THREE.Group();
  const core = new THREE.Group();
  root.add(core);
  const beam = addMesh(root, new THREE.CylinderGeometry(0.48, 0.65, 1.35, 24, 1, true), holoMaterial(color, 0.055));
  beam.position.y = 0.7;
  root.userData = { core, rings: [], legs: [], beam, motionParts: [] };
  return root;
}

function addMesh(parent, geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  parent.add(mesh);
  if (!material.wireframe && material.isMeshPhongMaterial) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 24), lineMaterial(material.color));
    edges.material.opacity = Math.min(0.75, (material.opacity || 0.3) + 0.2);
    mesh.add(edges);
  }
  return mesh;
}

function holoMaterial(color, opacity) {
  return new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.38,
    transparent: true,
    opacity: Math.min(0.72, opacity + 0.18),
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    shininess: 120,
    specular: 0xffffff
  });
}

function lineMaterial(color) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.64, depthWrite: false, blending: THREE.AdditiveBlending });
}

function getLandscapeFaction(element) {
  return ["blue-plains", "useless-swamp", "nice-lands", "sandy-lands", "icy-lands", "lava-flats", "corn-fields"].find((name) => element.classList.contains(`landscape-${name}`)) || "corn-fields";
}

function getPieceColor(element) {
  const faction = ["blue-plains", "useless-swamp", "nice-lands", "sandy-lands", "icy-lands", "lava-flats", "rainbow", "corn-fields"].find((name) => element.classList.contains(`board-piece-${name}`)) || "rainbow";
  return factionColor(faction);
}

function factionColor(name) {
  return new THREE.Color({ "blue-plains": 0x38d7ff, "useless-swamp": 0x75f56b, "nice-lands": 0xff69d6, "sandy-lands": 0xffa53b, "icy-lands": 0xb8f3ff, "lava-flats": 0xff5a26, "corn-fields": 0xffe23d, rainbow: 0xfff3a0 }[name] || 0xffe23d);
}

function creatureColor(baseColor, kind) {
  const hash = creatureHash(kind);
  return baseColor.clone().offsetHSL(((Math.abs(hash) % 31) - 15) / 110, 0.04, ((Math.abs(hash >> 5) % 9) - 4) / 70);
}

function creatureHash(kind) {
  let hash = 0;
  for (let index = 0; index < kind.length; index += 1) hash = (hash * 31 + kind.charCodeAt(index)) | 0;
  return Math.abs(hash);
}

function getCreatureKind(element) {
  const name = element.querySelector(".board-card")?.alt || "creature";
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
  }
}

// The test map uses the same landscape geometry as the battle board, but each
// diorama is scaled to the transformed card image below it.
function startHologramTestBoard() {
  const testCanvas = document.querySelector("#hologramTestCanvas");
  const viewport = document.querySelector("#hologramTestViewport");
  const surface = document.querySelector("#hologramTestSurface");
  if (!testCanvas || !viewport || !surface) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: testCanvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (error) {
    console.warn("Card Wars hologram test rendering is unavailable.", error);
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2400);
  camera.position.set(0, 0, 1200);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xfff6c9, 0x355642, 2.4));
  const keyLight = new THREE.DirectionalLight(0xfff0bd, 3.2);
  keyLight.position.set(-3, 6, 9);
  scene.add(keyLight);

  const root = new THREE.Group();
  scene.add(root);
  let anchors = [];
  let rebuildQueued = true;

  function resize() {
    const rect = viewport.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  }

  function rebuild() {
    clearGroup(root);
    anchors = Array.from(surface.querySelectorAll("[data-test-landscape]")).map((element, index) => {
      const model = makeLandscape(element.dataset.testFaction || "corn-fields", Number(element.dataset.testVariant || 1) - 1);
      root.add(model);
      return { element, model, phase: index * 0.37 };
    });
    rebuildQueued = false;
  }

  window.addEventListener("cardwars:test-map-rebuild", () => { rebuildQueued = true; });
  new ResizeObserver(resize).observe(viewport);
  resize();

  function render(timestamp) {
    if (rebuildQueued) rebuild();
    const hologramsOn = surface.classList.contains("holograms-on");
    testCanvas.hidden = !hologramsOn;
    if (hologramsOn) {
      const viewportRect = viewport.getBoundingClientRect();
      anchors.forEach((anchor) => {
        const rect = anchor.element.getBoundingClientRect();
        const visible = rect.width > 2 && rect.height > 2 && rect.bottom > viewportRect.top && rect.top < viewportRect.bottom;
        anchor.model.visible = visible;
        if (!visible) return;
        anchor.model.position.set(
          rect.left - viewportRect.left + rect.width / 2 - viewportRect.width / 2,
          viewportRect.height / 2 - (rect.top - viewportRect.top + rect.height / 2),
          12
        );
        anchor.model.scale.set(rect.width / 2.36, rect.height / 1.52, Math.min(rect.width, rect.height) / 2.36);
        anchor.model.rotation.set(0, 0, 0);
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

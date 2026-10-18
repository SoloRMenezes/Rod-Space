import * as THREE from './assets/vendor/three.module.min.js';

const shelfElement = document.querySelector('#shelfScreen > .library-shelf');
if (!shelfElement) throw new Error('Maths shelf element was not found');

const bookElements = [...shelfElement.querySelectorAll('.book')];
const bookData = bookElements.map((element, index) => ({
  element,
  title: element.querySelector('.spine-title strong')?.textContent.trim() || '',
  number: element.querySelector('.spine-title em')?.textContent.trim() || '',
  kind: element.querySelector('.book-kind')?.textContent.trim() || '',
  course: element.dataset.course,
  mode: element.dataset.mode,
  disabled: element.disabled,
  color: ['#3159d8', '#2347af', '#d7653d', '#a94027', '#789591', '#566b67', '#85648e', '#694c70', '#ad6579', '#854d5b', '#7a895e', '#5c6748'][index],
  width: index % 2 === 0 ? 0.96 : 0.86,
  height: index % 2 === 0 ? 4.12 : 3.80,
  depth: index % 2 === 0 ? 2.28 : 2.08
}));

const canvas = document.createElement('canvas');
canvas.className = 'maths-shelf-canvas';
canvas.setAttribute('aria-label', 'Interactive three-dimensional maths bookshelf');
canvas.tabIndex = 0;
shelfElement.prepend(canvas);
shelfElement.classList.add('webgl-shelf');

const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 60);
camera.position.set(0, 2.45, 18.4);
camera.lookAt(0, 2.35, 0);

scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3a2518, 2.25));
const keyLight = new THREE.DirectionalLight(0xffe5c5, 3.4);
keyLight.position.set(-5.5, 9, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -3;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xaec7ff, 0.75);
fillLight.position.set(7, 4, 5);
scene.add(fillLight);

function woodMaterial(color, roughness = 0.7) {
  return new THREE.MeshStandardMaterial({color, roughness, metalness: 0.02});
}

function box(width, height, depth, material, x, y, z, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

const darkWood = woodMaterial(0x5a2f18, 0.76);
const edgeWood = woodMaterial(0x784326, 0.67);
const innerWood = woodMaterial(0xa9683e, 0.83);
box(14.6, 5.45, 0.46, innerWood, 0, 2.37, -0.82, false);
box(15.2, 0.42, 1.18, edgeWood, 0, -0.22, -0.25);
box(15.2, 0.34, 1.00, edgeWood, 0, 5.18, -0.35);
box(0.48, 5.72, 1.00, darkWood, -7.36, 2.46, -0.35);
box(0.48, 5.72, 1.00, darkWood, 7.36, 2.46, -0.35);
box(15.55, 0.24, 1.32, darkWood, 0, -0.48, -0.20);

for (let i = -6; i <= 6; i++) {
  const strip = box(0.055, 5.05, 0.012, woodMaterial(i % 2 ? 0x8e5535 : 0xb17349, 0.9), i * 1.02, 2.43, -0.575, false);
  strip.receiveShadow = false;
}

function spineTexture(data) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = 'rgba(255,255,255,.48)';
  ctx.fillRect(42, 92, 172, 5);
  ctx.fillRect(42, 886, 172, 3);
  ctx.save();
  ctx.translate(128, 516);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#fff8e9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${data.title === 'Decision' ? 79 : 68}px Georgia`;
  ctx.fillText(`${data.title} ${data.number}`, 0, 0, 760);
  ctx.restore();
  ctx.fillStyle = '#fff8e9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 33px Arial';
  ctx.fillText(data.kind.toUpperCase(), 128, 944, 205);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function makeBook(data) {
  const pivot = new THREE.Group();
  const model = new THREE.Group();
  model.position.y = data.height / 2;
  pivot.add(model);

  const cover = woodMaterial(data.color, 0.55);
  const pages = new THREE.MeshStandardMaterial({color: 0xf0e7cf, roughness: 0.92});
  const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(data.width - 0.13, data.height - 0.16, data.depth - 0.14, 1, 1, 5), pages);
  pageBlock.position.z = -0.015;
  pageBlock.castShadow = true;
  pageBlock.receiveShadow = true;
  model.add(pageBlock);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(data.width, data.height, 0.105), cover);
  spine.position.z = data.depth / 2 - 0.0525;
  spine.castShadow = true;
  spine.receiveShadow = true;
  model.add(spine);

  for (const x of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.065, data.height, data.depth), cover);
    rail.position.x = x * (data.width / 2 - 0.0325);
    rail.castShadow = true;
    model.add(rail);
  }

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(data.width * 0.88, data.height * 0.96),
    new THREE.MeshBasicMaterial({map: spineTexture(data), transparent: true, depthWrite: false})
  );
  label.position.z = data.depth / 2 + 0.006;
  model.add(label);
  pivot.userData = {data, targetRotation: 0, targetZ: 0, targetY: 0};
  scene.add(pivot);
  return pivot;
}

const totalWidth = bookData.reduce((sum, data) => sum + data.width, 0);
let cursorX = -totalWidth / 2;
const models = bookData.map(data => {
  const model = makeBook(data);
  model.position.x = cursorX + data.width / 2;
  data.left = cursorX;
  cursorX += data.width;
  data.right = cursorX;
  return model;
});

const hitMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide});
const hitPlane = new THREE.Mesh(new THREE.PlaneGeometry(totalWidth, 5.6), hitMaterial);
hitPlane.position.set(0, 2.68, 0.55);
scene.add(hitPlane);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = -1;
let pressed = -1;
let dragStartX = 0;
let dragStartOffset = 0;
let didDrag = false;
let openingIndex = -1;
let cameraX = 0;
let cameraTargetX = 0;
const phoneView = window.matchMedia('(max-width: 650px)');

function setHovered(index) {
  if (hovered === index) return;
  hovered = index;
  canvas.classList.toggle('book-hover', index >= 0 && !bookData[index].disabled);
  models.forEach((model, i) => {
    model.userData.targetRotation = i === index ? 0.38 : 0;
    model.userData.targetZ = i === index ? 0.30 : 0;
    model.userData.targetY = i === index ? 0.02 : 0;
  });
}

function bookAtEvent(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(hitPlane, false)[0];
  if (!hit) return -1;
  return bookData.findIndex(data => hit.point.x >= data.left && hit.point.x <= data.right);
}

canvas.addEventListener('pointermove', event => {
  if (openingIndex >= 0) return;
  if (phoneView.matches && pressed >= 0) {
    const movement = event.clientX - dragStartX;
    if (Math.abs(movement) > 5) didDrag = true;
    if (didDrag) {
      cameraTargetX = THREE.MathUtils.clamp(dragStartOffset - movement * 0.028, -3.85, 3.85);
      setHovered(-1);
      return;
    }
  }
  setHovered(bookAtEvent(event));
});
canvas.addEventListener('pointerleave', () => { if (!didDrag) pressed = -1; setHovered(-1); });
canvas.addEventListener('pointerdown', event => {
  if (openingIndex >= 0) return;
  pressed = bookAtEvent(event);
  dragStartX = event.clientX;
  dragStartOffset = cameraTargetX;
  didDrag = false;
  if (phoneView.matches) canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointerup', event => {
  const index = bookAtEvent(event);
  if (!didDrag && index === pressed && index >= 0 && !bookData[index].disabled) {
    if (phoneView.matches) {
      openingIndex = index;
      canvas.classList.remove('book-hover');
      models.forEach((model, modelIndex) => {
        model.userData.targetRotation = modelIndex === index ? 0.28 : 0;
        model.userData.targetZ = modelIndex === index ? 0.24 : 0;
        model.userData.targetY = modelIndex === index ? 0.02 : 0;
      });
      window.setTimeout(() => {
        window.openMathsBook?.(bookData[index].course, bookData[index].mode);
        openingIndex = -1;
        setHovered(-1);
      }, 720);
    } else {
      window.openMathsBook?.(bookData[index].course, bookData[index].mode);
    }
  }
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  pressed = -1;
  didDrag = false;
});
canvas.addEventListener('pointercancel', () => { pressed = -1; didDrag = false; setHovered(-1); });

function resize() {
  const width = shelfElement.clientWidth;
  const height = shelfElement.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  const neededDistance = 7.9 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
  camera.position.z = phoneView.matches ? 13.2 : Math.max(15.8, neededDistance);
  if (!phoneView.matches) cameraTargetX = 0;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(shelfElement);
resize();

let previousFrame = performance.now();
function animate() {
  const now = performance.now();
  const dt = Math.min((now - previousFrame) / 1000, 0.05);
  previousFrame = now;
  const ease = 1 - Math.exp(-dt * 5);
  cameraX += (cameraTargetX - cameraX) * (1 - Math.exp(-dt * 9));
  camera.position.x = cameraX;
  camera.lookAt(cameraX, 2.55, 0);
  models.forEach((model, index) => {
    const modelEase = phoneView.matches && openingIndex === index ? 1 - Math.exp(-dt * 2.6) : ease;
    model.rotation.x += (model.userData.targetRotation - model.rotation.x) * modelEase;
    model.position.z += (model.userData.targetZ - model.position.z) * modelEase;
    model.position.y += (model.userData.targetY - model.position.y) * modelEase;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('beforeunload', () => renderer.dispose(), {once: true});

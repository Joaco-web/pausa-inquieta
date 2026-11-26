// La merch en 3D: la remera negra (“¿Qué está faltando?”), la remera blanca con la
// trama de círculos y los anteojos violetas. Cada pieza tiene volumen: el cuerpo
// curvado, espesor en los bordes y espalda lisa. Flotan y se balancean solas;
// se pueden girar arrastrando, como el llavero.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const lerp = (a, b, t) => a + (b - a) * t;

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
// Silueta de la imagen pintada de un color (para el canto y la espalda)
function silhouette(img, color) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// Una pieza: varias capas de la misma silueta (dan el espesor), la cara con la foto
// y la espalda lisa. El cuerpo se curva un poco hacia adelante.
function piece(img, { height, depth, bend, edge, back }) {
  const w = height * (img.width / img.height), h = height;
  const front = new THREE.Texture(img); front.colorSpace = THREE.SRGBColorSpace; front.anisotropy = 4; front.needsUpdate = true;
  const edgeTex = silhouette(img, edge), backTex = silhouette(img, back);
  const geo = new THREE.PlaneGeometry(w, h, 32, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const u = pos.getX(i) / (w / 2); pos.setZ(i, -bend * u * u); }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  const LAYERS = 9;
  for (let k = 0; k < LAYERS; k++) {
    const z = -depth * (k / (LAYERS - 1));
    let mat;
    if (k === 0) mat = new THREE.MeshStandardMaterial({ map: front, alphaTest: 0.5, roughness: 0.75, metalness: 0, side: THREE.FrontSide });
    else if (k === LAYERS - 1) mat = new THREE.MeshStandardMaterial({ map: backTex, alphaTest: 0.5, roughness: 0.9, side: THREE.BackSide });
    else mat = new THREE.MeshStandardMaterial({ map: edgeTex, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.z = z;
    g.add(m);
  }
  return g;
}

export async function createMerch(canvas, { onSpin } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 4, 6); scene.add(key);
  const rim = new THREE.PointLight(0xa47cff, 14, 0, 1.5); rim.position.set(-4, -1, 2); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 10);

  const [negra, blanca, anteojos] = await Promise.all([
    loadImage('assets/img/merch/remera-negra.webp'),
    loadImage('assets/img/merch/remera-blanca.webp'),
    loadImage('assets/img/merch/anteojos.webp'),
  ]);
  const all = new THREE.Group(); scene.add(all);
  const items = [
    { g: piece(negra, { height: 3.0, depth: 0.12, bend: 0.22, edge: '#1a1a1a', back: '#141414' }), pos: [1.15, 0.85, -0.7], rot: 0.08, ph: 0 },
    { g: piece(blanca, { height: 2.4, depth: 0.12, bend: 0.2, edge: '#d9d8d4', back: '#f1f0ec' }), pos: [-0.45, -0.25, 0.15], rot: -0.05, ph: 2.1 },
    { g: piece(anteojos, { height: 0.95, depth: 0.1, bend: 0.12, edge: '#0e0e0e', back: '#151515' }), pos: [-1.3, -1.6, 0.9], rot: -0.08, ph: 4.2 },
  ];
  items.forEach((it) => {
    it.g.position.set(...it.pos);
    it.g.rotation.z = it.rot;
    it.spin = 0; it.spinV = 0;
    it.g.traverse((o) => { o.userData.item = it; });
    all.add(it.g);
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // Arrastrar: gira todo; click en una pieza: da una vuelta
  const st = { drag: false, lx: 0, moved: 0, rotY: 0, vel: 0, tx: 0, ty: 0, x: 0, y: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener('pointerdown', (e) => { st.drag = true; st.lx = e.clientX; st.moved = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    st.tx = ((e.clientX - r.left) / r.width - 0.5); st.ty = ((e.clientY - r.top) / r.height - 0.5);
    if (!st.drag) return;
    const dx = e.clientX - st.lx; st.lx = e.clientX; st.moved += Math.abs(dx);
    st.vel = dx * 0.006; st.rotY += st.vel;
  });
  canvas.addEventListener('pointerup', (e) => {
    st.drag = false;
    if (st.moved > 6) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(all.children, true)[0];
    if (hit && hit.object.userData.item) { hit.object.userData.item.spinV = 0.42; onSpin && onSpin(); }
  });
  canvas.addEventListener('pointerleave', () => { st.tx = 0; st.ty = 0; });

  let raf = 0;
  const clock = new THREE.Clock();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    if (!st.drag) { st.vel *= 0.94; st.rotY += st.vel; st.rotY *= 0.985; }
    st.x = lerp(st.x, st.tx, 0.06); st.y = lerp(st.y, st.ty, 0.06);
    all.rotation.y = st.rotY + st.x * 0.35;
    all.rotation.x = st.y * 0.18;
    items.forEach((it) => {
      it.spin += it.spinV; it.spinV *= 0.93;
      if (Math.abs(it.spinV) < 0.002) it.spin = lerp(it.spin, Math.round(it.spin / (Math.PI * 2)) * Math.PI * 2, 0.06);
      it.g.rotation.y = Math.sin(t * 0.55 + it.ph) * 0.38 + it.spin;
      it.g.rotation.x = Math.sin(t * 0.4 + it.ph) * 0.06;
      it.g.position.y = it.pos[1] + Math.sin(t * 0.9 + it.ph) * 0.06;
    });
    renderer.render(scene, camera);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !raf) { resize(); loop(); }
    if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
  }).observe(canvas);
  return { resize };
}

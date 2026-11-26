// La merch en 3D: la remera negra (adelante el semicírculo y las letras, atrás
// “¿Qué está faltando?”), la remera blanca con la trama de círculos (atrás
// “¿Qué te dije que hagas antes?”) y los anteojos, modelados en Blender
// (tools/anteojos_blender.py) y cargados como .glb.
// Flotan y se balancean solas; se giran arrastrando y dan una vuelta con un click.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const lerp = (a, b, t) => a + (b - a) * t;
const LIME = '#d7ff3a', VIOLET = '#a47cff', BLUE = '#1f3cff', RED = '#ff4b2b', PAPER = '#ecebe5';

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
function tex(source) {
  const t = source instanceof HTMLCanvasElement ? new THREE.CanvasTexture(source) : new THREE.Texture(source);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true;
  return t;
}
// Silueta de una imagen pintada de un color (el canto de la tela)
function silhouette(img, color) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return tex(c);
}
// La espalda se ve desde atrás: se espeja para que se lea bien
function mirrored(img) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d');
  x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(img, 0, 0);
  return tex(c);
}
function bentPlane(w, h, bend) {
  const geo = new THREE.PlaneGeometry(w, h, 32, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const u = pos.getX(i) / (w / 2); pos.setZ(i, -bend * u * u); }
  geo.computeVertexNormals();
  return geo;
}

// ---------- Remera: frente con su foto, espalda con la suya y un espesor mínimo de tela.
// La espalda ya viene ajustada a la silueta del frente (tools/merch_espalda.py), así las dos caras encajan.
function shirt(front, back, { height, depth, bend, edge }) {
  const g = new THREE.Group();
  const fGeo = bentPlane(height * (front.width / front.height), height, bend);
  const add = (geo, mat, z) => { const m = new THREE.Mesh(geo, mat); m.position.z = z; g.add(m); };
  add(fGeo, new THREE.MeshStandardMaterial({ map: tex(front), alphaTest: 0.5, roughness: 0.78 }), 0);
  // el canto: apenas dos capas finitas entre el frente y la espalda
  add(fGeo, new THREE.MeshStandardMaterial({ map: silhouette(front, edge), alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide }), -depth * 0.33);
  add(fGeo, new THREE.MeshStandardMaterial({ map: silhouette(front, edge), alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide }), -depth * 0.66);
  add(fGeo, new THREE.MeshStandardMaterial({ map: mirrored(back), alphaTest: 0.5, roughness: 0.78, side: THREE.BackSide }), -depth);
  return g;
}

// ---------- Anteojos: modelo 3D hecho en Blender (tools/anteojos_blender.py → assets/3d/anteojos/anteojos.glb)
// Marco negro satinado con la trama y el logo impresos, cristales violeta y bisagras metálicas.
async function glasses() {
  const gltf = await new GLTFLoader().loadAsync('assets/3d/anteojos/anteojos.glb?v=1');
  const model = gltf.scene;
  model.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    if (/cristal/i.test(m.name)) {
      // cristal violeta: transparente de verdad (se ve lo de atrás), con reflejos
      o.material = new THREE.MeshPhysicalMaterial({
        color: 0x45225e, roughness: 0.08, metalness: 0, ior: 1.45,
        transparent: true, opacity: 0.9, clearcoat: 1, clearcoatRoughness: 0.05,
        envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false,
      });
      o.renderOrder = 2;
    } else if (m.map) {
      m.map.anisotropy = 8;
    }
  });
  // centrado y a la escala de la composición (ancho ≈ 2.1)
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const g = new THREE.Group();
  g.add(model);
  g.scale.setScalar(2.1 / size.x);
  return g;
}

export async function createMerch(canvas, { onSpin, area } = {}) {
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
  const fill = new THREE.DirectionalLight(0xffffff, 0.8); fill.position.set(-2, 1, -6); scene.add(fill);
  const rim = new THREE.PointLight(0xa47cff, 14, 0, 1.5); rim.position.set(-4, -1, 2); scene.add(rim);
  // el canvas es más grande que el recuadro (para que nada se corte al girar):
  // la cámara se aleja en la misma proporción y todo se ve del mismo tamaño
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 14);

  const [negra, negraB, blanca, blancaB, lentes] = await Promise.all([
    loadImage('assets/img/merch/remera-negra.webp?v=3'),
    loadImage('assets/img/merch/remera-negra-espalda.webp?v=3'),
    loadImage('assets/img/merch/remera-blanca.webp?v=3'),
    loadImage('assets/img/merch/remera-blanca-espalda.webp?v=3'),
    glasses(),
  ]);
  const all = new THREE.Group(); scene.add(all);
  const items = [
    { g: shirt(negra, negraB, { height: 2.75, depth: 0.035, bend: 0.2, edge: '#1a1a1a' }), pos: [1.15, 0.85, -0.7], rot: 0.08, yaw: 0, ph: 0 },
    { g: shirt(blanca, blancaB, { height: 2.4, depth: 0.035, bend: 0.18, edge: '#d9d8d4' }), pos: [-0.45, -0.25, 0.15], rot: -0.05, yaw: 0, ph: 2.1 },
    { g: lentes, pos: [-1.2, -1.55, 1.0], rot: -0.08, yaw: -0.55, ph: 4.2 },
  ];
  items.forEach((it) => {
    it.g.position.set(...it.pos);
    it.g.rotation.z = it.rot;
    if (it.scale) it.g.scale.setScalar(it.scale);
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

  // Arrastrar: gira todo; click en una pieza: da una vuelta.
  // Se escucha en el recuadro (el canvas, más grande, no tapa nada de alrededor).
  const zone = area || canvas;
  const st = { drag: false, lx: 0, moved: 0, rotY: 0, vel: 0, tx: 0, ty: 0, x: 0, y: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  zone.addEventListener('pointerdown', (e) => { st.drag = true; st.lx = e.clientX; st.moved = 0; zone.setPointerCapture(e.pointerId); });
  zone.addEventListener('pointermove', (e) => {
    const r = zone.getBoundingClientRect();
    st.tx = ((e.clientX - r.left) / r.width - 0.5); st.ty = ((e.clientY - r.top) / r.height - 0.5);
    if (!st.drag) return;
    const dx = e.clientX - st.lx; st.lx = e.clientX; st.moved += Math.abs(dx);
    st.vel = dx * 0.006; st.rotY += st.vel;
  });
  zone.addEventListener('pointerup', (e) => {
    st.drag = false;
    if (st.moved > 6) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(all.children, true)[0];
    if (hit && hit.object.userData.item) { hit.object.userData.item.spinV = 0.42; onSpin && onSpin(); }
  });
  zone.addEventListener('pointerleave', () => { st.tx = 0; st.ty = 0; });

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
      it.g.rotation.y = it.yaw + Math.sin(t * 0.55 + it.ph) * 0.38 + it.spin;
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

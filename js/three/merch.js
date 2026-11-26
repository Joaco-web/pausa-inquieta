// La merch en 3D: la remera negra (adelante “¿Qué está faltando?”, atrás el
// semicírculo y las letras), la remera blanca con la trama de círculos (atrás
// “¿Qué te dije que hagas antes?”) y los anteojos de lentes violetas, armados
// en 3D de verdad: marco, vidrios que se ven del otro lado y patas.
// Flotan y se balancean solas; se giran arrastrando y dan una vuelta con un click.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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

// ---------- Remera: frente con su foto, espalda con la suya, y espesor de tela
function shirt(front, back, { height, depth, bend, edge }) {
  const g = new THREE.Group();
  const wF = height * (front.width / front.height);
  const wB = height * (back.width / back.height);
  const fGeo = bentPlane(wF, height, bend);
  const bGeo = bentPlane(wB, height, bend);
  const LAYERS = 9;
  const edgeTex = silhouette(front, edge);
  for (let k = 0; k < LAYERS; k++) {
    const z = -depth * (k / (LAYERS - 1));
    let m;
    if (k === 0) m = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ map: tex(front), alphaTest: 0.5, roughness: 0.78 }));
    else if (k === LAYERS - 1) m = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({ map: mirrored(back), alphaTest: 0.5, roughness: 0.78, side: THREE.BackSide }));
    else m = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ map: edgeTex, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide }));
    m.position.z = z;
    g.add(m);
  }
  return g;
}

// ---------- Anteojos en 3D: marco negro con la trama de círculos, vidrios violetas, patas
function circlesCanvas(w, h, { text, n = 8 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = '#0c0c0c'; x.fillRect(0, 0, w, h);
  const cols = [LIME, VIOLET, RED, PAPER, BLUE];
  x.lineWidth = Math.max(2, h * 0.025);
  for (let i = 0; i < n; i++) {
    x.strokeStyle = cols[i % cols.length]; x.globalAlpha = 0.8;
    x.beginPath(); x.arc(Math.random() * w, Math.random() * h, h * (0.3 + Math.random() * 0.45), 0, Math.PI * 2); x.stroke();
  }
  x.globalAlpha = 1;
  if (text) {
    x.fillStyle = PAPER; x.font = `500 ${Math.round(h * 0.3)}px Poppins, sans-serif`; x.textBaseline = 'middle';
    x.fillText('PAUSA', w * 0.07, h * 0.33); x.fillText('INQUIETA', w * 0.07, h * 0.68);
  }
  return tex(c);
}
// contorno de un vidrio: más ancho arriba que abajo, con las puntas redondeadas
function lensPath(p, cx, cy, wTop, wBot, h, r) {
  const t = cy + h / 2, b = cy - h / 2;
  const tl = cx - wTop / 2, tr = cx + wTop / 2, bl = cx - wBot / 2, br = cx + wBot / 2;
  p.moveTo(tl + r, t);
  p.lineTo(tr - r, t); p.quadraticCurveTo(tr, t, tr, t - r);
  p.lineTo(br, b + r * 1.6); p.quadraticCurveTo(br, b, br - r * 1.6, b);
  p.lineTo(bl + r * 1.6, b); p.quadraticCurveTo(bl, b, bl, b + r * 1.6);
  p.lineTo(tl, t - r); p.quadraticCurveTo(tl, t, tl + r, t);
  return p;
}
function glasses() {
  const g = new THREE.Group();
  const LWt = 0.88, LWb = 0.78, LH = 0.46, BR = 0.2; // vidrios y puente
  const RIM = 0.07, BROW = 0.13, D = 0.08;
  const cxs = [-(BR / 2 + LWt / 2), BR / 2 + LWt / 2];
  const W = BR + LWt * 2 + RIM * 2 + 0.06;
  // contorno exterior del marco: ceja recta y gruesa arriba, abajo sigue a los vidrios y sube en el puente
  const top = LH / 2 + BROW, bot = -LH / 2 - RIM;
  const s = new THREE.Shape();
  const xr = W / 2, xl = -W / 2;
  s.moveTo(xl + 0.08, top);
  s.lineTo(xr - 0.08, top); s.quadraticCurveTo(xr, top, xr, top - 0.08);
  s.lineTo(xr - 0.02, bot + 0.2); s.quadraticCurveTo(xr - 0.06, bot, xr - 0.24, bot);
  s.lineTo(cxs[1] - LWb / 2 + 0.05, bot); s.quadraticCurveTo(BR / 2 + 0.02, bot + 0.02, BR / 2, 0.02);
  s.quadraticCurveTo(0, 0.1, -BR / 2, 0.02); // puente
  s.quadraticCurveTo(-BR / 2 - 0.02, bot + 0.02, cxs[0] + LWb / 2 - 0.05, bot);
  s.lineTo(xl + 0.24, bot); s.quadraticCurveTo(xl + 0.06, bot, xl + 0.02, bot + 0.2);
  s.lineTo(xl, top - 0.08); s.quadraticCurveTo(xl, top, xl + 0.08, top);
  cxs.forEach((cx) => s.holes.push(lensPath(new THREE.Path(), cx, 0, LWt, LWb, LH, 0.06)));
  const frameGeo = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 3, curveSegments: 18 });
  frameGeo.translate(0, 0, -D / 2);
  const H = top - bot;
  const print = circlesCanvas(1024, 400, { n: 7 });
  print.repeat.set(1 / W, 1 / H); print.offset.set(0.5, -bot / H);
  const black = new THREE.MeshPhysicalMaterial({ color: 0x0f0f0f, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.15 });
  const printed = new THREE.MeshPhysicalMaterial({ map: print, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.15 });
  g.add(new THREE.Mesh(frameGeo, [printed, black]));
  // vidrios violetas: transparentes, se ve a través de los dos lados
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x6b2fd0, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.7,
    clearcoat: 1, clearcoatRoughness: 0.02, side: THREE.DoubleSide, depthWrite: false,
  });
  cxs.forEach((cx) => {
    const lg = new THREE.ExtrudeGeometry(lensPath(new THREE.Shape(), cx, 0, LWt + 0.02, LWb + 0.02, LH + 0.02, 0.06), { depth: 0.018, bevelEnabled: false, curveSegments: 18 });
    lg.translate(0, 0, -0.009);
    const lens = new THREE.Mesh(lg, lensMat);
    lens.renderOrder = 2;
    g.add(lens);
  });
  // patas: desde las bisagras hacia atrás, más finas al final y curvadas para la oreja
  const TL = 1.85;
  [-1, 1].forEach((sd) => {
    const hinge = new THREE.Group();
    hinge.position.set(sd * (W / 2 - 0.05), LH / 2 - 0.02, -D / 2 - 0.02);
    hinge.rotation.y = sd * 0.05; // se abren apenas
    g.add(hinge);
    const outer = new THREE.MeshPhysicalMaterial({ map: circlesCanvas(1024, 96, { text: sd > 0, n: 9 }), roughness: 0.3, clearcoat: 0.9 });
    const armGeo = new THREE.BoxGeometry(0.05, 0.1, TL, 1, 1, 8);
    const ap = armGeo.attributes.position;
    for (let i = 0; i < ap.count; i++) { const k = (ap.getZ(i) + TL / 2) / TL; ap.setY(i, ap.getY(i) * (0.55 + 0.45 * k)); }
    armGeo.computeVertexNormals();
    // caras [+x, -x, +y, -y, +z, -z]: la de afuera lleva la trama (y “Pausa Inquieta” en la derecha)
    const mats = sd > 0 ? [outer, black, black, black, black, black] : [black, outer, black, black, black, black];
    const arm = new THREE.Mesh(armGeo, mats);
    arm.position.set(0, 0, -TL / 2);
    hinge.add(arm);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.055, 0.42), black);
    tip.position.set(0, -0.14, -TL - 0.14);
    tip.rotation.x = -0.8;
    hinge.add(tip);
    const knob = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.14), black);
    knob.position.set(-sd * 0.01, 0, 0.04);
    hinge.add(knob);
  });
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

  const [negra, negraB, blanca, blancaB] = await Promise.all([
    loadImage('assets/img/merch/remera-negra.webp'),
    loadImage('assets/img/merch/remera-negra-espalda.webp'),
    loadImage('assets/img/merch/remera-blanca.webp'),
    loadImage('assets/img/merch/remera-blanca-espalda.webp'),
  ]);
  const all = new THREE.Group(); scene.add(all);
  const items = [
    { g: shirt(negra, negraB, { height: 3.0, depth: 0.12, bend: 0.22, edge: '#1a1a1a' }), pos: [1.15, 0.85, -0.7], rot: 0.08, yaw: 0, ph: 0 },
    { g: shirt(blanca, blancaB, { height: 2.4, depth: 0.12, bend: 0.2, edge: '#d9d8d4' }), pos: [-0.45, -0.25, 0.15], rot: -0.05, yaw: 0, ph: 2.1 },
    { g: glasses(), pos: [-1.2, -1.55, 1.0], rot: -0.08, yaw: 0.55, ph: 4.2, scale: 0.95 },
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

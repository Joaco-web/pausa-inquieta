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

// ---------- Anteojos en 3D (como los de la foto): marco negro brillante, vidrios violeta oscuro,
// círculos finitos de colores en las puntas del frente y a lo largo de las patas,
// y “PAUSA INQUIETA” en una placa sobre la pata derecha, cerca de la bisagra.
function seeded(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function ring(x, cx, cy, r, color, lw) { x.strokeStyle = color; x.lineWidth = lw; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke(); }
// frente: negro, con círculos solo cerca de las dos puntas
function frontPrint(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = '#0b0b0b'; x.fillRect(0, 0, w, h);
  const lw = h * 0.014;
  // punta izquierda
  ring(x, w * 0.02, h * 0.3, h * 0.22, '#ff7a2b', lw);
  ring(x, w * 0.06, h * 0.12, h * 0.16, LIME, lw);
  ring(x, w * 0.035, h * 0.55, h * 0.18, PAPER, lw);
  // punta derecha
  ring(x, w * 0.97, h * 0.62, h * 0.24, PAPER, lw);
  ring(x, w * 0.93, h * 0.28, h * 0.17, VIOLET, lw);
  ring(x, w * 0.985, h * 0.2, h * 0.12, RED, lw);
  return tex(c);
}
// pata: círculos repartidos; en la derecha, la placa con el nombre cerca de la bisagra
function templePrint(w, h, badge, seed) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = '#0b0b0b'; x.fillRect(0, 0, w, h);
  const rnd = seeded(seed);
  const cols = [LIME, VIOLET, PAPER, RED, '#ff7a2b', VIOLET];
  const lw = h * 0.045;
  for (let i = 0; i < 9; i++) {
    const u = badge && i < 2 ? 0.05 + i * 0.05 : 0.08 + rnd() * 0.88;
    ring(x, w * u, h * (0.2 + rnd() * 0.6), h * (0.35 + rnd() * 0.45), cols[i % cols.length], lw);
  }
  if (badge) {
    const bx = w * 0.13, bw = w * 0.2;
    x.fillStyle = '#0b0b0b'; x.fillRect(bx, 0, bw, h);
    x.fillStyle = 'rgba(236,235,229,.55)'; x.fillRect(bx, h * 0.12, h * 0.025, h * 0.76);
    x.fillStyle = PAPER; x.textBaseline = 'middle';
    x.font = `500 ${Math.round(h * 0.3)}px "Inter Tight", "Helvetica Neue", Arial, sans-serif`;
    x.fillText('PAUSA', bx + h * 0.16, h * 0.33);
    x.fillText('INQUIETA', bx + h * 0.16, h * 0.68);
    ring(x, bx + bw * 1.05, h * 0.5, h * 0.62, PAPER, lw);
  }
  return tex(c);
}
// contorno de un vidrio (wayfarer): arriba más ancho, la punta de afuera más alta, abajo redondeado
function lensPath(p, cx, cy, wTop, wBot, h, r, side = 1) {
  const t = cy + h / 2, b = cy - h / 2, lift = 0.03 * side;
  const tl = cx - wTop / 2, tr = cx + wTop / 2, bl = cx - wBot / 2, br = cx + wBot / 2;
  p.moveTo(tl + r, t - lift);
  p.lineTo(tr - r, t + lift); p.quadraticCurveTo(tr, t + lift, tr, t + lift - r);
  p.lineTo(br, b + r * 2); p.quadraticCurveTo(br, b, br - r * 2, b);
  p.lineTo(bl + r * 2, b); p.quadraticCurveTo(bl, b, bl, b + r * 2);
  p.lineTo(tl, t - lift - r); p.quadraticCurveTo(tl, t - lift, tl + r, t - lift);
  return p;
}
function glasses() {
  const g = new THREE.Group();
  const LWt = 0.9, LWb = 0.8, LH = 0.52, BR = 0.2; // vidrios y puente
  const RIM = 0.08, BROW = 0.15, D = 0.1;
  const cxs = [-(BR / 2 + LWt / 2), BR / 2 + LWt / 2];
  const W = BR + LWt * 2 + RIM * 2 + 0.08;
  const top = LH / 2 + BROW, bot = -LH / 2 - RIM;
  const xr = W / 2, xl = -W / 2;
  // contorno del marco: ceja gruesa y recta, las puntas de afuera salen un poco (donde van las bisagras)
  const s = new THREE.Shape();
  s.moveTo(xl + 0.06, top);
  s.lineTo(xr - 0.06, top); s.quadraticCurveTo(xr, top, xr, top - 0.06);
  s.lineTo(xr, bot + 0.16); s.quadraticCurveTo(xr, bot, xr - 0.16, bot);
  s.lineTo(cxs[1] - LWb / 2 + 0.05, bot); s.quadraticCurveTo(BR / 2 + 0.02, bot + 0.02, BR / 2, 0.02);
  s.quadraticCurveTo(0, 0.1, -BR / 2, 0.02); // puente
  s.quadraticCurveTo(-BR / 2 - 0.02, bot + 0.02, cxs[0] + LWb / 2 - 0.05, bot);
  s.lineTo(xl + 0.16, bot); s.quadraticCurveTo(xl, bot, xl, bot + 0.16);
  s.lineTo(xl, top - 0.06); s.quadraticCurveTo(xl, top, xl + 0.06, top);
  cxs.forEach((cx, i) => s.holes.push(lensPath(new THREE.Path(), cx, 0, LWt, LWb, LH, 0.06, i ? 1 : -1)));
  const frameGeo = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.016, bevelSegments: 4, curveSegments: 20 });
  frameGeo.translate(0, 0, -D / 2);
  const H = top - bot;
  const print = frontPrint(1400, 480);
  print.repeat.set(1 / W, 1 / H); print.offset.set(0.5, -bot / H);
  const gloss = { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 };
  const black = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0c, ...gloss });
  g.add(new THREE.Mesh(frameGeo, black));
  // los círculos van solo en la cara de adelante (adentro el marco es negro liso)
  const face = new THREE.Mesh(new THREE.ShapeGeometry(s, 20), new THREE.MeshPhysicalMaterial({ map: print, ...gloss, polygonOffset: true, polygonOffsetFactor: -2 }));
  face.position.z = D / 2 + 0.021;
  g.add(face);
  // vidrios violeta oscuro, brillantes; se ve a través de los dos lados
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x2e0f45, roughness: 0.03, metalness: 0.15, transparent: true, opacity: 0.9,
    clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false,
  });
  cxs.forEach((cx, i) => {
    const lg = new THREE.ExtrudeGeometry(lensPath(new THREE.Shape(), cx, 0, LWt + 0.02, LWb + 0.02, LH + 0.02, 0.06, i ? 1 : -1), { depth: 0.02, bevelEnabled: false, curveSegments: 20 });
    lg.translate(0, 0, -0.01);
    const lens = new THREE.Mesh(lg, lensMat);
    lens.renderOrder = 2;
    g.add(lens);
  });
  // patas: anchas junto a la bisagra, se afinan hacia atrás y bajan al final (para la oreja)
  const TL = 1.9, TW = 0.07, TH = 0.18;
  [-1, 1].forEach((sd) => {
    const hinge = new THREE.Group();
    hinge.position.set(sd * (W / 2 - TW / 2), top - TH / 2 - 0.02, -D / 2 - 0.01);
    hinge.rotation.y = sd * 0.05; // se abren apenas
    g.add(hinge);
    const outer = new THREE.MeshPhysicalMaterial({ map: templePrint(1400, 130, sd > 0, sd > 0 ? 7 : 19), ...gloss });
    const armGeo = new THREE.BoxGeometry(TW, TH, TL, 1, 1, 12);
    const ap = armGeo.attributes.position;
    for (let i = 0; i < ap.count; i++) {
      const k = 1 - (ap.getZ(i) + TL / 2) / TL; // 0 en la bisagra, 1 al final
      ap.setY(i, ap.getY(i) * (1 - 0.5 * k));
      ap.setX(i, ap.getX(i) * (1 - 0.3 * k));
    }
    armGeo.computeVertexNormals();
    // caras [+x, -x, +y, -y, +z, -z]: la de afuera lleva la trama
    const mats = sd > 0 ? [outer, black, black, black, black, black] : [black, outer, black, black, black, black];
    const arm = new THREE.Mesh(armGeo, mats);
    arm.position.set(0, 0, -TL / 2);
    hinge.add(arm);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(TW * 0.7, TH * 0.48, 0.45), black);
    tip.position.set(0, -0.16, -TL - 0.13);
    tip.rotation.x = -0.75;
    hinge.add(tip);
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
    loadImage('assets/img/merch/remera-negra.webp?v=3'),
    loadImage('assets/img/merch/remera-negra-espalda.webp?v=3'),
    loadImage('assets/img/merch/remera-blanca.webp?v=3'),
    loadImage('assets/img/merch/remera-blanca-espalda.webp?v=3'),
  ]);
  const all = new THREE.Group(); scene.add(all);
  const items = [
    { g: shirt(negra, negraB, { height: 2.75, depth: 0.035, bend: 0.2, edge: '#1a1a1a' }), pos: [1.15, 0.85, -0.7], rot: 0.08, yaw: 0, ph: 0 },
    { g: shirt(blanca, blancaB, { height: 2.4, depth: 0.035, bend: 0.18, edge: '#d9d8d4' }), pos: [-0.45, -0.25, 0.15], rot: -0.05, yaw: 0, ph: 2.1 },
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

// El llavero: semicírculo de acrílico flúor, con argolla y cadena.
// Se balancea solo; se puede girar arrastrando y "hacer sonar" con un click.
// Al lado, el librito (tapa y contratapa reales), chico como el objeto físico.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createKeychain(canvas, { onJingle } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xa47cff, 20, 0, 1.5);
  rim.position.set(-3, -1, 2);
  scene.add(rim);

  // Acrílico
  const s = new THREE.Shape();
  s.moveTo(0, -1);
  s.absarc(0, 0, 1, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, -1);
  const hole = new THREE.Path();
  hole.absarc(0.17, 0.8, 0.08, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 4, curveSegments: 72 });
  geo.translate(-0.17, -0.8, -0.06);
  // Acrílico flúor transparente: caras translúcidas (se ve lo de atrás)
  // y cantos que juntan la luz y brillan más, como la pieza real.
  const face = new THREE.MeshPhysicalMaterial({
    color: 0xe4ff5c, emissive: 0xc8f000, emissiveIntensity: 0.22,
    roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03,
    specularIntensity: 1, ior: 1.49, envMapIntensity: 1.4,
    transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide,
  });
  const side = new THREE.MeshPhysicalMaterial({
    color: 0xd7ff3a, emissive: 0xd7ff3a, emissiveIntensity: 0.9, toneMapped: false,
    roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.95,
  });
  const acrylic = new THREE.Mesh(geo, [face, side]);
  acrylic.renderOrder = 2;
  // línea grabada interna (como la pieza real)
  const inner = new THREE.Shape();
  inner.moveTo(0.12, -0.78);
  inner.absarc(0.12, 0, 0.78, -Math.PI / 2, Math.PI / 2, false);
  const innerLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(inner.getPoints(80)),
    new THREE.LineBasicMaterial({ color: 0xf4ffc4, transparent: true, opacity: 0.85 }),
  );
  innerLine.position.set(-0.17, -0.8, 0.1);
  acrylic.add(innerLine);

  const metal = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.22 });
  const pivot = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 20, 80), metal);
  pivot.add(ring);
  const links = [];
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 32), metal);
    l.scale.y = 1.5;
    l.position.y = -0.46 - i * 0.17;
    l.rotation.y = i % 2 ? Math.PI / 2 : 0;
    pivot.add(l);
    links.push(l);
  }
  const jump = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 12, 40), metal);
  jump.position.y = -0.98;
  jump.rotation.y = Math.PI / 2;
  pivot.add(jump);
  acrylic.position.y = -1.04;
  acrylic.rotation.z = 0.35;
  pivot.add(acrylic);
  pivot.position.set(-0.85, 1.35, 0);
  scene.add(pivot);

  // ---- El librito: tapa (adelante), contratapa (atrás), lomo a la izquierda y hojas
  // Proporciones tomadas de la tapa real (615 × 900) y del lomo (60 × 900).
  const BH = 1.5;
  const BW = BH * 615 / 900;
  const BD = BH * 60 / 900;
  const loader = new THREE.TextureLoader();
  const tex = (src) => {
    const t = loader.load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const cover = (src) => new THREE.MeshStandardMaterial({ map: tex(src), roughness: 0.8, metalness: 0 });
  const pages = new THREE.MeshStandardMaterial({ color: 0xf1eee6, roughness: 0.95 });
  // orden de caras de la caja: +x, -x, +y, -y, +z, -z
  const book = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD), [
    pages,
    cover('assets/img/libro-lomo.webp'),
    pages,
    pages,
    cover('assets/img/libro-tapa.webp'),
    cover('assets/img/libro-contratapa.webp'),
  ]);
  const bookPivot = new THREE.Group();
  bookPivot.add(book);
  bookPivot.position.set(1.3, -0.35, 0);
  bookPivot.rotation.z = -0.08;
  scene.add(bookPivot);

  // Interacción
  const st = { rotY: 0, vel: 0.006, drag: false, lx: 0, swing: 0, swingV: 0, tx: 0, ty: 0, x: 0, y: 0 };
  canvas.addEventListener('pointerdown', (e) => { st.drag = true; st.lx = e.clientX; st.moved = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    st.tx = ((e.clientX - r.left) / r.width - 0.5);
    st.ty = ((e.clientY - r.top) / r.height - 0.5);
    if (!st.drag) return;
    const dx = e.clientX - st.lx;
    st.lx = e.clientX;
    st.moved += Math.abs(dx);
    st.vel = dx * 0.01;
    st.rotY += st.vel;
  });
  canvas.addEventListener('pointerup', () => {
    st.drag = false;
    if (st.moved < 6) { st.swingV += 0.09; onJingle && onJingle(); }
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

  const clock = new THREE.Clock();
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    if (!st.drag) { st.vel += (0.006 - st.vel) * 0.02; st.rotY += st.vel; }
    // resorte del balanceo
    st.swingV += -st.swing * 0.04;
    st.swingV *= 0.96;
    st.swing += st.swingV;
    st.x += (st.tx - st.x) * 0.05;
    st.y += (st.ty - st.y) * 0.05;
    pivot.rotation.y = st.rotY + st.x * 0.6;
    pivot.rotation.z = Math.sin(t * 1.1) * 0.05 + st.swing;
    pivot.rotation.x = st.y * 0.3;
    links.forEach((l, i) => { l.rotation.z = Math.sin(t * 2 + i) * 0.08; });
    // el libro gira despacio (se ven tapa y contratapa), flota apenas y sigue al mouse
    book.rotation.y = -st.rotY * 0.8 + 0.5 + st.x * 0.5;
    book.rotation.x = st.y * 0.25 + Math.sin(t * 0.7) * 0.04;
    bookPivot.position.y = -0.35 + Math.sin(t * 1.2 + 1) * 0.05;
    renderer.render(scene, camera);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !raf) { resize(); loop(); }
    if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
  }).observe(canvas);
}

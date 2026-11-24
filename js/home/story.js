// RECORRIDO (intro) — el storytelling se calma a medida que lo leés:
// cada palabra entra con otro peso y se asienta. Al final, el botón para iniciar.
import { split, torn, finePointer, reduced } from '../core/fx.js';
import { sound } from '../core/sound.js';

const gsap = window.gsap;

export default function story() {
  const sec = document.querySelector('.story');
  sec.querySelectorAll('.ph').forEach((p) => torn(p, { amp: 2.4 }));

  // Cada palabra entra con un peso distinto (thin, light, medium, bold, black…)
  // y se asienta en el suyo: no todo en bold.
  const FROM = [100, 200, 300, 500, 600, 700, 800, 900];
  sec.querySelectorAll('.st').forEach((line) => {
    const { words } = split(line, { chars: false });
    const base = line.classList.contains('st--key') ? 300 : 400;
    words.forEach((w) => { w.dataset.from = FROM[Math.floor(Math.random() * FROM.length)]; });
    gsap.fromTo(words, { opacity: 0.12, fontWeight: (i, el) => +el.dataset.from }, {
      opacity: 1, fontWeight: base, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: line, start: 'top 88%', end: 'top 48%', scrub: true },
    });
  });

  letras(sec);
  gsap.from(sec.querySelector('.story__head'), { opacity: 0, x: -30, duration: 0.8, scrollTrigger: { trigger: sec, start: 'top 60%' } });

  line(sec);

  // Botón Iniciar: aparece, late y es magnético
  const start = sec.querySelector('.start');
  gsap.from(start, { scale: 0, rotate: -90, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: start, start: 'top 90%' } });
  gsap.to(start.querySelector('.start__half--a'), { scale: 1.05, duration: 0.14, repeat: -1, yoyo: true, repeatDelay: 0.9, ease: 'power2.out' });
  start.addEventListener('mouseenter', () => sound.beep(440, 0.1, 0.035, 'sine'));
  if (finePointer) {
    const qx = gsap.quickTo(start, 'x', { duration: 0.6, ease: 'power3.out' });
    const qy = gsap.quickTo(start, 'y', { duration: 0.6, ease: 'power3.out' });
    sec.addEventListener('pointermove', (e) => {
      const r = start.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d < r.width) { qx(dx * 0.3); qy(dy * 0.3); } else { qx(0); qy(0); }
    });
  }
}

// ---------- Trama de letras: las de PAUSA INQUIETA, desparramadas del lado contrario al texto ----------
// Se ordenan en una grilla suelta (con huecos y giros) para que se lea como trama y no tape la lectura:
// arriba a la derecha, frente a las dos primeras frases; a la izquierda, frente a la tercera.
const PALABRA = 'PAUSAINQUIETA';
const COLORES = ['#d7ff3a', '#a47cff', '#1f3cff', '#ff4b2b', '#ecebe5', '#4a4a4a', '#23345f'];
const OSCUROS = ['#4a4a4a', '#23345f'];
// letras sueltas: en cada fila van solo vocales o solo consonantes, así nunca se arma una sílaba
const VOCALES = 'AUIE';
const CONSONANTES = 'PSNQT';

function azar(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function letras(sec) {
  const wrap = document.createElement('div');
  wrap.className = 'story__letras';
  sec.querySelector('.story__tramas').appendChild(wrap);
  let primera = true;

  const caja = (el) => {
    const s = sec.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { left: r.left - s.left, right: r.right - s.left, top: r.top - s.top, bottom: r.bottom - s.top };
  };

  // lugar real (sin las animaciones de entrada): suma de offsets hasta la sección
  const fija = (el) => {
    let x = 0; let y = 0; let n = el;
    while (n && n !== sec) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { left: x, top: y, right: x + el.offsetWidth, bottom: y + el.offsetHeight };
  };

  const zonas = () => {
    const W = sec.offsetWidth;
    const izq = [...sec.querySelectorAll('.st--l')].map(caja);
    const der = caja(sec.querySelector('.st--r'));
    // alrededor del botón Iniciar: letras sueltas, mezcladas, sin formar palabras
    const key = caja(sec.querySelector('.st--key'));
    const btn = fija(sec.querySelector('.start'));
    const lock = sec.querySelector('.lock');
    const piso = lock ? fija(lock).bottom + 30 : btn.bottom + 180;
    const alto = { y0: Math.max(key.bottom + 60, btn.top - 60), y1: piso };
    if (innerWidth < 760) {
      const head = caja(sec.querySelector('.story__head'));
      return [
        { x0: W * 0.04, x1: W * 0.96, y0: head.bottom + 24, y1: izq[0].top - 28, celda: 58 },
        { ...alto, x0: W * 0.04, x1: btn.left - 24, celda: 56, sueltas: true },
        { ...alto, x0: btn.right + 24, x1: W * 0.96, celda: 56, sueltas: true },
      ];
    }
    const borde = Math.max(...izq.map((c) => c.right));
    return [
      { x0: borde + W * 0.06, x1: W * 0.97, y0: izq[0].top - 70, y1: izq[izq.length - 1].bottom + 50, celda: 104 },
      { x0: W * 0.03, x1: der.left - W * 0.06, y0: der.top - 40, y1: der.bottom - 10, celda: 100 },
      { ...alto, x0: W * 0.04, x1: btn.left - W * 0.12, celda: 120, sueltas: true },
      { ...alto, x0: btn.right + W * 0.12, x1: W * 0.96, celda: 120, sueltas: true },
    ];
  };

  const armar = () => {
    wrap.textContent = '';
    const rnd = azar(7);
    const items = [];
    let k = 0;
    const obstaculos = [...sec.querySelectorAll('.story__c1, .start, .lock')].map(fija);
    zonas().forEach((z) => {
      const w = z.x1 - z.x0;
      const h = z.y1 - z.y0;
      if (w < 80 || h < 60) return;
      const cols = Math.max(2, Math.round(w / z.celda));
      const rows = Math.max(1, Math.round(h / z.celda));
      const cw = w / cols;
      const ch = h / rows;
      for (let r = 0; r < rows; r++) {
        const fila = rnd() < 0.5 ? VOCALES : CONSONANTES;
        for (let c = 0; c < cols; c++) {
          if (rnd() < (z.sueltas ? 0.55 : 0.45)) continue; // huecos: que respire
          const cx = z.x0 + cw * (c + 0.5);
          const cy = z.y0 + ch * (r + 0.5);
          if (z.sueltas && obstaculos.some((o) => cx > o.left - cw * 0.6 && cx < o.right + cw * 0.6 && cy > o.top - ch * 0.6 && cy < o.bottom + ch * 0.6)) continue;
          const el = document.createElement('span');
          el.className = 'letra';
          el.textContent = z.sueltas ? fila[Math.floor(rnd() * fila.length)] : PALABRA[k++ % PALABRA.length];
          const color = COLORES[Math.floor(rnd() * COLORES.length)];
          const size = Math.min(cw, ch) * (0.95 + rnd() * 0.45);
          el.style.left = `${cx + (rnd() - 0.5) * cw * 0.35}px`;
          el.style.top = `${cy + (rnd() - 0.5) * ch * 0.35}px`;
          el.style.fontSize = `${size.toFixed(0)}px`;
          el.style.color = color;
          el.style.setProperty('--giro', `${((rnd() - 0.5) * 80).toFixed(1)}deg`);
          el.style.zIndex = OSCUROS.includes(color) ? 0 : 1;
          el.style.webkitMaskPosition = el.style.maskPosition = `${Math.floor(rnd() * 300)}px ${Math.floor(rnd() * 300)}px`;
          wrap.appendChild(el);
          items.push(el);
        }
      }
    });
    if (primera && !reduced) {
      primera = false;
      gsap.from(items, {
        scale: 0, duration: 0.3, ease: 'steps(3)', stagger: { each: 0.035, from: 'random' },
        scrollTrigger: { trigger: sec, start: 'top 60%' },
      });
    }
    // unas pocas titilan, como la trama impresa que falla
    if (!reduced) {
      gsap.to(items.filter(() => rnd() < 0.3), {
        opacity: () => 0.35 + Math.random() * 0.65, duration: 0.12, repeat: -1, repeatRefresh: true,
        repeatDelay: 1.8, ease: 'steps(1)', stagger: { each: 0.5, from: 'random' },
      });
    }
  };

  let t = 0;
  const listo = document.fonts ? document.fonts.ready : Promise.resolve();
  listo.then(armar);
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(armar, 250); });
}

// ---------- Trama: línea con curvas que se dibuja con el scroll ----------
// Pocas curvas amplias (para que se lean limpias). Los puntos están en proporción a la
// sección (x de 0 a 1 del ancho, y de 0 a 1 del alto); el último punto es el botón Iniciar,
// que se calcula según dónde esté, así la línea termina justo en su borde.
const PTS = [[1.03, 0.02], [0.74, 0.20], [0.42, 0.255], [0.12, 0.32], [0.035, 0.46], [0.10, 0.60], [0.26, 0.68]];
const PTS_M = [[1.05, 0.0], [0.86, 0.12], [0.95, 0.30], [0.84, 0.50], [0.86, 0.66]];
const DOTS = [{ cls: '.story__dot--lime', at: 0.14 }, { cls: '.story__dot--red', at: 0.78 }];

function curve(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function line(sec) {
  const svg = sec.querySelector('.story__line');
  if (!svg) return;
  const path = svg.querySelector('.story__path');
  const dots = DOTS.map((d) => ({ ...d, el: svg.querySelector(d.cls) }));
  let len = 0;
  let progress = reduced ? 1 : 0;

  const paint = () => {
    path.style.strokeDashoffset = (len * (1 - progress)).toFixed(1);
    dots.forEach((d) => {
      const on = progress >= d.at;
      if (on !== d.on) {
        d.on = on;
        gsap.to(d.el, { scale: on ? 1 : 0, duration: on ? 0.6 : 0.25, ease: on ? 'back.out(2.4)' : 'power2.in' });
      }
    });
  };

  const build = () => {
    const w = sec.offsetWidth;
    const h = sec.offsetHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const mobile = innerWidth < 760;
    const pts = (mobile ? PTS_M : PTS).map(([x, y]) => [x * w, y * h]);
    // final: el borde del botón Iniciar (izquierdo en compu, derecho en celular).
    // Se usan offset* porque no cambian con las animaciones del botón.
    const cta = sec.querySelector('.story__cta');
    const btn = sec.querySelector('.start');
    if (cta && btn) {
      const cx = cta.offsetLeft + btn.offsetLeft + btn.offsetWidth / 2;
      const cy = cta.offsetTop + btn.offsetTop + btn.offsetHeight / 2;
      const r = btn.offsetWidth / 2;
      pts.push([mobile ? cx + r : cx - r, cy]);
    }
    path.setAttribute('d', curve(pts));
    len = path.getTotalLength();
    path.style.strokeDasharray = len.toFixed(1);
    dots.forEach((d) => {
      const p = path.getPointAtLength(len * d.at);
      d.el.setAttribute('cx', p.x.toFixed(1));
      d.el.setAttribute('cy', p.y.toFixed(1));
    });
    paint();
  };

  dots.forEach((d) => { d.on = false; gsap.set(d.el, { scale: 0 }); });
  build();
  window.ScrollTrigger.create({
    trigger: sec, start: 'top 75%', end: '70% 70%',
    onUpdate: (st) => { if (!reduced) { progress = st.progress; paint(); } },
    onRefresh: build,
  });
}

// RECORRIDO (intro) — el storytelling se calma a medida que lo leés:
// cada palabra entra con otro peso y se asienta. Al final, el botón para iniciar.
import { split, torn, pixels, finePointer, reduced } from '../core/fx.js';
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

  const px = pixels(sec.querySelector('.story__tramas'), { n: 26, size: [12, 64], colors: ['#1f3cff', '#a47cff', '#d7ff3a', '#ecebe5', '#ff4b2b'], area: innerWidth < 760 ? [55, 4, 96, 40] : [66, 8, 98, 92] });
  gsap.from(px, { scale: 0, duration: 0.25, ease: 'steps(2)', stagger: { each: 0.03, from: 'random' }, scrollTrigger: { trigger: sec, start: 'top 60%' } });
  gsap.to(px, { opacity: () => Math.random(), duration: 0.12, repeat: -1, repeatRefresh: true, repeatDelay: 1.4, ease: 'steps(1)', stagger: { each: 0.4, from: 'random' } });
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

// ---------- Trama: línea con curvas que se dibuja con el scroll ----------
// Los puntos están en proporción a la sección (x de 0 a 1 del ancho, y de 0 a 1 del alto);
// la curva pasa por todos (Catmull-Rom → Bézier). Los círculos aparecen cuando la línea llega.
const PTS = [[1.04, 0.01], [0.86, 0.04], [0.77, 0.10], [0.78, 0.17], [0.66, 0.23], [0.44, 0.22], [0.26, 0.25], [0.12, 0.33], [0.14, 0.43], [0.30, 0.48], [0.47, 0.45], [0.55, 0.51], [0.46, 0.58], [0.28, 0.58], [0.14, 0.61], [0.05, 0.67], [-0.05, 0.75]];
const PTS_M = [[1.05, 0.0], [0.78, 0.04], [0.62, 0.11], [0.80, 0.19], [0.70, 0.27], [0.36, 0.30], [0.16, 0.38], [0.30, 0.47], [0.74, 0.50], [0.86, 0.57], [0.60, 0.63], [-0.05, 0.69]];
const DOTS = [{ cls: '.story__dot--lime', at: 0.2 }, { cls: '.story__dot--red', at: 0.8 }];

function curve(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 4.5, p1[1] + (p2[1] - p0[1]) / 4.5];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 4.5, p2[1] - (p3[1] - p1[1]) / 4.5];
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
    const pts = (innerWidth < 760 ? PTS_M : PTS).map(([x, y]) => [x * w, y * h]);
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
    trigger: sec, start: 'top 75%', end: '70% bottom',
    onUpdate: (st) => { if (!reduced) { progress = st.progress; paint(); } },
    onRefresh: build,
  });
}

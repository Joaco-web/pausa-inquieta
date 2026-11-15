// LA PROMESA — la frase se arma mientras scrolleás.
// Bajar la va armando (queda completa antes de terminar la sección); subir la desarma.
import { split, torn, WEIGHTS, pick, rand, reduced } from '../core/fx.js';
import { sound } from '../core/sound.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

export default function promesa(lenis) {
  const sec = document.querySelector('.promesa');
  const text = sec.querySelector('.promesa__text');
  const halo = sec.querySelector('.promesa__halo');
  const { chars } = split(text);
  const mobile = innerWidth < 760;
  const seeds = chars.map(() => ({
    x: rand(-1, 1) * (mobile ? 40 : 34), // vw
    y: rand(-1, 1) * 34, // vh
    r: rand(-90, 90),
    w: pick(WEIGHTS),
  }));

  let a = reduced ? 1 : 0;
  let target = a;
  let done = false;

  // El avance del scroll por la sección decide cuánto está armada la frase:
  // arranca cuando la sección llega arriba y se completa al ~70% del tramo fijo.
  ScrollTrigger.create({
    trigger: sec, start: 'top 60%', end: 'bottom bottom',
    onUpdate: (st) => { target = Math.min(1, st.progress / 0.7); },
  });

  sec.querySelectorAll('.ph').forEach((p) => torn(p, { amp: 2.4 }));
  gsap.to('.promesa__city', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });

  gsap.from(sec.querySelector('.promesa__label'), {
    opacity: 0, x: -30, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: sec, start: 'top 60%' },
  });

  gsap.ticker.add((t, dms) => {
    const dt = Math.min(0.1, dms / 1000);
    if (!reduced) {
      // sigue al scroll con un poco de suavidad
      a += (target - a) * Math.min(1, dt * 8);
      if (Math.abs(target - a) < 0.001) a = target;
      if (a >= 0.999 && !done) { done = true; sound.settle(0.09); }
      if (a < 0.6) done = false;
    }
    const e = 1 - Math.pow(1 - a, 3);
    for (let i = 0; i < chars.length; i++) {
      const s = seeds[i];
      const k = 1 - e;
      chars[i].style.transform = k > 0.001
        ? `translate3d(${s.x * k}vw, ${s.y * k}vh, 0) rotate(${s.r * k}deg)`
        : '';
      chars[i].style.opacity = (0.18 + 0.82 * e).toFixed(3);
      if (a < 0.98) {
        // cambios de peso suaves: pocos, y cerca del peso final (300)
        if (Math.random() < (1 - a) * 0.035) chars[i].style.fontWeight = pick([200, 300, 400, 500]);
      }
      else chars[i].style.fontWeight = 300;
    }
    halo.style.opacity = e.toFixed(3);
  });
}

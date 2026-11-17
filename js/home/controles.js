// CONTROLES — las teclas son letras de la trama del brandboard (tinta gastada,
// colores de la marca, giradas). Se dibujan al entrar y quedan fijas: solo muestran
// los controles de la experiencia (no se pueden apretar).
import { split, torn, rand, pick, WEIGHTS, reduced } from '../core/fx.js';
import { sound } from '../core/sound.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

export default function controles() {
  const sec = document.querySelector('.ctrl');
  const keys = [...sec.querySelectorAll('.key')];
  const glyphs = keys.map((k) => k.querySelector('.key__glyph'));
  const title = sec.querySelector('.ctrl__title');
  const kb = sec.querySelector('.kb');

  // Papel rasgado
  torn(kb, { amp: 1.6, step: 2.6 });

  // Cada letra con su giro y su desgaste propio (como la trama de letras)
  keys.forEach((k) => {
    k.style.setProperty('--r', `${rand(-14, 14).toFixed(1)}deg`);
    k.style.setProperty('--mx', `${Math.round(rand(0, 300))}px`);
    k.style.setProperty('--my', `${Math.round(rand(0, 300))}px`);
  });

  // ---- Entrada: las letras se dibujan (contorno) y después se llenan de tinta
  if (!reduced) {
    keys.forEach((k) => k.classList.add('is-drawing'));
    gsap.set(glyphs, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(sec.querySelectorAll('.kb__cap'), { opacity: 0, x: -10 });
  }
  const { chars: tChars } = split(title);
  const BASE = 200;
  tChars.forEach((c) => { c.style.fontWeight = BASE; });
  if (!reduced) gsap.set(tChars, { yPercent: 100, opacity: 0 });

  ScrollTrigger.create({
    trigger: sec, start: 'top 65%', once: true,
    onEnter: () => {
      if (reduced) return;
      gsap.to(tChars, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05 });
      // el título busca su peso pasando por todos los intermedios
      tChars.forEach((c, i) => {
        const seq = [900, 700, 500, 300, 100, BASE];
        seq.forEach((w, j) => setTimeout(() => { c.style.fontWeight = w; }, 300 + i * 50 + j * 90));
      });
      glyphs.forEach((g, i) => {
        gsap.to(g, {
          clipPath: 'inset(0 0% 0 0)', duration: 0.7, delay: 0.3 + i * 0.14, ease: 'power2.inOut',
          onStart: () => sound.tick(0.08),
          onComplete: () => setTimeout(() => keys[i].classList.remove('is-drawing'), 120),
        });
      });
      gsap.to(sec.querySelectorAll('.kb__cap'), { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, delay: 1.2 });
    },
  });

  // Título: el mouse arma un degradé de pesos (thin → light → regular → medium → bold → black)
  // alrededor del cursor, no todo en bold.
  const near = (e) => {
    const rects = tChars.map((c) => c.getBoundingClientRect());
    const R = Math.max(80, rects[0].width * 2.6);
    tChars.forEach((c, i) => {
      const r = rects[i];
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const k = Math.max(0, 1 - d / R);
      const w = k > 0 ? Math.round((100 + 800 * Math.pow(k, 1.4)) / 100) * 100 : BASE;
      c.style.fontWeight = Math.max(100, w);
    });
  };
  title.addEventListener('pointermove', near);
  title.addEventListener('pointerleave', () => tChars.forEach((c, i) => setTimeout(() => { c.style.fontWeight = BASE; }, i * 30)));
  title.addEventListener('click', () => tChars.forEach((c) => { c.style.fontWeight = pick(WEIGHTS); }));
}

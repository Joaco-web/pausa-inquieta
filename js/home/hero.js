// HERO — la puerta. El logo original (la imagen, tal cual) aparece como un
// mapping proyectado: se barre de izquierda a derecha y titila. Detrás, el collage
// del banner entra desde el ruido y se mueve apenas con el mouse y el scroll.
import { finePointer, reduced } from '../core/fx.js';
import { sound } from '../core/sound.js';

const gsap = window.gsap;

export default function hero() {
  const sec = document.querySelector('.hero');
  const logo = sec.querySelector('.logo__img');
  const bg = sec.querySelector('.hero__bg');
  const brand = sec.querySelector('.hero__brand');

  gsap.set(logo, { opacity: 0, clipPath: 'inset(0 100% 0 0)' });
  gsap.set(bg, { opacity: 0, scale: 1.06 });
  gsap.set(['.hero__tag', '.hero__foot'], { opacity: 0, y: 20 });

  let ready = false;

  // Golpe de proyector: el logo titila y se corre apenas, como un mapping
  function flicker(times = 6) {
    const tl = gsap.timeline();
    for (let i = 0; i < times; i++) tl.to(logo, { opacity: Math.random() < 0.5 ? 0.35 : 1, x: (Math.random() - 0.5) * 10, duration: 0.05, ease: 'steps(1)' });
    tl.to(logo, { opacity: 1, x: 0, duration: 0.05 });
    return tl;
  }

  function intro() {
    if (reduced) {
      gsap.set([logo, bg, '.hero__tag', '.hero__foot'], { clearProps: 'all' });
      ready = true;
      return;
    }
    gsap.timeline({ onComplete: () => { ready = true; } })
      .to(bg, { opacity: 1, duration: 0.7, ease: 'steps(6)' }, 0)
      .to(bg, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0)
      .to(logo, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'steps(9)' }, 0.15)
      .add(() => flicker(8), 1.0)
      .to(['.hero__tag', '.hero__foot'], { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 1.2);
  }

  if (finePointer) {
    const layers = [{ el: bg, d: 14 }, { el: brand, d: -8 }]
      .map((l) => ({ x: gsap.quickTo(l.el, 'x', { duration: 1, ease: 'power3.out' }), y: gsap.quickTo(l.el, 'y', { duration: 1, ease: 'power3.out' }), d: l.d }));
    window.addEventListener('pointermove', (e) => {
      if (!ready || window.scrollY > innerHeight) return;
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => { l.x(nx * l.d); l.y(ny * l.d); });
    }, { passive: true });
    logo.addEventListener('mouseenter', () => { if (ready) { flicker(5); sound.click(0.08); } });
  } else {
    logo.addEventListener('click', () => { flicker(6); sound.click(); });
  }

  // Salida con scroll: el logo sube y el collage baja un poco más lento
  gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } })
    .to(brand, { yPercent: -30, ease: 'none' }, 0)
    .to(bg, { yPercent: 10, ease: 'none' }, 0);

  return { intro };
}

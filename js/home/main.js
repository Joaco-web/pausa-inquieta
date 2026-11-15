// HOME — arma todas las secciones.
// Orden: hero, quiénes somos, promesa, controles,
// recorrido (con su candado). Lo que sigue se desbloquea al volver del recorrido.
// En la home PI no aparece (ni su presentación ni el semicírculo de la esquina).
import { initScroll, initCursor, initNav, gate, tv, bindPageLinks } from '../core/ui.js';
import { heart } from '../core/heart.js';
import { sound } from '../core/sound.js';
import { photos } from '../core/fx.js';
import hero from './hero.js';
import somos from './somos.js';
import promesa from './promesa.js';
import controles from './controles.js';
import story from './story.js';
import llevas from './llevas.js';
import redes from './redes.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* sin storage */ } },
};
// Salir del paso a paso (o terminarlo) te deja en "Qué te llevás", con todo abierto
if (location.hash === '#llevas') store.set('pi-recorrido-done', '1');
const done = store.get('pi-recorrido-done') === '1';
const fromRecorrido = location.hash === '#recorrido' || location.hash === '#iniciar';
// "Qué te llevás" al terminar el paso a paso: directo a la caja, con todo abierto
const toLlevas = location.hash === '#llevas';
const root = document.documentElement;
// Si ya hiciste el recorrido, lo de abajo está abierto (al volver, se abre con animación)
if (done && !fromRecorrido) root.classList.add('unlocked');
if (done && fromRecorrido) root.classList.add('unlocking');

const lenis = initScroll();
lenis.stop();

photos();
initCursor();
initNav(lenis);
bindPageLinks();
// Solo mide cuánto "hacés" (lo usan la promesa y "Qué te llevás"); PI nunca se muestra ni suena acá.
heart.init({ tip: 'Tu ruido' });

const h = hero();
somos(lenis);
promesa(lenis);
controles();
story();
llevas();
redes();

// ---------- El candado ----------
const lockwall = document.getElementById('lock');
const lock = lockwall.querySelector('.lock');
let unlocked = done && !fromRecorrido;
function shakeLock(withSound = true) {
  if (unlocked) return;
  gsap.fromTo(lock, { x: 0 }, { x: 12, duration: 0.06, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' });
  if (withSound) sound.locked();
}
// insistir con el scroll al final de la página
let lastShake = 0;
const atBottom = () => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
const insist = () => {
  if (unlocked || !atBottom()) return;
  const now = performance.now();
  if (now - lastShake < 420) return;
  lastShake = now;
  shakeLock();
};
window.addEventListener('wheel', (e) => { if (e.deltaY > 0) insist(); }, { passive: true });
let ty = 0;
window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchmove', (e) => { if (ty - e.touches[0].clientY > 20) insist(); }, { passive: true });
window.addEventListener('keydown', (e) => { if (['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key)) insist(); });
// clic al candado: solo tiembla, sin sonido
lock.addEventListener('click', () => {
  if (unlocked) return;
  shakeLock(false);
});

// Al volver del recorrido: el candado se abre y se puede seguir
function unlock() {
  unlocked = true;
  const tl = gsap.timeline({
    onComplete: () => {
      root.classList.remove('unlocking');
      ScrollTrigger.refresh();
    },
  });
  tl.to({}, { duration: 0.6 })
    .add(() => { lock.classList.add('is-open'); sound.unlock(); root.classList.add('unlocked'); ScrollTrigger.refresh(); })
    .to(lock, { y: -10, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, '+=0.05')
    .to(lockwall, { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.8, ease: 'power3.inOut' }, '+=0.5');
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => ScrollTrigger.refresh());

gate().then(() => {
  lenis.start();
  if (toLlevas && done) {
    tv.in();
    h.intro();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenis.scrollTo('#llevas', { immediate: true, force: true, offset: 2 });
      setTimeout(() => ScrollTrigger.refresh(), 300);
    });
  } else if (fromRecorrido) {
    // venís del paso a paso: volvés al mismo lugar, con todo en color
    tv.in();
    h.intro();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenis.scrollTo('#iniciar', { immediate: true, force: true, offset: -innerHeight * 0.12 });
      if (done) setTimeout(unlock, 700);
    });
  } else {
    window.scrollTo(0, 0);
    h.intro();
  }
});

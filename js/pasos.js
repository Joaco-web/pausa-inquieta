// EL PASO A PASO — entradas simples, videos que se reproducen solos al verlos,
// botones de sonido, visor en grande, cambio de lugar (aula ↔ unreal) y teclado.

const body = document.body;
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Cambio de lugar: ruido de tele + la palabra del lugar nuevo ----------
function cambio() {
  if (!root.classList.contains('cambiando')) return;
  const box = document.querySelector('.cambio');
  const word = box.querySelector('.cambio__word');
  const cv = box.querySelector('canvas');
  word.textContent = body.dataset.etiqueta || (root.dataset.to === 'unreal' ? 'Unreal' : 'Aula');
  word.classList.toggle('is-long', word.textContent.length > 8);
  const ctx = cv.getContext('2d');
  cv.width = 160; cv.height = 90;
  const img = ctx.createImageData(cv.width, cv.height);
  let raf = 0;
  const draw = () => {
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    raf = requestAnimationFrame(draw);
  };
  draw();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    root.classList.remove('cambiando');
    reveal();
  };
  box.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 0)', offset: 0.6 }, { clipPath: 'inset(0 0 100% 0)' }],
    { duration: 1100, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' })
    .finished.then(finish);
  setTimeout(finish, 1600); // respaldo: el contenido aparece aunque el navegador frene la animación
  word.animate([{ opacity: 0, letterSpacing: '.1em' }, { opacity: 1, letterSpacing: '-.05em' }], { duration: 420, easing: 'ease-out', fill: 'both' });
}

// ---------- Entradas: aparecen y se asientan, en orden ----------
function reveal() {
  const items = [...document.querySelectorAll('[data-in]')];
  if (reduced) { items.forEach((el) => el.classList.add('is-in')); return; }
  // lo que ya quedó arriba de la pantalla (por ejemplo, al volver atrás) aparece directo
  items.forEach((el) => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in'); });
  let order = 0;
  const io = new IntersectionObserver((entries) => {
    entries.filter((en) => en.isIntersecting).forEach((en) => {
      en.target.style.setProperty('--d', `${Math.min(order++, 6) * 80}ms`);
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
    order = 0;
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

// ---------- Videos: se reproducen solos (sin sonido) cuando están a la vista ----------
const vids = [...document.querySelectorAll('.media video')];
const vio = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) v.play().catch(() => {});
    else v.pause();
  });
}, { threshold: 0.35 });
vids.forEach((v) => vio.observe(v));

// Botón de sonido de cada video (uno a la vez)
document.querySelectorAll('.media__sound').forEach((btn) => {
  const v = btn.parentElement.querySelector('video');
  btn.addEventListener('click', () => {
    const on = v.muted;
    stopAll();
    vids.forEach((o) => { o.muted = true; });
    document.querySelectorAll('.media__sound').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    v.muted = !on;
    if (on) { v.currentTime = 0; v.play().catch(() => {}); }
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Silenciar video' : 'Activar sonido del video');
  });
});

// ---------- Sonidos (latido, voz, reloj…): play / pausa, uno a la vez ----------
const sounds = [...document.querySelectorAll('.sound')];
function stopAll(except) {
  sounds.forEach((s) => {
    if (s === except) return;
    const a = s.querySelector('audio');
    if (a && !a.paused) { a.pause(); }
    s.classList.remove('is-playing');
  });
}
sounds.forEach((s) => {
  const a = s.querySelector('audio');
  const btn = s.querySelector('.sound__btn');
  if (!a) return;
  btn.addEventListener('click', () => {
    if (a.paused) {
      stopAll(s);
      vids.forEach((v) => { v.muted = true; });
      document.querySelectorAll('.media__sound').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      a.play().then(() => s.classList.add('is-playing')).catch(() => {});
    } else {
      a.pause();
      s.classList.remove('is-playing');
    }
  });
  a.addEventListener('ended', () => s.classList.remove('is-playing'));
});

// ---------- Visor en grande ----------
const lb = document.querySelector('.lb');
if (lb) {
  const stage = lb.querySelector('.lb__stage');
  const close = () => {
    const v = stage.querySelector('video');
    if (v) v.pause();
    stage.textContent = '';
    lb.hidden = true;
  };
  document.querySelectorAll('.media__open').forEach((b) => b.addEventListener('click', () => {
    const src = b.parentElement.querySelector('img, video');
    stopAll();
    let el;
    if (src.tagName === 'VIDEO') {
      el = document.createElement('video');
      el.src = src.currentSrc || src.src;
      el.controls = true; el.autoplay = true; el.playsInline = true; el.loop = true;
    } else {
      el = document.createElement('img');
      el.src = src.currentSrc || src.src; el.alt = '';
    }
    stage.appendChild(el);
    lb.hidden = false;
    lb.querySelector('.lb__close').focus();
  }));
  lb.querySelector('.lb__close').addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) close(); });
}

// ---------- Ir de un paso a otro con una salida suave (y con las flechas del teclado) ----------
function go(href) {
  if (!href) return;
  body.classList.add('is-leaving');
  setTimeout(() => { location.href = href; }, reduced ? 0 : 260);
}
document.querySelectorAll('a[href]').forEach((a) => {
  const href = a.getAttribute('href');
  if (!/^(paso-\d+|recorrido|index)\.html/.test(href)) return;
  a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    go(href);
  });
});
window.addEventListener('keydown', (e) => {
  if (lb && !lb.hidden) return;
  if (e.target.closest('input, textarea')) return;
  if (e.key === 'ArrowRight') go(document.querySelector('.pnav__next, .idx__start')?.getAttribute('href'));
  if (e.key === 'ArrowLeft') go(document.querySelector('.pnav__prev')?.getAttribute('href'));
});
// ---------- Candado del índice: la lista se abre cuando llegaste al último paso ----------
const DONE_KEY = 'pi-pasos-done';
const ticks = [...document.querySelectorAll('.tick')];
function isDone() {
  try { return localStorage.getItem(DONE_KEY) === '1'; } catch (e) { return false; }
}
if (body.dataset.paso && +body.dataset.paso === ticks.length) {
  try { localStorage.setItem(DONE_KEY, '1'); } catch (e) { /* sin almacenamiento */ }
}
function syncLock() {
  const open = isDone();
  root.classList.toggle('pasos-done', open);
  if (body.dataset.lugar === 'index') ticks.forEach((t) => { t.tabIndex = open ? 0 : -1; });
  // con candado, los capítulos se ven pero no se pueden abrir (ni con el teclado)
  const list = document.querySelector('.idx__list');
  if (list) list.inert = !open;
}
syncLock();
const lock = document.querySelector('.idx__lock');
if (lock && !reduced) {
  lock.addEventListener('click', () => {
    lock.querySelector('svg').animate(
      [0, 10, -10, 8, -6, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 420, easing: 'ease-out' },
    );
  });
}

// ---------- El semicírculo del título escribe el texto y salta a la esquina del video ----------
function notaSemi() {
  const nota = document.querySelector('.nota');
  const semi = document.querySelector('.paso__q-semi');
  const titulo = document.querySelector('.paso__q');
  if (!nota || !semi || !titulo) return;
  if (reduced || document.hidden || window.scrollY > 80) { nota.classList.add('is-on'); return; }

  const letras = [];
  nota.querySelectorAll('.nota__l').forEach((linea) => {
    const texto = linea.textContent;
    linea.textContent = '';
    [...texto].forEach((c) => {
      const s = document.createElement('span');
      s.textContent = c;
      s.style.visibility = 'hidden';
      linea.appendChild(s);
      letras.push(s);
    });
  });

  let listo = false;
  let anims = [];
  const terminar = () => {
    if (listo) return;
    listo = true;
    letras.forEach((s) => { s.style.visibility = ''; });
    anims.forEach((a) => a.cancel());
    nota.classList.add('is-on');
  };
  const espera = (ms) => new Promise((r) => { setTimeout(r, ms); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) terminar(); });

  const animar = async () => {
    const W = nota.offsetWidth;
    const fin = nota.getBoundingClientRect();
    const finX = fin.left + fin.width / 2;
    const finY = fin.top + fin.height / 2;
    const o = semi.getBoundingClientRect();
    const oX = o.left + o.width / 2;
    const oY = o.top + o.height / 2;
    const ancho = window.innerWidth;
    const compu = ancho > 860;
    const margen = W / 2 + 10;
    const px = Math.min(Math.max(compu ? oX + W / 2 + 6 : ancho / 2, margen), ancho - margen);
    const py = compu ? oY : o.bottom + W * 0.36;
    const t = (x, y, r, e = 1) => `translate(${x - finX}px, ${y - finY}px) rotate(${r}deg) scale(${e})`;

    nota.classList.add('is-on');
    // sale del semicírculo del título y crece
    const crece = nota.animate(
      [{ transform: t(oX, oY, 90, o.height / W) }, { transform: t(px, py, -6) }],
      { duration: 720, easing: 'cubic-bezier(.2,.9,.25,1.12)', fill: 'forwards' },
    );
    anims.push(crece);
    await crece.finished;
    await espera(180);
    // escribe
    for (const s of letras) {
      if (listo) return;
      s.style.visibility = '';
      await espera(/[,.:]/.test(s.textContent) ? 150 : 21);
    }
    await espera(520);
    if (listo) return;
    // salto suave hasta la esquina del video
    const alto = Math.min(84, Math.hypot(finX - px, finY - py) * 0.2);
    const salto = nota.animate([
      { transform: t(px, py, -6), easing: 'cubic-bezier(.3,0,.3,1)' },
      { transform: t((px + finX) / 2, Math.min(py, finY) - alto, -14, 1.02), offset: 0.5, easing: 'cubic-bezier(.5,0,.7,1)' },
      { transform: t(finX, finY + 5, -21, 0.985), offset: 0.84, easing: 'ease-out' },
      { transform: t(finX, finY, -20) },
    ], { duration: 980, fill: 'forwards' });
    anims.push(salto);
    await salto.finished;
    terminar();
  };

  const empezar = () => {
    setTimeout(() => { if (!listo) animar().catch(terminar); }, 1750);
    setTimeout(terminar, 14000); // respaldo: el texto siempre queda en su lugar
  };
  if (titulo.classList.contains('is-in')) { empezar(); return; }
  const mira = new MutationObserver(() => {
    if (!titulo.classList.contains('is-in')) return;
    mira.disconnect();
    empezar();
  });
  mira.observe(titulo, { attributes: true, attributeFilter: ['class'] });
}
notaSemi();

// volver con el botón "atrás" del navegador sin quedar en blanco
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  body.classList.remove('is-leaving');
  syncLock();
});

if (root.classList.contains('cambiando')) cambio();
else reveal();

"""Genera el paso a paso: recorrido.html (índice) y paso-01.html … paso-25.html.

El contenido está en tools/pasos_data.py y los medios en assets/pasos/NN/.
Uso (desde la carpeta del proyecto):
    python tools/pasos.py
    python tools/version.py   # siempre después, para versionar CSS/JS
"""
import hashlib
import html
import json
from pathlib import Path

from pasos_data import PASOS

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = json.loads((ROOT / "assets/pasos/manifest.json").read_text(encoding="utf-8"))
TOTAL = len(PASOS)
LUGAR = {"aula": "Aula", "unreal": "Unreal"}

ARROW = '<svg class="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
BACK = '<svg class="arr arr--back" viewBox="0 0 22 12" aria-hidden="true"><path d="M22 6H2M7 1L2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
PLAY = '<svg class="ico ico--play" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>'
PAUSE = '<svg class="ico ico--pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" fill="currentColor"/></svg>'
SOUND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="w" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'

e = lambda s: html.escape(s, quote=True)
CAMBIO_JS = "<script>(function(){var l=document.body.dataset.lugar,p;try{p=sessionStorage.getItem('pi-lugar');sessionStorage.setItem('pi-lugar',l)}catch(e){}if((l==='aula'||l==='unreal')&&p!==l){document.documentElement.classList.add('cambiando');document.documentElement.dataset.to=l}})()</script>"


def head(title, desc):
    return f"""<!doctype html>
<html lang="es" class="no-cursor">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Poppins:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/pasos.css">
  <script>document.documentElement.classList.add('js')</script>
  <script type="importmap">
  {{}}
  </script>
</head>"""


def progress(current):
    """Barra de arriba: 25 marcas (aula / unreal) y dónde estás."""
    ticks = []
    for i, p in enumerate(PASOS, 1):
        cls = ["tick", f"tick--{p['lugar']}"]
        if i < current:
            cls.append("is-done")
        if i == current:
            cls.append("is-now")
        cur = ' aria-current="step"' if i == current else ""
        ticks.append(f'<a class="{" ".join(cls)}" href="paso-{i:02d}.html"{cur} title="{i:02d} · {e(p["titulo"])}"><span class="sr-only">Paso {i}: {e(p["titulo"])}</span></a>')
    p = PASOS[current - 1] if current else None
    where = (f'<span class="pbar__where"><b>{LUGAR[p["lugar"]]}</b><span class="pbar__num">{current:02d}<i>/</i>{TOTAL}</span></span>'
             if p else '<span class="pbar__where"><b>Paso a paso</b></span>')
    return f"""  <header class="pbar">
    <a class="pbar__exit" href="index.html#recorrido">{BACK}<span>Salir</span></a>
    <nav class="pbar__steps" aria-label="Pasos de la experiencia">{"".join(ticks)}</nav>
    {where}
  </header>"""


def ver(path):
    """ruta con huella del contenido (?v=) para que el navegador no use una copia vieja"""
    return f"{path}?v={hashlib.md5((ROOT / path).read_bytes()).hexdigest()[:8]}"


def media_item(n, name, main=False):
    m = MANIFEST[str(n)][name]
    ratio = f"{m['w']} / {m['h']}"
    cls = "media media--main" if main else "media"
    if m.get("cutout"):
        cls += " media--cut"
    if m["type"] == "video":
        sound = (f'<button class="media__sound" type="button" aria-pressed="false" aria-label="Activar sonido del video">{SOUND}</button>'
                 if m.get("audio") else "")
        return (f'<figure class="{cls}" style="--ar:{ratio}" data-in>'
                f'<button class="media__open" type="button" aria-label="Ver en grande"></button>'
                f'<video src="{ver(m["src"])}" poster="{ver(m["poster"])}" muted loop playsinline preload="metadata" width="{m["w"]}" height="{m["h"]}"></video>'
                f'{sound}</figure>')
    return (f'<figure class="{cls}" style="--ar:{ratio}" data-in>'
            f'<button class="media__open" type="button" aria-label="Ver en grande"></button>'
            f'<img src="{ver(m["src"])}" alt="" width="{m["w"]}" height="{m["h"]}" loading="{"eager" if main else "lazy"}" decoding="async"></figure>')


def sounds(items):
    out = []
    for s in items:
        src = s.get("src")
        state = "" if src else " is-pending"
        audio = f'<audio src="{src}" preload="none"></audio>' if src else ""
        hint = "" if src else '<span class="sound__soon">audio en camino</span>'
        out.append(f"""<div class="sound{state}">
            <button class="sound__btn" type="button" aria-label="Escuchar: {e(s['label'])}"{'' if src else ' disabled'}>{PLAY}{PAUSE}</button>
            <div class="sound__body">
              <span class="sound__label">{e(s['label'])}{hint}</span>
              <span class="sound__wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
              <p class="sound__text">{e(s['texto'])}</p>
            </div>{audio}
          </div>""")
    return "\n          ".join(out)


def page(n):
    p = PASOS[n - 1]
    lugar = p["lugar"]
    surface = "pos" if lugar == "aula" else "neg"
    prev_href = "recorrido.html" if n == 1 else f"paso-{n - 1:02d}.html"
    prev_txt = "Índice" if n == 1 else f"{n - 1:02d} · {PASOS[n - 2]['titulo']}"
    if n < TOTAL:
        nxt = PASOS[n]
        next_href = f"paso-{n + 1:02d}.html"
        next_meta = f"{n + 1:02d} · {LUGAR[nxt['lugar']]} · {nxt['titulo']}"
    else:
        next_href = "index.html#llevas"
        next_meta = "Fin del paso a paso"
    media = p.get("media", [])
    main = media_item(n, media[0], main=True) if media else ""
    gallery = "".join(media_item(n, m) for m in media[1:])
    frase = f'<blockquote class="paso__frase" data-in><p>{e(p["frase"])}</p></blockquote>' if p.get("frase") else ""
    escuchas = (f"""<article class="card card--sound" data-in>
          <h2 class="card__t">Qué escuchás</h2>
          {sounds(p["escuchas"])}
        </article>""" if p.get("escuchas") else "")
    objeto = ""
    if p.get("objeto"):
        o = p["objeto"]
        objeto = f"""<aside class="objeto" data-in>
        <span class="objeto__tag">En tus manos</span>
        <p><b>{e(o['nombre'])}.</b> {e(o['texto'])}</p>
      </aside>"""
    gallery_html = f'<section class="gal" aria-label="Más imágenes y referencias">{gallery}</section>' if gallery else ""
    noimg = " paso--text" if not media else ""
    title = f"{n:02d} · {p['titulo']} — Pausa Inquieta"
    return f"""{head(title, f"Paso {n} de {TOTAL} ({LUGAR[lugar]}): {p['donde']}")}
<body class="{surface} paso-page paso-page--{lugar}" data-lugar="{lugar}" data-paso="{n}">
  {CAMBIO_JS}
  <div class="grain" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true"></div>
{progress(n)}
  <main class="paso{noimg}">
    <section class="paso__head">
      <div class="paso__text">
        <span class="paso__kicker label" data-in>Paso {n:02d} · {LUGAR[lugar]}</span>
        <h1 class="paso__title" data-in>{e(p['titulo'])}</h1>
        <p class="paso__donde" data-in><b>¿Dónde estás?</b> {e(p['donde'])}</p>
        {frase}
      </div>
      {main}
    </section>

    <section class="cards" aria-label="Qué pasa en este paso">
      <article class="card" data-in>
        <h2 class="card__t">Qué ves</h2>
        <p>{e(p['ves'])}</p>
      </article>
      {escuchas}
      <article class="card card--pasa" data-in>
        <h2 class="card__t">Qué pasa</h2>
        <p>{e(p['pasa'])}</p>
      </article>
    </section>
    {objeto}
    {gallery_html}

    <nav class="pnav" aria-label="Navegación entre pasos">
      <a class="pnav__prev" href="{prev_href}">{BACK}<span><small>Volver</small>{e(prev_txt)}</span></a>
      <a class="pnav__next" href="{next_href}">
        <span class="pnav__cta">{e(p['cta'])}</span>
        <span class="pnav__meta">{e(next_meta)}</span>
        <span class="pnav__go">{ARROW}</span>
      </a>
    </nav>
  </main>

  <div class="lb" hidden><button class="lb__close" type="button" aria-label="Cerrar">×</button><div class="lb__stage"></div></div>
  <div class="cambio" aria-hidden="true"><canvas></canvas><span class="cambio__word"></span></div>
  <script type="module" src="js/pasos.js"></script>
</body>
</html>
"""


def index():
    rows = []
    for i, p in enumerate(PASOS, 1):
        rows.append(f'<li class="idx__row idx__row--{p["lugar"]}" data-in><a href="paso-{i:02d}.html">'
                    f'<span class="idx__n">{i:02d}</span><span class="idx__l">{LUGAR[p["lugar"]]}</span>'
                    f'<span class="idx__t">{e(p["titulo"])}</span>{ARROW}</a></li>')
    return f"""{head("El paso a paso — Pausa Inquieta", "La experiencia de Pausa Inquieta contada paso a paso: lo que ves, lo que escuchás y lo que pasa, en el aula y en Unreal.")}
<body class="neg paso-page paso-page--index" data-lugar="index">
  {CAMBIO_JS}
  <div class="grain" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true"></div>
{progress(0)}
  <main class="idx">
    <section class="idx__hero">
      <span class="label label--lime" data-in>El recorrido</span>
      <h1 class="idx__title" data-in>El paso<br>a paso</h1>
      <p class="idx__lead" data-in>Te contamos la experiencia en {TOTAL} pasos: qué ves, qué escuchás y qué pasa. Va y viene entre dos lugares al mismo tiempo.</p>
      <div class="idx__legend" data-in>
        <p><span class="chip chip--aula">Aula</span> Lo que pasa en el aula, alrededor tuyo.</p>
        <p><span class="chip chip--unreal">Unreal</span> Lo que pasa adentro de la computadora.</p>
      </div>
      <a class="pill idx__start" href="paso-01.html" data-in><span>Empezar</span>{ARROW}</a>
    </section>
    <ol class="idx__list" aria-label="Los {TOTAL} pasos">
      {"".join(rows)}
    </ol>
  </main>
  <div class="cambio" aria-hidden="true"><canvas></canvas><span class="cambio__word"></span></div>
  <script type="module" src="js/pasos.js"></script>
</body>
</html>
"""


def main():
    (ROOT / "recorrido.html").write_text(index(), encoding="utf-8", newline="")
    for n in range(1, TOTAL + 1):
        (ROOT / f"paso-{n:02d}.html").write_text(page(n), encoding="utf-8", newline="")
    print(f"recorrido.html + {TOTAL} pasos generados")


if __name__ == "__main__":
    main()

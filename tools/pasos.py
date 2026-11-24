"""Genera el paso a paso: recorrido.html (índice) y una página paso-NN.html por sección.

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
# Versión del paso a paso: cambia cuando cambia el contenido, los estilos o el JS.
# Se agrega a los enlaces entre páginas (?v=) para que el navegador nunca muestre una copia vieja.
BUILD = hashlib.md5(b"".join((ROOT / f).read_bytes() for f in [
    "tools/pasos_data.py", "assets/pasos/manifest.json", "css/pasos.css", "js/pasos.js"])).hexdigest()[:8]


def L(page):
    """enlace a otra página del paso a paso, con la versión"""
    return f"{page}?v={BUILD}"
TOTAL = len(PASOS)
LUGAR = {"aula": "Aula", "unreal": "Unreal"}


def etiqueta(p):
    """nombre del lugar que se muestra en esta sección"""
    return p.get("etiqueta") or LUGAR[p["lugar"]]


ARROW = '<svg class="arr" viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
BACK = '<svg class="arr arr--back" viewBox="0 0 22 12" aria-hidden="true"><path d="M22 6H2M7 1L2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
PLAY = '<svg class="ico ico--play" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>'
PAUSE = '<svg class="ico ico--pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" fill="currentColor"/></svg>'
SOUND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="w" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'

e = lambda s: html.escape(s, quote=True)


def rico(s):
    """texto con [[partes resaltadas con flúor]]"""
    return e(s).replace("[[", '<span class="sub">').replace("]]", "</span>")
CAMBIO_JS = "<script>(function(){var l=document.body.dataset.lugar,p;try{p=sessionStorage.getItem('pi-lugar');sessionStorage.setItem('pi-lugar',l)}catch(e){}if((l==='aula'||l==='unreal')&&p!==l){document.documentElement.classList.add('cambiando');document.documentElement.dataset.to=l}})()</script>"


def titulo_grande(textos):
    """Título de la sección: letras con pesos distintos en la última línea, como INQUIETA en el logo, y el semicírculo que late."""
    pesos = [200, 500, 300, 600, 200, 500]
    i = 0
    lineas = []
    for n, texto in enumerate(textos, 1):
        ultima = n == len(textos)
        letras = []
        for k, letra in enumerate(texto):
            peso = pesos[k % len(pesos)] if ultima else 200
            letras.append(f'<span class="paso__q-l" style="--i:{i};font-weight:{peso}">{e(letra)}</span>')
            i += 1
        cls = " paso__q-w--b" if ultima else ""
        semi = '<span class="paso__q-semi"></span>' if ultima else ""
        lineas.append(f'<span class="paso__q-w{cls}" aria-hidden="true">{"".join(letras)}{semi}</span>')
    return "".join(lineas)


def titular(texto):
    """corta un título largo en líneas y elige el tamaño según cuánto texto tiene"""
    n = len(texto)
    maximo, cls = ((13, "paso__q--largo") if n <= 12 else (13, "paso__q--frase") if n <= 30
                   else (14, "paso__q--medio") if n <= 60 else (22, "paso__q--largo2") if n <= 100
                   else (22, "paso__q--largo3"))
    lineas = [""]
    for palabra in texto.split():
        nueva = f"{lineas[-1]} {palabra}".strip()
        if len(nueva) > maximo and lineas[-1]:
            lineas.append(palabra)
        else:
            lineas[-1] = nueva
    return lineas, cls


def titulo_html(p, tag="h1"):
    if p.get("encabezado"):
        lineas = p["encabezado"]
        cls = "paso__q--frase" if max(map(len, lineas)) > 10 else "paso__q--largo"
    else:
        lineas, cls = titular(p["donde"])
    return f'<{tag} class="paso__q {cls}" data-in aria-label="{e(" ".join(lineas))}">{titulo_grande(lineas)}</{tag}>'


def head(title, desc):
    return f"""<!doctype html>
<html lang="es" class="no-cursor">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <meta name="theme-color" content="#0b0b0b">
  <meta name="build" content="{BUILD}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Poppins:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/pasos.css">
  <script>document.documentElement.classList.add('js');try{{if(localStorage.getItem('pi-pasos-done')==='1')document.documentElement.classList.add('pasos-done')}}catch(e){{}}</script>
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
        ticks.append(f'<a class="{" ".join(cls)}" href="{L(f"paso-{i:02d}.html")}"{cur} title="{i:02d}"><span class="sr-only">Sección {i}: {e(etiqueta(p))}</span></a>')
    p = PASOS[current - 1] if current else None
    where = (f'<span class="pbar__where"><span class="pbar__num">{current:02d}<i>/</i>{TOTAL}</span></span>'
             if p else '<span class="pbar__where"></span>')
    return f"""  <header class="pbar">
    <a class="pbar__exit" href="index.html#recorrido">{BACK}<span>Salir</span></a>
    <nav class="pbar__steps" aria-label="Secciones de la experiencia">{"".join(ticks)}</nav>
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


def carrusel(c, nombres):
    """las imágenes pasan solas, una atrás de otra, ocupando todo el recuadro principal"""
    slides = []
    for i, name in enumerate(nombres):
        m = MANIFEST[str(c)][name]
        if m["type"] == "video":
            cuerpo = f'<video src="{ver(m["src"])}" poster="{ver(m["poster"])}" muted loop playsinline preload="metadata" width="{m["w"]}" height="{m["h"]}"></video>'
        else:
            cuerpo = f'<img src="{ver(m["src"])}" alt="" width="{m["w"]}" height="{m["h"]}" decoding="async">'
        slides.append(f'<figure class="media carrusel__s{" is-now" if i == 0 else ""}"><button class="media__open" type="button" aria-label="Ver en grande"></button>{cuerpo}</figure>')
    return f'<div class="media media--main carrusel" style="--ar:16 / 10" data-in>{"".join(slides)}</div>'


def sounds(items):
    out = []
    for s in items:
        src = s.get("src")
        state = "" if src else " is-pending"
        audio = f'<audio src="{ver(src)}" preload="none"></audio>' if src else ""
        hint = "" if src else '<span class="sound__soon">audio en camino</span>'
        out.append(f"""<div class="sound{state}">
            <button class="sound__btn" type="button" aria-label="Escuchar: {e(s['label'])}"{'' if src else ' disabled'}>{PLAY}{PAUSE}</button>
            <div class="sound__body">
              <span class="sound__label">{e(s['label'])}{hint}</span>
              <span class="sound__wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
              {f'<p class="sound__text">{e(s["texto"])}</p>' if s.get("texto") else ""}
            </div>{audio}
          </div>""")
    return "\n          ".join(out)


def adentro(p):
    """segunda parte de la sección: aparece al seguir scrolleando"""
    a = p.get("adentro")
    if not a:
        return ""
    c = a["carpeta"]
    fila = "".join(media_item(c, m) for m in a["fila"])
    fotos = "".join(media_item(c, m) for m in a["media"])
    return f"""<section class="adentro" aria-label="{e(a['texto'])}">
      <div class="adentro__fila">
        <h2 class="adentro__t" data-in>{e(a['texto'])}</h2>
        {fila}
      </div>
      <div class="cards">
        <article class="card" data-in>
          <h3 class="card__t">Qué ves</h3>
          <p>{e(a['ves'])}</p>
        </article>
        <article class="card card--pasa" data-in>
          <h3 class="card__t">Qué pasa</h3>
          <p>{e(a['pasa'])}</p>
        </article>
      </div>
      <div class="gal gal--fila">{fotos}</div>
    </section>"""


def tarjetas(p, h="h2"):
    escuchas = (f"""<article class="card card--sound" data-in>
          <{h} class="card__t">Qué escuchás</{h}>
          {sounds(p["escuchas"])}
        </article>""" if p.get("escuchas") else "")
    video = media_item(p["carpeta"], p["pasa_media"]) if p.get("pasa_media") else ""
    ves = (f"""<article class="card card--ves" data-in>
        <{h} class="card__t">Qué ves</{h}>
        <p>{rico(p['ves'])}</p>
        {media_item(p["carpeta"], p["ves_media"]) if p.get("ves_media") else ""}
      </article>""" if p.get("ves") else "")
    pasa = (f"""<article class="card card--pasa" data-in>
        <{h} class="card__t">Qué pasa</{h}>
        <p>{rico(p['pasa'])}</p>
        {video}
      </article>""" if p.get("pasa") else "")
    if not (ves or escuchas or pasa):
        return ""
    return f"""<section class="cards" aria-label="Qué pasa en esta sección">
      {ves}
      {escuchas}
      {pasa}
    </section>"""


def visual(c, media):
    """imagen principal de un lugar: carrusel, una sola, o un espacio reservado si todavía no hay"""
    if len(media) > 1:
        return carrusel(c, media)
    if media:
        return media_item(c, media[0], main=True)
    return '<div class="media media--main media--vacio" style="--ar:16 / 10" aria-hidden="true"></div>'


def sigue(p):
    """otros lugares en la misma página: se encuentran al seguir scrolleando"""
    lugares = p.get("sigue") or []
    if isinstance(lugares, dict):
        lugares = [lugares]
    return "".join(f"""<div class="sigue">
    <section class="paso__head">
      <div class="paso__text">
        {titulo_html(s, "h2")}
      </div>
      {visual(s["carpeta"], s["media"])}
    </section>
    {tarjetas(s, "h3")}
    </div>""" for s in lugares)


def page(n):
    p = PASOS[n - 1]
    carpeta = p["carpeta"]
    lugar = p["lugar"]
    surface = "pos" if lugar == "aula" else "neg"
    prev_href = L("recorrido.html") if n == 1 else L(f"paso-{n - 1:02d}.html")
    prev_txt = "Índice" if n == 1 else f"{n - 1:02d} · {etiqueta(PASOS[n - 2])}"
    if n < TOTAL:
        next_href = L(f"paso-{n + 1:02d}.html")
    else:
        next_href = "index.html#llevas"
    media = p.get("media", [])
    if p.get("carrusel") and len(media) > 1:
        main = carrusel(carpeta, media)
    else:
        main = media_item(carpeta, media[0], main=True) if media else ""
    if p.get("nota"):
        lineas = "".join(f'<span class="nota__l">{e(t)} </span>' for t in p["nota"])
        main = f'<div class="nota-wrap">{main}<p class="nota">{lineas}</p></div>'
    abajo = p.get("abajo", []) if p.get("carrusel") else media[1:]
    gallery = "".join(media_item(carpeta, m) for m in abajo)
    frase = f'<blockquote class="paso__frase" data-in><p>{e(p["frase"])}</p></blockquote>' if p.get("frase") else ""
    gal_cls = "gal gal--uno" if p.get("adentro") or len(abajo) == 1 else "gal gal--par" if len(abajo) == 2 and all(MANIFEST[str(carpeta)][x].get("cutout") for x in abajo) else "gal gal--fila" if len(abajo) == 3 and all(MANIFEST[str(carpeta)][x].get("cutout") for x in abajo) else "gal"
    gallery_html = f'<section class="{gal_cls}" aria-label="Más imágenes y referencias">{gallery}</section>' if gallery else ""
    if p.get("hueco"):
        gallery_html += '<section class="gal gal--hueco" aria-hidden="true"><div class="media media--hueco" style="--ar:16 / 9" data-in></div></section>'
    noimg = " paso--text" if not media else ""
    marca = f' data-etiqueta="{e(p["etiqueta"])}"' if p.get("etiqueta") else ""
    aviso = (f'<div class="aviso" role="status" aria-live="polite"><span class="aviso__semi" aria-hidden="true"></span>'
             f'<p class="aviso__t"><span class="sr-only">Pausa: </span>{e(p["aviso"])}</p></div>') if p.get("aviso") else ""
    if aviso:
        marca += " data-aviso"
    return f"""{head("Pausa Inquieta", p.get("donde") or " ".join(p["encabezado"]))}
<body class="{surface} paso-page paso-page--{lugar}" data-lugar="{lugar}" data-paso="{n}"{marca}>
  {CAMBIO_JS}
  <div class="grain" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true"></div>
{progress(n)}
  <main class="paso{noimg}">
    <section class="paso__head">
      <div class="paso__text">
        {titulo_html(p)}
        {frase}
      </div>
      {main}
    </section>

    {tarjetas(p)}
    {gallery_html}
    {adentro(p)}
    {sigue(p)}

    <nav class="pnav" aria-label="Navegación entre secciones">
      <a class="pnav__prev" href="{prev_href}">{BACK}<span><small>Volver</small>{e(prev_txt)}</span></a>
      <a class="pnav__next" href="{next_href}">
        <span class="pnav__cta">{e(p['cta'])}</span>
        <span class="pnav__go">{ARROW}</span>
      </a>
    </nav>
  </main>

  {aviso}
  <div class="lb" hidden><button class="lb__close" type="button" aria-label="Cerrar">×</button><div class="lb__stage"></div></div>
  <div class="cambio" aria-hidden="true"><canvas></canvas><span class="cambio__word"></span></div>
  <script type="module" src="js/pasos.js"></script>
</body>
</html>
"""


def index():
    rows = []
    for i, p in enumerate(PASOS, 1):
        rows.append(f'<li class="idx__row idx__row--{p["lugar"]}" data-in><a href="{L(f'paso-{i:02d}.html')}">'
                    f'<span class="idx__n">{i:02d}</span><span class="idx__l">{e(etiqueta(p))}</span>'
                    f'{ARROW}</a></li>')
    return f"""{head("El paso a paso — Pausa Inquieta", "La experiencia de Pausa Inquieta contada paso a paso: lo que ves, lo que escuchás y lo que pasa, en el aula y en Unreal.")}
<body class="neg paso-page paso-page--index" data-lugar="index">
  {CAMBIO_JS}
  <div class="grain" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true"></div>
{progress(0)}
  <main class="idx">
    <section class="idx__hero">
      <h1 class="idx__title" data-in>El paso<br>a paso</h1>
      <p class="idx__lead" data-in>Te contamos la experiencia: qué ves, qué escuchás y qué pasa.</p>
      <div class="idx__legend" data-in>
        <p><span class="chip chip--aula">Aula</span> Lo que pasa en el aula</p>
        <p><span class="chip chip--unreal">Unreal</span> Lo que pasa adentro de la computadora.</p>
      </div>
      <a class="pill idx__start" href="{L('paso-01.html')}" data-in><span>Empezar</span>{ARROW}</a>
    </section>
    <!-- La primera vez la lista se ve apagada y con candado: se abre después de hacer el paso a paso -->
    <div class="idx__side">
      <ol class="idx__list" aria-label="Las {TOTAL} secciones">
        {"".join(rows)}
      </ol>
      <button class="idx__lock" type="button" aria-label="Bloqueado: primero hacé el paso a paso">
        <svg viewBox="0 0 80 100" aria-hidden="true">
          <path class="idx__shackle" d="M20 46 V30 a20 20 0 0 1 40 0 V46" />
          <rect class="idx__body" x="8" y="44" width="64" height="50" rx="4" />
          <path class="idx__semi" d="M40 58 a11 11 0 0 0 0 22 Z" />
        </svg>
      </button>
    </div>
  </main>
  <div class="cambio" aria-hidden="true"><canvas></canvas><span class="cambio__word"></span></div>
  <script type="module" src="js/pasos.js"></script>
</body>
</html>
"""


def main():
    # si se unieron secciones, las páginas que sobran se borran solas
    for vieja in ROOT.glob("paso-[0-9][0-9].html"):
        if int(vieja.stem[-2:]) > TOTAL:
            vieja.unlink()
    (ROOT / "recorrido.html").write_text(index(), encoding="utf-8", newline="")
    for n in range(1, TOTAL + 1):
        (ROOT / f"paso-{n:02d}.html").write_text(page(n), encoding="utf-8", newline="")
    print(f"recorrido.html + {TOTAL} pasos generados")


if __name__ == "__main__":
    main()

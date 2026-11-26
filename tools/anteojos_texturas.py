"""Texturas de los anteojos de Pausa Inquieta (para tools/anteojos_blender.py).

Genera, en assets/3d/anteojos/:
  - marco.png   (2048x1024): el frente del marco, proyectado de frente (u = x, v = y)
  - pata-izq.png, pata-der.png (4096x704: misma escala en u y v, los círculos quedan redondos): cada pata en dos mitades
      arriba = cara de afuera, abajo = cara de adentro; u = de la bisagra hacia atrás
Trama: círculos y arcos finos (lima, violeta, naranja rojizo, blanco) sobre plástico negro.
Logo PAUSA / INQUIETA en blanco: afuera de la pata izquierda del que los usa (+x)
y adentro de la pata derecha (-x), como en las fotos de referencia.

Uso: python tools/anteojos_texturas.py
"""
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/3d/anteojos"
OUT.mkdir(parents=True, exist_ok=True)

BLACK = (16, 16, 16)
LIME = (205, 245, 60)
VIOLET = (150, 95, 235)
ORANGE = (255, 92, 42)
WHITE = (236, 235, 229)
SS = 2  # supermuestreo: se dibuja al doble y se achica (bordes suaves)

FONT = None
for f in ["C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/segoeui.ttf"]:
    if Path(f).exists():
        FONT = f
        break


def canvas(w, h):
    return Image.new("RGB", (w * SS, h * SS), BLACK)


def ring(d, cx, cy, r, color, lw, start=0, end=360):
    cx, cy, r, lw = cx * SS, cy * SS, r * SS, max(1, int(lw * SS))
    d.arc([cx - r, cy - r, cx + r, cy + r], start, end, fill=color, width=lw)


def finish(im, name, w, h):
    im = im.resize((w, h), Image.LANCZOS)
    im.save(OUT / name, optimize=True)
    print(name, im.size)


# ---------- Marco (2048 x 1024). Mapa: u = (x - xmin) / W, v = (y - ymin) / H.
# Los círculos van en las dos puntas (donde están las bisagras) y un poco sobre la ceja.
def marco():
    W, H = 2048, 1024
    im = canvas(W, H)
    d = ImageDraw.Draw(im)
    lw = 8
    # puntas del frente (donde están las bisagras), círculos grandes que se salen del borde
    ring(d, W * 0.975, H * 0.42, 150, WHITE, lw)
    ring(d, W * 0.94, H * 0.22, 105, VIOLET, lw)
    ring(d, W * 1.0, H * 0.75, 120, ORANGE, lw)
    ring(d, W * 0.035, H * 0.35, 140, ORANGE, lw)
    ring(d, W * 0.06, H * 0.12, 95, LIME, lw)
    ring(d, W * 0.0, H * 0.62, 125, WHITE, lw)
    # unos pocos sobre la ceja (por dentro se ven arriba, como en la foto de atrás)
    ring(d, W * 0.24, H * 0.03, 85, LIME, lw)
    ring(d, W * 0.28, H * 0.0, 60, WHITE, lw)
    ring(d, W * 0.42, H * 0.02, 80, VIOLET, lw)
    finish(im, "marco.png", W, H)


# ---------- Patas (4096 x 512): arriba la cara de afuera, abajo la de adentro.
def pata(name, logo_afuera, logo_adentro, seed):
    W, H = 4096, 704
    half = H // 2
    im = canvas(W, H)
    d = ImageDraw.Draw(im)
    rnd = random.Random(seed)
    lw = 8
    cols = [LIME, VIOLET, ORANGE, WHITE, LIME, VIOLET, ORANGE, WHITE]

    def tramas(y0, avoid):
        # círculos repartidos a lo largo, más juntos cerca de la bisagra
        xs = [0.05, 0.4, 0.52, 0.68, 0.83]
        for i, u in enumerate(xs):
            if avoid and avoid[0] < u < avoid[1]:
                continue
            r = rnd.uniform(0.45, 0.85) * half
            cy = y0 + rnd.uniform(0.2, 0.8) * half
            ring(d, W * u, cy, r, cols[(i + seed) % len(cols)], lw)

    def logo(y0):
        if not FONT:
            return
        size = int(half * 0.3) * SS
        f = ImageFont.truetype(FONT, size)
        x = int(W * 0.135) * SS
        d.text((x, (y0 + half * 0.2) * SS), "PAUSA", font=f, fill=WHITE)
        d.text((x, (y0 + half * 0.52) * SS), "INQUIETA", font=f, fill=WHITE)

    # afuera (mitad de arriba de la imagen)
    tramas(0, (0.12, 0.33) if logo_afuera else None)
    if logo_afuera:
        logo(0)
        ring(d, W * 0.3, half * 0.55, half * 0.42, VIOLET, lw, 200, 20)
    # adentro (mitad de abajo)
    tramas(half, (0.12, 0.33) if logo_adentro else None)
    if logo_adentro:
        logo(half)
        ring(d, W * 0.31, half + half * 0.5, half * 0.45, VIOLET, lw, 150, 330)
    finish(im, name, W, H)


marco()
pata("pata-izq.png", logo_afuera=True, logo_adentro=False, seed=3)   # +x (izquierda del que los usa)
pata("pata-der.png", logo_afuera=False, logo_adentro=True, seed=8)   # -x (derecha del que los usa)

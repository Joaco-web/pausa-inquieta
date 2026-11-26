"""Ajusta la espalda de cada remera a la silueta del frente.

Uso: python tools/merch_espalda.py assets/img/merch
(partir siempre de las espaldas originales: el script las reemplaza)
"""
# Ajusta la espalda de cada remera a la silueta exacta del frente (vista desde atrás),
# para que las dos caras coincidan. Lo que falta de la espalda se completa con el color de la tela.
import sys
from PIL import Image, ImageOps, ImageChops
d = sys.argv[1]
for name in ['remera-negra', 'remera-blanca']:
    F = Image.open(f'{d}/{name}.webp').convert('RGBA')
    B = Image.open(f'{d}/{name}-espalda.webp').convert('RGBA')
    w, h = F.size
    # silueta del frente vista desde atrás (espejada)
    mask = ImageOps.mirror(F.getchannel('A')).point(lambda a: 255 if a > 127 else 0)
    # la espalda, a la misma altura, centrada
    bw = min(w, round(B.width * h / B.height * 1.1))  # un poco más ancha, sin deformar el texto
    B = B.resize((bw, h), Image.LANCZOS)
    # color de la tela: el centro del torso de la espalda
    cx, cy = bw // 2, int(h * 0.62)
    px = [B.getpixel((cx + dx, cy + dy)) for dx in range(-30, 31, 10) for dy in range(-30, 31, 10)]
    px = [p for p in px if p[3] > 200]
    col = tuple(sorted(c[i] for c in px)[len(px) // 2] for i in range(3)) + (255,)
    out = Image.new('RGBA', (w, h), col)
    layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    layer.paste(B, ((w - bw) // 2, 0), B)
    out = Image.alpha_composite(out, layer)
    out.putalpha(mask)
    out.save(f'{d}/{name}-espalda.webp', 'WEBP', quality=88, method=6)
    print(name, F.size, 'espalda ajustada', out.size, 'tela', col)

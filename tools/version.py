"""Versiona los CSS y JS de la web para que el navegador nunca use una copia vieja.

A cada archivo local se le agrega ?v=<huella de su contenido> en el HTML, y en el
import map de cada página se listan todos los módulos JS con su versión (así también
se versionan los import entre módulos y los import() dinámicos, como el 3D).
Si un archivo no cambió, su huella tampoco: el navegador lo sigue usando de la caché.

Uso (desde la carpeta del proyecto, antes de cada commit):
    python tools/version.py
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted(p.name for p in ROOT.glob("*.html"))
# Librerías externas del import map (se mantienen tal cual)
EXTERNAL = {
    "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/",
}


def stamp(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()[:8]


def main() -> None:
    js_files = sorted(p for p in (ROOT / "js").rglob("*.js"))
    versions = {p.relative_to(ROOT).as_posix(): stamp(p) for p in js_files}
    for css in sorted((ROOT / "css").glob("*.css")):
        versions[css.relative_to(ROOT).as_posix()] = stamp(css)

    imports = dict(EXTERNAL)
    for rel in sorted(k for k in versions if k.endswith(".js")):
        imports[f"./{rel}"] = f"./{rel}?v={versions[rel]}"
    importmap = (
        '<script type="importmap">\n'
        + json.dumps({"imports": imports}, indent=2, ensure_ascii=False)
        + "\n  </script>"
    )

    for page in PAGES:
        path = ROOT / page
        html = path.read_text(encoding="utf-8")
        # href="css/x.css" / src="js/x.js" (con o sin ?v= previo)
        def repl(m: re.Match) -> str:
            attr, rel = m.group(1), m.group(2)
            v = versions.get(rel)
            return f'{attr}="{rel}?v={v}"' if v else m.group(0)
        html = re.sub(r'(href|src)="((?:css|js)/[^"?]+)(?:\?v=[0-9a-f]+)?"', repl, html)
        html = re.sub(r'<script type="importmap">.*?</script>', lambda _: importmap, html, flags=re.S)
        path.write_text(html, encoding="utf-8", newline="")
        print(f"{page}: {len(imports) - len(EXTERNAL)} módulos versionados")


if __name__ == "__main__":
    main()

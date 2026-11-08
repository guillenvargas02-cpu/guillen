#!/usr/bin/env python3
"""Escribe compositions/decode.html: el logotipo SOMOS se "decodifica" de píxeles gruesos a vector nítido.

Calcula, a partir del logotipo rasterizado (tools/logo-raster.png, 4x), qué celdas se encienden en cada
resolución (20, 10, 5 y 2.5 px) y las posiciones iniciales dispersas de los píxeles gruesos.

Uso:  python3 -I tools/build_scene.py
"""
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
LEVELS = [20, 10, 5, 2.5]
RASTER_SCALE = 4


def h(i, salt=0.0):
    v = math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
    return v - math.floor(v)


def cells(cov, size):
    """Celdas (col, fila) cuya cobertura del logotipo es ≥ 50 % para un tamaño de celda en px de pantalla."""
    s = size * RASTER_SCALE
    hh, ww = cov.shape
    out = []
    for r in range(int(math.ceil(hh / s))):
        for c in range(int(math.ceil(ww / s))):
            block = cov[int(r * s) : int((r + 1) * s), int(c * s) : int((c + 1) * s)]
            if block.size and block.mean() >= 0.5:
                out.append((c, r))
    return out


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    left, top = W / 2 - lw / 2, H / 2 - lh / 2
    d = "".join(L["d"] for L in logo["letters"])
    img = np.array(Image.open(ROOT / "tools" / "logo-raster.png").convert("L")).astype(float)
    cov = 1 - img / 255.0

    # niveles finos: un solo <path> por nivel (cuadros como subtrayectorias)
    level_paths = []
    for size in LEVELS[1:]:
        cs = cells(cov, size)
        dd = "".join(f"M{left + c * size:g} {top + r * size:g}h{size:g}v{size:g}h{-size:g}z" for c, r in cs)
        level_paths.append(dd)

    # nivel grueso: cada píxel es un elemento que viaja desde una posición dispersa en la retícula
    g = LEVELS[0]
    coarse = cells(cov, g)
    cx, cy = lw / 2, lh / 2
    px = []
    for i, (c, r) in enumerate(coarse):
        tx, ty = left + c * g, top + r * g
        # inicio en la retícula de 20 px, disperso por todo el cuadro (más lejos los de las orillas del logotipo)
        sx = left + (round((h(i, 1) * 1.6 - 0.3) * (lw / g)) * g)
        sy = top + (round((h(i, 2) - 0.5) * 1500 / g) * g)
        if abs(sy - ty) < 3 * g:
            sy += (6 * g) * (1 if h(i, 3) > 0.5 else -1)
        px.append({
            "tx": round(tx, 2), "ty": round(ty, 2), "sx": round(sx, 2), "sy": round(sy, 2),
            "on": round(0.02 + 0.3 * h(i, 4), 3),  # cuándo aparece (parpadeando)
            "go": round(0.36 + 0.42 * h(i, 5), 3),  # cuándo empieza a viajar
            "xf": 1 if h(i, 6) > 0.5 else 0,  # primero en x (1) o primero en y (0): trayectoria en "L"
        })

    rects = []
    for i in range(len(px)):
        rects.append(f'<rect id="g{i}b" class="ghost2" width="{g}" height="{g}" />')
        rects.append(f'<rect id="g{i}a" class="ghost1" width="{g}" height="{g}" />')
        rects.append(f'<rect id="c{i}" class="px" width="{g}" height="{g}" />')

    rep = {
        "{{LOGO_LEFT}}": f"{left:g}",
        "{{LOGO_TOP}}": f"{top:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LOGO_D}}": d,
        "{{GRID}}": f"{g:g}",
        "{{GRID_X}}": f"{left % g:.3f}",
        "{{GRID_Y}}": f"{top % g:.3f}",
        "{{RECTS}}": "\n          ".join(rects),
        "{{L10}}": level_paths[0],
        "{{L5}}": level_paths[1],
        "{{L25}}": level_paths[2],
        "{{PX}}": json.dumps(px, separators=(",", ":")),
    }
    out = (ROOT / "tools" / "decode.template.html").read_text()
    for k, v in rep.items():
        out = out.replace(k, v)
    assert "{{" not in out
    (ROOT / "compositions" / "decode.html").write_text(out)
    print("compositions/decode.html", len(out), "bytes ·", len(px), "píxeles gruesos ·", [len(p) for p in level_paths], "bytes por nivel")


if __name__ == "__main__":
    main()

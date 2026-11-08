#!/usr/bin/env python3
"""Escribe compositions/binary.html: lluvia de código binario que aterriza y se compila en el logotipo SOMOS.

Calcula, a partir del logotipo rasterizado (tools/logo-raster.png, 4x), las celdas de texto (9.6 × 13.8 px)
que caen dentro de las letras: cada una será un dígito 0/1 que aterriza en su lugar.

Uso:  python3 -I tools/build_scene.py
"""
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
CW, CH = 9.6, 13.8
SCALE = 4


def h(i, salt=0.0):
    v = math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
    return v - math.floor(v)


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    left, top = W / 2 - lw / 2, H / 2 - lh / 2
    d = "".join(L["d"] for L in logo["letters"])
    cov = 1 - np.array(Image.open(ROOT / "tools" / "logo-raster.png").convert("L")).astype(float) / 255.0

    cells = []
    rows, cols = int(math.ceil(lh / CH)), int(math.ceil(lw / CW))
    for r in range(rows):
        for c in range(cols):
            blk = cov[int(r * CH * SCALE) : int((r + 1) * CH * SCALE), int(c * CW * SCALE) : int((c + 1) * CW * SCALE)]
            if blk.size and blk.mean() >= 0.5:
                cells.append((c, r))

    cx, cy = left + lw / 2, top + lh / 2
    digits = []
    for i, (c, r) in enumerate(cells):
        tx, ty = left + c * CW, top + r * CH
        # cae desde arriba con un poco de deriva lateral; aterriza entre 1.0 y 1.62 s
        land = 1.0 + 0.62 * (0.55 * h(i, 1) + 0.45 * (c / cols))
        digits.append({
            "x": round(tx, 2), "y": round(ty, 2),
            "sx": round(tx + (h(i, 2) - 0.5) * 140, 1),
            "sy": round(ty - 700 - 900 * h(i, 3), 1),
            "land": round(land, 3),
            "d": round(math.hypot((tx + CW / 2 - cx) / 1.0, (ty + CH / 2 - cy) * 3.0), 1),  # distancia para la onda de compilación
            "s": round(h(i, 4), 4),
        })
    dmax = max(g["d"] for g in digits)

    rep = {
        "{{LOGO_LEFT}}": f"{left:g}",
        "{{LOGO_TOP}}": f"{top:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LOGO_D}}": d,
        "{{CW}}": f"{CW:g}",
        "{{CH}}": f"{CH:g}",
        "{{DMAX}}": f"{dmax:.1f}",
        "{{DIGITS}}": json.dumps(digits, separators=(",", ":")),
    }
    out = (ROOT / "tools" / "binary.template.html").read_text()
    for k, v in rep.items():
        out = out.replace(k, v)
    assert "{{" not in out
    (ROOT / "compositions" / "binary.html").write_text(out)
    print("compositions/binary.html", len(out), "bytes ·", len(digits), "dígitos en el logotipo")


if __name__ == "__main__":
    main()

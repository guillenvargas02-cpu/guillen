#!/usr/bin/env python3
"""Escribe compositions/shatter.html: el logotipo SOMOS partido en esquirlas 3D (cortes inclinados con su misma
itálica) que estallan, quedan suspendidas y se vuelven a armar.

Uso:  python3 -I tools/build_scene.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
COLS = 6
SLANT = math.tan(math.radians(12.5))


def h(i, salt=0.0):
    """Pseudoaleatorio determinista en [0, 1)."""
    v = math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
    return v - math.floor(v)


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    left, top = W / 2 - lw / 2, H / 2 - lh / 2
    d = "".join(L["d"] for L in logo["letters"])

    # rejilla de cortes: columnas inclinadas como los fustes del logotipo y un corte horizontal irregular
    x0, x1, y0, y1 = -40.0, lw + 40.0, -12.0, lh + 12.0
    hh = y1 - y0
    xs = [x0 + (x1 - x0) * j / COLS + (0 if j in (0, COLS) else (h(j, 1) - 0.5) * 50) for j in range(COLS + 1)]
    mids = [y0 + hh * (0.35 + 0.3 * h(j, 2)) for j in range(COLS + 1)]

    def bx(j, y):  # borde inclinado de la columna j a la altura y
        return xs[j] + SLANT * (lh / 2 - y)

    pieces = []
    for j in range(COLS):
        tl_, tr = (bx(j, y0), y0), (bx(j + 1, y0), y0)
        ml, mr = (bx(j, mids[j]), mids[j]), (bx(j + 1, mids[j + 1]), mids[j + 1])
        bl, br = (bx(j, y1), y1), (bx(j + 1, y1), y1)
        quads = [(tl_, tr, mr, ml), (ml, mr, br, bl)]
        for q, (a, b, c, dd) in enumerate(quads):
            # cada celda en dos triángulos, alternando la diagonal
            tris = [(a, b, c), (a, c, dd)] if (j + q) % 2 == 0 else [(a, b, dd), (b, c, dd)]
            for tri in tris:
                pieces.append(tri)

    cx, cy = lw / 2, lh / 2
    data, html = [], []
    for i, tri in enumerate(pieces):
        gx = sum(p[0] for p in tri) / 3
        gy = sum(p[1] for p in tri) / 3
        poly = ", ".join(f"{p[0]:.1f}px {p[1]:.1f}px" for p in tri)
        # dirección de la explosión: desde el centro del logotipo hacia afuera, con algo de dispersión
        ang = math.atan2(gy - cy + (h(i, 3) - 0.5) * 120, gx - cx) + (h(i, 4) - 0.5) * 0.9
        dist = 50 + 150 * h(i, 5) + abs(gx - cx) * 0.22
        data.append(
            {
                "gx": round(gx, 1),
                "gy": round(gy, 1),
                "dx": round(math.cos(ang) * dist, 1),
                "dy": round(math.sin(ang) * dist * 2.4, 1),  # el cuadro es vertical: se abren más hacia arriba y abajo
                "dz": round(-650 + 1000 * h(i, 6), 1),
                "rx": round((h(i, 7) - 0.5) * 70, 1),
                "ry": round((h(i, 8) - 0.5) * 90, 1),
                "rz": round((h(i, 9) - 0.5) * 70, 1),
                "k": round(math.hypot(gx - cx, (gy - cy) * 3) / math.hypot(cx, cy * 3), 3),  # 0 centro … 1 borde
            }
        )
        html.append(
            f'<div id="p{i}" class="piece" style="clip-path: polygon({poly}); transform-origin: {gx:.1f}px {gy:.1f}px">'
            f'<svg viewBox="0 0 {lw:g} {lh:g}"><use href="#somos-d" /></svg></div>'
        )

    # restos sueltos: astillas rosas sólidas que dan densidad al estallido y se desvanecen al armarse
    debris, ddata = [], []
    for i in range(12):
        s = 16 + 34 * h(i, 11)
        pts = [(0, -s), (s * (0.5 + 0.5 * h(i, 12)), s * 0.6), (-s * (0.4 + 0.5 * h(i, 13)), s * 0.4)]
        debris.append(
            f'<div id="d{i}" class="debris" style="clip-path: polygon({", ".join(f"{50 + p[0]:.1f}px {50 + p[1]:.1f}px" for p in pts)})"></div>'
        )
        ang = 2 * math.pi * h(i, 14)
        dist = 200 + 380 * h(i, 15)
        ddata.append({"dx": round(math.cos(ang) * dist, 1), "dy": round(math.sin(ang) * dist * 1.7, 1), "dz": round(-400 + 1000 * h(i, 16), 1),
                      "rx": round((h(i, 17) - 0.5) * 300, 1), "ry": round((h(i, 18) - 0.5) * 300, 1), "rz": round((h(i, 19) - 0.5) * 300, 1)})

    rep = {
        "{{LOGO_LEFT}}": f"{left:g}",
        "{{LOGO_TOP}}": f"{top:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LOGO_D}}": d,
        "{{PIECES}}": "\n        ".join(html),
        "{{DEBRIS}}": "\n        ".join(debris),
        "{{PDATA}}": json.dumps(data, separators=(",", ":")),
        "{{DDATA}}": json.dumps(ddata, separators=(",", ":")),
    }
    out = (ROOT / "tools" / "shatter.template.html").read_text()
    for k, v in rep.items():
        out = out.replace(k, v)
    assert "{{" not in out
    (ROOT / "compositions" / "shatter.html").write_text(out)
    print("compositions/shatter.html", len(out), "bytes ·", len(pieces), "esquirlas")


if __name__ == "__main__":
    main()

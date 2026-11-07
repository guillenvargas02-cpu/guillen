#!/usr/bin/env python3
"""Genera los vectores de la cortinilla.

1. assets/brand/somos.svg + compositions/_logo-paths.json
   El logotipo SOMOS vectorizado (potrace) desde la referencia oficial, separado en 5 letras.
2. compositions/_map.json
   Las 16 alcaldías de la CDMX (INEGI, Marco Geoestadístico 2023 vía PhantomInsights/mexico-geojson)
   proyectadas al lienzo de 1080x1920, más la silueta de Miguel Hidalgo remuestreada para el morph.

Uso:  python3 -I tools/build_assets.py
"""
import json
import math
from pathlib import Path

import numpy as np
import potrace
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"

# ---------------------------------------------------------------- logo
LOGO_W = 820.0  # ancho del logotipo en el lienzo de 1080 px


def trace_logo():
    im = np.array(Image.open(TOOLS / "somos-ref.webp").convert("RGB")).astype(float)
    # cobertura del rosa (0 blanco … 1 rosa) a partir del canal verde, que va de 255 a ~5
    cov = np.clip((255 - im[..., 1]) / 250, 0, 1)
    ys, xs = np.where(cov > 0.5)
    x0, x1, y0, y1 = xs.min() - 6, xs.max() + 7, ys.min() - 6, ys.max() + 7
    cov = cov[y0:y1, x0:x1]
    # supermuestreo x4 para que potrace siga el borde antialias con precisión subpíxel
    big = Image.fromarray((cov * 255).astype(np.uint8)).resize((cov.shape[1] * 4, cov.shape[0] * 4), Image.LANCZOS)
    bmp = potrace.Bitmap(np.array(big) < 128)  # potracer traza los valores False como tinta
    plist = bmp.trace(turdsize=40, alphamax=1.0, opticurve=True, opttolerance=0.2)

    # bbox exacto del rosa
    ys, xs = np.where(cov > 0.5)
    bx0, bx1, by0, by1 = xs.min() * 4, (xs.max() + 1) * 4, ys.min() * 4, (ys.max() + 1) * 4
    s = LOGO_W / (bx1 - bx0)
    H = (by1 - by0) * s

    def P(p):
        return f"{(p.x - bx0) * s:.2f} {(p.y - by0) * s:.2f}"

    curves = []
    for c in plist:
        d = [f"M{P(c.start_point)}"]
        for seg in c.segments:
            if seg.is_corner:
                d.append(f"L{P(seg.c)}L{P(seg.end_point)}")
            else:
                d.append(f"C{P(seg.c1)} {P(seg.c2)} {P(seg.end_point)}")
        d.append("Z")
        xs_ = [((seg.end_point.x - bx0) * s) for seg in c.segments] + [(c.start_point.x - bx0) * s]
        curves.append({"d": "".join(d), "cx": (min(xs_) + max(xs_)) / 2, "minx": min(xs_), "maxx": max(xs_)})

    # agrupar contornos en letras: los huecos (O) caen dentro del rango x de su letra
    curves.sort(key=lambda c: c["minx"])
    letters = []
    for c in curves:
        for L in letters:
            if c["cx"] > L["minx"] and c["cx"] < L["maxx"]:
                L["d"] += c["d"]
                break
        else:
            letters.append(dict(c))
    assert len(letters) == 5, f"se esperaban 5 letras, salieron {len(letters)}"
    out = {"w": LOGO_W, "h": round(H, 2), "letters": [{"d": L["d"], "minx": round(L["minx"], 2), "maxx": round(L["maxx"], 2)} for L in letters]}
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LOGO_W:.0f} {H:.2f}" width="{LOGO_W:.0f}" height="{H:.2f}">'
        f'<path fill="#E4007C" fill-rule="evenodd" d="{"".join(L["d"] for L in letters)}"/></svg>'
    )
    (ROOT / "assets" / "brand" / "somos.svg").write_text(svg)
    return out


# ---------------------------------------------------------------- mapa
MAP_W = 860.0  # ancho del mapa completo de la CDMX en el lienzo


def project_map():
    gj = json.loads((TOOLS / "cdmx-alcaldias.json").read_text())
    lat0 = 19.35
    kx = math.cos(math.radians(lat0))
    feats = []
    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        rings = [ring for poly in polys for ring in poly[:1]]  # solo anillo exterior
        rings.sort(key=len, reverse=True)
        feats.append((f["properties"]["NOMGEO"], f["properties"]["CVE_MUN"], rings[0]))
    allpts = np.array([p for _, _, r in feats for p in r])
    X = allpts[:, 0] * kx
    Y = -allpts[:, 1]
    minx, maxx, miny, maxy = X.min(), X.max(), Y.min(), Y.max()
    s = MAP_W / (maxx - minx)
    mh = MAP_W * (maxy - miny) / (maxx - minx)

    def proj(r):
        a = np.array(r)
        return np.stack([(a[:, 0] * kx - minx) * s, (-a[:, 1] - miny) * s], 1)

    def simplify(pts, eps=0.35):
        # Ramer–Douglas–Peucker
        if len(pts) < 3:
            return pts
        a, b = pts[0], pts[-1]
        ab = b - a
        n = np.hypot(*ab) or 1e-9
        q = pts - a
        d = np.abs(ab[0] * q[:, 1] - ab[1] * q[:, 0]) / n
        i = int(np.argmax(d))
        if d[i] > eps:
            return np.vstack([simplify(pts[: i + 1], eps)[:-1], simplify(pts[i:], eps)])
        return np.array([a, b])

    out = []
    mh_pts = None
    for name, cve, ring in feats:
        q = proj(ring)
        k = int(np.argmax(np.hypot(*(q - q[0]).T)))  # anillo cerrado: simplificar en dos mitades
        p = np.vstack([simplify(q[: k + 1])[:-1], simplify(q[k:])])
        d = "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in p[:-1]) + "Z"
        c = p[:-1].mean(0)
        per = float(np.sum(np.hypot(*np.diff(p, axis=0).T)))
        out.append({"name": name, "cve": cve, "d": d, "cx": round(float(c[0]), 1), "cy": round(float(c[1]), 1), "len": round(per, 1)})
        if name == "Miguel Hidalgo":
            mh_pts = proj(ring)
    return {"w": MAP_W, "h": round(float(mh), 1), "alcaldias": out}, mh_pts


def resample(pts, n):
    pts = np.asarray(pts, float)
    if not np.allclose(pts[0], pts[-1]):
        pts = np.vstack([pts, pts[:1]])
    seg = np.hypot(*np.diff(pts, axis=0).T)
    t = np.concatenate([[0], np.cumsum(seg)])
    u = np.linspace(0, t[-1], n, endpoint=False)
    return np.stack([np.interp(u, t, pts[:, 0]), np.interp(u, t, pts[:, 1])], 1)


def signed_area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


def main():
    logo = trace_logo()
    mp, mh_pts = project_map()

    # --- morph: silueta de Miguel Hidalgo -> placa itálica con la inclinación del logotipo
    N = 360
    a = resample(mh_pts, N)
    mc = a.mean(0)
    a -= mc  # centrado en su propio centroide (coordenadas del mapa)
    # placa: paralelogramo del tamaño del logotipo, inclinado ~12.5° como sus fustes
    W, H = logo["w"], logo["h"]
    sl = math.tan(math.radians(12.5)) * H
    slab = np.array([[-W / 2 + sl / 2, -H / 2], [W / 2 + sl / 2, -H / 2], [W / 2 - sl / 2, H / 2], [-W / 2 - sl / 2, H / 2], [-W / 2 + sl / 2, -H / 2]])
    b = resample(slab, N)
    if np.sign(signed_area(a)) != np.sign(signed_area(b)):
        b = b[::-1]
    # alinear el punto inicial que minimiza el recorrido total
    best = min(range(N), key=lambda k: np.sum(np.hypot(*(np.roll(b, -k, 0) - a).T)))
    b = np.roll(b, -best, 0)
    mp["morph"] = {"n": N, "cx": round(float(mc[0]), 2), "cy": round(float(mc[1]), 2), "from": [round(v, 2) for v in a.flatten().tolist()], "to": [round(v, 2) for v in b.flatten().tolist()]}

    (ROOT / "compositions" / "_logo.json").write_text(json.dumps(logo))
    (ROOT / "compositions" / "_map.json").write_text(json.dumps(mp))
    mhc = next(x for x in mp["alcaldias"] if x["name"] == "Miguel Hidalgo")
    print("logo", logo["w"], logo["h"], [round(L["minx"]) for L in logo["letters"]])
    print("map", mp["w"], mp["h"], "MH centro", mhc["cx"], mhc["cy"])


if __name__ == "__main__":
    main()

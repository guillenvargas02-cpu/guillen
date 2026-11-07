#!/usr/bin/env python3
"""Arma compositions/skyline.html: skyline rosa de los edificios emblemáticos de Miguel Hidalgo
que se transforma en el logotipo de SOMOS.

Uso:
  python3 -I tools/build_scene.py            # escribe compositions/skyline.html
  python3 -I tools/build_scene.py --preview  # escribe tools/preview.html (cada edificio suelto)
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from buildings import BUILDERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
INK = "#E4007C"

# paleta por plano: el de enfrente es dibujo de línea claro; el del fondo, silueta en tono medio
STYLE = {
    "front": {"wall": "#FFF1F7", "mid": "#F9C6DE", "dark": "#F27CB7", "ink": INK, "white": "#FFFFFF", "line": INK, "outline": True},
    "back": {"wall": "#F6B2D2", "mid": "#F198C3", "dark": "#EA6BAA", "ink": INK, "white": "#FBDDEB", "line": "#E7559E", "outline": False},
}

# skyline: (edificio, plano, x del centro, escala)
LAYOUT = [
    ("petroleos", "back", 820, 0.92),
    ("reloj", "back", 1560, 0.90),
    ("castillo", "front", 300, 0.72),
    ("altar", "front", 1170, 0.60),
    ("auditorio", "front", 1930, 0.75),
    ("soumaya", "front", 2700, 0.95),
]
PARALLAX = {"front": 1.0, "back": 0.8, "sun": 0.4}

# cámara (coordenadas del skyline; el suelo está en y=0)
CAM_Y = -420  # durante el recorrido el suelo queda a ~1430 px
DOLLY = (1.24, 1.12)  # escala de cámara durante el recorrido (se acerca y se asienta)
FPS = 60
TRUCK = (290.0, 2600.0)  # cx inicial y final del recorrido
TRUCK_T = (0.0, 1.95)
PULL_T = (1.78, 2.40)  # la cámara se aleja hasta ver todo el skyline
SKY_W = 1000.0  # ancho del skyline completo en pantalla al final

N_MORPH = 1400


def fmt(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def d_of(pts, closed=True):
    return "M" + "L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + ("Z" if closed else "")


def hex_d(clip, r):
    """Panal de hexágonos (filas de abajo hacia arriba) dentro de la caja del polígono."""
    xs = [p[0] for p in clip]
    ys = [p[1] for p in clip]
    w = math.sqrt(3) * r
    out = []
    row = 0
    y = max(ys) + r
    while y > min(ys) - r:
        x = min(xs) - w + (w / 2 if row % 2 else 0)
        while x < max(xs) + w:
            pts = [(x + r * math.cos(math.radians(60 * i + 30)), y + r * math.sin(math.radians(60 * i + 30))) for i in range(6)]
            out.append(d_of(pts))
            x += w
        y -= 1.5 * r
        row += 1
    return "".join(out)


def render_building(name, layer, k, uid):
    """SVG del edificio en coordenadas locales, respetando la profundidad: cada figura pinta su relleno
    (recortado por la máscara de subida #rise-uid) y encima su contorno. data-o ordena el dibujo de los
    contornos de abajo hacia arriba."""
    st = STYLE[layer]
    shapes = BUILDERS[name]()
    out, strokes = [], []
    main_w, hair_w = 3.0 / k, 1.4 / k
    clip = f'clip-path="url(#rise-{uid})"'
    for i, s in enumerate(shapes):
        if s["t"] == "poly":
            out.append(f'<path d="{d_of(s["pts"])}" fill="{st[s["role"]]}" {clip} />')
            if s["stroke"] and st["outline"]:
                strokes.append((max(p[1] for p in s["pts"]), i, len(out)))
                out.append(f'<path class="s" d="{d_of(s["pts"])}" stroke-width="{main_w:.2f}" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" />')
        elif s["t"] == "line":
            wdt = main_w if s["w"] == "main" else hair_w
            if st["outline"]:
                strokes.append((max(p[1] for p in s["pts"]), i, len(out)))
                out.append(f'<path class="s" d="{d_of(s["pts"], False)}" stroke="{st["line"]}" stroke-width="{wdt:.2f}" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" />')
            else:
                out.append(f'<path d="{d_of(s["pts"], False)}" fill="none" stroke="{st["line"]}" stroke-width="{wdt:.2f}" {clip} />')
        elif s["t"] == "hex":
            cid = f"hexclip-{uid}"
            out.append(f'<clipPath id="{cid}"><path d="{d_of(s["clip"])}" /></clipPath>')
            if st["outline"]:
                strokes.append((max(p[1] for p in s["clip"]) + 1, i, len(out)))
                out.append(f'<g clip-path="url(#{cid})"><path class="s" d="{hex_d(s["clip"], s["r"])}" stroke-width="{1.15 / k:.2f}" stroke-opacity="0.8" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" /></g>')
    for rank, (_, _, pos) in enumerate(sorted(strokes, key=lambda t: (-t[0], t[1]))):
        out[pos] = out[pos].replace('<path class="s" ', f'<path class="s" data-o="{rank}" ', 1)
    return "\n".join(out)


def preview():
    cells = []
    for name in BUILDERS:
        for layer in ("front", "back"):
            g = render_building(name, layer, 1.0, f"{name}-{layer}").replace('stroke-dashoffset="110"', 'stroke-dashoffset="0"')
            cells.append(
                f'<svg viewBox="-600 -1050 1200 1100" width="420" height="385" style="border:1px solid #eee">'
                f'<style>.s{{fill:none;stroke:{INK};stroke-linejoin:round;stroke-linecap:round}}</style>{g}</svg>'
            )
    (ROOT / "tools" / "preview.html").write_text("<html><body style='margin:0;background:#fff;display:flex;flex-wrap:wrap'>" + "".join(cells) + "</body></html>")


def envelope():
    """Silueta conjunta del skyline (perfil superior), en coordenadas del skyline."""
    sc = 0.5
    x0, x1, y0 = -400, 3400, -1100
    img = Image.new("L", (int((x1 - x0) * sc), int((20 - y0) * sc)), 0)
    dr = ImageDraw.Draw(img)
    for name, layer, cx, k in LAYOUT:
        for s in BUILDERS[name]():
            if s["t"] == "poly":
                dr.polygon([((cx + p[0] * k - x0) * sc, (p[1] * k - y0) * sc) for p in s["pts"]], fill=255)
    # una franja de suelo une todos los edificios en una sola silueta; potrace saca su contorno exterior
    m = np.array(img) > 127
    cols = np.where(m.any(0))[0]
    gy = int((0 - y0) * sc)
    m[gy - 3 : gy + 1, cols.min() : cols.max() + 1] = True
    import potrace

    curves = potrace.Bitmap(~m).trace(turdsize=4, alphamax=0.8, opticurve=True, opttolerance=0.2)
    best = max(curves, key=lambda c: len(c.segments))
    pts = []
    cur = best.start_point
    for seg in best.segments:
        if seg.is_corner:
            pts += [(seg.c.x, seg.c.y), (seg.end_point.x, seg.end_point.y)]
        else:
            for k in range(1, 7):
                u = k / 6
                pts.append(tuple((1 - u) ** 3 * a0 + 3 * (1 - u) ** 2 * u * a1 + 3 * (1 - u) * u * u * a2 + u ** 3 * a3 for a0, a1, a2, a3 in zip((cur.x, cur.y), (seg.c1.x, seg.c1.y), (seg.c2.x, seg.c2.y), (seg.end_point.x, seg.end_point.y))))
        cur = seg.end_point
    return np.array([(x / sc + x0, y / sc + y0) for x, y in pts])


def resample(pts, n):
    pts = np.asarray(pts, float)
    pts = np.vstack([pts, pts[:1]])
    seg = np.hypot(*np.diff(pts, axis=0).T)
    t = np.concatenate([[0], np.cumsum(seg)])
    u = np.linspace(0, t[-1], n, endpoint=False)
    return np.stack([np.interp(u, t, pts[:, 0]), np.interp(u, t, pts[:, 1])], 1)


def area(p):
    return 0.5 * np.sum(p[:, 0] * np.roll(p[:, 1], -1) - np.roll(p[:, 0], -1) * p[:, 1])


def sine_inout(p):
    return -(math.cos(math.pi * p) - 1) / 2


def power2_out(p):
    return 1 - (1 - p) ** 2


def power3_inout(p):
    return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def prog(t, t0, t1):
    return min(1.0, max(0.0, (t - t0) / (t1 - t0)))


def camera(t, cxF, cyF, S):
    """Estado de cámara (cx, cy, s) en el tiempo t: travelling + dolly, luego alejamiento logarítmico."""
    cxT = TRUCK[0] + (TRUCK[1] - TRUCK[0]) * sine_inout(prog(t, *TRUCK_T))
    sT = DOLLY[0] + (DOLLY[1] - DOLLY[0]) * power2_out(prog(t, 0, 1.4))
    z = power3_inout(prog(t, *PULL_T))
    s = math.exp(math.log(sT) + (math.log(S) - math.log(sT)) * z)
    return cxT + (cxF - cxT) * z, CAM_Y + (cyF - CAM_Y) * z, s


def layer_tf(f, cam, cxF, cyF):
    cx, cy, s = cam
    cxL, cyL = cxF + (cx - cxF) * f, cyF + (cy - cyF) * f
    return (round(W / 2 - (cxL + OX) * s, 2), round(H / 2 - (cyL + OY) * s, 2), round(s, 5))


OX, OY = 400, 1150  # origen del skyline dentro de cada capa


def main():
    if "--preview" in sys.argv:
        preview()
        return
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())

    env = envelope()
    ex0, ex1 = env[:, 0].min(), env[:, 0].max()
    etop = env[:, 1].min()
    S = SKY_W / (ex1 - ex0)
    cxF, cyF = (ex0 + ex1) / 2, etop / 2
    # silueta en pantalla con la cámara final
    scr = np.stack([W / 2 + (env[:, 0] - cxF) * S, H / 2 + (env[:, 1] - cyF) * S], 1)
    a = resample(scr, N_MORPH)
    lw, lh = logo["w"], logo["h"]
    sl = math.tan(math.radians(12.5)) * lh
    slab = np.array([[-lw / 2 + sl / 2, -lh / 2], [lw / 2 + sl / 2, -lh / 2], [lw / 2 - sl / 2, lh / 2], [-lw / 2 - sl / 2, lh / 2]]) + [W / 2, H / 2]
    b = resample(slab, N_MORPH)
    if np.sign(area(a)) != np.sign(area(b)):
        b = b[::-1]
    best = min(range(N_MORPH), key=lambda kk: np.sum(np.hypot(*(np.roll(b, -kk, 0) - a).T)))
    b = np.roll(b, -best, 0)

    # edificios
    layers = {"front": [], "back": []}
    tweens = []
    for idx, (name, layer, cx, k) in enumerate(LAYOUT):
        uid = f"b{idx}"
        body = render_building(name, layer, k, uid)
        shapes = BUILDERS[name]()
        xs = [p[0] for s in shapes if s["t"] == "poly" for p in s["pts"]]
        left = cx + min(xs) * k
        # cuándo entra a cuadro durante el recorrido (con paralaje)
        f = PARALLAX[layer]
        t_in = 0.0
        for i in range(240):
            tt = i / FPS
            ccx, _, cs = camera(tt, cxF, cyF, S)
            camL = cxF + (ccx - cxF) * f
            if left + 120 / cs < camL + W / 2 / cs:
                t_in = max(0.0, tt - 0.32)
                break
        clip = f"rise-{uid}"
        layers[layer].append(
            f'<g id="{uid}" class="bld" transform="translate({cx} 0) scale({k})">\n'
            f'<clipPath id="{clip}"><rect id="{uid}-rise" x="-700" y="20" width="1400" height="0" /></clipPath>\n'
            f'{body}\n</g>'
        )
        tweens.append(f'      // {name} ({layer})')
        tweens.append(f'      tl.fromTo("#{uid}-wrap", {{ y: 70 }}, {{ y: 0, duration: 0.75, ease: "expo.out" }}, {t_in:.3f});')
        tweens.append(f'      tl.to("#{uid}-rise", {{ attr: {{ y: -1150, height: 1170 }}, duration: 0.62, ease: "power2.inOut" }}, {t_in + 0.06:.3f});')
        if STYLE[layer]["outline"]:
            tweens.append(f'      tl.to(strokesOf("{uid}"), {{ attr: {{ "stroke-dashoffset": 0 }}, duration: 0.42, ease: "power2.out", stagger: {{ amount: 0.32 }} }}, {t_in:.3f});')

    def wrap(html):
        # grupo envolvente para la subida (GSAP mueve el envolvente, el transform del edificio queda fijo)
        out = []
        for g in html:
            uid = g.split('id="', 1)[1].split('"', 1)[0]
            out.append(f'<g id="{uid}-wrap">\n{g}\n</g>')
        return "\n".join(out)

    kf = {}
    n_frames = int(round(2.6 * FPS))
    for name, f in (("front", 1.0), ("back", PARALLAX["back"]), ("sun", PARALLAX["sun"])):
        kf[name] = [layer_tf(f, camera(i / FPS, cxF, cyF, S), cxF, cyF) for i in range(n_frames + 1)]

    rep = {
        "{{KF}}": json.dumps(kf, separators=(",", ":")),
        "{{FPS}}": str(FPS),
        "{{BACK}}": wrap(layers["back"]),
        "{{FRONT}}": wrap(layers["front"]),
        "{{TWEENS}}": "\n".join(tweens),
        "{{ENV_D}}": d_of(scr.tolist()),
        "{{MORPH_FROM}}": json.dumps([round(v, 2) for v in a.flatten().tolist()], separators=(",", ":")),
        "{{MORPH_TO}}": json.dumps([round(v, 2) for v in b.flatten().tolist()], separators=(",", ":")),
        "{{LOGO_LEFT}}": fmt(W / 2 - lw / 2),
        "{{LOGO_TOP}}": f"{H / 2 - lh / 2:.3f}",
        "{{LOGO_W}}": fmt(lw),
        "{{LOGO_H}}": fmt(lh),
        "{{LETTER_X}}": json.dumps([L["minx"] for L in logo["letters"]]),
        "{{LOGO_LETTERS}}": "\n".join(
            f'      <svg id="lt{i}" viewBox="0 0 {lw:g} {lh:g}" aria-hidden="true"><path d="{L["d"]}" /></svg>' for i, L in enumerate(logo["letters"])
        ),
    }
    html = (ROOT / "tools" / "skyline.template.html").read_text()
    for kk, v in rep.items():
        html = html.replace(kk, v)
    assert "{{" not in html, html[html.index("{{") : html.index("{{") + 40]
    (ROOT / "compositions" / "skyline.html").write_text(html)
    print("compositions/skyline.html", len(html), "bytes · escala final", round(S, 4), "· centro", round(cxF), round(cyF))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Versión 2: skyline de Miguel Hidalgo en un solo plano, edificios separados, y transición en la que
los edificios se hunden bajo la línea del suelo mientras las letras de SOMOS suben desde ella.

Uso:
  python3 -I tools/build_scene.py            # escribe compositions/skyline.html
  python3 -I tools/build_scene.py --preview  # escribe tools/preview.html (el skyline completo)
"""
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from buildings import BUILDERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
INK = "#E4007C"
STYLE = {"wall": "#FFF1F7", "mid": "#F9C6DE", "dark": "#F27CB7", "ink": INK, "white": "#FFFFFF"}

# orden con ritmo: ancho, alto, ancho, alto, ancho, medio — (edificio, escala)
ORDER = [("castillo", 0.62), ("petroleos", 0.80), ("altar", 0.58), ("reloj", 0.80), ("auditorio", 0.64), ("soumaya", 0.82)]
GAP = 120  # aire entre edificios (unidades del skyline)

FPS = 60
DOLLY = (1.06, 0.95)  # escala de cámara durante el recorrido
GROUND_SCREEN = 1360  # altura del suelo en pantalla durante el recorrido
TRUCK_T = (0.0, 2.05)
PULL_T = (1.90, 2.50)
SKY_W = 1010.0  # ancho del skyline completo en pantalla al final


def fmt(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def d_of(pts, closed=True):
    return "M" + "L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + ("Z" if closed else "")


def hex_d(clip, r):
    xs = [p[0] for p in clip]
    ys = [p[1] for p in clip]
    w = math.sqrt(3) * r
    out, row, y = [], 0, max(ys) + r
    while y > min(ys) - r:
        x = min(xs) - w + (w / 2 if row % 2 else 0)
        while x < max(xs) + w:
            out.append(d_of([(x + r * math.cos(math.radians(60 * i + 30)), y + r * math.sin(math.radians(60 * i + 30))) for i in range(6)]))
            x += w
        y -= 1.5 * r
        row += 1
    return "".join(out)


def render_building(name, k, uid):
    """Cada figura pinta su relleno (recortado por la máscara de subida) y encima su contorno, en orden de
    profundidad. data-o ordena el dibujo de los contornos de abajo hacia arriba."""
    shapes = BUILDERS[name]()
    out, strokes = [], []
    main_w, hair_w = 2.8 / k, 1.3 / k
    clip = f'clip-path="url(#rise-{uid})"'
    dash = 'pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"'
    for i, s in enumerate(shapes):
        if s["t"] == "poly":
            out.append(f'<path d="{d_of(s["pts"])}" fill="{STYLE[s["role"]]}" {clip} />')
            if s["stroke"]:
                strokes.append((max(p[1] for p in s["pts"]), i, len(out)))
                out.append(f'<path class="s" d="{d_of(s["pts"])}" stroke-width="{main_w:.2f}" {dash} />')
        elif s["t"] == "line":
            strokes.append((max(p[1] for p in s["pts"]), i, len(out)))
            out.append(f'<path class="s" d="{d_of(s["pts"], False)}" stroke-width="{(main_w if s["w"] == "main" else hair_w):.2f}" {dash} />')
        elif s["t"] == "hex":
            cid = f"hexclip-{uid}"
            out.append(f'<clipPath id="{cid}"><path d="{d_of(s["clip"])}" /></clipPath>')
            strokes.append((max(p[1] for p in s["clip"]) + 1, i, len(out)))
            out.append(f'<g clip-path="url(#{cid})"><path class="s" d="{hex_d(s["clip"], s["r"])}" stroke-width="{1.1 / k:.2f}" stroke-opacity="0.8" {dash} /></g>')
    for rank, (_, _, pos) in enumerate(sorted(strokes, key=lambda t: (-t[0], t[1]))):
        out[pos] = out[pos].replace('<path class="s" ', f'<path class="s" data-o="{rank}" ', 1)
    return "\n".join(out)


def layout():
    """Coloca los edificios de izquierda a derecha con el mismo aire entre ellos."""
    placed, x = [], 0.0
    for name, k in ORDER:
        pts = [p for s in BUILDERS[name]() if s["t"] == "poly" for p in s["pts"]]
        x0, x1 = min(p[0] for p in pts) * k, max(p[0] for p in pts) * k
        top = min(p[1] for p in pts) * k
        cx = x - x0
        placed.append({"name": name, "k": k, "cx": cx, "left": cx + x0, "right": cx + x1, "top": top})
        x = cx + x1 + GAP
    return placed


def sine_inout(p):
    return -(math.cos(math.pi * p) - 1) / 2


def power2_out(p):
    return 1 - (1 - p) ** 2


def power3_inout(p):
    return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def prog(t, t0, t1):
    return min(1.0, max(0.0, (t - t0) / (t1 - t0)))


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    logo_left, logo_top = W / 2 - lw / 2, H / 2 - lh / 2
    baseline = logo_top + lh  # las letras suben desde la línea del suelo

    bl = layout()
    sky0, sky1 = bl[0]["left"], bl[-1]["right"]
    S = SKY_W / (sky1 - sky0)
    cxF = (sky0 + sky1) / 2
    cyF = -(baseline - H / 2) / S  # el suelo queda justo en la base de las letras
    # recorrido: de centrar el primer edificio a centrar el último
    truck = (bl[0]["cx"] + 60, bl[-1]["cx"] - 40)

    def camera(t):
        cxT = truck[0] + (truck[1] - truck[0]) * sine_inout(prog(t, *TRUCK_T))
        sT = DOLLY[0] + (DOLLY[1] - DOLLY[0]) * power2_out(prog(t, 0, 1.6))
        cyT = -(GROUND_SCREEN - H / 2) / sT
        z = power3_inout(prog(t, *PULL_T))
        s = math.exp(math.log(sT) + (math.log(S) - math.log(sT)) * z)
        return cxT + (cxF - cxT) * z, cyT + (cyF - cyT) * z, s

    OX, OY = 400.0, 1150.0
    LW = sky1 + 800

    def tf(t):
        cx, cy, s = camera(t)
        return [round(W / 2 - (cx + OX) * s, 2), round(H / 2 - (cy + OY) * s, 2), round(s, 5)]

    kf = [tf(i / FPS) for i in range(int(round(2.6 * FPS)) + 1)]

    blds, tweens = [], []
    for i, b in enumerate(bl):
        uid = f"b{i}"
        t_in = 0.0
        for f in range(240):
            cx, _, s = camera(f / FPS)
            if b["left"] + 140 / s < cx + W / 2 / s:
                t_in = max(0.0, f / FPS - 0.34)
                break
        body = render_building(b["name"], b["k"], uid)
        blds.append(
            f'<g id="{uid}-wrap"><g id="{uid}" transform="translate({fmt(b["cx"])} 0) scale({b["k"]})">\n'
            f'<clipPath id="rise-{uid}"><rect id="{uid}-rise" x="-700" y="20" width="1400" height="0" /></clipPath>\n{body}\n</g></g>'
        )
        tweens += [
            f"      // {b['name']}",
            f'      tl.fromTo("#{uid}-wrap", {{ y: 90 }}, {{ y: 0, duration: 0.8, ease: "expo.out" }}, {t_in:.3f});',
            f'      tl.to("#{uid}-rise", {{ attr: {{ y: -1150, height: 1170 }}, duration: 0.6, ease: "power2.inOut" }}, {t_in + 0.06:.3f});',
            f'      tl.to(strokesOf("{uid}"), {{ attr: {{ "stroke-dashoffset": 0 }}, duration: 0.42, ease: "power2.out", stagger: {{ amount: 0.3 }} }}, {t_in:.3f});',
        ]
    # salida: cada edificio se hunde bajo el suelo, de izquierda a derecha
    sink = []
    for i, b in enumerate(bl):
        depth = -b["top"] + 40
        sink.append(f'      tl.to("#b{i}-wrap", {{ y: {fmt(depth)}, duration: 0.3, ease: "power3.in" }}, {2.42 + i * 0.035:.3f});')

    rep = {
        "{{LW}}": fmt(LW),
        "{{VIEWBOX}}": f"{-OX:g} {-OY:g} {fmt(LW)} 1200",
        "{{BUILDINGS}}": "\n".join(blds),
        "{{GROUND_D}}": f"M{fmt(sky0 - 260)} 0L{fmt(sky1 + 260)} 0",
        "{{GROUND_W_END}}": f"{2.6 / S:.2f}",
        "{{GROUND_CX}}": fmt(cxF),
        "{{TWEENS}}": "\n".join(tweens),
        "{{SINK}}": "\n".join(sink),
        "{{KF}}": json.dumps(kf, separators=(",", ":")),
        "{{FPS}}": str(FPS),
        "{{LOGO_LEFT}}": fmt(logo_left),
        "{{LOGO_TOP}}": f"{logo_top:.3f}",
        "{{LOGO_W}}": fmt(lw),
        "{{LOGO_H}}": fmt(lh),
        "{{LOGO_LETTERS}}": "\n".join(
            f'      <svg id="lt{i}" viewBox="0 0 {lw:g} {lh:g}" aria-hidden="true"><path d="{L["d"]}" /></svg>' for i, L in enumerate(logo["letters"])
        ),
    }
    html = (ROOT / "tools" / "skyline.template.html").read_text()
    for kk, v in rep.items():
        html = html.replace(kk, v)
    assert "{{" not in html, html[html.index("{{") : html.index("{{") + 40]
    out = ROOT / ("tools/preview.html" if "--preview" in sys.argv else "compositions/skyline.html")
    out.write_text(html)
    print(out.name, len(html), "bytes · escala final", round(S, 4), "· skyline", round(sky1 - sky0), "u")


if __name__ == "__main__":
    main()

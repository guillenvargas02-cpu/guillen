#!/usr/bin/env python3
"""Escribe compositions/intro.html a partir de tools/intro.template.html con los vectores reales
(compositions/_map.json y compositions/_logo.json, que genera tools/build_assets.py).

Uso:  python3 -I tools/build_assets.py && python3 -I tools/build_scene.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
MAP_CENTER = (540, 960)  # dónde queda el centro del mapa completo al inicio
ZOOM = 3.6  # escala final de la cámara sobre Miguel Hidalgo
NAME = "Miguel Hidalgo"


def main():
    mp = json.loads((ROOT / "compositions" / "_map.json").read_text())
    logo = json.loads((ROOT / "compositions" / "_logo.json").read_text())
    mo = mp["morph"]
    mcx, mcy = mo["cx"], mo["cy"]
    vb0x = -(MAP_CENTER[0] - mp["w"] / 2)
    vb0y = -(MAP_CENTER[1] - mp["h"] / 2)

    mh = next(a for a in mp["alcaldias"] if a["name"] == NAME)
    others = [a for a in mp["alcaldias"] if a["name"] != NAME]
    maxd = max(math.hypot(a["cx"] - mcx, a["cy"] - mcy) for a in others)

    paths, tweens = [], []
    for i, a in enumerate(sorted(others, key=lambda a: math.hypot(a["cx"] - mcx, a["cy"] - mcy))):
        pid = "a" + a["cve"]
        paths.append(
            f'            <path id="{pid}" class="alc" style="fill-opacity: 0" data-name="{a["name"]}" d="{a["d"]}" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" />'
        )
        dist = math.hypot(a["cx"] - mcx, a["cy"] - mcy) / maxd
        tweens.append(
            f'      tl.to("#{pid}", {{ attr: {{ "stroke-dashoffset": 0 }}, duration: 0.55, ease: "power2.inOut" }}, {0.04 + 0.28 * dist:.3f});'
        )

    # punto de entrada de la inundación: la esquina noroeste de la alcaldía
    import re

    pts = [tuple(map(float, m.groups())) for m in re.finditer(r"([-\d.]+) ([-\d.]+)", mh["d"])]
    fx, fy = min(pts, key=lambda p: p[0] + p[1])

    lw, lh = logo["w"], logo["h"]
    lleft, ltop = W / 2 - lw / 2, H / 2 - lh / 2
    letters = "\n".join(
        f'      <svg id="lt{i}" viewBox="0 0 {lw:g} {lh:g}" aria-hidden="true"><path d="{L["d"]}" /></svg>'
        for i, L in enumerate(logo["letters"])
    )

    rep = {
        "{{VB0}}": f"{vb0x:.3f} {vb0y:.3f} {W} {H}",
        "{{VB0X}}": f"{vb0x:.3f}",
        "{{VB0Y}}": f"{vb0y:.3f}",
        "{{MCX}}": f"{mcx}",
        "{{MCY}}": f"{mcy}",
        "{{ZOOM}}": f"{ZOOM}",
        "{{FLOOD_X}}": f"{fx}",
        "{{FLOOD_Y}}": f"{fy}",
        "{{MH_D}}": mh["d"],
        "{{ALC_PATHS}}": "\n".join(paths),
        "{{ALC_TWEENS}}": "\n".join(tweens),
        "{{MORPH_FROM}}": json.dumps(mo["from"], separators=(",", ":")),
        "{{MORPH_TO}}": json.dumps(mo["to"], separators=(",", ":")),
        "{{LOGO_LEFT}}": f"{lleft:g}",
        "{{LOGO_TOP}}": f"{ltop:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LETTER_X}}": json.dumps([L["minx"] for L in logo["letters"]]),
        "{{LOGO_LETTERS}}": letters,
    }
    html = (ROOT / "tools" / "intro.template.html").read_text()
    for k, v in rep.items():
        html = html.replace(k, v)
    assert "{{" not in html, html[html.index("{{") : html.index("{{") + 40]
    (ROOT / "compositions" / "intro.html").write_text(html)
    print("compositions/intro.html", len(html), "bytes")


if __name__ == "__main__":
    main()

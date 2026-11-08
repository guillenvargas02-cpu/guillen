#!/usr/bin/env python3
"""Escribe compositions/liquid.html desde tools/liquid.template.html con los trazos reales del logotipo SOMOS.

Uso:  python3 -I tools/build_scene.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    left, top = W / 2 - lw / 2, H / 2 - lh / 2
    d = "".join(L["d"] for L in logo["letters"])
    centers = [round(left + (L["minx"] + L["maxx"]) / 2, 1) for L in logo["letters"]]
    rep = {
        "{{LOGO_LEFT}}": f"{left:g}",
        "{{LOGO_TOP}}": f"{top:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LOGO_D}}": d,
        "{{CENTERS}}": json.dumps(centers),
    }
    html = (ROOT / "tools" / "liquid.template.html").read_text()
    for k, v in rep.items():
        html = html.replace(k, v)
    assert "{{" not in html
    (ROOT / "compositions" / "liquid.html").write_text(html)
    print("compositions/liquid.html", len(html), "bytes · centros", centers)


if __name__ == "__main__":
    main()

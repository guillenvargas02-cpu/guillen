#!/usr/bin/env python3
"""Escribe compositions/hook.html desde tools/hook.template.html con los trazos reales del logotipo SOMOS.

Uso:  python3 -I tools/build_scene.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    d = "".join(L["d"] for L in logo["letters"])
    svg = lambda cls: f'<svg class="{cls}" viewBox="0 0 {lw:g} {lh:g}" aria-hidden="true"><path d="{d}" /></svg>'

    # líneas de velocidad del túnel (deterministas: ángulos regulares con variación fija por índice)
    lines = []
    n = 30
    for i in range(n):
        ang = 360 * i / n + 7 * math.sin(i * 2.3)
        length = 180 + 140 * (0.5 + 0.5 * math.sin(i * 1.7))
        width = 3 + 3 * (0.5 + 0.5 * math.cos(i * 2.9))
        lines.append(
            f'<div class="ray" style="transform: rotate({ang:.1f}deg)"><i id="ray{i}" style="width:{length:.0f}px;height:{width:.1f}px"></i></div>'
        )

    rep = {
        "{{LOGO_LEFT}}": f"{W / 2 - lw / 2:g}",
        "{{LOGO_TOP}}": f"{H / 2 - lh / 2:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LOGO_SVG}}": svg("logo-svg"),
        "{{RAYS}}": "\n      ".join(lines),
        "{{N_RAYS}}": str(n),
    }
    html = (ROOT / "tools" / "hook.template.html").read_text()
    for k, v in rep.items():
        html = html.replace(k, v)
    assert "{{" not in html
    (ROOT / "compositions" / "hook.html").write_text(html)
    print("compositions/hook.html", len(html), "bytes")


if __name__ == "__main__":
    main()

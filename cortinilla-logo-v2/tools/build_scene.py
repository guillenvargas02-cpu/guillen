#!/usr/bin/env python3
"""Escribe compositions/reveal.html desde tools/reveal.template.html con los trazos reales del logotipo SOMOS
(una SVG por letra, para revelarlas una por una).

Uso:  python3 -I tools/build_scene.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920


def main():
    logo = json.loads((ROOT / "tools" / "logo.json").read_text())
    lw, lh = logo["w"], logo["h"]
    letters = "\n      ".join(
        f'<div id="L{i}" class="letter"><svg viewBox="0 0 {lw:g} {lh:g}" aria-hidden="true"><path d="{L["d"]}" /></svg></div>'
        for i, L in enumerate(logo["letters"])
    )
    centers = [round((L["minx"] + L["maxx"]) / 2, 1) for L in logo["letters"]]
    rep = {
        "{{LOGO_LEFT}}": f"{W / 2 - lw / 2:g}",
        "{{LOGO_TOP}}": f"{H / 2 - lh / 2:.3f}",
        "{{LOGO_W}}": f"{lw:g}",
        "{{LOGO_H}}": f"{lh:g}",
        "{{LETTERS}}": letters,
        "{{CENTERS}}": json.dumps(centers),
    }
    html = (ROOT / "tools" / "reveal.template.html").read_text()
    for k, v in rep.items():
        html = html.replace(k, v)
    assert "{{" not in html
    (ROOT / "compositions" / "reveal.html").write_text(html)
    print("compositions/reveal.html", len(html), "bytes · centros", centers)


if __name__ == "__main__":
    main()

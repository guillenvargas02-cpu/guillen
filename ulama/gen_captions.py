#!/usr/bin/env python3
"""Genera compositions/captions.html a partir de timing.json (python3 build.py plan).

Estilo de los videos de SOMOS: mayúsculas blancas con sombra suave y las palabras clave
en recuadros rosa cívico (#E4007C) con texto blanco. Las palabras aparecen cuando se dicen.
"Somos cultura, somos tradición y somos México" no va aquí: lo lleva cierre.html con el logotipo.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
START = 3.233  # inicio de la composición en el video
END = 22.933  # fin (entra el cierre con "Somos…")

# Tamaño de cada frase, en orden
GROUPS = [3, 4, 3, 5, 7, 6, 4, 7, 6, 5, 4, 5, 6, 6, 7]
# Índices (en la lista de palabras) que van en recuadro rosa
KEY = {4, 9, 12, 13, 14, 15, 18, 21, 27, 29, 31, 37, 38, 44, 46, 49, 53, 56, 58, 60, 63, 64, 68, 70, 73, 76, 77}


def main():
    p = json.loads((ROOT / "timing.json").read_text())
    words = [w for w in p["words"] if w["t"] < END - 0.05]
    assert sum(GROUPS) == len(words), (sum(GROUPS), len(words))
    groups, i = [], 0
    for n in GROUPS:
        groups.append(list(range(i, i + n)))
        i += n

    html, js = [], []
    for gi, idx in enumerate(groups):
        t0 = words[idx[0]]["t"] - START
        t1 = (words[groups[gi + 1][0]]["t"] - START) if gi + 1 < len(groups) else END - START
        spans = []
        for k in idx:
            txt = words[k]["w"].upper().rstrip(",.")
            cls = "w k" if k in KEY else "w"
            spans.append(f'<span class="{cls}" data-t="{words[k]["t"] - START:.3f}">{txt}</span>')
        html.append(f'    <div id="cap-{gi}" class="cap">{" ".join(spans)}</div>')
        js.append(f'      ["#cap-{gi}", {max(0.0, t0 - 0.06):.3f}, {t1 - 0.04:.3f}],')

    out = f"""<template>
  <style>
    @font-face {{
      font-family: "Hind Siliguri";
      src: url("assets/fonts/hind-siliguri-latin-700-normal.woff2") format("woff2");
      font-weight: 700;
    }}
    #root {{
      position: absolute;
      inset: 0;
      font-family: "Hind Siliguri", sans-serif;
    }}
    .cap {{
      position: absolute;
      left: 60px;
      width: 960px;
      top: 1240px;
      text-align: center;
      font-size: 76px;
      line-height: 1.42;
      font-weight: 700;
      color: #fff;
      opacity: 0;
      visibility: hidden;
    }}
    .cap .w {{
      display: inline-block;
      padding: 6px 6px 0;
      text-shadow: 0 3px 10px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.6);
    }}
    .cap .w.k {{
      background: #e4007c;
      border-radius: 14px;
      padding: 8px 18px 0;
      margin: 0 2px;
      text-shadow: none;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
    <!-- Generado por gen_captions.py desde timing.json -->
{chr(10).join(html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    const groups = [
{chr(10).join(js)}
    ];
    groups.forEach(([sel, start, end]) => {{
      const g = document.querySelector(sel);
      tl.set(g, {{ opacity: 1, visibility: "visible" }}, start);
      g.querySelectorAll(".w").forEach((w) => {{
        const t = Math.max(start, parseFloat(w.dataset.t) - 0.05);
        if (w.classList.contains("k")) {{
          tl.fromTo(w, {{ opacity: 0, scale: 0.4, y: 20 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.24, ease: "back.out(2.8)" }}, t);
        }} else {{
          tl.fromTo(w, {{ opacity: 0, y: 26 }}, {{ opacity: 1, y: 0, duration: 0.16, ease: "power3.out" }}, t);
        }}
      }});
      tl.to(g, {{ opacity: 0, duration: 0.06, ease: "power1.in" }}, end - 0.06);
      tl.set(g, {{ visibility: "hidden" }}, end);
    }});
    window.__timelines["captions"] = tl;
  </script>
</template>
"""
    (ROOT / "compositions" / "captions.html").write_text(out)
    print(f"{len(js)} frases")


if __name__ == "__main__":
    main()

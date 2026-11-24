#!/usr/bin/env python3
"""Genera compositions/captions.html a partir de timing.json (python3 build.py plan).

Subtítulos palabra por palabra del conductor, en grupos cortos; las palabras clave van en oro.
El grupo "de ULAMA" no se subtitula: ahí entra el golpe gráfico de ULAMA (cards.html).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
START = 3.233  # inicio de la composición en el video
END = 22.933  # fin (entra "Somos cultura…")

# Tamaño de cada grupo, en orden; None = grupo que no se muestra
GROUPS = [3, 4, 3, 2, 3, 1, 3, 3, 3, 3, 2, (2, None), 4, 2, 1, 4, 2, 2, 3, 3, 1, 3, 2, 2, 3, 1, 4, 2, 3, 4]
KEY = {"nunca", "29", "noviembre", "domingo", "10", "mañana", "exhibición", "pelota", "prehispánico", "taller",
       "familia", "amigos", "tradiciones", "cultura", "mexicana", "parque", "reforma", "social", "esperamos",
       "juego", "partido", "invitar"}


def clean(w):
    return w.strip("¿?,.").lower()


def main():
    p = json.loads((ROOT / "timing.json").read_text())
    words = [w for w in p["words"] if w["t"] < END - 0.05]
    groups, i = [], 0
    for g in GROUPS:
        n, show = (g[0], False) if isinstance(g, tuple) else (g, True)
        groups.append((words[i:i + n], show))
        i += n
    assert i == len(words), (i, len(words))

    html, js = [], []
    for gi, (ws, show) in enumerate(groups):
        t0 = ws[0]["t"] - START
        t1 = (groups[gi + 1][0][0]["t"] - START) if gi + 1 < len(groups) else END - START
        if not show:
            continue
        spans = []
        for w in ws:
            cls = "w k" if clean(w["w"]) in KEY else "w"
            txt = w["w"].replace("¿", "¿").upper().rstrip(",.")
            spans.append(f'<span class="{cls}" data-t="{w["t"] - START:.3f}">{txt}</span>')
        html.append(f'    <div id="cap-{gi}" class="cap">{" ".join(spans)}</div>')
        js.append(f'      ["#cap-{gi}", {max(0.0, t0 - 0.06):.3f}, {t1 - 0.04:.3f}],')

    out = f"""<template>
  <style>
    #root {{
      position: absolute;
      inset: 0;
      font-family: "Poppins", sans-serif;
    }}
    .cap {{
      position: absolute;
      left: 0;
      width: 1080px;
      top: 1250px;
      padding: 0 80px;
      text-align: center;
      font-size: 84px;
      line-height: 1.08;
      font-weight: 900;
      font-style: italic;
      color: #fff;
      opacity: 0;
      visibility: hidden;
      text-shadow: 0 0 3px #140d0a, 0 5px 0 #140d0a, 0 8px 28px rgba(0, 0, 0, 0.65);
    }}
    .cap .w {{
      display: inline-block;
      padding: 0 6px;
    }}
    .cap .w.k {{
      color: #f0b23a;
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
        tl.fromTo(w, {{ opacity: 0, y: 30, scale: 0.7 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.16, ease: "back.out(2.6)" }}, t);
        if (w.classList.contains("k")) {{
          tl.fromTo(w, {{ scale: 1 }}, {{ scale: 1.14, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: false }}, t + 0.16);
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
    print(f"{len(js)} grupos")


if __name__ == "__main__":
    main()

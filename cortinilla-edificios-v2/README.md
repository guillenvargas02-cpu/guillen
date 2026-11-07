# Cortinilla SOMOS · Skyline de Miguel Hidalgo (versión 2)

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. Sin textos y sin la placa rectangular de la versión 1.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–2.05 s | Travelling lateral por el skyline, en un solo plano y con el mismo aire entre edificios: Castillo de Chapultepec · Fuente de Petróleos · Altar a la Patria · Torre del Reloj de Polanco · Auditorio Nacional · Museo Soumaya. Cada edificio brota del suelo, se rellena y se dibujan sus trazos. |
| 1.90–2.50 s | La cámara se aleja y se ve el skyline completo sobre la línea del suelo. |
| 2.42–2.95 s | La ciudad se hunde bajo la línea del suelo, de izquierda a derecha, y desde esa misma línea suben las letras de SOMOS. |
| 3.00–3.32 s | La línea del suelo se recoge hacia el centro. |
| 3.32–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

Sonido: whoosh al alejarse la cámara, whoosh corto al hundirse la ciudad y golpe grave cuando aterrizan las letras (Pixabay, ver `assets/sfx/CREDITS.md`).

## Rehacer

```bash
python3 -I tools/build_scene.py             # escribe compositions/skyline.html (ORDER y GAP definen el skyline)
npm run check
npm run render                              # renders/cortinilla-somos-skyline-v2-4k.mp4
```

Edita `tools/buildings.py` (dibujos) y `tools/skyline.template.html` (línea de tiempo); `compositions/skyline.html` se regenera.

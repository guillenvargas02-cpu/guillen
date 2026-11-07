# Cortinilla SOMOS · Skyline de Miguel Hidalgo

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. Sin textos.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–1.95 s | Travelling lateral por un skyline rosa en dos planos con paralaje: los edificios brotan del suelo, se rellenan y se dibujan sus trazos. Frente: Castillo de Chapultepec, Altar a la Patria, Auditorio Nacional, Museo Soumaya. Fondo: Fuente de Petróleos, Torre del Reloj de Polanco. Sol rosa pálido detrás. |
| 1.78–2.40 s | La cámara se aleja y se ve el skyline completo. |
| 2.40–2.58 s | La silueta del skyline se llena de rosa desde el suelo. |
| 2.58–2.93 s | La silueta se comprime en la placa itálica del logotipo. |
| 2.96–3.38 s | Un filo inclinado corta la placa y deja las letras de SOMOS. |
| 3.38–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

Sonido: whoosh al alejarse la cámara y golpe grave cuando aparece la placa (Pixabay, ver `assets/sfx/CREDITS.md`).

## Archivos

- `tools/buildings.py` — los seis edificios como ilustración vectorial (una función por edificio).
- `tools/build_scene.py` — composición del skyline (`LAYOUT`: posición, plano y escala de cada edificio), cámara precalculada por fotograma, silueta conjunta (potrace) y morph a la placa.
- `tools/skyline.template.html` — la escena y su línea de tiempo; `compositions/skyline.html` se regenera desde aquí.
- `tools/referencias/` — fotos de referencia.

## Rehacer

```bash
python3 -I tools/build_scene.py --preview   # tools/preview.html: cada edificio suelto (requiere pip install potracer pillow numpy)
python3 -I tools/build_scene.py             # escribe compositions/skyline.html
npm run check
npm run render                              # renders/cortinilla-somos-edificios-4k.mp4
```

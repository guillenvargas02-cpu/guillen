# Cortinilla SOMOS · Revelación del logotipo con esferas 3D (versión 2)

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. Solo el logotipo oficial.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–0.40 s | Una esfera rosa cae al centro, se aplasta al tocar el piso y rebota (sombra que crece al acercarse). |
| 0.40–1.70 s | Se divide en 5 esferas que saltan del piso y forman un carrusel 3D que gira 1¼ vueltas: perspectiva real, profundidad de campo (las del fondo se desenfocan) y sombras flotantes. |
| 1.70–2.08 s | El carrusel se aplana en una línea; cada esfera llega al lugar de su letra y la cámara se acerca un poco. |
| 2.08–2.80 s | Cada esfera estalla y revela su letra con un círculo que crece desde su centro, de izquierda a derecha. |
| 2.95–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

Sonido: pop al tocar el piso, whoosh que cresta con el giro, whoosh corto al formarse la línea y golpe al estallar en letras (Pixabay, ver `assets/sfx/CREDITS.md`).

Todo lo que se ve es una función pura del tiempo (`render(t)` en `tools/reveal.template.html`); los tiempos están en `T`, el tamaño del carrusel en `RING`, `BIG` y `PITCH`.

## Rehacer

```bash
python3 -I tools/build_scene.py   # escribe compositions/reveal.html
npm run check
npm run render                    # renders/cortinilla-somos-logo-v2-4k.mp4
```

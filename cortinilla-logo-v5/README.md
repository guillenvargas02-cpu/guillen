# Cortinilla SOMOS · El logotipo se decodifica (versión 5)

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. No empieza con el logotipo: todo lleva hacia él.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–0.35 s | Píxeles rosas de 20 px aparecen parpadeando, dispersos, sobre una retícula digital tenue. |
| 0.36–1.20 s | Cada píxel viaja por la retícula en una trayectoria en "L" (como una señal en un circuito), en pasos de 20 px y con estela, hasta su celda. |
| 1.20–1.36 s | Se forma el logotipo en baja resolución. |
| 1.36–2.46 s | Cuatro pasadas de una línea de escaneo duplican la resolución: 20 → 10 → 5 → 2.5 px → vector nítido. La retícula se apaga. |
| 2.50–2.64 s | Interferencia digital: franjas horizontales desplazadas y un eco; el logotipo se asienta. |
| 2.65–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

La cámara arranca cerca (122 %) y se abre hasta el plano final. Sin motion blur: el movimiento digital en pasos se ve mejor nítido.

Sonido: textura digital mientras viajan los píxeles, un clic en cada pasada de escaneo, glitch en la interferencia y golpe suave al asentarse (Pixabay, ver `assets/sfx/CREDITS.md`).

## Rehacer

```bash
# tools/logo-raster.png: el logotipo rasterizado a 4x (lo genera el paso de rasterizado con Playwright)
python3 -I tools/build_scene.py   # celdas de cada resolución y trayectorias; escribe compositions/decode.html
npm run check
npm run render                    # renders/cortinilla-somos-logo-v5-4k.mp4
```

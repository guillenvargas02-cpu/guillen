# Cortinilla SOMOS · El logotipo estalla y se rearma (versión 4)

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. Solo el logotipo oficial, sin esferas ni gotas.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–0.50 s | El logotipo completo estalla en 24 esquirlas 3D (cortes inclinados con su misma itálica) más astillas sueltas; la cámara se mete en la nube. |
| 0.50–1.55 s | Tiempo casi congelado: las esquirlas quedan suspendidas, giran apenas y la cámara orbita alrededor (bullet time). |
| 1.55–2.20 s | Rebobinado: las piezas regresan aceleradas y encajan de dentro hacia afuera; las astillas sueltas se desvanecen. |
| 2.20 s | Encaje: golpe de cámara y sacudida; el logotipo de una sola pieza reemplaza a las esquirlas. |
| 2.60–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

Sonido: whoosh del estallido, riser que crece durante el tiempo congelado y el rebobinado, y golpe grave en el encaje (Pixabay, ver `assets/sfx/CREDITS.md`).

## Rehacer

```bash
python3 -I tools/build_scene.py   # cortes y trayectorias (COLS, dispersión, giros); escribe compositions/shatter.html
npm run check
npm run render                    # renders/cortinilla-somos-logo-v4-4k.mp4
```

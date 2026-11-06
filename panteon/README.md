# Panteón Dolores de noche — teaser (México Retro)

Teaser vertical (1080×1920, 30 fps, 40 s) del recorrido exclusivo del domingo 15 de noviembre, 5 PM, $200.
Hecho con [HyperFrames](https://hyperframes.heygen.com): cada escena es HTML + GSAP en `compositions/`.

## Estructura (tiempos del video)

| Escena | Tiempo | Contenido |
| --- | --- | --- |
| s01 | 0:00 – 5.2 | Ángel (look noche) · "MR · México Retro presenta" |
| s02 | 5.2 – 7.6 | Negro · "Por primera y única ocasión" |
| s03 | 7.6 – 10.4 | Pasillo de mausoleos · "Cuando cae el sol…" |
| s04 | 10.4 – 12.7 | Estatua doliente + relámpago · "el panteón cuenta otras historias." |
| s05 | 12.7 – 14.9 | Empuje hacia la reja del mausoleo |
| s06 | 14.9 – 16.4 | Negro · "Un recorrido EXCLUSIVO" (golpe) |
| s07 | 16.4 – 18.7 | Rotonda · "por única ocasión, al caer la noche" |
| s08 | 18.7 – 20.9 | Ráfaga: cruces → rostro del ángel en rojo |
| s09 | 20.9 – 21.9 | Corte a negro y silencio, destello subliminal |
| s10 | 21.9 – 26.8 | Título "Panteón Dolores *de noche*" sobre el ángel rojo (como el póster) |
| s11–s13 | 26.8 – 33.6 | Domingo 15 NOV · 5 PM → Cuota $200 → Punto de encuentro |
| s14 | 33.6 – 40.0 | Cupo limitado · Aparta tu lugar por DM · cierre MR |

## Look y sonido

- Color: `data-color-grading` en cada `<video>` (editable con `npx hyperframes media-treatment`).
  *Noche* = día convertido en noche fría, negros profundos, viñeta, grano y polvo de película.
  *Sangre* = monocromo rojo del póster.
- Música: la pista entregada, dos tramos (0–20.9 s y el clímax final desde 1:30.3) separados por
  un segundo de silencio. Efectos (golpes graves, succión inversa, eco del corte) diseñados en
  `build.py` a partir de la librería de HyperFrames (Pixabay Content License).

## Reconstruir

```bash
python3 build.py footage audio   # clips 480p → 1080×1920 con cámara lenta interpolada; efectos
npx hyperframes preview          # editar en el navegador
npx hyperframes render --fps 30 --quality delivery -o renders/render.mp4
python3 build.py master          # audio a -14 LUFS → renders/panteon-dolores-teaser.mp4
```

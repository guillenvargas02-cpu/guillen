# Cortinilla SOMOS · Miguel Hidalgo

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–1.30 s | Toma aérea en perspectiva: se trazan en rosa los límites de las 16 alcaldías de la CDMX; Miguel Hidalgo se ilumina de rosa con ondas y anillos cartográficos. |
| 1.25–2.03 s | La cámara se clava en Miguel Hidalgo; el resto de la ciudad se disuelve. |
| 2.03–2.48 s | La silueta real de la alcaldía se transforma (morph punto a punto) en una placa itálica con la inclinación del logotipo. |
| 2.52–2.95 s | Un filo inclinado corta la placa y deja las letras de SOMOS. |
| 2.95–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco, como pide el manual de identidad 2026. |

Sonido: whoosh en el clavado de cámara y golpe grave cuando aparece la placa (Pixabay, ver `assets/sfx/CREDITS.md`).

## Fuentes

- Límites de alcaldías: INEGI, Marco Geoestadístico 2023 (vía PhantomInsights/mexico-geojson), en `tools/cdmx-alcaldias.json`.
- Logotipo: vectorizado con potrace de la referencia oficial (`tools/somos-ref.webp`) → `assets/brand/somos.svg`.
- Tipografía de textos: Hind Siliguri (tipografía secundaria del manual), SIL OFL.

## Rehacer

```bash
python3 -I tools/build_assets.py   # vectores (requiere: pip install potracer pillow numpy)
python3 -I tools/build_scene.py    # escribe compositions/intro.html desde tools/intro.template.html
npm run check
npm run render                     # renders/cortinilla-somos-miguel-hidalgo-4k.mp4
```

Edita `tools/intro.template.html` (no `compositions/intro.html`, que se regenera).

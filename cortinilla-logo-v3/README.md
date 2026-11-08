# Cortinilla SOMOS · El líquido se solidifica en el logotipo (versión 3)

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. Solo el logotipo oficial.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–0.38 s | Dos gotas rosas entran desde los lados acelerando y chocan en el centro: se funden en una sola masa. |
| 0.38–0.90 s | Salpicadura: gotitas salen disparadas del choque y regresan a la masa. |
| 0.60–1.45 s | La masa se divide en 5 gotas que giran en espiral, uniéndose y separándose como mercurio. |
| 1.45–2.05 s | Las gotas se alinean y se funden en una barra líquida ondulante del ancho del logotipo. |
| 2.05–2.60 s | El líquido se condensa en las letras de SOMOS y se va afilando hasta quedar nítido. |
| 2.70–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

El efecto líquido es un filtro SVG "gooey" (desenfoque + umbral de alfa). Al final el desenfoque baja casi a cero y el logotipo nítido entra encima. La cámara arranca cerca y girada (-4°) y se abre hasta el plano final.

Sonido: whoosh de las gotas que entran, pop del choque, whoosh largo con el giro, whoosh corto al formarse la barra y golpe al solidificarse (Pixabay, ver `assets/sfx/CREDITS.md`).

## Rehacer

```bash
python3 -I tools/build_scene.py   # escribe compositions/liquid.html desde tools/liquid.template.html
npm run check
npm run render                    # renders/cortinilla-somos-logo-v3-4k.mp4
```

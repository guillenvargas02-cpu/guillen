# Teaser · Leyendas y Crímenes famosos del Centro Histórico

35 s · vertical 2160×3840 (4K) · 30 fps · H.264 + AAC 48 kHz (-14 LUFS)

## Estructura (segundos)
| t | escena | dato |
|---|---|---|
| 0–3 | apertura: máquina de escribir «Hay calles que no olvidan...» sobre la estatua en rojo | |
| 3–7 | título LEYENDAS / y crímenes / FAMOSOS (golpe de la música) | Centro Histórico de la CDMX |
| 7–9.5 | Donceles | **Sábado 21 de noviembre** |
| 9.5–15 | Joaquín Dongo: placa, máquina de escribir, «11 víctimas», grabado | |
| 15–19 | La mujer herrada (1670): herraduras = dos golpes metálicos | |
| 19–21 | Teatro de la Ciudad + campana | **Plaza de Santo Domingo (frente al templo)** |
| 21–25 | Teatro Fru Fru 1975: neón que falla, polaroid con flash | |
| 25–28 | El Caballito | **5:00 PM · 3 horas** |
| 28–31 | cintas de escena del crimen, sello | **$200 por persona** · ¿te atreves? |
| 31–35 | e-card (segundo golpe de la música) | **Aparta tu lugar por DM** |

## Audio
- `assets/audio/crimen.m4a` — pulso principal, cortado 29→52 s + 56→68 s para que sus dos golpes caigan en el título (3 s) y la e-card (31 s).
- `assets/audio/atmosfera_2.m4a` — drone creciente de fondo (desde 62 s).
- `assets/audio/atmosfera_1.m4a` — impactos (1.5, 17, 52, 64.4 s) y crescendo 70→76.75 s que remata en la e-card.
- Efectos sintetizados en `build.py` (teclas, retorno y campanilla de máquina de escribir, golpes, herraduras, campana, reloj, flash, glitch, papel, recortes) — sus tiempos salen de la línea de tiempo de `index.html`.

## Render
```bash
python3 build.py base          # footage con gradación de terror, 4K
node render.mjs                # capa gráfica (index.html + GSAP) → renders/overlay/*.png
python3 build.py audio final   # mezcla + composición → renders/leyendas-crimenes-teaser-4k.mp4
```
Prueba rápida: `node render.mjs --scale 0.5 --at 3.2,12.4 --out renders/snap && python3 build.py sheet`.

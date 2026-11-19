# Teaser SOMOS — programa de entrevistas

Teaser vertical 4K (2160×3840, 30 fps, 28.8 s) con estética oscura y misteriosa. Abre y cierra como una TV vieja.

## Estructura (segundos)
| Tiempo | Qué pasa | Audio |
|---|---|---|
| 0.0 – 2.4 | Negro → un punto de luz calienta → se estira en una línea que se tensa en el silencio | clic, "bwong" de desmagnetizado, whine |
| 2.4 | **Encendido**: en el drop la línea se abre a la imagen (reverso exacto del apagado final) | impacto + chispazo |
| 2.4 – 23.0 | Montaje de 18 encuadres distintos (0.8–1.5 s), cada momento usado una sola vez, cortes en los golpes (152 BPM). Transiciones limpias: corte, flash, acercamiento, fuga de luz | acentos discretos |
| 23.0 – 26.2 | Línea de luz → cuadro aparte **MUY PRONTO** → silencio | grave en Re |
| 26.2 – 28.3 | **SOMOS en solitario** sobre blanco (uso oficial), letras en cascada | acorde Re–La, ticks, destello |
| 28.3 – 28.8 | **Apagado**: la imagen se comprime en una línea y un punto, como TV vieja | whine + pop eléctrico |

Marca (Manual de identidad 2026): rosa cívico #E4007C; logo vectorial extraído del manual;
logo rosa sobre blanco (uso oficial); nunca blanco sobre rosa ni el logo rotado/recoloreado. Texto: Hind Siliguri
(secundaria); "MUY PRONTO" en blanco/negro.

Música: propuesta 3 (152 BPM): tramo 74.87–97.87 s (drop en 77.27 s) y tramo 124.17 s→ (golpe en 127.37 s). Material: 13 tomas del set (B = IMG_8114 solo la parte de la pantalla).

## Render
```bash
bash mezz.sh                  # material → intermedios 4K SDR (HLG de iPhone con tonemap)
python3 teaser.py slots            # extrae los fragmentos del EDL
python3 sfx.py                     # diseño sonoro + mezcla (-14 LUFS)
python3 teaser.py render           # video 4K (TEASER_PREVIEW=1 para 1080p)
```
El EDL (tomas, entradas, transiciones) está al inicio de `teaser.py`.

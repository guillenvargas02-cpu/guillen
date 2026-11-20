# Teaser SOMOS — programa de entrevistas

Teaser vertical 4K (2160×3840, 30 fps, 27.6 s) con estética oscura y misteriosa. Abre y cierra como una TV vieja.

## Estructura (segundos)
| Tiempo | Qué pasa | Audio |
|---|---|---|
| 0.0 – 1.2 | Negro → punto de luz → se dispara en una línea que se tensa en el silencio | golpe grave, ping en Re–La, aire |
| 1.2 | **Encendido**: en el drop la línea se abre a la imagen (el conductor escribe sus notas) | impacto + chispazo |
| 1.2 – 21.8 | Montaje de 18 encuadres distintos, cortes en los golpes (152 BPM). Frases alternadas (una toma sí, otra no): **HISTORIAS**, **ANÉCDOTAS**, **RAÍCES**, **DETRÁS DEL NOMBRE**, **ENTRE RISAS Y RECUERDOS** y el lema **LA CONVERSACIÓN QUE EMPIEZA / DONDE OTRAS TERMINAN**. Las tomas de la pantalla van sin texto | acento grave en cada frase |
| 21.8 – 25.0 | Línea de luz → cuadro aparte **MUY PRONTO**; el logo de **YouTube** se enciende arriba como una pantallita (punto → línea → se abre) y se apaga con el texto | ping suave |
| 25.0 – 27.1 | **SOMOS en solitario** sobre blanco (uso oficial), letras en cascada | acorde Re–La, ticks, destello |
| 27.1 – 27.6 | **Apagado**: la imagen se comprime en una línea y un punto | whine + pop eléctrico |

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

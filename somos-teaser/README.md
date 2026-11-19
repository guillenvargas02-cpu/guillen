# Teaser SOMOS — programa de entrevistas

Teaser vertical 4K (2160×3840, 30 fps, ~30 s) con estética oscura y misteriosa.

## Estructura (segundos)
| Tiempo | Qué pasa | Audio |
|---|---|---|
| 0.0 – 3.57 | Plató a oscuras; todos los reflectores encienden juntos; claqueta grande (blanco/negro, solo SOMOS) se abre y espera en el silencio | clunk + zumbido de balastro |
| 3.57 | **Hook**: la claqueta cierra en el drop y cortamos directo al material | claqueta + impacto |
| 3.57 – 24.17 | Montaje de 23 tomas, cada momento usado una sola vez, cortes en los golpes (152 BPM), se acelera al final. Transiciones limpias: corte, flash, acercamiento, fuga de luz | acentos discretos |
| 24.17 – 27.37 | Línea de luz → cuadro aparte **MUY PRONTO** → silencio | grave en Re |
| 27.37 – 29.47 | **SOMOS en solitario** sobre blanco (uso oficial), letras en cascada | acorde Re–La, ticks, destello |
| 29.47 – 29.93 | Salida: se apaga como televisor viejo | whine + pop eléctrico |

Marca (Manual de identidad 2026): rosa cívico #E4007C; logo vectorial extraído del manual; sobre fondo oscuro se usa la
pleca blanca (pág. 16–17, 57); nunca blanco sobre rosa ni el logo rotado/recoloreado. Texto: Hind Siliguri
(secundaria); "MUY PRONTO" en blanco/negro.

Música: propuesta 3 (152 BPM): tramo 73.70–97.87 s y tramo 124.17 s→ (golpe en 127.37 s). Material: 10 tomas del set (B = IMG_8114 solo la parte de la pantalla).

## Render
```bash
bash mezz.sh                  # material → intermedios 4K SDR (HLG de iPhone con tonemap)
python3 teaser.py slots            # extrae los fragmentos del EDL
python3 sfx.py                     # diseño sonoro + mezcla (-14 LUFS)
python3 teaser.py render           # video 4K (TEASER_PREVIEW=1 para 1080p)
```
El EDL (tomas, entradas, transiciones) está al inicio de `teaser.py`.

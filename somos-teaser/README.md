# Teaser SOMOS — programa de entrevistas

Teaser vertical 4K (2160×3840, 30 fps, 35 s) con estética oscura y misteriosa.

## Estructura (segundos)
| Tiempo | Qué pasa | Audio |
|---|---|---|
| 0.0 – 5.5 | Plató a oscuras; 3 reflectores de tungsteno viejos se encienden en los golpes de la música | clunk de breaker + zumbido de balastro |
| 5.5 | **Hook**: la claqueta (blanco/negro, solo SOMOS en la pizarra) corta; cae y la pleca SOMOS avanza al centro con un corte de luz anamórfico | claqueta de madera + impacto |
| 6.8 – 7.2 | Entramos atravesando la primera **O** de SOMOS | whoosh |
| 7.2 – 19.0 | Montaje 1 al compás (cortes 1.72 / 0.86 s, redoble de 0.21 s), cortinilla con la pleca | whooshes, zaps |
| 19.0 – 22.4 | Quiebre: cámara lenta, oscuro (invitado tras cámara → pantalla del switcher) | risas lejanas filtradas |
| 22.4 – 30.3 | Montaje 2: escalada, estrobo con la pleca en el golpe fuerte | |
| 30.3 – 32.5 | Línea de luz → cuadro aparte **MUY PRONTO** (suspenso) | riser, grave en Fa |
| 32.5 – 34.5 | **SOMOS en solitario** sobre blanco (uso oficial), letras en cascada | acorde Fa–Do, ticks, destello |
| 34.55 – 35.0 | Salida: se apaga como televisor viejo | whine + pop eléctrico |

Marca (Manual de identidad 2026): rosa cívico #E4007C; logo vectorial extraído del manual; sobre fondo oscuro se usa la
pleca blanca (pág. 16–17, 57); nunca blanco sobre rosa ni el logo rotado/recoloreado. Texto: Hind Siliguri
(secundaria); "MUY PRONTO" en blanco/negro.

Música: propuesta 1 (desde 2.30 s). Material: 10 tomas del set (B = IMG_8114 solo la parte de la pantalla).

## Render
```bash
bash mezz.sh                  # material → intermedios 4K SDR (HLG de iPhone con tonemap)
python3 teaser.py slots            # extrae los fragmentos del EDL
python3 sfx.py                     # diseño sonoro + mezcla (-14 LUFS)
python3 teaser.py render           # video 4K (TEASER_PREVIEW=1 para 1080p)
```
El EDL (tomas, entradas, transiciones) está al inicio de `teaser.py`.

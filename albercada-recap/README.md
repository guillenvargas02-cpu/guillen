# Albercada SOMOS — recap (vertical 4K, 44 s)

| Tiempo | Qué pasa |
|---|---|
| 0.00–4.44 | Cortinilla: pleca SOMOS sobre rosa → crece a blanco → tomas del evento cada vez más rápidas con "ALBERCADA · 1ª edición · Polanco, Miguel Hidalgo" → franjas diagonales |
| 4.44 | Drop 1 de la canción: entra la voz ("Oigan, les quiero platicar…") con subtítulos (palabras clave en pleca) |
| 7.7–15.5 | Tomas de apoyo del evento; invitación (e-card), pleca SOMOS, insignia "1ª edición", ubicación |
| 16.9–22.1 | La nota de InfoPoder: entra en 3D, titular subrayado, zoom a la foto (obturador) |
| 22.6–26.7 | Ráfaga de fotos en el beat ("Así lo vivimos"), foto final a pantalla completa |
| 26.7–31.1 | Pausa de la canción: "para que la próxima edición… puedan acompañarnos" (Próxima edición · ¡Muy pronto!) |
| 31.1–36.7 | Drop 2: SOMOS diversión · albercada · amigos · el futuro · México (una frase cada 2 beats) |
| 36.7–40.0 | Juego con el logo: SOMOS amigos / jóvenes / diversión / futuro / México → "Entre amigos, SOMOS más" |
| 40.0–44.0 | La pleca crece a blanco: logo SOMOS + "La fuerza que nos une" |

Música: propuesta 3 (108 BPM), empalmada en compás. Color: HDR del iPhone convertido a SDR con un ajuste natural.
Logo y lema vectoriales tomados del manual de identidad (rosa cívico #E4007C).

```bash
python3 build.py base sfx audio captions        # video base, efectos, mezcla y subtítulos
npm run render                                  # capa gráfica 4K (png-sequence RGBA) → renders/overlay
python3 build.py final                          # → renders/albercada-somos-recap-4k.mp4
```
`python3 build.py clips` recorta las tomas del evento desde los originales (`EVENT_SRC=<carpeta>`).
Requiere ffmpeg con zscale, numpy y Node (hyperframes 0.8.209).

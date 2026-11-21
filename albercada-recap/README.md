# Albercada SOMOS — recap (vertical 4K, 35.6 s)

| Tiempo | Qué pasa |
|---|---|
| 0.00–4.44 | Cortinilla: pleca SOMOS sobre rosa → crece a blanco → tres tomas del evento con "ALBERCADA · 1ª edición" → franjas diagonales |
| 4.44 | Drop 1 de la canción: entra la voz ("Oigan, les quiero platicar…") con subtítulos (palabras clave en pleca) |
| 8.0–15.5 | La invitación entra en "albercada"; dos tomas de apoyo del evento |
| 17.15 | "un par de notas": sale la nota (sin zoom ni textos extra) |
| 19.45 | "un par de fotos": salen 4 fotos (una cada 2 beats, con su efecto) y la foto protagonista a pantalla completa |
| 24.45–28.9 | Pausa de la canción: "para que la próxima edición… puedan acompañarnos" |
| 28.89 | Drop 2: cierre con el video 2 corrido ("Somos amigos, somos el futuro, y somos México") |
| 30.97 | "…somos México": cortinilla blanca y el logo SOMOS se arma letra por letra |

La persona siempre va en sincronía con su voz: cada toma suya se amarra al mismo tramo de audio y
todos los cortes caen en cuadros exactos (30 fps).

Música: propuesta 3 (108 BPM), empalmada en compás. Color: HDR del iPhone convertido a SDR con un ajuste natural.
Logo y lema vectoriales tomados del manual de identidad (rosa cívico #E4007C).

```bash
python3 build.py base sfx audio captions        # video base, efectos, mezcla y subtítulos
npm run render                                  # capa gráfica 4K (png-sequence RGBA) → renders/overlay
python3 build.py final                          # → renders/albercada-somos-recap-4k.mp4
```
`python3 build.py clips` recorta las tomas del evento desde los originales (`EVENT_SRC=<carpeta>`).
Requiere ffmpeg con zscale, numpy y Node (hyperframes 0.8.209).

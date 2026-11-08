# Cortinilla SOMOS · Hook con el logotipo

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. Solo el logotipo oficial.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–1.32 s | Montaje macro: cortes rápidos sobre acercamientos extremos de las letras (curva de la S, diagonal de la M, la última S, plano medio de "SOMO"). Cada toma entra rápido, frena y sale acelerando: el corte cae en el punto más veloz, como un barrido de cámara. Destello rosa de dos fotogramas en 1.02 s. |
| 1.32–1.85 s | La cámara se mete por el hueco blanco de la segunda O hasta llenar la pantalla de blanco. |
| 1.85–2.35 s | Del otro lado, el logotipo completo viene desde el fondo hacia la cámara, con líneas de velocidad radiales. |
| 2.35–2.80 s | Impacto: el logotipo se asienta, la cámara tiembla y su contorno hace eco hacia afuera. |
| 2.80–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

Sonido: whooshes en los cortes del montaje, whoosh largo al entrar a la O y golpe con crescendo en el impacto (Pixabay, ver `assets/sfx/CREDITS.md`).

## Rehacer

```bash
python3 -I tools/build_scene.py   # escribe compositions/hook.html desde tools/hook.template.html
npm run check
npm run render                    # renders/cortinilla-somos-logo-4k.mp4
```

Los encuadres del montaje están en `tools/hook.template.html` (`shot(inicio, fin, punto del logo, escala, giro, dirección, ...)`).

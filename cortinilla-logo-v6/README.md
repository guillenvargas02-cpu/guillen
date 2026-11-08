# Cortinilla SOMOS · Código binario que se compila en el logotipo (versión 6)

Intro vertical de 4 s (2160×3840, 60 fps) hecha con HyperFrames. No empieza con el logotipo: todo lleva hacia él.

| Tiempo | Qué pasa |
| --- | --- |
| 0.00–1.00 s | La cámara avanza girando a través de tres capas de lluvia de código binario (lejana pequeña y lenta, cercana grande y rápida); los dígitos cambian de valor sin parar. |
| 1.00–1.70 s | La lluvia se acelera con estelas y se desvanece; 560 dígitos caen y aterrizan en su celda formando SOMOS escrito en 0 y 1. La cámara se abre de golpe para revelarlo. |
| 1.70–2.00 s | El logotipo de código parpadea; sus valores cambian cada vez más lento. |
| 2.00–2.32 s | Compilación: desde el centro hacia afuera, en onda, cada dígito se vuelve un bloque sólido. |
| 2.32 s | Los bloques se funden en el logotipo vectorial nítido, con golpe de cámara. |
| 2.45–4.00 s | Logotipo oficial quieto: rosa cívico `#E4007C` sobre blanco (manual de identidad 2026). |

Se dibuja en `<canvas>` (miles de dígitos por fotograma) a la resolución del render; todo es una función pura del tiempo. Tipografía de los dígitos: JetBrains Mono Bold (incluida en HyperFrames).

Sonido: ráfaga de tecleo durante la lluvia, whoosh al abrirse la cámara, glitch en la compilación y golpe al fundirse en el logotipo (Pixabay, ver `assets/sfx/CREDITS.md`).

## Rehacer

```bash
python3 -I tools/build_scene.py   # celdas del logotipo y caídas; escribe compositions/binary.html
npm run check
npm run render                    # renders/cortinilla-somos-logo-v6-4k.mp4
```

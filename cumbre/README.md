# Cumbre México — highlights 4K

Video vertical 2160x3840, 30 fps, 34.5 s. Música: opción de audio 1 (120 BPM), editada en frase.

Pasos:

1. `python3 logo_layers.py <dir>` — separa el logo (escalado x4 con Real-ESRGAN) en capas RGBA.
2. `python3 sr_job.py <scratch> <uploads>` — reescala x4 con Real-ESRGAN los frames de WhatsApp que usa el corte.
3. `python3 render.py cache` — extrae los frames 8K del corte.
4. `python3 render.py video [desde] [hasta]` — render por tramos (FFV1 sin pérdida).
5. `python3 audio.py` — música + diseño sonoro + click.
6. `./mux.sh` — MP4 final (H.264 High, 4K, AAC 320k).

Estructura:

- 0.0–3.0 s: caret dorado → línea de escaneo → el emblema "se genera" desde mosaico/ruido, los arcos verde y
  rojo se dibujan como anillo de carga, el texto se teclea con caret; entra el cursor.
- 3.0 s: click (sonido del usuario) sobre el golpe de la música; el círculo del emblema se vuelve portal.
- 4.0 s: drop; salón lleno a pantalla completa.
- 5.5–34.0 s: el ponente (planos de inicio, desarrollo y cierre) intercalado con el salón lleno; cortes en beat.
- 31.5–34.5 s: cierre limpio con el ponente sonriendo y fundido a negro con el decaimiento de la música.

Ningún frame de las fuentes se repite (`check_no_repeats()` lo verifica antes de cada render); las tomas
no llevan audio, solo música.

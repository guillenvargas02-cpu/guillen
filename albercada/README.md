# Albercada · Somos Impacto — video recap (9:16)

Todo el video se arma con `build.py` (numpy + OpenCV + ffmpeg), cuadro por cuadro:

| Tiempo | Qué pasa |
|---|---|
| 0.00–2.04 | Alberca turquesa; pelota de playa blanca rebota en los golpes del build-up de la canción |
| 2.04 | Golpe del coro (0:48.04 de la canción): la pelota se estrella contra la pantalla → blanco → logo SOMOS |
| 3.06–3.57 | Zoom a través de la "O" de SOMOS hacia la primera toma |
| 3.6–28.5 | 24 tomas en los beats (118 BPM): "Albercada · así lo vivimos", "Compartimos.", "Platicamos.", "Construimos." |
| 28.5–31.5 | "Entre amigos, SOMOS más" → se van las palabras, la pleca crece a pantalla completa |
| 31.5–34.0 | Logo SOMOS oficial (rosa cívico sobre blanco) al centro |

Canción: `assets/cancion.m4a` desde 0:46.00 (34 s, normalizada a −14 LUFS).
Tipografías: Poppins ExtraBold Italic (como la e-card) y Hind Siliguri (secundaria del manual), OFL.

```bash
python3 build.py preview   # 540x960 rápido → renders/preview.mp4
python3 build.py final     # 2160x3840 (4K) → renders/albercada-somos-4k.mp4
python3 build.py stills 2.0 3.4 30.7   # cuadros sueltos para revisar
```

Requiere: ffmpeg, `pip install numpy opencv-python-headless pillow`.

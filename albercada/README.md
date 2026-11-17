# Albercada · Somos Impacto — video recap (9:16)

Todo el video se arma con `build.py` (numpy + OpenCV + ffmpeg), cuadro por cuadro:

| Tiempo | Qué pasa |
|---|---|
| 0.00–2.04 | Alberca turquesa; flotador blanco con SOMOS cae al agua y flota; Somos Impacto debajo |
| 2.04–2.64 | Golpe del coro (0:48.04): splash de agua que abre a la primera toma |
| 2.6–28 | 24 tomas en los beats (118 BPM): "Albercada · así lo vivimos", "Compartimos.", "No pudo faltar la pizza", "Conversamos.", "Nos divertimos." |
| 28–31.3 | "Entre amigos, SOMOS más" → se van las palabras, la pleca crece a pantalla completa |
| 31.3–34.0 | Logo SOMOS oficial (rosa cívico sobre blanco) al centro |

Canción: `assets/cancion.m4a` desde 0:46.00 (34 s, normalizada a −14 LUFS).
Tipografías: Poppins ExtraBold Italic (como la e-card) y Hind Siliguri (secundaria del manual), OFL.

```bash
python3 build.py preview   # 540x960 rápido → renders/preview.mp4
python3 build.py final     # 2160x3840 (4K) → renders/albercada-somos-4k.mp4
python3 build.py stills 2.0 3.4 30.7   # cuadros sueltos para revisar
```

Requiere: ffmpeg, `pip install numpy opencv-python-headless pillow`.

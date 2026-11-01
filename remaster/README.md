# Remaster 4K vertical — videos de automovilismo (31-oct-2026)

`remaster.sh ORIGINAL.mp4 SALIDA_4K.mp4`

- Resolución: 720×1280 → **2160×3840 (4K UHD vertical)**, mismo encuadre (sin recortes ni zoom).
- Mismos cuadros y mismos tiempos (60 fps, `-fps_mode passthrough`), misma duración.
- Audio copiado sin recomprimir (bit a bit idéntico al original).
- Colores sin cambios (BT.709, rango TV; promedios Y/U/V verificados contra el original).
- Mejora: limpieza espacial ligera de artefactos de compresión (hqdn3d), escalado Lanczos
  en 16 bits con croma completo, nitidez adaptativa (CAS 0.5), H.264 High@5.2 CRF 14.

Se probó superresolución por IA (Real-ESRGAN general x4v3) y se descartó: en este material
comprimido por WhatsApp inventaba trazos y deformaba al público y las rejas, es decir,
alteraba el contenido.

Los MP4 resultantes no se versionan (superan el límite de 100 MB de GitHub).

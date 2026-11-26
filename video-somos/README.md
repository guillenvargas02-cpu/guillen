# Video SOMOS — firma

Edición 9:16 en 4K (2160×3840, 30 fps) del video del vocero con cortinillas de logo, subtítulos y animación de firma.

## Pipeline
1. `python3 tx.py work/main.wav large-v3 work/words.json` — transcripción con tiempos por palabra (faster-whisper).
2. Voz limpia: DeepFilterNet3 (`atten_lim_db=18`) sobre `work/main48.wav` → `work/voice_df_lim18.wav`.
3. `node render.js <intro|phone|outro> render/<modo> 30 <ini> <fin> 2 [subcuadros]` — capas animadas (`anim/index.html`, logo vectorial del manual en `anim/brand.js`).
4. `python3 mix.py` — voz + música (desde el drop en 107.73 s) + efectos → `work/mix_final.wav` (−14 LUFS, −1 dBTP).
5. `python3 compose.py final` — composición y codificación H.264 (CRF 13, bt709).

La edición (cortes, zooms, tiempos) vive en `timeline.py`.

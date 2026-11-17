#!/usr/bin/env python3
"""Genera la voz guía del tutorial (Kokoro-82M, voz ef_dora, acento latinoamericano es-419).

Cada línea se guarda como assets/voz/NN.wav y las duraciones en assets/voz/tiempos.json,
que sirven para fijar los data-start de index.html.

Uso (necesita un venv con kokoro-onnx y soundfile; el modelo lo baja `hyperframes tts`):
  VENV_PY=/ruta/venv/bin/python  $VENV_PY -I voz.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets" / "voz"
CACHE = Path.home() / ".cache" / "hyperframes" / "tts"
VOICE, LANG, SPEED = "ef_dora", "es-419", 0.95

# El texto va escrito "como suena" (guátsap, ine, ce de eme equis) para que la pronunciación sea natural.
LINES = [
    ("intro", "Así se recolectan las firmas, paso a paso, desde tu celular."),
    ("enlace", "Paso uno. Abre el enlace oficial que te compartimos por guátsap."),
    ("pantalla", "Verás esta pantalla. Los datos de Eduardo ya vienen precargados: no los modifiques. Solo completa dos campos."),
    ("celular", "En el primero, escribe el número de celular: cincuenta y cinco, once, doce, veintitrés, cero cinco."),
    ("contrasena", "En el segundo, la contraseña: Berlin veintisiete. Con be mayúscula, sin espacios, y el veintisiete con números."),
    ("boton", "Después, toca el botón rosa: Confirmar y entrar al canal."),
    ("scroll", "Ya dentro, desliza la pantalla hasta abajo, hasta el apartado Enlace de invitación."),
    ("compartir", "Ahí, toca Compartir vía guátsap, y envíalo al número de la persona que nos dará su firma."),
    ("recomendacion", "Te recomendamos que la persona lo abra desde su propio celular."),
    ("mensaje", "La persona recibirá este mensaje de invitación. Solo tiene que tocar el enlace."),
    ("invitacion", "Al abrirlo, verá la invitación a Somos México, ce de eme equis. Debe tocar Comenzar."),
    ("cuestionario", "Primero, contestará un breve cuestionario. Puede elegir cualquiera de los cinco niveles de participación: el nivel no afecta la firma."),
    ("temas", "También elegirá cómo le gustaría participar, y sus temas de interés."),
    ("ine", "Después pasará a la identificación: tomará una foto de su credencial ine, y completará sus datos de registro y su número de celular."),
    ("firma", "Por último, se tomará una fotografía, y hará su firma, lo más parecida posible a la de su ine."),
    ("cierre", "¡Y listo! Su firma queda registrada. Gracias por sumar."),
]


def trim(a, sr, thr=0.008, pad=0.06):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s, e = max(0, idx[0] - int(pad * sr)), min(len(a), idx[-1] + int(pad * sr))
    return a[s:e]


def main():
    k = Kokoro(str(CACHE / "models" / "kokoro-v1.0.onnx"), str(CACHE / "voices" / "voices-v1.0.bin"))
    OUT.mkdir(parents=True, exist_ok=True)
    tiempos = {}
    for i, (key, text) in enumerate(LINES):
        audio, sr = k.create(text, voice=VOICE, speed=SPEED, lang=LANG)
        audio = trim(np.asarray(audio, dtype=np.float32), sr)
        name = f"{i:02d}_{key}.wav"
        sf.write(OUT / name, audio, sr)
        tiempos[key] = {"file": name, "dur": round(len(audio) / sr, 3), "text": text}
        print(f"{name:24s} {len(audio) / sr:5.2f}s")
    (OUT / "tiempos.json").write_text(json.dumps(tiempos, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

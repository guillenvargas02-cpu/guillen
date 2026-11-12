#!/usr/bin/env python3
"""Video "Favor de leer antes de opinar" — Día Nacional del Libro (vertical 4K).

Pasos:
  python3 build.py prep        # recorta/escala los clips a 4K con corrección de color -> assets/v/*.mp4
  python3 build.py audio       # mezcla voz + música (con ducking) + efectos -> assets/mix.wav
  npx hyperframes render --resolution portrait-4k --crf 12 -o renders/raw.mp4
  python3 build.py final       # une el render con la mezcla -> renders/video-favor-de-leer-4k.mp4

La línea de tiempo (EDL) y los subtítulos se definen aquí y se escriben en assets/timeline.js,
que lee index.html.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
SR = 48000

INTRO = 4.0  # la animación del libro (hook)
# (clip, entrada, salida) en segundos del archivo original; cortes en silencios, sin perder palabras
CLIPS = [("c1", 0.70, 8.40), ("c2", 0.20, 8.10), ("c3", 0.55, 7.45), ("c4", 0.15, 9.85), ("c5", 0.15, 20.55)]
OUTRO = 5.8  # cortinilla "12 de noviembre · Día Nacional del Libro"
MUSIC_DROP = 42.69  # golpe de la canción; cae justo en "Gandhi"


def timeline():
    t = INTRO
    segs = []
    for c, a, b in CLIPS:
        segs.append({"clip": c, "src_in": a, "src_out": b, "start": round(t, 3), "dur": round(b - a, 3)})
        t += b - a
    return segs, round(t, 3), round(t + OUTRO, 3)


# Palabras con tiempos (Parakeet, segundos del clip original) y texto corregido a mano.
WORDS = {
    "c1": [("¿Qué", .80, .92), ("tal?", .92, 1.04), ("¿Cómo", 1.04, 1.2), ("están,", 1.2, 1.44), ("amigas", 1.44, 1.76), ("y", 1.76, 1.84), ("amigos?", 1.84, 2.08),
           ("Los", 2.08, 2.16), ("saluda", 2.24, 2.4), ("Eduardo", 2.56, 2.96), ("Contró.", 2.96, 3.52), ("Y", 3.7, 3.9), ("hoy,", 4.1, 4.6), ("que", 5.15, 5.28),
           ("es", 5.28, 5.36), ("el", 5.36, 5.44), ("día", 5.44, 5.68), ("del", 5.68, 5.84), ("libro,", 5.84, 6.3), ("les", 6.57, 6.72), ("quiero", 6.72, 6.96),
           ("compartir", 6.96, 7.44), ("una", 7.44, 7.6), ("gran", 7.6, 7.84), ("noticia.", 7.84, 8.3)],
    "c2": [("Como", .5, .56), ("muchos", .56, .88), ("de", .88, .96), ("ustedes", .96, 1.28), ("saben,", 1.28, 1.7), ("publicamos", 1.8, 2.32), ("hace", 2.48, 2.64),
           ("un", 2.64, 2.72), ("par", 2.72, 2.88), ("de", 2.88, 2.96), ("años", 2.96, 3.28), ("un", 3.28, 3.36), ("libro", 3.36, 3.6), ("que", 3.6, 3.76), ("se", 3.76, 3.84),
           ("llama", 3.84, 4.3), ("Favor", 4.5, 4.8), ("de", 4.8, 4.96), ("leer", 4.96, 5.28), ("antes", 5.28, 5.44), ("de", 5.44, 5.6), ("opinar.", 5.6, 6.0),
           ("El", 6.16, 6.32), ("ABC", 6.32, 6.72), ("de", 6.8, 6.88), ("la", 6.96, 7.12), ("política", 7.12, 7.44), ("mexicana.", 7.44, 7.9)],
    "c3": [("Y", .64, .72), ("les", .96, 1.2), ("quiero", 1.2, 1.6), ("compartir", 1.6, 2.08), ("con", 2.08, 2.24), ("mucho", 2.24, 2.48), ("entusiasmo", 2.48, 3.04),
           ("que", 3.04, 3.28), ("Gandhi", 3.28, 3.76), ("acaba", 3.92, 4.24), ("de", 4.24, 4.4), ("aceptar", 4.4, 4.88), ("distribuir", 4.88, 5.52), ("este", 5.52, 5.76),
           ("libro", 5.76, 6.03), ("a", 6.4, 6.46), ("nivel", 6.46, 6.8), ("nacional.", 6.8, 7.2)],
    "c4": [("Entonces", .43, .7), ("estamos", .72, .96), ("muy", .96, 1.12), ("contentos,", 1.12, 1.76), ("estamos", 1.76, 2.0), ("de", 2.0, 2.16), ("fiesta,", 2.16, 2.56),
           ("porque", 2.56, 2.8), ("vamos", 2.8, 3.04), ("a", 3.04, 3.12), ("tener", 3.12, 3.44), ("varias", 3.44, 3.76), ("presentaciones", 3.76, 4.24), ("de", 4.24, 4.4),
           ("libros,", 4.4, 4.72), ("sobre", 4.72, 4.88), ("todo", 4.88, 5.04), ("aquí", 5.04, 5.2), ("en", 5.2, 5.28), ("Miguel", 5.28, 5.52), ("Hidalgo", 5.6, 6.0),
           ("y", 6.08, 6.16), ("en", 6.16, 6.24), ("la", 6.24, 6.32), ("Ciudad", 6.32, 6.64), ("de", 6.64, 6.72), ("México,", 6.72, 7.12), ("pero", 7.2, 7.44),
           ("también", 7.44, 7.6), ("en", 7.6, 7.76), ("Monterrey,", 7.76, 8.48), ("también", 8.48, 8.72), ("en", 8.72, 8.8), ("Guadalajara.", 8.8, 9.65)],
    "c5": [("Y", .51, .6), ("pues", .6, .8), ("bueno,", .8, 1.02), ("por", 1.28, 1.36), ("supuesto", 1.36, 1.6), ("que", 1.6, 1.76), ("los", 1.76, 1.92), ("quiero", 1.92, 2.08),
           ("invitar", 2.16, 2.4), ("a", 2.48, 2.56), ("que", 2.56, 2.64), ("lo", 2.64, 2.8), ("lean,", 2.8, 3.28), ("pero", 3.28, 3.36), ("sobre", 3.44, 3.76),
           ("todo", 3.76, 4.08), ("a", 4.32, 4.64), ("que", 4.64, 4.96), ("entendamos", 5.2, 5.92), ("un", 5.92, 6.0), ("poquito", 6.0, 6.32), ("lo", 6.32, 6.4),
           ("que", 6.4, 6.56), ("está", 6.56, 6.72), ("pasando", 6.72, 6.96), ("en", 6.96, 7.04), ("el", 7.04, 7.12), ("país,", 7.12, 7.44), ("que", 7.44, 7.6),
           ("no", 7.6, 7.76), ("son", 7.76, 7.92), ("cosas", 7.92, 8.16), ("menores,", 8.16, 8.6), ("y", 8.93, 9.0), ("sobre", 9.0, 9.2), ("todo", 9.2, 9.36),
           ("que", 9.52, 9.76), ("pensemos", 9.76, 10.16), ("lo", 10.32, 10.48), ("que", 10.48, 10.72), ("podemos", 10.72, 11.36), ("hacer", 11.36, 11.7),
           ("desde", 12.17, 12.48), ("nuestras", 12.72, 13.28), ("trincheras", 13.28, 13.82), ("para", 14.08, 14.32), ("mejorar", 14.32, 14.72), ("a", 14.72, 14.88),
           ("México.", 14.88, 15.3), ("Así", 15.36, 15.68), ("que", 15.68, 15.76), ("manténganse", 16.0, 16.64), ("al", 16.72, 16.8), ("pendiente.", 16.8, 17.44),
           ("Muchas", 17.44, 17.76), ("nuevas", 17.76, 18.08), ("noticias,", 18.08, 18.64), ("muchos", 18.64, 18.88), ("nuevos", 18.88, 19.2), ("eventos", 19.2, 19.5),
           ("se", 19.5, 19.6), ("vienen", 19.6, 19.88), ("pronto.", 19.88, 20.3)],
}

# Palabras resaltadas en los subtítulos (color de acento)
HIGHLIGHT = {"Eduardo", "Contró.", "día", "del", "libro,", "gran", "noticia.", "Favor", "leer", "antes", "opinar.", "ABC", "política", "mexicana.",
             "Gandhi", "nivel", "nacional.", "fiesta,", "presentaciones", "Miguel", "Hidalgo", "Ciudad", "México,", "Monterrey,", "Guadalajara.",
             "lean,", "entendamos", "país,", "pensemos", "trincheras", "mejorar", "México.", "pendiente.", "eventos", "pronto."}
# Frases de subtítulo (número de palabras por frase, en orden): cortes naturales de lectura
GROUPS = {
    "c1": [7, 4, 8, 6],
    "c2": [5, 6, 5, 6, 6],
    "c3": [7, 2, 6, 3],
    "c4": [4, 3, 8, 6, 6, 4, 3],
    "c5": [3, 6, 4, 8, 7, 5, 5, 4, 3, 4, 5, 3, 6],
}


def captions():
    segs, _, _ = timeline()
    groups = []
    for s in segs:
        words = WORDS[s["clip"]]
        assert sum(GROUPS[s["clip"]]) == len(words), s["clip"]
        i = 0
        for k in GROUPS[s["clip"]]:
            g = []
            for w, a, b in words[i : i + k]:
                t0 = s["start"] + a - s["src_in"]
                t1 = s["start"] + b - s["src_in"]
                g.append({"w": w, "t0": round(t0, 3), "t1": round(t1, 3), "hl": w in HIGHLIGHT})
            groups.append(g)
            i += k
    out = []
    for i, g in enumerate(groups):
        start = g[0]["t0"] - 0.06
        nxt = groups[i + 1][0]["t0"] - 0.06 if i + 1 < len(groups) else g[-1]["t1"] + 0.6
        end = min(nxt, g[-1]["t1"] + 0.9)
        out.append({"start": round(start, 3), "end": round(end, 3), "words": g})
    return out


def write_timeline():
    segs, talk_end, total = timeline()
    data = {"intro": INTRO, "segs": segs, "talkEnd": talk_end, "total": total, "captions": captions()}
    (A / "timeline.js").write_text("window.__TL = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"talk_end={talk_end}  total={total}  captions={len(data['captions'])}")
    return data


# Efectos sincronizados con la imagen (t = momento del corte o del golpe)
SFX = [
    {"t": 13.24, "type": "whoosh", "pre": 0.28, "gain": 0.32},  # b-roll páginas
    {"t": 15.88, "type": "whoosh", "pre": 0.28, "gain": 0.38},  # portada
    {"t": 16.45, "type": "shine", "gain": 0.16},                # brillo sobre la portada
    {"t": 19.6, "type": "whoosh", "pre": 0.28, "gain": 0.2},
    {"t": 22.28, "type": "hit", "gain": 0.55},                  # "Gandhi" (cae con el drop de la música)
    {"t": 23.25, "type": "whoosh", "pre": 0.28, "gain": 0.26},  # sale el logo, vuelve el autor
    {"t": 25.3, "type": "whoosh", "pre": 0.28, "gain": 0.32},   # mapa nacional
    {"t": 26.5, "type": "whoosh", "pre": 0.28, "gain": 0.22},
    {"t": 28.07, "type": "pop", "gain": 0.4},                   # confeti
    {"t": 31.01, "type": "whoosh", "pre": 0.28, "gain": 0.3},   # mapa de ciudades
    {"t": 31.53, "type": "ping", "gain": 0.3},                  # Miguel Hidalgo
    {"t": 32.58, "type": "ping", "gain": 0.3},                  # Ciudad de México
    {"t": 34.02, "type": "ping", "gain": 0.3},                  # Monterrey
    {"t": 35.06, "type": "ping", "gain": 0.3},                  # Guadalajara
    {"t": 36.2, "type": "whoosh", "pre": 0.28, "gain": 0.25},
    {"t": 38.47, "type": "whoosh", "pre": 0.28, "gain": 0.28},  # libro junto al mar
    {"t": 42.31, "type": "whoosh", "pre": 0.28, "gain": 0.3},   # páginas reales
    {"t": 56.6, "type": "whoosh", "pre": 0.3, "gain": 0.45},    # barrido de papel de la cortinilla
    {"t": 57.05, "type": "hit", "gain": 0.6},                   # "12"
    {"t": 57.6, "type": "shine", "gain": 0.22},
]


def run(cmd):
    print(" ".join(str(c) for c in cmd[:8]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


GRADE = ("hqdn3d=1.5:1.5:3:3,scale=2160:3840:flags=lanczos,unsharp=5:5:0.55:5:5:0,"
         "eq=contrast=1.07:saturation=1.1:gamma=0.97,"
         "colorbalance=rs=-0.02:bs=0.035:rm=0.01:rh=0.035:gh=0.01:bh=-0.03,format=yuv420p")


def prep():
    (A / "v").mkdir(exist_ok=True)
    for c, a, b in CLIPS:
        run(["ffmpeg", "-v", "error", "-y", "-ss", a, "-i", A / "clips" / f"{c}.mp4", "-t", round(b - a, 3), "-an",
             "-vf", f"fps=30,{GRADE}", "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-g", "15",
             A / "v" / f"{c}.mp4"])
    for b in ["b1", "b2", "b3"]:
        run(["ffmpeg", "-v", "error", "-y", "-i", A / "broll" / f"{b}.mp4", "-an",
             "-vf", "fps=30,scale=2160:3840:flags=lanczos,unsharp=5:5:0.4:5:5:0,eq=contrast=1.05:saturation=1.06,format=yuv420p",
             "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-g", "15", A / "v" / f"{b}.mp4"])
    run(["ffmpeg", "-v", "error", "-y", "-i", ROOT.parent / "intro-libro" / "renders" / "intro-favor-de-leer-4k.mp4", "-an",
         "-c:v", "copy", A / "v" / "intro.mp4"])
    write_timeline()


# ---------------- audio ----------------
def load(path, start=None, dur=None):
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    cmd += ["-i", str(path)]
    if dur is not None:
        cmd += ["-t", str(dur)]
    cmd += ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, "<f4").reshape(-1, 2).astype(np.float64)


def place(buf, sig, t, gain=1.0):
    i = int(round(t * SR))
    n = min(len(sig), len(buf) - i)
    if n > 0:
        buf[i : i + n] += sig[:n] * gain


def fade(sig, fi=0.02, fo=0.03):
    n = len(sig)
    e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    e[:a] = np.linspace(0, 1, a)
    e[n - b :] = np.linspace(1, 0, b)
    return sig * e[:, None]


def audio():
    data = write_timeline()
    segs, talk_end, total = data["segs"], data["talkEnd"], data["total"]
    n = int((total + 0.5) * SR)
    voice = np.zeros((n, 2))
    # voz: limpieza (paso alto, compresión suave, presencia) y nivel parejo por clip
    for s in segs:
        tmp = OUT / f"v_{s['clip']}.wav"
        run(["ffmpeg", "-v", "error", "-y", "-ss", s["src_in"] - 0.03, "-i", A / "clips" / f"{s['clip']}.mp4", "-t", s["dur"] + 0.03,
             "-af", "highpass=f=85,afftdn=nr=10:nf=-42,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=220:t=q:w=1:g=-1.5,"
                    "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,loudnorm=I=-16:TP=-2:LRA=7",
             "-ar", str(SR), "-ac", "2", tmp])
        v = fade(load(tmp), 0.03, 0.05)
        place(voice, v, s["start"] - 0.03)
    # envolvente de la voz para el ducking de la música
    mono = np.abs(voice).mean(1)
    k = int(0.05 * SR)
    env = np.convolve(mono, np.ones(k) / k, "same")
    talk = (env > 0.004).astype(float)
    # mantener el ducking entre palabras y suavizar ataque/relajación
    hold = int(0.35 * SR)
    talk = np.convolve(talk, np.ones(hold), "same") > 0
    duck = np.where(talk, 10 ** (-17 / 20), 1.0)
    sm = int(0.25 * SR)
    duck = np.convolve(duck, np.ones(sm) / sm, "same")

    # música: arranca en el golpe del intro y su drop cae en "Gandhi"
    gandhi = next(w for c in data["captions"] for w in c["words"] if w["w"] == "Gandhi")["t0"]
    offset = MUSIC_DROP - gandhi
    m_start = 2.4  # entra con el impacto del libro
    music = load(A / "music" / "musica.m4a", offset + m_start, total - m_start + 0.3)
    mus = np.zeros((n, 2))
    place(mus, music, m_start)
    t = np.arange(n) / SR
    menv = np.clip((t - m_start) / 0.6, 0, 1)  # entrada
    menv *= np.where(t < INTRO, 0.55, 1.0)
    # cortinilla: la música sube y se despide
    menv *= np.where(t > talk_end, 1.25, 1.0)
    menv *= np.clip((total - t) / 1.6, 0, 1) ** 1.3
    mus *= (menv * duck)[:, None] * 10 ** (-9 / 20)

    # efectos: intro del libro + transiciones (whoosh/impactos) definidos en index.html
    fx = np.zeros((n, 2))
    place(fx, load(ROOT.parent / "intro-libro" / "assets" / "sfx.wav"), 0.0, 0.9)
    for cue in SFX:
        place(fx, synth(cue["type"]), cue["t"] - cue.get("pre", 0.0), cue.get("gain", 0.5))

    mix = voice * 1.0 + mus + fx
    mix[: int(INTRO * SR)] *= 1.0
    pk = np.max(np.abs(mix))
    mix = np.tanh(1.2 * mix / pk) / np.tanh(1.2) * 0.9
    raw = OUT / "mix_raw.wav"
    with wave.open(str(raw), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((mix[: int(total * SR)] * 32767).astype("<i2").tobytes())
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.0:LRA=9", "-ar", str(SR), A / "mix.wav"])


rng = np.random.default_rng(7)


def _noise(n):
    return rng.standard_normal(n)


def _band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def synth(kind):
    """Efectos cortos sintetizados (whoosh, impacto suave, ping de mapa, brillo)."""
    if kind == "whoosh":
        d = 0.55
        nn = int(d * SR)
        tt = np.arange(nn) / SR
        x = _band(_noise(nn), 300, 5000)
        e = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2.5
        sig = x * e
    elif kind == "hit":
        d = 1.2
        nn = int(d * SR)
        tt = np.arange(nn) / SR
        f = 34 + 30 * np.exp(-tt * 8)
        sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3)
        sig = sub + 0.5 * _band(_noise(nn), 60, 1500) * np.exp(-tt * 25)
    elif kind == "ping":
        d = 0.9
        nn = int(d * SR)
        tt = np.arange(nn) / SR
        sig = sum(a * np.sin(2 * np.pi * f * tt) for f, a in [(1318.5, 1), (1975.5, 0.5), (2637, 0.25)]) * np.exp(-tt * 6)
        sig += 0.4 * np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 30)
    elif kind == "shine":
        d = 1.4
        nn = int(d * SR)
        tt = np.arange(nn) / SR
        sig = sum(a * np.sin(2 * np.pi * f * tt + k) for k, (f, a) in enumerate([(1760, 1), (2217, .7), (2637, .6), (3520, .4)]))
        sig *= np.minimum(1, tt / 0.15) * np.exp(-tt * 2.5)
    elif kind == "pop":
        d = 0.25
        nn = int(d * SR)
        tt = np.arange(nn) / SR
        f = 900 * np.exp(-tt * 18) + 200
        sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22)
    else:
        raise ValueError(kind)
    sig = sig / (np.max(np.abs(sig)) + 1e-9)
    return np.stack([sig, sig], 1)


def final():
    raw = OUT / "raw.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", A / "mix.wav", "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart",
         OUT / "video-favor-de-leer-4k.mp4"])


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = {"prep": prep, "timeline": write_timeline, "audio": audio, "final": final}
    for s in sys.argv[1:] or ["prep", "audio", "final"]:
        steps[s]()

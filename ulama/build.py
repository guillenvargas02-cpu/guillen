#!/usr/bin/env python3
"""Arma el video de invitación al partido de exhibición de ULAMA (vertical 4K, 2160x3840).

Pasos:
  python3 build.py plan            # imprime la línea de tiempo y escribe timing.json
  python3 build.py base audio      # footage (4K, cortes sin silencios, punch-ins) y mezcla de audio
  npx hyperframes render --format png-sequence --fps 30 --resolution portrait-4k -o renders/overlay
  python3 build.py final           # composición final -> renders/ulama-invitacion-4k.mp4

Todo vive en una rejilla de 30 fps exactos (las fuentes son de 30 fps).
La música (pista 2, ~90 BPM) se coloca para que su drop (1:09.30) caiga justo en la cortinilla de cierre.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
FPS = 30
W, H = 2160, 3840  # salida 4K vertical

INTRO = 97 / FPS  # cortinilla de entrada (3.233 s): el arranque de la música cae en un beat
OUTRO = 7.0  # cortinilla de cierre

# (fuente, entrada, salida, zoom al inicio, zoom al final) — tramos de voz sin silencios
CUTS = [
    ("IMG_1147", 2.22, 4.52, 1.00, 1.07),  # ¿Quieres hacer algo que nunca habías visto en tu vida?
    ("IMG_1147", 5.18, 8.20, 1.14, 1.19),  # Este próximo 29 de noviembre, domingo a las 10 de la mañana,
    ("IMG_1147", 8.20, 10.64, 1.36, 1.42),  # te queremos invitar a un partido de exhibición de ULAMA,
    ("IMG_1147", 11.44, 13.27, 1.02, 1.08),  # que es el juego de pelota prehispánico,
    ("IMG_1147", 13.57, 16.08, 1.18, 1.23),  # donde va a haber un partido de exhibición y un taller
    ("IMG_1147", 16.08, 18.28, 1.38, 1.44),  # para que puedas compartir con tu familia, tus amigos,
    ("IMG_1147", 18.56, 20.66, 1.04, 1.10),  # nuestras tradiciones y nuestra cultura mexicana.
    ("IMG_1147", 20.93, 24.22, 1.16, 1.28),  # Así que te esperamos este domingo en el parque de la reforma social.
    ("IMG_1148", 1.95, 5.70, 1.00, 1.08),  # Somos cultura, somos tradición y somos México.
]

MUSIC = A / "music" / "musica_ulama_2.m4a"
MUSIC_DROP = 69.30  # golpe de entrada después del break de la pista 2
WORD_LAG = 0.10  # whisper marca las palabras un poco antes de que suenen

# Transcripción (faster-whisper, palabra por palabra) en tiempos de la fuente
WORDS = {
    "IMG_1147": [
        ("¿Quieres", 2.08), ("hacer", 2.52), ("algo", 2.70), ("que", 2.92), ("nunca", 3.12), ("habías", 3.40),
        ("visto", 3.74), ("en", 4.04), ("tu", 4.14), ("vida?", 4.24),
        ("Este", 5.18), ("próximo", 5.40), ("29", 5.78), ("de", 6.28), ("noviembre,", 6.48), ("domingo", 7.00),
        ("a", 7.28), ("las", 7.40), ("10", 7.50), ("de", 7.62), ("la", 7.74), ("mañana,", 7.80),
        ("te", 8.14), ("queremos", 8.20), ("invitar", 8.46), ("a", 8.88), ("un", 8.98), ("partido", 9.04),
        ("de", 9.28), ("exhibición", 9.46), ("de", 9.90), ("ULAMA,", 10.24),
        ("que", 11.32), ("es", 11.52), ("el", 11.62), ("juego", 11.72), ("de", 12.02), ("pelota", 12.22),
        ("prehispánico,", 12.50),
        ("donde", 13.48), ("va", 13.72), ("a", 13.88), ("haber", 13.94), ("un", 14.04), ("partido", 14.12),
        ("de", 14.40), ("exhibición", 14.54), ("y", 15.04), ("un", 15.38), ("taller", 15.54),
        ("para", 15.72), ("que", 15.98), ("puedas", 16.10), ("compartir", 16.30), ("con", 16.68), ("tu", 16.90),
        ("familia,", 17.00), ("tus", 17.68), ("amigos,", 17.78),
        ("nuestras", 18.60), ("tradiciones", 18.82), ("y", 19.38), ("nuestra", 19.72), ("cultura", 19.90),
        ("mexicana.", 20.18),
        ("Así", 21.00), ("que", 21.08), ("te", 21.20), ("esperamos", 21.28), ("este", 21.68), ("domingo", 22.42),
        ("en", 22.80), ("el", 23.00), ("parque", 23.12), ("de", 23.38), ("la", 23.46), ("reforma", 23.56),
        ("social.", 23.94),
    ],
    "IMG_1148": [
        ("Somos", 1.86), ("cultura,", 2.42), ("somos", 3.12), ("tradición", 3.46), ("y", 3.94), ("somos", 4.38),
        ("México.", 4.74),
    ],
}


def frames(sec):
    return round(sec * FPS)


def plan():
    """Coloca cada tramo en la rejilla de 30 fps y calcula dónde entra la música."""
    t = frames(INTRO)
    segs = []
    for src, a, b, z0, z1 in CUTS:
        fa, fb = frames(a), frames(b)
        segs.append({"src": src, "in": fa / FPS, "out": fb / FPS, "start": t / FPS, "end": (t + fb - fa) / FPS,
                     "z0": z0, "z1": z1})
        t += fb - fa
    outro_start = t / FPS
    total = (t + frames(OUTRO)) / FPS
    words = []
    for s in segs:
        for w, ws in WORDS[s["src"]]:
            ws += WORD_LAG
            if s["in"] - 0.12 <= ws < s["out"]:
                words.append({"w": w, "t": round(max(s["start"], ws - s["in"] + s["start"]), 3)})
    return {
        "fps": FPS,
        "intro": frames(INTRO) / FPS,
        "outro_start": outro_start,
        "total": total,
        "music_offset": round(MUSIC_DROP - outro_start, 3),
        "segments": segs,
        "words": words,
    }


def run(cmd):
    print(" ".join(str(c) for c in cmd[:8]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def build_base(p):
    """Footage a 4K: fondo de cortinilla, tramos con push-in suave y fondo del cierre."""
    inputs, chains = [], []
    # Las cortinillas son gráficas (Hyperframes); debajo va un color de base
    inputs += ["-f", "lavfi", "-i", f"color=c=0x140d0a:s={W}x{H}:r={FPS}:d={p['intro']:.4f}"]
    chains.append("[0:v]format=yuv420p,setsar=1[s0]")
    for i, s in enumerate(p["segments"], start=1):
        dur = s["end"] - s["start"]
        inputs += ["-i", A / "footage" / f"{s['src']}.mp4"]
        z0, z1 = s["z0"], s["z1"]
        # zoom lineal en el tiempo del tramo; escala por fotograma y recorte centrado
        z = f"({z0}+({z1}-{z0})*t/{dur:.4f})"
        chains.append(
            f"[{i}:v]trim=start={s['in']:.4f}:duration={dur:.4f},setpts=PTS-STARTPTS,fps={FPS},"
            f"scale=w='trunc({W}*{z}/2)*2':h='trunc({H}*{z}/2)*2':eval=frame:flags=lanczos,"
            f"crop={W}:{H}:(iw-{W})/2:(ih-{H})/2,"
            # gradación: un poco más de contraste y color, cálido; nitidez para la subida a 4K
            "eq=contrast=1.07:saturation=1.16:brightness=0.005,"
            "colorbalance=rs=0.03:gs=0.0:bs=-0.03:rm=0.02:bm=-0.02,"
            "unsharp=5:5:0.55:5:5:0.0,vignette=angle=PI/5,"
            f"format=yuv420p,setsar=1[s{i}]"
        )
    n = len(p["segments"]) + 1
    inputs += ["-f", "lavfi", "-i", f"color=c=0x140d0a:s={W}x{H}:r={FPS}:d={p['total'] - p['outro_start']:.4f}"]
    chains.append(f"[{n}:v]format=yuv420p,setsar=1[s{n}]")
    chains.append("".join(f"[s{i}]" for i in range(n + 1)) + f"concat=n={n + 1}:v=1:a=0[v]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[v]",
         "-r", FPS, "-t", f"{p['total']:.4f}", "-c:v", "libx264", "-crf", "12", "-preset", "medium",
         "-pix_fmt", "yuv420p", OUT / "base.mp4"])


def build_sfx():
    """Whoosh e impacto sintetizados (sin samples externos)."""
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=c=pink:d=0.9:a=0.9:r=48000",
         "-af", "highpass=f=300,lowpass=f=6000,"
         "afade=t=in:st=0:d=0.55:curve=exp,afade=t=out:st=0.55:d=0.35:curve=exp,"
         "aecho=0.6:0.4:60:0.3,volume=0.9", "-ac", "2", OUT / "whoosh.wav"])
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
         "-i", "sine=f=58:d=0.7:r=48000", "-f", "lavfi", "-i", "anoisesrc=c=brown:d=0.25:a=0.8:r=48000",
         "-filter_complex",
         "[0:a]volume='exp(-6*t)':eval=frame[a];[1:a]lowpass=f=900,afade=t=out:st=0.02:d=0.22[b];"
         "[a][b]amix=inputs=2:normalize=0,volume=1.6,alimiter=limit=0.9", "-ac", "2", OUT / "impact.wav"])


# Efectos: (archivo, momento en el video, volumen). Los whoosh terminan en el corte.
def sfx_cues(p):
    intro, outro = p["intro"], p["outro_start"]
    return [
        ("impact", 0.667, 0.55),  # ULAMA golpea en el beat
        ("whoosh", intro - 0.55, 0.45),  # barrido de la cortinilla hacia el conductor
        ("whoosh", outro - 0.55, 0.5),  # barrido hacia el cierre
        ("impact", outro, 0.7),  # drop
    ]


def build_audio(p):
    build_sfx()
    total, intro, outro = p["total"], p["intro"], p["outro_start"]
    inputs, f, voices = [], [], []
    srcs = sorted({s["src"] for s in p["segments"]})
    for s in srcs:
        inputs += ["-i", A / "footage" / f"{s}.mp4"]
    for i, s in enumerate(p["segments"]):
        k = srcs.index(s["src"])
        d = s["end"] - s["start"]
        ms = round(s["start"] * 1000)
        f.append(
            f"[{k}:a]atrim=start={s['in']:.4f}:duration={d:.4f},asetpts=PTS-STARTPTS,aformat=channel_layouts=mono,"
            f"afade=t=in:d=0.015,afade=t=out:st={d - 0.02:.4f}:d=0.02,adelay={ms}[v{i}]"
        )
        voices.append(f"[v{i}]")
    f.append(
        "".join(voices) + f"amix=inputs={len(voices)}:normalize=0,highpass=f=85,lowpass=f=13000,"
        "afftdn=nr=8:nf=-45,equalizer=f=3200:t=q:w=1.2:g=2.5,"
        "acompressor=threshold=-22dB:ratio=3:attack=5:release=120:makeup=5dB,"
        f"volume=1.5,apad=whole_dur={total:.4f},aformat=channel_layouts=stereo[voice]"
    )
    m = len(srcs)
    inputs += ["-i", MUSIC]
    # Música: llena en la entrada, baja con la voz, regresa de golpe en el drop
    # Al terminar la voz la música sube hacia el drop
    a, b = intro - 0.25, outro
    c = p["segments"][-1]["start"] + 3.05  # fin de "…y somos México"
    hi, lo, r = 1.0, 0.16, 0.3
    duck = (f"if(lt(t,{a}),{hi},if(lt(t,{a + r}),{hi}-{hi - lo}*(t-{a})/{r},"
            f"if(lt(t,{c:.3f}),{lo},if(lt(t,{b}),{lo}+{0.6 - lo}*(t-{c:.3f})/{b - c:.3f},1))))")
    f.append(
        f"[{m}:a]atrim=start={p['music_offset']:.4f}:duration={total:.4f},asetpts=PTS-STARTPTS,"
        f"volume='{duck}':eval=frame,volume=0.6,"
        f"afade=t=in:d=0.03,afade=t=out:st={total - 1.6:.3f}:d=1.6[music]"
    )
    sfx = []
    for j, (name, at, vol) in enumerate(sfx_cues(p)):
        inputs += ["-i", OUT / f"{name}.wav"]
        ms = max(0, round(at * 1000))
        f.append(f"[{m + 1 + j}:a]volume={vol},adelay={ms}|{ms}[x{j}]")
        sfx.append(f"[x{j}]")
    f.append(f"[voice][music]{''.join(sfx)}amix=inputs={2 + len(sfx)}:normalize=0,"
             f"atrim=duration={total:.4f},alimiter=limit=0.9[mix]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(f), "-map", "[mix]",
         "-ar", "48000", "-ac", "2", OUT / "mix_raw.wav"])
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "mix_raw.wav",
         "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000", OUT / "audio.wav"])


def build_final(p):
    frames_ = sorted((OUT / "overlay").glob("*.png"))
    if not frames_:
        sys.exit("Falta renders/overlay: renderiza primero la capa gráfica (png-sequence).")
    stem, num = frames_[0].stem.rsplit("_", 1)
    pattern = OUT / "overlay" / f"{stem}_%0{len(num)}d.png"
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "base.mp4",
         "-framerate", FPS, "-start_number", int(num), "-i", pattern, "-i", OUT / "audio.wav",
         "-filter_complex",
         f"[1:v]scale={W}:{H}:flags=lanczos[o];[0:v][o]overlay=0:0:format=auto:shortest=0,format=yuv420p,"
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", f"{p['total']:.4f}",
         # Entrega: H.264 High 5.2, 4K vertical 30 fps, AAC 48 kHz estéreo, moov al inicio
         "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-profile:v", "high", "-level", "5.2",
         "-pix_fmt", "yuv420p", "-maxrate", "80M", "-bufsize", "160M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
         OUT / "ulama-invitacion-4k.mp4"])


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    p = plan()
    steps = sys.argv[1:] or ["plan", "base", "audio", "final"]
    for step in steps:
        if step == "plan":
            (ROOT / "timing.json").write_text(json.dumps(p, ensure_ascii=False, indent=1))
            for s in p["segments"]:
                print(f"{s['start']:7.3f}-{s['end']:7.3f}  {s['src']} {s['in']:.3f}-{s['out']:.3f}")
            print("outro", p["outro_start"], "total", p["total"], "music_offset", p["music_offset"])
        else:
            {"base": build_base, "audio": build_audio, "final": build_final}[step](p)

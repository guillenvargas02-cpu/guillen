#!/usr/bin/env python3
"""Arma el reel final.

1. base.mp4   — cortes del footage con ffmpeg a 29.97 fps exactos (sin fotogramas repetidos),
                fundidos entre tomas y fundido a blanco para el cierre.
2. audio.wav  — voz del selfie + música (desde musica.m4a) con ducking mientras se habla.
3. Compone la capa gráfica de Hyperframes (png-sequence RGBA) encima y entrega el MP4.

Uso:
  python3 build.py base audio          # solo footage y audio
  npx hyperframes render --format png-sequence --fps 30000/1001 -o renders/overlay
  python3 build.py final               # composición final
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
FPS = "30000/1001"
TOTAL = 34.82

# (fuente, entrada en la fuente, inicio en el reel, fin en el reel, transición de entrada, punch-in)
# Los cortes caen en los beats de la música (~96 BPM).
EDL = [
    ("IMG_1032", 0.40, 0.00, 5.12, None, 1.0),  # valle: intro con la altitud
    ("IMG_1015", 0.06, 5.12, 10.01, "cut", 1.0),  # selfie (sin los silencios)
    ("IMG_1015", 6.05, 10.01, 10.91, "cut", 1.15),
    ("IMG_1015", 8.85, 10.91, 12.06, "cut", 1.06),
    ("IMG_1033", 2.80, 12.06, 15.85, "cut", 1.0),  # sendero hacia los picos
    ("IMG_1018", 1.20, 15.85, 19.63, "dissolve", 1.0),  # niebla: glaciar Ayoloco
    ("IMG_1046", 4.50, 19.63, 24.72, "dissolve", 1.0),  # cresta entre nubes: placa
    ("IMG_1049", 0.15, 24.72, 28.48, "dissolve", 1.0),  # cuerda: por eso subimos
    ("IMG_1046", 0.10, 28.48, 31.63, "dissolve", 1.0),  # nubes: sí lo hicimos
    ("white", 0.00, 31.63, TOTAL, "fadewhite", 1.0),  # cierre con logo
]
XFADE = {"dissolve": 0.30, "fadewhite": 0.60}

# Voz: tramos del selfie (los mismos que EDL) y música
VOICE = [(0.06, 5.12, 10.01), (6.05, 10.01, 10.91), (8.85, 10.91, 12.06)]
MUSIC_OFFSET = 1.48  # primer golpe de la canción en t=0.05 del reel
DUCK = (4.95, 12.15)  # la música baja mientras se habla


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def build_base():
    inputs, parts = [], []
    for i, (src, s_in, t0, t1, _tin, punch) in enumerate(EDL):
        nxt = EDL[i + 1][4] if i + 1 < len(EDL) else None
        dur = (t1 - t0) + XFADE.get(nxt, 0)
        if src == "white":
            inputs += ["-f", "lavfi", "-i", f"color=c=white:s=1080x1920:r={FPS}:d={dur:.3f}"]
            chain = f"[{i}:v]format=yuv420p,setsar=1,settb=1001/30000"
        else:
            inputs += ["-i", A / f"{src}.mp4"]
            crop = ""
            if punch != 1.0:
                w, h = round(1080 / punch / 2) * 2, round(1920 / punch / 2) * 2
                crop = f"crop={w}:{h},scale=1080:1920:flags=lanczos,"
            chain = (
                f"[{i}:v]trim=start={s_in:.3f}:duration={dur:.3f},setpts=PTS-STARTPTS,"
                f"{crop}fps={FPS},format=yuv420p,setsar=1,settb=1001/30000"
            )
        parts.append(f"{chain}[s{i}]")

    graph, cur = parts, "s0"
    for i in range(1, len(EDL)):
        t0, kind = EDL[i][2], EDL[i][4]
        out = f"j{i}"
        if kind == "cut":
            graph.append(f"[{cur}][s{i}]concat=n=2:v=1:a=0,settb=1001/30000[{out}]")
        else:
            graph.append(
                f"[{cur}][s{i}]xfade=transition={'fade' if kind == 'dissolve' else 'fadewhite'}"
                f":duration={XFADE[kind]}:offset={t0:.3f},settb=1001/30000[{out}]"
            )
        cur = out
    graph.append(f"[{cur}]trim=duration={TOTAL},setpts=PTS-STARTPTS[v]")
    run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p",
         OUT / "base.mp4"]
    )


def build_audio():
    f = []
    for i, (s_in, t0, t1) in enumerate(VOICE):
        d = t1 - t0
        f.append(
            f"[0:a]atrim=start={s_in:.3f}:duration={d:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d=0.02,afade=t=out:st={d - 0.03:.3f}:d=0.03,adelay={int(t0 * 1000)}|{int(t0 * 1000)}[v{i}]"
        )
    f.append(
        "[v0][v1][v2]amix=inputs=3:normalize=0,highpass=f=90,lowpass=f=12000,"
        "acompressor=threshold=-24dB:ratio=3:attack=5:release=120:makeup=6dB,"
        f"volume=1.6,apad=whole_dur={TOTAL}[voice]"
    )
    a, b = DUCK
    r = 0.35  # rampa del ducking
    duck = (
        f"if(lt(t,{a - r}),1,if(lt(t,{a}),1-0.8*(t-{a - r})/{r},"
        f"if(lt(t,{b}),0.2,if(lt(t,{b + r}),0.2+0.8*(t-{b})/{r},1))))"
    )
    f.append(
        f"[1:a]atrim=start={MUSIC_OFFSET}:duration={TOTAL},asetpts=PTS-STARTPTS,"
        f"volume='{duck}':eval=frame,volume=0.55,"
        f"afade=t=in:d=0.08,afade=t=out:st={TOTAL - 2.6:.2f}:d=2.6[music]"
    )
    f.append("[voice][music]amix=inputs=2:normalize=0,alimiter=limit=0.89[mix]")
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", A / "IMG_1015.mp4", "-i", A / "musica.m4a",
         "-filter_complex", ";".join(f), "-map", "[mix]", "-ar", "48000", "-ac", "2",
         OUT / "mix_raw.wav"]
    )
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", OUT / "mix_raw.wav",
         "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000", OUT / "audio.wav"]
    )


def build_final():
    frames = sorted((OUT / "overlay").glob("*.png"))
    if not frames:
        sys.exit("Falta renders/overlay: renderiza primero la capa con hyperframes (png-sequence).")
    pattern = OUT / "overlay" / (frames[0].name.rsplit("_", 1)[0] + "_%0" + str(len(frames[0].stem.rsplit("_", 1)[1])) + "d.png")
    start = int(frames[0].stem.rsplit("_", 1)[1])
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", OUT / "base.mp4",
         "-framerate", FPS, "-start_number", start, "-i", pattern, "-i", OUT / "audio.wav",
         "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto:shortest=0,format=yuv420p[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart",
         OUT / "somos-naturaleza-reel.mp4"]
    )


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = sys.argv[1:] or ["base", "audio", "final"]
    for s in steps:
        {"base": build_base, "audio": build_audio, "final": build_final}[s]()

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
TOTAL = 33.20

# (fuente, entrada en la fuente, inicio en el reel, fin en el reel, transición de entrada, punch-in, velocidad)
# Todo cae en la rejilla de beats de la canción (~96 BPM, 0.63 s); el drop entra en 9.47 s.
# Las fotos (escalada, rapel, cima) van en la capa de Hyperframes: debajo queda 1049 y negro.
EDL = [
    ("IMG_1032", 0.40, 0.00, 3.78, None, 1.0, 1.0),  # valle: intro con la altitud
    ("IMG_1015", 1.28, 3.78, 7.43, "cut", 1.0, 1.0),  # selfie (sin silencios)
    ("IMG_1015", 6.05, 7.43, 8.33, "cut", 1.15, 1.0),
    ("IMG_1015", 8.85, 8.33, 9.47, "cut", 1.06, 1.0),
    ("IMG_1033", 3.90, 9.47, 11.35, "cut", 1.0, 1.25),  # DROP: sendero hacia los picos
    ("IMG_1018", 1.30, 11.35, 13.26, "zoomin", 1.0, 1.2),  # niebla: glaciar
    ("IMG_1046", 4.50, 13.26, 18.30, "smoothleft", 1.0, 1.0),  # cresta entre nubes: placa
    ("IMG_1049", 0.20, 18.30, 22.40, "cut", 1.0, 1.0),  # cuerda (luego fotos encima)
    ("black", 0.00, 22.40, 25.89, "cut", 1.0, 1.0),  # bajo las fotos de rapel y cima
    ("IMG_1046", 0.10, 25.89, 29.68, "cut", 1.0, 1.0),  # nubes: sí lo hicimos
    ("white", 0.00, 29.68, TOTAL, "fadewhite", 1.0, 1.0),  # cierre con logo
]
XFADE = {"zoomin": 0.30, "smoothleft": 0.30, "fadewhite": 0.60}

# Voz: tramos del selfie (los mismos que EDL) y música
VOICE = [(1.28, 3.78, 7.43), (6.05, 7.43, 8.33), (8.85, 8.33, 9.47)]
MUSIC_OFFSET = 74.84  # puente tranquilo de la canción; el drop (1:24.3) cae en 9.47 s
DUCK = (3.62, 9.45)  # la música baja mientras se habla y vuelve de golpe en el drop


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def build_base():
    inputs, parts = [], []
    for i, (src, s_in, t0, t1, _tin, punch, speed) in enumerate(EDL):
        nxt = EDL[i + 1][4] if i + 1 < len(EDL) else None
        dur = (t1 - t0) + XFADE.get(nxt, 0)
        if src in ("white", "black"):
            inputs += ["-f", "lavfi", "-i", f"color=c={src}:s=1080x1920:r={FPS}:d={dur:.3f}"]
            chain = f"[{i}:v]format=yuv420p,setsar=1,settb=1001/30000"
        else:
            inputs += ["-i", A / f"{src}.mp4"]
            crop = ""
            if punch != 1.0:
                w, h = round(1080 / punch / 2) * 2, round(1920 / punch / 2) * 2
                crop = f"crop={w}:{h},scale=1080:1920:flags=lanczos,"
            chain = (
                f"[{i}:v]trim=start={s_in:.3f}:duration={dur * speed:.3f},setpts=(PTS-STARTPTS)/{speed},"
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
                f"[{cur}][s{i}]xfade=transition={kind}"
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
    r, rel = 0.35, 0.06  # bajada suave, subida seca para que el drop pegue
    duck = (
        f"if(lt(t,{a - r}),1,if(lt(t,{a}),1-0.8*(t-{a - r})/{r},"
        f"if(lt(t,{b}),0.2,if(lt(t,{b + rel}),0.2+0.8*(t-{b})/{rel},1))))"
    )
    f.append(
        f"[1:a]atrim=start={MUSIC_OFFSET}:duration={TOTAL},asetpts=PTS-STARTPTS,"
        f"volume='{duck}':eval=frame,volume=0.55,"
        f"afade=t=in:d=0.08,afade=t=out:st={TOTAL - 2.9:.2f}:d=2.9[music]"
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

#!/usr/bin/env python3
"""Arma el video de invitación al partido de exhibición de ULAMA (vertical 4K, 2160x3840).

Pasos:
  python3 build.py plan            # imprime la línea de tiempo y escribe timing.json
  python3 build.py base audio      # footage (4K, cortes sin silencios, punch-ins) y mezcla de audio
  npx hyperframes render --format png-sequence --fps 30 --resolution portrait-4k -o renders/overlay
  python3 build.py final           # composición final -> renders/ulama-invitacion-4k.mp4

Todo vive en una rejilla de 30 fps exactos (las fuentes son de 30 fps).
La música es el tramo de tambores de la pista 3 (sin gritos); en la cortinilla de cierre entra un golpe de
percusión cinematográfico y la música se apaga.
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

INTRO = 60 / FPS  # entrada: animación del logotipo SOMOS (2.0 s) y paso directo al conductor
OUTRO = 108 / FPS  # cortinilla de cierre: logo SOMOS sobre fondo blanco (3.6 s)

# (fuente, entrada, salida, zoom al inicio, zoom al final) — tramos de voz sin silencios
# Acercamientos suaves para dejar libre la parte de arriba, donde van los íconos (sin tapar al conductor)
CUTS = [
    ("IMG_1147", 2.22, 4.52, 1.00, 1.04),  # ¿Quieres hacer algo que nunca habías visto en tu vida?
    ("IMG_1147", 5.18, 8.20, 1.00, 1.04),  # Este próximo 29 de noviembre, domingo a las 10 de la mañana,
    ("IMG_1147", 8.20, 10.64, 1.10, 1.14),  # te queremos invitar a un partido de exhibición de ULAMA,
    ("IMG_1147", 11.44, 13.27, 1.00, 1.04),  # que es el juego de pelota prehispánico,
    ("IMG_1147", 13.57, 16.08, 1.06, 1.10),  # donde va a haber un partido de exhibición y un taller
    ("IMG_1147", 16.08, 18.28, 1.12, 1.16),  # para que puedas compartir con tu familia, tus amigos,
    ("IMG_1147", 18.56, 20.66, 1.00, 1.04),  # nuestras tradiciones y nuestra cultura mexicana.
    ("IMG_1147", 20.93, 24.22, 1.00, 1.03),  # Así que te esperamos este domingo en el parque de la reforma social.
    ("IMG_1148", 1.95, 5.70, 1.00, 1.06),  # Somos cultura, somos tradición y somos México.
]
BUMP = 0.08  # golpe de zoom al inicio de cada toma (se desvanece en ~0.25 s)
# Las tomas del iPhone son HDR (HLG, BT.2020). Se convierten a SDR BT.709 con tone-mapping,
# para que se vean como en el teléfono (sin esta conversión se ven lavadas y brillosas).
TONEMAP = ("zscale=t=linear:npl=150,format=gbrpf32le,zscale=p=bt709,"
           "tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")

MUSIC = A / "music" / "musica_ulama_3.m4a"
# Tramo de tambores de la pista 3 (0:00–0:28), sin voces ni gritos (los gritos están en 1:06–1:20).
# Con 0.373 s de entrada, el golpe de tambor de 0:01.04 cae justo cuando se forma la pleca (0.667 s).
MUSIC_OFFSET = 0.373
WORD_LAG = 0.10  # whisper marca las palabras un poco antes de que suenen
VOICE_LATENCY = 0.030  # retraso medido del filtro afftdn (verificado por correlación contra el audio original)

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
        "music_offset": MUSIC_OFFSET,
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
    inputs += ["-f", "lavfi", "-i", f"color=c=white:s={W}x{H}:r={FPS}:d={p['intro']:.4f}"]
    chains.append("[0:v]format=yuv420p,setsar=1[s0]")
    for i, s in enumerate(p["segments"], start=1):
        dur = s["end"] - s["start"]
        inputs += ["-i", A / "footage" / f"{s['src']}.mp4"]
        z0, z1 = s["z0"], s["z1"]
        # zoom lineal en el tiempo del tramo; escala por fotograma y recorte centrado
        z = f"({z0}+({z1}-{z0})*t/{dur:.4f}+{BUMP}*exp(-t*12))"
        chains.append(
            f"[{i}:v]trim=start={s['in']:.4f}:duration={dur:.4f},setpts=PTS-STARTPTS,fps={FPS},{TONEMAP},"
            f"scale=w='trunc({W}*{z}/2)*2':h='trunc({H}*{z}/2)*2':eval=frame:flags=lanczos,"
            f"crop={W}:{H}:(iw-{W})/2:(ih-{H})/2,"
            # sin gradación: solo un poco de nitidez para la subida a 4K
            "unsharp=5:5:0.3:5:5:0.0,"
            f"format=yuv420p,setsar=1[s{i}]"
        )
    n = len(p["segments"]) + 1
    inputs += ["-f", "lavfi", "-i", f"color=c=white:s={W}x{H}:r={FPS}:d={p['total'] - p['outro_start']:.4f}"]
    chains.append(f"[{n}:v]format=yuv420p,setsar=1[s{n}]")
    chains.append("".join(f"[s{i}]" for i in range(n + 1)) + f"concat=n={n + 1}:v=1:a=0[v]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[v]",
         "-r", FPS, "-t", f"{p['total']:.4f}", "-c:v", "libx264", "-crf", "12", "-preset", "medium",
         "-pix_fmt", "yuv420p", OUT / "base.mp4"])


def build_sfx():
    """Efectos sintetizados (sin samples externos): whoosh, riser, golpe de entrada y golpe cinematográfico final."""
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=c=pink:d=0.9:a=0.9:r=48000",
         "-af", "highpass=f=300,lowpass=f=6000,"
         "afade=t=in:st=0:d=0.55:curve=exp,afade=t=out:st=0.55:d=0.35:curve=exp,"
         "aecho=0.6:0.4:60:0.3,volume=0.9", "-ac", "2", OUT / "whoosh.wav"])
    # Riser (hush) de 1.3 s que crece hasta el golpe final
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=c=white:d=1.3:a=0.8:r=48000",
         "-af", "highpass=f=900,lowpass=f=9000,afade=t=in:st=0:d=1.25:curve=cub,"
         "afade=t=out:st=1.25:d=0.05,aecho=0.7:0.5:40|90:0.35|0.25,volume=0.8", "-ac", "2", OUT / "riser.wav"])
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
         "-i", "sine=f=58:d=0.7:r=48000", "-f", "lavfi", "-i", "anoisesrc=c=brown:d=0.25:a=0.8:r=48000",
         "-filter_complex",
         "[0:a]volume='exp(-6*t)':eval=frame[a];[1:a]lowpass=f=900,afade=t=out:st=0.02:d=0.22[b];"
         "[a][b]amix=inputs=2:normalize=0,volume=1.6,alimiter=limit=0.9", "-ac", "2", OUT / "impact.wav"])
    # Pop corto para cada ícono o rótulo que aparece
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
         "-i", "aevalsrc='0.8*sin(2*PI*(320+700*exp(-38*t))*t)*exp(-26*t)':s=48000:d=0.18",
         "-af", "volume=1.2", "-ac", "2", OUT / "pop.wav"])
    # Golpe de percusión dramático: bombo grave con caída de tono + ataque de ruido + tom + cola de reverberación
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
         "-i", "aevalsrc='0.9*sin(2*PI*(42+70*exp(-9*t))*t)*exp(-1.6*t)':s=48000:d=3.4",
         "-f", "lavfi", "-i", "anoisesrc=c=brown:d=0.5:a=0.9:r=48000",
         "-f", "lavfi", "-i", "aevalsrc='0.5*sin(2*PI*(95+140*exp(-14*t))*t)*exp(-7*t)':s=48000:d=1.0",
         "-filter_complex",
         "[1:a]lowpass=f=2200,afade=t=out:st=0:d=0.45:curve=exp[n];"
         "[0:a][n][2:a]amix=inputs=3:normalize=0:duration=longest,"
         "aecho=0.8:0.75:70|140|260|420:0.45|0.35|0.28|0.2,"
         "afade=t=out:st=2.2:d=1.2,volume=1.5,alimiter=limit=0.95", "-ac", "2", OUT / "boom.wav"])


# Efectos: (archivo, momento en el video, volumen)
def sfx_cues(p):
    intro, outro = p["intro"], p["outro_start"]
    return [
        ("impact", 0.667, 0.55),  # la última letra de SOMOS cae en el golpe de tambor
        ("whoosh", intro - 0.35, 0.5),  # entramos por la O del logotipo hacia el conductor
        ("riser", outro - 1.3, 0.55),  # la franja blanca se abre y las letras se separan
        ("boom", outro, 1.0),  # las letras se cierran de golpe sobre blanco
    ] + [("pop", intro + t, v) for t, v in POPS] + [("whoosh", intro + 17.45, 0.35)]  # el mapa entra


# Pops sincronizados con icons.html (tiempo local = video − entrada del conductor)
POPS = [
    (0.15, 0.3), (0.35, 0.3),  # signos de interrogación
    (2.95, 0.35), (3.2, 0.25),  # calendario y fecha
    (4.6, 0.35), (4.68, 0.25),  # reloj y hora
    (6.9, 0.35), (7.45, 0.3), (7.69, 0.4),  # aro, ¡ULAMA!, la pelota entra
    (8.05, 0.35), (8.88, 0.25),  # jugadores
    (10.2, 0.35), (10.62, 0.25), (11.62, 0.3),  # atleta, exhibición, taller
    (13.08, 0.3), (13.86, 0.3),  # familia, amigos
    (14.6, 0.35), (15.68, 0.25),  # sahumador
    (16.8, 0.35),  # ¡te esperamos!
    (18.55, 0.35), (18.68, 0.25),  # pin y rótulo del parque
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
        # el reductor de ruido (afftdn) retrasa la señal 30 ms: se compensa para que voz y labios coincidan
        f"atrim=start={VOICE_LATENCY},asetpts=PTS-STARTPTS,"
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
        f"afade=t=in:d=0.03,afade=t=out:st={outro + 0.05:.3f}:d=1.1[music]"
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


# Partes para compartir (< 10 MB): se corta donde termina una frase y cambia la toma
SPLITS = [11.6, 18.4]  # 1) intro … "juego de pelota prehispánico"  2) "donde va a haber…" … "cultura mexicana"  3) "Así que te esperamos…" + cierre
PART_BYTES = 9_400_000  # margen bajo 10 MB
AUDIO_KBPS = 192


def build_parts(p):
    src = OUT / "ulama-invitacion-4k.mp4"
    cuts = [0.0] + SPLITS + [p["total"]]
    for k in range(3):
        a, b = cuts[k], cuts[k + 1]
        dur = b - a
        vk = int(PART_BYTES * 8 / dur / 1000 - AUDIO_KBPS - 40)  # kbps de video (40 kbps para el contenedor)
        dst = OUT / f"ulama-parte-{k + 1}-de-3.mp4"
        af = []
        if k > 0:
            af.append("afade=t=in:d=0.05")
        if k < 2:
            af.append(f"afade=t=out:st={dur - 0.08:.3f}:d=0.08")
        common = ["-ss", f"{a:.4f}", "-i", src, "-t", f"{dur:.4f}",
                  "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p",
                  "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-level", "4.1",
                  "-b:v", f"{vk}k", "-maxrate", f"{int(vk * 1.6)}k", "-bufsize", f"{vk * 2}k", "-g", "60",
                  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
        log = str(OUT / f"x264-parte{k + 1}")
        run(["ffmpeg", "-v", "error", "-y", *common, "-pass", "1", "-passlogfile", log, "-an", "-f", "mp4", "/dev/null"])
        run(["ffmpeg", "-v", "error", "-y", *common, "-pass", "2", "-passlogfile", log,
             *(["-af", ",".join(af)] if af else []),
             "-c:a", "aac", "-b:a", f"{AUDIO_KBPS}k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", dst])
        print(f"{dst.name}: {a:.3f}-{b:.3f} s, video {vk} kbps, {dst.stat().st_size / 1e6:.2f} MB")


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
            {"base": build_base, "audio": build_audio, "final": build_final, "parts": build_parts}[step](p)

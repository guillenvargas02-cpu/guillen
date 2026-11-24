#!/usr/bin/env python3
"""Video "Jornada de salud integral – Parque Reforma Social" (SOMOS, Eduardo Contró).

Pasos:
  python3 build.py timing     # escribe overlay/timing.js (subtítulos y eventos en tiempo de salida)
  python3 build.py base       # footage cortado, etalonado y con punch-ins  -> renders/base.mp4
  python3 build.py audio      # voz (mismos cortes que el video) + música + efectos -> renders/mix.wav
  node render_overlay.mjs     # capa gráfica RGBA cuadro a cuadro -> renders/overlay/
  python3 build.py final      # composición final -> renders/parque_reforma_social.mp4

La voz se corta con exactamente los mismos puntos de entrada/salida que la imagen,
así que no hay desfase entre audio y labios.
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
OUT.mkdir(exist_ok=True)
FPS = 30
W, H = 1080, 1920   # espacio de trabajo (la capa gráfica se diseña a 1080x1920)
SCALE = 2           # entrega en 4K: 2160x3840 (footage reescalado con lanczos, gráficos a DPR 2)
OW, OH = W * SCALE, H * SCALE
SR = 48000

SRC = {
    "1145": A / "footage/IMG_1145.mp4",
    "1146": A / "footage/IMG_1146.MOV",
    "1149": A / "footage/IMG_1149.mp4",
}
# Ganancia de voz por toma (medida tras la compresión para igualar las tres)
VOICE_LATENCY = 0.025  # medido por correlación cruzada contra el audio original
VOICE_GAIN_DB = {"1145": 0.0, "1146": -0.4, "1149": -0.6}

# (toma, entrada, salida, encuadre inicial, centro y del zoom)
# Los cortes caen en silencios medidos con la envolvente de la voz.
EDL = [
    ("1145", 0.00, 5.22, 1.00, 880),   # ¿Qué tal...? ... Eduardo Contró
    ("1145", 5.58, 10.06, 1.00, 820),  # para invitarlos ... 10 de la mañana
    ("1145", 10.06, 12.62, 1.14, 760), # a una jornada de salud integral
    ("1145", 12.94, 14.14, 1.13, 760), # asesoría jurídica
    ("1145", 14.40, 17.60, 1.00, 760), # y apoyo psicológico gratuito ... requiera
    ("1146", 0.85, 4.50, 1.00, 700),   # Te esperamos aquí ... Parque de la Reforma Social
    ("1149", 0.21, 5.00, 1.00, 700),   # Porque aquí somos justicia, salud y SOMOS México
]
START = 0.70  # el footage arranca bajo la cortinilla de entrada
# Huecos que la capa gráfica tapa por completo (mapa en blanco): tiempo extra con el último cuadro
HOLD_AFTER = {5: 0.60}  # tras 1146: el mapa a pantalla completa tapa el video

# Dinamismo: punch-ins (saltos de encuadre en el mismo instante, sin cortar tiempo: la voz no se toca)
# y "golpes" de cámara cortos sobre las palabras clave. Tiempos en la fuente.
JUMPS = {
    0: [(2.44, 1.10), (4.50, 1.20, 625)],            # "Lo saluda…" / "Eduardo Contró" (encuadre centrado en él)
    1: [(6.92, 1.13), (8.52, 1.03)],                 # "28 de noviembre" / "a partir de las 10…"
    2: [(11.66, 1.00)],                              # "de salud integral" (aire arriba para el ícono)
    4: [(15.50, 1.16), (16.18, 1.05)],               # "gratuito" / "para todo aquel…"
    5: [(1.92, 1.09)],                               # "este sábado…"
    6: [(1.50, 1.07), (2.68, 1.14), (3.74, 1.21)],   # cada "somos" acerca más: crescendo al cierre
}
BUMPS = {
    0: [(4.50, 0.035)],
    1: [(6.92, 0.04), (8.10, 0.05), (9.08, 0.04)],   # 28 / sábado / 10
    2: [(11.80, 0.035)],                             # salud
    3: [(13.00, 0.035)],                             # asesoría
    4: [(14.70, 0.03), (15.50, 0.05)],               # apoyo / gratuito
    5: [(2.86, 0.04)],                               # Parque
    6: [(1.50, 0.035), (2.68, 0.04), (3.86, 0.05)],  # somos, somos, SOMOS
}
PUSH = 0.03  # acercamiento lento dentro de cada tramo


def edl_out():
    """Devuelve la EDL con tiempos de salida [(toma, s_in, s_out, t0, t1, ...)]."""
    t = START
    res = []
    for i, (c, s0, s1, z0, cy) in enumerate(EDL):
        d = s1 - s0
        res.append(dict(clip=c, s0=s0, s1=s1, t0=t, t1=t + d, z0=z0, cy=cy))
        t += d + HOLD_AFTER.get(i, 0.0)
    return res


def _speech_end():
    e = edl_out()[6]
    return e["t0"] + (4.54 - e["s0"])


HIT = round(_speech_end() + 0.46, 3)  # golpe final: la pleca se expande a blanco
END = round(HIT + 3.0, 3)


def src_to_out(clip, s):
    for e in edl_out():
        if e["clip"] == clip and e["s0"] - 1e-6 <= s <= e["s1"] + 1e-6:
            return round(e["t0"] + (s - e["s0"]), 3)
    raise ValueError(f"{clip}@{s} fuera de la EDL")


# Subtítulos: (toma, [(palabra, inicio en la fuente)], fin de la frase, palabras destacadas)
# Tiempos refinados: transcripción con Whisper + envolvente de energía de la voz.
CAPTIONS = [
    ("1145", [("¿Qué", 1.18), ("tal,", 1.40), ("amigas", 1.56), ("y", 1.80), ("amigos?", 1.90)], 2.30, []),
    ("1145", [("Lo", 2.44), ("saluda", 2.56), ("su", 3.04), ("vecino", 3.36)], 3.74, []),
    ("1145", [("de", 3.76), ("la", 3.86), ("Miguel", 3.96), ("Hidalgo,", 4.14)], 4.48, ["Miguel", "Hidalgo,"]),
    ("1145", [("Eduardo", 4.50), ("Contró", 4.72)], 5.20, "name"),
    ("1145", [("Para", 5.66), ("invitarlos", 5.78)], 6.26, []),
    ("1145", [("este", 6.30), ("próximo", 6.62), ("28", 6.92), ("de", 7.46), ("noviembre", 7.70)], 8.08, ["28", "de", "noviembre"]),
    ("1145", [("sábado", 8.10)], 8.50, ["sábado"]),
    ("1145", [("a", 8.52), ("partir", 8.62), ("de", 8.76), ("las", 8.96), ("10", 9.08), ("de", 9.28), ("la", 9.42), ("mañana,", 9.48)], 10.04, ["10", "de@9.28", "la", "mañana,"]),
    ("1145", [("a", 10.14), ("una", 10.50), ("jornada", 10.62)], 11.40, []),
    ("1145", [("de", 11.66), ("salud", 11.80), ("integral,", 12.05)], 12.62, ["salud", "integral,"]),
    ("1145", [("asesoría", 13.00), ("jurídica", 13.54)], 14.14, ["asesoría", "jurídica"]),
    ("1145", [("y", 14.48), ("apoyo", 14.70), ("psicológico", 14.95)], 15.46, ["apoyo", "psicológico"]),
    ("1145", [("gratuito", 15.50)], 16.10, ["gratuito"]),
    ("1145", [("para", 16.18), ("todo", 16.48), ("aquel", 16.66), ("que", 16.90), ("la", 17.00), ("requiera.", 17.08)], 17.56, []),
    ("1146", [("Te", 1.16), ("esperamos", 1.26), ("aquí", 1.60)], 1.88, []),
    ("1146", [("este", 1.92), ("sábado", 2.24)], 2.58, ["sábado"]),
    ("1146", [("en", 2.60), ("el", 2.76), ("Parque", 2.86), ("de", 3.10), ("la", 3.18), ("Reforma", 3.28), ("Social.", 3.48)], 3.90, ["Parque", "de@3.10", "la@3.18", "Reforma", "Social."]),
    ("1149", [("Porque", 0.76), ("aquí", 1.00)], 1.44, []),
    ("1149", [("somos", 1.50), ("justicia,", 1.84)], 2.50, ["somos", "justicia,"]),
    ("1149", [("somos", 2.68), ("salud", 2.92)], 3.60, ["somos", "salud"]),
    ("1149", [("y", 3.74), ("somos", 3.86), ("México.", 4.16)], 4.62, ["somos", "México."]),
]


def build_timing():
    caps = []
    for clip, words, end, hl in CAPTIONS:
        ws = []
        for w, s in words:
            key_plain, key_at = w, f"{w}@{s:.2f}"
            if hl == "name":
                is_hl = True
            elif any(h.startswith(key_plain + "@") for h in hl):
                is_hl = key_at in hl  # palabra repetida: se indica con su tiempo
            else:
                is_hl = key_plain in hl
            ws.append(dict(w=w, t=src_to_out(clip, s), hl=bool(is_hl)))
        caps.append(dict(words=ws, start=ws[0]["t"], end=src_to_out(clip, end), name=hl == "name"))
    # Momentos clave en tiempo de salida
    ev = dict(
        salud=src_to_out("1145", 11.80),
        juridica=src_to_out("1145", 13.00),
        psicologia=src_to_out("1145", 14.70),
        gratuito=src_to_out("1145", 15.50),
        cut1146=edl_out()[5]["t0"],
        parque=src_to_out("1146", 2.86),
        speechEnd1146=src_to_out("1146", 3.72),
        start1149=edl_out()[6]["t0"],
        justicia=src_to_out("1149", 1.84),
        somos1=src_to_out("1149", 1.50),
        somos2=src_to_out("1149", 2.68),
        somos3=src_to_out("1149", 3.86),
        mexico=src_to_out("1149", 4.16),
        speechEnd=src_to_out("1149", 4.54),
        salud2=src_to_out("1149", 2.92),
        hit=HIT,
        end=END,
        mapPin=src_to_out("1146", 3.72) + 0.45,
        mapZoom=edl_out()[6]["t0"],
    )
    (ROOT / "overlay").mkdir(exist_ok=True)
    (ROOT / "overlay/timing.js").write_text(
        "// Generado por build.py timing — no editar a mano\n"
        f"window.CAPTIONS = {json.dumps(caps, ensure_ascii=False, indent=1)};\n"
        f"window.EV = {json.dumps(ev, indent=1)};\n"
    )
    (OUT / "timing.json").write_text(json.dumps(dict(edl=edl_out(), ev=ev), indent=1))
    print(json.dumps(ev, indent=1))
    return ev


def run(cmd):
    print("$", " ".join(str(c) for c in cmd)[:240], "…")
    subprocess.run([str(c) for c in cmd], check=True)


# Color: el footage del iPhone viene en HDR (HLG, BT.2020, 10 bits). Se convierte a SDR BT.709 con
# tone mapping suave (hable) para que se vea como el original, sin etalonado ni realce extra encima.
GRADE = (
    "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
    "tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
)
COLOR_TAGS = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv"]


def build_base():
    edl = edl_out()
    inputs, chains, labels = [], [], []
    for i, e in enumerate(edl):
        d = e["t1"] - e["t0"]
        inputs += ["-ss", f"{max(0, e['s0'] - 1.0):.3f}", "-i", SRC[e["clip"]]]
        pre = e["s0"] - max(0, e["s0"] - 1.0)
        z0, cy = e["z0"], e["cy"]
        # nivel de encuadre por tramos (punch-ins), acercamiento lento y golpes de cámara
        jumps = JUMPS.get(i, [])
        level = f"{jumps[-1][1]}" if jumps else f"{z0}"
        for k in range(len(jumps) - 1, -1, -1):
            prev = jumps[k - 1][1] if k > 0 else z0
            level = f"if(lt(t,{jumps[k][0] - e['s0']:.3f}),{prev},{level})"
        push = f"(1+{PUSH}*(0.5-0.5*cos(PI*min(t/{d:.3f},1))))"
        bump = "0"
        for ts, amp in BUMPS.get(i, []):
            tb = ts - e["s0"]
            bump += f"+{amp}*gte(t,{tb:.3f})*exp(-(t-{tb:.3f})*9)*min(1,(t-{tb:.3f})/0.05)"
        zexpr = f"(({level})*{push}+({bump}))"
        if i == 0:
            # entrada: el plano llega desde 1.16 con ease-out justo cuando abre la cortinilla
            reveal = 1.10 - START  # tiempo local en que empieza la apertura
            zexpr = f"(if(lt(t,{reveal:.3f}),1.16,1.16-(1.16-{zexpr})*(1-pow(1-min((t-{reveal:.3f})/0.85,1),3))))"
        # zoom por cuadro: escalar y recortar al centro (y anclado cerca del rostro)
        sw = f"2*trunc({OW}*{zexpr}/2)"
        sh = f"2*trunc({OH}*{zexpr}/2)"
        # centro x por tramo (opcional, tercer valor del salto); por defecto, centro del cuadro
        xs = [(j[0], j[2] if len(j) > 2 else W / 2) for j in jumps]
        xc = f"{xs[-1][1]}" if xs else f"{W / 2}"
        for k in range(len(xs) - 1, -1, -1):
            prev = xs[k - 1][1] if k > 0 else W / 2
            xc = f"if(lt(t,{xs[k][0] - e['s0']:.3f}),{prev},{xc})"
        cx = f"max(0,min(iw-{OW},({xc})*{SCALE}*iw/{OW}-{OW}/2))"
        cyx = f"max(0,min(ih-{OH},{cy * SCALE}*ih/{OH}-{cy * SCALE}))"
        hold = HOLD_AFTER.get(i, 0.0)
        tail = END - e["t1"] if i == len(edl) - 1 else hold
        chain = (
            f"[{i}:v]trim=start={pre:.3f}:duration={d:.3f},setpts=PTS-STARTPTS,fps={FPS},"
            f"setsar=1,{GRADE},"
            f"scale=w='{sw}':h='{sh}':flags=lanczos:eval=frame,"
            f"crop={OW}:{OH}:x='{cx}':y='{cyx}',setsar=1,format=yuv420p"
        )
        if i == 0:
            chain += f",tpad=start_duration={START:.3f}:start_mode=clone"
        if tail > 0:
            chain += f",tpad=stop_duration={tail:.3f}:stop_mode=clone"
        chain += f",settb=1/{FPS * 1000}[v{i}]"
        chains.append(chain)
        labels.append(f"[v{i}]")
    fc = ";".join(chains) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=1:a=0,fps={FPS},trim=duration={END:.3f}[out]"
    run(["ffmpeg", "-v", "error", "-stats", "-y", *inputs, "-filter_complex", fc, "-map", "[out]",
         "-c:v", "libx264", "-preset", "fast", "-crf", "13", "-pix_fmt", "yuv420p", *COLOR_TAGS, "-r", FPS, OUT / "base.mp4"])


# ---------------------------------------------------------------- audio

def read_wav(p):
    with wave.open(str(p)) as w:
        n = w.getnframes()
        ch = w.getnchannels()
        x = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
        return x.reshape(-1, ch).T


def write_wav(p, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.stack([x, x])
    with wave.open(str(p), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x.T * 32767).astype(np.int16).tobytes())


def decode(src, dst, extra_af=None, ch=1):
    af = ["-af", extra_af] if extra_af else []
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", *af, "-ac", ch, "-ar", SR, dst])


rng = np.random.default_rng(7)


def env_ad(n, a, d_curve=4.0):
    t = np.linspace(0, 1, n)
    na = max(1, int(a * SR))
    e = np.exp(-d_curve * t)
    e[:na] *= np.linspace(0, 1, na)
    return e


def lp(x, fc):
    """Filtro paso bajo de un polo (fc puede variar en el tiempo)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def bandnoise(n, f_lo, f_hi):
    """Ruido filtrado por banda móvil (barrido) vía FFT por bloques."""
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 1024
    hop = 512
    win = np.hanning(blk)
    lo = np.broadcast_to(f_lo, (n,))
    hi = np.broadcast_to(f_hi, (n,))
    freqs = np.fft.rfftfreq(blk, 1 / SR)
    for s in range(0, n - blk, hop):
        seg = noise[s:s + blk] * win
        sp = np.fft.rfft(seg)
        c = s + blk // 2
        l, h = lo[c], hi[c]
        mask = 1 / (1 + ((freqs - (l + h) / 2) / max(1, (h - l) / 2)) ** 4)
        out[s:s + blk] += np.fft.irfft(sp * mask) * win
    return out / (np.abs(out).max() + 1e-9)


def reverb(x, secs=1.2, mix=0.25, bright=4000):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, bright)
    ir /= np.sqrt((ir ** 2).sum())
    wet = np.convolve(x, ir)
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry * (1 - mix) + wet * mix * 3


def sfx_whoosh(dur=0.55, rise=0.6, lo=300, hi=6000, up=True):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    shape = np.where(t < rise, (t / rise) ** 2, np.exp(-(t - rise) / (1 - rise) * 5))
    if up:
        f = lo + (hi - lo) * np.where(t < rise, t / rise, 1 - (t - rise) / (1 - rise) * 0.6)
    else:
        f = hi - (hi - lo) * t
    x = bandnoise(n, f * 0.5, f * 1.5) * shape
    return reverb(x, 0.6, 0.18)


def sfx_pop(f0=520, dur=0.16):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 1.4 * np.exp(-t * 60))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 28)
    click = bandnoise(n, 2000, 7000) * np.exp(-t * 300) * 0.25
    return reverb((x + click) * 0.9, 0.35, 0.12)


def sfx_hit(dur=3.2):
    """Golpe cinematográfico: sub + bombo grave + tambor/taiko + cola con reverb."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 42 + 90 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    f2 = 95 + 160 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f2) / SR) * np.exp(-t * 7)
    skin = bandnoise(n, 150, 1400) * np.exp(-t * 16) * 0.55
    crack = bandnoise(n, 2500, 9000) * np.exp(-t * 60) * 0.35
    x = sub * 1.0 + body * 0.7 + skin + crack
    x = np.tanh(x * 1.6) / np.tanh(1.6)
    y = reverb(x, 2.6, 0.32, bright=2500)[:n]
    return y


def sfx_riser(dur=0.9):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    f = 400 + 7000 * t ** 2
    x = bandnoise(n, f * 0.6, f * 1.4) * (t ** 2.2)
    x[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return x


def sfx_shimmer(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k, f in enumerate([2093, 2637, 3136, 4186]):
        x += np.sin(2 * np.pi * f * t + k) * np.exp(-t * 3.5) * (1 - np.exp(-t * 40)) * 0.25
    x *= 0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)
    return reverb(x, 1.2, 0.35)


def place(buf, x, at, gain_db):
    g = 10 ** (gain_db / 20)
    i = int(at * SR)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * g


def build_audio(ev=None):
    ev = ev or json.loads((OUT / "timing.json").read_text())["ev"]
    tmp = OUT / "atmp"
    tmp.mkdir(exist_ok=True)
    total = int(END * SR) + SR
    voice = np.zeros(total)
    # Voz limpia por toma: paso alto, reducción de ruido suave, presencia y compresión
    vchain = ("highpass=f=85,afftdn=nr=10:nf=-42,"
              "equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.0:g=2.5,"
              "acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=4")
    clips = {}
    for c, p in SRC.items():
        decode(p, tmp / f"v_{c}.wav", vchain)
        clips[c] = read_wav(tmp / f"v_{c}.wav")[0] * 10 ** (VOICE_GAIN_DB[c] / 20)
    fade = int(0.012 * SR)
    for e in edl_out():
        # la reducción de ruido (afftdn) retrasa la voz 25 ms: se compensa para sincronía exacta con los labios
        lat = VOICE_LATENCY
        x = clips[e["clip"]][int((e["s0"] + lat) * SR): int((e["s1"] + lat) * SR)].copy()
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
        place(voice, x, e["t0"], 0)

    # Música (instrumental de "audio_video_servicios_2"), 109 BPM: primer tiempo en 0.145 s
    decode(A / "music/servicios_2.mp4", tmp / "music.wav", None, 2)
    mus = read_wav(tmp / "music.wav")
    mus = mus[:, :total]
    if mus.shape[1] < total:
        mus = np.pad(mus, ((0, 0), (0, total - mus.shape[1])))
    t = np.arange(total) / SR
    # Automatización: arriba en la cortinilla y el mapa, abajo bajo la voz, corte seco en el golpe final
    pts = [
        (0.00, -4.0), (1.55, -4.0), (1.95, -15.5),          # entra la voz
        (ev["speechEnd1146"] + 0.05, -15.5), (ev["speechEnd1146"] + 0.35, -7.0),  # mapa
        (ev["start1149"] + 0.35, -7.0), (ev["start1149"] + 0.55, -15.5),
        (ev["speechEnd"] - 0.05, -15.5), (ev["speechEnd"] + 0.25, -9.0),
        (HIT - 0.04, -6.0), (HIT, -60.0), (END + 1, -60.0),
    ]
    tp, gp = zip(*pts)
    gain = 10 ** (np.interp(t, tp, gp) / 20)
    music = mus * gain

    sfx = np.zeros(total)
    # Cortinilla de entrada: letras de SOMOS en semicorcheas, golpe, brillo y zoom a través de la O
    S16 = 60 / 109 / 4
    place(sfx, sfx_whoosh(0.45, 0.5, 500, 7000), 0.00, -13)
    for k in range(5):
        place(sfx, sfx_pop(380 + 70 * k, 0.11), 0.145 + k * S16 + 0.03, -12)
    tl_hit = 0.145 + 4 * S16 + 0.12
    place(sfx, sfx_hit(1.4), tl_hit, -11)
    place(sfx, sfx_shimmer(0.9), tl_hit + 0.08, -21)
    place(sfx, sfx_riser(0.45), 1.12 - 0.2, -16)
    place(sfx, sfx_whoosh(0.6, 0.45, 300, 6500), 1.10, -9)
    # Íconos de servicios
    for key, f0 in [("salud", 760), ("juridica", 640), ("psicologia", 860)]:
        place(sfx, sfx_pop(f0, 0.14), ev[key] - 0.06, -16)
    place(sfx, sfx_pop(900, 0.12), ev["juridica"] + 0.18, -18)
    # Barrido de marca entre 1145 y 1146
    place(sfx, sfx_whoosh(0.55, 0.5, 400, 6500), ev["cut1146"] - 0.30, -11)
    # Mapa: entra la tarjeta, cae el pin, zoom a través del pin
    place(sfx, sfx_whoosh(0.4, 0.5, 600, 5000), ev["parque"] - 0.22, -15)
    place(sfx, sfx_pop(520, 0.16), ev["parque"] + 0.25, -13)
    place(sfx, sfx_pop(420, 0.2), MAP_PIN, -10)
    place(sfx, sfx_whoosh(0.5, 0.45, 500, 6000), ev["speechEnd1146"] + 0.02, -15)
    place(sfx, sfx_riser(0.55), MAP_ZOOM - 0.30, -13)
    place(sfx, sfx_whoosh(0.6, 0.35, 300, 7000), MAP_ZOOM, -10)
    # Cada "somos" del subtítulo es el logo: las letras entran una a una
    for key in ("somos1", "somos2", "somos3"):
        for k in range(5):
            place(sfx, sfx_pop(480 + 60 * k, 0.1), ev[key] - 0.02 + k * 0.04, -21)
    # Cierre: subida + golpe dramático + brillo
    place(sfx, sfx_riser(HIT - ev["speechEnd"] + 0.05), ev["speechEnd"] - 0.05, -9)
    place(sfx, sfx_whoosh(0.5, 0.8, 200, 4000), HIT - 0.42, -9)
    place(sfx, sfx_hit(), HIT - 0.005, -6)
    place(sfx, sfx_shimmer(), HIT + 0.55, -20)

    for name, stem in (("voz", voice), ("musica", music.mean(0)), ("efectos", sfx)):
        write_wav(tmp / f"stem_{name}.wav", stem[: int(END * SR)] * 0.7)
    mix = np.stack([voice, voice]) + music + np.stack([sfx, sfx])
    mix = mix[:, : int(END * SR)]
    write_wav(tmp / "premix.wav", mix * 0.7)
    # Masterizado para redes: -14 LUFS, pico -1 dBTP
    run(["ffmpeg", "-v", "error", "-y", "-i", tmp / "premix.wav", "-af",
         "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=summary", "-ar", SR, OUT / "mix.wav"])




def build_final():
    frames = OUT / "overlay"
    run(["ffmpeg", "-v", "error", "-stats", "-y",
         "-i", OUT / "base.mp4",
         "-framerate", FPS, "-i", frames / "%05d.png",
         "-i", OUT / "mix.wav",
         "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v]",
         "-map", "[v]", "-map", "2:a",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "5.2",
         "-pix_fmt", "yuv420p", *COLOR_TAGS, "-r", FPS, "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart",
         "-t", f"{END:.3f}", OUT / "parque_reforma_social_4k.mp4"])
    # versión 1080x1920 ligera para mensajería, a partir del máster 4K
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "parque_reforma_social_4k.mp4",
         "-vf", f"scale={W}:{H}:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "20",
         "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p", *COLOR_TAGS, "-c:a", "copy", "-movflags", "+faststart",
         OUT / "parque_reforma_social_1080.mp4"])


if __name__ == "__main__":
    steps = sys.argv[1:] or ["timing", "base", "audio"]
    ev = build_timing()
    MAP_PIN = ev["mapPin"]
    MAP_ZOOM = ev["mapZoom"]
    for s in steps:
        if s == "base":
            build_base()
        elif s == "audio":
            build_audio(ev)
        elif s == "final":
            build_final()

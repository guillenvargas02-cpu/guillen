#!/usr/bin/env python3
"""Intro "Favor de leer antes de opinar" — sonido y entrega final en 4K vertical.

Pasos:
  python3 make_assets.py                      # texturas (portada HD, páginas, guardas, grano)
  python3 build.py audio                      # diseño de sonido sincronizado -> assets/sfx.wav
  npx hyperframes render --fps 240 --resolution portrait-4k --crf 8 -o renders/raw240.mp4
  python3 build.py final                      # desenfoque de movimiento real (4 subcuadros) -> 30 fps + audio

El desenfoque de movimiento: se renderiza a 240 fps (8 subcuadros por cuadro final de 30 fps) y se
promedian los 4 primeros, como un obturador de cine de 180°: las hojas que pasan rápido se ven barridas,
como en cámara real, sin fantasmas.
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "renders"
SR = 48000
DUR = 4.0
N_S = int(SR * DUR)
rng = np.random.default_rng(1112)

# ---- tiempos (idénticos a index.html) ----
T_OPEN, T_CLOSE, IMPACT, N = 0.58, 2.1, 2.62, 12
GAPS = [0.12, 0.1, 0.085, 0.07, 0.06, 0.055, 0.052, 0.055, 0.062, 0.075, 0.09]


def flip_schedule():
    fw = []  # (inicio, duración) de ida
    t = T_OPEN + 0.27
    for i in range(1, N + 1):
        d = 0.34 if i <= 2 else 0.3 if i >= N - 1 else 0.25
        fw.append((t, d))
        t += GAPS[i - 1] if i - 1 < len(GAPS) else 0
    back = [(T_CLOSE + (N - i) * 0.017, 0.27) for i in range(N, 0, -1)]
    return fw, back


# ---------------- utilidades DSP ----------------
def tvec(n):
    return np.arange(n) / SR


def env_ar(n, a, r, curve=4.0):
    t = tvec(n)
    e = np.minimum(1.0, t / max(a, 1e-4))
    e *= np.exp(-np.maximum(0, t - a) * curve / max(r, 1e-4))
    return e


def fft_filter(x, lo=None, hi=None, slope=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** (2 * slope))
    if hi:
        m *= 1 / (1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(X * m, len(x))


def sweep_filter(x, lo_fn, hi_fn, win=2048, hop=512):
    """Filtro paso banda variable en el tiempo (STFT con solapamiento)."""
    n = len(x)
    pad = np.concatenate([np.zeros(win), x, np.zeros(win)])
    out = np.zeros_like(pad)
    norm = np.zeros_like(pad)
    w = np.hanning(win)
    f = np.fft.rfftfreq(win, 1 / SR)
    for s in range(0, len(pad) - win, hop):
        tc = (s + win / 2 - win) / SR
        lo, hi = lo_fn(tc), hi_fn(tc)
        m = np.ones_like(f)
        if lo:
            m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
        if hi:
            m *= 1 / (1 + (f / hi) ** 4)
        seg = np.fft.irfft(np.fft.rfft(pad[s : s + win] * w) * m, win)
        out[s : s + win] += seg * w
        norm[s : s + win] += w * w
    out /= np.maximum(norm, 1e-6)
    return out[win : win + n]


class Mix:
    def __init__(self):
        self.L = np.zeros(N_S + SR)
        self.R = np.zeros(N_S + SR)

    def add(self, sig, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), len(self.L) - i)
        gl = gain * np.cos((pan + 1) * np.pi / 4)
        gr = gain * np.sin((pan + 1) * np.pi / 4)
        self.L[i : i + n] += sig[:n] * gl * np.sqrt(2)
        self.R[i : i + n] += sig[:n] * gr * np.sqrt(2)

    def add_st(self, l, r, t, gain=1.0):
        i = int(round(t * SR))
        n = min(len(l), len(self.L) - i)
        self.L[i : i + n] += l[:n] * gain
        self.R[i : i + n] += r[:n] * gain


def noise(n):
    return rng.standard_normal(n)


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


# ---------------- sonidos ----------------
def page_swish(d):
    """Aire de una hoja que pasa: ruido de papel que crece y termina en el golpe."""
    n = int((d + 0.12) * SR)
    t = tvec(n)
    x = fft_filter(noise(n), 900, 7500)
    p = np.clip(t / d, 0, 1)
    e = np.sin(np.pi * np.clip(p * 0.95, 0, 1)) ** 1.5 * (t < d + 0.02)
    # aleteo: modulación rápida del papel
    flutter = 0.65 + 0.35 * np.sin(2 * np.pi * (28 + 20 * rng.random()) * t + rng.random() * 6)
    return norm(x * e * flutter)


def page_snap():
    """Golpe seco de la hoja al caer sobre las demás."""
    n = int(0.12 * SR)
    t = tvec(n)
    crack = fft_filter(noise(n), 1800, 9000) * np.exp(-t * 90)
    body = fft_filter(noise(n), 120, 900) * np.exp(-t * 45)
    thump = np.sin(2 * np.pi * 170 * t) * np.exp(-t * 60)
    return norm(0.7 * crack + 0.6 * body + 0.4 * thump)


def whoosh(d, f0, f1, peak=0.85):
    n = int(d * SR)
    t = tvec(n)
    p = t / d
    e = np.where(p < peak, (p / peak) ** 2.2, np.exp(-(p - peak) / (1 - peak) * 5))
    x = sweep_filter(noise(n), lambda tc: f0 * (f1 / f0) ** np.clip(tc / d, 0, 1) * 0.5,
                     lambda tc: f0 * (f1 / f0) ** np.clip(tc / d, 0, 1) * 2.2)
    return norm(x * e)


def boom(d=1.8, f0=62, f1=31, punch=True):
    n = int(d * SR)
    t = tvec(n)
    f = f1 + (f0 - f1) * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.tanh(1.6 * np.sin(ph)) * np.exp(-t * 2.2)
    out = sub
    if punch:
        out = out + 0.9 * fft_filter(noise(n), 40, 260) * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 110 * t) * np.exp(-t * 30)
    return norm(out)


def slam():
    """El libro cerrándose: golpe de tapa dura."""
    n = int(0.5 * SR)
    t = tvec(n)
    crack = fft_filter(noise(n), 700, 6000) * np.exp(-t * 55)
    wood = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(132, 26), (248, 34), (410, 45)])
    air = fft_filter(noise(n), 80, 600) * np.exp(-t * 14)
    return norm(0.9 * crack + 0.6 * wood + 0.8 * air)


def riser(d):
    """Platillo invertido / succión antes del golpe."""
    n = int(d * SR)
    t = tvec(n)
    p = t / d
    x = sweep_filter(noise(n), lambda tc: 400 + 5000 * np.clip(tc / d, 0, 1) ** 2, lambda tc: 3000 + 12000 * np.clip(tc / d, 0, 1))
    return norm(x * p ** 3.2)


def shimmer(d=1.4):
    """Destello brillante cuando la luz barre la portada."""
    n = int(d * SR)
    t = tvec(n)
    out = np.zeros(n)
    for k, (f, a) in enumerate([(1174.7, 1), (1760, 0.8), (2349.3, 0.6), (2637, 0.45), (3520, 0.35), (4698.6, 0.25)]):
        det = 1 + (rng.random() - 0.5) * 0.004
        att = 0.25 + 0.08 * k
        e = np.minimum(1, t / att) * np.exp(-np.maximum(0, t - att) * 2.8)
        out += a * np.sin(2 * np.pi * f * det * t + rng.random() * 6) * e
    out *= 0.7 + 0.3 * np.sin(2 * np.pi * 6.5 * t)
    out += 0.25 * fft_filter(noise(n), 6000, 14000) * np.minimum(1, t / 0.3) * np.exp(-t * 3)
    return norm(out)


def drone():
    """Colchón grave en Re menor: tensión que crece hasta el impacto y respira después."""
    t = tvec(N_S)
    x = np.zeros(N_S)
    for f, a in [(73.42, 1.0), (110.0, 0.55), (146.83, 0.45), (174.61, 0.22)]:
        for det in (0.997, 1.003):
            for h in range(1, 10):
                x += a / h * np.sin(2 * np.pi * f * det * h * t + h * det * 3)
    cut = lambda tc: 260 + 900 * np.clip(tc / IMPACT, 0, 1) ** 2 if tc < IMPACT else 1400 * np.exp(-(tc - IMPACT) * 1.4) + 350
    x = sweep_filter(x, lambda tc: 30, cut)
    e = np.clip(t / 0.5, 0, 1) * (0.5 + 0.5 * np.clip(t / IMPACT, 0, 1) ** 2)
    e = np.where(t < IMPACT - 0.04, e, np.where(t < IMPACT, e * (1 - (t - IMPACT + 0.04) / 0.04 * 0.85), 0.15 + 0.6 * np.exp(-(t - IMPACT) * 1.5)))
    return norm(x * e)


def reverb_ir(d=2.4):
    n = int(d * SR)
    t = tvec(n)
    irs = []
    for _ in range(2):
        ir = noise(n) * np.exp(-t * 3.0)
        ir = fft_filter(ir, 120, 7000)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        irs.append(ir / np.sqrt(np.sum(ir**2)))
    return irs


def convolve(x, ir):
    n = len(x) + len(ir) - 1
    nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[: len(x)]


def build_audio():
    fw, back = flip_schedule()
    dry = Mix()
    send = Mix()  # a la reverb

    # 0) golpe de apertura suave + colchón
    dry.add(boom(1.6, 55, 30, punch=False), 0.0, 0.3)
    dr = drone()
    dry.add(dr, 0.0, 0.1, -0.15)
    dry.add(dr, 0.0, 0.1, 0.15)

    # 1) aire que acerca el libro y abre la tapa
    w = whoosh(0.75, 250, 2200)
    dry.add(w, 0.0, 0.35, -0.4)
    send.add(w, 0.0, 0.25)
    dry.add(whoosh(0.5, 120, 900, 0.5), T_OPEN - 0.05, 0.5, -0.2)  # tapa levantándose
    land = T_OPEN + 0.44 * 0.92
    dry.add(page_snap(), land, 0.55, -0.5)
    dry.add(boom(0.5, 120, 70, punch=False), land, 0.3)

    # 2) ráfaga de hojas: aire de cada hoja + golpe al caer + aleteo continuo
    for k, (t0, d) in enumerate(fw):
        pan = -0.25 + 0.5 * ((k * 7) % 5) / 4
        dry.add(page_swish(d), t0, 0.32, pan)
        snap_t = t0 + d * 0.9
        dry.add(page_snap(), snap_t, 0.42 + 0.1 * rng.random(), -pan * 0.6)
        send.add(page_snap(), snap_t, 0.12)
    a, b = fw[0][0], fw[-1][0] + fw[-1][1]
    n = int((b - a) * SR)
    tt = tvec(n)
    rate = 9 + 9 * np.sin(np.pi * np.clip(tt / (b - a), 0, 1))
    am = 0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(rate) / SR) ** 2
    bed = fft_filter(noise(n), 1200, 6500) * am * np.sin(np.pi * tt / (b - a)) ** 0.7
    dry.add(norm(bed), a, 0.16)

    # 3) cierre: las hojas regresan en cascada (brrrt) + succión hacia el golpe
    a = back[0][0]
    n = int((IMPACT - a) * SR)
    tt = tvec(n)
    am = 0.45 + 0.55 * np.abs(np.sin(2 * np.pi * np.cumsum(30 + 40 * tt / (IMPACT - a)) / SR))
    rr = fft_filter(noise(n), 900, 8000) * am * (tt / (IMPACT - a)) ** 1.2
    dry.add(norm(rr), a, 0.35, 0.2)
    rs = riser(0.75)
    dry.add(rs, IMPACT - 0.75, 0.32)
    send.add(rs, IMPACT - 0.75, 0.2)

    # 4) IMPACTO: golpe de tapa + sub grave + cola de reverb
    dry.add(slam(), IMPACT, 0.95)
    send.add(slam(), IMPACT, 0.6)
    dry.add(boom(2.0, 64, 30), IMPACT, 1.0)
    send.add(boom(1.0, 90, 40), IMPACT, 0.35)

    # 5) brillo de la luz sobre la portada
    sh = shimmer(1.4)
    dry.add(sh, IMPACT + 0.28, 0.16, 0.3)
    send.add(sh, IMPACT + 0.28, 0.2)

    # reverb estéreo (sala grande)
    irL, irR = reverb_ir()
    wet_in = (send.L + send.R) * 0.5
    L = dry.L + 0.55 * convolve(wet_in, irL)
    R = dry.R + 0.55 * convolve(wet_in, irR)
    L, R = L[:N_S], R[:N_S]
    t = tvec(N_S)
    fade = np.clip((DUR - t) / 0.35, 0, 1) ** 1.5
    L, R = L * fade, R * fade
    pk = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L, R = np.tanh(1.4 * L / pk) / np.tanh(1.4), np.tanh(1.4 * R / pk) / np.tanh(1.4)
    st = np.stack([L, R], 1) * 0.89
    raw = OUT / "sfx_raw.wav"
    with wave.open(str(raw), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((st * 32767).astype("<i2").tobytes())
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), ROOT / "assets" / "sfx.wav"])


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def build_final():
    raw = OUT / "raw240.mp4"
    if not raw.exists():
        sys.exit("Falta renders/raw240.mp4: renderiza primero con hyperframes a 240 fps (ver arriba).")
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", ROOT / "assets" / "sfx.wav",
         "-filter_complex",
         # 8 subcuadros por cuadro; se promedian 4 -> obturador de 180°, luego 30 fps
         "[0:v]format=gbrp,tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\\,8)\\,3)',setpts=N/30/TB,"
         "format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "1:a", "-r", "30", "-t", str(DUR),
         "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-profile:v", "high", "-level", "5.2",
         "-pix_fmt", "yuv420p", "-maxrate", "80M", "-bufsize", "160M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
         OUT / "intro-favor-de-leer-4k.mp4"]
    )


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for s in sys.argv[1:] or ["audio", "final"]:
        {"audio": build_audio, "final": build_final}[s]()

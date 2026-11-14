"""Diseño sonoro sintetizado (determinista) sincronizado con index.html.

Genera renders/sfx.wav (48 kHz, estéreo). Todos los efectos se sintetizan aquí: whooshes,
impactos con sub, clics de obturador, máquina de escribir, pops, glitch, risers y brillos.
"""
import numpy as np
import wave
from pathlib import Path

SR = 48000
DUR = 29.5
OUT = Path(__file__).resolve().parent.parent / "renders" / "sfx.wav"
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a, d, curve=3.0):
    """Ataque lineal a, caída exponencial hasta el final."""
    x = np.ones(n)
    na = max(1, int(a * SR))
    x[:na] = np.linspace(0, 1, na)
    tail = np.linspace(0, 1, n - na) if n > na else np.array([])
    x[na:] = np.exp(-curve * tail * (n / SR) / max(d, 1e-3))
    return x


def bandpass(x, f_lo, f_hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= f_lo) & (f <= f_hi)).astype(float)
    # bordes suaves
    k = min(64, len(m) // 2 * 2 - 1)
    if k > 3:
        m = np.convolve(m, np.hanning(k) / np.hanning(k).sum(), "same")
    return np.fft.irfft(X * m, len(x))


def sweep_filter(noise, f0, f1, q=0.5):
    """Ruido filtrado con un pasabanda cuya frecuencia central barre de f0 a f1 (por bloques)."""
    out = np.zeros_like(noise)
    blk = 1024
    n = len(noise)
    for i in range(0, n, blk // 2):
        seg = noise[i:i + blk]
        if len(seg) < 32:
            break
        k = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        w = np.hanning(len(seg))
        out[i:i + len(seg)] += bandpass(seg * w, fc * (1 - q), fc * (1 + q)) * 0.5
    return out


def reverb(x, decay=1.2, mix=0.25):
    n = int(decay * SR)
    ir = rng.standard_normal(n) * np.exp(-6 * np.arange(n) / n)
    ir = bandpass(ir, 200, 9000)
    ir /= np.abs(ir).sum() ** 0.5 * 8
    y = np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n), len(x) + n)
    out = np.zeros(len(x) + n)
    out[:len(x)] += x * (1 - mix)
    out += y * mix
    return out


def norm(x, peak):
    m = np.abs(x).max()
    return x / m * peak if m > 0 else x


# ── Instrumentos ──
def whoosh(d=0.6, f0=300, f1=4000, peak=0.5, rev=True, shape=(0.55, 0.45)):
    n = int(d * SR)
    x = sweep_filter(rng.standard_normal(n), f0, f1, 0.6)
    a = int(shape[0] * n)
    e = np.r_[np.linspace(0, 1, a) ** 2, np.linspace(1, 0, n - a) ** 1.5]
    x = norm(x * e, peak)
    return reverb(x, 0.8, 0.2) if rev else x


def impact(peak=0.9, sub=48, d=1.6):
    t = t_(d)
    f = sub + 90 * np.exp(-t * 18)  # pitch drop
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    crack = bandpass(rng.standard_normal(len(t)), 800, 9000) * np.exp(-t * 28)
    mid = bandpass(rng.standard_normal(len(t)), 120, 900) * np.exp(-t * 7)
    x = body * 1.0 + norm(crack, 0.5) + norm(mid, 0.35)
    return norm(reverb(x, 2.0, 0.3), peak)


def soft_hit(peak=0.5):
    t = t_(0.9)
    f = 70 + 60 * np.exp(-t * 20)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    x += norm(bandpass(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 40), 0.2)
    return norm(reverb(x, 1.2, 0.25), peak)


def shimmer(d=1.6, base=1318.5, peak=0.22):
    t = t_(d)
    x = np.zeros_like(t)
    for k, (m, a) in enumerate([(1, 1), (1.5, .6), (2, .5), (3, .3), (4.02, .2)]):
        x += a * np.sin(2 * np.pi * base * m * t + k) * np.exp(-t * (2.2 + k))
    x *= np.minimum(1, t / 0.01)
    return norm(reverb(x, 1.8, 0.45), peak)


def tick(peak=0.35, f=2400, d=0.05):
    t = t_(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + bandpass(rng.standard_normal(len(t)), 2000, 10000) * np.exp(-t * 160) * 0.6
    return norm(x, peak)


def thock(peak=0.4):
    t = t_(0.18)
    x = np.sin(2 * np.pi * (180 + 300 * np.exp(-t * 60)) * t) * np.exp(-t * 30)
    x += bandpass(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 120) * 0.5
    return norm(x, peak)


def pop(peak=0.35, f=600):
    t = t_(0.14)
    fr = f * (1 + 1.2 * np.exp(-t * 50))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 32)
    return norm(x, peak)


def shutter(peak=0.55):
    t = t_(0.16)
    a = bandpass(rng.standard_normal(len(t)), 1500, 12000) * np.exp(-t * 90)
    b = np.zeros_like(t)
    o = int(0.06 * SR)
    b[o:] = bandpass(rng.standard_normal(len(t) - o), 1000, 9000) * np.exp(-np.arange(len(t) - o) / SR * 110)
    x = a + 0.8 * b + 0.3 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 60)
    return norm(x, peak)


def beep(peak=0.18, f=2900):
    t = t_(0.06)
    x = np.sin(2 * np.pi * f * t) * np.minimum(1, (0.06 - t) / 0.01) * np.minimum(1, t / 0.004)
    return norm(x, peak)


def key(peak=0.32, seed=0):
    r = np.random.default_rng(seed)
    t = t_(0.07)
    x = bandpass(r.standard_normal(len(t)), 1200, 7000) * np.exp(-t * 140)
    x += np.sin(2 * np.pi * (900 + 200 * r.random()) * t) * np.exp(-t * 200) * 0.4
    return norm(x, peak * (0.85 + 0.3 * r.random()))


def riser(d=2.0, peak=0.35, f0=200, f1=6000):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = sweep_filter(rng.standard_normal(n), f0, f1, 0.35)
    tone = np.sin(2 * np.pi * np.cumsum(110 * (8 ** (t / d))) / SR) * 0.25
    e = (t / d) ** 2.2
    return norm((norm(x, 1) + tone) * e, peak)


def reverse_swell(d=0.5, peak=0.45):
    x = whoosh(d, 6000, 400, 1.0, rev=False, shape=(0.95, 0.05))
    return norm(x, peak)


def glitch(d=0.25, peak=0.4):
    n = int(d * SR)
    x = rng.standard_normal(n)
    hold = 24
    x = np.repeat(x[::hold], hold)[:n]  # sample & hold (bitcrush)
    gate = (np.floor(np.arange(n) / (SR * 0.025)) % 2 == 0).astype(float)
    tone = np.sign(np.sin(2 * np.pi * 440 * np.arange(n) / SR)) * 0.3
    return norm(bandpass((x + tone) * gate, 300, 8000), peak)


def servo(peak=0.12):
    t = t_(0.35)
    f = 900 + 1400 * t / 0.35
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 60 * t))
    return norm(x * np.minimum(1, t / 0.03) * np.minimum(1, (0.35 - t) / 0.05), peak)


# ── Línea de tiempo (segundos de video) ──
EVENTS = [
    # intro: el celular aparece, enciende (clic + campana suave) y la cámara entra a la pantalla
    (0.0, whoosh(1.2, 200, 1200, 0.18), 0.0), (0.66, tick(0.3, 1600, 0.04), 0.0),
    (0.72, shimmer(2.2, 1046.5, 0.22), 0.0), (0.74, soft_hit(0.3), 0.0),
    (2.45, riser(0.95, 0.3, 300, 7000), 0.0), (3.2, whoosh(0.45, 400, 5000, 0.4), -0.3),
    # cartel
    (3.55, thock(0.35), 0.0), (3.75, thock(0.4), 0.1),
    (3.95, whoosh(0.35, 800, 6000, 0.3, rev=False), 0.3), (4.0, whoosh(0.6, 250, 1500, 0.3), -0.5),
    (4.3, pop(0.25, 900), 0.4), (4.35, pop(0.22, 1100), 0.5), (4.4, pop(0.2, 1300), 0.6),
    (5.22, whoosh(0.35, 500, 7000, 0.35, rev=False), 0.0),
    # ráfaga
    (5.5, shutter(0.45), -0.2), (6.0, shutter(0.45), 0.2), (6.5, shutter(0.45), -0.2), (7.0, shutter(0.45), 0.2),
    (5.5, riser(1.95, 0.38), 0.0), (7.1, reverse_swell(0.4, 0.4), 0.0),
    # drop
    (7.5, impact(0.95), 0.0),
    # 01 comunicación
    (7.95, pop(0.3, 500), -0.2), (8.82, whoosh(0.45, 500, 3500, 0.3), 0.4),
    (9.0, tick(0.25, 2000), -0.3), (9.18, tick(0.25, 2400), 0.0), (9.36, tick(0.25, 2800), 0.3),
    (10.15, whoosh(0.5, 300, 6000, 0.5), -0.4), (10.25, whoosh(0.45, 600, 8000, 0.35), 0.4),
    # 02 redes
    (10.5, whoosh(0.5, 250, 2500, 0.3), 0.0), (11.25, whoosh(0.55, 400, 5000, 0.4), 0.0),
    *[(11.45 + 0.09 * i, pop(0.2, 520 + 90 * i), -0.6 + 0.24 * i) for i in range(6)],
    (13.5, whoosh(0.5, 300, 9000, 0.45, rev=False, shape=(0.9, 0.1)), 0.0), (13.98, soft_hit(0.4), 0.0),
    # 03 imagen
    (14.48, shutter(0.55), 0.0), (15.16, shutter(0.65), 0.0), (16.6, whoosh(0.4, 4000, 300, 0.4, rev=False, shape=(0.8, 0.2)), 0.0),
    # 04 narrativa
    (17.0, whoosh(0.45, 300, 3000, 0.35), 0.0),
    *[(17.12 + 0.065 * i, key(0.3, i), -0.3 + 0.07 * i) for i in range(9)],
    (17.45, whoosh(0.7, 200, 2000, 0.3), 0.3), (18.0, whoosh(0.5, 600, 4000, 0.18), -0.3),
    # 05 impresiones
    (20.3, glitch(0.25, 0.45), 0.0), (20.55, whoosh(0.5, 500, 5000, 0.3), 0.0),
    *[(20.6 + 0.04 * i, tick(0.12, 1800 + 120 * i, 0.03), 0.0) for i in range(11)],
    (20.75, whoosh(0.7, 200, 1800, 0.3), -0.2), (21.25, pop(0.3, 450), 0.4),
    # cierre
    (22.95, reverse_swell(0.5, 0.45), 0.0), (23.45, impact(0.9, 42, 2.2), 0.0),
    (23.45, whoosh(0.7, 200, 4000, 0.45), 0.0), (24.05, shimmer(2.2, 1046.5, 0.22), 0.0),
    (26.1, whoosh(0.6, 400, 7000, 0.4), 0.3), (26.55, shimmer(2.6, 1567.98, 0.16), 0.0),
    (27.05, pop(0.24, 760), 0.0),
]


def main():
    n = int(DUR * SR) + SR
    L = np.zeros(n)
    R = np.zeros(n)
    for t0, x, pan in EVENTS:
        i = int(t0 * SR)
        x = x[: n - i]
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        L[i:i + len(x)] += x * gl * 1.41
        R[i:i + len(x)] += x * gr * 1.41
    st = np.stack([L, R], 1)[: int(DUR * SR)]
    st = np.tanh(st * 1.1) / np.tanh(1.1)  # limitador suave
    OUT.parent.mkdir(exist_ok=True)
    with wave.open(str(OUT), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
    print(OUT, f"{len(EVENTS)} efectos")


if __name__ == "__main__":
    main()

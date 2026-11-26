import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def norm(x, peak=0.9): m = np.max(np.abs(x)) + 1e-12; return x / m * peak
def fade(x, a=0.002, b=0.01):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)[:, None] if x.ndim == 2 else np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)[:, None] if x.ndim == 2 else np.linspace(1, 0, nb)
    return x
def stereo(m, pan=0.0, width=0.0):
    l = m * np.sqrt(0.5 * (1 - pan)); r = m * np.sqrt(0.5 * (1 + pan))
    if width:
        d = int(0.00035 * SR * width)
        r = np.concatenate([np.zeros(d), r[:len(r) - d]]) if d else r
    return np.stack([l, r], 1)

def reverb(st, dur=0.9, mix=0.18, damp=6000):
    n = int(dur * SR); tt = np.arange(n) / SR
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-tt * 6.5 / dur)
        ir = lp(ir, damp); ir[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir /= np.sqrt((ir ** 2).sum())
        w_ = fftconvolve(st[:, ch], ir); w_ = np.concatenate([w_, np.zeros(len(st) + n - len(w_))]) if len(w_) < len(st) + n else w_[:len(st) + n]; out.append(w_)
    wet = np.stack(out, 1)
    dry = np.vstack([st, np.zeros((n, 2))])
    return dry * (1 - mix) + wet * mix * 2.2

def sweep_noise(d, f0, f1, env, nb=28, q=0.35):
    """band-weighted noise whose spectral centre glides f0->f1 (log)"""
    n = int(d * SR); x = rng.standard_normal(n)
    centers = np.geomspace(120, 14000, nb)
    tt = np.linspace(0, 1, n)
    fc = np.exp(np.log(f0) + (np.log(f1) - np.log(f0)) * tt)
    y = np.zeros(n)
    for c in centers:
        band = bp(x, c / 1.18, min(c * 1.18, SR / 2 - 100))
        w = np.exp(-0.5 * (np.log(c / fc) / q) ** 2)
        y += band * w
    return y * env

def hit(pitch=1.0, bright=1.0):
    d = 0.9; tt = t_(d)
    f = 48 * pitch + (175 * pitch - 48 * pitch) * np.exp(-tt / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.20)
    click = hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt / 0.004) * 0.5 * bright
    snap = bp(rng.standard_normal(len(tt)), 900, 5000) * np.exp(-tt / 0.045) * 0.55 * bright
    m = body * 1.0 + click + snap
    m = np.tanh(m * 1.6) / np.tanh(1.6)
    return fade(m, 0.0005, 0.05)

def boom():
    d = 2.6; tt = t_(d)
    f = 36 + (110 - 36) * np.exp(-tt / 0.09)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.75)
    crack = bp(rng.standard_normal(len(tt)), 300, 7000) * np.exp(-tt / 0.09) * 0.6
    air = hp(rng.standard_normal(len(tt)), 4000) * np.exp(-tt / 0.35) * 0.12
    m = np.tanh((sub * 1.2 + crack + air) * 1.3)
    return fade(m, 0.0005, 0.2)

def whoosh(d, f0, f1, peak_at=0.6, pan0=-0.5, pan1=0.5, shape=2.0):
    tt = np.linspace(0, 1, int(d * SR))
    env = np.where(tt < peak_at, (tt / peak_at) ** shape, ((1 - tt) / (1 - peak_at)) ** 1.6)
    m = sweep_noise(d, f0, f1, env)
    m = norm(m, 0.9)
    pan = pan0 + (pan1 - pan0) * tt
    st = np.stack([m * np.sqrt(0.5 * (1 - pan)), m * np.sqrt(0.5 * (1 + pan))], 1)
    return fade(st, 0.005, 0.03)

def riser(d):
    tt = np.linspace(0, 1, int(d * SR)); ts = t_(d)
    env = tt ** 2.4
    noise = sweep_noise(d, 400, 9000, env, q=0.45)
    f = 180 * np.exp(np.log(5.0) * tt ** 1.5)
    tone = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)) * env * 0.22
    m = norm(noise, 0.8) + tone
    st = stereo(m, 0, 1.0)
    st[:, 0] *= 1 + 0.15 * np.sin(2 * np.pi * 3.1 * ts * (1 + tt * 3))
    st[:, 1] *= 1 - 0.15 * np.sin(2 * np.pi * 3.1 * ts * (1 + tt * 3))
    return fade(st, 0.01, 0.004)

def tap():
    tt = t_(0.08)
    m = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt / 0.003) + np.sin(2 * np.pi * 1700 * tt) * np.exp(-tt / 0.012) * 0.5
    return fade(m, 0.0003, 0.01)

def ding():
    tt = t_(1.2); m = np.zeros(len(tt))
    for f0, st, a in [(1318.5, 0.0, 1.0), (1975.5, 0.09, 0.85)]:
        k = tt >= st; ts = tt[k] - st
        tone = (np.sin(2 * np.pi * f0 * ts) + 0.25 * np.sin(2 * np.pi * 2 * f0 * ts) + 0.08 * np.sin(2 * np.pi * 3.01 * f0 * ts))
        m[k] += a * tone * np.exp(-ts / 0.28) * (1 - np.exp(-ts / 0.002))
    return fade(m, 0.0005, 0.1)

def scribble(d):
    tt = t_(d); n = len(tt)
    x = bp(rng.standard_normal(n), 1800, 7500)
    speed = np.abs(np.sin(2 * np.pi * (5.5 + 3 * np.sin(2 * np.pi * 0.7 * tt)) * tt)) ** 0.7
    speed = lp(speed, 30)
    env = np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.06)
    return fade(x * (0.35 + 0.65 * speed) * env, 0.005, 0.03)

def pop():
    tt = t_(1.0); m = np.zeros(len(tt))
    f = 380 + 600 * (1 - np.exp(-tt / 0.03))
    m += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.06) * 0.8
    for f0, st in [(1046.5, 0.05), (1568.0, 0.13), (2093.0, 0.21)]:
        k = tt >= st; ts = tt[k] - st
        m[k] += 0.5 * np.sin(2 * np.pi * f0 * ts) * np.exp(-ts / 0.22) * (1 - np.exp(-ts / 0.002))
    return fade(m, 0.0005, 0.1)

def thump():
    tt = t_(0.9)
    f = 42 + 70 * np.exp(-tt / 0.05)
    m = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.25)
    return fade(m, 0.0005, 0.05)

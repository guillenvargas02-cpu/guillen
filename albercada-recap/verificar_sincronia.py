"""Verifica que la boca vaya con la voz: reproduce cada toma de la persona con el mismo filtro que build.py
y la compara cuadro a cuadro con renders/base-small.mp4 (desfases de -3 a +3 cuadros). Debe dar +0 en todas.
Uso: python3 verificar_sincronia.py   (después de construir la base de prueba)"""
import sys, subprocess, numpy as np
sys.path.insert(0, '.')
import build
FPS, w, h = 30, 270, 480
def grab(cmd_in, vf, n):
    cmd = ["ffmpeg", "-v", "error", *cmd_in, "-vf", vf, "-frames:v", str(n), "-f", "rawvideo", "-pix_fmt", "gray", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.uint8)
    return x.reshape(-1, h, w).astype(np.float32)
base = build.OUT / 'base-small.mp4'
for t0, t1, spec, z0, z1, ay in build.SHOTS:
    if isinstance(spec, str) or spec[0] != 'v':
        continue
    f0, f1 = build.fr(t0), build.fr(t1)
    n = min(f1 - f0, 40)
    T0 = f0 / FPS
    src0 = build.shot_src(spec, T0)
    path = build.A / build.SPK[build.VOICE[spec[1]][0]]
    dur = (f1 - f0) / FPS
    # cuadros del video armado (mismo tramo)
    B = grab(["-i", str(base)], f"select='between(n\\,{f0}\\,{f0 + n - 1})',scale={w}:{h}", n)
    z = f"({z0}+({z1 - z0})*t/{dur:.4f})"
    errs = {}
    for k in range(-3, 4):
        ss = src0 + k / FPS
        vf = (f"setpts=PTS-STARTPTS,fps={FPS},{build.HDR},scale=540:960:force_original_aspect_ratio=increase,crop=540:960,"
              f"scale=w='2*trunc(540*{z}/2)':h='2*trunc(960*{z}/2)':eval=frame,crop=540:960:x='(iw-540)/2':y='(ih-960)*{ay}',scale={w}:{h}")
        S = grab(["-ss", f"{ss:.4f}", "-t", f"{dur + 0.3:.4f}", "-i", str(path)], vf, n)
        m = min(len(S), len(B))
        errs[k] = float(np.abs(S[:m] - B[:m]).mean())
    best = min(errs, key=errs.get)
    print(f"{T0:7.3f}-{f1 / FPS:7.3f} voz {spec[1]}  mejor desfase {best:+d} cuadros   " + " ".join(f"{k:+d}:{v:.1f}" for k, v in errs.items()))

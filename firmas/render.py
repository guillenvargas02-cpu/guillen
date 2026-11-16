"""Etapa 2: renderiza los cuadros 4K y los envia a ffmpeg.

uso: python3 render.py            -> renders/work/video.mp4 (sin audio)
     python3 render.py still 3.2  -> renders/work/still_3.20.png
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np
from scipy import ndimage

from prep import W, H, INK, WORK, FPS, TOTAL, TRANS_START, TRANS_DUR

Y0 = 3150  # a partir de aqui vive el agua
INTRO = 0.5
SOFT = 0.022  # s, suavizado del frente de tinta
TAU = 2 * np.pi

cv2.setNumThreads(4)


def ease_out(x):
    x = np.clip(x, 0, 1)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = np.clip(x, 0, 1)
    return x * x * x * (x * (6 * x - 15) + 10)


class Page:
    def __init__(self, i, prep):
        self.bg = cv2.imread(os.path.join(WORK, f"tpl{i+1}.png"))
        a = prep[f"alpha{i}"]
        tm = prep[f"tmap{i}"]
        self.idx = np.flatnonzero((a > 0) & np.isfinite(tm))
        self.a = a.ravel()[self.idx].astype(np.float32) / 255.0
        self.tm = tm.ravel()[self.idx]
        order = np.argsort(self.tm)
        self.idx, self.a, self.tm = self.idx[order], self.a[order], self.tm[order]
        self._water_setup()

    def _water_setup(self):
        c = self.bg[Y0:].astype(np.int16)
        b, r = c[..., 0], c[..., 2]
        hh = H - Y0
        water = (b > r + 25).astype(np.uint8)
        water = cv2.morphologyEx(water, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))
        pink = ((r > b + 35) & (r > 150)).astype(np.uint8)
        pink[:, :1300] = 0
        n, lab, st, _ = cv2.connectedComponentsWithStats(pink)
        pink = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
        fl = cv2.morphologyEx(pink, cv2.MORPH_CLOSE, np.ones((61, 61), np.uint8))
        fl = ndimage.binary_fill_holes(fl).astype(np.uint8)
        body = water | fl
        body = np.maximum.accumulate(body, axis=0)  # todo lo que queda bajo la ola
        # el borde de la ola queda fijo: el peso crece hacia dentro del agua
        dist = cv2.distanceTransform(np.pad(body, ((0, 200), (0, 0)), constant_values=1), cv2.DIST_L2, 5)[:hh]
        ww = np.clip((dist - 6) / 70.0, 0, 1)
        self.ww = (ww * ww * (3 - 2 * ww)).astype(np.float32)
        dfl = cv2.distanceTransform(1 - fl, cv2.DIST_L2, 5)
        wf = np.clip(1 - (dfl - 6) / 60.0, 0, 1)
        self.wf = (wf * wf * (3 - 2 * wf) * (dist > 3)).astype(np.float32)
        ys, xs = np.nonzero(fl)
        self.wf *= np.clip((hh - 1 - np.arange(hh, dtype=np.float32)) / 70.0, 0, 1)[:, None] ** 0.7
        self.fc = (float(xs.mean()), float(ys.max() - 0.18 * (ys.max() - ys.min())))
        self.X, self.Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(hh, dtype=np.float32))
        self.crop = np.ascontiguousarray(self.bg[Y0:])
        self.wmask = (self.ww * (1 - self.wf))[..., None]

    def water(self, t):
        X, Y = self.X, self.Y
        s = np.sin
        dxw = 5.0 * s(TAU * (Y / 170 + X / 900 - t / 2.3)) + 2.5 * s(TAU * (X / 260 + Y / 400 + t / 1.7))
        dyw = 4.0 * s(TAU * (X / 210 - Y / 700 - t / 2.9)) + 2.0 * s(TAU * (Y / 130 + t / 1.9))
        # flamingo: flota (sube/baja, deriva y se mece)
        th = np.radians(2.4) * np.sin(TAU * t / 3.4)
        dx = 9.0 * np.sin(TAU * t / 4.6 + 0.5)
        dy = 12.0 * np.sin(TAU * t / 2.7)
        cx, cy = self.fc
        co, si = np.cos(-th), np.sin(-th)
        px, py = X - cx - dx, Y - cy - dy
        sxf = co * px - si * py + cx
        syf = si * px + co * py + cy
        wf, ww = self.wf, self.ww * (1 - self.wf)
        mx = X + wf * (sxf - X) - ww * dxw
        my = Y + wf * (syf - Y) - ww * dyw
        out = cv2.remap(self.crop, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        # destellos del sol sobre el agua
        g = 1 + 0.07 * s(TAU * (X / 330 + Y / 190 - t / 1.5)) * s(TAU * (X / 150 - Y / 420 + t / 2.1))
        gain = 1 + self.wmask * (g[..., None] - 1)
        return np.clip(out.astype(np.float32) * gain, 0, 255).astype(np.uint8)

    def frame(self, t):
        f = self.bg.copy()
        f[Y0:] = self.water(t)
        n = np.searchsorted(self.tm, t)
        if n:
            flat = f.reshape(-1, 3)
            idx = self.idx[:n]
            m = np.clip((t - self.tm[:n]) / SOFT, 0, 1)
            a = (self.a[:n] * m)[:, None]
            flat[idx] = (flat[idx].astype(np.float32) * (1 - a) + INK * a + 0.5).astype(np.uint8)
        return f


class Renderer:
    def __init__(self):
        prep = np.load(os.path.join(WORK, "prep.npz"))
        self.pages = [Page(0, prep), Page(1, prep)]

    def frame(self, t):
        p1, p2 = self.pages
        if t < INTRO:
            e = ease_out(t / INTRO)
            f = p1.frame(t)
            sc = 1.04 - 0.04 * e
            M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, sc)
            f = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            return cv2.addWeighted(f, float(e), np.full_like(f, 255), float(1 - e), 0)
        if t < TRANS_START:
            return p1.frame(t)
        if t >= TRANS_START + TRANS_DUR:
            return p2.frame(t)
        # la hoja 1 se levanta y deja ver la hoja 2
        e = ease_in_out((t - TRANS_START) / TRANS_DUR)
        under = p2.frame(t)
        over = p1.frame(t)
        M = cv2.getRotationMatrix2D((W * 0.1, H * 1.0), 7.0 * e, 1.0)
        M[0, 2] += -260 * e
        M[1, 2] += -H * 1.16 * e
        warped = cv2.warpAffine(over, M, (W, H), flags=cv2.INTER_CUBIC, borderValue=(0, 0, 0))
        s = 4
        Ms = M.copy()
        Ms[:, 2] /= s
        cov = cv2.warpAffine(np.ones((H // s, W // s), np.float32), Ms, (W // s, H // s), flags=cv2.INTER_LINEAR)
        sh = np.roll(cov, 14, axis=0)
        sh[:14] = cov[:14]
        sh = cv2.GaussianBlur(sh, (0, 0), 16) * 0.45 * min(1.0, e * 6)
        sh = cv2.resize(sh, (W, H), interpolation=cv2.INTER_LINEAR)[..., None]
        covf = cv2.resize(cov, (W, H), interpolation=cv2.INTER_LINEAR)
        covf = np.clip((covf - 0.5) * W / s * 0 + covf, 0, 1)
        hard = cv2.warpAffine(np.full((H, W), 255, np.uint8), M, (W, H), flags=cv2.INTER_LINEAR)[..., None] / 255.0
        out = under.astype(np.float32) * (1 - sh)
        out = out * (1 - hard) + warped.astype(np.float32) * hard
        return np.clip(out + 0.5, 0, 255).astype(np.uint8)


def main():
    r = Renderer()
    if len(sys.argv) > 2 and sys.argv[1] == "still":
        for ts in sys.argv[2:]:
            t = float(ts)
            cv2.imwrite(os.path.join(WORK, f"still_{t:05.2f}.png"), r.frame(t))
        return
    out = os.path.join(WORK, "video.mp4")
    n = int(round(TOTAL * FPS))
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "14",
         "-vf", "scale=out_color_matrix=bt709:out_range=tv", "-pix_fmt", "yuv420p",
         "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
         "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)
    for k in range(n):
        ff.stdin.write(r.frame(k / FPS).tobytes())
        if k % 60 == 0:
            print(f"cuadro {k}/{n}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("listo", out)


if __name__ == "__main__":
    main()

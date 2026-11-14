"""Recorta los logos (fondo blanco) a PNG con transparencia y genera variantes."""
import numpy as np
from PIL import Image
from pathlib import Path
B = Path(__file__).resolve().parent.parent / "assets" / "brand"

def key(src):
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
    alpha = np.clip((255 - a.min(axis=2)) / 250.0, 0, 1)  # magenta y negro tienen un canal ~0
    alpha[alpha < 0.03] = 0
    rgb = np.where(alpha[..., None] > 0, (a - 255 * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-3), 0)
    rgb = np.clip(rgb, 0, 255)
    ys, xs = np.where(alpha > 0.1)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    pad = 12
    sl = (slice(max(0, y0 - pad), y1 + pad), slice(max(0, x0 - pad), x1 + pad))
    return rgb[sl], alpha[sl]

def save(rgb, alpha, name):
    im = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    Image.fromarray(im, "RGBA").save(B / name)
    print(name, im.shape)

for src, base in [("somos-original.webp", "somos"), ("somos-impacto-original.webp", "somos-impacto")]:
    rgb, alpha = key(B / src)
    # color de marca: mediana de los píxeles saturados
    sat = rgb.max(2) - rgb.min(2)
    m = (alpha > 0.95) & (sat > 150)
    print(base, "magenta", np.median(rgb[m], axis=0).round())
    save(rgb, alpha, f"{base}.png")
    if base == "somos-impacto":  # versión blanca, como en el banner del evento (sobre rosa)
        save(np.full_like(rgb, 255), alpha, f"{base}-white.png")

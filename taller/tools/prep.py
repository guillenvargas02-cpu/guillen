"""Prepara stickers con borde blanco y artes del manual (lema y pleca).

manual-p13.png / manual-p15.png: páginas 13 y 15 del Manual de Identidad SOMOS 2026, rasterizadas con
`pdftoppm -r 216 -png -f 13 -l 13 manual.pdf` (no se versionan; ya se extrajeron a somos-lema.png y somos-pleca.png).
"""
import numpy as np
from PIL import Image, ImageOps, ImageFilter
from scipy import ndimage
from pathlib import Path
A = Path(__file__).resolve().parent.parent / "assets"


# Stickers: recorte + borde blanco (estilo del micrófono del cartel)
for f in ["dialogo", "microfono", "reporte"]:
    im = Image.open(A / "stickers" / f"{f}-src.png").convert("RGBA")
    im = im.crop(im.getbbox())
    pad = 60
    c = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); c.paste(im, (pad, pad))
    a = np.asarray(c)[..., 3] > 40
    d = ndimage.binary_dilation(a, iterations=22)
    d = ndimage.binary_fill_holes(d)
    border = Image.fromarray((d * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new("RGBA", c.size, (255, 255, 255, 0)); out.putalpha(border)
    white = Image.new("RGBA", c.size, (255, 255, 255, 255)); white.putalpha(border)
    out = Image.alpha_composite(white, c)
    if out.width > 1400: out = out.resize((1400, round(out.height * 1400 / out.width)), Image.LANCZOS)
    out.save(A / "stickers" / f"{f}.png"); print(f, out.size)

# Logotipo + lema oficial (manual p.13): rosa sobre blanco -> transparente
im = np.asarray(Image.open(A / "brand" / "manual-p13.png").convert("RGB")).astype(np.float32)
H, W = im.shape[:2]
reg = im[int(H * .25):int(H * .9), int(W * .15):int(W * .85)]
alpha = np.clip((255 - reg[..., 1]) / (255 - 0), 0, 1)  # el rosa cívico tiene G=0
alpha[alpha < .04] = 0
ys, xs = np.where(alpha > .1); reg = reg[ys.min() - 8:ys.max() + 9, xs.min() - 8:xs.max() + 9]; alpha = alpha[ys.min() - 8:ys.max() + 9, xs.min() - 8:xs.max() + 9]
rgb = np.zeros_like(reg); rgb[..., 0], rgb[..., 1], rgb[..., 2] = 228, 0, 124
Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA").save(A / "brand" / "somos-lema.png")
print("lema", reg.shape)

# Pleca (manual p.15): píxeles rosas conectados al borde -> transparentes
im = np.asarray(Image.open(A / "brand" / "manual-p15.png").convert("RGB")).astype(np.float32)
H, W = im.shape[:2]
reg = im[int(H * .3):int(H * .55), int(W * .3):int(W * .7)]
whiteness = reg.min(axis=2) / 255.0          # 1 en la pleca blanca, ~0 en el rosa
lab = ndimage.label(whiteness < 0.5)[0]
border_labels = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
ext = np.isin(lab, list(border_labels))
# alfa suave en el contorno: blancura dentro de una franja alrededor del exterior
alpha = np.where(ext, 0.0, 1.0)
edge = ndimage.binary_dilation(ext, iterations=2) & ~ndimage.binary_erosion(ext, iterations=2)
alpha[edge] = np.clip(whiteness[edge] / 0.95, 0, 1) * (1 - ext[edge]) + ext[edge] * np.clip(whiteness[edge] / 0.95, 0, 1)
ys, xs = np.where(alpha > .1); sl = (slice(ys.min() - 4, ys.max() + 5), slice(xs.min() - 4, xs.max() + 5))
reg, alpha = reg[sl], alpha[sl]
rgb = np.where(alpha[..., None] > 0, reg, 255)
# en el borde exterior, color blanco con alfa (evita halo rosa)
rgb[alpha < 1] = 255
Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA").save(A / "brand" / "somos-pleca.png")
print("pleca", reg.shape)

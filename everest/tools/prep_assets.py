#!/usr/bin/env python3
"""Prepara las imágenes del recap Everest para render 4K (2160x3840).

- Convierte HEIC (Display P3) a sRGB.
- Escala con Lanczos al tamaño necesario y aplica un enfoque suave (sin IA).
- Grade común y discreto (curva S suave, +saturación ligera) para que todo se sienta de una pieza.
- Genera la máscara de cielo de la montaña de apertura (texto detrás de la cumbre).
- Genera los fotogramas de grano animado.
Uso: python3 -I tools/prep_assets.py <carpeta_fuentes>
"""
import io, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageCms, ImageFilter, ImageOps

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "assets"
(OUT / "photos").mkdir(parents=True, exist_ok=True)
(OUT / "mountains").mkdir(parents=True, exist_ok=True)
(OUT / "fx").mkdir(parents=True, exist_ok=True)

def load(p):
    if p.suffix.lower() == ".heic":
        import pillow_heif
        pillow_heif.register_heif_opener()
    im = ImageOps.exif_transpose(Image.open(p))
    icc = im.info.get("icc_profile")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        dst = ImageCms.createProfile("sRGB")
        im = ImageCms.profileToProfile(im.convert("RGB"), src, dst, renderingIntent=0, outputMode="RGB")
    return im.convert("RGB")

def grade(im, contrast=0.10, sat=1.08, lift=0.0):
    a = np.asarray(im).astype(np.float32) / 255.0
    # curva S suave alrededor de 0.5
    s = a + contrast * (a - 0.5) * (1 - np.abs(2 * a - 1))
    s = lift + s * (1 - lift)
    lum = (0.2126 * s[..., 0] + 0.7152 * s[..., 1] + 0.0722 * s[..., 2])[..., None]
    s = lum + (s - lum) * sat
    return Image.fromarray((np.clip(s, 0, 1) * 255 + 0.5).astype(np.uint8))

def fit(im, w=None, h=None, sharpen=(1.6, 45, 2)):
    if w and not h: h = round(im.height * w / im.width)
    if h and not w: w = round(im.width * h / im.height)
    up = w > im.width
    im = im.resize((w, h), Image.LANCZOS)
    if up:
        im = im.filter(ImageFilter.UnsharpMask(radius=sharpen[0], percent=sharpen[1], threshold=sharpen[2]))
    return im

def save(im, path, q=92):
    im.save(path, quality=q, subsampling=0, optimize=True)
    print(path.name, im.size)

# Fotos del evento (horizontales 2000x1125 -> 4000x2250)
for name, out in [("7.jpg", "sala"), ("3.jpg", "publico"), ("4.jpg", "ponente"), ("5.jpg", "anfitrion")]:
    save(grade(fit(load(SRC / name), w=4000)), OUT / "photos" / f"{out}.jpg")
# Selfie (1600x1200 -> 3200x2400)
save(grade(fit(load(SRC / "2.jpg"), w=3200)), OUT / "photos" / "equipo.jpg")
# Verticales del iPhone (3024x4032, P3 -> sRGB), se quedan en 2880x3840
for name, out in [("IMG_0081.HEIC", "escenario"), ("IMG_7747.HEIC", "cercania")]:
    save(grade(fit(load(SRC / name), h=3840)), OUT / "photos" / f"{out}.jpg")
# Invitación (941x1672 -> 2160x3838)
save(fit(load(SRC / "6.webp"), w=2160, sharpen=(1.4, 40, 2)), OUT / "photos" / "invitacion.jpg")
# Montañas (1080x1920 -> 2160x3840)
for i, out in [(1, "cresta"), (2, "cumbre"), (3, "everest"), (4, "nubes")]:
    save(grade(fit(load(SRC / "zip" / f"{i}.jpg"), w=2160), contrast=0.06, sat=1.04), OUT / "mountains" / f"{out}.jpg")

# Máscara: la montaña de "everest" sin el cielo (para poner el título detrás de la cumbre)
ev = Image.open(OUT / "mountains" / "everest.jpg").convert("RGB")
a = np.asarray(ev).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
sky = (b - r > 70) & (b > 150) & (r < 120)
sky = np.asarray(Image.fromarray((sky * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(9)))
# todo lo que está por debajo de la primera fila de montaña es montaña
col_first = np.argmax(sky == 0, axis=0)
yy = np.arange(sky.shape[0])[:, None]
mount = (yy >= col_first[None, :]).astype(np.uint8) * 255
alpha = Image.fromarray(mount).filter(ImageFilter.GaussianBlur(1.6))
cut = ev.copy(); cut.putalpha(alpha)
cut.save(OUT / "mountains" / "everest-cumbre.png", optimize=True)
print("everest-cumbre.png", cut.size)

# Grano: 6 fotogramas 1080x1920 gris (se mezcla en overlay)
rng = np.random.default_rng(7)
for i in range(6):
    n = rng.normal(0.5, 0.16, (1920, 1080)).clip(0, 1)
    Image.fromarray((n * 255).astype(np.uint8)).convert("RGB").save(OUT / "fx" / f"grano-{i}.jpg", quality=80)
print("grain ok")

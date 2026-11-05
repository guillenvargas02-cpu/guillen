#!/usr/bin/env python3
"""Prepara imágenes y videos del recap Everest para render 4K (composición 1080x1920, salida 2160x3840).

- HEIC (Display P3) y JPG con perfil -> sRGB.
- Lanczos al tamaño que pide cada encuadre (+ enfoque suave sólo si se amplía).
- Grade común y discreto para que todo se sienta de una pieza.
- Videos: tramo usado, escalado Lanczos x2 y enfoque ligero (ffmpeg).
- Grano animado.
Uso: python3 -I tools/prep_assets.py <carpeta_fuentes> <carpeta_montañas_zip>
"""
import io, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageCms, ImageFilter, ImageOps

SRC = Path(sys.argv[1])
ZIP = Path(sys.argv[2])
OUT = Path(__file__).resolve().parent.parent / "assets"
for d in ("photos", "mountains", "video", "fx"):
    (OUT / d).mkdir(parents=True, exist_ok=True)


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


def grade(im, contrast=0.10, sat=1.08):
    a = np.asarray(im).astype(np.float32) / 255.0
    s = a + contrast * (a - 0.5) * (1 - np.abs(2 * a - 1))
    lum = (0.2126 * s[..., 0] + 0.7152 * s[..., 1] + 0.0722 * s[..., 2])[..., None]
    s = lum + (s - lum) * sat
    return Image.fromarray((np.clip(s, 0, 1) * 255 + 0.5).astype(np.uint8))


def fit(im, w):
    h = round(im.height * w / im.width)
    up = w > im.width
    im = im.resize((w, h), Image.LANCZOS)
    if up:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=45, threshold=2))
    return im


def save(im, name, q=90):
    im.save(OUT / name, quality=q, subsampling=0, optimize=True)
    print(name, im.size)


# Fotos del evento — (fuente, salida, ancho)
PHOTOS = [
    ("_DSC0401.jpg", "sala", 3200),
    ("_DSC0242.jpg", "altar", 2400),
    ("_DSC0228 (2).jpg", "robot-invitados", 2400),
    ("_DSC0332 (1).jpg", "ponente", 3200),
    ("_DSC0313.jpg", "caminata", 3200),
    ("_DSC0357.jpg", "anfitrion", 3200),
    ("_DSC0330 (1).jpg", "publico", 3600),
    ("_DSC0324.jpg", "publico-amplio", 3600),
    ("_DSC0316.jpg", "panel-publico", 3600),
    ("_DSC0302.jpg", "panel", 3200),
    ("_DSC0415.jpg", "camara", 4240),
    ("_DSC0465 (1).jpg", "pose-robot", 3200),
    ("selfie.jpg", "selfie", 2400),
    ("IMG_0078.HEIC", "grupo", 2400),
    ("IMG_7752 (1).HEIC", "panel-robot", 2400),
    ("IMG_0081.HEIC", "escenario", 2160),
    ("IMG_7747.HEIC", "cercania", 2160),
]
for src, out, w in PHOTOS:
    save(grade(fit(load(SRC / src), w)), f"photos/{out}.jpg")
# Foto panorámica del grupo: resolución completa para acercarse 3x sin perder nitidez
save(grade(load(SRC / "IMG_0079.HEIC")), "photos/grupo-panoramica.jpg", q=88)

# Montañas (1080x1920 -> 2160x3840)
for i, out in [(1, "cresta"), (2, "cumbre"), (3, "everest")]:
    save(grade(fit(load(ZIP / f"{i}.jpg"), 2160), contrast=0.06, sat=1.04), f"mountains/{out}.jpg")

# Videos — (fuente, salida, inicio, duración, ancho, alto)
VIDEOS = [
    ("nubes-video.mp4", "nubes", 0.0, 2.6, 2160, 3840),
    ("escalador-video.mp4", "escalador", 1.4, 2.6, 2160, 3840),
    ("wa2.mp4", "panel-vivo", 6.0, 2.7, 1080, 1920),
    ("wa3.mp4", "ponente-vivo", 13.0, 2.7, 1080, 1920),
    ("wa1.mp4", "publico-vivo", 2.0, 2.7, 1080, 1920),
]
for src, out, ss, dur, w, h in VIDEOS:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", str(SRC / src), "-an",
         "-vf", f"scale={w}:{h}:flags=lanczos,unsharp=5:5:0.45,eq=contrast=1.04:saturation=1.06,fps=30,format=yuv420p",
         "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-movflags", "+faststart",
         str(OUT / "video" / f"{out}.mp4")],
        check=True,
    )
    print(f"video/{out}.mp4")

# Grano: 6 fotogramas 1080x1920 gris (se mezcla en overlay)
rng = np.random.default_rng(7)
for i in range(6):
    n = rng.normal(0.5, 0.16, (1920, 1080)).clip(0, 1)
    Image.fromarray((n * 255).astype(np.uint8)).convert("RGB").save(OUT / "fx" / f"grano-{i}.jpg", quality=80)
print("grain ok")

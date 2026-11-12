#!/usr/bin/env python3
"""Genera las texturas del libro para la intro (a 2x, para que en 4K se vean nítidas).

- assets/portada-hd.jpg   portada reescalada con Lanczos + enfoque suave
- assets/pages/*.jpg      páginas reales del libro (recto/verso) recortadas a la caja de corte

Uso: python3 make_assets.py ruta/al/libro.pdf
- assets/endpaper.jpg     guardas (interior de la tapa)
- assets/grain.png        grano de película en mosaico (RGBA)
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
PW, PH = 1200, 1780  # página a 2x (600 x 890 px de composición)


def spine_shadow(im, side):
    """Sombra del lomo: side='left' en recto, 'right' en verso."""
    sh = Image.new("L", (PW, PH), 0)
    d = ImageDraw.Draw(sh)
    w = 170
    for i in range(w):
        a = int(150 * (1 - i / w) ** 2.2)
        x = i if side == "left" else PW - 1 - i
        d.line([(x, 0), (x, PH)], fill=a)
    dark = Image.new("RGB", (PW, PH), (70, 52, 34))
    return Image.composite(dark, im, sh)


# Hojas reales del libro (impar = recto, par = verso), elegidas por lo visual y sin rostros:
# portadilla, índice, separadores azules, aperturas de capítulo, mapas, banderas, diagramas y tablas.
LEAVES = [(3, 4), (5, 6), (13, 14), (15, 16), (29, 30), (33, 34), (43, 44), (51, 52), (63, 64), (65, 66), (69, 70), (95, 96)]
STACK = 97  # página que queda debajo de todas
DPI = 220
TRIM = (29, 29, 580, 856)  # caja de corte a 100 dpi (dentro de las marcas de imprenta)


def pdf_page(pdf, n, tmp):
    subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", str(n), "-l", str(n), "-singlefile", str(pdf), str(tmp / f"p{n}")], check=True)
    im = Image.open(tmp / f"p{n}.png").convert("RGB")
    k = DPI / 100
    im = im.crop(tuple(round(v * k) for v in TRIM)).resize((PW, PH), Image.LANCZOS)
    # papel ligeramente cálido (no blanco de pantalla) y sombra del lomo
    tint = Image.new("RGB", (PW, PH), (246, 240, 228))
    im = ImageChops.multiply(im, tint)
    return spine_shadow(im, "left" if n % 2 else "right")


def endpaper():
    im = Image.new("RGB", (PW, PH), (20, 74, 44))
    n = Image.effect_noise((PW, PH), 30).filter(ImageFilter.GaussianBlur(1.2))
    im = Image.blend(im, Image.merge("RGB", [n] * 3), 0.06)
    # patrón sutil de líneas diagonales (papel jaspeado)
    pat = Image.new("L", (PW, PH), 0)
    d = ImageDraw.Draw(pat)
    for k in range(-PH, PW, 26):
        d.line([(k, 0), (k + PH, PH)], fill=26, width=2)
    pat = pat.filter(ImageFilter.GaussianBlur(1))
    im = Image.composite(Image.new("RGB", (PW, PH), (40, 120, 72)), im, pat)
    return spine_shadow(im, "right")


def grain():
    s = 512
    n = Image.effect_noise((s, s), 64)
    a = n.point(lambda v: int(abs(v - 128) * 1.6))
    rgb = n.point(lambda v: 255 if v > 128 else 0)
    return Image.merge("RGBA", [rgb, rgb, rgb, a])


def main():
    (A / "pages").mkdir(parents=True, exist_ok=True)
    cov = Image.open(A / "portada.jpg").convert("RGB")
    hd = cov.resize((1800, round(1800 * cov.height / cov.width)), Image.LANCZOS)
    hd = hd.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    hd.save(A / "portada-hd.jpg", quality=94, subsampling=0)
    if len(sys.argv) > 1:  # PDF del libro (no se versiona; las páginas extraídas sí)
        with tempfile.TemporaryDirectory() as td:
            for i, (r, v) in enumerate(LEAVES):
                pdf_page(sys.argv[1], r, Path(td)).save(A / "pages" / f"r{i:02d}.jpg", quality=92)
                pdf_page(sys.argv[1], v, Path(td)).save(A / "pages" / f"v{i:02d}.jpg", quality=92)
            pdf_page(sys.argv[1], STACK, Path(td)).save(A / "pages" / "stack.jpg", quality=92)
    endpaper().save(A / "endpaper.jpg", quality=90)
    grain().save(A / "grain.png")


if __name__ == "__main__":
    main()

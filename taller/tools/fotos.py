"""Fotos del taller: corrige orientación EXIF y deja 2160 px de ancho. Cada foto se usa una sola vez en el video."""
import sys
from pathlib import Path
from PIL import Image, ImageOps
A = Path(__file__).resolve().parent.parent / "assets" / "photos"
U = Path(sys.argv[1])
FOTOS = {  # nombre en el proyecto -> archivo subido
    "banner": "1c366558", "apertura": "0005311f", "sala-impresion": "8b327235", "set-camara": "381eb87b",
    "diagrama": "e6f5dd10", "buen-mensaje": "21ed7422", "redes": "d415556f", "imagen": "b796c718",
    "primera-impresion": "a0c112cc", "narrativa": "59467a54", "medir": "4904ecf6",
}
for name, uid in FOTOS.items():
    im = ImageOps.exif_transpose(Image.open(U / f"{uid}-image.jpg")).convert("RGB")
    if im.width > 2160:
        im = im.resize((2160, round(im.height * 2160 / im.width)), Image.LANCZOS)
    im.save(A / f"{name}.jpg", quality=90)
    print(name, im.size)

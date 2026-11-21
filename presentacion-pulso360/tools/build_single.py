#!/usr/bin/env python3
"""Genera un único archivo HTML autocontenido de la presentación PULSO 360°.

Incrusta estilos, fuentes, scripts, imágenes y videos para que la presentación
se abra con doble clic, sin descomprimir carpetas ni conexión a internet.

Uso:  python3 tools/build_single.py [ruta_de_salida.html]
"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "PULSO360_Presentacion.html")
MIME = {".mp4": "video/mp4", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}

read = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()
html = read("index.html")
deck_js = read("js/deck.js")
engine_js = read("js/engine.js")

# 1) estilos en línea
html = html.replace('<link rel="stylesheet" href="css/fonts.css">', "<style>\n" + read("css/fonts.css") + "\n</style>")
html = html.replace('<link rel="stylesheet" href="css/deck.css">', "<style>\n" + read("css/deck.css") + "\n</style>")

# 2) recursos referenciados que existen en disco
refs = sorted(set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:mp4|jpg|jpeg|png|webp)', html + deck_js)))
assets = [r for r in refs if os.path.exists(os.path.join(ROOT, r))]

# 3) las etiquetas cargan sus recursos desde el registro incrustado (evita peticiones a archivos sueltos)
html = re.sub(r'(<(?:img|video)\b[^>]*?)\ssrc="(assets/[^"]+)"', r'\1 data-asrc="\2"', html)

blocks = []
for a in assets:
    data = base64.b64encode(open(os.path.join(ROOT, a), "rb").read()).decode()
    blocks.append('<script type="text/plain" data-asset="%s" data-mime="%s">%s</script>' % (a, MIME[os.path.splitext(a)[1].lower()], data))

boot = """<script>
/* Registro de recursos incrustados: base64 → Blob URL */
(function () {
  var A = window.__A = {};
  document.querySelectorAll('script[data-asset]').forEach(function (s) {
    var b = atob(s.textContent), n = b.length, u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = b.charCodeAt(i);
    A[s.dataset.asset] = URL.createObjectURL(new Blob([u], { type: s.dataset.mime }));
    s.textContent = "";
  });
  document.querySelectorAll('[data-asrc]').forEach(function (el) {
    var p = el.getAttribute('data-asrc');
    if (A[p]) el.setAttribute('src', A[p]); else if (el.tagName === 'IMG') el.remove();
  });
  document.querySelectorAll('video[data-list]').forEach(function (v) {
    v.dataset.list = v.dataset.list.split(',').map(function (p) { return A[p] || p; }).join(',');
  });
  var C = window.PULSO_CONFIG;
  if (C && C.qr) C.qr.forEach(function (q) { if (q.image) q.image = A[q.image] || ''; });
})();
</script>"""

# 4) la apertura elige su video del registro
deck_js = deck_js.replace('vid.src = big ? "assets/video/pulso360-4k.mp4" : "assets/video/pulso360-1080.mp4";',
                          'vid.src = (window.__A || {})[big ? "assets/video/pulso360-4k.mp4" : "assets/video/pulso360-1080.mp4"];')

scripts = "\n".join(blocks) + "\n" + boot + "\n<script>\n" + engine_js.replace("</script", "<\\/script") + "\n</script>\n<script>\n" + deck_js.replace("</script", "<\\/script") + "\n</script>"
html = html.replace('<script src="js/engine.js"></script>\n<script src="js/deck.js"></script>', scripts)
assert "js/deck.js" not in html and "css/deck.css" not in html

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(html)
print("Listo:", OUT, "·", round(os.path.getsize(OUT) / 1e6, 1), "MB ·", len(assets), "recursos incrustados")

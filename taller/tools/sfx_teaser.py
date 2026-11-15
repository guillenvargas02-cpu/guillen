"""Diseño sonoro del teaser (propuesta 2), con los mismos instrumentos sintetizados de sfx.py."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import sfx  # noqa: E402
from sfx import whoosh, impact, soft_hit, shimmer, tick, thock, pop, shutter, riser, reverse_swell, glitch  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "renders" / "teaser-sfx.wav"
BASE = [
    # gancho: ASÍ / SE / VIVIÓ en cada tiempo
    (0.0, thock(0.45), 0.0), (0.0, whoosh(0.4, 300, 4000, 0.25), -0.3),
    (0.5, thock(0.45), 0.0), (0.5, whoosh(0.4, 400, 5000, 0.25), 0.3),
    (1.0, thock(0.5), 0.0), (1.0, whoosh(0.4, 500, 6000, 0.25), -0.3),
    (1.5, soft_hit(0.45), 0.0), (1.45, whoosh(0.5, 300, 6000, 0.35), 0.0),
    # aceleración hacia el drop
    *[(2.5 + 0.25 * i, tick(0.3, 1800 + 200 * i, 0.05), (-1) ** i * 0.4) for i in range(6)],
    (3.0, shutter(0.4), -0.2), (3.5, shutter(0.4), 0.2),
    (2.0, riser(2.0, 0.4), 0.0), (3.6, reverse_swell(0.4, 0.4), 0.0),
    # drop: título del cartel
    (4.0, impact(0.95), 0.0), (4.25, thock(0.45), 0.2), (4.5, whoosh(0.35, 800, 6000, 0.35, rev=False), 0.3),
    (5.15, whoosh(0.4, 300, 9000, 0.45, rev=False, shape=(0.9, 0.1)), 0.0), (5.5, soft_hit(0.35), 0.0),
    # montaje A
    (6.45, whoosh(0.3, 600, 6000, 0.25, rev=False), -0.4), (6.95, whoosh(0.3, 600, 6000, 0.25, rev=False), 0.4),
    (7.45, whoosh(0.5, 300, 5000, 0.4), 0.0), (7.5, thock(0.3), -0.5), (7.6, thock(0.3), 0.0), (7.7, thock(0.3), 0.5),
    (8.5, shutter(0.5), 0.0), (8.95, whoosh(0.3, 500, 5000, 0.25, rev=False), -0.3), (9.45, whoosh(0.5, 200, 3000, 0.3), 0.3),
    (10.5, shutter(0.5), 0.0), (10.95, whoosh(0.3, 500, 5000, 0.25, rev=False), 0.3),
    (11.45, whoosh(0.5, 300, 6000, 0.35), 0.0), *[(11.6 + 0.07 * i, pop(0.22, 520 + 90 * i), -0.6 + 0.24 * i) for i in range(6)],
    *[(12.5 + 0.06 * i, tick(0.14, 1800 + 150 * i, 0.03), 0.0) for i in range(8)], (12.95, whoosh(0.3, 600, 7000, 0.3, rev=False), 0.0),
    # los cinco temas
    *[(13.5 + 0.5 * i, thock(0.5), 0.0) for i in range(5)], *[(13.5 + 0.5 * i, glitch(0.12, 0.25), 0.0) for i in range(5)],
    # montaje B
    (16.0, shutter(0.5), 0.0), (16.45, whoosh(0.3, 500, 5000, 0.25, rev=False), 0.3), (17.0, shutter(0.5), 0.0),
    (17.45, whoosh(0.3, 500, 5000, 0.25, rev=False), -0.3),
    *[(18.0 + 0.25 * i, tick(0.3, 2200 + 200 * i, 0.05), (-1) ** i * 0.4) for i in range(4)],
    (19.0, riser(1.0, 0.35, 400, 8000), 0.0),
]
EVENTS = [
    # intro: el celular aparece, enciende (clic + campana) y la cámara entra a la pantalla
    (0.0, whoosh(0.9, 200, 1500, 0.2), 0.0), (0.38, tick(0.3, 1600, 0.04), 0.0),
    (0.42, shimmer(1.8, 1046.5, 0.22), 0.0), (0.44, soft_hit(0.3), 0.0),
    (1.25, riser(0.75, 0.32, 300, 8000), 0.0),
    *[(t + 2.0, x, pan) for t, x, pan in BASE],
    # tomas largas
    (22.0, soft_hit(0.55), 0.0), (22.0, shimmer(2.5, 1046.5, 0.18), 0.0),
    (22.95, whoosh(0.5, 200, 3000, 0.22), 0.3),
    (23.95, whoosh(0.7, 200, 3000, 0.3), 0.0), (24.5, thock(0.3), 0.0),
    # cierre
    (25.5, reverse_swell(0.5, 0.5), 0.0), (26.0, impact(0.95, 42, 2.4), 0.0), (26.0, shimmer(2.5, 1318.5, 0.2), 0.0),
    (26.95, whoosh(0.6, 400, 7000, 0.4), 0.3), (27.45, pop(0.26, 760), 0.0),
]

if __name__ == "__main__":
    sfx.main(EVENTS, OUT, 29.5)

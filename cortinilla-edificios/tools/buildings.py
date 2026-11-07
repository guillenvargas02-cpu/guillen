"""Edificios emblemáticos de la alcaldía Miguel Hidalgo como ilustración vectorial.

Cada función devuelve una lista de figuras en coordenadas locales: x centrada en 0, el suelo en y=0
y hacia arriba y negativo. Figuras:
  {"t": "poly", "pts": [...], "role": ROLE, "stroke": bool}   polígono relleno (y contorno)
  {"t": "line", "pts": [...], "w": "main"|"hair"}           trazo abierto, sin relleno
  {"t": "hex",  "clip": [...], "r": float}                   panal de hexágonos recortado al polígono
ROLE: wall (muro claro), mid (tono medio), dark (vidrio / sombra), ink (rosa sólido), white.
"""
import math


# ------------------------------------------------------------------ primitivas
def P(pts, role="wall", stroke=True):
    return {"t": "poly", "pts": [tuple(map(float, p)) for p in pts], "role": role, "stroke": stroke}


def L(pts, w="hair"):
    return {"t": "line", "pts": [tuple(map(float, p)) for p in pts], "w": w}


def rect(x0, y0, x1, y1, role="wall", stroke=True):
    return P([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], role, stroke)


def arc_pts(cx, cy, r, a0, a1, n=14):
    return [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in [a0 + (a1 - a0) * i / n for i in range(n + 1)]]


def arch(cx, ybot, w, h, role="ink", stroke=False):
    r = w / 2
    yc = ybot - h + r
    pts = [(cx - r, ybot)] + arc_pts(cx, yc, r, math.pi, 2 * math.pi) + [(cx + r, ybot)]
    return P(pts, role, stroke)


def circle(cx, cy, r, role="wall", stroke=True, n=48):
    return P([(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)], role, stroke)


def catmull(pts, closed=True, steps=10):
    """Curva suave que pasa por los puntos de control."""
    out = []
    n = len(pts)
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if closed or i > 0 else pts[0]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if closed or i + 2 < n else pts[-1]
        for s in range(steps):
            t = s / steps
            t2, t3 = t * t, t * t * t
            out.append(
                tuple(
                    0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
                    for k in (0, 1)
                )
            )
    if not closed:
        out.append(pts[-1])
    return out


def balusters(x0, x1, ytop, ybot, step=13):
    out = []
    x = x0 + step / 2
    while x < x1:
        out.append(L([(x, ytop), (x, ybot)]))
        x += step
    return out


def foliage(cx, cy, r, role="mid"):
    """Copa de árbol: una sola silueta ondulada (sin círculos encimados)."""
    n = 9
    ctrl = []
    for i in range(n):
        a = math.pi + math.pi * i / (n - 1)  # semicírculo superior
        rr = r * (1.0 if i % 2 == 0 else 0.84)
        ctrl.append((cx + rr * math.cos(a) * 1.15, cy + rr * math.sin(a)))
    ctrl += [(cx + r * 0.9, cy + r * 0.35), (cx, cy + r * 0.5), (cx - r * 0.9, cy + r * 0.35)]
    return [P(catmull(ctrl, closed=True, steps=6), role)]


# ------------------------------------------------------------------ Castillo de Chapultepec
def castillo():
    s = []
    # cerro con muro de piedra y árboles al frente
    s.append(P(catmull([(-560, 0), (-470, -70), (-300, -128), (300, -128), (470, -70), (560, 0)], closed=False, steps=8) + [(560, 0)], "mid"))
    for y in (-40, -78, -110):
        s.append(L([(-430 + (y % 3) * 10, y), (430, y)]))
    for x in range(-400, 420, 70):
        s.append(L([(x, -128), (x + 8, -100)]))
    # terraza con balaustrada
    s.append(rect(-490, -128, 490, -150, "wall"))
    s += balusters(-488, 488, -131, -147)
    # alas laterales
    for sgn in (-1, 1):
        x0, x1 = sorted((sgn * 400, sgn * 482))
        s.append(rect(x0, -150, x1, -362, "wall"))
        s.append(rect(x0 - 4, -362, x1 + 4, -378, "mid"))
        cx = (x0 + x1) / 2
        s.append(arch(cx, -168, 28, 66))
        s.append(rect(cx - 24, -268, cx + 24, -338, "dark"))
        s.append(L([(cx - 24, -303), (cx + 24, -303)]))
    # cuerpo principal, planta baja
    s.append(rect(-400, -150, 400, -278, "wall"))
    for x in (-140, -70, 0, 70, 140):
        s.append(arch(x, -152, 58, 104, "dark", True))
        s.append(L([(x, -152), (x, -226)]))
    for x in (-205, -335, -370, 205, 335, 370):
        s.append(arch(x, -160, 26, 66))
    s.append(rect(-405, -278, 405, -292, "mid"))
    # planta alta: galería de vidrio y ventanas
    s.append(rect(-400, -292, 400, -400, "wall"))
    for i in range(5):
        x0 = -176 + i * 71
        s.append(rect(x0, -300, x0 + 64, -380, "dark"))
        for k in range(1, 4):
            s.append(L([(x0 + 16 * k, -300), (x0 + 16 * k, -380)]))
        s.append(L([(x0, -340), (x0 + 64, -340)]))
    for x in (-205, -340, 205, 340):
        s.append(arch(x, -302, 26, 60))
        s.append(rect(x - 22, -300, x + 22, -306, "mid"))
    # cornisa con balaustrada
    s.append(rect(-410, -400, 410, -424, "mid"))
    s += balusters(-408, 408, -403, -421, 15)
    # torreones
    for x in (-262, 250):
        s.append(rect(x - 30, -150, x + 30, -472, "wall"))
        s.append(rect(x - 38, -472, x + 38, -490, "mid"))
        s.append(rect(x - 33, -490, x + 33, -500, "wall"))
        s.append(L([(x - 30, -440), (x + 30, -440)]))
    s.append(arch(250, -410, 16, 34))
    # torre central (Caballero Alto) con asta y bandera
    s.append(rect(-72, -424, 72, -552, "wall"))
    for x in (-40, 0, 40):
        s.append(arch(x, -470, 22, 44))
    s.append(rect(-60, -470, 60, -478, "mid"))
    s.append(rect(-84, -552, 84, -570, "mid"))
    s.append(L([(18, -570), (18, -770)], "main"))
    wave = [(20 + i * 7, -766 + 5 * math.sin(i * 0.7)) for i in range(11)]
    s.append(P(wave + [(p[0], p[1] + 48) for p in reversed(wave)], "ink", False))
    # árboles al pie del cerro
    for cx, r in ((-470, 62), (-330, 50), (-140, 46), (110, 54), (300, 48), (460, 60)):
        s += foliage(cx, -30, r, "mid")
    return s


# ------------------------------------------------------------------ Altar a la Patria (Niños Héroes)
EAGLE = [(-26, 0), (-31, -28), (-17, -58), (-7, -86), (0, -94), (7, -86), (17, -58), (31, -28), (26, 0), (11, -22), (0, -15), (-11, -22)]
CROWN = [(-25, 0), (25, 0), (25, -10), (31, -42), (17, -24), (12, -58), (4, -30), (0, -66), (-4, -30), (-12, -58), (-17, -24), (-31, -42), (-25, -10)]


def altar():
    s = []
    s.append(rect(-530, 0, 530, -18, "mid"))
    s.append(rect(-500, -18, 500, -34, "wall"))
    s.append(L([(0, -34), (0, -760)]))  # asta al fondo
    for sgn in (-1, 1):
        x0, x1 = sorted((sgn * 120, sgn * 470))
        s.append(rect(x0, -34, x1, -150, "mid"))
        s.append(rect(x0 - 4, -150, x1 + 4, -160, "wall"))
        for k in range(1, 4):
            xx = x0 + (x1 - x0) * k / 4
            s.append(L([(xx, -40), (xx, -146)]))
    for x in (-430, -290, -150, 150, 290, 430):
        s.append(rect(x - 31, -34, x + 31, -62, "mid"))
        s.append(rect(x - 23, -62, x + 23, -600, "wall"))
        s.append(P([(x + px, -470 + py) for px, py in EAGLE], "ink", False))
        s.append(rect(x - 27, -560, x + 27, -574, "ink", False))
        s.append(P([(x + px, -574 + py) for px, py in CROWN], "ink", False))
        for yy in (-150, -260, -370):
            s.append(L([(x - 23, yy), (x + 23, yy)]))
    # monumento central: pedestal y grupo escultórico
    s.append(rect(-66, -34, 66, -210, "wall"))
    s.append(rect(-44, -96, 44, -136, "mid"))
    s.append(rect(-58, -210, 58, -236, "mid"))
    mother = catmull([(-46, -236), (-50, -300), (-34, -350), (-12, -372), (12, -370), (30, -340), (44, -290), (52, -236)], closed=False, steps=6)
    s.append(P(mother + [(52, -236)], "wall"))
    s.append(circle(4, -392, 22, "wall"))
    s.append(P(catmull([(-58, -236), (-62, -290), (-48, -318), (-36, -296), (-34, -236)], closed=False, steps=5) + [(-34, -236)], "wall"))
    s.append(circle(-50, -333, 13, "wall"))
    s.append(L([(-20, -300), (10, -330), (28, -300)]))
    return s


# ------------------------------------------------------------------ Auditorio Nacional
def auditorio():
    s = []
    # escalinata
    s.append(P([(-540, 0), (540, 0), (480, -92), (-480, -92)], "wall"))
    for k in range(1, 10):
        y = -9.2 * k
        dx = 60 * k / 10
        s.append(L([(-540 + dx, y), (540 - dx, y)]))
    s.append(rect(-490, -92, 490, -106, "mid"))

    def beam_y(x, top=False):
        return (-528 if top else -472) + (x + 350) / 860 * 172

    # techumbre de vidrio detrás del marco
    glass = [(-360, -106), (470, -106), (470, beam_y(470) - 6), (-360, -452)]
    s.append(P(glass, "dark"))
    for x in range(-330, 470, 34):
        ytop = -452 + (x + 360) / 830 * (beam_y(470) - 6 + 452)
        s.append(L([(x, -106), (x, ytop)]))
    for y in (-200, -300, -380):
        s.append(L([(-360, y), (470, max(y, beam_y(470) - 6))]))
    # caja de vidrio a la izquierda
    s.append(rect(-480, -280, -345, -430, "dark"))
    for x in range(-466, -345, 20):
        s.append(L([(x, -280), (x, -430)]))
    s.append(L([(-480, -355), (-345, -355)]))
    # tambor cilíndrico
    drum = [(-175, -106), (140, -106)] + catmull([(140, -270), (60, -300), (-60, -304), (-175, -276)], closed=False, steps=8)
    s.append(P(drum, "mid"))
    s.append(L([(-175, -200), (140, -196)]))
    # volumen redondeado a la izquierda (balcón)
    s.append(P([(-330, -168)] + arc_pts(-430, -210, 42, math.pi / 2, 3 * math.pi / 2) + [(-330, -252)], "wall"))
    # pilar inclinado (pata izquierda del marco) con su cara en sombra
    s.append(P([(-365, -106), (-248, -106), (-214, -474), (-334, -474)], "wall"))
    s.append(P([(-248, -106), (-222, -106), (-196, -474), (-214, -474)], "mid"))
    # columnas cilíndricas
    for x, w in ((190, 64), (305, 46), (440, 44)):
        s.append(rect(x - w / 2, -106, x + w / 2, beam_y(x) + 2, "wall"))
        s.append(rect(x + w / 6, -106, x + w / 2, beam_y(x) + 2, "mid", False))
    # la gran viga del marco, inclinada hacia la derecha
    s.append(P([(-350, beam_y(-350)), (510, beam_y(510)), (510, beam_y(510, True)), (-350, beam_y(-350, True))], "wall"))
    s.append(L([(-340, beam_y(-340) - 18), (500, beam_y(500) - 18)]))
    # jardineras
    for x in (-150, -90, -30, 30, 90):
        s.append(circle(x, -118, 16, "mid"))
    return s


# ------------------------------------------------------------------ Fuente de Petróleos
SCULPT = [(40, -250), (232, -250), (226, -330), (202, -420), (214, -500), (182, -560), (160, -604), (172, -650), (186, -700), (200, -768), (214, -776), (206, -744), (196, -690), (184, -640), (160, -660), (132, -664), (114, -640), (100, -600), (82, -540), (62, -470), (56, -380), (42, -330)]


def petroleos():
    s = []
    # surtidores de agua (blancos con contorno rosa)
    for x, h in ((-430, 150), (-350, 210), (-270, 170), (260, 190), (340, 230), (420, 160), (-180, 120), (150, 130)):
        s.append(P([(x - 7, -58), (x - 2, -58 - h * 0.85), (x, -58 - h), (x + 2, -58 - h * 0.85), (x + 7, -58)], "white"))
    # vaso de la fuente
    s.append(P([(-500, 0), (500, 0), (500, -46)] + catmull([(500, -46), (0, -58), (-500, -46)], closed=False, steps=6)[1:], "mid"))
    s.append(L([(-500, -24), (500, -24)]))
    # basamento oscuro
    s.append(rect(-212, -58, 196, -252, "ink"))
    s.append(rect(110, -120, 180, -180, "dark", False))
    # obelisco inclinado con su cara lateral en sombra
    s.append(P([(-210, -252), (72, -252), (54, -1000), (-158, -986)], "wall"))
    s.append(P([(22, -252), (72, -252), (54, -1000), (12, -997)], "mid"))
    for k in range(1, 12):
        y = -252 - k * 62
        xl = -210 + (y + 252) / -734 * 52
        s.append(L([(xl, y), (22 - (y + 252) / -748 * 10, y)]))
    # grupo escultórico
    s.append(P(SCULPT, "mid"))
    s.append(circle(140, -684, 22, "mid"))
    s.append(L([(90, -470), (150, -420), (200, -460)]))
    s.append(L([(70, -380), (140, -340), (210, -380)]))
    s.append(L([(120, -560), (160, -520)]))
    # fuente redonda lateral
    s.append(P([(232, -150), (340, -150), (320, -172), (252, -172)], "ink", False))
    s.append(rect(282, -58, 292, -150, "ink", False))
    return s


# ------------------------------------------------------------------ Torre del Reloj (Polanco)
def reloj():
    s = []
    for cx, r in ((-430, 120), (440, 110)):
        s += foliage(cx, -330, r, "mid")
        s.append(rect(cx - 8, 0, cx + 8, -260, "mid"))
    s.append(P([(-160, 0), (160, 0), (134, -72), (-134, -72)], "wall"))
    for k in range(1, 7):
        y = -10.3 * k
        dx = 26 * k / 7
        s.append(L([(-160 + dx, y), (160 - dx, y)]))
    s.append(L([(-150, 0), (-126, -80), (-126, -110)]))
    s.append(L([(150, 0), (126, -80), (126, -110)]))
    # alas con losa en voladizo
    for sgn in (-1, 1):
        x0, x1 = sorted((sgn * 280, sgn * 380))
        s.append(rect(x0, -72, x1, -236, "wall"))
        s.append(rect(min(x0, x1) - (22 if sgn < 0 else 0), -236, max(x0, x1) + (22 if sgn > 0 else 0), -250, "mid"))
    # pabellón
    s.append(rect(-280, -72, 280, -302, "wall"))
    for sgn in (-1, 1):
        x0, x1 = sorted((sgn * 110, sgn * 250))
        s.append(rect(x0, -128, x1, -262, "white"))
    s.append(rect(-56, -72, 56, -212, "dark"))
    for x in (-28, 0, 28):
        s.append(L([(x, -72), (x, -212)]))
    s.append(rect(-76, -218, 76, -276, "mid"))
    s.append(P([(-326, -302), (326, -302), (294, -340), (-294, -340)], "dark"))
    for k in range(1, 4):
        s.append(L([(-326 + 10 * k, -302 - 9.5 * k), (326 - 10 * k, -302 - 9.5 * k)]))
    # fuste de la torre
    s.append(rect(-110, -340, 110, -880, "wall"))
    s.append(rect(76, -340, 110, -880, "mid", False))
    s.append(circle(0, -792, 74, "white"))
    for i in range(12):
        a = 2 * math.pi * i / 12
        s.append(L([(62 * math.cos(a), -792 + 62 * math.sin(a)), (70 * math.cos(a), -792 + 70 * math.sin(a))], "main"))
    s.append(L([(0, -792), (0, -742)], "main"))
    s.append(L([(0, -792), (34, -806)], "main"))
    # remate con ménsulas
    for x in range(-118, 120, 26):
        s.append(rect(x - 6, -880, x + 6, -896, "mid", False))
    s.append(rect(-152, -896, 152, -928, "wall"))
    s.append(rect(-140, -928, 140, -936, "mid"))
    return s


# ------------------------------------------------------------------ Museo Soumaya
SOUMAYA = [
    (-155, -542), (65, -528), (335, -472),  # borde superior
    (300, -412), (250, -310), (215, -210), (235, -120), (290, -60), (350, -10),  # costado derecho
    (220, 0), (-85, -10), (-245, -20), (-345, -50),  # base
    (-275, -80), (-210, -140), (-195, -210), (-205, -270), (-265, -340), (-350, -400),  # costado izquierdo
]


def soumaya():
    s = []
    tall = [(x * 1.02, y * 1.22) for x, y in SOUMAYA]
    sil = catmull(tall, closed=True, steps=10)
    s.append(P([(-350, 12), (350, 12), (350, 0), (-350, 0)], "mid", False))
    s.append(P(sil, "wall"))
    # sombra suave del lado derecho (el fuste se curva hacia la luz)
    shade = catmull([(x * 1.02, y * 1.22) for x, y in [(335, -472), (300, -412), (250, -310), (215, -210), (235, -120), (290, -60), (350, -10), (220, 0), (150, -60), (140, -200), (170, -330), (230, -440)]], closed=True, steps=8)
    s.append(P(shade, "mid", False))
    s.append({"t": "hex", "clip": sil, "r": 14})
    s.append(P([(-300, -46), (-215, -30), (-200, -66), (-262, -80)], "dark"))
    s.append(rect(-350, 0, 350, 12, "mid"))
    return s


BUILDERS = {"castillo": castillo, "altar": altar, "auditorio": auditorio, "petroleos": petroleos, "reloj": reloj, "soumaya": soumaya}

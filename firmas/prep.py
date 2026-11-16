"""Etapa 1: separa la tinta del diseño y calcula, para cada pixel de tinta,
el instante en que la "pluma" pasa por ahi (mapa de tiempos).

Salida: renders/work/prep.npz + imagenes de depuracion.
"""
import json
import os

import cv2
import numpy as np
from scipy import ndimage
from skimage.morphology import skeletonize

W, H = 2160, 3840
INK = 37.0
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "renders", "work")
os.makedirs(WORK, exist_ok=True)

# ---------------------------------------------------------------- timeline
FPS = 60
P1_START, P1_STAGGER = 0.55, 0.50
TRANS_START, TRANS_DUR = 10.05, 0.75
P2_START, P2_STAGGER = 10.95, 0.72
TOTAL = 18.0

# Negro que pertenece al diseno (texto del logo, pico del flamingo)
DESIGN_BLACK_BOXES = [(1690, 240, 1970, 285), (1900, 3410, 2030, 3570)]


def R(x0, y0, x1, y1):
    return (x0, y0, x1, y1)


# Grupos = firmas. "comps": ids de componentes conexas (deterministas).
# "split": componente fusionada que se reparte por trazo segun rectangulos.
PAGES = [
    dict(
        groups=[
            dict(name="A", comps=[6]),
            dict(name="Bell", comps=[], split=(1, None)),
            dict(name="alta", comps=[5], split=(1, [R(1790, 0, 2160, 1080)])),
            dict(name="JCA", comps=[8, 9, 13, 12, 7]),
            dict(name="2hr", comps=[11]),
            dict(name="Glh", comps=[10]),
            dict(name="Bely", comps=[14]),
            dict(name="RR", comps=[15, 16, 19]),
            dict(name="Rau", comps=[27, 28, 25, 18, 21, 22, 20]),
            dict(name="Gato", comps=[17, 24]),
            dict(name="CR", comps=[26, 23, 30, 29, 32]),
            dict(name="Dael", comps=[31, 35, 37]),
            dict(name="Mz", comps=[34, 33]),
            dict(name="diag", comps=[36, 38, 39]),
            dict(name="Zyle", comps=[40]),
            dict(name="Bely2", comps=[41, 42]),
        ],
    ),
    dict(
        groups=[
            dict(name="Camilo", comps=[5, 6, 7, 8]),
            dict(name="Fenub", comps=[10],
                 split=(9, [R(600, 1955, 1355, 2320), R(1155, 2278, 1690, 2356)])),
            dict(name="Vila", comps=[11, 12], split=(9, [R(1420, 1750, 1850, 2250)])),
            dict(name="gyp", comps=[], split=(9, [R(433, 2390, 1267, 3035)])),
            dict(name="ovalo", comps=[13], split=(9, None)),
            dict(name="circulo", comps=[15]),
            dict(name="Cardenas", comps=[14, 16, 18, 19, 17]),
        ],
    ),
]


def load_pages():
    p = [cv2.imread(os.path.join(HERE, "assets", f"hoja{i}.png"), cv2.IMREAD_UNCHANGED)[..., :3]
         for i in (1, 2)]
    for i in range(2):
        if p[i].shape[:2] != (H, W):
            p[i] = cv2.resize(p[i], (W, H), interpolation=cv2.INTER_AREA)
    return p


def ink_core(img):
    f = img.astype(np.int16)
    mx, mn = f.max(2), f.min(2)
    return ((mx < 80) & (mx - mn < 12)).astype(np.uint8)


# ------------------------------------------------------------ stroke tracing
OFFS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def trace_strokes(skel):
    """Recorre el esqueleto como lo haria una pluma: sigue recto en los cruces."""
    Hs, Ws = skel.shape
    sk = skel.copy()
    sk[0, :] = sk[-1, :] = sk[:, 0] = sk[:, -1] = False
    visited = np.zeros_like(sk)

    def nb(p):
        y, x = p
        return [(y + dy, x + dx) for dy, dx in OFFS if sk[y + dy, x + dx]]

    def look(cur, cand, path_set, n=10):
        """posicion tras avanzar n pasos desde cand sin pisar lo visitado"""
        prev, p = cur, cand
        seen = {cur, cand}
        for _ in range(n):
            nxt = [q for q in nb(p) if q not in seen and not visited[q] and q not in path_set]
            if not nxt:
                break
            d = (p[0] - prev[0], p[1] - prev[1])
            q = max(nxt, key=lambda q: (q[0] - p[0]) * d[0] + (q[1] - p[1]) * d[1])
            seen.add(q)
            prev, p = p, q
        return p

    def unit(v):
        n = np.hypot(*v)
        return (v[0] / n, v[1] / n) if n > 0 else (0.0, 0.0)

    def bridge(cur, hd, maxd=45):
        """salta un cruce ya dibujado buscando continuar en linea recta"""
        best, bc = None, 0.82
        seen = {cur}
        frontier = [cur]
        for _ in range(maxd):
            nf = []
            for p in frontier:
                for q in nb(p):
                    if q in seen:
                        continue
                    seen.add(q)
                    if visited[q]:
                        nf.append(q)
                    else:
                        v = (q[0] - cur[0], q[1] - cur[1])
                        if v[0] * v[0] + v[1] * v[1] < 9:
                            continue
                        u = unit(v)
                        c = u[0] * hd[0] + u[1] * hd[1]
                        if c > bc:
                            e = look(cur, q, set(), 8)
                            u2 = unit((e[0] - q[0], e[1] - q[1]))
                            if u2[0] * hd[0] + u2[1] * hd[1] > 0.5 or e == q:
                                best, bc = q, c
            frontier = nf
            if not frontier:
                break
        return best

    def trace(start):
        path = [start]
        visited[start] = True
        while True:
            cur = path[-1]
            cands = [q for q in nb(cur) if not visited[q]]
            hd = None
            if len(path) > 4:
                b = path[-min(len(path), 14)]
                hd = unit((cur[0] - b[0], cur[1] - b[1]))
            if hd is None:
                if not cands:
                    break
                nxt = cands[0]
            else:
                best, bc = None, -2.0
                for q in cands:
                    e = look(cur, q, set())
                    u = unit((e[0] - cur[0], e[1] - cur[1]))
                    c = u[0] * hd[0] + u[1] * hd[1]
                    if c > bc:
                        best, bc = q, c
                nxt = best
                if best is None or (bc < 0.35 and len(nb(cur)) > 2) or best is None:
                    j = bridge(cur, hd)
                    if j is not None:
                        nxt = j
                    elif best is None:
                        break
            visited[nxt] = True
            path.append(nxt)
        return path

    deg = ndimage.convolve(sk.astype(np.uint8), np.ones((3, 3), np.uint8), mode="constant") - 1
    ends = np.argwhere(sk & (deg == 1))
    ends = sorted(map(tuple, ends), key=lambda p: p[1] + 0.25 * p[0])
    strokes = []
    for e in ends:
        if not visited[e]:
            strokes.append(trace(e))
    # resto: lazos cerrados y ramas pendientes
    while True:
        rest = np.argwhere(sk & ~visited)
        if len(rest) == 0:
            break
        rest_set = [tuple(p) for p in rest]
        start = None
        for p in rest_set:
            if sum(1 for q in nb(p) if not visited[q]) <= 1:
                start = p
                break
        strokes.append(trace(start or rest_set[0]))
    return strokes


def stroke_len(path):
    a = np.asarray(path, np.float32)
    if len(a) < 2:
        return np.zeros(len(a), np.float32)
    d = np.hypot(*(a[1:] - a[:-1]).T)
    return np.concatenate([[0], np.cumsum(d)]).astype(np.float32)


def main():
    pages = load_pages()
    cores = [ink_core(p) for p in pages]
    db = np.zeros((H, W), np.uint8)
    for x0, y0, x1, y1 in DESIGN_BLACK_BOXES:
        db[y0:y1, x0:x1] = cores[1][y0:y1, x0:x1]
    db = cv2.dilate(db, np.ones((9, 9), np.uint8))

    # componentes (mismo criterio que en el analisis: dilatacion 5x5)
    labs = []
    for i in range(2):
        _, lab = cv2.connectedComponents(cv2.dilate(cores[i], np.ones((5, 5), np.uint8)), connectivity=8)
        labs.append(lab)
        cores[i] = cores[i] & (db == 0)

    fills = [cv2.dilate(c, np.ones((11, 11), np.uint8)) > 0 for c in cores]
    tpls, alphas = [], []
    for i in range(2):
        o = 1 - i
        t = pages[i].copy()
        src = pages[o].copy()
        src[fills[o]] = 255
        t[fills[i]] = src[fills[i]]
        tpls.append(t)
        tf, pf = t.astype(np.float32), pages[i].astype(np.float32)
        num = ((tf - pf) * (tf - INK)).sum(2)
        den = ((tf - INK) ** 2).sum(2) + 1e-3
        a = np.clip(num / den, 0, 1)
        a[~fills[i]] = 0
        a[a < 0.02] = 0
        alphas.append(a.astype(np.float32))
        rec = tf * (1 - a[..., None]) + INK * a[..., None]
        err = np.abs(rec - pf).max(2)
        print(f"hoja{i+1}: error max recomposicion {err.max():.1f}, px>6: {(err > 6).sum()}")
        cv2.imwrite(os.path.join(WORK, f"tpl{i+1}.png"), t)

    out = {}
    events = []
    for i in range(2):
        a = alphas[i]
        skel = skeletonize(a > 0.5)
        strokes = [s for s in trace_strokes(skel)]
        lens = [stroke_len(s) for s in strokes]
        keep = [k for k in range(len(strokes)) if lens[k][-1] >= 14]
        print(f"hoja{i+1}: {len(strokes)} trazos, {len(keep)} utiles")
        groups = PAGES[i]["groups"]
        comp2g, split = {}, {}
        for gi, g in enumerate(groups):
            for c in g["comps"]:
                comp2g[c] = gi
            if "split" in g:
                split.setdefault(g["split"][0], []).append((gi, g["split"][1]))
        gstrokes = [[] for _ in groups]
        for k in keep:
            pts = np.asarray(strokes[k])
            cid = np.bincount(labs[i][pts[:, 0], pts[:, 1]]).argmax()
            gi = comp2g.get(cid)
            if cid in split:
                best, bv, default = None, 0.34, None
                for g2, rects in split[cid]:
                    if rects is None:
                        default = g2
                        continue
                    inside = np.zeros(len(pts), bool)
                    for x0, y0, x1, y1 in rects:
                        inside |= (pts[:, 1] >= x0) & (pts[:, 1] < x1) & (pts[:, 0] >= y0) & (pts[:, 0] < y1)
                    if inside.mean() > bv:
                        best, bv = g2, inside.mean()
                gi = best if best is not None else default
            if gi is None:
                print("  trazo sin grupo, comp", cid, pts[0], len(pts))
                continue
            # orientar: de izquierda a derecha
            key = lambda p: p[1] + 0.25 * p[0]
            if key(pts[0]) > key(pts[-1]) + 20:
                strokes[k] = strokes[k][::-1]
                lens[k] = stroke_len(strokes[k])
            gstrokes[gi].append(k)

        tmap_sk = np.full((H, W), np.inf, np.float32)
        t0 = P1_START if i == 0 else P2_START
        stag = P1_STAGGER if i == 0 else P2_STAGGER
        for gi, g in enumerate(groups):
            ks = sorted(gstrokes[gi], key=lambda k: strokes[k][0][1] + 0.25 * strokes[k][0][0])
            GAP = 70.0
            total = sum(lens[k][-1] for k in ks) + GAP * (len(ks) - 1)
            dur = float(np.clip(0.45 + total / 5200.0, 0.75, 2.7 if i else 1.9))
            start = t0 + gi * stag
            acc = 0.0
            for k in ks:
                pts = np.asarray(strokes[k])
                tt = start + dur * (acc + lens[k]) / total
                tmap_sk[pts[:, 0], pts[:, 1]] = np.minimum(tmap_sk[pts[:, 0], pts[:, 1]], tt)
                events.append(dict(page=i, group=g["name"], t0=float(tt[0]), t1=float(tt[-1]),
                                   x=float(pts[:, 1].mean() / W), len=float(lens[k][-1])))
                acc += lens[k][-1] + GAP
            print(f"  {g['name']:9s} trazos={len(ks):3d} largo={total:7.0f} inicio={start:5.2f} dur={dur:.2f} fin={start+dur:5.2f}")
        has = np.isfinite(tmap_sk)
        _, (iy, ix) = ndimage.distance_transform_edt(~has, return_indices=True)
        tmap = tmap_sk[iy, ix]
        tmap[a == 0] = np.inf
        out[f"alpha{i}"] = (a * 255 + 0.5).astype(np.uint8)
        out[f"tmap{i}"] = tmap.astype(np.float32)

        # depuracion: color segun tiempo
        fin = np.isfinite(tmap)
        lo, hi = tmap[fin].min(), tmap[fin].max()
        v = np.zeros((H, W), np.uint8)
        v[fin] = (255 * (tmap[fin] - lo) / (hi - lo)).astype(np.uint8)
        vis = cv2.applyColorMap(v, cv2.COLORMAP_TURBO)
        vis[~fin] = 255
        cv2.imwrite(os.path.join(WORK, f"debug_t{i+1}.png"), cv2.resize(vis, None, fx=0.45, fy=0.45, interpolation=cv2.INTER_AREA))

    np.savez(os.path.join(WORK, "prep.npz"), **out)
    json.dump(dict(events=events, fps=FPS, total=TOTAL, trans_start=TRANS_START, trans_dur=TRANS_DUR),
              open(os.path.join(WORK, "events.json"), "w"))


if __name__ == "__main__":
    main()

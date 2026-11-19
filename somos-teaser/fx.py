"""Primitivas de imagen para el teaser de SOMOS (numpy + OpenCV, float32 RGB 0..1)."""
import numpy as np
import cv2

PINK = np.array([228, 0, 124], np.float32) / 255.0  # Rosa cívico #E4007C
WHITE = np.array([1.0, 1.0, 1.0], np.float32)


# ---------------------------------------------------------------- curvas
def clamp01(x):
    return np.clip(x, 0.0, 1.0)


def lin(t, a, b):
    """0..1 lineal entre a y b."""
    if b == a:
        return 1.0 if t >= b else 0.0
    return float(min(1.0, max(0.0, (t - a) / (b - a))))


def smooth(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def ease_out(x, p=3):
    x = clamp01(x)
    return 1 - (1 - x) ** p


def ease_in(x, p=3):
    x = clamp01(x)
    return x ** p


def ease_in_out(x, p=3):
    x = clamp01(x)
    return np.where(x < 0.5, 0.5 * (2 * x) ** p, 1 - 0.5 * (2 - 2 * x) ** p) if isinstance(x, np.ndarray) else (
        0.5 * (2 * x) ** p if x < 0.5 else 1 - 0.5 * (2 - 2 * x) ** p)


def ease_out_back(x, s=1.6):
    x = float(clamp01(x)) - 1
    return 1 + x * x * ((s + 1) * x + s)


def ease_out_expo(x):
    x = float(clamp01(x))
    return 1.0 if x >= 1 else 1 - 2 ** (-10 * x)


def ease_in_expo(x):
    x = float(clamp01(x))
    return 0.0 if x <= 0 else 2 ** (10 * x - 10)


def env_hit(t, t0, attack=0.0, decay=0.25):
    """Envolvente de golpe: sube en `attack` y cae exponencialmente."""
    if t < t0 - attack:
        return 0.0
    if t < t0:
        return (t - (t0 - attack)) / max(attack, 1e-6)
    return float(np.exp(-(t - t0) / decay))


def hash_noise(seed, t, freq=1.0):
    """Ruido suave determinista 1D (suma de senos)."""
    r = np.random.RandomState(seed)
    ph = r.rand(4) * 6.283
    fr = (0.8 + r.rand(4) * 1.7) * freq
    return float(sum(np.sin(t * f * 6.283 + p) / (i + 1) for i, (f, p) in enumerate(zip(fr, ph))) / 1.9)


# ---------------------------------------------------------------- imagen
def resize(img, w, h, interp=cv2.INTER_LINEAR):
    if img.shape[1] == w and img.shape[0] == h:
        return img
    return cv2.resize(img, (int(w), int(h)), interpolation=interp)


def blur(img, sigma):
    if sigma <= 0.3:
        return img
    return cv2.GaussianBlur(img, (0, 0), sigma)


def soft_blur(img, sigma):
    """Desenfoque grande barato: reduce, desenfoca y vuelve a ampliar."""
    if sigma < 6:
        return blur(img, sigma)
    f = int(min(8, max(2, sigma // 4)))
    h, w = img.shape[:2]
    small = cv2.resize(img, (w // f, h // f), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), sigma / f)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)


def box_blur_h(img, length):
    length = int(length)
    if length < 2:
        return img
    return cv2.blur(img, (length, 1))


def box_blur_v(img, length):
    length = int(length)
    if length < 2:
        return img
    return cv2.blur(img, (1, length))


def affine(img, scale=1.0, tx=0.0, ty=0.0, cx=None, cy=None, out=None, border=cv2.BORDER_CONSTANT, rot=0.0):
    """Escala/rota alrededor de (cx, cy) y traslada; `out` = (w, h) del lienzo de salida."""
    h, w = img.shape[:2]
    ow, oh = out if out else (w, h)
    cx = w / 2 if cx is None else cx
    cy = h / 2 if cy is None else cy
    M = cv2.getRotationMatrix2D((cx, cy), rot, scale)
    M[0, 2] += tx + (ow - w) / 2
    M[1, 2] += ty + (oh - h) / 2
    return cv2.warpAffine(img, M, (int(ow), int(oh)), flags=cv2.INTER_LINEAR, borderMode=border)


def zoom_blur(img, strength, cx=None, cy=None, samples=7):
    """Desenfoque radial (zoom) promediando copias escaladas; se calcula a media resolución."""
    if strength < 0.004:
        return img
    h, w = img.shape[:2]
    small = cv2.resize(img, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
    cx = (w / 2 if cx is None else cx) / 2
    cy = (h / 2 if cy is None else cy) / 2
    acc = np.zeros_like(small)
    for i in range(samples):
        s = 1 + strength * i / (samples - 1)
        M = cv2.getRotationMatrix2D((cx, cy), 0, s)
        acc += cv2.warpAffine(small, M, (w // 2, h // 2), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    acc /= samples
    return cv2.resize(acc, (w, h), interpolation=cv2.INTER_LINEAR)


def over(dst, rgb, alpha):
    """Composición 'over'. alpha HxW o HxWx1."""
    if alpha.ndim == 2:
        alpha = alpha[..., None]
    return dst * (1 - alpha) + rgb * alpha


def paste(dst, layer_rgba, x, y, opacity=1.0, add=False):
    """Pega una capa RGBA (float) con esquina sup-izq en (x, y), recortando a los bordes."""
    H, W = dst.shape[:2]
    h, w = layer_rgba.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x0 >= x1 or y0 >= y1:
        return dst
    L = layer_rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    a = L[..., 3:4] * opacity
    if add:
        dst[y0:y1, x0:x1] += L[..., :3] * a
    else:
        dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - a) + L[..., :3] * a
    return dst


def luminance(img):
    return img[..., 0] * 0.2126 + img[..., 1] * 0.7152 + img[..., 2] * 0.0722


def grade(img, contrast=1.12, sat=0.88, exposure=0.0, shadows=(0.0, 0.012, 0.022), highs=(0.03, 0.012, -0.012),
          black=0.012):
    """Grade cinematográfico: exposición, curva S suave, split-toning teal/ámbar y desaturación ligera."""
    if exposure:
        img = img * (2.0 ** exposure)
    x = clamp01(img)
    s = x * x * (3 - 2 * x)
    x = x + (s - x) * (contrast - 1.0) * 2.2
    lum = luminance(x)[..., None]
    x = lum + (x - lum) * sat
    sh = (1 - lum) ** 2
    hi = lum ** 2
    x = x + np.array(shadows, np.float32) * sh + np.array(highs, np.float32) * hi
    return black + x * (1 - black)


def vignette_mask(w, h, strength=0.45, roundness=1.0):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx / w - 0.5) * 2
    ny = (yy / h - 0.5) * 2 * (h / w) ** -0.35
    r = np.sqrt(nx ** 2 + (ny * roundness) ** 2)
    v = 1 - strength * smooth((r - 0.45) / 1.0)
    return v.astype(np.float32)


def bloom(img, threshold=0.72, strength=0.55):
    h, w = img.shape[:2]
    small = cv2.resize(img, (w // 4, h // 4), interpolation=cv2.INTER_AREA)
    b = np.maximum(small - threshold, 0)
    acc = cv2.GaussianBlur(b, (0, 0), w / 4 * 0.006) * 0.6 + cv2.GaussianBlur(b, (0, 0), w / 4 * 0.025) * 0.8 + \
        cv2.GaussianBlur(b, (0, 0), w / 4 * 0.07) * 0.6
    return img + cv2.resize(acc, (w, h), interpolation=cv2.INTER_LINEAR) * strength


def chroma(img, amount_px):
    """Aberración cromática radial: R se expande, B se contrae."""
    if amount_px < 0.5:
        return img
    h, w = img.shape[:2]
    out = img.copy()
    for ch, sgn in ((0, 1), (2, -1)):
        s = 1 + sgn * amount_px / (w / 2)
        M = cv2.getRotationMatrix2D((w / 2, h / 2), 0, s)
        out[..., ch] = cv2.warpAffine(img[..., ch], M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return out


def grain(h, w, frame, amount=0.03):
    rng = np.random.default_rng(1000 + frame)
    g = rng.standard_normal((h // 2, w // 2), dtype=np.float32)
    g = cv2.GaussianBlur(g, (0, 0), 0.6)
    g = cv2.resize(g, (w, h), interpolation=cv2.INTER_LINEAR)
    return g * amount


def fbm(w, h, seed, octaves=5, base=4):
    """Ruido fractal 0..1 (valor interpolado), para humo/haze y fugas de luz."""
    rng = np.random.RandomState(seed)
    acc = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        n = base * 2 ** o
        g = rng.rand(max(2, int(n * h / w)), n).astype(np.float32)
        acc += cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC) * amp
        tot += amp
        amp *= 0.5
    acc /= tot
    acc = (acc - acc.min()) / (acc.max() - acc.min() + 1e-6)
    return acc


def rounded_rect_mask(w, h, rw, rh, radius, ss=3):
    """Máscara AA de un rectángulo redondeado (rw x rh, radio) centrado en un lienzo w x h."""
    W, Hh = w * ss, h * ss
    m = np.zeros((Hh, W), np.uint8)
    rw, rh, r = rw * ss, rh * ss, max(0, min(radius * ss, rw * ss / 2, rh * ss / 2))
    x0, y0 = (W - rw) / 2, (Hh - rh) / 2
    x1, y1 = x0 + rw, y0 + rh
    sh = 4
    k = 1 << sh

    def P(x, y):
        return (int(round(x * k)), int(round(y * k)))

    if r < 1:
        cv2.rectangle(m, (int(x0), int(y0)), (int(x1), int(y1)), 255, -1)
    else:
        cv2.rectangle(m, P(x0 + r, y0), P(x1 - r, y1), 255, -1, cv2.LINE_8, sh)
        cv2.rectangle(m, P(x0, y0 + r), P(x1, y1 - r), 255, -1, cv2.LINE_8, sh)
        for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
            cv2.circle(m, P(cx, cy), int(round(r * k)), 255, -1, cv2.LINE_AA, sh)
    return cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0

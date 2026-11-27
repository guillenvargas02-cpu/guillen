"""Split the summit logo (black background) into RGBA layers at 2160x3840."""
import numpy as np, cv2, sys
W, H = 2160, 3840
d = sys.argv[1]
im = cv2.imread(f"{d}/logo_x4.png")[:, :, ::-1].astype(np.float32) / 255
im = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
k = H / 1672.0
a = im.max(2)
alpha = np.clip((a - 0.035) / 0.6, 0, 1) ** 0.85          # black background -> transparency
alpha = np.clip(alpha * 1.0, 0, 1)
col = np.clip(im / np.maximum(im.max(2, keepdims=True), 1e-3), 0, 1)  # unpremultiplied hue
# keep true brightness for whites/golds: rescale colour so that max channel = source max / alpha
col = np.clip(im / np.maximum(alpha[..., None], 1e-3), 0, 1)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
yy = np.arange(H)[:, None] * np.ones((1, W))
def band(y0, y1): return (yy >= y0 * k - 6) & (yy < y1 * k + 6)
emb = band(236, 740)
green = emb & (g > r * 1.15) & (g > b * 1.2)
red = emb & (r > g * 1.6) & (r > b * 1.6) & ~((r > 0.55) & (g > 0.4))
gold = emb & ~green & ~red
layers = {"gold": gold, "green": green, "red": red,
          "t_cumbre": band(772, 888), "t_mexico": band(892, 1045),
          "t_sub1": band(1073, 1118), "t_sub2": band(1135, 1181), "t_cdmx": band(1224, 1273)}
for name, m in layers.items():
    m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.2)  # soft masks to avoid seams
    out = np.dstack([col, alpha * m])
    cv2.imwrite(f"{d}/L_{name}.png", (out[:, :, [2, 1, 0, 3]] * 65535 + .5).astype(np.uint16))
    ys, xs = np.where(alpha * m > 0.3)
    print(name, xs.min(), xs.max(), ys.min(), ys.max(), len(xs))
# arc circle fit (green + red pixels) for the loading-ring draw-on
ys, xs = np.where((green | red) & (alpha > 0.5))
A = np.c_[2 * xs, 2 * ys, np.ones(len(xs))]; bb = xs ** 2 + ys ** 2
cx, cy, c = np.linalg.lstsq(A, bb, rcond=None)[0]; R = np.sqrt(c + cx ** 2 + cy ** 2)
print("circle", cx, cy, R)
np.save(f"{d}/circle.npy", np.array([cx, cy, R]))

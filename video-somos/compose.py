import json, subprocess, sys, math, os, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import timeline as T

W, H = 2160, 3840
OUTDIR = sys.argv[1] if len(sys.argv) > 1 else 'out'
RANGE = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (0, T.TOTAL_F)
PREVIEW = os.environ.get('PREVIEW')  # write sampled PNGs instead of video
PINK = (228, 0, 124)

# ---------------- captions ----------------
words = json.load(open('work/words.json'))
wi = 0; chunks = []
for c in T.CHUNKS:
    toks = c.split(); ws = []
    for tok in toks:
        a, b, w = words[wi]; wi += 1
        clean = tok.strip(',.')
        if clean.lower() == 'somos': clean = 'SOMOS'
        ws.append(dict(t=a, e=b, text=clean, key=clean in T.KEYWORDS))
    chunks.append(ws)
assert wi == len(words), (wi, len(words))
# map to output time
for ch in chunks:
    for w in ch:
        w['T'] = T.src_time_to_out(w['t']); w['E'] = T.src_time_to_out(min(w['e'], w['t'] + 1.5))
        assert w['T'] is not None, w
for i, ch in enumerate(chunks):
    start = ch[0]['T'] - 0.04
    end = ch[-1]['E'] + 0.30
    if i + 1 < len(chunks):
        nxt = chunks[i + 1][0]['T'] - 0.04
        end = nxt if nxt - ch[-1]['E'] < 0.7 else min(end, nxt)
    ch_end = end
    for w in ch: w['cs'], w['ce'] = start, ch_end

FONT = ImageFont.truetype('fonts/HindSiliguri-700.ttf', 152)
SP = 38          # space between words
CY = 2960        # caption centre y
PADX, PADY = 26, 4

def word_img(text, key):
    bb = FONT.getbbox(text)
    tw, th = bb[2] - bb[0], 120
    asc = 0
    w = tw + 2 * PADX; h = 186
    im = Image.new('RGBA', (w + 60, h + 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    ox, oy = 30, 30
    if key:
        d.rounded_rectangle([ox, oy, ox + w, oy + h], radius=h // 2, fill=(255, 255, 255, 255))
        d.text((ox + PADX - bb[0], oy + 93), text, font=FONT, fill=PINK + (255,), anchor='lm')
    else:
        d.text((ox + PADX - bb[0], oy + 93), text, font=FONT, fill=(255, 255, 255, 255), anchor='lm')
    # soft shadow
    a = im.split()[3]
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
    sh.putalpha(a.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55)))
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.alpha_composite(sh, (0, 8)); out.alpha_composite(im)
    return out, w

cache = {}
def get_word(w):
    k = (w['text'], w['key'])
    if k not in cache: cache[k] = word_img(*k)
    return cache[k]

def eob(x, s=1.9):
    x = min(max(x, 0), 1); return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2

def draw_captions(canvas, t):
    for ch in chunks:
        if not (ch[0]['cs'] <= t < ch[0]['ce']): continue
        imgs = [get_word(w) for w in ch]
        total = sum(wd for _, wd in imgs) + SP * (len(ch) - 1)
        x = (W - total) / 2
        cend = ch[0]['ce']
        out_a = min(1, max(0, (cend - t) / 0.08))
        for w, (im, wd) in zip(ch, imgs):
            p = (t - (w['T'] - 0.05)) / 0.14
            if p > 0:
                a = min(1, p * 1.6) * out_a
                s = 0.72 + 0.28 * eob(p) if w['key'] else 0.9 + 0.1 * eob(p, 1.2)
                dy = (1 - min(1, p)) * 26
                iw, ih = im.size
                sim = im if abs(s - 1) < 1e-3 else im.resize((max(1, int(iw * s)), max(1, int(ih * s))), Image.BICUBIC)
                if a < 1:
                    al = sim.split()[3].point(lambda v: int(v * a)); sim = sim.copy(); sim.putalpha(al)
                cx = x + wd / 2
                canvas.alpha_composite(sim, (int(cx - sim.width / 2), int(CY + dy - sim.height / 2)))
            x += wd + SP
        break

# ---------------- easing ----------------
def eoc(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def zoom_for_src(sf, local_t):
    shot = None
    for i, (s0, z0, z1) in enumerate(T.SHOTS):
        if sf >= s0: shot = (i, s0, z0, z1)
    i, s0, z0, z1 = shot
    s1 = T.SHOTS[i + 1][0] if i + 1 < len(T.SHOTS) else 1316
    # shot end = min(next shot, end of segment containing sf)
    for a, b in T.SEGS:
        if a <= sf < b: s1 = min(s1, b); s0e = max(s0, a)
    p = (sf - s0e) / max(1, s1 - s0e)
    return z0 + (z1 - z0) * (3 * p * p - 2 * p * p * p)

def transform(img, z):
    if abs(z - 1) < 1e-4: return img
    ax, ay = T.ANCHOR[0] * W, T.ANCHOR[1] * H
    w, h = W / z, H / z
    x0 = ax - ax / z; y0 = ay - ay / z
    return img.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + w, y0 + h))

# ---------------- source reader ----------------
class Src:
    def __init__(self):
        self.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'src/main.mp4', '-vf',
            'scale=in_color_matrix=bt709:in_range=tv:out_range=full:flags=accurate_rnd+full_chroma_int,format=rgb24', '-f', 'rawvideo', '-'],
            stdout=subprocess.PIPE, bufsize=10 ** 8)
        self.idx = -1; self.cur = None
    def get(self, f):
        f = min(f, 1315)
        while self.idx < f:
            buf = self.p.stdout.read(W * H * 3)
            if len(buf) < W * H * 3: break
            self.idx += 1; self.cur = buf
        return Image.frombuffer('RGB', (W, H), self.cur, 'raw', 'RGB', 0, 1)

def ov(kind, i):
    p = f'render/{kind}/{i:04d}.png'
    return Image.open(p).convert('RGBA')

def ov_blur(kind, i, n=4):
    ims = [np.asarray(Image.open(f'render/{kind}/{i:04d}_{k}.png').convert('RGBA'), dtype=np.float32) for k in range(n)]
    # premultiplied average
    acc = np.zeros_like(ims[0])
    for a in ims:
        al = a[..., 3:4] / 255.0
        acc[..., :3] += a[..., :3] * al; acc[..., 3:4] += al
    acc /= n
    rgb = np.where(acc[..., 3:4] > 1e-4, acc[..., :3] / np.maximum(acc[..., 3:4], 1e-4), 0)
    out = np.concatenate([rgb, acc[..., 3:4] * 255], -1).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

BLUR_INTRO = set(range(76, 90))   # fast zoom frames rendered with sub-frames

def main():
    fmap = T.build_map()
    src = Src()
    first_src = T.SEGS[0][0]
    enc = None
    if not PREVIEW:
        os.makedirs(OUTDIR, exist_ok=True)
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30',
            '-i', '-', '-vf', 'scale=in_range=full:out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '13', '-profile:v', 'high', '-level', '5.2',
            '-x264-params', 'aq-mode=3:deblock=-1,-1', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
            '-color_range', 'tv', f'{OUTDIR}/video_noaudio.mp4'], stdin=subprocess.PIPE)
    phone_out0 = T.src_to_out(T.PHONE_SRC0)
    t0 = time.time()
    for of in range(RANGE[0], RANGE[1]):
        kind, i = fmap[of]
        t = of / T.FPS
        if kind == 'intro':
            base = None
            if i >= 50:
                vid = src.get(first_src)
                p = eoc((i / 30 - 1.78) / 1.22)
                base = transform(vid, 1.22 - 0.22 * p).convert('RGBA')
            o = ov_blur('intro', i) if i in BLUR_INTRO else ov('intro', i)
            if base is None: frame = Image.new('RGBA', (W, H), (255, 255, 255, 255))
            else: frame = base
            frame.alpha_composite(o)
        elif kind == 'src':
            vid = src.get(i)
            z = zoom_for_src(i, t)
            if i < T.SEGS[0][1]:  # punch at the drop
                z *= 1 + 0.06 * math.exp(-(i - first_src) / 4.0)
            frame = transform(vid, z).convert('RGBA')
            if phone_out0 <= of < phone_out0 + T.PHONE_F:
                frame.alpha_composite(ov('phone', of - phone_out0))
            draw_captions(frame, t)
        else:
            last_src = T.SEGS[-1][1] - 1
            vid = src.get(min(last_src + i, 1315))
            frame = transform(vid, 1.065).convert('RGBA')
            frame.alpha_composite(ov('outro', i))
        rgb = frame.convert('RGB')
        if PREVIEW:
            if of % int(PREVIEW) == 0: rgb.resize((540, 960), Image.LANCZOS).save(f'{OUTDIR}/p{of:04d}.jpg', quality=88)
        else:
            enc.stdin.write(rgb.tobytes())
        if of % 50 == 0: print(of, kind, i, f'{time.time() - t0:.0f}s', flush=True)
    if enc: enc.stdin.close(); enc.wait()

if __name__ == '__main__':
    main()

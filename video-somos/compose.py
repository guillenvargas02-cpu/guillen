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
        if clean in ('Contó', 'Contro', 'Contó'): clean = 'Contró'
        ws.append(dict(t=a, e=b, text=clean, key=clean in T.KEYWORDS))
    chunks.append(ws)
assert wi == len(words), (wi, len(words))
_F = ImageFont.truetype('fonts/HindSiliguri-700.ttf', 168)
def _ww(w): bb = _F.getbbox(w['text']); return bb[2] - bb[0] + 56
MAXW = 1760
_new = []
for ch in chunks:
    cur = []; cw = 0
    for w in ch:
        add = _ww(w) + (42 if cur else 0)
        if cur and cw + add > MAXW:
            _new.append(cur); cur = []; cw = 0; add = _ww(w)
        cur.append(w); cw += add
    _new.append(cur)
chunks = _new
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

FONT = ImageFont.truetype('fonts/HindSiliguri-700.ttf', 168)
SP = 42          # space between words
CY = 2960        # caption centre y
PADX, PADY = 28, 4

def word_img(text, key):
    bb = FONT.getbbox(text)
    tw, th = bb[2] - bb[0], 120
    asc = 0
    w = tw + 2 * PADX; h = 204
    im = Image.new('RGBA', (w + 60, h + 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    ox, oy = 30, 30
    if key:
        d.rounded_rectangle([ox, oy, ox + w, oy + h], radius=h // 2, fill=(255, 255, 255, 255))
        d.text((ox + PADX - bb[0], oy + 102), text, font=FONT, fill=PINK + (255,), anchor='lm')
    else:
        d.text((ox + PADX - bb[0], oy + 102), text, font=FONT, fill=(255, 255, 255, 255), anchor='lm')
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
        if ch[0]['text'] == 'tú': continue
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

# ---------------- finale: big "TÚ" pill that becomes the white outro ----------------
BIGF = ImageFont.truetype('fonts/HindSiliguri-700.ttf', 600)
def _big():
    txt = 'TÚ'; bb = BIGF.getbbox(txt); tw = bb[2] - bb[0]
    h = 700; w = tw + 2 * 170
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((170 - bb[0], h / 2 + 45), txt, font=BIGF, fill=PINK + (255,), anchor='lm')
    return im, w, h
BIG_TXT, BIG_W, BIG_H = _big()
TU_T = T.src_time_to_out(T.TU_SRC); FIN_T = T.src_time_to_out(T.FINALE_SRC)
FIN_END = T.OUTRO_START_F / T.FPS
BIG_CY = 3010
def eoq(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 5
def eiq(x): x = min(max(x, 0), 1); return x ** 3
def draw_finale(canvas, t):
    if t < TU_T - 0.03: return
    p = (t - (TU_T - 0.03)) / 0.20
    s = (0.35 + 0.65 * eob(p, 2.2)) * (1 + 0.07 * min(1, max(0, (t - TU_T) / (FIN_T - TU_T))))
    e = eiq((t - FIN_T) / (FIN_END - 1 / T.FPS - FIN_T)) if t >= FIN_T else 0.0
    # pill rect (grows to full frame on e)
    w0, h0 = BIG_W * s, BIG_H * s
    cx, cy = W / 2, BIG_CY + (H / 2 - BIG_CY) * e
    w = w0 + (W * 1.25 - w0) * e; h = h0 + (H * 1.15 - h0) * e
    r = (h0 / 2) * (1 - e) + 0
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    a = int(255 * min(1, max(p, 0) * 2.2))
    d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=max(0, r), fill=(255, 255, 255, a))
    if e < 1:
        # soft drop shadow only while it is a pill
        if e == 0:
            sh = layer.split()[3].filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * 0.35))
            shl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); shl.putalpha(sh)
            canvas.alpha_composite(shl, (0, 14))
        canvas.alpha_composite(layer)
        ta = max(0.0, 1 - e * 4) * min(1, max(p, 0) * 2.2)
        if ta > 0:
            ts = s * (1 + 0.25 * e)
            tim = BIG_TXT.resize((int(BIG_W * ts), int(BIG_H * ts)), Image.BICUBIC)
            if ta < 1:
                al = tim.split()[3].point(lambda v: int(v * ta)); tim.putalpha(al)
            canvas.alpha_composite(tim, (int(cx - tim.width / 2), int(cy - tim.height / 2)))
    else:
        canvas.alpha_composite(layer)

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

BLUR_INTRO = set(range(50, 59))   # fast zoom frames rendered with sub-frames
INTRO_INFO = {int(k): v for k, v in json.load(open('render/intro/info_0.json')).items()}

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
    link_out0 = T.src_to_out(T.LINK_SRC0)
    t0 = time.time()
    for of in range(RANGE[0], RANGE[1]):
        kind, i = fmap[of]
        t = of / T.FPS
        if kind == 'intro':
            frame = Image.new('RGBA', (W, H), (255, 255, 255, 255))
            if i >= 57:
                frame = src.get(first_src).convert('RGBA')
            o = ov_blur('intro', i) if i in BLUR_INTRO else ov('intro', i)
            frame.alpha_composite(o)
        elif kind == 'src':
            vid = src.get(i)
            z = zoom_for_src(i, t)
            frame = transform(vid, z).convert('RGBA')
            if link_out0 <= of < link_out0 + T.LINK_F:
                frame.alpha_composite(ov('link', of - link_out0))
            if phone_out0 <= of < phone_out0 + T.PHONE_F:
                frame.alpha_composite(ov('phone', of - phone_out0))
            draw_captions(frame, t)
            draw_finale(frame, t)
        else:
            frame = Image.new('RGBA', (W, H), (255, 255, 255, 255))
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

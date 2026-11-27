import numpy as np, soundfile as sf, subprocess, json
import timeline as T, sfx as S
SR = 48000
DUR = T.TOTAL_F / T.FPS
N = int(round(DUR * SR))
def db2(g): return 10 ** (g / 20)
def place(buf, x, t, gain_db=0.0):
    if x.ndim == 1: x = np.stack([x, x], 1)
    i = int(round(t * SR)); x = x * db2(gain_db)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x)); buf[i:j] += x[:j - i]
def peak(x, p_db): return x / (np.max(np.abs(x)) + 1e-12) * db2(p_db)

# ---------------- voice (cleaned) ----------------
v, sr = sf.read('work/voice_df_x108.wav', dtype='float64'); assert sr == SR
voice = np.zeros(N)
o = T.INTRO_F / T.FPS
fd = int(0.006 * SR)
for a, b in T.SEGS:
    n = T.seg_len(a, b); s0 = int(round(a / T.FPS / T.SPEED * SR))
    seg = v[s0:s0 + int(round(n / T.FPS * SR))].copy()
    seg[:fd] *= np.linspace(0, 1, fd); seg[-fd:] *= np.linspace(1, 0, fd)
    i = int(round(o * SR)); voice[i:i + len(seg)] += seg
    o += n / T.FPS
sf.write('work/stem_voice_raw.wav', voice, SR, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'work/stem_voice_raw.wav', '-af',
    'highpass=f=75:poles=2,equalizer=f=220:t=q:w=1.1:g=-2.5,equalizer=f=3400:t=q:w=0.9:g=2.5,'
    'highshelf=f=9000:g=1.5,acompressor=threshold=-24dB:ratio=3:attack=5:release=110:makeup=4dB:knee=4,'
    'alimiter=limit=0.89:attack=2:release=40:level=false', '-c:a', 'pcm_f32le', 'work/stem_voice.wav'], check=True)
voice, _ = sf.read('work/stem_voice.wav', dtype='float64')
voice = np.stack([voice, voice], 1)[:N]
if len(voice) < N: voice = np.vstack([voice, np.zeros((N - len(voice), 2))])

# ---------------- music with automation ----------------
m, _ = sf.read('work/music_st.wav', dtype='float64')
m = m[int(T.MUSIC_START * SR):int(T.MUSIC_START * SR) + N]
if len(m) < N: m = np.vstack([m, np.zeros((N - len(m), 2))])
outro0 = T.OUTRO_START_F / T.FPS
D0 = T.INTRO_F / T.FPS
TU = T.src_time_to_out(T.TU_SRC)
pts = [(0, 0.0), (D0, 0.0), (D0 + 0.10, -2.0), (D0 + 0.40, -28.0),
       (TU - 0.05, -28.0), (TU + 0.25, -18.0), (outro0, -11.0),
       (outro0 + 1.25, -10.5), (DUR - 1.6, -10.5), (DUR - 0.02, -45)]
tt = np.arange(N) / SR
g_db = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])
music = m * db2(g_db)[:, None]

# ---------------- sfx ----------------
fx = np.zeros((N, 2))
# intro: letter slams (5 percussive hits, last one strongest)
for k, (th, pit) in enumerate(zip([0.10, 0.22, 0.34, 0.46, 0.58], [1.0, 1.06, 0.94, 1.1, 0.86])):
    h = S.stereo(S.hit(pit, 1.0 + 0.15 * k), pan=[-0.35, 0.3, -0.15, 0.4, 0.0][k], width=1.0)
    h = S.reverb(h, 0.8, 0.16)
    place(fx, peak(h, -7.0 if k < 4 else -4.5), th + 0.055)
# soft air whoosh under the reveal
place(fx, peak(S.reverb(S.whoosh(0.9, 3000, 900, peak_at=0.18, pan0=0.4, pan1=-0.4), 0.7, 0.2), -22), 0.02)
# riser into the drop + impact
r = S.riser(0.85); place(fx, peak(r, -9.0), D0 - 0.85)
place(fx, peak(S.reverb(S.stereo(S.boom(), 0, 1.0), 1.4, 0.22), -3.5), D0)
# phone section
ph0 = T.src_to_out(T.PHONE_SRC0) / T.FPS
lk0 = T.src_to_out(T.LINK_SRC0) / T.FPS
place(fx, peak(S.reverb(S.stereo(S.pop(), 0, 0.6), 0.6, 0.15), -17), lk0)
for k in range(2): place(fx, peak(S.stereo(S.tap(), 0.0), -24), lk0 + (0.22 + 0.21 + k * 0.42) / T.SPEED)
place(fx, peak(S.reverb(S.whoosh(0.42, 500, 4200, peak_at=0.5, pan0=-0.2, pan1=0.2), 0.6, 0.15), -13), ph0 - 0.10)
place(fx, peak(S.stereo(S.scribble(0.93 / T.SPEED), 0.1), -20), ph0 + 0.62 / T.SPEED)
place(fx, peak(S.stereo(S.tap(), 0.05), -16), ph0 + 1.70 / T.SPEED)
place(fx, peak(S.reverb(S.stereo(S.pop(), 0, 0.6), 0.7, 0.18), -15), ph0 + 1.94 / T.SPEED)
place(fx, peak(S.reverb(S.whoosh(0.5, 4000, 600, peak_at=0.4, pan0=0.2, pan1=-0.3), 0.6, 0.15), -14), ph0 + 2.85 / T.SPEED)
# finale: impact on "TÚ" and whoosh as the white pill fills the screen
place(fx, peak(S.reverb(S.stereo(S.hit(0.8, 1.4), 0, 1.0), 0.9, 0.2), -6.0), TU)
place(fx, peak(S.reverb(S.stereo(S.boom(), 0, 1.0), 1.2, 0.2), -11.0), TU)
# outro: whoosh to white, then electric ignition (user SFX)
place(fx, peak(S.reverb(S.whoosh(0.55, 700, 6000, peak_at=0.85), 0.7, 0.2), -12), outro0 - 0.47)
elec, _ = sf.read('work/elec_st.wav', dtype='float64')
e2, _ = sf.read('work/efecto2_st.wav', dtype='float64')
elec = S.fade(elec, 0.002, 0.15); e2 = S.fade(e2, 0.001, 0.05)
place(fx, elec, outro0 + 0.20, +1.0)
place(fx, e2, outro0 + 0.60, -3.0)
crack = e2[int(0.52 * SR):int(0.60 * SR)].copy(); crack = S.fade(crack, 0.003, 0.02)
place(fx, crack, outro0 + 1.50, -9); place(fx, crack, outro0 + 1.60, -12)
place(fx, peak(S.reverb(S.stereo(S.thump(), 0, 0.5), 0.9, 0.15), -14), outro0 + 1.20)

mix = voice + music + fx
sf.write('work/mix_pre.wav', mix, SR, subtype='FLOAT')
sf.write('work/stem_music.wav', music, SR, subtype='FLOAT'); sf.write('work/stem_fx.wav', fx, SR, subtype='FLOAT')
# loudness: two-pass loudnorm to -14 LUFS / -1 dBTP (social standard)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'work/mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
js = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.0:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'work/mix_pre.wav', '-af', af, '-ar', '48000', '-c:a', 'pcm_s24le', 'work/mix_final.wav'], check=True)
print('done', DUR, js['input_i'])

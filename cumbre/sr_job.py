"""Upscale (x4 Real-ESRGAN general v3, mixed with its denoise variant) the frames of the phone clips that the edit uses."""
import sys, os, glob, subprocess, time, numpy as np, torch, cv2
S = sys.argv[1]; U = sys.argv[2]
sys.path.insert(0, f"{S}/tools"); import srvgg
torch.set_num_threads(4)
net = srvgg.load(f"{S}/models", 0.5).to(memory_format=torch.channels_last)
# frames exactos del corte: se leen del EDL de render.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import render
JOBS = []
for c, frames in render.needed_frames().items():
    if render.CLIPS[c]["kind"] == "sr":
        fr = sorted(frames)
        JOBS.append((render.CLIPS[c]["file"], fr[0], fr[-1], set(fr)))
for cid, a, b, want in JOBS:
    src = glob.glob(f"{U}/{cid}-*.mp4")[0]
    lr = f"{S}/work/lr/{cid}"; sr = f"{S}/work/sr/{cid}"; os.makedirs(lr, exist_ok=True); os.makedirs(sr, exist_ok=True)
    if not all(os.path.exists(f"{lr}/{n:05d}.png") for n in want):
        subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-vf",f"select='between(n\\,{a}\\,{b})'","-fps_mode","passthrough",
                        "-start_number",str(a),f"{lr}/%05d.png"], check=True)
    for n in range(a, b+1):
        if n not in want: continue
        out = f"{sr}/{n:05d}.png"
        if os.path.exists(out): continue
        im = cv2.imread(f"{lr}/{n:05d}.png", cv2.IMREAD_COLOR)[:, :, ::-1].astype(np.float32)/255
        x = torch.from_numpy(np.ascontiguousarray(im)).permute(2,0,1)[None].to(memory_format=torch.channels_last)
        t = time.time()
        with torch.inference_mode(), torch.autocast('cpu', dtype=torch.bfloat16):  # ~3.5x faster on AVX512-BF16
            y = net(x).float().clamp(0,1)[0].permute(1,2,0).numpy()
        cv2.imwrite(out + ".tmp.png", (y[:, :, ::-1]*255+0.5).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 1])
        os.replace(out + ".tmp.png", out)
        print(cid, n, f"{time.time()-t:.1f}s", flush=True)
print("DONE", flush=True)

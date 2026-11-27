"""Upscale (x4 Real-ESRGAN general v3, mixed with its denoise variant) the frames of the phone clips that the edit uses."""
import sys, os, glob, subprocess, time, numpy as np, torch, cv2
S = sys.argv[1]; U = sys.argv[2]
sys.path.insert(0, f"{S}/tools"); import srvgg
torch.set_num_threads(4)
net = srvgg.load(f"{S}/models", 0.5).to(memory_format=torch.channels_last)
# (clip id, first frame, last frame) at 30 fps — source ranges of the edit with a small margin
# exact frames of the edit (render.py EDL), +1 frame of margin
JOBS = [("1c6993a2", 284, 360), ("4e770089", 0, 60), ("8706a718", 0, 30), ("e3ccea3a", 275, 336),
        ("1c6993a2", 629, 690), ("4e770089", 89, 150), ("1c6993a2", 104, 150), ("8706a718", 65, 96), ("e4b4e34b", 269, 285)]
for cid, a, b in JOBS:
    src = glob.glob(f"{U}/{cid}-*.mp4")[0]
    lr = f"{S}/work/lr/{cid}"; sr = f"{S}/work/sr/{cid}"; os.makedirs(lr, exist_ok=True); os.makedirs(sr, exist_ok=True)
    if not os.path.exists(f"{lr}/{b:05d}.png"):
        subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-vf",f"select='between(n\\,{a}\\,{b})'","-fps_mode","passthrough",
                        "-start_number",str(a),f"{lr}/%05d.png"], check=True)
    for n in range(a, b+1):
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

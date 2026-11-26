import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[2], device="cpu", compute_type="int8")
import soundfile as sf, numpy as np, scipy.signal as ss
a,sr=sf.read(sys.argv[1]); a=ss.resample_poly(a,1,3).astype(np.float32)
segs, info = m.transcribe(a, language="es", word_timestamps=True, vad_filter=False, beam_size=5)
out=[]
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
    for w in s.words: out.append((round(w.start,2), round(w.end,2), w.word))
json.dump(out, open(sys.argv[3],"w"), ensure_ascii=False)

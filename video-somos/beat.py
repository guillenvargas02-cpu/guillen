import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, find_peaks
x,sr=sf.read('work/music.wav')
def env(sig,lo,hi):
    sos=butter(4,[lo,hi],'band',fs=sr,output='sos'); y=sosfilt(sos,sig)
    h=sr//100; n=len(y)//h
    return np.sqrt((y[:n*h].reshape(n,h)**2).mean(1))
low=env(x,40,150); hi=env(x,4000,12000); full=env(x,40,16000)
# onset strength
on=np.maximum(0,np.diff(np.log(low+1e-6)))
ac=np.correlate(on-on.mean(),on-on.mean(),'full')[len(on)-1:]
lags=np.arange(len(ac)); r=(lags>=30)&(lags<=100)
L=lags[r][np.argmax(ac[r])]; print("beat period (10ms frames):",L,"BPM~",6000/L)
# per-2s energy profile
for t in range(0,155,3):
    a=slice(t*100,(t+3)*100)
    print(f"{t:3d}s low {20*np.log10(low[a].mean()+1e-9):6.1f} hi {20*np.log10(hi[a].mean()+1e-9):6.1f} full {20*np.log10(full[a].mean()+1e-9):6.1f}")
np.save('work/low.npy',low); np.save('work/on.npy',on)

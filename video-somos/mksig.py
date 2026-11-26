import re, json, numpy as np
from svgfont import load
G,upm,asc=load('fonts/single-line/HersheyScript1.svg')
strokes=[]; x=0
for ch in 'Somos':
    d,adv=G[ch]
    for sp in re.findall(r'M[^M]*',d):
        pts=np.array(list(map(float,re.findall(r'-?\d+\.?\d*',sp)))).reshape(-1,2)
        pts[:,0]+=x; strokes.append(pts)
    x+=adv
# join S's end with nothing; add underline flourish
xmin=min(s[:,0].min() for s in strokes); xmax=max(s[:,0].max() for s in strokes)
fl=np.array([[xmin+60,-95],[xmin+500,-130],[xmin+1100,-125],[xmax-250,-90],[xmax+30,-40],[xmax+70,5]])
strokes.append(fl)
def catmull(P, n=10, alpha=0.5):
    P=np.vstack([P[0]*2-P[1], P, P[-1]*2-P[-2]])
    out=[]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        def tj(ti,a,b): return ti+max(np.linalg.norm(b-a),1e-6)**alpha
        t0=0;t1=tj(t0,p0,p1);t2=tj(t1,p1,p2);t3=tj(t2,p2,p3)
        seg=max(2,int(np.linalg.norm(p2-p1)/6))
        for t in np.linspace(t1,t2,seg,endpoint=False):
            A1=(t1-t)/(t1-t0)*p0+(t-t0)/(t1-t0)*p1; A2=(t2-t)/(t2-t1)*p1+(t-t1)/(t2-t1)*p2; A3=(t3-t)/(t3-t2)*p2+(t-t2)/(t3-t2)*p3
            B1=(t2-t)/(t2-t0)*A1+(t-t0)/(t2-t0)*A2; B2=(t3-t)/(t3-t1)*A2+(t-t1)/(t3-t1)*A3
            out.append((t2-t)/(t2-t1)*B1+(t-t1)/(t2-t1)*B2)
    out.append(P[-2]); return np.array(out)
ds=[]; allp=[]
for s in strokes:
    c=catmull(s); c[:,1]*=-1; allp.append(c)
allx=np.concatenate([c[:,0] for c in allp]); ally=np.concatenate([c[:,1] for c in allp])
pad=40; vb=[allx.min()-pad, ally.min()-pad, allx.max()-allx.min()+2*pad, ally.max()-ally.min()+2*pad]
for c in allp: ds.append('M '+' L '.join(f'{p[0]:.1f} {p[1]:.1f}' for p in c))
json.dump(dict(strokes=ds, vb=vb), open('anim/sig.json','w'))
open('anim/sig.js','w').write('window.SIGN='+json.dumps(dict(strokes=ds,vb=vb))+';')
print(vb, len(ds))
svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="{1000*vb[3]/vb[2]:.0f}" viewBox="{" ".join(map(str,vb))}"><rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}" fill="#fff"/>'+''.join(f'<path d="{d}" fill="none" stroke="#E4007C" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>' for d in ds)+'</svg>'
open('frames/sig.svg','w').write(svg)

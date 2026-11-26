import re,sys
src,ymin,ymax,out=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),sys.argv[4]
s=open(src).read()
paths=re.findall(r'<path[^>]*?fill="(rgb\([^)]*\))"[^>]*? d="([^"]*)"[^>]*/>',s)
keep=[]; X=[];Y=[]
for fill,d in paths:
    nums=list(map(float,re.findall(r'-?\d+\.?\d*',d)))
    xs=nums[0::2]; ys=nums[1::2]
    if not ys: continue
    if min(ys)>=ymin and max(ys)<=ymax and '0%, 0%, 0%' not in fill and '100%, 100%, 100%' not in fill:
        keep.append((fill,d)); X+=xs; Y+=ys
print(len(keep), set(f for f,_ in keep), min(X),max(X),min(Y),max(Y))
x0,x1,y0,y1=min(X),max(X),min(Y),max(Y)
open(out,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}" width="{x1-x0}" height="{y1-y0}">'+''.join(f'<path fill="#E4007C" d="{d}"/>' for _,d in keep)+'</svg>')

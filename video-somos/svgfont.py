import re, sys, json
def load(fn):
    s=open(fn).read()
    upm=float(re.search(r'units-per-em="([\d.]+)"',s).group(1))
    asc=float(re.search(r'ascent="([-\d.]+)"',s).group(1)) if 'ascent=' in s else upm*0.8
    dadv=float(re.search(r'<font[^>]*horiz-adv-x="([\d.]+)"',s).group(1)) if re.search(r'<font[^>]*horiz-adv-x',s) else upm/2
    G={}
    for m in re.finditer(r'<glyph([^>]*)/?>',s):
        a=m.group(1); u=re.search(r'unicode="([^"]*)"',a)
        if not u: continue
        ch=u.group(1).replace('&quot;','"').replace('&amp;','&').replace('&lt;','<').replace('&gt;','>').replace('&#x27;',"'")
        d=re.search(r'\sd="([^"]*)"',a); adv=re.search(r'horiz-adv-x="([\d.]+)"',a)
        G[ch]=(d.group(1) if d else '', float(adv.group(1)) if adv else dadv)
    return G,upm,asc
def text_paths(fn,text):
    G,upm,asc=load(fn); x=0; out=[]
    for ch in text:
        d,adv=G[ch]; out.append((x,d)); x+=adv
    return out,x,upm,asc
if __name__=='__main__':
    fonts=sys.argv[1:]
    svgs=[]
    for i,f in enumerate(fonts):
        ps,w,upm,asc=text_paths(f,'Somos')
        g=''.join(f'<path transform="translate({x} 0)" d="{d}"/>' for x,d in ps)
        svgs.append(f'<g transform="translate(40 {150+i*260}) scale({200/upm} {-200/upm})"><g fill="none" stroke="#111" stroke-width="{upm/45}" stroke-linecap="round" stroke-linejoin="round">{g}</g></g><text x="700" y="{120+i*260}" font-size="22">{f.split("/")[-1]}</text>')
    open('frames/fonts.html','w').write(f'<html><body style="margin:0;background:#fff"><svg width="1000" height="{len(fonts)*260+60}">{"".join(svgs)}</svg></body></html>')

// usage: node render.js mode outdir fps startFrame endFrame [scale] [subframes]
const { chromium } = require('playwright');
const path=require('path'), fs=require('fs');
(async()=>{
  const [mode,out,fps,s0,s1,scale,subs,spd]=process.argv.slice(2); const SPD=+(spd||1);
  fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:+(scale||2)});
  await pg.goto('file://'+path.resolve(__dirname,'anim/index.html')); await pg.evaluate(m=>setup(m),mode);
  await pg.evaluate(()=>document.fonts.ready);
  const S=+(subs||1); const INFO={};
  for(let f=+s0;f<=+s1;f++){
    for(let k=0;k<S;k++){
      const t=(f + (S>1? (k-(S-1)/2)/S*0.9 :0))/+fps*SPD;
      const info=await pg.evaluate(([t,f])=>renderAt(t,f),[t,f]); if(info&&k==0) INFO[f]=info;
      await pg.screenshot({path:`${out}/${String(f).padStart(4,'0')}${S>1?'_'+k:''}.png`,omitBackground:true});
    }
  }
  if(Object.keys(INFO).length) fs.writeFileSync(`${out}/info_${s0}.json`,JSON.stringify(INFO));
  await b.close();
})();

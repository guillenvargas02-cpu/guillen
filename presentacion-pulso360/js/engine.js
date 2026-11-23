(()=>{var Xh=Object.create;var Vl=Object.defineProperty;var qh=Object.getOwnPropertyDescriptor;var Yh=Object.getOwnPropertyNames;var Zh=Object.getPrototypeOf,Jh=Object.prototype.hasOwnProperty;var $h=(i,t)=>()=>(t||i((t={exports:{}}).exports,t),t.exports);var Kh=(i,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Yh(t))!Jh.call(i,s)&&s!==e&&Vl(i,s,{get:()=>t[s],enumerable:!(n=qh(t,s))||n.enumerable});return i};var Qh=(i,t,e)=>(e=i!=null?Xh(Zh(i)):{},Kh(t||!i||!i.__esModule?Vl(e,"default",{value:i,enumerable:!0}):e,i));var Fh=$h((Uh,Nh)=>{var Dh=function(){var i=function(A,S){var v=236,I=17,w=A,C=e[S],E=null,g=0,x=null,T=[],U={},O=function(F,H){g=w*4+17,E=function(L){for(var W=new Array(L),$=0;$<L;$+=1){W[$]=new Array(L);for(var K=0;K<L;K+=1)W[$][K]=null}return W}(g),V(0,0),V(g-7,0),V(0,g-7),at(),Z(),vt(F,H),w>=7&&Q(F),x==null&&(x=kt(w,C,T)),Mt(x,H)},V=function(F,H){for(var L=-1;L<=7;L+=1)if(!(F+L<=-1||g<=F+L))for(var W=-1;W<=7;W+=1)H+W<=-1||g<=H+W||(0<=L&&L<=6&&(W==0||W==6)||0<=W&&W<=6&&(L==0||L==6)||2<=L&&L<=4&&2<=W&&W<=4?E[F+L][H+W]=!0:E[F+L][H+W]=!1)},tt=function(){for(var F=0,H=0,L=0;L<8;L+=1){O(!0,L);var W=s.getLostPoint(U);(L==0||F>W)&&(F=W,H=L)}return H},Z=function(){for(var F=8;F<g-8;F+=1)E[F][6]==null&&(E[F][6]=F%2==0);for(var H=8;H<g-8;H+=1)E[6][H]==null&&(E[6][H]=H%2==0)},at=function(){for(var F=s.getPatternPosition(w),H=0;H<F.length;H+=1)for(var L=0;L<F.length;L+=1){var W=F[H],$=F[L];if(E[W][$]==null)for(var K=-2;K<=2;K+=1)for(var ft=-2;ft<=2;ft+=1)K==-2||K==2||ft==-2||ft==2||K==0&&ft==0?E[W+K][$+ft]=!0:E[W+K][$+ft]=!1}},Q=function(F){for(var H=s.getBCHTypeNumber(w),L=0;L<18;L+=1){var W=!F&&(H>>L&1)==1;E[Math.floor(L/3)][L%3+g-8-3]=W}for(var L=0;L<18;L+=1){var W=!F&&(H>>L&1)==1;E[L%3+g-8-3][Math.floor(L/3)]=W}},vt=function(F,H){for(var L=C<<3|H,W=s.getBCHTypeInfo(L),$=0;$<15;$+=1){var K=!F&&(W>>$&1)==1;$<6?E[$][8]=K:$<8?E[$+1][8]=K:E[g-15+$][8]=K}for(var $=0;$<15;$+=1){var K=!F&&(W>>$&1)==1;$<8?E[8][g-$-1]=K:$<9?E[8][15-$-1+1]=K:E[8][15-$-1]=K}E[g-8][8]=!F},Mt=function(F,H){for(var L=-1,W=g-1,$=7,K=0,ft=s.getMaskFunction(H),X=g-1;X>0;X-=2)for(X==6&&(X-=1);;){for(var ot=0;ot<2;ot+=1)if(E[W][X-ot]==null){var P=!1;K<F.length&&(P=(F[K]>>>$&1)==1);var ht=ft(W,X-ot);ht&&(P=!P),E[W][X-ot]=P,$-=1,$==-1&&(K+=1,$=7)}if(W+=L,W<0||g<=W){W-=L,L=-L;break}}},wt=function(F,H){for(var L=0,W=0,$=0,K=new Array(H.length),ft=new Array(H.length),X=0;X<H.length;X+=1){var ot=H[X].dataCount,P=H[X].totalCount-ot;W=Math.max(W,ot),$=Math.max($,P),K[X]=new Array(ot);for(var ht=0;ht<K[X].length;ht+=1)K[X][ht]=255&F.getBuffer()[ht+L];L+=ot;var ct=s.getErrorCorrectPolynomial(P),bt=a(K[X],ct.getLength()-1),St=bt.mod(ct);ft[X]=new Array(ct.getLength()-1);for(var ht=0;ht<ft[X].length;ht+=1){var Bt=ht+St.getLength()-ft[X].length;ft[X][ht]=Bt>=0?St.getAt(Bt):0}}for(var Ct=0,ht=0;ht<H.length;ht+=1)Ct+=H[ht].totalCount;for(var R=new Array(Ct),M=0,ht=0;ht<W;ht+=1)for(var X=0;X<H.length;X+=1)ht<K[X].length&&(R[M]=K[X][ht],M+=1);for(var ht=0;ht<$;ht+=1)for(var X=0;X<H.length;X+=1)ht<ft[X].length&&(R[M]=ft[X][ht],M+=1);return R},kt=function(F,H,L){for(var W=o.getRSBlocks(F,H),$=l(),K=0;K<L.length;K+=1){var ft=L[K];$.put(ft.getMode(),4),$.put(ft.getLength(),s.getLengthInBits(ft.getMode(),F)),ft.write($)}for(var X=0,K=0;K<W.length;K+=1)X+=W[K].dataCount;if($.getLengthInBits()>X*8)throw"code length overflow. ("+$.getLengthInBits()+">"+X*8+")";for($.getLengthInBits()+4<=X*8&&$.put(0,4);$.getLengthInBits()%8!=0;)$.putBit(!1);for(;!($.getLengthInBits()>=X*8||($.put(v,8),$.getLengthInBits()>=X*8));)$.put(I,8);return wt($,W)};U.addData=function(F,H){H=H||"Byte";var L=null;switch(H){case"Numeric":L=c(F);break;case"Alphanumeric":L=h(F);break;case"Byte":L=u(F);break;case"Kanji":L=f(F);break;default:throw"mode:"+H}T.push(L),x=null},U.isDark=function(F,H){if(F<0||g<=F||H<0||g<=H)throw F+","+H;return E[F][H]},U.getModuleCount=function(){return g},U.make=function(){if(w<1){for(var F=1;F<40;F++){for(var H=o.getRSBlocks(F,C),L=l(),W=0;W<T.length;W++){var $=T[W];L.put($.getMode(),4),L.put($.getLength(),s.getLengthInBits($.getMode(),F)),$.write(L)}for(var K=0,W=0;W<H.length;W++)K+=H[W].dataCount;if(L.getLengthInBits()<=K*8)break}w=F}O(!1,tt())},U.createTableTag=function(F,H){F=F||2,H=typeof H=="undefined"?F*4:H;var L="";L+='<table style="',L+=" border-width: 0px; border-style: none;",L+=" border-collapse: collapse;",L+=" padding: 0px; margin: "+H+"px;",L+='">',L+="<tbody>";for(var W=0;W<U.getModuleCount();W+=1){L+="<tr>";for(var $=0;$<U.getModuleCount();$+=1)L+='<td style="',L+=" border-width: 0px; border-style: none;",L+=" border-collapse: collapse;",L+=" padding: 0px; margin: 0px;",L+=" width: "+F+"px;",L+=" height: "+F+"px;",L+=" background-color: ",L+=U.isDark(W,$)?"#000000":"#ffffff",L+=";",L+='"/>';L+="</tr>"}return L+="</tbody>",L+="</table>",L},U.createSvgTag=function(F,H,L,W){var $={};typeof arguments[0]=="object"&&($=arguments[0],F=$.cellSize,H=$.margin,L=$.alt,W=$.title),F=F||2,H=typeof H=="undefined"?F*4:H,L=typeof L=="string"?{text:L}:L||{},L.text=L.text||null,L.id=L.text?L.id||"qrcode-description":null,W=typeof W=="string"?{text:W}:W||{},W.text=W.text||null,W.id=W.text?W.id||"qrcode-title":null;var K=U.getModuleCount()*F+H*2,ft,X,ot,P,ht="",ct;for(ct="l"+F+",0 0,"+F+" -"+F+",0 0,-"+F+"z ",ht+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',ht+=$.scalable?"":' width="'+K+'px" height="'+K+'px"',ht+=' viewBox="0 0 '+K+" "+K+'" ',ht+=' preserveAspectRatio="xMinYMin meet"',ht+=W.text||L.text?' role="img" aria-labelledby="'+Xt([W.id,L.id].join(" ").trim())+'"':"",ht+=">",ht+=W.text?'<title id="'+Xt(W.id)+'">'+Xt(W.text)+"</title>":"",ht+=L.text?'<description id="'+Xt(L.id)+'">'+Xt(L.text)+"</description>":"",ht+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',ht+='<path d="',ot=0;ot<U.getModuleCount();ot+=1)for(P=ot*F+H,ft=0;ft<U.getModuleCount();ft+=1)U.isDark(ot,ft)&&(X=ft*F+H,ht+="M"+X+","+P+ct);return ht+='" stroke="transparent" fill="black"/>',ht+="</svg>",ht},U.createDataURL=function(F,H){F=F||2,H=typeof H=="undefined"?F*4:H;var L=U.getModuleCount()*F+H*2,W=H,$=L-H;return d(L,L,function(K,ft){if(W<=K&&K<$&&W<=ft&&ft<$){var X=Math.floor((K-W)/F),ot=Math.floor((ft-W)/F);return U.isDark(ot,X)?0:1}else return 1})},U.createImgTag=function(F,H,L){F=F||2,H=typeof H=="undefined"?F*4:H;var W=U.getModuleCount()*F+H*2,$="";return $+="<img",$+=' src="',$+=U.createDataURL(F,H),$+='"',$+=' width="',$+=W,$+='"',$+=' height="',$+=W,$+='"',L&&($+=' alt="',$+=Xt(L),$+='"'),$+="/>",$};var Xt=function(F){for(var H="",L=0;L<F.length;L+=1){var W=F.charAt(L);switch(W){case"<":H+="&lt;";break;case">":H+="&gt;";break;case"&":H+="&amp;";break;case'"':H+="&quot;";break;default:H+=W;break}}return H},rt=function(F){var H=1;F=typeof F=="undefined"?H*2:F;var L=U.getModuleCount()*H+F*2,W=F,$=L-F,K,ft,X,ot,P,ht={"\u2588\u2588":"\u2588","\u2588 ":"\u2580"," \u2588":"\u2584","  ":" "},ct={"\u2588\u2588":"\u2580","\u2588 ":"\u2580"," \u2588":" ","  ":" "},bt="";for(K=0;K<L;K+=2){for(X=Math.floor((K-W)/H),ot=Math.floor((K+1-W)/H),ft=0;ft<L;ft+=1)P="\u2588",W<=ft&&ft<$&&W<=K&&K<$&&U.isDark(X,Math.floor((ft-W)/H))&&(P=" "),W<=ft&&ft<$&&W<=K+1&&K+1<$&&U.isDark(ot,Math.floor((ft-W)/H))?P+=" ":P+="\u2588",bt+=F<1&&K+1>=$?ct[P]:ht[P];bt+=`
`}return L%2&&F>0?bt.substring(0,bt.length-L-1)+Array(L+1).join("\u2580"):bt.substring(0,bt.length-1)};return U.createASCII=function(F,H){if(F=F||1,F<2)return rt(H);F-=1,H=typeof H=="undefined"?F*2:H;var L=U.getModuleCount()*F+H*2,W=H,$=L-H,K,ft,X,ot,P=Array(F+1).join("\u2588\u2588"),ht=Array(F+1).join("  "),ct="",bt="";for(K=0;K<L;K+=1){for(X=Math.floor((K-W)/F),bt="",ft=0;ft<L;ft+=1)ot=1,W<=ft&&ft<$&&W<=K&&K<$&&U.isDark(X,Math.floor((ft-W)/F))&&(ot=0),bt+=ot?P:ht;for(X=0;X<F;X+=1)ct+=bt+`
`}return ct.substring(0,ct.length-1)},U.renderTo2dContext=function(F,H){H=H||2;for(var L=U.getModuleCount(),W=0;W<L;W++)for(var $=0;$<L;$++)F.fillStyle=U.isDark(W,$)?"black":"white",F.fillRect(W*H,$*H,H,H)},U};i.stringToBytesFuncs={default:function(A){for(var S=[],v=0;v<A.length;v+=1){var I=A.charCodeAt(v);S.push(I&255)}return S}},i.stringToBytes=i.stringToBytesFuncs.default,i.createStringToBytes=function(A,S){var v=function(){for(var w=y(A),C=function(){var Z=w.read();if(Z==-1)throw"eof";return Z},E=0,g={};;){var x=w.read();if(x==-1)break;var T=C(),U=C(),O=C(),V=String.fromCharCode(x<<8|T),tt=U<<8|O;g[V]=tt,E+=1}if(E!=S)throw E+" != "+S;return g}(),I=63;return function(w){for(var C=[],E=0;E<w.length;E+=1){var g=w.charCodeAt(E);if(g<128)C.push(g);else{var x=v[w.charAt(E)];typeof x=="number"?(x&255)==x?C.push(x):(C.push(x>>>8),C.push(x&255)):C.push(I)}}return C}};var t={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},e={L:1,M:0,Q:3,H:2},n={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},s=function(){var A=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],S=1335,v=7973,I=21522,w={},C=function(E){for(var g=0;E!=0;)g+=1,E>>>=1;return g};return w.getBCHTypeInfo=function(E){for(var g=E<<10;C(g)-C(S)>=0;)g^=S<<C(g)-C(S);return(E<<10|g)^I},w.getBCHTypeNumber=function(E){for(var g=E<<12;C(g)-C(v)>=0;)g^=v<<C(g)-C(v);return E<<12|g},w.getPatternPosition=function(E){return A[E-1]},w.getMaskFunction=function(E){switch(E){case n.PATTERN000:return function(g,x){return(g+x)%2==0};case n.PATTERN001:return function(g,x){return g%2==0};case n.PATTERN010:return function(g,x){return x%3==0};case n.PATTERN011:return function(g,x){return(g+x)%3==0};case n.PATTERN100:return function(g,x){return(Math.floor(g/2)+Math.floor(x/3))%2==0};case n.PATTERN101:return function(g,x){return g*x%2+g*x%3==0};case n.PATTERN110:return function(g,x){return(g*x%2+g*x%3)%2==0};case n.PATTERN111:return function(g,x){return(g*x%3+(g+x)%2)%2==0};default:throw"bad maskPattern:"+E}},w.getErrorCorrectPolynomial=function(E){for(var g=a([1],0),x=0;x<E;x+=1)g=g.multiply(a([1,r.gexp(x)],0));return g},w.getLengthInBits=function(E,g){if(1<=g&&g<10)switch(E){case t.MODE_NUMBER:return 10;case t.MODE_ALPHA_NUM:return 9;case t.MODE_8BIT_BYTE:return 8;case t.MODE_KANJI:return 8;default:throw"mode:"+E}else if(g<27)switch(E){case t.MODE_NUMBER:return 12;case t.MODE_ALPHA_NUM:return 11;case t.MODE_8BIT_BYTE:return 16;case t.MODE_KANJI:return 10;default:throw"mode:"+E}else if(g<41)switch(E){case t.MODE_NUMBER:return 14;case t.MODE_ALPHA_NUM:return 13;case t.MODE_8BIT_BYTE:return 16;case t.MODE_KANJI:return 12;default:throw"mode:"+E}else throw"type:"+g},w.getLostPoint=function(E){for(var g=E.getModuleCount(),x=0,T=0;T<g;T+=1)for(var U=0;U<g;U+=1){for(var O=0,V=E.isDark(T,U),tt=-1;tt<=1;tt+=1)if(!(T+tt<0||g<=T+tt))for(var Z=-1;Z<=1;Z+=1)U+Z<0||g<=U+Z||tt==0&&Z==0||V==E.isDark(T+tt,U+Z)&&(O+=1);O>5&&(x+=3+O-5)}for(var T=0;T<g-1;T+=1)for(var U=0;U<g-1;U+=1){var at=0;E.isDark(T,U)&&(at+=1),E.isDark(T+1,U)&&(at+=1),E.isDark(T,U+1)&&(at+=1),E.isDark(T+1,U+1)&&(at+=1),(at==0||at==4)&&(x+=3)}for(var T=0;T<g;T+=1)for(var U=0;U<g-6;U+=1)E.isDark(T,U)&&!E.isDark(T,U+1)&&E.isDark(T,U+2)&&E.isDark(T,U+3)&&E.isDark(T,U+4)&&!E.isDark(T,U+5)&&E.isDark(T,U+6)&&(x+=40);for(var U=0;U<g;U+=1)for(var T=0;T<g-6;T+=1)E.isDark(T,U)&&!E.isDark(T+1,U)&&E.isDark(T+2,U)&&E.isDark(T+3,U)&&E.isDark(T+4,U)&&!E.isDark(T+5,U)&&E.isDark(T+6,U)&&(x+=40);for(var Q=0,U=0;U<g;U+=1)for(var T=0;T<g;T+=1)E.isDark(T,U)&&(Q+=1);var vt=Math.abs(100*Q/g/g-50)/5;return x+=vt*10,x},w}(),r=function(){for(var A=new Array(256),S=new Array(256),v=0;v<8;v+=1)A[v]=1<<v;for(var v=8;v<256;v+=1)A[v]=A[v-4]^A[v-5]^A[v-6]^A[v-8];for(var v=0;v<255;v+=1)S[A[v]]=v;var I={};return I.glog=function(w){if(w<1)throw"glog("+w+")";return S[w]},I.gexp=function(w){for(;w<0;)w+=255;for(;w>=256;)w-=255;return A[w]},I}();function a(A,S){if(typeof A.length=="undefined")throw A.length+"/"+S;var v=function(){for(var w=0;w<A.length&&A[w]==0;)w+=1;for(var C=new Array(A.length-w+S),E=0;E<A.length-w;E+=1)C[E]=A[E+w];return C}(),I={};return I.getAt=function(w){return v[w]},I.getLength=function(){return v.length},I.multiply=function(w){for(var C=new Array(I.getLength()+w.getLength()-1),E=0;E<I.getLength();E+=1)for(var g=0;g<w.getLength();g+=1)C[E+g]^=r.gexp(r.glog(I.getAt(E))+r.glog(w.getAt(g)));return a(C,0)},I.mod=function(w){if(I.getLength()-w.getLength()<0)return I;for(var C=r.glog(I.getAt(0))-r.glog(w.getAt(0)),E=new Array(I.getLength()),g=0;g<I.getLength();g+=1)E[g]=I.getAt(g);for(var g=0;g<w.getLength();g+=1)E[g]^=r.gexp(r.glog(w.getAt(g))+C);return a(E,0).mod(w)},I}var o=function(){var A=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],S=function(w,C){var E={};return E.totalCount=w,E.dataCount=C,E},v={},I=function(w,C){switch(C){case e.L:return A[(w-1)*4+0];case e.M:return A[(w-1)*4+1];case e.Q:return A[(w-1)*4+2];case e.H:return A[(w-1)*4+3];default:return}};return v.getRSBlocks=function(w,C){var E=I(w,C);if(typeof E=="undefined")throw"bad rs block @ typeNumber:"+w+"/errorCorrectionLevel:"+C;for(var g=E.length/3,x=[],T=0;T<g;T+=1)for(var U=E[T*3+0],O=E[T*3+1],V=E[T*3+2],tt=0;tt<U;tt+=1)x.push(S(O,V));return x},v}(),l=function(){var A=[],S=0,v={};return v.getBuffer=function(){return A},v.getAt=function(I){var w=Math.floor(I/8);return(A[w]>>>7-I%8&1)==1},v.put=function(I,w){for(var C=0;C<w;C+=1)v.putBit((I>>>w-C-1&1)==1)},v.getLengthInBits=function(){return S},v.putBit=function(I){var w=Math.floor(S/8);A.length<=w&&A.push(0),I&&(A[w]|=128>>>S%8),S+=1},v},c=function(A){var S=t.MODE_NUMBER,v=A,I={};I.getMode=function(){return S},I.getLength=function(E){return v.length},I.write=function(E){for(var g=v,x=0;x+2<g.length;)E.put(w(g.substring(x,x+3)),10),x+=3;x<g.length&&(g.length-x==1?E.put(w(g.substring(x,x+1)),4):g.length-x==2&&E.put(w(g.substring(x,x+2)),7))};var w=function(E){for(var g=0,x=0;x<E.length;x+=1)g=g*10+C(E.charAt(x));return g},C=function(E){if("0"<=E&&E<="9")return E.charCodeAt(0)-48;throw"illegal char :"+E};return I},h=function(A){var S=t.MODE_ALPHA_NUM,v=A,I={};I.getMode=function(){return S},I.getLength=function(C){return v.length},I.write=function(C){for(var E=v,g=0;g+1<E.length;)C.put(w(E.charAt(g))*45+w(E.charAt(g+1)),11),g+=2;g<E.length&&C.put(w(E.charAt(g)),6)};var w=function(C){if("0"<=C&&C<="9")return C.charCodeAt(0)-48;if("A"<=C&&C<="Z")return C.charCodeAt(0)-65+10;switch(C){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+C}};return I},u=function(A){var S=t.MODE_8BIT_BYTE,v=A,I=i.stringToBytes(A),w={};return w.getMode=function(){return S},w.getLength=function(C){return I.length},w.write=function(C){for(var E=0;E<I.length;E+=1)C.put(I[E],8)},w},f=function(A){var S=t.MODE_KANJI,v=A,I=i.stringToBytesFuncs.SJIS;if(!I)throw"sjis not supported.";(function(E,g){var x=I(E);if(x.length!=2||(x[0]<<8|x[1])!=g)throw"sjis not supported."})("\u53CB",38726);var w=I(A),C={};return C.getMode=function(){return S},C.getLength=function(E){return~~(w.length/2)},C.write=function(E){for(var g=w,x=0;x+1<g.length;){var T=(255&g[x])<<8|255&g[x+1];if(33088<=T&&T<=40956)T-=33088;else if(57408<=T&&T<=60351)T-=49472;else throw"illegal char at "+(x+1)+"/"+T;T=(T>>>8&255)*192+(T&255),E.put(T,13),x+=2}if(x<g.length)throw"illegal char at "+(x+1)},C},p=function(){var A=[],S={};return S.writeByte=function(v){A.push(v&255)},S.writeShort=function(v){S.writeByte(v),S.writeByte(v>>>8)},S.writeBytes=function(v,I,w){I=I||0,w=w||v.length;for(var C=0;C<w;C+=1)S.writeByte(v[C+I])},S.writeString=function(v){for(var I=0;I<v.length;I+=1)S.writeByte(v.charCodeAt(I))},S.toByteArray=function(){return A},S.toString=function(){var v="";v+="[";for(var I=0;I<A.length;I+=1)I>0&&(v+=","),v+=A[I];return v+="]",v},S},_=function(){var A=0,S=0,v=0,I="",w={},C=function(g){I+=String.fromCharCode(E(g&63))},E=function(g){if(!(g<0)){if(g<26)return 65+g;if(g<52)return 97+(g-26);if(g<62)return 48+(g-52);if(g==62)return 43;if(g==63)return 47}throw"n:"+g};return w.writeByte=function(g){for(A=A<<8|g&255,S+=8,v+=1;S>=6;)C(A>>>S-6),S-=6},w.flush=function(){if(S>0&&(C(A<<6-S),A=0,S=0),v%3!=0)for(var g=3-v%3,x=0;x<g;x+=1)I+="="},w.toString=function(){return I},w},y=function(A){var S=A,v=0,I=0,w=0,C={};C.read=function(){for(;w<8;){if(v>=S.length){if(w==0)return-1;throw"unexpected end of file./"+w}var g=S.charAt(v);if(v+=1,g=="=")return w=0,-1;if(g.match(/^\s$/))continue;I=I<<6|E(g.charCodeAt(0)),w+=6}var x=I>>>w-8&255;return w-=8,x};var E=function(g){if(65<=g&&g<=90)return g-65;if(97<=g&&g<=122)return g-97+26;if(48<=g&&g<=57)return g-48+52;if(g==43)return 62;if(g==47)return 63;throw"c:"+g};return C},m=function(A,S){var v=A,I=S,w=new Array(A*S),C={};C.setPixel=function(T,U,O){w[U*v+T]=O},C.write=function(T){T.writeString("GIF87a"),T.writeShort(v),T.writeShort(I),T.writeByte(128),T.writeByte(0),T.writeByte(0),T.writeByte(0),T.writeByte(0),T.writeByte(0),T.writeByte(255),T.writeByte(255),T.writeByte(255),T.writeString(","),T.writeShort(0),T.writeShort(0),T.writeShort(v),T.writeShort(I),T.writeByte(0);var U=2,O=g(U);T.writeByte(U);for(var V=0;O.length-V>255;)T.writeByte(255),T.writeBytes(O,V,255),V+=255;T.writeByte(O.length-V),T.writeBytes(O,V,O.length-V),T.writeByte(0),T.writeString(";")};var E=function(T){var U=T,O=0,V=0,tt={};return tt.write=function(Z,at){if(Z>>>at)throw"length over";for(;O+at>=8;)U.writeByte(255&(Z<<O|V)),at-=8-O,Z>>>=8-O,V=0,O=0;V=Z<<O|V,O=O+at},tt.flush=function(){O>0&&U.writeByte(V)},tt},g=function(T){for(var U=1<<T,O=(1<<T)+1,V=T+1,tt=x(),Z=0;Z<U;Z+=1)tt.add(String.fromCharCode(Z));tt.add(String.fromCharCode(U)),tt.add(String.fromCharCode(O));var at=p(),Q=E(at);Q.write(U,V);var vt=0,Mt=String.fromCharCode(w[vt]);for(vt+=1;vt<w.length;){var wt=String.fromCharCode(w[vt]);vt+=1,tt.contains(Mt+wt)?Mt=Mt+wt:(Q.write(tt.indexOf(Mt),V),tt.size()<4095&&(tt.size()==1<<V&&(V+=1),tt.add(Mt+wt)),Mt=wt)}return Q.write(tt.indexOf(Mt),V),Q.write(O,V),Q.flush(),at.toByteArray()},x=function(){var T={},U=0,O={};return O.add=function(V){if(O.contains(V))throw"dup key:"+V;T[V]=U,U+=1},O.size=function(){return U},O.indexOf=function(V){return T[V]},O.contains=function(V){return typeof T[V]!="undefined"},O};return C},d=function(A,S,v){for(var I=m(A,S),w=0;w<S;w+=1)for(var C=0;C<A;C+=1)I.setPixel(C,w,v(C,w));var E=p();I.write(E);for(var g=_(),x=E.toByteArray(),T=0;T<x.length;T+=1)g.writeByte(x[T]);return g.flush(),"data:image/gif;base64,"+g};return i}();(function(){Dh.stringToBytesFuncs["UTF-8"]=function(i){function t(e){for(var n=[],s=0;s<e.length;s++){var r=e.charCodeAt(s);r<128?n.push(r):r<2048?n.push(192|r>>6,128|r&63):r<55296||r>=57344?n.push(224|r>>12,128|r>>6&63,128|r&63):(s++,r=65536+((r&1023)<<10|e.charCodeAt(s)&1023),n.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63))}return n}return t(i)}})();(function(i){typeof define=="function"&&define.amd?define([],i):typeof Uh=="object"&&(Nh.exports=i())})(function(){return Dh})});var gl="170";var jh=0,Gl=1,tu=2;var rh=1,eu=2,Pn=3,Zn=0,Xe=1,We=2,vn=0,Vi=1,qe=2,Wl=3,Xl=4,nu=5,ci=100,iu=101,su=102,ru=103,au=104,ou=200,lu=201,cu=202,hu=203,Wa=204,Xa=205,uu=206,fu=207,du=208,pu=209,mu=210,gu=211,_u=212,vu=213,xu=214,qa=0,Ya=1,Za=2,qi=3,Ja=4,$a=5,Ka=6,Qa=7,ah=0,yu=1,Mu=2,Yn=0,_l=1,vl=2,xl=3,zs=4,Su=5,yl=6,Ml=7;var oh=300,Yi=301,Zi=302,ja=303,to=304,ta=306,eo=1e3,fi=1001,no=1002,Qe=1003,bu=1004;var Ws=1005;var gn=1006,ha=1007;var di=1008;var Un=1009,lh=1010,ch=1011,Rs=1012,Sl=1013,pi=1014,_n=1015,fn=1016,bl=1017,El=1018,Ji=1020,hh=35902,uh=1021,fh=1022,cn=1023,dh=1024,ph=1025,Gi=1026,$i=1027,Tl=1028,wl=1029,mh=1030,Al=1031;var Rl=1033,yr=33776,Mr=33777,Sr=33778,br=33779,io=35840,so=35841,ro=35842,ao=35843,oo=36196,lo=37492,co=37496,ho=37808,uo=37809,fo=37810,po=37811,mo=37812,go=37813,_o=37814,vo=37815,xo=37816,yo=37817,Mo=37818,So=37819,bo=37820,Eo=37821,Er=36492,To=36494,wo=36495,gh=36283,Ao=36284,Ro=36285,Co=36286;var Tr=2300,Po=2301,ua=2302,ql=2400,Yl=2401,Zl=2402;var Eu=3200,Tu=3201;var _h=0,wu=1,qn="",Ge="srgb",ss="srgb-linear",ea="linear",re="srgb";var Ei=7680;var Jl=519,Au=512,Ru=513,Cu=514,vh=515,Pu=516,Iu=517,Lu=518,Du=519,$l=35044;var Kl="300 es",Ln=2e3,wr=2001,Jn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Ne=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ql=1234567,Ss=Math.PI/180,Cs=180/Math.PI;function Mi(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ne[i&255]+Ne[i>>8&255]+Ne[i>>16&255]+Ne[i>>24&255]+"-"+Ne[t&255]+Ne[t>>8&255]+"-"+Ne[t>>16&15|64]+Ne[t>>24&255]+"-"+Ne[e&63|128]+Ne[e>>8&255]+"-"+Ne[e>>16&255]+Ne[e>>24&255]+Ne[n&255]+Ne[n>>8&255]+Ne[n>>16&255]+Ne[n>>24&255]).toLowerCase()}function Le(i,t,e){return Math.max(t,Math.min(e,i))}function Cl(i,t){return(i%t+t)%t}function Uu(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Nu(i,t,e){return i!==t?(e-i)/(t-i):0}function bs(i,t,e){return(1-e)*i+e*t}function Fu(i,t,e,n){return bs(i,t,1-Math.exp(-e*n))}function Ou(i,t=1){return t-Math.abs(Cl(i,t*2)-t)}function Bu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function zu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function ku(i,t){return i+Math.floor(Math.random()*(t-i+1))}function Hu(i,t){return i+Math.random()*(t-i)}function Vu(i){return i*(.5-Math.random())}function Gu(i){i!==void 0&&(Ql=i);let t=Ql+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Wu(i){return i*Ss}function Xu(i){return i*Cs}function qu(i){return(i&i-1)===0&&i!==0}function Yu(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Zu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ju(i,t,e,n,s){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),u=r((t-n)/2),f=a((t-n)/2),p=r((n-t)/2),_=a((n-t)/2);switch(s){case"XYX":i.set(o*h,l*u,l*f,o*c);break;case"YZY":i.set(l*f,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*f,o*h,o*c);break;case"XZX":i.set(o*h,l*_,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*_,o*c);break;case"ZYZ":i.set(l*_,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function zi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ze(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var xh={DEG2RAD:Ss,RAD2DEG:Cs,generateUUID:Mi,clamp:Le,euclideanModulo:Cl,mapLinear:Uu,inverseLerp:Nu,lerp:bs,damp:Fu,pingpong:Ou,smoothstep:Bu,smootherstep:zu,randInt:ku,randFloat:Hu,randFloatSpread:Vu,seededRandom:Gu,degToRad:Wu,radToDeg:Xu,isPowerOfTwo:qu,ceilPowerOfTwo:Yu,floorPowerOfTwo:Zu,setQuaternionFromProperEuler:Ju,normalize:ze,denormalize:zi},yt=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Wt=class i{constructor(t,e,n,s,r,a,o,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],_=n[8],y=s[0],m=s[3],d=s[6],A=s[1],S=s[4],v=s[7],I=s[2],w=s[5],C=s[8];return r[0]=a*y+o*A+l*I,r[3]=a*m+o*S+l*w,r[6]=a*d+o*v+l*C,r[1]=c*y+h*A+u*I,r[4]=c*m+h*S+u*w,r[7]=c*d+h*v+u*C,r[2]=f*y+p*A+_*I,r[5]=f*m+p*S+_*w,r[8]=f*d+p*v+_*C,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,p=c*r-a*l,_=e*u+n*f+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/_;return t[0]=u*y,t[1]=(s*c-h*n)*y,t[2]=(o*n-s*a)*y,t[3]=f*y,t[4]=(h*e-s*l)*y,t[5]=(s*r-o*e)*y,t[6]=p*y,t[7]=(n*l-c*e)*y,t[8]=(a*e-n*r)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(fa.makeScale(t,e)),this}rotate(t){return this.premultiply(fa.makeRotation(-t)),this}translate(t,e){return this.premultiply(fa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},fa=new Wt;function yh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Ar(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function $u(){let i=Ar("canvas");return i.style.display="block",i}var jl={};function ys(i){i in jl||(jl[i]=!0,console.warn(i))}function Ku(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Qu(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function ju(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var Kt={enabled:!0,workingColorSpace:ss,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===re&&(i.r=Dn(i.r),i.g=Dn(i.g),i.b=Dn(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===re&&(i.r=Wi(i.r),i.g=Wi(i.g),i.b=Wi(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===qn?ea:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Dn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Wi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var tc=[.64,.33,.3,.6,.15,.06],ec=[.2126,.7152,.0722],nc=[.3127,.329],ic=new Wt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),sc=new Wt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Kt.define({[ss]:{primaries:tc,whitePoint:nc,transfer:ea,toXYZ:ic,fromXYZ:sc,luminanceCoefficients:ec,workingColorSpaceConfig:{unpackColorSpace:Ge},outputColorSpaceConfig:{drawingBufferColorSpace:Ge}},[Ge]:{primaries:tc,whitePoint:nc,transfer:re,toXYZ:ic,fromXYZ:sc,luminanceCoefficients:ec,outputColorSpaceConfig:{drawingBufferColorSpace:Ge}}});var Ti,Io=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement=="undefined")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ti===void 0&&(Ti=Ar("canvas")),Ti.width=t.width,Ti.height=t.height;let n=Ti.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Ti}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement!="undefined"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&t instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&t instanceof ImageBitmap){let e=Ar("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Dn(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Dn(e[n]/255)*255):e[n]=Dn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},tf=0,Rr=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:tf++}),this.uuid=Mi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(da(s[a].image)):r.push(da(s[a]))}else r=da(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function da(i){return typeof HTMLImageElement!="undefined"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&i instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&i instanceof ImageBitmap?Io.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var ef=0,Ye=class i extends Jn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=fi,s=fi,r=gn,a=di,o=cn,l=Un,c=i.DEFAULT_ANISOTROPY,h=qn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ef++}),this.uuid=Mi(),this.name="",this.source=new Rr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new yt(0,0),this.repeat=new yt(1,1),this.center=new yt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Wt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==oh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case eo:t.x=t.x-Math.floor(t.x);break;case fi:t.x=t.x<0?0:1;break;case no:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case eo:t.y=t.y-Math.floor(t.y);break;case fi:t.y=t.y<0?0:1;break;case no:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ye.DEFAULT_IMAGE=null;Ye.DEFAULT_MAPPING=oh;Ye.DEFAULT_ANISOTROPY=1;var oe=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],_=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-y)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+y)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let S=(c+1)/2,v=(p+1)/2,I=(d+1)/2,w=(h+f)/4,C=(u+y)/4,E=(_+m)/4;return S>v&&S>I?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=w/n,r=C/n):v>I?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=w/s,r=E/s):I<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(I),n=C/r,s=E/r),this.set(n,s,r,e),this}let A=Math.sqrt((m-_)*(m-_)+(u-y)*(u-y)+(f-h)*(f-h));return Math.abs(A)<.001&&(A=1),this.x=(m-_)/A,this.y=(u-y)/A,this.z=(f-h)/A,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Lo=class extends Jn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new oe(0,0,t,e),this.scissorTest=!1,this.viewport=new oe(0,0,t,e);let s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new Ye(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Rr(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},He=class extends Lo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Cr=class extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Qe,this.minFilter=Qe,this.wrapR=fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Do=class extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Qe,this.minFilter=Qe,this.wrapR=fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var xn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],f=r[a+0],p=r[a+1],_=r[a+2],y=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=p,t[e+2]=_,t[e+3]=y;return}if(u!==y||l!==f||c!==p||h!==_){let m=1-o,d=l*f+c*p+h*_+u*y,A=d>=0?1:-1,S=1-d*d;if(S>Number.EPSILON){let I=Math.sqrt(S),w=Math.atan2(I,d*A);m=Math.sin(m*w)/I,o=Math.sin(o*w)/I}let v=o*A;if(l=l*m+f*v,c=c*m+p*v,h=h*m+_*v,u=u*m+y*v,m===1-o){let I=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=I,c*=I,h*=I,u*=I}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],p=r[a+2],_=r[a+3];return t[e]=o*_+h*u+l*p-c*f,t[e+1]=l*_+h*f+c*u-o*p,t[e+2]=c*_+h*p+o*f-l*u,t[e+3]=h*_-o*u-l*f-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),p=l(s/2),_=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u-f*p*_;break;case"YXZ":this._x=f*h*u+c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u+f*p*_;break;case"ZXY":this._x=f*h*u-c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u-f*p*_;break;case"ZYX":this._x=f*h*u-c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u+f*p*_;break;case"YZX":this._x=f*h*u+c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u-f*p*_;break;case"XZY":this._x=f*h*u-c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u+f*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){let p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){let p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Le(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let l=1-o*o;if(l<=Number.EPSILON){let p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(rc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(rc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return pa.copy(this).projectOnVector(t),this.sub(pa)}reflect(t){return this.sub(pa.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},pa=new N,rc=new xn,hn=class{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(an.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(an.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=an.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,an):an.fromBufferAttribute(r,a),an.applyMatrix4(t.matrixWorld),this.expandByPoint(an);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Xs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Xs.copy(n.boundingBox)),Xs.applyMatrix4(t.matrixWorld),this.union(Xs)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,an),an.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(fs),qs.subVectors(this.max,fs),wi.subVectors(t.a,fs),Ai.subVectors(t.b,fs),Ri.subVectors(t.c,fs),kn.subVectors(Ai,wi),Hn.subVectors(Ri,Ai),ni.subVectors(wi,Ri);let e=[0,-kn.z,kn.y,0,-Hn.z,Hn.y,0,-ni.z,ni.y,kn.z,0,-kn.x,Hn.z,0,-Hn.x,ni.z,0,-ni.x,-kn.y,kn.x,0,-Hn.y,Hn.x,0,-ni.y,ni.x,0];return!ma(e,wi,Ai,Ri,qs)||(e=[1,0,0,0,1,0,0,0,1],!ma(e,wi,Ai,Ri,qs))?!1:(Ys.crossVectors(kn,Hn),e=[Ys.x,Ys.y,Ys.z],ma(e,wi,Ai,Ri,qs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,an).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(an).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Tn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Tn=[new N,new N,new N,new N,new N,new N,new N,new N],an=new N,Xs=new hn,wi=new N,Ai=new N,Ri=new N,kn=new N,Hn=new N,ni=new N,fs=new N,qs=new N,Ys=new N,ii=new N;function ma(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ii.fromArray(i,r);let o=s.x*Math.abs(ii.x)+s.y*Math.abs(ii.y)+s.z*Math.abs(ii.z),l=t.dot(ii),c=e.dot(ii),h=n.dot(ii);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var nf=new hn,ds=new N,ga=new N,Nn=class{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):nf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ds.subVectors(t,this.center);let e=ds.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ds,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ga.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ds.copy(t.center).add(ga)),this.expandByPoint(ds.copy(t.center).sub(ga))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},wn=new N,_a=new N,Zs=new N,Vn=new N,va=new N,Js=new N,xa=new N,Ps=class{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,wn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=wn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(wn.copy(this.origin).addScaledVector(this.direction,e),wn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){_a.copy(t).add(e).multiplyScalar(.5),Zs.copy(e).sub(t).normalize(),Vn.copy(this.origin).sub(_a);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Zs),o=Vn.dot(this.direction),l=-Vn.dot(Zs),c=Vn.lengthSq(),h=Math.abs(1-a*a),u,f,p,_;if(h>0)if(u=a*l-o,f=a*o-l,_=r*h,u>=0)if(f>=-_)if(f<=_){let y=1/h;u*=y,f*=y,p=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f<=-_?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=_?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(_a).addScaledVector(Zs,f),p}intersectSphere(t,e){wn.subVectors(t.center,this.origin);let n=wn.dot(this.direction),s=wn.dot(wn)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,wn)!==null}intersectTriangle(t,e,n,s,r){va.subVectors(e,t),Js.subVectors(n,t),xa.crossVectors(va,Js);let a=this.direction.dot(xa),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Vn.subVectors(this.origin,t);let l=o*this.direction.dot(Js.crossVectors(Vn,Js));if(l<0)return null;let c=o*this.direction.dot(va.cross(Vn));if(c<0||l+c>a)return null;let h=-o*Vn.dot(xa);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ae=class i{constructor(t,e,n,s,r,a,o,l,c,h,u,f,p,_,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,f,p,_,y,m)}set(t,e,n,s,r,a,o,l,c,h,u,f,p,_,y,m){let d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=_,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Ci.setFromMatrixColumn(t,0).length(),r=1/Ci.setFromMatrixColumn(t,1).length(),a=1/Ci.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let f=a*h,p=a*u,_=o*h,y=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=p+_*c,e[5]=f-y*c,e[9]=-o*l,e[2]=y-f*c,e[6]=_+p*c,e[10]=a*l}else if(t.order==="YXZ"){let f=l*h,p=l*u,_=c*h,y=c*u;e[0]=f+y*o,e[4]=_*o-p,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=p*o-_,e[6]=y+f*o,e[10]=a*l}else if(t.order==="ZXY"){let f=l*h,p=l*u,_=c*h,y=c*u;e[0]=f-y*o,e[4]=-a*u,e[8]=_+p*o,e[1]=p+_*o,e[5]=a*h,e[9]=y-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let f=a*h,p=a*u,_=o*h,y=o*u;e[0]=l*h,e[4]=_*c-p,e[8]=f*c+y,e[1]=l*u,e[5]=y*c+f,e[9]=p*c-_,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let f=a*l,p=a*c,_=o*l,y=o*c;e[0]=l*h,e[4]=y-f*u,e[8]=_*u+p,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=p*u+_,e[10]=f-y*u}else if(t.order==="XZY"){let f=a*l,p=a*c,_=o*l,y=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+y,e[5]=a*h,e[9]=p*u-_,e[2]=_*u-p,e[6]=o*h,e[10]=y*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(sf,t,rf)}lookAt(t,e,n){let s=this.elements;return $e.subVectors(t,e),$e.lengthSq()===0&&($e.z=1),$e.normalize(),Gn.crossVectors(n,$e),Gn.lengthSq()===0&&(Math.abs(n.z)===1?$e.x+=1e-4:$e.z+=1e-4,$e.normalize(),Gn.crossVectors(n,$e)),Gn.normalize(),$s.crossVectors($e,Gn),s[0]=Gn.x,s[4]=$s.x,s[8]=$e.x,s[1]=Gn.y,s[5]=$s.y,s[9]=$e.y,s[2]=Gn.z,s[6]=$s.z,s[10]=$e.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],_=n[2],y=n[6],m=n[10],d=n[14],A=n[3],S=n[7],v=n[11],I=n[15],w=s[0],C=s[4],E=s[8],g=s[12],x=s[1],T=s[5],U=s[9],O=s[13],V=s[2],tt=s[6],Z=s[10],at=s[14],Q=s[3],vt=s[7],Mt=s[11],wt=s[15];return r[0]=a*w+o*x+l*V+c*Q,r[4]=a*C+o*T+l*tt+c*vt,r[8]=a*E+o*U+l*Z+c*Mt,r[12]=a*g+o*O+l*at+c*wt,r[1]=h*w+u*x+f*V+p*Q,r[5]=h*C+u*T+f*tt+p*vt,r[9]=h*E+u*U+f*Z+p*Mt,r[13]=h*g+u*O+f*at+p*wt,r[2]=_*w+y*x+m*V+d*Q,r[6]=_*C+y*T+m*tt+d*vt,r[10]=_*E+y*U+m*Z+d*Mt,r[14]=_*g+y*O+m*at+d*wt,r[3]=A*w+S*x+v*V+I*Q,r[7]=A*C+S*T+v*tt+I*vt,r[11]=A*E+S*U+v*Z+I*Mt,r[15]=A*g+S*O+v*at+I*wt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],p=t[14],_=t[3],y=t[7],m=t[11],d=t[15];return _*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*p-n*l*p)+y*(+e*l*p-e*c*f+r*a*f-s*a*p+s*c*h-r*l*h)+m*(+e*c*u-e*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+d*(-s*o*h-e*l*u+e*o*f+s*a*u-n*a*f+n*l*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],p=t[11],_=t[12],y=t[13],m=t[14],d=t[15],A=u*m*c-y*f*c+y*l*p-o*m*p-u*l*d+o*f*d,S=_*f*c-h*m*c-_*l*p+a*m*p+h*l*d-a*f*d,v=h*y*c-_*u*c+_*o*p-a*y*p-h*o*d+a*u*d,I=_*u*l-h*y*l-_*o*f+a*y*f+h*o*m-a*u*m,w=e*A+n*S+s*v+r*I;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/w;return t[0]=A*C,t[1]=(y*f*r-u*m*r-y*s*p+n*m*p+u*s*d-n*f*d)*C,t[2]=(o*m*r-y*l*r+y*s*c-n*m*c-o*s*d+n*l*d)*C,t[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*p-n*l*p)*C,t[4]=S*C,t[5]=(h*m*r-_*f*r+_*s*p-e*m*p-h*s*d+e*f*d)*C,t[6]=(_*l*r-a*m*r-_*s*c+e*m*c+a*s*d-e*l*d)*C,t[7]=(a*f*r-h*l*r+h*s*c-e*f*c-a*s*p+e*l*p)*C,t[8]=v*C,t[9]=(_*u*r-h*y*r-_*n*p+e*y*p+h*n*d-e*u*d)*C,t[10]=(a*y*r-_*o*r+_*n*c-e*y*c-a*n*d+e*o*d)*C,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*p-e*o*p)*C,t[12]=I*C,t[13]=(h*y*s-_*u*s+_*n*f-e*y*f-h*n*m+e*u*m)*C,t[14]=(_*o*s-a*y*s-_*n*l+e*y*l+a*n*m-e*o*m)*C,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*f+e*o*f)*C,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,p=r*h,_=r*u,y=a*h,m=a*u,d=o*u,A=l*c,S=l*h,v=l*u,I=n.x,w=n.y,C=n.z;return s[0]=(1-(y+d))*I,s[1]=(p+v)*I,s[2]=(_-S)*I,s[3]=0,s[4]=(p-v)*w,s[5]=(1-(f+d))*w,s[6]=(m+A)*w,s[7]=0,s[8]=(_+S)*C,s[9]=(m-A)*C,s[10]=(1-(f+y))*C,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Ci.set(s[0],s[1],s[2]).length(),a=Ci.set(s[4],s[5],s[6]).length(),o=Ci.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],on.copy(this);let c=1/r,h=1/a,u=1/o;return on.elements[0]*=c,on.elements[1]*=c,on.elements[2]*=c,on.elements[4]*=h,on.elements[5]*=h,on.elements[6]*=h,on.elements[8]*=u,on.elements[9]*=u,on.elements[10]*=u,e.setFromRotationMatrix(on),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=Ln){let l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s),p,_;if(o===Ln)p=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===wr)p=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=Ln){let l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),f=(e+t)*c,p=(n+s)*h,_,y;if(o===Ln)_=(a+r)*u,y=-2*u;else if(o===wr)_=r*u,y=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Ci=new N,on=new ae,sf=new N(0,0,0),rf=new N(1,1,1),Gn=new N,$s=new N,$e=new N,ac=new ae,oc=new xn,yn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Le(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Le(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Le(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Le(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Le(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Le(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return ac.makeRotationFromQuaternion(t),this.setFromRotationMatrix(ac,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return oc.setFromEuler(this),this.setFromQuaternion(oc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};yn.DEFAULT_ORDER="XYZ";var Pr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},af=0,lc=new N,Pi=new xn,An=new ae,Ks=new N,ps=new N,of=new N,lf=new xn,cc=new N(1,0,0),hc=new N(0,1,0),uc=new N(0,0,1),fc={type:"added"},cf={type:"removed"},Ii={type:"childadded",child:null},ya={type:"childremoved",child:null},Be=class i extends Jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:af++}),this.uuid=Mi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new N,e=new yn,n=new xn,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ae},normalMatrix:{value:new Wt}}),this.matrix=new ae,this.matrixWorld=new ae,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Pr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Pi.setFromAxisAngle(t,e),this.quaternion.multiply(Pi),this}rotateOnWorldAxis(t,e){return Pi.setFromAxisAngle(t,e),this.quaternion.premultiply(Pi),this}rotateX(t){return this.rotateOnAxis(cc,t)}rotateY(t){return this.rotateOnAxis(hc,t)}rotateZ(t){return this.rotateOnAxis(uc,t)}translateOnAxis(t,e){return lc.copy(t).applyQuaternion(this.quaternion),this.position.add(lc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(cc,t)}translateY(t){return this.translateOnAxis(hc,t)}translateZ(t){return this.translateOnAxis(uc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ks.copy(t):Ks.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ps.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(ps,Ks,this.up):An.lookAt(Ks,ps,this.up),this.quaternion.setFromRotationMatrix(An),s&&(An.extractRotation(s.matrixWorld),Pi.setFromRotationMatrix(An),this.quaternion.premultiply(Pi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(fc),Ii.child=t,this.dispatchEvent(Ii),Ii.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(cf),ya.child=t,this.dispatchEvent(ya),ya.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),An.multiply(t.parent.matrixWorld)),t.applyMatrix4(An),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(fc),Ii.child=t,this.dispatchEvent(Ii),Ii.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ps,t,of),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ps,lf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),p=a(t.animations),_=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};Be.DEFAULT_UP=new N(0,1,0);Be.DEFAULT_MATRIX_AUTO_UPDATE=!0;Be.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ln=new N,Rn=new N,Ma=new N,Cn=new N,Li=new N,Di=new N,dc=new N,Sa=new N,ba=new N,Ea=new N,Ta=new oe,wa=new oe,Aa=new oe,hi=class i{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),ln.subVectors(t,e),s.cross(ln);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){ln.subVectors(s,e),Rn.subVectors(n,e),Ma.subVectors(t,e);let a=ln.dot(ln),o=ln.dot(Rn),l=ln.dot(Ma),c=Rn.dot(Rn),h=Rn.dot(Ma),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let f=1/u,p=(c*l-o*h)*f,_=(a*h-o*l)*f;return r.set(1-p-_,_,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Cn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Cn.x),l.addScaledVector(a,Cn.y),l.addScaledVector(o,Cn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ta.setScalar(0),wa.setScalar(0),Aa.setScalar(0),Ta.fromBufferAttribute(t,e),wa.fromBufferAttribute(t,n),Aa.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ta,r.x),a.addScaledVector(wa,r.y),a.addScaledVector(Aa,r.z),a}static isFrontFacing(t,e,n,s){return ln.subVectors(n,e),Rn.subVectors(t,e),ln.cross(Rn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ln.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),ln.cross(Rn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Li.subVectors(s,n),Di.subVectors(r,n),Sa.subVectors(t,n);let l=Li.dot(Sa),c=Di.dot(Sa);if(l<=0&&c<=0)return e.copy(n);ba.subVectors(t,s);let h=Li.dot(ba),u=Di.dot(ba);if(h>=0&&u<=h)return e.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Li,a);Ea.subVectors(t,r);let p=Li.dot(Ea),_=Di.dot(Ea);if(_>=0&&p<=_)return e.copy(r);let y=p*c-l*_;if(y<=0&&c>=0&&_<=0)return o=c/(c-_),e.copy(n).addScaledVector(Di,o);let m=h*_-p*u;if(m<=0&&u-h>=0&&p-_>=0)return dc.subVectors(r,s),o=(u-h)/(u-h+(p-_)),e.copy(s).addScaledVector(dc,o);let d=1/(m+y+f);return a=y*d,o=f*d,e.copy(n).addScaledVector(Li,a).addScaledVector(Di,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Mh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wn={h:0,s:0,l:0},Qs={h:0,s:0,l:0};function Ra(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Ht=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ge){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Kt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Kt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Kt.workingColorSpace){if(t=Cl(t,1),e=Le(e,0,1),n=Le(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Ra(a,r,t+1/3),this.g=Ra(a,r,t),this.b=Ra(a,r,t-1/3)}return Kt.toWorkingColorSpace(this,s),this}setStyle(t,e=Ge){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ge){let n=Mh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Dn(t.r),this.g=Dn(t.g),this.b=Dn(t.b),this}copyLinearToSRGB(t){return this.r=Wi(t.r),this.g=Wi(t.g),this.b=Wi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ge){return Kt.fromWorkingColorSpace(Fe.copy(this),t),Math.round(Le(Fe.r*255,0,255))*65536+Math.round(Le(Fe.g*255,0,255))*256+Math.round(Le(Fe.b*255,0,255))}getHexString(t=Ge){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Kt.workingColorSpace){Kt.fromWorkingColorSpace(Fe.copy(this),e);let n=Fe.r,s=Fe.g,r=Fe.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Kt.workingColorSpace){return Kt.fromWorkingColorSpace(Fe.copy(this),e),t.r=Fe.r,t.g=Fe.g,t.b=Fe.b,t}getStyle(t=Ge){Kt.fromWorkingColorSpace(Fe.copy(this),t);let e=Fe.r,n=Fe.g,s=Fe.b;return t!==Ge?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Wn),this.setHSL(Wn.h+t,Wn.s+e,Wn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Wn),t.getHSL(Qs);let n=bs(Wn.h,Qs.h,e),s=bs(Wn.s,Qs.s,e),r=bs(Wn.l,Qs.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Fe=new Ht;Ht.NAMES=Mh;var hf=0,Fn=class extends Jn{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:hf++}),this.uuid=Mi(),this.name="",this.blending=Vi,this.side=Zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Wa,this.blendDst=Xa,this.blendEquation=ci,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ht(0,0,0),this.blendAlpha=0,this.depthFunc=qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Jl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ei,this.stencilZFail=Ei,this.stencilZPass=Ei,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Vi&&(n.blending=this.blending),this.side!==Zn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Wa&&(n.blendSrc=this.blendSrc),this.blendDst!==Xa&&(n.blendDst=this.blendDst),this.blendEquation!==ci&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==qi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Jl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ei&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ei&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ei&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},On=class extends Fn{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new Ht(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yn,this.combine=ah,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Se=new N,js=new yt,be=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=$l,this.updateRanges=[],this.gpuType=_n,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)js.fromBufferAttribute(this,e),js.applyMatrix3(t),this.setXY(e,js.x,js.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix3(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix4(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyNormalMatrix(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.transformDirection(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=zi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ze(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=zi(e,this.array)),e}setX(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=zi(e,this.array)),e}setY(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=zi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=zi(e,this.array)),e}setW(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array),s=ze(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array),s=ze(s,this.array),r=ze(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==$l&&(t.usage=this.usage),t}};var Ir=class extends be{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Lr=class extends be{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var he=class extends be{constructor(t,e,n){super(new Float32Array(t),e,n)}},uf=0,en=new ae,Ca=new Be,Ui=new N,Ke=new hn,ms=new hn,Ce=new N,ye=class i extends Jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:uf++}),this.uuid=Mi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(yh(t)?Lr:Ir)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Wt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return en.makeRotationFromQuaternion(t),this.applyMatrix4(en),this}rotateX(t){return en.makeRotationX(t),this.applyMatrix4(en),this}rotateY(t){return en.makeRotationY(t),this.applyMatrix4(en),this}rotateZ(t){return en.makeRotationZ(t),this.applyMatrix4(en),this}translate(t,e,n){return en.makeTranslation(t,e,n),this.applyMatrix4(en),this}scale(t,e,n){return en.makeScale(t,e,n),this.applyMatrix4(en),this}lookAt(t){return Ca.lookAt(t),Ca.updateMatrix(),this.applyMatrix4(Ca.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ui).negate(),this.translate(Ui.x,Ui.y,Ui.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new he(n,3))}else{for(let n=0,s=e.count;n<s;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Ke.setFromBufferAttribute(r),this.morphTargetsRelative?(Ce.addVectors(this.boundingBox.min,Ke.min),this.boundingBox.expandByPoint(Ce),Ce.addVectors(this.boundingBox.max,Ke.max),this.boundingBox.expandByPoint(Ce)):(this.boundingBox.expandByPoint(Ke.min),this.boundingBox.expandByPoint(Ke.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Nn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(Ke.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];ms.setFromBufferAttribute(o),this.morphTargetsRelative?(Ce.addVectors(Ke.min,ms.min),Ke.expandByPoint(Ce),Ce.addVectors(Ke.max,ms.max),Ke.expandByPoint(Ce)):(Ke.expandByPoint(ms.min),Ke.expandByPoint(ms.max))}Ke.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Ce.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ce));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Ce.fromBufferAttribute(o,c),l&&(Ui.fromBufferAttribute(t,c),Ce.add(Ui)),s=Math.max(s,n.distanceToSquared(Ce))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new be(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let E=0;E<n.count;E++)o[E]=new N,l[E]=new N;let c=new N,h=new N,u=new N,f=new yt,p=new yt,_=new yt,y=new N,m=new N;function d(E,g,x){c.fromBufferAttribute(n,E),h.fromBufferAttribute(n,g),u.fromBufferAttribute(n,x),f.fromBufferAttribute(r,E),p.fromBufferAttribute(r,g),_.fromBufferAttribute(r,x),h.sub(c),u.sub(c),p.sub(f),_.sub(f);let T=1/(p.x*_.y-_.x*p.y);isFinite(T)&&(y.copy(h).multiplyScalar(_.y).addScaledVector(u,-p.y).multiplyScalar(T),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-_.x).multiplyScalar(T),o[E].add(y),o[g].add(y),o[x].add(y),l[E].add(m),l[g].add(m),l[x].add(m))}let A=this.groups;A.length===0&&(A=[{start:0,count:t.count}]);for(let E=0,g=A.length;E<g;++E){let x=A[E],T=x.start,U=x.count;for(let O=T,V=T+U;O<V;O+=3)d(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let S=new N,v=new N,I=new N,w=new N;function C(E){I.fromBufferAttribute(s,E),w.copy(I);let g=o[E];S.copy(g),S.sub(I.multiplyScalar(I.dot(g))).normalize(),v.crossVectors(w,g);let T=v.dot(l[E])<0?-1:1;a.setXYZW(E,S.x,S.y,S.z,T)}for(let E=0,g=A.length;E<g;++E){let x=A[E],T=x.start,U=x.count;for(let O=T,V=T+U;O<V;O+=3)C(t.getX(O+0)),C(t.getX(O+1)),C(t.getX(O+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new be(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new N,r=new N,a=new N,o=new N,l=new N,c=new N,h=new N,u=new N;if(t)for(let f=0,p=t.count;f<p;f+=3){let _=t.getX(f+0),y=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,y),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=e.count;f<p;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ce.fromBufferAttribute(t,e),Ce.normalize(),t.setXYZ(e,Ce.x,Ce.y,Ce.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h),p=0,_=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*h;for(let d=0;d<h;d++)f[_++]=c[p++]}return new be(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let f=c[h],p=t(f,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let p=c[u];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},pc=new ae,si=new Ps,tr=new Nn,mc=new N,er=new N,nr=new N,ir=new N,Pa=new N,sr=new N,gc=new N,rr=new N,ne=class extends Be{constructor(t=new ye,e=new On){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){sr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(Pa.fromBufferAttribute(u,t),a?sr.addScaledVector(Pa,h):sr.addScaledVector(Pa.sub(e),h))}e.add(sr)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),tr.copy(n.boundingSphere),tr.applyMatrix4(r),si.copy(t.ray).recast(t.near),!(tr.containsPoint(si.origin)===!1&&(si.intersectSphere(tr,mc)===null||si.origin.distanceToSquared(mc)>(t.far-t.near)**2))&&(pc.copy(r).invert(),si.copy(t.ray).applyMatrix4(pc),!(n.boundingBox!==null&&si.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,si)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,y=f.length;_<y;_++){let m=f[_],d=a[m.materialIndex],A=Math.max(m.start,p.start),S=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let v=A,I=S;v<I;v+=3){let w=o.getX(v),C=o.getX(v+1),E=o.getX(v+2);s=ar(this,d,t,n,c,h,u,w,C,E),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){let A=o.getX(m),S=o.getX(m+1),v=o.getX(m+2);s=ar(this,a,t,n,c,h,u,A,S,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,y=f.length;_<y;_++){let m=f[_],d=a[m.materialIndex],A=Math.max(m.start,p.start),S=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=A,I=S;v<I;v+=3){let w=v,C=v+1,E=v+2;s=ar(this,d,t,n,c,h,u,w,C,E),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){let A=m,S=m+1,v=m+2;s=ar(this,a,t,n,c,h,u,A,S,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function ff(i,t,e,n,s,r,a,o){let l;if(t.side===Xe?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Zn,o),l===null)return null;rr.copy(o),rr.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(rr);return c<e.near||c>e.far?null:{distance:c,point:rr.clone(),object:i}}function ar(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,er),i.getVertexPosition(l,nr),i.getVertexPosition(c,ir);let h=ff(i,t,e,n,er,nr,ir,gc);if(h){let u=new N;hi.getBarycoord(gc,er,nr,ir,u),s&&(h.uv=hi.getInterpolatedAttribute(s,o,l,c,u,new yt)),r&&(h.uv1=hi.getInterpolatedAttribute(r,o,l,c,u,new yt)),a&&(h.normal=hi.getInterpolatedAttribute(a,o,l,c,u,new N),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let f={a:o,b:l,c,normal:new N,materialIndex:0};hi.getNormal(er,nr,ir,f.normal),h.face=f,h.barycoord=u}return h}var Mn=class i extends ye{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],f=0,p=0;_("z","y","x",-1,-1,n,e,t,a,r,0),_("z","y","x",1,-1,n,e,-t,a,r,1),_("x","z","y",1,1,t,n,e,s,a,2),_("x","z","y",1,-1,t,n,-e,s,a,3),_("x","y","z",1,-1,t,e,n,s,r,4),_("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new he(c,3)),this.setAttribute("normal",new he(h,3)),this.setAttribute("uv",new he(u,2));function _(y,m,d,A,S,v,I,w,C,E,g){let x=v/C,T=I/E,U=v/2,O=I/2,V=w/2,tt=C+1,Z=E+1,at=0,Q=0,vt=new N;for(let Mt=0;Mt<Z;Mt++){let wt=Mt*T-O;for(let kt=0;kt<tt;kt++){let Xt=kt*x-U;vt[y]=Xt*A,vt[m]=wt*S,vt[d]=V,c.push(vt.x,vt.y,vt.z),vt[y]=0,vt[m]=0,vt[d]=w>0?1:-1,h.push(vt.x,vt.y,vt.z),u.push(kt/C),u.push(1-Mt/E),at+=1}}for(let Mt=0;Mt<E;Mt++)for(let wt=0;wt<C;wt++){let kt=f+wt+tt*Mt,Xt=f+wt+tt*(Mt+1),rt=f+(wt+1)+tt*(Mt+1),F=f+(wt+1)+tt*Mt;l.push(kt,Xt,F),l.push(Xt,rt,F),Q+=6}o.addGroup(p,Q,g),p+=Q,f+=at}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Ki(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function ke(i){let t={};for(let e=0;e<i.length;e++){let n=Ki(i[e]);for(let s in n)t[s]=n[s]}return t}function df(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Sh(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Kt.workingColorSpace}var Kn={clone:Ki,merge:ke},pf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,mf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pe=class extends Fn{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pf,this.fragmentShader=mf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ki(t.uniforms),this.uniformsGroups=df(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Dr=class extends Be{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ae,this.projectionMatrix=new ae,this.projectionMatrixInverse=new ae,this.coordinateSystem=Ln}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Xn=new N,_c=new yt,vc=new yt,Oe=class extends Dr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Cs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ss*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Cs*2*Math.atan(Math.tan(Ss*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Xn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Xn.x,Xn.y).multiplyScalar(-t/Xn.z),Xn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Xn.x,Xn.y).multiplyScalar(-t/Xn.z)}getViewSize(t,e){return this.getViewBounds(t,_c,vc),e.subVectors(vc,_c)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ss*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Ni=-90,Fi=1,Uo=class extends Be{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Oe(Ni,Fi,t,e);s.layers=this.layers,this.add(s);let r=new Oe(Ni,Fi,t,e);r.layers=this.layers,this.add(r);let a=new Oe(Ni,Fi,t,e);a.layers=this.layers,this.add(a);let o=new Oe(Ni,Fi,t,e);o.layers=this.layers,this.add(o);let l=new Oe(Ni,Fi,t,e);l.layers=this.layers,this.add(l);let c=new Oe(Ni,Fi,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===Ln)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===wr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=y,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,f,p),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Ur=class extends Ye{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Yi,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},No=class extends He{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ur(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:gn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Mn(5,5,5),r=new pe({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Xe,blending:vn});r.uniforms.tEquirect.value=e;let a=new ne(s,r),o=e.minFilter;return e.minFilter===di&&(e.minFilter=gn),new Uo(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}},Ia=new N,gf=new N,_f=new Wt,In=class{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Ia.subVectors(n,e).cross(gf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Ia),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||_f.getNormalMatrix(t),s=this.coplanarPoint(Ia).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ri=new Nn,or=new N,Is=class{constructor(t=new In,e=new In,n=new In,s=new In,r=new In,a=new In){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Ln){let n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],p=s[8],_=s[9],y=s[10],m=s[11],d=s[12],A=s[13],S=s[14],v=s[15];if(n[0].setComponents(l-r,f-c,m-p,v-d).normalize(),n[1].setComponents(l+r,f+c,m+p,v+d).normalize(),n[2].setComponents(l+a,f+h,m+_,v+A).normalize(),n[3].setComponents(l-a,f-h,m-_,v-A).normalize(),n[4].setComponents(l-o,f-u,m-y,v-S).normalize(),e===Ln)n[5].setComponents(l+o,f+u,m+y,v+S).normalize();else if(e===wr)n[5].setComponents(o,u,y,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ri.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ri.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ri)}intersectsSprite(t){return ri.center.set(0,0,0),ri.radius=.7071067811865476,ri.applyMatrix4(t.matrixWorld),this.intersectsSphere(ri)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(or.x=s.normal.x>0?t.max.x:t.min.x,or.y=s.normal.y>0?t.max.y:t.min.y,or.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(or)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function bh(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function vf(i){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,_)=>p.start-_.start);let f=0;for(let p=1;p<u.length;p++){let _=u[f],y=u[p];y.start<=_.start+_.count+1?_.count=Math.max(_.count,y.start+y.count-_.start):(++f,u[f]=y)}u.length=f+1;for(let p=0,_=u.length;p<_;p++){let y=u[p];i.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Sn=class i extends ye{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,f=e/l,p=[],_=[],y=[],m=[];for(let d=0;d<h;d++){let A=d*f-a;for(let S=0;S<c;S++){let v=S*u-r;_.push(v,-A,0),y.push(0,0,1),m.push(S/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let A=0;A<o;A++){let S=A+c*d,v=A+c*(d+1),I=A+1+c*(d+1),w=A+1+c*d;p.push(S,v,w),p.push(v,I,w)}this.setIndex(p),this.setAttribute("position",new he(_,3)),this.setAttribute("normal",new he(y,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},xf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,yf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Mf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Sf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ef=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Tf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,wf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Af=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Rf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Cf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Pf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,If=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Lf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Df=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Uf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Nf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ff=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Of=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Bf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,zf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,kf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Hf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Vf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Gf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Wf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Xf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jf="gl_FragColor = linearToOutputTexel( gl_FragColor );",$f=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Kf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Qf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,jf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,td=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ed=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,nd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,id=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,sd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ad=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,od=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ld=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ud=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,fd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,dd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,pd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,md=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,_d=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,xd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,yd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Md=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Sd=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bd=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ed=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Td=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ad=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Rd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Cd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Pd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Id=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ld=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Dd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ud=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Nd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Od=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Bd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Hd=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Vd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Gd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Wd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Xd=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,qd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yd=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Zd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$d=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Kd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,jd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,tp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,ep=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,np=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ip=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,sp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ap=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,op=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,lp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,cp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,hp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,up=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,fp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,dp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,pp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,mp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,_p=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,vp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,xp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ep=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Tp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,wp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ap=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Rp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Cp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ip=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Lp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Dp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Up=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Np=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Op=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,zp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,kp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Gp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Yp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Jp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$p=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Kp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:xf,alphahash_pars_fragment:yf,alphamap_fragment:Mf,alphamap_pars_fragment:Sf,alphatest_fragment:bf,alphatest_pars_fragment:Ef,aomap_fragment:Tf,aomap_pars_fragment:wf,batching_pars_vertex:Af,batching_vertex:Rf,begin_vertex:Cf,beginnormal_vertex:Pf,bsdfs:If,iridescence_fragment:Lf,bumpmap_pars_fragment:Df,clipping_planes_fragment:Uf,clipping_planes_pars_fragment:Nf,clipping_planes_pars_vertex:Ff,clipping_planes_vertex:Of,color_fragment:Bf,color_pars_fragment:zf,color_pars_vertex:kf,color_vertex:Hf,common:Vf,cube_uv_reflection_fragment:Gf,defaultnormal_vertex:Wf,displacementmap_pars_vertex:Xf,displacementmap_vertex:qf,emissivemap_fragment:Yf,emissivemap_pars_fragment:Zf,colorspace_fragment:Jf,colorspace_pars_fragment:$f,envmap_fragment:Kf,envmap_common_pars_fragment:Qf,envmap_pars_fragment:jf,envmap_pars_vertex:td,envmap_physical_pars_fragment:ud,envmap_vertex:ed,fog_vertex:nd,fog_pars_vertex:id,fog_fragment:sd,fog_pars_fragment:rd,gradientmap_pars_fragment:ad,lightmap_pars_fragment:od,lights_lambert_fragment:ld,lights_lambert_pars_fragment:cd,lights_pars_begin:hd,lights_toon_fragment:fd,lights_toon_pars_fragment:dd,lights_phong_fragment:pd,lights_phong_pars_fragment:md,lights_physical_fragment:gd,lights_physical_pars_fragment:_d,lights_fragment_begin:vd,lights_fragment_maps:xd,lights_fragment_end:yd,logdepthbuf_fragment:Md,logdepthbuf_pars_fragment:Sd,logdepthbuf_pars_vertex:bd,logdepthbuf_vertex:Ed,map_fragment:Td,map_pars_fragment:wd,map_particle_fragment:Ad,map_particle_pars_fragment:Rd,metalnessmap_fragment:Cd,metalnessmap_pars_fragment:Pd,morphinstance_vertex:Id,morphcolor_vertex:Ld,morphnormal_vertex:Dd,morphtarget_pars_vertex:Ud,morphtarget_vertex:Nd,normal_fragment_begin:Fd,normal_fragment_maps:Od,normal_pars_fragment:Bd,normal_pars_vertex:zd,normal_vertex:kd,normalmap_pars_fragment:Hd,clearcoat_normal_fragment_begin:Vd,clearcoat_normal_fragment_maps:Gd,clearcoat_pars_fragment:Wd,iridescence_pars_fragment:Xd,opaque_fragment:qd,packing:Yd,premultiplied_alpha_fragment:Zd,project_vertex:Jd,dithering_fragment:$d,dithering_pars_fragment:Kd,roughnessmap_fragment:Qd,roughnessmap_pars_fragment:jd,shadowmap_pars_fragment:tp,shadowmap_pars_vertex:ep,shadowmap_vertex:np,shadowmask_pars_fragment:ip,skinbase_vertex:sp,skinning_pars_vertex:rp,skinning_vertex:ap,skinnormal_vertex:op,specularmap_fragment:lp,specularmap_pars_fragment:cp,tonemapping_fragment:hp,tonemapping_pars_fragment:up,transmission_fragment:fp,transmission_pars_fragment:dp,uv_pars_fragment:pp,uv_pars_vertex:mp,uv_vertex:gp,worldpos_vertex:_p,background_vert:vp,background_frag:xp,backgroundCube_vert:yp,backgroundCube_frag:Mp,cube_vert:Sp,cube_frag:bp,depth_vert:Ep,depth_frag:Tp,distanceRGBA_vert:wp,distanceRGBA_frag:Ap,equirect_vert:Rp,equirect_frag:Cp,linedashed_vert:Pp,linedashed_frag:Ip,meshbasic_vert:Lp,meshbasic_frag:Dp,meshlambert_vert:Up,meshlambert_frag:Np,meshmatcap_vert:Fp,meshmatcap_frag:Op,meshnormal_vert:Bp,meshnormal_frag:zp,meshphong_vert:kp,meshphong_frag:Hp,meshphysical_vert:Vp,meshphysical_frag:Gp,meshtoon_vert:Wp,meshtoon_frag:Xp,points_vert:qp,points_frag:Yp,shadow_vert:Zp,shadow_frag:Jp,sprite_vert:$p,sprite_frag:Kp},Tt={common:{diffuse:{value:new Ht(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Wt}},envmap:{envMap:{value:null},envMapRotation:{value:new Wt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Wt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Wt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Wt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Wt},normalScale:{value:new yt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Wt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Wt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Wt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Wt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ht(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ht(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0},uvTransform:{value:new Wt}},sprite:{diffuse:{value:new Ht(16777215)},opacity:{value:1},center:{value:new yt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}}},mn={basic:{uniforms:ke([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:ke([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new Ht(0)}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:ke([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new Ht(0)},specular:{value:new Ht(1118481)},shininess:{value:30}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:ke([Tt.common,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.roughnessmap,Tt.metalnessmap,Tt.fog,Tt.lights,{emissive:{value:new Ht(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:ke([Tt.common,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.gradientmap,Tt.fog,Tt.lights,{emissive:{value:new Ht(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:ke([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:ke([Tt.points,Tt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:ke([Tt.common,Tt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:ke([Tt.common,Tt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:ke([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:ke([Tt.sprite,Tt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Wt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Wt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distanceRGBA:{uniforms:ke([Tt.common,Tt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distanceRGBA_vert,fragmentShader:qt.distanceRGBA_frag},shadow:{uniforms:ke([Tt.lights,Tt.fog,{color:{value:new Ht(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};mn.physical={uniforms:ke([mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Wt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Wt},clearcoatNormalScale:{value:new yt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Wt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Wt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Wt},sheen:{value:0},sheenColor:{value:new Ht(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Wt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Wt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Wt},transmissionSamplerSize:{value:new yt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Wt},attenuationDistance:{value:0},attenuationColor:{value:new Ht(0)},specularColor:{value:new Ht(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Wt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Wt},anisotropyVector:{value:new yt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Wt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var lr={r:0,b:0,g:0},ai=new yn,Qp=new ae;function jp(i,t,e,n,s,r,a){let o=new Ht(0),l=r===!0?0:1,c,h,u=null,f=0,p=null;function _(A){let S=A.isScene===!0?A.background:null;return S&&S.isTexture&&(S=(A.backgroundBlurriness>0?e:t).get(S)),S}function y(A){let S=!1,v=_(A);v===null?d(o,l):v&&v.isColor&&(d(v,1),S=!0);let I=i.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,a):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(A,S){let v=_(S);v&&(v.isCubeTexture||v.mapping===ta)?(h===void 0&&(h=new ne(new Mn(1,1,1),new pe({name:"BackgroundCubeMaterial",uniforms:Ki(mn.backgroundCube.uniforms),vertexShader:mn.backgroundCube.vertexShader,fragmentShader:mn.backgroundCube.fragmentShader,side:Xe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,w,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ai.copy(S.backgroundRotation),ai.x*=-1,ai.y*=-1,ai.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(ai.y*=-1,ai.z*=-1),h.material.uniforms.envMap.value=v,h.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Qp.makeRotationFromEuler(ai)),h.material.toneMapped=Kt.getTransfer(v.colorSpace)!==re,(u!==v||f!==v.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=v,f=v.version,p=i.toneMapping),h.layers.enableAll(),A.unshift(h,h.geometry,h.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new ne(new Sn(2,2),new pe({name:"BackgroundMaterial",uniforms:Ki(mn.background.uniforms),vertexShader:mn.background.vertexShader,fragmentShader:mn.background.fragmentShader,side:Zn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=Kt.getTransfer(v.colorSpace)!==re,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||f!==v.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,f=v.version,p=i.toneMapping),c.layers.enableAll(),A.unshift(c,c.geometry,c.material,0,0,null))}function d(A,S){A.getRGB(lr,Sh(i)),n.buffers.color.setClear(lr.r,lr.g,lr.b,S,a)}return{getClearColor:function(){return o},setClearColor:function(A,S=1){o.set(A),l=S,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(A){l=A,d(o,l)},render:y,addToRenderList:m}}function t0(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,a=!1;function o(x,T,U,O,V){let tt=!1,Z=u(O,U,T);r!==Z&&(r=Z,c(r.object)),tt=p(x,O,U,V),tt&&_(x,O,U,V),V!==null&&t.update(V,i.ELEMENT_ARRAY_BUFFER),(tt||a)&&(a=!1,v(x,T,U,O),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function l(){return i.createVertexArray()}function c(x){return i.bindVertexArray(x)}function h(x){return i.deleteVertexArray(x)}function u(x,T,U){let O=U.wireframe===!0,V=n[x.id];V===void 0&&(V={},n[x.id]=V);let tt=V[T.id];tt===void 0&&(tt={},V[T.id]=tt);let Z=tt[O];return Z===void 0&&(Z=f(l()),tt[O]=Z),Z}function f(x){let T=[],U=[],O=[];for(let V=0;V<e;V++)T[V]=0,U[V]=0,O[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:T,enabledAttributes:U,attributeDivisors:O,object:x,attributes:{},index:null}}function p(x,T,U,O){let V=r.attributes,tt=T.attributes,Z=0,at=U.getAttributes();for(let Q in at)if(at[Q].location>=0){let Mt=V[Q],wt=tt[Q];if(wt===void 0&&(Q==="instanceMatrix"&&x.instanceMatrix&&(wt=x.instanceMatrix),Q==="instanceColor"&&x.instanceColor&&(wt=x.instanceColor)),Mt===void 0||Mt.attribute!==wt||wt&&Mt.data!==wt.data)return!0;Z++}return r.attributesNum!==Z||r.index!==O}function _(x,T,U,O){let V={},tt=T.attributes,Z=0,at=U.getAttributes();for(let Q in at)if(at[Q].location>=0){let Mt=tt[Q];Mt===void 0&&(Q==="instanceMatrix"&&x.instanceMatrix&&(Mt=x.instanceMatrix),Q==="instanceColor"&&x.instanceColor&&(Mt=x.instanceColor));let wt={};wt.attribute=Mt,Mt&&Mt.data&&(wt.data=Mt.data),V[Q]=wt,Z++}r.attributes=V,r.attributesNum=Z,r.index=O}function y(){let x=r.newAttributes;for(let T=0,U=x.length;T<U;T++)x[T]=0}function m(x){d(x,0)}function d(x,T){let U=r.newAttributes,O=r.enabledAttributes,V=r.attributeDivisors;U[x]=1,O[x]===0&&(i.enableVertexAttribArray(x),O[x]=1),V[x]!==T&&(i.vertexAttribDivisor(x,T),V[x]=T)}function A(){let x=r.newAttributes,T=r.enabledAttributes;for(let U=0,O=T.length;U<O;U++)T[U]!==x[U]&&(i.disableVertexAttribArray(U),T[U]=0)}function S(x,T,U,O,V,tt,Z){Z===!0?i.vertexAttribIPointer(x,T,U,V,tt):i.vertexAttribPointer(x,T,U,O,V,tt)}function v(x,T,U,O){y();let V=O.attributes,tt=U.getAttributes(),Z=T.defaultAttributeValues;for(let at in tt){let Q=tt[at];if(Q.location>=0){let vt=V[at];if(vt===void 0&&(at==="instanceMatrix"&&x.instanceMatrix&&(vt=x.instanceMatrix),at==="instanceColor"&&x.instanceColor&&(vt=x.instanceColor)),vt!==void 0){let Mt=vt.normalized,wt=vt.itemSize,kt=t.get(vt);if(kt===void 0)continue;let Xt=kt.buffer,rt=kt.type,F=kt.bytesPerElement,H=rt===i.INT||rt===i.UNSIGNED_INT||vt.gpuType===Sl;if(vt.isInterleavedBufferAttribute){let L=vt.data,W=L.stride,$=vt.offset;if(L.isInstancedInterleavedBuffer){for(let K=0;K<Q.locationSize;K++)d(Q.location+K,L.meshPerAttribute);x.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=L.meshPerAttribute*L.count)}else for(let K=0;K<Q.locationSize;K++)m(Q.location+K);i.bindBuffer(i.ARRAY_BUFFER,Xt);for(let K=0;K<Q.locationSize;K++)S(Q.location+K,wt/Q.locationSize,rt,Mt,W*F,($+wt/Q.locationSize*K)*F,H)}else{if(vt.isInstancedBufferAttribute){for(let L=0;L<Q.locationSize;L++)d(Q.location+L,vt.meshPerAttribute);x.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=vt.meshPerAttribute*vt.count)}else for(let L=0;L<Q.locationSize;L++)m(Q.location+L);i.bindBuffer(i.ARRAY_BUFFER,Xt);for(let L=0;L<Q.locationSize;L++)S(Q.location+L,wt/Q.locationSize,rt,Mt,wt*F,wt/Q.locationSize*L*F,H)}}else if(Z!==void 0){let Mt=Z[at];if(Mt!==void 0)switch(Mt.length){case 2:i.vertexAttrib2fv(Q.location,Mt);break;case 3:i.vertexAttrib3fv(Q.location,Mt);break;case 4:i.vertexAttrib4fv(Q.location,Mt);break;default:i.vertexAttrib1fv(Q.location,Mt)}}}}A()}function I(){E();for(let x in n){let T=n[x];for(let U in T){let O=T[U];for(let V in O)h(O[V].object),delete O[V];delete T[U]}delete n[x]}}function w(x){if(n[x.id]===void 0)return;let T=n[x.id];for(let U in T){let O=T[U];for(let V in O)h(O[V].object),delete O[V];delete T[U]}delete n[x.id]}function C(x){for(let T in n){let U=n[T];if(U[x.id]===void 0)continue;let O=U[x.id];for(let V in O)h(O[V].object),delete O[V];delete U[x.id]}}function E(){g(),a=!0,r!==s&&(r=s,c(r.object))}function g(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:g,dispose:I,releaseStatesOfGeometry:w,releaseStatesOfProgram:C,initAttributes:y,enableAttribute:m,disableUnusedAttributes:A}}function e0(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let _=0;_<u;_++)p+=h[_];e.update(p,n,1)}function l(c,h,u,f){if(u===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<c.length;_++)a(c[_],h[_],f[_]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let _=0;for(let y=0;y<u;y++)_+=h[y]*f[y];e.update(_,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function n0(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let C=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==cn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let E=C===fn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==Un&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==_n&&!E)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),A=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=_>0,w=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:_,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:A,maxVaryings:S,maxFragmentUniforms:v,vertexTextures:I,maxSamples:w}}function i0(i){let t=this,e=null,n=0,s=!1,r=!1,a=new In,o=new Wt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,p){let _=u.clippingPlanes,y=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||_===null||_.length===0||r&&!m)r?h(null):c();else{let A=r?0:n,S=A*4,v=d.clippingState||null;l.value=v,v=h(_,f,S,p);for(let I=0;I!==S;++I)v[I]=e[I];d.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=A}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,p,_){let y=u!==null?u.length:0,m=null;if(y!==0){if(m=l.value,_!==!0||m===null){let d=p+y*4,A=f.matrixWorldInverse;o.getNormalMatrix(A),(m===null||m.length<d)&&(m=new Float32Array(d));for(let S=0,v=p;S!==y;++S,v+=4)a.copy(u[S]).applyMatrix4(A,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,m}}function s0(i){let t=new WeakMap;function e(a,o){return o===ja?a.mapping=Yi:o===to&&(a.mapping=Zi),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===ja||o===to)if(t.has(a)){let l=t.get(a).texture;return e(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new No(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var Qi=class extends Dr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ki=4,xc=[.125,.215,.35,.446,.526,.582],ui=20,La=new Qi,yc=new Ht,Da=null,Ua=0,Na=0,Fa=!1,li=(1+Math.sqrt(5))/2,Oi=1/li,Mc=[new N(-li,Oi,0),new N(li,Oi,0),new N(-Oi,0,li),new N(Oi,0,li),new N(0,li,-Oi),new N(0,li,Oi),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)],Nr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Da=this._renderer.getRenderTarget(),Ua=this._renderer.getActiveCubeFace(),Na=this._renderer.getActiveMipmapLevel(),Fa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ec(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Da,Ua,Na),this._renderer.xr.enabled=Fa,t.scissorTest=!1,cr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Yi||t.mapping===Zi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Da=this._renderer.getRenderTarget(),Ua=this._renderer.getActiveCubeFace(),Na=this._renderer.getActiveMipmapLevel(),Fa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:gn,minFilter:gn,generateMipmaps:!1,type:fn,format:cn,colorSpace:ss,depthBuffer:!1},s=Sc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Sc(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=r0(r)),this._blurMaterial=a0(r,t,e)}return s}_compileMaterial(t){let e=new ne(this._lodPlanes[0],t);this._renderer.compile(e,La)}_sceneToCubeUV(t,e,n,s){let o=new Oe(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(yc),h.toneMapping=Yn,h.autoClear=!1;let p=new On({name:"PMREM.Background",side:Xe,depthWrite:!1,depthTest:!1}),_=new ne(new Mn,p),y=!1,m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,y=!0):(p.color.copy(yc),y=!0);for(let d=0;d<6;d++){let A=d%3;A===0?(o.up.set(0,l[d],0),o.lookAt(c[d],0,0)):A===1?(o.up.set(0,0,l[d]),o.lookAt(0,c[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,c[d]));let S=this._cubeSize;cr(s,A*S,d>2?S:0,S,S),h.setRenderTarget(s),y&&h.render(_,o),h.render(t,o)}_.geometry.dispose(),_.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Yi||t.mapping===Zi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ec()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=bc());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new ne(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;cr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,La)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Mc[(s-r-1)%Mc.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new ne(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ui-1),y=r/_,m=isFinite(r)?1+Math.floor(h*y):ui;m>ui&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ui}`);let d=[],A=0;for(let C=0;C<ui;++C){let E=C/y,g=Math.exp(-E*E/2);d.push(g),C===0?A+=g:C<m&&(A+=2*g)}for(let C=0;C<d.length;C++)d[C]=d[C]/A;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:S}=this;f.dTheta.value=_,f.mipInt.value=S-n;let v=this._sizeLods[s],I=3*v*(s>S-ki?s-S+ki:0),w=4*(this._cubeSize-v);cr(e,I,w,3*v,2*v),l.setRenderTarget(e),l.render(u,La)}};function r0(i){let t=[],e=[],n=[],s=i,r=i-ki+1+xc.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let l=1/o;a>i-ki?l=xc[a-i+ki-1]:a===0&&(l=0),n.push(l);let c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,_=6,y=3,m=2,d=1,A=new Float32Array(y*_*p),S=new Float32Array(m*_*p),v=new Float32Array(d*_*p);for(let w=0;w<p;w++){let C=w%3*2/3-1,E=w>2?0:-1,g=[C,E,0,C+2/3,E,0,C+2/3,E+1,0,C,E,0,C+2/3,E+1,0,C,E+1,0];A.set(g,y*_*w),S.set(f,m*_*w);let x=[w,w,w,w,w,w];v.set(x,d*_*w)}let I=new ye;I.setAttribute("position",new be(A,y)),I.setAttribute("uv",new be(S,m)),I.setAttribute("faceIndex",new be(v,d)),t.push(I),s>ki&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Sc(i,t,e){let n=new He(i,t,e);return n.texture.mapping=ta,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function cr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function a0(i,t,e){let n=new Float32Array(ui),s=new N(0,1,0);return new pe({name:"SphericalGaussianBlur",defines:{n:ui,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:vn,depthTest:!1,depthWrite:!1})}function bc(){return new pe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:vn,depthTest:!1,depthWrite:!1})}function Ec(){return new pe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:vn,depthTest:!1,depthWrite:!1})}function Pl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function o0(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===ja||l===to,h=l===Yi||l===Zi;if(c||h){let u=t.get(o),f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new Nr(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{let p=o.image;return c&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new Nr(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0,c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function l0(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&ys("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function c0(i,t,e,n){let s={},r=new WeakMap;function a(u){let f=u.target;f.index!==null&&t.remove(f.index);for(let _ in f.attributes)t.remove(f.attributes[_]);for(let _ in f.morphAttributes){let y=f.morphAttributes[_];for(let m=0,d=y.length;m<d;m++)t.remove(y[m])}f.removeEventListener("dispose",a),delete s[f.id];let p=r.get(f);p&&(t.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function l(u){let f=u.attributes;for(let _ in f)t.update(f[_],i.ARRAY_BUFFER);let p=u.morphAttributes;for(let _ in p){let y=p[_];for(let m=0,d=y.length;m<d;m++)t.update(y[m],i.ARRAY_BUFFER)}}function c(u){let f=[],p=u.index,_=u.attributes.position,y=0;if(p!==null){let A=p.array;y=p.version;for(let S=0,v=A.length;S<v;S+=3){let I=A[S+0],w=A[S+1],C=A[S+2];f.push(I,w,w,C,C,I)}}else if(_!==void 0){let A=_.array;y=_.version;for(let S=0,v=A.length/3-1;S<v;S+=3){let I=S+0,w=S+1,C=S+2;f.push(I,w,w,C,C,I)}}else return;let m=new(yh(f)?Lr:Ir)(f,1);m.version=y;let d=r.get(u);d&&t.remove(d),r.set(u,m)}function h(u){let f=r.get(u);if(f){let p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function h0(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*a),e.update(p,n,1)}function c(f,p,_){_!==0&&(i.drawElementsInstanced(n,p,r,f*a,_),e.update(p,n,_))}function h(f,p,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,_);let m=0;for(let d=0;d<_;d++)m+=p[d];e.update(m,n,1)}function u(f,p,_,y){if(_===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/a,p[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,y,0,_);let d=0;for(let A=0;A<_;A++)d+=p[A]*y[A];e.update(d,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function u0(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function f0(i,t,e){let n=new WeakMap,s=new oe;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,f=n.get(o);if(f===void 0||f.count!==u){let g=function(){C.dispose(),n.delete(o),o.removeEventListener("dispose",g)};f!==void 0&&f.texture.dispose();let p=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],A=o.morphAttributes.color||[],S=0;p===!0&&(S=1),_===!0&&(S=2),y===!0&&(S=3);let v=o.attributes.position.count*S,I=1;v>t.maxTextureSize&&(I=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let w=new Float32Array(v*I*4*u),C=new Cr(w,v,I,u);C.type=_n,C.needsUpdate=!0;let E=S*4;for(let x=0;x<u;x++){let T=m[x],U=d[x],O=A[x],V=v*I*4*x;for(let tt=0;tt<T.count;tt++){let Z=tt*E;p===!0&&(s.fromBufferAttribute(T,tt),w[V+Z+0]=s.x,w[V+Z+1]=s.y,w[V+Z+2]=s.z,w[V+Z+3]=0),_===!0&&(s.fromBufferAttribute(U,tt),w[V+Z+4]=s.x,w[V+Z+5]=s.y,w[V+Z+6]=s.z,w[V+Z+7]=0),y===!0&&(s.fromBufferAttribute(O,tt),w[V+Z+8]=s.x,w[V+Z+9]=s.y,w[V+Z+10]=s.z,w[V+Z+11]=O.itemSize===4?s.w:1)}}f={count:u,texture:C,size:new yt(v,I)},n.set(o,f),o.addEventListener("dispose",g)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];let _=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function d0(i,t,e,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}var Fr=class extends Ye{constructor(t,e,n,s,r,a,o,l,c,h=Gi){if(h!==Gi&&h!==$i)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Gi&&(n=pi),n===void 0&&h===$i&&(n=Ji),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Qe,this.minFilter=l!==void 0?l:Qe,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Eh=new Ye,Tc=new Fr(1,1),Th=new Cr,wh=new Do,Ah=new Ur,wc=[],Ac=[],Rc=new Float32Array(16),Cc=new Float32Array(9),Pc=new Float32Array(4);function rs(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=wc[s];if(r===void 0&&(r=new Float32Array(s),wc[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Te(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function we(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function na(i,t){let e=Ac[t];e===void 0&&(e=new Int32Array(t),Ac[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function p0(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function m0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2fv(this.addr,t),we(e,t)}}function g0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;i.uniform3fv(this.addr,t),we(e,t)}}function _0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4fv(this.addr,t),we(e,t)}}function v0(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),we(e,t)}else{if(Te(e,n))return;Pc.set(n),i.uniformMatrix2fv(this.addr,!1,Pc),we(e,n)}}function x0(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),we(e,t)}else{if(Te(e,n))return;Cc.set(n),i.uniformMatrix3fv(this.addr,!1,Cc),we(e,n)}}function y0(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),we(e,t)}else{if(Te(e,n))return;Rc.set(n),i.uniformMatrix4fv(this.addr,!1,Rc),we(e,n)}}function M0(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function S0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2iv(this.addr,t),we(e,t)}}function b0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3iv(this.addr,t),we(e,t)}}function E0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4iv(this.addr,t),we(e,t)}}function T0(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function w0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2uiv(this.addr,t),we(e,t)}}function A0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3uiv(this.addr,t),we(e,t)}}function R0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4uiv(this.addr,t),we(e,t)}}function C0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Tc.compareFunction=vh,r=Tc):r=Eh,e.setTexture2D(t||r,s)}function P0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||wh,s)}function I0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Ah,s)}function L0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Th,s)}function D0(i){switch(i){case 5126:return p0;case 35664:return m0;case 35665:return g0;case 35666:return _0;case 35674:return v0;case 35675:return x0;case 35676:return y0;case 5124:case 35670:return M0;case 35667:case 35671:return S0;case 35668:case 35672:return b0;case 35669:case 35673:return E0;case 5125:return T0;case 36294:return w0;case 36295:return A0;case 36296:return R0;case 35678:case 36198:case 36298:case 36306:case 35682:return C0;case 35679:case 36299:case 36307:return P0;case 35680:case 36300:case 36308:case 36293:return I0;case 36289:case 36303:case 36311:case 36292:return L0}}function U0(i,t){i.uniform1fv(this.addr,t)}function N0(i,t){let e=rs(t,this.size,2);i.uniform2fv(this.addr,e)}function F0(i,t){let e=rs(t,this.size,3);i.uniform3fv(this.addr,e)}function O0(i,t){let e=rs(t,this.size,4);i.uniform4fv(this.addr,e)}function B0(i,t){let e=rs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function z0(i,t){let e=rs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function k0(i,t){let e=rs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function H0(i,t){i.uniform1iv(this.addr,t)}function V0(i,t){i.uniform2iv(this.addr,t)}function G0(i,t){i.uniform3iv(this.addr,t)}function W0(i,t){i.uniform4iv(this.addr,t)}function X0(i,t){i.uniform1uiv(this.addr,t)}function q0(i,t){i.uniform2uiv(this.addr,t)}function Y0(i,t){i.uniform3uiv(this.addr,t)}function Z0(i,t){i.uniform4uiv(this.addr,t)}function J0(i,t,e){let n=this.cache,s=t.length,r=na(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Eh,r[a])}function $0(i,t,e){let n=this.cache,s=t.length,r=na(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||wh,r[a])}function K0(i,t,e){let n=this.cache,s=t.length,r=na(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Ah,r[a])}function Q0(i,t,e){let n=this.cache,s=t.length,r=na(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Th,r[a])}function j0(i){switch(i){case 5126:return U0;case 35664:return N0;case 35665:return F0;case 35666:return O0;case 35674:return B0;case 35675:return z0;case 35676:return k0;case 5124:case 35670:return H0;case 35667:case 35671:return V0;case 35668:case 35672:return G0;case 35669:case 35673:return W0;case 5125:return X0;case 36294:return q0;case 36295:return Y0;case 36296:return Z0;case 35678:case 36198:case 36298:case 36306:case 35682:return J0;case 35679:case 36299:case 36307:return $0;case 35680:case 36300:case 36308:case 36293:return K0;case 36289:case 36303:case 36311:case 36292:return Q0}}var Fo=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=D0(e.type)}},Oo=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=j0(e.type)}},Bo=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Oa=/(\w+)(\])?(\[|\.)?/g;function Ic(i,t){i.seq.push(t),i.map[t.id]=t}function tm(i,t,e){let n=i.name,s=n.length;for(Oa.lastIndex=0;;){let r=Oa.exec(n),a=Oa.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Ic(e,c===void 0?new Fo(o,i,t):new Oo(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new Bo(o),Ic(e,u)),e=u}}}var Xi=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);tm(r,a,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Lc(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var em=37297,nm=0;function im(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var Dc=new Wt;function sm(i){Kt._getMatrix(Dc,Kt.workingColorSpace,i);let t=`mat3( ${Dc.elements.map(e=>e.toFixed(4))} )`;switch(Kt.getTransfer(i)){case ea:return[t,"LinearTransferOETF"];case re:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Uc(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+im(i.getShaderSource(t),a)}else return s}function rm(i,t){let e=sm(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function am(i,t){let e;switch(t){case _l:e="Linear";break;case vl:e="Reinhard";break;case xl:e="Cineon";break;case zs:e="ACESFilmic";break;case yl:e="AgX";break;case Ml:e="Neutral";break;case Su:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var hr=new N;function om(){Kt.getLuminanceCoefficients(hr);let i=hr.x.toFixed(4),t=hr.y.toFixed(4),e=hr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ms).join(`
`)}function cm(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function hm(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Ms(i){return i!==""}function Nc(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Fc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var um=/^[ \t]*#include +<([\w\d./]+)>/gm;function zo(i){return i.replace(um,dm)}var fm=new Map;function dm(i,t){let e=qt[t];if(e===void 0){let n=fm.get(t);if(n!==void 0)e=qt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return zo(e)}var pm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Oc(i){return i.replace(pm,mm)}function mm(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Bc(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function gm(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===rh?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===eu?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Pn&&(t="SHADOWMAP_TYPE_VSM"),t}function _m(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Yi:case Zi:t="ENVMAP_TYPE_CUBE";break;case ta:t="ENVMAP_TYPE_CUBE_UV";break}return t}function vm(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Zi:t="ENVMAP_MODE_REFRACTION";break}return t}function xm(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case ah:t="ENVMAP_BLENDING_MULTIPLY";break;case yu:t="ENVMAP_BLENDING_MIX";break;case Mu:t="ENVMAP_BLENDING_ADD";break}return t}function ym(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function Mm(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=gm(e),c=_m(e),h=vm(e),u=xm(e),f=ym(e),p=lm(e),_=cm(r),y=s.createProgram(),m,d,A=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Ms).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Ms).join(`
`),d.length>0&&(d+=`
`)):(m=[Bc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ms).join(`
`),d=[Bc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Yn?"#define TONE_MAPPING":"",e.toneMapping!==Yn?qt.tonemapping_pars_fragment:"",e.toneMapping!==Yn?am("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,rm("linearToOutputTexel",e.outputColorSpace),om(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ms).join(`
`)),a=zo(a),a=Nc(a,e),a=Fc(a,e),o=zo(o),o=Nc(o,e),o=Fc(o,e),a=Oc(a),o=Oc(o),e.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",e.glslVersion===Kl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Kl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let S=A+m+a,v=A+d+o,I=Lc(s,s.VERTEX_SHADER,S),w=Lc(s,s.FRAGMENT_SHADER,v);s.attachShader(y,I),s.attachShader(y,w),e.index0AttributeName!==void 0?s.bindAttribLocation(y,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function C(T){if(i.debug.checkShaderErrors){let U=s.getProgramInfoLog(y).trim(),O=s.getShaderInfoLog(I).trim(),V=s.getShaderInfoLog(w).trim(),tt=!0,Z=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(tt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,I,w);else{let at=Uc(s,I,"vertex"),Q=Uc(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+T.name+`
Material Type: `+T.type+`

Program Info Log: `+U+`
`+at+`
`+Q)}else U!==""?console.warn("THREE.WebGLProgram: Program Info Log:",U):(O===""||V==="")&&(Z=!1);Z&&(T.diagnostics={runnable:tt,programLog:U,vertexShader:{log:O,prefix:m},fragmentShader:{log:V,prefix:d}})}s.deleteShader(I),s.deleteShader(w),E=new Xi(s,y),g=hm(s,y)}let E;this.getUniforms=function(){return E===void 0&&C(this),E};let g;this.getAttributes=function(){return g===void 0&&C(this),g};let x=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(y,em)),x},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=nm++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=I,this.fragmentShader=w,this}var Sm=0,ko=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Ho(t),e.set(t,n)),n}},Ho=class{constructor(t){this.id=Sm++,this.code=t,this.usedTimes=0}};function bm(i,t,e,n,s,r,a){let o=new Pr,l=new ko,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(g){return c.add(g),g===0?"uv":`uv${g}`}function m(g,x,T,U,O){let V=U.fog,tt=O.geometry,Z=g.isMeshStandardMaterial?U.environment:null,at=(g.isMeshStandardMaterial?e:t).get(g.envMap||Z),Q=at&&at.mapping===ta?at.image.height:null,vt=_[g.type];g.precision!==null&&(p=s.getMaxPrecision(g.precision),p!==g.precision&&console.warn("THREE.WebGLProgram.getParameters:",g.precision,"not supported, using",p,"instead."));let Mt=tt.morphAttributes.position||tt.morphAttributes.normal||tt.morphAttributes.color,wt=Mt!==void 0?Mt.length:0,kt=0;tt.morphAttributes.position!==void 0&&(kt=1),tt.morphAttributes.normal!==void 0&&(kt=2),tt.morphAttributes.color!==void 0&&(kt=3);let Xt,rt,F,H;if(vt){let $t=mn[vt];Xt=$t.vertexShader,rt=$t.fragmentShader}else Xt=g.vertexShader,rt=g.fragmentShader,l.update(g),F=l.getVertexShaderID(g),H=l.getFragmentShaderID(g);let L=i.getRenderTarget(),W=i.state.buffers.depth.getReversed(),$=O.isInstancedMesh===!0,K=O.isBatchedMesh===!0,ft=!!g.map,X=!!g.matcap,ot=!!at,P=!!g.aoMap,ht=!!g.lightMap,ct=!!g.bumpMap,bt=!!g.normalMap,St=!!g.displacementMap,Bt=!!g.emissiveMap,Ct=!!g.metalnessMap,R=!!g.roughnessMap,M=g.anisotropy>0,q=g.clearcoat>0,it=g.dispersion>0,ut=g.iridescence>0,nt=g.sheen>0,Lt=g.transmission>0,Et=M&&!!g.anisotropyMap,Pt=q&&!!g.clearcoatMap,Zt=q&&!!g.clearcoatNormalMap,G=q&&!!g.clearcoatRoughnessMap,st=ut&&!!g.iridescenceMap,lt=ut&&!!g.iridescenceThicknessMap,dt=nt&&!!g.sheenColorMap,pt=nt&&!!g.sheenRoughnessMap,It=!!g.specularMap,_t=!!g.specularColorMap,zt=!!g.specularIntensityMap,D=Lt&&!!g.transmissionMap,et=Lt&&!!g.thicknessMap,k=!!g.gradientMap,j=!!g.alphaMap,mt=g.alphaTest>0,gt=!!g.alphaHash,At=!!g.extensions,Jt=Yn;g.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(Jt=i.toneMapping);let le={shaderID:vt,shaderType:g.type,shaderName:g.name,vertexShader:Xt,fragmentShader:rt,defines:g.defines,customVertexShaderID:F,customFragmentShaderID:H,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:p,batching:K,batchingColor:K&&O._colorsTexture!==null,instancing:$,instancingColor:$&&O.instanceColor!==null,instancingMorph:$&&O.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:L===null?i.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:ss,alphaToCoverage:!!g.alphaToCoverage,map:ft,matcap:X,envMap:ot,envMapMode:ot&&at.mapping,envMapCubeUVHeight:Q,aoMap:P,lightMap:ht,bumpMap:ct,normalMap:bt,displacementMap:f&&St,emissiveMap:Bt,normalMapObjectSpace:bt&&g.normalMapType===wu,normalMapTangentSpace:bt&&g.normalMapType===_h,metalnessMap:Ct,roughnessMap:R,anisotropy:M,anisotropyMap:Et,clearcoat:q,clearcoatMap:Pt,clearcoatNormalMap:Zt,clearcoatRoughnessMap:G,dispersion:it,iridescence:ut,iridescenceMap:st,iridescenceThicknessMap:lt,sheen:nt,sheenColorMap:dt,sheenRoughnessMap:pt,specularMap:It,specularColorMap:_t,specularIntensityMap:zt,transmission:Lt,transmissionMap:D,thicknessMap:et,gradientMap:k,opaque:g.transparent===!1&&g.blending===Vi&&g.alphaToCoverage===!1,alphaMap:j,alphaTest:mt,alphaHash:gt,combine:g.combine,mapUv:ft&&y(g.map.channel),aoMapUv:P&&y(g.aoMap.channel),lightMapUv:ht&&y(g.lightMap.channel),bumpMapUv:ct&&y(g.bumpMap.channel),normalMapUv:bt&&y(g.normalMap.channel),displacementMapUv:St&&y(g.displacementMap.channel),emissiveMapUv:Bt&&y(g.emissiveMap.channel),metalnessMapUv:Ct&&y(g.metalnessMap.channel),roughnessMapUv:R&&y(g.roughnessMap.channel),anisotropyMapUv:Et&&y(g.anisotropyMap.channel),clearcoatMapUv:Pt&&y(g.clearcoatMap.channel),clearcoatNormalMapUv:Zt&&y(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:G&&y(g.clearcoatRoughnessMap.channel),iridescenceMapUv:st&&y(g.iridescenceMap.channel),iridescenceThicknessMapUv:lt&&y(g.iridescenceThicknessMap.channel),sheenColorMapUv:dt&&y(g.sheenColorMap.channel),sheenRoughnessMapUv:pt&&y(g.sheenRoughnessMap.channel),specularMapUv:It&&y(g.specularMap.channel),specularColorMapUv:_t&&y(g.specularColorMap.channel),specularIntensityMapUv:zt&&y(g.specularIntensityMap.channel),transmissionMapUv:D&&y(g.transmissionMap.channel),thicknessMapUv:et&&y(g.thicknessMap.channel),alphaMapUv:j&&y(g.alphaMap.channel),vertexTangents:!!tt.attributes.tangent&&(bt||M),vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!tt.attributes.color&&tt.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!tt.attributes.uv&&(ft||j),fog:!!V,useFog:g.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:g.flatShading===!0,sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:W,skinning:O.isSkinnedMesh===!0,morphTargets:tt.morphAttributes.position!==void 0,morphNormals:tt.morphAttributes.normal!==void 0,morphColors:tt.morphAttributes.color!==void 0,morphTargetsCount:wt,morphTextureStride:kt,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&T.length>0,shadowMapType:i.shadowMap.type,toneMapping:Jt,decodeVideoTexture:ft&&g.map.isVideoTexture===!0&&Kt.getTransfer(g.map.colorSpace)===re,decodeVideoTextureEmissive:Bt&&g.emissiveMap.isVideoTexture===!0&&Kt.getTransfer(g.emissiveMap.colorSpace)===re,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===We,flipSided:g.side===Xe,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:At&&g.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(At&&g.extensions.multiDraw===!0||K)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return le.vertexUv1s=c.has(1),le.vertexUv2s=c.has(2),le.vertexUv3s=c.has(3),c.clear(),le}function d(g){let x=[];if(g.shaderID?x.push(g.shaderID):(x.push(g.customVertexShaderID),x.push(g.customFragmentShaderID)),g.defines!==void 0)for(let T in g.defines)x.push(T),x.push(g.defines[T]);return g.isRawShaderMaterial===!1&&(A(x,g),S(x,g),x.push(i.outputColorSpace)),x.push(g.customProgramCacheKey),x.join()}function A(g,x){g.push(x.precision),g.push(x.outputColorSpace),g.push(x.envMapMode),g.push(x.envMapCubeUVHeight),g.push(x.mapUv),g.push(x.alphaMapUv),g.push(x.lightMapUv),g.push(x.aoMapUv),g.push(x.bumpMapUv),g.push(x.normalMapUv),g.push(x.displacementMapUv),g.push(x.emissiveMapUv),g.push(x.metalnessMapUv),g.push(x.roughnessMapUv),g.push(x.anisotropyMapUv),g.push(x.clearcoatMapUv),g.push(x.clearcoatNormalMapUv),g.push(x.clearcoatRoughnessMapUv),g.push(x.iridescenceMapUv),g.push(x.iridescenceThicknessMapUv),g.push(x.sheenColorMapUv),g.push(x.sheenRoughnessMapUv),g.push(x.specularMapUv),g.push(x.specularColorMapUv),g.push(x.specularIntensityMapUv),g.push(x.transmissionMapUv),g.push(x.thicknessMapUv),g.push(x.combine),g.push(x.fogExp2),g.push(x.sizeAttenuation),g.push(x.morphTargetsCount),g.push(x.morphAttributeCount),g.push(x.numDirLights),g.push(x.numPointLights),g.push(x.numSpotLights),g.push(x.numSpotLightMaps),g.push(x.numHemiLights),g.push(x.numRectAreaLights),g.push(x.numDirLightShadows),g.push(x.numPointLightShadows),g.push(x.numSpotLightShadows),g.push(x.numSpotLightShadowsWithMaps),g.push(x.numLightProbes),g.push(x.shadowMapType),g.push(x.toneMapping),g.push(x.numClippingPlanes),g.push(x.numClipIntersection),g.push(x.depthPacking)}function S(g,x){o.disableAll(),x.supportsVertexTextures&&o.enable(0),x.instancing&&o.enable(1),x.instancingColor&&o.enable(2),x.instancingMorph&&o.enable(3),x.matcap&&o.enable(4),x.envMap&&o.enable(5),x.normalMapObjectSpace&&o.enable(6),x.normalMapTangentSpace&&o.enable(7),x.clearcoat&&o.enable(8),x.iridescence&&o.enable(9),x.alphaTest&&o.enable(10),x.vertexColors&&o.enable(11),x.vertexAlphas&&o.enable(12),x.vertexUv1s&&o.enable(13),x.vertexUv2s&&o.enable(14),x.vertexUv3s&&o.enable(15),x.vertexTangents&&o.enable(16),x.anisotropy&&o.enable(17),x.alphaHash&&o.enable(18),x.batching&&o.enable(19),x.dispersion&&o.enable(20),x.batchingColor&&o.enable(21),g.push(o.mask),o.disableAll(),x.fog&&o.enable(0),x.useFog&&o.enable(1),x.flatShading&&o.enable(2),x.logarithmicDepthBuffer&&o.enable(3),x.reverseDepthBuffer&&o.enable(4),x.skinning&&o.enable(5),x.morphTargets&&o.enable(6),x.morphNormals&&o.enable(7),x.morphColors&&o.enable(8),x.premultipliedAlpha&&o.enable(9),x.shadowMapEnabled&&o.enable(10),x.doubleSided&&o.enable(11),x.flipSided&&o.enable(12),x.useDepthPacking&&o.enable(13),x.dithering&&o.enable(14),x.transmission&&o.enable(15),x.sheen&&o.enable(16),x.opaque&&o.enable(17),x.pointsUvs&&o.enable(18),x.decodeVideoTexture&&o.enable(19),x.decodeVideoTextureEmissive&&o.enable(20),x.alphaToCoverage&&o.enable(21),g.push(o.mask)}function v(g){let x=_[g.type],T;if(x){let U=mn[x];T=Kn.clone(U.uniforms)}else T=g.uniforms;return T}function I(g,x){let T;for(let U=0,O=h.length;U<O;U++){let V=h[U];if(V.cacheKey===x){T=V,++T.usedTimes;break}}return T===void 0&&(T=new Mm(i,x,g,r),h.push(T)),T}function w(g){if(--g.usedTimes===0){let x=h.indexOf(g);h[x]=h[h.length-1],h.pop(),g.destroy()}}function C(g){l.remove(g)}function E(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:v,acquireProgram:I,releaseProgram:w,releaseShaderCache:C,programs:h,dispose:E}}function Em(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Tm(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function zc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function kc(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,f,p,_,y,m){let d=i[t];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:_,renderOrder:u.renderOrder,z:y,group:m},i[t]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=_,d.renderOrder=u.renderOrder,d.z=y,d.group=m),t++,d}function o(u,f,p,_,y,m){let d=a(u,f,p,_,y,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):e.push(d)}function l(u,f,p,_,y,m){let d=a(u,f,p,_,y,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):e.unshift(d)}function c(u,f){e.length>1&&e.sort(u||Tm),n.length>1&&n.sort(f||zc),s.length>1&&s.sort(f||zc)}function h(){for(let u=t,f=i.length;u<f;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function wm(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new kc,i.set(n,[a])):s>=r.length?(a=new kc,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Am(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new N,color:new Ht};break;case"SpotLight":e={position:new N,direction:new N,color:new Ht,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new Ht,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new Ht,groundColor:new Ht};break;case"RectAreaLight":e={color:new Ht,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function Rm(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Cm=0;function Pm(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Im(i){let t=new Am,e=Rm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new ae,a=new ae;function o(c){let h=0,u=0,f=0;for(let g=0;g<9;g++)n.probe[g].set(0,0,0);let p=0,_=0,y=0,m=0,d=0,A=0,S=0,v=0,I=0,w=0,C=0;c.sort(Pm);for(let g=0,x=c.length;g<x;g++){let T=c[g],U=T.color,O=T.intensity,V=T.distance,tt=T.shadow&&T.shadow.map?T.shadow.map.texture:null;if(T.isAmbientLight)h+=U.r*O,u+=U.g*O,f+=U.b*O;else if(T.isLightProbe){for(let Z=0;Z<9;Z++)n.probe[Z].addScaledVector(T.sh.coefficients[Z],O);C++}else if(T.isDirectionalLight){let Z=t.get(T);if(Z.color.copy(T.color).multiplyScalar(T.intensity),T.castShadow){let at=T.shadow,Q=e.get(T);Q.shadowIntensity=at.intensity,Q.shadowBias=at.bias,Q.shadowNormalBias=at.normalBias,Q.shadowRadius=at.radius,Q.shadowMapSize=at.mapSize,n.directionalShadow[p]=Q,n.directionalShadowMap[p]=tt,n.directionalShadowMatrix[p]=T.shadow.matrix,A++}n.directional[p]=Z,p++}else if(T.isSpotLight){let Z=t.get(T);Z.position.setFromMatrixPosition(T.matrixWorld),Z.color.copy(U).multiplyScalar(O),Z.distance=V,Z.coneCos=Math.cos(T.angle),Z.penumbraCos=Math.cos(T.angle*(1-T.penumbra)),Z.decay=T.decay,n.spot[y]=Z;let at=T.shadow;if(T.map&&(n.spotLightMap[I]=T.map,I++,at.updateMatrices(T),T.castShadow&&w++),n.spotLightMatrix[y]=at.matrix,T.castShadow){let Q=e.get(T);Q.shadowIntensity=at.intensity,Q.shadowBias=at.bias,Q.shadowNormalBias=at.normalBias,Q.shadowRadius=at.radius,Q.shadowMapSize=at.mapSize,n.spotShadow[y]=Q,n.spotShadowMap[y]=tt,v++}y++}else if(T.isRectAreaLight){let Z=t.get(T);Z.color.copy(U).multiplyScalar(O),Z.halfWidth.set(T.width*.5,0,0),Z.halfHeight.set(0,T.height*.5,0),n.rectArea[m]=Z,m++}else if(T.isPointLight){let Z=t.get(T);if(Z.color.copy(T.color).multiplyScalar(T.intensity),Z.distance=T.distance,Z.decay=T.decay,T.castShadow){let at=T.shadow,Q=e.get(T);Q.shadowIntensity=at.intensity,Q.shadowBias=at.bias,Q.shadowNormalBias=at.normalBias,Q.shadowRadius=at.radius,Q.shadowMapSize=at.mapSize,Q.shadowCameraNear=at.camera.near,Q.shadowCameraFar=at.camera.far,n.pointShadow[_]=Q,n.pointShadowMap[_]=tt,n.pointShadowMatrix[_]=T.shadow.matrix,S++}n.point[_]=Z,_++}else if(T.isHemisphereLight){let Z=t.get(T);Z.skyColor.copy(T.color).multiplyScalar(O),Z.groundColor.copy(T.groundColor).multiplyScalar(O),n.hemi[d]=Z,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Tt.LTC_FLOAT_1,n.rectAreaLTC2=Tt.LTC_FLOAT_2):(n.rectAreaLTC1=Tt.LTC_HALF_1,n.rectAreaLTC2=Tt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;let E=n.hash;(E.directionalLength!==p||E.pointLength!==_||E.spotLength!==y||E.rectAreaLength!==m||E.hemiLength!==d||E.numDirectionalShadows!==A||E.numPointShadows!==S||E.numSpotShadows!==v||E.numSpotMaps!==I||E.numLightProbes!==C)&&(n.directional.length=p,n.spot.length=y,n.rectArea.length=m,n.point.length=_,n.hemi.length=d,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=A,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=v+I-w,n.spotLightMap.length=I,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,E.directionalLength=p,E.pointLength=_,E.spotLength=y,E.rectAreaLength=m,E.hemiLength=d,E.numDirectionalShadows=A,E.numPointShadows=S,E.numSpotShadows=v,E.numSpotMaps=I,E.numLightProbes=C,n.version=Cm++)}function l(c,h){let u=0,f=0,p=0,_=0,y=0,m=h.matrixWorldInverse;for(let d=0,A=c.length;d<A;d++){let S=c[d];if(S.isDirectionalLight){let v=n.directional[u];v.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),u++}else if(S.isSpotLight){let v=n.spot[p];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),p++}else if(S.isRectAreaLight){let v=n.rectArea[_];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(m),a.identity(),r.copy(S.matrixWorld),r.premultiply(m),a.extractRotation(r),v.halfWidth.set(S.width*.5,0,0),v.halfHeight.set(0,S.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),_++}else if(S.isPointLight){let v=n.point[f];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(m),f++}else if(S.isHemisphereLight){let v=n.hemi[y];v.direction.setFromMatrixPosition(S.matrixWorld),v.direction.transformDirection(m),y++}}}return{setup:o,setupView:l,state:n}}function Hc(i){let t=new Im(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}let c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Lm(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new Hc(i),t.set(s,[o])):r>=a.length?(o=new Hc(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var Vo=class extends Fn{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Eu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Go=class extends Fn{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},Dm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Um=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Nm(i,t,e){let n=new Is,s=new yt,r=new yt,a=new oe,o=new Vo({depthPacking:Tu}),l=new Go,c={},h=e.maxTextureSize,u={[Zn]:Xe,[Xe]:Zn,[We]:We},f=new pe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new yt},radius:{value:4}},vertexShader:Dm,fragmentShader:Um}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let _=new ye;_.setAttribute("position",new be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new ne(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=rh;let d=this.type;this.render=function(w,C,E){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;let g=i.getRenderTarget(),x=i.getActiveCubeFace(),T=i.getActiveMipmapLevel(),U=i.state;U.setBlending(vn),U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let O=d!==Pn&&this.type===Pn,V=d===Pn&&this.type!==Pn;for(let tt=0,Z=w.length;tt<Z;tt++){let at=w[tt],Q=at.shadow;if(Q===void 0){console.warn("THREE.WebGLShadowMap:",at,"has no shadow.");continue}if(Q.autoUpdate===!1&&Q.needsUpdate===!1)continue;s.copy(Q.mapSize);let vt=Q.getFrameExtents();if(s.multiply(vt),r.copy(Q.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/vt.x),s.x=r.x*vt.x,Q.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/vt.y),s.y=r.y*vt.y,Q.mapSize.y=r.y)),Q.map===null||O===!0||V===!0){let wt=this.type!==Pn?{minFilter:Qe,magFilter:Qe}:{};Q.map!==null&&Q.map.dispose(),Q.map=new He(s.x,s.y,wt),Q.map.texture.name=at.name+".shadowMap",Q.camera.updateProjectionMatrix()}i.setRenderTarget(Q.map),i.clear();let Mt=Q.getViewportCount();for(let wt=0;wt<Mt;wt++){let kt=Q.getViewport(wt);a.set(r.x*kt.x,r.y*kt.y,r.x*kt.z,r.y*kt.w),U.viewport(a),Q.updateMatrices(at,wt),n=Q.getFrustum(),v(C,E,Q.camera,at,this.type)}Q.isPointLightShadow!==!0&&this.type===Pn&&A(Q,E),Q.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(g,x,T)};function A(w,C){let E=t.update(y);f.defines.VSM_SAMPLES!==w.blurSamples&&(f.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new He(s.x,s.y)),f.uniforms.shadow_pass.value=w.map.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(C,null,E,f,y,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(C,null,E,p,y,null)}function S(w,C,E,g){let x=null,T=E.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(T!==void 0)x=T;else if(x=E.isPointLight===!0?l:o,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){let U=x.uuid,O=C.uuid,V=c[U];V===void 0&&(V={},c[U]=V);let tt=V[O];tt===void 0&&(tt=x.clone(),V[O]=tt,C.addEventListener("dispose",I)),x=tt}if(x.visible=C.visible,x.wireframe=C.wireframe,g===Pn?x.side=C.shadowSide!==null?C.shadowSide:C.side:x.side=C.shadowSide!==null?C.shadowSide:u[C.side],x.alphaMap=C.alphaMap,x.alphaTest=C.alphaTest,x.map=C.map,x.clipShadows=C.clipShadows,x.clippingPlanes=C.clippingPlanes,x.clipIntersection=C.clipIntersection,x.displacementMap=C.displacementMap,x.displacementScale=C.displacementScale,x.displacementBias=C.displacementBias,x.wireframeLinewidth=C.wireframeLinewidth,x.linewidth=C.linewidth,E.isPointLight===!0&&x.isMeshDistanceMaterial===!0){let U=i.properties.get(x);U.light=E}return x}function v(w,C,E,g,x){if(w.visible===!1)return;if(w.layers.test(C.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&x===Pn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,w.matrixWorld);let O=t.update(w),V=w.material;if(Array.isArray(V)){let tt=O.groups;for(let Z=0,at=tt.length;Z<at;Z++){let Q=tt[Z],vt=V[Q.materialIndex];if(vt&&vt.visible){let Mt=S(w,vt,g,x);w.onBeforeShadow(i,w,C,E,O,Mt,Q),i.renderBufferDirect(E,null,O,Mt,w,Q),w.onAfterShadow(i,w,C,E,O,Mt,Q)}}}else if(V.visible){let tt=S(w,V,g,x);w.onBeforeShadow(i,w,C,E,O,tt,null),i.renderBufferDirect(E,null,O,tt,w,null),w.onAfterShadow(i,w,C,E,O,tt,null)}}let U=w.children;for(let O=0,V=U.length;O<V;O++)v(U[O],C,E,g,x)}function I(w){w.target.removeEventListener("dispose",I);for(let E in c){let g=c[E],x=w.target.uuid;x in g&&(g[x].dispose(),delete g[x])}}}var Fm={[qa]:Ya,[Za]:Ka,[Ja]:Qa,[qi]:$a,[Ya]:qa,[Ka]:Za,[Qa]:Ja,[$a]:qi};function Om(i,t){function e(){let D=!1,et=new oe,k=null,j=new oe(0,0,0,0);return{setMask:function(mt){k!==mt&&!D&&(i.colorMask(mt,mt,mt,mt),k=mt)},setLocked:function(mt){D=mt},setClear:function(mt,gt,At,Jt,le){le===!0&&(mt*=Jt,gt*=Jt,At*=Jt),et.set(mt,gt,At,Jt),j.equals(et)===!1&&(i.clearColor(mt,gt,At,Jt),j.copy(et))},reset:function(){D=!1,k=null,j.set(-1,0,0,0)}}}function n(){let D=!1,et=!1,k=null,j=null,mt=null;return{setReversed:function(gt){if(et!==gt){let At=t.get("EXT_clip_control");et?At.clipControlEXT(At.LOWER_LEFT_EXT,At.ZERO_TO_ONE_EXT):At.clipControlEXT(At.LOWER_LEFT_EXT,At.NEGATIVE_ONE_TO_ONE_EXT);let Jt=mt;mt=null,this.setClear(Jt)}et=gt},getReversed:function(){return et},setTest:function(gt){gt?L(i.DEPTH_TEST):W(i.DEPTH_TEST)},setMask:function(gt){k!==gt&&!D&&(i.depthMask(gt),k=gt)},setFunc:function(gt){if(et&&(gt=Fm[gt]),j!==gt){switch(gt){case qa:i.depthFunc(i.NEVER);break;case Ya:i.depthFunc(i.ALWAYS);break;case Za:i.depthFunc(i.LESS);break;case qi:i.depthFunc(i.LEQUAL);break;case Ja:i.depthFunc(i.EQUAL);break;case $a:i.depthFunc(i.GEQUAL);break;case Ka:i.depthFunc(i.GREATER);break;case Qa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}j=gt}},setLocked:function(gt){D=gt},setClear:function(gt){mt!==gt&&(et&&(gt=1-gt),i.clearDepth(gt),mt=gt)},reset:function(){D=!1,k=null,j=null,mt=null,et=!1}}}function s(){let D=!1,et=null,k=null,j=null,mt=null,gt=null,At=null,Jt=null,le=null;return{setTest:function($t){D||($t?L(i.STENCIL_TEST):W(i.STENCIL_TEST))},setMask:function($t){et!==$t&&!D&&(i.stencilMask($t),et=$t)},setFunc:function($t,Ie,Qt){(k!==$t||j!==Ie||mt!==Qt)&&(i.stencilFunc($t,Ie,Qt),k=$t,j=Ie,mt=Qt)},setOp:function($t,Ie,Qt){(gt!==$t||At!==Ie||Jt!==Qt)&&(i.stencilOp($t,Ie,Qt),gt=$t,At=Ie,Jt=Qt)},setLocked:function($t){D=$t},setClear:function($t){le!==$t&&(i.clearStencil($t),le=$t)},reset:function(){D=!1,et=null,k=null,j=null,mt=null,gt=null,At=null,Jt=null,le=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,p=[],_=null,y=!1,m=null,d=null,A=null,S=null,v=null,I=null,w=null,C=new Ht(0,0,0),E=0,g=!1,x=null,T=null,U=null,O=null,V=null,tt=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,at=0,Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?(at=parseFloat(/^WebGL (\d)/.exec(Q)[1]),Z=at>=1):Q.indexOf("OpenGL ES")!==-1&&(at=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),Z=at>=2);let vt=null,Mt={},wt=i.getParameter(i.SCISSOR_BOX),kt=i.getParameter(i.VIEWPORT),Xt=new oe().fromArray(wt),rt=new oe().fromArray(kt);function F(D,et,k,j){let mt=new Uint8Array(4),gt=i.createTexture();i.bindTexture(D,gt),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let At=0;At<k;At++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(et,0,i.RGBA,1,1,j,0,i.RGBA,i.UNSIGNED_BYTE,mt):i.texImage2D(et+At,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,mt);return gt}let H={};H[i.TEXTURE_2D]=F(i.TEXTURE_2D,i.TEXTURE_2D,1),H[i.TEXTURE_CUBE_MAP]=F(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),H[i.TEXTURE_2D_ARRAY]=F(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),H[i.TEXTURE_3D]=F(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),L(i.DEPTH_TEST),a.setFunc(qi),ct(!1),bt(Gl),L(i.CULL_FACE),P(vn);function L(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function W(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function $(D,et){return u[D]!==et?(i.bindFramebuffer(D,et),u[D]=et,D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=et),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=et),!0):!1}function K(D,et){let k=p,j=!1;if(D){k=f.get(et),k===void 0&&(k=[],f.set(et,k));let mt=D.textures;if(k.length!==mt.length||k[0]!==i.COLOR_ATTACHMENT0){for(let gt=0,At=mt.length;gt<At;gt++)k[gt]=i.COLOR_ATTACHMENT0+gt;k.length=mt.length,j=!0}}else k[0]!==i.BACK&&(k[0]=i.BACK,j=!0);j&&i.drawBuffers(k)}function ft(D){return _!==D?(i.useProgram(D),_=D,!0):!1}let X={[ci]:i.FUNC_ADD,[iu]:i.FUNC_SUBTRACT,[su]:i.FUNC_REVERSE_SUBTRACT};X[ru]=i.MIN,X[au]=i.MAX;let ot={[ou]:i.ZERO,[lu]:i.ONE,[cu]:i.SRC_COLOR,[Wa]:i.SRC_ALPHA,[mu]:i.SRC_ALPHA_SATURATE,[du]:i.DST_COLOR,[uu]:i.DST_ALPHA,[hu]:i.ONE_MINUS_SRC_COLOR,[Xa]:i.ONE_MINUS_SRC_ALPHA,[pu]:i.ONE_MINUS_DST_COLOR,[fu]:i.ONE_MINUS_DST_ALPHA,[gu]:i.CONSTANT_COLOR,[_u]:i.ONE_MINUS_CONSTANT_COLOR,[vu]:i.CONSTANT_ALPHA,[xu]:i.ONE_MINUS_CONSTANT_ALPHA};function P(D,et,k,j,mt,gt,At,Jt,le,$t){if(D===vn){y===!0&&(W(i.BLEND),y=!1);return}if(y===!1&&(L(i.BLEND),y=!0),D!==nu){if(D!==m||$t!==g){if((d!==ci||v!==ci)&&(i.blendEquation(i.FUNC_ADD),d=ci,v=ci),$t)switch(D){case Vi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case qe:i.blendFunc(i.ONE,i.ONE);break;case Wl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Vi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case qe:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Wl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}A=null,S=null,I=null,w=null,C.set(0,0,0),E=0,m=D,g=$t}return}mt=mt||et,gt=gt||k,At=At||j,(et!==d||mt!==v)&&(i.blendEquationSeparate(X[et],X[mt]),d=et,v=mt),(k!==A||j!==S||gt!==I||At!==w)&&(i.blendFuncSeparate(ot[k],ot[j],ot[gt],ot[At]),A=k,S=j,I=gt,w=At),(Jt.equals(C)===!1||le!==E)&&(i.blendColor(Jt.r,Jt.g,Jt.b,le),C.copy(Jt),E=le),m=D,g=!1}function ht(D,et){D.side===We?W(i.CULL_FACE):L(i.CULL_FACE);let k=D.side===Xe;et&&(k=!k),ct(k),D.blending===Vi&&D.transparent===!1?P(vn):P(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);let j=D.stencilWrite;o.setTest(j),j&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Bt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?L(i.SAMPLE_ALPHA_TO_COVERAGE):W(i.SAMPLE_ALPHA_TO_COVERAGE)}function ct(D){x!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),x=D)}function bt(D){D!==jh?(L(i.CULL_FACE),D!==T&&(D===Gl?i.cullFace(i.BACK):D===tu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):W(i.CULL_FACE),T=D}function St(D){D!==U&&(Z&&i.lineWidth(D),U=D)}function Bt(D,et,k){D?(L(i.POLYGON_OFFSET_FILL),(O!==et||V!==k)&&(i.polygonOffset(et,k),O=et,V=k)):W(i.POLYGON_OFFSET_FILL)}function Ct(D){D?L(i.SCISSOR_TEST):W(i.SCISSOR_TEST)}function R(D){D===void 0&&(D=i.TEXTURE0+tt-1),vt!==D&&(i.activeTexture(D),vt=D)}function M(D,et,k){k===void 0&&(vt===null?k=i.TEXTURE0+tt-1:k=vt);let j=Mt[k];j===void 0&&(j={type:void 0,texture:void 0},Mt[k]=j),(j.type!==D||j.texture!==et)&&(vt!==k&&(i.activeTexture(k),vt=k),i.bindTexture(D,et||H[D]),j.type=D,j.texture=et)}function q(){let D=Mt[vt];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function it(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ut(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function nt(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Lt(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Et(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Pt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Zt(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function G(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function st(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function lt(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function dt(D){Xt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Xt.copy(D))}function pt(D){rt.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),rt.copy(D))}function It(D,et){let k=c.get(et);k===void 0&&(k=new WeakMap,c.set(et,k));let j=k.get(D);j===void 0&&(j=i.getUniformBlockIndex(et,D.name),k.set(D,j))}function _t(D,et){let j=c.get(et).get(D);l.get(et)!==j&&(i.uniformBlockBinding(et,j,D.__bindingPointIndex),l.set(et,j))}function zt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},vt=null,Mt={},u={},f=new WeakMap,p=[],_=null,y=!1,m=null,d=null,A=null,S=null,v=null,I=null,w=null,C=new Ht(0,0,0),E=0,g=!1,x=null,T=null,U=null,O=null,V=null,Xt.set(0,0,i.canvas.width,i.canvas.height),rt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:L,disable:W,bindFramebuffer:$,drawBuffers:K,useProgram:ft,setBlending:P,setMaterial:ht,setFlipSided:ct,setCullFace:bt,setLineWidth:St,setPolygonOffset:Bt,setScissorTest:Ct,activeTexture:R,bindTexture:M,unbindTexture:q,compressedTexImage2D:it,compressedTexImage3D:ut,texImage2D:st,texImage3D:lt,updateUBOMapping:It,uniformBlockBinding:_t,texStorage2D:Zt,texStorage3D:G,texSubImage2D:nt,texSubImage3D:Lt,compressedTexSubImage2D:Et,compressedTexSubImage3D:Pt,scissor:dt,viewport:pt,reset:zt}}function Vc(i,t,e,n){let s=Bm(n);switch(e){case uh:return i*t;case dh:return i*t;case ph:return i*t*2;case Tl:return i*t/s.components*s.byteLength;case wl:return i*t/s.components*s.byteLength;case mh:return i*t*2/s.components*s.byteLength;case Al:return i*t*2/s.components*s.byteLength;case fh:return i*t*3/s.components*s.byteLength;case cn:return i*t*4/s.components*s.byteLength;case Rl:return i*t*4/s.components*s.byteLength;case yr:case Mr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Sr:case br:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case so:case ao:return Math.max(i,16)*Math.max(t,8)/4;case io:case ro:return Math.max(i,8)*Math.max(t,8)/2;case oo:case lo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case co:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ho:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case uo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case fo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case po:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case mo:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case go:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case _o:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case vo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case xo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case yo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Mo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case So:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case bo:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Eo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Er:case To:case wo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case gh:case Ao:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Ro:case Co:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Bm(i){switch(i){case Un:case lh:return{byteLength:1,components:1};case Rs:case ch:case fn:return{byteLength:2,components:1};case bl:case El:return{byteLength:2,components:4};case pi:case Sl:case _n:return{byteLength:4,components:1};case hh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function zm(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new yt,h=new WeakMap,u,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,M){return p?new OffscreenCanvas(R,M):Ar("canvas")}function y(R,M,q){let it=1,ut=Ct(R);if((ut.width>q||ut.height>q)&&(it=q/Math.max(ut.width,ut.height)),it<1)if(typeof HTMLImageElement!="undefined"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&R instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&R instanceof ImageBitmap||typeof VideoFrame!="undefined"&&R instanceof VideoFrame){let nt=Math.floor(it*ut.width),Lt=Math.floor(it*ut.height);u===void 0&&(u=_(nt,Lt));let Et=M?_(nt,Lt):u;return Et.width=nt,Et.height=Lt,Et.getContext("2d").drawImage(R,0,0,nt,Lt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ut.width+"x"+ut.height+") to ("+nt+"x"+Lt+")."),Et}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ut.width+"x"+ut.height+")."),R;return R}function m(R){return R.generateMipmaps}function d(R){i.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(R,M,q,it,ut=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let nt=M;if(M===i.RED&&(q===i.FLOAT&&(nt=i.R32F),q===i.HALF_FLOAT&&(nt=i.R16F),q===i.UNSIGNED_BYTE&&(nt=i.R8)),M===i.RED_INTEGER&&(q===i.UNSIGNED_BYTE&&(nt=i.R8UI),q===i.UNSIGNED_SHORT&&(nt=i.R16UI),q===i.UNSIGNED_INT&&(nt=i.R32UI),q===i.BYTE&&(nt=i.R8I),q===i.SHORT&&(nt=i.R16I),q===i.INT&&(nt=i.R32I)),M===i.RG&&(q===i.FLOAT&&(nt=i.RG32F),q===i.HALF_FLOAT&&(nt=i.RG16F),q===i.UNSIGNED_BYTE&&(nt=i.RG8)),M===i.RG_INTEGER&&(q===i.UNSIGNED_BYTE&&(nt=i.RG8UI),q===i.UNSIGNED_SHORT&&(nt=i.RG16UI),q===i.UNSIGNED_INT&&(nt=i.RG32UI),q===i.BYTE&&(nt=i.RG8I),q===i.SHORT&&(nt=i.RG16I),q===i.INT&&(nt=i.RG32I)),M===i.RGB_INTEGER&&(q===i.UNSIGNED_BYTE&&(nt=i.RGB8UI),q===i.UNSIGNED_SHORT&&(nt=i.RGB16UI),q===i.UNSIGNED_INT&&(nt=i.RGB32UI),q===i.BYTE&&(nt=i.RGB8I),q===i.SHORT&&(nt=i.RGB16I),q===i.INT&&(nt=i.RGB32I)),M===i.RGBA_INTEGER&&(q===i.UNSIGNED_BYTE&&(nt=i.RGBA8UI),q===i.UNSIGNED_SHORT&&(nt=i.RGBA16UI),q===i.UNSIGNED_INT&&(nt=i.RGBA32UI),q===i.BYTE&&(nt=i.RGBA8I),q===i.SHORT&&(nt=i.RGBA16I),q===i.INT&&(nt=i.RGBA32I)),M===i.RGB&&q===i.UNSIGNED_INT_5_9_9_9_REV&&(nt=i.RGB9_E5),M===i.RGBA){let Lt=ut?ea:Kt.getTransfer(it);q===i.FLOAT&&(nt=i.RGBA32F),q===i.HALF_FLOAT&&(nt=i.RGBA16F),q===i.UNSIGNED_BYTE&&(nt=Lt===re?i.SRGB8_ALPHA8:i.RGBA8),q===i.UNSIGNED_SHORT_4_4_4_4&&(nt=i.RGBA4),q===i.UNSIGNED_SHORT_5_5_5_1&&(nt=i.RGB5_A1)}return(nt===i.R16F||nt===i.R32F||nt===i.RG16F||nt===i.RG32F||nt===i.RGBA16F||nt===i.RGBA32F)&&t.get("EXT_color_buffer_float"),nt}function v(R,M){let q;return R?M===null||M===pi||M===Ji?q=i.DEPTH24_STENCIL8:M===_n?q=i.DEPTH32F_STENCIL8:M===Rs&&(q=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===pi||M===Ji?q=i.DEPTH_COMPONENT24:M===_n?q=i.DEPTH_COMPONENT32F:M===Rs&&(q=i.DEPTH_COMPONENT16),q}function I(R,M){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Qe&&R.minFilter!==gn?Math.log2(Math.max(M.width,M.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?M.mipmaps.length:1}function w(R){let M=R.target;M.removeEventListener("dispose",w),E(M),M.isVideoTexture&&h.delete(M)}function C(R){let M=R.target;M.removeEventListener("dispose",C),x(M)}function E(R){let M=n.get(R);if(M.__webglInit===void 0)return;let q=R.source,it=f.get(q);if(it){let ut=it[M.__cacheKey];ut.usedTimes--,ut.usedTimes===0&&g(R),Object.keys(it).length===0&&f.delete(q)}n.remove(R)}function g(R){let M=n.get(R);i.deleteTexture(M.__webglTexture);let q=R.source,it=f.get(q);delete it[M.__cacheKey],a.memory.textures--}function x(R){let M=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let it=0;it<6;it++){if(Array.isArray(M.__webglFramebuffer[it]))for(let ut=0;ut<M.__webglFramebuffer[it].length;ut++)i.deleteFramebuffer(M.__webglFramebuffer[it][ut]);else i.deleteFramebuffer(M.__webglFramebuffer[it]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[it])}else{if(Array.isArray(M.__webglFramebuffer))for(let it=0;it<M.__webglFramebuffer.length;it++)i.deleteFramebuffer(M.__webglFramebuffer[it]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let it=0;it<M.__webglColorRenderbuffer.length;it++)M.__webglColorRenderbuffer[it]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[it]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let q=R.textures;for(let it=0,ut=q.length;it<ut;it++){let nt=n.get(q[it]);nt.__webglTexture&&(i.deleteTexture(nt.__webglTexture),a.memory.textures--),n.remove(q[it])}n.remove(R)}let T=0;function U(){T=0}function O(){let R=T;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),T+=1,R}function V(R){let M=[];return M.push(R.wrapS),M.push(R.wrapT),M.push(R.wrapR||0),M.push(R.magFilter),M.push(R.minFilter),M.push(R.anisotropy),M.push(R.internalFormat),M.push(R.format),M.push(R.type),M.push(R.generateMipmaps),M.push(R.premultiplyAlpha),M.push(R.flipY),M.push(R.unpackAlignment),M.push(R.colorSpace),M.join()}function tt(R,M){let q=n.get(R);if(R.isVideoTexture&&St(R),R.isRenderTargetTexture===!1&&R.version>0&&q.__version!==R.version){let it=R.image;if(it===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(it.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{rt(q,R,M);return}}e.bindTexture(i.TEXTURE_2D,q.__webglTexture,i.TEXTURE0+M)}function Z(R,M){let q=n.get(R);if(R.version>0&&q.__version!==R.version){rt(q,R,M);return}e.bindTexture(i.TEXTURE_2D_ARRAY,q.__webglTexture,i.TEXTURE0+M)}function at(R,M){let q=n.get(R);if(R.version>0&&q.__version!==R.version){rt(q,R,M);return}e.bindTexture(i.TEXTURE_3D,q.__webglTexture,i.TEXTURE0+M)}function Q(R,M){let q=n.get(R);if(R.version>0&&q.__version!==R.version){F(q,R,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture,i.TEXTURE0+M)}let vt={[eo]:i.REPEAT,[fi]:i.CLAMP_TO_EDGE,[no]:i.MIRRORED_REPEAT},Mt={[Qe]:i.NEAREST,[bu]:i.NEAREST_MIPMAP_NEAREST,[Ws]:i.NEAREST_MIPMAP_LINEAR,[gn]:i.LINEAR,[ha]:i.LINEAR_MIPMAP_NEAREST,[di]:i.LINEAR_MIPMAP_LINEAR},wt={[Au]:i.NEVER,[Du]:i.ALWAYS,[Ru]:i.LESS,[vh]:i.LEQUAL,[Cu]:i.EQUAL,[Lu]:i.GEQUAL,[Pu]:i.GREATER,[Iu]:i.NOTEQUAL};function kt(R,M){if(M.type===_n&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===gn||M.magFilter===ha||M.magFilter===Ws||M.magFilter===di||M.minFilter===gn||M.minFilter===ha||M.minFilter===Ws||M.minFilter===di)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,vt[M.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,vt[M.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,vt[M.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,Mt[M.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,Mt[M.minFilter]),M.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,wt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Qe||M.minFilter!==Ws&&M.minFilter!==di||M.type===_n&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let q=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Xt(R,M){let q=!1;R.__webglInit===void 0&&(R.__webglInit=!0,M.addEventListener("dispose",w));let it=M.source,ut=f.get(it);ut===void 0&&(ut={},f.set(it,ut));let nt=V(M);if(nt!==R.__cacheKey){ut[nt]===void 0&&(ut[nt]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,q=!0),ut[nt].usedTimes++;let Lt=ut[R.__cacheKey];Lt!==void 0&&(ut[R.__cacheKey].usedTimes--,Lt.usedTimes===0&&g(M)),R.__cacheKey=nt,R.__webglTexture=ut[nt].texture}return q}function rt(R,M,q){let it=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(it=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(it=i.TEXTURE_3D);let ut=Xt(R,M),nt=M.source;e.bindTexture(it,R.__webglTexture,i.TEXTURE0+q);let Lt=n.get(nt);if(nt.version!==Lt.__version||ut===!0){e.activeTexture(i.TEXTURE0+q);let Et=Kt.getPrimaries(Kt.workingColorSpace),Pt=M.colorSpace===qn?null:Kt.getPrimaries(M.colorSpace),Zt=M.colorSpace===qn||Et===Pt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Zt);let G=y(M.image,!1,s.maxTextureSize);G=Bt(M,G);let st=r.convert(M.format,M.colorSpace),lt=r.convert(M.type),dt=S(M.internalFormat,st,lt,M.colorSpace,M.isVideoTexture);kt(it,M);let pt,It=M.mipmaps,_t=M.isVideoTexture!==!0,zt=Lt.__version===void 0||ut===!0,D=nt.dataReady,et=I(M,G);if(M.isDepthTexture)dt=v(M.format===$i,M.type),zt&&(_t?e.texStorage2D(i.TEXTURE_2D,1,dt,G.width,G.height):e.texImage2D(i.TEXTURE_2D,0,dt,G.width,G.height,0,st,lt,null));else if(M.isDataTexture)if(It.length>0){_t&&zt&&e.texStorage2D(i.TEXTURE_2D,et,dt,It[0].width,It[0].height);for(let k=0,j=It.length;k<j;k++)pt=It[k],_t?D&&e.texSubImage2D(i.TEXTURE_2D,k,0,0,pt.width,pt.height,st,lt,pt.data):e.texImage2D(i.TEXTURE_2D,k,dt,pt.width,pt.height,0,st,lt,pt.data);M.generateMipmaps=!1}else _t?(zt&&e.texStorage2D(i.TEXTURE_2D,et,dt,G.width,G.height),D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,G.width,G.height,st,lt,G.data)):e.texImage2D(i.TEXTURE_2D,0,dt,G.width,G.height,0,st,lt,G.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){_t&&zt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,et,dt,It[0].width,It[0].height,G.depth);for(let k=0,j=It.length;k<j;k++)if(pt=It[k],M.format!==cn)if(st!==null)if(_t){if(D)if(M.layerUpdates.size>0){let mt=Vc(pt.width,pt.height,M.format,M.type);for(let gt of M.layerUpdates){let At=pt.data.subarray(gt*mt/pt.data.BYTES_PER_ELEMENT,(gt+1)*mt/pt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,k,0,0,gt,pt.width,pt.height,1,st,At)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,k,0,0,0,pt.width,pt.height,G.depth,st,pt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,k,dt,pt.width,pt.height,G.depth,0,pt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else _t?D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,k,0,0,0,pt.width,pt.height,G.depth,st,lt,pt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,k,dt,pt.width,pt.height,G.depth,0,st,lt,pt.data)}else{_t&&zt&&e.texStorage2D(i.TEXTURE_2D,et,dt,It[0].width,It[0].height);for(let k=0,j=It.length;k<j;k++)pt=It[k],M.format!==cn?st!==null?_t?D&&e.compressedTexSubImage2D(i.TEXTURE_2D,k,0,0,pt.width,pt.height,st,pt.data):e.compressedTexImage2D(i.TEXTURE_2D,k,dt,pt.width,pt.height,0,pt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):_t?D&&e.texSubImage2D(i.TEXTURE_2D,k,0,0,pt.width,pt.height,st,lt,pt.data):e.texImage2D(i.TEXTURE_2D,k,dt,pt.width,pt.height,0,st,lt,pt.data)}else if(M.isDataArrayTexture)if(_t){if(zt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,et,dt,G.width,G.height,G.depth),D)if(M.layerUpdates.size>0){let k=Vc(G.width,G.height,M.format,M.type);for(let j of M.layerUpdates){let mt=G.data.subarray(j*k/G.data.BYTES_PER_ELEMENT,(j+1)*k/G.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,j,G.width,G.height,1,st,lt,mt)}M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,G.width,G.height,G.depth,st,lt,G.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,dt,G.width,G.height,G.depth,0,st,lt,G.data);else if(M.isData3DTexture)_t?(zt&&e.texStorage3D(i.TEXTURE_3D,et,dt,G.width,G.height,G.depth),D&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,G.width,G.height,G.depth,st,lt,G.data)):e.texImage3D(i.TEXTURE_3D,0,dt,G.width,G.height,G.depth,0,st,lt,G.data);else if(M.isFramebufferTexture){if(zt)if(_t)e.texStorage2D(i.TEXTURE_2D,et,dt,G.width,G.height);else{let k=G.width,j=G.height;for(let mt=0;mt<et;mt++)e.texImage2D(i.TEXTURE_2D,mt,dt,k,j,0,st,lt,null),k>>=1,j>>=1}}else if(It.length>0){if(_t&&zt){let k=Ct(It[0]);e.texStorage2D(i.TEXTURE_2D,et,dt,k.width,k.height)}for(let k=0,j=It.length;k<j;k++)pt=It[k],_t?D&&e.texSubImage2D(i.TEXTURE_2D,k,0,0,st,lt,pt):e.texImage2D(i.TEXTURE_2D,k,dt,st,lt,pt);M.generateMipmaps=!1}else if(_t){if(zt){let k=Ct(G);e.texStorage2D(i.TEXTURE_2D,et,dt,k.width,k.height)}D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,st,lt,G)}else e.texImage2D(i.TEXTURE_2D,0,dt,st,lt,G);m(M)&&d(it),Lt.__version=nt.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function F(R,M,q){if(M.image.length!==6)return;let it=Xt(R,M),ut=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+q);let nt=n.get(ut);if(ut.version!==nt.__version||it===!0){e.activeTexture(i.TEXTURE0+q);let Lt=Kt.getPrimaries(Kt.workingColorSpace),Et=M.colorSpace===qn?null:Kt.getPrimaries(M.colorSpace),Pt=M.colorSpace===qn||Lt===Et?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pt);let Zt=M.isCompressedTexture||M.image[0].isCompressedTexture,G=M.image[0]&&M.image[0].isDataTexture,st=[];for(let j=0;j<6;j++)!Zt&&!G?st[j]=y(M.image[j],!0,s.maxCubemapSize):st[j]=G?M.image[j].image:M.image[j],st[j]=Bt(M,st[j]);let lt=st[0],dt=r.convert(M.format,M.colorSpace),pt=r.convert(M.type),It=S(M.internalFormat,dt,pt,M.colorSpace),_t=M.isVideoTexture!==!0,zt=nt.__version===void 0||it===!0,D=ut.dataReady,et=I(M,lt);kt(i.TEXTURE_CUBE_MAP,M);let k;if(Zt){_t&&zt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,et,It,lt.width,lt.height);for(let j=0;j<6;j++){k=st[j].mipmaps;for(let mt=0;mt<k.length;mt++){let gt=k[mt];M.format!==cn?dt!==null?_t?D&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,0,0,gt.width,gt.height,dt,gt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,It,gt.width,gt.height,0,gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):_t?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,0,0,gt.width,gt.height,dt,pt,gt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,It,gt.width,gt.height,0,dt,pt,gt.data)}}}else{if(k=M.mipmaps,_t&&zt){k.length>0&&et++;let j=Ct(st[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,et,It,j.width,j.height)}for(let j=0;j<6;j++)if(G){_t?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,st[j].width,st[j].height,dt,pt,st[j].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,It,st[j].width,st[j].height,0,dt,pt,st[j].data);for(let mt=0;mt<k.length;mt++){let At=k[mt].image[j].image;_t?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,0,0,At.width,At.height,dt,pt,At.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,It,At.width,At.height,0,dt,pt,At.data)}}else{_t?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,dt,pt,st[j]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,It,dt,pt,st[j]);for(let mt=0;mt<k.length;mt++){let gt=k[mt];_t?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,0,0,dt,pt,gt.image[j]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,It,dt,pt,gt.image[j])}}}m(M)&&d(i.TEXTURE_CUBE_MAP),nt.__version=ut.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function H(R,M,q,it,ut,nt){let Lt=r.convert(q.format,q.colorSpace),Et=r.convert(q.type),Pt=S(q.internalFormat,Lt,Et,q.colorSpace),Zt=n.get(M),G=n.get(q);if(G.__renderTarget=M,!Zt.__hasExternalTextures){let st=Math.max(1,M.width>>nt),lt=Math.max(1,M.height>>nt);ut===i.TEXTURE_3D||ut===i.TEXTURE_2D_ARRAY?e.texImage3D(ut,nt,Pt,st,lt,M.depth,0,Lt,Et,null):e.texImage2D(ut,nt,Pt,st,lt,0,Lt,Et,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),bt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,it,ut,G.__webglTexture,0,ct(M)):(ut===i.TEXTURE_2D||ut>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ut<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,it,ut,G.__webglTexture,nt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function L(R,M,q){if(i.bindRenderbuffer(i.RENDERBUFFER,R),M.depthBuffer){let it=M.depthTexture,ut=it&&it.isDepthTexture?it.type:null,nt=v(M.stencilBuffer,ut),Lt=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Et=ct(M);bt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Et,nt,M.width,M.height):q?i.renderbufferStorageMultisample(i.RENDERBUFFER,Et,nt,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,nt,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Lt,i.RENDERBUFFER,R)}else{let it=M.textures;for(let ut=0;ut<it.length;ut++){let nt=it[ut],Lt=r.convert(nt.format,nt.colorSpace),Et=r.convert(nt.type),Pt=S(nt.internalFormat,Lt,Et,nt.colorSpace),Zt=ct(M);q&&bt(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Zt,Pt,M.width,M.height):bt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Zt,Pt,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Pt,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function W(R,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let it=n.get(M.depthTexture);it.__renderTarget=M,(!it.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),tt(M.depthTexture,0);let ut=it.__webglTexture,nt=ct(M);if(M.depthTexture.format===Gi)bt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ut,0,nt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ut,0);else if(M.depthTexture.format===$i)bt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ut,0,nt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ut,0);else throw new Error("Unknown depthTexture format")}function $(R){let M=n.get(R),q=R.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==R.depthTexture){let it=R.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),it){let ut=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,it.removeEventListener("dispose",ut)};it.addEventListener("dispose",ut),M.__depthDisposeCallback=ut}M.__boundDepthTexture=it}if(R.depthTexture&&!M.__autoAllocateDepthBuffer){if(q)throw new Error("target.depthTexture not supported in Cube render targets");W(M.__webglFramebuffer,R)}else if(q){M.__webglDepthbuffer=[];for(let it=0;it<6;it++)if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[it]),M.__webglDepthbuffer[it]===void 0)M.__webglDepthbuffer[it]=i.createRenderbuffer(),L(M.__webglDepthbuffer[it],R,!1);else{let ut=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,nt=M.__webglDepthbuffer[it];i.bindRenderbuffer(i.RENDERBUFFER,nt),i.framebufferRenderbuffer(i.FRAMEBUFFER,ut,i.RENDERBUFFER,nt)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),L(M.__webglDepthbuffer,R,!1);else{let it=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ut),i.framebufferRenderbuffer(i.FRAMEBUFFER,it,i.RENDERBUFFER,ut)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function K(R,M,q){let it=n.get(R);M!==void 0&&H(it.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),q!==void 0&&$(R)}function ft(R){let M=R.texture,q=n.get(R),it=n.get(M);R.addEventListener("dispose",C);let ut=R.textures,nt=R.isWebGLCubeRenderTarget===!0,Lt=ut.length>1;if(Lt||(it.__webglTexture===void 0&&(it.__webglTexture=i.createTexture()),it.__version=M.version,a.memory.textures++),nt){q.__webglFramebuffer=[];for(let Et=0;Et<6;Et++)if(M.mipmaps&&M.mipmaps.length>0){q.__webglFramebuffer[Et]=[];for(let Pt=0;Pt<M.mipmaps.length;Pt++)q.__webglFramebuffer[Et][Pt]=i.createFramebuffer()}else q.__webglFramebuffer[Et]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){q.__webglFramebuffer=[];for(let Et=0;Et<M.mipmaps.length;Et++)q.__webglFramebuffer[Et]=i.createFramebuffer()}else q.__webglFramebuffer=i.createFramebuffer();if(Lt)for(let Et=0,Pt=ut.length;Et<Pt;Et++){let Zt=n.get(ut[Et]);Zt.__webglTexture===void 0&&(Zt.__webglTexture=i.createTexture(),a.memory.textures++)}if(R.samples>0&&bt(R)===!1){q.__webglMultisampledFramebuffer=i.createFramebuffer(),q.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,q.__webglMultisampledFramebuffer);for(let Et=0;Et<ut.length;Et++){let Pt=ut[Et];q.__webglColorRenderbuffer[Et]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,q.__webglColorRenderbuffer[Et]);let Zt=r.convert(Pt.format,Pt.colorSpace),G=r.convert(Pt.type),st=S(Pt.internalFormat,Zt,G,Pt.colorSpace,R.isXRRenderTarget===!0),lt=ct(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,lt,st,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Et,i.RENDERBUFFER,q.__webglColorRenderbuffer[Et])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(q.__webglDepthRenderbuffer=i.createRenderbuffer(),L(q.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(nt){e.bindTexture(i.TEXTURE_CUBE_MAP,it.__webglTexture),kt(i.TEXTURE_CUBE_MAP,M);for(let Et=0;Et<6;Et++)if(M.mipmaps&&M.mipmaps.length>0)for(let Pt=0;Pt<M.mipmaps.length;Pt++)H(q.__webglFramebuffer[Et][Pt],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Et,Pt);else H(q.__webglFramebuffer[Et],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Et,0);m(M)&&d(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Lt){for(let Et=0,Pt=ut.length;Et<Pt;Et++){let Zt=ut[Et],G=n.get(Zt);e.bindTexture(i.TEXTURE_2D,G.__webglTexture),kt(i.TEXTURE_2D,Zt),H(q.__webglFramebuffer,R,Zt,i.COLOR_ATTACHMENT0+Et,i.TEXTURE_2D,0),m(Zt)&&d(i.TEXTURE_2D)}e.unbindTexture()}else{let Et=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Et=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Et,it.__webglTexture),kt(Et,M),M.mipmaps&&M.mipmaps.length>0)for(let Pt=0;Pt<M.mipmaps.length;Pt++)H(q.__webglFramebuffer[Pt],R,M,i.COLOR_ATTACHMENT0,Et,Pt);else H(q.__webglFramebuffer,R,M,i.COLOR_ATTACHMENT0,Et,0);m(M)&&d(Et),e.unbindTexture()}R.depthBuffer&&$(R)}function X(R){let M=R.textures;for(let q=0,it=M.length;q<it;q++){let ut=M[q];if(m(ut)){let nt=A(R),Lt=n.get(ut).__webglTexture;e.bindTexture(nt,Lt),d(nt),e.unbindTexture()}}}let ot=[],P=[];function ht(R){if(R.samples>0){if(bt(R)===!1){let M=R.textures,q=R.width,it=R.height,ut=i.COLOR_BUFFER_BIT,nt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Lt=n.get(R),Et=M.length>1;if(Et)for(let Pt=0;Pt<M.length;Pt++)e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglFramebuffer);for(let Pt=0;Pt<M.length;Pt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(ut|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(ut|=i.STENCIL_BUFFER_BIT)),Et){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[Pt]);let Zt=n.get(M[Pt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Zt,0)}i.blitFramebuffer(0,0,q,it,0,0,q,it,ut,i.NEAREST),l===!0&&(ot.length=0,P.length=0,ot.push(i.COLOR_ATTACHMENT0+Pt),R.depthBuffer&&R.resolveDepthBuffer===!1&&(ot.push(nt),P.push(nt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,P)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ot))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Et)for(let Pt=0;Pt<M.length;Pt++){e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pt,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[Pt]);let Zt=n.get(M[Pt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pt,i.TEXTURE_2D,Zt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let M=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function ct(R){return Math.min(s.maxSamples,R.samples)}function bt(R){let M=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function St(R){let M=a.render.frame;h.get(R)!==M&&(h.set(R,M),R.update())}function Bt(R,M){let q=R.colorSpace,it=R.format,ut=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||q!==ss&&q!==qn&&(Kt.getTransfer(q)===re?(it!==cn||ut!==Un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",q)),M}function Ct(R){return typeof HTMLImageElement!="undefined"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame!="undefined"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=U,this.setTexture2D=tt,this.setTexture2DArray=Z,this.setTexture3D=at,this.setTextureCube=Q,this.rebindTextures=K,this.setupRenderTarget=ft,this.updateRenderTargetMipmap=X,this.updateMultisampleRenderTarget=ht,this.setupDepthRenderbuffer=$,this.setupFrameBufferTexture=H,this.useMultisampledRTT=bt}function km(i,t){function e(n,s=qn){let r,a=Kt.getTransfer(s);if(n===Un)return i.UNSIGNED_BYTE;if(n===bl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===El)return i.UNSIGNED_SHORT_5_5_5_1;if(n===hh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===lh)return i.BYTE;if(n===ch)return i.SHORT;if(n===Rs)return i.UNSIGNED_SHORT;if(n===Sl)return i.INT;if(n===pi)return i.UNSIGNED_INT;if(n===_n)return i.FLOAT;if(n===fn)return i.HALF_FLOAT;if(n===uh)return i.ALPHA;if(n===fh)return i.RGB;if(n===cn)return i.RGBA;if(n===dh)return i.LUMINANCE;if(n===ph)return i.LUMINANCE_ALPHA;if(n===Gi)return i.DEPTH_COMPONENT;if(n===$i)return i.DEPTH_STENCIL;if(n===Tl)return i.RED;if(n===wl)return i.RED_INTEGER;if(n===mh)return i.RG;if(n===Al)return i.RG_INTEGER;if(n===Rl)return i.RGBA_INTEGER;if(n===yr||n===Mr||n===Sr||n===br)if(a===re)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===yr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===yr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Mr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Sr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===br)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===io||n===so||n===ro||n===ao)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===io)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===so)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ro)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ao)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===oo||n===lo||n===co)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===oo||n===lo)return a===re?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===co)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ho||n===uo||n===fo||n===po||n===mo||n===go||n===_o||n===vo||n===xo||n===yo||n===Mo||n===So||n===bo||n===Eo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ho)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===uo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===fo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===po)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===mo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===go)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===_o)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===vo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===xo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===yo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Mo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===So)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===bo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Eo)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Er||n===To||n===wo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Er)return a===re?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===To)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===wo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===gh||n===Ao||n===Ro||n===Co)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Er)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ao)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ro)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Co)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ji?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Wo=class extends Oe{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Pe=class extends Be{constructor(){super(),this.isGroup=!0,this.type="Group"}},Hm={type:"move"},Es=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Pe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Pe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Pe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let y of t.hand.values()){let m=e.getJointPose(y,n),d=this._getHandJoint(c,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,_=.005;c.inputState.pinching&&f>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Hm)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Pe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Vm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Gm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Xo=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new Ye,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new pe({vertexShader:Vm,fragmentShader:Gm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ne(new Sn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},qo=class extends Jn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,_=null,y=new Xo,m=e.getContextAttributes(),d=null,A=null,S=[],v=[],I=new yt,w=null,C=new Oe;C.viewport=new oe;let E=new Oe;E.viewport=new oe;let g=[C,E],x=new Wo,T=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(rt){let F=S[rt];return F===void 0&&(F=new Es,S[rt]=F),F.getTargetRaySpace()},this.getControllerGrip=function(rt){let F=S[rt];return F===void 0&&(F=new Es,S[rt]=F),F.getGripSpace()},this.getHand=function(rt){let F=S[rt];return F===void 0&&(F=new Es,S[rt]=F),F.getHandSpace()};function O(rt){let F=v.indexOf(rt.inputSource);if(F===-1)return;let H=S[F];H!==void 0&&(H.update(rt.inputSource,rt.frame,c||a),H.dispatchEvent({type:rt.type,data:rt.inputSource}))}function V(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",tt);for(let rt=0;rt<S.length;rt++){let F=v[rt];F!==null&&(v[rt]=null,S[rt].disconnect(F))}T=null,U=null,y.reset(),t.setRenderTarget(d),p=null,f=null,u=null,s=null,A=null,Xt.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(rt){r=rt,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(rt){o=rt,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(rt){c=rt},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(rt){if(s=rt,s!==null){if(d=t.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",V),s.addEventListener("inputsourceschange",tt),m.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(I),s.renderState.layers===void 0){let F={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,F),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),A=new He(p.framebufferWidth,p.framebufferHeight,{format:cn,type:Un,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let F=null,H=null,L=null;m.depth&&(L=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,F=m.stencil?$i:Gi,H=m.stencil?Ji:pi);let W={colorFormat:e.RGBA8,depthFormat:L,scaleFactor:r};u=new XRWebGLBinding(s,e),f=u.createProjectionLayer(W),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),A=new He(f.textureWidth,f.textureHeight,{format:cn,type:Un,depthTexture:new Fr(f.textureWidth,f.textureHeight,H,void 0,void 0,void 0,void 0,void 0,void 0,F),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Xt.setContext(s),Xt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function tt(rt){for(let F=0;F<rt.removed.length;F++){let H=rt.removed[F],L=v.indexOf(H);L>=0&&(v[L]=null,S[L].disconnect(H))}for(let F=0;F<rt.added.length;F++){let H=rt.added[F],L=v.indexOf(H);if(L===-1){for(let $=0;$<S.length;$++)if($>=v.length){v.push(H),L=$;break}else if(v[$]===null){v[$]=H,L=$;break}if(L===-1)break}let W=S[L];W&&W.connect(H)}}let Z=new N,at=new N;function Q(rt,F,H){Z.setFromMatrixPosition(F.matrixWorld),at.setFromMatrixPosition(H.matrixWorld);let L=Z.distanceTo(at),W=F.projectionMatrix.elements,$=H.projectionMatrix.elements,K=W[14]/(W[10]-1),ft=W[14]/(W[10]+1),X=(W[9]+1)/W[5],ot=(W[9]-1)/W[5],P=(W[8]-1)/W[0],ht=($[8]+1)/$[0],ct=K*P,bt=K*ht,St=L/(-P+ht),Bt=St*-P;if(F.matrixWorld.decompose(rt.position,rt.quaternion,rt.scale),rt.translateX(Bt),rt.translateZ(St),rt.matrixWorld.compose(rt.position,rt.quaternion,rt.scale),rt.matrixWorldInverse.copy(rt.matrixWorld).invert(),W[10]===-1)rt.projectionMatrix.copy(F.projectionMatrix),rt.projectionMatrixInverse.copy(F.projectionMatrixInverse);else{let Ct=K+St,R=ft+St,M=ct-Bt,q=bt+(L-Bt),it=X*ft/R*Ct,ut=ot*ft/R*Ct;rt.projectionMatrix.makePerspective(M,q,it,ut,Ct,R),rt.projectionMatrixInverse.copy(rt.projectionMatrix).invert()}}function vt(rt,F){F===null?rt.matrixWorld.copy(rt.matrix):rt.matrixWorld.multiplyMatrices(F.matrixWorld,rt.matrix),rt.matrixWorldInverse.copy(rt.matrixWorld).invert()}this.updateCamera=function(rt){if(s===null)return;let F=rt.near,H=rt.far;y.texture!==null&&(y.depthNear>0&&(F=y.depthNear),y.depthFar>0&&(H=y.depthFar)),x.near=E.near=C.near=F,x.far=E.far=C.far=H,(T!==x.near||U!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),T=x.near,U=x.far),C.layers.mask=rt.layers.mask|2,E.layers.mask=rt.layers.mask|4,x.layers.mask=C.layers.mask|E.layers.mask;let L=rt.parent,W=x.cameras;vt(x,L);for(let $=0;$<W.length;$++)vt(W[$],L);W.length===2?Q(x,C,E):x.projectionMatrix.copy(C.projectionMatrix),Mt(rt,x,L)};function Mt(rt,F,H){H===null?rt.matrix.copy(F.matrixWorld):(rt.matrix.copy(H.matrixWorld),rt.matrix.invert(),rt.matrix.multiply(F.matrixWorld)),rt.matrix.decompose(rt.position,rt.quaternion,rt.scale),rt.updateMatrixWorld(!0),rt.projectionMatrix.copy(F.projectionMatrix),rt.projectionMatrixInverse.copy(F.projectionMatrixInverse),rt.isPerspectiveCamera&&(rt.fov=Cs*2*Math.atan(1/rt.projectionMatrix.elements[5]),rt.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(rt){l=rt,f!==null&&(f.fixedFoveation=rt),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=rt)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(x)};let wt=null;function kt(rt,F){if(h=F.getViewerPose(c||a),_=F,h!==null){let H=h.views;p!==null&&(t.setRenderTargetFramebuffer(A,p.framebuffer),t.setRenderTarget(A));let L=!1;H.length!==x.cameras.length&&(x.cameras.length=0,L=!0);for(let $=0;$<H.length;$++){let K=H[$],ft=null;if(p!==null)ft=p.getViewport(K);else{let ot=u.getViewSubImage(f,K);ft=ot.viewport,$===0&&(t.setRenderTargetTextures(A,ot.colorTexture,f.ignoreDepthValues?void 0:ot.depthStencilTexture),t.setRenderTarget(A))}let X=g[$];X===void 0&&(X=new Oe,X.layers.enable($),X.viewport=new oe,g[$]=X),X.matrix.fromArray(K.transform.matrix),X.matrix.decompose(X.position,X.quaternion,X.scale),X.projectionMatrix.fromArray(K.projectionMatrix),X.projectionMatrixInverse.copy(X.projectionMatrix).invert(),X.viewport.set(ft.x,ft.y,ft.width,ft.height),$===0&&(x.matrix.copy(X.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),L===!0&&x.cameras.push(X)}let W=s.enabledFeatures;if(W&&W.includes("depth-sensing")){let $=u.getDepthInformation(H[0]);$&&$.isValid&&$.texture&&y.init(t,$,s.renderState)}}for(let H=0;H<S.length;H++){let L=v[H],W=S[H];L!==null&&W!==void 0&&W.update(L,F,c||a)}wt&&wt(rt,F),F.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:F}),_=null}let Xt=new bh;Xt.setAnimationLoop(kt),this.setAnimationLoop=function(rt){wt=rt},this.dispose=function(){}}},oi=new yn,Wm=new ae;function Xm(i,t){function e(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,Sh(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,A,S,v){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,v)):d.isMeshMatcapMaterial?(r(m,d),_(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),y(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,A,S):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,e(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Xe&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,e(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Xe&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,e(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,e(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let A=t.get(d),S=A.envMap,v=A.envMapRotation;S&&(m.envMap.value=S,oi.copy(v),oi.x*=-1,oi.y*=-1,oi.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(oi.y*=-1,oi.z*=-1),m.envMapRotation.value.setFromMatrix4(Wm.makeRotationFromEuler(oi)),m.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,A,S){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*A,m.scale.value=S*.5,d.map&&(m.map.value=d.map,e(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,A){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Xe&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=A.texture,m.transmissionSamplerSize.value.set(A.width,A.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){let A=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(A.matrixWorld),m.nearDistance.value=A.shadow.camera.near,m.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function qm(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(A,S){let v=S.program;n.uniformBlockBinding(A,v)}function c(A,S){let v=s[A.id];v===void 0&&(_(A),v=h(A),s[A.id]=v,A.addEventListener("dispose",m));let I=S.program;n.updateUBOMapping(A,I);let w=t.render.frame;r[A.id]!==w&&(f(A),r[A.id]=w)}function h(A){let S=u();A.__bindingPointIndex=S;let v=i.createBuffer(),I=A.__size,w=A.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,I,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,v),v}function u(){for(let A=0;A<o;A++)if(a.indexOf(A)===-1)return a.push(A),A;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(A){let S=s[A.id],v=A.uniforms,I=A.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let w=0,C=v.length;w<C;w++){let E=Array.isArray(v[w])?v[w]:[v[w]];for(let g=0,x=E.length;g<x;g++){let T=E[g];if(p(T,w,g,I)===!0){let U=T.__offset,O=Array.isArray(T.value)?T.value:[T.value],V=0;for(let tt=0;tt<O.length;tt++){let Z=O[tt],at=y(Z);typeof Z=="number"||typeof Z=="boolean"?(T.__data[0]=Z,i.bufferSubData(i.UNIFORM_BUFFER,U+V,T.__data)):Z.isMatrix3?(T.__data[0]=Z.elements[0],T.__data[1]=Z.elements[1],T.__data[2]=Z.elements[2],T.__data[3]=0,T.__data[4]=Z.elements[3],T.__data[5]=Z.elements[4],T.__data[6]=Z.elements[5],T.__data[7]=0,T.__data[8]=Z.elements[6],T.__data[9]=Z.elements[7],T.__data[10]=Z.elements[8],T.__data[11]=0):(Z.toArray(T.__data,V),V+=at.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,U,T.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(A,S,v,I){let w=A.value,C=S+"_"+v;if(I[C]===void 0)return typeof w=="number"||typeof w=="boolean"?I[C]=w:I[C]=w.clone(),!0;{let E=I[C];if(typeof w=="number"||typeof w=="boolean"){if(E!==w)return I[C]=w,!0}else if(E.equals(w)===!1)return E.copy(w),!0}return!1}function _(A){let S=A.uniforms,v=0,I=16;for(let C=0,E=S.length;C<E;C++){let g=Array.isArray(S[C])?S[C]:[S[C]];for(let x=0,T=g.length;x<T;x++){let U=g[x],O=Array.isArray(U.value)?U.value:[U.value];for(let V=0,tt=O.length;V<tt;V++){let Z=O[V],at=y(Z),Q=v%I,vt=Q%at.boundary,Mt=Q+vt;v+=vt,Mt!==0&&I-Mt<at.storage&&(v+=I-Mt),U.__data=new Float32Array(at.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=v,v+=at.storage}}}let w=v%I;return w>0&&(v+=I-w),A.__size=v,A.__cache={},this}function y(A){let S={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(S.boundary=4,S.storage=4):A.isVector2?(S.boundary=8,S.storage=8):A.isVector3||A.isColor?(S.boundary=16,S.storage=12):A.isVector4?(S.boundary=16,S.storage=16):A.isMatrix3?(S.boundary=48,S.storage=48):A.isMatrix4?(S.boundary=64,S.storage=64):A.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",A),S}function m(A){let S=A.target;S.removeEventListener("dispose",m);let v=a.indexOf(S.__bindingPointIndex);a.splice(v,1),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function d(){for(let A in s)i.deleteBuffer(s[A]);a=[],s={},r={}}return{bind:l,update:c,dispose:d}}var Or=class{constructor(t={}){let{canvas:e=$u(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;let _=new Uint32Array(4),y=new Int32Array(4),m=null,d=null,A=[],S=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ge,this.toneMapping=Yn,this.toneMappingExposure=1;let v=this,I=!1,w=0,C=0,E=null,g=-1,x=null,T=new oe,U=new oe,O=null,V=new Ht(0),tt=0,Z=e.width,at=e.height,Q=1,vt=null,Mt=null,wt=new oe(0,0,Z,at),kt=new oe(0,0,Z,at),Xt=!1,rt=new Is,F=!1,H=!1,L=new ae,W=new ae,$=new N,K=new oe,ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},X=!1;function ot(){return E===null?Q:1}let P=n;function ht(b,B){return e.getContext(b,B)}try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${gl}`),e.addEventListener("webglcontextlost",j,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",gt,!1),P===null){let B="webgl2";if(P=ht(B,b),P===null)throw ht(B)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let ct,bt,St,Bt,Ct,R,M,q,it,ut,nt,Lt,Et,Pt,Zt,G,st,lt,dt,pt,It,_t,zt,D;function et(){ct=new l0(P),ct.init(),_t=new km(P,ct),bt=new n0(P,ct,t,_t),St=new Om(P,ct),bt.reverseDepthBuffer&&f&&St.buffers.depth.setReversed(!0),Bt=new u0(P),Ct=new Em,R=new zm(P,ct,St,Ct,bt,_t,Bt),M=new s0(v),q=new o0(v),it=new vf(P),zt=new t0(P,it),ut=new c0(P,it,Bt,zt),nt=new d0(P,ut,it,Bt),dt=new f0(P,bt,R),G=new i0(Ct),Lt=new bm(v,M,q,ct,bt,zt,G),Et=new Xm(v,Ct),Pt=new wm,Zt=new Lm(ct),lt=new jp(v,M,q,St,nt,p,l),st=new Nm(v,nt,bt),D=new qm(P,Bt,bt,St),pt=new e0(P,ct,Bt),It=new h0(P,ct,Bt),Bt.programs=Lt.programs,v.capabilities=bt,v.extensions=ct,v.properties=Ct,v.renderLists=Pt,v.shadowMap=st,v.state=St,v.info=Bt}et();let k=new qo(v,P);this.xr=k,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let b=ct.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=ct.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(b){b!==void 0&&(Q=b,this.setSize(Z,at,!1))},this.getSize=function(b){return b.set(Z,at)},this.setSize=function(b,B,Y=!0){if(k.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Z=b,at=B,e.width=Math.floor(b*Q),e.height=Math.floor(B*Q),Y===!0&&(e.style.width=b+"px",e.style.height=B+"px"),this.setViewport(0,0,b,B)},this.getDrawingBufferSize=function(b){return b.set(Z*Q,at*Q).floor()},this.setDrawingBufferSize=function(b,B,Y){Z=b,at=B,Q=Y,e.width=Math.floor(b*Y),e.height=Math.floor(B*Y),this.setViewport(0,0,b,B)},this.getCurrentViewport=function(b){return b.copy(T)},this.getViewport=function(b){return b.copy(wt)},this.setViewport=function(b,B,Y,J){b.isVector4?wt.set(b.x,b.y,b.z,b.w):wt.set(b,B,Y,J),St.viewport(T.copy(wt).multiplyScalar(Q).round())},this.getScissor=function(b){return b.copy(kt)},this.setScissor=function(b,B,Y,J){b.isVector4?kt.set(b.x,b.y,b.z,b.w):kt.set(b,B,Y,J),St.scissor(U.copy(kt).multiplyScalar(Q).round())},this.getScissorTest=function(){return Xt},this.setScissorTest=function(b){St.setScissorTest(Xt=b)},this.setOpaqueSort=function(b){vt=b},this.setTransparentSort=function(b){Mt=b},this.getClearColor=function(b){return b.copy(lt.getClearColor())},this.setClearColor=function(){lt.setClearColor.apply(lt,arguments)},this.getClearAlpha=function(){return lt.getClearAlpha()},this.setClearAlpha=function(){lt.setClearAlpha.apply(lt,arguments)},this.clear=function(b=!0,B=!0,Y=!0){let J=0;if(b){let z=!1;if(E!==null){let xt=E.texture.format;z=xt===Rl||xt===Al||xt===wl}if(z){let xt=E.texture.type,Rt=xt===Un||xt===pi||xt===Rs||xt===Ji||xt===bl||xt===El,Dt=lt.getClearColor(),Ut=lt.getClearAlpha(),Vt=Dt.r,Gt=Dt.g,Ft=Dt.b;Rt?(_[0]=Vt,_[1]=Gt,_[2]=Ft,_[3]=Ut,P.clearBufferuiv(P.COLOR,0,_)):(y[0]=Vt,y[1]=Gt,y[2]=Ft,y[3]=Ut,P.clearBufferiv(P.COLOR,0,y))}else J|=P.COLOR_BUFFER_BIT}B&&(J|=P.DEPTH_BUFFER_BIT),Y&&(J|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(J)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",j,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),Pt.dispose(),Zt.dispose(),Ct.dispose(),M.dispose(),q.dispose(),nt.dispose(),zt.dispose(),D.dispose(),Lt.dispose(),k.dispose(),k.removeEventListener("sessionstart",ve),k.removeEventListener("sessionend",dn),Ee.stop()};function j(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;let b=Bt.autoReset,B=st.enabled,Y=st.autoUpdate,J=st.needsUpdate,z=st.type;et(),Bt.autoReset=b,st.enabled=B,st.autoUpdate=Y,st.needsUpdate=J,st.type=z}function gt(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function At(b){let B=b.target;B.removeEventListener("dispose",At),Jt(B)}function Jt(b){le(b),Ct.remove(b)}function le(b){let B=Ct.get(b).programs;B!==void 0&&(B.forEach(function(Y){Lt.releaseProgram(Y)}),b.isShaderMaterial&&Lt.releaseShaderCache(b))}this.renderBufferDirect=function(b,B,Y,J,z,xt){B===null&&(B=ft);let Rt=z.isMesh&&z.matrixWorld.determinant()<0,Dt=Re(b,B,Y,J,z);St.setMaterial(J,Rt);let Ut=Y.index,Vt=1;if(J.wireframe===!0){if(Ut=ut.getWireframeAttribute(Y),Ut===void 0)return;Vt=2}let Gt=Y.drawRange,Ft=Y.attributes.position,te=Gt.start*Vt,ce=(Gt.start+Gt.count)*Vt;xt!==null&&(te=Math.max(te,xt.start*Vt),ce=Math.min(ce,(xt.start+xt.count)*Vt)),Ut!==null?(te=Math.max(te,0),ce=Math.min(ce,Ut.count)):Ft!=null&&(te=Math.max(te,0),ce=Math.min(ce,Ft.count));let fe=ce-te;if(fe<0||fe===1/0)return;zt.setup(z,J,Dt,Y,Ut);let Ve,ie=pt;if(Ut!==null&&(Ve=it.get(Ut),ie=It,ie.setIndex(Ve)),z.isMesh)J.wireframe===!0?(St.setLineWidth(J.wireframeLinewidth*ot()),ie.setMode(P.LINES)):ie.setMode(P.TRIANGLES);else if(z.isLine){let Ot=J.linewidth;Ot===void 0&&(Ot=1),St.setLineWidth(Ot*ot()),z.isLineSegments?ie.setMode(P.LINES):z.isLineLoop?ie.setMode(P.LINE_LOOP):ie.setMode(P.LINE_STRIP)}else z.isPoints?ie.setMode(P.POINTS):z.isSprite&&ie.setMode(P.TRIANGLES);if(z.isBatchedMesh)if(z._multiDrawInstances!==null)ie.renderMultiDrawInstances(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount,z._multiDrawInstances);else if(ct.get("WEBGL_multi_draw"))ie.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let Ot=z._multiDrawStarts,En=z._multiDrawCounts,se=z._multiDrawCount,rn=Ut?it.get(Ut).bytesPerElement:1,bi=Ct.get(J).currentProgram.getUniforms();for(let Je=0;Je<se;Je++)bi.setValue(P,"_gl_DrawID",Je),ie.render(Ot[Je]/rn,En[Je])}else if(z.isInstancedMesh)ie.renderInstances(te,fe,z.count);else if(Y.isInstancedBufferGeometry){let Ot=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,En=Math.min(Y.instanceCount,Ot);ie.renderInstances(te,fe,En)}else ie.render(te,fe)};function $t(b,B,Y){b.transparent===!0&&b.side===We&&b.forceSinglePass===!1?(b.side=Xe,b.needsUpdate=!0,Me(b,B,Y),b.side=Zn,b.needsUpdate=!0,Me(b,B,Y),b.side=We):Me(b,B,Y)}this.compile=function(b,B,Y=null){Y===null&&(Y=b),d=Zt.get(Y),d.init(B),S.push(d),Y.traverseVisible(function(z){z.isLight&&z.layers.test(B.layers)&&(d.pushLight(z),z.castShadow&&d.pushShadow(z))}),b!==Y&&b.traverseVisible(function(z){z.isLight&&z.layers.test(B.layers)&&(d.pushLight(z),z.castShadow&&d.pushShadow(z))}),d.setupLights();let J=new Set;return b.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let xt=z.material;if(xt)if(Array.isArray(xt))for(let Rt=0;Rt<xt.length;Rt++){let Dt=xt[Rt];$t(Dt,Y,z),J.add(Dt)}else $t(xt,Y,z),J.add(xt)}),S.pop(),d=null,J},this.compileAsync=function(b,B,Y=null){let J=this.compile(b,B,Y);return new Promise(z=>{function xt(){if(J.forEach(function(Rt){Ct.get(Rt).currentProgram.isReady()&&J.delete(Rt)}),J.size===0){z(b);return}setTimeout(xt,10)}ct.get("KHR_parallel_shader_compile")!==null?xt():setTimeout(xt,10)})};let Ie=null;function Qt(b){Ie&&Ie(b)}function ve(){Ee.stop()}function dn(){Ee.start()}let Ee=new bh;Ee.setAnimationLoop(Qt),typeof self!="undefined"&&Ee.setContext(self),this.setAnimationLoop=function(b){Ie=b,k.setAnimationLoop(b),b===null?Ee.stop():Ee.start()},k.addEventListener("sessionstart",ve),k.addEventListener("sessionend",dn),this.render=function(b,B){if(B!==void 0&&B.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),k.enabled===!0&&k.isPresenting===!0&&(k.cameraAutoUpdate===!0&&k.updateCamera(B),B=k.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,B,E),d=Zt.get(b,S.length),d.init(B),S.push(d),W.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),rt.setFromProjectionMatrix(W),H=this.localClippingEnabled,F=G.init(this.clippingPlanes,H),m=Pt.get(b,A.length),m.init(),A.push(m),k.enabled===!0&&k.isPresenting===!0){let xt=v.xr.getDepthSensingMesh();xt!==null&&Nt(xt,B,-1/0,v.sortObjects)}Nt(b,B,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(vt,Mt),X=k.enabled===!1||k.isPresenting===!1||k.hasDepthSensing()===!1,X&&lt.addToRenderList(m,b),this.info.render.frame++,F===!0&&G.beginShadows();let Y=d.state.shadowsArray;st.render(Y,b,B),F===!0&&G.endShadows(),this.info.autoReset===!0&&this.info.reset();let J=m.opaque,z=m.transmissive;if(d.setupLights(),B.isArrayCamera){let xt=B.cameras;if(z.length>0)for(let Rt=0,Dt=xt.length;Rt<Dt;Rt++){let Ut=xt[Rt];me(J,z,b,Ut)}X&&lt.render(b);for(let Rt=0,Dt=xt.length;Rt<Dt;Rt++){let Ut=xt[Rt];jt(m,b,Ut,Ut.viewport)}}else z.length>0&&me(J,z,b,B),X&&lt.render(b),jt(m,b,B);E!==null&&(R.updateMultisampleRenderTarget(E),R.updateRenderTargetMipmap(E)),b.isScene===!0&&b.onAfterRender(v,b,B),zt.resetDefaultState(),g=-1,x=null,S.pop(),S.length>0?(d=S[S.length-1],F===!0&&G.setGlobalState(v.clippingPlanes,d.state.camera)):d=null,A.pop(),A.length>0?m=A[A.length-1]:m=null};function Nt(b,B,Y,J){if(b.visible===!1)return;if(b.layers.test(B.layers)){if(b.isGroup)Y=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(B);else if(b.isLight)d.pushLight(b),b.castShadow&&d.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||rt.intersectsSprite(b)){J&&K.setFromMatrixPosition(b.matrixWorld).applyMatrix4(W);let Rt=nt.update(b),Dt=b.material;Dt.visible&&m.push(b,Rt,Dt,Y,K.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||rt.intersectsObject(b))){let Rt=nt.update(b),Dt=b.material;if(J&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),K.copy(b.boundingSphere.center)):(Rt.boundingSphere===null&&Rt.computeBoundingSphere(),K.copy(Rt.boundingSphere.center)),K.applyMatrix4(b.matrixWorld).applyMatrix4(W)),Array.isArray(Dt)){let Ut=Rt.groups;for(let Vt=0,Gt=Ut.length;Vt<Gt;Vt++){let Ft=Ut[Vt],te=Dt[Ft.materialIndex];te&&te.visible&&m.push(b,Rt,te,Y,K.z,Ft)}}else Dt.visible&&m.push(b,Rt,Dt,Y,K.z,null)}}let xt=b.children;for(let Rt=0,Dt=xt.length;Rt<Dt;Rt++)Nt(xt[Rt],B,Y,J)}function jt(b,B,Y,J){let z=b.opaque,xt=b.transmissive,Rt=b.transparent;d.setupLightsView(Y),F===!0&&G.setGlobalState(v.clippingPlanes,Y),J&&St.viewport(T.copy(J)),z.length>0&&ee(z,B,Y),xt.length>0&&ee(xt,B,Y),Rt.length>0&&ee(Rt,B,Y),St.buffers.depth.setTest(!0),St.buffers.depth.setMask(!0),St.buffers.color.setMask(!0),St.setPolygonOffset(!1)}function me(b,B,Y,J){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[J.id]===void 0&&(d.state.transmissionRenderTarget[J.id]=new He(1,1,{generateMipmaps:!0,type:ct.has("EXT_color_buffer_half_float")||ct.has("EXT_color_buffer_float")?fn:Un,minFilter:di,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Kt.workingColorSpace}));let xt=d.state.transmissionRenderTarget[J.id],Rt=J.viewport||T;xt.setSize(Rt.z,Rt.w);let Dt=v.getRenderTarget();v.setRenderTarget(xt),v.getClearColor(V),tt=v.getClearAlpha(),tt<1&&v.setClearColor(16777215,.5),v.clear(),X&&lt.render(Y);let Ut=v.toneMapping;v.toneMapping=Yn;let Vt=J.viewport;if(J.viewport!==void 0&&(J.viewport=void 0),d.setupLightsView(J),F===!0&&G.setGlobalState(v.clippingPlanes,J),ee(b,Y,J),R.updateMultisampleRenderTarget(xt),R.updateRenderTargetMipmap(xt),ct.has("WEBGL_multisampled_render_to_texture")===!1){let Gt=!1;for(let Ft=0,te=B.length;Ft<te;Ft++){let ce=B[Ft],fe=ce.object,Ve=ce.geometry,ie=ce.material,Ot=ce.group;if(ie.side===We&&fe.layers.test(J.layers)){let En=ie.side;ie.side=Xe,ie.needsUpdate=!0,ge(fe,Y,J,Ve,ie,Ot),ie.side=En,ie.needsUpdate=!0,Gt=!0}}Gt===!0&&(R.updateMultisampleRenderTarget(xt),R.updateRenderTargetMipmap(xt))}v.setRenderTarget(Dt),v.setClearColor(V,tt),Vt!==void 0&&(J.viewport=Vt),v.toneMapping=Ut}function ee(b,B,Y){let J=B.isScene===!0?B.overrideMaterial:null;for(let z=0,xt=b.length;z<xt;z++){let Rt=b[z],Dt=Rt.object,Ut=Rt.geometry,Vt=J===null?Rt.material:J,Gt=Rt.group;Dt.layers.test(Y.layers)&&ge(Dt,B,Y,Ut,Vt,Gt)}}function ge(b,B,Y,J,z,xt){b.onBeforeRender(v,B,Y,J,z,xt),b.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),z.onBeforeRender(v,B,Y,J,b,xt),z.transparent===!0&&z.side===We&&z.forceSinglePass===!1?(z.side=Xe,z.needsUpdate=!0,v.renderBufferDirect(Y,B,J,z,b,xt),z.side=Zn,z.needsUpdate=!0,v.renderBufferDirect(Y,B,J,z,b,xt),z.side=We):v.renderBufferDirect(Y,B,J,z,b,xt),b.onAfterRender(v,B,Y,J,z,xt)}function Me(b,B,Y){B.isScene!==!0&&(B=ft);let J=Ct.get(b),z=d.state.lights,xt=d.state.shadowsArray,Rt=z.state.version,Dt=Lt.getParameters(b,z.state,xt,B,Y),Ut=Lt.getProgramCacheKey(Dt),Vt=J.programs;J.environment=b.isMeshStandardMaterial?B.environment:null,J.fog=B.fog,J.envMap=(b.isMeshStandardMaterial?q:M).get(b.envMap||J.environment),J.envMapRotation=J.environment!==null&&b.envMap===null?B.environmentRotation:b.envMapRotation,Vt===void 0&&(b.addEventListener("dispose",At),Vt=new Map,J.programs=Vt);let Gt=Vt.get(Ut);if(Gt!==void 0){if(J.currentProgram===Gt&&J.lightsStateVersion===Rt)return ue(b,Dt),Gt}else Dt.uniforms=Lt.getUniforms(b),b.onBeforeCompile(Dt,v),Gt=Lt.acquireProgram(Dt,Ut),Vt.set(Ut,Gt),J.uniforms=Dt.uniforms;let Ft=J.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ft.clippingPlanes=G.uniform),ue(b,Dt),J.needsLights=Ue(b),J.lightsStateVersion=Rt,J.needsLights&&(Ft.ambientLightColor.value=z.state.ambient,Ft.lightProbe.value=z.state.probe,Ft.directionalLights.value=z.state.directional,Ft.directionalLightShadows.value=z.state.directionalShadow,Ft.spotLights.value=z.state.spot,Ft.spotLightShadows.value=z.state.spotShadow,Ft.rectAreaLights.value=z.state.rectArea,Ft.ltc_1.value=z.state.rectAreaLTC1,Ft.ltc_2.value=z.state.rectAreaLTC2,Ft.pointLights.value=z.state.point,Ft.pointLightShadows.value=z.state.pointShadow,Ft.hemisphereLights.value=z.state.hemi,Ft.directionalShadowMap.value=z.state.directionalShadowMap,Ft.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Ft.spotShadowMap.value=z.state.spotShadowMap,Ft.spotLightMatrix.value=z.state.spotLightMatrix,Ft.spotLightMap.value=z.state.spotLightMap,Ft.pointShadowMap.value=z.state.pointShadowMap,Ft.pointShadowMatrix.value=z.state.pointShadowMatrix),J.currentProgram=Gt,J.uniformsList=null,Gt}function Ae(b){if(b.uniformsList===null){let B=b.currentProgram.getUniforms();b.uniformsList=Xi.seqWithValue(B.seq,b.uniforms)}return b.uniformsList}function ue(b,B){let Y=Ct.get(b);Y.outputColorSpace=B.outputColorSpace,Y.batching=B.batching,Y.batchingColor=B.batchingColor,Y.instancing=B.instancing,Y.instancingColor=B.instancingColor,Y.instancingMorph=B.instancingMorph,Y.skinning=B.skinning,Y.morphTargets=B.morphTargets,Y.morphNormals=B.morphNormals,Y.morphColors=B.morphColors,Y.morphTargetsCount=B.morphTargetsCount,Y.numClippingPlanes=B.numClippingPlanes,Y.numIntersection=B.numClipIntersection,Y.vertexAlphas=B.vertexAlphas,Y.vertexTangents=B.vertexTangents,Y.toneMapping=B.toneMapping}function Re(b,B,Y,J,z){B.isScene!==!0&&(B=ft),R.resetTextureUnits();let xt=B.fog,Rt=J.isMeshStandardMaterial?B.environment:null,Dt=E===null?v.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:ss,Ut=(J.isMeshStandardMaterial?q:M).get(J.envMap||Rt),Vt=J.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Gt=!!Y.attributes.tangent&&(!!J.normalMap||J.anisotropy>0),Ft=!!Y.morphAttributes.position,te=!!Y.morphAttributes.normal,ce=!!Y.morphAttributes.color,fe=Yn;J.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(fe=v.toneMapping);let Ve=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,ie=Ve!==void 0?Ve.length:0,Ot=Ct.get(J),En=d.state.lights;if(F===!0&&(H===!0||b!==x)){let tn=b===x&&J.id===g;G.setState(J,b,tn)}let se=!1;J.version===Ot.__version?(Ot.needsLights&&Ot.lightsStateVersion!==En.state.version||Ot.outputColorSpace!==Dt||z.isBatchedMesh&&Ot.batching===!1||!z.isBatchedMesh&&Ot.batching===!0||z.isBatchedMesh&&Ot.batchingColor===!0&&z.colorTexture===null||z.isBatchedMesh&&Ot.batchingColor===!1&&z.colorTexture!==null||z.isInstancedMesh&&Ot.instancing===!1||!z.isInstancedMesh&&Ot.instancing===!0||z.isSkinnedMesh&&Ot.skinning===!1||!z.isSkinnedMesh&&Ot.skinning===!0||z.isInstancedMesh&&Ot.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&Ot.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&Ot.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&Ot.instancingMorph===!1&&z.morphTexture!==null||Ot.envMap!==Ut||J.fog===!0&&Ot.fog!==xt||Ot.numClippingPlanes!==void 0&&(Ot.numClippingPlanes!==G.numPlanes||Ot.numIntersection!==G.numIntersection)||Ot.vertexAlphas!==Vt||Ot.vertexTangents!==Gt||Ot.morphTargets!==Ft||Ot.morphNormals!==te||Ot.morphColors!==ce||Ot.toneMapping!==fe||Ot.morphTargetsCount!==ie)&&(se=!0):(se=!0,Ot.__version=J.version);let rn=Ot.currentProgram;se===!0&&(rn=Me(J,B,z));let bi=!1,Je=!1,hs=!1,de=rn.getUniforms(),pn=Ot.uniforms;if(St.useProgram(rn.program)&&(bi=!0,Je=!0,hs=!0),J.id!==g&&(g=J.id,Je=!0),bi||x!==b){St.buffers.depth.getReversed()?(L.copy(b.projectionMatrix),Qu(L),ju(L),de.setValue(P,"projectionMatrix",L)):de.setValue(P,"projectionMatrix",b.projectionMatrix),de.setValue(P,"viewMatrix",b.matrixWorldInverse);let Bn=de.map.cameraPosition;Bn!==void 0&&Bn.setValue(P,$.setFromMatrixPosition(b.matrixWorld)),bt.logarithmicDepthBuffer&&de.setValue(P,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(J.isMeshPhongMaterial||J.isMeshToonMaterial||J.isMeshLambertMaterial||J.isMeshBasicMaterial||J.isMeshStandardMaterial||J.isShaderMaterial)&&de.setValue(P,"isOrthographic",b.isOrthographicCamera===!0),x!==b&&(x=b,Je=!0,hs=!0)}if(z.isSkinnedMesh){de.setOptional(P,z,"bindMatrix"),de.setOptional(P,z,"bindMatrixInverse");let tn=z.skeleton;tn&&(tn.boneTexture===null&&tn.computeBoneTexture(),de.setValue(P,"boneTexture",tn.boneTexture,R))}z.isBatchedMesh&&(de.setOptional(P,z,"batchingTexture"),de.setValue(P,"batchingTexture",z._matricesTexture,R),de.setOptional(P,z,"batchingIdTexture"),de.setValue(P,"batchingIdTexture",z._indirectTexture,R),de.setOptional(P,z,"batchingColorTexture"),z._colorsTexture!==null&&de.setValue(P,"batchingColorTexture",z._colorsTexture,R));let us=Y.morphAttributes;if((us.position!==void 0||us.normal!==void 0||us.color!==void 0)&&dt.update(z,Y,rn),(Je||Ot.receiveShadow!==z.receiveShadow)&&(Ot.receiveShadow=z.receiveShadow,de.setValue(P,"receiveShadow",z.receiveShadow)),J.isMeshGouraudMaterial&&J.envMap!==null&&(pn.envMap.value=Ut,pn.flipEnvMap.value=Ut.isCubeTexture&&Ut.isRenderTargetTexture===!1?-1:1),J.isMeshStandardMaterial&&J.envMap===null&&B.environment!==null&&(pn.envMapIntensity.value=B.environmentIntensity),Je&&(de.setValue(P,"toneMappingExposure",v.toneMappingExposure),Ot.needsLights&&De(pn,hs),xt&&J.fog===!0&&Et.refreshFogUniforms(pn,xt),Et.refreshMaterialUniforms(pn,J,Q,at,d.state.transmissionRenderTarget[b.id]),Xi.upload(P,Ae(Ot),pn,R)),J.isShaderMaterial&&J.uniformsNeedUpdate===!0&&(Xi.upload(P,Ae(Ot),pn,R),J.uniformsNeedUpdate=!1),J.isSpriteMaterial&&de.setValue(P,"center",z.center),de.setValue(P,"modelViewMatrix",z.modelViewMatrix),de.setValue(P,"normalMatrix",z.normalMatrix),de.setValue(P,"modelMatrix",z.matrixWorld),J.isShaderMaterial||J.isRawShaderMaterial){let tn=J.uniformsGroups;for(let Bn=0,zn=tn.length;Bn<zn;Bn++){let Hl=tn[Bn];D.update(Hl,rn),D.bind(Hl,rn)}}return rn}function De(b,B){b.ambientLightColor.needsUpdate=B,b.lightProbe.needsUpdate=B,b.directionalLights.needsUpdate=B,b.directionalLightShadows.needsUpdate=B,b.pointLights.needsUpdate=B,b.pointLightShadows.needsUpdate=B,b.spotLights.needsUpdate=B,b.spotLightShadows.needsUpdate=B,b.rectAreaLights.needsUpdate=B,b.hemisphereLights.needsUpdate=B}function Ue(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(b,B,Y){Ct.get(b.texture).__webglTexture=B,Ct.get(b.depthTexture).__webglTexture=Y;let J=Ct.get(b);J.__hasExternalTextures=!0,J.__autoAllocateDepthBuffer=Y===void 0,J.__autoAllocateDepthBuffer||ct.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),J.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,B){let Y=Ct.get(b);Y.__webglFramebuffer=B,Y.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(b,B=0,Y=0){E=b,w=B,C=Y;let J=!0,z=null,xt=!1,Rt=!1;if(b){let Ut=Ct.get(b);if(Ut.__useDefaultFramebuffer!==void 0)St.bindFramebuffer(P.FRAMEBUFFER,null),J=!1;else if(Ut.__webglFramebuffer===void 0)R.setupRenderTarget(b);else if(Ut.__hasExternalTextures)R.rebindTextures(b,Ct.get(b.texture).__webglTexture,Ct.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Ft=b.depthTexture;if(Ut.__boundDepthTexture!==Ft){if(Ft!==null&&Ct.has(Ft)&&(b.width!==Ft.image.width||b.height!==Ft.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(b)}}let Vt=b.texture;(Vt.isData3DTexture||Vt.isDataArrayTexture||Vt.isCompressedArrayTexture)&&(Rt=!0);let Gt=Ct.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Gt[B])?z=Gt[B][Y]:z=Gt[B],xt=!0):b.samples>0&&R.useMultisampledRTT(b)===!1?z=Ct.get(b).__webglMultisampledFramebuffer:Array.isArray(Gt)?z=Gt[Y]:z=Gt,T.copy(b.viewport),U.copy(b.scissor),O=b.scissorTest}else T.copy(wt).multiplyScalar(Q).floor(),U.copy(kt).multiplyScalar(Q).floor(),O=Xt;if(St.bindFramebuffer(P.FRAMEBUFFER,z)&&J&&St.drawBuffers(b,z),St.viewport(T),St.scissor(U),St.setScissorTest(O),xt){let Ut=Ct.get(b.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+B,Ut.__webglTexture,Y)}else if(Rt){let Ut=Ct.get(b.texture),Vt=B||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ut.__webglTexture,Y||0,Vt)}g=-1},this.readRenderTargetPixels=function(b,B,Y,J,z,xt,Rt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Dt=Ct.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Rt!==void 0&&(Dt=Dt[Rt]),Dt){St.bindFramebuffer(P.FRAMEBUFFER,Dt);try{let Ut=b.texture,Vt=Ut.format,Gt=Ut.type;if(!bt.textureFormatReadable(Vt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!bt.textureTypeReadable(Gt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=b.width-J&&Y>=0&&Y<=b.height-z&&P.readPixels(B,Y,J,z,_t.convert(Vt),_t.convert(Gt),xt)}finally{let Ut=E!==null?Ct.get(E).__webglFramebuffer:null;St.bindFramebuffer(P.FRAMEBUFFER,Ut)}}},this.readRenderTargetPixelsAsync=async function(b,B,Y,J,z,xt,Rt){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Dt=Ct.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Rt!==void 0&&(Dt=Dt[Rt]),Dt){let Ut=b.texture,Vt=Ut.format,Gt=Ut.type;if(!bt.textureFormatReadable(Vt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!bt.textureTypeReadable(Gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(B>=0&&B<=b.width-J&&Y>=0&&Y<=b.height-z){St.bindFramebuffer(P.FRAMEBUFFER,Dt);let Ft=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Ft),P.bufferData(P.PIXEL_PACK_BUFFER,xt.byteLength,P.STREAM_READ),P.readPixels(B,Y,J,z,_t.convert(Vt),_t.convert(Gt),0);let te=E!==null?Ct.get(E).__webglFramebuffer:null;St.bindFramebuffer(P.FRAMEBUFFER,te);let ce=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Ku(P,ce,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Ft),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,xt),P.deleteBuffer(Ft),P.deleteSync(ce),xt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,B=null,Y=0){b.isTexture!==!0&&(ys("WebGLRenderer: copyFramebufferToTexture function signature has changed."),B=arguments[0]||null,b=arguments[1]);let J=Math.pow(2,-Y),z=Math.floor(b.image.width*J),xt=Math.floor(b.image.height*J),Rt=B!==null?B.x:0,Dt=B!==null?B.y:0;R.setTexture2D(b,0),P.copyTexSubImage2D(P.TEXTURE_2D,Y,0,0,Rt,Dt,z,xt),St.unbindTexture()},this.copyTextureToTexture=function(b,B,Y=null,J=null,z=0){b.isTexture!==!0&&(ys("WebGLRenderer: copyTextureToTexture function signature has changed."),J=arguments[0]||null,b=arguments[1],B=arguments[2],z=arguments[3]||0,Y=null);let xt,Rt,Dt,Ut,Vt,Gt,Ft,te,ce,fe=b.isCompressedTexture?b.mipmaps[z]:b.image;Y!==null?(xt=Y.max.x-Y.min.x,Rt=Y.max.y-Y.min.y,Dt=Y.isBox3?Y.max.z-Y.min.z:1,Ut=Y.min.x,Vt=Y.min.y,Gt=Y.isBox3?Y.min.z:0):(xt=fe.width,Rt=fe.height,Dt=fe.depth||1,Ut=0,Vt=0,Gt=0),J!==null?(Ft=J.x,te=J.y,ce=J.z):(Ft=0,te=0,ce=0);let Ve=_t.convert(B.format),ie=_t.convert(B.type),Ot;B.isData3DTexture?(R.setTexture3D(B,0),Ot=P.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(R.setTexture2DArray(B,0),Ot=P.TEXTURE_2D_ARRAY):(R.setTexture2D(B,0),Ot=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,B.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,B.unpackAlignment);let En=P.getParameter(P.UNPACK_ROW_LENGTH),se=P.getParameter(P.UNPACK_IMAGE_HEIGHT),rn=P.getParameter(P.UNPACK_SKIP_PIXELS),bi=P.getParameter(P.UNPACK_SKIP_ROWS),Je=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,fe.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,fe.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Ut),P.pixelStorei(P.UNPACK_SKIP_ROWS,Vt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Gt);let hs=b.isDataArrayTexture||b.isData3DTexture,de=B.isDataArrayTexture||B.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){let pn=Ct.get(b),us=Ct.get(B),tn=Ct.get(pn.__renderTarget),Bn=Ct.get(us.__renderTarget);St.bindFramebuffer(P.READ_FRAMEBUFFER,tn.__webglFramebuffer),St.bindFramebuffer(P.DRAW_FRAMEBUFFER,Bn.__webglFramebuffer);for(let zn=0;zn<Dt;zn++)hs&&P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ct.get(b).__webglTexture,z,Gt+zn),b.isDepthTexture?(de&&P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ct.get(B).__webglTexture,z,ce+zn),P.blitFramebuffer(Ut,Vt,xt,Rt,Ft,te,xt,Rt,P.DEPTH_BUFFER_BIT,P.NEAREST)):de?P.copyTexSubImage3D(Ot,z,Ft,te,ce+zn,Ut,Vt,xt,Rt):P.copyTexSubImage2D(Ot,z,Ft,te,ce+zn,Ut,Vt,xt,Rt);St.bindFramebuffer(P.READ_FRAMEBUFFER,null),St.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else de?b.isDataTexture||b.isData3DTexture?P.texSubImage3D(Ot,z,Ft,te,ce,xt,Rt,Dt,Ve,ie,fe.data):B.isCompressedArrayTexture?P.compressedTexSubImage3D(Ot,z,Ft,te,ce,xt,Rt,Dt,Ve,fe.data):P.texSubImage3D(Ot,z,Ft,te,ce,xt,Rt,Dt,Ve,ie,fe):b.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,z,Ft,te,xt,Rt,Ve,ie,fe.data):b.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,z,Ft,te,fe.width,fe.height,Ve,fe.data):P.texSubImage2D(P.TEXTURE_2D,z,Ft,te,xt,Rt,Ve,ie,fe);P.pixelStorei(P.UNPACK_ROW_LENGTH,En),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,se),P.pixelStorei(P.UNPACK_SKIP_PIXELS,rn),P.pixelStorei(P.UNPACK_SKIP_ROWS,bi),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Je),z===0&&B.generateMipmaps&&P.generateMipmap(Ot),St.unbindTexture()},this.copyTextureToTexture3D=function(b,B,Y=null,J=null,z=0){return b.isTexture!==!0&&(ys("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Y=arguments[0]||null,J=arguments[1]||null,b=arguments[2],B=arguments[3],z=arguments[4]||0),ys('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,B,Y,J,z)},this.initRenderTarget=function(b){Ct.get(b).__webglFramebuffer===void 0&&R.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?R.setTextureCube(b,0):b.isData3DTexture?R.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?R.setTexture2DArray(b,0):R.setTexture2D(b,0),St.unbindTexture()},this.resetState=function(){w=0,C=0,E=null,St.reset(),zt.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ln}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorspace=Kt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Kt._getUnpackColorSpace()}};var Br=class extends Be{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new yn,this.environmentIntensity=1,this.environmentRotation=new yn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var Yo=class extends Ye{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Qe,h=Qe,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var zr=class extends be{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Bi=new ae,Gc=new ae,ur=[],Wc=new hn,Ym=new ae,gs=new ne,_s=new Nn,kr=class extends ne{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new zr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ym)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new hn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Bi),Wc.copy(t.boundingBox).applyMatrix4(Bi),this.boundingBox.union(Wc)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Nn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Bi),_s.copy(t.boundingSphere).applyMatrix4(Bi),this.boundingSphere.union(_s)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(gs.geometry=this.geometry,gs.material=this.material,gs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_s.copy(this.boundingSphere),_s.applyMatrix4(n),t.ray.intersectsSphere(_s)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Bi),Gc.multiplyMatrices(n,Bi),gs.matrixWorld=Gc,gs.raycast(t,ur);for(let a=0,o=ur.length;a<o;a++){let l=ur[a];l.instanceId=r,l.object=this,e.push(l)}ur.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new zr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Yo(new Float32Array(s*this.count),s,this.count,Tl,_n));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var bn=class extends Fn{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new Ht(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Hr=new N,Vr=new N,Xc=new ae,vs=new Ps,fr=new Nn,Ba=new N,qc=new N,mi=class extends Be{constructor(t=new ye,e=new bn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Hr.fromBufferAttribute(e,s-1),Vr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Hr.distanceTo(Vr);t.setAttribute("lineDistance",new he(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(s),fr.radius+=r,t.ray.intersectsSphere(fr)===!1)return;Xc.copy(s).invert(),vs.copy(t.ray).applyMatrix4(Xc);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){let p=Math.max(0,a.start),_=Math.min(h.count,a.start+a.count);for(let y=p,m=_-1;y<m;y+=c){let d=h.getX(y),A=h.getX(y+1),S=dr(this,t,vs,l,d,A);S&&e.push(S)}if(this.isLineLoop){let y=h.getX(_-1),m=h.getX(p),d=dr(this,t,vs,l,y,m);d&&e.push(d)}}else{let p=Math.max(0,a.start),_=Math.min(f.count,a.start+a.count);for(let y=p,m=_-1;y<m;y+=c){let d=dr(this,t,vs,l,y,y+1);d&&e.push(d)}if(this.isLineLoop){let y=dr(this,t,vs,l,_-1,p);y&&e.push(y)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function dr(i,t,e,n,s,r){let a=i.geometry.attributes.position;if(Hr.fromBufferAttribute(a,s),Vr.fromBufferAttribute(a,r),e.distanceSqToSegment(Hr,Vr,Ba,qc)>n)return;Ba.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(Ba);if(!(l<t.near||l>t.far))return{distance:l,point:qc.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}var Yc=new N,Zc=new N,ji=class extends mi{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Yc.fromBufferAttribute(e,s),Zc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Yc.distanceTo(Zc);t.setAttribute("lineDistance",new he(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Gr=class extends mi{constructor(t,e){super(t,e),this.isLineLoop=!0,this.type="LineLoop"}},Zo=class extends Fn{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new Ht(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Jc=new ae,Jo=new Ps,pr=new Nn,mr=new N,Ls=class extends Be{constructor(t=new ye,e=new Zo){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pr.copy(n.boundingSphere),pr.applyMatrix4(s),pr.radius+=r,t.ray.intersectsSphere(pr)===!1)return;Jc.copy(s).invert(),Jo.copy(t.ray).applyMatrix4(Jc);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){let f=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let _=f,y=p;_<y;_++){let m=c.getX(_);mr.fromBufferAttribute(u,m),$c(mr,m,l,s,t,e,this)}}else{let f=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let _=f,y=p;_<y;_++)mr.fromBufferAttribute(u,_),$c(mr,_,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function $c(i,t,e,n,s,r,a){let o=Jo.distanceSqToPoint(i);if(o<e){let l=new N;Jo.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var ts=class extends Ye{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},nn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let h=n[s],f=n[s+1]-h,p=(a-h)/f;return(s+p)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new yt:new N);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new N,s=[],r=[],a=[],o=new N,l=new ae;for(let p=0;p<=t;p++){let _=p/t;s[p]=this.getTangentAt(_,new N)}r[0]=new N,a[0]=new N;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let _=Math.acos(Le(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,_))}a[p].crossVectors(s[p],r[p])}if(e===!0){let p=Math.acos(Le(r[0].dot(r[t]),-1,1));p/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(p=-p);for(let _=1;_<=t;_++)r[_].applyMatrix4(l.makeRotationAxis(s[_],p*_)),a[_].crossVectors(s[_],r[_])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Ds=class extends nn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new yt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,p=c-this.aY;l=f*h-p*u+this.aX,c=f*u+p*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},$o=class extends Ds{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Il(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let f=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+u)+(l-o)/u;f*=h,p*=h,s(a,o,f,p)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var gr=new N,za=new Il,ka=new Il,Ha=new Il,gi=class extends nn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new N){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(gr.subVectors(s[0],s[1]).add(s[0]),c=gr);let u=s[o%r],f=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(gr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=gr),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,_=Math.pow(c.distanceToSquared(u),p),y=Math.pow(u.distanceToSquared(f),p),m=Math.pow(f.distanceToSquared(h),p);y<1e-4&&(y=1),_<1e-4&&(_=y),m<1e-4&&(m=y),za.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,_,y,m),ka.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,_,y,m),Ha.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,_,y,m)}else this.curveType==="catmullrom"&&(za.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),ka.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Ha.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(za.calc(l),ka.calc(l),Ha.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Kc(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function Zm(i,t){let e=1-i;return e*e*t}function Jm(i,t){return 2*(1-i)*i*t}function $m(i,t){return i*i*t}function Ts(i,t,e,n){return Zm(i,t)+Jm(i,e)+$m(i,n)}function Km(i,t){let e=1-i;return e*e*e*t}function Qm(i,t){let e=1-i;return 3*e*e*i*t}function jm(i,t){return 3*(1-i)*i*i*t}function tg(i,t){return i*i*i*t}function ws(i,t,e,n,s){return Km(i,t)+Qm(i,e)+jm(i,n)+tg(i,s)}var Wr=class extends nn{constructor(t=new yt,e=new yt,n=new yt,s=new yt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new yt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ws(t,s.x,r.x,a.x,o.x),ws(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Ko=class extends nn{constructor(t=new N,e=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ws(t,s.x,r.x,a.x,o.x),ws(t,s.y,r.y,a.y,o.y),ws(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Xr=class extends nn{constructor(t=new yt,e=new yt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new yt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new yt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Qo=class extends nn{constructor(t=new N,e=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new N){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new N){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},qr=class extends nn{constructor(t=new yt,e=new yt,n=new yt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new yt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Ts(t,s.x,r.x,a.x),Ts(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},jo=class extends nn{constructor(t=new N,e=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Ts(t,s.x,r.x,a.x),Ts(t,s.y,r.y,a.y),Ts(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Yr=class extends nn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new yt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return n.set(Kc(o,l.x,c.x,h.x,u.x),Kc(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new yt().fromArray(s))}return this}},tl=Object.freeze({__proto__:null,ArcCurve:$o,CatmullRomCurve3:gi,CubicBezierCurve:Wr,CubicBezierCurve3:Ko,EllipseCurve:Ds,LineCurve:Xr,LineCurve3:Qo,QuadraticBezierCurve:qr,QuadraticBezierCurve3:jo,SplineCurve:Yr}),el=class extends nn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new tl[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new tl[s.type]().fromJSON(s))}return this}},es=class extends el{constructor(t){super(),this.type="Path",this.currentPoint=new yt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Xr(this.currentPoint.clone(),new yt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new qr(this.currentPoint.clone(),new yt(t,e),new yt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){let o=new Wr(this.currentPoint.clone(),new yt(t,e),new yt(n,s),new yt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Yr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){let c=new Ds(t,e,n,s,r,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}};var $n=class extends es{constructor(t){super(t),this.uuid=Mi(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new es().fromJSON(s))}return this}},eg={triangulate:function(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Rh(i,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c,h,u,f,p;if(n&&(r=ag(i,t,r,e)),i.length>80*e){o=c=i[0],l=h=i[1];for(let _=e;_<s;_+=e)u=i[_],f=i[_+1],u<o&&(o=u),f<l&&(l=f),u>c&&(c=u),f>h&&(h=f);p=Math.max(c-o,h-l),p=p!==0?32767/p:0}return Us(r,a,e,o,l,p,0),a}};function Rh(i,t,e,n,s){let r,a;if(s===_g(i,t,e,n)>0)for(r=t;r<e;r+=n)a=Qc(r,i[r],i[r+1],a);else for(r=e-n;r>=t;r-=n)a=Qc(r,i[r],i[r+1],a);return a&&ia(a,a.next)&&(Fs(a),a=a.next),a}function _i(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(ia(e,e.next)||xe(e.prev,e,e.next)===0)){if(Fs(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Us(i,t,e,n,s,r,a){if(!i)return;!a&&r&&ug(i,n,s,r);let o=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?ig(i,n,s,r):ng(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),Fs(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=sg(_i(i),t,e),Us(i,t,e,n,s,r,2)):a===2&&rg(i,t,e,n,s,r):Us(_i(i),t,e,n,s,r,1);break}}}function ng(i){let t=i.prev,e=i,n=i.next;if(xe(t,e,n)>=0)return!1;let s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=s<r?s<a?s:a:r<a?r:a,u=o<l?o<c?o:c:l<c?l:c,f=s>r?s>a?s:a:r>a?r:a,p=o>l?o>c?o:c:l>c?l:c,_=n.next;for(;_!==t;){if(_.x>=h&&_.x<=f&&_.y>=u&&_.y<=p&&Hi(s,o,r,l,a,c,_.x,_.y)&&xe(_.prev,_,_.next)>=0)return!1;_=_.next}return!0}function ig(i,t,e,n){let s=i.prev,r=i,a=i.next;if(xe(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,u=r.y,f=a.y,p=o<l?o<c?o:c:l<c?l:c,_=h<u?h<f?h:f:u<f?u:f,y=o>l?o>c?o:c:l>c?l:c,m=h>u?h>f?h:f:u>f?u:f,d=nl(p,_,t,e,n),A=nl(y,m,t,e,n),S=i.prevZ,v=i.nextZ;for(;S&&S.z>=d&&v&&v.z<=A;){if(S.x>=p&&S.x<=y&&S.y>=_&&S.y<=m&&S!==s&&S!==a&&Hi(o,h,l,u,c,f,S.x,S.y)&&xe(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=p&&v.x<=y&&v.y>=_&&v.y<=m&&v!==s&&v!==a&&Hi(o,h,l,u,c,f,v.x,v.y)&&xe(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=d;){if(S.x>=p&&S.x<=y&&S.y>=_&&S.y<=m&&S!==s&&S!==a&&Hi(o,h,l,u,c,f,S.x,S.y)&&xe(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=A;){if(v.x>=p&&v.x<=y&&v.y>=_&&v.y<=m&&v!==s&&v!==a&&Hi(o,h,l,u,c,f,v.x,v.y)&&xe(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function sg(i,t,e){let n=i;do{let s=n.prev,r=n.next.next;!ia(s,r)&&Ch(s,n,n.next,r)&&Ns(s,r)&&Ns(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Fs(n),Fs(n.next),n=i=r),n=n.next}while(n!==i);return _i(n)}function rg(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&pg(a,o)){let l=Ph(a,o);a=_i(a,a.next),l=_i(l,l.next),Us(a,t,e,n,s,r,0),Us(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function ag(i,t,e,n){let s=[],r,a,o,l,c;for(r=0,a=t.length;r<a;r++)o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=Rh(i,o,l,n,!1),c===c.next&&(c.steiner=!0),s.push(dg(c));for(s.sort(og),r=0;r<s.length;r++)e=lg(s[r],e);return e}function og(i,t){return i.x-t.x}function lg(i,t){let e=cg(i,t);if(!e)return t;let n=Ph(e,i);return _i(n,n.next),_i(e,e.next)}function cg(i,t){let e=t,n=-1/0,s,r=i.x,a=i.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){let f=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=r&&f>n&&(n=f,s=e.x<e.next.x?e:e.next,f===r))return s}e=e.next}while(e!==t);if(!s)return null;let o=s,l=s.x,c=s.y,h=1/0,u;e=s;do r>=e.x&&e.x>=l&&r!==e.x&&Hi(a<c?r:n,a,l,c,a<c?n:r,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(r-e.x),Ns(e,i)&&(u<h||u===h&&(e.x>s.x||e.x===s.x&&hg(s,e)))&&(s=e,h=u)),e=e.next;while(e!==o);return s}function hg(i,t){return xe(i.prev,i,t.prev)<0&&xe(t.next,i,i.next)<0}function ug(i,t,e,n){let s=i;do s.z===0&&(s.z=nl(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,fg(s)}function fg(i){let t,e,n,s,r,a,o,l,c=1;do{for(e=i,i=null,r=null,a=0;e;){for(a++,n=e,o=0,t=0;t<c&&(o++,n=n.nextZ,!!n);t++);for(l=c;o>0||l>0&&n;)o!==0&&(l===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,o--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,c*=2}while(a>1);return i}function nl(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function dg(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Hi(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function pg(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!mg(i,t)&&(Ns(i,t)&&Ns(t,i)&&gg(i,t)&&(xe(i.prev,i,t.prev)||xe(i,t.prev,t))||ia(i,t)&&xe(i.prev,i,i.next)>0&&xe(t.prev,t,t.next)>0)}function xe(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function ia(i,t){return i.x===t.x&&i.y===t.y}function Ch(i,t,e,n){let s=vr(xe(i,t,e)),r=vr(xe(i,t,n)),a=vr(xe(e,n,i)),o=vr(xe(e,n,t));return!!(s!==r&&a!==o||s===0&&_r(i,e,t)||r===0&&_r(i,n,t)||a===0&&_r(e,i,n)||o===0&&_r(e,t,n))}function _r(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function vr(i){return i>0?1:i<0?-1:0}function mg(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Ch(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Ns(i,t){return xe(i.prev,i,i.next)<0?xe(i,t,i.next)>=0&&xe(i,i.prev,t)>=0:xe(i,t,i.prev)<0||xe(i,i.next,t)<0}function gg(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Ph(i,t){let e=new il(i.i,i.x,i.y),n=new il(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Qc(i,t,e,n){let s=new il(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Fs(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function il(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function _g(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var As=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];jc(t),th(n,t);let a=t.length;e.forEach(jc);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,th(n,e[l]);let o=eg.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function jc(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function th(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var vi=class i extends ye{constructor(t=new $n([new yt(.5,.5),new yt(-.5,.5),new yt(-.5,-.5),new yt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new he(s,3)),this.setAttribute("uv",new he(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,p=e.bevelThickness!==void 0?e.bevelThickness:.2,_=e.bevelSize!==void 0?e.bevelSize:p-.1,y=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,d=e.extrudePath,A=e.UVGenerator!==void 0?e.UVGenerator:vg,S,v=!1,I,w,C,E;d&&(S=d.getSpacedPoints(h),v=!0,f=!1,I=d.computeFrenetFrames(h,!1),w=new N,C=new N,E=new N),f||(m=0,p=0,_=0,y=0);let g=o.extractPoints(c),x=g.shape,T=g.holes;if(!As.isClockWise(x)){x=x.reverse();for(let X=0,ot=T.length;X<ot;X++){let P=T[X];As.isClockWise(P)&&(T[X]=P.reverse())}}let O=As.triangulateShape(x,T),V=x;for(let X=0,ot=T.length;X<ot;X++){let P=T[X];x=x.concat(P)}function tt(X,ot,P){return ot||console.error("THREE.ExtrudeGeometry: vec does not exist"),X.clone().addScaledVector(ot,P)}let Z=x.length,at=O.length;function Q(X,ot,P){let ht,ct,bt,St=X.x-ot.x,Bt=X.y-ot.y,Ct=P.x-X.x,R=P.y-X.y,M=St*St+Bt*Bt,q=St*R-Bt*Ct;if(Math.abs(q)>Number.EPSILON){let it=Math.sqrt(M),ut=Math.sqrt(Ct*Ct+R*R),nt=ot.x-Bt/it,Lt=ot.y+St/it,Et=P.x-R/ut,Pt=P.y+Ct/ut,Zt=((Et-nt)*R-(Pt-Lt)*Ct)/(St*R-Bt*Ct);ht=nt+St*Zt-X.x,ct=Lt+Bt*Zt-X.y;let G=ht*ht+ct*ct;if(G<=2)return new yt(ht,ct);bt=Math.sqrt(G/2)}else{let it=!1;St>Number.EPSILON?Ct>Number.EPSILON&&(it=!0):St<-Number.EPSILON?Ct<-Number.EPSILON&&(it=!0):Math.sign(Bt)===Math.sign(R)&&(it=!0),it?(ht=-Bt,ct=St,bt=Math.sqrt(M)):(ht=St,ct=Bt,bt=Math.sqrt(M/2))}return new yt(ht/bt,ct/bt)}let vt=[];for(let X=0,ot=V.length,P=ot-1,ht=X+1;X<ot;X++,P++,ht++)P===ot&&(P=0),ht===ot&&(ht=0),vt[X]=Q(V[X],V[P],V[ht]);let Mt=[],wt,kt=vt.concat();for(let X=0,ot=T.length;X<ot;X++){let P=T[X];wt=[];for(let ht=0,ct=P.length,bt=ct-1,St=ht+1;ht<ct;ht++,bt++,St++)bt===ct&&(bt=0),St===ct&&(St=0),wt[ht]=Q(P[ht],P[bt],P[St]);Mt.push(wt),kt=kt.concat(wt)}for(let X=0;X<m;X++){let ot=X/m,P=p*Math.cos(ot*Math.PI/2),ht=_*Math.sin(ot*Math.PI/2)+y;for(let ct=0,bt=V.length;ct<bt;ct++){let St=tt(V[ct],vt[ct],ht);L(St.x,St.y,-P)}for(let ct=0,bt=T.length;ct<bt;ct++){let St=T[ct];wt=Mt[ct];for(let Bt=0,Ct=St.length;Bt<Ct;Bt++){let R=tt(St[Bt],wt[Bt],ht);L(R.x,R.y,-P)}}}let Xt=_+y;for(let X=0;X<Z;X++){let ot=f?tt(x[X],kt[X],Xt):x[X];v?(C.copy(I.normals[0]).multiplyScalar(ot.x),w.copy(I.binormals[0]).multiplyScalar(ot.y),E.copy(S[0]).add(C).add(w),L(E.x,E.y,E.z)):L(ot.x,ot.y,0)}for(let X=1;X<=h;X++)for(let ot=0;ot<Z;ot++){let P=f?tt(x[ot],kt[ot],Xt):x[ot];v?(C.copy(I.normals[X]).multiplyScalar(P.x),w.copy(I.binormals[X]).multiplyScalar(P.y),E.copy(S[X]).add(C).add(w),L(E.x,E.y,E.z)):L(P.x,P.y,u/h*X)}for(let X=m-1;X>=0;X--){let ot=X/m,P=p*Math.cos(ot*Math.PI/2),ht=_*Math.sin(ot*Math.PI/2)+y;for(let ct=0,bt=V.length;ct<bt;ct++){let St=tt(V[ct],vt[ct],ht);L(St.x,St.y,u+P)}for(let ct=0,bt=T.length;ct<bt;ct++){let St=T[ct];wt=Mt[ct];for(let Bt=0,Ct=St.length;Bt<Ct;Bt++){let R=tt(St[Bt],wt[Bt],ht);v?L(R.x,R.y+S[h-1].y,S[h-1].x+P):L(R.x,R.y,u+P)}}}rt(),F();function rt(){let X=s.length/3;if(f){let ot=0,P=Z*ot;for(let ht=0;ht<at;ht++){let ct=O[ht];W(ct[2]+P,ct[1]+P,ct[0]+P)}ot=h+m*2,P=Z*ot;for(let ht=0;ht<at;ht++){let ct=O[ht];W(ct[0]+P,ct[1]+P,ct[2]+P)}}else{for(let ot=0;ot<at;ot++){let P=O[ot];W(P[2],P[1],P[0])}for(let ot=0;ot<at;ot++){let P=O[ot];W(P[0]+Z*h,P[1]+Z*h,P[2]+Z*h)}}n.addGroup(X,s.length/3-X,0)}function F(){let X=s.length/3,ot=0;H(V,ot),ot+=V.length;for(let P=0,ht=T.length;P<ht;P++){let ct=T[P];H(ct,ot),ot+=ct.length}n.addGroup(X,s.length/3-X,1)}function H(X,ot){let P=X.length;for(;--P>=0;){let ht=P,ct=P-1;ct<0&&(ct=X.length-1);for(let bt=0,St=h+m*2;bt<St;bt++){let Bt=Z*bt,Ct=Z*(bt+1),R=ot+ht+Bt,M=ot+ct+Bt,q=ot+ct+Ct,it=ot+ht+Ct;$(R,M,q,it)}}}function L(X,ot,P){l.push(X),l.push(ot),l.push(P)}function W(X,ot,P){K(X),K(ot),K(P);let ht=s.length/3,ct=A.generateTopUV(n,s,ht-3,ht-2,ht-1);ft(ct[0]),ft(ct[1]),ft(ct[2])}function $(X,ot,P,ht){K(X),K(ot),K(ht),K(ot),K(P),K(ht);let ct=s.length/3,bt=A.generateSideWallUV(n,s,ct-6,ct-3,ct-2,ct-1);ft(bt[0]),ft(bt[1]),ft(bt[3]),ft(bt[1]),ft(bt[2]),ft(bt[3])}function K(X){s.push(l[X*3+0]),s.push(l[X*3+1]),s.push(l[X*3+2])}function ft(X){r.push(X.x),r.push(X.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return xg(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new tl[s.type]().fromJSON(s)),new i(n,t.options)}},vg={generateTopUV:function(i,t,e,n,s){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new yt(r,a),new yt(o,l),new yt(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],f=t[s*3],p=t[s*3+1],_=t[s*3+2],y=t[r*3],m=t[r*3+1],d=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new yt(a,1-l),new yt(c,1-u),new yt(f,1-_),new yt(y,1-d)]:[new yt(o,1-l),new yt(h,1-u),new yt(p,1-_),new yt(m,1-d)]}};function xg(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Zr=class extends pe{static get type(){return"RawShaderMaterial"}constructor(t){super(t),this.isRawShaderMaterial=!0}},Ze=class extends Fn{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ht(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ht(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=_h,this.normalScale=new yt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Jr=class extends bn{static get type(){return"LineDashedMaterial"}constructor(t){super(),this.isLineDashedMaterial=!0,this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}};function xr(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function yg(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var ns=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},sl=class extends ns{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ql,endingEnd:ql}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Yl:r=t,o=2*e-n;break;case Zl:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Yl:a=t,l=2*n-e;break;case Zl:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,p=this._weightNext,_=(n-e)/(s-e),y=_*_,m=y*_,d=-f*m+2*f*y-f*_,A=(1+f)*m+(-1.5-2*f)*y+(-.5+f)*_+1,S=(-1-p)*m+(1.5+p)*y+.5*_,v=p*m-p*y;for(let I=0;I!==o;++I)r[I]=d*a[h+I]+A*a[c+I]+S*a[l+I]+v*a[u+I];return r}},rl=class extends ns{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(n-e)/(s-e),u=1-h;for(let f=0;f!==o;++f)r[f]=a[c+f]*u+a[l+f]*h;return r}},al=class extends ns{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},un=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=xr(e,this.TimeBufferType),this.values=xr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:xr(t.times,Array),values:xr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new al(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new rl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new sl(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Tr:e=this.InterpolantFactoryMethodDiscrete;break;case Po:e=this.InterpolantFactoryMethodLinear;break;case ua:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Tr;case this.InterpolantFactoryMethodLinear:return Po;case this.InterpolantFactoryMethodSmooth:return ua}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&yg(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===ua,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let u=o*n,f=u-n,p=u+n;for(let _=0;_!==n;++_){let y=e[u+_];if(y!==e[f+_]||y!==e[p+_]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let u=o*n,f=a*n;for(let p=0;p!==n;++p)e[f+p]=e[u+p]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};un.prototype.TimeBufferType=Float32Array;un.prototype.ValueBufferType=Float32Array;un.prototype.DefaultInterpolation=Po;var xi=class extends un{constructor(t,e,n){super(t,e,n)}};xi.prototype.ValueTypeName="bool";xi.prototype.ValueBufferType=Array;xi.prototype.DefaultInterpolation=Tr;xi.prototype.InterpolantFactoryMethodLinear=void 0;xi.prototype.InterpolantFactoryMethodSmooth=void 0;var ol=class extends un{};ol.prototype.ValueTypeName="color";var ll=class extends un{};ll.prototype.ValueTypeName="number";var cl=class extends ns{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)xn.slerpFlat(r,0,a,c-o,a,c,l);return r}},$r=class extends un{InterpolantFactoryMethodLinear(t){return new cl(this.times,this.values,this.getValueSize(),t)}};$r.prototype.ValueTypeName="quaternion";$r.prototype.InterpolantFactoryMethodSmooth=void 0;var yi=class extends un{constructor(t,e,n){super(t,e,n)}};yi.prototype.ValueTypeName="string";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=Tr;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var hl=class extends un{};hl.prototype.ValueTypeName="vector";var ul=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let p=c[u],_=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return _}return null}}},Mg=new ul,fl=class{constructor(t){this.manager=t!==void 0?t:Mg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};fl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Os=class extends Be{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ht(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}};var Va=new ae,eh=new N,nh=new N,Kr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new yt(512,512),this.map=null,this.mapPass=null,this.matrix=new ae,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Is,this._frameExtents=new yt(1,1),this._viewportCount=1,this._viewports=[new oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;eh.setFromMatrixPosition(t.matrixWorld),e.position.copy(eh),nh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(nh),e.updateMatrixWorld(),Va.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Va),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Va)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var ih=new ae,xs=new N,Ga=new N,dl=class extends Kr{constructor(){super(new Oe(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new yt(4,2),this._viewportCount=6,this._viewports=[new oe(2,1,1,1),new oe(0,1,1,1),new oe(3,1,1,1),new oe(1,1,1,1),new oe(3,0,1,1),new oe(1,0,1,1)],this._cubeDirections=[new N(1,0,0),new N(-1,0,0),new N(0,0,1),new N(0,0,-1),new N(0,1,0),new N(0,-1,0)],this._cubeUps=[new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,0,1),new N(0,0,-1)]}updateMatrices(t,e=0){let n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),xs.setFromMatrixPosition(t.matrixWorld),n.position.copy(xs),Ga.copy(n.position),Ga.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(Ga),n.updateMatrixWorld(),s.makeTranslation(-xs.x,-xs.y,-xs.z),ih.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ih)}},Bs=class extends Os{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new dl}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}},pl=class extends Kr{constructor(){super(new Qi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Qr=class extends Os{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Be.DEFAULT_UP),this.updateMatrix(),this.target=new Be,this.shadow=new pl}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},jr=class extends Os{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var is=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=sh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=sh();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function sh(){return performance.now()}var Ll="\\[\\]\\.:\\/",Sg=new RegExp("["+Ll+"]","g"),Dl="[^"+Ll+"]",bg="[^"+Ll.replace("\\.","")+"]",Eg=/((?:WC+[\/:])*)/.source.replace("WC",Dl),Tg=/(WCOD+)?/.source.replace("WCOD",bg),wg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Dl),Ag=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Dl),Rg=new RegExp("^"+Eg+Tg+wg+Ag+"$"),Cg=["material","materials","bones","map"],ml=class{constructor(t,e,n){let s=n||_e.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},_e=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Sg,"")}static parseTrackName(t){let e=Rg.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Cg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_e.Composite=ml;_e.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_e.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_e.prototype.GetterByBindingType=[_e.prototype._getValue_direct,_e.prototype._getValue_array,_e.prototype._getValue_arrayElement,_e.prototype._getValue_toArray];_e.prototype.SetterByBindingTypeAndVersioning=[[_e.prototype._setValue_direct,_e.prototype._setValue_direct_setNeedsUpdate,_e.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_e.prototype._setValue_array,_e.prototype._setValue_array_setNeedsUpdate,_e.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_e.prototype._setValue_arrayElement,_e.prototype._setValue_arrayElement_setNeedsUpdate,_e.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_e.prototype._setValue_fromArray,_e.prototype._setValue_fromArray_setNeedsUpdate,_e.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var kg=new Float32Array(1);typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gl}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gl);var sa={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var je=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Ig=new Qi(-1,1,1,-1,0,1),Ul=class extends ye{constructor(){super(),this.setAttribute("position",new he([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new he([0,2,0,0,2,0],2))}},Lg=new Ul,Qn=class{constructor(t){this._mesh=new ne(Lg,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Ig)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var ra=class extends je{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof pe?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Kn.clone(t.uniforms),this.material=new pe({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Qn(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var ks=class extends je{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},aa=class extends je{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var oa=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new yt);this._width=n.width,this._height=n.height,e=new He(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:fn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ra(sa),this.copyPass.material.blending=vn,this.clock=new is}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ks!==void 0&&(a instanceof ks?n=!0:a instanceof aa&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new yt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var la=class extends je{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ht}render(t,e,n){let s=t.autoClear;t.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=s}};var Ih={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ht(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var as=class i extends je{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new yt(t.x,t.y):new yt(256,256),this.clearColor=new Ht(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new He(r,a,{type:fn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){let f=new He(r,a,{type:fn});f.texture.name="UnrealBloomPass.h"+u,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);let p=new He(r,a,{type:fn});p.texture.name="UnrealBloomPass.v"+u,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),r=Math.round(r/2),a=Math.round(a/2)}let o=Ih;this.highPassUniforms=Kn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new pe({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new yt(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let h=sa;this.copyUniforms=Kn.clone(h.uniforms),this.blendMaterial=new pe({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:qe,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Ht,this.oldClearAlpha=1,this.basic=new On,this.fsQuad=new Qn(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new yt(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=a}getSeperableBlurMaterial(t){let e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new pe({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new yt(.5,.5)},direction:{value:new yt(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new pe({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};as.BlurDirectionX=new yt(1,0);as.BlurDirectionY=new yt(0,1);var Lh={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var ca=class extends je{constructor(){super();let t=Lh;this.uniforms=Kn.clone(t.uniforms),this.material=new Zr({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new Qn(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},Kt.getTransfer(this._outputColorSpace)===re&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===_l?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===vl?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===xl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===zs?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===yl?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ml&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Hs=new N;function sn(i,t,e,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),l=Math.PI/4;Hs.copy(t),Hs[n]=0,Hs.normalize();let c=.5*a/(a+o),h=1-Hs.angleTo(i)/l;return Math.sign(Hs[e])===1?h*c:o/(a+o)+c+c*(1-h)}var os=class extends Mn{constructor(t=1,e=1,n=1,s=2,r=.1){if(s=s*2+1,r=Math.min(t/2,e/2,n/2,r),super(1,1,1,s,s,s),s===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let o=new N,l=new N,c=new N(t,e,n).divideScalar(2).subScalar(r),h=this.attributes.position.array,u=this.attributes.normal.array,f=this.attributes.uv.array,p=h.length/6,_=new N,y=.5/s;for(let m=0,d=0;m<h.length;m+=3,d+=2)switch(o.fromArray(h,m),l.copy(o),l.x-=Math.sign(l.x)*y,l.y-=Math.sign(l.y)*y,l.z-=Math.sign(l.z)*y,l.normalize(),h[m+0]=c.x*Math.sign(o.x)+l.x*r,h[m+1]=c.y*Math.sign(o.y)+l.y*r,h[m+2]=c.z*Math.sign(o.z)+l.z*r,u[m+0]=l.x,u[m+1]=l.y,u[m+2]=l.z,Math.floor(m/p)){case 0:_.set(1,0,0),f[d+0]=sn(_,l,"z","y",r,n),f[d+1]=1-sn(_,l,"y","z",r,e);break;case 1:_.set(-1,0,0),f[d+0]=1-sn(_,l,"z","y",r,n),f[d+1]=1-sn(_,l,"y","z",r,e);break;case 2:_.set(0,1,0),f[d+0]=1-sn(_,l,"x","z",r,t),f[d+1]=sn(_,l,"z","x",r,n);break;case 3:_.set(0,-1,0),f[d+0]=1-sn(_,l,"x","z",r,t),f[d+1]=1-sn(_,l,"z","x",r,n);break;case 4:_.set(0,0,1),f[d+0]=1-sn(_,l,"x","y",r,t),f[d+1]=1-sn(_,l,"y","x",r,e);break;case 5:_.set(0,0,-1),f[d+0]=sn(_,l,"x","y",r,t),f[d+1]=1-sn(_,l,"y","x",r,e);break}}};var Vh=Qh(Fh());var Nl=[{n:"Sonora",r:[[-.8482,.6366,-.8539,.6361,-.8628,.6207,-.8572,.611,-.8558,.5943,-.8048,.5646,-.7962,.5644,-.7861,.5719,-.7719,.5648,-.7646,.5503,-.7362,.5447,-.7317,.5403,-.737,.5156,-.7337,.5054,-.72,.4881,-.7185,.478,-.7122,.4706,-.7121,.4518,-.7078,.4507,-.6959,.4298,-.6875,.4204,-.6903,.4125,-.68,.4092,-.6726,.3828,-.6557,.3698,-.6574,.3654,-.6469,.3556,-.6434,.3467,-.6279,.3411,-.6133,.3174,-.6007,.3092,-.5878,.3048,-.5842,.3085,-.5696,.302,-.5723,.2856,-.5675,.2696,-.5499,.2526,-.5255,.2462,-.5215,.2276,-.5108,.2188,-.5014,.2224,-.4934,.2184,-.482,.2059,-.4818,.1952,-.4743,.194,-.4327,.2277,-.43,.2405,-.4439,.2551,-.4413,.2645,-.4434,.2806,-.4506,.2866,-.459,.3019,-.4665,.307,-.4748,.3265,-.4697,.3335,-.4573,.3345,-.4426,.3309,-.4349,.3367,-.4419,.3574,-.4404,.3691,-.4459,.4143,-.4397,.4148,-.4347,.4601,-.4377,.4937,-.452,.5029,-.468,.5167,-.4631,.5525,-.4683,.5525,-.5287,.5525,-.6012,.553,-.684,.5813,-.7379,.5995,-.7918,.6176,-.8482,.6366],[-.6807,.3688,-.6755,.387,-.6812,.4016,-.6915,.4,-.6946,.3835,-.701,.3765,-.6878,.3693,-.6807,.3688]]},{n:"Baja California",r:[[-.842,.652,-.9124,.6462,-1,.639,-.9934,.6207,-.9883,.6186,-.9814,.5999,-.9668,.5906,-.9704,.5687,-.9608,.5606,-.9463,.5397,-.9424,.526,-.9304,.5156,-.9292,.4917,-.9152,.4821,-.9061,.4398,-.893,.4294,-.8789,.4235,-.8724,.4163,-.8583,.4126,-.8418,.394,-.8358,.3922,-.8292,.3802,-.8208,.3754,-.8122,.361,-.8052,.3602,-.7971,.3466,-.8025,.3321,-.7984,.3137,-.7129,.3136,-.7149,.3274,-.72,.3341,-.722,.3478,-.7352,.35,-.7456,.374,-.76,.3816,-.7792,.4148,-.8121,.4409,-.8201,.4417,-.8225,.4506,-.8294,.455,-.8377,.4704,-.8358,.4878,-.8402,.503,-.8417,.5248,-.8491,.5296,-.8528,.5408,-.8504,.5669,-.8457,.5761,-.8558,.5943,-.8572,.611,-.8628,.6207,-.8539,.6361,-.8482,.6366,-.842,.652],[-.873,.3382,-.8821,.3227,-.8737,.3164,-.8703,.326,-.873,.3382],[-.7376,.3902,-.7405,.4063,-.7515,.4131,-.7599,.4237,-.7672,.4149,-.7435,.3898,-.7376,.3902]]},{n:"Chihuahua",r:[[-.301,.5843,-.4135,.5849,-.4135,.5525,-.4631,.5525,-.468,.5167,-.452,.5029,-.4377,.4937,-.4347,.4601,-.4397,.4148,-.4459,.4143,-.4404,.3691,-.4419,.3574,-.4349,.3367,-.4426,.3309,-.4573,.3345,-.4697,.3335,-.4748,.3265,-.4665,.307,-.459,.3019,-.4506,.2866,-.4434,.2806,-.4413,.2645,-.4439,.2551,-.43,.2405,-.424,.2475,-.4123,.2399,-.4023,.237,-.3993,.2287,-.3885,.2132,-.3852,.1857,-.3608,.1795,-.3562,.1762,-.3506,.1608,-.3294,.1445,-.3151,.1438,-.3035,.1544,-.3022,.1697,-.2926,.1796,-.2941,.1975,-.2826,.2009,-.2825,.2104,-.2695,.2304,-.255,.2199,-.2466,.2203,-.2385,.2113,-.2234,.2031,-.2096,.2098,-.1909,.2051,-.1754,.1953,-.1703,.1969,-.1515,.2221,-.1437,.2256,-.1322,.2247,-.1115,.2164,-.1336,.3079,-.0907,.3874,-.1059,.3962,-.1145,.398,-.1225,.4054,-.1398,.4098,-.1536,.4233,-.171,.4334,-.1808,.4531,-.1809,.4711,-.2024,.5059,-.2258,.5183,-.2408,.5341,-.2524,.542,-.268,.5575,-.2785,.5612,-.2912,.5806,-.301,.5843]]},{n:"Coahuila",r:[[.14,.2973,.1223,.3248,.1086,.335,.1011,.3563,.0862,.3801,.0832,.3938,.0736,.4049,.0507,.4215,.047,.4293,.0345,.4405,-.0025,.4442,-.0116,.4431,-.0243,.4493,-.0311,.4413,-.0493,.4389,-.0625,.4102,-.0799,.3844,-.0907,.3874,-.1336,.3079,-.1115,.2164,-.0917,.1995,-.0887,.189,-.0929,.1791,-.0913,.1485,-.1023,.1372,-.0982,.129,-.1037,.1198,-.0957,.1085,-.0883,.1035,-.0867,.0928,-.0794,.0875,-.0599,.0788,-.0581,.0915,-.0483,.104,-.0427,.1073,-.0158,.1101,.0048,.1038,.0109,.0939,.0225,.0899,.031,.0804,.0389,.0849,.0485,.0838,.0551,.0726,.0728,.0671,.0765,.0804,.0723,.1013,.0765,.1089,.0925,.1148,.1102,.1134,.1073,.1231,.0975,.1229,.0896,.1281,.0716,.1547,.0715,.1671,.0472,.1969,.0777,.2227,.0886,.2251,.0909,.2443,.0745,.2572,.0859,.2655,.0986,.2692,.1055,.2923,.1153,.2989,.1294,.2879,.14,.2973]]},{n:"Tamaulipas",r:[[.1463,.29,.1332,.283,.1419,.2765,.1483,.2516,.147,.2345,.156,.2301,.1529,.2227,.1659,.2149,.1655,.1988,.1817,.1902,.1831,.1762,.1918,.1768,.2004,.1681,.2056,.1745,.2223,.1681,.222,.1345,.2296,.1289,.2017,.1055,.1909,.107,.1837,.0993,.1804,.0896,.1502,.0725,.1553,.0514,.1525,.0365,.1626,.0235,.1536,.0099,.1378,.008,.1244,-.0154,.1235,-.0279,.1328,-.0483,.1246,-.0547,.1281,-.0612,.1566,-.0724,.1682,-.0679,.1768,-.084,.1971,-.0903,.2184,-.0869,.2393,-.0878,.2459,-.0824,.2528,-.0902,.2733,-.0974,.2662,-.0721,.2759,-.0472,.2741,-.0265,.2772,.0079,.2776,.0272,.2819,.0636,.2945,.1112,.3038,.1264,.3139,.1503,.3156,.1677,.3081,.1675,.2968,.1597,.28,.1727,.272,.1747,.2442,.1755,.2346,.1841,.2167,.1875,.2065,.1966,.1875,.1994,.1822,.2089,.1768,.2295,.1627,.246,.1647,.2569,.1603,.2663,.1597,.2831,.1463,.29]]},{n:"Nuevo Le\xF3n",r:[[.14,.2973,.1294,.2879,.1153,.2989,.1055,.2923,.0986,.2692,.0859,.2655,.0745,.2572,.0909,.2443,.0886,.2251,.0777,.2227,.0472,.1969,.0715,.1671,.0716,.1547,.0896,.1281,.0975,.1229,.1073,.1231,.1102,.1134,.0925,.1148,.0765,.1089,.0723,.1013,.0765,.0804,.0728,.0671,.0871,.0469,.0891,.0216,.0952,.0137,.0984,-.0287,.1235,-.0279,.1244,-.0154,.1378,.008,.1536,.0099,.1626,.0235,.1525,.0365,.1553,.0514,.1502,.0725,.1804,.0896,.1837,.0993,.1909,.107,.2017,.1055,.2296,.1289,.222,.1345,.2223,.1681,.2056,.1745,.2004,.1681,.1918,.1768,.1831,.1762,.1817,.1902,.1655,.1988,.1659,.2149,.1529,.2227,.156,.2301,.147,.2345,.1483,.2516,.1419,.2765,.1332,.283,.1463,.29,.14,.2973]]},{n:"Quintana Roo",r:[[.8768,-.3864,.885,-.3693,.8972,-.3696,.9103,-.3464,.9171,-.3546,.9121,-.3683,.9215,-.3723,.9274,-.3853,.9323,-.3749,.9354,-.3552,.9394,-.349,.9431,-.3309,.9504,-.3088,.9484,-.3032,.9552,-.2923,.9392,-.2927,.9416,-.2814,.9519,-.2688,.9538,-.2468,.9675,-.2251,.9786,-.2161,.9912,-.1992,1,-.177,.9952,-.174,.9943,-.1577,.988,-.1567,.9831,-.1481,.9674,-.1569,.9475,-.1529,.9485,-.1673,.9445,-.1808,.9479,-.1919,.9386,-.214,.9163,-.2293,.9028,-.2294,.8879,-.2473,.8707,-.2547,.8572,-.2642,.8477,-.2654,.8381,-.2719,.8271,-.2734,.824,-.2856,.8425,-.3032,.8504,-.3167,.85,-.3299,.846,-.3351,.8442,-.3545,.8484,-.3688,.849,-.3895,.8412,-.4019,.8418,-.4076,.8481,-.4042,.8593,-.4121,.8768,-.3864],[.9995,-.218,.9872,-.2213,.9818,-.2367,.9878,-.238,.9995,-.218]]},{n:"Campeche",r:[[.8418,-.4076,.8412,-.4019,.849,-.3895,.8484,-.3688,.8442,-.3545,.846,-.3351,.85,-.3299,.8504,-.3167,.8425,-.3032,.824,-.2856,.8214,-.2765,.8099,-.2592,.798,-.2507,.7941,-.2412,.77,-.2239,.7597,-.2213,.7605,-.2014,.756,-.2073,.7533,-.2222,.7528,-.2557,.7541,-.2661,.7418,-.2762,.7389,-.283,.7375,-.3053,.7239,-.3206,.709,-.3312,.6913,-.3409,.7022,-.3513,.6978,-.363,.6839,-.3719,.6651,-.3698,.6545,-.3654,.6573,-.3545,.6499,-.3537,.6219,-.3576,.6303,-.3713,.6441,-.3709,.6436,-.392,.6611,-.4065,.678,-.4076,.6823,-.3966,.6989,-.3999,.7125,-.406,.7202,-.4064,.7203,-.4183,.7222,-.4173,.7684,-.4174,.8408,-.4174,.8418,-.4076]]},{n:"Tabasco",r:[[.7203,-.4183,.7202,-.4064,.7125,-.406,.6989,-.3999,.6823,-.3966,.678,-.4076,.6611,-.4065,.6436,-.392,.6441,-.3709,.6303,-.3713,.6219,-.3576,.6091,-.3594,.5975,-.3706,.592,-.3721,.5588,-.3724,.5132,-.3892,.5189,-.4045,.5172,-.4126,.5264,-.4214,.5397,-.4277,.5476,-.4366,.5492,-.4489,.5548,-.4362,.5608,-.4301,.5675,-.4067,.5752,-.4056,.5884,-.4106,.5887,-.4356,.5985,-.4459,.6081,-.4483,.6297,-.4258,.638,-.4228,.6541,-.4109,.668,-.4151,.6784,-.439,.6913,-.4479,.6912,-.4576,.7202,-.4578,.7203,-.4183]]},{n:"Chiapas",r:[[.6912,-.4576,.6913,-.4479,.6784,-.439,.668,-.4151,.6541,-.4109,.638,-.4228,.6297,-.4258,.6081,-.4483,.5985,-.4459,.5887,-.4356,.5884,-.4106,.5752,-.4056,.5675,-.4067,.5608,-.4301,.5548,-.4362,.5492,-.4489,.5461,-.4543,.5306,-.4651,.5281,-.4844,.5203,-.4893,.5199,-.5001,.514,-.5111,.5198,-.528,.5167,-.5369,.5289,-.5413,.526,-.5469,.5449,-.5592,.573,-.5834,.5892,-.6003,.5996,-.607,.6078,-.6195,.6377,-.652,.6432,-.6408,.6413,-.6328,.6437,-.6197,.649,-.6141,.6405,-.6024,.6469,-.5868,.6702,-.5443,.6721,-.5427,.72,-.5426,.756,-.542,.756,-.5419,.7553,-.5291,.7593,-.5227,.7429,-.5096,.7372,-.494,.7153,-.4817,.7006,-.4623,.6912,-.4576]]},{n:"Colima",r:[[-.119,-.3546,-.1017,-.3347,-.1048,-.3256,-.1029,-.3096,-.112,-.2973,-.125,-.3037,-.1377,-.2973,-.1441,-.2984,-.1502,-.3093,-.1713,-.3144,-.1751,-.3215,-.1593,-.3243,-.1579,-.3307,-.1347,-.3413,-.119,-.3546]]},{n:"Nayarit",r:[[-.221,-.2114,-.2081,-.1946,-.1969,-.1937,-.184,-.188,-.1549,-.2097,-.1501,-.1907,-.1508,-.1766,-.1349,-.1693,-.1324,-.1618,-.1499,-.1515,-.1425,-.1325,-.1623,-.1109,-.1578,-.098,-.1565,-.0941,-.1581,-.0829,-.1674,-.087,-.1747,-.0839,-.18,-.072,-.187,-.0684,-.1999,-.0781,-.2015,-.0685,-.1945,-.0603,-.1982,-.0512,-.2105,-.044,-.2275,-.0428,-.2395,-.0602,-.2339,-.0679,-.2325,-.0814,-.2422,-.0776,-.2495,-.0804,-.245,-.0986,-.2435,-.1201,-.2291,-.1456,-.214,-.1569,-.2179,-.1642,-.2173,-.1844,-.2223,-.1865,-.2357,-.2053,-.221,-.2114]]},{n:"Baja California Sur",r:[[-.799,.3137,-.8007,.3137,-.804,.3137,-.8079,.3137,-.8012,.2928,-.8129,.2948,-.8157,.3047,-.8271,.2975,-.8551,.3019,-.8527,.2918,-.8426,.2793,-.8276,.2711,-.8264,.259,-.8018,.2495,-.7946,.2403,-.7822,.2383,-.7704,.2223,-.7616,.2271,-.7379,.2246,-.7325,.2131,-.7106,.1967,-.6852,.1829,-.6757,.1698,-.6676,.1496,-.6678,.117,-.6721,.1045,-.6684,.0821,-.6605,.0824,-.6527,.0735,-.6503,.0629,-.6415,.0687,-.6376,.0605,-.626,.0499,-.5994,.0341,-.569,.0038,-.5512,-.0064,-.542,-.0221,-.5374,-.0439,-.5241,-.0542,-.5121,-.043,-.5002,-.0374,-.4932,-.0239,-.4965,-.005,-.5099,.0013,-.5111,.0121,-.5204,.0231,-.5197,.0311,-.5302,.0299,-.5322,.0387,-.5424,.0448,-.5574,.0392,-.568,.0419,-.5759,.0525,-.5796,.0664,-.5742,.0845,-.5809,.0992,-.5905,.1086,-.5985,.1313,-.6095,.1425,-.617,.1543,-.6205,.1676,-.6177,.1755,-.6272,.1989,-.6259,.2073,-.6343,.2115,-.6337,.2201,-.6507,.2345,-.6638,.2404,-.6634,.2503,-.6728,.2536,-.6872,.2824,-.702,.2889,-.7135,.304,-.7129,.3136,-.7984,.3137,-.799,.3137]]},{n:"Sinaloa",r:[[-.2495,-.0804,-.2422,-.0776,-.2325,-.0814,-.2339,-.0679,-.2395,-.0602,-.2275,-.0428,-.2277,-.0344,-.2381,-.0335,-.2471,-.0239,-.2489,-.0119,-.2609,.0061,-.2643,.0318,-.2712,.0469,-.2806,.0546,-.2943,.0474,-.3069,.053,-.3086,.0612,-.3174,.0771,-.3359,.0926,-.3418,.112,-.3398,.1285,-.3294,.1445,-.3506,.1608,-.3562,.1762,-.3608,.1795,-.3852,.1857,-.3885,.2132,-.3993,.2287,-.4023,.237,-.4123,.2399,-.424,.2475,-.43,.2405,-.4327,.2277,-.4743,.194,-.4754,.1923,-.4804,.189,-.4839,.1875,-.4844,.1872,-.4937,.1717,-.4942,.1553,-.4764,.145,-.4728,.1368,-.4578,.1335,-.429,.1177,-.4213,.1099,-.4064,.1068,-.4116,.0974,-.4017,.0829,-.399,.0731,-.3876,.0693,-.3746,.0595,-.3584,.0415,-.3359,.0252,-.3271,.0156,-.3199,2e-4,-.3021,-.0159,-.296,-.0287,-.2822,-.0415,-.2698,-.0574,-.2545,-.0712,-.2495,-.0804]]},{n:"Yucat\xE1n",r:[[.7605,-.2014,.7597,-.2213,.77,-.2239,.7941,-.2412,.798,-.2507,.8099,-.2592,.8214,-.2765,.824,-.2856,.8271,-.2734,.8381,-.2719,.8477,-.2654,.8572,-.2642,.8707,-.2547,.8879,-.2473,.9028,-.2294,.9163,-.2293,.9386,-.214,.9479,-.1919,.9445,-.1808,.9485,-.1673,.9475,-.1529,.9197,-.1457,.9087,-.1445,.8986,-.1488,.8877,-.1475,.8709,-.1558,.8433,-.1627,.7996,-.1683,.779,-.177,.7637,-.1864,.7605,-.2014]]},{n:"Veracruz",r:[[.2733,-.0974,.2528,-.0902,.2459,-.0824,.2393,-.0878,.2184,-.0869,.2343,-.0979,.2352,-.106,.2292,-.1184,.2235,-.119,.2267,-.1347,.2167,-.145,.224,-.1511,.225,-.1601,.2265,-.1699,.2319,-.176,.245,-.1779,.2504,-.1836,.2437,-.1932,.2331,-.1976,.2302,-.2119,.2215,-.2266,.2259,-.2345,.2368,-.2293,.2516,-.2111,.2575,-.2131,.2589,-.2258,.2622,-.221,.2658,-.2027,.2735,-.2021,.2812,-.217,.288,-.2243,.2826,-.2307,.2741,-.229,.2738,-.2409,.289,-.2507,.2982,-.2419,.3147,-.25,.3146,-.2548,.3043,-.2684,.3034,-.2825,.299,-.291,.3099,-.308,.3259,-.3116,.3176,-.3195,.3074,-.3208,.3098,-.3385,.303,-.3459,.3043,-.3549,.3158,-.3574,.3256,-.3672,.3379,-.3645,.3427,-.3747,.3513,-.3602,.3635,-.3654,.3657,-.3734,.3755,-.3897,.3834,-.3938,.3935,-.3923,.4012,-.3955,.4054,-.4044,.3965,-.4196,.4039,-.4373,.4161,-.4389,.4361,-.4276,.4605,-.4603,.5306,-.4651,.5461,-.4543,.5492,-.4489,.5476,-.4366,.5397,-.4277,.5264,-.4214,.5172,-.4126,.5189,-.4045,.5132,-.3892,.4915,-.3937,.484,-.3904,.469,-.3665,.4562,-.3642,.4427,-.3532,.4238,-.3533,.4085,-.3497,.4003,-.3526,.3921,-.3281,.3723,-.3097,.3606,-.2699,.3461,-.2492,.3148,-.2141,.3118,-.2024,.3025,-.1848,.292,-.16,.2814,-.143,.2846,-.1287,.2747,-.1101,.2733,-.0974]]},{n:"Jalisco",r:[[-.1751,-.3215,-.1713,-.3144,-.1502,-.3093,-.1441,-.2984,-.1377,-.2973,-.125,-.3037,-.112,-.2973,-.1029,-.3096,-.1048,-.3256,-.1017,-.3347,-.0897,-.3289,-.0782,-.3319,-.0694,-.3281,-.0626,-.3177,-.0477,-.3157,-.0405,-.3045,-.0529,-.2905,-.0577,-.2734,-.0553,-.2636,-.0726,-.2627,-.0734,-.2519,-.049,-.2449,-.0372,-.2379,-.011,-.2327,-.0031,-.2207,-.01,-.2082,-.0074,-.1979,.0052,-.1781,.0237,-.1638,.0195,-.1516,.026,-.143,.0233,-.1329,.0272,-.1284,.0204,-.1219,.0058,-.1157,-.0076,-.1266,-.0096,-.1336,-.0196,-.1401,-.0382,-.1381,-.0458,-.1333,-.0544,-.135,-.0555,-.1451,-.0466,-.148,-.0495,-.16,-.0646,-.1685,-.0739,-.1697,-.0734,-.1834,-.0855,-.1831,-.0942,-.178,-.1091,-.1749,-.1194,-.1674,-.114,-.1537,-.1044,-.1457,-.1049,-.1301,-.0892,-.118,-.0805,-.1171,-.0732,-.0989,-.0948,-.0799,-.0938,-.0919,-.1024,-.1073,-.1148,-.1071,-.1152,-.0939,-.1102,-.0794,-.1262,-.0761,-.1215,-.0642,-.1349,-.0616,-.1355,-.0758,-.1326,-.0898,-.1578,-.098,-.1623,-.1109,-.1425,-.1325,-.1499,-.1515,-.1324,-.1618,-.1349,-.1693,-.1508,-.1766,-.1501,-.1907,-.1549,-.2097,-.184,-.188,-.1969,-.1937,-.2081,-.1946,-.221,-.2114,-.2235,-.2236,-.2398,-.2255,-.2479,-.2313,-.2383,-.2461,-.2365,-.2582,-.2184,-.2845,-.2076,-.292,-.203,-.3059,-.1892,-.3159,-.1751,-.3215]]},{n:"Michoac\xE1n",r:[[-.0155,-.4098,-.0148,-.3925,-5e-4,-.3894,.0039,-.3811,.0027,-.3711,.0062,-.3627,.019,-.3625,.0291,-.3698,.0445,-.3655,.062,-.368,.0791,-.3677,.0753,-.348,.0862,-.3416,.1076,-.3137,.1056,-.3091,.1168,-.3022,.1131,-.2917,.1192,-.265,.1156,-.2544,.1084,-.2452,.101,-.2552,.1012,-.2631,.0794,-.265,.0726,-.2622,.0603,-.264,.0615,-.2541,.0487,-.258,.0338,-.2566,.0362,-.2399,.0214,-.2376,.016,-.2461,.0019,-.246,-.001,-.2343,-.011,-.2327,-.0372,-.2379,-.049,-.2449,-.0734,-.2519,-.0726,-.2627,-.0553,-.2636,-.0577,-.2734,-.0529,-.2905,-.0405,-.3045,-.0477,-.3157,-.0626,-.3177,-.0694,-.3281,-.0782,-.3319,-.0897,-.3289,-.1017,-.3347,-.119,-.3546,-.1081,-.3688,-.103,-.3802,-.094,-.3849,-.0718,-.3907,-.0532,-.3993,-.0437,-.4006,-.0155,-.4098]]},{n:"Guerrero",r:[[.2224,-.5248,.2377,-.5163,.237,-.507,.2431,-.4972,.2541,-.4917,.2587,-.474,.2491,-.4604,.2371,-.4517,.2373,-.4415,.2333,-.4299,.236,-.4118,.2315,-.407,.2224,-.4075,.2071,-.4016,.1911,-.3859,.1898,-.379,.1838,-.3684,.1713,-.3716,.1605,-.3557,.1497,-.3492,.1439,-.3544,.1226,-.3603,.1092,-.3759,.0988,-.3576,.0973,-.3435,.0862,-.3416,.0753,-.348,.0791,-.3677,.062,-.368,.0445,-.3655,.0291,-.3698,.019,-.3625,.0062,-.3627,.0027,-.3711,.0039,-.3811,-5e-4,-.3894,-.0148,-.3925,-.0155,-.4098,-.0068,-.4047,.0081,-.412,.0191,-.4279,.0288,-.4318,.0314,-.4381,.0495,-.4462,.0609,-.4577,.1278,-.4823,.1443,-.4952,.1533,-.4986,.1685,-.4997,.2025,-.5097,.2078,-.5078,.2224,-.5248]]},{n:"Oaxaca",r:[[.5147,-.5436,.516,-.5405,.5167,-.5369,.5198,-.528,.514,-.5111,.5199,-.5001,.5203,-.4893,.5281,-.4844,.5306,-.4651,.4605,-.4603,.4361,-.4276,.4161,-.4389,.4039,-.4373,.3965,-.4196,.4054,-.4044,.4012,-.3955,.3935,-.3923,.3834,-.3938,.3755,-.3897,.3657,-.3734,.3635,-.3654,.3513,-.3602,.3427,-.3747,.3386,-.3837,.323,-.3953,.3124,-.3915,.3041,-.3937,.2966,-.4048,.2826,-.3918,.277,-.3824,.2709,-.3942,.2765,-.4037,.2661,-.4086,.2639,-.4015,.2475,-.4029,.236,-.4118,.2333,-.4299,.2373,-.4415,.2371,-.4517,.2491,-.4604,.2587,-.474,.2541,-.4917,.2431,-.4972,.237,-.507,.2377,-.5163,.2224,-.5248,.2508,-.5326,.2739,-.5492,.3072,-.5522,.335,-.5668,.354,-.5721,.3622,-.5695,.375,-.5704,.3932,-.56,.4278,-.5494,.4411,-.5363,.4661,-.5168,.472,-.5265,.4792,-.5215,.4933,-.5342,.5147,-.5436]]},{n:"M\xE9xico",r:[[.2167,-.2991,.2155,-.2902,.2191,-.2791,.213,-.2713,.204,-.2687,.1919,-.2575,.1798,-.262,.1676,-.278,.1611,-.2561,.157,-.2492,.1459,-.2473,.1375,-.2383,.1192,-.265,.1131,-.2917,.1168,-.3022,.1056,-.3091,.1076,-.3137,.0862,-.3416,.0973,-.3435,.0988,-.3576,.1092,-.3759,.1226,-.3603,.1439,-.3544,.1497,-.3492,.1605,-.3557,.162,-.3467,.1728,-.337,.1743,-.3221,.1712,-.3109,.1849,-.2913,.1958,-.3136,.1955,-.3259,.2053,-.3342,.2164,-.3306,.2167,-.2991]]},{n:"Puebla",r:[[.2164,-.3306,.2156,-.3401,.2096,-.3544,.2144,-.3734,.2058,-.3686,.1898,-.379,.1911,-.3859,.2071,-.4016,.2224,-.4075,.2315,-.407,.236,-.4118,.2475,-.4029,.2639,-.4015,.2661,-.4086,.2765,-.4037,.2709,-.3942,.277,-.3824,.2826,-.3918,.2966,-.4048,.3041,-.3937,.3124,-.3915,.323,-.3953,.3386,-.3837,.3427,-.3747,.3379,-.3645,.3256,-.3672,.3158,-.3574,.3043,-.3549,.303,-.3459,.3098,-.3385,.3074,-.3208,.3176,-.3195,.3259,-.3116,.3099,-.308,.299,-.291,.3034,-.2825,.3043,-.2684,.3146,-.2548,.3147,-.25,.2982,-.2419,.289,-.2507,.2738,-.2409,.2741,-.229,.2826,-.2307,.288,-.2243,.2812,-.217,.2735,-.2021,.2658,-.2027,.2622,-.221,.2589,-.2258,.2485,-.2368,.2523,-.2544,.2428,-.2698,.2495,-.284,.2628,-.2907,.2692,-.301,.2826,-.3055,.2808,-.3119,.2702,-.31,.2636,-.321,.2556,-.3173,.2462,-.3247,.2358,-.315,.2283,-.3009,.2167,-.2991,.2164,-.3306]]},{n:"Morelos",r:[[.2164,-.3306,.2053,-.3342,.1955,-.3259,.1903,-.3281,.1743,-.3221,.1728,-.337,.162,-.3467,.1605,-.3557,.1713,-.3716,.1838,-.3684,.1898,-.379,.2058,-.3686,.2144,-.3734,.2096,-.3544,.2156,-.3401,.2164,-.3306]]},{n:"Quer\xE9taro",r:[[.1903,-.1695,.1801,-.144,.168,-.1577,.1556,-.1606,.1457,-.1518,.141,-.1587,.1387,-.1774,.1239,-.1774,.1203,-.1947,.1152,-.1974,.0961,-.1923,.0901,-.2074,.0953,-.2292,.1084,-.2452,.1156,-.2544,.1192,-.265,.1375,-.2383,.1391,-.2238,.1506,-.2202,.1608,-.2131,.1607,-.2007,.1658,-.1962,.1691,-.1808,.1903,-.1761,.1903,-.1695]]},{n:"Hidalgo",r:[[.1903,-.1695,.1903,-.1761,.1691,-.1808,.1658,-.1962,.1607,-.2007,.1608,-.2131,.1506,-.2202,.1391,-.2238,.1375,-.2383,.1459,-.2473,.157,-.2492,.1611,-.2561,.1676,-.278,.1798,-.262,.1919,-.2575,.204,-.2687,.213,-.2713,.2191,-.2791,.2155,-.2902,.2212,-.2868,.2371,-.2887,.2414,-.281,.2495,-.284,.2428,-.2698,.2523,-.2544,.2485,-.2368,.2589,-.2258,.2575,-.2131,.2516,-.2111,.2368,-.2293,.2259,-.2345,.2215,-.2266,.2302,-.2119,.2331,-.1976,.2437,-.1932,.2504,-.1836,.245,-.1779,.2319,-.176,.2265,-.1699,.225,-.1601,.22,-.1735,.2047,-.176,.1971,-.1679,.1903,-.1695]]},{n:"Guanajuato",r:[[.141,-.1587,.13,-.1558,.1223,-.149,.1007,-.1401,.0944,-.1518,.086,-.1534,.064,-.1349,.0443,-.1333,.04,-.1261,.0272,-.1284,.0233,-.1329,.026,-.143,.0195,-.1516,.0237,-.1638,.0052,-.1781,-.0074,-.1979,-.01,-.2082,-.0031,-.2207,-.011,-.2327,-.001,-.2343,.0019,-.246,.016,-.2461,.0214,-.2376,.0362,-.2399,.0338,-.2566,.0487,-.258,.0615,-.2541,.0603,-.264,.0726,-.2622,.0794,-.265,.1012,-.2631,.101,-.2552,.1084,-.2452,.0953,-.2292,.0901,-.2074,.0961,-.1923,.1152,-.1974,.1203,-.1947,.1239,-.1774,.1387,-.1774,.141,-.1587]]},{n:"San Luis Potos\xED",r:[[.0728,.0671,.0618,.0532,.0453,.0261,.0069,-.0035,-.0092,-.0197,-.0169,-.0162,-.021,-.0316,-.0209,-.0463,-.0121,-.0626,-.0013,-.0705,.0066,-.0824,.02,-.0812,.0277,-.0733,.0383,-.0746,.0416,-.0824,.0365,-.0911,.0403,-.1096,.0272,-.1284,.04,-.1261,.0443,-.1333,.064,-.1349,.086,-.1534,.0944,-.1518,.1007,-.1401,.1223,-.149,.13,-.1558,.141,-.1587,.1457,-.1518,.1556,-.1606,.168,-.1577,.1801,-.144,.1903,-.1695,.1971,-.1679,.2047,-.176,.22,-.1735,.225,-.1601,.224,-.1511,.2167,-.145,.2267,-.1347,.2235,-.119,.2292,-.1184,.2352,-.106,.2343,-.0979,.2184,-.0869,.1971,-.0903,.1768,-.084,.1682,-.0679,.1566,-.0724,.1281,-.0612,.1246,-.0547,.1328,-.0483,.1235,-.0279,.0984,-.0287,.0952,.0137,.0891,.0216,.0871,.0469,.0728,.0671]]},{n:"Zacatecas",r:[[.0728,.0671,.0551,.0726,.0485,.0838,.0389,.0849,.031,.0804,.0225,.0899,.0109,.0939,.0048,.1038,-.0158,.1101,-.0427,.1073,-.0483,.104,-.0368,.0857,-.0366,.0606,-.0571,.056,-.0865,.0618,-.1042,.0511,-.1143,.0382,-.1252,.0327,-.1262,.0159,-.1321,-.0045,-.1432,-.014,-.1449,-.0318,-.1485,-.0367,-.1498,-.0707,-.1565,-.0941,-.1578,-.098,-.1326,-.0898,-.1355,-.0758,-.1349,-.0616,-.1215,-.0642,-.1262,-.0761,-.1102,-.0794,-.1152,-.0939,-.1148,-.1071,-.1024,-.1073,-.0938,-.0919,-.0948,-.0799,-.0732,-.0989,-.0805,-.1171,-.0892,-.118,-.1049,-.1301,-.1044,-.1457,-.114,-.1537,-.1194,-.1674,-.1091,-.1749,-.0942,-.178,-.0855,-.1831,-.0734,-.1834,-.0739,-.1697,-.0646,-.1685,-.0495,-.16,-.0466,-.148,-.0555,-.1451,-.0544,-.135,-.0598,-.1218,-.047,-.1017,-.0271,-.0885,-.0036,-.099,-.0031,-.1081,.0058,-.1157,.0204,-.1219,.0272,-.1284,.0403,-.1096,.0365,-.0911,.0416,-.0824,.0383,-.0746,.0277,-.0733,.02,-.0812,.0066,-.0824,-.0013,-.0705,-.0121,-.0626,-.0209,-.0463,-.021,-.0316,-.0169,-.0162,-.0092,-.0197,.0069,-.0035,.0453,.0261,.0618,.0532,.0728,.0671]]},{n:"Aguascalientes",r:[[.0058,-.1157,-.0031,-.1081,-.0036,-.099,-.0271,-.0885,-.047,-.1017,-.0598,-.1218,-.0544,-.135,-.0458,-.1333,-.0382,-.1381,-.0196,-.1401,-.0096,-.1336,-.0076,-.1266,.0058,-.1157]]},{n:"Durango",r:[[-.3294,.1445,-.3398,.1285,-.3418,.112,-.3359,.0926,-.3174,.0771,-.3086,.0612,-.3069,.053,-.2943,.0474,-.2806,.0546,-.2712,.0469,-.2643,.0318,-.2609,.0061,-.2489,-.0119,-.2471,-.0239,-.2381,-.0335,-.2277,-.0344,-.2275,-.0428,-.2105,-.044,-.1982,-.0512,-.1945,-.0603,-.2015,-.0685,-.1999,-.0781,-.187,-.0684,-.18,-.072,-.1747,-.0839,-.1674,-.087,-.1581,-.0829,-.1565,-.0941,-.1498,-.0707,-.1485,-.0367,-.1449,-.0318,-.1432,-.014,-.1321,-.0045,-.1262,.0159,-.1252,.0327,-.1143,.0382,-.1042,.0511,-.0865,.0618,-.0571,.056,-.0366,.0606,-.0368,.0857,-.0483,.104,-.0581,.0915,-.0599,.0788,-.0794,.0875,-.0867,.0928,-.0883,.1035,-.0957,.1085,-.1037,.1198,-.0982,.129,-.1023,.1372,-.0913,.1485,-.0929,.1791,-.0887,.189,-.0917,.1995,-.1115,.2164,-.1322,.2247,-.1437,.2256,-.1515,.2221,-.1703,.1969,-.1754,.1953,-.1909,.2051,-.2096,.2098,-.2234,.2031,-.2385,.2113,-.2466,.2203,-.255,.2199,-.2695,.2304,-.2825,.2104,-.2826,.2009,-.2941,.1975,-.2926,.1796,-.3022,.1697,-.3035,.1544,-.3151,.1438,-.3294,.1445]]},{n:"Tlaxcala",r:[[.2495,-.284,.2414,-.281,.2371,-.2887,.2212,-.2868,.2155,-.2902,.2167,-.2991,.2283,-.3009,.2358,-.315,.2462,-.3247,.2556,-.3173,.2636,-.321,.2702,-.31,.2808,-.3119,.2826,-.3055,.2692,-.301,.2628,-.2907,.2495,-.284]]},{n:"Distrito Federal",r:[[.1955,-.3259,.1958,-.3136,.1849,-.2913,.1712,-.3109,.1743,-.3221,.1903,-.3281,.1955,-.3259]]}];var ls=[[-.95,-.05],[-.98,.14],[-.92,.34],[-.8,.5],[-.64,.63],[-.45,.72],[-.22,.78],[.02,.8],[.24,.77],[.44,.69],[.62,.56],[.77,.4],[.88,.22],[.94,.03],[.93,-.12],[.86,-.24],[.74,-.31],[.58,-.3],[.44,-.29],[.3,-.35],[.12,-.41],[-.08,-.45],[-.27,-.46],[-.42,-.42],[-.5,-.33],[-.55,-.24],[-.66,-.21],[-.8,-.19],[-.9,-.13]],Oh=[[[.08,.79],[.02,.6],[.07,.44],[-.01,.27],[.03,.1],[-.02,0]],[[-.14,.77],[-.19,.58],[-.14,.42],[-.21,.25],[-.17,.07]],[[.27,.74],[.21,.56],[.27,.4],[.2,.24],[.25,.1]],[[-.57,-.21],[-.36,-.12],[-.12,-.06],[.12,.01],[.33,.09],[.46,.2]],[[-.44,-.33],[-.18,-.25],[.08,-.2],[.32,-.13],[.55,-.05],[.66,.04]],[[-.3,-.42],[-.06,-.36],[.18,-.31],[.4,-.25]],[[-.88,.4],[-.7,.52],[-.5,.55],[-.34,.62]],[[-.92,.18],[-.74,.26],[-.56,.22],[-.42,.32],[-.3,.18]],[[-.82,.31],[-.64,.39],[-.5,.36],[-.4,.46]],[[-.7,.06],[-.55,.09],[-.42,.04],[-.33,.1]],[[.36,.58],[.5,.48],[.62,.42],[.72,.26]],[[.31,.38],[.46,.31],[.57,.2],[.74,.1]],[[.7,-.02],[.8,-.08],[.88,-.17]],[[.55,.62],[.66,.5],[.8,.36]]],Bh={cx:.62,cy:-.47,rx:.33,ry:.17},zh=[[.3,-.38],[.33,-.6],[.37,-.88]];function Fl(i,t){let e=!1;for(let n=0,s=ls.length-1;n<ls.length;s=n++){let[r,a]=ls[n],[o,l]=ls[s];a>t!=l>t&&i<(o-r)*(t-a)/(l-a)+r&&(e=!e)}return e}function Vs(i,t){let e=Math.min(1,Math.hypot(i/.98,(t-.17)/.66));return Math.sqrt(Math.max(0,1-e*e))*.42}var Ug=new Ht("#2ef2b5"),Ng=new Ht("#22d8e6"),Fg=new Ht("#4d8bff"),Gs=1337,Yt=()=>(Gs=Gs*16807%2147483647)/2147483647,ei=()=>{let i=0,t=0;for(;!i;)i=Yt();for(;!t;)t=Yt();return Math.sqrt(-2*Math.log(i))*Math.cos(2*Math.PI*t)},Ol=i=>i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2,cs=i=>Math.max(0,Math.min(1,i));function kh(i,t,e){let n=!1;for(let s=0,r=e.length-2;s<e.length;r=s,s+=2){let a=e[s],o=e[s+1],l=e[r],c=e[r+1];o>t!=c>t&&i<(l-a)*(t-o)/(c-o)+a&&(n=!n)}return n}function Bl(i,t,e,n=0,s=0){let r=[],a=0;i.forEach(o=>{for(let l=0;l<o.length;l+=2){let c=(l+2)%o.length,h=Math.hypot(o[c]-o[l],o[c+1]-o[l+1]);r.push([o[l],o[l+1],o[c],o[c+1],h]),a+=h}});for(let o=0;o<t;o++){let l=Yt()*a,c=r[0];for(let u of r)if(l-=u[4],l<=0){c=u;break}let h=Yt();e.push(c[0]+(c[2]-c[0])*h+ei()*s,c[1]+(c[3]-c[1])*h+ei()*s,n+ei()*s)}}var ti=[13,2,3,14,12,14,11,22,21,10,12,10].map((i,t)=>(t%2?-(i-12):i-12)*.15);function kl(i,t,e,n=10){let s=[],r=i/2,a=t/2;return[[r-e,a-e,0],[-r+e,a-e,Math.PI/2],[-r+e,-a+e,Math.PI],[r-e,-a+e,1.5*Math.PI]].forEach(([l,c,h])=>{for(let u=0;u<=n;u++){let f=h+u/n*Math.PI/2;s.push(l+Math.cos(f)*e,c+Math.sin(f)*e)}}),s}var Hh={dust(i){let t=[];for(let e=0;e<i;e++)t.push((Yt()-.5)*22,(Yt()-.5)*12,-8+Yt()*9);return t},brain(i){let t=Gh,e=[],n=Wh(),s=(r,a,o)=>{let l=[],c=0;r.forEach(h=>{for(let u=0;u<h.length-1;u++){let f=h[u].distanceTo(h[u+1]);l.push([h[u],h[u+1],f]),c+=f}});for(let h=0;h<a;h++){let u=Yt()*c,f=l[0];for(let y of l)if(u-=y[2],u<=0){f=y;break}let p=Yt(),_=f[0].clone().lerp(f[1],p);e.push((_.x+ei()*o)*t,(_.y+ei()*o)*t,(_.z+ei()*o*.5)*t)}};for(s([n.outline],Math.floor(i*.26),.006),s(n.sulci,Math.floor(i*.34),.007),s(n.cereb,Math.floor(i*.12),.006),s([n.stem],Math.floor(i*.04),.012);e.length/3<i;){let r=(Yt()-.5)*2,a=-.5+Yt()*1.32;if(Fl(r,a)){let o=Vs(r,a);e.push(r*t,a*t,(Yt()*2-1)*o*t)}}return e},bolt(i){let t=[],e=kl(4.4,4.4,1.05),n=Math.floor(i*.22),s=Math.floor(i*.2);Bl([e],n,t,0,.03),Bl([ti],s,t,0,.015);let r=t.length/3;for(;r<i;){let a=(Yt()-.5)*2.8,o=(Yt()-.5)*3.2;kh(a,o,ti)&&(t.push(a,o,(Yt()-.5)*.5),r++)}return t},mexico(i){let t=jn,e=[],n=[];Nl.forEach(a=>a.r.forEach(o=>n.push(o.map(l=>l*t))));let s=Math.floor(i*.3);Bl(n,s,e,Si+.03,.004);let r=e.length/3;for(;r<i;){let a=(Yt()-.5)*2*t,o=(Yt()-.5)*1.32*t;for(let l of n)if(kh(a,o,l)){e.push(a,o,Si+.03+Yt()*.03),r++;break}}return e},circuit(i){let t=[],e=[];for(let r=0;r<4;r++)for(let a=0;a<9;a++){let o=(a-4)*.26,l=[[1.6,o]],c=1.6,h=o,u=2+Math.floor(Yt()*3);for(let y=0;y<u;y++)c+=.3+Yt()*.55,l.push([c,h]),y<u-1&&(h+=(Yt()-.5)*.8,l.push([c,h]));let f=r*Math.PI/2,p=Math.cos(f),_=Math.sin(f);e.push(l.map(([y,m])=>[y*p-m*_,y*_+m*p]))}let n=[],s=0;e.forEach(r=>{for(let a=0;a<r.length-1;a++){let o=Math.hypot(r[a+1][0]-r[a][0],r[a+1][1]-r[a][1]);n.push([r[a],r[a+1],o]),s+=o}});for(let r=0;r<i;r++){if(Yt()<.06){let c=Yt()*6.283,h=1.8+Yt()*2.2;t.push(Math.cos(c)*h,Math.sin(c)*h,-.35);continue}let a=Yt()*s,o=n[0];for(let c of n)if(a-=c[2],a<=0){o=c;break}let l=Yt();t.push(o[0][0]+(o[1][0]-o[0][0])*l,o[0][1]+(o[1][1]-o[0][1])*l,-.32)}return t},stream(i){let t=[];for(let e=0;e<i;e++){let n=(Yt()-.5)*16,s=Math.sin(n*.45+1)*.55+ei()*.32;t.push(n,s,ei()*.9)}return t},sphere(i){let t=[],e=Math.PI*(3-Math.sqrt(5));for(let n=0;n<i;n++){let s=1-n/(i-1)*2,r=Math.sqrt(1-s*s),a=e*n,o=1.8*(1+(Yt()<.1?Yt()*.25:0));t.push(Math.cos(a)*r*o,s*o,Math.sin(a)*r*o)}return t}},jn=3.1,Si=.07,Gh=1.7,zl=null;function Wh(){if(zl)return zl;let i=(h,u,f)=>new N(h,u,f),t=new gi(ls.map(([h,u])=>i(h,u,0)),!0,"centripetal").getPoints(240),e=Oh.map(h=>new gi(h.map(([u,f])=>i(u,f,Vs(u,f))),!1,"centripetal").getPoints(60)),{cx:n,cy:s,rx:r,ry:a}=Bh,o=[],l=[];for(let h=0;h<=80;h++){let u=h/80*Math.PI*2;l.push(i(n+Math.cos(u)*r,s+Math.sin(u)*a,0))}o.push(l);for(let h=-2;h<=2;h++){let u=s+h*a*.36,f=Math.sqrt(Math.max(0,1-Math.pow(h*.36,2)))*r*.92,p=[];for(let _=0;_<=30;_++){let y=n-f+_/30*2*f;p.push(i(y,u+Math.sin(_*.9)*.008,.06*Math.sqrt(Math.max(0,1-Math.pow((y-n)/r,2)))))}o.push(p)}let c=new gi(zh.map(([h,u])=>i(h,u,0))).getPoints(30);return zl={outline:t,sulci:e,cereb:o,stem:c}}function Og(i){let t;try{t=new Or({canvas:i,antialias:!0,alpha:!0,powerPreference:"high-performance"})}catch{return null}t.setClearColor(0,0),t.toneMapping=zs,t.toneMappingExposure=1.05;let e=new Br,n=new Oe(35,16/9,.1,100);n.position.set(0,0,10);let s=new Pe;e.add(s);let r=new Pe;s.add(r),e.add(new jr(9418495,.35));let a=new Bs(3076789,60,30);a.position.set(4,4,6),e.add(a);let o=new Bs(5082111,50,30);o.position.set(-5,-2,5),e.add(o);let l=new Qr(16777215,.8);l.position.set(-2,5,-4),e.add(l);let c=Math.min(1,(navigator.hardwareConcurrency||4)/8)>.5?1:.7,h=Math.round(16e3*c),u=document.createElement("canvas");u.width=384,u.height=128;let f=new ts(u);f.anisotropy=4;function p(){let G=u.getContext("2d");G.clearRect(0,0,384,128),G.fillStyle="#fff",G.textAlign="center",G.textBaseline="middle",G.font="600 104px 'Geist Mono', 'JetBrains Mono', monospace",G.fillText("0",64,68),G.fillText("1",192,68),G.beginPath(),G.arc(320,64,22,0,Math.PI*2),G.fill(),f.needsUpdate=!0}p();let _=new ye,y=new Float32Array(h*3),m=new Float32Array(h*3),d=new Float32Array(h*4),A=new Float32Array(h);for(let G=0;G<h;G++){d.set([Yt(),Yt(),Yt(),Yt()],G*4);let st=Yt();A[G]=st<.44?0:st<.88?1:2}let S=Hh.dust(h);y.set(S),m.set(S),_.setAttribute("position",new be(m,3)),_.setAttribute("aFrom",new be(y,3)),_.setAttribute("aTo",_.getAttribute("position")),_.setAttribute("aRand",new be(d,4)),_.setAttribute("aGlyph",new be(A,1));let v={uT:{value:1},uTime:{value:0},uSize:{value:30},uPix:{value:1},uAtlas:{value:f},uOpacity:{value:.35},uDots:{value:0},uFlow:{value:0},uPulse:{value:0},uWave:{value:0},uMorphX:{value:0},uC1:{value:Ug.clone()},uC2:{value:Ng.clone()},uC3:{value:Fg.clone()}},I=new pe({uniforms:v,transparent:!0,depthWrite:!1,blending:qe,vertexShader:`
      attribute vec3 aFrom; attribute vec3 aTo; attribute vec4 aRand; attribute float aGlyph;
      uniform float uT, uTime, uSize, uPix, uFlow, uPulse, uWave, uMorphX;
      varying float vGlyph, vBright, vMix, vFade;
      void main(){
        float d = mix(aRand.x, clamp(aTo.x * .08 + .5, 0., 1.), uMorphX) * .45;
        float t = clamp((uT - d) / .55, 0., 1.);
        t = t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.;
        vec3 p = mix(aFrom, aTo, t);
        // trayecto curvo durante la transici\xF3n
        float arc = sin(t * 3.14159);
        p += arc * vec3((aRand.y - .5) * 1.6, (aRand.z - .5) * 1.2, (aRand.w - .5) * 2.4);
        // vida sutil
        p += .012 * vec3(sin(uTime * (.7 + aRand.y) + aRand.x * 30.), cos(uTime * (.6 + aRand.z) + aRand.y * 30.), sin(uTime * .5 + aRand.w * 20.));
        // flujo binario
        float fx = p.x + uTime * (.35 + aRand.y * .9);
        fx = mod(fx + 8., 16.) - 8.;
        p.x = mix(p.x, fx, uFlow);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        // pulsos de actividad
        float w = uWave < .5 ? dot(p, normalize(vec3(.6, .35, .7))) * 4.5 - uTime * 2.2 : length(p.xy) * 3.2 + uTime * 3.;
        float fire = pow(max(0., sin(w)), 42.) * uPulse * .8;
        float twinkle = .55 + .45 * sin(uTime * (1.2 + aRand.z * 2.) + aRand.w * 40.);
        vBright = .3 + .5 * twinkle + fire * 1.6;
        vMix = aRand.w + fire;
        vGlyph = aGlyph;
        vFade = smoothstep(-22., -6., mv.z);
        float s = uSize * (.55 + aRand.y * .75) * (aGlyph > 1.5 ? .55 : 1.) * (1. + fire * .6);
        gl_PointSize = s * uPix / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
      uniform sampler2D uAtlas; uniform float uOpacity, uDots; uniform vec3 uC1, uC2, uC3;
      varying float vGlyph, vBright, vMix, vFade;
      void main(){
        float gg = uDots > .5 ? 2. : vGlyph;
        vec2 uv = vec2((gl_PointCoord.x + gg) / 3., 1. - gl_PointCoord.y);
        float a = texture2D(uAtlas, uv).a;
        if (a < .02) discard;
        vec3 c = mix(uC1, uC2, smoothstep(.35, .8, vMix));
        c = mix(c, uC3, smoothstep(.85, 1., vMix) * .6);
        c = mix(c, vec3(1.), clamp(vBright - 1.2, 0., 1.) * .7);
        gl_FragColor = vec4(c * vBright, a * uOpacity * vFade);
      }`}),w=new Ls(_,I);w.frustumCulled=!1,r.add(w);let C=[],E=new Pe;r.add(E);let g={m:null},x={t:null,draw:null};{let G=Gh,st=Wh(),lt=(Nt,jt,me)=>{let ee=new ye().setFromPoints(Nt.map(Me=>Me.clone().multiplyScalar(G))),ge=new bn({color:jt,transparent:!0,opacity:me,blending:qe,depthWrite:!1});ge.userData.base=me,E.add(new mi(ee,ge))};lt(st.outline,8386815,.9),st.sulci.forEach(Nt=>lt(Nt,3664127,.5)),st.cereb.forEach(Nt=>lt(Nt,3664127,.45)),lt(st.stem,8386815,.7);let dt=[];for(;dt.length<240;){let Nt=(Yt()-.5)*2,jt=-.5+Yt()*1.32;if(Fl(Nt,jt)){let me=Vs(Nt,jt);dt.push(new N(Nt,jt,(Yt()*2-1)*me*.9))}}let pt=[];dt.forEach((Nt,jt)=>{dt.map((ee,ge)=>[Nt.distanceTo(ee),ge]).filter(ee=>ee[1]!==jt&&ee[0]<.3).sort((ee,ge)=>ee[0]-ge[0]).slice(0,3).forEach(([,ee])=>{ee>jt&&pt.push(Nt.x*G,Nt.y*G,Nt.z*G,dt[ee].x*G,dt[ee].y*G,dt[ee].z*G)})});let It=new bn({color:5082111,transparent:!0,opacity:.22,blending:qe,depthWrite:!1});It.userData.base=.22,E.add(new ji(new ye().setAttribute("position",new he(pt,3)),It));let _t=new Pe;_t.position.set(-.04*G,.2*G,(Vs(-.04,.2)+.08)*G),E.add(_t);let zt=new ne(new os(.62,.62,.08,3,.05),new Ze({color:467002,metalness:.6,roughness:.3,emissive:736090,emissiveIntensity:.6,transparent:!0}));zt.material.userData.base=1,_t.add(zt);let D=document.createElement("canvas");D.width=D.height=512;let et=new ts(D);et.colorSpace=Ge;let k=()=>{let Nt=D.getContext("2d");Nt.clearRect(0,0,512,512);let jt=Nt.createLinearGradient(0,0,512,512);jt.addColorStop(0,"#0c4a6e"),jt.addColorStop(1,"#063247"),Nt.fillStyle=jt,Nt.beginPath(),Nt.roundRect(28,28,456,456,64),Nt.fill(),Nt.shadowColor="#5ff6ff",Nt.shadowBlur=40,Nt.strokeStyle="#9ffcff",Nt.lineWidth=14,Nt.stroke(),Nt.shadowBlur=50,Nt.fillStyle="#ffffff",Nt.textAlign="center",Nt.textBaseline="middle";try{Nt.fontStretch="expanded"}catch{}Nt.font="800 230px Archivo, 'Geist', sans-serif",Nt.fillText("IA",256,270),Nt.shadowBlur=0,et.needsUpdate=!0};k(),x.draw=k;let j=new ne(new Sn(.6,.6),new On({map:et,transparent:!0,toneMapped:!1,depthWrite:!1}));j.material.userData.base=1,j.position.z=.046,_t.add(j);let mt=[];for(let Nt=0;Nt<4;Nt++)for(let jt=0;jt<4;jt++){let me=(jt-1.5)*.12,ee=Nt*Math.PI/2,ge=Math.cos(ee),Me=Math.sin(ee),Ae=.32,ue=me,Re=[[Ae,ue]];Ae+=.12+(jt+Nt)%3*.08,Re.push([Ae,ue]),ue+=((jt+Nt*2)%3-1)*.14,Re.push([Ae,ue]),Ae+=.18+(jt*3+Nt)%4*.07,Re.push([Ae,ue]),mt.push(Re.map(([De,Ue])=>[De*ge-Ue*Me,De*Me+Ue*ge]))}let gt=[],At=[];mt.forEach((Nt,jt)=>{let me=0;for(let ee=0;ee<Nt.length-1;ee++){let[ge,Me]=Nt[ee],[Ae,ue]=Nt[ee+1],Re=Math.hypot(Ae-ge,ue-Me),De=-(ue-Me)/Re*.012,Ue=(Ae-ge)/Re*.012;[[ge+De,Me+Ue,me],[ge-De,Me-Ue,me],[Ae+De,ue+Ue,me+Re],[Ae+De,ue+Ue,me+Re],[ge-De,Me-Ue,me],[Ae-De,ue-Ue,me+Re]].forEach(([b,B,Y])=>{gt.push(b,B,0),At.push(Y+jt*.23)}),me+=Re}});let Jt=new ye;Jt.setAttribute("position",new he(gt,3)),Jt.setAttribute("aD",new he(At,1));let le=new pe({uniforms:{uTime:v.uTime,uOp:{value:0}},transparent:!0,depthWrite:!1,blending:qe,side:We,vertexShader:"attribute float aD; varying float vD; void main(){ vD = aD; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",fragmentShader:"uniform float uTime, uOp; varying float vD; void main(){ float p = fract(vD * 1.6 - uTime * .5); float head = pow(p, 10.) * 2.2; vec3 c = mix(vec3(.2,.7,1.), vec3(.6,1.,1.), head); gl_FragColor = vec4(c * (.5 + head), (.45 + head) * uOp); }"});C.push(le),E.userData.traceMat=le;let $t=new ne(Jt,le);$t.position.z=-.01,_t.add($t);let Ie=[],Qt=[];for(let Nt=-2.7;Nt<=2.71;Nt+=.15)for(let jt=0;jt<26;jt++)Ie.push(Nt,-1.62,-6+jt*.27+Yt()*.1),Qt.push(Yt()<.5?0:1,Yt());let ve=new ye;ve.setAttribute("position",new he(Ie,3)),ve.setAttribute("aR",new he(Qt,2));let dn=new pe({uniforms:{uTime:v.uTime,uOp:{value:0},uPix:v.uPix,uAtlas:v.uAtlas},transparent:!0,depthWrite:!1,blending:qe,vertexShader:`attribute vec2 aR; uniform float uTime, uOp, uPix; varying float vA, vG;
        void main(){ vec3 p = position; float L = 7.2; p.z = mod(position.z + 6. + uTime * (.45 + aR.y * .35), L) - 6.;
          float far = smoothstep(-6., -3.6, p.z), near = 1. - smoothstep(.3, 1.2, p.z), edge = 1. - smoothstep(1.6, 2.7, abs(p.x));
          vA = far * near * edge * uOp * (.55 + .45 * sin(uTime * 3. + aR.y * 50.)); vG = aR.x;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = 13. * uPix / -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:"uniform sampler2D uAtlas; varying float vA, vG; void main(){ vec2 uv = vec2((gl_PointCoord.x + vG) / 3., 1. - gl_PointCoord.y); float a = texture2D(uAtlas, uv).a; if (a < .05) discard; gl_FragColor = vec4(vec3(.35,.85,1.) * .95, a * vA * .8); }"});g.m=dn;let Ee=new Ls(ve,dn);Ee.frustumCulled=!1,s.add(Ee)}let T=(G,st)=>G.traverse(lt=>{let dt=lt.material;!dt||dt.isShaderMaterial||(dt.userData.base===void 0&&(dt.userData.base=dt.opacity),dt.transparent=!0,dt.opacity=dt.userData.base*st)}),U=new Pe;r.add(U);{let G=new $n;for(let et=0;et<ti.length;et+=2)(et?G.lineTo:G.moveTo).call(G,ti[et]*.82,ti[et+1]*.82);let st=new vi(G,{depth:.28,bevelEnabled:!0,bevelThickness:.07,bevelSize:.05,bevelSegments:4});st.center();let lt=new Ze({color:875080,emissive:3076789,emissiveIntensity:1.05,metalness:.2,roughness:.25});U.add(new ne(st,lt));let dt=kl(3.7,3.7,.95),pt=kl(3.42,3.42,.82),It=new $n;for(let et=0;et<dt.length;et+=2)(et?It.lineTo:It.moveTo).call(It,dt[et],dt[et+1]);let _t=new es;for(let et=0;et<pt.length;et+=2)(et?_t.lineTo:_t.moveTo).call(_t,pt[et],pt[et+1]);It.holes.push(_t);let zt=new vi(It,{depth:.22,bevelEnabled:!0,bevelThickness:.04,bevelSize:.03,bevelSegments:3,curveSegments:24});zt.center(),U.add(new ne(zt,new Ze({color:666154,emissive:1690010,emissiveIntensity:.55,metalness:.7,roughness:.3})));let D=new ne(new Sn(3.5,3.5),new Ze({color:398876,emissive:736051,emissiveIntensity:.35,transparent:!0,opacity:.55,roughness:.6}));D.position.z=-.12,U.add(D)}let O=new Pe;r.add(O);{let G=new ne(new os(3.1,3.1,.22,4,.08),new Ze({color:660774,metalness:.75,roughness:.32}));O.add(G);let st=new ne(new os(2.05,2.05,.16,4,.05),new Ze({color:926264,metalness:.9,roughness:.18,emissive:666682,emissiveIntensity:.4}));st.position.z=.17,O.add(st);let lt=[];for(let Qt=-4;Qt<=4;Qt++){let ve=Qt*.2;lt.push(-.9,ve,0,.9,ve,0,ve,-.9,0,ve,.9,0)}let dt=new ji(new ye().setAttribute("position",new he(lt,3)),new bn({color:2283750,transparent:!0,opacity:.16}));dt.position.z=.255,O.add(dt);let pt=new $n;for(let Qt=0;Qt<ti.length;Qt+=2)(Qt?pt.lineTo:pt.moveTo).call(pt,ti[Qt]*.36,ti[Qt+1]*.36);let It=new vi(pt,{depth:.05,bevelEnabled:!0,bevelThickness:.02,bevelSize:.015,bevelSegments:2});It.center();let _t=new ne(It,new Ze({color:875080,emissive:3076789,emissiveIntensity:.95}));_t.position.z=.29,O.add(_t);let zt=new Mn(.07,.22,.04),D=new Ze({color:10480084,metalness:1,roughness:.25,emissive:802099,emissiveIntensity:.4}),et=new kr(zt,D,4*18),k=0,j=new ae,mt=new xn,gt=new N,At=new N(1,1,1);for(let Qt=0;Qt<4;Qt++)for(let ve=0;ve<18;ve++){let dn=(ve-8.5)*.155,Ee=Qt*Math.PI/2,Nt=Math.cos(Ee)*1.66-Math.sin(Ee)*dn,jt=Math.sin(Ee)*1.66+Math.cos(Ee)*dn;mt.setFromAxisAngle(new N(0,0,1),Ee+Math.PI/2),gt.set(Nt,jt,-.02),et.setMatrixAt(k++,j.compose(gt,mt,At))}O.add(et);let Jt=new ye,le=[],$t=[];for(let Qt=0;Qt<4;Qt++)for(let ve=0;ve<9;ve++){let dn=(ve-4)*.31,Ee=Qt*Math.PI/2,Nt=Math.cos(Ee),jt=Math.sin(Ee),me=1.78,ee=dn,ge=0,Me=[[me,ee]],Ae=2+(ve*7+Qt*3)%3;for(let ue=0;ue<Ae;ue++)me+=.5+(ve+ue*3+Qt)%4*.3,Me.push([me,ee]),ue<Ae-1&&(ee+=((ve+ue+Qt)%3-1)*.32,Me.push([me,ee]));for(let ue=0;ue<Me.length-1;ue++){let[Re,De]=Me[ue],[Ue,b]=Me[ue+1],B=Math.hypot(Ue-Re,b-De),Y=-(b-De)/B*.018,J=(Ue-Re)/B*.018,z=[[Re+Y,De+J,ge],[Re-Y,De-J,ge],[Ue+Y,b+J,ge+B],[Ue-Y,b-J,ge+B]],xt=([Rt,Dt,Ut])=>{le.push(Rt*Nt-Dt*jt,Rt*jt+Dt*Nt,-.08),$t.push(Ut+ve*.37+Qt*.91)};[z[0],z[1],z[2],z[2],z[1],z[3]].forEach(xt),ge+=B}}Jt.setAttribute("position",new he(le,3)),Jt.setAttribute("aD",new he($t,1));let Ie=new pe({uniforms:{uTime:v.uTime,uOp:{value:1}},transparent:!0,depthWrite:!1,blending:qe,side:We,vertexShader:"attribute float aD; varying float vD; void main(){ vD = aD; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",fragmentShader:"uniform float uTime, uOp; varying float vD; void main(){ float p = fract(vD * .55 + uTime * .45); float head = pow(p, 14.) * 2.4; vec3 c = mix(vec3(.08,.35,.4), vec3(.18,.95,.71), head); gl_FragColor = vec4(c * (.35 + head), (.32 + head) * uOp); }"});C.push(Ie),O.add(new ne(Jt,Ie))}let V=new Pe;r.add(V);let tt=[],Z=[];{let G=new Ze({color:1058890,metalness:.5,roughness:.35,emissive:870982,emissiveIntensity:.35}),st=new bn({color:3076789,transparent:!0,opacity:.55});Nl.forEach((lt,dt)=>{let pt=new Pe,It=0,_t=0,zt=0,D=0;if(lt.r.forEach(et=>{let k=new $n;for(let At=0;At<et.length;At+=2)(At?k.lineTo:k.moveTo).call(k,et[At]*jn,et[At+1]*jn);let j=new ne(new vi(k,{depth:Si,bevelEnabled:!1}),G.clone());pt.add(j);let mt=[];for(let At=0;At<et.length;At+=2)mt.push(et[At]*jn,et[At+1]*jn,Si+.002);pt.add(new Gr(new ye().setAttribute("position",new he(mt,3)),st));let gt=0;for(let At=0;At<et.length;At+=2){let Jt=(At+2)%et.length;gt+=et[At]*et[Jt+1]-et[Jt]*et[At+1],It+=et[At],_t+=et[At+1],zt++}D+=Math.abs(gt)}),It=It/zt*jn,_t=_t/zt*jn,pt.userData={delay:(It/jn+1)*.5,cx:It,cy:_t},V.add(pt),tt.push(pt),D>.004){let et=.45+dt*37%11/11*.5,k=new pe({uniforms:{uTime:v.uTime,uOp:{value:0},uPh:{value:dt*.7}},transparent:!0,depthWrite:!1,blending:qe,side:We,vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",fragmentShader:"uniform float uTime, uOp, uPh; varying vec2 vUv; void main(){ float edge = 1. - abs(vUv.x - .5) * 2.; float fade = (1. - vUv.y); float run = pow(fract(vUv.y * 1.2 - uTime * .6 + uPh), 10.); vec3 c = mix(vec3(.13,.85,.9), vec3(.18,.95,.71), vUv.y); gl_FragColor = vec4(c, (fade * .55 + run * .9) * pow(edge, 3.) * uOp); }"}),j=new Pe;for(let mt=0;mt<2;mt++){let gt=new ne(new Sn(.06,et),k);gt.rotation.x=Math.PI/2,gt.rotation.y=mt*Math.PI/2,gt.position.z=Si+et/2,j.add(gt)}j.position.set(It,_t,0),j.userData={mat:k,delay:pt.userData.delay},V.add(j),Z.push(j)}})}let at=new Pe;V.add(at);let Q=[],vt=[];{tt.forEach((D,et)=>{et%2===0&&vt.push(new N(D.userData.cx,D.userData.cy,Si))});let G=new hn().setFromObject(V),st=G.getCenter(new N),lt=G.getSize(new N),dt=new Ze({color:10465478,metalness:.3,roughness:.55,emissive:3076789,emissiveIntensity:.35}),pt=new Ze({color:660516,metalness:.3,roughness:.6,emissive:2777028,emissiveIntensity:.18,side:We}),It=new Mn(.05,.05,.03),_t=new Sn(.16,.045);[[-.5,.32],[.05,.38],[.55,.3]].forEach(([D,et],k)=>{for(let gt=0;gt<5;gt++){let At=new Pe;At.add(new ne(It,dt)),[-1,1].forEach(Jt=>{let le=new ne(_t,pt);le.position.x=Jt*.11,At.add(le)}),At.userData={pi:k,ph:gt/5+k*.11,off:D,tilt:et},at.add(At),Q.push(At)}let j=[];for(let gt=0;gt<=80;gt++){let At=gt/80*1.2-.1;j.push(new N(st.x+(At-.5)*lt.x*1.1,st.y+D*lt.y+(At-.5)*lt.y*et*1.6,1.7+k*.22))}let mt=new mi(new ye().setFromPoints(j),new Jr({color:9418495,transparent:!0,opacity:.22,dashSize:.05,gapSize:.05}));mt.computeLineDistances(),at.add(mt)}),at.userData={ctr:st,sz:lt}}let Mt=new ye,wt=new Float32Array(18*2*3);Mt.setAttribute("position",new be(wt,3));let kt=new Float32Array(18*2*3);Mt.setAttribute("color",new be(kt,3));let Xt=new ji(Mt,new bn({vertexColors:!0,transparent:!0,opacity:.8,blending:qe,depthWrite:!1}));Xt.frustumCulled=!1,at.add(Xt);let rt=(()=>{let G=document.createElement("canvas");G.width=G.height=64;let st=G.getContext("2d");return st.strokeStyle="#fff",st.lineWidth=3,st.beginPath(),st.arc(32,32,26,0,Math.PI*2),st.stroke(),new ts(G)})(),F=vt.map((G,st)=>{let lt=new ne(new Sn(.2,.2),new On({map:rt,color:3076789,transparent:!0,opacity:0,depthWrite:!1,blending:qe}));return lt.position.copy(G).setZ(Si+.01),lt.userData.ph=st*.37,at.add(lt),lt});function H(G,st){if(at.visible=st>.01,!at.visible)return;let{ctr:lt,sz:dt}=at.userData;Q.forEach(_t=>{let{pi:zt,ph:D,off:et,tilt:k}=_t.userData,j=(G*.028+D)%1*1.2-.1;_t.position.set(lt.x+(j-.5)*dt.x*1.1,lt.y+et*dt.y+(j-.5)*dt.y*k*1.6,1.7+zt*.22),_t.rotation.z=Math.atan2(k*dt.y*1.6,dt.x*1.1),_t.rotation.x=.9,_t.scale.setScalar(1.25);let mt=Math.min(1,Math.min(j+.1,1.1-j)*6);_t.traverse(gt=>{gt.material&&(gt.material.transparent=!0,gt.material.opacity=st*mt)})});let pt=0,It=new Set;vt.forEach((_t,zt)=>{if(pt>=18)return;let D=null,et=1e9;if(Q.forEach(j=>{let mt=Math.hypot(j.position.x-_t.x,j.position.y-_t.y);mt<et&&(et=mt,D=j)}),!D||et>.9)return;let k=Math.max(0,1-et/.9)*st;wt.set([D.position.x,D.position.y,D.position.z,_t.x,_t.y,_t.z+.01],pt*6),kt.set([.13*k,.85*k,.9*k,.18*k,.95*k,.71*k],pt*6),pt++,It.add(zt)});for(let _t=pt*6;_t<wt.length;_t++)wt[_t]=0,kt[_t]=0;Mt.attributes.position.needsUpdate=!0,Mt.attributes.color.needsUpdate=!0,F.forEach((_t,zt)=>{let D=(G*.7+_t.userData.ph)%1;_t.scale.setScalar(.4+D*1.6),_t.material.opacity=(It.has(zt)?.9:.25)*(1-D)*st})}let L=new oa(t);L.addPass(new la(e,n));let W=new as(new yt(512,512),.45,.38,.26);L.addPass(W),L.addPass(new ca);let K={...{sat:0,dots:0,shape:"dust",pos:[.5,.5],scale:1,opacity:.35,pulse:0,flow:0,rot:[0,0],spin:0,mesh:null,size:30,wave:0,sweep:0}},ft={bolt:0,chip:0,mexico:0,brain:0},X=-10,ot=2.2,P=0,ht={},ct=new Float32Array(h*3),bt=0;function St(){let G=cs((performance.now()/1e3-X)/ot),st=v.uMorphX.value;for(let lt=0;lt<h;lt++){let dt=lt*4,pt=(d[dt]+(cs(m[lt*3]*.08+.5)-d[dt])*st)*.45,It=Ol(cs((G-pt)/.55)),_t=Math.sin(It*Math.PI);ct[lt*3]=y[lt*3]+(m[lt*3]-y[lt*3])*It+_t*(d[dt+1]-.5)*1.6,ct[lt*3+1]=y[lt*3+1]+(m[lt*3+1]-y[lt*3+1])*It+_t*(d[dt+2]-.5)*1.2,ct[lt*3+2]=y[lt*3+2]+(m[lt*3+2]-y[lt*3+2])*It+_t*(d[dt+3]-.5)*2.4}return ct}let Bt={};function Ct(G){if(!Bt[G]){let st=Gs;Gs=4242+G.length*97;let lt=Hh[G](h);Gs=st,Bt[G]=Float32Array.from(lt.slice(0,h*3))}return Bt[G]}function R(G){let st=Object.assign({sat:0,dots:0,shape:"dust",pos:[.5,.5],scale:1,opacity:null,pulse:0,flow:0,rot:[0,0],spin:0,mesh:null,size:null,wave:0,sweep:0},G||{});st.opacity===null&&(st.opacity=st.shape==="dust"?.3:.95),st.size===null&&(st.size=st.shape==="dust"?15:st.shape==="mexico"?16:30),st.shape!==K.shape&&(y.set(St()),m.set(Ct(st.shape)),_.getAttribute("aFrom").needsUpdate=!0,_.getAttribute("position").needsUpdate=!0,X=performance.now()/1e3,v.uMorphX.value=st.sweep?1:0),Object.assign(K,st)}function M(G,st){let lt=innerWidth,dt=innerHeight,pt=Math.min(lt,dt*16/9),It=pt*9/16,zt=2*n.position.z*Math.tan(xh.degToRad(n.fov/2))/dt;return[(G-.5)*pt*zt,-(st-.5)*It*zt,pt*zt/11.2]}function q(){let G=Math.min(window.devicePixelRatio||1,2),lt=Math.min(G,3200/innerWidth);t.setPixelRatio(lt),t.setSize(innerWidth,innerHeight,!1),L.setPixelRatio(lt),L.setSize(innerWidth,innerHeight),W.resolution.set(innerWidth*lt*.5,innerHeight*lt*.5),n.aspect=innerWidth/innerHeight,n.updateProjectionMatrix(),v.uPix.value=lt*innerHeight/1080*10}addEventListener("resize",q),q();let it=new is,ut=!0;document.addEventListener("visibilitychange",()=>{ut=!document.hidden,ut&&Lt()});function nt(G,st,lt){return G+(st-G)*lt}function Lt(){if(!ut)return;requestAnimationFrame(Lt);let G=Math.min(it.getDelta(),.3),st=Math.min(G,.05),lt=it.elapsedTime,dt=1-Math.pow(.02,G);v.uTime.value=lt,v.uT.value=cs((performance.now()/1e3-X)/ot),v.uOpacity.value=nt(v.uOpacity.value,K.opacity,dt),v.uPulse.value=nt(v.uPulse.value,K.pulse,dt),v.uFlow.value=nt(v.uFlow.value,K.flow,dt*.7),v.uWave.value=K.wave,v.uSize.value=nt(v.uSize.value,K.size,dt);let[pt,It,_t]=M(K.pos[0],K.pos[1]);s.position.x=nt(s.position.x,pt,dt*.8),s.position.y=nt(s.position.y,It,dt*.8);let zt=nt(s.scale.x,K.scale*_t,dt*.8);s.scale.setScalar(zt),s.rotation.x=nt(s.rotation.x,K.rot[0],dt*.6),s.rotation.y=nt(s.rotation.y,K.rot[1],dt*.6),K.spin===0?P=nt(P,Math.round(P/6.2832)*6.2832,dt*.6):P+=K.spin*G;let D=K.spin<0?Math.sin(lt*.45)*Math.abs(K.spin):0;r.rotation.y=K.spin>=0?P:nt(r.rotation.y,D,dt),K.spin<0&&(P=r.rotation.y),r.rotation.x=Math.sin(lt*.3)*.04;for(let k in ft)ft[k]=nt(ft[k],K.mesh===k?1:0,1-Math.pow(.04,G));U.visible=ft.bolt>.01,U.scale.setScalar(.6+ft.bolt*.4),U.position.z=(1-ft.bolt)*-2,U.rotation.y=Math.sin(lt*.6)*.32,U.rotation.x=Math.sin(lt*.4)*.08,U.traverse(k=>{k.material&&k.material.emissiveIntensity!==void 0&&(k.material.transparent=!0,k.material.opacity=ft.bolt*(k.material.userData.op||(k.material.userData.op=k.material.opacity||1)))}),O.visible=ft.chip>.01,O.scale.setScalar(.7+ft.chip*.3),O.position.z=(1-ft.chip)*-3,C.forEach(k=>{k!==E.userData.traceMat&&(k.uniforms.uOp.value=ft.chip)}),T(O,ft.chip),V.visible=ft.mexico>.01;let et=lt-(ht.mexico||0);tt.forEach(k=>{let j=K.mesh==="mexico"?Ol(cs((et-k.userData.delay*1.2)/1.1)):ft.mexico;k.scale.z=Math.max(.001,j),k.children.forEach(mt=>{mt.material&&(mt.material.transparent=!0,mt.material.opacity=j*(mt.isLine?.55:1))}),k.children.forEach(mt=>{mt.isMesh&&(mt.material.emissiveIntensity=.2+.35*Math.pow(Math.max(0,Math.sin(lt*1.3-k.userData.cx*1.4)),6))})}),Z.forEach(k=>{let j=K.mesh==="mexico"?Ol(cs((et-1.4-k.userData.delay*1.4)/1.2)):0;k.userData.mat.uniforms.uOp.value=nt(k.userData.mat.uniforms.uOp.value,j,.2),k.scale.z=.05+j*.95}),bt+=((K.mesh==="mexico"&&K.sat?1:0)*ft.mexico-bt)*.05,H(lt,bt),v.uDots.value=K.dots,E.visible=ft.brain>.01,T(E,ft.brain),E.userData.traceMat.uniforms.uOp.value=ft.brain,g.m.uniforms.uOp.value=ft.brain,L.render()}let Et={v:null},Pt=R;function Zt(G){Pt(G),K.mesh!==Et.v&&(K.mesh&&(ht[K.mesh]=it.elapsedTime),Et.v=K.mesh)}return document.fonts&&document.fonts.ready&&document.fonts.ready.then(()=>{x.draw(),p()}),Lt(),{set:Zt,renderer:t}}function Bg(i,t){let e=(0,Vh.default)(0,"M");e.addData(t),e.make();let n=e.getModuleCount(),s=2,r="";for(let a=0;a<n;a++)for(let o=0;o<n;o++)e.isDark(a,o)&&(r+=`M${o+s} ${a+s}h1v1h-1z`);i.innerHTML=`<svg viewBox="0 0 ${n+s*2} ${n+s*2}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><path d="${r}" fill="#050b16"/></svg>`}window.PulsoQR=Bg;window.PulsoEngineInit=i=>{try{let t=Og(i);return window.PulsoEngine=t,t}catch(t){return console.warn("WebGL no disponible",t),null}};})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/

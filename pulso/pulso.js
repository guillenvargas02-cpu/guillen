/* PULSO 360° Electoral — animación del logo.
 *
 * Todo se dibuja en un canvas a partir de t (segundos): renderFrame(t) es determinista,
 * así cada fotograma se puede renderizar por separado y en paralelo.
 * Espacio de diseño: 1920x1080. setup(scale) define la resolución real (4 => 7680x4320).
 * Las medidas del logo están en "unidades de referencia": los píxeles del logo original
 * (2000x667), para que la composición final coincida con él.
 */
(() => {
  'use strict';

  const DW = 1920, DH = 1080;
  const DURATION = 10;

  // Colores muestreados del logo original
  const BG = [9, 20, 37];
  const FILL = [9, 40, 48];
  const BORDER = [2, 82, 84];
  const TEAL = [0, 205, 172];
  const SUB = [16, 196, 170];
  const HOT = [222, 255, 247];
  const WHITE = [255, 255, 255];

  // Geometría del logo original (px de la imagen de referencia)
  const REF_CX = 980, REF_CY = 341.5;   // centro del logo completo
  const BTN = { cx: 263, cy: 341.5, half: 168, r: 80, bw: 12 };
  const BOLT_BOX = { cx: 1.5, cy: 0.5, h: 154 };  // relativo al centro del botón
  const PULSO = { text: 'PULSO', left: 563, top: 222, w: 518, h: 123 };
  const SUBT = { text: '360° ELECTORAL', left: 561, top: 409, w: 1302, h: 89 };
  const K = 0.6;                        // escala del logo final (ref px -> px de diseño)
  const HERO_SCALE = 1.9;              // tamaño del botón en solitario, respecto al final

  // ---------------------------------------------------------------- utilidades
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgba = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const smooth = (x) => x * x * (3 - 2 * x);
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const easeInCubic = (x) => x * x * x;
  const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeInOutQuart = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
  const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);
  const bump = (t, at, attack, decay) =>
    t < at ? 0 : smooth(clamp((t - at) / attack)) * Math.exp(-Math.max(0, t - at - attack) / decay);

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (a, b) => rng((a * 73856093) ^ (b * 19349663))();

  // ---------------------------------------------------------------- línea de tiempo
  const T = {
    fadeIn: [0.0, 0.5],
    sparkIn: 0.3,
    beats: [0.62, 0.84, 1.2, 1.42],          // latidos (lub-dub) de la chispa
    rise: [1.42, 1.62],                       // la chispa sube al borde
    border: [1.62, 2.34],                     // el contorno se traza en dos sentidos
    fill: [2.05, 2.7],
    boltTrace: [2.3, 2.86],
    charge: [2.7, 3.02],                      // el rayo se carga de abajo arriba
    ignite: 3.02,                             // ¡se ilumina!
    lockup: [3.78, 4.86],                     // el botón viaja a su lugar en el logo
    word: 4.22, wordStagger: 0.065, wordDur: 0.8,
    sub: 4.72, subStagger: 0.042, subScramble: 0.34,
    sweep: [5.95, 6.95],
    heart: [[7.15, 7.37], [8.75, 8.97]],
  };

  // Intensidad de la luz del rayo
  function glow(t) {
    if (t < T.charge[0]) return 0;
    let g = 0.28 * smooth(prog(t, T.charge[0], T.ignite));
    if (t >= T.ignite) {
      const settle = 0.42;
      g = settle + (0.28 - settle) * Math.exp(-(t - T.ignite) / 0.12);
      g += 1.55 * bump(t, T.ignite, 0.045, 0.3);
      for (const [a, b] of T.heart) g += 0.42 * bump(t, a, 0.06, 0.16) + 0.3 * bump(t, b, 0.05, 0.22);
    }
    return g;
  }

  // ---------------------------------------------------------------- estado
  let W, H, S, cv, ctx;
  let E, ex, eS;           // capa emisiva (1/4 de resolución) para el bloom
  let B1, b1, B2, b2, B3, b3;
  let noiseTile, dotSprite, flareSprite;
  let rrPts, rrCum, rrLen;           // contorno del botón (unidades locales)
  let boltPts, boltCum, boltLen, boltPath2D, boltXf;
  let word, sub;                     // tipografía medida
  const sparks = [], dust = [];

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  // Contorno de rectángulo redondeado como polilínea, horario desde arriba al centro
  function roundedRectPoints(h, r, perArc = 48) {
    const pts = [[0, -h]];
    const corners = [
      [h - r, -h + r, -Math.PI / 2],
      [h - r, h - r, 0],
      [-h + r, h - r, Math.PI / 2],
      [-h + r, -h + r, Math.PI],
    ];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= perArc; i++) {
        const a = a0 + (i / perArc) * (Math.PI / 2);
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
    pts.push([0, -h]);
    return pts;
  }
  function cumulative(pts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return cum;
  }
  function pointAt(pts, cum, s) {
    const L = cum[cum.length - 1];
    s = ((s % L) + L) % L;
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const f = (s - cum[lo]) / Math.max(1e-9, cum[hi] - cum[lo]);
    return [lerp(pts[lo][0], pts[hi][0], f), lerp(pts[lo][1], pts[hi][1], f)];
  }
  // Traza el tramo [a,b] (en longitud) de una polilínea; admite a>b (sentido inverso)
  function tracePart(c, pts, cum, a, b) {
    const n = Math.max(2, Math.ceil(Math.abs(b - a) / 2));
    const p0 = pointAt(pts, cum, a);
    c.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= n; i++) {
      const p = pointAt(pts, cum, lerp(a, b, i / n));
      c.lineTo(p[0], p[1]);
    }
  }

  // ---------------------------------------------------------------- setup
  async function setup(scale = 1) {
    S = scale;
    W = Math.round(DW * S); H = Math.round(DH * S);
    cv = document.getElementById('c');
    cv.width = W; cv.height = H;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx = cv.getContext('2d', { alpha: false });

    eS = S / 4 * 1;  // px de diseño -> px de la capa emisiva
    E = makeCanvas(DW * eS, DH * eS); ex = E.getContext('2d');
    B1 = makeCanvas(E.width, E.height); b1 = B1.getContext('2d');
    B2 = makeCanvas(E.width / 2, E.height / 2); b2 = B2.getContext('2d');
    B3 = makeCanvas(E.width / 4, E.height / 4); b3 = B3.getContext('2d');

    const fonts = [
      new FontFace('PulsoWord', 'url(assets/fonts/Barlow-Bold.ttf)'),
      new FontFace('PulsoMono', 'url(assets/fonts/JetBrainsMono-Regular.ttf)'),
    ];
    for (const f of fonts) { await f.load(); document.fonts.add(f); }

    // Sprites
    dotSprite = makeCanvas(256, 256);
    {
      const c = dotSprite.getContext('2d');
      const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.45, 'rgba(255,255,255,0.12)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    }
    flareSprite = makeCanvas(256, 256);
    {
      const c = flareSprite.getContext('2d');
      const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(235,255,250,1)');
      g.addColorStop(0.08, 'rgba(120,255,225,0.9)');
      g.addColorStop(0.3, 'rgba(0,205,172,0.35)');
      g.addColorStop(0.65, 'rgba(0,205,172,0.08)');
      g.addColorStop(1, 'rgba(0,205,172,0)');
      c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    }
    // Grano fino (dithering contra bandas en los degradados)
    noiseTile = makeCanvas(512, 512);
    {
      const c = noiseTile.getContext('2d');
      const img = c.createImageData(512, 512);
      const r = rng(7);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = r() < 0.5 ? 255 : 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = Math.floor(r() * 255);
      }
      c.putImageData(img, 0, 0);
    }

    // Contorno del botón (línea central del borde)
    rrPts = roundedRectPoints(BTN.half - BTN.bw / 2, BTN.r - BTN.bw / 2);
    rrCum = cumulative(rrPts); rrLen = rrCum[rrCum.length - 1];

    // Rayo: Path2D + contorno muestreado, ajustado a la caja del logo original
    const svgPath = document.getElementById('boltPath');
    const d = svgPath.getAttribute('d');
    boltPath2D = new Path2D(d);
    const bb = svgPath.getBBox();
    const sw = BOLT_STROKE;
    const sb = BOLT_BOX.h / (bb.height + sw);
    boltXf = { tx: BOLT_BOX.cx, ty: BOLT_BOX.cy, s: sb, ox: bb.x + bb.width / 2, oy: bb.y + bb.height / 2, sw };
    const L = svgPath.getTotalLength();
    boltPts = [];
    // empezamos en la punta inferior para que la luz recorra el rayo de abajo arriba
    const n = 600;
    for (let i = 0; i <= n; i++) {
      const p = svgPath.getPointAtLength((i / n) * L);
      boltPts.push([(p.x - boltXf.ox) * sb + boltXf.tx, (p.y - boltXf.oy) * sb + boltXf.ty]);
    }
    boltCum = cumulative(boltPts); boltLen = boltCum[boltCum.length - 1];

    // Tipografía: se ajusta a la caja de tinta de cada línea del original
    word = layoutText(PULSO, 'PulsoWord', false);
    sub = layoutText(SUBT, 'PulsoMono', true);

    // Partículas
    const r = rng(42);
    for (let i = 0; i < 140; i++) {
      const a = r() * Math.PI * 2;
      sparks.push({
        a, v: lerp(260, 1250, Math.pow(r(), 1.6)), life: lerp(0.35, 1.15, r()),
        w: lerp(0.8, 2.6, r()), delay: r() * 0.06, hot: r(),
      });
    }
    const r2 = rng(99);
    for (let i = 0; i < 110; i++) {
      dust.push({
        x: r2() * DW, y: r2() * DH, z: lerp(0.25, 1, r2()), s: lerp(0.6, 2.6, r2()),
        vx: lerp(-6, 6, r2()), vy: lerp(-16, -4, r2()), tw: r2() * 6.28, a: lerp(0.03, 0.14, r2()),
      });
    }
    return { width: W, height: H, duration: DURATION };
  }
  const BOLT_STROKE = 1.15;

  function layoutText(spec, family, mono) {
    const c = makeCanvas(10, 10).getContext('2d');
    c.font = `100px ${family}`;
    let m = c.measureText(spec.text);
    const size = (100 * spec.h) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
    c.font = `${size}px ${family}`;
    m = c.measureText(spec.text);
    const asc = m.actualBoundingBoxAscent;
    const inkW0 = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const gaps = spec.text.length - 1;
    const ls = (spec.w - inkW0) / gaps;
    const x0 = spec.left + m.actualBoundingBoxLeft;
    const base = spec.top + asc;
    const chars = [];
    for (let i = 0; i < spec.text.length; i++) {
      const adv = c.measureText(spec.text.slice(0, i)).width;
      const cm = c.measureText(spec.text[i]);
      chars.push({ ch: spec.text[i], x: x0 + adv + i * ls, w: cm.width });
    }
    return { font: `${size}px ${family}`, size, base, top: spec.top, h: spec.h, chars, mono };
  }

  // ---------------------------------------------------------------- cámara y escena
  // Botón: posición (px de diseño) y escala (ref px -> px de diseño)
  function buttonState(t) {
    const finalX = DW / 2 + (BTN.cx - REF_CX) * K;
    const finalY = DH / 2 + (BTN.cy - REF_CY) * K;
    const p = easeInOutQuart(prog(t, T.lockup[0], T.lockup[1]));
    // pequeño "settle" al aparecer
    const appear = easeOutCubic(prog(t, T.border[0], T.fill[1]));
    const s0 = K * HERO_SCALE * lerp(0.94, 1, appear);
    return { x: lerp(DW / 2, finalX, p), y: lerp(DH / 2, finalY, p), s: lerp(s0, K, p), p };
  }

  function camera(t) {
    // ligero alejamiento inicial, golpe al encender y un empuje lento al final
    let z = lerp(1.07, 1.0, easeInOutCubic(prog(t, 0, T.lockup[1])));
    z += 0.018 * bump(t, T.ignite, 0.05, 0.25);
    z *= lerp(1, 1.022, easeInOutCubic(prog(t, T.lockup[1], DURATION)));
    // micro temblor en el encendido
    const sh = 2.2 * bump(t, T.ignite, 0.02, 0.12);
    const sx = sh * Math.sin(t * 173.0), sy = sh * Math.cos(t * 131.0);
    return { z, sx, sy };
  }

  function applyView(c, pxScale, cam) {
    c.setTransform(pxScale, 0, 0, pxScale, 0, 0);
    c.translate(DW / 2 + cam.sx, DH / 2 + cam.sy);
    c.scale(cam.z, cam.z);
    c.translate(-DW / 2, -DH / 2);
  }
  // del espacio del logo (ref px) al de diseño
  function applyLogo(c) {
    c.translate(DW / 2, DH / 2);
    c.scale(K, K);
    c.translate(-REF_CX, -REF_CY);
  }

  // ---------------------------------------------------------------- dibujo
  function drawBackground(t, light) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(BG);
    ctx.fillRect(0, 0, W, H);

    // luz ambiental desde el rayo
    const lx = light.x * S, ly = light.y * S;
    const amb = 0.02 + 0.05 * Math.min(1.6, light.i);
    let g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 900 * S);
    g.addColorStop(0, rgba(TEAL, amb));
    g.addColorStop(0.35, rgba(TEAL, amb * 0.35));
    g.addColorStop(1, rgba(TEAL, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // viñeta
    g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, 'rgba(3,8,17,0)');
    g.addColorStop(1, 'rgba(3,8,17,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGrid(t, cam, light) {
    applyView(ctx, S, cam);
    const sp = 30;
    const waveT = t - T.ignite;
    const waveR = waveT > 0 ? easeOutCubic(clamp(waveT / 1.6)) * 1500 : -1e9;
    const waveA = waveT > 0 ? Math.exp(-waveT / 0.7) : 0;
    // ondas suaves de los latidos de la chispa
    const ripples = [];
    for (const b of [T.beats[0], T.beats[2]]) {
      const dt = t - b;
      if (dt > 0 && dt < 1.4) ripples.push([dt * 520, 0.5 * Math.exp(-dt / 0.45)]);
    }
    for (const [a] of T.heart) {
      const dt = t - a;
      if (dt > 0 && dt < 1.6) ripples.push([dt * 600, 0.28 * Math.exp(-dt / 0.5)]);
    }
    const appear = smooth(prog(t, 0.2, 1.4));
    ctx.fillStyle = rgba(TEAL);
    for (let y = sp / 2 - 60; y < DH + 60; y += sp) {
      for (let x = sp / 2 - 90; x < DW + 90; x += sp) {
        const d = Math.hypot(x - light.x, y - light.y);
        let a = 0.03 * appear * (1 - clamp(d / 1100) * 0.6);
        a += 0.22 * Math.min(1.5, light.i) * Math.exp(-d / 260) * appear;
        a += 0.55 * waveA * Math.exp(-Math.pow((d - waveR) / 70, 2));
        for (const [rr, ra] of ripples) a += ra * 0.35 * Math.exp(-Math.pow((d - rr) / 55, 2));
        if (a < 0.006) continue;
        ctx.globalAlpha = Math.min(0.85, a);
        ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawDust(t, cam) {
    applyView(ctx, S, { z: 1 + (cam.z - 1) * 0.5, sx: 0, sy: 0 });
    ctx.globalCompositeOperation = 'lighter';
    const vis = smooth(prog(t, 0.3, 2.0));
    for (const p of dust) {
      const x = ((p.x + p.vx * t * p.z) % DW + DW) % DW;
      const y = ((p.y + p.vy * t * p.z) % DH + DH) % DH;
      const a = p.a * vis * (0.6 + 0.4 * Math.sin(t * 1.3 + p.tw));
      const s = p.s * 6 * p.z;
      ctx.globalAlpha = a;
      ctx.drawImage(flareSprite, x - s, y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function sprite(c, img, x, y, r, a) {
    if (a <= 0.001 || r <= 0) return;
    c.globalAlpha = Math.min(1, a);
    c.drawImage(img, x - r, y - r, r * 2, r * 2);
    c.globalAlpha = 1;
  }

  // Forma del botón en unidades locales
  function rrPathOuter(c, grow = 0) {
    const h = BTN.half + grow, r = BTN.r + grow * 0.6;
    c.beginPath();
    c.roundRect(-h, -h, h * 2, h * 2, r);
  }

  function boltTransform(c) {
    c.translate(boltXf.tx, boltXf.ty);
    c.scale(boltXf.s, boltXf.s);
    c.translate(-boltXf.ox, -boltXf.oy);
  }
  function fillBolt(c, color) {
    c.save();
    boltTransform(c);
    c.fillStyle = color; c.strokeStyle = color;
    c.lineJoin = 'round'; c.lineWidth = boltXf.sw;
    c.fill(boltPath2D); c.stroke(boltPath2D);
    c.restore();
  }

  // Todo lo relacionado con el botón; se llama para la capa nítida (main) y la emisiva
  function drawButton(t, cam, target) {
    const isE = target === 'E';
    const c = isE ? ex : ctx;
    const bs = buttonState(t);
    applyView(c, isE ? eS : S, cam);
    c.translate(bs.x, bs.y);
    c.scale(bs.s, bs.s);
    const G = glow(t);
    const unit = 1 / bs.s; // 1 px de diseño en unidades locales

    // ---- relleno del botón
    const fillA = smooth(prog(t, T.fill[0], T.fill[1]));
    if (!isE && fillA > 0) {
      c.save();
      rrPathOuter(c);
      c.clip();
      // aparece desde el centro
      const rr = lerp(0, 260, easeOutCubic(fillA));
      c.globalAlpha = fillA;
      const g = c.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, rr));
      g.addColorStop(0, rgba(FILL));
      g.addColorStop(0.75, rgba(FILL));
      g.addColorStop(1, rgba(FILL, 0));
      c.fillStyle = g;
      c.fillRect(-200, -200, 400, 400);
      // el rayo ilumina el cristal desde dentro
      const inner = 0.075 * Math.min(1.4, G) + 0.06 * bump(t, T.border[1], 0.05, 0.4);
      const g2 = c.createRadialGradient(0, 0, 0, 0, 0, 190);
      g2.addColorStop(0, rgba(TEAL, inner));
      g2.addColorStop(0.55, rgba(TEAL, inner * 0.35));
      g2.addColorStop(1, rgba(TEAL, 0));
      c.fillStyle = g2;
      c.fillRect(-200, -200, 400, 400);
      c.restore();
      c.globalAlpha = 1;
    }

    // ---- borde: se traza desde arriba en ambos sentidos
    const bp = easeInOutCubic(prog(t, T.border[0], T.border[1]));
    if (bp > 0) {
      const half = rrLen / 2;
      const hot = 1 - smooth(prog(t, T.border[1], T.border[1] + 0.7));
      const lit = clamp((G - 0.6) * 0.4);
      const col = mix(BORDER, TEAL, Math.max(hot * 0.75, lit));
      c.lineWidth = BTN.bw;
      c.lineCap = 'round';
      c.strokeStyle = rgba(col);
      if (isE) {
        c.strokeStyle = rgba(TEAL, 0.25 * hot + 0.5 * lit);
        c.lineWidth = BTN.bw * 1.4;
      }
      c.beginPath();
      tracePart(c, rrPts, rrCum, 0, bp * half);
      tracePart(c, rrPts, rrCum, rrLen, rrLen - bp * half);
      if (bp >= 1) { c.beginPath(); c.roundRect(-BTN.half + BTN.bw / 2, -BTN.half + BTN.bw / 2, (BTN.half - BTN.bw / 2) * 2, (BTN.half - BTN.bw / 2) * 2, BTN.r - BTN.bw / 2); }
      c.stroke();

      // estela brillante detrás de cada cabeza
      if (bp < 1) {
        const tail = Math.min(140, bp * half);
        for (const dir of [1, -1]) {
          const headS = dir > 0 ? bp * half : rrLen - bp * half;
          const segs = 14;
          for (let i = 0; i < segs; i++) {
            const a0 = headS - dir * tail * (i / segs);
            const a1 = headS - dir * tail * ((i + 1) / segs);
            c.beginPath();
            tracePart(c, rrPts, rrCum, a0, a1);
            c.strokeStyle = rgba(mix(TEAL, HOT, 0.7 * (1 - i / segs)), (1 - i / segs) * 0.95);
            c.lineWidth = BTN.bw * (isE ? 1.6 : 0.9);
            c.stroke();
          }
          const hp = pointAt(rrPts, rrCum, headS);
          sprite(c, flareSprite, hp[0], hp[1], (isE ? 70 : 34), 1);
          if (!isE) sprite(c, dotSprite, hp[0], hp[1], 12, 1);
        }
      }
    }
    // destello cuando las dos cabezas se encuentran abajo
    {
      const f = bump(t, T.border[1], 0.03, 0.18);
      if (f > 0.002) {
        sprite(c, flareSprite, 0, BTN.half - BTN.bw / 2, (isE ? 160 : 70) * (0.6 + f * 0.4), f);
      }
    }

    // ---- rayo: trazo de contorno, carga y encendido
    const tp = prog(t, T.boltTrace[0], T.boltTrace[1]);
    const chargeP = prog(t, T.charge[0], T.ignite);
    if (tp > 0) {
      const traced = easeInOutCubic(tp);
      const outlineA = 1 - smooth(prog(t, T.ignite, T.ignite + 0.3));
      if (outlineA > 0) {
        c.save();
        c.lineJoin = 'round';
        c.lineCap = 'round';
        c.beginPath();
        tracePart(c, boltPts, boltCum, 0, traced * boltLen);
        c.strokeStyle = rgba(TEAL, (isE ? 0.6 : 0.95) * outlineA);
        c.lineWidth = (isE ? 6 : 2.6) * unit * K * 1.6;
        c.stroke();
        c.restore();
        if (tp < 1) {
          const hp = pointAt(boltPts, boltCum, traced * boltLen);
          sprite(c, flareSprite, hp[0], hp[1], isE ? 60 : 26, 1);
          if (!isE) sprite(c, dotSprite, hp[0], hp[1], 9, 1);
        }
      }
    }
    if (chargeP > 0) {
      // relleno que sube desde la punta inferior
      const top = -BOLT_BOX.h / 2 + BOLT_BOX.cy - 4, bottom = BOLT_BOX.h / 2 + BOLT_BOX.cy + 4;
      const level = t >= T.ignite ? top - 10 : lerp(bottom, top, easeInCubic(chargeP) * 0.85 + chargeP * 0.15);
      const core = clamp((G - 0.5) / 1.0);
      const col = mix(TEAL, HOT, core * 0.92);
      c.save();
      c.beginPath();
      c.rect(-120, level, 240, 260);
      c.clip();
      if (isE) {
        fillBolt(c, rgba(mix(TEAL, HOT, core * 0.6), Math.min(0.85, 0.3 + G * 0.35)));
      } else {
        fillBolt(c, rgba(col));
      }
      c.restore();
      // línea de carga
      if (t < T.ignite) {
        c.save();
        c.beginPath();
        c.rect(-120, level - 3, 240, 6);
        c.clip();
        fillBolt(c, rgba(HOT, 0.9));
        c.restore();
      }
    }
  }

  // Efectos de encendido (en coordenadas de diseño, sobre el botón)
  function drawIgnition(t, cam, target) {
    const isE = target === 'E';
    const c = isE ? ex : ctx;
    const dt = t - T.ignite;
    if (dt < 0 || dt > 2.0) return;
    const bs = buttonState(t);
    applyView(c, isE ? eS : S, cam);
    c.globalCompositeOperation = 'lighter';

    // onda de choque con la forma del botón
    c.save();
    c.translate(bs.x, bs.y);
    c.scale(bs.s, bs.s);
    for (const [delay, amp] of [[0, 0.75], [0.12, 0.4]]) {
      const q = dt - delay;
      if (q <= 0 || q > 1.3) continue;
      const p = easeOutCubic(clamp(q / 1.3));
      const grow = lerp(0, 520, p);
      const a = amp * Math.pow(1 - clamp(q / 1.3), 1.6);
      rrPathOuter(c, grow);
      c.strokeStyle = rgba(mix(TEAL, HOT, 0.3), a * (isE ? 0.7 : 0.55));
      c.lineWidth = lerp(9, 1.5, p) * (isE ? 1.8 : 1);
      c.stroke();
    }
    c.restore();

    // chispas
    const cx = bs.x, cy = bs.y;
    for (const p of sparks) {
      const q = dt - p.delay;
      if (q <= 0 || q > p.life) continue;
      const lam = 3.2;
      const dist = (pp) => (p.v / lam) * (1 - Math.exp(-lam * pp));
      const d1 = dist(q), d0 = dist(Math.max(0, q - 0.035));
      const ca = Math.cos(p.a), sa = Math.sin(p.a);
      const fade = Math.pow(1 - q / p.life, 1.4);
      c.strokeStyle = rgba(mix(TEAL, HOT, p.hot * 0.8), fade);
      c.lineWidth = p.w * (isE ? 2.5 : 1);
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cx + ca * d0, cy + sa * d0);
      c.lineTo(cx + ca * d1, cy + sa * d1);
      c.stroke();
    }

    // destello anamórfico horizontal
    const f = bump(t, T.ignite, 0.04, 0.32);
    if (f > 0.002) {
      c.save();
      c.translate(cx, cy);
      c.scale(1, 0.012 + 0.006 * f);
      sprite(c, flareSprite, 0, 0, 1300 * (0.6 + 0.4 * easeOutCubic(clamp(dt / 0.4))), f * (isE ? 0.9 : 0.7));
      c.restore();
      sprite(c, flareSprite, cx, cy, (isE ? 320 : 170) * (0.7 + f * 0.3), f * (isE ? 0.4 : 0.22));
    }
    c.globalCompositeOperation = 'source-over';
  }

  // Chispa inicial (el "pulso")
  function drawSpark(t, cam, target) {
    const isE = target === 'E';
    const c = isE ? ex : ctx;
    if (t < T.sparkIn || t > T.border[0] + 0.12) return;
    applyView(c, isE ? eS : S, cam);
    c.globalCompositeOperation = 'lighter';
    const bs = buttonState(t);
    const appear = easeOutCubic(prog(t, T.sparkIn, T.sparkIn + 0.4));
    let beat = 0;
    T.beats.forEach((b, i) => { beat += (i % 2 ? 0.6 : 1) * bump(t, b, 0.04, 0.16); });
    // sube hacia el borde superior
    const rp = easeInCubic(prog(t, T.rise[0], T.rise[1]));
    const topY = -(BTN.half - BTN.bw / 2) * bs.s;
    const x = bs.x, y = bs.y + rp * topY;
    const fadeOut = 1 - prog(t, T.border[0], T.border[0] + 0.12);
    const i = appear * fadeOut * (0.55 + beat * 0.9);
    sprite(c, flareSprite, x, y, (isE ? 120 : 46) * (0.7 + beat * 0.6), i);
    if (!isE) sprite(c, dotSprite, x, y, 9 + beat * 5, i);
    // estela vertical al subir
    if (rp > 0 && rp < 1 && !isE) {
      const g = c.createLinearGradient(x, bs.y, x, y);
      g.addColorStop(0, rgba(TEAL, 0));
      g.addColorStop(1, rgba(HOT, 0.8 * fadeOut));
      c.strokeStyle = g; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, lerp(bs.y, y, 0.2)); c.lineTo(x, y); c.stroke();
    }
    // anillos del latido
    for (const b of [T.beats[0], T.beats[2]]) {
      const dt = t - b;
      if (dt <= 0 || dt > 1.2) continue;
      const r = easeOutCubic(dt / 1.2) * 260;
      c.beginPath();
      c.arc(bs.x, bs.y, r, 0, Math.PI * 2);
      c.strokeStyle = rgba(TEAL, 0.32 * Math.pow(1 - dt / 1.2, 2));
      c.lineWidth = isE ? 4 : 1.4;
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
  }

  // Latidos del logo final: anillo tenue desde el botón
  function drawHeartRings(t, cam, target) {
    const isE = target === 'E';
    const c = isE ? ex : ctx;
    applyView(c, isE ? eS : S, cam);
    const bs = buttonState(t);
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.translate(bs.x, bs.y);
    c.scale(bs.s, bs.s);
    for (const [a] of T.heart) {
      const dt = t - a;
      if (dt <= 0 || dt > 1.4) continue;
      const p = easeOutCubic(dt / 1.4);
      rrPathOuter(c, lerp(4, 210, p));
      c.strokeStyle = rgba(TEAL, 0.22 * Math.pow(1 - dt / 1.4, 1.8));
      c.lineWidth = isE ? 10 : 3;
      c.stroke();
    }
    c.restore();
  }

  // Texto: PULSO sube desde una máscara, 360° ELECTORAL se "decodifica"
  const GLYPHS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ#%&$+=<>/';
  function drawText(t, cam, target) {
    const isE = target === 'E';
    const c = isE ? ex : ctx;
    applyView(c, isE ? eS : S, cam);
    applyLogo(c);
    const pxPerRef = (isE ? eS : S) * K * cam.z;

    // PULSO
    c.font = word.font;
    c.textBaseline = 'alphabetic';
    word.chars.forEach((ch, i) => {
      const p = prog(t, T.word + i * T.wordStagger, T.word + i * T.wordStagger + T.wordDur);
      if (p <= 0) return;
      const e = easeOutExpo(p);
      const dy = (1 - e) * 150;
      const blur = (1 - easeOutQuint(p)) * 16;
      const a = smooth(clamp(p / 0.35));
      c.save();
      c.beginPath();
      c.rect(ch.x - 40, word.top - 40, ch.w + 120, word.h + 52);
      c.clip();
      if (!isE) {
        if (blur > 0.05) c.filter = `blur(${(blur * pxPerRef).toFixed(2)}px)`;
        c.globalAlpha = a;
        c.fillStyle = rgba(WHITE);
        c.fillText(ch.ch, ch.x, word.base + dy);
      } else {
        // halo blanco breve mientras entra
        const h = (1 - e) * 0.6;
        if (h > 0.01) {
          c.globalAlpha = h * a;
          c.fillStyle = rgba(mix(WHITE, TEAL, 0.3));
          c.fillText(ch.ch, ch.x, word.base + dy);
        }
      }
      c.restore();
    });

    // 360° ELECTORAL
    c.font = sub.font;
    sub.chars.forEach((ch, i) => {
      if (ch.ch === ' ') return;
      const ts = T.sub + i * T.subStagger;
      if (t < ts) return;
      const locked = t >= ts + T.subScramble;
      let glyph = ch.ch, col = SUB, a = 1;
      if (!locked) {
        const step = Math.floor(t * 24);
        glyph = GLYPHS[Math.floor(hash(i + 1, step) * GLYPHS.length)];
        a = 0.35 + 0.45 * hash(i + 7, step);
        col = mix(SUB, HOT, 0.25);
      }
      const flash = locked ? Math.exp(-(t - ts - T.subScramble) / 0.18) : 0;
      if (!isE) {
        c.globalAlpha = a;
        c.fillStyle = rgba(mix(col, HOT, flash * 0.7));
        c.fillText(glyph, ch.x, sub.base);
        c.globalAlpha = 1;
      } else if (flash > 0.01 || !locked) {
        c.globalAlpha = locked ? flash * 0.9 : 0.25;
        c.fillStyle = rgba(TEAL);
        c.fillText(glyph, ch.x, sub.base);
        c.globalAlpha = 1;
      }
    });
    // cursor que barre la línea mientras se decodifica
    {
      const n = sub.chars.length;
      const pos = (t - T.sub) / T.subStagger;
      const vis = 1 - prog(t, T.sub + n * T.subStagger + 0.1, T.sub + n * T.subStagger + 0.35);
      if (pos > 0 && vis > 0) {
        const idx = Math.min(n, pos);
        const first = sub.chars[0].x;
        const pitch = sub.chars[1].x - sub.chars[0].x;
        const x = first + idx * pitch;
        c.globalAlpha = vis * (isE ? 0.8 : 0.9);
        c.fillStyle = rgba(isE ? TEAL : mix(SUB, HOT, 0.4));
        c.fillRect(x, sub.top - 6, 7, sub.h + 12);
        c.globalAlpha = 1;
      }
    }
  }

  // Barrido de luz especular sobre el logo terminado
  function drawSweep(t, cam, target) {
    const p = prog(t, T.sweep[0], T.sweep[1]);
    if (p <= 0 || p >= 1) return;
    const isE = target === 'E';
    const c = isE ? ex : ctx;
    applyView(c, isE ? eS : S, cam);
    applyLogo(c);
    const e = easeInOutCubic(p);
    const x = lerp(-150, 2150, e);
    const band = 150, slant = 0.35;
    c.save();
    c.beginPath();
    c.moveTo(x - band, 120); c.lineTo(x + band, 120);
    c.lineTo(x + band - slant * 460, 580); c.lineTo(x - band - slant * 460, 580);
    c.closePath();
    c.clip();
    const g = c.createLinearGradient(x - band, 0, x + band, 0);
    const amp = isE ? 0.55 : 0.85;
    g.addColorStop(0, rgba(HOT, 0));
    g.addColorStop(0.5, rgba(HOT, amp));
    g.addColorStop(1, rgba(HOT, 0));
    c.fillStyle = g;
    c.strokeStyle = g;
    // subtítulo
    c.font = sub.font;
    for (const ch of sub.chars) if (ch.ch !== ' ') c.fillText(ch.ch, ch.x, sub.base);
    // borde del botón
    c.lineWidth = BTN.bw;
    c.beginPath();
    c.roundRect(BTN.cx - BTN.half + 6, BTN.cy - BTN.half + 6, (BTN.half - 6) * 2, (BTN.half - 6) * 2, BTN.r - 6);
    c.stroke();
    // halo en PULSO (solo en la capa emisiva: el blanco no puede aclararse más)
    if (isE) {
      c.font = word.font;
      for (const ch of word.chars) c.fillText(ch.ch, ch.x, word.base);
    }
    c.restore();
  }

  function compositeBloom(G) {
    // tres radios de desenfoque, del más fino al más amplio
    const r1 = 3 * eS, r2 = 12 * eS / 2, r3 = 42 * eS / 4;
    b1.clearRect(0, 0, B1.width, B1.height);
    b1.filter = `blur(${r1}px)`;
    b1.drawImage(E, 0, 0);
    b1.filter = 'none';
    b2.clearRect(0, 0, B2.width, B2.height);
    b2.filter = `blur(${r2}px)`;
    b2.drawImage(E, 0, 0, B2.width, B2.height);
    b2.filter = 'none';
    b3.clearRect(0, 0, B3.width, B3.height);
    b3.filter = `blur(${r3}px)`;
    b3.drawImage(E, 0, 0, B3.width, B3.height);
    b3.filter = 'none';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = 0.85; ctx.drawImage(B1, 0, 0, W, H);
    ctx.globalAlpha = 0.9; ctx.drawImage(B2, 0, 0, W, H);
    ctx.globalAlpha = 1.0; ctx.drawImage(B3, 0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawBoltEmission(t, cam) {
    // resplandor estable del rayo encendido (en la capa emisiva)
    const G = glow(t);
    if (G <= 0.001 || t < T.ignite) return;
    const bs = buttonState(t);
    applyView(ex, eS, cam);
    ex.translate(bs.x, bs.y);
    ex.scale(bs.s, bs.s);
    ex.globalCompositeOperation = 'lighter';
    sprite(ex, flareSprite, 0, 0, 150 + 60 * Math.min(2, G), 0.24 * Math.min(1.6, G));
    ex.globalCompositeOperation = 'source-over';
  }

  // El rayo nítido se vuelve a pintar encima del bloom: el halo brilla alrededor
  // y el color del rayo sigue siendo el del logo.
  function drawBoltOnTop(t, cam) {
    if (t < T.ignite) return;
    const bs = buttonState(t);
    const G = glow(t);
    applyView(ctx, S, cam);
    ctx.translate(bs.x, bs.y);
    ctx.scale(bs.s, bs.s);
    const core = clamp((G - 0.5) / 1.0);
    fillBolt(ctx, rgba(mix(TEAL, HOT, core * 0.92)));
  }

  function grain(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.01;
    const f = Math.floor(t * 60);
    const ox = Math.floor(hash(f, 1) * 512), oy = Math.floor(hash(f, 2) * 512);
    for (let y = -oy; y < H; y += 512) for (let x = -ox; x < W; x += 512) ctx.drawImage(noiseTile, x, y);
    ctx.globalAlpha = 1;
  }

  function renderFrame(t, opts = {}) {
    const cam = opts.noCam ? { z: 1, sx: 0, sy: 0 } : camera(t);
    const bs = buttonState(t);
    const G = glow(t);
    // intensidad de luz para el fondo (chispa al principio, rayo después)
    let li = 0;
    if (t > T.sparkIn && t < T.border[1]) {
      let beat = 0;
      T.beats.forEach((b, i) => { beat += (i % 2 ? 0.6 : 1) * bump(t, b, 0.04, 0.16); });
      li = (0.25 + beat * 0.6) * smooth(prog(t, T.sparkIn, T.sparkIn + 0.5));
    }
    li = Math.max(li, G, 0.25 * smooth(prog(t, T.border[0], T.border[1])));
    const light = { x: bs.x, y: bs.y, i: li };

    drawBackground(t, light);
    drawGrid(t, cam, light);
    drawDust(t, cam);

    ex.setTransform(1, 0, 0, 1, 0, 0);
    ex.globalCompositeOperation = 'source-over';
    ex.clearRect(0, 0, E.width, E.height);

    for (const target of ['main', 'E']) {
      drawSpark(t, cam, target);
      drawHeartRings(t, cam, target);
      drawButton(t, cam, target);
      drawIgnition(t, cam, target);
      drawText(t, cam, target);
      drawSweep(t, cam, target);
    }
    drawBoltEmission(t, cam);
    compositeBloom(G);
    drawBoltOnTop(t, cam);
    grain(t);

    // fundido de entrada desde negro
    const fi = 1 - smooth(prog(t, T.fadeIn[0], T.fadeIn[1]));
    if (fi > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(0,0,0,${fi})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  window.PULSO = { setup, renderFrame, DURATION };
})();

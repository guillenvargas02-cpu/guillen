/* PULSO 360° · motor 3D de la presentación
   Un solo renderizador WebGL detrás de las diapositivas.
   - Enjambre de dígitos binarios (0/1) que se reorganiza en formas: cerebro, rayo, México, circuito, flujo.
   - Objetos sólidos con brillo: rayo PULSO 3D, chip de IA, mapa de México extruido.
   API: window.PulsoEngine.set({ shape, pos:[fx,fy], scale, mesh, opacity, pulse, flow, rot:[rx,ry], spin }) */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import qrcode from "qrcode-generator";
import MX from "./mexico.js";

const MINT = new THREE.Color("#2ef2b5"), AQUA = new THREE.Color("#22d8e6"), BLUE = new THREE.Color("#4d8bff");

/* ------------------------------------------------------------------ utilidades */
let seed = 1337;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = t => Math.max(0, Math.min(1, t));
function inPoly(x, y, poly) { // poly: [x0,y0,x1,y1...]
  let c = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function samplePerimeter(polys, n, out, z = 0, jitter = 0) {
  const segs = []; let total = 0;
  polys.forEach(p => { for (let i = 0; i < p.length; i += 2) { const j = (i + 2) % p.length; const L = Math.hypot(p[j] - p[i], p[j + 1] - p[i + 1]); segs.push([p[i], p[i + 1], p[j], p[j + 1], L]); total += L; } });
  for (let k = 0; k < n; k++) {
    let r = rnd() * total, s = segs[0];
    for (const sg of segs) { r -= sg[4]; if (r <= 0) { s = sg; break; } }
    const t = rnd();
    out.push(s[0] + (s[2] - s[0]) * t + gauss() * jitter, s[1] + (s[3] - s[1]) * t + gauss() * jitter, z + gauss() * jitter);
  }
}

/* ------------------------------------------------------------------ formas del enjambre */
const BOLT = [13, 2, 3, 14, 12, 14, 11, 22, 21, 10, 12, 10].map((v, i) => (i % 2 ? -(v - 12) : (v - 12)) * 0.15);
function roundedRectPath(w, h, r, seg = 10) {
  const p = [], hw = w / 2, hh = h / 2;
  const corners = [[hw - r, hh - r, 0], [-hw + r, hh - r, Math.PI / 2], [-hw + r, -hh + r, Math.PI], [hw - r, -hh + r, 1.5 * Math.PI]];
  corners.forEach(([cx, cy, a0]) => { for (let i = 0; i <= seg; i++) { const a = a0 + (i / seg) * Math.PI / 2; p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } });
  return p;
}

const SHAPES = {
  dust(n) {
    const a = [];
    for (let i = 0; i < n; i++) a.push((rnd() - .5) * 22, (rnd() - .5) * 12, -8 + rnd() * 9);
    return a;
  },
  brain(n) {
    const a = [];
    const fold = (x, y, z) => Math.sin(5.3 * x + 1.7) * Math.sin(6.1 * y + .4) * Math.sin(4.9 * z + 2.2) + .6 * Math.sin(9.7 * x + 7.1 * z) * Math.sin(8.3 * y + 1.1);
    for (let i = 0; i < n; i++) {
      const r = rnd();
      if (r < .80) { // hemisferios
        let x = gauss(), y = gauss(), z = gauss(); const L = Math.hypot(x, y, z); x /= L; y /= L; z /= L;
        const side = x >= 0 ? 1 : -1;
        let px = x * .92, py = y * .82, pz = z * 1.28;
        const f = 1 + .075 * fold(px, py, pz);
        const inner = rnd() < .14 ? .55 + rnd() * .4 : 1; // algo de volumen
        px *= f * inner; py *= f * inner; pz *= f * inner;
        px += side * .07;
        if (py < -.42) py = -.42 + (py + .42) * .35;           // base aplanada
        if (pz > .7 && py < -.1) py += (pz - .7) * .25;          // lóbulo frontal
        a.push(px, py + .12, pz);
      } else if (r < .95) { // cerebelo
        let x = gauss(), y = gauss(), z = gauss(); const L = Math.hypot(x, y, z); x /= L; y /= L; z /= L;
        const f = 1 + .05 * Math.sin(34 * y);
        a.push(x * .7 * f, -.55 + y * .3 * f, -.82 + z * .42 * f);
      } else { // tallo
        const t = rnd(), ang = rnd() * Math.PI * 2, rad = .14 + rnd() * .03;
        a.push(Math.cos(ang) * rad, -.55 - t * .6, -.38 - t * .12 + Math.sin(ang) * rad);
      }
    }
    return a;
  },
  bolt(n) {
    const a = [];
    const frame = roundedRectPath(4.4, 4.4, 1.05);
    const nFrame = Math.floor(n * .22), nEdge = Math.floor(n * .2);
    samplePerimeter([frame], nFrame, a, 0, .03);
    samplePerimeter([BOLT], nEdge, a, 0, .015);
    let k = a.length / 3;
    while (k < n) {
      const x = (rnd() - .5) * 2.8, y = (rnd() - .5) * 3.2;
      if (inPoly(x, y, BOLT)) { a.push(x, y, (rnd() - .5) * .5); k++; }
    }
    return a;
  },
  mexico(n) {
    const S = MAP_S, a = [], rings = [];
    MX.forEach(s => s.r.forEach(r => rings.push(r.map(v => v * S))));
    const nEdge = Math.floor(n * .3);
    samplePerimeter(rings, nEdge, a, MAP_Z + .03, .004);
    let k = a.length / 3;
    while (k < n) {
      const x = (rnd() - .5) * 2 * S, y = (rnd() - .5) * 1.32 * S;
      for (const r of rings) if (inPoly(x, y, r)) { a.push(x, y, MAP_Z + .03 + rnd() * .03); k++; break; }
    }
    return a;
  },
  circuit(n) { // pistas tipo tarjeta madre alrededor del chip
    const a = [], paths = [];
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < 9; i++) {
        const off = (i - 4) * .26;
        let pts = [[1.6, off]];
        let x = 1.6, y = off;
        const steps = 2 + Math.floor(rnd() * 3);
        for (let s = 0; s < steps; s++) {
          x += .3 + rnd() * .55; pts.push([x, y]);
          if (s < steps - 1) { y += (rnd() - .5) * .8; pts.push([x, y]); }
        }
        const rot = side * Math.PI / 2, c = Math.cos(rot), sn = Math.sin(rot);
        paths.push(pts.map(([px, py]) => [px * c - py * sn, px * sn + py * c]));
      }
    }
    const segs = []; let total = 0;
    paths.forEach(p => { for (let i = 0; i < p.length - 1; i++) { const L = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); segs.push([p[i], p[i + 1], L]); total += L; } });
    for (let k = 0; k < n; k++) {
      if (rnd() < .06) { const ang = rnd() * 6.283, rr = 1.8 + rnd() * 2.2; a.push(Math.cos(ang) * rr, Math.sin(ang) * rr, -.35); continue; }
      let r = rnd() * total, s = segs[0];
      for (const sg of segs) { r -= sg[2]; if (r <= 0) { s = sg; break; } }
      const t = rnd();
      a.push(s[0][0] + (s[1][0] - s[0][0]) * t, s[0][1] + (s[1][1] - s[0][1]) * t, -.32);
    }
    return a;
  },
  stream(n) {
    const a = [];
    for (let i = 0; i < n; i++) {
      const x = (rnd() - .5) * 16;
      const y = Math.sin(x * .45 + 1) * .55 + gauss() * .32;
      a.push(x, y, gauss() * .9);
    }
    return a;
  },
  sphere(n) {
    const a = [], g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
      const R = 1.8 * (1 + (rnd() < .1 ? rnd() * .25 : 0));
      a.push(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
    }
    return a;
  }
};
const MAP_S = 3.1, MAP_Z = .07;

/* ------------------------------------------------------------------ motor */
function createEngine(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, .1, 100);
  camera.position.set(0, 0, 10);
  const rig = new THREE.Group(); scene.add(rig);
  const spinner = new THREE.Group(); rig.add(spinner);

  scene.add(new THREE.AmbientLight(0x8fb6ff, .35));
  const key = new THREE.PointLight(0x2ef2b5, 60, 30); key.position.set(4, 4, 6); scene.add(key);
  const fill = new THREE.PointLight(0x4d8bff, 50, 30); fill.position.set(-5, -2, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, .8); rim.position.set(-2, 5, -4); scene.add(rim);

  /* ---------- enjambre binario */
  const QUALITY = Math.min(1, (navigator.hardwareConcurrency || 4) / 8) > .5 ? 1 : .7;
  const N = Math.round(16000 * QUALITY);
  const atlas = (() => {
    const c = document.createElement("canvas"); c.width = 384; c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "600 104px 'Geist Mono', 'JetBrains Mono', monospace";
    g.fillText("0", 64, 68); g.fillText("1", 192, 68);
    g.beginPath(); g.arc(320, 64, 22, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.needsUpdate = true; return t;
  })();
  const geo = new THREE.BufferGeometry();
  const aFrom = new Float32Array(N * 3), aTo = new Float32Array(N * 3), aRand = new Float32Array(N * 4), aGlyph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    aRand.set([rnd(), rnd(), rnd(), rnd()], i * 4);
    const g = rnd(); aGlyph[i] = g < .44 ? 0 : g < .88 ? 1 : 2;
  }
  const dust = SHAPES.dust(N); aFrom.set(dust); aTo.set(dust);
  geo.setAttribute("position", new THREE.BufferAttribute(aTo, 3));
  geo.setAttribute("aFrom", new THREE.BufferAttribute(aFrom, 3));
  geo.setAttribute("aTo", geo.getAttribute("position"));
  geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 4));
  geo.setAttribute("aGlyph", new THREE.BufferAttribute(aGlyph, 1));
  const U = {
    uT: { value: 1 }, uTime: { value: 0 }, uSize: { value: 30 }, uPix: { value: 1 }, uAtlas: { value: atlas },
    uOpacity: { value: .35 }, uFlow: { value: 0 }, uPulse: { value: 0 }, uWave: { value: 0 }, uMorphX: { value: 0 },
    uC1: { value: MINT.clone() }, uC2: { value: AQUA.clone() }, uC3: { value: BLUE.clone() }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aFrom; attribute vec3 aTo; attribute vec4 aRand; attribute float aGlyph;
      uniform float uT, uTime, uSize, uPix, uFlow, uPulse, uWave, uMorphX;
      varying float vGlyph, vBright, vMix, vFade;
      void main(){
        float d = mix(aRand.x, clamp(aTo.x * .08 + .5, 0., 1.), uMorphX) * .45;
        float t = clamp((uT - d) / .55, 0., 1.);
        t = t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.;
        vec3 p = mix(aFrom, aTo, t);
        // trayecto curvo durante la transición
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
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uAtlas; uniform float uOpacity; uniform vec3 uC1, uC2, uC3;
      varying float vGlyph, vBright, vMix, vFade;
      void main(){
        vec2 uv = vec2((gl_PointCoord.x + vGlyph) / 3., 1. - gl_PointCoord.y);
        float a = texture2D(uAtlas, uv).a;
        if (a < .02) discard;
        vec3 c = mix(uC1, uC2, smoothstep(.35, .8, vMix));
        c = mix(c, uC3, smoothstep(.85, 1., vMix) * .6);
        c = mix(c, vec3(1.), clamp(vBright - 1.2, 0., 1.) * .7);
        gl_FragColor = vec4(c * vBright, a * uOpacity * vFade);
      }`
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  spinner.add(points);

  /* ---------- rayo PULSO 3D */
  const boltGroup = new THREE.Group(); spinner.add(boltGroup);
  {
    const sh = new THREE.Shape();
    for (let i = 0; i < BOLT.length; i += 2) (i ? sh.lineTo : sh.moveTo).call(sh, BOLT[i] * .82, BOLT[i + 1] * .82);
    const g = new THREE.ExtrudeGeometry(sh, { depth: .28, bevelEnabled: true, bevelThickness: .07, bevelSize: .05, bevelSegments: 4 });
    g.center();
    const m = new THREE.MeshStandardMaterial({ color: 0x0d5a48, emissive: 0x2ef2b5, emissiveIntensity: 1.35, metalness: .2, roughness: .25 });
    boltGroup.add(new THREE.Mesh(g, m));
    const outer = roundedRectPath(3.7, 3.7, .95), inner = roundedRectPath(3.42, 3.42, .82);
    const fs = new THREE.Shape(); for (let i = 0; i < outer.length; i += 2) (i ? fs.lineTo : fs.moveTo).call(fs, outer[i], outer[i + 1]);
    const hole = new THREE.Path(); for (let i = 0; i < inner.length; i += 2) (i ? hole.lineTo : hole.moveTo).call(hole, inner[i], inner[i + 1]);
    fs.holes.push(hole);
    const fg = new THREE.ExtrudeGeometry(fs, { depth: .22, bevelEnabled: true, bevelThickness: .04, bevelSize: .03, bevelSegments: 3, curveSegments: 24 });
    fg.center();
    boltGroup.add(new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: 0x0a2a2a, emissive: 0x19c99a, emissiveIntensity: .55, metalness: .7, roughness: .3 })));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), new THREE.MeshStandardMaterial({ color: 0x06161c, emissive: 0x0b3b33, emissiveIntensity: .35, transparent: true, opacity: .55, roughness: .6 }));
    back.position.z = -.12; boltGroup.add(back);
  }

  /* ---------- chip de IA */
  const chipGroup = new THREE.Group(); spinner.add(chipGroup);
  const traceMats = [];
  {
    const sub = new THREE.Mesh(new RoundedBoxGeometry(3.1, 3.1, .22, 4, .08), new THREE.MeshStandardMaterial({ color: 0x0a1526, metalness: .75, roughness: .32 }));
    chipGroup.add(sub);
    const die = new THREE.Mesh(new RoundedBoxGeometry(2.05, 2.05, .16, 4, .05), new THREE.MeshStandardMaterial({ color: 0x0e2238, metalness: .9, roughness: .18, emissive: 0x0a2c3a, emissiveIntensity: .4 }));
    die.position.z = .17; chipGroup.add(die);
    // retícula grabada en el die
    const gl = [];
    for (let i = -4; i <= 4; i++) { const v = i * .2; gl.push(-.9, v, 0, .9, v, 0, v, -.9, 0, v, .9, 0); }
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(gl, 3)), new THREE.LineBasicMaterial({ color: 0x22d8e6, transparent: true, opacity: .16 }));
    grid.position.z = .255; chipGroup.add(grid);
    // emblema del rayo
    const sh = new THREE.Shape();
    for (let i = 0; i < BOLT.length; i += 2) (i ? sh.lineTo : sh.moveTo).call(sh, BOLT[i] * .36, BOLT[i + 1] * .36);
    const eg = new THREE.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: true, bevelThickness: .02, bevelSize: .015, bevelSegments: 2 }); eg.center();
    const emb = new THREE.Mesh(eg, new THREE.MeshStandardMaterial({ color: 0x0d5a48, emissive: 0x2ef2b5, emissiveIntensity: 1.6 }));
    emb.position.z = .29; chipGroup.add(emb);
    // pines
    const pinGeo = new THREE.BoxGeometry(.07, .22, .04), pinMat = new THREE.MeshStandardMaterial({ color: 0x9fe9d4, metalness: 1, roughness: .25, emissive: 0x0c3d33, emissiveIntensity: .4 });
    const pins = new THREE.InstancedMesh(pinGeo, pinMat, 4 * 18); let pi = 0; const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), Sc = new THREE.Vector3(1, 1, 1);
    for (let s = 0; s < 4; s++) for (let i = 0; i < 18; i++) {
      const off = (i - 8.5) * .155, rot = s * Math.PI / 2;
      const x = Math.cos(rot) * 1.66 - Math.sin(rot) * off, y = Math.sin(rot) * 1.66 + Math.cos(rot) * off;
      Q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rot + Math.PI / 2); P.set(x, y, -.02);
      pins.setMatrixAt(pi++, M.compose(P, Q, Sc));
    }
    chipGroup.add(pins);
    // pistas con pulsos de luz
    const traceGeo = new THREE.BufferGeometry(); const pos = [], dist = [];
    for (let s = 0; s < 4; s++) for (let i = 0; i < 9; i++) {
      const off = (i - 4) * .31, rot = s * Math.PI / 2, c = Math.cos(rot), sn = Math.sin(rot);
      let x = 1.78, y = off, d = 0; const pts = [[x, y]];
      const steps = 2 + ((i * 7 + s * 3) % 3);
      for (let k = 0; k < steps; k++) { x += .5 + ((i + k * 3 + s) % 4) * .3; pts.push([x, y]); if (k < steps - 1) { y += (((i + k + s) % 3) - 1) * .32; pts.push([x, y]); } }
      for (let k = 0; k < pts.length - 1; k++) {
        const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], L = Math.hypot(x1 - x0, y1 - y0);
        const nx = -(y1 - y0) / L * .018, ny = (x1 - x0) / L * .018;
        const q = [[x0 + nx, y0 + ny, d], [x0 - nx, y0 - ny, d], [x1 + nx, y1 + ny, d + L], [x1 - nx, y1 - ny, d + L]];
        const R = ([px, py, dd]) => { pos.push(px * c - py * sn, px * sn + py * c, -.08); dist.push(dd + i * .37 + s * .91); };
        [q[0], q[1], q[2], q[2], q[1], q[3]].forEach(R);
        d += L;
      }
    }
    traceGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    traceGeo.setAttribute("aD", new THREE.Float32BufferAttribute(dist, 1));
    const tm = new THREE.ShaderMaterial({
      uniforms: { uTime: U.uTime, uOp: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: "attribute float aD; varying float vD; void main(){ vD = aD; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: "uniform float uTime, uOp; varying float vD; void main(){ float p = fract(vD * .55 + uTime * .45); float head = pow(p, 14.) * 2.4; vec3 c = mix(vec3(.08,.35,.4), vec3(.18,.95,.71), head); gl_FragColor = vec4(c * (.35 + head), (.32 + head) * uOp); }"
    });
    traceMats.push(tm);
    chipGroup.add(new THREE.Mesh(traceGeo, tm));
  }

  /* ---------- México extruido */
  const mapGroup = new THREE.Group(); spinner.add(mapGroup);
  const stateMeshes = [], beams = [];
  {
    const topMat = new THREE.MeshStandardMaterial({ color: 0x10284a, metalness: .5, roughness: .35, emissive: 0x0d4a46, emissiveIntensity: .35 });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2ef2b5, transparent: true, opacity: .55 });
    MX.forEach((st, si) => {
      const g = new THREE.Group();
      let cx = 0, cy = 0, cn = 0, area = 0;
      st.r.forEach(r => {
        const sh = new THREE.Shape();
        for (let i = 0; i < r.length; i += 2) (i ? sh.lineTo : sh.moveTo).call(sh, r[i] * MAP_S, r[i + 1] * MAP_S);
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: MAP_Z, bevelEnabled: false }), topMat.clone());
        g.add(m);
        const lp = []; for (let i = 0; i < r.length; i += 2) lp.push(r[i] * MAP_S, r[i + 1] * MAP_S, MAP_Z + .002);
        g.add(new THREE.LineLoop(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(lp, 3)), lineMat));
        let a = 0; for (let i = 0; i < r.length; i += 2) { const j = (i + 2) % r.length; a += r[i] * r[j + 1] - r[j] * r[i + 1]; cx += r[i]; cy += r[i + 1]; cn++; }
        area += Math.abs(a);
      });
      cx = cx / cn * MAP_S; cy = cy / cn * MAP_S;
      g.userData = { delay: (cx / MAP_S + 1) * .5, cx, cy };
      mapGroup.add(g); stateMeshes.push(g);
      if (area > .004) {
        const h = .45 + (si * 37 % 11) / 11 * .5;
        const bm = new THREE.ShaderMaterial({
          uniforms: { uTime: U.uTime, uOp: { value: 0 }, uPh: { value: si * .7 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
          vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
          fragmentShader: "uniform float uTime, uOp, uPh; varying vec2 vUv; void main(){ float edge = 1. - abs(vUv.x - .5) * 2.; float fade = (1. - vUv.y); float run = pow(fract(vUv.y * 1.2 - uTime * .6 + uPh), 10.); vec3 c = mix(vec3(.13,.85,.9), vec3(.18,.95,.71), vUv.y); gl_FragColor = vec4(c, (fade * .55 + run * .9) * pow(edge, 3.) * uOp); }"
        });
        const b = new THREE.Group();
        for (let k = 0; k < 2; k++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(.06, h), bm); pl.rotation.x = Math.PI / 2; pl.rotation.y = k * Math.PI / 2; pl.position.z = MAP_Z + h / 2; b.add(pl); }
        b.position.set(cx, cy, 0); b.userData = { mat: bm, delay: g.userData.delay };
        mapGroup.add(b); beams.push(b);
      }
    });
  }

  /* ---------- posprocesado */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .62, .42, .2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- estado y transiciones */
  const S = { shape: "dust", pos: [.5, .5], scale: 1, opacity: .35, pulse: 0, flow: 0, rot: [0, 0], spin: 0, mesh: null, size: 30, wave: 0, sweep: 0 };
  const T = { ...S };
  const presence = { bolt: 0, chip: 0, mexico: 0 };
  let morphStart = -10, morphDur = 2.2, spinAngle = 0, meshT = {};
  const cur = new Float32Array(N * 3);

  function currentPositions() {
    const t = clamp01((performance.now() / 1000 - morphStart) / morphDur);
    const mx = U.uMorphX.value;
    for (let i = 0; i < N; i++) {
      const r = i * 4, d = (aRand[r] + (clamp01(aTo[i * 3] * .08 + .5) - aRand[r]) * mx) * .45;
      const tt = ease(clamp01((t - d) / .55)), arc = Math.sin(tt * Math.PI);
      cur[i * 3] = aFrom[i * 3] + (aTo[i * 3] - aFrom[i * 3]) * tt + arc * (aRand[r + 1] - .5) * 1.6;
      cur[i * 3 + 1] = aFrom[i * 3 + 1] + (aTo[i * 3 + 1] - aFrom[i * 3 + 1]) * tt + arc * (aRand[r + 2] - .5) * 1.2;
      cur[i * 3 + 2] = aFrom[i * 3 + 2] + (aTo[i * 3 + 2] - aFrom[i * 3 + 2]) * tt + arc * (aRand[r + 3] - .5) * 2.4;
    }
    return cur;
  }
  const cache = {};
  function shapeData(name) {
    if (!cache[name]) { const s0 = seed; seed = 4242 + name.length * 97; const arr = SHAPES[name](N); seed = s0; cache[name] = Float32Array.from(arr.slice(0, N * 3)); }
    return cache[name];
  }

  function set(cfg) {
    const c = Object.assign({ shape: "dust", pos: [.5, .5], scale: 1, opacity: null, pulse: 0, flow: 0, rot: [0, 0], spin: 0, mesh: null, size: null, wave: 0, sweep: 0 }, cfg || {});
    if (c.opacity === null) c.opacity = c.shape === "dust" ? .3 : .95;
    if (c.size === null) c.size = c.shape === "dust" ? 15 : c.shape === "mexico" ? 16 : 30;
    if (c.shape !== T.shape) {
      aFrom.set(currentPositions());
      aTo.set(shapeData(c.shape));
      geo.getAttribute("aFrom").needsUpdate = true; geo.getAttribute("position").needsUpdate = true;
      morphStart = performance.now() / 1000;
      U.uMorphX.value = c.sweep ? 1 : 0;
    }
    Object.assign(T, c);
  }

  function stageToWorld(fx, fy) {
    const vw = innerWidth, vh = innerHeight;
    const sw = Math.min(vw, vh * 16 / 9), sh = sw * 9 / 16;
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wpp = visH / vh;
    return [(fx - .5) * sw * wpp, -(fy - .5) * sh * wpp, sw * wpp / 11.2];
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const maxW = 3200; const pr = Math.min(dpr, maxW / innerWidth);
    renderer.setPixelRatio(pr);
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setPixelRatio(pr); composer.setSize(innerWidth, innerHeight);
    bloom.resolution.set(innerWidth * pr * .5, innerHeight * pr * .5);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    U.uPix.value = pr * innerHeight / 1080 * 10;
  }
  addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });
  function lerp(a, b, k) { return a + (b - a) * k; }
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const dtR = Math.min(clock.getDelta(), .3), dt = Math.min(dtR, .05), time = clock.elapsedTime;
    const k = 1 - Math.pow(.02, dtR);      // suavizado (basado en tiempo real)
    U.uTime.value = time;
    U.uT.value = clamp01((performance.now() / 1000 - morphStart) / morphDur);
    U.uOpacity.value = lerp(U.uOpacity.value, T.opacity, k);
    U.uPulse.value = lerp(U.uPulse.value, T.pulse, k);
    U.uFlow.value = lerp(U.uFlow.value, T.flow, k * .7);
    U.uWave.value = T.wave;
    U.uSize.value = lerp(U.uSize.value, T.size, k);
    const [wx, wy, ws] = stageToWorld(T.pos[0], T.pos[1]);
    rig.position.x = lerp(rig.position.x, wx, k * .8);
    rig.position.y = lerp(rig.position.y, wy, k * .8);
    const sc = lerp(rig.scale.x, T.scale * ws, k * .8); rig.scale.setScalar(sc);
    rig.rotation.x = lerp(rig.rotation.x, T.rot[0], k * .6);
    rig.rotation.y = lerp(rig.rotation.y, T.rot[1], k * .6);
    if (T.spin === 0) spinAngle = lerp(spinAngle, Math.round(spinAngle / 6.2832) * 6.2832, k * .6);
    else spinAngle += T.spin * dtR;
    const osc = T.spin < 0 ? Math.sin(time * .45) * Math.abs(T.spin) : 0;
    spinner.rotation.y = T.spin >= 0 ? spinAngle : lerp(spinner.rotation.y, osc, k);
    if (T.spin < 0) spinAngle = spinner.rotation.y;
    spinner.rotation.x = Math.sin(time * .3) * .04;

    for (const m in presence) presence[m] = lerp(presence[m], T.mesh === m ? 1 : 0, 1 - Math.pow(.04, dtR));
    // rayo
    boltGroup.visible = presence.bolt > .01;
    boltGroup.scale.setScalar(.6 + presence.bolt * .4);
    boltGroup.position.z = (1 - presence.bolt) * -2;
    boltGroup.rotation.y = Math.sin(time * .6) * .32;
    boltGroup.rotation.x = Math.sin(time * .4) * .08;
    boltGroup.traverse(o => { if (o.material && o.material.emissiveIntensity !== undefined) { o.material.transparent = true; o.material.opacity = presence.bolt * (o.material.userData.op || (o.material.userData.op = o.material.opacity || 1)); } });
    // chip
    chipGroup.visible = presence.chip > .01;
    chipGroup.scale.setScalar(.7 + presence.chip * .3);
    chipGroup.position.z = (1 - presence.chip) * -3;
    traceMats.forEach(m => (m.uniforms.uOp.value = presence.chip));
    chipGroup.traverse(o => { if (o.isMesh && o.material.isMeshStandardMaterial) { o.material.transparent = true; o.material.opacity = presence.chip; } });
    // mapa
    mapGroup.visible = presence.mexico > .01;
    const since = time - (meshT.mexico || 0);
    stateMeshes.forEach(g => {
      const tt = T.mesh === "mexico" ? ease(clamp01((since - g.userData.delay * 1.2) / 1.1)) : presence.mexico;
      g.scale.z = Math.max(.001, tt);
      g.children.forEach(o => { if (o.material) { o.material.transparent = true; o.material.opacity = tt * (o.isLine ? .55 : 1); } });
      g.children.forEach(o => { if (o.isMesh) o.material.emissiveIntensity = .2 + .35 * Math.pow(Math.max(0, Math.sin(time * 1.3 - g.userData.cx * 1.4)), 6); });
    });
    beams.forEach(b => {
      const tt = T.mesh === "mexico" ? ease(clamp01((since - 1.4 - b.userData.delay * 1.4) / 1.2)) : 0;
      b.userData.mat.uniforms.uOp.value = lerp(b.userData.mat.uniforms.uOp.value, tt, .2);
      b.scale.z = .05 + tt * .95;
    });
    composer.render();
  }
  const prevMesh = { v: null };
  const origSet = set;
  function setWithMesh(cfg) {
    origSet(cfg);
    if (T.mesh !== prevMesh.v) { if (T.mesh) meshT[T.mesh] = clock.elapsedTime; prevMesh.v = T.mesh; }
  }
  loop();
  return { set: setWithMesh, renderer };
}

/* ------------------------------------------------------------------ QR */
function renderQR(el, text) {
  const q = qrcode(0, "M"); q.addData(text); q.make();
  const n = q.getModuleCount(), m = 2;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  el.innerHTML = `<svg viewBox="0 0 ${n + m * 2} ${n + m * 2}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#050b16"/></svg>`;
}

window.PulsoQR = renderQR;
window.PulsoEngineInit = canvas => {
  try { const e = createEngine(canvas); window.PulsoEngine = e; return e; } catch (err) { console.warn("WebGL no disponible", err); return null; }
};

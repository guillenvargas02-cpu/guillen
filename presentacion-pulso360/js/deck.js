/* PULSO 360° · motor de presentación
   Navegación: → / Espacio / clic = avanzar · ← / clic derecho = regresar
   F = pantalla completa · H = ayuda · número + Enter = ir a diapositiva */
(() => {
  "use strict";

  /* ------------------------------------------------------------ iconos */
  const I = {
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    imageplus: '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    cap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    captions: '<rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    gavel: '<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    square: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'
  };
  document.querySelectorAll("i.ico[data-i]").forEach(el => {
    const p = I[el.dataset.i];
    if (p) el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  });

  /* ------------------------------------------------------------ texto dividido por palabras */
  function splitEl(el) {
    let i = 0;
    const out = document.createDocumentFragment();
    const wrap = node => {
      const w = document.createElement("span"); w.className = "w";
      const wi = document.createElement("span"); wi.className = "wi"; wi.style.setProperty("--i", i++);
      wi.appendChild(node); w.appendChild(wi); return w;
    };
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) out.appendChild(document.createTextNode(" "));
          else out.appendChild(wrap(document.createTextNode(part)));
        });
      } else if (n.nodeName === "BR") {
        out.appendChild(n.cloneNode());
      } else {
        // elementos anidados (serif, grad…) se dividen palabra por palabra conservando su clase
        const words = n.textContent.split(/\s+/).filter(Boolean);
        words.forEach((wd, k) => {
          const c = n.cloneNode(false); c.textContent = wd;
          out.appendChild(wrap(c));
          if (k < words.length - 1) out.appendChild(document.createTextNode(" "));
        });
      }
    });
    el.innerHTML = ""; el.appendChild(out);
  }
  document.querySelectorAll(".split").forEach(splitEl);

  /* ------------------------------------------------------------ escritura (copiloto) */
  document.querySelectorAll(".typer").forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const s = document.createElement("span"); s.className = "tw"; s.textContent = p; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(el);
  });

  /* ------------------------------------------------------------ generadores visuales */
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  // dial 360° de capítulos
  document.querySelectorAll(".dial").forEach(d => {
    const deg = +d.dataset.deg || 72;
    const svg = mk("svg", { viewBox: "0 0 720 720" });
    const defs = mk("defs", {}, svg);
    const g = mk("linearGradient", { id: "dg" + deg, x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    mk("stop", { offset: "0", "stop-color": "#2ef2b5" }, g);
    mk("stop", { offset: ".6", "stop-color": "#22d8e6" }, g);
    mk("stop", { offset: "1", "stop-color": "#4d8bff" }, g);
    const ticks = mk("g", { class: "ticks" }, svg);
    for (let a = 0; a < 360; a += 3) {
      const big = a % 30 === 0, r1 = 342, r2 = big ? 318 : 332;
      const rad = (a - 90) * Math.PI / 180;
      mk("line", { x1: 360 + r1 * Math.cos(rad), y1: 360 + r1 * Math.sin(rad), x2: 360 + r2 * Math.cos(rad), y2: 360 + r2 * Math.sin(rad),
        stroke: big ? "rgba(46,242,181,.55)" : "rgba(214,228,255,.16)", "stroke-width": big ? 2.4 : 1.4 }, ticks);
    }
    mk("circle", { cx: 360, cy: 360, r: 290, fill: "none", stroke: "rgba(214,228,255,.08)", "stroke-width": 6 }, svg);
    const arc = mk("circle", { class: "arc", cx: 360, cy: 360, r: 290, fill: "none", stroke: `url(#dg${deg})`, "stroke-width": 6, "stroke-linecap": "round",
      pathLength: 360, transform: "rotate(-90 360 360)", "stroke-dasharray": `${deg} 400`, "stroke-dashoffset": deg,
      style: "filter: drop-shadow(0 0 10px rgba(46,242,181,.8))" }, svg);
    const inner = mk("g", { style: "transform-origin: 360px 360px; animation: spinr 60s linear infinite" }, svg);
    mk("circle", { cx: 360, cy: 360, r: 236, fill: "none", stroke: "rgba(77,139,255,.22)", "stroke-width": 1.5, "stroke-dasharray": "2 10" }, inner);
    mk("circle", { cx: 360, cy: 360, r: 190, fill: "none", stroke: "rgba(214,228,255,.06)", "stroke-width": 1 }, svg);
    d.appendChild(svg);
    const arm = document.createElement("div");
    arm.style.cssText = "position:absolute;inset:0;transition:transform 2.6s cubic-bezier(.16,.84,.24,1) .5s;transform:rotate(0deg)";
    arm.innerHTML = '<div class="orb" style="top:9.72%"></div>';
    d.appendChild(arm);
    const ro = document.createElement("div"); ro.className = "readout";
    ro.innerHTML = `<div><b><span data-count="${deg}" data-pad="3">0</span>°</b><span>${d.dataset.label || "PULSO 360°"}</span></div>`;
    d.appendChild(ro);
    d._arc = arc; d._arm = arm; d._deg = deg;
  });

  // ECG / pulso
  function ecgPath(w, h, beats) {
    const base = h * .62; let d = `M0 ${base}`; const step = w / beats;
    for (let b = 0; b < beats; b++) {
      const x = b * step, s = step;
      d += ` L${x + s * .30} ${base}` +
        ` Q${x + s * .34} ${base - h * .10} ${x + s * .38} ${base}` +
        ` L${x + s * .44} ${base} L${x + s * .47} ${base + h * .10}` +
        ` L${x + s * .51} ${h * .04} L${x + s * .555} ${h * .96}` +
        ` L${x + s * .59} ${base} L${x + s * .68} ${base}` +
        ` Q${x + s * .74} ${base - h * .18} ${x + s * .80} ${base} L${x + s} ${base}`;
    }
    return d;
  }
  document.querySelectorAll("svg.ecg").forEach((svg, n) => {
    const w = 1920, h = +svg.dataset.h || 160, beats = +svg.dataset.beats || 4;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.setAttribute("preserveAspectRatio", "none");
    const defs = mk("defs", {}, svg);
    const g = mk("linearGradient", { id: "ecgGrad", x1: "0", x2: "1", y1: "0", y2: "0" }, defs);
    mk("stop", { offset: "0", "stop-color": "#2ef2b5", "stop-opacity": "0" }, g);
    mk("stop", { offset: ".25", "stop-color": "#2ef2b5" }, g);
    mk("stop", { offset: ".75", "stop-color": "#22d8e6" }, g);
    mk("stop", { offset: "1", "stop-color": "#4d8bff", "stop-opacity": "0" }, g);
    const d = ecgPath(w, h, beats);
    mk("path", { class: "ghost", d, "vector-effect": "non-scaling-stroke" }, svg);
    const trail = mk("path", { class: "main", d, "vector-effect": "non-scaling-stroke" }, svg);
    svg._trail = trail;
  });
  function runECG(t) {
    document.querySelectorAll(".slide.active svg.ecg").forEach(svg => {
      const p = svg._trail; if (!p) return;
      if (!p._len) p._len = p.getTotalLength();
      const L = p._len, seg = L * .28, pos = (t * .00032 * L) % (L + seg);
      p.style.strokeDasharray = `${seg} ${L + seg}`;
      p.style.strokeDashoffset = `${seg - pos}`;
    });
  }

  // ondas suaves generadas
  document.querySelectorAll("path.gen-wave").forEach(p => {
    const w = +p.dataset.w || 800, h = +p.dataset.h || 130, seed = +p.dataset.seed || 1;
    let d = "";
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      const y = h * .5 + Math.sin(t * 22 + seed) * h * .14 + Math.sin(t * 7.3 + seed * 2) * h * .18 + Math.sin(t * 51) * h * .05 - t * h * .12;
      d += (x ? " L" : "M") + x + " " + y.toFixed(1);
    }
    p.setAttribute("d", d);
    const area = p.parentNode.querySelector("path.gen-area");
    if (area) area.setAttribute("d", d + ` L${w} ${h} L0 ${h} Z`);
  });

  // mapa territorial hexagonal
  document.querySelectorAll(".map svg[data-hex]").forEach(svg => {
    const W = 900, H = 520, r = 24, hw = Math.sqrt(3) * r;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const hot = JSON.parse(svg.dataset.hex);
    const g = mk("g", {}, svg);
    let k = 0;
    for (let row = 0; row * r * 1.5 < H + r; row++) {
      for (let col = 0; col * hw < W + hw; col++) {
        const cx = col * hw + (row % 2 ? hw / 2 : 0), cy = row * r * 1.5;
        // forma de municipio: elipse deformada
        const nx = (cx - W / 2) / (W * .47), ny = (cy - H / 2) / (H * .46);
        const wob = .12 * Math.sin(cx * .018) + .1 * Math.cos(cy * .021 + cx * .006);
        if (nx * nx + ny * ny > 1 + wob) continue;
        let heat = 0;
        hot.forEach(h => { const dx = cx - h[0] * W, dy = cy - h[1] * H; heat = Math.max(heat, Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70)) * h[2]); });
        const pts = [];
        for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); pts.push((cx + (r - 2.5) * Math.cos(a)).toFixed(1) + "," + (cy + (r - 2.5) * Math.sin(a)).toFixed(1)); }
        const col2 = heat > .55 ? `rgba(46,242,181,${.25 + heat * .55})` : heat > .2 ? `rgba(34,216,230,${.12 + heat * .4})` : "rgba(120,160,255,.07)";
        const hx = mk("polygon", { class: "hex", points: pts.join(" "), fill: col2, stroke: "rgba(140,190,255,.10)", "stroke-width": 1 }, g);
        hx.style.setProperty("--d", (0.2 + (cx / W) * .9 + Math.random() * .25).toFixed(2) + "s");
        k++;
      }
    }
  });

  // matriz de puntos (electorado)
  document.querySelectorAll(".dots[data-n]").forEach(el => {
    const n = +el.dataset.n; let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("i");
      const c = rnd(); d.className = c < .2 ? "c1" : c < .4 ? "c2" : c < .55 ? "c3" : c < .68 ? "c4" : "";
      if (rnd() < .28) d.classList.add("on");
      d.style.setProperty("--d", (rnd() * .9).toFixed(2) + "s");
      el.appendChild(d);
    }
  });

  // forma de onda (Debate Coach)
  document.querySelectorAll(".wave").forEach(w => {
    for (let i = 0; i < 64; i++) {
      const b = document.createElement("i");
      const env = Math.sin(i / 63 * Math.PI) * .7 + .3;
      b.style.setProperty("--h", Math.round((30 + Math.abs(Math.sin(i * 1.7) * 70)) * env) + "%");
      b.style.setProperty("--t", (-(i * 0.083) % 1.3).toFixed(2) + "s");
      w.appendChild(b);
    }
  });

  /* ------------------------------------------------------------ campo de pulsos (canvas) */
  const cv = document.getElementById("field"), ctx = cv.getContext("2d");
  let W = 0, H = 0, DPR = 1, dots = [], rings = [], lastEmit = 0;
  const focus = { x: .5, y: .5 }, focusT = { x: .5, y: .5 };
  let fieldAlpha = 1, fieldAlphaT = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const sp = rem * 3.6; dots = [];
    for (let y = sp / 2; y < H; y += sp) for (let x = sp / 2; x < W; x += sp) dots.push(x, y);
    dots = new Float32Array(dots);
    cv._size = Math.max(1.2, rem * .2) * DPR;
  }
  addEventListener("resize", resize); resize();
  function emit(strength = 1) {
    rings.push({ x: focus.x * W, y: focus.y * H, t: performance.now(), s: strength });
    if (rings.length > 5) rings.shift();
  }
  function frame(t) {
    focus.x += (focusT.x - focus.x) * .04; focus.y += (focusT.y - focus.y) * .04;
    fieldAlpha += (fieldAlphaT - fieldAlpha) * .05;
    if (t - lastEmit > 3600) { emit(.7); lastEmit = t; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#2ef2b5";
    const diag = Math.hypot(W, H), fx = focus.x * W, fy = focus.y * H, sz = cv._size, band = diag * .05;
    const live = rings.filter(r => t - r.t < 5200);
    rings = live;
    const rr = live.map(r => ({ x: r.x, y: r.y, rad: (t - r.t) * diag * .00021, a: (1 - (t - r.t) / 5200) * r.s }));
    for (let i = 0; i < dots.length; i += 2) {
      const x = dots[i], y = dots[i + 1];
      const dx = x - fx, dy = y - fy;
      let a = .028 + .07 * Math.exp(-(dx * dx + dy * dy) / (diag * diag * .06));
      let push = 0;
      for (let k = 0; k < rr.length; k++) {
        const R = rr[k], ex = x - R.x, ey = y - R.y, dist = Math.sqrt(ex * ex + ey * ey), dd = Math.abs(dist - R.rad);
        if (dd < band) { const f = 1 - dd / band; a += f * f * .55 * R.a; push += f * R.a; }
      }
      if (a < .02) continue;
      ctx.globalAlpha = Math.min(a, .9) * fieldAlpha;
      const s = sz * (1 + push * .9);
      ctx.fillRect(x * DPR - s / 2, y * DPR - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    runECG(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ------------------------------------------------------------ contadores */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pad = +(el.dataset.pad || 0);
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", dur = +(el.dataset.dur || 1800);
    const delay = parseFloat(getComputedStyle(el).getPropertyValue("--d")) * 1000 || 250;
    const t0 = performance.now() + delay;
    cancelAnimationFrame(el._raf);
    const fmt = v => {
      let s = v.toFixed(dec);
      if (!dec && Math.abs(end) >= 1000) s = Math.round(v).toLocaleString("es-MX");
      if (pad) s = s.padStart(pad, "0");
      return pre + (end > 0 && el.dataset.sign ? "+" : "") + s + suf;
    };
    el.textContent = fmt(0);
    const tick = now => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(end * e);
      if (p < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------ diapositivas */
  const slides = [...document.querySelectorAll(".slide")];
  const hud = document.querySelector(".hud"), hudChap = hud.querySelector(".chap"), hudNum = hud.querySelector(".num"), hudBar = hud.querySelector(".bar i");
  let cur = -1, step = 0, chapter = "";
  slides.forEach(s => {
    if (s.dataset.chapter) chapter = s.dataset.chapter; s._chapter = chapter;
    s._items = [...s.querySelectorAll(".a, .split, [data-step], .q, [data-count], .topics, .draw")];
    s._max = s._items.reduce((m, e) => Math.max(m, +(e.dataset.step || 0)), 0);
  });

  function stepOf(e) {
    if (e.dataset.step !== undefined) return +e.dataset.step;
    const p = e.parentElement && e.parentElement.closest("[data-step]");
    return p && p.closest(".slide") === e.closest(".slide") ? +p.dataset.step : 0;
  }

  function apply(s, st, entering) {
    s._items.forEach(e => {
      const n = stepOf(e), on = st >= n;
      if (e.classList.contains("hook")) {
        const tgt = e.dataset.target ? s.querySelector(e.dataset.target) : s;
        if (tgt) tgt.classList.toggle(e.dataset.cls, on);
        return;
      }
      const was = e.classList.contains("in");
      e.classList.toggle("in", on);
      if (e.dataset.dimAt !== undefined) e.classList.toggle("dimmed", st >= +e.dataset.dimAt);
      if (on && !was) {
        if (e.dataset.count !== undefined && !e.closest(".dial")) countUp(e);
        e.querySelectorAll && e.querySelectorAll("[data-count]").forEach(c => { if (stepOf(c) <= st && !c.closest(".dial")) countUp(c); });
        if (e.classList.contains("typer")) typeOut(e);
      }
    });
    // diales
    s.querySelectorAll(".dial").forEach(d => {
      const on = d.classList.contains("in");
      d._arc.setAttribute("stroke-dashoffset", on ? 0 : d._deg);
      d._arm.style.transform = `rotate(${on ? d._deg : 0}deg)`;
      if (on && entering) { const c = d.querySelector("[data-count]"); c.style.setProperty("--d", ".5s"); c.dataset.dur = 2600; countUp(c); }
    });
  }

  function typeOut(el) {
    const ws = [...el.querySelectorAll(".tw")];
    ws.forEach(w => w.classList.remove("on"));
    clearTimeout(el._to);
    const base = (parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0) * 1000 + 400;
    let i = 0;
    const next = () => { if (i < ws.length) { ws[i++].classList.add("on"); el._to = setTimeout(next, 38); } };
    el._to = setTimeout(next, base);
  }

  function reset(s) {
    s._items.forEach(e => {
      e.classList.remove("in", "dimmed");
      if (e.classList.contains("hook")) { const tgt = e.dataset.target ? s.querySelector(e.dataset.target) : s; if (tgt) tgt.classList.remove(e.dataset.cls); }
    });
    s.querySelectorAll(".tw").forEach(w => w.classList.remove("on"));
    s.querySelectorAll(".dial").forEach(d => { d._arc.setAttribute("stroke-dashoffset", d._deg); d._arm.style.transform = "rotate(0deg)"; });
  }

  function go(i, st = 0) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const prev = slides[cur], next = slides[i], dir = i > cur ? 1 : -1;
    if (prev && prev !== next) {
      prev.classList.remove("active");
      prev.classList.toggle("past", dir > 0);
      clearTimeout(prev._rt);
      prev._rt = setTimeout(() => { if (!prev.classList.contains("active")) reset(prev); }, 1000);
      if (prev._leave) prev._leave();
    }
    clearTimeout(next._rt);
    next.classList.remove("past");
    cur = i; step = st === "max" ? next._max : st;
    if (prev !== next) reset(next);
    // forzar reflujo para reiniciar transiciones
    void next.offsetWidth;
    next.classList.add("active");
    apply(next, step, true);
    document.body.dataset.bg = next.dataset.bg || "mint";
    const f = (next.dataset.focus || ".5,.5").split(",").map(Number);
    focusT.x = f[0]; focusT.y = f[1];
    fieldAlphaT = next.dataset.field === "off" ? 0 : 1;
    setTimeout(() => emit(1.2), 250);
    hudChap.textContent = next._chapter;
    hudNum.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b> / ${String(slides.length).padStart(2, "0")}`;
    hudBar.style.width = ((i + 1) / slides.length * 100) + "%";
    hud.classList.toggle("hidden", !!next.dataset.nohud);
    history.replaceState(null, "", "#" + (i + 1));
    if (next._enter) next._enter(step, prev);
  }

  function nextStep() {
    const s = slides[cur];
    if (s._next && s._next()) return;
    if (step < s._max) { step++; apply(s, step, false); emit(.8); }
    else if (cur < slides.length - 1) go(cur + 1, 0);
  }
  function prevStep() {
    const s = slides[cur];
    if (step > 0) { step--; apply(s, step, false); }
    else if (cur > 0) go(cur - 1, "max");
  }

  /* ------------------------------------------------------------ intro con video */
  const intro = document.querySelector(".s-intro");
  const vid = document.getElementById("introVideo");
  const hint = document.getElementById("startHint");
  if (intro && vid) {
    const big = (screen.width * (window.devicePixelRatio || 1)) > 2200;
    vid.src = big ? "assets/video/pulso360-4k.mp4" : "assets/video/pulso360-1080.mp4";
    let started = false;
    const toEnd = () => {
      const set = () => { try { vid.pause(); vid.currentTime = Math.max(0, (vid.duration || 10) - .04); } catch (e) {} };
      if (vid.readyState >= 1) set(); else vid.addEventListener("loadedmetadata", set, { once: true });
    };
    const play = () => {
      vid.currentTime = 0;
      const p = vid.play();
      started = true;
      if (p && p.catch) p.catch(() => { started = false; hint.classList.add("on"); });
    };
    intro._enter = st => {
      if (st >= 1) { toEnd(); return; }
      hint.classList.remove("on");
      play();
      setTimeout(() => { if (!started || vid.paused) hint.classList.add("on"); }, 900);
    };
    intro._next = () => {
      if (step === 0 && !started) { hint.classList.remove("on"); play(); return true; }
      if (step === 0) { toEnd(); step = 1; apply(intro, 1, false); return true; }
      return false;
    };
    intro._leave = () => { vid.pause(); };
    vid.addEventListener("playing", () => { started = true; hint.classList.remove("on"); });
    vid.addEventListener("ended", () => { if (slides[cur] === intro && step === 0) { step = 1; apply(intro, 1, false); } });
  }

  /* ------------------------------------------------------------ controles */
  let jumpBuf = "", jumpTo;
  const jumpEl = document.querySelector(".jump"), help = document.querySelector(".help");
  const fs = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen(); };
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (help.classList.contains("on") && k !== "h" && k !== "H" && k !== "?") { if (k === "Escape") help.classList.remove("on"); return; }
    if (/^[0-9]$/.test(k)) { jumpBuf += k; jumpEl.textContent = "→ " + jumpBuf; jumpEl.classList.add("on"); clearTimeout(jumpTo); jumpTo = setTimeout(() => { jumpBuf = ""; jumpEl.classList.remove("on"); }, 2200); return; }
    if (k === "Enter" && jumpBuf) { go(+jumpBuf - 1); jumpBuf = ""; jumpEl.classList.remove("on"); return; }
    switch (k) {
      case "ArrowRight": case "PageDown": case " ": case "Enter": case "n": case "N": case "ArrowDown":
        e.preventDefault(); nextStep(); break;
      case "ArrowLeft": case "PageUp": case "Backspace": case "p": case "P": case "ArrowUp":
        e.preventDefault(); prevStep(); break;
      case "Home": go(0, "max"); break;
      case "End": go(slides.length - 1); break;
      case "f": case "F": fs(); break;
      case "h": case "H": case "?": help.classList.toggle("on"); break;
      case "Escape": help.classList.remove("on"); break;
    }
  });
  addEventListener("click", e => {
    if (help.classList.contains("on")) { help.classList.remove("on"); return; }
    if (e.clientX < innerWidth * .18) prevStep(); else nextStep();
  });
  addEventListener("contextmenu", e => { e.preventDefault(); prevStep(); });
  let tx = null;
  addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) (dx < 0 ? nextStep : prevStep)(); tx = null; });

  let idleT;
  const wake = () => { hud.classList.remove("idle"); document.body.classList.remove("hide-cursor"); clearTimeout(idleT); idleT = setTimeout(() => { hud.classList.add("idle"); document.body.classList.add("hide-cursor"); }, 2600); };
  addEventListener("mousemove", wake); wake();

  const startAt = parseInt((location.hash || "").replace("#", ""), 10);
  const boot = () => go(startAt > 0 ? startAt - 1 : 0, startAt > 1 ? "max" : 0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();

  window.__deck = { go, next: nextStep, prev: prevStep, get cur() { return cur; }, get step() { return step; }, slides };
})();

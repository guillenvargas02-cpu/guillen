/* PULSO 360° · motor de presentación v2
   Navegación: → / Espacio / clic = avanzar · ← / clic derecho = regresar
   F = pantalla completa · H = ayuda · número + Enter = ir a diapositiva */
(() => {
  "use strict";
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
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    tv: '<rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>',
    newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    gallery: '<rect width="14" height="16" x="2" y="4" rx="2"/><path d="M19 6v12"/><path d="M22 8v8"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    layout: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    tasks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    vote: '<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/>',
    userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  };
  document.querySelectorAll("i.ico[data-i]").forEach(el => {
    const p = I[el.dataset.i];
    if (p) el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  });

  /* ------------------------------------------------------------ texto por palabras */
  function splitEl(el) {
    let i = 0; const out = document.createDocumentFragment();
    const wrap = node => { const w = document.createElement("span"); w.className = "w"; const wi = document.createElement("span"); wi.className = "wi"; wi.style.setProperty("--i", i++); wi.appendChild(node); w.appendChild(wi); return w; };
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; out.appendChild(/^\s+$/.test(p) ? document.createTextNode(" ") : wrap(document.createTextNode(p))); });
      else if (n.nodeName === "BR") out.appendChild(n.cloneNode());
      else { const ws = n.textContent.split(/\s+/).filter(Boolean); ws.forEach((wd, k) => { const c = n.cloneNode(false); c.textContent = wd; out.appendChild(wrap(c)); if (k < ws.length - 1) out.appendChild(document.createTextNode(" ")); }); }
    });
    el.innerHTML = ""; el.appendChild(out);
  }
  document.querySelectorAll(".split").forEach(splitEl);

  document.querySelectorAll(".typer").forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(" ")); return; } const s = document.createElement("span"); s.className = "tw"; s.textContent = p; f.appendChild(s); }); n.replaceWith(f); }
      else walk(n);
    });
    walk(el);
  });

  /* ------------------------------------------------------------ generadores 2D */
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  document.querySelectorAll("path.gen-wave").forEach(p => {
    const w = +p.dataset.w || 800, h = +p.dataset.h || 200, seed = +p.dataset.seed || 1, up = +(p.dataset.up || .25);
    let d = "";
    for (let x = 0; x <= w; x += 4) { const t = x / w; const y = h * .55 + Math.sin(t * 19 + seed) * h * .1 + Math.sin(t * 6.3 + seed * 2) * h * .14 + Math.sin(t * 47) * h * .03 - t * h * up; d += (x ? " L" : "M") + x + " " + y.toFixed(1); }
    p.setAttribute("d", d);
    const area = p.parentNode.querySelector("path.gen-area"); if (area) area.setAttribute("d", d + ` L${w} ${h} L0 ${h} Z`);
  });

  document.querySelectorAll(".map svg[data-hex]").forEach(svg => {
    const W = 900, H = 500, r = 24, hw = Math.sqrt(3) * r; svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const hot = JSON.parse(svg.dataset.hex);
    for (let row = 0; row * r * 1.5 < H + r; row++) for (let col = 0; col * hw < W + hw; col++) {
      const cx = col * hw + (row % 2 ? hw / 2 : 0), cy = row * r * 1.5;
      const nx = (cx - W / 2) / (W * .47), ny = (cy - H / 2) / (H * .46), wob = .12 * Math.sin(cx * .018) + .1 * Math.cos(cy * .021 + cx * .006);
      if (nx * nx + ny * ny > 1 + wob) continue;
      let heat = 0; hot.forEach(h => { const dx = cx - h[0] * W, dy = cy - h[1] * H; heat = Math.max(heat, Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70)) * h[2]); });
      const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); pts.push((cx + (r - 2.5) * Math.cos(a)).toFixed(1) + "," + (cy + (r - 2.5) * Math.sin(a)).toFixed(1)); }
      const fill = heat > .55 ? `rgba(46,242,181,${.25 + heat * .55})` : heat > .2 ? `rgba(34,216,230,${.12 + heat * .4})` : "rgba(120,160,255,.07)";
      const hx = mk("polygon", { class: "hex", points: pts.join(" "), fill, stroke: "rgba(140,190,255,.10)", "stroke-width": 1 }, svg);
      hx.style.setProperty("--d", (0.2 + (cx / W) * .9).toFixed(2) + "s");
    }
  });

  document.querySelectorAll(".wave").forEach(w => { for (let i = 0; i < 64; i++) { const b = document.createElement("i"); const env = Math.sin(i / 63 * Math.PI) * .7 + .3; b.style.setProperty("--h", Math.round((30 + Math.abs(Math.sin(i * 1.7) * 70)) * env) + "%"); b.style.setProperty("--t", (-(i * .083) % 1.3).toFixed(2) + "s"); w.appendChild(b); } });

  document.querySelectorAll(".segs[data-v]").forEach(s => { const v = Math.round(+s.dataset.v / 5); for (let k = 0; k < 20; k++) { const i = document.createElement("i"); i.style.setProperty("--k", k); if (k < v) i.className = "on"; s.appendChild(i); } });

  document.querySelectorAll(".crowd[data-n]").forEach(c => { for (let k = 0; k < +c.dataset.n; k++) c.insertAdjacentHTML("beforeend", `<i class="ico"><svg viewBox="0 0 24 24">${I.user}</svg></i>`); });

  /* ------------------------------------------------------------ códigos QR */
  const CFG = window.PULSO_CONFIG || {};
  document.querySelectorAll(".qr[data-qr]").forEach(el => {
    const q = (CFG.qr || [])[+el.dataset.qr] || {};
    if (q.url && window.PulsoQR) { el.classList.remove("pending"); window.PulsoQR(el, q.url); }
    else if (q.image) { const img = new Image(); img.alt = "Código QR"; img.onload = () => { el.classList.remove("pending"); el.innerHTML = ""; el.appendChild(img); }; img.src = q.image; }
    const lab = el.parentNode.querySelector("[data-qr-label]"); if (lab && q.label) lab.textContent = q.label;
  });

  /* ------------------------------------------------------------ contadores */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", dur = +(el.dataset.dur || 1800);
    const delay = (parseFloat(getComputedStyle(el).getPropertyValue("--d")) || .25) * 1000, t0 = performance.now() + delay;
    cancelAnimationFrame(el._raf);
    const fmt = v => { let s = v.toFixed(dec); if (!dec && Math.abs(end) >= 1000) s = Math.round(v).toLocaleString("es-MX"); return pre + s + suf; };
    el.textContent = fmt(0);
    const tick = now => { const p = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(end * e); if (p < 1) el._raf = requestAnimationFrame(tick); };
    el._raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------ 3D */
  const engine = window.PulsoEngineInit ? window.PulsoEngineInit(document.getElementById("gl")) : null;
  if (!engine) document.getElementById("gl").style.display = "none";
  function parse3d(str) {
    const o = {}; if (!str) return o;
    str.split(";").forEach(kv => { const [k, v] = kv.split(":").map(s => s && s.trim()); if (!k) return;
      if (v.includes(",")) o[k] = v.split(",").map(Number); else if (isNaN(+v)) o[k] = v; else o[k] = +v; });
    return o;
  }

  /* ------------------------------------------------------------ diapositivas */
  const slides = [...document.querySelectorAll(".slide")];
  const top = document.querySelector(".topbar"), topChap = top.querySelector(".chap"), topNum = top.querySelector(".num"), bar = document.querySelector(".progress i");
  let cur = -1, step = 0, chapter = "";
  slides.forEach(s => {
    if (s.dataset.chapter) chapter = s.dataset.chapter; s._chapter = chapter;
    s._items = [...s.querySelectorAll(".a, .split, [data-step], [data-count], .draw, .layer, .mon, .map, .meters, .qq")];
    s._max = s._items.reduce((m, e) => Math.max(m, +(e.dataset.step || 0)), 0);
    s._3d = parse3d(s.dataset["3d"]);
  });
  const stepOf = e => { if (e.dataset.step !== undefined) return +e.dataset.step; const p = e.parentElement && e.parentElement.closest("[data-step]"); return p && p.closest(".slide") === e.closest(".slide") ? +p.dataset.step : 0; };

  function apply(s, st) {
    s._items.forEach(e => {
      const n = stepOf(e), hide = e.dataset.hideAt !== undefined ? +e.dataset.hideAt : Infinity, on = st >= n && st < hide;
      if (e.classList.contains("hook")) { const t = e.dataset.target ? s.querySelector(e.dataset.target) : s; if (t) t.classList.toggle(e.dataset.cls, st >= n); return; }
      const was = e.classList.contains("in");
      e.classList.toggle("in", on);
      if (e.dataset.dimAt !== undefined) e.classList.toggle("dimmed", st >= +e.dataset.dimAt);
      if (on && !was) {
        if (e.dataset.count !== undefined) countUp(e);
        e.querySelectorAll && e.querySelectorAll("[data-count]").forEach(c => { if (stepOf(c) <= st) countUp(c); });
        if (e.classList.contains("typer")) typeOut(e);
      }
    });
  }
  function typeOut(el) {
    const ws = [...el.querySelectorAll(".tw")]; ws.forEach(w => w.classList.remove("on")); clearTimeout(el._to);
    let i = 0; const next = () => { if (i < ws.length) { ws[i++].classList.add("on"); el._to = setTimeout(next, 36); } };
    el._to = setTimeout(next, 450);
  }
  function reset(s) {
    s._items.forEach(e => { e.classList.remove("in", "dimmed"); if (e.classList.contains("hook")) { const t = e.dataset.target ? s.querySelector(e.dataset.target) : s; if (t) t.classList.remove(e.dataset.cls); } });
    s.querySelectorAll(".tw").forEach(w => w.classList.remove("on"));
  }

  function go(i, st = 0) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const prev = slides[cur], next = slides[i], dir = i > cur ? 1 : -1;
    if (prev && prev !== next) {
      prev.classList.remove("active"); prev.classList.toggle("past", dir > 0);
      clearTimeout(prev._rt); prev._rt = setTimeout(() => { if (!prev.classList.contains("active")) reset(prev); }, 1000);
      if (prev._leave) prev._leave();
      prev.querySelectorAll("video[data-loop]").forEach(v => v.pause());
    }
    clearTimeout(next._rt); next.classList.remove("past");
    cur = i; step = st === "max" ? next._max : st;
    if (prev !== next) reset(next);
    void next.offsetWidth;
    next.classList.add("active");
    apply(next, step);
    document.body.dataset.bg = next.dataset.bg || "deep";
    if (engine) engine.set(Object.assign({}, next._3d, step >= 1 && next.dataset["3dStep"] ? parse3d(next.dataset["3dStep"]) : {}));
    next.querySelectorAll("video[data-loop]").forEach(v => { try { v.currentTime = 0; v.play().catch(() => {}); } catch (e) {} });
    topChap.textContent = next._chapter;
    topNum.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b> / ${String(slides.length).padStart(2, "0")}`;
    bar.style.width = ((i + 1) / slides.length * 100) + "%";
    top.classList.toggle("hidden", !!next.dataset.notop);
    try { history.replaceState(null, "", "#" + (i + 1)); } catch (e) {}
    if (next._enter) next._enter(step, prev);
  }
  function nextStep() {
    const s = slides[cur]; if (s._next && s._next()) return;
    if (step < s._max) { step++; apply(s, step); if (engine && s.dataset["3dStep"] && step === 1) engine.set(Object.assign({}, s._3d, parse3d(s.dataset["3dStep"]))); }
    else if (cur < slides.length - 1) go(cur + 1, 0);
  }
  function prevStep() {
    const s = slides[cur];
    if (step > 0) { step--; apply(s, step); if (engine && s.dataset["3dStep"] && step === 0) engine.set(s._3d); }
    else if (cur > 0) go(cur - 1, "max");
  }

  /* ------------------------------------------------------------ apertura con video */
  const intro = document.querySelector(".s-intro"), vid = document.getElementById("introVideo"), hint = document.getElementById("startHint");
  if (intro && vid) {
    const big = (screen.width * (window.devicePixelRatio || 1)) > 2200;
    vid.src = big ? "assets/video/pulso360-4k.mp4" : "assets/video/pulso360-1080.mp4";
    let started = false;
    const toEnd = () => { const set = () => { try { vid.pause(); vid.currentTime = Math.max(0, (vid.duration || 10) - .04); } catch (e) {} }; if (vid.readyState >= 1) set(); else vid.addEventListener("loadedmetadata", set, { once: true }); };
    const play = () => { vid.currentTime = 0; const p = vid.play(); started = true; if (p && p.catch) p.catch(() => { started = false; hint.classList.add("on"); }); };
    intro._enter = st => { if (st >= 1) { toEnd(); return; } hint.classList.remove("on"); play(); setTimeout(() => { if (!started || vid.paused) hint.classList.add("on"); }, 900); };
    intro._next = () => {
      if (step === 0 && !started) { hint.classList.remove("on"); play(); return true; }
      if (step === 0) { toEnd(); step = 1; apply(intro, 1); return true; }
      return false;
    };
    intro._leave = () => vid.pause();
    vid.addEventListener("playing", () => { started = true; hint.classList.remove("on"); });
    vid.addEventListener("ended", () => { if (slides[cur] === intro && step === 0) { step = 1; apply(intro, 1); } });
  }

  /* ------------------------------------------------------------ controles */
  let jumpBuf = "", jumpTo; const jumpEl = document.querySelector(".jump"), help = document.querySelector(".help");
  const fs = () => { if (!document.fullscreenElement) { const r = document.documentElement.requestFullscreen; if (r) document.documentElement.requestFullscreen().catch(() => {}); } else document.exitFullscreen(); };
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return; const k = e.key;
    if (help.classList.contains("on") && !"hH?".includes(k)) { if (k === "Escape") help.classList.remove("on"); return; }
    if (/^[0-9]$/.test(k)) { jumpBuf += k; jumpEl.textContent = "→ " + jumpBuf; jumpEl.classList.add("on"); clearTimeout(jumpTo); jumpTo = setTimeout(() => { jumpBuf = ""; jumpEl.classList.remove("on"); }, 2200); return; }
    if (k === "Enter" && jumpBuf) { go(+jumpBuf - 1); jumpBuf = ""; jumpEl.classList.remove("on"); return; }
    switch (k) {
      case "ArrowRight": case "PageDown": case " ": case "Enter": case "n": case "N": case "ArrowDown": e.preventDefault(); nextStep(); break;
      case "ArrowLeft": case "PageUp": case "Backspace": case "p": case "P": case "ArrowUp": e.preventDefault(); prevStep(); break;
      case "Home": go(0, "max"); break;
      case "End": go(slides.length - 1); break;
      case "f": case "F": fs(); break;
      case "h": case "H": case "?": help.classList.toggle("on"); break;
      case "Escape": help.classList.remove("on"); break;
    }
  });
  addEventListener("click", e => { if (help.classList.contains("on")) { help.classList.remove("on"); return; } if (e.clientX < innerWidth * .18) prevStep(); else nextStep(); });
  addEventListener("contextmenu", e => { e.preventDefault(); prevStep(); });
  let tx = null;
  addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) (dx < 0 ? nextStep : prevStep)(); tx = null; });
  let idleT; const wake = () => { document.body.classList.remove("hide-cursor"); clearTimeout(idleT); idleT = setTimeout(() => document.body.classList.add("hide-cursor"), 2600); };
  addEventListener("mousemove", wake); wake();

  const startAt = parseInt((location.hash || "").replace("#", ""), 10);
  const boot = () => go(startAt > 0 ? startAt - 1 : 0, startAt > 1 ? "max" : 0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
  window.__deck = { go, next: nextStep, prev: prevStep, get cur() { return cur; }, get step() { return step; }, slides, engine };
})();

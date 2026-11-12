// Utilidades del mapa de México (SVG de estados) para las escenas "nacional" y "ciudades".
window.MXKit = {
  NS: "http://www.w3.org/2000/svg",
  // Construye el SVG de estados dentro de `box` (en unidades del mapa: 793 x 498)
  build(box, prefix, style) {
    const M = window.MX_MAP;
    const svg = document.createElementNS(this.NS, "svg");
    svg.setAttribute("viewBox", M.viewBox);
    svg.setAttribute("width", "793");
    svg.setAttribute("height", "498");
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:visible";
    const paths = {};
    M.states.forEach((s) => {
      const p = document.createElementNS(this.NS, "path");
      p.setAttribute("d", s.d);
      p.setAttribute("id", `${prefix}-${s.id}`);
      p.setAttribute("vector-effect", "non-scaling-stroke");
      p.setAttribute("fill", style.fill);
      p.setAttribute("stroke", style.stroke);
      p.setAttribute("stroke-width", style.strokeWidth);
      p.setAttribute("stroke-linejoin", "round");
      svg.appendChild(p);
      paths[s.id] = p;
    });
    box.appendChild(svg);
    return { svg, paths };
  },
  // Centroides aproximados (para ordenar la onda de color)
  center(id) {
    const c = {
      agu: [400, 302], bcn: [82, 63], bcs: [158, 194], cam: [703, 386], chp: [648, 447], chh: [298, 113], coa: [408, 156], col: [362, 377],
      dur: [335, 222], gua: [434, 331], gro: [463, 416], hid: [489, 342], jal: [369, 340], cmx: [483, 375], mex: [469, 372], mic: [413, 376],
      mor: [485, 388], nay: [339, 307], nle: [460, 204], oax: [549, 435], pue: [515, 380], que: [463, 332], roo: [757, 364], slp: [449, 285],
      sin: [272, 220], son: [191, 88], tab: [645, 409], tam: [493, 239], tla: [508, 369], ver: [551, 372], yuc: [737, 334], zac: [392, 267],
    };
    return c[id];
  },
};

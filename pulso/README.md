# PULSO 360° Electoral — animación del logo

Video horizontal 16:9 en 8K (7680×4320, 60 fps, 10 s) para presentaciones.

## Guion (10 s)
| Tiempo | Momento |
|---|---|
| 0.0–1.4 s | Desde negro aparece una chispa teal que late dos veces (lub-dub): el **pulso**. Cada latido ilumina la retícula de puntos. |
| 1.4–2.3 s | La chispa sube y se divide en dos haces que trazan el contorno del botón; se encuentran abajo con un destello. El cristal se llena desde el centro. |
| 2.3–3.0 s | Un haz recorre el contorno del rayo y el rayo se **carga** de abajo arriba. |
| 3.0 s | **Encendido**: el rayo se pone al blanco, bloom, destello anamórfico, chispas y una onda de choque con la forma del botón. |
| 3.8–4.9 s | El botón viaja a su sitio; PULSO sube desde una máscara con desenfoque a nitidez. |
| 4.7–5.6 s | 360° ELECTORAL se "decodifica" carácter a carácter con un cursor. |
| 6.0–7.0 s | Barrido de luz especular sobre el logo. |
| 7.1 / 8.7 s | El rayo late con un brillo suave (halo y anillo tenue); el logo queda fijo para la diapositiva. |

El logo final coincide con el original: Barlow Bold (PULSO), JetBrains Mono (subtítulo),
rayo Lucide "zap" y los colores muestreados del PNG (`#091425`, `#092830`, `#025254`, `#00CDAC`).

## Archivos
- `index.html` + `pulso.js` — la animación (canvas, determinista: `PULSO.renderFrame(t)`).
- `render.mjs` — captura fotogramas con Chromium headless (Playwright).
- `build.sh` — render + codificación a `renders/` (no se versiona por tamaño).
- `assets/` — tipografías (OFL) y el logo de referencia.

## Uso
```bash
./build.sh                                                  # video final 8K + 4K
node render.mjs --scale 1 --out renders/preview --times 1,3.06,9.9   # fotogramas sueltos
```

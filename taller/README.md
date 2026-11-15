# SOMOS · Comunicación Política en Acción — video del taller

Video vertical de 29.5 s (2160×3840, 30 fps) para Reels/TikTok: un celular enciende con el logotipo de SOMOS,
el cartel del evento animado, ráfaga de tomas del taller, los cinco temas (Comunicación, Redes sociales, Imagen,
Narrativa, Impresiones) y cierre con SOMOS Impacto, el logotipo con lema y el Instagram de @somosimpactocdmx y
@somos_mh.

- `index.html` — la composición (HTML + GSAP), determinista: `window.__seek(t)` deja listo el cuadro `t`.
- `render.mjs` — Playwright cuadro a cuadro → ffmpeg (`--snap 1,8.2` para revisar cuadros sueltos).
- `clips.json` — qué tramo de cada video del taller se usa y en qué momento entra (`tools/clips.py` los recorta).
- `tools/sfx.py` — diseño sonoro sintetizado (whooshes, impactos, obturador, teclado, pops, glitch, brillos).
- `build.py` — música editada al ritmo (120 BPM, drop en 7.5 s), mezcla a −14 LUFS, render 4K en paralelo y entrega.

```bash
python3 build.py            # todo: frames sfx audio visual final
```

```bash
python3 build.py visual:1 final   # pasada rápida a 1080×1920
```

Identidad (Manual SOMOS 2026): Rosa Cívico `#E4007C`; logotipo rosa sobre blanco; sobre rosa u oscuro, dentro
de la pleca blanca; nunca logotipo blanco sobre rosa. Bernino Sans (Adobe Fonts) se sustituye por Fira Sans y se
usa Hind Siliguri como secundaria. Cada foto, video, sticker y transición aparece una sola vez.

## Propuesta 2 · teaser

`teaser.html` es un teaser de la primera sesión: abre con el celular que enciende con el logotipo de SOMOS y sigue con un montaje al ritmo (cortes cada 0.5 s y ráfagas de 0.25 s), casi sin
texto. Las tomas están en `teaser.json`; `tools/teaser_footage.py` junta esos tramos en
`assets/clips/teaser-footage.mp4` y `tools/sfx_teaser.py` hace sus efectos.

```bash
python3 build_teaser.py     # frames sfx audio visual final -> renders/somos-taller-teaser.mp4
```

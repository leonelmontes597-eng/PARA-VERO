# Para Vero 🌻

Una pequeña experiencia interactiva y cinematográfica, hecha con HTML, CSS y JavaScript puro (sin frameworks).

## Cómo abrirla
Abre **`index.html`** en cualquier navegador. También funciona subida a la web (GitHub Pages / Netlify).

## Los videos
Van en `assets/videos/` como `video1.mp4` … `video5.mp4`.
Se reproducen solos, en silencio y en bucle. Para cambiarlos, reemplaza los archivos
(mismo nombre) o edita la lista `fotos` en `js/config.js`, donde cada video se ve así:

```js
{ tipo: "video", src: "assets/videos/video1.mp4", frase: "Ese momento." }
```

## Qué puedes cambiar (todo en `js/config.js`)
- el **nombre** (VERO) y la **firma**
- el texto **exacto de la carta**
- las **frases** de las flores y la **frase secreta** (flor escondida)
- los **videos** y sus frases
- la **velocidad** global (`ritmo`)

Los **colores** están en `css/main.css` como variables (`--dorado`, `--ambar`…).

## Detalles incluidos
Partículas doradas, luciérnagas, estela que sigue el dedo, girasoles SVG animados,
parallax al girar el teléfono, sonidos suaves generados en el navegador,
máquina de escribir en la carta, corazón incompleto con brillo, grano y viñeta de cine,
vibración al tocar flores, y soporte para `prefers-reduced-motion`.

Sin música de fondo. Hecho con cariño. 🌻

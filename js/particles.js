/* ============================================================
   particles.js  —  Motor de partículas doradas (Canvas).
   Modos: ambiente (flotan), formar texto, corazón incompleto,
   explosión. Un solo sistema para todas las escenas.
   ============================================================ */

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.particles = [];
    this.mode = "ambiente";
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.parallax = { x: 0, y: 0 };
    this.resize();

    // cantidad según tamaño de pantalla (móvil = menos)
    const area = window.innerWidth * window.innerHeight;
    let base = Math.round(area / 9000);
    if (document.body.classList.contains("ligero")) base = Math.round(base * 0.55);
    this.count = Math.max(40, Math.min(base, 180));

    for (let i = 0; i < this.count; i++) this.particles.push(this._nueva());

    window.addEventListener("resize", () => this.resize());
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  resize() {
    const { canvas } = this;
    canvas.width  = window.innerWidth  * this.dpr;
    canvas.height = window.innerHeight * this.dpr;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _nueva(x, y) {
    return {
      x: x ?? Math.random() * this.w,
      y: y ?? Math.random() * this.h,
      // objetivo (para formar figuras); null = libre
      tx: null, ty: null,
      vx: (Math.random() - .5) * .25,
      vy: -.15 - Math.random() * .35,     // suben lento como polvo de luz
      r: .6 + Math.random() * 2.2,
      base: .3 + Math.random() * .6,       // opacidad base
      alpha: 0,
      hue: Math.random() < .25 ? 45 : 40,  // dorado/ámbar
      z: .3 + Math.random() * .7           // profundidad (parallax)
    };
  }

  setParallax(x, y) { this.parallax.x = x; this.parallax.y = y; }

  /* --- Modo ambiente: partículas flotan libres --- */
  ambiente() {
    this.mode = "ambiente";
    for (const p of this.particles) { p.tx = null; p.ty = null; }
  }

  /* --- Formar una figura a partir de puntos objetivo --- */
  _asignarObjetivos(puntos) {
    // si faltan partículas, agrega; si sobran, las libera
    while (this.particles.length < puntos.length) this.particles.push(this._nueva());
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (i < puntos.length) { p.tx = puntos[i].x; p.ty = puntos[i].y; }
      else { p.tx = null; p.ty = null; }
    }
  }

  /* Formar TEXTO (ej. "VERO") muestreando píxeles */
  formarTexto(texto, { size = null, font = "700 var(--px) 'Cormorant Garamond', serif" } = {}) {
    this.mode = "figura";
    const off = document.createElement("canvas");
    off.width = this.w; off.height = this.h;
    const c = off.getContext("2d");
    const px = size || Math.min(this.w * 0.26, 220);
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `700 ${px}px 'Cormorant Garamond', Georgia, serif`;
    c.fillText(texto, this.w / 2, this.h * 0.5);

    const puntos = this._muestrear(c, off.width, off.height);
    this._asignarObjetivos(puntos);
  }

  /* Formar CORAZÓN — con un hueco (incompleto) a propósito */
  formarCorazon({ completo = false } = {}) {
    this.mode = "figura";
    const cx = this.w / 2, cy = this.h * 0.48;
    const escala = Math.min(this.w, this.h) * 0.011;
    const puntos = [];
    const total = Math.min(this.particles.length, 220);
    for (let i = 0; i < total; i++) {
      const t = (i / total) * Math.PI * 2;
      // corazón paramétrico
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      // dejamos un hueco arriba a la derecha si es incompleto
      if (!completo && t > 0.35 && t < 1.15) continue;
      puntos.push({ x: cx + x * escala, y: cy - y * escala });
    }
    this._asignarObjetivos(puntos);
  }

  _muestrear(ctx, w, h) {
    const data = ctx.getImageData(0, 0, w, h).data;
    const puntos = [];
    const paso = Math.max(4, Math.round(w / 180)); // densidad
    for (let y = 0; y < h; y += paso) {
      for (let x = 0; x < w; x += paso) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > 128) puntos.push({ x, y });
      }
    }
    // mezclar para asignación natural
    for (let i = puntos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [puntos[i], puntos[j]] = [puntos[j], puntos[i]];
    }
    // límite para mantener fluidez en teléfonos
    const max = document.body.classList.contains("ligero") ? 150 : 240;
    return puntos.slice(0, max);
  }

  /* --- Explosión suave desde el centro --- */
  explosion(x = this.w / 2, y = this.h / 2, fuerza = 6) {
    this.mode = "ambiente";
    for (const p of this.particles) {
      p.tx = null; p.ty = null;
      const ang = Math.random() * Math.PI * 2;
      const v = (1 + Math.random() * fuerza);
      p.x = x; p.y = y;
      p.vx = Math.cos(ang) * v;
      p.vy = Math.sin(ang) * v;
      p.alpha = p.base;
    }
    // agrega un extra de chispas temporales
    for (let i = 0; i < 60; i++) {
      const ang = Math.random() * Math.PI * 2;
      const v = 2 + Math.random() * fuerza * 1.4;
      this.particles.push({
        x, y, tx: null, ty: null,
        vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
        r: .8 + Math.random() * 1.8, base: .8, alpha: .8,
        hue: 45, z: .8, efimera: true, vida: 1
      });
    }
  }

  _loop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = "lighter";

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.tx !== null) {
        // atraído a su objetivo (formar figura)
        p.x += (p.tx - p.x) * 0.06;
        p.y += (p.ty - p.y) * 0.06;
        p.alpha += (p.base + .25 - p.alpha) * 0.05;
      } else {
        // flotar libre
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;
        if (!this.reduced) p.vy -= 0.002; // leve deriva hacia arriba
        p.alpha += (p.base - p.alpha) * 0.02;

        // reciclar cuando sale de pantalla
        if (p.y < -10 || p.x < -10 || p.x > this.w + 10 || p.y > this.h + 10) {
          if (p.efimera) { this.particles.splice(i, 1); continue; }
          Object.assign(p, this._nueva(Math.random() * this.w, this.h + 8));
        }
      }

      if (p.efimera) { p.vida -= 0.015; p.alpha = Math.max(0, p.vida); if (p.vida <= 0) { this.particles.splice(i, 1); continue; } }

      // parallax por profundidad
      const ox = this.parallax.x * p.z * 18;
      const oy = this.parallax.y * p.z * 18;

      const grad = ctx.createRadialGradient(p.x+ox, p.y+oy, 0, p.x+ox, p.y+oy, p.r * 3);
      grad.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${p.alpha})`);
      grad.addColorStop(1, `hsla(${p.hue}, 90%, 55%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x + ox, p.y + oy, p.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(this._loop);
  }
}

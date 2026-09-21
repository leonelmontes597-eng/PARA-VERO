/* ============================================================
   transitions.js  —  Ayudas de transición y efectos de texto.
   ============================================================ */

const ritmo = () => (CONFIG.ritmo || 1);

/* Espera (respetando el ritmo global) */
const esperar = (ms) => new Promise(r => setTimeout(r, ms * ritmo()));

/* Cambiar de escena con crossfade */
function irAEscena(id) {
  document.querySelectorAll(".escena.activa").forEach(e => e.classList.remove("activa"));
  const el = document.getElementById(id);
  if (el) el.classList.add("activa");
  if (window.Audio2) window.Audio2.brillo();
  return el;
}

/* Revela una lista de líneas dentro de un contenedor, una por una.
   Cada línea debe existir ya en el DOM con clase .linea */
async function revelarLineas(contenedor, pausaEntre = 1500, pausaInicio = 400) {
  const lineas = contenedor.querySelectorAll(".linea");
  await esperar(pausaInicio);
  for (const l of lineas) {
    l.classList.add("ver");
    await esperar(pausaEntre);
  }
}

/* Efecto máquina de escribir sobre un elemento (texto ya definido en data-text) */
function maquinaEscribir(el, texto, velocidad = 28) {
  return new Promise(resolve => {
    el.textContent = "";
    el.classList.add("cursor-typing");
    let i = 0;
    const paso = () => {
      if (i <= texto.length) {
        el.textContent = texto.slice(0, i);
        i++;
        // ritmo natural: pausas más largas tras puntuación
        const ch = texto[i - 2] || "";
        let d = velocidad;
        if (".!?".includes(ch)) d = velocidad * 12;
        else if (",;".includes(ch)) d = velocidad * 6;
        setTimeout(paso, d * ritmo() * 0.5);
      } else {
        el.classList.remove("cursor-typing");
        resolve();
      }
    };
    paso();
  });
}

/* Letterbox (barras de cine) */
function cine(on = true) {
  document.body.classList.toggle("cine", on);
}

/* Crea elementos <p class="linea"> a partir de un array y los mete en el contenedor */
function pintarLineas(contenedor, lineas, extraClase = "") {
  contenedor.innerHTML = "";
  lineas.forEach(t => {
    const p = document.createElement("p");
    p.className = "linea " + extraClase;
    p.textContent = t;
    contenedor.appendChild(p);
  });
}

/* ============================================================
   Parallax: giro del teléfono (o mouse en escritorio)
   Mueve capas .parallax y avisa a los motores de partículas.
   ============================================================ */
class Parallax {
  constructor(sistemas = []) {
    this.sistemas = sistemas;       // objetos con setParallax(x,y)
    this.x = 0; this.y = 0;
    this.objetivoX = 0; this.objetivoY = 0;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.reduced) return;

    // Escritorio: mouse
    window.addEventListener("mousemove", (e) => {
      this.objetivoX = (e.clientX / window.innerWidth - .5) * 2;
      this.objetivoY = (e.clientY / window.innerHeight - .5) * 2;
    });

    // Móvil: giroscopio
    this._activarGiro();

    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  _activarGiro() {
    const manejar = (e) => {
      if (e.gamma == null) return;
      // gamma: izquierda/derecha (-90..90), beta: adelante/atrás
      this.objetivoX = Math.max(-1, Math.min(1, e.gamma / 30));
      this.objetivoY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    // iOS 13+ requiere permiso; se pide tras un toque (ver app.js)
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      this._pedirPermiso = () => {
        DeviceOrientationEvent.requestPermission()
          .then(res => { if (res === "granted") window.addEventListener("deviceorientation", manejar); })
          .catch(() => {});
      };
    } else {
      window.addEventListener("deviceorientation", manejar);
    }
  }

  pedirPermisoGiro() { if (this._pedirPermiso) this._pedirPermiso(); }

  _loop() {
    this.x += (this.objetivoX - this.x) * 0.05;
    this.y += (this.objetivoY - this.y) * 0.05;

    document.querySelectorAll(".parallax").forEach(el => {
      const d = parseFloat(el.dataset.depth || "1");
      el.style.transform = `translate(${-this.x * 12 * d}px, ${-this.y * 12 * d}px)`;
    });
    this.sistemas.forEach(s => s.setParallax && s.setParallax(this.x, this.y));

    requestAnimationFrame(this._loop);
  }
}

/* ============================================================
   Estela dorada que sigue el dedo / cursor (canvas propio)
   ============================================================ */
class Estela {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.chispas = [];
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
    window.addEventListener("resize", () => this.resize());

    const add = (x, y) => {
      if (this.reduced) return;
      for (let i = 0; i < 2; i++) this.chispas.push({
        x, y, vx: (Math.random()-.5)*.8, vy: (Math.random()-.5)*.8 + .3,
        r: 1+Math.random()*2, vida: 1
      });
    };
    window.addEventListener("mousemove", (e) => add(e.clientX, e.clientY));
    window.addEventListener("touchmove", (e) => {
      const t = e.touches[0]; if (t) add(t.clientX, t.clientY);
    }, { passive: true });

    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }
  resize() {
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
  }
  _loop() {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.w,this.h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = this.chispas.length-1; i>=0; i--) {
      const c = this.chispas[i];
      c.x += c.vx; c.y += c.vy; c.vida -= 0.04;
      if (c.vida <= 0) { this.chispas.splice(i,1); continue; }
      const g = ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r*4);
      g.addColorStop(0, `rgba(255,225,150,${c.vida*.8})`);
      g.addColorStop(1, "rgba(232,178,76,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c.x,c.y,c.r*4,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(this._loop);
  }
}

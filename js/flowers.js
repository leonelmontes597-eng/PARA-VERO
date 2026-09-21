/* ============================================================
   flowers.js  —  Girasoles SVG, jardín interactivo y luciérnagas.
   ============================================================ */

/* --- Definiciones SVG compartidas (glow) — se inyectan una vez --- */
function inyectarDefsSVG() {
  if (document.getElementById("svg-defs")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", "svg-defs");
  svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.innerHTML = `
    <defs>
      <filter id="glowFuerte" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
  document.body.appendChild(svg);
}

/* --- Genera el markup de un girasol estilizado (SVG) --- */
function girasolSVG({ conTallo = false } = {}) {
  const petalos = [];
  const N = 16;
  for (let i = 0; i < N; i++) {
    const ang = (360 / N) * i;
    const clase = i % 2 === 0 ? "petalo" : "petalo petalo-2";
    petalos.push(
      `<g transform="rotate(${ang} 50 50)">
         <ellipse class="${clase}" cx="50" cy="24" rx="6.5" ry="17"/>
       </g>`);
  }
  const tallo = conTallo ? `
    <path class="tallo" d="M50 66 Q47 88 50 108"/>
    <path class="hoja" d="M50 84 Q34 78 30 90 Q44 92 50 86 Z"/>
    <path class="hoja" d="M50 94 Q66 88 70 100 Q56 102 50 96 Z"/>` : "";

  return `
    <svg viewBox="0 0 100 ${conTallo ? 112 : 100}" xmlns="http://www.w3.org/2000/svg">
      ${tallo}
      <g class="corola">${petalos.join("")}</g>
      <circle class="disco-luz" cx="50" cy="50" r="20"/>
      <circle class="disco" cx="50" cy="50" r="15"/>
    </svg>`;
}

/* ============================================================
   Jardín: flores que aparecen alrededor con vida propia
   ============================================================ */
class Jardin {
  constructor(contenedor) {
    this.cont = contenedor;
    this.flores = [];
    this.frasesUsadas = 0;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    inyectarDefsSVG();
  }

  /* Crea N flores repartidas de forma orgánica */
  poblar(n = 10) {
    const cont = this.cont;
    // decide cuál será la flor "especial" (escondida)
    const especial = Math.floor(Math.random() * n);
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "girasol" + (i === especial ? " especial" : "");
      const size = 40 + Math.random() * 70;         // tamaños distintos
      el.style.width = size + "px";
      el.style.left = (6 + Math.random() * 86) + "%";
      el.style.top  = (14 + Math.random() * 74) + "%";
      el.style.setProperty("--dur", (5 + Math.random() * 4).toFixed(1) + "s");
      el.style.setProperty("--delay", (Math.random() * 3).toFixed(1) + "s");
      el.style.zIndex = Math.round(size);           // profundidad
      el.innerHTML = girasolSVG();
      el.dataset.idx = i;
      el.dataset.especial = (i === especial) ? "1" : "0";
      el.addEventListener("click", (e) => this._tocar(el, e));
      cont.appendChild(el);
      this.flores.push(el);
    }
  }

  /* Aparecen escalonadas (efecto "el jardín despierta") */
  florecer() {
    this.flores.forEach((el, i) => {
      setTimeout(() => el.classList.add("brota"), i * 220 * (CONFIG.ritmo || 1));
    });
  }

  _tocar(el, e) {
    if (this.reduced) el.classList.add("tocada");
    // háptico sutil en móvil
    if (navigator.vibrate) navigator.vibrate(12);
    if (window.Audio2) window.Audio2.campana(el.dataset.especial === "1" ? 660 : 523);

    const esEspecial = el.dataset.especial === "1";
    let data;
    if (esEspecial && !this._secretaMostrada) {
      this._secretaMostrada = true;
      data = { titulo: "…", texto: CONFIG.fraseSecreta };
    } else {
      const frases = CONFIG.frasesFlores;
      data = frases[this.frasesUsadas % frases.length];
      this.frasesUsadas++;
    }
    this._mostrarFrase(el, data);

    // avisar a la app cuántas se han tocado (para habilitar continuar)
    document.dispatchEvent(new CustomEvent("flor-tocada", { detail: { total: this.frasesUsadas } }));
  }

  _mostrarFrase(el, data) {
    // quita frase anterior
    const previa = document.querySelector(".frase-flor");
    if (previa) previa.remove();

    const b = document.createElement("div");
    b.className = "frase-flor";
    b.innerHTML = `<span class="titulo">${data.titulo}</span>${data.texto}`;
    document.body.appendChild(b);

    // posición cerca de la flor, sin salir de pantalla
    const r = el.getBoundingClientRect();
    let x = r.left + r.width / 2;
    let y = r.top - 12;
    b.style.left = x + "px";
    b.style.top = y + "px";
    b.style.transform = "translate(-50%,-100%)";
    requestAnimationFrame(() => {
      const bb = b.getBoundingClientRect();
      if (bb.top < 10) { b.style.top = (r.bottom + 12) + "px"; b.style.transform = "translate(-50%,0)"; }
      if (bb.left < 8) b.style.left = (bb.width/2 + 10) + "px";
      if (bb.right > window.innerWidth - 8) b.style.left = (window.innerWidth - bb.width/2 - 10) + "px";
      b.classList.add("ver");
    });

    clearTimeout(this._t);
    this._t = setTimeout(() => { b.classList.remove("ver"); setTimeout(() => b.remove(), 600); }, 4200);
  }

  /* pequeñas flores decorativas alrededor de un punto (nombre / final) */
  sembrarAlrededor(cx, cy, n = 6) {
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "girasol";
      const size = 26 + Math.random() * 34;
      const ang = (Math.PI * 2 / n) * i + Math.random() * .4;
      const rad = 120 + Math.random() * 90;
      el.style.width = size + "px";
      el.style.left = `calc(${cx}px + ${Math.cos(ang) * rad}px)`;
      el.style.top  = `calc(${cy}px + ${Math.sin(ang) * rad}px)`;
      el.style.setProperty("--dur", (5 + Math.random() * 3).toFixed(1) + "s");
      el.innerHTML = girasolSVG();
      this.cont.appendChild(el);
      setTimeout(() => el.classList.add("brota"), 200 + i * 150);
      this.flores.push(el);
    }
  }

  atenuar(v = true) { this.cont.style.transition = "opacity 1.2s ease"; this.cont.style.opacity = v ? "0" : "1"; }
}

/* ============================================================
   Luciérnagas: puntos de luz con movimiento orgánico (canvas)
   ============================================================ */
class Fireflies {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.bichos = [];
    this.parallax = { x: 0, y: 0 };
    this.resize();

    let n = Math.round(window.innerWidth / 55);
    if (document.body.classList.contains("ligero")) n = Math.round(n * 0.5);
    n = Math.max(6, Math.min(n, 22));
    for (let i = 0; i < n; i++) this.bichos.push(this._nuevo());

    window.addEventListener("resize", () => this.resize());
    this._loop = this._loop.bind(this);
    if (!this.reduced) requestAnimationFrame(this._loop);
    else this._dibujarEstaticas();
  }
  resize() {
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
  }
  _nuevo() {
    return {
      x: Math.random()*this.w, y: Math.random()*this.h,
      a: Math.random()*Math.PI*2, vel: .15+Math.random()*.35,
      r: 1+Math.random()*1.8, fase: Math.random()*Math.PI*2,
      z: .3+Math.random()*.7
    };
  }
  setParallax(x,y){ this.parallax.x=x; this.parallax.y=y; }
  _dibujarEstaticas(){
    const ctx=this.ctx; ctx.clearRect(0,0,this.w,this.h); ctx.globalCompositeOperation="lighter";
    for(const b of this.bichos){ this._punto(b, .5); }
    ctx.globalCompositeOperation="source-over";
  }
  _punto(b, brillo){
    const ctx=this.ctx;
    const ox=this.parallax.x*b.z*26, oy=this.parallax.y*b.z*26;
    const g=ctx.createRadialGradient(b.x+ox,b.y+oy,0,b.x+ox,b.y+oy,b.r*6);
    g.addColorStop(0,`rgba(255,225,140,${.9*brillo})`);
    g.addColorStop(.4,`rgba(232,178,76,${.4*brillo})`);
    g.addColorStop(1,"rgba(232,178,76,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x+ox,b.y+oy,b.r*6,0,Math.PI*2); ctx.fill();
  }
  _loop(t){
    const ctx=this.ctx; ctx.clearRect(0,0,this.w,this.h); ctx.globalCompositeOperation="lighter";
    for(const b of this.bichos){
      // deambular con giro suave tipo ruido
      b.a += (Math.random()-.5)*.3;
      b.x += Math.cos(b.a)*b.vel;
      b.y += Math.sin(b.a)*b.vel;
      if(b.x<0)b.x=this.w; if(b.x>this.w)b.x=0;
      if(b.y<0)b.y=this.h; if(b.y>this.h)b.y=0;
      const brillo = .35 + .65*(0.5+0.5*Math.sin(performance.now()*0.002 + b.fase));
      this._punto(b, brillo);
    }
    ctx.globalCompositeOperation="source-over";
    requestAnimationFrame(this._loop);
  }
}

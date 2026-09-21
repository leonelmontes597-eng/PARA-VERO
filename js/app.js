/* ============================================================
   app.js  —  Director de la experiencia.
   Conecta partículas, flores, audio, parallax y las 10 escenas.
   Para cambiar textos/carta/frases -> edita js/config.js
   ============================================================ */

document.documentElement.style.setProperty("--ritmo", CONFIG.ritmo || 1);

/* ---- Detección de dispositivo modesto -> modo ligero ---- */
(function detectarLigero() {
  const cores = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;
  const pequeno = Math.min(window.innerWidth, window.innerHeight) < 420;
  if (cores <= 4 && (memoria <= 4 || pequeno)) document.body.classList.add("ligero");
})();

/* ---- Referencias ---- */
const $ = (s) => document.querySelector(s);
const canvasPart = $("#particles-canvas");
const canvasFire = $("#fireflies-canvas");
const canvasTrail = $("#trail-canvas");

/* ---- Motores ---- */
const particulas = new ParticleSystem(canvasPart);
const fireflies  = new Fireflies(canvasFire);
new Estela(canvasTrail);
const parallax   = new Parallax([particulas, fireflies]);
const jardin     = new Jardin($("#jardin"));

// girasol protagonista (con tallo) dibujado en SVG
$("#girasol-principal").innerHTML = girasolSVG({ conTallo: true });

/* ---- Índice de progreso ---- */
let escenaActual = 0;
const TOTAL = 10;
function marcarProgreso(i) {
  escenaActual = i;
  const cont = $("#progreso");
  cont.querySelectorAll(".paso").forEach((p, idx) => {
    p.classList.toggle("hecho", idx < i);
    p.classList.toggle("actual", idx === i);
  });
}
(function construirProgreso() {
  const cont = $("#progreso");
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement("div");
    d.className = "paso";
    cont.appendChild(d);
  }
})();

/* ============================================================
   SECUENCIA
   ============================================================ */

/* ---------- ESCENA 1: Intro ---------- */
async function escenaIntro() {
  marcarProgreso(0);
  const esc = irAEscena("escena-intro");
  const cont = esc.querySelector(".contenido");
  pintarLineas(cont, CONFIG.intro.lineas);
  // el botón ya está en el HTML; lo revelamos al final
  await revelarLineas(cont, 2000, 800);
  const btn = $("#btn-descubrir");
  btn.classList.add("ver");
}

/* ---------- ESCENA 2: La semilla ---------- */
async function escenaSemilla() {
  marcarProgreso(1);
  cine(true);
  const esc = irAEscena("escena-semilla");
  const semilla = esc.querySelector(".semilla-luz");
  const flor = $("#girasol-principal");
  const cont = esc.querySelector(".contenido");
  cont.innerHTML = "";

  // 1) semilla luminosa late
  semilla.style.opacity = "1";
  await esperar(1600);

  // 2) crece hacia girasol
  semilla.style.opacity = "0";
  flor.classList.add("crece");
  if (window.Audio2) window.Audio2.brillo();
  await esperar(3600);

  // 3) textos
  pintarLineas(cont, CONFIG.semilla.lineas);
  await revelarLineas(cont, 2200, 400);
  await esperar(1200);

  cine(false);
  siguienteBtn(cont, escenaJardin);
}

/* ---------- ESCENA 3 + 4: El jardín e interacción ---------- */
async function escenaJardin() {
  marcarProgreso(2);
  // el girasol principal se queda como parte del jardín
  const flor = $("#girasol-principal");
  flor.style.transition = "opacity 1.2s ease";
  flor.style.opacity = "0.85";

  const esc = irAEscena("escena-jardin");
  $("#jardin").style.opacity = "1";
  jardin.poblar(11);
  jardin.florecer();

  const cont = esc.querySelector(".contenido");
  pintarLineas(cont, ["Toca las flores."], "pequena");
  await esperar(600);
  cont.querySelector(".linea").classList.add("ver");

  // esperar a que toque algunas flores para habilitar continuar
  let habilitado = false;
  document.addEventListener("flor-tocada", (e) => {
    if (!habilitado && e.detail.total >= 3) {
      habilitado = true;
      pintarLineas(cont, ["Aún faltan cosas por descubrir..."], "pequena");
      cont.querySelector(".linea").classList.add("ver");
      siguienteBtn(cont, escenaNombre, "Seguir");
    }
  });
}

/* ---------- ESCENA 5: El nombre ---------- */
async function escenaNombre() {
  marcarProgreso(3);
  limpiarFrasesFlor();
  jardin.atenuar(true);          // el jardín se retira
  const esc = irAEscena("escena-nombre");
  const cont = esc.querySelector(".contenido");
  cont.innerHTML = "";

  await esperar(900);
  particulas.formarTexto(CONFIG.nombre);   // partículas -> "VERO"
  if (window.Audio2) window.Audio2.brillo();
  await esperar(2600);

  // flores alrededor del nombre + texto
  jardin.sembrarAlrededor(window.innerWidth/2, window.innerHeight*0.5, 6);
  pintarLineas(cont, [CONFIG.nombreEscena.texto], "pequena");
  cont.querySelector(".linea").style.marginTop = "26vh";
  await esperar(700);
  cont.querySelector(".linea").classList.add("ver");
  await esperar(2600);

  siguienteBtn(cont, escenaCorazon, "Continuar");
}

/* ---------- ESCENA 6: Corazón incompleto ---------- */
async function escenaCorazon() {
  marcarProgreso(4);
  jardin.atenuar(true);
  particulas.ambiente();
  const esc = irAEscena("escena-corazon");
  const cont = esc.querySelector(".contenido");
  cont.innerHTML = "";
  const glow = esc.querySelector(".glow-hueco");

  await esperar(900);
  particulas.formarCorazon({ completo: false });   // corazón con hueco
  await esperar(1400);
  glow.classList.add("ver");                        // brillo justo en el hueco
  await esperar(1400);

  pintarLineas(cont, [CONFIG.corazon.texto]);
  cont.querySelector(".linea").style.marginTop = "30vh";
  cont.querySelector(".linea").classList.add("ver");
  await esperar(3200);

  // el corazón se deshace en partículas
  glow.classList.remove("ver");
  particulas.ambiente();
  await esperar(1600);

  siguienteBtn(cont, escenaFotos, "Continuar");
}

/* ---------- ESCENA 7: Galería de recuerdos (ella elige) ---------- */
async function escenaFotos() {
  marcarProgreso(5);
  const esc = irAEscena("escena-fotos");
  const galeria = $("#video-galeria");
  const contCont = esc.querySelector(".galeria-continuar");
  galeria.innerHTML = "";
  contCont.innerHTML = "";

  const items = CONFIG.fotos;

  // construir una miniatura tocable por cada recuerdo
  items.forEach((item, i) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.tabIndex = 0;

    if (item.tipo === "video") {
      const v = document.createElement("video");
      v.muted = true; v.playsInline = true;
      v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
      v.preload = "metadata";
      v.src = item.src;
      // mostrar un fotograma como portada
      v.addEventListener("loadeddata", () => { try { v.currentTime = 0.1; } catch (e) {} }, { once: true });
      thumb.appendChild(v);
    }
    const ico = document.createElement("div");
    ico.className = "play-ico";
    ico.textContent = "▶";
    thumb.appendChild(ico);

    if (item.frase) {
      const fr = document.createElement("div");
      fr.className = "thumb-frase";
      fr.textContent = item.frase;
      thumb.appendChild(fr);
    }

    const abrir = () => reproducirRecuerdo(item, thumb);
    thumb.addEventListener("click", abrir);
    thumb.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });

    galeria.appendChild(thumb);
    setTimeout(() => thumb.classList.add("ver"), 150 + i * 130);
  });

  // botón para continuar hacia la carta (siempre disponible)
  siguienteBtn(contCont, escenaCarta, "Continuar");
}

/* Abre el reproductor y reproduce ese recuerdo completo, con sonido.
   Como lo dispara el toque de ella, el navegador permite el audio. */
function reproducirRecuerdo(item, thumb) {
  const player = $("#video-player");
  const v = $("#vp-video");
  const frase = $("#vp-frase");

  frase.textContent = item.frase || "";
  v.src = item.src;
  v.muted = false;
  v.currentTime = 0;
  v.loop = false;

  player.classList.add("abierto");
  if (navigator.vibrate) navigator.vibrate(10);

  const cerrar = () => {
    v.pause();
    player.classList.remove("abierto");
    if (thumb) thumb.classList.add("vista");
    v.onended = null;
  };
  $("#vp-close").onclick = cerrar;
  v.onended = cerrar;

  // reproducir con sonido (dentro del gesto de tocar)
  const p = v.play();
  if (p && p.catch) p.catch(() => { /* si algo falla, ella puede usar los controles del video */ v.controls = true; });
}

/* ---------- ESCENA 8: La carta ---------- */
async function escenaCarta() {
  marcarProgreso(6);
  cine(true);
  const esc = irAEscena("escena-carta");
  const sobre = $("#sobre");
  const hoja = $("#carta-hoja");
  sobre.style.display = "";
  sobre.classList.remove("abierto");
  hoja.classList.remove("ver");
  hoja.style.display = "none";

  const abrir = async () => {
    sobre.removeEventListener("click", abrir);
    if (navigator.vibrate) navigator.vibrate([10, 40, 10]);
    if (window.Audio2) window.Audio2.brillo();
    sobre.classList.add("abierto");
    await esperar(700);
    sobre.style.display = "none";

    // construir hoja
    hoja.innerHTML = "";
    const saludo = document.createElement("div");
    saludo.className = "saludo";
    hoja.appendChild(saludo);

    hoja.style.display = "";
    hoja.scrollTop = 0;
    await esperar(60);
    hoja.classList.add("ver");
    await esperar(700);

    // máquina de escribir en el saludo
    await maquinaEscribir(saludo, CONFIG.carta.saludo, 60);
    await esperar(300);

    // párrafos revelados uno a uno (sin forzar el scroll: ella lee a su ritmo)
    for (const texto of CONFIG.carta.parrafos) {
      const p = document.createElement("p");
      p.textContent = texto;
      p.style.opacity = "0";
      p.style.transform = "translateY(10px)";
      p.style.transition = "opacity 1s ease, transform 1s ease";
      hoja.appendChild(p);
      await esperar(80);
      p.style.opacity = "1"; p.style.transform = "translateY(0)";
      await esperar(500);
    }

    // despedida
    const desp = document.createElement("div");
    desp.className = "despedida";
    hoja.appendChild(desp);
    await maquinaEscribir(desp, CONFIG.carta.despedida, 50);

    // botón cerrar
    const btn = document.createElement("button");
    btn.className = "btn cerrar";
    btn.textContent = "Cerrar la carta";
    hoja.appendChild(btn);
    requestAnimationFrame(() => btn.classList.add("ver"));
    btn.addEventListener("click", () => { cine(false); escenaSorpresa(); });
  };

  sobre.addEventListener("click", abrir);
}

/* ---------- ESCENA 9: La sorpresa ---------- */
async function escenaSorpresa() {
  marcarProgreso(7);
  const esc = irAEscena("escena-sorpresa");
  const cont = esc.querySelector(".contenido");
  const caja = $("#caja");
  caja.classList.remove("ver", "abierta");
  cont.innerHTML = "";

  pintarLineas(cont, [CONFIG.sorpresa.intriga]);
  await esperar(700);
  cont.querySelector(".linea").classList.add("ver");
  await esperar(2200);

  // botón "una última cosa..."
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = CONFIG.sorpresa.boton;
  cont.appendChild(btn);
  requestAnimationFrame(() => btn.classList.add("ver"));

  btn.addEventListener("click", async () => {
    btn.style.transition = "opacity .5s"; btn.style.opacity = "0";
    cont.querySelector(".linea").style.opacity = "0";
    await esperar(500);
    caja.classList.add("ver");
    caja.style.opacity = "1";
  }, { once: true });

  caja.addEventListener("click", async () => {
    if (caja.classList.contains("abierta")) return;
    caja.classList.add("abierta");
    if (navigator.vibrate) navigator.vibrate([15, 30, 15, 30, 40]);
    if (window.Audio2) { window.Audio2.brillo(); window.Audio2.campana(784); }
    await esperar(400);
    // explosión de partículas doradas desde la caja
    const r = caja.getBoundingClientRect();
    particulas.explosion(r.left + r.width/2, r.top + r.height/2, 8);
    await esperar(1800);
    escenaFinal();
  });
}

/* ---------- ESCENA 10: Final ---------- */
async function escenaFinal() {
  marcarProgreso(8);
  const esc = irAEscena("escena-final");
  const cont = esc.querySelector(".contenido");
  cont.innerHTML = "";
  cont.style.transition = "opacity 1s ease";
  cont.style.opacity = "1";

  // el jardín vuelve, con brillo
  $("#jardin").style.opacity = "1";
  jardin.atenuar(false);
  jardin.flores.forEach(f => f.classList.add("brota"));

  // 1) frases de cierre
  pintarLineas(cont, CONFIG.final.lineas);
  await revelarLineas(cont, 2400, 800);
  await esperar(1200);

  // 2) transición limpia hacia el cuadro final
  cont.style.opacity = "0";
  await esperar(1000);
  cont.innerHTML = "";
  cont.style.opacity = "1";

  // 3) título luminoso
  const titulo = document.createElement("div");
  titulo.className = "titulo-final";
  titulo.textContent = "🌻 " + CONFIG.nombre + " 🌻";
  titulo.style.opacity = "0";
  titulo.style.transition = "opacity 1.4s ease";
  cont.appendChild(titulo);
  requestAnimationFrame(() => titulo.style.opacity = "1");
  if (window.Audio2) window.Audio2.brillo();
  await esperar(1200);

  // 4) ramo de girasoles grandes
  construirRamo(cont);
  await esperar(1600);

  // 5) frase del día
  const fdia = document.createElement("p");
  fdia.className = "final-frase-dia";
  fdia.textContent = CONFIG.final.fraseDia;
  cont.appendChild(fdia);
  requestAnimationFrame(() => fdia.classList.add("ver"));
  if (window.Audio2) window.Audio2.brillo();
  marcarProgreso(9);
  await esperar(2400);

  // 6) reiniciar
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = CONFIG.final.reiniciar;
  cont.appendChild(btn);
  requestAnimationFrame(() => btn.classList.add("ver"));
  btn.addEventListener("click", () => location.reload());

  particulas.ambiente();
}

/* Construye un ramo de girasoles grandes (en abanico) que florece. */
function construirRamo(cont) {
  const ramo = document.createElement("div");
  ramo.className = "ramo";
  const disposicion = [
    { a: -34, s: 78,  z: 1 },
    { a: -17, s: 92,  z: 2 },
    { a:   0, s: 108, z: 3 },
    { a:  17, s: 92,  z: 2 },
    { a:  34, s: 78,  z: 1 }
  ];
  const els = disposicion.map(f => {
    const el = document.createElement("div");
    el.className = "girasol";
    el.style.width = f.s + "px";
    el.style.zIndex = f.z;
    el.style.left = "50%";
    el.style.bottom = "44px";
    el.style.transformOrigin = "bottom center";
    el.style.transform = `translateX(-50%) rotate(${f.a}deg) scale(.5)`;
    el.innerHTML = girasolSVG({ conTallo: true });
    ramo.appendChild(el);
    return { el, a: f.a };
  });
  // lazo dorado que ata el ramo
  const lazo = document.createElement("div");
  lazo.className = "ramo-lazo";
  ramo.appendChild(lazo);

  cont.appendChild(ramo);

  // florecen escalonadas
  els.forEach((o, i) => setTimeout(() => {
    o.el.classList.add("brota");
    o.el.style.transform = `translateX(-50%) rotate(${o.a}deg) scale(1)`;
  }, 150 + i * 170));
  setTimeout(() => lazo.classList.add("ver"), 150 + els.length * 170);
  return ramo;
}

/* ============================================================
   Utilidades de flujo
   ============================================================ */
function siguienteBtn(contenedor, fn, texto = "Continuar") {
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = texto;
  contenedor.appendChild(btn);
  requestAnimationFrame(() => btn.classList.add("ver"));
  btn.addEventListener("click", () => { btn.disabled = true; fn(); }, { once: true });
}
function limpiarFrasesFlor() {
  document.querySelectorAll(".frase-flor").forEach(e => e.remove());
}

/* ============================================================
   Arranque
   ============================================================ */
window.addEventListener("load", async () => {
  // ocultar precargador
  await new Promise(r => setTimeout(r, 900));
  $("#preload").classList.add("oculto");

  await escenaIntro();

  // el botón "Descubrir" arranca la experiencia (primer gesto del usuario)
  $("#btn-descubrir").addEventListener("click", () => {
    // desbloquear audio (efectos) y giroscopio (requieren gesto del usuario)
    if (window.Audio2) window.Audio2._asegurarContexto();
    parallax.pedirPermisoGiro && parallax.pedirPermisoGiro();
    $("#progreso").classList.add("visible");
    escenaSemilla();
  }, { once: true });
});

/* ============================================================
   audio.js  —  Sonidos generados (Web Audio API) + música opcional.
   No suena nada hasta que el usuario interactúa (política de navegador).
   ============================================================ */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.silencio = false;
    this.music = null;
    this.musicOn = false;
  }

  _asegurarContexto() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  /* Campanita/soplo suave. freq define el tono. */
  campana(freq = 523) {
    if (this.silencio) return;
    const ctx = this._asegurarContexto();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  /* Brillo/soplo etéreo para transiciones y momentos clave. */
  brillo() {
    if (this.silencio) return;
    const ctx = this._asegurarContexto();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523, 659, 784, 1046].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = now + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(g).connect(ctx.destination);
      osc.start(t); osc.stop(t + 1.5);
    });
  }

  /* --- Música de fondo opcional (assets/audio/musica.mp3) --- */
  _prepararMusica() {
    if (this.music) return;
    this.music = new Audio(CONFIG.audio.ruta);
    this.music.loop = true;
    this.music.volume = CONFIG.audio.volumen ?? 0.4;
    this.music.addEventListener("error", () => { this.music = null; }); // no existe el archivo: sin problema
  }

  toggleMusica() {
    this._prepararMusica();
    if (!this.music) return false;         // no hay archivo -> no cambia estado
    if (this.musicOn) { this.music.pause(); this.musicOn = false; }
    else {
      const p = this.music.play();
      if (p) p.then(() => { this.musicOn = true; }).catch(() => { this.musicOn = false; });
      else this.musicOn = true;
    }
    return this.musicOn;
  }

  intentarReproducir() {
    this._prepararMusica();
    if (this.music && !this.silencio) {
      const p = this.music.play();
      if (p) p.then(() => this.musicOn = true).catch(() => {});
    }
  }

  silenciar(v) {
    this.silencio = v;
    if (this.music) { if (v) this.music.pause(); else if (this.musicOn) this.music.play().catch(()=>{}); }
  }
}

window.Audio2 = new AudioManager();

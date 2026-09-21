/* ============================================================
   config.js  —  TODO lo que quieras cambiar está aquí.
   Nombre, carta, frases, videos, tiempos.
   No necesitas tocar el resto de archivos para personalizar.
   ============================================================ */

const CONFIG = {

  /* --- Persona --- */
  nombre: "VERO",
  firma: "Tu inge Fredy, con cariño.",

  /* --- Galería (Escena 7): VIDEOS cortos ---
     Los videos están en assets/videos/. Se reproducen solos,
     en silencio y en bucle. Puedes cambiar el orden o las frases. */
  fotos: [
    { tipo: "video", src: "assets/videos/video1.mp4", frase: "Ese momento." },
    { tipo: "video", src: "assets/videos/video2.mp4", frase: "Esa sonrisa." },
    { tipo: "video", src: "assets/videos/video3.mp4", frase: "Esa risa." },
    { tipo: "video", src: "assets/videos/video4.mp4", frase: "Ese instante." },
    { tipo: "video", src: "assets/videos/video5.mp4", frase: "Y todos esos momentos que todavía no existen." }
  ],

  /* --- ESCENA 1: Introducción --- */
  intro: {
    lineas: [
      "Hay detalles que uno quisiera entregar personalmente...",
      "Pero esta vez no tuve ese privilegio.",
      "Así que encontré otra manera de hacerte llegar uno. 🌻"
    ],
    boton: "Descubrir"
  },

  /* --- ESCENA 2: La semilla --- */
  semilla: {
    lineas: [
      "Todo empieza pequeño.",
      "Incluso las historias que algún día pueden llegar a significar mucho."
    ]
  },

  /* --- ESCENA 4: Frases al tocar las flores (cortas) --- */
  frasesFlores: [
    { titulo: "Las conversaciones", texto: "De esas que no se olvidan." },
    { titulo: "Las risas",          texto: "Contigo, hasta lo simple brilla." },
    { titulo: "Los momentos",       texto: "Pequeños, pero de los que quedan." },
    { titulo: "Lo que falta",       texto: "Todo lo que aún nos falta descubrir." }
  ],

  /* Frase secreta: aparece si encuentra la flor escondida. */
  fraseSecreta: "La encontraste sin buscarla. Como pasó contigo.",

  /* --- ESCENA 5: Nombre --- */
  nombreEscena: { texto: "Este pequeño rincón es para ti." },

  /* --- ESCENA 6: Corazón incompleto --- */
  corazon: { texto: "Quizás algunas historias todavía están escribiendo su primer capítulo." },

  /* --- ESCENA 8: Carta --- */
  carta: {
    saludo: "Vero,",
    parrafos: [
      "Hoy es 21 de septiembre, el día de las flores amarillas 🌻💛, y aunque esta vez no puedo estar frente a ti para entregártelas personalmente, no quería dejar pasar este día sin tener un detalle contigo.",
      "Quizás unas flores puedan parecer algo sencillo, pero para mí hoy tienen un significado un poquito diferente. Representan cariño, ilusión, esperanza y también esos nuevos comienzos que aparecen cuando uno menos los espera.",
      "Y creo que tú sabes por qué pensé en ti.",
      "Después de todo lo que pasó entre nosotros, he tenido bastante tiempo para pensar y entender muchas cosas. Al principio actué desde el dolor y tomé decisiones que quizás no fueron las mejores, pero con el tiempo comprendí que lo que sentía por ti era mucho más profundo de lo que yo mismo quería reconocer.",
      "Y ahora que nuevamente hemos vuelto a hablar, valoro muchísimo cada conversación que tenemos. Me gusta que podamos volver a compartir momentos, bromear, conversar de cualquier cosa y simplemente disfrutar de nuestra compañía, incluso estando en ciudades diferentes.",
      "También he pensado mucho en todo lo que me dijiste. Quizás en aquel momento estaba demasiado dolido para entenderlo, pero hoy puedo verlo de otra manera. Entiendo que tu fe y tu relación con Dios son algo muy importante para ti, y también entendí que yo necesitaba revisar muchas cosas de mi propia vida.",
      "Por eso estoy intentando cambiar. No quiero decir que de un día para otro me convertí en otra persona, porque sé que los cambios verdaderos toman tiempo. Pero sí puedo decirte que estoy intentando acercarme nuevamente a Dios y construir una mejor versión de mí mismo.",
      "Y quiero que sepas algo: no estoy haciendo esto para obligarte a volver ni para que sientas que tienes que darme una oportunidad. Lo hago porque quiero estar mejor conmigo mismo. Y si algún día nuestros caminos vuelven a coincidir de una manera diferente, quisiera que sea encontrándonos siendo mejores personas.",
      "Hoy simplemente quería regalarte un poquito de alegría, aunque estemos lejos. 🌻",
      "Quizás estas flores no puedan reemplazar el detalle de tenerlas frente a ti, pero llevan algo que sí puedo darte incluso a la distancia: un poquito de mi cariño, una sonrisa y la ilusión de que algún día pueda entregarte unas flores de verdad, personalmente.",
      "Feliz día de las flores amarillas. 💛🌻",
      "Y si alguna vez te preguntas por qué escogí precisamente flores amarillas para ti, creo que la respuesta es sencilla:",
      "Porque hay personas que llegan a nuestra vida y, sin darse cuenta, empiezan a darle un poquito más de color.",
      "Tú eres una de ellas. 💛"
    ],
    despedida: "Tu inge Fredy, con cariño. 🌻💛"
  },

  /* --- ESCENA 9: Sorpresa --- */
  sorpresa: { intriga: "¿Creías que ya terminaba?", boton: "Una última cosa..." },

  /* --- ESCENA 10: Final --- */
  final: {
    lineas: [
      "No sé qué nos espera más adelante...",
      "Pero me alegra que nuestros caminos se hayan cruzado.",
      "Y si algún día volvemos a mirar esto, espero que podamos sonreír recordando cómo comenzó todo."
    ],
    reiniciar: "Volver a vivirlo"
  },

  /* --- Velocidad global de las animaciones (1 = normal) --- */
  ritmo: 1
};

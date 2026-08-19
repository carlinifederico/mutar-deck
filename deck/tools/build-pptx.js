/* ==========================================================================
   Genera MUTAR-deck-es.pptx — los 20 frames del deck web como slides nativos
   de Google Slides: cajas de texto y formas reales, todo editable.

     node deck/tools/build-pptx.js

   El diseno se define en una grilla de 1280x720 px, igual que el modo ?print
   del deck web, y pptx-lib lo convierte a EMU.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { zip, text, rect, pic } = require('./pptx-lib');

const RAIZ = path.join(__dirname, '..', '..');
const SALIDA = path.join(__dirname, '..', 'export');

// ---- Paleta ----------------------------------------------------------------
const C = {
  bone: 'F2EFE9', ink: '0D0C0B', white: 'FFFFFF',
  pink: 'FF2E88', lime: 'C8F000', yellow: 'FFE500',
  cyan: '2E9BFF', violet: '7A3CFF', orange: 'FF5B1F'
};
// El acento como TEXTO sobre fondo claro se oscurece, igual que --accent-text
const SOBRE_HUESO = { pink: 'B62462', lime: '8CA803', yellow: 'B6A403', cyan: '206EB3', violet: '552AB3', orange: 'B64319' };

const GROUNDS = {
  bone:   { bg: C.bone,   fg: C.ink,   dim: '6E6C68', hair: 'D5D1C8' },
  ink:    { bg: C.ink,    fg: C.bone,  dim: '8A8884', hair: '2E2C29' },
  violet: { bg: C.violet, fg: C.bone,  dim: 'C3B0F5', hair: '9366F5' }
};

// Acento usable como texto segun el fondo
function acentoTexto(ground, acento) {
  return ground === 'bone' ? (SOBRE_HUESO[acento] || C[acento]) : C[acento];
}

// ---- Rejilla ---------------------------------------------------------------
const M = 72;                 // margen izquierdo/derecho
const TOP = 44;               // linea del tag
const W = 1280 - M * 2;       // ancho util
const F = { display: 'Fredoka', mono: 'DM Mono', body: 'Bricolage Grotesque', bubble: 'Bagel Fat One' };

// ---- Definicion de los 20 slides -------------------------------------------
// Cada entrada: {n, acto, ground, acento, build(ctx) -> [formas]}
const ACTOS = ['ENTRADA','LA PREGUNTA','LA IDEA','EL RECORRIDO','LA EXPERIENCIA','ESCALA','LOS CREADORES','CIERRE'];

function tag(n, acto, g, at) {
  return text([[{ t: String(n).padStart(2,'0'), color: at }, { t: '   ' + acto, color: g.dim }]],
    { x: M, y: TOP, w: W, size: 11, font: F.mono, spacing: 0.18 });
}

// Pildora de pendiente
function nota(txt, y, g, ac) {
  const w = Math.min(W, txt.length * 6.6 + 46);
  return [
    rect({ x: M, y, w, h: 30, fill: null, line: g.hair, lineW: 1, prst: 'roundRect', adj: 50000 }),
    rect({ x: M + 16, y: y + 12.5, w: 6, h: 6, fill: C[ac], prst: 'ellipse' }),
    text(txt, { x: M + 30, y: y + 9, w: w - 44, size: 10.5, font: F.mono, color: g.dim, spacing: 0.16 })
  ];
}

const SLIDES = [

// 01 · PORTADA
{ n:1, acto:0, ground:'bone', acento:'pink', build(g, at, rid) { return [
  pic(rid.rosa, { x: 232, y: 250, w: 816, h: 191 }),
  text('EXPERIENCIA INMERSIVA Y COLABORATIVA   ·   REALIDAD MIXTA   ·   ESCULTURA COLECTIVA   ·   ARTE PÚBLICO',
    { x: M, y: 470, w: W, size: 11.5, font: F.mono, color: g.fg, align: 'ctr', spacing: 0.16 }),
  rect({ x: M, y: 560, w: W, h: 1, fill: g.hair }),
  ...nota('ESTRUCTURA EN DESARROLLO — NO ES UN DOCUMENTO FINAL', 578, g, 'pink'),
  text('2026', { x: M, y: 587, w: W, size: 11, font: F.mono, color: g.dim, align: 'r', spacing: 0.16 })
];}},

// 02 · PREGUNTA 1
{ n:2, acto:1, ground:'ink', acento:'lime', build(g, at) { return [
  text('¿Cuántas cosas guardás sin saber por qué?',
    { x: M, y: 210, w: 980, size: 68, font: F.display, bold: true, color: g.fg, lineHeight: 1.02 }),
  text('LA ACUMULACIÓN SUCEDE EN SILENCIO',
    { x: M, y: 470, w: W, size: 11, font: F.mono, color: g.dim, spacing: 0.18 })
];}},

// 03 · PREGUNTA 2
{ n:3, acto:1, ground:'ink', acento:'lime', build(g) { return [
  text('¿Y si soltar fuera el comienzo de algo nuevo?',
    { x: M, y: 210, w: 1000, size: 68, font: F.display, bold: true, color: g.fg, lineHeight: 1.02 })
];}},

// 04 · TESIS
{ n:4, acto:2, ground:'bone', acento:'yellow', build(g) { return [
  text('MUTAR convierte el desorden personal en arte público y colaborativo.',
    { x: M, y: 170, w: 1080, size: 62, font: F.display, bold: true, color: g.fg, lineHeight: 1.04 }),
  text('OBJETO · DESAPEGO · DIGITALIZACIÓN · CREACIÓN COLECTIVA · ESCULTURA FÍSICA · PATRIMONIO COMPARTIDO',
    { x: M, y: 520, w: W, size: 11, font: F.mono, color: g.dim, spacing: 0.14 })
];}},

// 05 · CONCEPTO
{ n:5, acto:2, ground:'bone', acento:'yellow', build(g, at) {
  const beats = [
    ['01', 'Guardamos lo que ya no usamos.'],
    ['02', 'No porque sirva. Porque soltar cuesta.'],
    ['03', 'Lo abundante se vuelve invisible.']
  ];
  const cw = (W - 2 * 32) / 3;
  const out = [
    text('La acumulación como carga contemporánea.',
      { x: M, y: 120, w: 1000, size: 46, font: F.display, bold: true, color: g.fg, lineHeight: 1.04 })
  ];
  beats.forEach(([num, t], i) => {
    const x = M + i * (cw + 32);
    out.push(rect({ x, y: 280, w: cw, h: 3, fill: C.yellow }));
    out.push(text(num, { x, y: 296, w: cw, size: 11, font: F.mono, color: at, spacing: 0.18 }));
    out.push(text(t, { x, y: 322, w: cw, size: 24, font: F.display, bold: true, color: g.fg, lineHeight: 1.12 }));
  });
  out.push(text('“Lo que está y no se usa nos fulminará.”',
    { x: M, y: 470, w: 700, size: 32, font: F.display, bold: true, color: at, lineHeight: 1.05 }));
  out.push(text('— LAS', { x: M, y: 552, w: 300, size: 11, font: F.mono, color: g.dim, spacing: 0.18 }));
  return out;
}},

// 06 · QUÉ ES MUTAR
{ n:6, acto:2, ground:'bone', acento:'yellow', build(g, at) {
  const beats = [
    ['DONAR', 'La gente entrega objetos reales que ya no usa.'],
    ['CONSTRUIR', 'En realidad mixta, desconocidos construyen esculturas juntos.'],
    ['HACERLA REAL', 'La comunidad vota. Una escultura se construye de verdad.']
  ];
  const cw = (W - 2 * 32) / 3;
  const out = [
    text('¿Qué es MUTAR?', { x: M, y: 120, w: 900, size: 46, font: F.display, bold: true, color: g.fg })
  ];
  beats.forEach(([num, t], i) => {
    const x = M + i * (cw + 32);
    out.push(rect({ x, y: 250, w: cw, h: 3, fill: C.yellow }));
    out.push(text(num, { x, y: 266, w: cw, size: 11, font: F.mono, color: at, spacing: 0.18 }));
    out.push(text(t, { x, y: 292, w: cw, size: 23, font: F.display, bold: true, color: g.fg, lineHeight: 1.12 }));
  });
  out.push(text('“Una transformación colectiva de lo virtual a lo real.”',
    { x: M, y: 470, w: 820, size: 32, font: F.display, bold: true, color: at, lineHeight: 1.05 }));
  return out;
}},

// 07 · DIVISOR
{ n:7, acto:3, ground:'ink', acento:'cyan', build(g, at) { return [
  text('CÓMO SUCEDE LA', { x: M, y: 230, w: W, size: 96, font: F.bubble, color: g.fg, align: 'ctr', lineHeight: 0.92 }),
  text('MUTACIÓN', { x: M, y: 350, w: W, size: 96, font: F.bubble, color: C.cyan, align: 'ctr', lineHeight: 0.92 })
];}},

// 08 · CINCO MOVIMIENTOS
{ n:8, acto:3, ground:'ink', acento:'cyan', build(g, at) {
  const pasos = [
    ['1','Soltar','“Elegís lo que ya no te sirve.”','Escanear se vuelve un acto de desprendimiento.', C.pink],
    ['2','Compartir','“Tu objeto deja de ser tuyo.”','Entra a una biblioteca con la que todos pueden construir.', C.lime],
    ['3','Crear y Jugar','“Construir juntos sin dueño.”','Escala real. Las piezas grandes necesitan muchas manos.', C.yellow],
    ['4','Votar','“La comunidad decide qué existe.”','Cada escultura se publica online.', C.cyan],
    ['5','Construir','“Lo virtual se vuelve físico.”','La ganadora se construye con los objetos reales.', C.orange]
  ];
  const gap = 16, cw = (W - gap * 4) / 5;
  const out = [
    text('Cinco movimientos', { x: M, y: 96, w: 600, size: 32, font: F.display, bold: true, color: g.fg })
  ];
  pasos.forEach(([num, tit, cita, desc, col], i) => {
    const x = M + i * (cw + gap);
    out.push(rect({ x, y: 190, w: cw, h: 360, fill: null, line: g.hair, lineW: 1, prst: 'roundRect', adj: 9000 }));
    out.push(text(num, { x: x + 20, y: 208, w: cw - 40, size: 52, font: F.bubble, color: col, lineHeight: 1 }));
    out.push(text(tit, { x: x + 20, y: 282, w: cw - 40, size: 22, font: F.display, bold: true, color: g.fg, lineHeight: 1.05 }));
    out.push(text(cita, { x: x + 20, y: 330, w: cw - 40, size: 13, font: F.body, color: col, lineHeight: 1.25 }));
    out.push(text(desc, { x: x + 20, y: 392, w: cw - 40, size: 13, font: F.body, color: g.dim, lineHeight: 1.35 }));
  });
  return out;
}},

// 09 · PIPELINE
{ n:9, acto:3, ground:'ink', acento:'cyan', build(g, at) {
  const etapas = [
    ['Convocatoria','Objetos y sus historias'], ['Curaduría','20 a 30 objetos'],
    ['Recolección','Llegan al espacio'], ['Escaneo','Fotogrametría, 3D, 360'],
    ['Biblioteca digital','Cada objeto guarda su historia'], ['Happening','Grupos de 10 a 15'],
    ['Repetición','Semanas de sesiones'], ['Votación pública','Abierta, online'],
    ['Construcción','Objetos reales, soldaduras reales'], ['Inauguración','Permanente o temporal']
  ];
  const out = [ text('Diez etapas, un ciclo', { x: M, y: 96, w: 700, size: 28, font: F.display, bold: true, color: g.fg }) ];
  const y0 = 158, rh = 42;
  etapas.forEach(([nom, det], i) => {
    const y = y0 + i * rh;
    out.push(rect({ x: M, y, w: W, h: 1, fill: g.hair }));
    out.push(text(String(i + 1).padStart(2,'0'), { x: M, y: y + 14, w: 40, size: 10.5, font: F.mono, color: at, spacing: 0.16 }));
    out.push(text(nom, { x: M + 52 + i * 10, y: y + 10, w: 340, size: 19, font: F.display, bold: true, color: g.fg }));
    out.push(text(det, { x: M + 640, y: y + 14, w: W - 640, size: 12, font: F.body, color: g.dim, align: 'r' }));
  });
  out.push(rect({ x: M, y: y0 + 10 * rh, w: W, h: 1, fill: g.hair }));
  return out;
}},

// 10 · DENTRO DEL HAPPENING
{ n:10, acto:4, ground:'violet', acento:'yellow', build(g, at) {
  const cifras = [['10–15','personas por grupo'], ['1:1','escala real, sin redimensionar'],
                  ['0','controles — solo manos'], ['20–30','objetos en la biblioteca']];
  const cw = (W - 3 * 24) / 4;
  const out = [ text('Dentro del happening', { x: M, y: 120, w: 900, size: 46, font: F.display, bold: true, color: g.fg }) ];
  cifras.forEach(([num, lab], i) => {
    const x = M + i * (cw + 24);
    out.push(text(num, { x, y: 232, w: cw, size: 54, font: F.bubble, color: C.yellow, lineHeight: 1 }));
    out.push(text(lab.toUpperCase(), { x, y: 306, w: cw, size: 10.5, font: F.mono, color: g.dim, spacing: 0.16, lineHeight: 1.3 }));
  });
  out.push(rect({ x: M, y: 396, w: W, h: 130, fill: C.yellow, prst: 'roundRect', adj: 14000 }));
  out.push(text('Una heladera no la movés solo. A escala real, colaborar deja de ser una idea y se vuelve físico.',
    { x: M + 34, y: 428, w: W - 68, size: 30, font: F.display, bold: true, color: C.ink, lineHeight: 1.15 }));
  return out;
}},

// 11 · EL CINTURÓN
{ n:11, acto:4, ground:'violet', acento:'yellow', build(g) {
  const chips = [['Cinta','provisorio'], ['Soldadora','definitivo'], ['Relleno','espacios vacíos'],
                 ['Aerosol','paleta de ciudad'], ['Firma','el grupo firma']];
  const out = [
    text('El cinturón', { x: M, y: 120, w: 800, size: 46, font: F.display, bold: true, color: g.fg }),
    text('Herramientas lúdicas, casi absurdas. Probás rápido con cinta, te comprometés con la soldadora.',
      { x: M, y: 200, w: 760, size: 17, font: F.body, color: g.fg, lineHeight: 1.4 })
  ];
  let x = M;
  chips.forEach(([nom, sub]) => {
    const w = Math.max(150, nom.length * 13 + 60);
    out.push(rect({ x, y: 300, w, h: 78, fill: null, line: g.fg, lineW: 1.5, prst: 'roundRect', adj: 50000 }));
    out.push(text(nom, { x: x + 22, y: 316, w: w - 44, size: 21, font: F.display, bold: true, color: g.fg }));
    out.push(text(sub.toUpperCase(), { x: x + 22, y: 348, w: w - 44, size: 9, font: F.mono, color: g.dim, spacing: 0.14 }));
    x += w + 14;
  });
  out.push(rect({ x: M, y: 424, w: W, h: 130, fill: null, line: g.hair, lineW: 1.5, prst: 'roundRect', adj: 9000 }));
  out.push(text('[ img — el cinturón visto desde dentro del casco ]',
    { x: M, y: 480, w: W, size: 11, font: F.mono, color: g.dim, align: 'ctr', spacing: 0.16 }));
  return out;
}},

// 12 · TREINTA RESULTADOS
{ n:12, acto:4, ground:'violet', acento:'yellow', build(g) {
  const out = [
    text('Los mismos objetos. Treinta resultados.',
      { x: M, y: 110, w: 1000, size: 44, font: F.display, bold: true, color: g.fg, lineHeight: 1.04 }),
    text('Misma biblioteca, mismos límites físicos. No hay dos esculturas iguales.',
      { x: M, y: 196, w: 760, size: 17, font: F.body, color: g.fg, lineHeight: 1.4 })
  ];
  // 30 celdas: la ganadora resaltada
  const cols = 10, cw = 62, ch = 62, gap = 8;
  for (let i = 0; i < 30; i++) {
    const cx = M + (i % cols) * (cw + gap);
    const cy = 268 + Math.floor(i / cols) * (ch + gap);
    const ganadora = i === 16;
    out.push(rect({ x: cx, y: cy, w: cw, h: ch, fill: ganadora ? C.yellow : null,
      line: ganadora ? null : g.hair, lineW: 1, prst: 'roundRect', adj: 14000 }));
    out.push(text(String(i + 1).padStart(2,'0'),
      { x: cx + 7, y: cy + 6, w: cw - 14, size: 8.5, font: F.mono, color: ganadora ? C.ink : g.dim, spacing: 0.08 }));
  }
  out.push(...nota('CADA CELDA ES UNA ESCULTURA DISTINTA HECHA CON LAS MISMAS PIEZAS', 500, g, 'yellow'));
  return out;
}},

// 13 · VOTACIÓN
{ n:13, acto:4, ground:'violet', acento:'yellow', build(g) {
  const barras = [['S-17', 0.94], ['S-04', 0.71], ['S-23', 0.58], ['S-11', 0.40]];
  const out = [
    text('La comunidad decide qué existe.',
      { x: M, y: 150, w: 620, size: 44, font: F.display, bold: true, color: g.fg, lineHeight: 1.05 }),
    text('Voto popular, más una revisión técnica de que la pieza se pueda parar.',
      { x: M, y: 300, w: 560, size: 17, font: F.body, color: g.fg, lineHeight: 1.4 })
  ];
  const bx = M + 660, bw = W - 660;
  barras.forEach(([lab, v], i) => {
    const y = 210 + i * 52;
    out.push(text(lab, { x: bx, y: y + 5, w: 70, size: 10.5, font: F.mono, color: g.dim, spacing: 0.16 }));
    out.push(rect({ x: bx + 80, y, w: (bw - 80) * v, h: 22, fill: C.yellow, prst: 'roundRect', adj: 50000 }));
  });
  out.push(...nota('DATOS DE EJEMPLO — PLATAFORMA DE VOTACIÓN A DEFINIR', 470, g, 'yellow'));
  return out;
}},

// 14 · CONSTRUCCIÓN
{ n:14, acto:4, ground:'violet', acento:'yellow', build(g) { return [
  text('La tecnología desaparece.', { x: M, y: 230, w: 1000, size: 58, font: F.display, bold: true, color: g.dim, lineHeight: 1.05 }),
  text('Lo único que permanece es la obra.', { x: M, y: 320, w: 1000, size: 58, font: F.display, bold: true, color: g.fg, lineHeight: 1.05 }),
  text('EL MODELO VIRTUAL FUNCIONA COMO PLANO DE CONSTRUCCIÓN.',
    { x: M, y: 452, w: W, size: 11, font: F.mono, color: g.dim, spacing: 0.18 })
];}},

// 15 · CIUDADES
{ n:15, acto:5, ground:'bone', acento:'orange', build(g) {
  const ciudades = [['Montreal', SOBRE_HUESO.pink], ['Barcelona', SOBRE_HUESO.lime],
                    ['París', SOBRE_HUESO.orange], ['Taiwán', SOBRE_HUESO.cyan], ['Tokio', SOBRE_HUESO.violet]];
  const out = [
    text('Cada ciudad muta distinto.', { x: M, y: 92, w: 900, size: 44, font: F.display, bold: true, color: g.fg }),
    text('La cultura, los colores y el lenguaje construyen la forma y el mensaje.',
      { x: M, y: 158, w: 760, size: 16, font: F.body, color: g.fg, lineHeight: 1.4 })
  ];
  const y0 = 232, rh = 62;
  ciudades.forEach(([nom, col], i) => {
    const y = y0 + i * rh;
    out.push(rect({ x: M, y, w: W, h: 1, fill: g.hair }));
    out.push(rect({ x: M + 2, y: y + 20, w: 22, h: 22, fill: col, prst: 'roundRect', adj: 22000 }));
    out.push(text(nom, { x: M + 44, y: y + 14, w: 500, size: 34, font: F.display, bold: true, color: g.fg }));
    out.push(text('MENTOR LOCAL + PALETA', { x: M, y: y + 24, w: W, size: 10, font: F.mono, color: g.dim, align: 'r', spacing: 0.16 }));
  });
  out.push(rect({ x: M, y: y0 + 5 * rh, w: W, h: 1, fill: g.hair }));
  out.push(...nota('A DEFINIR — CIUDADES SEDE, VENUES Y PARTNERS', y0 + 5 * rh + 22, g, 'orange'));
  return out;
}},

// 16 · ESCALABILIDAD
{ n:16, acto:5, ground:'bone', acento:'orange', build(g, at) {
  const escala = ['Barrio','Municipio','Ciudad','Provincia','País','Bienal'];
  const usos = [['Museos','Ligado a una muestra'], ['Bienales','Permanente o temporal'],
                ['Festivales','Abierta al público'], ['Espacio público','La obra queda'],
                ['Educación','Arte, diseño, tecnología'], ['Artistas invitados','Un universo visual']];
  const out = [ text('Un método. Cualquier escala.', { x: M, y: 92, w: 900, size: 44, font: F.display, bold: true, color: g.fg }) ];
  let x = M;
  escala.forEach((e, i) => {
    const size = 17 + i * 5;
    out.push(text(e, { x, y: 190 - size * 0.2, w: 240, size, font: F.display, bold: true, color: g.fg }));
    x += e.length * size * 0.56 + 16;
    if (i < escala.length - 1) { out.push(text('→', { x, y: 194, w: 30, size: 13, font: F.mono, color: g.dim })); x += 30; }
  });
  const cw = (W - 2 * 16) / 3, ch = 104;
  usos.forEach(([t, d], i) => {
    const ux = M + (i % 3) * (cw + 16), uy = 290 + Math.floor(i / 3) * (ch + 16);
    out.push(rect({ x: ux, y: uy, w: cw, h: ch, fill: null, line: g.hair, lineW: 1, prst: 'roundRect', adj: 7000 }));
    out.push(text(t, { x: ux + 20, y: uy + 22, w: cw - 40, size: 19, font: F.display, bold: true, color: g.fg }));
    out.push(text(d, { x: ux + 20, y: uy + 56, w: cw - 40, size: 13, font: F.body, color: g.dim, lineHeight: 1.3 }));
  });
  return out;
}},

// 17 · IMPACTO
{ n:17, acto:5, ground:'bone', acento:'orange', build(g, at) {
  const items = [['Economía circular','Los objetos vuelven al uso'],
                 ['Memoria colectiva','Historias privadas hechas patrimonio'],
                 ['Espacio público','Una obra que la ciudad ayudó a decidir'],
                 ['Museo activo','Producción, no solo exhibición']];
  const cw = (W - 3 * 22) / 4;
  const out = [ text('Lo que deja', { x: M, y: 130, w: 900, size: 46, font: F.display, bold: true, color: g.fg }) ];
  items.forEach(([t, d], i) => {
    const x = M + i * (cw + 22);
    out.push(rect({ x, y: 258, w: cw, h: 3, fill: C.orange }));
    out.push(text(t, { x, y: 278, w: cw, size: 24, font: F.display, bold: true, color: at, lineHeight: 1.1 }));
    out.push(text(d, { x, y: 348, w: cw, size: 14, font: F.body, color: g.dim, lineHeight: 1.35 }));
  });
  return out;
}},

// 18 · LOS CREADORES
{ n:18, acto:6, ground:'ink', acento:'yellow', build(g, at) {
  const gente = [
    { rol: 'DIRECCIÓN · DIRECCIÓN DE ARTE', nom: 'Gervasio Canda',
      bio: 'Nacido en Buenos Aires, radicado en Montreal. Formado como arquitecto. Director de arte y socio de Ojo Raro, y concept artist senior en Epic Games.',
      obra: 'Luz Diabla · Carne de Dios · Ojo Raro · Epic Games',
      extra: 'Codirector de Luz Diabla — mejor corto animado en Sitges y Guadalajara, clasificado al Oscar.',
      links: 'artstation.com/candagervasio · imdb.com/name/nm10640236 · ojoraro.com.ar' },
    { rol: 'DIRECCIÓN · ARTISTA VISUAL · MÚSICO', nom: 'Federico Carlini',
      bio: 'Dirección, dirección de arte y desarrollo visual en 3dar, Buenos Aires. Trabaja entre animación, medios inmersivos y música.',
      obra: 'Paper Birds · Uncanny Valley · Lil Dicky: Earth · 3dar',
      extra: 'Codirector de Paper Birds, película VR interactiva de 30 minutos para Quest con Edward Norton y Joss Stone.',
      links: 'federicocarlini.com · imdb.com/name/nm10623762 · instagram.com/federico__carlini' }
  ];
  const cw = (W - 48) / 2;
  const out = [ text('Quiénes están detrás de MUTAR', { x: M, y: 92, w: 1000, size: 40, font: F.display, bold: true, color: g.fg }) ];
  gente.forEach((p, i) => {
    const x = M + i * (cw + 48);
    out.push(rect({ x, y: 180, w: cw, h: 3, fill: C.yellow }));
    out.push(text(p.rol, { x, y: 196, w: cw, size: 10, font: F.mono, color: at, spacing: 0.16 }));
    out.push(text(p.nom, { x, y: 220, w: cw, size: 30, font: F.display, bold: true, color: g.fg }));
    out.push(text(p.bio, { x, y: 268, w: cw, size: 13, font: F.body, color: g.dim, lineHeight: 1.4 }));
    out.push(text(p.obra.toUpperCase(), { x, y: 360, w: cw, size: 9.5, font: F.mono, color: g.fg, spacing: 0.12, lineHeight: 1.4 }));
    out.push(text(p.extra, { x, y: 396, w: cw, size: 13, font: F.body, color: g.dim, lineHeight: 1.4 }));
    out.push(text(p.links, { x, y: 470, w: cw, size: 10, font: F.mono, color: at, spacing: 0.08, lineHeight: 1.5 }));
  });
  out.push(...nota('A SUMAR — RETRATOS, Y EL EQUIPO DE PRODUCCIÓN', 560, g, 'yellow'));
  return out;
}},

// 19 · CIERRE
{ n:19, acto:7, ground:'ink', acento:'pink', build(g) { return [
  text('MUTAR no se trata de reciclar objetos.',
    { x: M, y: 190, w: W, size: 46, font: F.display, bold: true, color: g.fg, align: 'ctr', lineHeight: 1.1 }),
  text('Se trata de reciclar nuestra relación con ellos.',
    { x: M, y: 270, w: W, size: 46, font: F.display, bold: true, color: g.fg, align: 'ctr', lineHeight: 1.1 }),
  text('Soltar, no como pérdida, sino como acto creativo colectivo.',
    { x: M, y: 390, w: W, size: 46, font: F.display, bold: true, color: C.pink, align: 'ctr', lineHeight: 1.1 })
];}},

// 20 · CONTACTO
{ n:20, acto:7, ground:'ink', acento:'pink', build(g, at, rid) {
  const pares = [['FORMATO','Happening en realidad mixta + escultura pública'],
                 ['ETAPA','Tratamiento — buscando instituciones sede'],
                 ['POR','Gervasio Canda · Federico Carlini'],
                 ['CONTACTO','[ a completar ]']];
  const cw = (W - 3 * 24) / 4;
  const out = [ pic(rid.hueso, { x: M, y: 150, w: 340, h: 80 }) ];
  pares.forEach(([k, v], i) => {
    const x = M + i * (cw + 24);
    out.push(text(k, { x, y: 320, w: cw, size: 10, font: F.mono, color: g.dim, spacing: 0.18 }));
    out.push(text(v, { x, y: 344, w: cw, size: 17, font: F.display, bold: true, color: g.fg, lineHeight: 1.25 }));
  });
  out.push(...nota('A SUMAR — PRESUPUESTO, CRONOGRAMA Y REQUERIMIENTOS TÉCNICOS', 470, g, 'pink'));
  return out;
}}
];

// ---- Armado ----------------------------------------------------------------
function slideXml(def) {
  const g = GROUNDS[def.ground];
  const at = acentoTexto(def.ground, def.acento);
  const rid = { rosa: 'rId2', hueso: 'rId2', negro: 'rId2' };
  const formas = [ tag(def.n, ACTOS[def.acto], g, at), ...def.build(g, at, rid) ].join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="${g.bg}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
${formas}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const rel = (id, type, target) => `<Relationship Id="${id}" Type="${REL_NS}/${type}" Target="${target}"/>`;
const relsDoc = inner => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${inner}</Relationships>`;

function build() {
  const entries = [];
  const n = SLIDES.length;

  // Imagenes: rosa para la portada, hueso para contacto
  const logoRosa = fs.readFileSync(path.join(RAIZ, '_mat/Logo/output/mutar-logo-rosa.png'));
  const logoHueso = fs.readFileSync(path.join(RAIZ, '_mat/Logo/output/mutar-logo-hueso.png'));
  entries.push({ name: 'ppt/media/image1.png', data: logoRosa });
  entries.push({ name: 'ppt/media/image2.png', data: logoHueso });

  entries.push({ name: '[Content_Types].xml', data:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
${SLIDES.map((_, i) => `<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n')}
</Types>` });

  entries.push({ name: '_rels/.rels', data: relsDoc(
    rel('rId1', 'officeDocument', 'ppt/presentation.xml')) });

  entries.push({ name: 'ppt/presentation.xml', data:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${REL_NS}" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
<p:sldIdLst>${SLIDES.map((_, i) => `<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join('')}</p:sldIdLst>
<p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>` });

  entries.push({ name: 'ppt/_rels/presentation.xml.rels', data: relsDoc(
    rel('rId1', 'slideMaster', 'slideMasters/slideMaster1.xml') +
    SLIDES.map((_, i) => rel(`rId${i+2}`, 'slide', `slides/slide${i+1}.xml`)).join('') +
    rel(`rId${n+2}`, 'theme', 'theme/theme1.xml'))});

  // Master y layout minimos
  const masterShapes = `<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree>`;
  entries.push({ name: 'ppt/slideMasters/slideMaster1.xml', data:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${REL_NS}" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="F2EFE9"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>${masterShapes}</p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>` });
  entries.push({ name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: relsDoc(
    rel('rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml') +
    rel('rId2', 'theme', '../theme/theme1.xml')) });

  entries.push({ name: 'ppt/slideLayouts/slideLayout1.xml', data:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${REL_NS}" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
<p:cSld name="En blanco">${masterShapes}</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>` });
  entries.push({ name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: relsDoc(
    rel('rId1', 'slideMaster', '../slideMasters/slideMaster1.xml')) });

  entries.push({ name: 'ppt/theme/theme1.xml', data: theme() });

  // Slides
  SLIDES.forEach((def, i) => {
    entries.push({ name: `ppt/slides/slide${i+1}.xml`, data: slideXml(def) });
    const img = def.n === 1 ? '../media/image1.png' : def.n === 20 ? '../media/image2.png' : null;
    entries.push({ name: `ppt/slides/_rels/slide${i+1}.xml.rels`, data: relsDoc(
      rel('rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml') +
      (img ? rel('rId2', 'image', img) : '')) });
  });

  fs.mkdirSync(SALIDA, { recursive: true });
  const destino = path.join(SALIDA, 'MUTAR-deck-es.pptx');
  fs.writeFileSync(destino, zip(entries));
  return { destino, slides: n, bytes: fs.statSync(destino).size };
}

function theme() {
  const c = (n, v) => `<a:${n}><a:srgbClr val="${v}"/></a:${n}>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="MUTAR">
<a:themeElements>
<a:clrScheme name="MUTAR">${c('dk1', C.ink)}${c('lt1', C.bone)}${c('dk2', C.ink)}${c('lt2', C.bone)}${c('accent1', C.pink)}${c('accent2', C.lime)}${c('accent3', C.yellow)}${c('accent4', C.cyan)}${c('accent5', C.violet)}${c('accent6', C.orange)}${c('hlink', C.pink)}${c('folHlink', C.violet)}</a:clrScheme>
<a:fontScheme name="MUTAR"><a:majorFont><a:latin typeface="Fredoka"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Bricolage Grotesque"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
<a:fmtScheme name="MUTAR">
<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
</a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;
}

const r = build();
console.log('OK  ' + r.destino + '  ·  ' + r.slides + ' slides  ·  ' + Math.round(r.bytes / 1024) + ' KB');

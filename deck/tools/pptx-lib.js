/* ==========================================================================
   Escritor minimo de .pptx — sin dependencias.

   Un .pptx es un ZIP con XML adentro. Aca hay dos cosas:
   1. un escritor de ZIP con metodo STORE (sin comprimir). Es valido y lo
      aceptan tanto PowerPoint como Google Slides, y evita traer zlib.
   2. helpers para armar formas de PresentationML.

   Todo se disena en una grilla de 1280x720 px y se convierte a EMU. A 96dpi
   la equivalencia es exacta: 1 px = 9525 EMU, y la diapositiva 16:9 mide
   12192000 x 6858000 EMU.
   ========================================================================== */
'use strict';

// ---- ZIP -------------------------------------------------------------------
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function zip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;

  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const data = Buffer.isBuffer(e.data) ? e.data : Buffer.from(e.data, 'utf8');
    const sum = crc32(data);

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);          // version needed
    lh.writeUInt16LE(0, 6);           // flags
    lh.writeUInt16LE(0, 8);           // method 0 = store
    lh.writeUInt16LE(0, 10);          // time
    lh.writeUInt16LE(0x21, 12);       // date
    lh.writeUInt32LE(sum, 14);
    lh.writeUInt32LE(data.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    locals.push(lh, name, data);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0x21, 14);
    ch.writeUInt32LE(sum, 16);
    ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(0, 38);          // external attrs
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);

    offset += lh.length + name.length + data.length;
  }

  const cd = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, cd, eocd]);
}

// ---- Unidades --------------------------------------------------------------
const PX = 9525;                       // 1 px de la grilla = 9525 EMU
const emu = px => Math.round(px * PX);
const pt  = px => Math.round(px * 75);  // px -> centesimas de punto (96dpi)

const SLIDE_W = 1280;
const SLIDE_H = 720;

// ---- XML -------------------------------------------------------------------
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

let uid = 100;
const nextId = () => ++uid;

/* Caja de texto.
   opts: x,y,w  (px)  ·  size (px de cuerpo)  ·  font  ·  color (hex sin #)
         bold, italic, align, lineHeight, letterSpacing (em), anchor
   El texto puede ser un string o un array de lineas.                       */
function text(str, opts = {}) {
  const {
    x = 0, y = 0, w = 400, h = null,
    size = 16, font = 'Fredoka', color = '0D0C0B',
    bold = false, italic = false, align = 'l',
    lineHeight = 1.15, spacing = 0, anchor = 't'
  } = opts;

  const lines = Array.isArray(str) ? str : [str];
  const paras = lines.map(line => {
    const runs = (Array.isArray(line) ? line : [{ t: line }]).map(seg => {
      const c = seg.color || color;
      const f = seg.font || font;
      const b = seg.bold !== undefined ? seg.bold : bold;
      const sz = seg.size ? pt(seg.size) : pt(size);
      return `<a:r><a:rPr lang="es-AR" sz="${sz}" b="${b ? 1 : 0}" i="${italic ? 1 : 0}"`
        + (spacing ? ` spc="${Math.round(spacing * size * 75)}"` : '')
        + ` dirty="0"><a:solidFill><a:srgbClr val="${c}"/></a:solidFill>`
        + `<a:latin typeface="${esc(f)}"/><a:cs typeface="${esc(f)}"/></a:rPr>`
        + `<a:t>${esc(seg.t)}</a:t></a:r>`;
    }).join('');
    return `<a:p><a:pPr algn="${align}"><a:lnSpc><a:spcPct val="${Math.round(lineHeight * 100000)}"/></a:lnSpc></a:pPr>${runs}</a:p>`;
  }).join('');

  const height = h !== null ? h : Math.max(size * lineHeight * lines.length, size * 1.4);

  return `<p:sp><p:nvSpPr><p:cNvPr id="${nextId()}" name="t${uid}"/>`
    + `<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>`
    + `<p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/>`
    + `<a:ext cx="${emu(w)}" cy="${emu(height)}"/></a:xfrm>`
    + `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>`
    + `<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="${anchor}"/>`
    + `<a:lstStyle/>${paras}</p:txBody></p:sp>`;
}

/* Rectangulo (relleno y/o borde). prst: rect | roundRect */
function rect(opts = {}) {
  const {
    x = 0, y = 0, w = 100, h = 100,
    fill = null, line = null, lineW = 1, prst = 'rect', adj = null
  } = opts;
  const geom = adj !== null
    ? `<a:prstGeom prst="${prst}"><a:avLst><a:gd name="adj" fmla="val ${adj}"/></a:avLst></a:prstGeom>`
    : `<a:prstGeom prst="${prst}"><a:avLst/></a:prstGeom>`;
  return `<p:sp><p:nvSpPr><p:cNvPr id="${nextId()}" name="r${uid}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>`
    + `<p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm>`
    + geom
    + (fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>` : '<a:noFill/>')
    + (line ? `<a:ln w="${Math.round(lineW * 12700)}"><a:solidFill><a:srgbClr val="${line}"/></a:solidFill></a:ln>`
            : '<a:ln><a:noFill/></a:ln>')
    + `</p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>`;
}

/* Imagen ya declarada en los rels del slide */
function pic(rId, opts = {}) {
  const { x = 0, y = 0, w = 100, h = 100 } = opts;
  return `<p:pic><p:nvPicPr><p:cNvPr id="${nextId()}" name="p${uid}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>`
    + `<p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>`
    + `<p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm>`
    + `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
}

module.exports = { zip, emu, pt, esc, text, rect, pic, SLIDE_W, SLIDE_H, nextId };

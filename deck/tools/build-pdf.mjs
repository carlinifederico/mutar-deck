/* Genera el PDF del deck: deck/export/MUTAR-deck-{en,es}.pdf

   Una pagina de 1280x720 por frame, desde el modo export (?print=full), con
   el interludio incluido. Levanta su propio server estatico sobre el repo, asi
   que alcanza con:

     cd deck/tools && npm i && node build-pdf.mjs            (en y es)
     node build-pdf.mjs es                                   (uno solo)

   Tres cosas que no son obvias:
   · page.pdf con width/height explicitos. Con preferCSSPageSize Chrome evalua
     los media queries contra el papel Letter (~816px) aunque la pagina mida
     1280, y todos los layouts de dos columnas caen al de tablet.
   · WebGL por SwiftShader: el visor 3D del 12 y del 21 se renderiza una vez y
     objects.js lo congela como <img> (modo still, solo en export).
   · Capas aplanadas (flatten): filtros CSS, velos con color-mix, gradientes
     SVG con transparencia, mask-image y text-shadow con blur salen bien en
     Chrome/Acrobat/Preview pero no en pdf.js (Firefox, muchos visores web).
     Esas capas se reemplazan por una captura 2x de como se ven en pantalla;
     el texto sigue vectorial, y en las paginas aplanadas enteras queda debajo
     transparente, para que se pueda buscar y seleccionar.                  */
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.env.MUTAR_REPO ? path.resolve(process.env.MUTAR_REPO) : path.resolve(HERE, '..', '..');
const outDir = path.join(REPO, 'deck', 'export');
const langs = (process.argv[2] || 'en,es').split(',');

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let p = path.join(REPO, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith(path.sep)) p = path.join(p, 'index.html');
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});
await new Promise(r => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/deck/`;

// Capas de fondo que no todos los visores de PDF resuelven (filtros CSS,
// velos con color-mix, gradientes SVG con transparencia, text-shadow con
// blur): se reemplazan por una captura a 2x de como se ven en pantalla. El
// texto de encima no se toca y queda vectorial.
const FLAT = [
  '.frame--capture:not(.frame--divider):not(.frame--build) > .capture', // fondos de video/still con velo
  'svg.plan', 'svg.pass',                  // planta del 15, concepto del 14
  '.capture--fig',                         // capturas dentro de figura
];
// Paginas que son un titular sobre imagen (y el titular lleva sombra): la
// pagina entera va como imagen, y el texto real queda debajo, transparente,
// para que se pueda seguir buscando y seleccionando.
const WHOLE = ['.frame--divider', '.interlude', '.frame--build'];
// Piezas chicas que se capturan tal como se ven, con su fondo, y se
// reemplazan en el lugar: el logo (se pinta con mask-image) y el halo del
// visor del 21 (radial-gradient con color-mix).
const SNAP = ['.frame .logo', '.visor.is-3d .visor__stage'];

async function flatten(page) {
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  const n = await page.evaluate((flat, whole, snap) => {
    let k = 0;
    const vis = el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width;
    document.querySelectorAll(whole.join(',')).forEach(el => { if (vis(el)) el.setAttribute('data-flat-whole', ++k); });
    document.querySelectorAll(flat.join(',')).forEach(el => { if (vis(el)) el.setAttribute('data-flat', ++k); });
    document.querySelectorAll(snap.join(',')).forEach(el => { if (vis(el)) el.setAttribute('data-flat-snap', ++k); });
    return k;
  }, FLAT, WHOLE, SNAP);

  for (let i = 1; i <= n; i++) {
    const el = await page.$(`[data-flat="${i}"], [data-flat-whole="${i}"], [data-flat-snap="${i}"]`);
    if (!el) continue;
    const whole = await el.evaluate(e => e.hasAttribute('data-flat-whole'));
    if (whole) {
      await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
      const shot = await el.screenshot({ type: 'jpeg', quality: 88 });
      await el.evaluate((f, b64) => {
        const img = document.createElement('img');
        img.src = `data:image/jpeg;base64,${b64}`;
        img.alt = '';
        Object.assign(img.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none', maxWidth: 'none' });
        f.querySelectorAll('*').forEach(c => { c.style.color = 'transparent'; c.style.textShadow = 'none'; });
        f.querySelectorAll('img, video, canvas, .capture, .reel__veil').forEach(c => { c.style.visibility = 'hidden'; });
        f.style.backgroundImage = 'none';
        if (getComputedStyle(f).position === 'static') f.style.position = 'relative';
        f.appendChild(img);
      }, shot.toString('base64'));
      continue;
    }
    if (await el.evaluate(e => e.hasAttribute('data-flat-snap'))) {
      await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
      const shot = await el.screenshot({ type: 'png' });
      await el.evaluate((e, b64) => {
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${b64}`;
        img.alt = e.getAttribute('aria-label') || '';
        Object.assign(img.style, { display: 'block', width: r.width + 'px', height: r.height + 'px', maxWidth: 'none',
          marginLeft: cs.marginLeft, marginRight: cs.marginRight, borderRadius: cs.borderRadius });
        e.replaceWith(img);
      }, shot.toString('base64'));
      continue;
    }
    // aislar: todo el frame invisible menos el elemento (y lo que tenga adentro)
    await el.evaluate(e => {
      const f = e.closest('.frame, .interlude');
      f.dataset.vis = f.style.visibility;
      f.style.visibility = 'hidden';
      e.style.visibility = 'visible';
      e.scrollIntoView({ block: 'center' });
    });
    const shot = await el.screenshot({ type: 'jpeg', quality: 88 });
    await el.evaluate((e, b64) => {
      const f = e.closest('.frame, .interlude');
      f.style.visibility = f.dataset.vis || '';
      const img = document.createElement('img');
      img.src = `data:image/jpeg;base64,${b64}`;
      img.alt = '';
      const cs = getComputedStyle(e), r = e.getBoundingClientRect(), pr = e.offsetParent ? e.offsetParent.getBoundingClientRect() : r;
      if (cs.position === 'absolute' || cs.position === 'fixed') {
        Object.assign(img.style, { position: 'absolute', left: (r.left - pr.left) + 'px', top: (r.top - pr.top) + 'px',
          width: r.width + 'px', height: r.height + 'px', zIndex: cs.zIndex === 'auto' ? 0 : cs.zIndex, maxWidth: 'none' });
      } else {
        Object.assign(img.style, { display: 'block', width: r.width + 'px', height: r.height + 'px', maxWidth: 'none' });
      }
      e.replaceWith(img);
    }, shot.toString('base64'));
  }
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  return n;
}

const browser = await puppeteer.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

for (const lang of langs) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(`${BASE}?print=full&lang=${lang}`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.visors === 'ready', { timeout: 60000 });
  // todas las imagenes (posters de captura, renders) decodificadas antes de imprimir
  // las lazy no cargan fuera del viewport: se pasan a eager y se espera con tope
  const missing = await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    const wait = Promise.all([...document.images].map(img => (img.complete && img.naturalWidth) ? null :
      new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r); })));
    await Promise.race([wait, new Promise(r => setTimeout(r, 20000))]);
    return [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')).slice(0, 10);
  });
  if (missing.length) console.log('sin cargar:', missing);
  await new Promise(r => setTimeout(r, 1500));
  await flatten(page);
  const pages = await page.evaluate(() =>
    [...document.querySelectorAll('.frame, .interlude')].filter(f => getComputedStyle(f).display !== 'none').length);
  const file = path.join(outDir, `MUTAR-deck-${lang}.pdf`);
  // tamaño explicito: con preferCSSPageSize Chrome evalua los media queries
  // contra el papel Letter (~816px) y el layout cae al de tablet
  await page.pdf({ path: file, width: '1280px', height: '720px', printBackground: true });
  console.log(path.relative(REPO, file), pages, 'frames', (fs.statSync(file).size / 1048576).toFixed(1) + ' MB');
  await page.close();
}
await browser.close();
server.close();

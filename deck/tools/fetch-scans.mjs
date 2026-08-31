/* Baja el material crudo del carrete desde Poly Haven (CC0, sin cuenta).
   Destino: _mat/scans/raw/<id>/  -- untracked, como todo el material crudo.
   El paso siguiente es build-scans.mjs, que es el que escribe en deck/models/. */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// MUTAR_REPO / MUTAR_RAW permiten correr el pipeline con la toolchain en disco
// local. Google Drive no aguanta un node_modules (miles de archivos chicos).
const REPO = process.env.MUTAR_REPO ? path.resolve(process.env.MUTAR_REPO) : path.resolve(HERE, '..', '..');
const RAW = process.env.MUTAR_RAW ? path.resolve(process.env.MUTAR_RAW) : path.join(REPO, '_mat', 'scans', 'raw');
const API = 'https://api.polyhaven.com';

const manifest = JSON.parse(await fs.readFile(path.join(REPO, 'deck', 'tools', 'scans.json'), 'utf8'));
const RES = manifest.res || '1k';

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`);
  return r.json();
}

async function download(url, dest) {
  // Idempotente: si ya esta, no lo vuelve a bajar. Bajar 20 modelos es lento.
  try {
    const st = await fs.stat(dest);
    if (st.size > 0) return { skipped: true, size: st.size };
  } catch { /* no existe, seguimos */ }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return { skipped: false, size: buf.length };
}

const bytes = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
let total = 0;
const failed = [];

for (const obj of manifest.objects) {
  const id = obj.id;
  process.stdout.write(`  ${id} … `);
  try {
    const files = await getJSON(`${API}/files/${id}`);
    const entry = files?.gltf?.[RES]?.gltf;
    if (!entry) throw new Error(`sin gltf ${RES}`);

    const dir = path.join(RAW, id);
    let got = 0;

    // El .gltf principal, con el nombre que espera su propio 'include'
    const main = path.join(dir, path.basename(new URL(entry.url).pathname));
    got += (await download(entry.url, main)).size;

    // Los includes vienen con la ruta relativa que el gltf ya referencia
    // (ej. "textures/foo_diff_1k.jpg"), asi que se respetan tal cual.
    for (const [rel, f] of Object.entries(entry.include || {})) {
      got += (await download(f.url, path.join(dir, rel))).size;
    }

    total += got;
    console.log(`ok  ${bytes(got)}`);
  } catch (err) {
    console.log(`FALLO — ${err.message}`);
    failed.push({ id, reason: err.message });
  }
}

console.log(`\ncrudo total: ${bytes(total)} en ${RAW}`);
if (failed.length) {
  console.log('\nno se pudieron bajar:');
  failed.forEach((f) => console.log(`  ${f.id} — ${f.reason}`));
  process.exitCode = 1;
}

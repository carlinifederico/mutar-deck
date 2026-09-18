/* Comprime los objetos reales del prototipo (Tripo3D, los mismos que entran
   a Gravity Sketch) para la web: deck/models/real/*.glb + manifest.json

   Entrada:  prototype/pieces/_gameready/glb/MAT_*.glb
   Mismo criterio que build-scans.mjs (unlit, solo base color, quantize),
   pero con un simplify mucho mas suave: estos no son el monton del
   carrete, son las piezas que se miran de cerca y se giran a mano.

   Correr como los otros, desde la toolchain en disco local:
     MUTAR_REPO="$REPO" node build-real.mjs                               */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsUnlit } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, quantize, flatten, join } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.env.MUTAR_REPO ? path.resolve(process.env.MUTAR_REPO) : path.resolve(HERE, '..', '..');
const SRC = path.join(REPO, 'prototype', 'pieces', '_gameready', 'glb');
const OUT = path.join(REPO, 'deck', 'models', 'real');

const TARGET_TRIS = 14000;
const TEX_SIZE = 1024;

// El orden es el de la estanteria del frame 12. El nombre es el que se lee.
const OBJETOS = [
  { src: 'MAT_EL_02_gramophone.glb',   id: 'gramofono',  en: 'Gramophone',   es: 'Gramófono' },
  { src: 'MAT_EL_05_sofa.glb',         id: 'sofa',       en: 'Sofa',         es: 'Sofá' },
  { src: 'MAT_EL_06_double_bass.glb',  id: 'contrabajo', en: 'Double bass',  es: 'Contrabajo' },
  { src: 'MAT_EL_01_boiler.glb',       id: 'caldera',    en: 'Boiler',       es: 'Caldera' },
  { src: 'MAT_EL_04_clock_radio.glb',  id: 'radio',      en: 'Clock radio',  es: 'Radio reloj' },
  { src: 'MAT_EL_03_plastic_chair.glb',id: 'silla',      en: 'Plastic chair',es: 'Silla de plástico' },
  { src: 'MAT_EL_07_airplane.glb',     id: 'avion',      en: 'Toy airplane', es: 'Avión' },
  { src: 'MAT_BS_01_sculpt.glb',       id: 'escultura',  en: 'Sculpture',    es: 'Escultura', base: true },
];

await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await fs.mkdir(OUT, { recursive: true });

const countTris = (doc) => doc.getRoot().listMeshes().reduce((n, m) =>
  n + m.listPrimitives().reduce((k, p) => k + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);

const entries = [];
for (const o of OBJETOS) {
  const doc = await io.read(path.join(SRC, o.src));
  const before = Math.round(countTris(doc));
  for (const mat of doc.getRoot().listMaterials()) {
    mat.setNormalTexture(null); mat.setOcclusionTexture(null);
    mat.setMetallicRoughnessTexture(null); mat.setEmissiveTexture(null);
    mat.setEmissiveFactor([0, 0, 0]);
  }
  const unlit = doc.createExtension(KHRMaterialsUnlit).setRequired(false);
  for (const mat of doc.getRoot().listMaterials()) mat.setExtension('KHR_materials_unlit', unlit.createUnlit());

  const ratio = Math.min(1, TARGET_TRIS / Math.max(before, 1));
  await doc.transform(
    flatten(), dedup(), join(), weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.004, lockBorder: true }),
    prune({ keepAttributes: false, keepLeaves: false, keepSolidTextures: true }),
    quantize()
  );
  for (const tex of doc.getRoot().listTextures()) {
    const img = tex.getImage();
    if (!img) continue;
    const webp = await sharp(Buffer.from(img)).resize(TEX_SIZE, TEX_SIZE, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    tex.setImage(new Uint8Array(webp)).setMimeType('image/webp');
  }
  const bbox = getBounds(doc.getRoot().listScenes()[0]);
  const glb = await io.writeBinary(doc);
  const file = o.id + '.glb';
  await fs.writeFile(path.join(OUT, file), glb);
  entries.push({ file, id: o.id, en: o.en, es: o.es, base: !!o.base,
    min: bbox.min.map((v) => +v.toFixed(3)), max: bbox.max.map((v) => +v.toFixed(3)) });
  console.log(`${o.id.padEnd(11)} ${(glb.byteLength / 1024).toFixed(0)} KB  ${before} -> ${Math.round(countTris(doc))} tris`);
}
await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify({ source: 'MUTAR prototype · Tripo3D', objects: entries }, null, 1) + '\n');

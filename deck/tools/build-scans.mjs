/* Convierte el crudo de Poly Haven en los .glb que carga el carrete.
   Entrada:  _mat/scans/raw/<id>/*.gltf   (lo que dejo fetch-scans.mjs)
   Salida:   deck/models/obj-NN.glb  +  deck/models/manifest.json

   Tres decisiones que valen la pena entender antes de tocar los numeros:

   1. UNLIT. Las texturas ya vienen con la luz horneada. Volver a iluminarlas
      las ensucia. Marcamos los materiales con KHR_materials_unlit, que
      GLTFLoader mapea solo a MeshBasicMaterial: cero luces en la escena.
   2. SOLO BASE COLOR. Sin luces, los mapas de normal/AO/rough/metal no
      pintan nada. Tirarlos es la mitad del ahorro de peso.
   3. SIMPLIFY AGRESIVO. No es solo peso: la decimacion es la que deja las
      facetas y las siluetas grumosas que hacen que lean como escaneos.

   No usamos meshopt ni Draco a proposito: pedirian un decoder en runtime.
   quantize alcanza y three soporta KHR_mesh_quantization de fabrica.       */

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
const RAW = process.env.MUTAR_RAW ? path.resolve(process.env.MUTAR_RAW) : path.join(REPO, '_mat', 'scans', 'raw');
const OUT = path.join(REPO, 'deck', 'models');

const TARGET_TRIS = 3500;   // techo por objeto; el ratio sale de aca
const MIN_RATIO = 0.04;     // no bajar de esto o se deshace la silueta
const TEX_SIZE = 512;

const manifest = JSON.parse(await fs.readFile(path.join(REPO, 'deck', 'tools', 'scans.json'), 'utf8'));
await MeshoptSimplifier.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await fs.mkdir(OUT, { recursive: true });

const bytes = (n) => (n / 1024).toFixed(0) + ' KB';
const entries = [];
const failed = [];
let total = 0;

function countTris(doc) {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      n += (idx ? idx.getCount() : pos ? pos.getCount() : 0) / 3;
    }
  }
  return Math.round(n);
}

for (const [i, obj] of manifest.objects.entries()) {
  const num = String(i + 1).padStart(2, '0');
  const name = `obj-${num}.glb`;
  process.stdout.write(`  ${num} ${obj.id} … `);
  try {
    const dir = path.join(RAW, obj.id);
    const files = await fs.readdir(dir);
    const gltf = files.find((f) => f.endsWith('.gltf') || f.endsWith('.glb'));
    if (!gltf) throw new Error('sin .gltf en el crudo');

    const doc = await io.read(path.join(dir, gltf));
    const before = countTris(doc);

    // Sin luces, todo mapa que no sea base color es peso muerto.
    for (const mat of doc.getRoot().listMaterials()) {
      mat.setNormalTexture(null);
      mat.setOcclusionTexture(null);
      mat.setMetallicRoughnessTexture(null);
      mat.setEmissiveTexture(null);
      mat.setEmissiveFactor([0, 0, 0]);
    }

    // KHR_materials_unlit -> MeshBasicMaterial del lado de three
    const unlit = doc.createExtension(KHRMaterialsUnlit).setRequired(false);
    for (const mat of doc.getRoot().listMaterials()) {
      mat.setExtension('KHR_materials_unlit', unlit.createUnlit());
    }

    const ratio = Math.max(MIN_RATIO, Math.min(1, TARGET_TRIS / Math.max(before, 1)));

    await doc.transform(
      flatten(),
      dedup(),
      join(),
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.02, lockBorder: false }),
      // keepSolidTextures:true evita que prune decodifique los pixeles de cada
      // textura: ese analisis explota con este build de libvips.
      prune({ keepAttributes: false, keepLeaves: false, keepSolidTextures: true }),
      quantize()
    );

    // Las texturas las pasa sharp a mano. textureCompress() de gltf-transform
    // choca con este build de libvips ("colourspace: parameter space not set"),
    // y el paso es lo bastante simple como para no depender de el.
    for (const tex of doc.getRoot().listTextures()) {
      const img = tex.getImage();
      if (!img) continue;
      const webp = await sharp(Buffer.from(img))
        .resize(TEX_SIZE, TEX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      tex.setImage(new Uint8Array(webp)).setMimeType('image/webp');
      const uri = tex.getURI();
      if (uri) tex.setURI(uri.replace(/.[a-z]+$/i, ".webp"));
    }

    const after = countTris(doc);
    const bbox = getBounds(doc.getRoot().listScenes()[0]);
    const size = [
      bbox.max[0] - bbox.min[0],
      bbox.max[1] - bbox.min[1],
      bbox.max[2] - bbox.min[2],
    ];

    const glb = await io.writeBinary(doc);
    await fs.writeFile(path.join(OUT, name), glb);
    total += glb.byteLength;

    entries.push({
      file: name,
      id: obj.id,
      label: obj.label,
      tris: after,
      // Medidas reales en metros. scan.js las usa para apoyar cada objeto en
      // el piso y para no mezclar un sillon con una camara al mismo tamano.
      size: size.map((v) => +v.toFixed(3)),
      min: bbox.min.map((v) => +v.toFixed(3)),
    });

    console.log(`ok  ${bytes(glb.byteLength)}  ${before} -> ${after} tris`);
  } catch (err) {
    console.log(`FALLO — ${err.message}`);
    failed.push({ id: obj.id, reason: err.message });
  }
}

await fs.writeFile(
  path.join(OUT, 'manifest.json'),
  JSON.stringify({ source: manifest.source, license: manifest.license, credit: manifest.credit, objects: entries }, null, 1) + '\n'
);

console.log(`\n${entries.length} objetos · ${bytes(total)} en deck/models/`);
if (failed.length) {
  console.log('\nfallaron:');
  failed.forEach((f) => console.log(`  ${f.id} — ${f.reason}`));
  process.exitCode = 1;
}

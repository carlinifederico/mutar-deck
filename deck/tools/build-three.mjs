/* Empaqueta el pedazo de three.js que usa el carrete en un unico ESM
   autocontenido: deck/js/vendor/three-bundle.js

   Va vendorizado y no por CDN a proposito. El deck no tiene dependencias en
   runtime ni build step, y el unico externo que se permite son las Google
   Fonts. Un <script> de un CDN de terceros seria el segundo, y ademas
   rompe el deck cuando no hay internet.

   Se corre a mano y el resultado se commitea. No hace falta volver a correrlo
   salvo que se suba de version de three o scan.js necesite algo nuevo.      */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.env.MUTAR_REPO ? path.resolve(process.env.MUTAR_REPO) : path.resolve(HERE, '..', '..');
const OUT = path.join(REPO, 'deck', 'js', 'vendor', 'three-bundle.js');

// Solo lo que scan.js importa. Todo lo que no este aca no entra al bundle.
const ENTRY = `
export {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, InstancedMesh,
  MeshBasicMaterial, Color, Fog, Matrix4, Quaternion, Vector3, Euler, Box3,
  SRGBColorSpace, DoubleSide, FrontSide
} from 'three';
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });

const result = await esbuild.build({
  stdin: { contents: ENTRY, resolveDir: HERE, sourcefile: 'three-entry.js' },
  bundle: true,
  format: 'esm',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
  outfile: OUT,
  banner: {
    js: '/* three.js (MIT) — bundle parcial generado por deck/tools/build-three.mjs. No editar a mano. */',
  },
  metafile: true,
});

const { size } = await fs.stat(OUT);
const { gzipSync } = await import('node:zlib');
const gz = gzipSync(await fs.readFile(OUT)).length;
console.log(`three-bundle.js  ${(size / 1024).toFixed(0)} KB  (${(gz / 1024).toFixed(0)} KB gzip)`);
void result;

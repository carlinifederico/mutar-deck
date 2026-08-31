# MUTAR — deck web v2

Propuesta alternativa al deck de la raíz (`../index.html`). Misma información,
otra dirección: el logotipo hand-drawn en rosa de marca, tipografía grande,
fondos suaves y un scroll con movimiento, más un modo de exportación a 16:9.

**Este pase es de estructura.** Cada frame tiene su título real y lo mínimo de
cuerpo; lo que falta está marcado con la píldora `.note`, no disimulado.

Abrir: `deck/index.html` directamente en el navegador (anda desde `file://`,
no necesita servidor ni build).

---

## Cómo se recorre

| Acción | |
|---|---|
| Scroll | Los frames imantan (snap *proximity*); el interludio se recorre libre |
| `↑` `↓` `PgUp` `PgDn` | Frame anterior / siguiente |
| `Home` `End` | Primer / último frame |
| `L` | Cambia idioma EN ⇄ ES |
| `P` | Abre el modo export |
| Rail derecho | Salta al primer frame de cada acto |

Query params: `?lang=es` · `?frame=8` · `?print` · `?print=full`

---

## Estructura — 27 frames en 10 actos + 1 interludio

| | Frames | Ground / acento |
|---|---|---|
| **0 · Entrada** | 01 Portada | hueso / rosa |
| **1 · La pregunta** | 02 · 03 | tinta / lima |
| | *interludio — el carrete* | |
| **2 · La idea** | 04 Tesis · 05 Concepto · 06 Qué es MUTAR | hueso / amarillo |
| **3 · El recorrido** | 07 Divisor · 08 Cinco movimientos · 09 El ciclo | tinta / cian |
| **4 · La experiencia** | 10 Happening · 11 Por qué passthrough · 12 El espacio · 13 Cómo empieza | violeta / amarillo |
| **5 · La construcción** | 14 Tres fases · 15 Herramientas · 16 La librería · 17 El finish · 18 Artista invitado | tinta / naranja |
| **6 · La comunidad** | 19 Treinta resultados · 20 Votación · 21 La obra física | hueso / violeta |
| **7 · Escala** | 22 Ciudades · 23 Escalabilidad · 24 Impacto | hueso / naranja |
| **8 · Los creadores** | 25 Canda + Carlini | tinta / amarillo |
| **9 · Cierre** | 26 Cierre · 27 Estado y próximos pasos | tinta / rosa |

Los actos 4 y 5 salieron de la reunión del 19/08: passthrough, zonas del
espacio, arranque sin tutorial, las tres fases de construcción, las
herramientas como experiencias, la librería de 20 objetos, el finish como
impronta y el rol del artista invitado.

Los frames 05, 06, 11, 13, 14, 18 y 27 usan `.beats`: la idea entra en tres
golpes cortos en vez de párrafos.

### Piezas interactivas

La reunión pidió que la web tenga "impronta tecnológica". Hay tres, en
`js/play.js`, todas apagadas con `prefers-reduced-motion` y en export:

- **Portada** — doce siluetas de objetos que entran a los márgenes y se pueden
  agarrar y tirar. Es el *"agarrar una cosita y moverla"*.
- **Frame 16 · La librería** — anillo de diez objetos que orbita solo, se frena
  al pasar el mouse y se puede girar arrastrando.
- **Frame 17 · El finish** — arrastrar sobre la escultura la pinta con la
  paleta de MUTAR. El argumento del frame hecho gesto.

Las siluetas son provisorias: reemplazarlas por los escaneos reales cuando
existan. Viven en el array `OBJETOS` de `play.js`.

### Retratos

`img/team/gervasio.jpg` y `federico.jpg`, 760×760, blanco y negro con grano,
mismo encuadre relativo de cabeza. Los originales quedaron en `_mat/Team/`
(fuera del repo). Para regenerarlos, el tratamiento es:

```
crop=…,scale=760:760,format=gray,eq=contrast=1.18:brightness=0.015,noise=alls=14:allf=u,unsharp=3:3:0.4
```

Ojo con el `url()` de la foto: va `../img/team/…` porque una custom property
se resuelve contra la hoja que la consume (`css/frames.css`), no contra el HTML.

### Huecos marcados

Cinco `.slot` de imagen (planta del espacio, mockup del cinturón, la librería,
el finish antes/después, referencia de artista invitado) y ocho `.note` con lo
que falta definir.

---

## Las tres piezas con lógica propia

**El interludio del carrete (frame 03 → 04).** Un montón de objetos escaneados
—cosas en desuso: sillones, sofás, TVs de tubo, un reloj de pie, valijas— y una
cámara que retrocede mientras scrolleás: al principio estás adentro del montón,
al final ves que no termina nunca. El zoom-out *es* el argumento de "es tanto
que parece poco".

La escena la arma `js/scan.js` con three.js. Tres cosas que conviene saber:

- **Un solo rAF.** `scan.js` no abre loop propio: `motion.js` calcula el
  progreso `rp` de la sección (el mismo 0..1 de siempre) y llama a
  `window.MUTAR.scan.tick(rp, velocity)`.
- **Nada de CDN.** three va vendorizado en `js/vendor/three-bundle.js` y entra
  por un `import()` dinámico recién cuando el interludio se acerca. Las
  primeras frames no pagan ni un byte de los ~2 MB de modelos.
- **Cae al poster.** Sin WebGL, en `file://`, con `prefers-reduced-motion` o en
  modo export, `scan.js` se saca el canvas de encima y el stage muestra
  `img/scan/poster.webp`. Abrir el deck con doble clic desde el escritorio
  entra por esta rama: es esperado, no un bug. Para ver la escena hay que
  servirlo por HTTP.

Los 20 objetos son CC0 de [Poly Haven](https://polyhaven.com/models). El
elenco vive en `tools/scans.json` y la procedencia en `CREDITS.md`. Para
cambiarlo, ver "El pipeline de los escaneos" más abajo.

**Frame 08 · los cinco movimientos.** Track horizontal con scrub: el frame
mide 300vh y adentro un stage pegajoso desplaza las tarjetas. El progreso se
parte en un tramo por step — un momento quieto y después el viaje al
siguiente — así los cinco tienen su momento y ninguno se saltea. El offset de
cada step puede ser negativo: si se lo clampea a 0, el primero queda pegado a
la izquierda y el que se ve centrado es el segundo. Cada step tiene ícono,
color propio y se apaga cuando no es el activo.

**Frame 12 · las treinta esculturas.** Cada tile es una escultura dibujada con
las **mismas cinco piezas** (barra, caja, disco, anillo, cuña) apiladas
distinto. Se generan con un PRNG sembrado por índice, así que el layout no
cambia entre cargas. La ganadora va en color de marca.

---

## Logo y color

El logotipo original (`_mat/Logo/output/logo_byn.jpg`) se vectorizó a
`img/mutar-logo.svg` — contornos trazados desde el bitmap, simplificados y
convertidos a curvas Bézier. Se pinta con `mask` y no con `<img>`: un SVG
dentro de `<img>` queda aislado y `currentColor` nunca le llega, así que el
mismo archivo sirve en rosa, en tinta o en hueso sin duplicar assets.

Aparece en tres lugares: grande en la portada (rosa de marca), como marca
chica fija arriba a la izquierda desde que empezás a scrollear, y en tinta en
el frame de contacto.

`--brand: #ff2e88` es la constante del deck: logo, rail, toggle de idioma y
las píldoras `.note` lo usan en todos los actos. Los acentos por acto siguen
dando identidad a cada sección, pero la marca es el hilo que las cose.

En `_mat/Logo/output/` quedaron además `mutar-logo.svg`,
`mutar-logo-negro.png` y `mutar-logo-rosa.png` (transparentes, 2265px).

---

## Tipografía

- **Bagel Fat One** — solo numerales y palabras sueltas gigantes (divisor,
  números de step). Es hermosa pero ilegible en frases largas.
- **Fredoka** — todo titular que sea una oración. Mismo tono redondo y cálido,
  pero se lee.
- **Bricolage Grotesque** — titulares medios y cuerpo.
- **DM Mono** — labels, numeración y metadatos.

---

## Dónde se editan los textos

En `index.html`, en los atributos de cada nodo. No hay archivo de copy aparte
ni build: el HTML **es** la fuente.

```html
<h2 class="q split"
    data-en="How many things do you keep without knowing why?"
    data-es="¿Cuántas cosas guardás sin saber por qué?"></h2>
```

- `data-en` / `data-es` → se escriben como texto (`textContent`).
- `data-en-html` / `data-es-html` → se escriben como markup.
- Un nodo nuevo sólo necesita los dos atributos; `js/i18n.js` lo toma solo.
- El idioma queda guardado en `localStorage`.

Los huecos pendientes son `.slot` (imagen) y `.note` (contenido a desarrollar).

---

## Exportar a PDF / Google Slides

1. Abrir `deck/index.html?print` (o apretar `P`).
2. Imprimir → **Guardar como PDF**, horizontal, márgenes en cero.
3. Salen 20 páginas de 1280×720 (16:9), una por frame.

En export se apagan animaciones, auras, cursor y rail; cada frame pinta su
propio ground; y la escala tipográfica pasa a medidas fijas — en pantalla los
cuerpos se calculan con `vw`, que mide la ventana y no la página.

`?print=full` conserva además el interludio aplanado.

---

## Archivos

```
index.html         20 frames + 1 interludio, con la copy EN/ES inline
css/tokens.css     paleta, marca, escala tipográfica, ritmo, curvas
css/base.css       reset, chrome, logo, motor de reveals, modo export
css/frames.css     layout por frame, responsive y overrides de export
js/i18n.js         toggle EN/ES
js/motion.js       reveals, split, progreso del carrete, track, auras, cursor
js/nav.js          frame activo, rail, teclado, deep links, modo export
js/scan.js         la escena 3D del carrete (objetos escaneados)
js/vendor/         three.js empaquetado, generado por tools/build-three.mjs
models/            los 20 .glb del carrete + manifest.json
img/mutar-logo.svg logotipo vectorizado
img/scan/          poster de fallback del carrete
```

Sin dependencias ni build **en runtime**: lo que se sirve son archivos
estáticos. `tools/` sí tiene un `package.json`, pero es solo para regenerar
assets a mano; nada de eso se sirve.

Fuentes desde Google Fonts.

## El pipeline de los escaneos

Se corre **a mano** y el resultado se commitea. No hay build en CI ni nada que
se ejecute al publicar.

```
tools/scans.json        el elenco: un slug de Poly Haven por objeto
tools/fetch-scans.mjs   los baja crudos a _mat/scans/raw/ (untracked)
tools/build-scans.mjs   los optimiza a deck/models/*.glb + manifest.json
tools/build-three.mjs   arma js/vendor/three-bundle.js
```

**Ojo con Google Drive.** El repo vive en un Drive montado y `npm install` ahí
se rompe (miles de archivos chicos, locking). Por eso los scripts leen
`MUTAR_REPO` y `MUTAR_RAW`: se instala la toolchain en un disco local y se
apunta al repo.

```bash
mkdir -p ~/mutar-scan-build && cd ~/mutar-scan-build
cp "$REPO/deck/tools/package.json" . && npm install
cp "$REPO/deck/tools/"*.mjs .
MUTAR_REPO="$REPO" MUTAR_RAW="$PWD/raw" node fetch-scans.mjs
MUTAR_REPO="$REPO" MUTAR_RAW="$PWD/raw" node build-scans.mjs
MUTAR_REPO="$REPO" node build-three.mjs
```

Para cambiar el elenco: buscar el modelo en polyhaven.com/models, copiar el
slug de la URL, agregarlo a `tools/scans.json` y volver a correr fetch + build.
`scan.js` lee `models/manifest.json`, así que no hay que tocar código.

Tres decisiones del build que no conviene deshacer sin entenderlas:

- **Unlit.** Las texturas ya vienen con la luz horneada. Los materiales se
  marcan con `KHR_materials_unlit`, que GLTFLoader mapea a `MeshBasicMaterial`:
  la escena no tiene ni una luz. Volver a iluminarlos los ensucia.
- **Solo base color.** Sin luces, los mapas de normal/AO/rough/metal no pintan
  nada. Tirarlos es la mitad del ahorro de peso.
- **Simplify agresivo (~3.5k tris).** No es solo peso: la decimación es la que
  deja las facetas y las siluetas grumosas que hacen que lean como escaneos.

Y dos trampas ya pisadas, por si el build vuelve a fallar:

- `sharp` está clavado en la misma major que usa `ndarray-pixels` (la
  dependencia de píxeles de gltf-transform). Dos copias nativas de sharp en el
  mismo proceso rompen libvips con `colourspace: parameter space not set`.
- `prune()` va con `keepSolidTextures: true`. Sin eso decodifica los píxeles de
  cada textura y explota por lo mismo.

### Tres detalles del CSS que conviene saber antes de tocarlo

1. **Las custom properties derivadas se redeclaran por ground.** `--fg-dim`,
   `--hairline` y `--accent-text` dependen de `--fg` / `--accent`, y una
   custom property que referencia a otra se resuelve *en el elemento donde se
   declara*. Si se declaran una sola vez en `:root`, quedan congeladas.
2. **`--accent-text` existe por legibilidad.** El amarillo y el lima como
   texto sobre hueso no se leen. Ese token oscurece el acento sobre grounds
   claros. Usá `--accent` para rellenos y `--accent-text` para texto.
3. **Nada de `overflow: hidden` en el interludio del carrete.** Convertía al
   interludio en contenedor de scroll y anulaba el `sticky` del stage.

---

## Versión Google Slides

`deck/export/MUTAR-deck-es.pptx` — los mismos 20 frames como slides nativos:
cajas de texto y formas reales, todo editable, en castellano.

**Cómo abrirlo:** arrastrá el .pptx a Google Drive y abrilo con Google Slides.
Drive lo convierte solo.

**Las fuentes hay que agregarlas una vez.** Fredoka, Bagel Fat One, DM Mono y
Bricolage Grotesque son de Google Fonts pero no vienen en la lista por defecto
de Slides. En el menú de fuentes → *Más fuentes* → buscá cada una y agregala.
Hasta que lo hagas, Slides las sustituye por Arial: el deck se ve correcto pero
pierde su carácter.

**Qué se simplifica respecto del web.** Lo que en la web es movimiento no tiene
equivalente en una diapositiva: el track horizontal de los cinco movimientos
pasa a cinco tarjetas en fila, las treinta esculturas dibujadas pasan a una
grilla numerada con la ganadora resaltada, y el carrete de fotos no está (es un
interludio de scroll, no un slide). Todo lo demás —textos, colores por acto,
jerarquías, píldoras de pendiente— es igual.

**Para regenerarlo** después de tocar el contenido:

```
node deck/tools/build-pptx.js
```

El contenido de cada slide vive en `deck/tools/build-pptx.js`; el escritor de
.pptx (ZIP + PresentationML, sin dependencias) en `deck/tools/pptx-lib.js`.
Ojo: el generador es una fuente aparte del HTML — si cambiás un texto en el deck
web, hay que cambiarlo también ahí.

---

## Pendiente

- Reemplazar el feed placeholder por fotos reales de galería personal.
- Imágenes del proyecto en los `.slot` marcados.
- Retratos de los creadores y equipo de producción.
- Diagrama del pipeline (frame 09).
- Datos reales de votación (frame 13) — hoy son de ejemplo.
- Presupuesto, cronograma y requerimientos técnicos.

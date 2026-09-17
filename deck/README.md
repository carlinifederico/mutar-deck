# MUTAR — deck web v2

Propuesta alternativa al deck de la raíz (`../index.html`). Misma información,
otra dirección: el logotipo hand-drawn en rosa de marca, tipografía grande,
fondos suaves y un scroll con movimiento, más un modo de exportación a 16:9.

**Este pase es de estructura.** Cada frame tiene su título real y lo mínimo de
cuerpo; lo que falta está marcado con la píldora `.note`, no disimulado.

Abrir: `deck/index.html` directamente en el navegador (anda desde `file://`,
no necesita servidor ni build).

---

## La reunión del 17/09/2026

Gervasio y Federico recorrieron el deck página por página y dictaron el
feedback *"como si le estuviera hablando a un developer"*. Todo lo que sigue
salió de ahí; las notas y la transcripción están en
`_mat/Meets/mutar - 2026_09_17 14_05 CEST - Notes by Gemini.pdf`.

Lo grande fue esto:

1. **El orden.** Lo que sigue al frame del ciclo ahora respeta el orden de ese
   mismo ciclo. La librería se mudó a antes del happening, y entraron dos
   frames nuevos: la convocatoria (etapa 1) y la visita (etapa 10).
2. **El texto.** El deck estaba armado sólo con titulares. Los frames 04, 06,
   07 y 12 ahora tienen prosa, sacada del documento escrito del proyecto.
3. **Los fondos.** Fuera las esferas difuminadas; el fondo pasa a ser la
   retícula de prototipo más las capturas del registro real.
4. **Menos interacción.** Salieron los objetos arrastrables de la portada y el
   pintar por encima del finish. El anillo que orbita se mudó al frame de los
   treinta resultados, que es donde Gervasio lo pidió.
5. **La navegación.** Las flechas y la barra espaciadora recorren **todas** las
   secciones, interludio incluido: *"si uno lo navega con la flecha se saltea
   cosas"*.

Quedó pendiente, y está marcado con `.note` en el deck: el render de la obra
terminada en sala, la foto del lugar, los objetos 3D del Figma y las compañías
de los créditos.

---

## Cómo se recorre

| Acción | |
|---|---|
| Scroll | Los frames imantan (snap *proximity*); el interludio se recorre libre |
| `↑` `↓` `PgUp` `PgDn` | Sección anterior / siguiente — **incluye el interludio** |
| `Space` `⇧Space` | Lo mismo, adelante y atrás |
| `Home` `End` | Primera / última sección |
| `L` | Cambia idioma EN ⇄ ES |
| `P` | Abre el modo export |
| Rail derecho | Salta al primer frame de cada acto |

Query params: `?lang=es` · `?frame=8` · `?print` · `?print=full`

---

## Estructura — 30 frames en 11 actos + 1 interludio

El 17/09 el deck se reordenó entero: lo que sigue a la página del ciclo ahora
respeta el orden de ese mismo ciclo. Gervasio: *"la página 10, que es el punto
número seis del journey, está primera. Entonces habría que reordenarla"*.

| | Frames | Ground / acento |
|---|---|---|
| **0 · Entrada** | 01 Portada | hueso / rosa |
| **1 · La pregunta** | 02 · 03 | tinta / lima |
| | *interludio — el carrete* | |
| **2 · La idea** | 04 Tesis · 05 Concepto · 06 Qué es MUTAR · 07 Por qué los objetos cargan historia | hueso / amarillo |
| **3 · El recorrido** | 08 Divisor · 09 Los seis pasos · 10 El ciclo | tinta / cian |
| **4 · Antes del happening** | 11 La convocatoria · 12 La librería | hueso / cian |
| **5 · La experiencia** | 13 Happening · 14 Por qué passthrough · 15 El espacio · 16 Cómo empieza | violeta / amarillo |
| **6 · La construcción** | 17 Tres fases · 18 Herramientas · 19 El finish · 20 Artista invitado | tinta / naranja |
| **7 · La comunidad** | 21 Treinta resultados · 22 Votación · 23 La obra física · 24 La visita | hueso / violeta |
| **8 · Escala** | 25 Ciudades · 26 Escalabilidad · 27 Impacto | hueso / naranja |
| **9 · Los creadores** | 28 Canda + Carlini | tinta / amarillo |
| **10 · Cierre** | 29 Cierre · 30 Créditos | tinta / rosa |

Las etapas del ciclo que tienen frame propio son la 1 (convocatoria), la 5
(librería), la 6 (happening), la 7 (repetición → treinta resultados), la 8
(votación), la 9 (construcción) y la 10 (visita). Las etapas 2 a 4 —
curaduría, recolección y escaneo — viven sólo en el sumario del frame 10.

Los frames 04, 06, 07 y 12 llevan párrafos y no sólo titulares. Fue un pedido
explícito: *"siento que no hay ninguna página donde haya una exposición de
texto, párrafo… está todo organizado tipo por headlines"*. El texto se sacó de
`_mat/Textos varios.pdf`, que es el documento escrito del proyecto.

### Piezas interactivas

Quedó una, en `js/play.js`, apagada con `prefers-reduced-motion` y en export:

- **Frame 21 · Treinta resultados** — anillo de diez objetos que orbita solo,
  se frena al pasar el mouse y se puede girar arrastrando. Gervasio lo pidió
  ahí el 17/09: *"la gente no está acostumbrada a orbitar un objeto online y
  por ahí no se imagina cómo vas a votar"*. Sólo gira mientras el frame está
  a la vista.

Las otras dos salieron en esa misma reunión: los objetos arrastrables de la
portada (*"no sirven para nada"*) y el pintar por encima del finish (*"no se
entiende, por favor eliminarlo"*). Las siluetas SVG no se tiraron — `OBJETOS`
y `svgObjeto()` siguen alimentando el anillo, y son provisorias hasta que
existan los escaneos reales.

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

Cuatro `.slot` de imagen (planta del espacio, mockup del cinturón, los
escaneos reales, referencia de artista invitado) y doce `.note` con lo que
falta definir. Los que salieron de la reunión del 17/09:

- **01 · 04** — el render de la obra terminada en sala. Federico lo pidió
  textual: *"alguna imagen del proyecto terminado tiene que haber, medio
  prototipada, en un salón de un museo"*. Mientras no exista, el fondo es una
  captura del prototipo.
- **11** — el formulario real de la convocatoria (la ficha que está es de
  ejemplo).
- **13** — una fotografía del lugar: *"acá tendría que haber una imagen del
  lugar"*.
- **21** — los objetos 3D que Gervasio va a mandar desde Figma para reemplazar
  las siluetas del anillo.
- **30** — las compañías productoras, que en la transcripción quedaron rotas.

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

**Frame 09 · los seis pasos.** Track horizontal con scrub: el frame mide
300vh y adentro un stage pegajoso desplaza las tarjetas. El progreso se parte
en un tramo por step — un momento quieto y después el viaje al siguiente — así
los seis tienen su momento y ninguno se saltea. El sexto (*Visitarla*) entró
el 17/09; el riel se mide solo, no hay número fijo en el JS. El offset de
cada step puede ser negativo: si se lo clampea a 0, el primero queda pegado a
la izquierda y el que se ve centrado es el segundo. Cada step tiene ícono,
color propio y se apaga cuando no es el activo.

**Frame 21 · las treinta esculturas.** Cada tile es una escultura dibujada con
las **mismas cinco piezas** (barra, caja, disco, anillo, cuña) apiladas
distinto. Se generan con un PRNG sembrado por índice, así que el layout no
cambia entre cargas. La ganadora va en color de marca. Desde el 17/09 cada
tile muestra además su cuenta de votos — también determinística, por el mismo
PRNG — porque *"se tiene que notar que la gente ya está votando"*.

---

## La capa de prototipo

El deck muestra un proyecto que todavia se esta construyendo, asi que el sitio
esta vestido como un archivo de trabajo y no como una pieza cerrada. Vive todo
en `css/proto.css` y son tres cosas:

- **Reticula.** Un papel milimetrado tenue detras de cada frame (`.frame::after`),
  que se desvanece hacia los bordes. El color sale de `currentColor`, asi que
  sigue al ground del acto sin redeclararse.
- **Sello.** `.stamp` al lado del contador: *Prototipo · en curso*. Mismo
  idioma que `.note` — borde punteado y punto de marca. Se oculta abajo de 46rem.
- **Capturas.** El fondo de seis frames sale del registro del prototipo.

Desde el 17/09 esta capa **es** el fondo del deck: las tres esferas difuminadas
que habia detras de cada frame se retiraron enteras (`.aura-field` y, con
ellas, el `.cursor-blob`, que era la misma esfera siguiendo al mouse).
Federico: *"todos los background son como tres esferas blureadas que son
horribles"*.

### Las capturas

Salen todas del mismo registro interno (`prototype/capturas/Gerva`, que **no**
esta en el repo: pesa gigas). Los loops son de 12s; los stills, un cuadro.

| Frame | Archivo | Momento | Qué se ve |
|---|---|---|---|
| 01 · Portada | `media/bg-portada.jpg` | 00:03:48 | still — la sala, al fondo del logotipo |
| 04 · Tesis | `media/bg-mundo.jpg` | 00:03:18 | still — el plano general, *"el layout del mundo de mutar"* |
| 08 · Divisor | `media/capture-mutacion` | 00:06:40 | loop — la escultura armandose pieza por pieza |
| 13 · El happening | `media/capture-happening` | 00:04:22 | loop — objetos grandes moviendose a escala real |
| 15 · El espacio | `media/capture-espacio` | 00:00:18 | loop — el recorrido por la sala y los estantes |
| 18 · Las herramientas | `media/capture-herramientas` | 00:09:42 | loop — la paleta y el pincel en primera persona |

El timecode del HUD arranca en el minuto real de cada loop: los numeros
distintos son la prueba de que es un mismo registro mirado en momentos
distintos. Los stills no llevan HUD — no hay nada corriendo que contar.

Un fondo que es sólo imagen se marca con `data-capture-still` y `js/capture.js`
monta un `<img>` en vez del `<video>`. Es el mismo atajo que ya usaba para
`prefers-reduced-motion` y para el modo export.

**Cómo se agrega una cuarta.** Una linea en el HTML, adentro del `<section>`:

```html
<section class="frame frame--loquesea frame--capture" ...>
  <div class="capture" data-capture="media/capture-x" data-capture-tc="123" aria-hidden="true"></div>
```

`data-capture` es la ruta sin extension (busca `.mp4` y `.jpg`) y
`data-capture-tc` el segundo del master donde empieza. `js/capture.js` arma el
resto: video, velo, marcas de encuadre y HUD.

**Cómo se corta un clip.** Con ffmpeg, 12s con el ultimo segundo fundido contra
el primero para que el loop no tenga corte:

```
ffmpeg -ss <SEGUNDO> -t 13 -i <master.mp4> -filter_complex  "[0:v]fps=24,scale=960:-2,setsar=1,split=2[m][t];
  [m]trim=0:12,setpts=PTS-STARTPTS,split=2[h][r];
  [h]trim=0:1,setpts=PTS-STARTPTS[head];
  [r]trim=1:12,setpts=PTS-STARTPTS[rest];
  [t]trim=12:13,setpts=PTS-STARTPTS[tail];
  [tail][head]blend=all_expr='A*(1-T)+B*T'[mix];
  [mix][rest]concat=n=2:v=1[out]" -map "[out]" -an  -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 29 -preset slow  -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart media/capture-x.mp4
ffmpeg -i media/capture-x.mp4 -frames:v 1 -q:v 5 media/capture-x.jpg
```

`+faststart` no es opcional: sin el, el navegador se queda esperando el moov
atom y el video nunca arranca.

**Cómo entra el video en la paleta.** No entra con su color, entra como luz.
Sobre violeta el `mix-blend-mode: luminosity` lo tine con el ground del acto.
Sobre tinta eso daria un gris plano — y justo ahi la captura *es* la paleta de
color del prototipo, que es de lo que habla el frame 15 — asi que ahi el blend
pasa a `screen`, que sobre negro deja pasar el color.

**Peso y cortesia.** Los tres `.mp4` suman ~3 MB y se piden recien un viewport
antes de verse (`preload="none"` + src diferido). Fuera de pantalla el video se
pausa. Con `prefers-reduced-motion` o en export no hay video: va el poster
`.jpg`, quieto y sin HUD.

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
index.html         30 frames + 1 interludio, con la copy EN/ES inline
css/tokens.css     paleta, marca, escala tipográfica, ritmo, curvas
css/base.css       reset, chrome, logo, motor de reveals, modo export
css/frames.css     layout por frame, responsive y overrides de export
css/proto.css      capa de prototipo: reticula, sello y capturas de fondo
js/i18n.js         toggle EN/ES
js/motion.js       reveals, split, progreso del carrete, track, tiles y votos
js/nav.js          sección activa, rail, teclado, deep links, modo export
js/scan.js         la escena 3D del carrete (objetos escaneados)
js/capture.js      monta las capturas de video de fondo (lazy + play/pause)
js/vendor/         three.js empaquetado, generado por tools/build-three.mjs
models/            los 20 .glb del carrete + manifest.json
img/mutar-logo.svg logotipo vectorizado
img/scan/          poster de fallback del carrete
js/play.js         el anillo que orbita (frame 21)
media/             las capturas del prototipo: loops .mp4 + poster .jpg,
                   y los dos stills de fondo (portada y tesis)
```

Sin dependencias ni build **en runtime**: lo que se sirve son archivos
estáticos. `tools/` sí tiene un `package.json`, pero es solo para regenerar
assets a mano; nada de eso se sirve.

Fuentes desde Google Fonts.

`tools/build-pptx.js` y `export/MUTAR-deck-es.pptx` **quedaron atrás**: el
script hardcodea el deck viejo de 20 slides y no lee `index.html`. Hay que
rehacerlo antes de volver a generar la versión Google Slides.

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
- Datos reales de votación (frame 22) — hoy son de ejemplo, igual que las
  cuentas de votos del frame 21.
- Render de la obra terminada en sala (frames 01 y 04).
- Foto del lugar del happening (frame 13).
- Los objetos 3D del Figma para el anillo del frame 21.
- Las compañías productoras de los créditos (frame 30).
- Presupuesto, cronograma y requerimientos técnicos.

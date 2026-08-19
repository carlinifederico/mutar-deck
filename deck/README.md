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

## Estructura — 20 frames en 8 actos + 1 interludio

| | Frame | Ground / acento |
|---|---|---|
| **0 · Entrada** | 01 Portada | hueso / rosa |
| **1 · La pregunta** | 02 · 03 Las dos preguntas | tinta / lima |
| | *interludio — el carrete* | |
| **2 · La idea** | 04 Tesis · 05 Concepto · 06 Qué es MUTAR | hueso / amarillo |
| **3 · El recorrido** | 07 Divisor · 08 Cinco movimientos · 09 Pipeline | tinta / cian |
| **4 · La experiencia** | 10 Happening · 11 Cinturón · 12 Treinta resultados · 13 Votación · 14 Construcción | violeta / amarillo |
| **5 · Escala** | 15 Ciudades · 16 Escalabilidad · 17 Impacto | hueso / naranja |
| **6 · Los creadores** | 18 Canda + Carlini | tinta / amarillo |
| **7 · Cierre** | 19 Cierre · 20 Contacto | tinta / rosa |

Los frames 05 y 06 usan `.beats`: la idea entra en tres golpes cortos en vez
de dos párrafos. Es lo que hace que el deck se lea como estructura.

---

## Las tres piezas con lógica propia

**El interludio del carrete (frame 03 → 04).** Un feed de fotos personales que
se aleja mientras scrolleás: al principio te tapa la cara, al final es un mar
de miniaturas. El zoom-out *es* el argumento de "es tanto que parece poco".
Las fotos son **placeholder** de [Lorem Picsum](https://picsum.photos) en
`img/feed/` — hay que reemplazarlas por un feed real.

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
js/motion.js       reveals, split, carrete, track, auras, cursor
js/nav.js          frame activo, rail, teclado, deep links, modo export
img/mutar-logo.svg logotipo vectorizado
img/feed/          44 fotos placeholder para el carrete
```

Sin dependencias ni build. Fuentes desde Google Fonts.

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

## Pendiente

- Reemplazar el feed placeholder por fotos reales de galería personal.
- Imágenes del proyecto en los `.slot` marcados.
- Retratos de los creadores y equipo de producción.
- Diagrama del pipeline (frame 09).
- Datos reales de votación (frame 13) — hoy son de ejemplo.
- Presupuesto, cronograma y requerimientos técnicos.

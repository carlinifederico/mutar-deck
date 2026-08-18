# MUTAR — deck web v2

Propuesta alternativa al deck de la raíz (`../index.html`). Misma información,
otra dirección: tipografía bubbly gigante, paleta ácida sobre fondo hueso,
scroll con movimiento y un modo de exportación a 16:9.

**Este pase es de estructura.** Cada frame tiene su título real y lo mínimo de
cuerpo; los huecos que faltan están marcados, no disimulados.

Abrir: `deck/index.html` directamente en el navegador (anda desde `file://`,
no necesita servidor ni build).

---

## Cómo se recorre

| Acción | |
|---|---|
| Scroll | Los frames imantan (snap *proximity*); los interludios se recorren libres |
| `↑` `↓` `PgUp` `PgDn` | Frame anterior / siguiente |
| `Home` `End` | Primer / último frame |
| `L` | Cambia idioma EN ⇄ ES |
| `P` | Abre el modo export |
| Rail derecho | Salta al primer frame de cada acto |

Query params: `?lang=es` · `?frame=9` · `?print` · `?print=full`

---

## Estructura — 20 frames en 6 actos + 3 interludios

| | Frame | Ground / acento |
|---|---|---|
| **0 · Entrada** | 01 Cover | hueso / rosa |
| | *interludio A — marquee de objetos* | |
| **1 · La pregunta** | 02 · 03 · 04 Las tres preguntas | tinta / lima |
| | *interludio B — la pila* | |
| **2 · La idea** | 05 Tesis · 06 Concepto · 07 Qué es MUTAR | hueso / amarillo |
| **3 · El recorrido** | 08 Divisor · 09 Cinco movimientos · 10 Pipeline | tinta / cian |
| **4 · La experiencia** | 11 Happening · 12 Cinturón · 13 Treinta resultados · 14 Votación · 15 Construcción | violeta / amarillo |
| | *interludio C — banda del recorrido* | |
| **5 · Escala** | 16 Ciudades · 17 Escalabilidad · 18 Impacto | hueso / naranja |
| **6 · Cierre** | 19 Cierre · 20 Créditos | tinta / rosa |

El frame **09** es el único que no imanta: mide 420vh y adentro tiene un
viewport pegajoso que desplaza los cinco movimientos en horizontal a medida
que scrolleás en vertical.

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
- `data-en-html` / `data-es-html` → se escriben como markup, para nodos con
  spans adentro.
- Un nodo nuevo sólo necesita los dos atributos; `js/i18n.js` lo toma solo.
- El idioma queda guardado en `localStorage`.

Los huecos de imagen son `.slot`: buscá `class="slot"` en `index.html`.
Cada uno lleva su descripción entre corchetes.

---

## Exportar a PDF / Google Slides

1. Abrir `deck/index.html?print` (o apretar `P`).
2. Imprimir → **Guardar como PDF**, tamaño horizontal, márgenes en cero.
3. Salen 20 páginas de 1280×720 (16:9), una por frame.
4. Google Slides importa ese PDF, o las páginas como imágenes.

En export se apagan animaciones, blobs, cursor y rail; cada frame pinta su
propio ground; y la escala tipográfica pasa a medidas fijas — en pantalla los
cuerpos se calculan con `vw`, que mide la ventana y no la página.

`?print=full` conserva además los interludios aplanados.

---

## Archivos

```
index.html         20 frames + 3 interludios, con la copy EN/ES inline
css/tokens.css     paleta, escala tipográfica, ritmo, curvas de movimiento
css/base.css       reset, chrome, motor de reveals, modo export
css/frames.css     layout por frame, responsive y overrides de export
js/i18n.js         toggle EN/ES
js/motion.js       reveals, split de palabras, marquees, scrub, blobs, cursor
js/nav.js          frame activo, rail, teclado, deep links, modo export
```

Sin dependencias ni build. Las fuentes vienen de Google Fonts
(Bagel Fat One, Bricolage Grotesque, DM Mono, Rubik Bubbles).

### Dos detalles del CSS que conviene saber antes de tocarlo

1. **Las custom properties derivadas se redeclaran por ground.** `--fg-dim`,
   `--hairline` y `--accent-text` dependen de `--fg` / `--accent`, y una
   custom property que referencia a otra se resuelve *en el elemento donde se
   declara*. Si se declaran una sola vez en `:root`, quedan congeladas con los
   valores por defecto. Ver `tokens.css`.
2. **`--accent-text` existe por legibilidad.** El amarillo y el lima como
   texto sobre fondo hueso no se leen. Ese token oscurece el acento sobre
   grounds claros y lo deja intacto sobre los oscuros. Usá `--accent` para
   rellenos y `--accent-text` para texto.

---

## Pendiente

- Set de imágenes en el estilo de `_mat/refs/sitedeck` → hoy son `.slot`.
- Cuerpo largo de los frames 11, 17 y 18.
- Video teaser del arranque (estaba en el deck viejo).
- Datos reales de la votación en el frame 14 (hoy son de ejemplo).

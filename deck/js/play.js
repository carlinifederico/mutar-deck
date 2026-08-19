/* ==========================================================================
   MUTAR — Piezas interactivas

   En la reunion quedo dicho que la web tenga "una impronta tecnologica":
   poder agarrar una cosita y moverla, orbitar unos diez elementos, y pintar
   por encima. Eso es lo que hay aca, mas la libreria de siluetas de objetos
   escaneados que las tres piezas comparten.

   Todo se apaga con prefers-reduced-motion y en modo export.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isExport = /(^|[?&])print(=|&|$)/.test(location.search);

  /* ---- Siluetas -----------------------------------------------------------
     Stand-ins de los objetos escaneados. Mismo lenguaje de trazo grueso
     redondeado que los iconos del deck, para que todo se lea como un sistema. */
  var TRAZO = 'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
  var OBJETOS = [
    { n: 'silla',      d: '<path d="M28 20v34M72 20v58M28 54h44M28 54v24"/><path d="M22 54h56"/>' },
    { n: 'rueda',      d: '<circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="8"/><path d="M50 20v14M50 66v14M20 50h14M66 50h14"/>' },
    { n: 'botella',    d: '<path d="M42 16h16v14c0 6 10 10 10 20v30a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V50c0-10 10-14 10-20z"/>' },
    { n: 'tanque',     d: '<rect x="26" y="18" width="48" height="64" rx="16"/><path d="M26 40h48M26 60h48"/>' },
    { n: 'lampara',    d: '<path d="M26 84h28"/><path d="M40 84V52"/><path d="M40 52 66 30"/><path d="M56 20h22l-6 18H62z"/>' },
    { n: 'engranaje',  d: '<circle cx="50" cy="50" r="20"/><circle cx="50" cy="50" r="7"/><path d="M50 16v10M50 74v10M16 50h10M74 50h10M26 26l7 7M67 67l7 7M74 26l-7 7M33 67l-7 7"/>' },
    { n: 'tostadora',  d: '<rect x="20" y="38" width="60" height="40" rx="12"/><path d="M34 38v-8M50 38v-8M66 38v-8"/>' },
    { n: 'ventilador', d: '<circle cx="50" cy="50" r="28"/><circle cx="50" cy="50" r="6"/><path d="M50 44c0-12 8-18 14-14s2 16-14 14M56 50c12 0 18 8 14 14s-16 2-14-14M44 50c-12 0-18-8-14-14s16-2 14 14"/>' },
    { n: 'escalera',   d: '<path d="M34 14v72M66 14v72M34 30h32M34 48h32M34 66h32"/>' },
    { n: 'monitor',    d: '<rect x="16" y="22" width="68" height="46" rx="8"/><path d="M42 68v10M58 68v10M34 78h32"/>' },
    { n: 'pava',       d: '<path d="M30 44h34a6 6 0 0 1 6 6v22a10 10 0 0 1-10 10H34a10 10 0 0 1-10-10V50a6 6 0 0 1 6-6z"/><path d="M64 52c10 0 14-6 14-14"/><path d="M38 44l8-12h8l8 12"/>' },
    { n: 'valija',     d: '<rect x="18" y="34" width="64" height="46" rx="8"/><path d="M40 34V24h20v10"/><path d="M18 54h64"/>' }
  ];

  function svgObjeto(i, extra) {
    var o = OBJETOS[i % OBJETOS.length];
    return '<svg viewBox="0 0 100 100" ' + TRAZO + ' aria-hidden="true"' +
           (extra || '') + '>' + o.d + '</svg>';
  }

  /* ---- 1 · Objetos que se pueden agarrar (portada) -------------------------
     El hint que pidio Federico: "agarrar una cosita y moverla". Entran de
     los bordes hacia el logotipo y despues quedan sueltos para tirarlos.   */
  function iniciarArrastre(caja) {
    if (!caja) return;
    // posiciones de reposo alrededor del logotipo, en % del contenedor
    // fuera de la franja central: ahi vive el logotipo y no se toca
    var spots = [
      [4, 12], [17, 21], [33, 7], [49, 11], [65, 7], [81, 17],
      [92, 28], [7, 82], [26, 89], [45, 93], [63, 86], [88, 78]
    ];
    caja.innerHTML = spots.map(function (s, i) {
      return '<button class="obj" type="button" tabindex="-1" aria-hidden="true" style="left:' + s[0] +
             '%;top:' + s[1] + '%;--d:' + (0.7 + i * 0.07).toFixed(2) + 's">' +
             svgObjeto(i) + '</button>';
    }).join('');

    if (reduce || isExport) return;

    var piezas = [].slice.call(caja.children);
    piezas.forEach(function (p) {
      var x = 0, y = 0, arrastrando = false, px = 0, py = 0;

      p.addEventListener('pointerdown', function (e) {
        arrastrando = true;
        px = e.clientX; py = e.clientY;
        p.setPointerCapture(e.pointerId);
        p.classList.add('is-drag');
        caja.classList.add('has-played');
      });
      p.addEventListener('pointermove', function (e) {
        if (!arrastrando) return;
        x += e.clientX - px; y += e.clientY - py;
        px = e.clientX; py = e.clientY;
        p.style.setProperty('--x', x + 'px');
        p.style.setProperty('--y', y + 'px');
      });
      function soltar(e) {
        if (!arrastrando) return;
        arrastrando = false;
        p.classList.remove('is-drag');
        try { p.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      p.addEventListener('pointerup', soltar);
      p.addEventListener('pointercancel', soltar);
    });
  }

  /* ---- 2 · Anillo que orbita (la libreria) ---------------------------------
     "10 elementos que los puedas orbitar". Gira solo, se frena al pasar el
     mouse, y se puede arrastrar para girarlo a mano.                        */
  function iniciarOrbita(caja) {
    if (!caja) return;
    var N = 10;
    var html = '';
    for (var i = 0; i < N; i++) {
      html += '<span class="orbita__item" style="--i:' + i + '">' + svgObjeto(i) + '</span>';
    }
    caja.innerHTML = html;
    if (reduce || isExport) { caja.style.setProperty('--rot', '0deg'); return; }

    var items = [].slice.call(caja.children);
    var ang = 0, vel = 0.16, quieto = false, arrastrando = false, px = 0;

    caja.addEventListener('pointerenter', function () { quieto = true; });
    caja.addEventListener('pointerleave', function () { quieto = false; });
    caja.addEventListener('pointerdown', function (e) {
      arrastrando = true; px = e.clientX; caja.setPointerCapture(e.pointerId);
      caja.classList.add('is-drag');
    });
    caja.addEventListener('pointermove', function (e) {
      if (!arrastrando) return;
      ang += (e.clientX - px) * 0.35; px = e.clientX;
    });
    function soltar(e) {
      arrastrando = false; caja.classList.remove('is-drag');
      try { caja.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    caja.addEventListener('pointerup', soltar);
    caja.addEventListener('pointercancel', soltar);

    (function girar() {
      if (!quieto && !arrastrando) ang += vel;
      // el radio va en px sobre el ancho del contenedor: en % seria relativo
      // al propio item y todos quedarian amontonados en el centro
      var radio = caja.offsetWidth * 0.36;
      var alto = caja.offsetHeight * 0.10;
      for (var i = 0; i < N; i++) {
        var a = (ang + i * (360 / N)) * Math.PI / 180;
        var z = Math.cos(a);                       // -1 atras, 1 adelante
        items[i].style.transform =
          'translate3d(' + (Math.sin(a) * radio).toFixed(1) + 'px,' +
          (-z * alto).toFixed(1) + 'px,0) scale(' + (0.6 + (z + 1) * 0.26).toFixed(3) + ')';
        items[i].style.opacity = (0.28 + (z + 1) * 0.36).toFixed(3);
        items[i].style.zIndex = Math.round((z + 1) * 50);
      }
      requestAnimationFrame(girar);
    })();
  }

  /* ---- 3 · Pintar por encima (el finish) -----------------------------------
     "o que pintes con la cinta por encima". Arrastrar sobre la escultura
     deja trazos en la paleta de MUTAR: es el argumento del frame hecho gesto. */
  function iniciarPintura(caja) {
    if (!caja) return;
    var lienzo = caja.querySelector('.pintar__canvas');
    if (!lienzo) return;
    var base = caja.querySelector('.pintar__base');
    if (base && !base.innerHTML) {
      // escultura de muestra armada con las mismas piezas del frame 19
      base.innerHTML = '<svg viewBox="0 0 100 130" ' + TRAZO + ' aria-hidden="true">' +
        '<path d="M18 124h64"/>' +
        '<rect x="30" y="88" width="40" height="30" rx="8"/>' +
        '<circle cx="50" cy="70" r="15"/>' +
        '<rect x="36" y="34" width="28" height="22" rx="7"/>' +
        '<path d="M50 34 60 14H40z"/>' +
        '</svg>';
    }
    var COLORES = ['var(--pink)', 'var(--lime)', 'var(--yellow)', 'var(--cyan)', 'var(--orange)'];
    if (reduce || isExport) return;

    var pintando = false, n = 0, ultimo = 0;

    function trazo(e) {
      var r = lienzo.getBoundingClientRect();
      var t = Date.now();
      if (t - ultimo < 26) return;              // no saturar de nodos
      ultimo = t;
      var s = document.createElement('i');
      s.className = 'pintar__gota';
      s.style.left = ((e.clientX - r.left) / r.width * 100) + '%';
      s.style.top = ((e.clientY - r.top) / r.height * 100) + '%';
      s.style.background = COLORES[n % COLORES.length];
      s.style.setProperty('--s', (0.7 + Math.random() * 0.9).toFixed(2));
      s.style.setProperty('--r', (Math.random() * 60 - 30).toFixed(1) + 'deg');
      lienzo.appendChild(s);
      n++;
      caja.classList.add('has-played');
      // techo de nodos: se van los mas viejos
      if (lienzo.children.length > 160) lienzo.removeChild(lienzo.firstChild);
    }

    lienzo.addEventListener('pointerdown', function (e) {
      pintando = true; lienzo.setPointerCapture(e.pointerId); trazo(e);
    });
    lienzo.addEventListener('pointermove', function (e) {
      if (pintando) trazo(e);
      else if (e.pointerType === 'mouse' && caja.classList.contains('has-played')) trazo(e);
    });
    function fin(e) {
      pintando = false;
      try { lienzo.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    lienzo.addEventListener('pointerup', fin);
    lienzo.addEventListener('pointercancel', fin);

    var limpiar = caja.querySelector('[data-limpiar]');
    if (limpiar) limpiar.addEventListener('click', function () {
      lienzo.innerHTML = ''; caja.classList.remove('has-played');
    });
  }

  /* ---- Boot ---------------------------------------------------------------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('has-loaded'); });
  });

  iniciarArrastre(document.querySelector('[data-objetos]'));
  iniciarOrbita(document.querySelector('[data-orbita]'));
  iniciarPintura(document.querySelector('[data-pintar]'));

  window.MUTAR = window.MUTAR || {};
  window.MUTAR.objetos = OBJETOS.length;
})();

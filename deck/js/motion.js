/* ==========================================================================
   MUTAR — Motion
   Un solo rAF para todo lo continuo (auras, carrete, track, cursor)
   + IntersectionObserver para las entradas. Sin librerias, sin build.

   Si prefers-reduced-motion esta activo, todo esto se apaga y el CSS
   deja el contenido visible y quieto.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var isExport = /(^|[?&])print(=|&|$)/.test(location.search);
  if (isTouch) document.body.classList.add('is-touch');

  /* ---- 1 · Split por palabras ------------------------------------------ */
  function splitAll() {
    document.querySelectorAll('.split').forEach(function (el) {
      var text = el.textContent.trim();
      if (!text) return;
      var base = parseFloat(el.style.getPropertyValue('--d')) || 0;
      el.innerHTML = text.split(/\s+/).map(function (word, i) {
        var d = (base + i * 0.055).toFixed(3);
        return '<span class="w" style="--d:' + d + 's">' + word + '</span>';
      }).join(' ');
    });
  }

  /* ---- 2 · Las treinta esculturas (frame 12) ------------------------------
     Antes eran codigos S-01..S-30: no comunicaban nada. Ahora cada tile es
     una escultura dibujada con EXACTAMENTE las mismas cinco piezas, apiladas
     distinto. Se ve de un vistazo lo que dice el titulo: mismos objetos,
     resultados distintos. Layout deterministico para que no cambie en cada
     carga.                                                                 */
  function lcg(seed) {
    var s = (seed * 2654435761) >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function sculpture(i) {
    var r = lcg(i + 7);
    var parts = [];
    var baseY = 86;
    // las cinco piezas de la biblioteca, siempre las mismas
    var kit = ['bar', 'box', 'disc', 'ring', 'wedge'];
    // orden de apilado distinto por escultura
    var order = kit.slice();
    for (var k = order.length - 1; k > 0; k--) {
      var j = Math.floor(r() * (k + 1));
      var tmp = order[k]; order[k] = order[j]; order[j] = tmp;
    }
    var y = baseY;
    for (var p = 0; p < order.length; p++) {
      // rangos acotados para que la pila nunca se salga del recuadro
      var w = 24 + r() * 26;
      var h = 9 + r() * 13;
      var x = 50 + (r() - 0.5) * 20;
      var rot = (r() - 0.5) * 22;
      var g = '<g transform="translate(' + x.toFixed(1) + ' ' + (y - h / 2).toFixed(1) +
              ') rotate(' + rot.toFixed(1) + ')">';
      switch (order[p]) {
        case 'bar':
          g += '<rect x="' + (-w / 2) + '" y="' + (-h / 4) + '" width="' + w +
               '" height="' + (h / 2) + '" rx="' + (h / 5) + '"/>'; break;
        case 'box':
          g += '<rect x="' + (-w / 2.6) + '" y="' + (-h / 2) + '" width="' + (w / 1.3) +
               '" height="' + h + '" rx="' + (h / 4) + '"/>'; break;
        case 'disc':
          g += '<circle cx="0" cy="0" r="' + (h / 1.7) + '"/>'; break;
        case 'ring':
          g += '<circle cx="0" cy="0" r="' + (h / 1.7) +
               '" fill="none" stroke="currentColor" stroke-width="' + (h / 4) + '"/>'; break;
        default:
          g += '<path d="M' + (-w / 2.4) + ' ' + (h / 2) + ' L' + (w / 2.4) + ' ' + (h / 2) +
               ' L0 ' + (-h / 1.6) + ' Z"/>'; break;
      }
      parts.push(g + '</g>');
      y -= h * 0.78;
    }
    return '<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">' +
           '<path d="M14 92h72" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>' +
           parts.join('') + '</svg>';
  }

  function buildTiles() {
    document.querySelectorAll('[data-tiles]').forEach(function (box) {
      if (box.children.length) return;
      var n = parseInt(box.dataset.tiles, 10) || 30;
      var winner = parseInt(box.dataset.winner, 10);
      var html = '';
      for (var i = 1; i <= n; i++) {
        html += '<figure class="tile' + (i === winner ? ' is-winner' : '') +
                '" style="--d:' + (i * 0.022).toFixed(3) + 's">' +
                sculpture(i) +
                '<figcaption>' + String(i).padStart(2, '0') + '</figcaption></figure>';
      }
      box.innerHTML = html;
    });
  }

  /* ---- 3 · Ticks decorativos -------------------------------------------- */
  function buildTicks() {
    document.querySelectorAll('.ticks').forEach(function (row) {
      if (row.children.length) return;
      var html = '';
      for (var i = 0; i < 26; i++) {
        html += '<i style="--h:' + (30 + ((i * 37) % 70)) + '%"></i>';
      }
      row.innerHTML = html;
    });
  }

  /* ---- 4 · Campo de auras ------------------------------------------------
     Degradados radiales grandes que derivan lento. Posiciones fijas: el
     campo tiene que verse compuesto, no aleatorio en cada carga.           */
  var auras = [];
  function buildAuras() {
    var field = document.querySelector('.aura-field');
    if (!field || reduce || isExport) return;
    var spec = [
      { x: 14, y: 20, s: 62, depth: 0.09, sp: 0.000068, amp: 4.5 },
      { x: 84, y: 30, s: 48, depth: 0.15, sp: 0.000092, amp: 6.0 },
      { x: 62, y: 78, s: 70, depth: 0.06, sp: 0.000051, amp: 3.5 },
      { x: 26, y: 84, s: 44, depth: 0.20, sp: 0.000124, amp: 7.0 }
    ];
    field.innerHTML = spec.map(function (a) {
      return '<div class="aura" style="left:' + a.x + '%;top:' + a.y +
             '%;width:' + a.s + 'vmax;height:' + a.s + 'vmax;margin:' +
             (-a.s / 2) + 'vmax 0 0 ' + (-a.s / 2) + 'vmax"></div>';
    }).join('');
    auras = [].slice.call(field.children).map(function (el, i) {
      return { el: el, cfg: spec[i] };
    });
  }

  /* ---- 6 · El carrete (interludio B) --------------------------------------
     Tantas cosas que ninguna se puede elegir. Aca solo se mide el progreso
     de la seccion; quien dibuja el monton de objetos escaneados es scan.js.
     Se queda de este lado para que el deck siga teniendo un unico rAF.    */
  var reel = null;
  function buildReel() {
    var stage = document.querySelector('.reel__stage');
    if (!stage || reduce || isExport) return;
    reel = { section: stage.closest('.interlude--reel'), stage: stage };
  }

  /* ---- 7 · Track horizontal con scrub (frame 09) -------------------------- */
  var track = null;
  function buildTrack() {
    var frame = document.querySelector('.frame--track');
    if (!frame || isExport) return;
    var rail = frame.querySelector('.track__rail');
    var steps = [].slice.call(frame.querySelectorAll('.step'));
    track = {
      frame: frame,
      rail: rail,
      vp: frame.querySelector('.track__viewport'),
      steps: steps,
      pips: [].slice.call(frame.querySelectorAll('.track__progress i')),
      count: frame.querySelector('[data-track-now]'),
      offsets: [],
      active: -1
    };
    measureTrack();
  }

  // Cuanto hay que desplazar el riel para que cada step quede centrado.
  // Se recalcula al redimensionar y al cambiar de idioma.
  function measureTrack() {
    if (!track || !track.steps.length) return;
    // Sin clamp a 0: si el primer step arranca pegado a la izquierda, el que
    // queda en el centro de la pantalla es el segundo y el primero parece
    // saltearse. El offset puede ser negativo — el riel se corre a la derecha
    // y deja aire antes del step 1, que es lo correcto: antes no hay nada.
    track.offsets = track.steps.map(function (s) {
      return s.offsetLeft + s.offsetWidth / 2 - window.innerWidth / 2;
    });
  }

  /* ---- 8 · Observador de entradas ---------------------------------------- */
  function observe() {
    var targets = document.querySelectorAll('.reveal, .split, .inflate, .tiles, .bars');
    if (reduce || isExport || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- 9 · Cursor blob ---------------------------------------------------- */
  var cursor = document.querySelector('.cursor-blob');
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, cx: 0, cy: 0 };
  if (cursor && !isTouch && !reduce && !isExport) {
    mouse.cx = mouse.x; mouse.cy = mouse.y;
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
  }

  /* ---- 10 · Loop unico ---------------------------------------------------- */
  var lastY = window.scrollY;
  var velocity = 0;
  var lastT = 0;

  function frame(t) {
    var dt = Math.min(48, t - lastT || 16);
    lastT = t;

    var y = window.scrollY;
    velocity += ((y - lastY) - velocity) * 0.18;
    lastY = y;

    // Auras: deriva lenta + parallax
    for (var i = 0; i < auras.length; i++) {
      var b = auras[i], c = b.cfg;
      var drift = Math.sin(t * c.sp) * c.amp;
      var driftY = Math.cos(t * c.sp * 0.8) * c.amp * 0.6;
      b.el.style.transform =
        'translate3d(' + drift.toFixed(2) + 'vmax,' +
        (driftY - y * c.depth * 0.06).toFixed(2) + 'px,0)';
    }

    // Carrete: la camara se aleja a medida que se atraviesa la seccion.
    // rp es el mismo 0..1 de siempre; lo que cambio es quien lo consume.
    if (reel && reel.section && window.MUTAR && window.MUTAR.scan) {
      var rr = reel.section.getBoundingClientRect();
      var rspan = rr.height - reel.stage.offsetHeight;
      var rp = rspan > 0 ? -rr.top / rspan : 0;
      rp = Math.max(0, Math.min(1, rp));
      window.MUTAR.scan.tick(rp, velocity);
    }

    // Track horizontal, por pasos.
    // El barrido continuo hacia que se scrollearan miles de pixeles sin que
    // pasara casi nada. Ahora el progreso se parte en un tramo por step:
    // la primera mitad del tramo sostiene el step, la segunda viaja al que
    // sigue. Asi los cinco tienen su momento y ninguno se saltea.
    if (track && track.rail && track.steps.length) {
      var rect = track.frame.getBoundingClientRect();
      var span = rect.height - track.vp.offsetHeight;
      var prog = span > 0 ? -rect.top / span : 0;
      prog = Math.max(0, Math.min(1, prog));

      var last = track.steps.length - 1;
      var f = prog * last;                  // posicion continua entre steps
      var idx = Math.min(last, Math.floor(f));
      var local = f - idx;                  // 0..1 dentro del tramo
      var HOLD = 0.32;                      // cuanto del tramo se queda quieto
      var t = local <= HOLD ? 0 : (local - HOLD) / (1 - HOLD);
      t = t * t * (3 - 2 * t);              // smoothstep: sale y entra suave

      // el viaje empieza recien en HOLD, asi que el punto medio del viaje no
      // es 0.5 sino HOLD + (1-HOLD)/2. Cambiar el resaltado ahi hace que el
      // highlight salte justo cuando la tarjeta entrante cruza el centro.
      var medio = HOLD + (1 - HOLD) / 2;
      var active = local > medio ? Math.min(last, idx + 1) : idx;
      var x = track.offsets[idx] + (track.offsets[Math.min(last, idx + 1)] - track.offsets[idx]) * t;
      track.rail.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';

      if (active !== track.active) {
        track.active = active;
        for (var s = 0; s < track.steps.length; s++) {
          track.steps[s].classList.toggle('is-active', s === active);
        }
        for (var pi = 0; pi < track.pips.length; pi++) {
          track.pips[pi].classList.toggle('is-on', pi <= active);
        }
        if (track.count) track.count.textContent = String(active + 1).padStart(2, '0');
      }
    }

    // Cursor
    if (cursor && !isTouch && !reduce && !isExport) {
      mouse.cx += (mouse.x - mouse.cx) * 0.09;
      mouse.cy += (mouse.y - mouse.cy) * 0.09;
      cursor.style.transform =
        'translate3d(' + mouse.cx.toFixed(1) + 'px,' + mouse.cy.toFixed(1) + 'px,0)';
    }

    requestAnimationFrame(frame);
  }

  /* ---- Boot --------------------------------------------------------------- */
  function boot() {
    splitAll();
    buildTiles();
    buildTicks();
    buildAuras();
    buildReel();
    buildTrack();
    observe();
    if (!reduce && !isExport) requestAnimationFrame(frame);
  }

  // Las fuentes cambian los anchos: medir despues de que carguen
  boot();
  // Las fuentes cambian los anchos de las tarjetas: re-medir al cargarlas
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureTrack);
  }

  // Al cambiar de idioma el texto se reescribe: hay que re-splitear y re-medir
  document.addEventListener('mutar:lang', function () {
    splitAll();
    measureTrack();
    observe();
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureTrack, 220);
  }, { passive: true });

  window.MUTAR = window.MUTAR || {};
  window.MUTAR.reduce = reduce;
  window.MUTAR.isExport = isExport;
})();

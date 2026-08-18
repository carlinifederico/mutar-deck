/* ==========================================================================
   MUTAR — Motion
   Un solo rAF para todo lo continuo (blobs, marquees, pila, track, cursor)
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

  /* ---- 2 · Tiles generados (frame 13) ----------------------------------- */
  function buildTiles() {
    document.querySelectorAll('[data-tiles]').forEach(function (box) {
      if (box.children.length) return;
      var n = parseInt(box.dataset.tiles, 10) || 30;
      var winner = parseInt(box.dataset.winner, 10);
      var html = '';
      for (var i = 1; i <= n; i++) {
        var id = String(i).padStart(2, '0');
        html += '<span class="tile' + (i === winner ? ' is-winner' : '') +
                '" style="--d:' + (i * 0.022).toFixed(3) + 's">S-' + id + '</span>';
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

  /* ---- 4 · Blob field ---------------------------------------------------- */
  var blobs = [];
  function buildBlobs() {
    var field = document.querySelector('.blob-field');
    if (!field || reduce || isExport) return;
    // Posiciones fijas y deterministas: el campo tiene que verse compuesto,
    // no aleatorio distinto en cada carga.
    var spec = [
      { x: 10, y: 16, s: 22, depth: 0.10, sp: 0.00023, amp: 5 },
      { x: 82, y: 24, s: 17, depth: 0.18, sp: 0.00031, amp: 7 },
      { x: 66, y: 74, s: 26, depth: 0.07, sp: 0.00017, amp: 4 },
      { x: 20, y: 82, s: 15, depth: 0.24, sp: 0.00042, amp: 8 },
      { x: 44, y: 46, s: 19, depth: 0.13, sp: 0.00026, amp: 6 }
    ];
    field.innerHTML = spec.map(function (b) {
      return '<div class="blob" style="left:' + b.x + '%;top:' + b.y +
             '%;width:' + b.s + 'vmax;height:' + b.s + 'vmax;margin:' +
             (-b.s / 2) + 'vmax 0 0 ' + (-b.s / 2) + 'vmax"></div>';
    }).join('');
    blobs = [].slice.call(field.children).map(function (el, i) {
      return { el: el, cfg: spec[i] };
    });
  }

  /* ---- 5 · Marquees ------------------------------------------------------ */
  var marquees = [];
  function buildMarquees() {
    marquees = [];
    document.querySelectorAll('.marquee__row, .band__row').forEach(function (row) {
      if (!row.dataset.seed) row.dataset.seed = row.innerHTML;
      row.innerHTML = row.dataset.seed;
      if (reduce || isExport) return;

      var setWidth = row.scrollWidth;
      if (!setWidth) return;
      // Clonar hasta cubrir dos veces el viewport: el loop tiene que ser continuo
      var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / setWidth) + 1);
      var seed = row.innerHTML;
      for (var i = 1; i < copies; i++) row.insertAdjacentHTML('beforeend', seed);

      marquees.push({
        el: row,
        w: setWidth,
        speed: parseFloat(row.dataset.speed) || 0.3,
        offset: 0
      });
    });
  }

  /* ---- 6 · La pila (interludio B) ---------------------------------------- */
  var pileItems = [];
  function buildPile() {
    var box = document.querySelector('.pile__items');
    if (!box) return;
    var kids = [].slice.call(box.children);
    // Layout deterministico: se acumula desordenado pero siempre igual
    // [left%, top%, rotacion, escala] — desprolijo pero siempre igual
    var spots = [
      [2, 4, -7, 1.35], [56, 0, 5, 0.85], [26, 16, -3, 1.05], [4, 30, 8, 0.75],
      [62, 24, 4, 1.2], [30, 40, -6, 0.9], [0, 54, -2, 1.1], [46, 58, 7, 0.8],
      [16, 72, -4, 1.25], [58, 82, 3, 0.95]
    ];
    kids.forEach(function (el, i) {
      var s = spots[i % spots.length];
      el.style.left = s[0] + '%';
      el.style.top = s[1] + '%';
      el.style.setProperty('--rot', s[2] + 'deg');
      el.style.setProperty('--fs', s[3]);
      el.dataset.depth = (0.12 + (i % 5) * 0.07).toFixed(2);
      el.style.transform = 'rotate(' + s[2] + 'deg)';
    });
    pileItems = reduce || isExport ? [] : kids;
  }

  /* ---- 7 · Track horizontal con scrub (frame 09) -------------------------- */
  var track = null;
  function buildTrack() {
    var frame = document.querySelector('.frame--track');
    if (!frame || isExport) return;
    track = {
      frame: frame,
      rail: frame.querySelector('.track__rail'),
      vp: frame.querySelector('.track__viewport'),
      bar: frame.querySelector('.track__progress i')
    };
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

    // Blobs: deriva lenta + parallax
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i], c = b.cfg;
      var drift = Math.sin(t * c.sp) * c.amp;
      var driftY = Math.cos(t * c.sp * 0.8) * c.amp * 0.6;
      b.el.style.transform =
        'translate3d(' + drift.toFixed(2) + 'vmax,' +
        (driftY - y * c.depth * 0.06).toFixed(2) + 'px,0)';
    }

    // Marquees: velocidad base + empuje del scroll
    for (var m = 0; m < marquees.length; m++) {
      var q = marquees[m];
      q.offset += (q.speed * dt * 0.06) + velocity * q.speed * 0.06;
      q.offset = ((q.offset % q.w) + q.w) % q.w;
      var skew = Math.max(-6, Math.min(6, velocity * 0.12));
      q.el.style.transform =
        'translate3d(' + (-q.offset).toFixed(2) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
    }

    // Pila: cada item cae a su profundidad
    for (var p = 0; p < pileItems.length; p++) {
      var it = pileItems[p];
      var depth = parseFloat(it.dataset.depth);
      var rot = it.style.getPropertyValue('--rot');
      it.style.transform =
        'translate3d(0,' + (-y * depth * 0.08).toFixed(2) + 'px,0) rotate(' + rot + ')';
    }

    // Track horizontal
    if (track && track.rail) {
      // rect en vez de offsetTop: no depende de quien sea el offsetParent
      var rect = track.frame.getBoundingClientRect();
      var span = rect.height - track.vp.offsetHeight;
      var prog = span > 0 ? -rect.top / span : 0;
      prog = Math.max(0, Math.min(1, prog));
      var maxX = Math.max(0, track.rail.scrollWidth - window.innerWidth);
      track.rail.style.transform = 'translate3d(' + (-prog * maxX).toFixed(2) + 'px,0,0)';
      if (track.bar) track.bar.style.setProperty('--p', prog.toFixed(4));
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
    buildBlobs();
    buildPile();
    buildTrack();
    buildMarquees();
    observe();
    if (!reduce && !isExport) requestAnimationFrame(frame);
  }

  // Las fuentes cambian los anchos: medir despues de que carguen
  if (document.fonts && document.fonts.ready) {
    boot();
    document.fonts.ready.then(function () { buildMarquees(); });
  } else {
    boot();
  }

  // Al cambiar de idioma el texto se reescribe: hay que re-splitear y re-medir
  document.addEventListener('mutar:lang', function () {
    splitAll();
    buildMarquees();
    observe();
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildMarquees, 220);
  }, { passive: true });

  window.MUTAR = window.MUTAR || {};
  window.MUTAR.reduce = reduce;
  window.MUTAR.isExport = isExport;
})();

/* ==========================================================================
   MUTAR — Navegacion
   · Detecta el frame activo y le pasa su ground/accent al <body>
     (de ahi sale el cross-fade de color entre actos)
   · Rail lateral, contador, teclado, deep links
   · Modo export: ?print  ·  ?print=full  ·  ?frame=9
   ========================================================================== */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var body = document.body;
  // Dos listas, a proposito:
  // · frames  — lo que se numera. El contador y el deep link ?frame=n cuentan
  //             frames, no secciones; el interludio no tiene numero.
  // · steps   — lo que se recorre. Federico, 17/09: "si uno lo navega con la
  //             flecha se saltea cosas... debe ser lo mismo para no perderse
  //             nada sin importar con que lo este navegando". El interludio
  //             del carrete mide 240vh: saltarselo era saltearse una escena.
  var frames = [].slice.call(document.querySelectorAll('.frame'));
  var steps = [].slice.call(document.querySelectorAll('.frame, .interlude'));
  var railActs = [].slice.call(document.querySelectorAll('.rail__act'));
  var counterNow = document.querySelector('[data-counter-now]');
  var counterTotal = document.querySelector('[data-counter-total]');

  if (counterTotal) counterTotal.textContent = String(frames.length);

  /* ---- Modo export -------------------------------------------------------- */
  if (params.has('print')) {
    document.documentElement.classList.add('export-html');
    body.classList.add('export');
    if (params.get('print') === 'full') body.classList.add('export--full');
    // En export el ground lo pinta cada frame, no el body
    body.removeAttribute('data-ground');
    body.removeAttribute('data-accent');
    return;
  }

  /* ---- Frame activo ------------------------------------------------------- */
  var active = -1;

  function activate(i) {
    if (i === active || !frames[i]) return;
    active = i;
    var f = frames[i];

    body.dataset.ground = f.dataset.ground || 'bone';
    body.dataset.accent = f.dataset.accent || 'pink';

    if (counterNow) counterNow.textContent = String(i + 1).padStart(2, '0');

    // el track horizontal ocupa todo el ancho: el rail estorba
    body.classList.toggle('hide-rail', f.classList.contains('frame--track'));

    var act = f.dataset.act;
    railActs.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.act === act);
    });
  }

  // El frame activo es el que cubre el centro del viewport
  function pickActive() {
    var mid = window.innerHeight / 2;
    var best = -1, bestDist = Infinity;
    for (var i = 0; i < frames.length; i++) {
      var r = frames[i].getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var dist = Math.abs((r.top + r.bottom) / 2 - mid);
      // un frame que ya cubre el centro gana siempre
      if (r.top <= mid && r.bottom >= mid) { best = i; break; }
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    if (best > -1) activate(best);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!body.classList.contains('has-scrolled') && window.scrollY > 40) {
      body.classList.add('has-scrolled');
    }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { pickActive(); ticking = false; });
  }, { passive: true });

  window.addEventListener('resize', pickActive, { passive: true });

  /* ---- Ir a un paso ------------------------------------------------------- */
  function goTo(i) {
    var f = steps[Math.max(0, Math.min(steps.length - 1, i))];
    if (!f) return;
    var delta = f.getBoundingClientRect().top;
    // Animar un salto corto se siente bien; animar 19.000px es una espera.
    var far = Math.abs(delta) > window.innerHeight * 2.5;
    window.scrollTo({
      top: window.scrollY + delta,
      behavior: (far || (window.MUTAR && window.MUTAR.reduce)) ? 'auto' : 'smooth'
    });
  }

  /* ---- Rail --------------------------------------------------------------- */
  railActs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var act = btn.dataset.act;
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].dataset.act === act) { goTo(i); return; }
      }
    });
  });

  /* ---- Teclado ------------------------------------------------------------ */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    // el indice del teclado es el del PASO que se esta mirando, no el del
    // frame: si no, desde el interludio la flecha volveria al frame anterior
    var here = stepIndex();

    switch (e.key) {
      case 'ArrowDown': case 'PageDown':
        e.preventDefault(); goTo(here + 1); break;
      case 'ArrowUp': case 'PageUp':
        e.preventDefault(); goTo(here - 1); break;
      case ' ': case 'Spacebar':
        e.preventDefault(); goTo(e.shiftKey ? here - 1 : here + 1); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(steps.length - 1); break;
      case 'l': case 'L':
        if (window.MUTAR && window.MUTAR.toggleLang) window.MUTAR.toggleLang();
        break;
      case 'p': case 'P':
        location.search = '?print&lang=' + (window.MUTAR ? window.MUTAR.lang() : 'en');
        break;
    }
  });

  // Que paso esta ocupando el centro del viewport. Si ninguno lo cubre (entre
  // dos), gana el mas cercano — asi la flecha siempre avanza uno, nunca dos.
  function stepIndex() {
    var mid = window.innerHeight / 2;
    var best = 0, bestDist = Infinity;
    for (var i = 0; i < steps.length; i++) {
      var r = steps[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) return i;
      var dist = Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    return best;
  }

  /* ---- Deep link ?frame=n ------------------------------------------------- */
  var target = parseInt(params.get('frame'), 10);
  if (target > 0 && frames[target - 1]) {
    // sin smooth: el deep link tiene que aterrizar directo
    requestAnimationFrame(function () {
      frames[target - 1].scrollIntoView();
      pickActive();
    });
  }

  activate(0);
  pickActive();
})();

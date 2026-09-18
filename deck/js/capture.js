/* ==========================================================================
   MUTAR — Capturas del prototipo
   Monta el video de fondo de los frames marcados con [data-capture].

   · El markup lo genera este archivo: en el HTML solo queda el hueco y de
     donde sale la captura. Asi agregar una cuarta es una linea.
   · El .mp4 se pide recien cuando el frame esta por entrar (preload=none +
     src diferido): el deck sigue abriendo liviano.
   · Fuera de pantalla el video se pausa. Con reduced-motion o en export no
     hay video: va el poster .jpg y listo.
   · El timecode arranca en el minuto real de la captura original, asi que
     los tres numeros distintos son los tres momentos distintos del mismo
     registro.
   ========================================================================== */
(function () {
  'use strict';

  var boxes = [].slice.call(document.querySelectorAll('[data-capture]'));
  if (!boxes.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isExport = /(^|[?&])print(=|&|$)/.test(location.search);
  var still = reduce || isExport;
  // Algunos fondos son un still y punto: la portada y la tesis no piden un
  // loop, piden una imagen "que se sienta mas prototipada" (Federico, 17/09).
  var esStill = function (box) { return still || box.hasAttribute('data-capture-still'); };
  var FPS = 24;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // HH:MM:SS:FF — el formato de una captura, no el de un reproductor
  function timecode(sec) {
    var whole = Math.floor(sec);
    return pad(Math.floor(whole / 3600)) + ':' +
           pad(Math.floor(whole / 60) % 60) + ':' +
           pad(whole % 60) + ':' +
           pad(Math.floor((sec - whole) * FPS));
  }

  function lang() {
    return (window.MUTAR && window.MUTAR.lang && window.MUTAR.lang()) || 'en';
  }

  boxes.forEach(function (box) {
    var src = box.dataset.capture;                       // 'media/capture-espacio'
    var start = parseFloat(box.dataset.captureTc) || 0;  // segundo real en el master
    // Un fondo que no es captura (un render, por ejemplo) trae su archivo
    // entero en data-capture-img; las capturas siguen siendo ruta + .jpg/.mp4.
    var poster = box.dataset.captureImg || src + '.jpg';

    var media = esStill(box)
      ? '<img class="capture__media" src="' + poster + '" alt="">'
      : '<video class="capture__media" muted playsinline loop disablepictureinpicture ' +
        'preload="none" poster="' + poster + '" data-src="' + src + '.mp4"></video>';

    box.innerHTML =
      media +
      '<span class="capture__veil"></span>' +
      (box.hasAttribute('data-capture-img') ? '' : '<span class="capture__marks"><i></i><i></i><i></i><i></i></span>') +
      (esStill(box) ? '' : '<span class="capture__hud">' +
        '<span class="capture__rec"></span>' +
        '<span data-en="Headset capture · prototype" ' +
              'data-es="Captura del visor · prototipo"></span>' +
        '<span class="capture__tc">' + timecode(start) + '</span>' +
      '</span>');

    // i18n.js ya corrio: estos nodos nacen despues, se traducen a mano una vez.
    // Los cambios de idioma posteriores si los alcanzan (vuelve a consultar el DOM).
    var label = box.querySelector('[data-en]');
    if (label) label.textContent = label.dataset[lang()] || label.dataset.en;

    var video = box.querySelector('video');
    if (!video) { box.classList.add('is-live'); return; }

    var tc = box.querySelector('.capture__tc');
    video.addEventListener('timeupdate', function () {
      tc.textContent = timecode(start + video.currentTime);
    });
  });

  boxes = boxes.filter(function (b) { return !esStill(b); });
  if (!boxes.length || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-capture]').forEach(function (b) { b.classList.add('is-live'); });
    return;
  }

  // Dos observadores, porque son dos decisiones distintas.
  // 1 · Cargar: con un viewport de anticipacion, para que el frame nunca
  //     entre con el poster congelado.
  var loader = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var video = e.target.querySelector('video');
      if (video && !video.src) video.src = video.dataset.src;
      loader.unobserve(e.target);
    });
  }, { rootMargin: '100% 0px', threshold: 0 });

  // 2 · Reproducir: solo el frame que se esta mirando. Tres videos a la vez
  //     se notan en el scroll.
  var player = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var video = e.target.querySelector('video');
      if (!video) return;
      if (e.isIntersecting) {
        e.target.classList.add('is-live');
        if (!video.src) video.src = video.dataset.src;
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* autoplay bloqueado: queda el poster */ });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });

  boxes.forEach(function (b) { loader.observe(b); player.observe(b); });
}());

/* ==========================================================================
   MUTAR — i18n
   La copy vive en el HTML, en data-en / data-es. Sin build, sin fetch:
   el deck anda igual servido que abierto con file://.

   Para editar un texto: buscá el frame en index.html y cambiá el atributo.
   Para agregar un texto nuevo: poné data-en y data-es en el nodo y listo.
   ========================================================================== */
(function () {
  'use strict';

  var LANGS = ['en', 'es'];
  var KEY = 'mutar.lang';

  function preferred() {
    var q = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(q) > -1) return q;
    try {
      var saved = localStorage.getItem(KEY);
      if (LANGS.indexOf(saved) > -1) return saved;
    } catch (e) { /* file:// sin storage */ }
    return (navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  var current = preferred();

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;

    // Texto plano
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      el.textContent = el.dataset[lang];
    });
    // Markup (para nodos que llevan spans adentro)
    document.querySelectorAll('[data-' + lang + '-html]').forEach(function (el) {
      el.innerHTML = el.dataset[lang + 'Html'];
    });

    document.querySelectorAll('.lang button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });

    try { localStorage.setItem(KEY, lang); } catch (e) {}

    // motion.js escucha esto para re-splitear las palabras y re-medir marquees
    document.dispatchEvent(new CustomEvent('mutar:lang', { detail: { lang: lang } }));
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { apply(b.dataset.lang); });
  });

  window.MUTAR = window.MUTAR || {};
  window.MUTAR.lang = function () { return current; };
  window.MUTAR.setLang = apply;
  window.MUTAR.toggleLang = function () { apply(current === 'en' ? 'es' : 'en'); };

  apply(current);
})();

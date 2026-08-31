/* ==========================================================================
   MUTAR — Carrete 3D (interludio B)

   El argumento de la seccion es la acumulacion: no es que haya una cosa
   linda, es que hay tantas que ninguna importa. Antes se contaba con 192
   fotos que se alejaban. Ahora se cuenta con objetos escaneados —cosas en
   desuso— y una camara que retrocede hasta descubrir que el monton no
   termina nunca.

   Reglas de convivencia con el resto del deck:
   · No abre un rAF propio. motion.js tiene el loop unico y llama a tick().
   · No hay <script> de CDN: three va vendorizado en js/vendor/ y entra por
     un import() dinamico, recien cuando el interludio se acerca.
   · Si algo no esta (WebGL, file://, reduced-motion, modo export) la seccion
     cae a un poster estatico y sigue diciendo lo mismo. Nunca queda vacia.
   ========================================================================== */
(function () {
  'use strict';

  var stage = document.querySelector('.reel__stage');
  var canvas = document.querySelector('[data-scan]');
  if (!stage || !canvas) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var isExport = /(^|[?&])print(=|&|$)/.test(location.search);

  /* Cae al poster. Es un estado valido, no un error: el deck tiene que
     seguir funcionando abierto con doble clic desde el escritorio. */
  function fallback() {
    stage.classList.add('reel__stage--flat');
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  // file:// bloquea el import() dinamico y el fetch de los .glb por CORS.
  // Es esperado, no un bug: el deck se publica servido por HTTP.
  if (reduce || isExport || location.protocol === 'file:' || !hasWebGL()) {
    fallback();
    return;
  }

  /* ---- 1 · Ruido determinista --------------------------------------------
     Mismo criterio que el resto del deck (motion.js usa (i*7)%44 y (i*37)%9):
     el desorden se ve casual pero es el mismo en cada carga, asi que se
     puede componer el encuadre y confiar en que no se mueve.              */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- 2 · Geometria: del orden al desorden -------------------------------
     La seccion cuenta un viaje. Al entrar hay tres o cuatro cosas
     acomodadas —apoyadas, derechas, bien espaciadas, mirando a camara— y
     nada mas. A medida que la camara retrocede aparecen mas, cada vez menos
     prolijas, hasta que el fondo es puro amontonamiento.

     La clave es que el orden NO es funcion del tiempo sino de la
     PROFUNDIDAD. Nada se anima ni se reacomoda: las cosas de adelante estan
     acomodadas y las del fondo tiradas, siempre. Al alejarse, uno viaja del
     orden al desorden. Eso deja las 900 matrices fijas —se calculan una vez
     y no se tocan mas— y el efecto sale gratis.

     Lo que revela el desorden es la niebla, que se abre con la camara (ver
     tick()). Al principio tapa todo lo que esta a mas de ~20 metros, asi
     que la apertura se lee limpia aunque atras ya haya cientos de cosas. */

  var FAR_Z = -70;       // el fondo del campo
  var BACK_Z = 24;       // relleno detras del punto de partida de la camara
  var CHAOS_Z = -9;      // donde arranca el campo procedural
  var ORDER_SPAN = 34;   // en cuantos metros se termina de perder el orden
  var MOUND = 3.6;       // altura de la loma en el centro
  var LANE = 3.2;        // paso de la grilla en la zona ordenada
  var COUNT = isTouch ? 600 : 900;
  var BACK_SHARE = 0.28; // que porcion va detras del arranque

  /* La apertura, puesta a mano. Son las unicas cosas que se ven al entrar,
     asi que no se dejan al azar: un sillon, un reloj de pie que ancla el
     centro, una tele y un pupitre mas atras. Apoyados, derechos, separados.
     Los indices son la posicion en models/manifest.json.                  */
  var OPENING = [
    { model: 0,  x: -1.95, z: -0.4, yaw: 0.12 },   // sillon victoriano
    { model: 17, x: 0.62,  z: -4.2, yaw: -0.05 },  // reloj de pie
    { model: 10, x: 2.30,  z: -1.5, yaw: -0.18 },  // tv de madera
    { model: 5,  x: -1.70, z: -7.6, yaw: 0.07 },   // pupitre
  ];

  function place(rnd, i, n) {
    var nBack = Math.round(n * BACK_SHARE);

    if (i < nBack) {
      // Relleno detras del arranque: invisible al entrar (queda a espaldas
      // de la camara) y es lo que llena el primer plano cuando la camara ya
      // retrocedio treinta metros. Sin esto el final queda hueco abajo.
      var bz = BACK_Z - (i / Math.max(1, nBack)) * (BACK_Z - 7);
      var bHalf = 9 + (BACK_Z - bz) * 0.5;
      var bx = (rnd() * 2 - 1) * bHalf;
      var bFall = Math.exp(-(bx * bx) / (2 * Math.pow(bHalf * 0.78, 2)));
      return {
        x: bx,
        y: Math.pow(rnd(), 3.0) * MOUND * bFall - 0.12,
        z: bz,
        order: 0,
      };
    }

    // Exponente bajo: pocas cosas cerca, muchisimas lejos. Es lo que hace
    // que la apertura respire y que el fondo sea una pared de cosas.
    var t = Math.pow((i - nBack + rnd() * 0.9) / (n - nBack), 0.45);
    var z = CHAOS_Z - t * (CHAOS_Z - FAR_Z);

    // 1 pegado a la apertura, 0 pasados los ORDER_SPAN metros. Al cuadrado
    // para que el orden se pierda rapido: la prolijidad tiene que ser la
    // excepcion, no la mitad del campo.
    var order = Math.max(0, Math.min(1, (z - (CHAOS_Z - ORDER_SPAN)) / ORDER_SPAN));
    order *= order;

    // La cuna se abre con la distancia para que el monton siga saliendo por
    // los costados del cuadro cuando la camara ya retrocedio.
    var halfW = 9 + (BACK_Z - z) * 0.5;
    var free = (rnd() * 2 - 1) * halfW;
    // En la zona ordenada las cosas caen en carriles regulares; en el fondo,
    // donde libran, quedan donde caen.
    var x = free * (1 - order) + Math.round(free / LANE) * LANE * order;

    // Meseta, no pico: una loma alta en el centro le taparia el fondo a una
    // camara baja, y el fondo es justamente lo que hay que mostrar.
    var falloff = Math.exp(-(x * x) / (2 * Math.pow(halfW * 0.78, 2)));
    // Exponente alto: la gran mayoria queda apoyada y solo unos pocos trepan
    // encima de otros. Lo ordenado apoya siempre, sin excepcion.
    var y = (Math.pow(rnd(), 3.0) * MOUND * falloff - 0.12) * (1 - order);

    return { x: x, y: y, z: z, order: order };
  }

  /* ---- 3 · Escena ---------------------------------------------------------- */
  var THREE = null, renderer = null, scene = null, camera = null, group = null;
  var ready = false, loading = false, visible = false;
  var sway = 0, dpr = 1;

  function groundColor() {
    var v = getComputedStyle(document.body).getPropertyValue('--ground').trim();
    return v || '#0d0c0b';
  }

  // El FOV de three es vertical. En un celular en vertical eso deja ver una
  // tajada angosta del monton en vez del monton. Se compensa abriendo la
  // vertical cuando la pantalla es mas angosta que 16:9, con tope para que
  // no se deforme en perspectiva.
  var FOV = 50;
  var REF_ASPECT = 16 / 9;

  function fovFor(aspect) {
    var boost = Math.min(2, REF_ASPECT / Math.max(aspect, 0.3));
    var half = Math.atan(Math.tan((FOV * Math.PI) / 360) * Math.sqrt(boost));
    return Math.min(78, (half * 360) / Math.PI);
  }

  function resize() {
    if (!renderer) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = fovFor(camera.aspect);
    camera.updateProjectionMatrix();
  }

  function build(T, models) {
    THREE = T;
    dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1 : 1.5);

    renderer = new T.WebGLRenderer({
      canvas: canvas,
      alpha: true,            // el --ground del deck se ve detras
      antialias: false,       // las siluetas facetadas son parte del look
      powerPreference: 'low-power'
    });
    renderer.setClearAlpha(0);

    scene = new T.Scene();
    // Sin luces a proposito: los materiales vienen marcados como unlit, con
    // la foto del escaneo horneada. Iluminarlos otra vez los ensucia.
    scene.fog = new T.Fog(new T.Color(groundColor()), 8, 70);

    camera = new T.PerspectiveCamera(FOV, 1, 0.1, 320);
    group = new T.Group();
    scene.add(group);

    /* Un GLB puede traer varias piezas (mesh + su transform local). Para
       instanciar hay que aplanar eso: una InstancedMesh por pieza, y la
       matriz local de la pieza premultiplicada en cada instancia.        */
    var parts = [];
    models.forEach(function (m, mi) {
      m.gltf.scene.updateMatrixWorld(true);
      m.gltf.scene.traverse(function (node) {
        if (!node.isMesh) return;
        var mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(function (mat) {
          mat.fog = true;
          mat.side = T.FrontSide;
        });
        parts.push({
          model: mi,
          geometry: node.geometry,
          material: node.material,
          local: node.matrixWorld.clone(),
          seat: m.seat
        });
      });
    });
    if (!parts.length) throw new Error('los glb no traen mallas');

    // Reparto: cada slot elige objeto con un paso coprimo, asi entran todos
    // antes de que se repita ninguno.
    var slots = [];
    var rnd = mulberry32(0x5CA4);

    // Primero la apertura, tal cual esta escrita: derecha, apoyada y a
    // escala uno. Es lo unico del campo que no toca el azar.
    OPENING.forEach(function (o) {
      slots.push({
        model: o.model % models.length,
        x: o.x, y: 0, z: o.z,
        scale: 1,
        yaw: o.yaw,
        tiltX: 0, tiltZ: 0,
      });
    });

    for (var i = 0; i < COUNT; i++) {
      var p = place(rnd, i, COUNT);
      p.model = (i * 7) % models.length;

      var chaosYaw = rnd() * Math.PI * 2;
      // El yaw ordenado es el mismo yaw redondeado al cuarto de vuelta mas
      // cercano, asi que interpolar entre los dos nunca da un giro largo:
      // como mucho hay un octavo de vuelta de diferencia.
      var tidyYaw = Math.round(chaosYaw / (Math.PI / 2)) * (Math.PI / 2);

      p.scale = (0.85 + rnd() * 0.75) * (1 - p.order) + 1 * p.order;
      p.yaw = chaosYaw * (1 - p.order) + tidyYaw * p.order;
      // Tirado, no acomodado. Lo ordenado queda perfectamente derecho.
      p.tiltX = (rnd() * 2 - 1) * 0.22 * (1 - p.order);
      p.tiltZ = (rnd() * 2 - 1) * 0.22 * (1 - p.order);
      slots.push(p);
    }

    var m4 = new T.Matrix4();
    var mPlace = new T.Matrix4();
    var q = new T.Quaternion();
    var e = new T.Euler();
    var pos = new T.Vector3();
    var scl = new T.Vector3();

    parts.forEach(function (part) {
      var mine = slots.filter(function (s) { return s.model === part.model; });
      if (!mine.length) return;
      var im = new T.InstancedMesh(part.geometry, part.material, mine.length);
      im.frustumCulled = false;   // el bounding de la geometria base no cubre el campo
      mine.forEach(function (s, k) {
        e.set(s.tiltX, s.yaw, s.tiltZ);
        q.setFromEuler(e);
        scl.set(s.scale, s.scale, s.scale);
        // seat sale del manifest: cuanto hay que corregir en Y para que el
        // objeto apoye en el piso en vez de quedar hundido o flotando.
        pos.set(s.x, s.y - part.seat * s.scale, s.z);
        mPlace.compose(pos, q, scl);
        m4.multiplyMatrices(mPlace, part.local);
        im.setMatrixAt(k, m4);
      });
      im.instanceMatrix.needsUpdate = true;
      group.add(im);
    });

    resize();
    ready = true;
  }

  /* ---- 4 · Carga diferida ---------------------------------------------------
     Nada de esto se pide hasta que el interludio esta cerca. Las primeras
     frames del deck no pagan ni un byte de los dos megas de modelos.      */
  function load() {
    if (loading) return;
    loading = true;

    import('./vendor/three-bundle.js').then(function (T) {
      return fetch('models/manifest.json')
        .then(function (r) {
          if (!r.ok) throw new Error('manifest ' + r.status);
          return r.json();
        })
        .then(function (manifest) {
          var loader = new T.GLTFLoader();
          return Promise.all(manifest.objects.map(function (o) {
            return new Promise(function (res, rej) {
              loader.load('models/' + o.file, function (gltf) {
                res({ gltf: gltf, seat: (o.min && o.min[1]) || 0 });
              }, undefined, rej);
            });
          }));
        })
        .then(function (models) { build(T, models); });
    })['catch'](function (err) {
      // Un fallo aca no puede llevarse puesta la seccion.
      if (window.console) console.warn('[mutar] carrete 3D no disponible:', err && err.message);
      fallback();
    });
  }

  var near = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) { near.disconnect(); load(); return; }
    }
  }, { rootMargin: '120% 0px' });
  near.observe(stage);

  // Solo se dibuja mientras la seccion se ve. Fuera de cuadro, cero GPU.
  var onScreen = new IntersectionObserver(function (entries) {
    visible = entries.some(function (e) { return e.isIntersecting; });
  }, { rootMargin: '10% 0px' });
  onScreen.observe(stage);

  /* ---- 5 · Tick -------------------------------------------------------------
     rp es el mismo 0..1 que antes movia la grilla de fotos. Lo que era
     scale 1.9 -> 0.55 ahora es una camara que retrocede y sube.          */
  // La camara no se va lejos y arriba: se va lejos y CASI al ras. Rasante
  // es lo que hace que el monton llegue al horizonte en vez de leerse como
  // una isla flotando en el medio del cuadro.
  var Z0 = 3.6, Z1 = 30, Y0 = 1.45, Y1 = 5.0, L0 = 0.55, L1 = 1.4;

  function tick(rp, velocity) {
    if (!ready || !visible) return;

    // Arranca rapido y afloja: el descubrimiento tiene que pasar temprano.
    var e = 1 - Math.pow(1 - rp, 1.7);

    camera.position.set(0, Y0 + (Y1 - Y0) * e, Z0 + (Z1 - Z0) * e);
    camera.lookAt(0, L0 + (L1 - L0) * e, -10 - e * 36);
    // El roll que antes hacia rotate(-1deg -> 1deg) sobre la grilla
    camera.rotation.z = (rp * 2 - 1) * 0.016;

    // La niebla es la que cuenta el descubrimiento. Al entrar corta a los
    // ~24 metros: atras ya hay cientos de cosas, pero no se ven, y la
    // apertura se lee como tres o cuatro objetos solos. Despues se abre y
    // el amontonamiento aparece. Sin esto habria que mover objetos.
    scene.fog.near = 9 + e * 23;
    scene.fog.far = 24 + e * 92;

    // Un cabeceo minimo con la velocidad de scroll. Es lo unico que se mueve
    // ademas de la camara: rotar 440 instancias por frame no vale la pena.
    sway += ((velocity || 0) * 0.00022 - sway) * 0.08;
    group.rotation.y = sway;

    renderer.render(scene, camera);
  }

  function refreshFog() {
    if (scene) scene.fog.color.set(groundColor());
  }

  // El deck cruza de ground en ground segun la frame activa (nav.js). La
  // niebla tiene que acompanar o el horizonte queda de otro color.
  if (window.MutationObserver) {
    new MutationObserver(refreshFog).observe(document.body, {
      attributes: true, attributeFilter: ['data-ground']
    });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  }, { passive: true });

  void THREE;
  window.MUTAR = window.MUTAR || {};
  window.MUTAR.scan = { tick: tick };
})();

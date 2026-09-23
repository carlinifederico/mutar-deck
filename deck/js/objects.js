/* ==========================================================================
   MUTAR — Objetos reales en 3D
   Los mismos modelos que se cargan en el prototipo (Tripo3D -> Gravity
   Sketch), comprimidos para la web por tools/build-real.mjs.

   Dos lugares los usan, con el mismo codigo:
   · Frame 12 · la estanteria: siete objetos, se elige uno de la lista y se
     gira arrastrando.
   · Frame 21 · el visor: la propuesta abierta en la grilla, girando, para que
     se entienda como se mira online antes de votarla. Esa no es un GLB: se
     arma con primitivas desde la silueta de la tile (ver buildSculpture).

   Mismas reglas que el carrete (scan.js): three vendorizado y cargado recien
   cuando el frame se acerca, nada de luces (materiales unlit), y un poster
   que queda si no hay WebGL, en file://, con reduced-motion o en export.
   ========================================================================== */
(function () {
  'use strict';

  var boxes = [].slice.call(document.querySelectorAll('[data-visor]'));
  if (!boxes.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isExport = /(^|[?&])print(=|&|$)/.test(location.search);

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (reduce || isExport || location.protocol === 'file:' || !hasWebGL()) return;

  function lang() {
    return (window.MUTAR && window.MUTAR.lang && window.MUTAR.lang()) || 'en';
  }

  /* ---- Carga compartida: three y el manifest se piden una sola vez ------- */
  var base = null;
  function loadBase() {
    if (base) return base;
    base = import('./vendor/three-bundle.js').then(function (T) {
      return fetch('models/real/manifest.json')
        .then(function (r) { if (!r.ok) throw new Error('manifest ' + r.status); return r.json(); })
        .then(function (m) {
          var byId = {};
          m.objects.forEach(function (o) { byId[o.id] = o; });
          return { T: T, byId: byId, loader: new T.GLTFLoader(), cache: {} };
        });
    });
    return base;
  }

  // Un objeto se normaliza al cargarse: centrado en el origen, apoyado en y=0
  // y escalado para que su lado mas largo mida 1. Asi el contrabajo y la
  // radio entran igual de bien en el mismo encuadre.
  function getModel(b, id) {
    if (b.cache[id]) return b.cache[id];
    var o = b.byId[id];
    b.cache[id] = new Promise(function (res, rej) {
      if (!o) { rej(new Error('sin ' + id)); return; }
      b.loader.load('models/real/' + o.file, function (gltf) {
        var T = b.T;
        var root = gltf.scene;
        root.traverse(function (n) {
          if (n.isMesh) {
            [].concat(n.material).forEach(function (m) { m.side = T.DoubleSide; });
          }
        });
        res(normalize(T, root));
      }, undefined, rej);
    });
    return b.cache[id];
  }

  function normalize(T, root) {
    var box = new T.Box3().setFromObject(root);
    var size = new T.Vector3(); box.getSize(size);
    var center = new T.Vector3(); box.getCenter(center);
    var s = 1 / Math.max(size.x, size.y, size.z, 1e-6);
    root.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    root.scale.setScalar(s);
    var holder = new T.Group();
    holder.add(root);
    holder.userData.h = size.y * s;
    return holder;
  }

  /* ---- Frame 21 · cada propuesta, armada en 3D ---------------------------
     23/09: "aca no cambia la siluetita del objeto que orbita". Hay un solo
     escaneo de escultura, asi que cada propuesta se arma con las mismas cinco
     piezas y el mismo apilado que su silueta (motion.js las guarda en
     MUTAR.sculpture). De frente coincide con la tile; al girar tiene volumen. */
  var COLOR = { bar: 0xff2e88, box: 0xc8f000, disc: 0xffe500, ring: 0x2e9bff, wedge: 0xff5b1f };

  function buildSculpture(b, i) {
    var key = 'tile:' + i;
    if (b.cache[key]) return b.cache[key];
    var T = b.T;
    var meta = window.MUTAR && window.MUTAR.sculpture && window.MUTAR.sculpture(i);
    if (!meta || !meta.parts) return Promise.reject(new Error('sin propuesta ' + i));
    var root = new T.Group();
    var edge = new T.LineBasicMaterial({ color: 0x0d0c0b });

    meta.parts.forEach(function (p, k) {
      var geo, w = p.w, h = p.h, r = h / 1.7;
      switch (p.t) {
        case 'bar':  geo = new T.BoxGeometry(w, h / 2, Math.max(w * 0.3, h / 2)); break;
        case 'box':  geo = new T.BoxGeometry(w / 1.3, h, w / 1.3 * 0.75); break;
        case 'disc': geo = new T.CylinderGeometry(r, r, r * 0.7, 36); geo.rotateX(Math.PI / 2); break;
        case 'ring': geo = new T.TorusGeometry(r, h / 8, 12, 40); break;
        default: {
          // la cuna: el mismo triangulo del dibujo, extruido
          var s = new T.Shape();
          s.moveTo(-w / 2.4, -h / 2); s.lineTo(w / 2.4, -h / 2); s.lineTo(0, h / 1.6); s.closePath();
          var dz = w * 0.35;
          geo = new T.ExtrudeGeometry(s, { depth: dz, bevelEnabled: false });
          geo.translate(0, 0, -dz / 2);
        }
      }
      var mesh = new T.Mesh(geo, new T.MeshBasicMaterial({ color: COLOR[p.t] || 0xf2efe9 }));
      mesh.add(new T.LineSegments(new T.EdgesGeometry(geo, 40), edge));
      // el dibujo tiene y hacia abajo y rota en sentido horario
      mesh.position.set(p.x - 50, 86 - p.y, ((k * 37) % 7 - 3) * 1.4);
      mesh.rotation.z = -p.rot * Math.PI / 180;
      root.add(mesh);
    });

    // la base: la misma linea de piso de la tile, hecha zocalo
    var plinth = new T.Mesh(new T.CylinderGeometry(20, 20, 1.6, 48), new T.MeshBasicMaterial({ color: 0x0d0c0b }));
    plinth.position.y = -0.8;
    root.add(plinth);

    b.cache[key] = Promise.resolve(normalize(T, root));
    return b.cache[key];
  }

  function init(box) {
    var stage = box.querySelector('[data-visor-stage]') || box;
    var tiles = box.dataset.visor === 'tiles';
    var ids = box.dataset.visor.split(',');
    var picks = [].slice.call(box.querySelectorAll('[data-visor-pick]'));
    var label = box.querySelector('[data-visor-label]');
    var frame = box.closest('.frame') || document;
    if (tiles) {
      // arranca con la tile que ya esta abierta (motion.js corre antes)
      var open = frame.querySelector('.tile.is-open');
      ids = [open ? open.dataset.i : '1'];
    }

    loadBase().then(function (b) {
      var T = b.T;
      var canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      stage.appendChild(canvas);

      var renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      var scene = new T.Scene();
      var camera = new T.PerspectiveCamera(30, 1, 0.01, 50);
      var pivot = new T.Group();
      scene.add(pivot);

      var current = null, currentId = null;
      var yaw = -0.5, pitch = 0.18, vel = 0.004, drag = false, lx = 0, ly = 0, idle = 0;
      var visible = false;

      function frameCamera(h) {
        // el objeto mide 1 de lado; se encuadra con un poco de aire
        var d = 2.35;
        camera.position.set(0, h * 0.5 + d * Math.sin(pitch), d * Math.cos(pitch));
        camera.lookAt(0, h * 0.5, 0);
      }

      function resize() {
        var w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      function show(id) {
        if (id === currentId) return;
        currentId = id;
        picks.forEach(function (p) { p.classList.toggle('is-active', p.dataset.visorPick === id); });
        var o = b.byId[id];
        if (label && o) label.textContent = o[lang()] || o.en;
        (tiles ? buildSculpture(b, parseInt(id, 10)) : getModel(b, id)).then(function (holder) {
          if (currentId !== id) return;
          if (current) pivot.remove(current);
          // cada propuesta nueva entra de frente, igual que su silueta
          if (tiles) { yaw = 0; idle = 0; }
          current = holder;
          pivot.add(holder);
          frameCamera(holder.userData.h || 1);
          box.classList.add('is-3d');
        }, function (err) {
          if (window.console) console.warn('[mutar] objeto 3D no disponible:', err && err.message);
        });
      }

      picks.forEach(function (p) {
        p.addEventListener('click', function () { show(p.dataset.visorPick); });
        p.addEventListener('pointerenter', function () { show(p.dataset.visorPick); });
      });
      if (tiles) frame.addEventListener('mutar:tile', function (e) { show(String(e.detail.i)); });
      document.addEventListener('mutar:lang', function () {
        var o = b.byId[currentId];
        if (label && o) label.textContent = o[lang()] || o.en;
      });

      canvas.addEventListener('pointerdown', function (e) {
        drag = true; lx = e.clientX; ly = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dx = e.clientX - lx, dy = e.clientY - ly;
        lx = e.clientX; ly = e.clientY;
        yaw += dx * 0.012;
        vel = dx * 0.0012;
        pitch = Math.max(-0.1, Math.min(0.75, pitch + dy * 0.006));
        if (current) frameCamera(current.userData.h || 1);
        idle = 0;
      });
      function release(e) {
        drag = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      canvas.addEventListener('pointerup', release);
      canvas.addEventListener('pointercancel', release);

      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(stage);
      if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
      resize();
      show(ids[0]);

      (function loop() {
        requestAnimationFrame(loop);
        if (!visible || !current) return;
        if (!drag) {
          // despues de soltar, la inercia vuelve de a poco al giro lento
          idle++;
          vel += ((idle > 90 ? 0.004 : vel) - vel) * 0.04;
          yaw += vel;
        }
        pivot.rotation.y = yaw;
        renderer.render(scene, camera);
      })();
    })['catch'](function (err) {
      if (window.console) console.warn('[mutar] visor 3D no disponible:', err && err.message);
    });
  }

  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      near.unobserve(e.target);
      init(e.target);
    });
  }, { rootMargin: '100% 0px' });
  boxes.forEach(function (b) { near.observe(b); });
})();

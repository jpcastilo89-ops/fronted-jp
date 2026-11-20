/* ZETA · Portada «The Essential Collection»: cambio de color con línea de luz, entrada y parallax suave.
   Fotos: si config.js trae una foto del modelo por cada color (campana.modelo), se usa el modelo.
   Si falta alguna, se muestra la foto real de la franela sobre el fondo de estudio. */
(function () {
  var sec = document.getElementById("portada");
  if (!sec) return;
  var Z = window.ZETA || {}, P = Z.producto || {}, C = Z.campana || {};
  var COLORES = P.colores || [];
  var zeta = window.Zeta, reducir = zeta.reducir;
  var $ = function (id) { return document.getElementById(id); };
  var base = $("pBase"), espalda = $("pEspalda"), giro = $("pGiro"), nueva = $("pNueva"), escaneo = $("pEscaneo"), nota = $("pNota");
  var nombre = $("pColorNombre"), ver = $("pVer"), puntos = $("pPuntos");

  var modelo = (C.modelo || []).filter(Boolean).length === COLORES.length && COLORES.length > 0;
  if (modelo) {
    sec.classList.add("con-modelo");
    if (C.encuadreMovil) sec.style.setProperty("--encuadre-movil", C.encuadreMovil);
  }
  if (modelo) { base.removeAttribute("srcset"); base.src = C.modelo[0]; }
  if (P.precio) $("pPrecio").textContent = P.precio;

  function fuentes(k) {
    if (modelo) return { src: C.modelo[k], srcset: "" };
    var g = zeta.foto(k, "g"), z = zeta.foto(k, "z");
    return { src: g, srcset: g + " 800w, " + z + " 1200w" };
  }
  function fuentesEspalda(k) { return { src: zeta.foto(k, "e"), srcset: "" }; }
  function poner(img, k, f) {
    f = f || fuentes(k);
    if (f.srcset) img.srcset = f.srcset; else img.removeAttribute("srcset");
    img.src = f.src;
  }
  function textoAlt(k) {
    var n = COLORES[k].nombre.toLowerCase();
    if (modelo) return "Modelo con la franela oversized ZETA en " + n;
    return "Franela oversized ZETA en " + n + (COLORES[k].nombre === "Negro" ? ", fotografía real" : ", imagen de referencia");
  }
  function textoNota(k) {
    if (modelo) return "";
    var gira = " Desliza para girarla.";
    return COLORES[k].nombre === "Negro" ? "Fotografía real de la franela negra." + gira :
      "Referencia de color: el tono puede variar." + gira;
  }

  // ---------- Selectores de color ----------
  var actual = 0;
  COLORES.forEach(function (c, k) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "portada__punto";
    b.style.setProperty("--c", c.hex);
    b.setAttribute("aria-label", c.nombre);
    b.setAttribute("aria-pressed", k === 0 ? "true" : "false");
    b.addEventListener("click", function () { cambiar(k); });
    puntos.appendChild(b);
  });
  var botones = puntos.querySelectorAll("button");
  puntos.addEventListener("keydown", function (e) {
    var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    var k = (actual + d + COLORES.length) % COLORES.length;
    cambiar(k); botones[k].focus();
  });

  function marcar(k) {
    var c = COLORES[k];
    botones.forEach(function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
    nombre.textContent = c.nombre;
    ver.textContent = "Ver la franela en " + c.nombre.toLowerCase();
    ver.href = "productos.html?color=" + k;
    nota.textContent = textoNota(k);
    base.alt = textoAlt(k);
  }

  // ---------- Cambio de color: una línea de luz baja y descubre la nueva prenda ----------
  var DURA = 850, animando = null, pedido = 0;
  function cambiar(k) {
    if (k === actual) return;
    actual = k; marcar(k);
    if (!modelo) pintarGiro(false);
    var mio = ++pedido;
    var atras = !modelo && deEspaldas();
    if (reducir || !nueva.animate) { ponerCaras(k); return; }
    var pre = new Image(), f = atras ? fuentesEspalda(k) : fuentes(k);
    if (f.srcset) { pre.srcset = f.srcset; pre.sizes = base.sizes; }
    pre.src = f.src;
    var listo = function () {
      if (mio !== pedido) return;
      if (animando) animando.forEach(function (a) { a.cancel(); });
      poner(nueva, k, f);
      var ease = "cubic-bezier(.65,0,.35,1)";
      var a1 = nueva.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], { duration: DURA, easing: ease, fill: "forwards" });
      var a2 = escaneo.animate([
        { top: "0%", opacity: 0 }, { top: "6%", opacity: 1, offset: .08 },
        { top: "94%", opacity: 1, offset: .9 }, { top: "100%", opacity: 0 }], { duration: DURA, easing: ease });
      animando = [a1, a2];
      a1.onfinish = function () {
        ponerCaras(k);
        var fin = function () { if (mio === pedido) { a1.cancel(); nueva.removeAttribute("src"); nueva.removeAttribute("srcset"); } animando = null; };
        var cara = atras ? espalda : base;
        cara.decode ? cara.decode().then(fin, fin) : fin();
      };
    };
    pre.decode ? pre.decode().then(listo, listo) : (pre.onload = pre.onerror = listo);
  }

  // Si una foto no carga, se ve la franela dibujada en ese color
  base.addEventListener("error", function () { if (!modelo) zeta.falloImg(base, actual); });

  // Las demás fotos se piden cuando la página ya cargó (cambio instantáneo después)
  window.addEventListener("load", function () {
    setTimeout(function () { COLORES.forEach(function (c, k) { if (k) { var i = new Image(); var f = fuentes(k); if (f.srcset) { i.srcset = f.srcset; i.sizes = base.sizes; } i.src = f.src; } }); }, 1500);
  });

  // ---------- Entrada (una vez) y parallax muy suave del fondo ----------
  var intro = !document.documentElement.classList.contains("sin-intro");
  setTimeout(function () { sec.classList.add("ya"); }, intro ? 1250 : 40);

  var fondo = $("pFondo");
  if (!reducir && fondo) {
    var px = 0, py = 0, sy = 0, pend = false;
    var mover = function () {
      pend = false;
      fondo.style.transform = "translate3d(" + px.toFixed(1) + "px," + (py + sy).toFixed(1) + "px,0)";
    };
    var pedir = function () { if (!pend) { pend = true; requestAnimationFrame(mover); } };
    window.addEventListener("scroll", function () {
      var y = window.scrollY; if (y > innerHeight * 1.2) return;
      sy = y * 0.12; pedir();
    }, { passive: true });
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      sec.addEventListener("pointermove", function (e) {
        px = (e.clientX / innerWidth - .5) * -10; py = (e.clientY / innerHeight - .5) * -6; pedir();
      });
    }
  }

  // ---------- Girar la franela (arrastrando o con el botón) ----------
  // Con fotos 360 del color (campana.giro360): se pasa de foto en foto según el ángulo.
  // Sin ellas: la franela gira en 3D entre las fotos reales de frente y espalda.
  var G = C.giro360 || [], ang = 0, arrastre = null, recien = false, btnGirar = $("pGirar");
  function cuadros(k) { var f = G[k] || []; return f.length >= 8 ? f : null; }
  function deEspaldas() { var m = ((ang % 360) + 360) % 360; return m > 90 && m < 270; }
  function ponerCaras(k) {
    var q = cuadros(k);
    if (q) { base.removeAttribute("srcset"); base.src = q[indice(q)]; return; }
    poner(base, k); espalda.src = zeta.foto(k, "e");
  }
  function indice(q) { var n = q.length; return ((Math.round(ang / (360 / n)) % n) + n) % n; }
  function pintarGiro(suave) {
    var q = cuadros(actual);
    sec.classList.toggle("giro-fotos", !!q);
    if (q) { giro.style.transform = ""; var src = q[indice(q)]; if (base.getAttribute("src") !== src) { base.removeAttribute("srcset"); base.src = src; } }
    else {
      giro.style.transition = suave && !reducir ? "transform .8s cubic-bezier(.65,0,.35,1)" : "none";
      giro.style.transform = "rotateY(" + ang.toFixed(1) + "deg)";
    }
    var atras = deEspaldas();
    btnGirar.setAttribute("aria-pressed", atras ? "true" : "false");
    btnGirar.querySelector("span").textContent = q ? "Girar 360°" : (atras ? "Ver frente" : "Ver espalda");
    espalda.alt = atras ? "Espalda de la franela oversized ZETA en " + COLORES[actual].nombre.toLowerCase() : "";
  }
  if (modelo) { btnGirar.hidden = true; }
  else {
    btnGirar.addEventListener("click", function () {
      ang = cuadros(actual) ? ang + 360 / cuadros(actual).length : Math.round(ang / 180) * 180 + 180;
      pintarGiro(true);
    });
    giro.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      arrastre = { x: e.clientX, a: ang, movio: false, id: e.pointerId };
    });
    giro.addEventListener("pointermove", function (e) {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var dx = e.clientX - arrastre.x;
      if (!arrastre.movio && Math.abs(dx) > 6) { arrastre.movio = true; sec.classList.add("girando"); try { giro.setPointerCapture(e.pointerId); } catch (er) {} }
      if (arrastre.movio) { ang = arrastre.a + dx * 0.6; pintarGiro(false); }
    });
    var soltar = function () {
      if (!arrastre) return;
      if (arrastre.movio) {
        recien = true; setTimeout(function () { recien = false; }, 50);
        if (!cuadros(actual)) { ang = Math.round(ang / 180) * 180; pintarGiro(true); }
      }
      sec.classList.remove("girando"); arrastre = null;
    };
    giro.addEventListener("pointerup", soltar);
    giro.addEventListener("pointercancel", soltar);
    // Tocar (sin arrastrar) abre la ficha de ese color
    giro.addEventListener("click", function () { if (!recien) location.href = ver.href; });
  }

  marcar(0);
  if (!modelo) { if (cuadros(0)) ponerCaras(0); pintarGiro(false); }
})();

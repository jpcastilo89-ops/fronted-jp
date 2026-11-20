(function () {
  var Z = window.ZETA || {};
  var P = Z.producto || {};
  var COLORES = P.colores || [];
  var TALLAS = P.tallas || ["S", "M", "L"];
  var N = COLORES.length;

  var enlaceWhatsApp = window.Zeta.enlaceWhatsApp;
  if (!document.getElementById("arco")) return;

  var estado = { color: 0, talla: TALLAS.indexOf("M") >= 0 ? "M" : TALLAS[0] };

  function mensajePedido() {
    var c = COLORES[estado.color];
    return "Hola ZETA, vengo de la web. Quiero la " + (P.nombre || "franela").toLowerCase() +
      (c ? " en color " + c.nombre.toLowerCase() : "") + ", talla " + estado.talla + ". ¿Está disponible?";
  }
  function actualizarWa() {
    var m = mensajePedido();
    document.querySelectorAll("[data-wa], [data-wa-pedido]").forEach(function (a) { a.href = enlaceWhatsApp(m); });
  }

  if (!N) { actualizarWa(); return; }

  // ---------- Preferencias del equipo ----------
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var raton = window.matchMedia("(pointer: fine)").matches;
  var esMovil = function () { return window.innerWidth < 768; };

  // ---------- Elementos ----------
  var arco = document.getElementById("arco");
  var escenario = document.getElementById("escenario");
  var fondo = document.querySelector(".fondo");
  var fantasma = document.querySelector(".fantasma");
  var letras = fantasma ? fantasma.querySelectorAll("span") : [];
  var mCur = document.getElementById("mCur");
  var mNext = document.getElementById("mNext");
  var rejilla = document.getElementById("rejilla");
  var escaneo = document.getElementById("escaneo");
  var mini = document.getElementById("mini");
  var pNombre = document.getElementById("pNombre");
  var pColor = document.getElementById("pColor");
  var cajaTallas = document.getElementById("tallas");
  var cajaPuntos = document.getElementById("puntos");
  var cursor = document.getElementById("cursor");

  // ---------- Fotos de las franelas (con respaldo: si una imagen falla, se ve la franela dibujada) ----------
  var RUTA_FOTOS = "img/franelas/";
  var grandes = [];
  function vestir(svg, k, tam) {
    if (!svg) return;
    var im = svg.querySelector("image");
    if (!im) {
      im = document.createElementNS("http://www.w3.org/2000/svg", "image");
      im.setAttribute("width", "400"); im.setAttribute("height", "420");
      im.addEventListener("load", function () { svg.classList.add("con-foto"); });
      im.addEventListener("error", function () { svg.classList.remove("con-foto"); im.removeAttribute("href"); });
      svg.appendChild(im);
    }
    im.setAttribute("href", RUTA_FOTOS + tam + "-" + k + ".webp");
  }
  // Espera (como mucho 0,7 s) a que la foto grande esté lista antes de escanear
  function cuandoLista(k, fn) {
    var g = grandes[k];
    if (!g) { g = grandes[k] = new Image(); g.src = RUTA_FOTOS + "g-" + k + ".webp"; }
    if (g.complete) return fn();
    var hecho = false;
    function ya() { if (!hecho) { hecho = true; fn(); } }
    g.addEventListener("load", ya); g.addEventListener("error", ya); setTimeout(ya, 700);
  }
  window.addEventListener("load", function () {
    setTimeout(function () { COLORES.forEach(function (c, k) { cuandoLista(k, function () {}); }); }, 1200);
  });

  pNombre.textContent = P.nombre || "Franela";

  // ---------- Tarjetas: dos vueltas de colores para que el arco no tenga fin ----------
  var TOTAL = N * 2, MITAD = N;
  var tarjetas = [];
  for (var i = 0; i < TOTAL; i++) {
    var c = COLORES[i % N];
    var t = document.createElement("button");
    t.type = "button";
    t.className = "tarjeta vidrio";
    t.setAttribute("aria-label", "Probar color " + c.nombre);
    t.innerHTML = '<svg viewBox="0 0 400 420" style="color:' + c.hex + '"><use href="#franela"/></svg>' +
      '<span class="tarjeta__nombre">' + c.nombre + '</span><span class="tarjeta__brillo"></span>';
    t.dataset.i = i;
    t.addEventListener("pointerenter", function () {
      if (reducir) return;
      var el = this; el.classList.remove("brilla"); void el.offsetWidth; el.classList.add("brilla");
    });
    vestir(t.querySelector("svg"), i % N, "t");
    arco.appendChild(t);
    tarjetas.push({ el: t, semilla: Math.random() * 6.28, visible: true });
  }

  // ---------- Tallas y puntos de color ----------
  TALLAS.forEach(function (tl) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "talla"; b.textContent = tl;
    b.setAttribute("aria-pressed", tl === estado.talla ? "true" : "false");
    b.addEventListener("click", function () {
      estado.talla = tl;
      cajaTallas.querySelectorAll(".talla").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      actualizarWa();
    });
    cajaTallas.appendChild(b);
  });
  COLORES.forEach(function (c, k) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "punto";
    b.style.background = c.hex;
    b.setAttribute("aria-label", c.nombre);
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { irAColor(k); });
    cajaPuntos.appendChild(b);
  });

  // ---------- Medidas ----------
  var W, H, CW, XS;
  var XS_PC = [0, .215, .345, .432, .49, .52, .54];
  var XS_MOVIL = [0, .36, .5, .56, .6, .62, .63];
  function medir() {
    W = window.innerWidth; H = window.innerHeight;
    CW = esMovil() ? Math.min(W * .3, 140) : Math.min(W * .14, H * .26);
    document.documentElement.style.setProperty("--CW", CW + "px");
    XS = (esMovil() ? XS_MOVIL : XS_PC).map(function (v) { return v * W; });
    despertar();
  }
  function xEn(a) {
    var i = Math.floor(a);
    if (i >= XS.length - 1) return XS[XS.length - 1];
    return XS[i] + (XS[i + 1] - XS[i]) * (a - i);
  }
  function mod(a, n) { return ((a % n) + n) % n; }

  // ---------- Estado del arco ----------
  var pos = 0, objetivo = 0, intro = reducir ? 1 : 0, mostrado = -1;
  var arrastrando = false;
  var px = 0, py = 0, sx = 0, sy = 0; // puntero suavizado
  var corriendo = false;

  function cuadro(ts) {
    var tiempo = ts / 1000;
    if (!arrastrando) pos += reducir ? (objetivo - pos) : (objetivo - pos) * .11;
    if (intro < 1) intro = Math.min(1, intro + .012);
    var ie = 1 - Math.pow(1 - intro, 3);
    sx += (px - sx) * .06; sy += (py - sy) * .06;
    var flotar = !reducir && !esMovil();

    for (var i = 0; i < TOTAL; i++) {
      var u = mod(i - pos + MITAD, TOTAL) - MITAD;
      var a = Math.abs(u), sg = u < 0 ? -1 : 1;
      var x = sg * xEn(a) * ie;
      var s, z, op, ry, desenfoque = 0;
      if (a < 1) { s = .55 + .45 * a; z = -260 * (1 - a); op = a; ry = -sg * 16 * a; }
      else {
        s = 1 / (1 + .3 * Math.pow(a - 1, 1.15)); z = -110 * (a - 1); op = 1;
        ry = -sg * (16 + 9 * Math.min(2, a - 1));
        if (!esMovil()) desenfoque = Math.max(0, a - 1.6) * 2.4;
      }
      if (a > 3.4) op = Math.max(0, 1 - (a - 3.4) / .8);
      op *= ie;
      var bob = flotar ? Math.sin(tiempo * 1.1 + tarjetas[i].semilla) * H * .006 * Math.min(1, a) : 0;
      var y = bob - (1 - s) * H * .04;
      ry += sx * 10;
      var el = tarjetas[i].el;
      if (op < .01) {
        if (tarjetas[i].visible) { el.style.visibility = "hidden"; tarjetas[i].visible = false; }
        continue;
      }
      if (!tarjetas[i].visible) { el.style.visibility = ""; tarjetas[i].visible = true; }
      el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) perspective(1300px) translateZ(" + z.toFixed(1) +
        "px) rotateY(" + ry.toFixed(2) + "deg) rotateX(" + (-sy * 6).toFixed(2) + "deg) scale(" + (s * (.6 + .4 * ie)).toFixed(3) + ")";
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = a < 1 ? 1 : Math.round(100 - 10 * a);
      el.style.filter = desenfoque > .05 ? "blur(" + desenfoque.toFixed(1) + "px)" : "";
      el.tabIndex = a < .5 ? 0 : -1;
    }

    if (raton && !esMovil()) {
      fondo.style.transform = "translate3d(" + (-sx * 22) + "px," + (-sy * 14) + "px,0)";
      fantasma.style.transform = "translate(calc(-50% - " + (sx * 40) + "px)," + (-sy * 16) + "px)";
    }
    for (var l = 0; l < letras.length; l++) letras[l].style.transform = "translateY(" + ((1 - ie) * (60 + 30 * l)).toFixed(1) + "px)";

    // Al detenerse en un color, "probarlo"
    if (!arrastrando && Math.abs(objetivo - pos) < .02) {
      var k = mod(Math.round(objetivo), N);
      if (k !== mostrado) probar(k);
    }

    // En móvil (o sin movimiento) paramos el bucle cuando todo está quieto, para ahorrar batería
    var quieto = !arrastrando && intro >= 1 && Math.abs(objetivo - pos) < .001 &&
      Math.abs(px - sx) < .002 && Math.abs(py - sy) < .002 && !flotar;
    if (quieto) { pos = objetivo; corriendo = false; return; }
    requestAnimationFrame(cuadro);
  }
  function despertar() { if (!corriendo) { corriendo = true; requestAnimationFrame(cuadro); } }

  // ---------- Probar color: línea de escaneo ----------
  var animaciones = [];
  var EASE_ESCANEO = "cubic-bezier(.65,0,.35,1)";
  function probar(k) {
    mostrado = k;
    estado.color = k;
    var c = COLORES[k];
    actualizarPedido(c);
    actualizarWa();
    animaciones.forEach(function (an) { an.cancel(); });
    animaciones = [];
    mNext.style.color = c.hex;
    vestir(mNext, k, "g");
    var foto = document.getElementById("fotoProducto");
    if (foto) foto.style.color = c.hex;

    if (reducir || !mNext.animate) {
      mCur.style.color = c.hex; vestir(mCur, k, "g"); mCur.style.visibility = "visible";
      return;
    }
    cuandoLista(k, function () { if (mostrado === k) escanear(c, k); });
  }
  function escanear(c, k) {
    var revelar = mNext.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], { duration: 950, easing: EASE_ESCANEO, fill: "forwards" });
    animaciones.push(revelar);
    animaciones.push(rejilla.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)", offset: .5 }, { clipPath: "inset(100% 0 0 0)" }], { duration: 1092, easing: EASE_ESCANEO }));
    animaciones.push(escaneo.animate([
      { top: "0%", transform: "scaleX(.2)", opacity: 0 },
      { top: "6%", transform: "scaleX(1)", opacity: 1, offset: .08 },
      { top: "94%", transform: "scaleX(1)", opacity: 1, offset: .92 },
      { top: "100%", transform: "scaleX(.2)", opacity: 0 }
    ], { duration: 950, easing: EASE_ESCANEO }));
    animaciones.push(mNext.animate([{ transform: "scale(1.012)" }, { transform: "scale(1)" }], { duration: 1250, easing: "ease-out" }));
    revelar.onfinish = function () {
      mCur.style.color = c.hex; vestir(mCur, k, "g"); mCur.style.visibility = "visible";
      animaciones.forEach(function (an) { an.cancel(); });
      animaciones = [];
    };
  }

  // ---------- Tarjeta de pedido ----------
  function rodar(el, texto) {
    if (el.textContent === texto) return;
    if (reducir || !el.animate) { el.textContent = texto; return; }
    var caja = el.parentNode;
    var nuevo = el.cloneNode(false);
    nuevo.removeAttribute("id"); nuevo.textContent = texto; nuevo.className = "entra";
    caja.appendChild(nuevo);
    var op = { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)" };
    el.animate([{ transform: "translateY(0)" }, { transform: "translateY(-110%)" }], op);
    nuevo.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0)" }], op).onfinish = function () {
      el.textContent = texto; nuevo.remove();
    };
  }
  function actualizarPedido(c) {
    rodar(pColor, "Color · " + c.nombre + (P.material && !esMovil() ? " · " + P.material : ""));
    mini.style.color = c.hex;
    vestir(mini, COLORES.indexOf(c), "t");
    if (!reducir && mini.animate) mini.animate([{ transform: "translateY(70%) scale(.8)" }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" });
    cajaPuntos.querySelectorAll(".punto").forEach(function (b, k) { b.setAttribute("aria-pressed", k === estado.color ? "true" : "false"); });
  }

  function irAColor(k) {
    var actual = Math.round(objetivo);
    var d = mod(k - actual, N);
    if (d > N / 2) d -= N;
    objetivo = actual + d;
    despertar();
  }
  window.ZetaProbador = { irAColor: function (k) { irAColor(k); if (window.scrollTo) window.scrollTo({ top: 0, behavior: window.Zeta.reducir ? "auto" : "smooth" }); } };
  function paso(n) { objetivo = Math.round(objetivo) + n; despertar(); }

  // ---------- Controles ----------
  document.getElementById("ant").addEventListener("click", function () { paso(-1); });
  document.getElementById("sig").addEventListener("click", function () { paso(1); });
  window.addEventListener("keydown", function (e) {
    var abierta = document.getElementById("lista"), menuAb = document.getElementById("menu");
    if ((abierta && !abierta.hidden) || (menuAb && !menuAb.hidden)) return;
    if (e.key === "ArrowLeft") paso(-1);
    else if (e.key === "ArrowRight") paso(1);
  });

  var inicioX = 0, inicioY = 0, pos0 = 0, ultimoX = 0, ultimoT = 0, vel = 0, movido = 0, tocando = false, idToque = null;
  escenario.addEventListener("pointerdown", function (e) {
    tocando = true; idToque = e.pointerId;
    inicioX = ultimoX = e.clientX; inicioY = e.clientY; ultimoT = performance.now();
    pos0 = pos; vel = 0; movido = 0;
    if (cursor) cursor.classList.add("abajo");
  });
  window.addEventListener("pointermove", function (e) {
    if (raton) {
      px = e.clientX / window.innerWidth - .5; py = e.clientY / window.innerHeight - .5;
      moverCursor(e);
      despertar();
    }
    if (!tocando || e.pointerId !== idToque) return;
    var dx = e.clientX - inicioX, dy = e.clientY - inicioY;
    movido = Math.max(movido, Math.abs(dx));
    if (!arrastrando && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      arrastrando = true;
      try { escenario.setPointerCapture(e.pointerId); } catch (err) {}
    }
    if (arrastrando) {
      pos = pos0 - dx / XS[1];
      var ahora = performance.now();
      var dt = Math.max(1, ahora - ultimoT);
      vel = vel * .6 + ((e.clientX - ultimoX) / dt) * .4;
      ultimoX = e.clientX; ultimoT = ahora;
      despertar();
    }
  });
  function soltar(e) {
    if (!tocando) return;
    tocando = false;
    if (cursor) cursor.classList.remove("abajo");
    if (arrastrando) {
      arrastrando = false;
      var impulso = Math.max(-2.5, Math.min(2.5, vel));
      objetivo = Math.round(pos - impulso * 3.2);
      despertar();
    } else if (movido < 6) {
      var t = e.target.closest && e.target.closest(".tarjeta");
      if (t) {
        var i = +t.dataset.i;
        var u = mod(i - pos + MITAD, TOTAL) - MITAD;
        objetivo = Math.round(pos + u);
        despertar();
      }
    }
  }
  window.addEventListener("pointerup", soltar);
  window.addEventListener("pointercancel", function () { tocando = false; if (arrastrando) { arrastrando = false; objetivo = Math.round(pos); despertar(); } });
  arco.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { /* la tarjeta del centro ya es el color elegido */ }
  });

  var acumulado = 0, ultimoGiro = 0;
  escenario.addEventListener("wheel", function (e) {
    var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
    acumulado += d;
    var ahora = performance.now();
    if (Math.abs(acumulado) > 60 && ahora - ultimoGiro > 260) {
      paso(acumulado > 0 ? 1 : -1); acumulado = 0; ultimoGiro = ahora;
    }
  }, { passive: false });

  // ---------- Cursor de vidrio ----------
  var cx = -100, cy = -100, tx = -100, ty = -100, cursorVivo = false;
  function moverCursor(e) {
    if (!cursor || esMovil()) return;
    tx = e.clientX; ty = e.clientY;
    var t = e.target;
    var modo = "";
    if (t.closest && t.closest(".tarjeta")) modo = "probar";
    else if (t.closest && t.closest("button, a")) modo = "boton";
    else if (t.closest && t.closest(".escenario")) modo = "arrastra";
    if (arrastrando) modo = "arrastra";
    var fuera = !(t.closest && t.closest(".probador")) && !arrastrando;
    cursor.className = "cursor" + (modo ? " " + modo : "") + (tocando ? " abajo" : "") + (fuera ? " fuera" : "");
    if (!cursorVivo) { cursorVivo = true; cx = tx; cy = ty; requestAnimationFrame(seguir); }
  }
  function seguir() {
    cx += (tx - cx) * .22; cy += (ty - cy) * .22;
    cursor.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
    if (Math.abs(tx - cx) > .3 || Math.abs(ty - cy) > .3) requestAnimationFrame(seguir);
    else cursorVivo = false;
  }

  // ---------- Añadir a Mi pedido ----------
  document.getElementById("anadir").addEventListener("click", function () {
    window.Zeta.anadir(estado.color, estado.talla, 1);
    window.Zeta.avisar("Añadida: " + COLORES[estado.color].nombre + " · Talla " + estado.talla);
  });

  // Permite que otras páginas abran el probador en un color: probador.html#color=3
  var m = /color=(\d+)/.exec(location.hash);
  if (m && COLORES[+m[1]]) { pos = objetivo = +m[1]; }

  window.addEventListener("resize", medir);
  medir();
  actualizarWa();
})();

/* ZETA · Ficha de la franela: color con escaneo, giro frente/espalda, lupa y compra */
(function () {
  if (!document.getElementById("fGaleria")) return;
  var Z = window.ZETA || {}, P = Z.producto || {};
  var COLORES = P.colores || [], TALLAS = P.tallas || ["S", "M", "L"];
  var N = COLORES.length, zeta = window.Zeta, reducir = zeta.reducir;
  var nombre = P.nombre || "Franela";
  var $ = function (id) { return document.getElementById(id); };

  var m = /color=(\d+)/.exec(location.search + location.hash);
  var estado = { color: m && COLORES[+m[1]] ? +m[1] : 0, talla: TALLAS.indexOf("M") >= 0 ? "M" : TALLAS[0], atras: false };

  var giro = $("fGiro"), frente = $("fFrente"), espalda = $("fEspalda"), nuevo = $("fNuevo"), linea = $("fLinea");
  var lupa = $("fLupa"), zona = $("lupa-zona");

  // ---------- Selectores ----------
  COLORES.forEach(function (c, k) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "punto"; b.style.background = c.hex; b.title = c.nombre;
    b.setAttribute("aria-label", "Color " + c.nombre);
    b.addEventListener("click", function () { cambiarColor(k); });
    $("fColores").appendChild(b);
  });
  TALLAS.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "talla"; b.textContent = t;
    b.addEventListener("click", function () { estado.talla = t; pintar(); });
    $("fTallas").appendChild(b);
  });

  function mensaje() {
    var c = COLORES[estado.color];
    return "Hola ZETA, vengo de la web. Quiero la " + nombre.toLowerCase() + " en color " + c.nombre.toLowerCase() +
      ", talla " + estado.talla + ". ¿Está disponible?";
  }
  function pintar() {
    var c = COLORES[estado.color];
    $("fColorNombre").textContent = c.nombre;
    $("fMiga").textContent = c.nombre;
    document.title = nombre + " " + c.nombre.toLowerCase() + " · ZETA";
    $("fColores").querySelectorAll(".punto").forEach(function (b, k) { b.setAttribute("aria-pressed", k === estado.color ? "true" : "false"); });
    $("fTallas").querySelectorAll(".talla").forEach(function (b) { b.setAttribute("aria-pressed", b.textContent === estado.talla ? "true" : "false"); });
    $("fWa").href = zeta.enlaceWhatsApp(mensaje());
    $("fAnterior").href = "productos.html?color=" + ((estado.color - 1 + N) % N);
    $("fSiguiente").href = "productos.html?color=" + ((estado.color + 1) % N);
    $("fAnterior").textContent = "← " + COLORES[(estado.color - 1 + N) % N].nombre;
    $("fSiguiente").textContent = COLORES[(estado.color + 1) % N].nombre + " →";
  }
  function detalles(k) {
    $("fCuello").src = zeta.foto(k, "d-cuello");
    $("fEspalda2").src = zeta.foto(k, "e");
    var nota = $("fNotaFoto");
    if (nota) nota.textContent = COLORES[k].nombre === "Negro" ? "Fotografía real de la franela negra." :
      "Imagen de referencia hecha con la foto real de la franela negra. El tono real del " + COLORES[k].nombre.toLowerCase() + " puede variar un poco.";
    lupa.style.backgroundImage = "url(" + zeta.foto(k, "z") + ")";
  }

  // ---------- Cambio de color con escaneo (firma de ZETA) ----------
  var animando = null;
  function cambiarColor(k, sinAnim) {
    if (k === estado.color && !sinAnim) return;
    estado.color = k;
    pintar();
    try { history.replaceState(null, "", "productos.html?color=" + k); } catch (e) {}
    var cara = estado.atras ? "e" : "g";
    var src = zeta.foto(k, cara);
    function final() {
      frente.src = zeta.foto(k, "g"); espalda.src = zeta.foto(k, "e");
      nuevo.style.clipPath = "inset(0 0 100% 0)";
      detalles(k);
    }
    if (sinAnim || reducir || !nuevo.animate) { final(); return; }
    if (animando) animando.forEach(function (a) { a.cancel(); });
    var img = new Image();
    img.onload = img.onerror = function () {
      if (estado.color !== k) return;
      nuevo.src = src;
      var a1 = nuevo.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 900, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" });
      var a2 = linea.animate([{ top: "0%", opacity: 0 }, { top: "4%", opacity: 1, offset: .06 }, { top: "96%", opacity: 1, offset: .94 }, { top: "100%", opacity: 0 }], { duration: 900, easing: "cubic-bezier(.65,0,.35,1)" });
      animando = [a1, a2];
      a1.onfinish = function () { final(); a1.cancel(); animando = null; };
    };
    img.src = src;
  }

  // ---------- Girar: frente / espalda ----------
  $("fGirar").addEventListener("click", function () {
    estado.atras = !estado.atras;
    giro.classList.toggle("atras", estado.atras);
    this.setAttribute("aria-pressed", estado.atras ? "true" : "false");
    this.querySelector("span").textContent = estado.atras ? "Ver frente" : "Ver espalda";
    $("fVistaTxt").textContent = estado.atras ? "Espalda" : "Frente";
  });

  // ---------- Lupa (ratón) y visor de cerca (táctil) ----------
  var fino = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fino) {
    zona.addEventListener("pointermove", function (e) {
      if (estado.atras) { lupa.classList.remove("ver"); return; }
      var r = frente.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) { lupa.classList.remove("ver"); return; }
      var zr = zona.getBoundingClientRect();
      lupa.style.left = (e.clientX - zr.left) + "px"; lupa.style.top = (e.clientY - zr.top) + "px";
      var W = r.width * 2.6, H = r.height * 2.6;
      lupa.style.backgroundSize = W + "px " + H + "px";
      lupa.style.backgroundPosition = (110 - x * W) + "px " + (110 - y * H) + "px";
      lupa.classList.add("ver");
    });
    zona.addEventListener("pointerleave", function () { lupa.classList.remove("ver"); });
  }
  var visor = $("fVisor");
  function abrirVisor() {
    $("fVisorImg").src = zeta.foto(estado.color, estado.atras ? "e" : "z");
    visor.hidden = false;
    visor.scrollLeft = (visor.scrollWidth - visor.clientWidth) / 2;
    visor.scrollTop = (visor.scrollHeight - visor.clientHeight) / 4;
    $("fVisorCerrar").focus();
  }
  $("fCerca").addEventListener("click", abrirVisor);
  $("fVisorCerrar").addEventListener("click", function () { visor.hidden = true; $("fCerca").focus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !visor.hidden) visor.hidden = true; });

  // ---------- Galería deslizable en móvil: puntos ----------
  var gal = $("fGaleria"), puntos = $("fPuntos");
  var vistas = gal.querySelectorAll(".vista");
  vistas.forEach(function () { puntos.appendChild(document.createElement("span")); });
  function marcar() {
    var i = Math.round(gal.scrollLeft / Math.max(1, gal.clientWidth));
    puntos.querySelectorAll("span").forEach(function (s, j) { s.classList.toggle("activo", j === i); });
  }
  gal.addEventListener("scroll", function () { requestAnimationFrame(marcar); }, { passive: true });
  marcar();

  // ---------- Comprar ----------
  $("fAnadir").addEventListener("click", function () {
    zeta.anadir(estado.color, estado.talla, 1);
    zeta.avisar("Añadida: " + COLORES[estado.color].nombre.toLowerCase() + ", talla " + estado.talla);
  });
  $("fGuiaBoton").addEventListener("click", function () {
    var g = $("guia"); g.open = true; g.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "center" });
  });
  if (location.hash === "#guia") $("guia").open = true;
  if (location.hash === "#lupa") setTimeout(function () { fino ? zona.scrollIntoView({ block: "center" }) : abrirVisor(); }, 400);

  cambiarColor(estado.color, true);
})();

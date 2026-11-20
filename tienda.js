/* ZETA · Tienda, tira de colores, capítulos de campaña y "Arma tu pack" */
(function () {
  var Z = window.ZETA || {}, P = Z.producto || {};
  var COLORES = P.colores || [], TALLAS = P.tallas || ["S", "M", "L"];
  var nombreProd = P.nombre || "Franela";
  var zeta = window.Zeta;
  var tallaInicial = TALLAS.indexOf("M") >= 0 ? "M" : TALLAS[0];
  var precioTxt = P.precio ? P.precio : "Precio próximamente";
  function num(k) { return (k + 1 < 10 ? "0" : "") + (k + 1); }
  function ficha(k) { return "productos.html?color=" + k; }

  function botonesTalla(caja, inicial, alCambiar) {
    TALLAS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "talla"; b.textContent = t;
      b.setAttribute("aria-pressed", t === inicial ? "true" : "false");
      b.addEventListener("click", function () {
        caja.querySelectorAll(".talla").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        alCambiar(t);
      });
      caja.appendChild(b);
    });
  }

  // ---------- Tienda ----------
  var grid = document.getElementById("catalogoGrid");
  if (grid) {
    COLORES.forEach(function (c, k) {
      var talla = tallaInicial;
      var li = document.createElement("li");
      li.className = "prod";
      li.setAttribute("data-aparece", "");
      li.innerHTML =
        '<a class="prod__img" href="' + ficha(k) + '">' +
          zeta.imgFranela(k, "t", "oversized " + c.nombre, 'class="prod__frente" width="280" height="294"') +
          zeta.imgFranela(k, "te", "", 'class="prod__espalda" width="280" height="294"') +
          '<span class="prod__etq" aria-hidden="true">' + num(k) + '</span></a>' +
        '<div class="prod__info"><a class="prod__nombre" href="' + ficha(k) + '">' + nombreProd + '</a>' +
          '<span class="prod__precio">' + precioTxt + '</span></div>' +
        '<p class="prod__color">' + c.nombre + ', algodón 220 gr</p>' +
        '<div class="prod__rapido"><div class="tallas" role="group" aria-label="Talla ' + c.nombre + '"></div>' +
          '<button type="button" class="prod__mas" aria-label="Añadir ' + c.nombre + ' a mi pedido">+ Añadir</button></div>';
      botonesTalla(li.querySelector(".tallas"), talla, function (t) { talla = t; });
      li.querySelector(".prod__mas").addEventListener("click", function () {
        zeta.anadir(k, talla, 1);
        zeta.avisar("Añadida: " + c.nombre.toLowerCase() + ", talla " + talla);
      });
      grid.appendChild(li);
    });
    var cuenta = document.getElementById("tiendaCuenta");
    if (cuenta) cuenta.textContent = nombreProd + " en " + COLORES.length + " colores";
    // Vista de columnas (se recuerda en el teléfono)
    var botones = document.querySelectorAll(".vista-botones button");
    var movil = matchMedia("(max-width: 899px)");
    function ponerCols(n) {
      grid.style.setProperty("--cols", n);
      botones.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-cols") == n ? "true" : "false"); });
      try { localStorage.setItem("zeta-cols-" + (movil.matches ? "m" : "o"), n); } catch (e) {}
    }
    botones.forEach(function (b) {
      var esMovil = b.classList.contains("solo-movil"), esOrd = b.classList.contains("solo-ordenador");
      b.hidden = (esMovil && !movil.matches) || (esOrd && movil.matches);
      b.addEventListener("click", function () { ponerCols(+b.getAttribute("data-cols")); });
    });
    var guardado = null;
    try { guardado = localStorage.getItem("zeta-cols-" + (movil.matches ? "m" : "o")); } catch (e) {}
    ponerCols(guardado ? +guardado : (movil.matches ? 2 : 3));
  }

  // ---------- Tira de colores (inicio) ----------
  var tira = document.getElementById("coloresTira");
  if (tira) {
    COLORES.forEach(function (c, k) {
      var a = document.createElement("a");
      a.className = "color-tarj"; a.href = ficha(k);
      a.setAttribute("data-aparece", "");
      a.style.transitionDelay = (k * 60) + "ms";
      a.innerHTML = '<span class="color-tarj__img" style="--c:' + c.hex + '">' +
        zeta.imgFranela(k, "t", c.nombre, 'width="280" height="294"') + '<span class="color-tarj__num">' + num(k) + '</span></span>' +
        '<span class="color-tarj__pie"><b>' + c.nombre + '</b><span>Ver</span></span>';
      tira.appendChild(a);
    });
  }

  // ---------- Capítulos de campaña ----------
  var caps = document.getElementById("capitulos");
  if (caps) {
    COLORES.forEach(function (c, k) {
      var s = document.createElement("section");
      s.className = "capitulo";
      s.setAttribute("aria-label", "Color " + c.nombre);
      s.innerHTML = '<div class="capitulo__img" style="--c:' + c.hex + '" data-aparece="img">' +
          zeta.imgFranela(k, k % 2 ? "e" : "g", c.nombre, 'width="800" height="840"') + '</div>' +
        '<div style="display:grid;gap:18px">' +
          '<p class="capitulo__num" data-aparece>Capítulo ' + num(k) + ' / ' + num(COLORES.length - 1) + '</p>' +
          '<p class="capitulo__nombre" data-aparece>' + c.nombre + '</p>' +
          '<p class="texto suave" data-aparece>' + (k % 2 ? "Vista de espalda. " : "Vista de frente. ") + (P.material || "") + '</p>' +
          '<div data-aparece><a class="enlace" href="' + ficha(k) + '">Ver en ' + c.nombre.toLowerCase() + '</a></div>' +
        '</div>';
      caps.appendChild(s);
    });
  }

  // ---------- Arma tu pack ----------
  var huecos = document.getElementById("packHuecos");
  if (huecos) {
    var TAM = 3, pack = [], tallaPack = tallaInicial;
    var escena = document.getElementById("packEscena");
    var vacio = document.getElementById("packVacio");
    var cuentaPack = document.getElementById("packCuenta");
    var resumen = document.getElementById("packResumen");
    var cajaColores = document.getElementById("packColores");
    var btnAnadir = document.getElementById("packAnadir");
    var btnWa = document.getElementById("packWa");
    var ultimo = -1;

    function nombreDe(k) { return COLORES[k].nombre.toLowerCase(); }
    function listaColores() {
      var n = pack.map(nombreDe);
      return n.length > 1 ? n.slice(0, -1).join(", ") + " y " + n[n.length - 1] : n.join("");
    }
    function pintar() {
      huecos.innerHTML = "";
      for (var i = 0; i < TAM; i++) {
        var k = pack[i];
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hueco" + (k === undefined ? " hueco--vacio" : "");
        if (k === undefined) {
          b.innerHTML = '<span class="hueco__num">0' + (i + 1) + '</span><span class="hueco__txt">Elige un color</span>';
          b.disabled = true;
        } else {
          b.innerHTML = '<span class="hueco__num">0' + (i + 1) + '</span>' + zeta.imgFranela(k, "t", COLORES[k].nombre) +
            '<span class="hueco__txt">' + COLORES[k].nombre + '</span><span class="hueco__quitar" aria-hidden="true">×</span>';
          b.setAttribute("aria-label", "Quitar " + COLORES[k].nombre + " del pack");
          (function (idx) { b.addEventListener("click", function () { pack.splice(idx, 1); ultimo = -1; pintar(); }); })(i);
        }
        huecos.appendChild(b);
      }
      // Escena: las franelas del pack en abanico
      escena.querySelectorAll("img, svg").forEach(function (n) { n.remove(); });
      pack.forEach(function (k, i) {
        escena.insertAdjacentHTML("beforeend", zeta.imgFranela(k, "g", COLORES[k].nombre, 'width="800" height="840"' + (i === ultimo ? ' class="entra"' : '')));
      });
      vacio.hidden = pack.length > 0;
      var lleno = pack.length === TAM;
      cuentaPack.textContent = pack.length + " de " + TAM;
      resumen.textContent = pack.length ? "Pack de " + pack.length + " · " + listaColores() + " · talla " + tallaPack + (lleno ? "" : " · faltan " + (TAM - pack.length)) : "";
      btnAnadir.disabled = !lleno;
      btnWa.setAttribute("aria-disabled", lleno ? "false" : "true");
      btnWa.href = lleno ? zeta.enlaceWhatsApp("Hola ZETA, vengo de la web. Quiero armar un pack de " + TAM + " " +
        nombreProd.toLowerCase().replace("franela", "franelas") + " talla " + tallaPack + ": " + listaColores() +
        ". ¿Me confirman disponibilidad y precio?") : "#";
    }
    function poner(k) {
      if (pack.length >= TAM) { zeta.avisar("Tu pack ya tiene " + TAM + ". Toca una para cambiarla."); return; }
      pack.push(k); ultimo = pack.length - 1; pintar();
    }
    COLORES.forEach(function (c, k) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "punto"; b.style.background = c.hex;
      b.setAttribute("aria-label", "Añadir " + c.nombre + " al pack");
      b.title = c.nombre;
      b.addEventListener("click", function () { poner(k); });
      cajaColores.appendChild(b);
    });
    // Combinaciones sugeridas (solo colores; no son ofertas)
    function idx(nombre) { for (var i = 0; i < COLORES.length; i++) if (COLORES[i].nombre.toLowerCase() === nombre) return i; return -1; }
    var SUGERIDOS = [["Básicos", ["negro", "blanco", "gris"]], ["Color", ["verde", "rojo", "azul"]], ["Noche", ["negro", "azul", "gris"]]];
    var cajaSug = document.getElementById("packSugeridos");
    SUGERIDOS.forEach(function (s) {
      var ks = s[1].map(idx).filter(function (k) { return k >= 0; });
      if (ks.length !== TAM) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "sugerido";
      b.innerHTML = '<i>' + ks.map(function (k) { return '<b style="background:' + COLORES[k].hex + '"></b>'; }).join("") + '</i>' + s[0];
      b.setAttribute("aria-label", "Pack " + s[0] + ": " + s[1].join(", "));
      b.addEventListener("click", function () { pack = ks.slice(); ultimo = -1; pintar(); zeta.avisar("Pack " + s[0] + " listo"); });
      cajaSug.appendChild(b);
    });
    botonesTalla(document.getElementById("packTallas"), tallaPack, function (t) { tallaPack = t; pintar(); });
    btnAnadir.addEventListener("click", function () {
      pack.forEach(function (k) { zeta.anadir(k, tallaPack, 1); });
      zeta.avisar("Pack añadido: " + TAM + " franelas talla " + tallaPack);
      pack = []; ultimo = -1; pintar();
    });
    pintar();
  }
})();

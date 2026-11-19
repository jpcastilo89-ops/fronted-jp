/* ZETA · Catálogo con añadir rápido y "Arma tu pack" */
(function () {
  var Z = window.ZETA || {}, P = Z.producto || {};
  var COLORES = P.colores || [], TALLAS = P.tallas || ["S", "M", "L"];
  var nombreProd = P.nombre || "Franela";
  var zeta = window.Zeta;
  var tallaInicial = TALLAS.indexOf("M") >= 0 ? "M" : TALLAS[0];
  var paginaProbador = document.getElementById("arco") ? "" : "index.html";

  function franela(hex) { return '<svg viewBox="0 0 400 420" style="color:' + hex + '" aria-hidden="true"><use href="#franela"/></svg>'; }

  // ---------- Catálogo ----------
  var grid = document.getElementById("catalogoGrid");
  if (grid) {
    COLORES.forEach(function (c, k) {
      var talla = tallaInicial;
      var li = document.createElement("li");
      li.className = "ficha";
      li.innerHTML =
        '<div class="ficha__img">' + franela(c.hex) + '</div>' +
        '<div class="ficha__cuerpo">' +
          '<h3 class="ficha__nombre">' + nombreProd + '</h3>' +
          '<p class="ficha__color">' + c.nombre + ' · Algodón 220 gr</p>' +
          '<div class="tallas" role="group" aria-label="Talla"></div>' +
          '<div class="ficha__botones">' +
            '<button type="button" class="boton boton--peq">+ Añadir</button>' +
            '<a class="ficha__probar" href="' + paginaProbador + '#color=' + k + '">Probar</a>' +
          '</div>' +
        '</div>';
      var caja = li.querySelector(".tallas");
      TALLAS.forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "talla"; b.textContent = t;
        b.setAttribute("aria-pressed", t === talla ? "true" : "false");
        b.addEventListener("click", function () {
          talla = t;
          caja.querySelectorAll(".talla").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        });
        caja.appendChild(b);
      });
      li.querySelector(".boton").addEventListener("click", function () {
        zeta.anadir(k, talla, 1);
        zeta.avisar("Añadida: " + c.nombre + " · Talla " + talla);
      });
      var probar = li.querySelector(".ficha__probar");
      probar.addEventListener("click", function (e) {
        if (!paginaProbador && window.ZetaProbador) { e.preventDefault(); window.ZetaProbador.irAColor(k); }
      });
      grid.appendChild(li);
    });
  }

  // ---------- Galería ----------
  var gal = document.getElementById("galeriaGrid");
  if (gal) {
    COLORES.forEach(function (c, k) {
      var li = document.createElement("li");
      li.innerHTML = '<a class="galeria__item" href="index.html#color=' + k + '">' +
        '<span class="galeria__img">' + franela(c.hex) + '</span>' +
        '<span class="galeria__nombre">' + c.nombre + '</span><span class="galeria__ir">Probar →</span></a>';
      gal.appendChild(li);
    });
  }

  // ---------- Arma tu pack ----------
  var huecos = document.getElementById("packHuecos");
  if (huecos) {
    var TAM = 3, pack = [], tallaPack = tallaInicial;
    var cajaColores = document.getElementById("packColores");
    var cajaTallas = document.getElementById("packTallas");
    var btnAnadir = document.getElementById("packAnadir");
    var btnWa = document.getElementById("packWa");

    function listaColores() {
      var n = pack.map(function (k) { return COLORES[k].nombre.toLowerCase(); });
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
          b.innerHTML = '<span class="hueco__num">' + (i + 1) + '</span><span class="hueco__txt">Elige un color</span>';
          b.disabled = true;
        } else {
          b.innerHTML = franela(COLORES[k].hex) + '<span class="hueco__txt">' + COLORES[k].nombre + '</span>';
          b.setAttribute("aria-label", "Quitar " + COLORES[k].nombre + " del pack");
          (function (idx) { b.addEventListener("click", function () { pack.splice(idx, 1); pintar(); }); })(i);
        }
        huecos.appendChild(b);
      }
      var lleno = pack.length === TAM;
      btnAnadir.disabled = !lleno;
      btnWa.setAttribute("aria-disabled", lleno ? "false" : "true");
      btnWa.href = lleno ? zeta.enlaceWhatsApp("Hola ZETA, vengo de la web. Quiero armar un pack de " + TAM + " " +
        nombreProd.toLowerCase().replace("franela", "franelas") + " talla " + tallaPack + ": " + listaColores() +
        ". ¿Me confirman disponibilidad y precio?") : "#";
    }
    COLORES.forEach(function (c, k) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "punto"; b.style.background = c.hex;
      b.setAttribute("aria-label", "Añadir " + c.nombre + " al pack");
      b.addEventListener("click", function () {
        if (pack.length >= TAM) { zeta.avisar("Tu pack ya tiene " + TAM + ". Toca una para cambiarla."); return; }
        pack.push(k); pintar();
      });
      cajaColores.appendChild(b);
    });
    TALLAS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "talla"; b.textContent = t;
      b.setAttribute("aria-pressed", t === tallaPack ? "true" : "false");
      b.addEventListener("click", function () {
        tallaPack = t;
        cajaTallas.querySelectorAll(".talla").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        pintar();
      });
      cajaTallas.appendChild(b);
    });
    btnAnadir.addEventListener("click", function () {
      pack.forEach(function (k) { zeta.anadir(k, tallaPack, 1); });
      zeta.avisar("Pack añadido: " + TAM + " franelas talla " + tallaPack);
      pack = []; pintar();
    });
    pintar();
  }
})();

/* ZETA · Funciones comunes a todas las páginas:
   textos desde config.js, enlaces de WhatsApp, Mi pedido, menú y botón flotante. */
(function () {
  var Z = window.ZETA || {};
  var P = Z.producto || {};
  var COLORES = P.colores || [];
  var nombreProd = P.nombre || "Franela";
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Textos desde config.js ----------
  document.querySelectorAll("[data-campo]").forEach(function (el) {
    var v = el.getAttribute("data-campo").split(".").reduce(function (o, k) { return o ? o[k] : ""; }, Z);
    el.textContent = v ? v : "Información próximamente";
  });
  document.querySelectorAll("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-instagram]").forEach(function (a) {
    a.href = "https://www.instagram.com/" + (Z.instagram || "");
    if (!a.children.length) a.textContent = "@" + (Z.instagram || "");
  });

  // ---------- WhatsApp ----------
  function enlaceWhatsApp(mensaje) {
    if (Z.whatsapp) return "https://wa.me/" + Z.whatsapp + "?text=" + encodeURIComponent(mensaje || Z.mensajeWhatsApp || "");
    return Z.whatsappEnlace || "https://www.instagram.com/" + (Z.instagram || "");
  }
  function ponerWa(selector, mensaje) {
    document.querySelectorAll(selector).forEach(function (a) { a.href = enlaceWhatsApp(mensaje); });
  }
  ponerWa("[data-wa], [data-wa-general]", Z.mensajeWhatsApp);
  ponerWa("[data-wa-talla]", "Hola ZETA, vengo de la web. Tengo dudas con la talla de la " + nombreProd.toLowerCase() + ". ¿Me ayudan a elegir entre S, M y L?");

  // ---------- Aviso corto ----------
  var aviso = document.getElementById("aviso"), tAviso;
  function avisar(txt) {
    if (!aviso) return;
    aviso.textContent = txt;
    aviso.classList.add("ver");
    clearTimeout(tAviso);
    tAviso = setTimeout(function () { aviso.classList.remove("ver"); }, 1800);
  }

  // ---------- Mi pedido (se guarda en el teléfono y se mantiene al cambiar de página) ----------
  var CLAVE = "zeta-mi-pedido";
  var lista = [];
  try { lista = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (err) { lista = []; }
  lista = lista.filter(function (it) { return it && COLORES[it.color] && it.talla && it.cant > 0; });
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (err) {} }

  var bolsa = document.getElementById("bolsa");
  var bolsaNum = document.getElementById("bolsaNum");
  var velo = document.getElementById("velo");
  var panel = document.getElementById("lista");
  var items = document.getElementById("listaItems");
  var vacia = document.getElementById("listaVacia");
  var total = document.getElementById("listaTotal");
  var enviar = document.getElementById("enviarLista");

  function totalFranelas() { return lista.reduce(function (n, it) { return n + it.cant; }, 0); }
  function plural(n) { return n + (n === 1 ? " franela" : " franelas"); }

  function mensajeLista() {
    var lineas = lista.map(function (it) {
      return "• " + it.cant + " × " + nombreProd + ", color " + COLORES[it.color].nombre.toLowerCase() + ", talla " + it.talla;
    });
    return "Hola ZETA, vengo de la web. Quiero hacer este pedido:\n" + lineas.join("\n") +
      "\nTotal: " + plural(totalFranelas()) + ".\n¿Me confirman disponibilidad y precio?";
  }

  function pintarLista() {
    var n = totalFranelas();
    if (bolsa) {
      bolsaNum.textContent = n;
      bolsa.classList.toggle("tiene", n > 0);
      bolsa.setAttribute("aria-label", n ? "Ver mi pedido, " + plural(n) : "Ver mi pedido, vacío");
    }
    if (!items) return;
    items.innerHTML = "";
    lista.forEach(function (it, idx) {
      var c = COLORES[it.color];
      var li = document.createElement("li");
      li.className = "item";
      li.innerHTML =
        '<div class="item__mini"><svg viewBox="0 0 400 420" style="color:' + c.hex + '"><use href="#franela"/></svg></div>' +
        '<div class="item__texto"><div class="item__nombre">' + nombreProd + '</div>' +
        '<div class="item__detalle">' + c.nombre + ' · Talla ' + it.talla + '</div>' +
        '<button type="button" class="item__quitar">Quitar</button></div>' +
        '<div class="cantidad"><button type="button" aria-label="Una menos">−</button><span>' + it.cant +
        '</span><button type="button" aria-label="Una más">+</button></div>';
      var b = li.querySelectorAll("button");
      b[0].addEventListener("click", function () { lista.splice(idx, 1); cambio(); });
      b[1].addEventListener("click", function () { it.cant--; if (it.cant < 1) lista.splice(idx, 1); cambio(); });
      b[2].addEventListener("click", function () { it.cant = Math.min(99, it.cant + 1); cambio(); });
      items.appendChild(li);
    });
    vacia.hidden = n > 0;
    total.textContent = n ? "Total: " + plural(n) : "";
    enviar.setAttribute("aria-disabled", n ? "false" : "true");
    enviar.href = n ? enlaceWhatsApp(mensajeLista()) : "#";
  }
  function cambio() { guardar(); pintarLista(); }

  // Añadir: color = número del color en config.js, talla = "S" | "M" | "L"
  function anadir(color, talla, cant) {
    cant = cant || 1;
    var ya = lista.filter(function (it) { return it.color === color && it.talla === talla; })[0];
    if (ya) ya.cant = Math.min(99, ya.cant + cant);
    else lista.push({ color: color, talla: talla, cant: cant });
    cambio();
    if (bolsa && !reducir) { bolsa.classList.remove("salta"); void bolsa.offsetWidth; bolsa.classList.add("salta"); }
  }

  var ultimoFoco = null;
  function abrirLista() {
    if (!panel) return;
    ultimoFoco = document.activeElement;
    pintarLista();
    velo.hidden = false; panel.hidden = false;
    document.getElementById("cerrarLista").focus();
  }
  function cerrarLista() {
    if (!panel) return;
    velo.hidden = true; panel.hidden = true;
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  if (bolsa) bolsa.addEventListener("click", abrirLista);
  if (panel) {
    document.getElementById("cerrarLista").addEventListener("click", cerrarLista);
    velo.addEventListener("click", cerrarLista);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (panel && !panel.hidden) cerrarLista(); cerrarMenu(); }
  });
  pintarLista();

  // Si otra pestaña cambia el pedido, se actualiza aquí también
  window.addEventListener("storage", function (e) {
    if (e.key !== CLAVE) return;
    try { lista = JSON.parse(e.newValue) || []; } catch (err) { lista = []; }
    pintarLista();
  });

  // ---------- Menú ----------
  var botonMenu = document.getElementById("botonMenu");
  var menu = document.getElementById("menu");
  function abrirMenu() {
    if (!menu) return;
    menu.hidden = false; botonMenu.setAttribute("aria-expanded", "true");
    var primero = menu.querySelector("a"); if (primero) primero.focus();
  }
  function cerrarMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; botonMenu.setAttribute("aria-expanded", "false"); botonMenu.focus();
  }
  if (botonMenu && menu) {
    botonMenu.addEventListener("click", function () { menu.hidden ? abrirMenu() : cerrarMenu(); });
    var cerrarM = document.getElementById("cerrarMenu");
    if (cerrarM) cerrarM.addEventListener("click", cerrarMenu);
  }
  // Marca la página actual en el menú
  var aqui = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  document.querySelectorAll("[data-pagina]").forEach(function (a) {
    if (a.getAttribute("data-pagina") === aqui) a.setAttribute("aria-current", "page");
  });

  // ---------- Botón flotante de WhatsApp: oculto mientras se ve otro botón de pedido ----------
  var flotante = document.querySelector(".wa-flotante");
  var tapan = document.querySelectorAll("[data-tapa-flotante], .boton--wa, .pack__botones");
  if (flotante && tapan.length && "IntersectionObserver" in window) {
    var visibles = new Set();
    var obs = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) { e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target); });
      flotante.classList.toggle("oculto", visibles.size > 0);
    });
    tapan.forEach(function (el) { obs.observe(el); });
  }

  // Lo que usan las demás partes de la web
  window.Zeta = {
    enlaceWhatsApp: enlaceWhatsApp,
    anadir: anadir,
    avisar: avisar,
    abrirLista: abrirLista,
    reducir: reducir
  };
  window.enlaceWhatsApp = enlaceWhatsApp;
})();

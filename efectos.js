/* ZETA · Movimiento: cabecera, apariciones, parallax suave y escaneo entre páginas (firma) */
(function () {
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cab = document.getElementById("cabecera");

  // Cabecera: se vuelve sólida al bajar (en el inicio, al salir de la portada)
  if (cab) {
    var portada = document.getElementById("portada") || document.getElementById("perchero") || document.getElementById("probador");
    var limite = function () { return portada ? portada.offsetHeight - 80 : 20; };
    var solida = function () { cab.classList.toggle("solida", window.scrollY > limite()); };
    window.addEventListener("scroll", solida, { passive: true });
    solida();
    // Al bajar la cabecera se esconde para dejar ver la página; al subir vuelve (como en las grandes tiendas)
    var antes = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY, menu = document.getElementById("menu"), abierto = menu && !menu.hidden;
      if (!abierto && y > antes + 4 && y > 240) cab.classList.add("escondida");
      if (y < antes - 4 || y < 240) cab.classList.remove("escondida");
      antes = y;
    }, { passive: true });
    cab.addEventListener("focusin", function () { cab.classList.remove("escondida"); });
  }

  var html = document.documentElement, liviano0 = html.classList.contains("liviano");

  // Títulos grandes: cada palabra sube desde una ranura, una detrás de otra
  if (!reducir && !liviano0) {
    document.querySelectorAll(".cabeza-pag .titulo, .mega, .titulo[data-aparece], .sigue__t").forEach(function (h) {
      if (h.hasAttribute("data-campo") || h.querySelector("[data-campo]")) return;
      var i = 0, piezas = Array.prototype.slice.call(h.childNodes);
      h.textContent = "";
      piezas.forEach(function (nodo) {
        var trozos = nodo.nodeType === 3 ? nodo.textContent.split(/(\s+)/) : [nodo];
        trozos.forEach(function (tr) {
          if (typeof tr === "string") {
            if (!tr) return;
            if (/^\s+$/.test(tr)) { h.appendChild(document.createTextNode(" ")); return; }
          }
          var pal = document.createElement("span"), dentro = document.createElement("span");
          pal.className = "pal"; dentro.style.setProperty("--i", i++);
          if (typeof tr === "string") dentro.textContent = tr; else dentro.appendChild(tr);
          pal.appendChild(dentro); h.appendChild(pal);
        });
      });
      h.classList.add("partido");
      if (!h.hasAttribute("data-aparece")) h.setAttribute("data-aparece", "");
    });
  }

  // La rayita del menú: marca el apartado actual y viaja al siguiente al cambiar de página
  document.querySelectorAll(".cab__nav").forEach(function (nav) {
    var actual = nav.querySelector('a[aria-current="page"]');
    if (!actual) return;
    var m = document.createElement("span");
    m.className = "cab__marca"; m.setAttribute("aria-hidden", "true");
    nav.appendChild(m); nav.classList.add("con-marca");
    var poner = function () { m.style.left = actual.offsetLeft + "px"; m.style.width = actual.offsetWidth + "px"; };
    poner();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(poner);
    window.addEventListener("resize", poner);
  });

  // Apariciones al bajar (las que entran juntas, en cascada)
  var items = document.querySelectorAll("[data-aparece]");
  if (!reducir && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ent) {
      var n = 0;
      ent.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--cascada", (n++ * 90) + "ms");
        e.target.classList.add("visto"); io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("visto"); });
  }

  // Parallax suave (solo con ratón y pantallas grandes)
  var par = document.querySelectorAll("[data-parallax]");
  if (par.length && !reducir && matchMedia("(pointer: fine) and (min-width: 900px)").matches) {
    var pedido = false;
    var mover = function () {
      pedido = false;
      par.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = "translate(-50%, calc(-50% + " + (p * -60).toFixed(1) + "px))";
      });
    };
    window.addEventListener("scroll", function () { if (!pedido) { pedido = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }

  // ---------- Recorrido entre páginas ----------
  var d = document.documentElement, ORDEN = window.ZETA_ORDEN || [];
  function indice(href) {
    try { var u = new URL(href, location.href); if (u.origin !== location.origin) return -1;
      var n = u.pathname.split("/").pop() || "index.html";
      for (var i = 0; i < ORDEN.length; i++) if (ORDEN[i][0] === n) return i; } catch (e) {}
    return -1;
  }
  var aqui = indice(location.href);

  // Teléfono: barra de accesos rápidos (el pedido abre el mismo panel y muestra el mismo número)
  var tabs = document.getElementById("tabs");
  if (tabs) {
    var tNum = document.getElementById("tabsNum"), bNum = document.getElementById("bolsaNum"), bolsa = document.getElementById("bolsa");
    var copiar = function () { if (tNum && bNum) { tNum.textContent = bNum.textContent; tNum.hidden = bNum.textContent === "0"; } };
    copiar();
    if (bNum && "MutationObserver" in window) new MutationObserver(copiar).observe(bNum, { childList: true, characterData: true, subtree: true });
    var tp = document.getElementById("tabsPedido");
    if (tp && bolsa) tp.addEventListener("click", function () { bolsa.click(); });
    // En la ficha, la barra de compra ocupa ese lugar cuando aparece
    var compra = document.getElementById("fBarra");
    if (compra && "MutationObserver" in window) {
      var ver = function () { tabs.classList.toggle("tapada", compra.classList.contains("ver")); };
      new MutationObserver(ver).observe(compra, { attributes: true, attributeFilter: ["class"] }); ver();
    }
  }

  // «Sigue»: la línea se llena a medida que llegas al final de la página
  var sig = document.querySelector(".sigue");
  if (sig && !reducir) {
    var llenar = function () {
      var r = sig.getBoundingClientRect(), p = 1 - (r.top - innerHeight * .35) / (innerHeight * .55);
      sig.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener("scroll", llenar, { passive: true }); llenar();
  }

  // Al tocar un enlace interno se guarda hacia dónde vamos (adelante o atrás en el recorrido)
  var paso = document.getElementById("pasoPagina");
  var nativa = d.classList.contains("vt"), liviano = d.classList.contains("liviano");
  var CLAVE = "zeta-escaneo";
  if (paso && !nativa && !reducir) {
    try {
      var vino = sessionStorage.getItem(CLAVE);
      if (vino) {
        sessionStorage.removeItem(CLAVE);
        if (!document.querySelector(".telon")) { paso.classList.add("entra"); setTimeout(function () { paso.classList.remove("entra"); }, 900); }
      }
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return;
    var j = indice(a.href);
    var dir = j >= 0 && aqui >= 0 && j < aqui ? "ant" : "sig";
    try { sessionStorage.setItem("zeta-dir", dir); } catch (err) {}
    d.classList.remove("dir-sig", "dir-ant"); d.classList.add("dir-" + dir);
    if (nativa || !paso || reducir) return;          // el navegador hace la transición solo
    e.preventDefault();
    try { sessionStorage.setItem(CLAVE, "1"); } catch (err) {}
    paso.classList.remove("entra"); paso.classList.add("sale");
    setTimeout(function () { location.href = a.href; }, liviano ? 200 : 520);
  });
  // ---------- Bajar para pasar de página ----------
  // Al llegar al final, seguir bajando (rueda del mouse o dedo) llena la línea y abre la página siguiente.
  var siguiente = aqui >= 0 && aqui < ORDEN.length - 1 ? ORDEN[aqui + 1][0] : null;
  if (siguiente && !reducir) {
    var tiron = document.createElement("div");
    tiron.className = "tiron"; tiron.setAttribute("aria-hidden", "true"); tiron.innerHTML = "<i></i>";
    document.body.appendChild(tiron);
    var carga = 0, yendo = false, alFondoDesde = 0, suelta = 0, sigA = document.querySelector(".sigue__a");
    var alFondo = function () { return window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4; };
    var abierto = function () { var l = document.getElementById("lista"), m = document.getElementById("menu"); return (l && !l.hidden) || (m && !m.hidden); };
    var pintar = function () {
      tiron.style.setProperty("--t", carga.toFixed(3)); tiron.classList.toggle("activo", carga > .02);
      if (sig) sig.style.setProperty("--p", Math.max(carga, parseFloat(sig.style.getPropertyValue("--p")) || 0).toFixed(3));
    };
    var ir = function () {
      if (yendo) return; yendo = true; carga = 1; pintar();
      if (sigA) sigA.click(); else { try { sessionStorage.setItem("zeta-dir", "sig"); } catch (e) {} location.href = siguiente; }
    };
    var soltar = function () { clearTimeout(suelta); suelta = setTimeout(function () { if (!yendo) { carga = 0; pintar(); } }, 700); };
    window.addEventListener("scroll", function () { if (!alFondo()) { alFondoDesde = 0; if (!yendo && carga) { carga = 0; pintar(); } } else if (!alFondoDesde) alFondoDesde = Date.now(); }, { passive: true });
    window.addEventListener("wheel", function (e) {
      if (yendo || e.deltaY <= 0 || abierto() || !alFondo()) return;
      if (!alFondoDesde) { alFondoDesde = Date.now(); return; }
      if (Date.now() - alFondoDesde < 350) return;           // la inercia del gesto anterior no cuenta
      carga = Math.min(1, carga + Math.min(e.deltaY, 120) / 900); pintar(); soltar();
      if (carga >= 1) ir();
    }, { passive: true });
    var y0 = null;
    window.addEventListener("touchstart", function (e) { y0 = alFondo() && !abierto() ? e.touches[0].clientY : null; }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (y0 === null || yendo) return;
      if (e.target.closest && e.target.closest(".perchero__lista, .ficha-p__galeria, .tabs")) { y0 = null; return; }
      carga = Math.max(0, Math.min(1, (y0 - e.touches[0].clientY) / 170)); pintar();
    }, { passive: true });
    window.addEventListener("touchend", function () { if (y0 === null) return; y0 = null; if (carga >= 1) ir(); else { carga = 0; pintar(); } }, { passive: true });
    window.addEventListener("pageshow", function (e) { if (e.persisted) { yendo = false; carga = 0; pintar(); } });
    if (alFondo()) alFondoDesde = Date.now();
  }

  // El telón se quita del todo cuando termina
  var telon = document.querySelector(".telon");
  if (telon) telon.addEventListener("animationend", function (e) { if (e.target.classList.contains("telon__abajo")) telon.classList.add("fuera"); });
  // Si el usuario vuelve atrás, quitar el velo
  window.addEventListener("pageshow", function (e) { if (e.persisted && paso) paso.classList.remove("sale"); });
})();

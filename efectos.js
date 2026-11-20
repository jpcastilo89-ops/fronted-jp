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

  // Apariciones al bajar
  var items = document.querySelectorAll("[data-aparece]");
  if (!reducir && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } });
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
        var yo = ORDEN[aqui];
        paso.querySelector(".paso-pagina__n").textContent = yo ? ("0" + (aqui + 1)).slice(-2) : "";
        paso.querySelector(".paso-pagina__t").textContent = yo ? yo[1] : "";
        paso.classList.add("entra");
        setTimeout(function () { paso.classList.remove("entra"); }, 900);
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
    var destino = ORDEN[j];
    paso.querySelector(".paso-pagina__n").textContent = destino ? ("0" + (j + 1)).slice(-2) : "";
    paso.querySelector(".paso-pagina__t").textContent = destino ? destino[1] : "";
    paso.classList.remove("entra"); paso.classList.add("sale");
    setTimeout(function () { location.href = a.href; }, liviano ? 200 : 460);
  });
  // Si el usuario vuelve atrás, quitar el velo
  window.addEventListener("pageshow", function (e) { if (e.persisted && paso) paso.classList.remove("sale"); });
})();

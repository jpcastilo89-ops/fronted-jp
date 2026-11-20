/* ZETA · Movimiento: cabecera, apariciones, parallax suave y escaneo entre páginas (firma) */
(function () {
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cab = document.getElementById("cabecera");

  // Cabecera: se vuelve sólida al bajar (en el inicio, al salir de la portada)
  if (cab) {
    var portada = document.getElementById("portada") || document.getElementById("probador");
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

  // Escaneo entre páginas: una línea de luz cubre la página al salir y la descubre al llegar
  var paso = document.getElementById("pasoPagina");
  if (!paso || reducir) return;
  var CLAVE = "zeta-escaneo";
  try {
    if (sessionStorage.getItem(CLAVE)) {
      sessionStorage.removeItem(CLAVE);
      paso.classList.add("entra");
      setTimeout(function () { paso.classList.remove("entra"); }, 800);
    }
  } catch (e) {}
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    try { sessionStorage.setItem(CLAVE, "1"); } catch (err) {}
    paso.classList.remove("entra"); paso.classList.add("sale");
    setTimeout(function () { location.href = a.href; }, 400);
  });
  // Si el usuario vuelve atrás, quitar el velo
  window.addEventListener("pageshow", function (e) { if (e.persisted) paso.classList.remove("sale"); });
})();

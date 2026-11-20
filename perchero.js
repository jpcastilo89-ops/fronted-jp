/* ZETA · Perchero de tienda (inicio): las 6 franelas cuelgan de un tubo.
   Se pasan con el dedo (o arrastrando con el mouse / flechas). Al moverlas se balancean
   como en un perchero real; la del centro queda al frente y su ficha aparece debajo.
   Fotos: las mismas fotos reales de la web (g-k.webp), sin cambios. */
(function () {
  var sec = document.getElementById("perchero");
  if (!sec) return;
  var zeta = window.Zeta, COLORES = zeta.colores || [], reducir = zeta.reducir;
  var $ = function (id) { return document.getElementById(id); };
  var lista = $("percheroLista"), nombre = $("percheroNombre"), notaF = $("percheroNota"), ver = $("percheroVer");
  var tallas = sec.querySelectorAll(".perchero__talla"), talla = "M";

  // ---------- Las perchas ----------
  // Gancho de metal y percha de madera (la madera asoma sobre los hombros, como en la tienda)
  var GANCHO = '<svg class="percha__gancho" viewBox="0 0 100 40" aria-hidden="true">' +
    '<defs><linearGradient id="madera" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d6a873"/><stop offset=".55" stop-color="#a87443"/><stop offset="1" stop-color="#7a4f2a"/></linearGradient>' +
    '<linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="#5d5d5d"/><stop offset=".45" stop-color="#d9d9d6"/><stop offset="1" stop-color="#4a4a4a"/></linearGradient></defs>' +
    '<path d="M50 23V11.5c0-1.6 1-2.6 2.6-3.4 2.4-1.2 3.6-3 3.6-5.1C56.2 .9 53.6-.2 50.6-.2 47.4-.2 45 1.6 45 4.2" fill="none" stroke="url(#metal)" stroke-width="1.15" stroke-linecap="round"/>' +
    '<path d="M50 20.6c-1.3 0-2.4.5-3.4 1.1L20.2 36.2c-1.3.8-.9 2.5.6 2.5h0c.6 0 1.2-.2 1.8-.5L50 24.4l27.4 13.8c.6.3 1.2.5 1.8.5h0c1.5 0 1.9-1.7.6-2.5L53.4 21.7c-1-.6-2.1-1.1-3.4-1.1z" fill="url(#madera)"/>' +
    '<rect x="47.6" y="19.4" width="4.8" height="3.2" rx="1" fill="#6e6e6b"/></svg>';
  var perchas = COLORES.map(function (c, k) {
    var li = document.createElement("li");
    li.className = "percha";
    li.innerHTML = '<button type="button" class="percha__boton" aria-label="Franela ' + c.nombre.toLowerCase() + '">' +
      '<span class="percha__mueve">' + GANCHO +
      '<img class="percha__img" data-src="' + zeta.foto(k, "g") + '" alt="" width="800" height="840" loading="lazy" decoding="async" draggable="false">' +
      '</span></button>';
    var img = li.querySelector("img");
    img.addEventListener("error", function () { zeta.falloImg(img, k); });
    lista.appendChild(li);
    return { li: li, boton: li.querySelector("button"), mueve: li.querySelector(".percha__mueve"), a: 0, w: 0,
      // cada franela con su propio ritmo, como telas que no cuelgan igual
      w0: 2 * Math.PI / (1050 + k * 70), d: 0 };
  });
  perchas.forEach(function (p) { p.d = 2 * .13 * p.w0; });

  // ---------- Cuál está al frente (la del centro) ----------
  var frente = -1;
  function centroDe(p) { return p.li.offsetLeft + p.li.offsetWidth / 2; }
  function buscarFrente() {
    var c = lista.scrollLeft + lista.clientWidth / 2, mejor = 0, dist = 1e9;
    perchas.forEach(function (p, k) { var d = Math.abs(centroDe(p) - c); if (d < dist) { dist = d; mejor = k; } });
    if (mejor !== frente) ponerFrente(mejor);
  }
  function ponerFrente(k) {
    frente = k;
    perchas.forEach(function (p, j) {
      p.li.classList.toggle("al-frente", j === k);
      p.boton.setAttribute("aria-current", j === k ? "true" : "false");
    });
    var c = COLORES[k];
    nombre.textContent = c.nombre;
    notaF.textContent = c.nombre === "Negro" ? "Fotografía real" : "Referencia de color";
    ver.href = "productos.html?color=" + k;
    ver.textContent = "Ver la franela en " + c.nombre.toLowerCase();
  }
  function irA(k, suave) {
    k = Math.max(0, Math.min(perchas.length - 1, k));
    var p = perchas[k];
    lista.scrollTo({ left: centroDe(p) - lista.clientWidth / 2, behavior: suave && !reducir ? "smooth" : "auto" });
  }

  // ---------- Balanceo: cada franela es un péndulo colgado del gancho ----------
  var LARGO = 230, ultX = lista.scrollLeft, ultV = 0, ultT = 0, raf = 0, quieto = 0;
  function paso(t) {
    raf = 0;
    var dt = ultT ? Math.min(32, t - ultT) : 16; ultT = t;
    var x = lista.scrollLeft, v = -(x - ultX) / dt;           // velocidad del tubo (px/ms)
    var acel = (v - ultV) / dt; ultX = x; ultV = v * .6 + ultV * .4;
    var mov = false;
    perchas.forEach(function (p) {
      // el gancho acelera hacia un lado y la franela se queda atrás
      var alfa = -p.w0 * p.w0 * p.a - p.d * p.w + acel / LARGO * .15;
      p.w += alfa * dt; p.a += p.w * dt;
      p.a = Math.max(-.26, Math.min(.26, p.a));
      if (Math.abs(p.a) > .0008 || Math.abs(p.w) > .00002) mov = true; else { p.a = 0; p.w = 0; }
      p.mueve.style.transform = "rotate(" + (p.a * 57.3).toFixed(2) + "deg)";
    });
    buscarFrente();
    if (mov || Math.abs(v) > .001) { quieto = 0; pedir(); }
    else if (++quieto < 6) pedir(); else ultT = 0;
  }
  function pedir() { if (!raf) raf = requestAnimationFrame(paso); }
  function empujar(fuerza, escalonado) {
    if (reducir) return;
    perchas.forEach(function (p, k) { p.w += fuerza * (escalonado ? (1 - k * .08) : 1); });
    pedir();
  }
  lista.addEventListener("scroll", function () { if (reducir) buscarFrente(); else pedir(); }, { passive: true });

  // Con el mouse: al pasar por encima, la franela se mueve un poquito
  if (!reducir && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    perchas.forEach(function (p) {
      p.li.addEventListener("pointerenter", function (e) { if (!arr) { p.w += (e.movementX || 1) > 0 ? .00045 : -.00045; pedir(); } });
    });
  }

  // ---------- Arrastrar con el mouse (en el teléfono el dedo ya desliza solo) ----------
  var arr = null, arrastro = false;
  lista.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    arr = { x: e.clientX, s: lista.scrollLeft, id: e.pointerId }; arrastro = false;
  });
  lista.addEventListener("pointermove", function (e) {
    if (!arr || e.pointerId !== arr.id) return;
    var dx = e.clientX - arr.x;
    if (!arrastro && Math.abs(dx) > 5) {
      arrastro = true; sec.classList.add("arrastrando");
      try { lista.setPointerCapture(e.pointerId); } catch (er) {}
    }
    if (arrastro) lista.scrollLeft = arr.s - dx;
  });
  function soltar() {
    if (!arr) return;
    arr = null;
    if (arrastro) { sec.classList.remove("arrastrando"); buscarFrente(); irA(frente, true); setTimeout(function () { arrastro = false; }, 50); }
  }
  lista.addEventListener("pointerup", soltar);
  lista.addEventListener("pointercancel", soltar);

  // Tocar una franela: si está de lado viene al frente; si ya está al frente, abre su ficha
  perchas.forEach(function (p, k) {
    p.boton.addEventListener("click", function () {
      if (arrastro) return;
      if (k === frente) { location.href = ver.href; return; }
      irA(k, true);
    });
    p.boton.addEventListener("focus", function () { if (k !== frente) irA(k, true); });
  });
  $("percheroAtras").addEventListener("click", function () { irA(frente - 1, true); });
  $("percheroAdelante").addEventListener("click", function () { irA(frente + 1, true); });

  // ---------- Ficha: talla y añadir ----------
  tallas.forEach(function (b) {
    b.addEventListener("click", function () {
      talla = b.getAttribute("data-talla");
      tallas.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
    });
  });
  $("percheroAnadir").addEventListener("click", function () {
    zeta.anadir(frente, talla, 1);
    zeta.avisar("Añadida: " + COLORES[frente].nombre.toLowerCase() + ", talla " + talla);
    var p = perchas[frente]; if (p && !reducir) { p.w += .0011; pedir(); }
  });

  // ---------- Al llegar: el perchero se mueve como si alguien lo acabara de tocar ----------
  // En el teléfono empieza por la negra; en pantallas anchas, por el centro para que el tubo se vea lleno
  var ancho = matchMedia("(min-width: 900px)");
  function empezar() { irA(ancho.matches ? Math.floor((perchas.length - 1) / 2) : 0, false); buscarFrente(); }
  if (document.readyState === "complete") empezar(); else window.addEventListener("load", empezar);
  empezar();
  window.addEventListener("resize", function () { irA(frente, false); });
  // Las fotos se piden solo cuando el perchero está cerca (no compiten con la foto de la portada)
  function cargarFotos() { lista.querySelectorAll("img[data-src]").forEach(function (i) { i.src = i.getAttribute("data-src"); i.removeAttribute("data-src"); }); }
  if ("IntersectionObserver" in window) {
    var cerca = new IntersectionObserver(function (ent) { if (ent[0].isIntersecting) { cerca.disconnect(); cargarFotos(); } }, { rootMargin: "400px 0px" });
    cerca.observe(sec);
  } else cargarFotos();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ent) {
      if (ent[0].isIntersecting) { io.disconnect(); sec.classList.add("ya"); setTimeout(function () { empujar(.0009, true); }, 250); }
    }, { threshold: .35 });
    io.observe(sec);
  } else sec.classList.add("ya");
})();

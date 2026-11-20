/* ZETA · Franela 3D de la portada (WebGL, sin librerías).
   La forma sale de img/franelas/3d-relieve.png y la piel son las fotos reales:
   el frente (g-k.webp) tal cual y la espalda (3d-e-k.webp) acomodada a la misma silueta.
   Los costados no tienen foto: se ven como el borde redondeado de las dos caras.
   Solo dibuja cuando algo se mueve (no gasta batería en reposo). */
(function () {
  "use strict";
  var IMG_W = 800, IMG_H = 840, PASO = 5, GROSOR = 0.12, FOV = 12 * Math.PI / 180;

  function cargarImg(src) {
    return new Promise(function (ok, mal) {
      var i = new Image(); i.decoding = "async";
      i.onload = function () { ok(i); }; i.onerror = mal; i.src = src;
    });
  }
  // Misma curva que el resto de la web: cubic-bezier(.65,0,.35,1)
  function curva(t) {
    var x1 = .65, x2 = .35, u = t;
    for (var n = 0; n < 6; n++) {
      var x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      var d = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(d) < 1e-6) break; u -= x / d;
    }
    u = Math.min(1, Math.max(0, u));
    return 3 * (1 - u) * u * u + u * u * u; // y1 = 0, y2 = 1
  }

  var VS = "attribute vec3 aP;attribute vec2 aT;attribute vec3 aN;attribute float aS;" +
    "uniform mat4 uM;uniform mat4 uV;varying vec2 vT;varying vec3 vN;varying float vS;" +
    "void main(){vec4 p=uM*vec4(aP,1.);vN=mat3(uM)*aN;vT=aT;vS=aS;gl_Position=uV*p;}";
  var FS = "precision mediump float;uniform sampler2D uF0,uB0,uF1,uB1;uniform float uCorte,uAlto;" +
    "varying vec2 vT;varying vec3 vN;varying float vS;" +
    "void main(){bool nuevo=(1.-gl_FragCoord.y/uAlto)<uCorte;vec4 c;" +
    "if(vS>.5){c=nuevo?texture2D(uF1,vT):texture2D(uF0,vT);}else{c=nuevo?texture2D(uB1,vT):texture2D(uB0,vT);}" +
    "if(c.a<.5)discard;vec3 n=normalize(vN);" +
    "float l=max(dot(n,vec3(0.,0.,1.)),0.);float k=max(dot(n,normalize(vec3(-.45,.35,1.))),0.);" +
    "float s=mix(.5,1.,pow(l,.7))*mix(.94,1.03,k);" +
    "s*=mix(.62,1.,smoothstep(.55,.97,c.a));" +
    "gl_FragColor=vec4(c.rgb*s,1.);}";

  window.Franela3D = function (cont, op) {
    var cv = document.createElement("canvas");
    cv.className = "portada__3d";
    cv.setAttribute("role", "img");
    cv.tabIndex = 0;
    var gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true }) ||
      cv.getContext("experimental-webgl");
    if (!gl) { op.fallo && op.fallo(); return null; }

    var prog, buf, ind, nInd, loc = {}, tex = {}, cara = [null, null, null, null];
    var yaw = 0, pitch = 0, vel = 0, corte = 0, k = op.k || 0, pedido = 0, vivo = true;
    var anim = [], rafId = 0, aspecto = 1, calidad = Math.min(window.devicePixelRatio || 1, 2), tPrev = 0, lentos = 0;

    function sombreador(t, s) {
      var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x));
      return x;
    }
    function textura(img) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    function texturas(c) {
      if (!tex[c]) tex[c] = Promise.all([cargarImg(op.frente(c)), cargarImg(op.espalda(c))])
        .then(function (im) { return [textura(im[0]), textura(im[1])]; });
      return tex[c];
    }

    // ---------- La forma: dos caras (frente y espalda) que se cierran en el borde ----------
    function malla(img) {
      var c = document.createElement("canvas"), gw = img.width, gh = img.height;
      c.width = gw; c.height = gh;
      var x2 = c.getContext("2d"); x2.drawImage(img, 0, 0);
      var px = x2.getImageData(0, 0, gw, gh).data;
      var z = new Float32Array(gw * gh), en = new Int32Array(gw * gh).fill(-1);
      for (var i = 0; i < gw * gh; i++) z[i] = px[i * 4] / 255 * GROSOR;
      var datos = [], nv = 0;
      var esc = 1 / IMG_H;
      function alto(x, y) { x = Math.max(0, Math.min(gw - 1, x)); y = Math.max(0, Math.min(gh - 1, y)); return z[y * gw + x]; }
      for (var lado = 0; lado < 2; lado++) {
        var s = lado ? -1 : 1;
        for (var y = 0; y < gh; y++) for (var x = 0; x < gw; x++) {
          var i2 = y * gw + x;
          if (px[i2 * 4 + 1] < 128) continue;
          var u = (x + .5) * PASO, v = (y + .5) * PASO;
          var dzx = (alto(x + 1, y) - alto(x - 1, y)) / (2 * PASO * esc);
          var dzy = (alto(x, y + 1) - alto(x, y - 1)) / (2 * PASO * esc);
          // normal hacia afuera de cada cara (y de la imagen crece hacia abajo)
          var nx = -dzx * s, ny = dzy * s, nz = s, L = Math.sqrt(nx * nx + ny * ny + nz * nz);
          datos.push((u - IMG_W / 2) * esc, (IMG_H / 2 - v) * esc, z[i2] * s,
            u / IMG_W, v / IMG_H, nx / L, ny / L, nz / L, lado ? 0 : 1);
          if (lado === 0) en[i2] = nv;
          nv++;
        }
        if (lado === 0) var porCara = nv;
      }
      var idx = [];
      for (var y3 = 0; y3 < gh - 1; y3++) for (var x3 = 0; x3 < gw - 1; x3++) {
        var a = en[y3 * gw + x3], b = en[y3 * gw + x3 + 1], c2 = en[(y3 + 1) * gw + x3], d = en[(y3 + 1) * gw + x3 + 1];
        if (a < 0 || b < 0 || c2 < 0 || d < 0) continue;
        idx.push(a, c2, b, b, c2, d);
        idx.push(a + porCara, b + porCara, c2 + porCara, b + porCara, d + porCara, c2 + porCara);
      }
      var I = nv > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
      if (nv > 65535 && !gl.getExtension("OES_element_index_uint")) throw new Error("malla grande");
      buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(datos), gl.STATIC_DRAW);
      ind = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ind);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, I, gl.STATIC_DRAW);
      nInd = idx.length; ind.tipo = nv > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    }

    function preparar() {
      prog = gl.createProgram();
      gl.attachShader(prog, sombreador(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sombreador(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("programa");
      gl.useProgram(prog);
      ["uM", "uV", "uF0", "uB0", "uF1", "uB1", "uCorte", "uAlto"].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
      ["aP", "aT", "aN", "aS"].forEach(function (n) { loc[n] = gl.getAttribLocation(prog, n); });
      gl.uniform1i(loc.uF0, 0); gl.uniform1i(loc.uB0, 1); gl.uniform1i(loc.uF1, 2); gl.uniform1i(loc.uB1, 3);
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
    }

    function medir() {
      var r = cont.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width * calidad)), h = Math.max(1, Math.round(r.height * calidad));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      aspecto = r.width / Math.max(1, r.height);
    }

    function matrices() {
      // Vista: la franela de frente ocupa la caja igual que la foto (object-fit: contain)
      var medioH = Math.max(.5, (IMG_W / IMG_H / 2) / aspecto);
      var ref = GROSOR * .85, t = Math.tan(FOV / 2), L = medioH / t + ref;
      var n = .1, f = 20, fy = 1 / t, fx = fy / aspecto;
      var P = [fx, 0, 0, 0, 0, fy, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0];
      P[14] += P[10] * -L; P[15] += P[11] * -L; // cámara en z = L
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      // M = rotX(pitch) * rotY(yaw), en columnas
      var M = [cy, sp * sy, -cp * sy, 0, 0, cp, sp, 0, sy, -sp * cy, cp * cy, 0, 0, 0, 0, 1];
      gl.uniformMatrix4fv(loc.uV, false, P);
      gl.uniformMatrix4fv(loc.uM, false, M);
    }

    function dibujar() {
      if (!vivo || !cara[0]) return;
      medir();
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      matrices();
      gl.uniform1f(loc.uCorte, corte); gl.uniform1f(loc.uAlto, cv.height);
      for (var i = 0; i < 4; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, cara[i] || cara[i % 2]); }
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ind);
      var st = 36;
      gl.enableVertexAttribArray(loc.aP); gl.vertexAttribPointer(loc.aP, 3, gl.FLOAT, false, st, 0);
      gl.enableVertexAttribArray(loc.aT); gl.vertexAttribPointer(loc.aT, 2, gl.FLOAT, false, st, 12);
      gl.enableVertexAttribArray(loc.aN); gl.vertexAttribPointer(loc.aN, 3, gl.FLOAT, false, st, 20);
      gl.enableVertexAttribArray(loc.aS); gl.vertexAttribPointer(loc.aS, 1, gl.FLOAT, false, st, 32);
      gl.drawElements(gl.TRIANGLES, nInd, ind.tipo, 0);
      var atras = Math.cos(yaw) < 0;
      if (atras !== dibujar.atras) { dibujar.atras = atras; op.cara && op.cara(atras); }
    }

    // ---------- Bucle: solo corre mientras algo se mueve ----------
    // En teléfonos lentos baja la resolución mientras se mueve, para que el giro siga fluido
    function medirRitmo(t) {
      if (tPrev && t - tPrev > 45) { if (++lentos >= 4 && calidad > .75) { calidad = Math.max(.75, calidad * .7); lentos = 0; } }
      else lentos = Math.max(0, lentos - 1);
      tPrev = t;
    }
    function paso(t) {
      rafId = 0;
      medirRitmo(t);
      var sigue = false;
      anim = anim.filter(function (a) {
        if (a.t0 == null) a.t0 = t;
        var p = Math.min(1, (t - a.t0) / a.dura);
        a.fn(curva(p), p);
        if (p >= 1) { a.fin && a.fin(); return false; }
        sigue = true; return true;
      });
      if (!arr && Math.abs(vel) > .0002) { yaw += vel; vel *= .93; sigue = true; }
      if (!arr && !anim.length && Math.abs(pitch) > .001) { pitch *= .88; sigue = true; }
      dibujar();
      if (sigue || arr) pedir(); else { tPrev = 0; cv.classList.remove("moviendo"); }
    }
    function pedir() { if (!rafId && vivo) { cv.classList.add("moviendo"); rafId = requestAnimationFrame(paso); } }
    function animar(dura, fn, fin) { anim.push({ dura: dura, fn: fn, fin: fin }); pedir(); }
    function irA(destino, dura) {
      var desde = yaw; vel = 0;
      anim = anim.filter(function (a) { return !a.giro; });
      animar(dura, function (e) { yaw = desde + (destino - desde) * e; });
      anim[anim.length - 1].giro = true;
    }

    // ---------- Arrastrar con el mouse o el dedo ----------
    var arr = null, raton = matchMedia("(hover: hover) and (pointer: fine)").matches;
    cv.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      anim = anim.filter(function (a) { return !a.giro; });
      arr = { x: e.clientX, y: e.clientY, id: e.pointerId, movio: false, t: performance.now(), lx: e.clientX };
      vel = 0;
    });
    cv.addEventListener("pointermove", function (e) {
      if (!arr || e.pointerId !== arr.id) return;
      var dx = e.clientX - arr.x, dy = e.clientY - arr.y;
      if (!arr.movio && Math.abs(dx) + Math.abs(dy) > 6) {
        arr.movio = true; cont.classList.add("girando");
        try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      }
      if (!arr.movio) return;
      var ahora = performance.now(), mx = e.clientX - arr.lx;
      var giro = mx * .011;
      yaw += giro;
      vel = giro * Math.min(1, 16 / Math.max(1, ahora - arr.t));
      if (raton || e.pointerType === "mouse") pitch = Math.max(-.42, Math.min(.42, pitch + (e.movementY || 0) * .006));
      arr.lx = e.clientX; arr.t = ahora;
      pedir();
    });
    function soltar(e) {
      if (!arr || (e && e.pointerId !== arr.id)) return;
      var toque = !arr.movio;
      if (performance.now() - arr.t > 80) vel = 0;
      arr = null; cont.classList.remove("girando");
      pedir();
      if (toque && e && e.type === "pointerup") op.tocar && op.tocar();
    }
    cv.addEventListener("pointerup", soltar);
    cv.addEventListener("pointercancel", soltar);
    cv.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); irA(yaw + d * Math.PI / 8, 350); }
      else if (e.key === "Enter") op.tocar && op.tocar();
    });

    var ro = window.ResizeObserver ? new ResizeObserver(function () { pedir(); }) : null;
    cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); vivo = false; op.fallo && op.fallo(); });

    var api = {
      lienzo: cv,
      // Cambio de color: la línea de luz baja y debajo de ella ya está el nuevo color
      color: function (c, dura, alEmpezar) {
        var mio = ++pedido; k = c;
        return texturas(c).then(function (t) {
          if (mio !== pedido || !vivo) return;
          if (!dura) { cara = [t[0], t[1], null, null]; corte = 0; dibujar(); return; }
          cara[2] = t[0]; cara[3] = t[1]; corte = 0;
          anim = anim.filter(function (a) { return !a.color; });
          alEmpezar && alEmpezar();
          animar(dura, function (e) { corte = e; }, function () { cara = [t[0], t[1], null, null]; corte = 0; });
          anim[anim.length - 1].color = true;
        });
      },
      girar: function () { irA((Math.round(yaw / Math.PI) + 1) * Math.PI, 800); },
      // Un pequeño vaivén al aparecer, para que se note que se puede girar
      invitar: function () {
        if (calidad < 1 && (window.devicePixelRatio || 1) >= 1) return;
        animar(1900, function (e, p) { yaw = Math.sin(p * Math.PI * 2) * .55 * (1 - p * .4); });
        anim[anim.length - 1].giro = true;
      },
      detener: function () { vivo = false; if (ro) ro.disconnect(); cv.remove(); }
    };

    try { preparar(); } catch (er) { op.fallo && op.fallo(er); return null; }
    Promise.all([cargarImg(op.relieve), texturas(k)]).then(function (r) {
      if (!vivo) return;
      malla(r[0]);
      cara = [r[1][0], r[1][1], null, null];
      cont.appendChild(cv);
      if (ro) ro.observe(cont);
      dibujar();
      requestAnimationFrame(function () { op.listo && op.listo(api); });
    }).catch(function (er) { vivo = false; op.fallo && op.fallo(er); });
    return api;
  };
})();

/* ---------- Visítanos y pie ---------- */
(function(){
var C = window.IMI_CONFIG || {}, D = document, fx = D.documentElement.classList.contains('fx');
var $ = function(s){ return D.querySelector(s); }, $$ = function(s){ return [].slice.call(D.querySelectorAll(s)); };
var PROX = 'Información próximamente';
var wa = 'https://wa.me/' + (C.whatsapp||'') + '?text=' + encodeURIComponent('Hola, quisiera información sobre el ' + (C.nombre||'colegio') + '.');
var tel = (C.telefono||'').replace(/[^+0-9]/g,'');
$$('[data-v]').forEach(function(el){ var k = el.getAttribute('data-v'), v = C[k];
  if (!v){ el.textContent = PROX; el.removeAttribute('href'); return; }
  if (k === 'telefono'){ el.textContent = v; el.href = 'tel:' + tel; }
  else if (k === 'correo'){ el.textContent = v; el.href = 'mailto:' + v; }
  else if (k === 'instagram'){ el.textContent = C.instagramUsuario || v; el.href = v; }
  else el.textContent = v; });
$('#viWa').href = wa; $('#viDir').href = C.comoLlegar || C.mapa || '#';
/* El mapa solo se carga al tocar «Ver mapa», para ahorrar datos móviles */
$('#mapBtn').addEventListener('click', function(){
  var f = D.createElement('iframe'); f.src = C.mapaEmbed; f.title = 'Mapa del Instituto María Inmaculada'; f.referrerPolicy = 'no-referrer-when-downgrade';
  $('#map').appendChild(f); setTimeout(function(){ $('#map .ld').classList.add('gone'); }, 900); });
if (fx && 'IntersectionObserver' in window){
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); e.target.classList.toggle('pre', false); io.unobserve(e.target); } }); }, {threshold:.15});
  $$('.visit .up').forEach(function(el){ el.classList.add('pre'); io.observe(el); });
}
})();

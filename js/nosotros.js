/* ---------- Sobre nosotros ---------- */
(function(){
var C = window.IMI_CONFIG || {}, D = document, fx = D.documentElement.classList.contains('fx');
var $ = function(s){ return D.querySelector(s); }, $$ = function(s){ return [].slice.call(D.querySelectorAll(s)); };
$('#abHist').textContent = C.historia || 'Información próximamente.';
$('#abDea').textContent = C.codigoDEA ? 'Código D.E.A. ' + C.codigoDEA : (C.ciudad || '');
// Años desde la fundación (10 de enero de 1961), calculado con la fecha de hoy
var now = new Date(), y = now.getFullYear() - 1961; if (now < new Date(now.getFullYear(), 0, 10)) y--;
$('#abYears').textContent = y;
$$('.mv .rd').forEach(function(b){ b.addEventListener('click', function(){
  var c = b.closest('.mv'); c.classList.toggle('open'); b.textContent = c.classList.contains('open') ? 'Leer menos' : 'Leer completa'; }); });
var ARROW = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 21.5l1.4-5.1A9.5 9.5 0 1 1 7.7 20zm5.6-3.4.3.2a7.9 7.9 0 1 0-2.7-2.7l.2.3-.8 3z"/></svg>';
$('#lvs').innerHTML = (C.niveles || []).map(function(n){
  var msg = 'Hola, quisiera información sobre ' + n + ' en el ' + (C.nombre || 'colegio') + '.';
  return '<a href="https://wa.me/' + (C.whatsapp||'') + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener" data-hot><b>' + n + '</b><span>' + ARROW + 'Pedir información</span></a>';
}).join('');
// Aparición al hacer scroll
var els = $$('.about .up');
if (fx && 'IntersectionObserver' in window){
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ var t = e.target; t.classList.remove('pre'); io.unobserve(t); setTimeout(function(){ t.style.transitionDelay = ''; }, 1200); } }); }, {threshold:.2});
  els.forEach(function(el, i){ el.classList.add('pre'); io.observe(el); });
  var tl = $('#tl'); tl.classList.add('pre');
  var io2 = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ setTimeout(function(){ tl.classList.remove('pre'); }, 250); io2.disconnect(); } }, {threshold:.3});
  io2.observe(tl);
  $$('.mvv .up').forEach(function(el, i){ el.style.transitionDelay = (i*90) + 'ms'; });
}
})();

/* ==========================================================
   Partes comunes a todas las páginas: versión ligera, menú,
   cursor, pie de página y transición entre páginas.
   ========================================================== */
(function(){
var C = window.IMI_CONFIG || {}, D = document, H = D.documentElement;
var $ = function(s,r){return (r||D).querySelector(s)}, $$ = function(s,r){return [].slice.call((r||D).querySelectorAll(s))};

/* ---------- ¿Teléfono sencillo o datos lentos? → versión ligera ---------- */
var nc = navigator.connection || {};
var lite = matchMedia('(prefers-reduced-motion: reduce)').matches || nc.saveData ||
  /(^|-)2g|3g/.test(nc.effectiveType||'') || (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || /[?&]lite/.test(location.search);
if (/[?&]fx/.test(location.search)) lite = false;
if (!lite) H.classList.add('fx');
window.IMI_LITE = lite;

/* ---------- Datos desde config.js ---------- */
var wa = function(msg){ return 'https://wa.me/' + (C.whatsapp||'') + '?text=' + encodeURIComponent(msg); };
var waGen = wa('Hola, quisiera información sobre el ' + (C.nombre||'colegio') + '.');
var tel = (C.telefono||'').replace(/[^+0-9]/g,'');
$$('[data-c="ciudad"]').forEach(function(e){ e.textContent = C.ciudad || ''; });
$('#ig').href = C.instagram || '#';
$('#waFloat').href = waGen;
var menu = $('#intraMenu');
Object.keys(C.intranet||{}).forEach(function(k){ var a=D.createElement('a'); a.href=C.intranet[k]; a.target='_blank'; a.rel='noopener'; a.textContent=k; a.setAttribute('data-hot',''); menu.appendChild(a); });
$('#intraBtn').addEventListener('click', function(e){ if(e.target.closest('.menu a')) return; e.stopPropagation(); menu.classList.toggle('open'); });
D.addEventListener('click', function(){ menu.classList.remove('open'); });

/* Página actual marcada en el menú */
var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/,'') || 'index';
$$('[data-pg]').forEach(function(a){ a.classList.toggle('act', a.getAttribute('data-pg') === page); });

/* ---------- Menú del móvil ---------- */
var mm = $('#mm'), burger = $('#burger');
if (mm){
  $('#mmIn').innerHTML = Object.keys(C.intranet||{}).map(function(k){ return '<a href="' + C.intranet[k] + '" target="_blank" rel="noopener">' + k + '</a>'; }).join('');
  $('#mmWa').href = waGen; $('#mmIg').href = C.instagram || '#';
  $$('.mm>a').forEach(function(a,i){ a.style.transitionDelay = (180 + i*70) + 'ms'; });
  burger.addEventListener('click', function(e){ e.stopPropagation(); var o = H.classList.toggle('mm-open');
    burger.setAttribute('aria-expanded', o); H.style.overflow = o ? 'hidden' : ''; });
}
function closeMM(){ H.classList.remove('mm-open'); if (burger) burger.setAttribute('aria-expanded', false); H.style.overflow = ''; }

/* ---------- Cursor ---------- */
var cur = $('.cur');
if (!lite && matchMedia('(hover:hover) and (pointer:fine)').matches){
  D.addEventListener('pointermove', function(e){ cur.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';
    cur.classList.toggle('on', !!e.target.closest('[data-hot],a,button,input')); }, {passive:true});
  D.addEventListener('pointerdown', function(){ cur.classList.add('down') });
  D.addEventListener('pointerup', function(){ cur.classList.remove('down') });
}

/* ---------- Menú sólido al bajar ---------- */
var nav = $('#nav'), tk = false;
function onScroll(){ nav.classList.toggle('solid', scrollY > innerHeight*.3); tk = false; }
addEventListener('scroll', function(){ if(!tk){ tk = true; requestAnimationFrame(onScroll); } }, {passive:true});
onScroll();

/* ---------- Pie de página ---------- */
var ft = $('.foot');
if (ft){
  $('#ftDea').textContent = (C.codigoDEA ? 'Código D.E.A. ' + C.codigoDEA + ' · ' : '') + (C.horario ? 'Horario: ' + C.horario : '');
  $('#ftIntra').innerHTML = Object.keys(C.intranet||{}).map(function(k){ return '<a href="' + C.intranet[k] + '" target="_blank" rel="noopener">' + k + '</a>'; }).join('');
  $('#ftWa').href = waGen; $('#ftTel').textContent = C.telefono || ''; $('#ftTel').href = 'tel:' + tel;
  $('#ftMail').textContent = C.correo || ''; $('#ftMail').href = 'mailto:' + (C.correo||'');
  $('#ftIg').textContent = C.instagramUsuario || 'Instagram'; $('#ftIg').href = C.instagram || '#';
  $('#ftCopy').textContent = '© ' + new Date().getFullYear() + ' ' + (C.nombre||'');
}

/* ---------- Aparición al hacer scroll (tarjetas de páginas) ---------- */
if (!lite && 'IntersectionObserver' in window){
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ var t = e.target; io.unobserve(t);
    setTimeout(function(){ t.classList.remove('pre'); }, [].indexOf.call(t.parentNode.children, t) * 110); } }); }, {threshold:.15});
  $$('.pgc a').forEach(function(a){ a.classList.add('pre'); io.observe(a); });
}

/* ---------- Transición entre páginas ----------
   Al tocar un enlace a otra página, tres capas azules barren la pantalla
   de derecha a izquierda (como el cambio de fotos de la portada) y se ve
   el nombre de la página siguiente. En la página nueva, las capas se
   retiran hacia la izquierda. En la versión ligera no hay transición. */
var NAMES = {index:'Inicio', noticias:'Noticias y galería', nosotros:'Sobre nosotros', contacto:'Visítanos'};
var pt = $('#pt'), ptName = pt && $('.lb b', pt);
var KEY = 'imi-pt';
function getStore(){ try { return sessionStorage.getItem(KEY); } catch(e){ return null; } }
function setStore(v){ try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch(e){} }

function reveal(){
  var start = function(){ H.classList.add('ready'); D.body.classList.add('ready'); window.IMI_READY = true; D.dispatchEvent(new Event('imi:ready')); };
  if (!H.classList.contains('pt-in')){ setTimeout(start, lite ? 0 : 250); return; }
  ptName.textContent = NAMES[page] || '';
  var done = false, go = function(){ if (done) return; done = true;
    H.classList.add('pt-go'); setTimeout(start, 280);
    setTimeout(function(){ H.classList.remove('pt-in','pt-go'); }, 1150); };
  // esperamos a que cargue la foto principal (máximo 900 ms)
  var img = new Image(); img.onload = img.onerror = function(){ setTimeout(go, 120); }; img.src = 'assets/fachada-1280.webp';
  setTimeout(go, 900);
}
setStore(null);
reveal();

function samePage(u){ return u.pathname.replace(/index\.html$/,'') === location.pathname.replace(/index\.html$/,''); }
D.addEventListener('click', function(e){
  var a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === '_blank' || a.hasAttribute('download')) return;
  var u = new URL(a.href, location.href);
  if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
  if (samePage(u)){ closeMM(); return; }   // mismo documento (por ejemplo #galeria): sin cortina
  if (lite || !pt){ return; }
  e.preventDefault();
  var name = (u.pathname.split('/').pop() || 'index.html').replace(/\.html$/,'') || 'index';
  ptName.textContent = NAMES[name] || '';
  H.classList.remove('pt-in','pt-go'); H.classList.add('pt-out');
  setStore('1');
  setTimeout(function(){ location.href = u.href; }, 780);
});
/* Al volver con el botón «atrás», la página puede venir de la memoria: quitamos la cortina */
addEventListener('pageshow', function(e){ if (e.persisted){ H.classList.remove('pt-out','pt-in','pt-go'); closeMM(); setStore(null); } });
/* Precarga la página siguiente al pasar el dedo o el ratón por el enlace */
var pre = {};
function prefetch(e){ var a = e.target.closest && e.target.closest('a[href$=".html"],a[href="./"]'); if (!a || pre[a.href]) return; pre[a.href] = 1;
  var l = D.createElement('link'); l.rel = 'prefetch'; l.href = a.href; D.head.appendChild(l); }
D.addEventListener('pointerover', prefetch, {passive:true}); D.addEventListener('touchstart', prefetch, {passive:true});
})();

/* Portada: barra de inscripción, diapositivas y nubes */
(function(){
var C = window.IMI_CONFIG || {}, D = document, H = D.documentElement, lite = window.IMI_LITE;
var $ = function(s,r){return (r||D).querySelector(s)}, $$ = function(s,r){return [].slice.call((r||D).querySelectorAll(s))};
var wa = function(msg){ return 'https://wa.me/' + (C.whatsapp||'') + '?text=' + encodeURIComponent(msg); };
function whenReady(f){ if (window.IMI_READY) f(); else D.addEventListener('imi:ready', f, {once:true}); }
/* ---------- Barra de inscripción → WhatsApp ---------- */
var sel = { nivel:'', motivo:(C.motivos||['Inscripción'])[0] };
function fillPop(key, list){
  var p = $('#pop-'+key);
  list.forEach(function(v){ var b=D.createElement('button'); b.type='button'; b.textContent=v; b.setAttribute('data-hot','');
    if(sel[key]===v) b.className='sel';
    b.addEventListener('click', function(e){ e.stopPropagation(); sel[key]=v; $('#'+key+'Txt').textContent=v;
      $$('button',p).forEach(function(x){x.className=x===b?'sel':''}); closePops();
      if(key==='nivel' && !sel._m){ sel._m=1; openPop('motivo'); } });
    p.appendChild(b); });
}
fillPop('nivel', C.niveles||[]); fillPop('motivo', C.motivos||[]);
function closePops(){ $$('.pop.open').forEach(function(p){p.classList.remove('open')}); }
function openPop(k){ closePops(); $$('.field').forEach(function(f){f.classList.toggle('on', f.getAttribute('data-pop')===k)}); $('#pop-'+k).classList.add('open'); }
$$('[data-pop]').forEach(function(f){ f.addEventListener('click', function(e){ e.stopPropagation(); var k=f.getAttribute('data-pop'), p=$('#pop-'+k);
  if(p.classList.contains('open')) closePops(); else openPop(k); menu.classList.remove('open'); }); });
$('#nombre').addEventListener('focus', function(){ closePops(); $$('.field').forEach(function(f){f.classList.remove('on')}); this.closest('.field').classList.add('on'); });
D.addEventListener('click', function(){ closePops(); });
$('#search').addEventListener('submit', function(e){
  e.preventDefault();
  var n = $('#nombre').value.trim();
  var msg = 'Hola' + (n ? ', soy ' + n : '') + '. Me gustaría recibir información sobre: ' + sel.motivo.toLowerCase() +
    (sel.nivel ? ', para ' + sel.nivel : '') + ', en el ' + (C.nombre||'colegio') + '. ¡Gracias!';
  window.open(wa(msg), '_blank', 'noopener');
});

/* ---------- Portada: diapositivas ---------- */
var CAPS = [
  ['Familia IMI', 'Una educación integral que forja ciudadanos globales, inclusivos y con pensamiento crítico.'],
  ['De Inicial a Secundaria', 'Formación de niños, niñas y adolescentes junto a la familia y la comunidad.'],
  ['Valores', 'Respeto, exigencia y confianza: la base de la convivencia escolar y familiar.']
];
var slides = $$('.slide'), photos = slides.map(function(s){return $('.photo',s)}), thumbs = $$('.thumb');
var cur_i = 0, busy = false, timer = null, kbStart = performance.now(), px = 0, py = 0;
var hero = $('.hero'), mist = $('#mist');
slides.forEach(function(s,i){ s.style.zIndex = i===0 ? 2 : 1; s.style.visibility = i===0 ? 'visible' : 'hidden'; });

function vw(){ return innerWidth/100; }
function layoutRail(){
  var W = innerWidth, Hh = hero.offsetHeight, mob = W <= 640;
  var A = Math.max(mob?84:96, Math.min(190, W*.113)), I = Math.max(mob?42:46, Math.min(92, W*.054)), G = Math.max(8, W*.009);
  var cx = W*.855, y = 74 + Hh*.085;
  if (mob){
    var hr = hero.getBoundingClientRect(), tb = $('.title', slides[cur_i]).getBoundingClientRect().bottom - hr.top + 16;
    var sTop = $('#search').getBoundingClientRect().top - hr.top - 14 - (H.classList.contains('ready')?0:30);
    y = Math.max(y, tb); var room = sTop - y, need = A + 2*I + 2*G;
    if (room < need){ var k = Math.max(.55, room/need); A*=k; I*=k; }
    cx = W - A/2 - 14;
  }
  var act;
  thumbs.forEach(function(t){ var on = +t.getAttribute('data-s') === cur_i, s = on ? A : I;
    t.style.width = t.style.height = s+'px'; t.style.left = (cx - s/2)+'px'; t.style.top = y+'px';
    t.classList.toggle('act', on); if (on) act = {y:y + s/2}; y += s + G; });
  [['#r1', A/2 + W*.05], ['#r2', A/2 + W*.108]].forEach(function(r){ var e=$(r[0]); e.style.width=e.style.height=(r[1]*2)+'px'; e.style.left=(cx-r[1])+'px'; e.style.top=(act.y-r[1])+'px'; });
  var cl = Math.max(40, W*.047), connR = cx - A/2 - W*.008, conn = $('#conn');
  conn.style.width = cl+'px'; conn.style.left = (connR - cl)+'px'; conn.style.top = (act.y - 1.5)+'px';
  var cap = $('#cap'); cap.style.right = (W - (connR - cl - 16))+'px'; cap.style.left = 'auto'; cap.style.top = act.y+'px';
  $('.bar', cap).style.height = Math.max(84, W*.065)+'px';
}
function showCap(i){ var cap=$('#cap'); $('h3',cap).textContent=CAPS[i][0]; $('p',cap).textContent=CAPS[i][1]; cap.classList.add('show'); $('#conn').classList.add('show'); }
function hideCap(){ $('#cap').classList.remove('show'); $('#conn').classList.remove('show'); }

var ease = function(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; };
function setMask(el, p){
  var a = p*135-35, b = p*135, m = (a+b)/2;
  var g = 'linear-gradient(to left,#000 '+a+'%,rgba(0,0,0,.6) '+m+'%,transparent '+b+'%)';
  el.style.webkitMaskImage = g; el.style.maskImage = g;
}
function clearMask(el){ el.style.webkitMaskImage = el.style.maskImage = ''; }

function go(n){
  if (busy || n === cur_i) return;
  var from = cur_i, inS = slides[n], outS = slides[from];
  cur_i = n; layoutRail(); hideCap(); restart();
  $$('.title .w>span', inS).forEach(function(s){ s.style.transition='none'; s.style.transform='none'; });
  if (lite){ // versión ligera: cambio directo, sin animación
    outS.style.visibility='hidden'; inS.style.visibility='visible'; inS.style.zIndex=2; outS.style.zIndex=1;
    showCap(n); return;
  }
  busy = true;
  inS.style.zIndex = 3; inS.style.visibility = 'visible'; setMask(inS, 0);
  var pin = photos[n], pout = photos[from], t0 = performance.now(), D_ = 1250;
  setTimeout(function(){ showCap(n); }, 650);
  (function step(now){
    var t = Math.min(1, (now - t0)/D_), p = ease(t);
    setMask(inS, p);
    pin.style.transform = 'translateX('+(2-2*p)+'%) scale('+(1.12 - .08*p)+')';
    pout.style.transform = 'translateX('+(-2*p)+'%) scale('+(1.04 + .05*p)+')';
    var edge = 100 - (p*135 - 17.5);
    mist.style.left = edge+'%'; mist.style.opacity = (Math.sin(Math.PI*t)*.95).toFixed(3);
    if (t < 1) requestAnimationFrame(step);
    else {
      clearMask(inS); inS.style.zIndex = 2; outS.style.zIndex = 1; outS.style.visibility = 'hidden';
      pout.style.transform = 'scale(1.04)'; mist.style.opacity = 0; busy = false; kbStart = performance.now();
    }
  })(t0);
}
function restart(){ clearInterval(timer); if (!lite) timer = setInterval(function(){ go((cur_i+1)%3); }, 5200); }
thumbs.forEach(function(t){ t.addEventListener('click', function(){ go(+t.getAttribute('data-s')); }); });

/* Ken Burns lento + paralaje con el puntero */
if (!lite){
  D.addEventListener('pointermove', function(e){ px = (e.clientX/innerWidth - .5)*2; py = (e.clientY/innerHeight - .5)*2; }, {passive:true});
  (function kb(now){
    if (!busy){ var s = 1.04 + Math.min(12, (now-kbStart)/1000)*.0035;
      photos[cur_i].style.transform = 'translate('+(px*-.6)+'%,'+(py*-.5)+'%) scale('+s+')'; }
    requestAnimationFrame(kb);
  })(performance.now());
}

/* ---------- Scroll ---------- */
var nav = $('#nav'), stack = $('#stack'), clouds = $('#clouds'), ct = $('#cloudsTop'), rail = $('#rail'), ticking = false;
function onScroll(){
  var y = scrollY, vh = innerHeight;
  nav.classList.toggle('solid', y > vh*.3);
  if (!lite && y < vh*1.3){
    stack.style.transform = 'translateY('+(y*.42)+'px)';
    clouds.style.transform = 'translateY('+(-y*.38)+'px) scale('+(1 + .35*y/vh)+')';
    ct.style.opacity = Math.min(1, y/(.45*vh)); ct.style.transform = 'scaleY(-1) translateY('+(y*.25)+'px)';
    rail.style.transform = 'translateY('+(y*.2)+'px)'; rail.style.opacity = Math.max(0, 1 - y/(.5*vh));
  }
  ticking = false;
}
addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
addEventListener('resize', layoutRail);

/* ---------- Entrada ---------- */
layoutRail(); onScroll();
var words = $$('.slide[data-i="0"] .title .w>span');
words.forEach(function(s,i){ s.style.transitionDelay = (i*90)+'ms'; });
thumbs.slice().reverse().forEach(function(t,i){ t.style.transitionDelay = (350 + i*140)+'ms'; });
whenReady(function(){ setTimeout(function(){ thumbs.forEach(function(t){ t.style.transitionDelay=''; }); showCap(0); restart(); }, lite ? 50 : 650); });
if (D.fonts && D.fonts.ready) D.fonts.ready.then(layoutRail);
})();

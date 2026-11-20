/* ---------- Noticias y galería + ficha de detalle ---------- */
(function(){
var C = window.IMI_CONFIG || {}, ITEMS = window.IMI_CONTENIDO || [], D = document, H = D.documentElement;
var $ = function(s,r){return (r||D).querySelector(s)}, $$ = function(s,r){return [].slice.call((r||D).querySelectorAll(s))};
var fx = function(){ return H.classList.contains('fx'); };
var WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 21.5l1.4-5.1A9.5 9.5 0 1 1 7.7 20zm5.6-3.4.3.2a7.9 7.9 0 1 0-2.7-2.7l.2.3-.8 3zM9 7.4c.2 0 .4 0 .6.4l.8 1.9c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.2.3 0 .5.5.9 1.2 1.7 2 2.3.6.5 1.2.8 1.6 1 .2.1.4.1.5-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.3 0 1-.4 1.5-.4.5-1.3.9-1.9.9-.6 0-1.4-.1-3.3-1-2.3-1.1-3.8-3.4-3.9-3.6-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.9-2 .2-.3.4-.3.6-.3z"/></svg>';
var CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
var CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';
var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var cover = function(it){ return it.fotos[it.portada||0]; };
var waTo = function(msg){ return 'https://wa.me/' + (C.whatsapp||'') + '?text=' + encodeURIComponent(msg); };
var link = function(it){ return location.origin + location.pathname + '#ver-' + it.id; };

function cardHTML(it, i){
  var news = it.tipo === 'noticia', img = cover(it);
  return '<article class="card ' + (news?'news':'album') + '" data-id="' + it.id + '" tabindex="0" role="button" aria-label="' + esc(it.titulo) + '" data-hot>' +
    '<div class="ph">' + (news ? '<img class="bg" src="' + img + '" alt="" loading="lazy">' : '') +
      '<img class="fg" src="' + img + '" alt="" loading="lazy" decoding="async"></div>' +
    '<span class="tag">' + (news ? 'Noticia <span>· ' + esc(it.autor) + '</span>' : 'Galería <span>· ' + it.fotos.length + ' fotos</span>') + '</span>' +
    '<button class="share" aria-label="Compartir por WhatsApp" data-hot>' + WA + '</button>' +
    '<div class="info"><h3>' + esc(it.titulo) + '</h3><div class="meta">' + (news ? CAL + esc(it.fecha) : CAM + 'Álbum de fotos') + '</div></div>' +
  '</article>';
}
function render(el, list){
  el.innerHTML = list.map(cardHTML).join('');
  $$('.card', el).forEach(function(c, i){
    var it = ITEMS.filter(function(x){ return x.id === c.getAttribute('data-id'); })[0];
    c.addEventListener('click', function(e){
      if (e.target.closest('.share')){ e.stopPropagation();
        window.open('https://wa.me/?text=' + encodeURIComponent(it.titulo + ' · ' + (C.nombre||'') + ' ' + link(it)), '_blank', 'noopener'); return; }
      open(it, c);
    });
    c.addEventListener('keydown', function(e){ if (e.key === 'Enter') open(it, c); });
  });
  reveal(el);
}

/* Entrada al hacer scroll */
var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
  es.forEach(function(e){ if (e.isIntersecting){ var c = e.target; io.unobserve(c);
    var cols = getComputedStyle(c.parentNode).gridTemplateColumns.split(' ').length;
    var idx = [].indexOf.call(c.parentNode.children, c);
    setTimeout(function(){ c.classList.remove('pre'); }, (idx % cols) * 90); } });
}, {threshold:.15}) : null;
function reveal(el){ if (!io || !fx()) return; $$('.card', el).forEach(function(c){ c.classList.add('pre'); io.observe(c); }); }

/* Rejilla: todas las publicaciones + filtros */
var grid = $('#grid');
render(grid, ITEMS);
var flt = $$('#flt button');
function filter(k){ flt.forEach(function(b){ var on = b.getAttribute('data-f') === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $$('.card', grid).forEach(function(c){ var it = ITEMS.filter(function(x){ return x.id === c.getAttribute('data-id'); })[0];
    c.classList.toggle('hide', k !== 'todo' && it.tipo !== k); }); }
flt.forEach(function(b){ b.addEventListener('click', function(){ filter(b.getAttribute('data-f')); }); });
function hashFilter(){ if (location.hash === '#galeria') filter('galeria'); }
addEventListener('hashchange', hashFilter); hashFilter();

/* Ficha de detalle */
var dt = $('#dt'), mainph = $('#mainph'), mainimg = $('#mainimg'), nav = $('#nav'), cur = null, flying = null;
var ease = function(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; };
function fill(it){
  var news = it.tipo === 'noticia';
  $('#dtCrumb').textContent = it.titulo;
  $('#dtTitle').textContent = it.titulo;
  $('#dtBy').textContent = news ? ('Publicado por ' + it.autor + ' · ' + it.fecha) : ('Álbum de fotos · ' + it.fotos.length + ' fotos');
  $('#dtText').innerHTML = news ? '<h2>Sobre esta publicación</h2>' + it.texto.map(function(t){ return '<p class="tx">' + esc(t) + '</p>'; }).join('') : '';
  mainph.style.aspectRatio = it.ancho + ' / ' + it.alto;
  mainimg.src = cover(it); mainimg.alt = it.titulo;
  var rest = it.fotos.filter(function(f, i){ return i !== (it.portada||0); });
  var th = $('#dtThumbs'), ap = $('#allph');
  th.innerHTML = rest.slice(0,3).map(function(f, i){
    var more = (i === 2 && rest.length > 3) ? ' class="more" data-n="+' + (rest.length - 2) + '"' : '';
    return '<button' + more + ' data-src="' + f + '" data-hot><img src="' + f + '" alt="" loading="lazy"></button>'; }).join('');
  th.style.display = rest.length ? '' : 'none';
  ap.classList.remove('on');
  ap.innerHTML = it.fotos.map(function(f){ return '<img src="' + f + '" alt="" loading="lazy" data-hot>'; }).join('');
  $$('button', th).forEach(function(b){ b.addEventListener('click', function(){
    if (b.classList.contains('more')){ ap.classList.add('on'); ap.scrollIntoView({behavior:'smooth', block:'nearest'}); return; }
    mainimg.src = b.getAttribute('data-src'); }); });
  $$('img', ap).forEach(function(im){ im.addEventListener('click', function(){ mainimg.src = im.src; mainph.scrollIntoView({behavior:'smooth', block:'center'}); }); });
  $('#dtWa').href = waTo('Hola, vi en la web la publicación «' + it.titulo + '» del ' + (C.nombre||'colegio') + ' y quisiera más información.');
  var adj = $('#dtAdj'); adj.style.display = it.adjunto ? '' : 'none'; if (it.adjunto) adj.href = it.adjunto;
  var others = ITEMS.filter(function(x){ return x.id !== it.id; }).slice(0, 4);
  render($('#simGrid'), others);
  $$('.rise', dt).forEach(function(r, i){ r.style.transitionDelay = (250 + i*70) + 'ms'; });
}
function open(it, fromCard, noHistory){
  cur = it; fill(it); dt.scrollTop = 0;
  H.style.overflow = 'hidden'; nav.classList.add('solid');
  if (!noHistory && location.hash !== '#ver-' + it.id) history.pushState({ver:it.id}, '', '#ver-' + it.id);
  dt.classList.add('open'); dt.classList.remove('shown');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ dt.classList.add('shown'); }); });
  var src = fromCard && $('.ph img.fg', fromCard);
  if (!src || !fx()){ mainph.classList.remove('wait'); return; }
  mainph.classList.add('wait');
  requestAnimationFrame(function(){
    var a = src.getBoundingClientRect(), b = mainph.getBoundingClientRect();
    if (flying) flying.remove();
    var f = flying = D.createElement('img'); f.src = src.currentSrc || src.src; f.className = 'flight';
    f.style.objectFit = fromCard.classList.contains('news') ? 'contain' : 'cover';
    D.body.appendChild(f);
    var t0 = performance.now();
    (function step(now){
      var t = Math.min(1, (now - t0)/900), p = ease(t);
      f.style.left = (a.left + (b.left - a.left)*p) + 'px'; f.style.top = (a.top + (b.top - a.top)*p) + 'px';
      f.style.width = (a.width + (b.width - a.width)*p) + 'px'; f.style.height = (a.height + (b.height - a.height)*p) + 'px';
      f.style.borderRadius = (12 - 2*p) + 'px';
      if (t < 1) requestAnimationFrame(step);
      else { mainph.classList.remove('wait'); setTimeout(function(){ f.remove(); if (flying === f) flying = null; }, 60); }
    })(t0);
  });
}
function close(noHistory){
  if (!cur) return; cur = null;
  dt.classList.remove('open','shown'); H.style.overflow = '';
  if (flying){ flying.remove(); flying = null; }
  dispatchEvent(new Event('scroll'));
  if (!noHistory && /^#ver-/.test(location.hash)) history.back();
}
$$('[data-home]').forEach(function(a){ a.addEventListener('click', function(e){ if (cur){ e.preventDefault(); close(); } }); });
addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
function fromHash(){
  var m = location.hash.match(/^#ver-(.+)$/), it = m && ITEMS.filter(function(x){ return x.id === m[1]; })[0];
  if (it) open(it, null, true); else close(true);
}
addEventListener('popstate', fromHash);
if (/^#ver-/.test(location.hash)) fromHash();
})();

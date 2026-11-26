(()=>{
const D=window.CONSTRURAMA||{},R=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
/* ---- datos desde config.js ---- */
const waUrl='https://wa.me/'+(D.whatsapp||'')+'?text='+encodeURIComponent(D.whatsappTexto||'Hola');
$$('a[href*="wa.me/"],[data-wa]').forEach(a=>a.href=waUrl);
$$('[data-c]').forEach(el=>{const k=el.dataset.c,v=D[k];if(!v){el.textContent='Información próximamente';return}
 if(k==='telefonos'){el.innerHTML=v.map(t=>`<a href="tel:${t.replace(/[^+\d]/g,'')}">${t}</a>`).join('<br>')}else el.textContent=v});
$$('[data-href]').forEach(a=>{const v=D[a.dataset.href];if(v)a.href=v;else a.remove()});
$$('[data-ig]').forEach(a=>{if(D.instagram)a.href='https://www.instagram.com/'+D.instagram+'/';else a.remove()});
const mp=$('[data-map]');if(mp&&D.mapsEmbed)mp.src=D.mapsEmbed;
const ft=$('[data-foto]');if(ft&&D.fotoTienda){ft.style.backgroundImage=`url("${D.fotoTienda}")`;const n=$('.ph-note');if(n)n.remove()}

/* ---- medidas y modos ---- */
const html=document.documentElement,hw=$('#hwrap'),hero=$('#top'),hz=$('#hz'),copy=$('.copy'),lines=$$('.hl .ln'),topbar=$('.top'),facts=$('.facts'),coord=$('.coord'),cv=$('#mapa');
let vw,vh,sticky,wrapH;
function measure(){vw=html.clientWidth;vh=html.clientHeight;
 const mob=matchMedia('(max-width:900px),(orientation:portrait)').matches,shortL=vh<500;
 sticky=!mob&&!shortL;html.classList.toggle('sticky',sticky);
 if(hw){hw.style.height=sticky?(1.65*vh)+'px':(hero.offsetHeight+0.62*vh)+'px';wrapH=hw.offsetHeight}
 if(track)sizeTrack()}
let entranceDone=R;setTimeout(()=>entranceDone=true,1500);

/* ---- brillo de horizonte ---- */
const eio=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
function glow(y){
 const e=(wrapH-y)/vh-0.47;window.__heroE=e;
 const edge=e>0.12?e:-0.03+0.15*Math.exp((e-0.12)/0.15);
 const op=1-eio(clamp((-0.12-e)/0.4));
 if(op<.002||e>1.04){hz.style.display='none'}else{
  const Rx=Math.max(.75*vw,.9*vh),Ry=.72*vh,cy=edge*vh-Ry,s=m=>(m*Rx).toFixed(1)+'px';
  hz.style.display='block';hz.style.opacity=op;
  hz.style.background=`radial-gradient(${Rx}px ${Ry}px at 50% ${cy}px,rgba(255,255,255,0) 0,rgba(255,243,236,0) ${s(.985)},rgba(255,222,204,.6) ${s(1)},#ffb48a ${s(1.06)},#ff8a4d ${s(1.14)},#ff5500 ${s(1.236)},#ff7a33 ${s(1.32)},#ffb08a ${s(1.42)},#ffe6d9 ${s(1.53)},#fff ${s(1.65)})`}
 if(sticky)hero.style.visibility=e<-0.06?'hidden':'visible';else hero.style.visibility='visible';
 const k=clamp((0.95-e)/0.42);
 const kk=sticky?k:0;copy.style.opacity=1-kk;copy.style.transform=kk?`translateY(${-5*kk}vh)`:'';
 const nv=sticky?1-clamp((0.85-e)/0.4):1;topbar.style.opacity=nv;facts.style.opacity=nv;if(coord)coord.style.opacity=nv;
 cv.style.opacity=(.45+.55*clamp(e/0.7)).toFixed(3);
 if(entranceDone&&sticky){const j=k>0&&k<1?(((Math.floor(k*16)*9301+49297)%233280)/233280-.5):0;
  lines.forEach((l,i)=>{const o=j*0.09*(i%2?-1:1);if(!k){l.style.transform='';l.style.textShadow='';l.style.clipPath='';return}
   l.style.transform=`translateX(${o}em)`;l.style.textShadow=`${-1.6*o}em 0 0 rgba(255,85,0,${.7*k+.15}),${.8*o}em 0 0 rgba(17,27,73,.25)`;l.style.clipPath=`inset(0 ${k*k*100}% 0 0)`})}
}

/* ---- escena de productos ---- */
const track=$('#productos'),strip=$('#strip'),giant=$('.giant'),cards=$$('.card');let B=1,sw=0,gw=0;const solo=!!track&&track.classList.contains('solo');
function sizeTrack(){sw=strip.scrollWidth;gw=giant.scrollWidth;B=(sw+.45*vw)/vw*1.1;track.style.height=((1+B)*vh)+'px'}
function scene(y){const top=track.offsetTop,r=clamp((y-top)/(B*vh));
 const s0=solo?.06*vw:vw,s1=vw-(sw+.45*vw);strip.style.transform=`translate3d(${s0+r*(s1-s0)}px,0,0)`;giant.style.transform=`translate3d(${.05*vw-r*(gw-.4*vw)}px,0,0)`;
 track.classList.toggle('done',r>=0.94);
 cards.forEach(c=>{const L=c.getBoundingClientRect().left;c.style.setProperty('--s',(clamp((0.98-L/vw)/0.3,-0.4,1.6)*100)+'%')})}

/* ---- apariciones y contadores ---- */
const glitchKF=[
 {offset:0,opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translateX(-.05em)',textShadow:'-.12em 0 0 rgba(255,85,0,.8), .07em 0 0 rgba(17,27,73,.25)'},
 {offset:.3,opacity:1,clipPath:'inset(0 38% 0 0)',transform:'translateX(.035em)',textShadow:'.09em 0 0 rgba(255,85,0,.65), -.05em 0 0 rgba(17,27,73,.3)'},
 {offset:.55,opacity:.8,clipPath:'inset(0 0 0 0)',transform:'translateX(-.018em)',textShadow:'-.045em 0 0 rgba(255,85,0,.55), .025em 0 0 rgba(17,27,73,.2)'},
 {offset:.78,opacity:1,clipPath:'inset(0 0 0 0)',transform:'translateX(.008em)',textShadow:'.015em 0 0 rgba(255,85,0,.35)'},
 {offset:1,opacity:1,clipPath:'inset(0 0 0 0)',transform:'none',textShadow:'none'}];
const gl=(el,d)=>{if(!R)el.animate(glitchKF,{duration:900,delay:d,easing:'steps(14,end)',fill:'backwards'})};
const fmt=(el,v)=>{const f=el.dataset.fmt;el.textContent=f==='k'?Math.round(v)+'K+':f==='pct'?Math.round(v)+'%':Math.round(v)};
function count(el){const to=+el.dataset.count;if(R||!to){fmt(el,to);return}fmt(el,0);const t0=performance.now();
 const st=n=>{const k=clamp((n-t0)/1600);fmt(el,to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)}
const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);
 if(el.id==='ph'){el.classList.add('on')}
 else if(el.classList.contains('big')){$$('.big .ln').forEach((l,i)=>gl(l,i*130))}
 else{el.classList.add('on');const n=el.querySelector('.n');if(n){gl(n,60);if(n.dataset.count!==undefined)count(n)}}
}),{threshold:0,rootMargin:'0px 0px -15% 0px'});
if(R){$$('.rv').forEach(e=>e.classList.add('on'));const ph=$('#ph');if(ph)ph.classList.add('on')}else{[$('#ph'),$('.big'),...$$('.rv')].filter(Boolean).forEach(e=>io.observe(e))}
$$('.nums .n[data-count]').forEach(n=>{if(!R)n.textContent=n.dataset.fmt==='pct'?'0%':'0K+'});

/* ---- bucle ---- */
let last=-1;
function loop(){const y=scrollY;if(y!==last){last=y;if(hw)glow(y);if(track)scene(y);if(R&&window.__redrawMapa)window.__redrawMapa()}requestAnimationFrame(loop)}
addEventListener('resize',()=>{measure();last=-1});
measure();document.fonts.ready.then(()=>{measure();last=-1});requestAnimationFrame(loop);
})();

/* Menú móvil (todas las páginas) */
(()=>{
const m=document.getElementById('mnav'),b=document.querySelector('.mb');if(!m||!b)return;
const open=()=>{m.classList.add('in');m.setAttribute('aria-hidden','false');b.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';const x=m.querySelector('.mx');if(x)x.focus()};
const close=()=>{m.classList.remove('in');m.setAttribute('aria-hidden','true');b.setAttribute('aria-expanded','false');document.body.style.overflow=''};
b.onclick=open;m.querySelectorAll('.mx,ol a').forEach(a=>a.addEventListener('click',close));
addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('in')){close();b.focus()}});
const D=window.CONSTRURAMA||{},w=m.querySelector('[data-wa]');
if(w)w.href='https://wa.me/'+(D.whatsapp||'')+'?text='+encodeURIComponent(D.whatsappTexto||'Hola');
})();

/* Mi lista compartida (calculadora, guía y cualquier página). Guarda en localStorage 'construramaLista'. */
(()=>{
const D=window.CONSTRURAMA||{},KEY='construramaLista',subs=[];let L=[];
try{L=JSON.parse(localStorage.getItem(KEY)||'[]')||[]}catch(e){L=[]}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}};
const wa=t=>'https://wa.me/'+(D.whatsapp||'')+'?text='+encodeURIComponent(t);
const emit=()=>{save();subs.forEach(f=>f(L));draw()};
const api=window.Lista={items:()=>L.slice(),add(it){L.push(it);emit();pulse()},remove(i){L.splice(i,1);emit()},clear(){L=[];emit()},on(f){subs.push(f);f(L)},wa,
 waLista:()=>wa('Hola, vengo de la web de Centro Construrama. Quisiera cotizar esta lista:\n'+L.map((it,i)=>`${i+1}. ${it.full}`).join('\n')+'\n¿Me dicen precio y disponibilidad? Gracias.'),open,close};
/* ---- interfaz: botón flotante + panel ---- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chip=document.createElement('button');chip.type='button';chip.className='ml-chip';chip.setAttribute('aria-haspopup','dialog');
const dr=document.createElement('div');dr.className='ml-dr';dr.setAttribute('role','dialog');dr.setAttribute('aria-modal','true');dr.setAttribute('aria-label','Mi lista');dr.hidden=true;
dr.innerHTML=`<div class="ml-bg" data-x></div><div class="ml-p"><div class="ml-h"><p class="mono">Mi lista</p><button type="button" class="ml-x" data-x aria-label="Cerrar">×</button></div><ol class="ml-items"></ol><p class="ml-empty">Tu lista está vacía. Usa la calculadora o la guía «¿Qué necesito para…?» para añadir cosas.</p><div class="ml-f"><button type="button" class="ml-clear">Vaciar lista</button><a class="btn ml-send" target="_blank" rel="noopener" href="#">Enviar por WhatsApp<span class="ic"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z"/></svg></span></a></div></div>`;
document.body.append(chip,dr);
const waBar=document.querySelector('.wa');
function draw(){const n=L.length;chip.innerHTML=`Mi lista <b>${n}</b>`;chip.classList.toggle('on',n>0);
 if(waBar){waBar.classList.toggle('has',n>0);const t=waBar.firstChild;if(t&&t.nodeType===3)t.textContent=n?`Enviar mi lista (${n})`:'Escríbenos por WhatsApp'}
 dr.querySelector('.ml-items').innerHTML=L.map((it,i)=>`<li><div><strong>${esc(it.titulo)}</strong><small>${esc(it.txt)}</small></div><button type="button" data-i="${i}" aria-label="Quitar">Quitar</button></li>`).join('');
 dr.querySelectorAll('.ml-items button').forEach(b=>b.onclick=()=>api.remove(+b.dataset.i));
 dr.querySelector('.ml-empty').hidden=n>0;dr.querySelector('.ml-f').hidden=!n;dr.querySelector('.ml-send').href=api.waLista()}
let lastFocus=null;
function open(){lastFocus=document.activeElement;dr.hidden=false;requestAnimationFrame(()=>dr.classList.add('in'));dr.querySelector('.ml-x').focus()}
function close(){dr.classList.remove('in');setTimeout(()=>{dr.hidden=true},250);if(lastFocus)lastFocus.focus()}
function pulse(){chip.classList.remove('pu');void chip.offsetWidth;chip.classList.add('pu');if(waBar){waBar.classList.remove('pu');void waBar.offsetWidth;waBar.classList.add('pu')}}
chip.onclick=open;dr.querySelectorAll('[data-x]').forEach(e=>e.onclick=close);dr.querySelector('.ml-clear').onclick=()=>api.clear();
addEventListener('keydown',e=>{if(e.key==='Escape'&&!dr.hidden)close()});
if(waBar)waBar.addEventListener('click',e=>{if(L.length){e.preventDefault();open()}});
addEventListener('storage',e=>{if(e.key===KEY){try{L=JSON.parse(e.newValue||'[]')||[]}catch(_){L=[]}subs.forEach(f=>f(L));draw()}});
draw();
})();

/* Capa premium: barra de progreso, luz que sigue el cursor, botones magnéticos */
(()=>{
const R=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
const pb=document.createElement('div');pb.className='prog';pb.setAttribute('aria-hidden','true');document.body.appendChild(pb);
const up=()=>{const h=document.documentElement.scrollHeight-innerHeight;pb.style.transform=`scaleX(${h>0?Math.min(1,scrollY/h):0})`};
addEventListener('scroll',up,{passive:true});addEventListener('resize',up);up();
document.querySelectorAll('.acc-l a').forEach(a=>a.addEventListener('pointermove',e=>{const r=a.getBoundingClientRect();a.style.setProperty('--mx',(e.clientX-r.left)+'px');a.style.setProperty('--my',(e.clientY-r.top)+'px')}));
if(fine&&!R)document.querySelectorAll('.btn').forEach(b=>{
 b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;b.style.transform=`translate(${x*8}px,${y*6-2}px)`});
 b.addEventListener('pointerleave',()=>{b.style.transform=''})});
})();

/* Transición entre páginas: cortina naranja + azul. Entrada: la cortina se retira. */
(()=>{
const c=document.documentElement.classList,ready=()=>{if(window.__introR)window.__introR()};
if(c.contains('pt-in')){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{c.add('pt-go');setTimeout(ready,180);setTimeout(()=>c.remove('pt-in','pt-go'),1100)}));
}
const R=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pre=new Set();
document.addEventListener('pointerover',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;const u=new URL(a.href,location.href);
 if(u.origin===location.origin&&!pre.has(u.pathname)){pre.add(u.pathname);const l=document.createElement('link');l.rel='prefetch';l.href=u.pathname;document.head.appendChild(l)}},{passive:true});
document.addEventListener('click',e=>{
 const a=e.target.closest&&e.target.closest('a[href]');
 if(!a||R||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
 const u=new URL(a.href,location.href);
 if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search))return;
 e.preventDefault();try{sessionStorage.setItem('cc_pt','1')}catch(_){}
 c.add('pt-out');setTimeout(()=>{location.href=u.href},680);
});
addEventListener('pageshow',e=>{if(e.persisted)c.remove('pt-out','pt-in','pt-go')});
})();

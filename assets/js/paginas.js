/* ===== Sobre nosotros: foto real opcional y entradas suaves ===== */
(function(){
  var sec=document.getElementById("nosotros");if(!sec)return;
  var CFG=window.MONTANA_CONFIG||{},RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lg=sec.querySelector(".nos-ph .lg"),bi=document.querySelector(".brand img");if(lg&&bi)lg.src=bi.src;
  var foto=String(CFG.fotoNosotros||"").trim();
  if(foto){var fig=document.getElementById("nosPhoto"),im=new Image();im.alt=CFG.fotoNosotrosAlt||"Tiendas Montana, La Pinturería, en Carora";im.loading="lazy";im.decoding="async";
    im.onload=function(){fig.querySelector(".nos-ph").remove();fig.insertBefore(im,fig.firstChild)};im.src=foto}
  var go=document.getElementById("nosGo");
  go.addEventListener("click",function(e){var v=document.getElementById("visitanos");if(!v)return;e.preventDefault();scrollTo({top:v.getBoundingClientRect().top+scrollY,behavior:RM?"auto":"smooth"})});
  if(!("IntersectionObserver" in window)||RM)return;
  sec.classList.add("nos-js");
  var num=document.getElementById("nos24");
  function count(){var t0=performance.now(),D=1100;num.textContent="0";
    (function step(t){var p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);num.textContent=String(Math.round(24*e));if(p<1)requestAnimationFrame(step)})(t0)}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;x.target.classList.add("in");io.unobserve(x.target);if(x.target.classList.contains("nos-head"))count()})},{threshold:.18,rootMargin:"0px 0px -8% 0px"});
  [].forEach.call(sec.querySelectorAll("[data-nos]"),function(el){io.observe(el)});
  setTimeout(function(){[].forEach.call(sec.querySelectorAll("[data-nos]"),function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.classList.add("in")})},50);
})();
/* ===== Visítanos: todo se construye desde MONTANA_CONFIG ===== */
(function(){
  var sec=document.getElementById("visitanos");if(!sec)return;
  var C=window.MONTANA_CONFIG||{},$=function(i){return document.getElementById(i)};
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function s(v){return String(v==null?"":v).trim()}
  function esc(t){return t.replace(/[&<>"']/g,function(c){return"&#"+c.charCodeAt(0)+";"})}
  function okUrl(u,hosts){try{var x=new URL(u);return x.protocol==="https:"&&hosts.some(function(h){return x.hostname===h||x.hostname.endsWith("."+h)})}catch(e){return false}}
  var SOON='<span class="vt-soon">Información próximamente</span>';
  var address=s(C.address||C.direccion),phone=s(C.phone||C.telefono),hours=C.hours||C.horario||"",ig=s(C.instagram);
  var wa=s(C.whatsapp).replace(/\D/g,"");
  var maps=s(C.mapsUrl),embed=s(C.mapsEmbedUrl),waze=s(C.wazeUrl);
  if(maps&&!okUrl(maps,["google.com","goo.gl","maps.app.goo.gl"]))maps="";
  if(waze&&!okUrl(waze,["waze.com"]))waze="";
  if(embed&&!okUrl(embed,["google.com"]))embed="";
  var waLink=wa?"https://wa.me/"+wa+"?text="+encodeURIComponent("Hola, Tiendas Montana. Quiero hacer una consulta."):"";
  var igUser="",igLink="";
  if(ig){if(/^https?:\/\//i.test(ig)){if(okUrl(ig,["instagram.com"])){igLink=ig;igUser="@"+(new URL(ig).pathname.split("/").filter(Boolean)[0]||"")}}
    else{igUser="@"+ig.replace(/^@/,"").replace(/[^\w.]/g,"");if(igUser.length>1)igLink="https://www.instagram.com/"+igUser.slice(1)+"/";else igUser=""}}
  function link(a,href,soonText){
    if(href){a.href=href;a.removeAttribute("aria-disabled");a.removeAttribute("tabindex")}
    else{a.removeAttribute("href");a.setAttribute("aria-disabled","true");a.tabIndex=-1;if(soonText){var sp=a.querySelector("span")||a;if(a.classList.contains("vt-b"))a.insertAdjacentHTML("beforeend","<em>"+soonText+"</em>");else sp.textContent=soonText}}
  }
  /* Ubicación */
  $("vtAddr").innerHTML=address?esc(address):"Carora, estado Lara";
  link($("vtAddrA"),maps,"Cómo llegar: próximamente");
  /* Horario */
  var hl=(Array.isArray(hours)?hours:String(hours).split(/\n/)).map(s).filter(Boolean);
  if(hl.length)$("vtHours").innerHTML=hl.map(esc).join("<br>");else{var hli=$("vtHours").closest("li");if(hli)hli.style.display="none"}
  /* Contacto */
  var ct=[];
  if(phone)ct.push('<a href="tel:'+phone.replace(/[^\d+]/g,"")+'">'+esc(phone)+'</a><small>Teléfono</small>');
  if(wa)ct.push('<a href="'+waLink+'" target="_blank" rel="noopener">+'+wa+'</a><small>WhatsApp</small>');
  $("vtContact").innerHTML=ct.length?ct.join('<span style="display:block;height:8px"></span>'):SOON;
  link($("vtWaA"),waLink,"WhatsApp: próximamente");
  /* Instagram */
  $("vtIg").innerHTML=igLink?'<a href="'+igLink+'" target="_blank" rel="noopener">'+esc(igUser)+'</a><small>Instagram</small>':SOON;
  link($("vtIgA"),igLink,"Instagram: próximamente");
  /* Botones */
  link($("vtGo"),maps,"Próximamente");
  link($("vtWaze"),waze,"Próximamente");
  link($("vWa"),waLink,"Próximamente");
  $("vWa").hidden=false;
  /* Mapa: solo se incrusta si hay un enlace de Google Maps configurado (nunca una ubicación inventada) */
  if(embed){
    var put=function(){if(sec.dataset.map)return;sec.dataset.map="1";var f=document.createElement("iframe");f.src=embed;f.title="Mapa de Tiendas Montana en Carora";f.loading="lazy";f.referrerPolicy="no-referrer-when-downgrade";f.allowFullscreen=true;$("vtMap").appendChild(f);$("vtPend").remove()};
    if("IntersectionObserver" in window){var mo=new IntersectionObserver(function(e){if(e[0].isIntersecting){mo.disconnect();put()}},{rootMargin:"500px 0px"});mo.observe($("vtMap"))}else put();
  }
  /* Entradas suaves */
  if(!("IntersectionObserver" in window)||RM)return;
  sec.classList.add("vt-js");
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.15,rootMargin:"0px 0px -6% 0px"});
  [].forEach.call(sec.querySelectorAll("[data-vt]"),function(el){io.observe(el)});
})();
/* ===== Detalle visual 5: fotos reales y confianza (solo con contenido de MONTANA_CONFIG) ===== */
(function(){
  var C=window.MONTANA_CONFIG||{},sec=document.getElementById("confianza");if(!sec)return;
  function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return"&#"+c.charCodeAt(0)+";"})}
  function src(u){u=String(u||"").trim();if(!u)return"";if(/^https:\/\//i.test(u))return u;if(/^[\w.\/-]+$/.test(u)&&u.indexOf("..")<0)return u;return""}
  var arr=function(a){return Array.isArray(a)?a:[]};
  var fotos=arr(C.fotosTienda).filter(function(x){return x&&src(x.src)}).slice(0,6);
  var trab=arr(C.trabajos).filter(function(x){return x&&src(x.antes)&&src(x.despues)}).slice(0,4);
  var ops=arr(C.opiniones).filter(function(x){return x&&String(x.texto||"").trim()&&String(x.nombre||"").trim()}).slice(0,6);
  if(!fotos.length&&!trab.length&&!ops.length)return;
  if(fotos.length){var fe=document.getElementById("cfFotos");fe.hidden=false;
    fe.innerHTML=fotos.map(function(x){return '<figure class="cf-f"><img src="'+esc(src(x.src))+'" alt="'+esc(x.alt||"Tiendas Montana en Carora")+'" loading="lazy" decoding="async">'+(x.pie?'<figcaption>'+esc(x.pie)+'</figcaption>':'')+'</figure>'}).join("")}
  if(trab.length){var ae=document.getElementById("cfAD");ae.hidden=false;
    ae.innerHTML=trab.map(function(x,i){return '<figure class="cf-adw"><div class="cf-ba" style="--p:50%"><img src="'+esc(src(x.antes))+'" alt="Antes'+(x.texto?": "+esc(x.texto):"")+'" loading="lazy" decoding="async"><img class="cf-de" src="'+esc(src(x.despues))+'" alt="Después'+(x.texto?": "+esc(x.texto):"")+'" loading="lazy" decoding="async"><span class="cf-tg a">Antes</span><span class="cf-tg d">Después</span><span class="cf-ln" aria-hidden="true"></span><input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después"></div>'+(x.texto?'<figcaption>'+esc(x.texto)+'</figcaption>':'')+'</figure>'}).join("");
    ae.querySelectorAll(".cf-ba").forEach(function(b){var r=b.querySelector("input");r.addEventListener("input",function(){b.style.setProperty("--p",r.value+"%")})})}
  if(ops.length){var oe=document.getElementById("cfOp");oe.hidden=false;
    oe.innerHTML=ops.map(function(x){var n=Math.max(0,Math.min(5,Math.round(+x.estrellas||0)));
      return '<blockquote class="cf-o">'+(n?'<span class="cf-st" aria-label="'+n+' de 5 estrellas">'+"★★★★★".slice(0,n)+'<i>'+"★★★★★".slice(n)+'</i></span>':'')+'<p>'+esc(x.texto)+'</p><footer><b>'+esc(x.nombre)+'</b>'+(x.barrio?'<span>'+esc(x.barrio)+'</span>':'')+'</footer></blockquote>'}).join("")}
  sec.hidden=false;
})();
(function(){var els=document.querySelectorAll(".bru");if(!els.length)return;
if(!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("on")});return}
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("on");io.unobserve(x.target)}})},{threshold:.6});
els.forEach(function(e){io.observe(e)})})();
(function(){var a=document.getElementById("heroWa");if(!a)return;var C=window.MONTANA_CONFIG||{};var wa=String(C.whatsapp||"").replace(/\D/g,"");
if(wa){a.href="https://wa.me/"+wa+"?text="+encodeURIComponent("Hola, Tiendas Montana. Vi su página web y quiero hacer una consulta.")}
else{a.removeAttribute("target");a.href="#visitanos";a.lastChild.textContent="Visítanos"}})();
/* ===== Pie de página: enlaces de contacto desde MONTANA_CONFIG ===== */
(function(){
  var f=document.getElementById("pie");if(!f)return;
  var C=window.MONTANA_CONFIG||{},wa=String(C.whatsapp||"").replace(/\D/g,""),ig=String(C.instagram||"").trim(),maps=String(C.mapsUrl||"").trim();
  var a=f.querySelector("[data-ft=wa]");
  if(a){if(wa)a.href="https://wa.me/"+wa+"?text="+encodeURIComponent("Hola, Tiendas Montana. Vi su página web y quiero hacer una consulta.");else a.hidden=true}
  a=f.querySelector("[data-ft=ig]");
  if(a){var link="";if(/^https:\/\/(www\.)?instagram\.com\//i.test(ig))link=ig;else if(ig){var u=ig.replace(/^@/,"").replace(/[^\w.]/g,"");if(u)link="https://www.instagram.com/"+u+"/"}
    if(link)a.href=link;else a.hidden=true}
  a=f.querySelector("[data-ft=maps]");
  if(a){if(/^https:\/\/(maps\.app\.goo\.gl|goo\.gl|(www\.)?google\.com)\//i.test(maps))a.href=maps;else a.hidden=true}
})();
/* ===== Prueba de colores: abrir el simulador con un ambiente (enlace desde «Tu kit») ===== */
(function(){
  var q="";try{q=new URLSearchParams(location.search).get("ambiente")||""}catch(e){}
  if(!/^(sala|hab|coc)$/.test(q)||!window.MONTANA_SIM)return;
  var r=window.MONTANA_SIM.openWithSaved?window.MONTANA_SIM.openWithSaved(q):(window.MONTANA_SIM.select(q,true),"none");
  var m=document.getElementById("smMsg");
  if(m&&r==="month"){m.hidden=false;m.textContent="Aún no has guardado colores: te mostramos el Color del mes. Guarda los que te gusten con «Añadir este color» y aparecerán aquí."}
  try{history.replaceState(null,"",location.pathname)}catch(e){}
  setTimeout(function(){var t=document.querySelector(".sm-stage");if(!t)return;var h=(document.getElementById("nav")||{}).offsetHeight||70;
    scrollTo({top:t.getBoundingClientRect().top+scrollY-h-8,behavior:"smooth"})},420);
})();

/* ===== Inicio: portada (18/11/2026) =====
   Entrada escalonada al destaparse la presentación, paredes que cambian de color
   (colores del simulador, orientativos) y una ligera profundidad al mover el ratón. */
(function(){
  var s=document.getElementById("portada");if(!s)return;
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function start(){s.classList.add("in")}
  if(window.MONTANA_INTRO&&!window.MONTANA_INTRO.done())document.addEventListener("montana:revelado",start,{once:true});
  else requestAnimationFrame(function(){requestAnimationFrame(start)});
  var COL=[["Verde salvia","#A7B79A"],["Azul sereno","#6F93B5"],["Amarillo maíz","#F2D16B"],["Terracota","#B86B4B"],["Azul cielo","#C3D9EA"],["Rosa palo","#E9C6BE"],["Verde eucalipto","#6E9887"],["Arena","#D8C4A0"],["Coral","#E2725B"]];
  var cards=[].slice.call(s.querySelectorAll(".pt-card"));
  function paint(c,k){var x=COL[k%COL.length];c.style.setProperty("--wc",x[1]);c.querySelector("b").textContent=x[0];c.querySelector("em").textContent=x[1]}
  cards.forEach(function(c,i){c._k=i*3;paint(c,c._k)});
  if(!RM){var turn=0;setInterval(function(){if(document.hidden)return;var c=cards[turn%cards.length];c._k++;paint(c,c._k);turn++},2200)}
  if(RM||!matchMedia("(pointer: fine)").matches)return;
  var art=s.querySelector(".pt-art"),tx=0,ty=0,cx=0,cy=0,raf=0;
  s.addEventListener("pointermove",function(e){var r=s.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;if(!raf)raf=requestAnimationFrame(step)});
  s.addEventListener("pointerleave",function(){tx=ty=0;if(!raf)raf=requestAnimationFrame(step)});
  function step(){raf=0;cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;
    s.style.setProperty("--mx",cx.toFixed(4));s.style.setProperty("--my",cy.toFixed(4));
    if(Math.abs(tx-cx)>.001||Math.abs(ty-cy)>.001)raf=requestAnimationFrame(step)}
})();

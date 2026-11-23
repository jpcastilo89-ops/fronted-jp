/* ===== Comportamiento común de todas las páginas ===== */
(function(){
  var C=window.CEE_CONFIG||{},d=document,root=d.documentElement;
  root.classList.remove("no-js");
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function wa(msg){var n=String(C.whatsapp||"").replace(/\D/g,"");return "https://wa.me/"+n+(msg?"?text="+encodeURIComponent(msg):"")}
  window.CEE_WA=wa;
  var quien=C.nombre?C.nombre.split(" ")[0]+" "+(C.nombre.split(" ")[1]||""):"";
  var saludo="Hola "+quien.trim()+", ";

  /* ---------- datos de config.js en la página ---------- */
  var PROX="Próximamente";
  function val(k){
    switch(k){
      case "email":return C.email||"";
      case "horario":return C.horario||"";
      default:return C[k]||"";
    }
  }
  d.querySelectorAll("[data-cfg]").forEach(function(el){
    var k=el.getAttribute("data-cfg"),v=val(k);
    if(v){el.textContent=v;el.closest(".ct")&&el.closest(".ct").classList.remove("soon")}
    else if(el.hasAttribute("data-hide"))(el.closest(el.getAttribute("data-hide"))||el).remove();
    else{el.textContent=PROX;el.closest(".ct")&&el.closest(".ct").classList.add("soon")}
  });
  d.querySelectorAll("a[data-mail]").forEach(function(a){if(C.email)a.href="mailto:"+C.email;else a.removeAttribute("href")});
  d.querySelectorAll("[data-ig]").forEach(function(a){if(!C.instagram){a.closest("[data-opt]")?a.closest("[data-opt]").remove():a.remove();return}
    var u=/^https?:/.test(C.instagram)?C.instagram:"https://instagram.com/"+C.instagram.replace(/^@/,"");a.href=u;var t=a.querySelector("b");if(t)t.textContent="@"+C.instagram.replace(/^@|.*instagram\.com\//g,"").replace(/\/$/,"")});
  d.querySelectorAll("[data-li]").forEach(function(a){if(!C.linkedin){a.closest("[data-opt]")?a.closest("[data-opt]").remove():a.remove();return}a.href=C.linkedin});
  /* enlaces de WhatsApp con su mensaje */
  d.querySelectorAll("[data-wa]").forEach(function(a){var m=a.getAttribute("data-wa");a.href=wa(m?saludo+m:saludo+"quería hacerte una consulta.");a.target="_blank";a.rel="noopener"});
  /* logo y foto */
  if(C.logo)d.querySelectorAll(".mark").forEach(function(m){m.innerHTML='<img src="'+C.logo+'" alt="">'});
  if(C.marca)d.querySelectorAll(".brand b").forEach(function(b){b.textContent=C.marca});
  var ph=d.querySelector(".photo");if(ph&&C.foto){ph.querySelector(".ini")&&ph.querySelector(".ini").remove();var im=new Image();im.src=C.foto;im.alt=C.nombre||"";ph.prepend(im)}
  /* aviso de valoración no oficial */
  if(C.valoracionOficial)d.querySelectorAll("[data-no-oficial]").forEach(function(n){n.remove()});
  /* año del pie */
  d.querySelectorAll("[data-year]").forEach(function(n){n.textContent=new Date().getFullYear()});

  /* ---------- menú del móvil ---------- */
  var mb=d.getElementById("menu"),ln=d.getElementById("links");
  if(mb&&ln){mb.addEventListener("click",function(){var o=ln.classList.toggle("open");mb.setAttribute("aria-expanded",o)});
    d.addEventListener("keydown",function(e){if(e.key==="Escape"&&ln.classList.contains("open")){ln.classList.remove("open");mb.setAttribute("aria-expanded","false");mb.focus()}})}

  /* ---------- aparición suave ---------- */
  var fis=d.querySelectorAll(".fi");
  if("IntersectionObserver" in window&&!RM){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});fis.forEach(function(f){io.observe(f)})}
  else fis.forEach(function(f){f.classList.add("in")});

  /* ---------- etiqueta energética animada ---------- */
  var INFO={A:"Consumo muy bajo. La mejor calificación posible.",B:"Consumo bajo. Vivienda muy eficiente.",C:"Consumo moderado. Por encima de la media.",D:"Consumo medio.",E:"Consumo elevado. Muy habitual en edificios antiguos.",F:"Consumo alto. Margen claro de mejora.",G:"Consumo muy alto. El certificado vale 5 años, no 10."};
  d.querySelectorAll(".label").forEach(function(lb){
    var bars=lb.querySelector(".bars"),lis=[].slice.call(bars.children),ptr=lb.querySelector(".ptr"),txt=lb.querySelector("[data-info]");
    var auto=true,seq=["G","F","E","D","C","B","A","C","E"],si=0,timer=null;
    function set(i,user){var li=lis[i];if(!li)return;var L=li.getAttribute("data-l");
      lis.forEach(function(x){x.classList.toggle("on",x===li)});bars.classList.remove("idle");
      ptr.style.transform="translateY("+li.offsetTop+"px)";ptr.textContent=L;ptr.classList.add("show");
      if(txt)txt.innerHTML="<b>Letra "+L+".</b> "+INFO[L]}
    function idx(L){for(var i=0;i<lis.length;i++)if(lis[i].getAttribute("data-l")===L)return i;return 0}
    function tick(){if(!auto)return;set(idx(seq[si%seq.length]));si++;timer=setTimeout(tick,si===1?1100:1700)}
    lis.forEach(function(li,i){
      li.addEventListener("click",function(){auto=false;clearTimeout(timer);set(i,true)});
      li.addEventListener("mouseenter",function(){if(matchMedia("(hover:hover)").matches){auto=false;clearTimeout(timer);set(i,true)}});
      li.tabIndex=0;li.setAttribute("role","button");
      li.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();auto=false;clearTimeout(timer);set(i,true)}});
    });
    if(RM){set(idx("C"))}else setTimeout(tick,1300);
    addEventListener("resize",function(){var on=bars.querySelector(".on");if(on)ptr.style.transform="translateY("+on.offsetTop+"px)"});
  });

  /* ---------- calculadora de presupuesto ---------- */
  var f=d.getElementById("calc");
  if(f){
    var NOM={cee:"Certificado energético",valoracion:"Valoración de inmueble"},
        TIP={piso:"Piso",unifamiliar:"Chalet o unifamiliar",local:"Local comercial",oficina:"Oficina"},
        MOT={venta:"Venta",alquiler:"Alquiler",otro:"Otro motivo"};
    var rng=f.querySelector("#m2r"),num=f.querySelector("#m2"),out=d.getElementById("res");
    try{var q=new URLSearchParams(location.search).get("servicio");if(q&&NOM[q])f.querySelector('input[name=servicio][value='+q+']').checked=true}catch(e){}
    function g(n){var x=f.querySelector("input[name="+n+"]:checked");return x?x.value:""}
    function eur(n){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n)}
    function calc(){
      var s=g("servicio"),t=g("tipo"),m=g("motivo"),m2=Math.max(10,Math.min(5000,parseInt(num.value,10)||0)),zona=(f.querySelector("#zona").value||"").trim();
      var p=((C.precios||{})[s]||{})[t],precio=null;
      if(p&&typeof p.base==="number")precio=Math.round(p.base+(p.porM2||0)*m2);
      out.querySelector("[data-r=servicio]").textContent=NOM[s];
      out.querySelector("[data-r=tipo]").textContent=TIP[t];
      out.querySelector("[data-r=m2]").textContent=m2+" m²";
      out.querySelector("[data-r=motivo]").textContent=MOT[m];
      out.querySelector("[data-r=plazo]").textContent=C.plazo||"A consultar";
      out.querySelector("[data-r=precio]").textContent=precio!==null?eur(precio):"A consultar";
      out.querySelector("[data-r=nota]").textContent=precio!==null?(C.notaPrecios||""):"Envíame los datos por WhatsApp y te respondo con el precio exacto.";
      var msg=saludo+"quiero pedir presupuesto.\n\n• Servicio: "+NOM[s]+"\n• Inmueble: "+TIP[t]+"\n• Superficie: "+m2+" m²"+(zona?"\n• Zona o dirección: "+zona:"")+"\n• Motivo: "+MOT[m]+(precio!==null?"\n• Precio orientativo en la web: "+eur(precio):"")+"\n\n¿Cuándo podrías hacer la visita?";
      d.getElementById("enviar").href=wa(msg);
    }
    rng.addEventListener("input",function(){num.value=rng.value;calc()});
    num.addEventListener("input",function(){var v=parseInt(num.value,10);if(v>=10&&v<=400)rng.value=v;calc()});
    f.addEventListener("change",calc);f.addEventListener("input",calc);
    f.addEventListener("submit",function(e){e.preventDefault();d.getElementById("enviar").click()});
    calc();
  }

  /* ---------- transición entre páginas en navegadores sin @view-transition ---------- */
  var VT="CSSViewTransitionRule" in window;
  if(!VT&&!RM)d.addEventListener("click",function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest("a[href]");if(!a||(a.target&&a.target!=="_self"))return;
    var u;try{u=new URL(a.href)}catch(x){return}
    if(u.origin!==location.origin||u.pathname===location.pathname)return;
    e.preventDefault();root.classList.add("pg-out");setTimeout(function(){location.href=u.href},260);
  });
  addEventListener("pageshow",function(){root.classList.remove("pg-out")});
})();

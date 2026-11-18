/* ===== Navegación entre páginas (18/11/2026) =====
   Siete páginas reales, en este orden. Se pasa a la siguiente bajando al final de la página
   y a la anterior subiendo desde arriba; también con el menú, los puntos laterales o el aviso «Siguiente».
   En navegadores modernos la transición la hace el propio navegador (@view-transition, en el CSS);
   en los demás se imita aquí. */
(function(){
  var root=document.documentElement,body=document.body;
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VT=root.classList.contains("vt");
  var ORDER=window.MONTANA_ORDEN||[];
  function ix(path){var p=String(path||"").replace(/index\.html$/,"");if(p.slice(-1)!=="/")p+="/";for(var i=0;i<ORDER.length;i++)if(ORDER[i][0]===p)return i;return -1}
  var cur=ix(location.pathname),next=cur>=0&&cur<ORDER.length-1?ORDER[cur+1]:null,prev=cur>0?ORDER[cur-1]:null;
  function samePage(u){return u.pathname===location.pathname&&u.search===location.search}
  function setDir(u){var a=cur,b=ix(u.pathname);try{sessionStorage.setItem("montanaDir",a>=0&&b>=0&&b<a?"prev":"next")}catch(e){}}
  function go(url){
    var u;try{u=new URL(url,location.href)}catch(e){return}
    if(u.origin!==location.origin){location.href=u.href;return}
    if(samePage(u)){var id=decodeURIComponent(u.hash.slice(1)),t=id&&document.getElementById(id);
      scrollTo({top:t?t.getBoundingClientRect().top+scrollY:0,behavior:RM?"auto":"smooth"});return}
    if(going)return;going=true;setDir(u);
    if(VT||RM){location.href=u.href;return}
    var d="";try{d=sessionStorage.getItem("montanaDir")||"next"}catch(e){d="next"}
    root.classList.add("pg-out","pg-out-"+d);
    setTimeout(function(){location.href=u.href},300);
  }
  var going=false;
  document.addEventListener("click",function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest("a[href]");if(!a||(a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
    var u;try{u=new URL(a.getAttribute("href"),location.href)}catch(err){return}
    if(u.origin!==location.origin)return;
    if(samePage(u)){e.preventDefault();go(u.href);return}
    if(VT||RM){if(!going){going=true;setDir(u)}return}   /* el navegador cambia de página con su transición */
    e.preventDefault();go(u.href);
  });
  addEventListener("pageshow",function(){going=false;root.classList.remove("pg-out","pg-out-next","pg-out-prev");setP(0,null)});

  /* ---------- pasar de página con el scroll ---------- */
  var nxBand=document.querySelector(".nx"),pv=null;
  if(prev){pv=document.createElement("a");pv.className="pv";pv.href=prev[0];pv.setAttribute("aria-hidden","true");pv.tabIndex=-1;
    pv.innerHTML='<i></i><span>Anterior · <b>'+prev[1]+'</b></span>';body.appendChild(pv)}
  var prog=0,mode=null;
  function setP(p,m){prog=Math.max(0,Math.min(1.15,p));mode=m;
    if(nxBand){var v=m==="next"?prog:0;nxBand.style.setProperty("--p",Math.min(1,v).toFixed(3));nxBand.classList.toggle("pull",v>0)}
    if(pv){var w=m==="prev"?prog:0;pv.style.setProperty("--p",Math.min(1,w).toFixed(3));pv.classList.toggle("on",w>.04)}}
  function maxY(){return document.documentElement.scrollHeight-innerHeight}
  function atBottom(){return scrollY>=maxY()-2}
  function atTop(){return scrollY<=1}
  var since={b:atBottom()?performance.now():0,t:atTop()?performance.now():0};
  function edges(){var n=performance.now();if(atBottom()){if(!since.b)since.b=n}else since.b=0;if(atTop()){if(!since.t)since.t=n}else since.t=0}
  addEventListener("scroll",edges,{passive:true});addEventListener("resize",edges);
  function blocked(t){return going||body.classList.contains("locked")||root.classList.contains("ct-lock")||!!document.querySelector(".pill.open")||(t&&t.closest&&t.closest(".ct,.sm-sw,.sm-fams,.cards,.sm-qc,input,textarea,select"))}
  var TH=320,acc=0,idle=null;
  function fire(m){var t=m==="next"?next:prev;if(!t)return;setP(1,m);go(t[0])}
  function scrollsY(t,dy){for(var el=t;el&&el.nodeType===1&&el!==body&&el!==root;el=el.parentElement){var o=getComputedStyle(el).overflowY;if((o==="auto"||o==="scroll")&&el.scrollHeight>el.clientHeight+1){if(dy>0?el.scrollTop+el.clientHeight<el.scrollHeight-1:el.scrollTop>0)return true}}return false}
  addEventListener("wheel",function(e){
    if(going||body.classList.contains("locked")||root.classList.contains("ct-lock")||document.querySelector(".pill.open")||(e.target.closest&&e.target.closest(".ct,input,textarea,select"))||scrollsY(e.target,e.deltaY)||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    var n=performance.now(),dy=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;dy=Math.max(-90,Math.min(90,dy));
    edges();
    var m=dy>0&&next&&since.b&&n-since.b>380?"next":dy<0&&prev&&since.t&&n-since.t>380?"prev":null;
    if(!m||(mode&&m!==mode)){acc=0;setP(0,null);if(!m)return}
    acc+=Math.abs(dy);setP(acc/TH,m);
    clearTimeout(idle);idle=setTimeout(function(){acc=0;setP(0,null)},600);
    if(acc>=TH){acc=0;clearTimeout(idle);fire(m)}
  },{passive:true});
  var ty=null,tm=null,TT=150;
  addEventListener("touchstart",function(e){if(e.touches.length!==1||blocked(e.target)){tm=null;return}edges();var n=performance.now();
    ty=e.touches[0].clientY;tm=next&&since.b&&n-since.b>250?"next":prev&&since.t&&n-since.t>250?"prev":null;
    if(tm==="next"&&prev&&since.t&&n-since.t>250&&maxY()<4)tm="both"},{passive:true});
  addEventListener("touchmove",function(e){if(!tm||ty===null)return;var dy=ty-e.touches[0].clientY;
    var m=tm==="both"?(dy>0?"next":"prev"):tm;var p=m==="next"?dy/TT:-dy/TT;setP(p>0?p:0,p>0?m:null)},{passive:true});
  addEventListener("touchend",function(){if(tm&&mode&&prog>=1)fire(mode);else setP(0,null);tm=null;ty=null},{passive:true});
  addEventListener("touchcancel",function(){tm=null;setP(0,null)},{passive:true});
  /* teclado: Av Pág / flecha abajo al final de la página pasa a la siguiente */
  addEventListener("keydown",function(e){if(blocked(e.target)||e.altKey||e.ctrlKey||e.metaKey)return;
    if((e.key==="PageDown"||(e.key===" "&&!e.shiftKey))&&next&&atBottom()&&since.b&&performance.now()-since.b>300){e.preventDefault();fire("next")}
    else if((e.key==="PageUp"||(e.key===" "&&e.shiftKey))&&prev&&atTop()&&since.t&&performance.now()-since.t>300){e.preventDefault();fire("prev")}});
  window.MONTANA_NAV={go:go,order:ORDER,index:cur};
})();

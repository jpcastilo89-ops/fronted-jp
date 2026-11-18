/* ===== Navegación entre páginas (18/11/2026) =====
   Cada apartado es una página real con su propia dirección (/productos/, /como-pintar/, …).
   En navegadores modernos la transición la hace el propio navegador (@view-transition en el CSS);
   en los demás se imita aquí: la página sale con un fundido y la nueva entra con suavidad. */
(function(){
  var root=document.documentElement;
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VT=root.classList.contains("vt");
  function samePage(u){return u.pathname===location.pathname&&u.search===location.search}
  function scrollToHash(hash,smooth){
    var id=decodeURIComponent(String(hash||"").slice(1)),t=id&&document.getElementById(id);
    if(!id){scrollTo({top:0,behavior:smooth&&!RM?"smooth":"auto"});return true}
    if(!t)return false;
    scrollTo({top:t.getBoundingClientRect().top+scrollY,behavior:smooth&&!RM?"smooth":"auto"});return true;
  }
  function go(url){
    var u;try{u=new URL(url,location.href)}catch(e){return}
    if(u.origin!==location.origin){location.href=u.href;return}
    if(samePage(u)){if(u.hash!==location.hash)try{history.pushState(null,"",u.hash||u.pathname)}catch(e){}scrollToHash(u.hash,true);return}
    if(VT||RM){location.href=u.href;return}
    root.classList.add("pg-out");
    setTimeout(function(){location.href=u.href},220);
  }
  document.addEventListener("click",function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest("a[href]");if(!a||(a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
    var u;try{u=new URL(a.getAttribute("href"),location.href)}catch(err){return}
    if(u.origin!==location.origin)return;
    if(samePage(u)){e.preventDefault();go(u.href);return}
    if(VT||RM)return;          /* el navegador cambia de página con su transición */
    e.preventDefault();go(u.href);
  });
  /* al volver con «Atrás», la página no debe quedarse a medio fundir */
  addEventListener("pageshow",function(){root.classList.remove("pg-out")});
  window.MONTANA_NAV={go:go};
})();

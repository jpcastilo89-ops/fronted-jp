/* Presentación de marca + sistema de carga.
   La presentación es solo HTML y CSS: no espera a la parte 3D, nunca bloquea la página
   y se retira sola como mucho a los 6,5 s. La parte 3D entra cuando las franjas destapan la portada. */
(function(){
  var el=document.getElementById("intro"),hero=document.getElementById("productos");
  /* Web multipágina: la presentación se ve una vez por visita. Al volver a Inicio desde otra página
     (o al entrar con un enlace a una sección, p. ej. /#visitanos) se entra directo. */
  if(el){var again=false;try{again=sessionStorage.getItem("montanaIntroVisita")==="1";sessionStorage.setItem("montanaIntroVisita","1")}catch(e){}
    if(again||location.hash){el.parentNode.removeChild(el);el=null}}
  var rm=matchMedia("(prefers-reduced-motion: reduce)").matches,seen=false;
  try{seen=localStorage.getItem("montanaIntro")==="1";localStorage.setItem("montanaIntro","1")}catch(e){}
  var revealed=false,ready3d=false,cbs=[],finished=false,timers=[];
  function run(){if(!(revealed&&ready3d))return;var f=cbs;cbs=[];f.forEach(function(g){try{g()}catch(e){}})}
  function reveal(){
    if(revealed)return;revealed=true;
    document.body.classList.remove("locked");
    if(hero)hero.classList.add("in");
    try{document.dispatchEvent(new CustomEvent("montana:revelado"))}catch(e){}
    var tt=document.getElementById("title");if(tt&&!tt.textContent)tt.textContent="Tiendas Montana";
    run();
  }
  function finish(){if(finished)return;finished=true;timers.forEach(clearTimeout);reveal();if(el&&el.parentNode)el.parentNode.removeChild(el)}
  window.MONTANA_INTRO={ready:function(f){ready3d=true;if(f)cbs.push(f);run()},done:function(){return revealed}};
  if(!el){reveal();return}
  var logo=document.querySelector(".brand img");if(logo)el.querySelector(".ilogo").src=logo.src;
  document.body.classList.add("locked");
  /* tiempos: primera visita / visita repetida / movimiento reducido */
  var T=rm?{wipe:1500,cover:1500,end:1950}:seen?{wipe:1150,cover:1520,end:2250}:{wipe:2500,cover:2870,end:3600};
  function at(ms,f){timers.push(setTimeout(f,ms))}
  var wiping=false;
  function wipe(){
    if(wiping)return;wiping=true;timers.forEach(clearTimeout);timers=[];
    el.classList.add("wipe");
    var c=rm?0:(T.cover-T.wipe);
    at(c,function(){el.classList.add("covered");reveal()});
    at(c+(rm?450:T.end-T.cover),finish);
  }
  if(rm)el.classList.add("rm");if(seen)el.classList.add("short");
  el.classList.add("go");
  at(T.wipe,wipe);
  el.addEventListener("click",wipe);
  addEventListener("keydown",function k(e){if(!revealed&&(e.key==="Escape"||e.key==="Enter"||e.key===" ")){wipe();removeEventListener("keydown",k)}});
  setTimeout(finish,6500);
})();

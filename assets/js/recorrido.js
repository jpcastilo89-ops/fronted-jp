/* ===== Recorrido por una vivienda (Inicio) =====
   Una escena fija a pantalla completa que avanza con el scroll.
   Entre estancias, fundidos suaves con un movimiento de cámara lento (sin efectos bruscos).
   Solo se animan transform y opacity, una vez por fotograma. */
(function(){
  var R=document.getElementById("recorrido");if(!R)return;
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(RM){R.classList.add("rc-static");return}
  R.classList.add("rc-on");
  var stage=R.querySelector(".rc-stage"),scenes=[].slice.call(R.querySelectorAll(".rc-sc")),N=scenes.length;
  var rail=[].slice.call(R.querySelectorAll(".rc-rail a")),bar=R.querySelector(".rc-bar i"),hint=R.querySelector(".rc-hint");
  var DOOR=.45,HOLD=.8,TR=1.1,SEG=HOLD+TR;           /* longitudes en pantallas de scroll */
  var TOTAL=DOOR+N*HOLD+(N-1)*TR+.35;
  R.style.height="calc("+(TOTAL*100)+"svh + 100svh)";
  if(!CSS.supports("height","1svh"))R.style.height=((TOTAL+1)*innerHeight)+"px";

    function cl(x){return x<0?0:x>1?1:x}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function sm(t){return t*t*(3-2*t)}
  function eo(t){return 1-Math.pow(1-t,3)}
  function st(el,tr,op,clip){el.style.transform=tr||"";el.style.opacity=op===undefined?"":op;if(clip!==undefined)el.style.clipPath=el.style.webkitClipPath=clip}
  function im(sc){return sc._im||(sc._im=sc.querySelector(".rc-img"))}
  function tx(sc){return sc._tx||(sc._tx=sc.querySelector(".rc-txt"))}

  /* movimiento de cámara lento dentro de cada estancia (dolly + paneo suave, distinto en cada una) */
  var KB=[[1.06,1.16,-1.5,1.5,0,-1],[1.12,1.04,1.5,-1,0,0],[1.04,1.14,0,0,1,-1],[1.1,1.02,-1,1,0,1],[1.05,1.15,1,-1,-1,0],[1.02,1.12,0,0,1.5,-1.5]];
  function camera(k,u){var c=KB[k%KB.length],s=c[0]+(c[1]-c[0])*u,x=c[2]+(c[3]-c[2])*u,y=c[4]+(c[5]-c[4])*u;return "translate3d("+x+"%,"+y+"%,0) scale("+s.toFixed(4)+")"}

  var last=-1,raf=0;
  function frame(){raf=0;
    var r=R.getBoundingClientRect(),vh=innerHeight,s=-r.top/vh;
    if(s<-1||s>TOTAL+1){return}
    if(Math.abs(s-last)<.0005)return;last=s;
    var p=cl(s/TOTAL);if(bar)bar.style.transform="scaleX("+p.toFixed(4)+")";
    if(hint)hint.style.opacity=cl(1-s*3);
    var d=ease(cl(s/DOOR));
    var q=Math.max(0,s-DOOR),k=Math.min(N-1,Math.floor(q/SEG)),f=q-k*SEG,t=k<N-1&&f>HOLD?ease(cl((f-HOLD)/TR)):0;
    if(k===N-1)t=0;
    var cur=k,nx=k+1,uCur=cl(f/(HOLD+TR)),uNext=t*.25;
    /* escenas visibles */
    for(var i=0;i<N;i++){var vis=i===cur||(t>0&&i===nx);scenes[i].classList.toggle("on",vis);if(!vis){scenes[i].style.cssText="";im(scenes[i]).style.transform=""}}
    var A=scenes[cur],B=scenes[nx];
    var ci=camera(cur,d<1&&cur===0?uCur*.5:uCur);
    /* el texto entra al llegar a cada estancia y sale al empezar la transición */
    var inA=cur===0?eo(cl((s-DOOR*.5)/.45)):eo(cl(f/.4)),outA=1-cl(t*1.8);
    var T=tx(A);T.style.opacity=(inA*outA).toFixed(3);T.style.transform="translate3d(0,"+((1-inA)*18-(1-outA)*12).toFixed(2)+"px,0)";
    if(B)tx(B).style.opacity=0;
    if(t===0){st(A,cur===0?"scale("+(1.04-.04*d)+")":"",cur===0?(.15+.85*d).toFixed(3):1);im(A).style.transform=ci}
    else{ /* fundido suave: la estancia actual se aleja despacio y la siguiente aparece acercándose */
      var dir=cur%2?1:-1,fo=sm(cl((t-.6)/.4)),fi=sm(cl((t-.05)/.85));
      st(A,"scale("+(1+.035*t).toFixed(4)+")",(1-fo).toFixed(3));im(A).style.transform=ci;
      st(B,"scale("+(1.06-.06*fi).toFixed(4)+")",fi.toFixed(3));im(B).style.transform=camera(nx,uNext);
      B.style.zIndex=2;A.style.zIndex=1}
    /* índice lateral */
    var on=t>.5?nx:cur;rail.forEach(function(a,i){a.classList.toggle("on",i===on)});
  }
  function req(){if(!raf)raf=requestAnimationFrame(frame)}
  addEventListener("scroll",req,{passive:true});addEventListener("resize",function(){last=-1;req()});
  /* saltar a una estancia desde el índice */
  rail.forEach(function(a,i){a.addEventListener("click",function(e){e.preventDefault();
    var y=R.getBoundingClientRect().top+scrollY+(DOOR+i*SEG+.05)*innerHeight;scrollTo({top:y,behavior:"smooth"})})});
  /* precarga de la escena siguiente cuando el recorrido se acerca */
  if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){R.querySelectorAll("img[loading=lazy]").forEach(function(x){x.loading="eager"});io.disconnect()}},{rootMargin:"800px 0px"});io.observe(R)}
  req();
})();

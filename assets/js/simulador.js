/* ===== Simulador de color =====
   Cada ambiente es una fotografía real con una máscara de paredes preparada a mano.
   El color se aplica solo dentro de la máscara y se multiplica por la luz original
   de la foto (sombras, textura y degradados se conservan).
   Colores demostrativos: más adelante se sustituirán por la carta real de la tienda. */
(function(){
  var sec=document.getElementById("simulador");if(!sec)return;
  var $=function(id){return document.getElementById(id)};
  var ROOMS={
    sala:{img:"/assets/img/simulador/sala.webp",mask:"/assets/img/simulador/sala-mascara.webp",w:1400,h:934,alt:"Sala de estar con sofá azul, ventana con cortinas, plantas y mueble blanco"},
    hab:{img:"/assets/img/simulador/hab.webp",mask:"/assets/img/simulador/hab-mascara.webp",w:1400,h:948,alt:"Dormitorio con cama grande, mesas de noche con lámparas, cuadro y cortinas"},
    coc:{img:"/assets/img/simulador/coc.webp",mask:"/assets/img/simulador/coc-mascara.webp",w:1400,h:930,alt:"Cocina moderna con gabinetes blancos, nevera de acero, isla y lámparas colgantes"}
  };
  var FAMS=[
    {n:"Blancos y cremas",c:[["Blanco puro","#F7F6F2"],["Blanco hueso","#EFE9DD"],["Perla","#E6E2DA"],["Marfil","#F1E7D0"],["Crema","#EADBBE"],["Vainilla","#F3E3B5"]]},
    {n:"Grises",c:[["Gris niebla","#DCDDDA"],["Gris perla","#C8CAC6"],["Gris piedra","#A9A9A2"],["Gris acero","#80878B"],["Gris pizarra","#5B6266"],["Grafito","#3E4346"]]},
    {n:"Beige y tierra",c:[["Lino","#DCD1BD"],["Arena","#D8C4A0"],["Beige","#C9B28C"],["Topo","#9C8B7A"],["Terracota","#B86B4B"],["Tierra tostada","#86583B"]]},
    {n:"Azules",c:[["Azul cielo","#C3D9EA"],["Azul bruma","#9DB4C8"],["Azul sereno","#6F93B5"],["Azul intenso","#1F4FBF"],["Azul petróleo","#1F5F73"],["Azul marino","#1C2E5A"]]},
    {n:"Verdes",c:[["Verde menta","#CFE5D3"],["Verde salvia","#A7B79A"],["Verde eucalipto","#6E9887"],["Verde oliva","#7D8455"],["Verde esmeralda","#1E7A5A"],["Verde bosque","#2F5D46"]]},
    {n:"Amarillos",c:[["Amarillo pastel","#F7E9AE"],["Amarillo limón","#EFE27A"],["Amarillo maíz","#F2D16B"],["Amarillo sol","#FFCF26"],["Mostaza","#D6A72C"],["Ocre","#BF8A32"]]},
    {n:"Rojos y cálidos",c:[["Rosa palo","#E9C6BE"],["Salmón","#E89B84"],["Coral","#E2725B"],["Naranja calabaza","#D9792E"],["Rojo intenso","#C8262C"],["Vino","#7A2632"]]}
  ];
  var CFG=window.MONTANA_CONFIG||{};
  var waNum=String(CFG.whatsapp||"").replace(/\D/g,"");
  var RM=matchMedia("(prefers-reduced-motion: reduce)");
  var KEY="montanaColores";
  var photo=$("smPhoto"),base=$("smBase"),cvA=$("smA"),cvB=$("smB"),studio=$("smStudio");
  var tagC=$("smTagC"),tagN=$("smTagN"),tagH=$("smTagH"),orig=$("smOrig");
  var famsEl=$("smFams"),swEl=$("smSw"),selC=$("smSelC"),selN=$("smSelN"),selH=$("smSelH");
  var addB=$("smAdd"),ul=$("smUl"),countEl=$("smCount"),emptyEl=$("smEmpty"),askB=$("smAsk"),msg=$("smMsg");
  var roomBtns=[].slice.call(sec.querySelectorAll(".sm-room"));
  var cur=null,room=null,fam=0,color=null,front=cvA,back=cvB,cache={},token=0;
  var LIST=[];
  function readSaved(){var out=[];try{var saved=JSON.parse(localStorage.getItem(KEY)||"[]");if(Array.isArray(saved))out=saved.filter(function(x){return x&&/^#[0-9A-F]{6}$/i.test(x.h)&&typeof x.n==="string"}).slice(0,40)}catch(e){}return out}
  LIST=readSaved();

  /* --- color --- */
  var toLin=new Float32Array(256);for(var i=0;i<256;i++){var v=i/255;toLin[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}
  var LUTN=4096,toSRGB=new Uint8ClampedArray(LUTN+1);
  for(i=0;i<=LUTN;i++){var l=i/LUTN;toSRGB[i]=Math.round(255*(l<=.0031308?12.92*l:1.055*Math.pow(l,1/2.4)-.055))}
  function hexRGB(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
  function soft(x){return x<.82?x:.82+.18*(1-Math.exp(-(x-.82)/.18))}

  /* --- carga de un ambiente: foto + máscara a píxeles (una sola vez) --- */
  function loadImg(src){return new Promise(function(res,rej){var im=new Image();im.decoding="async";im.onload=function(){res(im)};im.onerror=rej;im.src=src})}
  function prep(key){
    if(cache[key])return cache[key];
    var R=ROOMS[key];
    cache[key]=Promise.all([loadImg(R.img),loadImg(R.mask)]).then(function(ims){
      var W=R.w,H=R.h,c=document.createElement("canvas");c.width=W;c.height=H;
      var x=c.getContext("2d",{willReadFrequently:true});
      x.drawImage(ims[0],0,0,W,H);var px=x.getImageData(0,0,W,H).data;
      x.clearRect(0,0,W,H);x.drawImage(ims[1],0,0,W,H);var mk=x.getImageData(0,0,W,H).data;
      var n=0,k;for(k=0;k<W*H;k++)if(mk[k*4]>2)n++;
      var idx=new Uint32Array(n),al=new Uint8Array(n),Y=new Float32Array(n),j=0,sy=0,sa=0;
      for(k=0;k<W*H;k++){var a=mk[k*4];if(a>2){var p=k*4;var y=.2126*toLin[px[p]]+.7152*toLin[px[p+1]]+.0722*toLin[px[p+2]];idx[j]=k;al[j]=a;Y[j]=y;sy+=y*a;sa+=a;j++}}
      var mean=sy/sa;for(k=0;k<n;k++)Y[k]/=mean;
      return{W:W,H:H,idx:idx,al:al,Y:Y,src:ims[0].src,img:ims[0]};
    });
    return cache[key];
  }
  function paint(cv,d,hex){
    if(cv.width!==d.W||cv.height!==d.H){cv.width=d.W;cv.height=d.H}
    var x=cv.getContext("2d"),out=x.createImageData(d.W,d.H),o=out.data;
    var t=hexRGB(hex),r=toLin[t[0]],g=toLin[t[1]],b=toLin[t[2]],idx=d.idx,Y=d.Y,al=d.al,n=idx.length;
    for(var k=0;k<n;k++){var y=Y[k],p=idx[k]*4;
      o[p]=toSRGB[(soft(r*y)*LUTN)|0];o[p+1]=toSRGB[(soft(g*y)*LUTN)|0];o[p+2]=toSRGB[(soft(b*y)*LUTN)|0];o[p+3]=al[k]}
    x.putImageData(out,0,0);
  }

  /* --- mostrar color (fundido suave entre capas) --- */
  function show(hex){
    if(!cur)return;
    if(!hex){front.classList.remove("show");back.classList.remove("show");return}
    paint(back,cur,hex);
    var f=front;front=back;back=f;
    if(RM.matches){front.style.transition="none";back.style.transition="none"}else{front.style.transition="";back.style.transition=""}
    front.style.zIndex=2;back.style.zIndex=1;
    void front.offsetWidth;front.classList.add("show");
    setTimeout(function(){if(back!==front)back.classList.remove("show")},RM.matches?0:520);
  }
  function setTag(c){
    if(c){tagC.style.setProperty("--sw",c[1]);tagN.textContent=c[0];tagH.textContent=c[1]}
    else{tagC.style.removeProperty("--sw");tagN.textContent="Color original";tagH.textContent="Así es la foto"}
  }
  function updSel(){
    if(color){selC.style.setProperty("--sw",color[1]);selN.textContent=color[0];selH.textContent=color[1];addB.disabled=false;
      var has=LIST.some(function(x){return x.h===color[1]});addB.classList.toggle("ok",has);addB.querySelector("path").setAttribute("d",has?"M5 12.5l4.5 4.5L19 7.5":"M12 5v14M5 12h14");addB.querySelector("span").textContent=has?"Ya está en tu lista":"Añadir este color a mi lista"}
    else{selC.style.removeProperty("--sw");selN.textContent="Ningún color elegido";selH.textContent="Toca una muestra para pintar las paredes";addB.disabled=true;addB.classList.remove("ok");addB.querySelector("path").setAttribute("d","M12 5v14M5 12h14");addB.querySelector("span").textContent="Añadir este color a mi lista"}
    orig.disabled=!color;setTag(color);
    [].forEach.call(swEl.children,function(b){b.setAttribute("aria-pressed",color&&b.dataset.h===color[1]?"true":"false")});
  }
  function pick(c){color=c;updSel();show(c&&c[1]);markQuick()}
  /* --- tira rápida «Tus colores»: cambia la pared con un toque --- */
  var qBox=$("smQuick"),qC=$("smQc");
  function famOf(h){var fi=-1;FAMS.forEach(function(f,k){if(f.c.some(function(c){return c[1]===h}))fi=k});return fi}
  function pickSaved(x){var fi=famOf(x.h);if(fi>=0&&fi!==fam)setFam(fi);pick([x.n,x.h])}
  function markQuick(){if(!qC)return;[].forEach.call(qC.children,function(b){b.setAttribute("aria-pressed",color&&b.dataset.h===color[1]?"true":"false")})}
  function renderQuick(){if(!qBox)return;qC.innerHTML="";qBox.hidden=!LIST.length;
    LIST.forEach(function(x){var b=document.createElement("button");b.type="button";b.className="sm-qb";b.dataset.h=x.h;b.style.setProperty("--c",x.h);b.setAttribute("aria-label","Probar "+x.n);b.title=x.n;
      b.innerHTML='<i></i><span>'+esc(x.n)+'</span>';b.addEventListener("click",function(){pickSaved(x)});qC.appendChild(b)});markQuick()}

  /* --- ambientes --- */
  function selectRoom(key,focus){
    if(room===key)return;room=key;var my=++token,R=ROOMS[key];
    roomBtns.forEach(function(b){b.setAttribute("aria-checked",b.dataset.r===key?"true":"false")});
    var first=!sec.classList.contains("on");
    sec.classList.add("on");studio.hidden=false;
    photo.style.aspectRatio=R.w+"/"+R.h;base.alt=R.alt;
    photo.classList.add("loading");
    prep(key).then(function(d){
      if(my!==token)return;
      cur=d;base.src=d.src;
      cvA.classList.remove("show");cvB.classList.remove("show");
      photo.classList.remove("loading");
      if(color)show(color[1]);
    }).catch(function(){if(my!==token)return;photo.classList.remove("loading");room=null});
    if(first)setTimeout(function(){var y=sec.querySelector(".sm-pick").getBoundingClientRect().top+scrollY-((document.getElementById("nav")||{}).offsetHeight||70)-12;scrollTo({top:y,behavior:RM.matches?"auto":"smooth"})},60);
  }
  roomBtns.forEach(function(b){b.addEventListener("click",function(){selectRoom(b.dataset.r)})});
  sec.querySelector(".sm-rooms").addEventListener("keydown",function(e){
    var i=roomBtns.indexOf(document.activeElement);if(i<0)return;var d=e.key==="ArrowRight"||e.key==="ArrowDown"?1:e.key==="ArrowLeft"||e.key==="ArrowUp"?-1:0;
    if(!d)return;e.preventDefault();var nb=roomBtns[(i+d+3)%3];nb.focus();if(sec.classList.contains("on"))selectRoom(nb.dataset.r)});

  /* --- paleta --- */
  var ck='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  FAMS.forEach(function(f,i){
    var b=document.createElement("button");b.type="button";b.className="sm-fam";b.setAttribute("role","tab");b.id="smF"+i;
    b.setAttribute("aria-selected",i===fam?"true":"false");b.tabIndex=i===fam?0:-1;
    b.style.setProperty("--g","conic-gradient("+f.c.map(function(c){return c[1]}).join(",")+")");
    b.innerHTML='<i aria-hidden="true"></i>'+f.n;
    b.addEventListener("click",function(){setFam(i)});
    famsEl.appendChild(b);
  });
  famsEl.addEventListener("keydown",function(e){var d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!d)return;e.preventDefault();var n=(fam+d+FAMS.length)%FAMS.length;setFam(n);famsEl.children[n].focus()});
  function setFam(i){
    fam=i;[].forEach.call(famsEl.children,function(b,k){b.setAttribute("aria-selected",k===i?"true":"false");b.tabIndex=k===i?0:-1});
    var fb=famsEl.children[i];var fl=fb.offsetLeft-famsEl.offsetLeft,fr=fl+fb.offsetWidth;
    if(fl<famsEl.scrollLeft+20||fr>famsEl.scrollLeft+famsEl.clientWidth-20)famsEl.scrollTo({left:fl-famsEl.clientWidth/2+fb.offsetWidth/2,behavior:RM.matches?"auto":"smooth"});
    swEl.setAttribute("aria-labelledby","smF"+i);swEl.innerHTML="";
    FAMS[i].c.forEach(function(c){
      var b=document.createElement("button");b.type="button";b.className="sm-s";b.dataset.h=c[1];
      b.setAttribute("aria-pressed",color&&color[1]===c[1]?"true":"false");b.setAttribute("aria-label",c[0]+", "+c[1]);
      b.innerHTML='<span class="chip" style="--c:'+c[1]+'">'+ck+'</span><span class="sm-sf"><span class="n">'+c[0]+'</span><span class="h">'+c[1]+'</span></span>';
      b.addEventListener("click",function(){pick(c)});
      swEl.appendChild(b);
    });
  }
  setFam(0);
  orig.addEventListener("click",function(){pick(null)});

  /* --- mi lista de colores --- */
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return"&#"+c.charCodeAt(0)+";"})}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(LIST))}catch(e){}try{document.dispatchEvent(new CustomEvent("montana:colores"))}catch(e){}}
  function listTxt(){return LIST.map(function(x){return x.n+" ("+x.h+")"}).join(", ")}
  function renderList(){
    ul.innerHTML="";
    LIST.forEach(function(x,i){
      var li=document.createElement("li");
      var nn=esc(x.n);li.innerHTML='<i style="--c:'+x.h+'" aria-hidden="true"></i><button type="button" class="t" aria-label="Probar '+nn+' en la pared"><b>'+nn+'</b><span>'+x.h+'</span></button><button type="button" class="x" aria-label="Quitar '+nn+' de mi lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
      li.querySelector(".t").addEventListener("click",function(){
        var fi=-1;FAMS.forEach(function(f,k){if(f.c.some(function(c){return c[1]===x.h}))fi=k});
        if(fi>=0&&fi!==fam)setFam(fi);pick([x.n,x.h]);
        if(innerWidth<901)photo.scrollIntoView({behavior:RM.matches?"auto":"smooth",block:"center"});
      });
      li.querySelector(".x").addEventListener("click",function(){LIST.splice(i,1);save();renderList();updSel();(LIST.length?ul.querySelector(".x"):addB).focus()});
      ul.appendChild(li);
    });
    countEl.textContent=LIST.length;emptyEl.hidden=LIST.length>0;askB.disabled=!LIST.length;renderQuick();
    if(!LIST.length)msg.hidden=true;
  }
  addB.addEventListener("click",function(){
    if(!color)return;
    if(!LIST.some(function(x){return x.h===color[1]})){LIST.push({n:color[0],h:color[1]});if(LIST.length>40)LIST.shift();save();renderList()}
    updSel();
  });
  askB.addEventListener("click",function(){
    if(!LIST.length)return;
    if(waNum){
      var t="Hola, Tiendas Montana. Probé estos colores en el simulador de la web y quiero consultarlos: "+listTxt()+".";
      window.open("https://wa.me/"+waNum+"?text="+encodeURIComponent(t),"_blank","noopener");
      msg.hidden=true;
    }else{
      msg.innerHTML="<b>Lleva tu lista a Tiendas Montana.</b> Muestra estos colores en la tienda y te ayudamos a encontrar el tono y la pintura ideales: "+esc(listTxt())+".";
      msg.hidden=false;
    }
  });
  renderList();updSel();

  /* Precarga discreta: cuando la sección se acerca, prepara la sala (solo una foto). */
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();(window.requestIdleCallback||setTimeout)(function(){prep("sala")})}},{rootMargin:"600px 0px"});
    io.observe(sec);
  }
  /* --- Color del mes (MONTANA_CONFIG.colorDelMes) --- */
  (function(){
    var want=String(CFG.colorDelMes||"").trim().toLowerCase(),box=$("cdm");if(!want||!box)return;
    var hit=null;FAMS.forEach(function(f,k){f.c.forEach(function(x){if(!hit&&x[0].toLowerCase()===want)hit={c:x,f:k}})});if(!hit)return;
    $("cdmC").style.background=hit.c[1];$("cdmN").textContent=hit.c[0];$("cdmH").textContent=hit.c[1];$("cdmT").textContent=hit.c[0];
    box.hidden=false;
    $("cdmB").addEventListener("click",function(){selectRoom("sala",true);if(hit.f!==fam)setFam(hit.f);pick(hit.c)});
  })();
  renderQuick();
  window.MONTANA_SIM={saved:function(){return LIST.slice()},remove:function(h){var k=-1;LIST.forEach(function(x,i){if(x.h===h)k=i});if(k<0)return;LIST.splice(k,1);save();renderList();updSel()},openWithSaved:function(key){
      selectRoom(key,true);
      if(LIST.length){pickSaved(LIST[0]);return "saved"}
      var want=String(CFG.colorDelMes||"").trim().toLowerCase(),hit=null;FAMS.forEach(function(f){f.c.forEach(function(x){if(!hit&&x[0].toLowerCase()===want)hit=x})});
      if(hit){var fi=famOf(hit[1]);if(fi>=0&&fi!==fam)setFam(fi);pick(hit);return "month"}return "none"},
    reload:function(){LIST=readSaved();renderList();updSel()},
    select:selectRoom,pick:function(h){var c=null,fi=-1;FAMS.forEach(function(f,k){f.c.forEach(function(x){if(x[1]===h){c=x;fi=k}})});if(fi>=0&&fi!==fam)setFam(fi);pick(c)},list:function(){return LIST.slice()}};
})();

import * as THREE from "three";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";

const TEX=["/assets/img/etiqueta-abc-latex-mate.webp", "/assets/img/etiqueta-brillo-de-seda.webp", "/assets/img/etiqueta-impercoat-plus.webp", "/assets/img/etiqueta-hidro-esmalte.webp", "/assets/img/etiqueta-montafix-mate.webp"];
const CFG=window.MONTANA_CONFIG||{};
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE=matchMedia("(pointer: fine)").matches;
const $=s=>document.querySelector(s);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const mod=(n,m)=>((n%m)+m)%m;
const eio=t=>-(Math.cos(Math.PI*t)-1)/2;
function bez(x1,y1,x2,y2){
  const A=(a,b)=>1-3*b+3*a,B=(a,b)=>3*b-6*a,C=a=>3*a;
  const f=(t,a,b)=>((A(a,b)*t+B(a,b))*t+C(a))*t, d=(t,a,b)=>3*A(a,b)*t*t+2*B(a,b)*t+C(a);
  return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const e=f(t,x1,x2)-x;const s=d(t,x1,x2);if(Math.abs(e)<1e-5)break;if(Math.abs(s)<1e-6)break;t-=e/s}
    let lo=0,hi=1;if(Math.abs(f(t,x1,x2)-x)>1e-4){t=x;for(let i=0;i<24;i++){const v=f(t,x1,x2);if(v<x)lo=t;else hi=t;t=(lo+hi)/2}}return f(t,y1,y2)};
}
const GLIDE=bez(.25,.75,.2,1), ENTER=bez(.16,1,.3,1);

/* Productos: solo lo esencial */
const P=[
 {n:"ABC Látex Mate",two:["ABC","Látex Mate"],cat:"Pintura",col:"#0a78c8",bg:"#0e2a5e",cap:["Interior y exterior.","Acabado mate."],f:["Acabado mate","Rinde hasta 40 m² por galón por mano","Galón y cuñetes de 4 y 5"]},
 {n:"Brillo de Seda",two:["Brillo","de Seda"],cat:"Pintura",col:"#d12a30",bg:"#1a1f4c",cap:["Satinado lavable.","Primera calidad."],f:["Brillo sedoso y lavable","Rinde hasta 50 m² por galón por mano","Galón y cuñete de 4"]},
 {n:"ImperCoat Plus",two:["ImperCoat","Plus"],cat:"Impermeabilizante",col:"#0e8f8f",bg:"#0b2d4b",cap:["Techos y terrazas.","Sin calentar."],f:["Base agua, listo para aplicar","Bajo olor y no tóxico","Dos manos cruzadas, 24 h entre manos"]},
 {n:"Hidro Esmalte",two:["Hidro","Esmalte"],cat:"Esmalte al agua",col:"#1f9d55",bg:"#0f2d40",cap:["Esmalte al agua.","Interior y exterior."],f:["Mate, satinado o brillante","Se diluye con agua","Resiste la intemperie"]},
 {n:"Montafix Mate",two:["Montafix","Mate"],cat:"Esmalte alquídico",col:"#e8830c",bg:"#1e2448",cap:["Metal, concreto y madera.","Clase A."],f:["Primera calidad (Clase A)","Metal, concreto y madera","Presentación de 1 galón"]}
];
const NP=P.length;
const STEPS=[
 {h:["Prepara","la pared"],c:["Limpia, lija y sella.","La base lo es todo."],ry:0},
 {h:["Lo esencial,","a la vista"],c:["Rendimiento y acabado.","Sin letra pequeña."],ry:180},
 {h:["Asesoría","de verdad"],c:["Trae una foto de tu pared.","Te ayudamos a elegir."],ry:360},
 {h:null,c:null,ry:720}
];
const ICONS=[
 '<path d="M5 19c2.5 0 4-1.3 4-3.5a2.5 2.5 0 0 0-5 0c0 1.2-.4 2.4-1 3.5"/><path d="M9.5 13.5 19 4a1.4 1.4 0 0 1 2 2l-9.5 9.5"/>',
 '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
 '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>',
 '<path d="M12 3.5s6 6.6 6 10.9a6 6 0 0 1-12 0C6 10.1 12 3.5 12 3.5z"/><path d="M9.3 14.6a2.8 2.8 0 0 0 2.6 2.6"/>'
];
const PALETTE=["#ffd21f","#1f3a6b","#b9654a","#9aab8a","#efeae0","#e6c04a","#9db9d6"];
const waNum=String(CFG.whatsapp||"").replace(/\D/g,"");

/* Colores guardados en el simulador: se leen también en las páginas que no lo tienen */
const COLS={
  get(){if(window.MONTANA_SIM&&window.MONTANA_SIM.saved)return window.MONTANA_SIM.saved();
    try{const a=JSON.parse(localStorage.getItem("montanaColores")||"[]");return Array.isArray(a)?a.filter(x=>x&&/^#[0-9A-F]{6}$/i.test(x.h)&&typeof x.n==="string").slice(0,40):[]}catch(e){return[]}},
  remove(h){if(window.MONTANA_SIM&&window.MONTANA_SIM.remove){window.MONTANA_SIM.remove(h);return}
    const a=COLS.get().filter(x=>x.h!==h);try{localStorage.setItem("montanaColores",JSON.stringify(a))}catch(e){}
    try{document.dispatchEvent(new CustomEvent("montana:colores"))}catch(e){}}
};
let KIT_SYNC=null;

/* ---------- DOM ---------- */
const hero=$("#productos"),inside=$("#aplicar"),shop=$("#catalogo"),kit=$("#kit"),visit=$("#visitanos");
/* Web multipágina (18/11/2026): cada página trae solo sus secciones; este código se adapta a lo que hay */
const PAGE=document.body.dataset.page||"inicio";
const HAS_GL=!!(hero||inside||shop);
const ROUTES={inicio:"/",productos:"/productos/",pintar:"/como-pintar/",catalogo:"/catalogo/",kit:"/tu-kit/",visitanos:"/#visitanos",simulador:"/como-pintar/#simulador"};
const goPage=url=>{if(window.MONTANA_NAV)window.MONTANA_NAV.go(url);else location.href=url};
const cv=$("#gl"),titleEl=$("#title"),countEl=$("#count"),reveal=$("#reveal"),arc=$("#arc");
const inBar=$("#inBar"),inFront=$("#inFront"),inHead=$("#inHead"),inCap=$("#inCap"),inNum=$("#inNum"),inDark=$("#inDark"),frontFrame=$("#frontFrame");
let vw=innerWidth,vh=innerHeight;
/* Página Productos: panel con los datos del galón que se ve en el carrusel */
const prPanel=$("#prPanel");
function prFill(i){const p=P[i];$("#prCat").textContent=p.cat+" · "+String(i+1).padStart(2,"0")+"/"+String(NP).padStart(2,"0");
  $("#prCap").innerHTML=p.cap.join(" ");$("#prF").innerHTML=p.f.map(t=>"<li>"+t+"</li>").join("");$("#prAdd").setAttribute("aria-label","Añadir "+p.n+" a tu lista")}
function prShow(i){soft(prPanel,()=>prFill(i),{out:200,gap:40,inn:420,oe:"cubic-bezier(.5,0,.75,0)"})}
const phone=()=>vw<820;

/* Datos de contacto */
if(CFG.direccion)$("#fAddr").textContent=CFG.direccion;
if(CFG.horario){$("#fHours").textContent=CFG.horario;$("#fHoursW").hidden=false}
if(CFG.telefono){$("#fPhone").textContent=CFG.telefono;$("#fPhoneW").hidden=false}
if(waNum&&$("#vWa")){const a=$("#vWa");a.href="https://wa.me/"+waNum;a.hidden=false}

/* ---------- Fuentes y texturas ---------- */
await Promise.all([document.fonts.load('800 40px "Bricolage Grotesque"'),document.fonts.load('600 20px "Bricolage Grotesque"'),document.fonts.load('500 20px "Bricolage Grotesque"')]).catch(()=>{});
const imgs=await Promise.all(TEX.map(src=>new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src})));

function wrapLines(x,t,maxW){const w=t.split(" ");const out=[];let line="";for(const s of w){const tt=line?line+" "+s:s;if(x.measureText(tt).width>maxW&&line){out.push(line);line=s}else line=tt}if(line)out.push(line);return out}
function rr(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
/* La etiqueta envuelve el galón. Se desplaza para que el frente quede al 25 % del ancho; al 75 % (la espalda) se dibuja la ficha técnica. */
function labelCanvas(i){
  const p=P[i],W=2048,H=704,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  if(imgs[i]){x.drawImage(imgs[i],-W*.25,0,W,H);x.drawImage(imgs[i],W*.75,0,W,H)}else{x.fillStyle="#b8c0cf";x.fillRect(0,0,W,H)}
  const pw=W*.27,px=W*.75-pw/2,py=H*.265,ph=H*.69;
  x.save();x.shadowColor="rgba(5,12,35,.25)";x.shadowBlur=18;x.shadowOffsetY=4;
  x.fillStyle="rgba(255,255,255,.95)";rr(x,px,py,pw,ph,26);x.fill();x.restore();
  const L=px+30,R=px+pw-30;let y=py+56;
  x.fillStyle=p.col;x.fillRect(px,py+12,6,0);
  x.fillStyle="#0c1f4d";x.font='800 34px "Bricolage Grotesque"';x.textBaseline="alphabetic";x.fillText("FICHA TÉCNICA",L,y);
  y+=32;x.font='600 21px "Bricolage Grotesque"';x.fillStyle=p.col;x.fillText(p.n.toUpperCase()+" · "+p.cat.toUpperCase(),L,y);
  y+=16;x.fillStyle="#0c1f4d";x.fillRect(L,y,R-L,3);y+=8;
  x.font='500 21px "Bricolage Grotesque"';
  const rows=[...p.f,"Presentación · Galón 3,785 L"];
  rows.forEach((t,k)=>{const ls=wrapLines(x,t,R-L);ls.forEach((l,m)=>{y+=29;x.fillStyle=k<2?"#0c1f4d":"#3d4a6b";x.font=(k<2?'600':'500')+' 21px "Bricolage Grotesque"';x.fillText(l,L,y)});y+=13;x.fillStyle="rgba(12,31,77,.16)";x.fillRect(L,y,R-L,1.5)});
  x.font='700 17px "Bricolage Grotesque"';x.fillStyle="#0c1f4d";
  const ft="TIENDAS MONTANA · CARORA";x.save();x.letterSpacing="2px";x.fillText(ft,L,py+ph-26);x.restore();
  x.fillStyle=p.col;x.beginPath();x.arc(R-10,py+ph-32,9,0,7);x.fill();
  return c;
}
const labels=P.map((_,i)=>labelCanvas(i));

/* ---------- Three.js ---------- */
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0,0);
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
function addLights(sc){
  /* cielo cálido arriba, rebote frío abajo: da volumen sin contraste duro */
  sc.add(new THREE.HemisphereLight(0xfffaf2,0x9aa6c2,.62));
  const k=new THREE.DirectionalLight(0xfff6ea,1.12);k.position.set(-.6,.9,1.4);sc.add(k);
  /* luz de contorno suave por detrás a la derecha */
  const rim=new THREE.DirectionalLight(0xdfe7ff,.38);rim.position.set(1.3,.5,-.6);sc.add(rim);
}
addLights(scene);
const camera=new THREE.PerspectiveCamera(30,1,10,4000);
const MAXA=renderer.capabilities.getMaxAnisotropy();
function mkTex(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,MAXA);t.wrapS=THREE.RepeatWrapping;t.offset.x=.25;return t}
const texs=labels.map(mkTex);

/* Galón: cuerpo con etiqueta, tapa y aro de plástico, asa de alambre inclinada hacia atrás */
const R=.5,HB=2*Math.PI*R*704/2048;
const G={
  body:new THREE.CylinderGeometry(R,R,HB,128,1,true),
  lid:new THREE.CylinderGeometry(R*1.03,R*1.03,.085,128).translate(0,HB/2+.0425,0),
  lidTop:new THREE.CylinderGeometry(R*.86,R*.88,.014,96).translate(0,HB/2+.092,0),
  rim:new THREE.CylinderGeometry(R*1.014,R*1.014,.05,128).translate(0,-HB/2-.018,0),
};
class HandleCurve extends THREE.Curve{getPoint(t,o=new THREE.Vector3()){const a=Math.PI*t,lean=-72*Math.PI/180,y=Math.sin(a)*.42;return o.set(-Math.cos(a)*R*1.07,HB/2+.03+y*Math.cos(lean),y*Math.sin(lean))}}
G.handle=new THREE.TubeGeometry(new HandleCurve(),64,.011,8,false);
G.ear=new THREE.CylinderGeometry(.034,.034,.03,24).rotateZ(Math.PI/2);
const lidBump=(()=>{const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle="#808080";x.fillRect(0,0,256,256);
  [[.96,6,"#5a5a5a"],[.84,3,"#a8a8a8"],[.80,3,"#606060"],[.62,2.5,"#a0a0a0"],[.58,2.5,"#666"]].forEach(([r,w,c2])=>{x.strokeStyle=c2;x.lineWidth=w;x.beginPath();x.arc(128,128,r*128,0,7);x.stroke()});
  const t=new THREE.CanvasTexture(c);return t})();
const shadowTex=(()=>{const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(10,16,40,.62)");g.addColorStop(.35,"rgba(10,16,40,.34)");g.addColorStop(.7,"rgba(10,16,40,.08)");g.addColorStop(1,"rgba(10,16,40,0)");x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
const shadowGeo=new THREE.PlaneGeometry(1,1);

function makeGallon(fi,sc=scene){
  const group=new THREE.Group(),inner=new THREE.Group();group.add(inner);
  /* hojalata impresa con barniz: algo de metal, barniz satinado */
  const body=new THREE.MeshPhysicalMaterial({map:texs[fi],roughness:.42,metalness:.12,clearcoat:.55,clearcoatRoughness:.22,envMapIntensity:.62,transparent:true});
  /* plástico blanco algo cálido, mate satinado */
  const plast=new THREE.MeshPhysicalMaterial({color:0xfbfaf6,roughness:.5,clearcoat:.2,clearcoatRoughness:.45,envMapIntensity:.55,sheen:.3,sheenRoughness:.6,sheenColor:0xffffff,transparent:true});
  const plastTop=plast.clone();plastTop.bumpMap=lidBump;plastTop.bumpScale=1.2;
  /* alambre galvanizado: metálico pero no cromado */
  const metal=new THREE.MeshStandardMaterial({color:0x9aa2ae,metalness:.8,roughness:.42,envMapIntensity:.85,transparent:true});
  const meshes=[new THREE.Mesh(G.body,body),new THREE.Mesh(G.lid,plast),new THREE.Mesh(G.lidTop,plastTop),new THREE.Mesh(G.rim,plast),new THREE.Mesh(G.handle,metal)];
  [-1,1].forEach(s=>{const e=new THREE.Mesh(G.ear,metal);e.position.set(s*R*1.045,HB/2+.03,0);meshes.push(e)});
  meshes.forEach(m=>inner.add(m));
  const shadow=new THREE.Mesh(shadowGeo,new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));shadow.renderOrder=-1;
  sc.add(group);sc.add(shadow);
  return {group,inner,meshes,mats:[body,plast,plastTop,metal],shadow,fi,j:0,op:1};
}
/* Medidas reales del galón */
const probe=makeGallon(0,new THREE.Scene());
const box=new THREE.Box3().setFromObject(probe.group);
const GW=box.max.x-box.min.x,GH=box.max.y-box.min.y,GC=(box.max.y+box.min.y)/2;
const GA=GW/GH;document.documentElement.style.setProperty("--ga",GA.toFixed(4));

function setGallon(o,s){
  const vis=s.op>.01;o.group.visible=vis;o.shadow.visible=vis&&s.shadow>0;
  if(!vis)return;
  o.inner.position.y=-GC;
  const k=s.h/GH;
  o.group.position.set(s.x-vw/2,vh/2-s.y,s.z||0);
  o.group.scale.set(k*(s.sx||1),k*(s.sy||1),k);
  o.group.rotation.set((s.rx||0)*Math.PI/180,s.ry*Math.PI/180,-s.rz*Math.PI/180,"ZYX");
  if(o.op!==s.op){o.mats.forEach(m=>m.opacity=s.op);o.op=s.op}
  const ry=s.ry*Math.PI/180;
  o.shadow.position.set(s.x-vw/2+.045*s.h,vh/2-s.y-.06*s.h,(s.z||0)-.32*s.h);
  o.shadow.rotation.set(0,0,-s.rz*Math.PI/180);
  o.shadow.scale.set(1.25*GW*k*Math.max(.3,Math.abs(Math.cos(ry))),1.04*s.h,1);
  o.shadow.material.opacity=.5*s.op*s.shadow;
}
function setFlav(o,fi){if(o.fi!==fi){o.mats[0].map=texs[fi];o.fi=fi}}

/* Imagen plana de cada galón, hecha con el mismo modelo 3D */
/* Imagen plana de cada galón. Se genera con el mismo renderizador después de la entrada, para no retrasar la intro */
const SLUG=["abc-latex-mate","brillo-de-seda","impercoat-plus","hidro-esmalte","montafix-mate"];
const sprites=SLUG.map(x=>"/assets/img/galon-"+x+".webp");
const BLANK="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
function makeSprites(){
  const W=Math.round(520*GA),H=520;
  const s2=new THREE.Scene();s2.environment=scene.environment;addLights(s2);
  const D=3000,cam=new THREE.PerspectiveCamera(2*Math.atan(H/2/D)*180/Math.PI,W/H,10,4*D);cam.position.set(0,0,D);
  const o=makeGallon(0,s2);o.shadow.visible=false;
  renderer.setPixelRatio(1);renderer.setSize(W,H,false);
  for(let i=0;i<NP;i++){setFlav(o,i);o.inner.position.y=-GC;o.group.scale.setScalar(H/GH);o.group.rotation.set(0,0,0);renderer.render(s2,cam);sprites[i]=cv.toDataURL("image/png")}
  layout();
  document.querySelectorAll("img[data-spr]").forEach(im=>im.src=sprites[+im.dataset.spr]);
}

/* ---------- Estado ---------- */
let pos=-3.6,target=0,cur=0;
let slide=null,reveal_=null,drag=null,lastInteract=0,autoOn=!RM;
const POOL=[];for(let i=0;i<11;i++)POOL.push(makeGallon(0));
const TR=makeGallon(0);
let HU=1,cx=0,cy=0,spread=1,heroH=1;
const SL=[[0,0,330,0,0],[285,22,240,4,16],[520,44,222,8,26],[740,80,206,12,34],[940,118,192,15,40]];
function slot(k){const a=Math.min(4,Math.abs(k)),i=Math.floor(a),f=a-i,A=SL[i],B=SL[Math.min(4,i+1)],L=m=>A[m]+(B[m]-A[m])*f,s=Math.sign(k)||0;return{dx:s*L(0),dy:L(1),h:L(2),rz:s*L(3),ry:s*L(4)}}
function arcState(k,j,t,top){
  const s=slot(k);let x=cx+s.dx*HU*spread,y=top+cy+s.dy*HU,rz=s.rz;
  if(!RM){const b=Math.sin(t/4600*2*Math.PI+1.37*j);y-=(.5*b+.5)*9*HU;rz+=.4*b}
  const a=Math.abs(k),op=a<=3.3?1:clamp(1-(a-3.3)/.6);
  return{x,y,h:s.h*HU,rz,ry:s.ry,rx:0,z:-a*34*HU,op,sx:1,sy:1,shadow:1};
}

/* ---------- Medidas ---------- */
function layout(){
  vw=innerWidth;vh=innerHeight;
  const pr=Math.min(devicePixelRatio||1,phone()?1.75:2);
  renderer.setPixelRatio(pr);renderer.setSize(vw,vh,false);cv.style.height=vh+"px";
  const D=clamp(1500*Math.min(vw/1440,vh/900),1000,2200);
  camera.position.set(0,0,D);camera.fov=2*Math.atan(vh/2/D)*180/Math.PI;camera.aspect=vw/vh;camera.near=10;camera.far=4*D;camera.updateProjectionMatrix();
  heroH=hero?hero.offsetHeight:vh;
  if(phone()){HU=Math.min(vw/560,heroH/980);cy=heroH*.4;spread=1.02}else{HU=Math.min(vw/1440,heroH/900);cy=heroH/2-78*HU;spread=1}
  cx=vw/2;
  const k=phone()?Math.min(vw/390,vh/780):Math.min(vw/1440,vh/900);
  document.documentElement.style.setProperty("--k",k);
  sizeTitle();placeBits();moveHL();
}

/* ---------- Título ---------- */
const mctx=document.createElement("canvas").getContext("2d");
function measure(t){mctx.font='800 100px "Bricolage Grotesque"';return mctx.measureText(t.toUpperCase()).width}
function sizeTitle(i=cur){
  if(!titleEl)return;
  const n=P[i].n;let fs;
  if(phone()){const base=clamp(.08*vw,22,30);fs=Math.min(base,(vw-170)*100/measure(n));if(vw<820&&vh<=500&&vw>vh)fs=Math.min(20,fs)}
  else fs=Math.min(44*HU,700*HU*100/measure(n));
  titleEl.style.fontSize=fs+"px";
}
function buildTitle(i){
  const frag=document.createDocumentFragment(),chs=[];
  P[i].n.toUpperCase().split(" ").forEach(w=>{const s=document.createElement("span");s.className="wd";[...w].forEach(c=>{const e=document.createElement("span");e.className="ch";e.textContent=c;s.appendChild(e);chs.push(e)});frag.appendChild(s)});
  return{frag,chs};
}
let titleChs=[];
function setTitle(i,dir=1,animate=true){
  if(!titleEl)return;
  sizeTitle(i);
  const old=titleChs;
  const {frag,chs}=buildTitle(i);
  if(!animate||RM){titleEl.textContent="";titleEl.appendChild(frag);titleChs=chs;titleEl.setAttribute("aria-label",P[i].n);return}
  old.forEach((c,k)=>c.animate([{transform:"translateY(0)",opacity:1},{transform:`translateY(${-110*dir}%)`,opacity:0}],{duration:300,delay:k*11,easing:"cubic-bezier(.45,0,.75,.3)",fill:"forwards"}));
  const wait=Math.min(300+old.length*11,120);
  setTimeout(()=>{
    titleEl.textContent="";titleEl.appendChild(frag);titleChs=chs;titleEl.setAttribute("aria-label",P[i].n);
    chs.forEach((c,k)=>c.animate([{transform:`translateY(${110*dir}%)`,opacity:0},{transform:"translateY(0)",opacity:1}],{duration:620,delay:k*22,easing:"cubic-bezier(.22,1,.36,1)",fill:"backwards"}));
  },wait);
}
function soft(el,fn,o={out:220,gap:60,inn:380,oe:"cubic-bezier(.5,0,.75,0)"}){
  if(!el)return;
  if(RM){fn();return}
  el.animate([{translate:"0 0",opacity:1},{translate:"0 -10px",opacity:0}],{duration:o.out,easing:o.oe,fill:"forwards"});
  setTimeout(()=>{fn();el.animate([{translate:"0 14px",opacity:0},{translate:"0 0",opacity:1}],{duration:o.inn,easing:"cubic-bezier(.22,1,.36,1)",fill:"forwards"})},o.out+o.gap);
}

/* ---------- Cambio de producto ---------- */
function flavourChange(i,dir){
  if(i===cur)return;cur=i;
  startReveal(P[i].bg);
  setTitle(i,dir);
  soft(countEl,()=>countEl.textContent=String(i+1).padStart(2,"0"));
  cards.forEach((c,k)=>c.classList.toggle("live",k===i));
  if(prPanel)prShow(i);
  if(step===3)soft(inHead,()=>headFor(3),{out:240,gap:40,inn:460,oe:"cubic-bezier(.5,0,.75,0)"});
  if(step===3)soft(inCap,()=>capFor(3),{out:240,gap:40,inn:460,oe:"cubic-bezier(.5,0,.75,0)"});
}
function finishReveal(){if(!reveal_)return;document.documentElement.style.setProperty("--flav",reveal_.col);if(reveal)reveal.style.setProperty("--rv","transparent");reveal&&(reveal.style.webkitMaskImage=reveal.style.maskImage="");reveal_=null}
function startReveal(col){
  finishReveal();
  if(RM||!reveal){document.documentElement.style.setProperty("--flav",col);return}
  reveal.style.setProperty("--rv",col);
  const far=Math.max(Math.hypot(cx,cy),Math.hypot(vw-cx,cy),Math.hypot(cx,heroH-cy),Math.hypot(vw-cx,heroH-cy));
  reveal_={col,t0:performance.now(),dur:420,R:1.45*far};
  drawReveal(performance.now());
}
function drawReveal(t){
  if(!reveal_)return;const q=clamp((t-reveal_.t0)/reveal_.dur);const r=reveal_.R*GLIDE(q),f=Math.max(60,.35*r);
  const m=`radial-gradient(circle at ${cx}px ${cy}px, #000 ${Math.max(0,r-f)}px, transparent ${r}px)`;
  reveal.style.webkitMaskImage=m;reveal.style.maskImage=m;
  if(q>=1)finishReveal();
}
function goTo(to,o={}){
  to=Math.round(to);const now=performance.now();lastInteract=now;
  if(slide&&slide.fire&&!slide.fired){slide.fired=true;flavourChange(mod(slide.to,NP),slide.dir)}
  const dist=Math.abs(to-pos);if(dist<.001&&to===target)return;
  const dir=to>=target?1:-1;
  const fireNow=!!o.fireNow;
  target=to;
  const dur=RM?0:(o.dur??(650+160*Math.max(0,Math.round(dist)-1)));
  const changed=mod(to,NP)!==cur;
  slide={from:pos,to,t0:now,dur,ease:o.ease||GLIDE,fire:changed&&!fireNow,fired:false,dir};
  if(changed&&(fireNow||dur===0)){slide.fire=false;flavourChange(mod(to,NP),dir)}
  if(dur===0){pos=to;slide=null}
}
function stepSlide(now){
  if(!slide)return;const q=slide.dur?clamp((now-slide.t0)/slide.dur):1;
  pos=lerp(slide.from,slide.to,slide.ease(q));
  if(slide.fire&&!slide.fired&&q>=.12){slide.fired=true;flavourChange(mod(slide.to,NP),slide.dir)}
  if(q>=1){pos=slide.to;slide=null}
}

/* ---------- Arrastre, toque, teclado ---------- */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function hitAt(x,y){
  ndc.set(x/vw*2-1,-(y/vh)*2+1);ray.setFromCamera(ndc,camera);
  const list=[...POOL,TR].filter(o=>o.group.visible&&o.op>.3&&o.isHero);
  let best=null,bd=1e9;
  for(const o of list){const h=ray.intersectObject(o.group,true);if(h.length&&h[0].distance<bd){bd=h[0].distance;best=o}}
  return best;
}
if(arc){
arc.addEventListener("pointerdown",e=>{
  if(e.button!==0||!entered)return;
  drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,pos0:pos,on:false,lx:e.clientX,lt:performance.now(),v:0,type:e.pointerType};
});
arc.addEventListener("pointermove",e=>{
  if(drag&&e.pointerId===drag.id){
    const dx=e.clientX-drag.x0;
    if(!drag.on&&Math.abs(dx)>6){drag.on=true;slide=null;arc.setPointerCapture(e.pointerId);document.body.classList.add("dragging");drag.x0=e.clientX;drag.pos0=pos}
    if(drag.on){
      const slotPx=285*HU*spread,now=performance.now();
      pos=drag.pos0-(e.clientX-drag.x0)/slotPx;
      const dt=Math.max(1,now-drag.lt),v=-(e.clientX-drag.lx)/slotPx/dt;drag.v=lerp(drag.v,v,.4);drag.lx=e.clientX;drag.lt=now;lastInteract=now;
    }
    return;
  }
  if(e.pointerType==="mouse"&&entered){const h=hitAt(e.clientX,e.clientY);arc.style.cursor=h?"pointer":"grab"}
});
function release(e,cancel){
  if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;document.body.classList.remove("dragging");
  if(d.on){
    if(cancel&&Math.abs(pos-Math.round(pos))<.02){pos=Math.round(pos);if(mod(Math.round(pos),NP)!==cur){target=Math.round(pos);flavourChange(mod(target,NP),1)}return}
    const to=Math.round(pos+clamp(d.v*220,-2,2));
    goTo(to,{dur:Math.max(380,650*Math.min(1,Math.abs(to-pos)+.35)),fireNow:true});
  }else if(!cancel){
    const h=hitAt(e.clientX,e.clientY);if(h){const k=h.j-target;if(k)goTo(target+k)}
  }
}
arc.addEventListener("pointerup",e=>release(e,false));
arc.addEventListener("pointercancel",e=>release(e,true));
$("#play").addEventListener("click",()=>goTo(target+1));
}
addEventListener("keydown",e=>{
  if(!entered||!hero)return;const r=hero.getBoundingClientRect();const vis=(Math.min(r.bottom,vh)-Math.max(r.top,0))/r.height;
  if(vis<.5)return;
  if(e.key==="ArrowRight"){e.preventDefault();goTo(target+1)}else if(e.key==="ArrowLeft"){e.preventDefault();goTo(target-1)}
});
const autoBtn=$("#auto");
function setAuto(v){autoOn=v;if(autoBtn)autoBtn.setAttribute("aria-pressed",String(v));lastInteract=performance.now()}
if(autoBtn)autoBtn.addEventListener("click",()=>setAuto(!autoOn));
setAuto(autoOn);
let heroVis=hero?1:0;
if(hero)new IntersectionObserver(([en])=>heroVis=en.intersectionRatio,{threshold:[0,.2,.4,.6,.8,1]}).observe(hero);

/* ---------- Gotas flotantes ---------- */
/* Contornos orgánicos generados una vez: gota con cuello irregular y salpicadura con gotitas satélite */
function organic(seed,kind){
  let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const N=kind?22:18,pts=[];
  const ph=[rnd()*6.28,rnd()*6.28,rnd()*6.28];
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2-Math.PI/2;let r;
    if(kind){r=30+5*Math.sin(3*a+ph[0])+3.5*Math.sin(5*a+ph[1])+(rnd()<.33?6+rnd()*9:rnd()*2.5)}
    else{const up=Math.max(0,-Math.sin(a));r=26+2*Math.sin(2*a+ph[0])+1.5*Math.sin(4*a+ph[1])+up*up*up*30}
    pts.push([50+Math.cos(a)*r*(kind?1:.98),(kind?50:58)+Math.sin(a)*r])}
  const n=pts.length;let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=`C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}
  d+="Z";
  if(kind){const k=3+Math.floor(rnd()*3);for(let i=0;i<k;i++){const a=rnd()*6.28,r=40+rnd()*9,cr=2+rnd()*3.6;const x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;d+=`M${(x-cr).toFixed(1)} ${y.toFixed(1)}a${cr.toFixed(1)} ${cr.toFixed(1)} 0 1 0 ${(2*cr).toFixed(1)} 0a${cr.toFixed(1)} ${cr.toFixed(1)} 0 1 0 ${(-2*cr).toFixed(1)} 0Z`}}
  return d;
}
const SHAPES={s:[1,2,3,4].map(k=>organic(131*k+7,1))};
const DROP_D=["M50 6C50 6 18 44 18 64a32 32 0 0 0 64 0C82 44 50 6 50 6z","M50 5C49 9 19 43 18.5 63.5C18 82 32 96 50.5 96C69 96 82.5 82 81.5 63C80.5 45 51 9 50 5z","M51 7C50 12 20 42 19 64C18.5 81 33 95 51 95C68 95 81 81.5 80.5 64.5C80 44 52 12 51 7z","M49.5 6C48.5 11 18 45 18 65C18 82.5 32 95.5 49.5 95.5C67.5 95.5 81.5 82 81.5 65C81.5 46 50.5 11 49.5 6z"];
const DROP=(c,v=0)=>`<svg viewBox="0 0 100 100"><path d="${DROP_D[v%4]}" fill="${c}"/></svg>`;
const BITS=[[.12,.20,120,-18,0],[.86,.18,96,22,1],[.07,.74,84,12,2],[.655,.15,78,-10,3],[.205,.885,70,30,4]];
const SPLAT=(c,v=0)=>`<svg viewBox="0 0 100 100"><path d="${SHAPES.s[v%4]}" fill="${c}"/></svg>`;
const BITC=["#ffd21f","#e9e4da","#3b5b9a","#b9654a","#d9d2c4"];
const bitsEl=$("#bits");
const bitEls=!bitsEl?[]:BITS.map((b,i)=>{const d=document.createElement("div");d.className="bit";d.innerHTML=i%2?SPLAT(BITC[i],i):DROP(BITC[i],i);bitsEl.appendChild(d);return d});
function placeBits(){const u=Math.min(vw/1440,heroH/900);bitEls.forEach((d,i)=>{const b=BITS[i];const s=b[2]*u*(phone()?1.3:1);d.style.width=d.style.height=s+"px";d.style.left=(b[0]*vw-s/2)+"px";d.style.top=(b[1]*heroH-s/2)+"px";d.style.transform=`rotate(${b[3]}deg)`;d.style.display=phone()&&[1,3,4].includes(i)?"none":""})}
function startBits(){
  bitEls.forEach((d,i)=>{
    if(RM){d.style.opacity=.55;return}
    d.animate([{opacity:0},{opacity:.6}],{duration:900,delay:300+90*i,fill:"forwards"});
    const sx=(i%2?1:-1)*(12+i%3),r=(i%2?-1:1)*(10+i%3);
    d.animate([{transform:"translate(0,0) rotate(0deg)"},{transform:`translate(${sx}px,${-(22+3*i)}px) rotate(${r}deg)`},{transform:"translate(0,0) rotate(0deg)"}],{duration:7000+900*i,iterations:Infinity,easing:"ease-in-out",composite:"add"});
  });
}

/* ---------- Sección 2 ---------- */
const inIcons=$("#inIcons");
if(inIcons)STEPS.forEach((s,i)=>{const b=document.createElement("button");b.setAttribute("aria-label","Paso "+(i+1));b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[i]}</svg>`;
  b.addEventListener("click",()=>{const top=inside.offsetTop,span=inside.offsetHeight-vh;const p=(i*.19+.095);smoothTo(top+p*span)});inIcons.appendChild(b)});
function headFor(i){
  if(!inHead)return;
  if(i<3){inHead.innerHTML=STEPS[i].h.join("<br>");return}
  inHead.innerHTML=P[cur].n.split(" ").map(w=>w.length>9?`<span class="sm">${w}</span>`:w).join("<br>");
}
function capFor(i){if(inCap)inCap.innerHTML=(i<3?STEPS[i].c:P[cur].cap).join("<br>")}
let step=0,flip={a:0,from:0,to:0,t0:0,dur:0};
headFor(0);capFor(0);if(inIcons)[...inIcons.children][0].classList.add("on");
function setStep(s){
  if(s===step)return;step=s;
  if(inIcons)[...inIcons.children].forEach((b,k)=>b.classList.toggle("on",k===s));
  const to=STEPS[s].ry,d=Math.abs(to-flip.a);
  const dur=RM?0:720*clamp(d/180,.4,2);
  flip={a:flip.a,from:flip.a,to,t0:performance.now(),dur};
  const at=RM?0:.38*Math.min(dur,720)-240;
  const o={out:240,gap:40,inn:460,oe:"cubic-bezier(.5,0,.75,0)"};
  setTimeout(()=>{soft(inHead,()=>headFor(s),o);soft(inCap,()=>capFor(s),o);soft(inNum,()=>inNum.textContent=String(s+1).padStart(2,"0"),o)},Math.max(0,at));
}
function stepFlip(now){if(!flip.dur){flip.a=flip.to;return}const q=clamp((now-flip.t0)/flip.dur);flip.a=lerp(flip.from,flip.to,eio(q));if(q>=1)flip.dur=0}

/* Tormenta de pintura */
const stormEl=$("#storm"),PCS=[];
(function(){let s=11;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<20&&stormEl;i++){const own=rnd()<.7;const d=document.createElement("div");d.className="pc";stormEl.appendChild(d);
    PCS.push({el:d,own,col:PALETTE[Math.floor(rnd()*PALETTE.length)],shape:rnd()<.55?0:1,a:rnd()*Math.PI*2,ph:i/20+rnd()*.03,spin:(rnd()<.5?-1:1)*360,size:.7+rnd()*.7,painted:null})}})();
function paintPiece(pc){const c=pc.own?P[cur].col:pc.col;const key=c+pc.shape;if(pc.painted===key)return;pc.painted=key;pc.el.innerHTML=pc.shape?SPLAT(c,PCS.indexOf(pc)):DROP(c,PCS.indexOf(pc))}

/* ---------- Catálogo ---------- */
const cardsEl=$("#cards"),cards=[];
if(cardsEl)P.forEach((p,i)=>{
  const c=document.createElement("div");c.className="card"+(i===cur?" live":"");c.style.setProperty("--c",p.col);c.style.setProperty("--i",i);
  c.innerHTML=`<h3 class="disp">${p.two[0]}<br>${p.two[1]}</h3><div class="pk"><img alt="${p.n}" data-spr="${i}" src="${sprites[i]||BLANK}"></div><button class="add" aria-label="Añadir ${p.n} a tu lista"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg></button>`;
  c.tx=0;c.ty=0;c.poke=0;
  if(FINE){
    c.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=c.getBoundingClientRect();c.tx=(e.clientX-r.left)/r.width-.5;c.ty=(e.clientY-r.top)/r.height-.5;c.classList.add("tilt");c.style.transform=`translateY(-8px) rotateX(${-c.ty*12}deg) rotateY(${c.tx*12}deg)`;c.style.boxShadow="0 24px 40px -18px rgba(12,31,77,.35)"});
    c.addEventListener("pointerleave",()=>{c.tx=c.ty=0;c.classList.remove("tilt");c.style.transform="";c.style.boxShadow="";c.classList.remove("press")});
  }
  c.addEventListener("pointerdown",()=>c.classList.add("press"));
  c.addEventListener("pointerup",()=>c.classList.remove("press"));
  c.querySelector(".pk").addEventListener("click",()=>poke(i));
  c.querySelector(".add").addEventListener("click",e=>{e.stopPropagation();addToList({t:"p",i},[c.querySelector(".pk img")])});
  cardsEl.appendChild(c);cards.push(c);
});
function poke(i){const c=cards[i];c.poke=performance.now();if(!c.classList.contains("live")||RM){const im=c.querySelector(".pk img");im.animate([{transform:"scale(1,1)"},{transform:"scale(1.06,.93)",offset:.3},{transform:"scale(.97,1.04)",offset:.6},{transform:"scale(1,1)"}],{duration:500})}}
function pokeScale(i,now){const c=cards[i];if(!c.poke||RM)return[1,1];const q=(now-c.poke)/500;if(q>=1)return[1,1];
  const K=[[0,1,1],[.3,1.06,.93],[.6,.97,1.04],[1,1,1]];for(let k=0;k<3;k++){if(q<=K[k+1][0]){const f=(q-K[k][0])/(K[k+1][0]-K[k][0]);return[lerp(K[k][1],K[k+1][1],f),lerp(K[k][2],K[k+1][2],f)]}}return[1,1]}
document.body.classList.add("gl");

/* ---------- Kit ---------- */
if(kit){
const glow=$("#glow"),thumbs=$("#thumbs"),buy=$("#buy");
/* Kit libre (18/11/2026): se eligen de 1 a 5 productos, con recomendación según lo que se va a pintar */
const LAYOUTS=[[],[[50,48]],[[37,50],[63,50]],[[50.2,37],[34.8,59.3],[64.8,59.3]],[[36,36],[64,36],[36,68],[64,68]],[[22,36],[50,36],[78,36],[36,68],[64,68]]];
const NEEDS={paredes:{p:[0,1],t:"Para paredes: ABC Látex Mate (interior y exterior, acabado mate) o Brillo de Seda (satinado y lavable)."},
  fachada:{p:[0,3],t:"Para fachadas: ABC Látex Mate (interior y exterior) e Hidro Esmalte, que resiste la intemperie."},
  techo:{p:[2],t:"Para techos y terrazas: ImperCoat Plus, impermeabilizante base agua que se aplica sin calentar."},
  rejas:{p:[4,3],t:"Para rejas, puertas y madera: Montafix Mate (metal, concreto y madera) o Hidro Esmalte al agua."}};
let pack=[],touched=false,need=null;
const KIT_KEY="montanaKit";
function loadKit(){try{const o=JSON.parse(localStorage.getItem(KIT_KEY)||"null");if(o&&typeof o==="object"){pack=(Array.isArray(o.pack)?o.pack:[]).filter((v,k,a)=>Number.isInteger(v)&&v>=0&&v<NP&&a.indexOf(v)===k);need=Object.prototype.hasOwnProperty.call(NEEDS,o.need)?o.need:null}}catch(e){}}
function saveKit(){try{localStorage.setItem(KIT_KEY,JSON.stringify({pack,need}))}catch(e){}}
loadKit();
const ktEmpty=$("#ktEmpty"),ktWa=$("#ktWa"),ktSee=$("#ktSee"),ktTip=$("#ktTip");
const thEls=P.map((p,i)=>{const b=document.createElement("button");b.className="th";b.style.setProperty("--c",p.col);b.setAttribute("aria-pressed","false");b.setAttribute("aria-label",p.n+": "+p.cap[0]);
  b.innerHTML=`<span class="sq"><img alt="" data-spr="${i}" src="${sprites[i]||BLANK}"><span class="ok">✓</span><span class="rc">Ideal</span></span><span class="nm">${p.n}</span><span class="cp">${p.cap[0]}</span>`;
  b.addEventListener("click",()=>{touched=true;togglePack(i)});thumbs.appendChild(b);return b});
function togglePack(i){const k=pack.indexOf(i);if(k>=0){pack.splice(k,1);renderPack()}else{pack.push(i);renderPack(i);
  glow.style.setProperty("--g",hexA(P[i].col,.62));if(!RM)glow.animate([{opacity:.55},{opacity:1}],{duration:600})}}
function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function renderPack(added=-1){
  saveKit();
  const L=LAYOUTS[pack.length];
  [...glow.querySelectorAll(".slot")].forEach(s=>{if(!pack.includes(+s.dataset.i))s.remove()});
  pack.forEach((i,k)=>{let s=glow.querySelector(`.slot[data-i="${i}"]`);
    if(!s){s=document.createElement("div");s.className="slot full";s.dataset.i=i;
      s.innerHTML=`<div class="sp" data-i="${i}"><img alt="${P[i].n}" data-spr="${i}" src="${sprites[i]||BLANK}"></div><button class="x" aria-label="Quitar ${P[i].n}"><svg viewBox="0 0 12 12" fill="none" stroke="#f6f3ee" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg></button>`;
      s.querySelector(".x").addEventListener("click",()=>{touched=true;togglePack(i)});glow.appendChild(s);if(i===added&&!RM)s.querySelector(".sp").classList.add("rise")}
    s.style.left=L[k][0]+"%";s.style.top=L[k][1]+"%"});
  glow.classList.toggle("many",pack.length===4);glow.classList.toggle("five",pack.length===5);ktEmpty.hidden=pack.length>0;
  thEls.forEach((t,i)=>{const on=pack.includes(i);t.classList.toggle("has",on);t.setAttribute("aria-pressed",String(on));t.classList.toggle("rec",!!need&&NEEDS[need].p.includes(i))});
  const n=pack.length;
  if(!buy.classList.contains("done")){buy.disabled=!n;buy.textContent=n?`Añadir ${n===1?"1 producto":n+" productos"} a tu lista`:"Elige tus productos"}
  ktWa.setAttribute("aria-disabled",String(!n&&!need));
  ktSee.hidden=!n;mineDots();
}
function mineDots(){const box=document.getElementById("ktMine"),sub=document.getElementById("ktSeeSub");if(!box)return;
  const L=COLS.get();
  if(L.length){box.hidden=false;box.innerHTML='<span>Con tus colores:</span>'+L.slice(0,8).map(x=>`<i style="--c:${/^#[0-9a-f]{6}$/i.test(x.h)?x.h:"#ccc"}" title="${x.n.replace(/[<>"&]/g,"")}"></i>`).join("")+(L.length>8?`<em>+${L.length-8}</em>`:"");sub.textContent="Se abrirá con tus colores ya pintados"}
  else{box.hidden=true;sub.textContent="Se abrirá con el Color del mes; guarda tus colores en el simulador"}}
document.addEventListener("montana:colores",mineDots);
function kitMsg(){const items=pack.map(i=>P[i].n);const lugar=need?{paredes:"las paredes de mi casa",fachada:"la fachada",techo:"el techo o la terraza",rejas:"rejas, puertas y madera"}[need]:"";
  return "Hola, Tiendas Montana. Quiero asesoría"+(lugar?" para pintar "+lugar:"")+(items.length?". Me interesan: "+items.join(", "):"")+".";}
ktWa.addEventListener("click",e=>{if(ktWa.getAttribute("aria-disabled")==="true"){e.preventDefault();ktTip.textContent="Elige primero qué vas a pintar o algún producto.";return}
  if(waNum){ktWa.href="https://wa.me/"+waNum+"?text="+encodeURIComponent(kitMsg());ktWa.target="_blank";ktWa.rel="noopener"}else{e.preventDefault();goPage(ROUTES.visitanos)}});
document.querySelectorAll(".kt-chip").forEach(c=>c.addEventListener("click",()=>{touched=true;const v=c.dataset.need;need=need===v?null:v;
  document.querySelectorAll(".kt-chip").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.need===need)));
  ktTip.textContent=need?NEEDS[need].t+" Toca los que quieras.":"";renderPack()}));
/* fotos de los ambientes del simulador, reutilizadas (se cargan al ver el kit) */
{const loadRooms=()=>document.querySelectorAll(".kt-room .ph").forEach(ph=>{if(ph.firstChild)return;const c=new Image();c.alt="";c.decoding="async";c.src="/assets/img/simulador/"+ph.dataset.img+"-mini.webp";ph.appendChild(c)});
  const io=new IntersectionObserver(en=>{if(en[0].isIntersecting){loadRooms();io.disconnect()}},{rootMargin:"300px 0px"});io.observe(kit)}
document.querySelectorAll(".kt-room").forEach(b=>b.addEventListener("click",()=>{
  goPage("/como-pintar/?ambiente="+encodeURIComponent(b.dataset.r)+"#simulador")}));
buy.addEventListener("click",()=>{
  if(!pack.length)return;const items=[...pack];
  const srcs=[...glow.querySelectorAll(".slot .sp img")];
  addToList({t:"kit",items},srcs);
  setTimeout(()=>{buy.classList.add("done");buy.disabled=false;buy.textContent="Añadido a tu lista";
    setTimeout(()=>{buy.classList.remove("done");renderPack()},1600)},60);
});
document.querySelectorAll(".kt-chip").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.need===need)));
if(need)ktTip.textContent=NEEDS[need].t+" Toca los que quieras.";
renderPack();
KIT_SYNC=()=>{loadKit();document.querySelectorAll(".kt-chip").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.need===need)));ktTip.textContent=need?NEEDS[need].t+" Toca los que quieras.":"";renderPack()};
}

/* ---------- Lista para consultar ---------- */
const LIST=[];const badge=$("#badge"),listBtn=$("#list");
/* Tu lista se guarda en el navegador: no se pierde al cambiar de página ni al recargar */
const LIST_KEY="montanaLista";
function loadList(){LIST.length=0;try{const a=JSON.parse(localStorage.getItem(LIST_KEY)||"[]");if(Array.isArray(a))a.forEach(it=>{
  if(it&&it.t==="p"&&Number.isInteger(it.i)&&it.i>=0&&it.i<NP)LIST.push({t:"p",i:it.i});
  else if(it&&it.t==="kit"&&Array.isArray(it.items)){const items=it.items.filter(v=>Number.isInteger(v)&&v>=0&&v<NP);if(items.length)LIST.push({t:"kit",items})}})}catch(e){}
  if(LIST.length>60)LIST.splice(0,LIST.length-60)}
function saveList(){try{localStorage.setItem(LIST_KEY,JSON.stringify(LIST))}catch(e){}}
loadList();
function listText(){
  const c={};LIST.forEach(it=>{if(it.t==="p")c[P[it.i].n]=(c[P[it.i].n]||0)+1});
  const parts=Object.entries(c).map(([n,k])=>(k>1?k+"× ":"")+n);
  LIST.filter(it=>it.t==="kit").forEach(it=>parts.push("Kit: "+it.items.map(i=>P[i].n).join(", ")));
  return parts.join("; ");
}
function updateCount(){
  saveList();
  const n=LIST.length;badge.textContent=n;tbCount(n);
  if(n){badge.style.transform="scale(1)";if(!RM)badge.animate([{transform:"scale(0)"},{transform:"scale(1.5)",offset:.5},{transform:"scale(1)"}],{duration:350})}
  if($("#listLine"))$("#listLine").textContent=n?(waNum?"Tu lista: ":"Tu lista para mostrar en tienda: ")+listText()+".":"";
}
/* carrito: ver todo antes de comprar; solo «Comprar» manda a WhatsApp */
const WA_IC='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
const cart=document.createElement("div");cart.className="ct";cart.id="cart";cart.hidden=true;
cart.innerHTML=`<div class="ct-bg"></div><div class="ct-p" role="dialog" aria-modal="true" aria-labelledby="ctT"><div class="ct-h"><h2 id="ctT">Tu lista<small id="ctSub"></small></h2><button class="ct-x" id="ctX" type="button" aria-label="Cerrar tu lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="ct-b" id="ctB"></div><div class="ct-f" id="ctF"><div class="ct-sum"><span>Productos</span><b id="ctN">0</b></div><button class="ct-buy" id="ctBuy" type="button">${WA_IC}<span>Comprar</span></button><p class="ct-note" id="ctNote">Te llevamos a WhatsApp con tu lista para que la tienda te atienda.</p><p class="ct-msg" id="ctMsg" hidden></p><button class="ct-more" id="ctMore" type="button">Seguir viendo</button></div></div>`;
document.body.appendChild(cart);
const ctB=$("#ctB"),ctBuy=$("#ctBuy"),ctMsg=$("#ctMsg");let ctLast=null;
const ctCols=()=>COLS.get();
const escH=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function cartText(){const cols=ctCols(),parts=[];const t=listText();if(t)parts.push(t);
  if(cols.length)parts.push("Colores: "+cols.map(x=>x.n+" ("+x.h+")").join(", "));return parts.join("; ")}
function renderCart(){
  const cols=ctCols(),c={};const order=[];
  LIST.forEach(it=>{if(it.t==="p"){if(!(it.i in c)){c[it.i]=0;order.push(it.i)}c[it.i]++}});
  const kits=LIST.map((it,k)=>[it,k]).filter(([it])=>it.t==="kit");
  const nProd=LIST.filter(it=>it.t==="p").length+kits.reduce((a,[it])=>a+it.items.length,0);
  const empty=!order.length&&!kits.length&&!cols.length;
  $("#ctN").textContent=nProd;$("#ctSub").textContent=empty?"Todavía no has añadido nada":"Revisa lo que te vas a llevar";
  let h="";
  if(empty)h=`<div class="ct-empty"><b>Tu lista está vacía</b><p>Toca el <strong>+</strong> de un producto, arma tu kit o guarda colores en el simulador.</p><button class="ct-more" type="button" data-go="shop">Ver productos</button></div>`;
  if(order.length||kits.length){h+=`<p class="ct-sec">Productos</p><ul class="ct-ul">`;
    order.forEach(i=>{const p=P[i];h+=`<li class="ct-it"><div class="ct-im" style="--bg:${p.bg}">${sprites[i]?`<img alt="" src="${sprites[i]}">`:""}</div><div class="ct-tx"><div class="ct-n">${escH(p.n)}</div><div class="ct-d">${escH(p.cat)}</div><div class="ct-q" role="group" aria-label="Cantidad de ${escH(p.n)}"><button type="button" data-dec="${i}" aria-label="Quitar uno">−</button><span>${c[i]}</span><button type="button" data-inc="${i}" aria-label="Añadir uno">+</button></div></div><button class="ct-rm" type="button" data-rmp="${i}" aria-label="Quitar ${escH(p.n)} de tu lista">Quitar</button></li>`});
    kits.forEach(([it,k],n)=>{h+=`<li class="ct-it"><div class="ct-im kt">Kit</div><div class="ct-tx"><div class="ct-n">Kit${kits.length>1?" "+(n+1):""} · ${it.items.length} producto${it.items.length>1?"s":""}</div><div class="ct-d">${it.items.map(i=>escH(P[i].n)).join(", ")}</div></div><button class="ct-rm" type="button" data-rmk="${k}" aria-label="Quitar este kit de tu lista">Quitar</button></li>`});
    h+=`</ul>`}
  if(cols.length){h+=`<p class="ct-sec">Colores elegidos</p><ul class="ct-ul">`;
    cols.forEach(x=>{h+=`<li class="ct-it"><div class="ct-im sw" style="--c:${escH(x.h)}"></div><div class="ct-tx"><div class="ct-n">${escH(x.n)}</div><div class="ct-d">${escH(x.h)}</div></div><button class="ct-rm" type="button" data-rmc="${escH(x.h)}" aria-label="Quitar ${escH(x.n)} de tu lista">Quitar</button></li>`});h+=`</ul>`}
  ctB.innerHTML=h;
  ctBuy.disabled=empty;$("#ctNote").hidden=empty||!waNum;
  ctBuy.querySelector("span").textContent=waNum?"Comprar":"Ver cómo llegar";
  if(empty)ctMsg.hidden=true;
}
function openCart(){ctLast=document.activeElement;renderCart();ctMsg.hidden=true;cart.hidden=false;document.documentElement.classList.add("ct-lock");
  requestAnimationFrame(()=>requestAnimationFrame(()=>cart.classList.add("on")));setTimeout(()=>$("#ctX").focus(),60)}
function closeCart(then){if(cart.hidden)return;cart.classList.remove("on");document.documentElement.classList.remove("ct-lock");
  setTimeout(()=>{cart.hidden=true;if(then)then();else if(ctLast&&ctLast.focus)ctLast.focus()},RM?0:380)}
ctB.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.go){closeCart(()=>{if(shop)smoothTo(shop.offsetTop-navH()*.5);else goPage(ROUTES.catalogo)});return}
  if(d.inc!=null)LIST.push({t:"p",i:+d.inc});
  else if(d.dec!=null){const k=LIST.findIndex(it=>it.t==="p"&&it.i===+d.dec);if(k>=0)LIST.splice(k,1)}
  else if(d.rmp!=null){for(let k=LIST.length-1;k>=0;k--)if(LIST[k].t==="p"&&LIST[k].i===+d.rmp)LIST.splice(k,1)}
  else if(d.rmk!=null)LIST.splice(+d.rmk,1);
  else if(d.rmc!=null){COLS.remove(d.rmc);renderCart();return}
  else return;
  updateCount();renderCart();});
$("#ctX").addEventListener("click",()=>closeCart());cart.querySelector(".ct-bg").addEventListener("click",()=>closeCart());
$("#ctMore").addEventListener("click",()=>closeCart());
document.addEventListener("keydown",e=>{if(cart.hidden)return;if(e.key==="Escape"){closeCart();return}
  if(e.key==="Tab"){const f=[...cart.querySelectorAll("button:not([disabled])")].filter(x=>x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
document.addEventListener("montana:colores",()=>{if(!cart.hidden)renderCart()});
ctBuy.addEventListener("click",()=>{const t=cartText();if(!t)return;
  if(waNum){open("https://wa.me/"+waNum+"?text="+encodeURIComponent("Hola, Tiendas Montana. Quiero comprar: "+t+"."),"_blank","noopener");return}
  ctMsg.innerHTML="<b>Lleva tu lista a Tiendas Montana.</b> Muestra esta pantalla en la tienda y te atendemos.";ctMsg.hidden=false;
  setTimeout(()=>closeCart(()=>{if(visit)smoothTo(visit.offsetTop);else goPage(ROUTES.visitanos)}),1200)});
listBtn.addEventListener("click",()=>{setMenu&&setMenu(false);openCart()});
window.MONTANA_CART={open:openCart,close:closeCart,text:cartText};
function bump(){if(!RM)listBtn.animate([{transform:"scale(1)"},{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:320})}
function addToList(item,srcs){
  LIST.push(item);saveList();
  if(RM){updateCount();return}
  const tgt=(tbList&&tbOn())?tbList:listBtn,b=tgt.getBoundingClientRect(),bx=b.left+b.width/2,by=b.top+b.height/2;
  if(!srcs.length){updateCount();bump();return}
  let left=srcs.length;
  srcs.forEach((im,k)=>{
    if(!im){if(--left===0)updateCount();return}
    const r=im.getBoundingClientRect();
    const fly=new Image();fly.src=im.src;fly.alt="";
    Object.assign(fly.style,{position:"fixed",left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",zIndex:90,pointerEvents:"none",filter:"drop-shadow(0 10px 14px rgba(0,0,0,.25))",margin:0});
    document.body.appendChild(fly);
    const dx=bx-(r.left+r.width/2),dy=by-(r.top+r.height/2),sk=Math.min(.2,30/r.height),lift=Math.min(160,.35*Math.abs(dy)+60);
    const a=fly.animate([{transform:"translate(0,0) scale(1) rotate(0deg)",opacity:1},{transform:`translate(${dx*.4}px,${dy*.4-lift}px) scale(${.45+sk}) rotate(-10deg)`,opacity:1,offset:.45},{transform:`translate(${dx}px,${dy}px) scale(${sk}) rotate(-18deg)`,opacity:.15}],{duration:900,delay:k*120,easing:"cubic-bezier(.5,0,.2,1)",fill:"forwards"});
    a.onfinish=()=>{fly.remove();bump();if(tbList&&tbOn()&&!RM)tbList.animate([{transform:"scale(1)"},{transform:"scale(1.15)"},{transform:"scale(1)"}],{duration:320});if(--left===0)updateCount()};
  });
}

/* ---------- Nav ---------- */
const nav=$("#nav"),pill=$("#pill"),links=[...pill.querySelectorAll("a")],hl=pill.querySelector(".hl");
let active=Math.max(0,links.findIndex(l=>l.classList.contains("on")));
function moveHL(){const a=links[active]||links[0];if(!a||!hl)return;const pad=parseFloat(getComputedStyle(a).paddingLeft)||0;hl.style.left=(a.offsetLeft+pad)+"px";hl.style.width=Math.max(0,a.offsetWidth-2*pad)+"px";hl.style.opacity=links[active]&&links[active].classList.contains("on")?"":"0"}
function updateNav(){nav.classList.toggle("scrolled",scrollY>8)}

/* ---------- Detalle visual 2: barra inferior tipo app (solo teléfono) ---------- */
const tabBar=$("#tabBar"),tbList=$("#tbList"),tbN=$("#tbN"),tbWa=$("#tbWa"),simSec=$("#simulador");
function tbOn(){return tabBar&&phone()&&tabBar.classList.contains("show")}
function tbCount(n){if(!tbN)return;tbN.hidden=!n;tbN.textContent=n;if(n&&!RM)tbN.animate([{transform:"scale(0)"},{transform:"scale(1.45)",offset:.5},{transform:"scale(1)"}],{duration:350})}
if(tabBar){
  tbList.addEventListener("click",()=>{setMenu(false);listBtn.click()});
  const waMsg=()=>{
    if(LIST.length)return "Hola, Tiendas Montana. Quiero consultar: "+listText()+".";
    if(PAGE==="productos"||PAGE==="catalogo")return "Hola, Tiendas Montana. Vi el "+P[cur].n+" en la web y quiero hacer una consulta.";
    if(PAGE==="kit")return "Hola, Tiendas Montana. Quiero armar un kit para mi obra.";
    if(PAGE==="pintar")return "Hola, Tiendas Montana. Quiero asesoría para elegir colores.";
    if(visit){const r=visit.getBoundingClientRect();if(r.top<vh*.4&&r.bottom>vh*.4)return "Hola, Tiendas Montana. Quiero visitar la tienda."}
    return "Hola, Tiendas Montana. Vi su página web y quiero hacer una consulta.";
  };
  if(waNum){tbWa.target="_blank";tbWa.rel="noopener";tbWa.href="https://wa.me/"+waNum;
    tbWa.addEventListener("click",()=>{tbWa.href="https://wa.me/"+waNum+"?text="+encodeURIComponent(waMsg())})}
  else tbWa.href=ROUTES.visitanos;
  /* en Inicio aparece al dejar atrás la portada; en las demás páginas está desde el principio.
     Se esconde al bajar con decisión y vuelve al subir */
  let lastY=scrollY,acc=0;
  const tbUpdate=()=>{
    const y=scrollY,d=y-lastY;lastY=y;
    if(!phone()){tabBar.classList.remove("show");return}
    const pastHero=!hero||hero.getBoundingClientRect().bottom<vh*.55;
    acc=(d>0)===(acc>0)?acc+d:d;
    if(!pastHero)tabBar.classList.remove("show");
    else if(acc>140&&y<maxScroll()-40&&y>vh*.5)tabBar.classList.remove("show");
    else if(acc<-24||!tabBar.classList.contains("show")&&acc<=0)tabBar.classList.add("show");
    if(visit){const r=visit.getBoundingClientRect(),on=r.top<vh*.4&&r.bottom>vh*.4;$("#tbVis").classList.toggle("on",on)}
  };
  addEventListener("scroll",tbUpdate,{passive:true});addEventListener("resize",tbUpdate);
  tabBar.addEventListener("focusin",()=>tabBar.classList.add("show"));
  tbUpdate();
}
/* Menú en móvil: el mismo bloque de enlaces se despliega bajo la cabecera */
const menuBtn=$("#menu");
function setMenu(o){pill.classList.toggle("open",o);menuBtn.setAttribute("aria-expanded",String(o));menuBtn.setAttribute("aria-label",o?"Cerrar menú":"Abrir menú")}
menuBtn.addEventListener("click",()=>setMenu(!pill.classList.contains("open")));
addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
document.addEventListener("click",e=>{if(pill.classList.contains("open")&&!e.target.closest("#pill,#menu"))setMenu(false)});
const navH=()=>nav.getBoundingClientRect().height;
matchMedia("(min-width:1100px)").addEventListener("change",e=>{if(e.matches)setMenu(false);moveHL()});
links.forEach(l=>l.addEventListener("click",()=>setMenu(false)));

/* ---------- Desplazamiento suave (ratón de escritorio) ---------- */
let sTarget=null,sCur=0;
const touchDev=matchMedia("(hover: none)").matches;
function maxScroll(){return document.documentElement.scrollHeight-innerHeight}
function smoothTo(y){y=clamp(y,0,maxScroll());if(RM){scrollTo(0,y);return}sCur=scrollY;sTarget=y}
addEventListener("wheel",e=>{
  if(e.ctrlKey||touchDev||RM||document.body.classList.contains("locked"))return;
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  e.preventDefault();
  if(sTarget===null){sCur=scrollY;sTarget=scrollY}
  const d=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
  sTarget=clamp(sTarget+d,0,maxScroll());
},{passive:false});
const handBack=()=>{sTarget=null};
addEventListener("keydown",e=>{if(!["ArrowLeft","ArrowRight"].includes(e.key))handBack()});
addEventListener("pointerdown",handBack);addEventListener("touchstart",handBack,{passive:true});
function stepScroll(dt){if(sTarget===null)return;sCur+= (sTarget-sCur)*(1-Math.exp(-dt/120));if(Math.abs(sTarget-sCur)<.5){sCur=sTarget;scrollTo(0,sCur);sTarget=null;return}scrollTo(0,sCur)}

/* ---------- Aparición de secciones ---------- */
const once=(el,th,fn)=>{const io=new IntersectionObserver(([en])=>{if(en.isIntersecting){fn();io.disconnect()}},{threshold:th});io.observe(el)};
if(shop)once(shop,.18,()=>shop.classList.add("shown"));
if(kit)once(kit,.18,()=>kit.classList.add("shown"));
/* (kit libre: ya no se rellenan 3 productos automáticamente) */

/* ---------- Productos: fichas de los cinco galones ---------- */
const fiList=$("#fiList");
if(fiList){
  const USO={paredes:"Paredes",fachada:"Fachadas",techo:"Techos y terrazas",rejas:"Rejas, puertas y madera"};
  const IDEAL={paredes:[0,1],fachada:[0,3],techo:[2],rejas:[4,3]};
  P.forEach((p,i)=>{
    const uses=Object.keys(IDEAL).filter(k=>IDEAL[k].includes(i)).map(k=>USO[k]);
    const a=document.createElement("article");a.className="fi";a.style.setProperty("--c",p.col);a.style.setProperty("--bg",p.bg);a.style.setProperty("--i",i);
    a.innerHTML=`<div class="fi-im"><img alt="${p.n}" data-spr="${i}" src="${sprites[i]||BLANK}" loading="lazy"></div>
      <div class="fi-tx"><p class="fi-cat">${p.cat}</p><h3 class="fi-n disp">${p.n}</h3><p class="fi-cap">${p.cap.join(" ")}</p>
      <ul class="fi-f">${p.f.map(t=>`<li>${t}</li>`).join("")}<li>Presentación · Galón 3,785 L</li></ul>
      ${uses.length?`<p class="fi-u"><span>Ideal para</span>${uses.map(u=>`<b>${u}</b>`).join("")}</p>`:""}
      <div class="fi-b"><button type="button" class="fi-add"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>Añadir a tu lista</button>
      <button type="button" class="fi-see">Verlo en 3D</button></div></div>`;
    a.querySelector(".fi-add").addEventListener("click",()=>addToList({t:"p",i},[a.querySelector(".fi-im img")]));
    a.querySelector(".fi-see").addEventListener("click",()=>{const k=mod(target,NP);let d=i-k;if(d>2)d-=NP;if(d<-2)d+=NP;goTo(target+d);setAuto(false);smoothTo(0)});
    fiList.appendChild(a);
  });
  if("IntersectionObserver" in window&&!RM){const io=new IntersectionObserver(en=>en.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.12});fiList.querySelectorAll(".fi").forEach(a=>io.observe(a))}
  else fiList.querySelectorAll(".fi").forEach(a=>a.classList.add("in"));
}
if(prPanel){prFill(cur);
  $("#prAdd").addEventListener("click",()=>{const i=cur;addToList({t:"p",i},[]);const b=$("#prAdd");b.classList.add("ok");b.querySelector("span").textContent="Añadido a tu lista";
    setTimeout(()=>{b.classList.remove("ok");b.querySelector("span").textContent="Añadir a mi lista"},1500)});
}

/* ---------- Datos compartidos entre páginas ---------- */
function quietCount(){const n=LIST.length;badge.textContent=n;badge.style.transform=n?"scale(1)":"";if(tbN){tbN.hidden=!n;tbN.textContent=n}
  if($("#listLine"))$("#listLine").textContent=n?(waNum?"Tu lista: ":"Tu lista para mostrar en tienda: ")+listText()+".":""}
quietCount();
/* al volver con «Atrás» (página guardada en memoria) o si se cambia en otra pestaña, se relee todo */
function syncAll(){loadList();quietCount();if(KIT_SYNC)KIT_SYNC();if(window.MONTANA_SIM&&window.MONTANA_SIM.reload)window.MONTANA_SIM.reload();if(!cart.hidden)renderCart();mineDotsAll()}
function mineDotsAll(){try{document.dispatchEvent(new CustomEvent("montana:colores"))}catch(e){}}
addEventListener("pageshow",e=>{if(e.persisted)syncAll()});
addEventListener("storage",e=>{if(!e.key||/^montana(Lista|Kit|Colores)$/.test(e.key))syncAll()});

/* ---------- Bucle principal ---------- */
let entered=false,last=performance.now(),phoneCentered=false;
function frame(now){
  /* mientras la presentación tapa la portada no se dibuja nada: la intro va fluida */
  if(window.MONTANA_INTRO&&!window.MONTANA_INTRO.done()){last=now;requestAnimationFrame(frame);return}
  const dt=Math.min(64,now-last);last=now;
  stepScroll(dt);stepSlide(now);drawReveal(now);stepFlip(now);
  if(entered&&autoOn&&!drag&&!slide&&heroVis>=.6&&!document.hidden&&now-lastInteract>3200){goTo(target+1)}
  if(!HAS_GL){updateNav();requestAnimationFrame(frame);return}
  const hr=hero?hero.getBoundingClientRect():null,sr=inside?inside.getBoundingClientRect():null,shr=shop?shop.getBoundingClientRect():null;
  /* p1: de la portada al paso a paso · p3: hacia la tarjeta del catálogo */
  const p1=sr?clamp(1-sr.top/vh):(shr?1:0),p3=shr?(sr?clamp((vh-shr.top)/(.7*vh)):1):0;
  let p=0,q=0;
  if(sr){
  const span=sr.height-vh;p=clamp(-sr.top/span);
  setStep(Math.floor(Math.min(p,.759)/.19));
  q=clamp((p-.76)/.24);
  /* capa delantera fija que imita al sticky */
  const pinY=sr.top>0?sr.top:(sr.bottom<vh?sr.bottom-vh:0);
  const visS=sr.bottom>0&&sr.top<vh;
  inFront.style.visibility=visS?"visible":"hidden";
  if(visS){inFront.style.transform=`translateY(${pinY}px)`;
    const ff=1-clamp(4*q);frontFrame.style.opacity=ff;inNum.style.opacity=ff;inDark.style.opacity=clamp(3.5*q)*.42;
    const R2=.55*Math.hypot(vw,vh),base=.085*Math.min(vw,vh),ccx=vw/2,ccy=vh/2;
    PCS.forEach(pc=>{const s=clamp((q-.45*pc.ph)/.55);
      if(RM||q<=0||q>=1||s<=0||s>=1){pc.el.style.visibility="hidden";return}
      paintPiece(pc);const rad=(.06+Math.pow(s,1.5)*.95)*R2;
      const x=ccx+Math.cos(pc.a)*rad,y=ccy+Math.sin(pc.a)*rad*.8,sc=(.2+1.7*s)*pc.size*base/100;
      pc.el.style.visibility="visible";pc.el.style.transform=`translate(${x}px,${y}px) rotate(${pc.spin*s}deg) scale(${sc})`;
      pc.el.style.opacity=Math.sin(Math.PI*s)*clamp(5*q)*clamp(6*(1-q))});
  }
  }
  /* galones del arco */
  const jT=Math.round(target),fl=Math.floor(pos),fade=1-clamp(1.6*p1);
  let n=0;
  if(hr)for(let j=fl-5;j<=fl+5;j++){
    if(j===jT)continue;const o=POOL[n++];if(!o)break;
    const st=arcState(j-pos,j,now,hr.top);st.op*=fade;
    o.j=j;o.isHero=true;setFlav(o,mod(j,NP));setGallon(o,st);
  }
  for(;n<POOL.length;n++){POOL[n].group.visible=false;POOL[n].shadow.visible=false}
  /* el viajero */
  const fi=mod(jT,NP);setFlav(TR,fi);TR.j=jT;TR.isHero=!!hr&&p1<.05;
  let S=hr?arcState(jT-pos,jT,now,hr.top):null,B=null;
  if(sr&&p1>0){
    const b=inBar.getBoundingClientRect();
    const bob=RM?0:Math.sin(now/2600*2*Math.PI)*6;
    B={x:b.left+b.width/2,y:b.top+b.height/2+bob,h:b.height,rz:14,ry:flip.a+(RM?0:720*q),rx:0,z:0,op:1,shadow:1};
    S=S?mix(S,B,eio(p1)):B;
  }
  if(shr&&p3>0&&cards.length){
    if(phone()&&!phoneCentered){phoneCentered=true;const c=cards[fi];cardsEl.scrollTo({left:c.offsetLeft-(cardsEl.clientWidth-c.offsetWidth)/2,behavior:RM?"auto":"smooth"})}
    const card=cards[fi],k=card.querySelector(".pk").getBoundingClientRect();
    const C={x:k.left+k.width/2,y:k.top+k.height/2,h:k.height,rz:0,ry:Math.round((B?B.ry:0)/360)*360+card.tx*14,rx:-card.ty*14,z:30,op:1,shadow:.7};
    S=B?mix(B,C,eio(p3)):C;
    const [sx,sy]=pokeScale(fi,now);S.sx=sx;S.sy=sy;
  }
  if(!S)S={x:0,y:0,h:1,rz:0,ry:0,op:0,shadow:0};
  setGallon(TR,S);
  updateNav();
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
function mix(A,B,t){const o={};for(const k of["x","y","h","rz","ry","rx","z","op","shadow"])o[k]=lerp(A[k]??0,B[k]??0,t);o.sx=1;o.sy=1;return o}

/* ---------- Intro y entrada ---------- */
function enter(){
  if(entered)return;entered=true;
  if(hero)hero.classList.add("in");
  [[$("#play"),380],[countEl,460],[autoBtn,540]].filter(([el])=>el).forEach(([el,d])=>RM?el.style.opacity=1:el.animate([{opacity:0,translate:"0 8px"},{opacity:1,translate:"0 0"}],{duration:420,delay:d,easing:"cubic-bezier(.22,1,.36,1)",fill:"forwards"}));
  if(RM){pos=0;target=0}else{pos=-2.4;slide={from:-2.4,to:0,t0:performance.now(),dur:1400,ease:ENTER,fire:false,fired:true}}
  lastInteract=performance.now();startBits();
  if(HAS_GL)setTimeout(()=>{try{makeSprites()}catch(e){}},RM?0:1900);
}
setTitle(0,1,false);if(countEl)countEl.textContent="01";
document.documentElement.style.setProperty("--flav",P[0].bg);
layout();
addEventListener("resize",()=>{layout()});
if(document.fonts)document.fonts.ready.then(()=>{sizeTitle();moveHL()});
/* compila los materiales una vez, antes de que se destape la portada */
try{layout();POOL.concat([TR]).forEach(o=>{o.group.visible=true});renderer.compile(scene,camera)}catch(e){}
requestAnimationFrame(t=>{last=t;frame(t)});
(window.MONTANA_INTRO?window.MONTANA_INTRO.ready(enter):enter());

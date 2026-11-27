/* Calculadora de obra + Mi lista por WhatsApp */
(()=>{
const D=window.CONSTRURAMA||{},$=s=>document.querySelector(s);
const root=$('#calculadora');if(!root)return;
const nf=(v,d=0)=>v.toLocaleString('es-VE',{minimumFractionDigits:d,maximumFractionDigits:d});
const up=(v,step=1)=>Math.max(0,Math.ceil(v/step-1e-9)*step);
const r1=v=>Math.max(v>0?.1:0,Math.round(v*10)/10);
/* ---- definición de cada cálculo ---- */
const T={
 pared:{titulo:'Pared de bloques',
  campos:[{k:'largo',l:'Largo',u:'m',v:5,s:.5},{k:'alto',l:'Alto',u:'m',v:2.6,s:.1},{k:'huecos',l:'Puertas y ventanas',u:'m²',v:0,s:.5},
   {k:'bloque',l:'Bloque',seg:[['10','10 cm'],['15','15 cm'],['20','20 cm']],v:'15'},{k:'friso',l:'Incluir friso (revestimiento)',chk:true,v:false},{k:'caras',l:'Caras con friso',seg:[['1','1 cara'],['2','2 caras']],v:'2',si:'friso'}],
  calc(f){const a=Math.max(0,f.largo*f.alto-f.huecos),pega=a*{10:.010,15:.013,20:.017}[f.bloque],fr=f.friso?a*.018*(+f.caras):0;
   return {area:a,res:[[up(a*12.5*1.05),'','Bloques de '+f.bloque+' cm'],[up(pega*8.5+fr*7),'sacos','Cemento gris 42,5 kg'],[r1((pega*1.1+fr*1.15)*1.05),'m³','Arena lavada']],
    desc:`Pared de bloques de ${f.bloque} cm, ${nf(f.largo,1)} × ${nf(f.alto,1)} m (${nf(a,1)} m²)${f.friso?`, con friso en ${f.caras} cara${f.caras>1?'s':''}`:''}`,
    nota:'12,5 bloques por m² más 5% de desperdicio. Mortero 1:4 para pegar'+(f.friso?' y 1:5 para el friso de 1,5 cm.':'.')}}},
 piso:{titulo:'Piso o placa de concreto',
  campos:[{k:'largo',l:'Largo',u:'m',v:4,s:.5},{k:'ancho',l:'Ancho',u:'m',v:3,s:.5},{k:'esp',l:'Espesor',u:'cm',v:10,s:1}],
  calc(f){const vol=f.largo*f.ancho*f.esp/100,v=vol*1.05;
   return {area:f.largo*f.ancho,res:[[up(v*7),'sacos','Cemento gris 42,5 kg'],[r1(v*.56),'m³','Arena lavada'],[r1(v*.84),'m³','Piedra picada'],[up(v*190,10),'litros','Agua aproximada']],
    desc:`Piso o placa de concreto de ${nf(f.largo,1)} × ${nf(f.ancho,1)} m y ${nf(f.esp)} cm de espesor (${nf(vol,2)} m³)`,
    nota:'Concreto de uso general para pisos y placas, con 5% de desperdicio. Una losa con cabillas necesita un cálculo estructural.'}}},
 pintura:{titulo:'Pintura',
  campos:[{k:'largo',l:'Largo total de paredes',u:'m',v:14,s:1},{k:'alto',l:'Alto',u:'m',v:2.6,s:.1},{k:'huecos',l:'Puertas y ventanas',u:'m²',v:3,s:.5},
   {k:'manos',l:'Manos de pintura',seg:[['1','1'],['2','2'],['3','3']],v:'2'}],
  calc(f){const a=Math.max(0,f.largo*f.alto-f.huecos),gal=up(a*(+f.manos)/35),cu=Math.floor(gal/5),g=gal-cu*5;
   const res=[[gal,'galones','Pintura de caucho']];if(cu)res.push([cu,cu>1?'cuñetes':'cuñete',g?`y ${g} galón${g>1?'es':''} suelto${g>1?'s':''}`:'de 5 galones']);
   return {area:a,res,desc:`Pintura para ${nf(a,1)} m² de pared a ${f.manos} mano${f.manos>1?'s':''}`,nota:'Rendimiento aproximado de 35 m² por galón y por mano. Paredes nuevas o muy porosas pueden necesitar fondo.'}}},
 ceramica:{titulo:'Cerámica',
  campos:[{k:'largo',l:'Largo',u:'m',v:4,s:.5},{k:'ancho',l:'Ancho',u:'m',v:3,s:.5},{k:'caja',l:'m² por caja',u:'m²',v:1.5,s:.1}],
  calc(f){const a=f.largo*f.ancho,m2=a*1.1;
   return {area:a,res:[[up(m2/Math.max(.1,f.caja)),'cajas',`Cerámica (${nf(m2,1)} m² con 10% extra)`],[up(a/4.5),'sacos','Pego para cerámica 20 kg']],
    desc:`Cerámica para ${nf(f.largo,1)} × ${nf(f.ancho,1)} m (${nf(a,1)} m²)`,nota:'10% extra para cortes y piezas rotas. Mira los m² por caja en la caja del modelo que elijas.'}}}
};
/* ---- estado ---- */
let tipo='pared';const val={};for(const t in T){val[t]={};T[t].campos.forEach(c=>val[t][c.k]=c.v)}
const fields=$('#cc-fields'),out=$('#cc-out'),note=$('#cc-note'),fig=$('#cc-fig'),rt=$('#cc-rt');
function render(){const t=T[tipo];fields.innerHTML='';
 t.campos.forEach(c=>{if(c.si&&!val[tipo][c.si])return;const w=document.createElement('div');w.className='cc-f';
  if(c.chk){w.className='cc-chk';w.innerHTML=`<input type="checkbox" ${val[tipo][c.k]?'checked':''}> ${c.l}`;w.querySelector('input').onchange=e=>{val[tipo][c.k]=e.target.checked;render()};w.setAttribute('role','presentation');const lab=document.createElement('label');lab.className='cc-chk';lab.innerHTML=w.innerHTML;lab.querySelector('input').onchange=e=>{val[tipo][c.k]=e.target.checked;render()};fields.appendChild(lab);return}
  if(c.seg){w.innerHTML=`<label>${c.l}</label><div class="cc-seg">${c.seg.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${val[tipo][c.k]===v}">${l}</button>`).join('')}</div>`;
   w.querySelectorAll('button').forEach(b=>b.onclick=()=>{val[tipo][c.k]=b.dataset.v;render()});fields.appendChild(w);return}
  const id='cc-'+tipo+'-'+c.k;w.innerHTML=`<label for="${id}">${c.l}</label><div class="cc-num"><button type="button" aria-label="Menos">−</button><input id="${id}" type="number" inputmode="decimal" min="0" step="${c.s}" value="${val[tipo][c.k]}"><span>${c.u}</span><button type="button" aria-label="Más">+</button></div>`;
  const inp=w.querySelector('input'),[mn,mx]=w.querySelectorAll('button');
  const set=v=>{v=Math.max(0,Math.round(v*100)/100);val[tipo][c.k]=v;inp.value=v;update()};
  mn.onclick=()=>set((+inp.value||0)-c.s);mx.onclick=()=>set((+inp.value||0)+c.s);
  inp.oninput=()=>{const v=parseFloat(String(inp.value).replace(',','.'));val[tipo][c.k]=isFinite(v)&&v>=0?v:0;update()};
  fields.appendChild(w)});
 update()}
let cur=null;
function update(){const t=T[tipo],f=val[tipo];cur=t.calc(f);rt.textContent='Resultado · '+t.titulo;
 out.innerHTML=cur.res.map(([n,u,l])=>`<li><b>${typeof n==='number'?nf(n,n%1?1:0):n}${u?`<small>${u}</small>`:''}</b><span>${l}</span></li>`).join('');
 note.textContent=cur.nota+' Es un cálculo aproximado: confírmalo con nuestro equipo.';
 $('#cc-wa1').href=wa('Hola, vengo de la web de Centro Construrama. Quisiera cotizar:\n• '+linea(cur));drawFig(f)}
const linea=c=>c.desc+': '+c.res.map(([n,u,l])=>`${typeof n==='number'?nf(n,n%1?1:0):n} ${u?u+' de ':''}${l.toLowerCase()}`).join(', ');
const wa=txt=>'https://wa.me/'+(D.whatsapp||'')+'?text='+encodeURIComponent(txt);
/* ---- dibujo con las medidas ---- */
function drawFig(f){const NS='',W=320,H=150;let s='';
 const dim=(x1,y1,x2,y2,t,vert)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a8f9c" stroke-width="1"/><text x="${(x1+x2)/2+(vert?-6:0)}" y="${(y1+y2)/2+(vert?0:10)}" font-family="JetBrains Mono,monospace" font-size="10" fill="#5d6270" text-anchor="${vert?'end':'middle'}" dominant-baseline="middle">${t}</text>`;
 if(tipo==='pared'||tipo==='pintura'){const L=Math.max(.1,f.largo),A=Math.max(.1,f.alto),k=Math.min(240/L,110/A),w=L*k,h=A*k,x=(W-w)/2+14,y=H-28-h;
  if(tipo==='pared'){const bw=.4*k,bh=.2*k;s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#cfd2d8"/>`;
   if(bw>3){for(let r=0;r*bh<h;r++){const off=r%2?bw/2:0;for(let c=-1;c*bw<w;c++){const bx=x+c*bw+off;s+=`<rect x="${Math.max(x,bx)}" y="${y+h-(r+1)*bh}" width="${Math.max(0,Math.min(bx+bw,x+w)-Math.max(x,bx))}" height="${Math.min(bh,h-r*bh)}" fill="none" stroke="#fff" stroke-width="1"/>`}}}}
  else s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ff5500" opacity=".85"/><rect x="${x}" y="${y}" width="${w*.35}" height="${h}" fill="#fff" opacity=".18"/>`;
  if(f.huecos>0){const ha=Math.min(f.huecos,L*A*.8),dh=Math.min(h*.8,2.1*k),dw=Math.min(w*.8,ha*k*k/dh);s+=`<rect x="${x+w*.62-dw/2}" y="${y+h-dh}" width="${dw}" height="${dh}" fill="#f5f6f9" stroke="#111b49" stroke-dasharray="3 2"/>`}
  s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#111b49" stroke-width="1.5"/>`+dim(x,H-18,x+w,H-18,nf(L,1)+' m')+dim(x-8,y,x-8,y+h,nf(A,1)+' m',true)}
 else{const L=Math.max(.1,f.largo),An=Math.max(.1,f.ancho),k=Math.min(200/L,90/An),w=L*k,h=An*k,x=(W-w)/2,y=(H-h)/2-12;
  if(tipo==='piso'){const e=Math.max(4,f.esp*.6);s+=`<rect x="${x}" y="${y+e}" width="${w}" height="${h}" fill="#8f949d"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#cfd2d8" stroke="#111b49" stroke-width="1.5"/>`+dim(x,y+h+e+10,x+w,y+h+e+10,nf(L,1)+' m')+dim(x-8,y,x-8,y+h,nf(An,1)+' m',true)+`<text x="${x+w+8}" y="${y+h+e/2}" font-family="JetBrains Mono,monospace" font-size="10" fill="#5d6270" dominant-baseline="middle">${nf(f.esp)} cm</text>`}
  else{const tz=Math.max(6,.4*k);s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff1e8"/>`;for(let a=tz;a<w;a+=tz)s+=`<line x1="${x+a}" y1="${y}" x2="${x+a}" y2="${y+h}" stroke="#ffb08a" stroke-width="1"/>`;for(let b=tz;b<h;b+=tz)s+=`<line x1="${x}" y1="${y+b}" x2="${x+w}" y2="${y+b}" stroke="#ffb08a" stroke-width="1"/>`;
   s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#111b49" stroke-width="1.5"/>`+dim(x,y+h+12,x+w,y+h+12,nf(L,1)+' m')+dim(x-8,y,x-8,y+h,nf(An,1)+' m',true)}}
 fig.innerHTML=s}
/* ---- pestañas ---- */
root.querySelectorAll('.cc-tabs button').forEach(b=>b.onclick=()=>{tipo=b.dataset.t;root.querySelectorAll('.cc-tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));render()});
/* ---- mi lista (compartida) ---- */
const addB=$('#cc-add'),openB=$('#cc-open');
addB.onclick=()=>{const t=T[tipo];window.Lista.add({titulo:t.titulo,txt:cur.res.map(([n,u,l])=>`${typeof n==='number'?nf(n,n%1?1:0):n} ${u} ${l.toLowerCase()}`.replace(/\s+/g,' ')).join(' · '),full:linea(cur)});
 addB.classList.add('ok');addB.firstChild.textContent='Añadido ✓ ';setTimeout(()=>{addB.classList.remove('ok');addB.firstChild.textContent='Añadir a mi lista'},1400)};
if(openB){openB.onclick=()=>window.Lista.open();window.Lista.on(L=>{openB.hidden=!L.length;openB.querySelector('span').textContent=L.length})}
window.__calcTab=t=>{const b=root.querySelector(`.cc-tabs button[data-t="${t}"]`);if(b)b.click()};
render();
const h0=location.hash.slice(1);if(T[h0])window.__calcTab(h0);
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(T[h])window.__calcTab(h)});
})();

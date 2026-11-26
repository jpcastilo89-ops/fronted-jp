/* ¿Qué necesito para…? Listas de materiales y herramientas por trabajo. */
(()=>{
const root=document.getElementById('que-necesito');if(!root)return;
const I={
 pintar:'<path d="M5 4h12v5H5zM17 6.5h2v5h-8v3"/><path d="M10 14.5h2v6h-2z"/>',
 ceramica:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
 gotera:'<path d="M3 11 12 4l9 7"/><path d="M12 13c-1.6 2.2-2.4 3.6-2.4 4.6a2.4 2.4 0 0 0 4.8 0c0-1-.8-2.4-2.4-4.6Z"/>',
 lavamanos:'<path d="M4 10h16a8 8 0 0 1-16 0ZM12 18v3M12 10V5h4"/>',
 pared:'<path d="M3 6h18v12H3zM3 10h18M3 14h18M9 6v4M15 6v4M6 10v4M12 10v4M18 10v4M9 14v4M15 14v4"/>',
 electrico:'<path d="M7 3h10v18H7z"/><path d="M10 9v2M14 9v2M10 15h4"/>'
};
const J=[
 {id:'pintar',t:'Pintar un cuarto',calc:'pintura',m:[['Pintura de caucho','Calcula los galones abajo'],['Fondo o sellador para paredes','Para paredes nuevas o manchadas'],['Pasta o masilla para paredes','Para tapar grietas y huecos'],['Lija para pared N.º 100 a 150'],['Cinta de enmascarar'],['Plástico protector para pisos y muebles']],
  h:[['Rodillo y bandeja'],['Brocha de 2 a 3 pulgadas','Para bordes y esquinas'],['Extensión para rodillo','Para techos y paredes altas'],['Espátula'],['Guantes']],tip:'Pinta primero los bordes con la brocha y después el centro con el rodillo. Espera el tiempo de secado entre manos.'},
 {id:'ceramica',t:'Poner cerámica',calc:'ceramica',m:[['Cerámica o porcelanato','Calcula las cajas abajo'],['Pego para cerámica'],['Boquilla para juntas'],['Crucetas o separadores']],
  h:[['Llana dentada'],['Cortadora de cerámica'],['Nivel'],['Mazo de goma'],['Cinta métrica'],['Esponja y tobo']],tip:'El piso debe estar limpio, firme y nivelado. Deja secar el pego antes de echar la boquilla.'},
 {id:'gotera',t:'Arreglar una gotera en el techo',m:[['Impermeabilizante para techos'],['Malla o tela de refuerzo','Para grietas y uniones'],['Sellador para grietas'],['Fondo para impermeabilizante','Si el fabricante lo pide']],
  h:[['Cepillo de alambre'],['Escoba'],['Brocha ancha o rodillo'],['Espátula'],['Guantes']],tip:'Hazlo con el techo seco y sin lluvia en el pronóstico. Limpia bien y refuerza primero las grietas.',warn:'Usa calzado antideslizante y no subas solo al techo.'},
 {id:'lavamanos',t:'Instalar un lavamanos',m:[['Lavamanos con pedestal o soporte'],['Grifo o llave'],['Mangueras flexibles de conexión'],['Llave de arresto'],['Sifón o trampa'],['Cinta teflón'],['Silicona sanitaria'],['Tacos y tornillos']],
  h:[['Taladro con broca para concreto'],['Llave ajustable'],['Nivel'],['Destornilladores'],['Cinta métrica']],tip:'Cierra el agua antes de empezar y prueba que no gotee antes de sellar con silicona.'},
 {id:'pared',t:'Levantar una pared de bloques',calc:'pared',m:[['Bloques','Calcula la cantidad abajo'],['Cemento gris'],['Arena lavada'],['Cabillas para columnas'],['Alambre de amarre']],
  h:[['Cuchara de albañil'],['Pala'],['Carretilla'],['Tobo o balde'],['Nivel'],['Plomada e hilo de albañil'],['Cinta métrica']],tip:'Moja los bloques antes de pegarlos y revisa el nivel en cada hilada.',warn:'Para paredes que soportan carga o de más de una planta, consulta a un ingeniero.'},
 {id:'electrico',t:'Cambiar un tomacorriente o interruptor',m:[['Tomacorriente o interruptor'],['Tapa o placa'],['Cable eléctrico','Del mismo calibre que el existente'],['Cinta aislante']],
  h:[['Destornilladores plano y de estría'],['Alicate o pinza'],['Pelacables'],['Probador de voltaje']],tip:'Toma una foto de cómo están conectados los cables antes de desconectarlos.',warn:'Corta la electricidad desde el tablero y comprueba con el probador que no hay corriente.'}
];
const jobs=root.querySelector('#gu-jobs'),panel=root.querySelector('#gu-panel');let cur=J[0],sel={};
jobs.innerHTML=J.map((j,i)=>`<button type="button" role="tab" class="gu-job" data-i="${i}" aria-selected="${i===0}"><svg viewBox="0 0 24 24">${I[j.id]}</svg>${j.t}</button>`).join('');
jobs.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur=J[+b.dataset.i];jobs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x===b));draw()});
const list=(arr,g)=>arr.map(([n,s],k)=>`<li><label><input type="checkbox" data-g="${g}" data-k="${k}" checked><span>${n}${s?`<small>${s}</small>`:''}</span></label></li>`).join('');
function draw(){const j=cur;
 panel.innerHTML=`<div class="gu-col"><h3>Materiales <button type="button" data-all="m">Quitar todo</button></h3><ul>${list(j.m,'m')}</ul></div>
 <div class="gu-col"><h3>Herramientas <button type="button" data-all="h">Quitar todo</button></h3><ul>${list(j.h,'h')}</ul></div>
 <aside class="gu-side"><p class="mono">${j.t}</p><p class="gu-count"><span id="gu-n">0</span><small>cosas marcadas</small></p>
 <p class="gu-tip">${j.tip}</p>${j.warn?`<p class="gu-tip warn">⚠ ${j.warn}</p>`:''}
 <button type="button" class="btn" id="gu-add">Añadir a mi lista<span class="ic"><svg viewBox="0 0 24 24"><path d="M11 5h2v14h-2zM5 11h14v2H5z"/></svg></span></button>
 ${j.calc?`<a class="gu-calc" href="../calculadora/#${j.calc}" data-calc="${j.calc}">Calcular cantidades →</a>`:''}</aside>`;
 const boxes=[...panel.querySelectorAll('input[type=checkbox]')],n=panel.querySelector('#gu-n'),add=panel.querySelector('#gu-add');
 const upd=()=>{const c=boxes.filter(b=>b.checked).length;n.textContent=c;add.disabled=!c;add.firstChild.textContent=c?`Añadir ${c} a mi lista`:'Marca algo para añadir'};
 boxes.forEach(b=>b.onchange=upd);
 panel.querySelectorAll('[data-all]').forEach(b=>b.onclick=()=>{const g=b.dataset.all,gb=boxes.filter(x=>x.dataset.g===g),on=!gb.every(x=>x.checked);gb.forEach(x=>x.checked=on);b.textContent=on?'Quitar todo':'Marcar todo';upd()});
 add.onclick=()=>{const pick=g=>boxes.filter(b=>b.dataset.g===g&&b.checked).map(b=>j[g][+b.dataset.k][0]);const m=pick('m'),h=pick('h');if(!m.length&&!h.length)return;
  const txt=[m.length?'Materiales: '+m.join(', '):'',h.length?'Herramientas: '+h.join(', '):''].filter(Boolean).join(' · ');
  window.Lista.add({titulo:'Para '+j.t.toLowerCase(),txt,full:`Para ${j.t.toLowerCase()}: ${txt.toLowerCase()}`});
  add.classList.add('ok');add.firstChild.textContent='Añadido ✓ ';setTimeout(()=>{add.classList.remove('ok');upd()},1400)};
 const cl=panel.querySelector('[data-calc]');if(cl)cl.onclick=e=>{if(window.__calcTab){window.__calcTab(cl.dataset.calc)}};
 upd()}
draw();
})();

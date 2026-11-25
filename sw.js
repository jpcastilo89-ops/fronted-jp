/* Tiendas Montana: guarda en el teléfono los archivos que no cambian (estilos, código, imágenes, fuente, 3D)
   para que al pasar de una página a otra se abran al instante, sin volver a preguntarle al servidor.
   Las páginas (HTML) siempre se piden nuevas; solo si no hay conexión se muestra la última copia guardada.
   Si cambias un archivo sin «?v=» en su dirección, sube CACHE (montana-2, montana-3...) para que se renueve. */
const CACHE="montana-1";
const GUARDAR=/^\/(assets|vendor)\/|^\/(apple-touch-icon\.png|og-montana\.jpg)$/;
self.addEventListener("install",e=>{self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("montana-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c)).catch(()=>{})}return res})
      .catch(()=>caches.match(r).then(m=>m||Response.error())));return}
  if(!GUARDAR.test(u.pathname))return;
  e.respondWith(caches.open(CACHE).then(k=>k.match(r).then(m=>{
    const red=fetch(r).then(res=>{if(res.ok&&res.status===200)k.put(r,res.clone()).catch(()=>{});return res});
    if(m){
      /* con «?v=» el archivo nunca cambia: no hace falta volver a pedirlo. Sin «?v=», se renueva en segundo plano */
      if(!u.search)e.waitUntil(red.catch(()=>{}));
      return m}
    return red}).catch(()=>fetch(r))));
});

const CACHE="isim-sehir-v4";
const FILES=["./","index.html","isim-sehir-hayvan/","isim-sehir-hayvan/index.html","isim-sehir-hayvan/manifest.webmanifest","icon-192.png","icon-512.png","asmaca/","asmaca/index.html","asmaca/manifest.webmanifest"];
const CDN=["https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js","https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    await c.addAll(FILES);
    await Promise.all(CDN.map(u=>fetch(u,{mode:"no-cors"}).then(r=>c.put(u,r)).catch(()=>{})));
  }).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET"||(u.origin!==location.origin&&!CDN.includes(r.url)))return;
  // önce ağ (güncel sürüm), ağ yoksa önbellek
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})
    .catch(()=>caches.match(r,{ignoreSearch:u.origin===location.origin})));
});

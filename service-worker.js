const CACHE='laloly-pro-v1';
const ASSETS=[
  './','./index.html','./styles.css','./app.js','./manifest.json',
  './data/snippets.json'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r || fetch(e.request).then(res=>{
      const copy=res.clone();
      if(e.request.method==='GET' && res.ok){caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return res;
    }).catch(()=> {
      if(e.request.destination==='document'){
        return new Response('<h1>أوفلاين</h1><p>المحرر يعمل جزئيًا بدون اتصال.</p>',{headers:{'Content-Type':'text/html'}});
      }
    }))
  );
});

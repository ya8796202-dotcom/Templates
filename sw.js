const CACHE = 'tpl-cache-v1';
const ASSETS = [
  '/Templates/',
  '/Templates/index.html',
  '/Templates/style.css',
  '/Templates/effects.css',
  '/Templates/script.js',
  '/Templates/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match('/Templates/index.html')))
  );
});

const CACHE_NAME = 'fluent-editor-v1';
const PRECACHE = [
  '/', '/index.html', '/manifest.json',
  '/styles.css', '/app.js',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  // Network-first for API calls, cache-first for static assets
  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(
      fetch(evt.request).catch(() => caches.match(evt.request))
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(cached => cached || fetch(evt.request).then(res => {
      // cache new GET responses
      if (evt.request.method === 'GET' && res && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(evt.request, copy));
      }
      return res;
    }).catch(() => caches.match('/offline.html')))
  );
});

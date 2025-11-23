const CACHE = 'laloly-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './data/templates.json',
  './data/challenges.json',
  // add basic templates and plugins
  './plugins/pulse-button.css',
  './plugins/gradient-bg.css',
  './plugins/glass-card.css',
  './plugins/loader-bar.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const copy = res.clone();
        if (e.request.method === 'GET' && res.ok && url.origin === location.origin) {
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => {
        // Optional: offline fallback for preview frame
        if (e.request.destination === 'document') {
          return new Response('<h1>أنت أوفلاين</h1><p>بعض الميزات تعمل جزئيًا.</p>', { headers: {'Content-Type':'text/html'} });
        }
      });
    })
  );
});

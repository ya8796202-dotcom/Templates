self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("codestudio-cache").then((cache) => {
      return cache.addAll([
        "index.html",
        "manifest.json",
        "styles.css",
        "app.js",
        "icon-192.png",
        "icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});

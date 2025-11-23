const CACHE_NAME = 'code-editor-pwa-v1';
const urlsToCache = [
    '/Templates/index.html',
    '/Templates/style.css',
    '/Templates/script.js',
    '/Templates/manifest.json',
    '/Templates/icons/icon-192x192.png',
    '/Templates/icons/icon-512x512.png'
    // أضف أي ملفات أخرى موجودة عندك (مثل خطوط أو صور)
];

// 1. تثبيت الـService Worker وتخزين الملفات
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // نستخدم `addAll` لتحميل كل الملفات دفعة واحدة
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. جلب الموارد (Fetch) من الـCache أولاً، ثم الشبكة
self.addEventListener('fetch', event => {
    // محاولة جلب المورد من الذاكرة المؤقتة (Cache)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وجدنا الملف في الـCache، نستخدمه
                if (response) {
                    return response;
                }
                
                // إذا لم نجده، نذهب للشبكة (Network)
                return fetch(event.request);
            }
        )
    );
});

// 3. تفعيل الـService Worker وحذف الـCaches القديمة
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // حذف الـCache التي لا تتطابق مع القائمة البيضاء
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

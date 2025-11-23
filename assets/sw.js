// /Templates/assets/sw.js
const CACHE = 'editor-pro-v1';
const CORE = [
  '/Templates/',
  '/Templates/index.html',
  '/Templates/preview.html',
  '/Templates/assets/style.css',
  '/Templates/assets/editor.js',
  '/Templates/assets/preview.js',
  '/Templates/assets/manifest.json',
  '/Templates/assets/icons/icon-192.png',
  '/Templates/assets/icons/icon-512.png',
  '/Templates/assets/icons/maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>

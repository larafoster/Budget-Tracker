const FILES_TO_CACHE = [
    "/",
    "manifest.json",
    "index.html",
    "index.js",
    "styles.css",
    "db.js",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(FILES_TO_CACHE);
  })());
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const r = await caches.match(event.request);
    console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
    if (r) { return r; }
    const response = await fetch(event.request);
    const cache = await caches.open(CACHE_NAME);
    console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
    cache.put(event.request, response.clone());
    return response;
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keyList) => {
    Promise.all(keyList.map((key) => {
      if (key === CACHE_NAME) { return; }
      caches.delete(key);
    }))
  }));
});

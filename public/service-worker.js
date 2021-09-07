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

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== PRECACHE) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
    )
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
          .catch(() => {
            return caches.open(PRECACHE)
              .then((cache) => {
                return cache.match(event.request)
              })
          })
    )
})

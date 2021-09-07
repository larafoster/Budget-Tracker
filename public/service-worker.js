const FILES_TO_CACHE = [
  '/',
  'manifest.json',
  'index.html',
  'index.js',
  'styles.css',
  'db.js',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
];

const PRECACHE = 'precache-v1';
const RUNTIME_CACHE = 'runtime-cache';

self.addEventListener ('install', event => {
  event.waitUntil (
    caches
      .open (PRECACHE)
      .then (cache => cache.addAll (FILES_TO_CACHE))
      .then (self.skipWaiting ())
  );
});

self.addEventListener ('activate', event => {
  event.waitUntil (
    caches
      .keys ()
      .then (keyList => {
        return Promise.all (
          keyList.map (key => {
            if (key !== PRECACHE) {
              console.log ('[ServiceWorker] Removing old cache', key);
              return caches.delete (key);
            }
          })
        );
      })
      .then (() => self.clients.claim ())
  );
});

// handle runtime_CACHE GET requests for data from /api routes
self.addEventListener ('fetch', event => {
  if (event.request.url.includes ('/api/')) {
    event.respondWith (
      caches
        .open (RUNTIME_CACHE)
        .then (cache => {
          return fetch (event.request)
            .then (response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put (event.request.url, response.clone ());
              }

              return response;
            })
            .catch (err => {
              return cache.match (event.request);
            });
        })
        .catch (err => console.log (err))
    );

    return;
  }

  // request is not in cache. make network request and cache the response
  event.respondWith (
    caches.match (event.request).then (function (response) {
      return response || fetch (event.request);
    })
  );
});

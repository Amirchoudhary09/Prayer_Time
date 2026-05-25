const CACHE_NAME = 'prayer-times-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network-First Strategy
// This ensures that the user always gets the latest code if they have internet,
// and if they are offline, it loads perfectly from the cache!
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // For API calls (like aladhan or ipapi), we don't necessarily want to cache them long-term in the SW,
  // but we can let them fallback to cache if offline.
  
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If successful, update the cache with the new version
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (e.g. user is offline), fallback to the cache
        return caches.match(event.request);
      })
  );
});

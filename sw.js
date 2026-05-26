/* ============================================================
   🔧 sw.js — Service Worker v4
   Strategy:
   • App shell (HTML/CSS/JS) → Cache-First (instant load)
   • Prayer Times API → Network-First + Cache fallback (works offline)
   • Other APIs (geocode, ipapi) → Network-First + Cache fallback
   ============================================================ */

const CACHE_NAME   = 'prayer-times-v4';
const API_CACHE    = 'prayer-api-v4';
const CACHE_VERSION = 4;

// All app shell files that must be cached on install
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon.svg',
  // ES Modules
  './js/main.js',
  './js/state.js',
  './js/constants.js',
  './js/dom.js',
  './js/ui.js',
  './js/api.js',
  './js/location.js',
  './js/events.js',
  './js/settings.js',
  './js/notifications.js',
  './js/calendar.js',
  './js/tasbeeh.js',
  './js/tracker.js',
  './js/duas.js',
];

// API domains to cache with Network-First strategy
const API_DOMAINS = [
  'api.aladhan.com',
  'ipapi.co',
  'nominatim.openstreetmap.org',
];

// ─── INSTALL: Cache all app shell files ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell...');
        // addAll fails if any one file fails — use individual puts for resilience
        return Promise.allSettled(
          APP_SHELL.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] App shell cached ✅');
        self.skipWaiting(); // Activate immediately
      })
  );
});

// ─── ACTIVATE: Clean old caches ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== API_CACHE)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      console.log('[SW] Activated ✅');
      self.clients.claim(); // Take control immediately
    })
  );
});

// ─── FETCH: Smart routing ───
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Skip browser extension requests
  if (url.protocol === 'chrome-extension:') return;

  // ── API calls → Network-First with cache fallback ──
  if (API_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(networkFirstAPI(event.request));
    return;
  }

  // ── App shell → Cache-First (instant, offline-ready) ──
  event.respondWith(cacheFirstShell(event.request));
});

// ─── Cache-First: App shell files ───
async function cacheFirstShell(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return offline page if we have it
    return caches.match('./index.html');
  }
}

// ─── Network-First: API calls ───
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request.clone(), { signal: AbortSignal.timeout(8000) });

    // Cache successful API responses (including CORS/opaque)
    if (response && (response.status === 200 || response.type === 'opaque')) {
      const cache = await caches.open(API_CACHE);
      // Use clone because response body can only be read once
      cache.put(request, response.clone()).catch(() => {}); // Silently fail if storage is full
    }
    return response;

  } catch (err) {
    // Network failed → try cache
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Cache hit (offline) ✅');
      return cached;
    }
    // Nothing in cache either — return a meaningful error response
    return new Response(
      JSON.stringify({ offline: true, error: 'No cached data available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─── Message: Force update from client ───
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_API_CACHE') {
    caches.delete(API_CACHE).then(() => {
      event.source?.postMessage('API_CACHE_CLEARED');
    });
  }
});

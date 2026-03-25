// ═══════════════════════════════════════
// SERVICE WORKER — BTK Portfolio
// Cache-first for assets, Network-first for HTML
// ═══════════════════════════════════════

const CACHE_NAME = 'btk-portfolio-v1';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './index-vi.html',
  './404.html',
  './manifest.json',
  './favicon.svg',
  './assets/cv.pdf',
];

// Install — pre-cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests & external URLs (analytics, fonts CDN, formspree)
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) return;

  // HTML pages → Network-first (always get latest)
  if (event.request.destination === 'document' ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./404.html')))
    );
    return;
  }

  // Assets (images, CSS, JS, fonts, PDF) → Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Background refresh if cache is old
        const fetchPromise = fetch(event.request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response('', { status: 408, statusText: 'Offline' }));
    })
  );
});

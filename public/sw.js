/**
 * RaddiBhaav PWA Service Worker (v1.0.0)
 * 
 * Provides:
 * 1. Offline caching of the application shell and static assets
 * 2. Network-first strategy with cache fallback for page navigation
 * 3. Cache-first strategy for static resources (CSS, JS, fonts, SVGs)
 * 4. Offline fallback page (/offline.html) when completely disconnected
 * 5. Background sync integration for patchy 4G/2G mobile connections
 */

const CACHE_NAME = 'raddibhaav-shell-v1';
const OFFLINE_PAGE = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon.svg',
];

// Install: pre-cache the shell & offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: cleanup older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: smart network-first for HTML pages, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin or non-GET requests for cache matching
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First -> Cache -> Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match(OFFLINE_PAGE);
          return offlineFallback || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // 2. Static Assets (_next/static, images, icons, fonts): Cache-First -> Network
  const isStaticAsset = 
    url.pathname.startsWith('/_next/static') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Background Sync listener for queued offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-raddibhaav-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});

// Message listener from web app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

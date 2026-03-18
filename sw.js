const CACHE_NAME = 'llamaedge-chat-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Files to cache immediately on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './js/webllm.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => {
          return new Request(url, { cache: 'reload' });
        })).catch(err => {
          console.log('[SW] Some assets failed to cache, continuing:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API requests - network first, fall back to cache
  if (url.pathname.includes('/v1/') || url.hostname.includes('akash')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((err) => {
          // Network failed, try cache; fall back to a proper error response so
          // respondWith() never receives undefined (which causes the
          // "Returned response is null" ServiceWorker error).
          console.warn('[SW] API fetch failed, trying cache. Reason:', err && err.message || err);
          return caches.match(event.request).then(
            cached => cached || new Response(
              JSON.stringify({ error: { message: 'Network error - server unreachable and no cached response available' } }),
              { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
            )
          );
        })
    );
    return;
  }
  
  // Static assets - cache first, fall back to network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && event.request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
      })
      .catch(() => {
        // Offline and not in cache - return offline page for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html').then(
            cached => cached || new Response('Offline', { status: 503 })
          );
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
});

console.log('[SW] Service worker loaded');

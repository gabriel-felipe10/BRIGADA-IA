const CACHE_NAME = 'brigada-ia-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/static/icon.svg',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/js/auth.js',
  '/static/js/data.js',
  '/static/js/dashboard.js',
  '/static/js/products.js',
  '/static/js/users.js'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
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

// Fetch Event
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Não cacheia requisições da API ou de logs (dados dinâmicos do banco)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/logs')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna o cache instantaneamente, mas busca a versão mais recente na rede em background (Stale-While-Revalidate)
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});

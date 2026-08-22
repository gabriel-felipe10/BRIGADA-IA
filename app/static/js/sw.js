const CACHE_NAME = 'brigada-ia-v2.5';
const ASSETS = [
  '/',
  '/manifest.json',
  '/static/icon.svg',
  '/static/css/style.css',
  '/static/js/data.js',
  '/static/js/auth.js',
  '/static/js/dashboard.js',
  '/static/js/products.js',
  '/static/js/pereciveis.js',
  '/static/js/users.js',
  '/static/js/notifications.js',
  '/static/js/chambers.js',
  '/static/js/piso_loja.js',
  '/static/js/product_list.js',
  '/static/js/produtos_sem_nota.js',
  '/static/js/quebra.js',
  '/static/js/cracha.js',
  '/static/js/resumo_mensal.js',
  '/static/js/verse_of_the_day.js',
  '/static/js/catalog.js',
  '/static/js/conciliacao.js',
  '/static/js/app.js'
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

// Push Event
self.addEventListener('push', (e) => {
  let data = { title: 'BRIGADA-IA', body: 'Nova notificação recebida.' };
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: 'BRIGADA-IA', body: e.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/static/icon.svg',
    badge: data.badge || '/static/icon.svg',
    data: data.data || { url: '/' },
    vibrate: [100, 50, 100],
    actions: data.actions || []
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  let targetUrl = '/';
  if (e.notification.data && e.notification.data.url) {
    targetUrl = e.notification.data.url;
  }

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procura se já existe uma aba aberta da aplicação
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

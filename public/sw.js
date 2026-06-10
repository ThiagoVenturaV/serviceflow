const CACHE_NAME = 'serviceflow-cache-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/logoServiceFlow.png',
  '/favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Ignora requisições de API (como o Groq, ServiceNow ou rotas serverless do Vercel)
  if (e.request.url.includes('/api/')) {
    return;
  }

  // Estratégia Network-First para navegação (/ ou index.html) e documentos HTML
  if (e.request.mode === 'navigate' || e.request.url.endsWith('/') || e.request.url.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
    return;
  }

  // Cache-First para outros assets (imagens, ícones, etc)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      });
    })
  );
});

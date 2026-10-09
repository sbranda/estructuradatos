// Service worker: cache-first del "app shell" para uso sin conexión.
// Al cambiar cualquier archivo, subí el número de VERSION para renovar la caché.
const VERSION = 'v1';
const CACHE = 'validaciones-' + VERSION;
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(enCache => {
      if (enCache) return enCache;
      return fetch(e.request).then(resp => {
        if (resp && resp.ok && new URL(e.request.url).origin === location.origin) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : undefined);
    })
  );
});

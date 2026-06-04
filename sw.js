const CACHE = 'boardgame-v3';
const URLS = [
  '/boardgame/index.html',
  '/boardgame/manifest.json',
  '/boardgame/css/style.css',
  '/boardgame/js/app.js',
  '/boardgame/icons/icon-192.png',
  '/boardgame/icons/icon-512.png'
];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return c.addAll(URLS);
  }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    }).catch(function() {
      return caches.match('/boardgame/index.html');
    })
  );
});

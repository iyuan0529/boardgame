const CACHE = 'boardgame-v2';
const URLS = [
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
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
      return caches.match('index.html');
    })
  );
});
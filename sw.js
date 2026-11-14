/* Spectrum Search service worker.
   Job: keep the app shell (the page itself, the manifest, the icons) in a
   small cache so an installed copy opens fast and opens offline.
   Search requests are NEVER cached and never touched here: they go to the
   network exactly as the page sends them, and results stay live. */
var CACHE = 'spectrum-search-shell-v1';
var SHELL = [
  './SpectrumSearch.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return key === CACHE ? null : caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  /* Only Spectrum Search's own files are handled here. On a shared site
     (e.g. GitHub Pages) every other page passes through untouched. */
  var isShell = SHELL.some(function (path) {
    return url.pathname.endsWith(path.replace('./', '/'));
  });
  if (isShell) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(function (hit) {
        return hit || fetch(event.request);
      })
    );
  }
  /* Everything else (searches, dictionary lookups) passes straight through. */
});

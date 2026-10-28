/* Service worker: guarda la app en el teléfono para que funcione sin conexión. */
const CACHE = "wordbeat-v4";
const ASSETS = [
  "./", "index.html", "manifest.webmanifest", "css/styles.css",
  "js/words.js", "js/grammar.js", "js/words-work.js", "js/phrases.js", "js/engine.js", "js/snake.js", "js/app.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Archivos propios: primero la caché. Fuentes de Google: se guardan la primera vez que se descargan.
self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  ev.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const url = new URL(req.url);
      if (res.ok && (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});

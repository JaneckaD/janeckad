// Offline režim pro /flashcards. Při každé změně aplikace zvyš číslo verze CACHE (a APP_VERSION v app.js).
// Soubory aplikace se berou vždy čerstvé ze serveru (když je internet), uložená kopie slouží jen bez internetu.
// Díky tomu se nová verze načte sama při dalším otevření a nikdo nemusí nic aktualizovat ručně.
const CACHE = 'fc-v13';
const FILES = ['./', './index.html', './app.js', './app.css', './firebase.js', './manifest.webmanifest', './ikona-180.png', './ikona-192.png', './ikona-512.png', './rethink-sans-latin-wght-normal.woff2', './rethink-sans-latin-ext-wght-normal.woff2'];
const STATIC = /\.(png|woff2)$/; // obrázky a písma se nemění, ty jdou rovnou z uložené kopie

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.searchParams.has('check')) return; // kontrola verze jde vždy na server
  const key = req.mode === 'navigate' ? './index.html' : url.origin + url.pathname;
  if (STATIC.test(url.pathname)) { e.respondWith(caches.match(key).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {}); } return res; }))); return; }
  e.respondWith((async () => {
    try {
      // vždy se zeptá serveru (s ověřením, jestli se soubor změnil); při pomalém nebo žádném internetu použije uloženou kopii
      const res = await Promise.race([fetch(url.origin + url.pathname, { cache: 'no-cache', credentials: 'same-origin' }), timeout(5000)]);
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {}); return res; }
      throw new Error('HTTP ' + res.status);
    } catch (err) {
      const hit = await caches.match(key, { ignoreSearch: true });
      if (hit) return hit;
      return fetch(req);
    }
  })());
});

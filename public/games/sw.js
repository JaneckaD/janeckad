// Offline režim pro /games: při první návštěvě uloží všechno do mezipaměti.
// Při změně her stačí zvýšit číslo verze, ať si telefon stáhne novou verzi.
const CACHE = 'hry-v4';
const FILES = ['./', './index.html', './manifest.webmanifest', './ikona-180.png', './ikona-192.png', './ikona-512.png', './rethink-sans-latin-wght-normal.woff2', './rethink-sans-latin-ext-wght-normal.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// stránka: nejdřív síť (ať je vždy nejnovější), bez internetu z mezipaměti; ostatní soubory rovnou z mezipaměti
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});

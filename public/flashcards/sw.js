// Offline režim pro /flashcards. Při každé změně aplikace zvyš číslo verze,
// telefon si pak sám nabídne „Je tu nová verze → Aktualizovat“.
const CACHE = 'fc-v2';
const FILES = ['./', './index.html', './app.js', './app.css', './firebase.js', './manifest.webmanifest', './ikona-180.png', './ikona-192.png', './ikona-512.png', './rethink-sans-latin-wght-normal.woff2', './rethink-sans-latin-ext-wght-normal.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
// soubory aplikace jdou z mezipaměti (rychlé a funguje to i bez internetu); data řeší Firebase samo
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(caches.match('./index.html').then((hit) => hit || fetch(req))); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});

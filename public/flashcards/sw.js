// Offline režim pro /flashcards. Při každé změně aplikace zvyš VERSION (stejné číslo jako APP_VERSION v app.js a ?v= v index.html).
// Soubory aplikace se berou vždy čerstvé ze serveru (když je internet), uložená kopie slouží jen bez internetu.
// Pozor: davix.cz jde přes CDN od Wedosu, která drží soubory až 30 dní. Proto se ze serveru vždy stahuje
// adresa s ?v=… (verze, nebo u stránky aktuální čas) – takovou CDN uloženou nemá a vezme ji čerstvou z GitHubu.
const VERSION = '2.13';
const CACHE = 'fc-v14';
const APP = ['./app.js', './app.css', './firebase.js', './manifest.webmanifest'];
const STATIC_FILES = ['./ikona-180.png', './ikona-192.png', './ikona-512.png', './rethink-sans-latin-wght-normal.woff2', './rethink-sans-latin-ext-wght-normal.woff2'];
const STATIC = /\.(png|woff2)$/; // obrázky a písma se nemění, ty jdou rovnou z uložené kopie
const PAGE = new URL('./index.html', location.href).href;

// adresa, kterou CDN nemá uloženou: soubory s verzí, stránka s časem
const fresh = (url, page) => { const u = new URL(url); u.search = ''; if (page) { u.pathname = u.pathname.replace(/index\.html$/, ''); u.searchParams.set('t', Date.now()); } else u.searchParams.set('v', VERSION); return u.href; };
const keyOf = (url) => { const u = new URL(url); u.search = ''; return u.href; };

// nová verze čeká, dokud ji aplikace nepustí (zpráva 'skip' při schování aplikace) nebo dokud se všechna okna nezavřou
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.put(PAGE, await fetch(fresh(PAGE, true), { cache: 'no-store' }));
    await Promise.all(APP.map(async (f) => { const u = new URL(f, location.href).href; await c.put(u, await fetch(fresh(u), { cache: 'no-store' })); }));
    await Promise.all(STATIC_FILES.map((f) => c.add(new Request(f, { cache: 'reload' })).catch(() => {})));
  }));
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
  const page = req.mode === 'navigate';
  const key = page ? PAGE : keyOf(req.url);
  if (STATIC.test(url.pathname)) { e.respondWith(caches.match(key).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {}); } return res; }))); return; }
  e.respondWith((async () => {
    try {
      // soubor s ?v= (z index.html) se stáhne přesně tak; jinak se přidá verze, u stránky čas
      const target = page ? fresh(req.url, true) : url.searchParams.has('v') ? req.url : fresh(req.url);
      const res = await Promise.race([fetch(target, { cache: 'no-cache', credentials: 'same-origin' }), timeout(6000)]);
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {}); return res; }
      throw new Error('HTTP ' + res.status);
    } catch (err) {
      const hit = await caches.match(key, { ignoreSearch: true });
      if (hit) return hit;
      return fetch(req);
    }
  })());
});

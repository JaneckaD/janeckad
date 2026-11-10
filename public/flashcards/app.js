// Flashcards: kartičky na učení s účty, statistikami a chytrým opakováním.
// Data jsou ve Firebase (Firestore + přihlašování). Pravidla zabezpečení: firestore.rules ve stejné složce.
// Při každé změně aplikace zvyš CACHE v sw.js, jinak si ji nainstalované telefony nestáhnou.
import {
  initializeApp, deleteApp, getAuth, initializeAuth, inMemoryPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential, connectAuthEmulator,
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator,
  doc, getDoc, getDocFromServer, setDoc, deleteDoc, collection, getDocs, onSnapshot,
} from './firebase.js';

// ===== nastavení =====
const FIREBASE_CONFIG = { // z konzole Firebase (projekt flashcards-663fd); není to tajné, zabezpečení řeší firestore.rules
  apiKey: 'AIzaSyA3zzb5ZmReIpOK5tq6jfiIC_EF-3IId6A', authDomain: 'flashcards-663fd.firebaseapp.com', projectId: 'flashcards-663fd',
  storageBucket: 'flashcards-663fd.firebasestorage.app', messagingSenderId: '804475670634', appId: '1:804475670634:web:6f851aa49f3909c613ba13',
};
const APP_VERSION = '2.4';
const DOMAIN = 'flashcards.davidjanecka.cz'; // uživatelská jména se převádí na e-mail jméno@DOMAIN (e-maily se nikam neposílají)
const OWNER_EMAIL = 'djanecka6@gmail.com'; // hlavní správce, práva mu nejde vzít (stejný e-mail je ve firestore.rules); ostatní správce určuje role v Účtech
const TIME_LIMIT = 60, LIVES = 3, DAY = 864e5;
const EMU = new URLSearchParams(location.search).has('emu') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const CONFIG = EMU ? { apiKey: 'demo-key', authDomain: 'demo-flashcards.firebaseapp.com', projectId: 'demo-flashcards', appId: 'demo' } : FIREBASE_CONFIG;

// první obsah databáze: složky, které david založil ve staré verzi stránky (8. 11. 2026)
const SAMPLE = { folders: [
  { id: 'vyx10tir6k', name: 'Čeština', cards: [], folders: [] },
  { id: 'wduyztf01d', name: 'Angličtina', cards: [], folders: [] },
  { id: 'hdlgmjf7yh', name: 'Informatika', cards: [], folders: [] },
  { id: 'gkp1y2ug1t', name: 'Ekonomika', cards: [], folders: [] },
] };

// ===== texty (stránka je jen česky) =====
const cz = (n, one, few, many) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many);
const T = {
  cs: {
    cards: (n) => `${n} ${cz(n, 'karta', 'karty', 'karet')}`, folders: (n) => `${n} ${cz(n, 'složka', 'složky', 'složek')}`,
    nav: { dash: 'Přehled', learn: 'Učení', stats: 'Statistiky', admin: 'Správa', users: 'Účty', account: 'Můj účet' },
    cat: ['Nezkoušené', 'Neumím', 'Trochu umím', 'Umím'],
    login: 'Přihlášení', loginSub: 'Účet ti založí správce. Registrace není.', user: 'Uživatelské jméno', pass: 'Heslo', signIn: 'Přihlásit',
    badLogin: 'Špatné jméno nebo heslo.', tooMany: 'Moc pokusů. Zkus to za chvíli.', offline: 'Nejsi připojený k internetu.',
    noAccess: 'Tento účet nemá přístup. Požádej správce.', logout: 'Odhlásit', notReady: 'Databáze ještě není připojená.',
    hello: (n) => `Ahoj, <em>${n}</em>`, all: 'Všechny složky', subfolders: 'Podsložky', fold: 'Složky',
    dueLine: (d, n) => d || n ? `K opakování ${d} · nových ${n}` : 'Na dnešek máš hotovo. Můžeš si procvičit cokoli.',
    smart: 'Chytré opakování', smartAll: 'Chytré opakování všeho', other: 'Jiný režim', start: 'Spustit', due: (n) => `${n} k opakování`, done: 'hotovo',
    smartSubs: (n) => `Všechny podsložky naráz (${n})`,
    // přehled
    myStats: 'Moje statistiky', fullStats: 'Celé statistiky', others: 'Ostatní', allUsers: (n) => `Všechny účty (${n})`, noOthers: 'Zatím tu nikdo další není.',
    todayAns: 'Dnes odpovědí', week: 'Posledních 7 dní', todayN: (n) => `dnes ${n} ${cz(n, 'odpověď', 'odpovědi', 'odpovědí')}`,
    pickHint: 'Zaškrtni víc složek a spusť je naráz.', pick: 'Vybrat složku', playFolder: 'Spustit hru',
    picked: (f, c) => `Vybráno ${f} ${cz(f, 'složka', 'složky', 'složek')} · ${c} ${cz(c, 'karta', 'karty', 'karet')}`, clearPick: 'Zrušit výběr', pickName: (n) => `Vybrané složky (${n})`,
    empty: 'Zatím tu nic není.', emptyAll: 'Zatím tu nejsou žádné otázky. Přidá je správce.', notFound: 'Tahle složka už neexistuje.',
    // hra – nastavení
    playTitle: (n) => `Spustit: ${n}`, mode: 'Režim', dir: 'Směr', count: 'Počet karet', allCnt: 'Vše', smartOrder: 'Častěji to, co ti nejde',
    modes: {
      smart: ['Chytré opakování', 'Doporučeno. Algoritmus vybere, co je potřeba zopakovat, a přidá pár nových.'],
      weak: ['Co mi nejde', 'Jen karty v kategorii Neumím a Trochu umím.'],
      classic: ['Kartičky', 'Projdeš všechny karty. Co nevíš, vrátí se.'],
      write: ['Psaní', 'Odpověď napíšeš, malý překlep se odpustí.'],
      quiz: ['Kvíz', 'Vybereš správnou ze 4 možností.'],
      tf: ['Pravda, nebo ne?', 'Sedí odpověď k otázce? Rychlé rozhodování.'],
      match: ['Spojovačka', 'Spoj otázky se správnými odpověďmi.'],
      time: ['Na čas', `Kolik toho stihneš za ${TIME_LIMIT} sekund?`],
      lives: ['3 životy', 'Kvíz, po třech chybách konec.'],
    },
    needTwo: 'Potřeba aspoň 2 různé odpovědi.', noWeak: 'Tady nic takového nemáš, všechno ti jde.',
    dirs: { qa: 'Otázka → odpověď', aq: 'Odpověď → otázka', mix: 'Napřeskáčku' }, go: 'Začít',
    // hra
    front: 'Otázka', back: 'Odpověď', tap: 'Klepni pro otočení', show: 'Ukázat odpověď', g: ['Neumím', 'Trochu', 'Umím'],
    check: 'Zkontrolovat', next: 'Další', typePh: 'Napiš odpověď…', correct: 'Správně!', wrong: 'Špatně. Správně je:', near: 'Skoro, drobný překlep. Správně:', countIt: 'Měl jsem pravdu', dunno: 'Nevím',
    yes: 'Pravda', no: 'Nepravda', tfWrong: 'Správná odpověď je:',
    keysFlip: 'Mezerník otočí · 1 neumím · 2 trochu · 3 umím', keysQuiz: 'Klávesy 1–4', keysWrite: 'Enter zkontroluje · Enter další', keysTf: '← pravda · → nepravda',
    left: (n) => `zbývá ${n}`, of: (a, b) => `${a} z ${b}`, round: (a, b) => `kolo ${a} z ${b}`, quit: 'Ukončit', quitConfirm: 'Opravdu ukončit? Odpovědi, které už máš, zůstanou uložené.',
    res: ['Zkus to znovu', 'Dobrý začátek', 'Pěkná práce', 'Skvělé!', 'Perfektní!'], resLine: (a, b) => `Správně napoprvé ${a} z ${b}`,
    resTime: (n) => `Za ${TIME_LIMIT} s ${n} správně`, best: (n) => `Rekord: ${n}`, newBest: 'Nový rekord!', time: 'Čas',
    nowCats: 'Kde teď tyhle karty jsou', up: (n) => `${n} ${cz(n, 'karta se posunula', 'karty se posunuly', 'karet se posunulo')} výš`,
    missed: 'Tohle ti nešlo', again: 'Znovu', againMissed: 'Procvičit chybné', backTo: 'Zpět',
    // statistiky
    statsTitle: 'Statistiky', statsSub: 'Jak ti to jde a co je potřeba zopakovat.', answers: 'Odpovědí celkem', accuracy: 'Úspěšnost', streak: 'Dní v řadě', dueNow: 'K opakování teď',
    activity: 'Posledních 14 dní', today: 'Dnes', timeToday: (m) => `Dnes ${m} min učení`,
    hard: 'Nejde ti', good: 'Jde ti', rare: 'Zkoušel jsi málokrát', unseen: (n) => `A ${n} ${cz(n, 'kartu', 'karty', 'karet')} jsi ještě nezkoušel.`, byFolder: 'Podle složek',
    nothingYet: 'Zatím žádné odpovědi. Spusť si nějakou složku.', tries: (n) => `${n}×`, catHelp: 'Neumím = spletl ses naposledy. Trochu umím = víš, ale ještě to zapomínáš. Umím = víš to jistě. Když to dlouho neopakuješ, spadne to zpátky.',
    // správa
    adminTitle: 'Správa otázek', adminSub: 'Změny se ukládají samy do databáze a hned je vidí všichni.',
    saving: 'Ukládám…', saved: 'Uloženo', savedOffline: 'Uloží se, až budeš online', saveErr: 'Nepovedlo se uložit',
    newFolder: 'Nová složka', newSub: 'Nová podsložka', rename: 'Přejmenovat', move: 'Přesunout', del: 'Smazat složku', moveTo: 'Přesunout do', top: '(hlavní úroveň)',
    delConfirm: (name, n) => `Smazat složku „${name}“ i se vším uvnitř (karet: ${n})?`, cancel: 'Zrušit', save: 'Uložit', close: 'Zavřít',
    questions: 'Otázky v této složce', q: 'Otázka', a: 'Odpověď', add: 'Přidat', bulk: 'Vložit víc najednou', delCard: 'Smazat kartu',
    bulkHelp: 'Každý řádek je jedna karta: otázka a odpověď oddělené středníkem nebo tabulátorem (třeba zkopírované z Excelu).', bulkPh: 'Francie ; Paříž\nRakousko ; Vídeň',
    bulkDone: (n) => `Přidané karty: ${n}.`, bulkSkip: (n) => `Přeskočené řádky bez středníku: ${n}.`,
    backup: 'Stáhnout zálohu', restore: 'Nahrát zálohu', restoreConfirm: 'Nahradit všechny složky obsahem zálohy?', restoreErr: 'Tohle není platná záloha.', restored: 'Záloha nahraná.',
    // účty
    usersTitle: 'Účty', usersSub: 'Registrace není, účty zakládáš tady.', addUser: 'Přidat účet', name: 'Jméno', created: 'Účet je založený.',
    badUsername: 'Uživatelské jméno: 3–30 znaků, jen malá písmena bez diakritiky, čísla, tečka, pomlčka. Nebo celý e-mail.', makeAdmin: 'Správce (může upravovat otázky a účty)',
    setAdmin: 'Udělat správcem', unsetAdmin: 'Odebrat práva správce', roleSet: 'Hotovo, práva jsou změněná. Projeví se po obnovení stránky.', shortPass: 'Heslo musí mít aspoň 6 znaků.',
    userTaken: 'Tohle uživatelské jméno už bylo použité. Vyber jiné.', noUsers: 'Zatím žádné účty.', lastSeen: (d) => `naposledy ${d}`, never: 'ještě se neučil',
    delUser: 'Smazat účet', delUserConfirm: (n) => `Smazat účet „${n}“ i s jeho statistikami?`, deleted: 'Účet je smazaný.',
    passHelp: 'Heslo si každý může změnit v Můj účet. Když ho někdo zapomene, smaž mu účet a založ nový s jiným jménem.',
    // můj účet
    accTitle: 'Můj účet', lang: 'Jazyk', changePass: 'Změnit heslo', curPass: 'Současné heslo', newPass: 'Nové heslo', passChanged: 'Heslo je změněné.', badCur: 'Současné heslo nesedí.',
    app: 'Aplikace', version: (v) => `Verze ${v}`, update: 'Aktualizovat', upToDate: 'Máš nejnovější verzi.', updating: 'Hledám novou verzi…',
    newVersion: 'Je tu nová verze aplikace.', install: 'Nainstalovat na plochu', installIos: 'Na iPhonu: Sdílet → Přidat na plochu.', role: { admin: 'správce', user: 'uživatel' },
  },
};
const lang = 'cs';
const t = () => T.cs;

// ===== pomocné =====
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
const dayKey = (ms = Date.now()) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fmtDate = (ms) => new Date(ms).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
const P = {
  cards: '<rect x="3" y="7" width="14" height="13" rx="2.5"/><path d="M7 7V5.5A2.5 2.5 0 0 1 9.5 3h9A2.5 2.5 0 0 1 21 5.5v9a2.5 2.5 0 0 1-2.5 2.5H17"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  folder: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  move: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><path d="M10 13.5h6m-2.5-2.5 2.5 2.5-2.5 2.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', chev: '<path d="m9 6 6 6-6 6"/>',
  spark: '<path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9zM19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>', tf: '<path d="m4 12 3.5 3.5L14 9M15 15l5-5M20 15l-5-5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>', heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>', download: '<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14"/>',
  home: '<rect x="3.5" y="3.5" width="7" height="8" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="3.5" y="14.5" width="7" height="6" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4"/>',
};
const I = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const MODE_ICON = { smart: 'spark', weak: 'target', classic: 'cards', write: 'pen', quiz: 'list', tf: 'tf', match: 'link', time: 'clock', lives: 'heart' };
let toastTimer;
function toast(msg, ms = 3200) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), ms); }

// ===== chytré opakování (algoritmus) =====
// Každá karta si pamatuje: e = jak snadno se učí, i = za kolik dní ji zopakovat, d = kdy, s = kolikrát po sobě správně,
// n = kolikrát zkoušená, r / w = správně / špatně, lp = kolikrát zapomenutá, l = naposledy.
// Kategorie: 1 Neumím (naposledy špatně), 2 Trochu umím (interval pod 4 dny nebo dlouho neopakovaná), 3 Umím (interval 4+ dny).
// Nová karta označená hned „Umím“ jde rovnou do Umím; po chybě se musí vypracovat přes Trochu umím (1 → 3 → 7 dní).
function catOf(s, now = Date.now()) {
  if (!s || !s.n) return 0;
  if (!s.s || s.i < 1) return 1;
  if (s.i >= 4 && now - s.d < s.i * DAY) return 3;
  return 2;
}
function applyGrade(prev, q, now = Date.now()) {
  const s = prev ? { ...prev } : { e: 2.3, i: 0, d: 0, s: 0, n: 0, r: 0, w: 0, lp: 0, l: 0 };
  const early = prev && prev.n && now < prev.d, elapsed = prev && prev.l ? (now - prev.l) / DAY : 0;
  s.n++; s.l = now;
  if (q === 0) {
    if (s.i >= 1) s.lp++;
    s.s = 0; s.w++; s.e = Math.max(1.3, +(s.e - 0.2).toFixed(2)); s.i = 0; s.d = now + 10 * 60e3;
  } else {
    s.r++; s.s++;
    if (q === 1) { s.e = Math.max(1.3, +(s.e - 0.15).toFixed(2)); s.i = s.i < 1 ? 1 : early ? s.i : Math.max(s.i + 1, s.i * 1.2); }
    else { s.i = s.i < 1 ? (!prev || !prev.n ? 4 : s.s >= 2 ? 3 : 1) : early ? Math.max(s.i, elapsed * s.e) : Math.max(s.i + 1, s.i * s.e); s.e = Math.min(3, +(s.e + 0.05).toFixed(2)); }
    s.i = Math.min(365, +s.i.toFixed(2)); s.d = now + s.i * DAY;
  }
  return s;
}
const st = (id) => prog.cards[id];
const isDue = (c, now = Date.now()) => { const s = st(c.id); return !!(s && s.n && s.d <= now); };
function prio(c, now) { const s = st(c.id); return (catOf(s, now) === 1 ? 1000 : 0) + (now - s.d) / (Math.max(s.i, 0.1) * DAY); }
function buildSmart(items, N) {
  const now = Date.now();
  const due = items.filter((c) => isDue(c, now)).sort((a, b) => prio(b, now) - prio(a, now));
  const fresh = items.filter((c) => !(st(c.id) && st(c.id).n));
  const newSlots = Math.min(fresh.length, due.length >= N ? Math.round(N * 0.25) : N - due.length);
  let list = [...due.slice(0, N - newSlots), ...fresh.slice(0, newSlots)];
  if (list.length < N) {
    const taken = new Set(list.map((c) => c.id));
    const ahead = items.filter((c) => !taken.has(c.id)).sort((a, b) => (catOf(st(a.id), now) - catOf(st(b.id), now)) || (st(a.id).d - st(b.id).d));
    list = list.concat(ahead.slice(0, N - list.length));
  }
  return shuffle(list);
}
function weight(c, now) { const s = st(c.id), k = catOf(s, now); return k === 1 ? 6 : k === 0 ? 4 : k === 2 ? 3 + (isDue(c, now) ? 3 : 0) : 1 + (isDue(c, now) ? 2 : 0); }
function smartOrder(items) { const now = Date.now(); return items.map((c) => ({ c, k: Math.random() ** (1 / weight(c, now)) })).sort((a, b) => b.k - a.k).map((x) => x.c); }

// ===== stav =====
let app, auth, db, me = null, deck = { folders: [] }, prog = { cards: {}, days: {} };
let unsubs = [], deckLoaded = false, seeded = false;
const pending = { cards: new Set(), days: new Set() }; let flushTimer = null;
let saveState = 'ok', deckTimer = null;
const root = $('#root'), gameEl = $('#game'), dlg = $('#dlg');

function normalizeDeck(d) {
  const fix = (f) => ({ id: f.id || uid(), name: String(f.name || '?'), cards: (f.cards || []).filter((c) => c && (c.q || c.a)).map((c) => ({ id: c.id || uid(), q: String(c.q ?? ''), a: String(c.a ?? '') })), folders: (f.folders || []).map(fix) });
  return { folders: ((d && d.folders) || []).map(fix) };
}
function find(id, list = deck.folders, path = [], parent = null) {
  for (const f of list) {
    if (f.id === id) return { folder: f, list, path: [...path, f], parent };
    const r = find(id, f.folders, [...path, f], f);
    if (r) return r;
  }
  return null;
}
const rootFolder = () => ({ id: '*', name: t().all, cards: [], folders: deck.folders });
function count(f) { return f.cards.length + f.folders.reduce((s, x) => s + count(x), 0); }
function collect(f, path = []) {
  const p = f.id === '*' ? path : [...path, f.name];
  return [...f.cards.map((c) => ({ ...c, path: p.join(' › ') })), ...f.folders.flatMap((x) => collect(x, p))];
}
const allCards = () => collect(rootFolder());
function itemsOf(id) {
  if (id === '*') return { folder: rootFolder(), items: allCards() };
  const h = find(id); if (!h) return null;
  return { folder: h.folder, items: collect(h.folder, h.path.slice(0, -1).map((p) => p.name)) };
}
// víc složek naráz: karty se sloučí, každá jen jednou (i když je vybraná složka i její podsložka)
function itemsOfMany(ids) {
  ids = [...new Set(ids)].filter((id) => id === '*' || find(id));
  if (!ids.length) return null;
  if (ids.length === 1) return itemsOf(ids[0]);
  const seen = new Set(), items = [];
  ids.forEach((id) => itemsOf(id).items.forEach((c) => { if (!seen.has(c.id)) { seen.add(c.id); items.push(c); } }));
  const names = ids.map((id) => (id === '*' ? t().all : find(id).folder.name)), joined = names.join(', ');
  return { folder: { id: [...ids].sort().join('+'), name: joined.length <= 42 ? joined : t().pickName(ids.length), folders: [], cards: [] }, items };
}
// souhrn statistik (pro přehled, statistiky i ostatní účty)
function summary(cardsMap, days, now = Date.now()) {
  const items = allCards(), { k, due } = catCounts(items, cardsMap, now);
  let ans = 0, right = 0, last = 0;
  for (const c of items) { const s = cardsMap[c.id]; if (s && s.n) { ans += s.n; right += s.r; last = Math.max(last, s.l || 0); } }
  let streak = 0; for (let d = 0; d < 400; d++) { const key = dayKey(now - d * DAY); if (days[key] && days[key].a) streak++; else if (d > 0) break; }
  const td = days[dayKey(now)] || {};
  return { k, due, ans, right, acc: ans ? Math.round((right / ans) * 100) : 0, streak, today: td.a || 0, last };
}
function catCounts(items, cards = prog.cards, now = Date.now()) {
  const k = [0, 0, 0, 0]; let due = 0;
  for (const c of items) { const s = cards[c.id]; k[catOf(s, now)]++; if (s && s.n && s.d <= now) due++; }
  return { k, due, total: items.length };
}
function kbar(k, big) {
  const tot = k[0] + k[1] + k[2] + k[3] || 1;
  return `<div class="kbar ${big ? 'big' : ''}" role="img" aria-label="${t().cat.map((n, i) => `${n} ${k[i]}`).join(', ')}">${[3, 2, 1].map((i) => k[i] ? `<i class="k${i}" style="width:${(k[i] / tot) * 100}%"></i>` : '').join('')}</div>`;
}
const legend = (k) => `<div class="legend">${[3, 2, 1, 0].map((i) => `<span style="--c:var(--k${i})">${t().cat[i]} <b>${k[i]}</b></span>`).join('')}</div>`;

// ===== Firebase =====
function initFirebase() {
  app = initializeApp(CONFIG);
  auth = getAuth(app);
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  if (EMU) { connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true }); connectFirestoreEmulator(db, '127.0.0.1', 8080); }
}
const toEmail = (u) => (u.includes('@') ? u.trim().toLowerCase() : u.trim().toLowerCase() + '@' + DOMAIN);
const deckRef = () => doc(db, 'decks', 'main');
const progRef = (u = me.uid) => doc(db, 'progress', u);

async function enter(user) {
  let profile = null;
  try { const s = await getDoc(doc(db, 'users', user.uid)); profile = s.exists() ? s.data() : null; lsSet('fc-me-' + user.uid, profile); }
  catch (e) { profile = lsGet('fc-me-' + user.uid, null); }
  // správce je hlavní účet admin a každý, komu správce dal roli „správce“
  const isAdmin = user.email === OWNER_EMAIL || (profile && profile.role === 'admin');
  // hlavní správce si při prvním přihlášení založí svůj záznam v Účtech (ať je vidět v seznamu)
  if (user.email === OWNER_EMAIL && !profile) {
    profile = { name: user.email === 'djanecka6@gmail.com' ? 'David' : user.email.split('@')[0], username: user.email, role: 'admin', created: new Date().toISOString() };
    setDoc(doc(db, 'users', user.uid), profile).catch((e) => console.warn(e));
  }
  if (!profile && !isAdmin) { renderMessage(t().noAccess, true); return; }
  me = { uid: user.uid, email: user.email, isAdmin, name: (profile && profile.name) || (isAdmin ? 'Admin' : user.email.split('@')[0]), username: (profile && profile.username) || user.email.split('@')[0] };
  renderShell();
  unsubs.push(onSnapshot(deckRef(), (snap) => {
    if (deckTimer) return; // správce právě píše, jeho verze je novější
    deck = normalizeDeck(snap.data());
    deckLoaded = true;
    if (!snap.exists() && me.isAdmin && !snap.metadata.fromCache && !seeded) { seeded = true; deck = normalizeDeck(clone(SAMPLE)); saveDeckNow(); }
    softRender();
  }, (e) => { console.warn(e); deckLoaded = true; softRender(); }));
  unsubs.push(onSnapshot(progRef(), (snap) => {
    const d = snap.data() || {};
    const cards = d.cards || {}, days = d.days || {};
    pending.cards.forEach((id) => { cards[id] = prog.cards[id]; });
    pending.days.forEach((k) => { days[k] = prog.days[k]; });
    prog = { cards, days };
    softRender();
  }, (e) => console.warn(e)));
}
function leave() { unsubs.forEach((u) => u()); unsubs = []; me = null; deck = { folders: [] }; prog = { cards: {}, days: {} }; deckLoaded = false; closeGame(); }

// zápis výsledků (posílá se jen to, co se změnilo; bez internetu se to pošle později samo)
function record(item, q) {
  const now = Date.now(), prev = prog.cards[item.id];
  const next = applyGrade(prev, q, now);
  prog.cards[item.id] = next;
  const k = dayKey(now), day = prog.days[k] ? { ...prog.days[k] } : { a: 0, r: 0, t: 0 };
  day.a++; if (q > 0) day.r++;
  if (G && G.lastAt) day.t += Math.min(60, Math.round((now - G.lastAt) / 1000));
  if (G) G.lastAt = now;
  prog.days[k] = day;
  pending.cards.add(item.id); pending.days.add(k);
  clearTimeout(flushTimer); flushTimer = setTimeout(flush, 2000);
  return prev;
}
function restoreCard(id, prev) { if (prev) prog.cards[id] = prev; else delete prog.cards[id]; pending.cards.add(id); }
function flush() {
  clearTimeout(flushTimer); flushTimer = null;
  if (!me || (!pending.cards.size && !pending.days.size)) return;
  const cards = {}, days = {};
  pending.cards.forEach((id) => { if (prog.cards[id]) cards[id] = prog.cards[id]; });
  pending.days.forEach((k) => { days[k] = prog.days[k]; });
  pending.cards.clear(); pending.days.clear();
  setDoc(progRef(), { cards, days, updated: Date.now() }, { merge: true }).catch((e) => { console.warn(e); toast(t().saveErr); });
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
window.addEventListener('pagehide', flush);

// ukládání otázek (správce)
function changed() {
  saveState = 'busy'; updateSaveChip();
  clearTimeout(deckTimer); deckTimer = setTimeout(saveDeckNow, 900);
}
function saveDeckNow() {
  clearTimeout(deckTimer); deckTimer = null;
  saveState = navigator.onLine ? 'busy' : 'off'; updateSaveChip();
  setDoc(deckRef(), { folders: deck.folders, updated: new Date().toISOString(), by: me.uid })
    .then(() => { saveState = 'ok'; updateSaveChip(); })
    .catch((e) => { console.warn(e); saveState = 'err'; updateSaveChip(); toast(t().saveErr + ': ' + (e.code || e.message)); });
}
function updateSaveChip() {
  const el = $('#savechip'); if (!el) return;
  el.className = 'savechip ' + (saveState === 'ok' ? '' : saveState === 'busy' ? 'busy' : 'off');
  el.textContent = saveState === 'ok' ? t().saved : saveState === 'busy' ? t().saving : saveState === 'off' ? t().savedOffline : t().saveErr;
}
window.addEventListener('online', () => { if (saveState === 'off') { saveState = 'busy'; updateSaveChip(); } });

// ===== navigace =====
const TABS = ['dash', 'learn', 'stats', 'admin', 'users', 'account'];
function route() {
  const [tab, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  const r = { tab: TABS.includes(tab) ? tab : 'dash', arg: rest.length ? decodeURIComponent(rest.join('/')) : null };
  if (!me || (!me.isAdmin && (r.tab === 'admin' || r.tab === 'users'))) r.tab = 'dash';
  if (r.tab === 'learn' && !r.arg) r.tab = 'dash';
  return r;
}
const go = (h) => { location.hash = h; };
window.addEventListener('hashchange', () => { if (me) { render(); window.scrollTo(0, 0); } });

// ===== vykreslení =====
function renderMessage(msg, withLogout) {
  root.innerHTML = `<div class="boot"><div><p style="max-width:340px">${esc(msg)}</p>${withLogout ? `<p style="margin-top:16px"><button class="btn" data-act="logout">${t().logout}</button></p>` : ''}</div></div>`;
}
function renderLogin(err = '') {
  document.documentElement.lang = lang;
  root.innerHTML = `<div class="login"><form class="login-box" id="loginf">
    <div class="brand big">flashcards<i>.</i></div>
    <div><h1>${t().login}</h1><p style="margin-top:6px">${t().loginSub}</p></div>
    <div><label class="lbl" for="lu">${t().user}</label><input class="field" id="lu" name="u" autocomplete="username" autocapitalize="none" spellcheck="false" required /></div>
    <div><label class="lbl" for="lp">${t().pass}</label><input class="field" id="lp" name="p" type="password" autocomplete="current-password" required /></div>
    <p class="err" id="lerr" ${err ? '' : 'hidden'}>${esc(err)}</p>
    <button class="btn primary big block" id="lbtn">${t().signIn}</button>
  </form></div>`;
  $('#lu').focus();
}

function renderShell() {
  root.innerHTML = `<nav class="nav" id="nav"></nav><main class="main"><div class="wrap"><div class="brand top-m">flashcards<i>.</i></div><div id="view"></div></div></main><div class="pickbar" id="pickbar" hidden></div>`;
  render();
}
function renderNav(tab) {
  const due = catCounts(allCards()).due;
  if (tab === 'learn') tab = 'dash';
  const items = [['dash', 'home'], ['stats', 'chart'], ...(me.isAdmin ? [['admin', 'edit'], ['users', 'users']] : []), ['account', 'user']];
  $('#nav').innerHTML = `<a class="brand" href="#/dash">flashcards<i>.</i></a>` + items.map(([k, ic]) => `<a href="#/${k}" class="${tab === k ? 'on' : ''}" ${tab === k ? 'aria-current="page"' : ''}>${I(ic)}<span>${t().nav[k]}</span>${k === 'dash' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</a>`).join('');
}
function render() {
  if (!me) return;
  document.documentElement.lang = lang;
  const r = route();
  renderNav(r.tab);
  const v = $('#view');
  if (!deckLoaded && r.tab !== 'account') { v.innerHTML = `<div class="boot" style="min-height:50vh"><div class="spin"></div></div>`; return; }
  v.innerHTML = r.tab === 'dash' ? viewDash() : r.tab === 'learn' ? viewLearn(r.arg) : r.tab === 'stats' ? viewStats() : r.tab === 'admin' ? viewAdmin(r.arg) : r.tab === 'users' ? (r.arg ? viewUser(r.arg) : viewUsers()) : viewAccount();
  v.querySelectorAll('textarea.field').forEach(autosize);
  if (r.tab === 'users') loadUsers(r.arg);
  if (r.tab === 'dash' && me.isAdmin) loadUsers();
  updatePickBar();
  updateSaveChip();
}
// překreslí jen když to nevadí (nehraje se a nikdo nepíše do pole)
function softRender() {
  if (!me || G) return;
  const a = document.activeElement;
  if (a && a.closest && a.closest('#view') && a.matches('input, textarea, select')) { renderNav(route().tab); return; }
  if (dlg.open) { renderNav(route().tab); return; }
  render();
}
function autosize(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; }
function crumbs(path, base) {
  return `<nav class="crumbs"><a href="#/${base === 'learn' ? 'dash' : base}">${t().all}</a>${path.slice(0, -1).map((p) => `<span>›</span><a href="#/${base}/${encodeURIComponent(p.id)}">${esc(p.name)}</a>`).join('')}</nav>`;
}
function folderTile(f, base) {
  const items = collect(f), c = catCounts(items);
  if (base === 'learn' && items.length) {
    const badge = c.due ? `<span class="due">${t().due(c.due)}</span>` : c.k[0] === 0 ? `<span class="due ok">${t().done}</span>` : '';
    const on = picked.has(f.id);
    return `<div class="tile play ${on ? 'picked' : ''}" data-tile="${esc(f.id)}"><a class="tile-link" href="#/learn/${encodeURIComponent(f.id)}" aria-label="${esc(f.name)}"></a>
      <div class="top"><span class="ico">${I('folder')}</span>${badge}<label class="pick" title="${t().pick}"><input type="checkbox" data-pick="${esc(f.id)}" ${on ? 'checked' : ''} aria-label="${t().pick}: ${esc(f.name)}" /><span>${I('check')}</span></label></div>
      <div><b>${esc(f.name)}</b><small>${t().cards(items.length)}${f.folders.length ? ' · ' + t().folders(f.folders.length) : ''}</small></div>
      <div class="bot">${kbar(c.k)}<button class="playbtn" data-play="${esc(f.id)}" title="${t().playFolder}" aria-label="${t().playFolder}: ${esc(f.name)}">${I('play')}</button></div></div>`;
  }
  const badge = base === 'learn' && items.length ? (c.due ? `<span class="due">${t().due(c.due)}</span>` : c.k[0] === 0 ? `<span class="due ok">${t().done}</span>` : '') : '';
  return `<a class="tile" href="#/${base}/${encodeURIComponent(f.id)}"><div class="top"><span class="ico">${I('folder')}</span>${badge}</div>
    <div><b>${esc(f.name)}</b><small>${t().cards(items.length)}${f.folders.length ? ' · ' + t().folders(f.folders.length) : ''}</small></div>${base === 'learn' && items.length ? kbar(c.k) : ''}</a>`;
}

// --- učení ---
function viewLearn(id) {
  const h = id ? find(id) : null;
  if (id && !h) return `${crumbs([], 'learn')}<div class="empty">${t().notFound}</div>`;
  const f = h ? h.folder : rootFolder();
  const items = collect(f, h ? h.path.slice(0, -1).map((p) => p.name) : []), c = catCounts(items);
  let out = h ? crumbs(h.path, 'learn') + `<h1>${esc(f.name)}</h1>` : `<h1>${t().hello(esc(me.name))}</h1>`;
  out += `<p class="sub">${items.length ? t().dueLine(c.due, c.k[0]) : ''}</p>`;
  if (items.length) {
    out += `<div class="hero-card"><div style="flex:1;min-width:220px"><b>${h ? (f.cards.length || !f.folders.length ? t().smart : t().smartSubs(f.folders.length)) : t().smartAll}</b><small>${t().cards(items.length)}${f.folders.length ? ' · ' + t().folders(f.folders.length) : ''}</small><div style="margin-top:14px">${kbar(c.k, true)}</div>${legend(c.k)}</div>
      <div class="acts"><button class="btn primary big" data-play="${esc(f.id)}" data-mode="smart">${I('spark')}${t().start}</button><button class="btn" data-play="${esc(f.id)}">${t().other}</button></div></div>`;
  }
  if (f.folders.length) out += foldersGrid(f.folders, h ? t().subfolders : t().fold);
  if (!items.length) out += `<div class="empty" style="margin-top:22px">${h ? t().empty : t().emptyAll}</div>`;
  return out;
}
function foldersGrid(list, title) {
  const many = list.filter((x) => count(x)).length > 1;
  return `<h2>${title}</h2>${many ? `<p class="small muted hint">${t().pickHint}</p>` : ''}<div class="grid">${list.map((x) => folderTile(x, 'learn')).join('')}</div>`;
}

// --- výběr víc složek ---
const picked = new Set();
function updatePickBar() {
  const bar = $('#pickbar'); if (!bar) return;
  [...picked].forEach((id) => { if (!find(id)) picked.delete(id); });
  if (!picked.size || route().tab === 'stats' || route().tab === 'admin' || route().tab === 'users' || route().tab === 'account') { bar.hidden = true; document.body.classList.remove('picking'); return; }
  const got = itemsOfMany([...picked]), n = got ? got.items.length : 0;
  bar.hidden = false; document.body.classList.add('picking');
  bar.innerHTML = `<span>${t().picked(picked.size, n)}</span><button class="btn sm ghost" data-act="clearPick">${t().clearPick}</button><button class="btn sm primary" data-play="${esc([...picked].join(','))}" ${n ? '' : 'disabled'}>${I('play')}${t().start}</button>`;
}

// --- přehled (hlavní stránka) ---
function viewDash() {
  const items = allCards(), c = catCounts(items), sm = summary(prog.cards, prog.days), now = Date.now();
  let out = `<h1>${t().hello(esc(me.name))}</h1><p class="sub">${items.length ? t().dueLine(c.due, c.k[0]) : ''}</p>`;
  if (items.length) {
    out += `<div class="hero-card"><div style="flex:1;min-width:220px"><b>${t().smartAll}</b><small>${t().cards(items.length)} · ${t().folders(deck.folders.length)}</small><div style="margin-top:14px">${kbar(c.k, true)}</div>${legend(c.k)}</div>
      <div class="acts"><button class="btn primary big" data-play="*" data-mode="smart">${I('spark')}${t().start}</button><button class="btn" data-play="*">${t().other}</button></div></div>`;
  }
  // moje statistiky ve zkratce
  const cols = []; let max = 1;
  for (let d = 6; d >= 0; d--) { const key = dayKey(now - d * DAY), a = (prog.days[key] && prog.days[key].a) || 0; max = Math.max(max, a); cols.push({ d, a }); }
  const mine = `<section class="box mini"><div class="mhead"><b>${t().myStats}</b><a href="#/stats">${t().fullStats}${I('chev')}</a></div>
    <div class="minik">${[3, 2, 1, 0].map((i) => `<div style="--c:var(--k${i})"><b>${sm.k[i]}</b><span>${t().cat[i]}</span></div>`).join('')}</div>
    ${kbar(sm.k)}
    <div class="minif"><div><b>${sm.acc} %</b><span>${t().accuracy}</span></div><div><b>${sm.streak}</b><span>${t().streak}</span></div><div><b>${sm.today}</b><span>${t().todayAns}</span></div></div>
    <div class="chart mini" title="${t().week}">${cols.map((x) => `<div class="col"><span class="v">${x.a || ''}</span><div class="bar ${x.a ? '' : 'zero'} ${x.d === 0 ? 'today' : ''}" style="height:${x.a ? Math.max(6, (x.a / max) * 100) : 4}%"></div><small>${x.d === 0 ? t().today : new Date(now - x.d * DAY).getDate() + '.'}</small></div>`).join('')}</div></section>`;
  const others = me.isAdmin ? `<section class="box mini"><div class="mhead"><b>${t().others}</b><a href="#/users">${t().nav.users}${I('chev')}</a></div><div id="dashusers">${usersCache ? othersList() : '<div class="spin"></div>'}</div></section>` : '';
  out += `<div class="dash ${others ? '' : 'solo'}">${mine}${others}</div>`;
  if (deck.folders.length) out += foldersGrid(deck.folders, t().fold);
  if (!items.length) out += `<div class="empty" style="margin-top:22px">${t().emptyAll}</div>`;
  return out;
}
function othersList() {
  const list = usersCache.filter((u) => u.uid !== me.uid).map((u) => ({ u, s: summary(u.cards || {}, u.days || {}) })).sort((a, b) => b.s.last - a.s.last);
  if (!list.length) return `<p class="muted small" style="padding:6px 0">${t().noOthers}</p>`;
  return `<div class="olist">${list.slice(0, 6).map(({ u, s }) => `<a class="orow" href="#/users/${encodeURIComponent(u.uid)}"><span class="av">${esc((u.name || '?')[0])}</span><span class="nm"><b>${esc(u.name)}</b><small>${s.today ? t().todayN(s.today) : s.last ? t().lastSeen(fmtDate(s.last)) : t().never}</small></span><span class="kb">${kbar(s.k)}</span><span class="pc">${s.ans ? s.acc + ' %' : '–'}</span></a>`).join('')}</div>
    ${list.length > 6 ? `<a class="more" href="#/users">${t().allUsers(list.length)}</a>` : ''}`;
}

// --- statistiky ---
function statsBody(cardsMap, linkFolders) {
  const now = Date.now(), items = allCards();
  const ent = items.map((c) => ({ c, s: cardsMap[c.id], k: catOf(cardsMap[c.id], now) }));
  const { k, due } = catCounts(items, cardsMap, now);
  const seen = ent.filter((e) => e.s && e.s.n);
  const ans = seen.reduce((a, e) => a + e.s.n, 0), right = seen.reduce((a, e) => a + e.s.r, 0);
  const days = (cardsMap === prog.cards ? prog.days : (statsBody.days || {}));
  let streak = 0; for (let d = 0; d < 400; d++) { const key = dayKey(now - d * DAY); if (days[key] && days[key].a) streak++; else if (d > 0) break; }
  let out = `<div class="kpis">${[3, 2, 1, 0].map((i) => `<div class="kpi" style="--c:var(--k${i})"><b>${k[i]}</b><span>${t().cat[i]}</span></div>`).join('')}</div>
    <div style="margin-top:12px">${kbar(k, true)}</div><p class="small muted" style="margin-top:8px">${t().catHelp}</p>
    <div class="facts"><div class="fact"><b>${ans}</b><span>${t().answers}</span></div><div class="fact"><b>${ans ? Math.round((right / ans) * 100) : 0} %</b><span>${t().accuracy}</span></div><div class="fact"><b>${streak}</b><span>${t().streak}</span></div><div class="fact"><b>${due}</b><span>${t().dueNow}</span></div></div>`;
  // aktivita
  const cols = []; let max = 1;
  for (let d = 13; d >= 0; d--) { const key = dayKey(now - d * DAY), a = (days[key] && days[key].a) || 0; max = Math.max(max, a); cols.push({ d, key, a }); }
  const todayMin = Math.round(((days[dayKey(now)] && days[dayKey(now)].t) || 0) / 60);
  out += `<h2>${t().activity}<span class="small muted" style="text-transform:none;letter-spacing:0;font-weight:500">${t().timeToday(todayMin)}</span></h2><div class="box"><div class="chart">${cols.map((c) => {
    const dt = new Date(now - c.d * DAY);
    return `<div class="col" title="${fmtDate(now - c.d * DAY)}: ${c.a}"><span class="v">${c.a || ''}</span><div class="bar ${c.a ? '' : 'zero'} ${c.d === 0 ? 'today' : ''}" style="height:${c.a ? Math.max(4, (c.a / max) * 100) : 3}%"></div><small>${c.d === 0 ? t().today : dt.getDate() + '.'}</small></div>`;
  }).join('')}</div></div>`;
  if (!seen.length) return out + `<div class="empty" style="margin-top:22px">${t().nothingYet}</div>`;
  const li = (e, num) => `<div class="li"><span class="qa">${esc(e.c.q)} → <em>${esc(e.c.a)}</em></span><span class="num">${num}</span><small>${esc(e.c.path)}</small></div>`;
  const hard = seen.filter((e) => e.s.w > 0).sort((a, b) => (b.s.w + 1) / (b.s.n + 2) - (a.s.w + 1) / (a.s.n + 2) || a.k - b.k).slice(0, 8);
  const hardIds = new Set(hard.map((e) => e.c.id));
  const good = seen.filter((e) => e.k >= 2 && !hardIds.has(e.c.id) && e.s.r / e.s.n >= 0.7).sort((a, b) => b.k - a.k || b.s.i - a.s.i || b.s.r - a.s.r).slice(0, 8);
  const rare = seen.filter((e) => e.s.n <= 2).sort((a, b) => a.s.n - b.s.n || a.s.l - b.s.l).slice(0, 8);
  const pct = (e) => `${Math.round((e.s.r / e.s.n) * 100)} %`;
  out += `<div class="two"><div><h2>${t().hard}</h2><div class="list">${hard.map((e) => li(e, `${pct(e)} · ${t().tries(e.s.n)}`)).join('') || `<p class="muted small">–</p>`}</div></div>
    <div><h2>${t().good}</h2><div class="list">${good.map((e) => li(e, pct(e))).join('') || `<p class="muted small">–</p>`}</div></div></div>
    <h2>${t().rare}</h2><div class="list">${rare.map((e) => li(e, t().tries(e.s.n))).join('')}</div>${k[0] ? `<p class="small muted" style="margin-top:8px">${t().unseen(k[0])}</p>` : ''}`;
  // podle složek (dvě úrovně)
  const rows = [];
  const walk = (list, depth, path) => list.forEach((f) => {
    const it = collect(f, path), cc = catCounts(it, cardsMap, now);
    const sn = it.map((c) => cardsMap[c.id]).filter((s) => s && s.n), a = sn.reduce((x, s) => x + s.n, 0), r = sn.reduce((x, s) => x + s.r, 0);
    if (it.length) rows.push(`<${linkFolders ? `a href="#/learn/${encodeURIComponent(f.id)}"` : 'div'} class="frow"><span class="nm" style="padding-left:${depth * 18}px">${depth ? '› ' : ''}${esc(f.name)}</span>${kbar(cc.k)}<span class="pc">${a ? Math.round((r / a) * 100) + ' %' : '–'}</span></${linkFolders ? 'a' : 'div'}>`);
    if (depth < 1) walk(f.folders, depth + 1, [...path, f.name]);
  });
  walk(deck.folders, 0, []);
  out += `<h2>${t().byFolder}</h2><div class="box" style="padding:6px 18px">${rows.join('')}</div>`;
  return out;
}
function viewStats() {
  statsBody.days = prog.days;
  return `<p class="eyebrow">${esc(me.name)}</p><h1>${t().statsTitle}</h1><p class="sub">${t().statsSub}</p><div style="margin-top:22px">${statsBody(prog.cards, true)}</div>`;
}

// --- správa otázek ---
function viewAdmin(id) {
  const h = id ? find(id) : null;
  if (id && !h) return `${crumbs([], 'admin')}<div class="empty">${t().notFound}</div>`;
  const f = h ? h.folder : null, subs = f ? f.folders : deck.folders;
  let out = h ? crumbs(h.path, 'admin') + `<h1>${esc(f.name)}</h1><p class="sub">${t().cards(count(f))}${f.folders.length ? ' · ' + t().folders(f.folders.length) : ''}</p>`
    : `<p class="eyebrow">${t().nav.admin}</p><h1>${t().adminTitle}</h1><p class="sub">${t().adminSub}</p>`;
  out += `<div class="toolbar"><span class="savechip" id="savechip"></span>${f ? `<button class="btn sm" data-act="rename">${I('edit')}${t().rename}</button><button class="btn sm" data-act="move">${I('move')}${t().move}</button><button class="btn sm danger" data-act="del">${I('trash')}${t().del}</button>` : `<button class="btn sm" data-act="backup">${I('download')}${t().backup}</button><button class="btn sm" data-act="restore">${t().restore}</button><input type="file" id="rfile" accept=".json,application/json" hidden />`}</div>`;
  out += `<h2>${f ? t().subfolders : t().fold}</h2><div class="grid">${subs.map((x) => folderTile(x, 'admin')).join('')}<button class="tile add" data-act="addFolder">${I('plus')}${f ? t().newSub : t().newFolder}</button></div>`;
  if (f) {
    out += `<h2>${t().questions} (${f.cards.length})<button class="btn sm" data-act="bulk" style="text-transform:none;letter-spacing:0">${I('list')}${t().bulk}</button></h2>
      <form class="addcard" id="addcard"><textarea class="field" name="q" rows="1" placeholder="${t().q}" required></textarea><textarea class="field" name="a" rows="1" placeholder="${t().a}" required></textarea><button class="btn primary" type="submit">${I('plus')}${t().add}</button></form>
      <div class="cards">${f.cards.map((c, i) => `<div class="crow" data-card="${esc(c.id)}"><span class="n">${i + 1}</span><textarea class="field q" rows="1" data-k="q" aria-label="${t().q}">${esc(c.q)}</textarea><textarea class="field a" rows="1" data-k="a" aria-label="${t().a}">${esc(c.a)}</textarea><button class="icon-btn del" data-act="delCard" title="${t().delCard}" aria-label="${t().delCard}">${I('trash')}</button></div>`).join('')}</div>`;
  }
  return out;
}

// --- účty ---
let usersCache = null;
function viewUsers() {
  return `<p class="eyebrow">${t().nav.users}</p><h1>${t().usersTitle}</h1><p class="sub">${t().usersSub}</p>
    <h2>${t().addUser}</h2><form class="box form" id="adduser"><div class="adduser">
      <div><label class="lbl" for="nu-n">${t().name}</label><input class="field" id="nu-n" name="n" required maxlength="40" autocomplete="off" /></div>
      <div><label class="lbl" for="nu-u">${t().user}</label><input class="field" id="nu-u" name="u" required maxlength="60" autocomplete="off" autocapitalize="none" spellcheck="false" /></div>
      <div><label class="lbl" for="nu-p">${t().pass}</label><input class="field" id="nu-p" name="p" required minlength="6" autocomplete="new-password" /></div>
      <button class="btn primary" id="nu-b">${I('plus')}${t().add}</button></div>
      <label class="toggle"><input type="checkbox" name="adm" />${t().makeAdmin}</label>
      <p class="err" id="nu-err" hidden></p><p class="small muted">${t().passHelp}</p></form>
    <h2>${t().usersTitle}</h2><div class="users" id="ulist">${usersCache ? usersList() : '<div class="spin"></div>'}</div>`;
}
function usersList() {
  if (!usersCache.length) return `<div class="empty">${t().noUsers}</div>`;
  const items = allCards();
  return usersCache.map((u) => {
    const c = catCounts(items, u.cards || {}); const last = Math.max(0, ...Object.values(u.cards || {}).map((s) => s.l || 0));
    return `<a class="urow" href="#/users/${encodeURIComponent(u.uid)}"><span class="av">${esc((u.name || '?')[0])}</span><span style="min-width:0"><b>${esc(u.name)}</b><small>@${esc(u.username)}${u.role === 'admin' ? ' · ' + t().role.admin : ''} · ${last ? t().lastSeen(fmtDate(last)) : t().never}</small></span><span class="kb">${kbar(c.k)}</span>${I('chev')}</a>`;
  }).join('');
}
async function loadUsers(sel) {
  try {
    const qs = await getDocs(collection(db, 'users'));
    const list = await Promise.all(qs.docs.map(async (d) => { let p = {}; try { const s = await getDoc(progRef(d.id)); p = s.data() || {}; } catch (e) {} return { uid: d.id, ...d.data(), cards: p.cards || {}, days: p.days || {} }; }));
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const changedList = JSON.stringify(list) !== JSON.stringify(usersCache);
    usersCache = list;
    if (changedList && route().tab === 'dash') { const du = $('#dashusers'); if (du) du.innerHTML = othersList(); }
    if (changedList && route().tab === 'users') {
      if (sel) { const v = $('#view'); if (v && !v.querySelector('input:focus')) v.innerHTML = viewUser(sel); }
      else { const ul = $('#ulist'); if (ul) ul.innerHTML = usersList(); }
    }
  } catch (e) { console.warn(e); const ul = $('#ulist'); if (ul) ul.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
function viewUser(id) {
  const u = usersCache && usersCache.find((x) => x.uid === id);
  if (!u) return `<nav class="crumbs"><a href="#/users">${t().usersTitle}</a></nav><div class="spin"></div>`;
  statsBody.days = u.days;
  return `<nav class="crumbs"><a href="#/users">${t().usersTitle}</a></nav><h1>${esc(u.name)}</h1><p class="sub">@${esc(u.username)} · ${t().role[u.role] || u.role}</p>
    <div style="margin-top:22px">${statsBody(u.cards, false)}</div>
    ${u.uid === me.uid || u.username === OWNER_EMAIL ? '' : `<h2></h2><div class="toolbar"><button class="btn" data-act="toggleRole" data-uid="${esc(u.uid)}">${u.role === 'admin' ? t().unsetAdmin : t().setAdmin}</button><button class="btn danger" data-act="delUser" data-uid="${esc(u.uid)}">${I('trash')}${t().delUser}</button></div>`}`;
}
async function createUser(name, username, pw, role = 'user') {
  const email = toEmail(username);
  const sec = initializeApp(CONFIG, 'novy-' + Date.now());
  const a2 = initializeAuth(sec, { persistence: inMemoryPersistence });
  if (EMU) connectAuthEmulator(a2, 'http://127.0.0.1:9099', { disableWarnings: true });
  try {
    let cred;
    try { cred = await createUserWithEmailAndPassword(a2, email, pw); }
    catch (e) {
      if (e.code !== 'auth/email-already-in-use') throw e;
      try { cred = await signInWithEmailAndPassword(a2, email, pw); } catch (e2) { throw new Error(t().userTaken); }
    }
    await setDoc(doc(db, 'users', cred.user.uid), { name, username, role, created: new Date().toISOString() });
    await signOut(a2);
  } finally { deleteApp(sec).catch(() => {}); }
}

// --- můj účet ---
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (route().tab === 'account' && me) softRender(); });
function viewAccount() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone;
  return `<p class="eyebrow">@${esc(me.username)} · ${t().role[me.isAdmin ? 'admin' : 'user']}</p><h1>${esc(me.name)}</h1>
    <h2>${t().app}</h2><div class="settings">
      <div class="srow"><div><b>${t().update}</b><small>${t().version(APP_VERSION)}</small></div><button class="btn" data-act="update" id="updbtn">${I('refresh')}${t().update}</button></div>
      ${installEvt ? `<div class="srow"><div><b>${t().install}</b></div><button class="btn" data-act="install">${I('download')}${t().install}</button></div>` : ios ? `<div class="srow"><div><b>${t().install}</b><small>${t().installIos}</small></div></div>` : ''}
    </div>
    <h2>${t().changePass}</h2><form class="box form" id="passf" style="max-width:460px">
      <div><label class="lbl" for="cp1">${t().curPass}</label><input class="field" id="cp1" name="c" type="password" autocomplete="current-password" required /></div>
      <div><label class="lbl" for="cp2">${t().newPass}</label><input class="field" id="cp2" name="n" type="password" minlength="6" autocomplete="new-password" required /></div>
      <p class="err" id="cperr" hidden></p><div><button class="btn primary">${t().save}</button></div></form>
    <h2></h2><button class="btn danger" data-act="logout">${I('logout')}${t().logout}</button>`;
}

// ===== dialogy =====
function modal(html, mount) {
  dlg.innerHTML = `<div class="dlg">${html}<button type="button" class="icon-btn x" data-close aria-label="${t().close}">${I('x')}</button></div>`;
  dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  if (!dlg.open) dlg.showModal();
  if (mount) mount(dlg);
}
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
function ask(title, value = '') {
  return new Promise((res) => {
    let done = false;
    modal(`<h3>${esc(title)}</h3><form id="askf" class="form"><input class="field" name="v" value="${esc(value)}" required maxlength="120" autocomplete="off" /><div class="row"><button type="button" class="btn" data-close>${t().cancel}</button><button class="btn primary">${t().save}</button></div></form>`, (d) => {
      const inp = d.querySelector('input'); inp.focus(); inp.select();
      d.querySelector('#askf').addEventListener('submit', (e) => { e.preventDefault(); done = true; res(inp.value.trim()); dlg.close(); });
      dlg.addEventListener('close', () => { if (!done) res(null); }, { once: true });
    });
  });
}
function parseBulk(text) {
  const out = []; let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const m = line.match(/^(.*?)(?:\t|;|\s[–—-]\s)(.*)$/);
    if (m && m[1].trim() && m[2].trim()) out.push({ id: uid(), q: m[1].trim(), a: m[2].trim() }); else skipped++;
  }
  return { out, skipped };
}

// ===== hra: výběr režimu =====
const settings = Object.assign({ mode: 'smart', dir: 'qa', count: 20, smartOrder: true }, lsGet('fc-settings', {}));
const CHOICE = ['quiz', 'tf', 'time', 'lives'];
function playDialog(id, mode) {
  const got = itemsOfMany(String(id).split(',')); if (!got) return;
  const { folder, items } = got;
  if (!items.length) return;
  if (mode) { settings.mode = mode; return startGame(folder, items); }
  const pool = [...items, ...allCards()];
  const distinct = (side) => new Set(pool.map((c) => c[side].trim())).size;
  const canChoice = (dir) => (dir === 'qa' ? distinct('a') >= 2 : dir === 'aq' ? distinct('q') >= 2 : distinct('a') >= 2 && distinct('q') >= 2);
  const weakN = items.filter((c) => { const k = catOf(st(c.id)); return k === 1 || k === 2; }).length;
  modal(`<h3>${esc(t().playTitle(folder.name))}</h3><p>${t().cards(items.length)}</p>
    <form id="pf" class="form" style="gap:18px">
      <div><label class="lbl">${t().mode}</label><div class="modes">${Object.entries(t().modes).map(([k, [n, d]]) => `<label class="mode ${k === 'smart' ? 'rec' : ''}" data-mode="${k}"><input type="radio" name="mode" value="${k}" ${settings.mode === k ? 'checked' : ''} /><span class="mi">${I(MODE_ICON[k])}</span><span><b>${n}</b><small data-d="${esc(d)}">${d}</small></span></label>`).join('')}</div></div>
      <div><label class="lbl">${t().dir}</label><div class="chips">${Object.entries(t().dirs).map(([k, n]) => `<label class="chip"><input type="radio" name="dir" value="${k}" ${settings.dir === k ? 'checked' : ''} /><span>${n}</span></label>`).join('')}</div></div>
      <div id="cntbox"><label class="lbl">${t().count}</label><div class="chips">${[10, 20, 50, 0].map((n) => `<label class="chip"><input type="radio" name="count" value="${n}" ${settings.count === n ? 'checked' : ''} /><span>${n || t().allCnt}</span></label>`).join('')}</div></div>
      <label class="toggle" id="sobox"><input type="checkbox" name="so" ${settings.smartOrder ? 'checked' : ''} />${t().smartOrder}</label>
      <button class="btn primary big block">${I('play')}${t().go}</button>
    </form>`, (d) => {
    const form = d.querySelector('#pf');
    const upd = () => {
      const ok = canChoice(form.dir.value);
      Object.keys(t().modes).forEach((m) => {
        const el = form.querySelector(`[data-mode="${m}"]`), sm = el.querySelector('small');
        const off = (CHOICE.includes(m) && !ok) || (m === 'weak' && !weakN);
        el.classList.toggle('off', off);
        sm.textContent = off ? (m === 'weak' ? t().noWeak : t().needTwo) : sm.dataset.d;
        if (off && form.mode.value === m) form.querySelector('[value="smart"]').checked = true;
      });
      const m = form.mode.value;
      $('#cntbox', d).hidden = m === 'time';
      $('#sobox', d).hidden = m === 'smart' || m === 'weak';
    };
    form.addEventListener('change', upd); upd();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      Object.assign(settings, { mode: form.mode.value, dir: form.dir.value, count: +form.count.value, smartOrder: form.so.checked });
      lsSet('fc-settings', settings); dlg.close(); startGame(folder, items);
    });
  });
}

// ===== hra =====
let G = null;
function startGame(folder, items, onlyThese) {
  const { mode, dir } = settings, N = settings.count || Infinity;
  let list;
  if (onlyThese) list = shuffle([...onlyThese]);
  else if (mode === 'smart') list = buildSmart(items, settings.count || items.length);
  else if (mode === 'weak') { const now = Date.now(); list = items.filter((c) => { const k = catOf(st(c.id), now); return k === 1 || k === 2; }).sort((a, b) => prio(b, now) - prio(a, now)).slice(0, N); shuffle(list); }
  else list = (settings.smartOrder ? smartOrder(items) : [...items]).slice(0, mode === 'time' ? Infinity : N);
  if (!list.length) { toast(t().noWeak); return; }
  const deckItems = list.map((c) => ({ ...c, rev: dir === 'aq' || (dir === 'mix' && Math.random() < 0.5), miss: false }));
  G = { folder, items, mode, deck: deckItems, queue: [...deckItems], done: 0, correct: 0, wrong: 0, lives: LIVES, seen: 0, start: Date.now(), lastAt: Date.now(), cur: null, state: 'q', timer: null, timeLeft: TIME_LIMIT, missed: [], before: {}, onlyThese };
  deckItems.forEach((c) => { if (!(c.id in G.before)) G.before[c.id] = catOf(st(c.id)); });
  gameEl.hidden = false; document.body.style.overflow = 'hidden'; document.body.classList.add('playing');
  if (mode === 'time') { G.endAt = Date.now() + TIME_LIMIT * 1000; G.timer = setInterval(tick, 250); }
  if (mode === 'match') { G.rounds = Math.ceil(G.queue.length / 5); G.round = 0; return nextRound(); }
  nextCard();
}
function closeGame() {
  if (G && G.timer) clearInterval(G.timer);
  flush();
  G = null; gameEl.hidden = true; gameEl.innerHTML = ''; document.body.style.overflow = ''; document.body.classList.remove('playing');
  softRender();
}
function tick() {
  G.timeLeft = Math.max(0, Math.ceil((G.endAt - Date.now()) / 1000));
  const el = $('#g-time'); if (el) { el.textContent = G.timeLeft + ' s'; el.classList.toggle('low', G.timeLeft <= 10); }
  const bar = $('.pbar i', gameEl); if (bar) bar.style.width = ((TIME_LIMIT - G.timeLeft) / TIME_LIMIT) * 100 + '%';
  if (G.timeLeft <= 0) endGame();
}
const sideOf = (item, which) => ((which === 'front') !== item.rev ? item.q : item.a);
const FLIP = ['smart', 'weak', 'classic'];
function nextCard() {
  if (!G || G.state === 'end') return;
  if (G.mode === 'time' && !G.queue.length) G.queue = shuffle(G.deck.map((c) => ({ ...c })));
  if (!G.queue.length || (G.mode === 'lives' && G.lives <= 0)) return endGame();
  G.cur = G.queue.shift(); G.state = 'q'; G.flipDrawn = false;
  if (['quiz', 'time', 'lives'].includes(G.mode)) G.opts = makeOptions(G.cur, 3);
  if (G.mode === 'tf') { const right = Math.random() < 0.5; const wrong = makeOptions(G.cur, 1).find((o) => o !== sideOf(G.cur, 'back').trim()); G.cand = right || !wrong ? sideOf(G.cur, 'back').trim() : wrong; }
  drawGame(true);
}
function makeOptions(item, n) {
  const back = sideOf(item, 'back').trim(), side = item.rev ? 'q' : 'a', opts = [];
  // špatné možnosti nejdřív ze stejné složky, pak ze spuštěné složky, nakonec odkudkoli
  for (const src of [G.items.filter((c) => c.path === item.path), G.items, allCards()]) {
    if (opts.length >= n) break;
    const cand = [...new Set(src.map((c) => c[side].trim()))].filter((x) => x && x !== back && !opts.includes(x));
    opts.push(...shuffle(cand).slice(0, n - opts.length));
  }
  return shuffle([back, ...opts]);
}
function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[.,!?;:"'„“”()\[\]–—-]/g, ' ').replace(/\s+/g, ' ').trim(); }
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
function judge(input, answer) {
  const x = norm(input), y = norm(answer);
  if (!x) return 'bad';
  if (x === y) return 'good';
  return lev(x, y) <= (y.length >= 9 ? 2 : y.length >= 4 ? 1 : 0) ? 'near' : 'bad';
}
// rozpoznání (kvíz, pravda/nepravda, spojovačka) je snazší než vybavení, proto u nových karet dává jen „trochu“
const recogQ = (item) => (catOf(st(item.id)) <= 1 ? 1 : 2);
function miss(item) { if (!G.missed.some((m) => m.id === item.id)) G.missed.push(item); }

function hud() {
  const g = G, total = g.deck.length;
  let pct = 0, line = '', right = '';
  if (FLIP.includes(g.mode)) { pct = (g.done / total) * 100; line = t().left(g.queue.length + (g.state === 'done' ? 0 : 1)); right = `<span class="pill">✓ ${g.done}/${total}</span>`; }
  else if (g.mode === 'time') { pct = ((TIME_LIMIT - g.timeLeft) / TIME_LIMIT) * 100; line = t().modes.time[0]; right = `<span class="pill">✓ ${g.correct}</span><span class="pill t ${g.timeLeft <= 10 ? 'low' : ''}" id="g-time">${g.timeLeft} s</span>`; }
  else if (g.mode === 'match') { pct = (g.done / total) * 100; line = t().round(g.round, g.rounds); right = `<span class="pill">✓ ${g.done}/${total}</span>`; }
  else { pct = (g.seen / total) * 100; line = t().of(Math.min(g.seen + 1, total), total); right = g.mode === 'lives' ? `<span class="pill" id="g-hearts">${'❤️'.repeat(g.lives)}${'🤍'.repeat(LIVES - g.lives)}</span>` : `<span class="pill">✓ ${g.correct}</span>`; }
  return `<div class="g-top"><button class="icon-btn" id="g-quit" aria-label="${t().quit}" title="${t().quit}">${I('x')}</button><div class="meta"><b>${esc(g.folder.name)}</b><small>${t().modes[g.mode][0]} · ${line}</small><div class="pbar"><i style="width:${pct}%"></i></div></div><div class="g-score">${right}</div></div>`;
}
function tags(it) { const k = catOf(st(it.id)); return `<div class="tags"><span class="path">${I('folder')}<span>${esc(it.path)}</span></span><span class="kpill c${k}">${t().cat[k]}</span></div>`; }
function cardHtml(item, flipped, clickable, extra = '') {
  return `<div class="flip ${flipped ? 'on' : ''} ${clickable ? '' : 'static'}" id="g-card"><div class="flip-in">
    <div class="face"><small>${item.rev ? t().back : t().front}</small><div class="txt">${esc(sideOf(item, 'front'))}</div>${extra}${clickable ? `<span class="tap">${t().tap}</span>` : ''}</div>
    <div class="face back"><small>${item.rev ? t().front : t().back}</small><div class="txt">${esc(sideOf(item, 'back'))}</div></div></div></div>`;
}
function drawGame(fresh) {
  const g = G, it = g.cur;
  // kartu nejdřív vykreslíme neotočenou a otočíme ji až potom, ať je vidět animace
  const wantFlip = FLIP.includes(g.mode) ? g.state === 'a' : g.mode === 'write' ? g.state !== 'q' : false;
  const flipNow = wantFlip && !g.flipDrawn;
  let body = tags(it);
  if (FLIP.includes(g.mode)) {
    body += cardHtml(it, wantFlip && !flipNow, g.state === 'q');
    body += g.state === 'q' ? `<div class="ctrl"><button class="btn big primary" id="g-flip">${t().show}</button></div>`
      : `<div class="grade">${t().g.map((n, i) => `<button class="g${i}" data-q="${i}">${n}<small class="k">${i + 1}</small></button>`).join('')}</div>`;
    body += `<p class="keys">${t().keysFlip}</p>`;
  } else if (g.mode === 'write') {
    body += cardHtml(it, wantFlip && !flipNow, false);
    if (g.state === 'q') body += `<form class="write" id="g-wf"><input class="field" id="g-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t().typePh}" /><button class="btn primary">${t().check}</button></form><div class="ctrl"><button class="btn sm" id="g-dunno">${t().dunno}</button></div>`;
    else {
      const back = esc(sideOf(it, 'back'));
      body += g.res === 'good' ? `<div class="fb good">${t().correct}</div>` : g.res === 'near' ? `<div class="fb near">${t().near} <b>${back}</b></div>` : `<div class="fb bad">${t().wrong} <b>${back}</b>${g.typed ? `<br><small>(${esc(g.typed)})</small>` : ''}</div>`;
      body += `<div class="ctrl">${g.res === 'bad' && g.typed ? `<button class="btn" id="g-override">${t().countIt}</button>` : ''}<button class="btn primary big" id="g-next">${t().next}</button></div>`;
    }
    body += `<p class="keys">${t().keysWrite}</p>`;
  } else if (g.mode === 'tf') {
    body += cardHtml(it, false, false, `<div class="cand">${esc(g.cand)}</div>`);
    body += `<div class="tf" id="g-tf"><button class="btn yes" data-tf="1">✓ ${t().yes}</button><button class="btn no" data-tf="0">✗ ${t().no}</button></div><div id="g-tffb"></div><p class="keys">${t().keysTf}</p>`;
  } else {
    body += cardHtml(it, false, false) + `<div class="answers" id="g-ans">${g.opts.map((o, i) => `<button class="ans" data-i="${i}"><kbd>${i + 1}</kbd>${esc(o)}</button>`).join('')}</div><p class="keys">${t().keysQuiz}</p>`;
  }
  gameEl.innerHTML = hud() + `<div class="g-main ${fresh ? 'enter' : ''}">${body}</div>`;
  if (flipNow) { g.flipDrawn = true; requestAnimationFrame(() => requestAnimationFrame(() => { const c = $('#g-card'); if (c) c.classList.add('on'); })); }
  const inp = $('#g-in'); if (inp) inp.focus({ preventScroll: true });
  if (g.state !== 'q' && g.mode === 'write') { const n = $('#g-next'); if (n) n.focus({ preventScroll: true }); }
}
function flip() { if (G.state !== 'q') return; G.state = 'a'; drawGame(false); }
function gradeFlip(q) {
  const g = G; if (g.state !== 'a') return;
  record(g.cur, q);
  if (q > 0) { g.done++; if (!g.cur.miss) g.correct++; }
  else { if (!g.cur.miss) { g.cur.miss = true; miss(g.cur); } g.queue.splice(Math.min(g.queue.length, 3 + Math.floor(Math.random() * 3)), 0, g.cur); }
  g.state = 'done'; nextCard();
}
function checkWrite(val) {
  const g = G; if (g.state !== 'q') return;
  g.typed = val; g.res = judge(val, sideOf(g.cur, 'back')); g.state = 'a'; g.seen++;
  g.prev = record(g.cur, g.res === 'good' ? 2 : g.res === 'near' ? 1 : 0);
  if (g.res === 'bad') { g.wrong++; miss(g.cur); } else g.correct++;
  drawGame(false);
}
function override() {
  const g = G; if (g.res !== 'bad') return;
  restoreCard(g.cur.id, g.prev); record(g.cur, 2);
  g.res = 'good'; g.wrong--; g.correct++; g.missed = g.missed.filter((m) => m.id !== g.cur.id); drawGame(false);
}
function afterChoice(ok, delay) {
  const g = G;
  if (ok) g.correct++; else { g.wrong++; miss(g.cur); if (g.mode === 'lives') g.lives--; }
  record(g.cur, ok ? recogQ(g.cur) : 0);
  if (g.mode !== 'time') g.seen++;
  const h = $('#g-hearts'); if (h) h.textContent = '❤️'.repeat(g.lives) + '🤍'.repeat(LIVES - g.lives);
  setTimeout(() => { if (G === g) nextCard(); }, ok ? 650 : delay);
}
function choose(i) {
  const g = G; if (g.state !== 'q') return;
  g.state = 'a';
  const back = sideOf(g.cur, 'back').trim(), ok = g.opts[i] === back, btns = gameEl.querySelectorAll('.ans');
  btns.forEach((b, j) => { if (g.opts[j] === back) b.classList.add('good'); });
  $('#g-ans').classList.add('done');
  if (!ok) btns[i].classList.add('bad', 'shake');
  afterChoice(ok, 1500);
}
function answerTf(yes) {
  const g = G; if (g.state !== 'q') return;
  g.state = 'a';
  const isRight = g.cand === sideOf(g.cur, 'back').trim(), ok = yes === isRight;
  $('#g-tf').classList.add('done');
  const b = gameEl.querySelector(`[data-tf="${yes ? 1 : 0}"]`); b.classList.add(ok ? 'good' : 'bad'); if (!ok) b.classList.add('shake');
  if (!ok || !isRight) $('#g-tffb').innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}">${t().tfWrong} <b>${esc(sideOf(g.cur, 'back'))}</b></div>`;
  afterChoice(ok, 1900);
}
// spojovačka
function nextRound() {
  const g = G;
  if (!g.queue.length) return endGame();
  g.round++; g.pairs = g.queue.splice(0, 5); g.sel = null; g.mistakes = {};
  const right = shuffle(g.pairs.map((c) => c.id));
  gameEl.innerHTML = hud() + `<div class="g-main enter"><div class="match"><div class="colm">${g.pairs.map((c) => `<button class="pair" data-side="L" data-id="${esc(c.id)}">${esc(sideOf(c, 'front'))}</button>`).join('')}</div>
    <div class="colm">${right.map((id) => { const c = g.pairs.find((x) => x.id === id); return `<button class="pair" data-side="R" data-id="${esc(c.id)}">${esc(sideOf(c, 'back'))}</button>`; }).join('')}</div></div></div>`;
}
function tapPair(btn) {
  const g = G;
  if (!g.sel) { g.sel = btn; btn.classList.add('sel'); return; }
  if (g.sel === btn) { btn.classList.remove('sel'); g.sel = null; return; }
  if (g.sel.dataset.side === btn.dataset.side) { g.sel.classList.remove('sel'); g.sel = btn; btn.classList.add('sel'); return; }
  const a = g.sel, L = a.dataset.side === 'L' ? a : btn, R = L === a ? btn : a;
  const item = g.pairs.find((c) => c.id === L.dataset.id), rItem = g.pairs.find((c) => c.id === R.dataset.id);
  g.sel = null; a.classList.remove('sel');
  if (L.dataset.id === R.dataset.id || sideOf(item, 'back').trim() === sideOf(rItem, 'back').trim()) {
    [L, R].forEach((b) => b.classList.add('ok')); setTimeout(() => [L, R].forEach((b) => b.classList.add('done')), 250);
    if (L.dataset.id !== R.dataset.id) { R.dataset.id = L.dataset.id; }
    const bad = g.mistakes[item.id]; record(item, bad ? 0 : recogQ(item));
    if (bad) miss(item); else g.correct++;
    g.done++; const bar = $('.pbar i', gameEl); if (bar) bar.style.width = (g.done / g.deck.length) * 100 + '%';
    const pill = gameEl.querySelector('.g-score .pill'); if (pill) pill.textContent = `✓ ${g.done}/${g.deck.length}`;
    g.pairs = g.pairs.filter((c) => c.id !== item.id);
    if (!g.pairs.length) setTimeout(() => { if (G === g) nextRound(); }, 550);
  } else {
    g.mistakes[item.id] = (g.mistakes[item.id] || 0) + 1;
    [L, R].forEach((b) => { b.classList.remove('bad', 'shake'); void b.offsetWidth; b.classList.add('bad', 'shake'); setTimeout(() => b.classList.remove('bad'), 600); });
  }
}
function endGame() {
  const g = G; if (!g || g.state === 'end') return;
  if (g.timer) clearInterval(g.timer);
  g.state = 'end'; flush();
  const total = g.deck.length, secs = Math.round((Date.now() - g.start) / 1000);
  let pct, head, line;
  if (g.mode === 'time') {
    const key = g.folder.id + ':' + settings.dir, bests = lsGet('fc-best', {}), prev = bests[key] || 0, isNew = g.correct > prev;
    if (isNew) { bests[key] = g.correct; lsSet('fc-best', bests); }
    const answered = g.correct + g.wrong; pct = answered ? Math.round((g.correct / answered) * 100) : 0;
    head = isNew && g.correct ? t().newBest : t().res[Math.min(4, Math.floor(pct / 25))];
    line = `${t().resTime(g.correct)} · ${t().best(Math.max(prev, g.correct))}`;
  } else {
    pct = total ? Math.round((g.correct / total) * 100) : 0;
    head = t().res[pct === 100 ? 4 : Math.min(3, Math.floor(pct / 25))];
    line = `${t().resLine(g.correct, total)} · ${t().time} ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  }
  // kam se karty posunuly
  const ids = [...new Set(g.deck.map((c) => c.id))].filter((id) => st(id) && st(id).n);
  const now = Date.now(), after = [0, 0, 0, 0]; let up = 0;
  ids.forEach((id) => { const k = catOf(st(id), now); after[k]++; if (k > (g.before[id] || 0) && !(g.before[id] === 0 && k === 1)) up++; });
  const missed = g.missed;
  gameEl.innerHTML = `<div class="g-top"><button class="icon-btn" id="g-close" aria-label="${t().close}">${I('x')}</button><div class="meta"><b>${esc(g.folder.name)}</b><small>${t().modes[g.mode][0]}</small></div></div>
    <div class="g-main enter"><div class="result">
      <div class="ring" style="--p:${pct}"><div>${g.mode === 'time' ? g.correct : pct + ' %'}</div></div>
      <h3>${head}</h3><p>${line}</p>
      ${ids.length ? `<div><p class="small muted" style="margin-bottom:8px">${t().nowCats}${up ? ' · ' + t().up(up) : ''}</p><div class="moves">${[3, 2, 1].filter((k) => after[k]).map((k) => `<span class="kpill c${k}">${t().cat[k]} ${after[k]}</span>`).join('')}</div></div>` : ''}
      <div class="ctrl" style="width:100%">${missed.length ? `<button class="btn big" id="g-missed">${t().againMissed} (${missed.length})</button>` : ''}<button class="btn big primary" id="g-again">${t().again}</button></div>
      <button class="btn sm" id="g-close2">${t().backTo}</button>
      ${missed.length ? `<h2 style="align-self:stretch;margin:12px 0 0">${t().missed}</h2><div class="list">${missed.map((m) => `<div class="li"><span class="qa">${esc(sideOf(m, 'front'))} → <em>${esc(sideOf(m, 'back'))}</em></span><span class="num"></span><small>${esc(m.path)}</small></div>`).join('')}</div>` : ''}
    </div></div>`;
  const again = $('#g-again'); if (again) again.focus({ preventScroll: true });
}
const quitGame = () => { const g = G; if (!g) return; if (g.state === 'end' || g.seen + g.done === 0 || confirm(t().quitConfirm)) closeGame(); };

gameEl.addEventListener('click', (e) => {
  const g = G; if (!g) return;
  const el = e.target.closest('button, #g-card'); if (!el) return;
  const id = el.id;
  if (id === 'g-quit') return quitGame();
  if (id === 'g-close' || id === 'g-close2') return closeGame();
  if (id === 'g-again') { const { folder, items, onlyThese } = g; closeGame(); return startGame(folder, items, onlyThese); }
  if (id === 'g-missed') { const { folder, items, missed } = g; closeGame(); return startGame(folder, items, missed.map(({ rev, miss: _m, ...c }) => c)); }
  if (g.state === 'end') return;
  if (FLIP.includes(g.mode)) {
    if (id === 'g-flip' || (id === 'g-card' && g.state === 'q')) return flip();
    if (id === 'g-card') { el.classList.toggle('on'); return; }
    if (el.dataset.q) return gradeFlip(+el.dataset.q);
  }
  if (g.mode === 'write') { if (id === 'g-dunno') return checkWrite(''); if (id === 'g-next') return nextCard(); if (id === 'g-override') return override(); }
  if (g.mode === 'tf' && el.dataset.tf) return answerTf(el.dataset.tf === '1');
  if (g.mode === 'match' && el.classList.contains('pair')) return tapPair(el);
  if (el.classList.contains('ans')) return choose(+el.dataset.i);
});
gameEl.addEventListener('submit', (e) => { e.preventDefault(); if (G && e.target.id === 'g-wf') checkWrite($('#g-in').value); });
document.addEventListener('keydown', (e) => {
  const g = G; if (!g || gameEl.hidden || dlg.open) return;
  if (e.key === 'Escape') return quitGame();
  if (g.state === 'end') return;
  if (FLIP.includes(g.mode)) {
    if ((e.key === ' ' || e.key === 'Enter') && g.state === 'q') { e.preventDefault(); flip(); }
    else if (g.state === 'a') {
      const q = { 1: 0, 2: 1, 3: 2, ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2 }[e.key];
      if (q !== undefined) { e.preventDefault(); gradeFlip(q); }
    }
  } else if (g.mode === 'write') {
    if (e.key === 'Enter' && g.state === 'a' && e.target.id !== 'g-override') { e.preventDefault(); nextCard(); }
  } else if (g.mode === 'tf') {
    if (g.state === 'q' && (e.key === 'ArrowLeft' || e.key === '1')) { e.preventDefault(); answerTf(true); }
    if (g.state === 'q' && (e.key === 'ArrowRight' || e.key === '2')) { e.preventDefault(); answerTf(false); }
  } else if (g.mode !== 'match' && g.state === 'q' && /^[1-4]$/.test(e.key) && +e.key <= g.opts.length) { e.preventDefault(); choose(+e.key - 1); }
});

// ===== kliknutí a formuláře v aplikaci =====
document.addEventListener('change', (e) => {
  const pk = e.target.closest('[data-pick]'); if (!pk) return;
  if (pk.checked) picked.add(pk.dataset.pick); else picked.delete(pk.dataset.pick);
  pk.closest('.tile').classList.toggle('picked', pk.checked); updatePickBar();
});
document.addEventListener('click', async (e) => {
  const pl = e.target.closest('[data-play]');
  if (pl) { e.preventDefault(); return playDialog(pl.dataset.play, pl.dataset.mode); }
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act;
  if (act === 'logout') { flush(); picked.clear(); await signOut(auth); return; }
  if (act === 'clearPick') { picked.clear(); document.querySelectorAll('[data-pick]').forEach((x) => { x.checked = false; x.closest('.tile').classList.remove('picked'); }); updatePickBar(); return; }
  if (act === 'update') return manualUpdate(a);
  if (act === 'install' && installEvt) { installEvt.prompt(); installEvt = null; return; }
  if (act === 'toggleRole') {
    const u = usersCache.find((x) => x.uid === a.dataset.uid); if (!u) return;
    const role = u.role === 'admin' ? 'user' : 'admin';
    try { await setDoc(doc(db, 'users', u.uid), { role }, { merge: true }); u.role = role; toast(t().roleSet); render(); } catch (er) { toast(er.message); }
    return;
  }
  if (act === 'delUser') {
    const u = usersCache.find((x) => x.uid === a.dataset.uid); if (!u || !confirm(t().delUserConfirm(u.name))) return;
    try { await deleteDoc(doc(db, 'users', u.uid)); await deleteDoc(progRef(u.uid)); usersCache = usersCache.filter((x) => x !== u); toast(t().deleted); go('#/users'); } catch (er) { toast(er.message); }
    return;
  }
  if (!me || !me.isAdmin || route().tab !== 'admin') return;
  const r = route(), hit = r.arg ? find(r.arg) : null, f = hit && hit.folder;
  switch (act) {
    case 'addFolder': { const name = await ask(f ? t().newSub : t().newFolder); if (!name) return; (f ? f.folders : deck.folders).push({ id: uid(), name, cards: [], folders: [] }); changed(); render(); break; }
    case 'rename': { const name = await ask(t().rename, f.name); if (!name) return; f.name = name; changed(); render(); break; }
    case 'del': { if (!confirm(t().delConfirm(f.name, count(f)))) return; hit.list.splice(hit.list.indexOf(f), 1); changed(); go(hit.parent ? '#/admin/' + encodeURIComponent(hit.parent.id) : '#/admin'); break; }
    case 'move': {
      const opts = [];
      const walk = (list, depth) => list.forEach((x) => { if (x.id !== f.id) { opts.push(`<option value="${esc(x.id)}">${'&nbsp;&nbsp;&nbsp;'.repeat(depth)}${esc(x.name)}</option>`); walk(x.folders, depth + 1); } });
      walk(deck.folders, 1);
      modal(`<h3>${t().moveTo}</h3><select class="field" id="mv"><option value="">${t().top}</option>${opts.join('')}</select><div class="row"><button class="btn" data-close>${t().cancel}</button><button class="btn primary" id="mvok">${t().move}</button></div>`, (d) => {
        const sel = d.querySelector('#mv'); sel.value = hit.parent ? hit.parent.id : '';
        d.querySelector('#mvok').onclick = () => { const to = sel.value ? find(sel.value).folder : null; hit.list.splice(hit.list.indexOf(f), 1); (to ? to.folders : deck.folders).push(f); changed(); dlg.close(); render(); };
      });
      break;
    }
    case 'delCard': { const id = a.closest('[data-card]').dataset.card; f.cards = f.cards.filter((c) => c.id !== id); changed(); render(); break; }
    case 'bulk': {
      modal(`<h3>${t().bulk}</h3><p>${t().bulkHelp}</p><textarea class="field" id="bt" rows="8" placeholder="${esc(t().bulkPh)}"></textarea><div class="row"><button class="btn" data-close>${t().cancel}</button><button class="btn primary" id="bok">${t().add}</button></div>`, (d) => {
        d.querySelector('#bt').focus();
        d.querySelector('#bok').onclick = () => { const { out, skipped } = parseBulk(d.querySelector('#bt').value); if (out.length) { f.cards.push(...out); changed(); } dlg.close(); render(); toast(t().bulkDone(out.length) + (skipped ? ' ' + t().bulkSkip(skipped) : ''), 4500); };
      });
      break;
    }
    case 'backup': {
      const blob = new Blob([JSON.stringify({ folders: deck.folders }, null, 1)], { type: 'application/json' });
      const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = `flashcards-${dayKey()}.json`; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 1000);
      break;
    }
    case 'restore': {
      const rf = $('#rfile'); rf.value = '';
      rf.onchange = async () => {
        try { const j = JSON.parse(await rf.files[0].text()); if (!Array.isArray(j.folders)) throw 0; if (!confirm(t().restoreConfirm)) return; deck = normalizeDeck(j); changed(); render(); toast(t().restored); }
        catch (er) { toast(t().restoreErr); }
      };
      rf.click(); break;
    }
  }
});
document.addEventListener('submit', async (e) => {
  const fm = e.target;
  if (fm.id === 'loginf') {
    e.preventDefault();
    const btn = $('#lbtn'); btn.disabled = true;
    try { history.replaceState(null, '', '#/dash'); await signInWithEmailAndPassword(auth, toEmail(fm.u.value), fm.p.value); }
    catch (er) {
      const c = er.code || '';
      const msg = c.includes('too-many') ? t().tooMany : c.includes('network') ? t().offline : t().badLogin;
      const el = $('#lerr'); el.textContent = msg; el.hidden = false; btn.disabled = false; fm.p.select();
    }
    return;
  }
  if (fm.id === 'addcard') {
    e.preventDefault();
    const f = find(route().arg).folder, q = fm.q.value.trim(), a = fm.a.value.trim(); if (!q || !a) return;
    f.cards.push({ id: uid(), q, a }); changed(); render(); $('#addcard textarea').focus();
    return;
  }
  if (fm.id === 'adduser') {
    e.preventDefault();
    const err = $('#nu-err'), name = fm.n.value.trim(), username = fm.u.value.trim().toLowerCase(), pw = fm.p.value;
    err.hidden = true;
    if (!/^[a-z0-9._-]{3,30}$/.test(username) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) { err.textContent = t().badUsername; err.hidden = false; return; }
    if (pw.length < 6) { err.textContent = t().shortPass; err.hidden = false; return; }
    const btn = $('#nu-b'); btn.disabled = true;
    try { await createUser(name, username, pw, fm.adm.checked ? 'admin' : 'user'); fm.reset(); toast(t().created); loadUsers(); }
    catch (er) { err.textContent = er.code === 'auth/weak-password' ? t().shortPass : er.message; err.hidden = false; }
    btn.disabled = false;
    return;
  }
  if (fm.id === 'passf') {
    e.preventDefault();
    const err = $('#cperr'); err.hidden = true;
    try {
      await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, fm.c.value));
      await updatePassword(auth.currentUser, fm.n.value); fm.reset(); toast(t().passChanged);
    } catch (er) { err.textContent = (er.code || '').includes('credential') || (er.code || '').includes('wrong-password') ? t().badCur : er.code === 'auth/weak-password' ? t().shortPass : er.message; err.hidden = false; }
  }
});
document.addEventListener('keydown', (e) => {
  const ta = e.target.closest && e.target.closest('#addcard textarea');
  if (!ta || e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
  e.preventDefault();
  if (ta.name === 'q') ta.form.a.focus(); else ta.form.requestSubmit();
});
document.addEventListener('input', (e) => {
  const ta = e.target; if (!ta.matches || !ta.matches('textarea.field')) return;
  autosize(ta);
  const row = ta.closest('[data-card]'); if (!row || !me || !me.isAdmin) return;
  const card = find(route().arg).folder.cards.find((c) => c.id === row.dataset.card);
  card[ta.dataset.k] = ta.value; changed();
});
document.addEventListener('focusout', (e) => {
  const row = e.target.closest && e.target.closest('[data-card]');
  if (!row || !me || !me.isAdmin || row.contains(e.relatedTarget)) return;
  const f = find(route().arg).folder, card = f.cards.find((c) => c.id === row.dataset.card);
  if (card && !card.q.trim() && !card.a.trim()) { f.cards = f.cards.filter((c) => c !== card); changed(); render(); }
});

// ===== PWA: offline a aktualizace =====
let reg = null, reloading = false;
function showUpdateBar() {
  const b = $('#updbar'); b.hidden = false;
  b.innerHTML = `<span>${t().newVersion}</span><button class="btn sm" id="updnow">${t().update}</button>`;
  $('#updnow').onclick = applyUpdate;
}
function applyUpdate() { flush(); if (reg && reg.waiting) reg.waiting.postMessage('skip'); else location.reload(); }
function watchReg(r) {
  reg = r;
  if (r.waiting && navigator.serviceWorker.controller) showUpdateBar();
  r.addEventListener('updatefound', () => {
    const w = r.installing; if (!w) return;
    w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdateBar(); });
  });
}
async function manualUpdate(btn) {
  btn.disabled = true; const old = btn.innerHTML; btn.textContent = t().updating;
  flush();
  try {
    if (reg) {
      await reg.update();
      for (let i = 0; i < 40 && reg.installing; i++) await new Promise((r) => setTimeout(r, 150));
      if (reg.waiting) return applyUpdate();
    }
    try { const s = await getDocFromServer(deckRef()); deck = normalizeDeck(s.data()); } catch (e) {}
    try { const s = await getDocFromServer(progRef()); const d = s.data() || {}; prog = { cards: { ...(d.cards || {}) }, days: { ...(d.days || {}) } }; } catch (e) {}
    toast(t().upToDate);
  } finally { btn.disabled = false; btn.innerHTML = old; }
}
if ('serviceWorker' in navigator && !EMU) {
  navigator.serviceWorker.register('sw.js').then(watchReg).catch((e) => console.warn(e));
  const hadController = !!navigator.serviceWorker.controller; // při úplně první návštěvě se nepřenačítá
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading || !hadController) return; reloading = true; location.reload(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && reg) reg.update().catch(() => {}); });
}

// ===== start =====
if (!CONFIG) renderMessage(t().notReady);
else {
  initFirebase();
  onAuthStateChanged(auth, (u) => {
    if (u) { if (!me || me.uid !== u.uid) enter(u); }
    else { leave(); renderLogin(); }
  });
}

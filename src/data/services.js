// NABÍDKA SLUŽEB
//
// groups – skupiny služeb. exclusive: true = ze skupiny jde vybrat jen jedna služba
//          (např. web je buď jednoduchý, nebo rozsáhlejší, ne oba).
//
// services – jednotlivé služby, které si návštěvník může zaškrtat a kombinovat.
//   id        – krátký identifikátor bez mezer (používají ho kombinace níže)
//   group     – do které skupiny služba patří (musí odpovídat id skupiny)
//   name      – název služby
//   desc      – jedna až dvě věty, co klient dostane
//   price     – cena v Kč; null = cena dohodou
//   priceMax  – (volitelné) horní hranice, když je cena rozpětí
//
// bundles – rychlé volby podle situace klienta; jedním klikem zaškrtnou několik služeb.

export const groups = [
  { id: 'web', name: 'Web', exclusive: true },
  { id: 'grafika', name: 'Grafika' },
];

export const services = [
  {
    id: 'web-simple',
    group: 'web',
    name: 'Jednoduchý web',
    desc: 'Přehledná stránka o vás: co děláte, proč zrovna vy a jak se vám ozvat. Skvělá na start.',
    price: 4790,
  },
  {
    id: 'web-big',
    group: 'web',
    name: 'Rozsáhlejší web',
    desc: 'Víc stránek, efekty, které zaujmou, a podle potřeby databáze s administrací na míru. Po přihlášení si obsah spravujete sami.',
    price: 7990,
  },
  {
    id: 'eshop',
    group: 'web',
    name: 'Komplexní e-shop',
    desc: 'Celý obchod včetně administrace na míru: produkty, objednávky i zákazníci. Cena záleží na tom, co všechno má umět.',
    price: 15000,
    priceMax: 25000,
  },

  {
    id: 'logo',
    group: 'grafika',
    name: 'Logo',
    desc: 'Logo, které si lidé zapamatují. Dostanete ho ve všech formátech pro web i tisk.',
    price: 1390,
  },
  {
    id: 'identity',
    group: 'grafika',
    name: 'Vizuální identita',
    desc: 'Barvy, písma a pravidla, díky kterým bude web, vizitka i příspěvek vypadat jako jedna značka.',
    price: 3990,
  },
  {
    id: 'graphics-other',
    group: 'grafika',
    name: 'Jiná grafika',
    desc: 'Plakáty, letáky, grafika na sítě nebo animace. Napište, co potřebujete, a domluvíme se.',
    price: null,
  },
];

export const bundles = [
  { name: 'Teprve začínám', desc: 'Logo a jednoduchý web', items: ['logo', 'web-simple'] },
  { name: 'Chci silnou značku', desc: 'Identita, logo a větší web', items: ['logo', 'identity', 'web-big'] },
  { name: 'Chci prodávat online', desc: 'E-shop s logem a identitou', items: ['logo', 'identity', 'eshop'] },
];

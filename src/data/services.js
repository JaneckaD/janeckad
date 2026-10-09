// NABÍDKA SLUŽEB – zatím ukázková, ceny a texty si uprav.
//
// services – jednotlivé služby, které si návštěvník může zaškrtat a kombinovat.
//   id       – krátký identifikátor bez mezer (používají ho balíčky níže)
//   group    – do jaké skupiny služba patří (zobrazí se jako nadpis)
//   name     – název služby
//   desc     – jedna věta, co klient dostane
//   price    – cena od (Kč)
//   monthly  – true = platí se měsíčně (správa, hosting…), jinak jednorázově
//
// bundles – hotové kombinace, které jedním klikem zaškrtnou několik služeb.
// discount – sleva při kombinaci více služeb (minItems = od kolika jednorázových služeb).

export const services = [
  { id: 'web-one', group: 'Web', name: 'Jednostránkový web', desc: 'Vizitka na internetu: kdo jste, co nabízíte a jak vás najít.', price: 9000 },
  { id: 'web-multi', group: 'Web', name: 'Web s více stránkami', desc: 'Pro firmy, které potřebují služby, reference, ceník a blog zvlášť.', price: 18000 },
  { id: 'eshop', group: 'Web', name: 'Jednoduchý e-shop', desc: 'Pár desítek produktů, platba kartou a přehled objednávek.', price: 28000 },

  { id: 'logo', group: 'Grafika', name: 'Logo', desc: 'Dva až tři návrhy, ze kterých doladíme jeden. Dostanete ho ve všech formátech.', price: 5000 },
  { id: 'identity', group: 'Grafika', name: 'Vizuální identita', desc: 'Barvy, písma a pravidla, aby vše od webu po vizitku vypadalo jednotně.', price: 7000 },
  { id: 'print', group: 'Grafika', name: 'Tiskoviny', desc: 'Vizitky, letáky, plakáty nebo menu připravené pro tiskárnu.', price: 2000 },
  { id: 'social', group: 'Grafika', name: 'Šablony pro sociální sítě', desc: 'Sada šablon, do kterých si příspěvky snadno doplníte sami.', price: 3000 },

  { id: 'seo', group: 'Navíc', name: 'Základní SEO', desc: 'Aby vás Google našel: texty, rychlost a zápis do map.', price: 3000 },
  { id: 'copy', group: 'Navíc', name: 'Texty na web', desc: 'Napíšu texty, které lidem jasně řeknou, proč zrovna vy.', price: 2500 },
  { id: 'care', group: 'Navíc', name: 'Správa a drobné úpravy', desc: 'Aktualizace, zálohy a změny obsahu, když je potřebujete.', price: 800, monthly: true },
];

export const bundles = [
  { name: 'Start', desc: 'Pro začínající podnikatele', items: ['logo', 'web-one'] },
  { name: 'Značka', desc: 'Pro ty, kdo chtějí vypadat jednotně', items: ['logo', 'identity', 'print', 'social'] },
  { name: 'Komplet', desc: 'Web, značka i péče', items: ['logo', 'identity', 'web-multi', 'seo', 'copy', 'care'] },
];

export const discount = { minItems: 3, percent: 10 };

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
//   includes  – (volitelné) co přesně klient dostane; u služby se pak ukáže ikonka „i“ s okénkem
//   excludes  – (volitelné) služby, které s touto nejdou dohromady; zaškrtnutím se odškrtnou
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
    excludes: ['identity'],
    includes: [
      'Logo ve všech variantách: hlavní, na výšku, razítko, samotný nápis, symbol bez textu a ikona',
      'Světlé i inverzní verze pro tmavé pozadí',
      'Soubory SVG pro tisk i web a PNG s průhledným pozadím',
      'Barvy loga s přesnými kódy',
      'Prezentace v PDF, kde je logo hezky pohromadě',
    ],
  },
  {
    id: 'identity',
    group: 'grafika',
    name: 'Vizuální identita',
    desc: 'Celá značka včetně loga: barvy, písma a pravidla, díky kterým bude web, vizitka i příspěvek vypadat jednotně.',
    price: 3990,
    excludes: ['logo'],
    includes: [
      'Logo ve všech variantách: hlavní, na výšku, razítko, samotný nápis, symbol bez textu a ikona',
      'Několik barevných kombinací s přesnými kódy barev',
      'Soubory SVG pro tisk i web a PNG s průhledným pozadím',
      'Výběr písem, která jsou zdarma i pro komerční použití',
      'Vzor, třeba na balicí papír, tašky nebo obaly',
      'Ukázky značky v praxi: vizitky, obaly, výloha nebo menu podle vašeho oboru',
      'Prezentace v PDF, kde je celá identita pohromadě',
    ],
  },
  {
    id: 'social',
    group: 'grafika',
    name: 'Šablony pro sociální sítě',
    desc: 'Sada šablon na příspěvky a stories ve stylu vaší značky. Stačí vyměnit text a fotku a můžete posílat ven.',
    price: 3990,
  },
  {
    id: 'graphics-other',
    group: 'grafika',
    name: 'Jiná grafika',
    desc: 'Plakáty, letáky, jednotlivé příspěvky nebo animace. Napište, co potřebujete, a domluvíme se.',
    price: null,
  },
];

export const bundles = [
  { name: 'Teprve začínám', desc: 'Logo a jednoduchý web', items: ['logo', 'web-simple'] },
  { name: 'Chci silnou značku', desc: 'Identita s logem a větší web', items: ['identity', 'web-big'] },
  { name: 'Chci prodávat online', desc: 'E-shop s identitou a logem', items: ['identity', 'eshop'] },
];

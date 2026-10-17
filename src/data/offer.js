// CO DĚLÁM A CO KLIENT DOSTANE – dvě sekce na hlavní stránce.
// Při sestavení se vloží přímo do HTML (vite.seo.js), ceny se berou ze services.js.

// areas – sekce „Co pro vás udělám“
//   title    – název oboru
//   text     – jedna až dvě věty, co to je
//   items    – konkrétní věci, které v tom oboru dělám
//   services – id služeb ze services.js; ukáže se nejnižší cena z nich („od …“)
//   art      – kresbička vlevo: web, brand, social, print
export const areas = [
  {
    title: 'Weby',
    art: 'web',
    text: 'Od jednoduché stránky o vaší firmě po e-shop s vlastní administrací. Navrhnu, naprogramuju a spustím na vaší doméně.',
    items: ['Jednostránkový web', 'Větší web s administrací', 'E-shop na míru', 'Úpravy pro Google'],
    services: ['web-simple', 'web-big', 'eshop'],
  },
  {
    title: 'Loga a identity',
    art: 'brand',
    text: 'Značka, kterou si lidé zapamatují. Samotné logo, nebo celá identita s barvami, písmem a vzorem.',
    items: ['Logo ve všech verzích', 'Barvy a písma', 'Vzor na obaly', 'Prezentace v PDF'],
    services: ['logo', 'identity'],
  },
  {
    title: 'Sociální sítě',
    art: 'social',
    text: 'Šablony v barvách vaší značky. Vyměníte text a fotku a příspěvek je hotový, profil drží jednotný styl.',
    items: ['Šablona příspěvku', 'Šablona příběhu', 'Ikony do výběrů', 'Příspěvky na rozjezd'],
    services: ['social'],
  },
  {
    title: 'Tisk a další grafika',
    art: 'print',
    text: 'Všechno, co se tiskne nebo hýbe: plakát na akci, leták do schránek, jednotlivý příspěvek nebo krátká animace.',
    items: ['Plakáty', 'Letáky', 'Jednotlivé příspěvky', 'Animace'],
    services: ['graphics-other'],
  },
];

// handover – sekce „Co ode mě dostanete“ (záložky)
//   label   – název záložky
//   services – id služeb ze services.js, ze kterých se převezme seznam „includes“ a cena
//              (u dalších služeb se k bodu připíše, ke které patří)
//   folder  – co leží v předávací složce: name = název souboru nebo věci, kind = svg / png / pdf / web / device / login / mail
export const handover = [
  {
    label: 'Web',
    services: ['web-simple', 'web-big'],
    lead: 'Hotový web běží na vaší adrese a vy k němu máte všechny přístupy.',
    folder: [
      { name: 'vasefirma.cz', kind: 'web', note: 'web na vaší doméně' },
      { name: 'Mobil i počítač', kind: 'device', note: 'vyladěné pro obojí' },
      { name: 'Administrace', kind: 'login', note: 'obsah si měníte sami' },
      { name: 'Kontaktní formulář', kind: 'mail', note: 'zprávy chodí na e-mail' },
    ],
  },
  {
    label: 'Logo a identita',
    services: ['identity'],
    lead: 'Dostanete složku se vším, co pro značku budete kdy potřebovat, a přehlednou prezentaci.',
    folder: [
      { name: 'logo-hlavni.svg', kind: 'svg', note: 'pro tisk i web' },
      { name: 'logo-ikona.png', kind: 'png', note: 'průhledné pozadí' },
      { name: 'barvy-a-pisma.pdf', kind: 'pdf', note: 'přesné kódy barev' },
      { name: 'prezentace.pdf', kind: 'pdf', note: 'celá identita pohromadě' },
    ],
  },
  {
    label: 'Sociální sítě',
    services: ['social'],
    lead: 'Šablony, do kterých jen vložíte text a fotku, a pár hotových příspěvků na rozjezd.',
    folder: [
      { name: 'sablona-prispevek', kind: 'png', note: 'na příspěvky do feedu' },
      { name: 'sablona-pribeh', kind: 'png', note: 'na příběhy (stories)' },
      { name: 'ikony-vyberu', kind: 'svg', note: 'pro zvýraznění na profilu' },
      { name: 'prispevky-na-start', kind: 'png', note: 'dva hotové příspěvky' },
    ],
  },
];

// promises – proužek pod záložkami: co platí u každé zakázky
export const promises = [
  { title: 'Nejdřív návrh', text: 'Než začnu programovat nebo kreslit načisto, uvidíte návrh a můžete ho připomínkovat.' },
  { title: 'Všechno je vaše', text: 'Soubory, doména i přístupy patří vám. Nejste na mně závislí.' },
  { title: 'Jeden člověk', text: 'Web i grafiku dělám sám, takže na sebe všechno navazuje a nikdo si nic nepřehazuje.' },
  { title: 'Rychlá odpověď', text: 'Na zprávu odpovím nejpozději druhý den.' },
];

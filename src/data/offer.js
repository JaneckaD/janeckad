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
//   label    – název záložky
//   services – id služeb ze services.js, ze kterých se převezme seznam „includes“ a cena
//              (u dalších služeb se k bodu připíše, ke které patří)
//   lead     – jedna věta nad seznamem
//   swatches – (volitelné) ukázka barevných kombinací loga: [pozadí, barva značky]
//   folder   – předávací složka: podsložky (name, note, files) a v nich soubory
//              kind = svg / png / pdf / web / device / login / mail / link
export const handover = [
  {
    label: 'Web',
    services: ['web-simple', 'web-big'],
    lead: 'Hotový web běží na vaší adrese a vy k němu máte všechny přístupy. Nic nezůstává jen u mě.',
    folder: [
      {
        name: 'web', note: 'běží na vaší doméně',
        files: [
          { name: 'vasefirma.cz', kind: 'web', note: 'hotový web' },
          { name: 'Mobil, tablet i počítač', kind: 'device', note: 'vyladěné pro všechno' },
          { name: 'Kontaktní formulář', kind: 'mail', note: 'zprávy chodí na váš e-mail' },
        ],
      },
      {
        name: 'pristupy', note: 'všechno patří vám',
        files: [
          { name: 'Administrace', kind: 'login', note: 'obsah si měníte sami' },
          { name: 'Doména a hosting', kind: 'login', note: 'vedené na vás' },
          { name: 'zdrojove-kody.zip', kind: 'zip', note: 'celý web v jednom' },
        ],
      },
      {
        name: 'zaskoleni', note: 'ať se v tom vyznáte',
        files: [
          { name: 'Ukázka administrace', kind: 'user', note: 'projdeme ji spolu' },
        ],
      },
    ],
  },
  {
    label: 'Logo a identita',
    services: ['identity'],
    lead: 'Dostanete složku se vším, co pro značku budete kdy potřebovat: logo v několika kombinacích, grafiku pro web i tisk a přehlednou prezentaci.',
    swatches: [
      ['#0f172a', '#ffffff', 'Na tmavé'],
      ['#ffffff', '#0f172a', 'Na světlé'],
      ['#2563eb', '#ffffff', 'Hlavní barva'],
      ['#f4efe6', '#ea580c', 'Doplňková'],
    ],
    folder: [
      {
        name: '01-logo', note: '6 verzí × 4 barevné kombinace',
        files: [
          { name: 'hlavni, na-vysku, napis', kind: 'svg', note: 'každá verze zvlášť' },
          { name: 'symbol, ikona, razitko', kind: 'svg', note: 'na malá místa' },
          { name: 'barevne, cerne, bile', kind: 'png', note: 'průhledné pozadí' },
        ],
      },
      {
        name: '02-barvy-a-pisma', note: 'aby všechno ladilo',
        files: [
          { name: 'barvy.pdf', kind: 'pdf', note: 'kódy HEX, RGB i CMYK' },
          { name: 'pisma', kind: 'link', note: 'zdarma i pro firmy' },
        ],
      },
      {
        name: '03-grafika', note: 'připravené k použití',
        files: [
          { name: 'vizitka', kind: 'pdf', note: 'tisková data' },
          { name: 'bannery', kind: 'png', note: 'web, Facebook, Instagram' },
          { name: 'profilovka', kind: 'png', note: 'pro všechny sítě' },
          { name: 'vzor', kind: 'svg', note: 'na obaly a tašky' },
          { name: 'ukazky-v-praxi', kind: 'png', note: 'obaly, výloha, menu' },
        ],
      },
      {
        name: '04-prezentace', note: 'celá značka pohromadě',
        files: [
          { name: 'prezentace-identity.pdf', kind: 'pdf', note: 'jak značku používat' },
        ],
      },
    ],
  },
  {
    label: 'Sociální sítě',
    services: ['social'],
    lead: 'Šablony, do kterých jen vložíte text a fotku, a pár hotových příspěvků, aby profil od prvního dne vypadal hotově.',
    folder: [
      {
        name: 'sablony', note: 'vyměníte text a fotku',
        files: [
          { name: 'prispevek', kind: 'png', note: 'na příspěvky do feedu' },
          { name: 'pribeh', kind: 'png', note: 'na příběhy (stories)' },
          { name: 'zdrojove-soubory', kind: 'zip', note: 'Photoshop nebo Figma' },
        ],
      },
      {
        name: 'profil', note: 'aby působil jednotně',
        files: [
          { name: 'ikony-vyberu', kind: 'png', note: 'zvýraznění na profilu' },
          { name: 'pribehy-do-vyberu', kind: 'png', note: 'profil nebude prázdný' },
        ],
      },
      {
        name: 'na-start', note: 'hned můžete posílat ven',
        files: [
          { name: 'prispevek-1, prispevek-2', kind: 'png', note: 'dva hotové příspěvky' },
        ],
      },
    ],
  },
];

// promises – proužek pod záložkami: co platí u každé zakázky
export const promises = [
  { title: 'Nejdřív návrh', text: 'Než začnu programovat nebo kreslit načisto, uvidíte návrh a můžete ho připomínkovat.' },
  { title: 'Všechno je vaše', text: 'Soubory, doména i přístupy patří vám. Nejste na mně závislí.' },
  { title: 'Jeden člověk', text: 'Web i grafiku dělám sám, takže na sebe všechno navazuje a nikdo si nic nepřehazuje.' },
  { title: 'Cena předem', text: 'Cenu znáte dřív, než začnu. Žádné skryté poplatky navíc.' },
];

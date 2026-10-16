// PORTFOLIO
// Každý projekt je jeden objekt. Nový projekt přidáš zkopírováním bloku.
//
//   title       – název projektu
//   category    – krátké zařazení (Web, Logo a identita, …)
//   year        – rok
//   description – 1–2 věty, co jsi dělal a proč
//   cover       – náhledový obrázek, např. 'portfolio/muj-projekt.jpg' (soubory dávej do složky public/portfolio/)
//   link        – (volitelné) adresa hotového webu; karta pak vede rovnou na něj
//   gallery     – (volitelné) seznam obrázků; karta pak po kliknutí otevře galerii
//                 u obrázku jde doplnit credit (autor fotky) a creditUrl (odkaz na originál)
//   type        – 'web' nebo 'grafika' (podle toho se filtruje na stránce Portfolio)
//   featured    – true = projekt se ukáže i na hlavní stránce; ostatní jsou jen na stránce /portfolio
//
// Pořadí v seznamu = pořadí na webu.
// Když vyplníš link i gallery, otevře se galerie a v ní bude tlačítko na web.
// Obrázky můžou být .jpg, .png, .webp i .svg. Ideální poměr stran je 3 : 2.

export const projects = [
  {
    title: 'Ricci jídlo',
    category: 'Web a objednávky na míru',
    type: 'web',
    featured: true,
    year: 2026,
    description: 'Web pro rozvoz jídla s vlastním objednávkovým systémem. Majitel si v administraci spravuje menu, obsah webu i role týmu a každá restaurace má vlastní přístup ke svým objednávkám.',
    cover: 'portfolio/ricci-cover.jpg',
    link: 'https://riccijidlo.cz',
    gallery: [
      { src: 'portfolio/ricci-cover.jpg', alt: 'Úvodní stránka s vyhledáním restaurace podle adresy' },
      { src: 'portfolio/ricci-detail.jpg', alt: 'Stránka restaurace s menu a košíkem' },
      { src: 'portfolio/ricci-list.jpg', alt: 'Přehled restaurací s filtry a otevírací dobou' },
      { src: 'portfolio/ricci-admin.jpg', alt: 'Administrace na míru: směny kurýrů, role a newsletter' },
      { src: 'portfolio/ricci-dashboard.jpg', alt: 'Statistiky tržeb a objednávek v administraci' },
    ],
  },
  {
    title: 'Jídelna Otrokovice',
    category: 'Vizuální identita',
    type: 'grafika',
    featured: true,
    year: 2026,
    description: 'Identita pro jídelnu, která každý den vaří a menu rozváží po Otrokovicích. Znak JO spojuje naběračku a talíř: polévka v naběračce i porce na talíři mají stejný tvar, protože je to pořád to samé jídlo na cestě z kuchyně až k zákazníkovi. Klient dostal logo s textem i bez něj, dvě barevné kombinace, vzor, šablonu denního menu a podklady pro tisk, všechno v jedné prezentaci.',
    cover: 'portfolio/jo-cover.jpg',
    gallery: [
      { src: 'portfolio/jo-logo.jpg', alt: 'Logo Jídelna Otrokovice' },
      { src: 'portfolio/jo-konstrukce.jpg', alt: 'Znak JO postavený na mřížce: naběračka a talíř' },
      { src: 'portfolio/jo-barvy.jpg', alt: 'Barvy: tmavě modrá, vínová a bílá' },
      { src: 'portfolio/jo-varianty.jpg', alt: 'Logo s textem, na výšku a razítko' },
      { src: 'portfolio/jo-pismo.jpg', alt: 'Písma Unbounded a DM Sans' },
      { src: 'portfolio/jo-vzor.jpg', alt: 'Vzor na obaly, tašky a výlohu' },
      { src: 'portfolio/jo-menu.jpg', alt: 'Šablona denního menu na sociální sítě' },
      { src: 'portfolio/jo-budova.jpg', alt: 'Štít na budově', credit: 'Foto: Taber Andrew Bain, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/andrewbain/2643614107' },
      { src: 'portfolio/jo-vyloha.jpg', alt: 'Polepená výloha', credit: 'Foto: Taber Andrew Bain, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/andrewbain/521838106' },
      { src: 'portfolio/jo-auto.jpg', alt: 'Rozvozové auto', credit: 'Foto: Step, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/stepnout/278392481/' },
      { src: 'portfolio/jo-billboard.jpg', alt: 'Billboard', credit: 'Foto: Mikey, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/raver_mikey/4076629366' },
      { src: 'portfolio/jo-plakat.jpg', alt: 'Plakát na ulici', credit: 'Foto: FaceMePLS, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/faceme/5458375646' },
      { src: 'portfolio/jo-vizitky.jpg', alt: 'Vizitky a krabička s razítkem', credit: 'Foto: YOU & I tee, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/youanditee/4340318836' },
      { src: 'portfolio/jo-krabicky.jpg', alt: 'Nálepky na krabičkách s jídlem', credit: "Foto: Paul O'Mahony, Flickr, CC BY 2.0", creditUrl: 'https://www.flickr.com/photos/omaniblog/4180840303' },
      { src: 'portfolio/jo-papir.jpg', alt: 'Hlavičkový papír', credit: 'Foto: thomasesmith, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/tomsmithjr/2357837295/' },
      { src: 'portfolio/jo-taska.jpg', alt: 'Plátěná taška', credit: 'Foto: Open Knowledge, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/okfn/8670535917' },
    ],
  },
  {
    title: 'Park café',
    category: 'Vizuální identita, zkušební zakázka',
    type: 'grafika',
    featured: true,
    year: 2026,
    description: 'Tohle není skutečný klient, ale zkušební zakázka, na které ukazuju, jak identita ode mě vypadá. Pekárna a kavárna dostala logo ve všech variantách, pět barevných kombinací, písma, vzor na obaly a ukázky na vizitkách, kelímcích, taškách i výloze. Všechno je pohromadě v prezentaci, kterou dostane každý klient.',
    cover: 'portfolio/park-vizitky.jpg',
    gallery: [
      { src: 'portfolio/park-logo.jpg', alt: 'Logo Park café' },
      { src: 'portfolio/park-koncept.jpg', alt: 'Koncept: strom, který voní chlebem' },
      { src: 'portfolio/park-barvy.jpg', alt: 'Pět teplých barevných kombinací' },
      { src: 'portfolio/park-varianty.jpg', alt: 'Varianty loga s textem, razítko a inverzní verze' },
      { src: 'portfolio/park-vizitky.jpg', alt: 'Vizitky' },
      { src: 'portfolio/park-kelimky.jpg', alt: 'Kelímky na kávu' },
      { src: 'portfolio/park-tasky.jpg', alt: 'Papírové tašky' },
      { src: 'portfolio/park-vyloha.jpg', alt: 'Výloha a stojan před kavárnou' },
      { src: 'portfolio/park-krabice.jpg', alt: 'Krabice na zákusky a nálepky' },
      { src: 'portfolio/park-menu.jpg', alt: 'Menu a cenovky' },
      { src: 'portfolio/park-vzor.jpg', alt: 'Vzor na balicí papír a tašky' },
      { src: 'portfolio/park-pismo.jpg', alt: 'Písma identity' },
    ],
  },
];

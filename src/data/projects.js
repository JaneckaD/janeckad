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
//
// Když vyplníš link i gallery, otevře se galerie a v ní bude tlačítko na web.
// Obrázky můžou být .jpg, .png, .webp i .svg. Ideální poměr stran je 3 : 2.

export const projects = [
  {
    title: 'Ricci jídlo',
    category: 'Web a objednávky na míru',
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
    title: 'Park café',
    category: 'Vizuální identita, zkušební zakázka',
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

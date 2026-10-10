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
    title: 'Kavárna U Mlýna',
    category: 'Web',
    year: 2026,
    description: 'Jednostránkový web s denním menu, které si majitelka sama mění z tabulky.',
    cover: 'portfolio/kavarna-1.svg',
    link: 'https://example.com',
    gallery: [
      { src: 'portfolio/kavarna-1.svg', alt: 'Úvodní stránka kavárny' },
      { src: 'portfolio/kavarna-2.svg', alt: 'Nabídka kávy a dezertů' },
      { src: 'portfolio/kavarna-3.svg', alt: 'Sekce s rezervací' },
    ],
  },
  {
    title: 'Studio Forma',
    category: 'Logo a identita',
    year: 2026,
    description: 'Logo, barvy a sada šablon pro sociální sítě pro malé architektonické studio.',
    cover: 'portfolio/studio-forma-1.svg',
    gallery: [
      { src: 'portfolio/studio-forma-1.svg', alt: 'Logo Studia Forma' },
      { src: 'portfolio/studio-forma-2.svg', alt: 'Vizitky' },
      { src: 'portfolio/studio-forma-3.svg', alt: 'Barevná paleta' },
    ],
  },
  {
    title: 'Pekárna od rána',
    category: 'Grafika',
    year: 2025,
    description: 'Obaly, cenovky a plakát k otevření nové pobočky.',
    cover: 'portfolio/pekarna-1.svg',
    gallery: [
      { src: 'portfolio/pekarna-1.svg', alt: 'Logo pekárny' },
      { src: 'portfolio/pekarna-2.svg', alt: 'Cenovky' },
      { src: 'portfolio/pekarna-3.svg', alt: 'Barevný systém' },
    ],
  },
  {
    title: 'Trénink s Kubou',
    category: 'Web',
    year: 2025,
    description: 'Web pro osobního trenéra s rezervací tréninků a přehledem balíčků.',
    cover: 'portfolio/trenink-1.svg',
    link: 'https://example.com',
  },
];

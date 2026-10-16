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
// Volitelně u projektu jde v galerii ukázat i celý postup (jako u SPOJ):
//   steps        – kroky { title, text, from }; from = číslo obrázku v galerii, kde krok začíná (od 0)
//   includes     – co klient dostane (seznam)
//   presentation – { title, text, pages: [...] } co je v prezentaci pro klienta
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
    title: 'SPOJ betonové ploty',
    category: 'Vizuální identita',
    type: 'grafika',
    featured: true,
    year: 2026,
    description: 'Identita pro firmu, která staví skládané betonové ploty. Jednobarevný abstraktní znak ze tří desek, které do sebe zapadají na pero a drážku, přesně jako skutečný plot. Žádná písmena ani domeček, jen spoj, který drží.',
    cover: 'portfolio/spoj-cover.jpg',
    steps: [
      { title: 'Tři směry', from: 0, text: 'Na začátku jsem připravil tři různé koncepty znaku a vyzkoušel je ve velikostech od 64 do 16 px: Spoj (desky na pero a drážku), Tuhnutí (vlna tekutého betonu) a Ohrada (desky kolem kruhu).' },
      { title: 'Pero a drážka', from: 1, text: 'Dál jsem rozvinul Spoj: tři betonové desky do sebe zapadají jako skutečné plotové dílce. Znak stojí na přesné mřížce, takže drží tvar v každé velikosti.' },
      { title: 'Verze loga', from: 4, text: 'Logo s textem, na výšku, samotný znak, kulatá samolepka i ikona aplikace. Vždy jen v jedné barvě: jedlové, bílé nebo černé. K tomu ochranná zóna a nejmenší velikost, aby se logo nikde nedeformovalo.' },
      { title: 'Barvy, písmo a vzor', from: 8, text: 'Čtyři barvy (Jedle, Beton, Písek a Grafit) s kódy pro web i tisk, písmo Archivo, vzor z desek a spár a šest piktogramů pro nabídku na webu.' },
      { title: 'Web a sítě', from: 12, text: 'Ukázka, jak značka vypadá na webu a na sociálních sítích, a hotové ikony: favicon, ikona aplikace i profilová fotka.' },
      { title: 'V praxi', from: 13, text: 'Devět ukázek na reálných fotkách: dodávka, cedule na stavbě, zeď areálu, vesta, helma, vizitky, hlavičkový papír, billboard a plakát.' },
    ],
    includes: [
      'Logo ve třech barevných verzích, v SVG pro tisk i web a v PNG s průhledným pozadím',
      'Logo s textem, na výšku, samotný znak a kulatá samolepka',
      'Ikony pro web: favicon, ikona aplikace a ikony od 16 do 512 px',
      'Barvy s kódy HEX, RGB a CMYK',
      'Písma, která jsou zdarma i pro komerční použití',
      'Vzor a šest piktogramů',
      'Pravidla: ochranná zóna a nejmenší velikost loga',
      'Devět ukázek použití na reálných fotkách',
      'Prezentaci v PDF, kde je všechno pohromadě',
    ],
    presentation: {
      title: 'Co je v prezentaci',
      text: '22 stran v PDF. Klient ji může rovnou poslat tiskárně, polepovně aut nebo webaři.',
      pages: ['Logo', 'Tři směry', 'Pero a drážka', 'Konstrukce na mřížce', 'Barvy', 'Logo s textem', 'Jednobarevné verze', 'Znak a ikona', 'Ochranná zóna a pravidla', 'Písmo', 'Vzor', 'Piktogramy', 'Web a sociální sítě', '9 ukázek v praxi'],
    },
    gallery: [
      { src: 'portfolio/spoj-smery.jpg', alt: 'Tři směry znaku: Spoj, Tuhnutí a Ohrada' },
      { src: 'portfolio/spoj-koncept.jpg', alt: 'Koncept: desky na pero a drážku' },
      { src: 'portfolio/spoj-logo.jpg', alt: 'Logo SPOJ betonové ploty' },
      { src: 'portfolio/spoj-konstrukce.jpg', alt: 'Znak postavený na mřížce' },
      { src: 'portfolio/spoj-varianty.jpg', alt: 'Logo s textem, na výšku a kulatá samolepka' },
      { src: 'portfolio/spoj-jednobarevne.jpg', alt: 'Jedlová, bílá a černá verze' },
      { src: 'portfolio/spoj-ikona.jpg', alt: 'Samotný znak a ikona aplikace' },
      { src: 'portfolio/spoj-pravidla.jpg', alt: 'Ochranná zóna a co s logem nedělat' },
      { src: 'portfolio/spoj-barvy.jpg', alt: 'Barvy: Jedle, Beton, Písek a Grafit' },
      { src: 'portfolio/spoj-pismo.jpg', alt: 'Písmo Archivo' },
      { src: 'portfolio/spoj-vzor.jpg', alt: 'Vzor z desek a spár' },
      { src: 'portfolio/spoj-piktogramy.jpg', alt: 'Piktogramy pro nabídku' },
      { src: 'portfolio/spoj-web.jpg', alt: 'Web a sociální sítě' },
      { src: 'portfolio/spoj-dodavka.jpg', alt: 'Dodávka', credit: 'Foto: Flickr uživatel 78170556@N08, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/78170556@N08/7166257498' },
      { src: 'portfolio/spoj-cedule.jpg', alt: 'Cedule na stavbě', credit: 'Foto: Bart Everson, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/editor/48890791' },
      { src: 'portfolio/spoj-zed.jpg', alt: 'Logo na zdi areálu', credit: 'Foto: Kim Ruben, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/41572124@N06/3835879845/' },
      { src: 'portfolio/spoj-vesta.jpg', alt: 'Reflexní vesta', credit: 'Foto: Jordon B, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/113286431@N02/11746247844' },
      { src: 'portfolio/spoj-helma.jpg', alt: 'Helma', credit: 'Foto: marc falardeau, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/49889874@N05/4969063262' },
      { src: 'portfolio/spoj-vizitky.jpg', alt: 'Vizitky a nálepka', credit: 'Foto: YOU & I tee, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/youanditee/4340318836' },
      { src: 'portfolio/spoj-papir.jpg', alt: 'Hlavičkový papír', credit: 'Foto: thomasesmith, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/tomsmithjr/2357837295/' },
      { src: 'portfolio/spoj-billboard.jpg', alt: 'Billboard', credit: 'Foto: Mikey, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/raver_mikey/4076629366' },
      { src: 'portfolio/spoj-plakat.jpg', alt: 'Plakát na ulici', credit: 'Foto: FaceMePLS, Flickr, CC BY 2.0', creditUrl: 'https://www.flickr.com/photos/faceme/5458375646' },
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
    featured: false,
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

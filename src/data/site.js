// Základní údaje o tobě – uprav podle sebe.
export const site = {
  name: 'David Janečka',
  brand: 'David Janečka',
  role: 'Webař a grafik',
  // Adresa webu: používá se pro vyhledávače (canonical, mapa webu, strukturovaná data)
  url: 'https://davix.cz',
  skills: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'PHP', 'Photoshop', 'Illustrator', 'After Effects', 'Figma'],
  // Kontaktní e-mail. Na něj chodí i zprávy z formuláře (přes službu FormSubmit.co, zdarma).
  // Po první odeslané zprávě přijde e-mail „Activate Form“ – stačí v něm jednou kliknout na tlačítko.
  email: 'djanecka6@gmail.com',
  // Telefon: zobrazí se v patičce a u kontaktu (phoneHref je stejné číslo bez mezer pro odkaz tel:)
  phone: '+420 737 402 473',
  phoneHref: '+420737402473',
  // Tip: po aktivaci pošle FormSubmit náhodný kód. Když ho dáš sem, e-mail nebude vidět v kódu odesílání.
  formTarget: '',
  // Sociální sítě v patičce. Dokud je url prázdné, ukáže se ikonka s popiskem „brzy“.
  // Až budeš mít profil, stačí doplnit adresu, třeba url: 'https://instagram.com/tvujprofil'.
  socials: [
    { label: 'Instagram', icon: 'instagram', url: '' },
    { label: 'LinkedIn', icon: 'linkedin', url: '' },
  ],
};

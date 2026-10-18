# Osobní web – David, webař a grafik

Web s vybranými pracemi, skládačkou služeb s orientační cenou a samostatnou stránkou `/portfolio/` se všemi projekty.
Postavený na [Vite](https://vitejs.dev), bez dalších knihoven.

## Spuštění na localhostu (Windows)

Potřebuješ [Node.js](https://nodejs.org) (verze LTS). Pak v terminálu:

```bash
git clone https://github.com/JaneckaD/janeckad.git
cd janeckad
git checkout claude/personal-website-b5uqoc
npm install
npm run dev
```

Web se otevře v prohlížeči na `http://localhost:5173`. Změny v souborech se projeví hned.

- `npm run build` – připraví hotový web do složky `dist/`
- `npm run preview` – ukáže hotový build lokálně

## Kde co upravit

| Co | Soubor |
| --- | --- |
| Jméno, e-mail, sociální sítě (na e-mail chodí i zprávy z formuláře přes FormSubmit.co) | `src/data/site.js` |
| Projekty v portfoliu | `src/data/projects.js` |
| Časté otázky | `src/data/faq.js` |
| Sekce „Co pro vás udělám“ a „Co ode mě dostanete“ | `src/data/offer.js` (ceny a seznamy se berou ze `services.js`) |
| Obrázky projektů | složka `public/portfolio/` |
| Služby, ceny, rychlé volby | `src/data/services.js` |
| Texty sekcí | `index.html` (hlavní stránka), `portfolio/index.html` (stránka Portfolio) |
| Barvy a písma | začátek `src/style.css` |

### Nová verze webu (na zkoušku)

Na adrese **/nova-verze/** běží přepracovaný světlý vzhled (odkaz „Nová verze“ je dole v patičce).
Obsah bere ze stejných souborů v `src/data/`, takže ceny, projekty i otázky jsou všude stejné.

| Co | Soubor |
| --- | --- |
| Texty sekcí | `nova-verze/index.html`, `nova-verze/portfolio/index.html` |
| Barvy obou variant (A Mlha a korál, B Levandule a indigo) a písma | začátek `src/v2/style.css` |
| Tenké ikonky | `src/v2/icons.js` (Lucide) |
| Malé náhledy v úvodní koláži | `public/nova-verze/nahled/` (webp, 800 px; když chybí, vezme se obálka projektu) |

Barevnou variantu jde vybrat přepínačem dole na stránce nebo v adrese: `?barvy=a` / `?barvy=b`.
Vyhledávače novou verzi zatím neindexují (noindex), aby se nepletla s hlavní stránkou.

### Přidání projektu

Do `src/data/projects.js` zkopíruj jeden blok a uprav ho. Když vyplníš `link`, karta vede rovnou na web.
Když vyplníš `gallery`, karta otevře galerii (a pokud je i `link`, v galerii bude tlačítko na web).

Každý projekt je na stránce Portfolio. Na hlavní stránce jsou jen ty, které mají `featured: true`.
Podle `type` (`'web'` nebo `'grafika'`) se na stránce Portfolio filtruje.

Obrázky dávej do `public/portfolio/`, ideálně JPG v poměru 3 : 2 (třeba 1800 × 1200 px).

## Zveřejnění na internetu (GitHub Pages)

Web se nasazuje automaticky: po každém nahrání změn do větve `claude/personal-website-b5uqoc`
ho GitHub sám sestaví a zveřejní na **https://davix.cz** (dřív https://janeckad.github.io/janeckad/,
ta adresa teď přesměruje na doménu).
Postup je v souboru `.github/workflows/deploy.yml`, průběh uvidíš na GitHubu v záložce **Actions**.

Jednorázově je potřeba v repozitáři zapnout Pages: **Settings → Pages → Source: GitHub Actions**.
Doména se nastavuje tamtéž v poli **Custom domain** (`davix.cz`), pak zaškrtnout **Enforce HTTPS**.
DNS u Wedosu: 4× záznam A na 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
a CNAME `www` na `janeckad.github.io`.

Web používá relativní cesty, takže stejný build funguje na doméně i v podsložce na github.io.

## SEO (vyhledávače)

Většinu dělá sestavení webu samo (`vite.seo.js`), takže stačí upravovat texty a data:

- **Titulek a popis stránky** pro Google jsou v `<title>` a `<meta name="description">` v `index.html` a `portfolio/index.html`.
  Z nich se odvodí i náhled při sdílení na Facebooku, WhatsAppu a jinde (obrázky jsou v `public/og/`).
- **Strukturovaná data** (kdo jsi, kde působíš, služby s cenami, projekty, časté otázky) se skládají z `src/data/`.
  Adresa webu a město jsou v `src/data/site.js`.
- **Karty projektů a časté otázky** se vkládají přímo do HTML, takže je vyhledávače vidí i bez JavaScriptu.
- **`sitemap.xml` a `robots.txt`** se vytvoří při každém sestavení.
- Po každém nasazení se změny ohlásí přes IndexNow (Seznam, Bing). Klíč je soubor `public/*.txt`, nemaž ho.
- Písma jsou uložená ve `src/fonts/`, web je nestahuje od Googlu.

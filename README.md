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
| Obrázky projektů | složka `public/portfolio/` |
| Služby, ceny, rychlé volby | `src/data/services.js` |
| Texty sekcí | `index.html` (hlavní stránka), `portfolio/index.html` (stránka Portfolio) |
| Barvy a písma | začátek `src/style.css` |

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

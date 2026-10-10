# Osobní web – David, webař a grafik

Jednostránkový web s portfoliem, galerií projektů a skládačkou služeb s orientační cenou.
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
| Jméno, e-mail, sociální sítě | `src/data/site.js` |
| Projekty v portfoliu | `src/data/projects.js` |
| Obrázky projektů | složka `public/portfolio/` |
| Služby, ceny, rychlé volby | `src/data/services.js` |
| Texty sekcí | `index.html` |
| Barvy a písma | začátek `src/style.css` |

### Přidání projektu

Do `src/data/projects.js` zkopíruj jeden blok a uprav ho. Když vyplníš `link`, karta vede rovnou na web.
Když vyplníš `gallery`, karta otevře galerii (a pokud je i `link`, v galerii bude tlačítko na web).

Obrázky v portfoliu jsou zatím jen ukázkové.

## Zveřejnění na internetu (GitHub Pages)

Web se nasazuje automaticky: po každém nahrání změn do větve `claude/personal-website-b5uqoc`
ho GitHub sám sestaví a zveřejní na **https://janeckad.github.io/janeckad/**.
Postup je v souboru `.github/workflows/deploy.yml`, průběh uvidíš na GitHubu v záložce **Actions**.

Jednorázově je potřeba v repozitáři zapnout Pages: **Settings → Pages → Source: GitHub Actions**.

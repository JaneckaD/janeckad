// SEO při sestavení webu:
// - do hlavičky každé stránky doplní canonical, náhledy pro sdílení (Open Graph) a strukturovaná data (JSON-LD)
// - karty projektů, časté otázky a sekce Co dělám / Co dostanete vloží rovnou do HTML,
//   aby je vyhledávače viděly i bez JavaScriptu
// - vytvoří sitemap.xml a robots.txt
// - přidá přednostní načtení písem
// - stránce 404 přepíše cesty na absolutní, protože GitHub Pages ji ukazuje na libovolné adrese
import { site } from './src/data/site.js';
import { projects } from './src/data/projects.js';
import { services } from './src/data/services.js';
import { faq } from './src/data/faq.js';
import { areas, handover, promises } from './src/data/offer.js';
import { escapeHtml, projectCards, moreTile } from './src/cards.js';
import { areasMarkup, handoverMarkup, promisesMarkup } from './src/sections.js';

const url = site.url.replace(/\/$/, '');
const abs = (path = '') => url + '/' + path.replace(/^\.?\//, '');
const ld = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// stránky webu: soubor → adresa, obrázek pro sdílení a předpona cest k obrázkům
const PAGES = {
  'index.html': { path: '', image: 'og/davix.jpg', prefix: '' },
  'portfolio/index.html': { path: 'portfolio/', image: 'og/portfolio.jpg', prefix: '../' },
};

const ids = {
  website: abs('#web'),
  business: abs('#davix'),
  person: abs('#david'),
};

const person = {
  '@type': 'Person',
  '@id': ids.person,
  name: site.name,
  jobTitle: site.role,
  url: abs(),
  email: `mailto:${site.email}`,
  knowsAbout: ['Tvorba webových stránek', 'Webdesign', 'Logo', 'Vizuální identita', 'Grafický design', ...site.skills],
  worksFor: { '@id': ids.business },
};

const priceOf = (s) =>
  s.price == null
    ? {}
    : s.priceMax
      ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: s.price, maxPrice: s.priceMax, priceCurrency: 'CZK' } }
      : { price: s.price, priceCurrency: 'CZK' };

const business = {
  '@type': 'ProfessionalService',
  '@id': ids.business,
  name: site.brand,
  alternateName: `${site.brand} – ${site.name}, webař a grafik`,
  description: 'Tvorba webových stránek, e-shopů, log a vizuálních identit pro malé firmy a živnostníky.',
  url: abs(),
  logo: abs('icon-512.png'),
  image: abs('og/davix.jpg'),
  email: site.email,
  founder: { '@id': ids.person },
  areaServed: { '@type': 'Country', name: 'Česko' },
  knowsLanguage: 'cs',
  priceRange: `${Math.min(...services.filter((s) => s.price).map((s) => s.price))}–${Math.max(...services.map((s) => s.priceMax || s.price || 0))} Kč`,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Služby a ceny',
    itemListElement: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, description: s.desc, provider: { '@id': ids.business } },
      ...priceOf(s),
    })),
  },
};

const website = { '@type': 'WebSite', '@id': ids.website, url: abs(), name: site.brand, inLanguage: 'cs', publisher: { '@id': ids.business } };

const creativeWork = (p) => ({
  '@type': 'CreativeWork',
  name: p.title,
  description: p.description,
  genre: p.category,
  dateCreated: String(p.year),
  image: abs(p.cover),
  creator: { '@id': ids.person },
  ...(p.link ? { url: p.link } : {}),
});

function structuredData(file, page, title, description) {
  const webpage = {
    '@type': file === 'portfolio/index.html' ? 'CollectionPage' : 'WebPage',
    '@id': abs(page.path) + '#stranka',
    url: abs(page.path),
    name: title,
    description,
    inLanguage: 'cs',
    isPartOf: { '@id': ids.website },
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(page.image), width: 1200, height: 630 },
  };
  const graph = [website, business, person, webpage];

  if (file === 'index.html') {
    webpage.about = { '@id': ids.business };
    graph.push({
      '@type': 'FAQPage',
      '@id': abs('#otazky'),
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  } else {
    webpage.mainEntity = {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: creativeWork(p) })),
    };
    webpage.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.brand, item: abs() },
        { '@type': 'ListItem', position: 2, name: 'Portfolio', item: abs(page.path) },
      ],
    };
  }
  return ld({ '@context': 'https://schema.org', '@graph': graph });
}

const faqMarkup = () =>
  faq
    .map(
      (f) => `
        <details class="faq__item" data-reveal>
          <summary><h3>${escapeHtml(f.q)}</h3><span class="faq__icon" aria-hidden="true"></span></summary>
          <p>${escapeHtml(f.a)}</p>
        </details>`,
    )
    .join('');

function headTags(file, page, html) {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || site.brand;
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const image = abs(page.image);
  return `
    <link rel="canonical" href="${abs(page.path)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="${escapeHtml(site.name)}" />
    <meta name="theme-color" content="#1f1640" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="cs_CZ" />
    <meta property="og:site_name" content="${escapeHtml(site.brand)}" />
    <meta property="og:url" content="${abs(page.path)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(site.brand)}: weby, loga a vizuální identity" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="manifest" href="/site.webmanifest" />
    ${structuredData(file, page, title, description)}
  `;
}

export default function seo() {
  let root = '';
  return {
    name: 'davix-seo',
    enforce: 'post',
    configResolved(config) {
      root = config.root.replace(/\\/g, '/').replace(/\/$/, '') + '/';
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const file = ctx.filename.replace(/\\/g, '/').replace(root, '');
        const page = PAGES[file];
        if (!page) return html;
        const asset = (src) => page.prefix + src;
        const cards =
          file === 'index.html'
            ? projectCards(projects.filter((p) => p.featured), asset, moreTile(projects.length))
            : projectCards(projects, asset);
        return html
          .replace('</title>', `</title>${headTags(file, page, html)}`)
          .replace('<ul class="work__grid" data-projects></ul>', `<ul class="work__grid" data-projects>${cards}</ul>`)
          .replace('<div class="faq__list" data-faq></div>', `<div class="faq__list" data-faq>${faqMarkup()}</div>`)
          .replace('<ul class="areas__list" data-areas></ul>', `<ul class="areas__list" data-areas>${areasMarkup(areas, services)}</ul>`)
          .replace('<div class="handover__box" data-handover></div>', `<div class="handover__box" data-handover>${handoverMarkup(handover, services)}</div>`)
          .replace('<ul class="promises" data-promises></ul>', `<ul class="promises" data-promises>${promisesMarkup(promises)}</ul>`);
      },
    },
    generateBundle(_, bundle) {
      const today = new Date().toISOString().slice(0, 10);
      const images = (list) =>
        list.map((p) => `\n    <image:image><image:loc>${abs(p.cover)}</image:loc><image:title>${escapeHtml(p.title)}</image:title></image:image>`).join('');
      const urls = Object.values(PAGES)
        .map(
          (page) => `
  <url>
    <loc>${abs(page.path)}</loc>
    <lastmod>${today}</lastmod>${images(page.path ? projects : projects.filter((p) => p.featured))}
  </url>`,
        )
        .join('');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}\n</urlset>\n`,
      });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap.xml')}\n` });

      // písma potřebná hned při načtení stáhne prohlížeč přednostně
      const fonts = Object.keys(bundle).filter((f) => f.endsWith('.woff2'));
      const pages = { 'index.html': './', 'portfolio/index.html': '../', '404.html': './' };
      for (const [file, prefix] of Object.entries(pages)) {
        const html = bundle[file];
        if (!html) continue;
        const preload = fonts.map((f) => `<link rel="preload" href="${prefix}${f}" as="font" type="font/woff2" crossorigin />`).join('\n  ');
        html.source = String(html.source).replace('<link rel="icon"', `${preload}\n  <link rel="icon"`);
      }

      // 404 se zobrazuje na jakékoli adrese, relativní cesty by tam nefungovaly
      const notFound = bundle['404.html'];
      if (notFound) notFound.source = String(notFound.source).replace(/(href|src)="\.\//g, '$1="/');
    },
  };
}

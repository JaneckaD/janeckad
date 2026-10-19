// Nová verze webu: značky sekcí z dat v src/data/.
// Čisté funkce bez prohlížeče, HTML z nich skládá sestavení webu (vite.seo.js).
import { escapeHtml } from '../cards.js';
import { icon } from './icons.js';

const kc = (n) => new Intl.NumberFormat('cs-CZ').format(n).replace(/\s/g, ' ');
const byId = (services, id) => services.find((s) => s.id === id);

const priceFrom = (services, ids) => {
  const list = ids.map((id) => byId(services, id)).filter(Boolean);
  const prices = list.map((s) => s.price).filter((p) => p != null);
  if (!prices.length) return '<small>cena</small> dohodou';
  return `${list.length > 1 ? '<small>od</small> ' : ''}${kc(Math.min(...prices))}&nbsp;Kč`;
};

// ikonka ke každému oboru (art v offer.js)
const areaIcon = { web: 'monitorSmartphone', brand: 'penTool', social: 'layoutTemplate', print: 'printer' };

export function areasMarkup(areas, services) {
  return areas
    .map(
      (a, i) => `
        <li class="area" data-reveal style="--sc: var(--c${(i % 4) + 1}); --on-sc: var(--on-c${(i % 4) + 1})">
          <div class="area__top">
            <span class="ico">${icon(areaIcon[a.art] || 'sparkles')}</span>
            <span class="area__num">${String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.text)}</p>
          <ul class="ticks">${a.items.map((t) => `<li>${icon('check')}${escapeHtml(t)}</li>`).join('')}</ul>
          <a class="area__foot" href="#sluzby">
            <span class="area__price">${priceFrom(services, a.services)}</span>
            <span class="round-arrow">${icon('arrowUpRight')}</span>
          </a>
        </li>`,
    )
    .join('');
}

const fileIcon = { web: 'globe', device: 'monitorSmartphone', login: 'keyRound', mail: 'mail', svg: 'shapes', png: 'image', pdf: 'fileText', zip: 'layers', link: 'arrowUpRight', user: 'userRound' };
// zástupná značka do ukázky barevných kombinací
const sampleMark = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="15" cy="20" r="9" fill="currentColor" /><rect x="22" y="11" width="7" height="18" rx="3.5" fill="currentColor" opacity=".55" /></svg>';
const tabIcon = ['codeXml', 'penTool', 'layoutTemplate'];

export function handoverMarkup(handover, services) {
  const tabs = handover
    .map(
      (h, i) =>
        `<button class="seg__btn" type="button" role="tab" id="ho-tab-${i}" aria-controls="ho-panel-${i}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${icon(tabIcon[i] || 'sparkles')}${escapeHtml(h.label)}</button>`,
    )
    .join('');
  const panels = handover
    .map((h, i) => {
      const list = h.services.map((id) => byId(services, id)).filter(Boolean);
      // body všech služeb; „Všechno z …“ vynecháme, u dalších služeb připíšeme, ke které patří
      const items = list.flatMap((svc, n) =>
        (svc.includes || [])
          .filter((t) => !/^Všechno z/.test(t))
          .map((t) => `<li>${icon('check')}<span>${escapeHtml(t)}${n ? ` <em>${escapeHtml(svc.name.toLowerCase())}</em>` : ''}</span></li>`),
      );
      const prices = list
        .map((svc) => {
          const price = svc.priceMax ? `${kc(svc.price)} až ${kc(svc.priceMax)}&nbsp;Kč` : `${kc(svc.price)}&nbsp;Kč`;
          return `<li><span>${escapeHtml(svc.name)}</span><strong>${price}</strong></li>`;
        })
        .join('');
      let n = 0;
      const count = h.folder.reduce((a, d) => a + d.files.length, 0);
      const files = h.folder
        .map(
          (d) => `
            <li class="dir" style="--i:${n++}">
              <span class="dir__head">${icon('folderOpen')}<strong>${escapeHtml(d.name)}</strong><small>${escapeHtml(d.note)}</small></span>
              <ul class="dir__files">${d.files
                .map(
                  (f) => `
                <li class="file" style="--i:${n++}">
                  <span class="file__ico">${icon(fileIcon[f.kind] || 'fileText')}</span>
                  <span class="file__text"><strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.note)}</small></span>
                  ${['svg', 'png', 'pdf', 'zip'].includes(f.kind) ? `<span class="file__ext">${f.kind}</span>` : ''}
                </li>`,
                )
                .join('')}</ul>
            </li>`,
        )
        .join('');
      const swatches = h.swatches
        ? `<p class="combos__label">Ukázka: jedno logo ve čtyřech barevných kombinacích</p><div class="combos" aria-label="Ukázka barevných kombinací loga">${h.swatches
            .map(([bg, fg, label]) => `<span class="combo" style="--bg-c:${bg};--fg-c:${fg}"><span class="combo__tile">${sampleMark}</span><small>${escapeHtml(label)}</small></span>`)
            .join('')}</div>`
        : '';
      return `
        <div class="ho__panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="ho-panel-${i}" aria-labelledby="ho-tab-${i}">
          <div class="ho__folder">
            <div class="ho__folder-head">${icon('folderOpen')}<span>predani-${escapeHtml(h.label.toLowerCase().split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g, ''))}</span><small>${count} ${count < 5 ? 'položky' : 'položek'}</small></div>
            <ul class="files" aria-label="Co vám předám">${files}</ul>
          </div>
          <div class="ho__detail">
            <p class="ho__lead">${escapeHtml(h.lead)}</p>
            <ul class="ticks ticks--cols">${items.join('')}</ul>
            ${swatches}
            <div class="ho__foot">
              <ul class="ho__prices">${prices}</ul>
              <a class="btn btn--ghost btn--sm" href="#sluzby">Spočítat cenu ${icon('arrowRight')}</a>
            </div>
          </div>
        </div>`;
    })
    .join('');
  return `<div class="seg" role="tablist" aria-label="Druh zakázky">${tabs}</div>${panels}`;
}

const promiseIcon = ['eye', 'keyRound', 'userRound', 'handCoins'];

export function promisesMarkup(promises) {
  return promises
    .map(
      (p, i) => `
        <li data-reveal>
          <span class="ico ico--sm">${icon(promiseIcon[i] || 'check')}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.text)}</p>
        </li>`,
    )
    .join('');
}

export function faqMarkup(faq) {
  return faq
    .map(
      (f, i) => `
        <details class="qa" data-reveal>
          <summary><span class="qa__num">${String(i + 1).padStart(2, '0')}</span><h3>${escapeHtml(f.q)}</h3><span class="qa__icon">${icon('plus')}</span></summary>
          <p>${escapeHtml(f.a)}</p>
        </details>`,
    )
    .join('');
}

// Doplní ikonky za značky v HTML nové verze (data-icon, data-arrow, …),
// aby byly v HTML hned a nečekalo se na JavaScript.
export function fillIcons(html) {
  return html
    .replace(/<i data-logo><\/i>/g, logoMark)
    .replace(/<i data-arrow><\/i>/g, `<i class="arr">${icon('arrowRight')}${icon('arrowRight')}</i>`)
    .replace(/(<span[^>]*?) data-icon="(\w+)"><\/span>/g, (_, open, name) => `${open}>${icon(name)}</span>`)
    .replace(/<li data-tick>/g, `<li>${icon('check')}`)
    .replace(/ data-chip="(\w+)">/g, (_, name) => `>${icon(name)}`)
    .replace(/ data-mail><\/a>/g, `>${icon('mail')}</a>`)
    .replace(/(data-lb-close[^>]*>|data-pkg-close[^>]*>)<\/button>/g, `$1${icon('x')}</button>`)
    .replace(/(data-lb-prev[^>]*>)<\/button>/, `$1${icon('chevronLeft')}</button>`)
    .replace(/(data-lb-next[^>]*>)<\/button>/, `$1${icon('chevronRight')}</button>`);
}

// Reference: všechny zakázky v řádcích; živý web vede ven, ostatní na stránku portfolia
export function refsMarkup(projects) {
  return projects
    .map((p) => {
      const href = p.link || 'portfolio/';
      const ext = p.link ? ' target="_blank" rel="noopener"' : '';
      const where = p.link ? p.link.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'v portfoliu';
      return `
        <li data-reveal>
          <a class="ref" href="${escapeHtml(href)}"${ext}>
            <span class="ref__ico">${icon(p.type === 'web' ? 'globe' : 'penTool')}</span>
            <span class="ref__name">${escapeHtml(p.title)}</span>
            <span class="ref__what">${escapeHtml(p.category)}</span>
            <span class="ref__year">${escapeHtml(String(p.year))}</span>
            <span class="ref__go">${escapeHtml(where)}${icon('arrowUpRight')}</span>
          </a>
        </li>`;
    })
    .join('');
}

// Logo: d a j z tenké linky, ocásek j podtrhuje obě písmena, tečka nad j je v barvě
export const logoMark = `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><g class="mark__lines"><circle cx="20" cy="34" r="9" /><path d="M29 12v31" /><path d="M40 26v21a8 8 0 0 1-8 8H12" /></g><circle class="mark__dot" cx="40" cy="17.5" r="2.8" /></svg>`;

// Patička: stejná na všech stránkách, vkládá se při sestavení (vite.seo.js).
// home = cesta k hlavní stránce ('' na hlavní, '../' v portfoliu, '/' na stránce 404)
export function footerMarkup(site, home, portfolio) {
  const h = (hash) => `${home}${hash}`;
  const socials = site.socials
    .map((s) =>
      s.url
        ? `<a class="soc" href="${escapeHtml(s.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(s.label)}">${icon(s.icon)}<span>${escapeHtml(s.label)}</span></a>`
        : `<span class="soc soc--soon" title="${escapeHtml(s.label)} připravuji">${icon(s.icon)}<span>${escapeHtml(s.label)}</span><small>brzy</small></span>`,
    )
    .join('');
  return `<footer class="ft">
    <div class="wrap">
      <div class="ft__cta">
        <h2>Máte nápad? <em>Pojďme na to.</em></h2>
        <div class="ft__contact">
          <a class="ft__pill" href="mailto:${escapeHtml(site.email)}">${icon('mail')}<span><small>E-mail</small>${escapeHtml(site.email)}</span></a>
          <a class="ft__pill" href="tel:${escapeHtml(site.phoneHref)}">${icon('phone')}<span><small>Telefon</small>${escapeHtml(site.phone)}</span></a>
        </div>
      </div>
      <div class="ft__top">
        <div class="ft__brand">
          <a class="logo" href="${home || '#top'}" aria-label="David Janečka, hlavní stránka"><i data-logo></i><span class="logo__name">David Janečka<i>.</i></span></a>
          <p>Weby, loga a vizuální identity na míru pro malé firmy a živnostníky. Od návrhu po spuštění.</p>
          <div class="ft__socials" aria-label="Sociální sítě">${socials}</div>
        </div>
        <nav class="ft__col" aria-label="Stránka">
          <h3>Stránka</h3>
          <a href="${h('#sluzby')}">Služby</a>
          <a href="${h('#prace')}">Práce</a>
          <a href="${h('#cenik')}">Ceník a kalkulačky</a>
          <a href="${h('#postup')}">Postup</a>
          <a href="${h('#o-mne')}">O mně</a>
          <a href="${h('#otazky')}">Otázky</a>
        </nav>
        <nav class="ft__col" aria-label="Služby">
          <h3>Služby</h3>
          <a href="${h('#cenik')}">Weby a e-shopy</a>
          <a href="${h('#cenik')}">Loga a identity</a>
          <a href="${h('#cenik')}">Sociální sítě</a>
          <a href="${h('#co-dostanete')}">Co ode mě dostanete</a>
          <a href="${portfolio}">Celé portfolio</a>
        </nav>
        <div class="ft__col">
          <h3>Kontakt</h3>
          <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>
          <a href="tel:${escapeHtml(site.phoneHref)}">${escapeHtml(site.phone)}</a>
          <a href="${h('#kontakt')}">Napsat zprávu</a>
        </div>
      </div>
      <div class="ft__bottom">
        <span>© <span data-year>2026</span> David Janečka, webař a grafik</span>
        <button class="ft__up" type="button" data-top>Nahoru ${icon('arrowUp')}</button>
      </div>
    </div>
  </footer>`;
}

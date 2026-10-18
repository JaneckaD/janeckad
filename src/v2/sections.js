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

const fileIcon = { web: 'globe', device: 'monitorSmartphone', login: 'keyRound', mail: 'mail', svg: 'shapes', png: 'image', pdf: 'fileText' };
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
      const files = h.folder
        .map(
          (f, n) => `
            <li class="file" style="--i:${n}">
              <span class="file__ico">${icon(fileIcon[f.kind] || 'fileText')}</span>
              <span class="file__text"><strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.note)}</small></span>
              ${['svg', 'png', 'pdf'].includes(f.kind) ? `<span class="file__ext">${f.kind}</span>` : ''}
            </li>`,
        )
        .join('');
      return `
        <div class="ho__panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="ho-panel-${i}" aria-labelledby="ho-tab-${i}">
          <div class="ho__folder">
            <div class="ho__folder-head">${icon('folderOpen')}<span>predani-${escapeHtml(h.label.toLowerCase().split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g, ''))}</span><small>${h.folder.length} položky</small></div>
            <ul class="files" aria-label="Co vám předám">${files}</ul>
          </div>
          <div class="ho__detail">
            <p class="ho__lead">${escapeHtml(h.lead)}</p>
            <ul class="ticks ticks--cols">${items.join('')}</ul>
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

const promiseIcon = ['eye', 'keyRound', 'userRound', 'clock'];

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
    .replace(/<i data-arrow><\/i>/g, `<i class="arr">${icon('arrowRight')}${icon('arrowRight')}</i>`)
    .replace(/(<span[^>]*?) data-icon="(\w+)"><\/span>/g, (_, open, name) => `${open}>${icon(name)}</span>`)
    .replace(/<li data-tick>/g, `<li>${icon('check')}`)
    .replace(/ data-chip="(\w+)">/g, (_, name) => `>${icon(name)}`)
    .replace(/ data-mail><\/a>/g, `>${icon('mail')}</a>`)
    .replace(/(data-lb-close[^>]*>|data-pkg-close[^>]*>)<\/button>/g, `$1${icon('x')}</button>`)
    .replace(/(data-lb-prev[^>]*>)<\/button>/, `$1${icon('chevronLeft')}</button>`)
    .replace(/(data-lb-next[^>]*>)<\/button>/, `$1${icon('chevronRight')}</button>`);
}

// Úvodní koláž z obálek vybraných projektů; thumb vrátí adresu zmenšeného náhledu
export function stackMarkup(projects, thumb) {
  return projects
    .slice(0, 3)
    .map(
      (p, i) => `
        <figure class="stack__card stack__card--${i + 1}">
          <img src="${escapeHtml(thumb(p))}" alt="" width="800" height="533" decoding="async" />
          <figcaption><span>${escapeHtml(p.title)}</span><small>${escapeHtml(p.type === 'web' ? 'Web' : 'Identita')}</small></figcaption>
        </figure>`,
    )
    .join('');
}

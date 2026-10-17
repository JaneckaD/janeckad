// Sekce „Co pro vás udělám“ a „Co ode mě dostanete“.
// Čisté funkce bez prohlížeče: HTML z nich skládá sestavení webu (vite.seo.js),
// aby obsah byl v HTML hned a viděly ho i vyhledávače.
import { escapeHtml } from './cards.js';

const kc = (n) => new Intl.NumberFormat('cs-CZ').format(n).replace(/\s/g, ' ');
const byId = (services, id) => services.find((s) => s.id === id);

// Kresbičky oborů: jednoduché tvary v barvách webu
const art = {
  web: `<svg viewBox="0 0 80 80" aria-hidden="true">
    <rect class="a-mint" x="14" y="22" width="56" height="42" rx="6"/>
    <rect class="a-line" x="8" y="14" width="56" height="42" rx="6"/>
    <path class="a-line" d="M8 25h56"/>
    <circle class="a-ink" cx="15" cy="19.5" r="1.8"/><circle class="a-ink" cx="21" cy="19.5" r="1.8"/>
    <rect class="a-violet" x="15" y="32" width="24" height="5" rx="2.5"/>
    <rect class="a-ink" x="15" y="41" width="16" height="3" rx="1.5"/>
    <path class="a-sun a-line" d="M48 38l12 30 4-11 11-4z"/>
  </svg>`,
  brand: `<svg viewBox="0 0 80 80" aria-hidden="true">
    <circle class="a-sun" cx="46" cy="30" r="20"/>
    <circle class="a-line a-paper" cx="32" cy="48" r="16"/>
    <path class="a-violet-line" d="M58 14v52M51 14h14M51 66h14"/>
  </svg>`,
  social: `<svg viewBox="0 0 80 80" aria-hidden="true">
    <rect class="a-violet" x="34" y="18" width="34" height="34" rx="5" transform="rotate(8 51 35)"/>
    <rect class="a-line a-paper" x="14" y="6" width="34" height="68" rx="7"/>
    <rect class="a-mint" x="19" y="18" width="24" height="24" rx="3"/>
    <path class="a-ink" d="M31 61c-5-3-8-6-8-9a3.5 3.5 0 0 1 8-1.5 3.5 3.5 0 0 1 8 1.5c0 3-3 6-8 9z"/>
  </svg>`,
  print: `<svg viewBox="0 0 80 80" aria-hidden="true">
    <rect class="a-mint" x="30" y="8" width="38" height="52" rx="3" transform="rotate(9 49 34)"/>
    <rect class="a-line a-paper" x="12" y="16" width="38" height="56" rx="3" transform="rotate(-5 31 44)"/>
    <circle class="a-sun" cx="30" cy="36" r="10"/>
    <path class="a-line" d="M20 55l22-2M21 62l14-1"/>
  </svg>`,
};

const priceFrom = (services, ids) => {
  const list = ids.map((id) => byId(services, id)).filter(Boolean);
  const prices = list.map((s) => s.price).filter((p) => p != null);
  if (!prices.length) return '<span class="areas__price-note">Cena</span> dohodou';
  const min = Math.min(...prices);
  return `${list.length > 1 ? '<span class="areas__price-note">od</span> ' : ''}${kc(min)}&nbsp;Kč`;
};

export function areasMarkup(areas, services) {
  return areas
    .map(
      (a) => `
        <li class="areas__row" data-reveal>
          <span class="areas__art">${art[a.art] || ''}</span>
          <h3 class="areas__title">${escapeHtml(a.title)}</h3>
          <div class="areas__body">
            <p>${escapeHtml(a.text)}</p>
            <ul class="areas__items">${a.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
          </div>
          <p class="areas__price">${priceFrom(services, a.services)}</p>
        </li>`,
    )
    .join('');
}

// ikonky souborů v předávací složce
const fileIcon = {
  web: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>',
  login: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  device: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4" width="14" height="10" rx="1.5"/><path d="M6 18h7"/><rect x="15" y="9" width="6.5" height="11" rx="1.5"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
};

const fileTile = (f, i) => {
  const badge = fileIcon[f.kind]
    ? `<span class="file__icon file__icon--${f.kind}">${fileIcon[f.kind]}</span>`
    : `<span class="file__ext file__ext--${f.kind}">${escapeHtml(f.kind)}</span>`;
  return `<li class="file" style="--i:${i}">${badge}<strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.note)}</small></li>`;
};

export function handoverMarkup(handover, services) {
  const tabs = handover
    .map(
      (h, i) =>
        `<button class="handover__tab" type="button" role="tab" id="ho-tab-${i}" aria-controls="ho-panel-${i}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${escapeHtml(h.label)}</button>`,
    )
    .join('');
  const panels = handover
    .map((h, i) => {
      const list = h.services.map((id) => byId(services, id)).filter(Boolean);
      // body všech služeb; „Všechno z …“ vynecháme, u dalších služeb připíšeme, ke které patří
      const items = list.flatMap((svc, n) =>
        (svc.includes || [])
          .filter((t) => !/^Všechno z/.test(t))
          .map((t) => `<li>${escapeHtml(t)}${n ? ` <em>${escapeHtml(svc.name.toLowerCase())}</em>` : ''}</li>`),
      );
      const prices = list
        .map((svc) => {
          const price = svc.priceMax ? `${kc(svc.price)} až ${kc(svc.priceMax)}&nbsp;Kč` : `${kc(svc.price)}&nbsp;Kč`;
          return `<li><span>${escapeHtml(svc.name)}</span><strong>${price}</strong></li>`;
        })
        .join('');
      return `
        <div class="handover__panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="ho-panel-${i}" aria-labelledby="ho-tab-${i}">
          <ul class="folder" aria-label="Co vám předám">${h.folder.map(fileTile).join('')}</ul>
          <div class="handover__summary">
            <p class="handover__lead">${escapeHtml(h.lead)}</p>
            <ul class="handover__prices">${prices}</ul>
            <a class="btn btn--light btn--small" href="#sluzby">Spočítat cenu</a>
          </div>
          <ul class="handover__list">${items.join('')}</ul>
        </div>`;
    })
    .join('');
  return `<div class="handover__tabs" role="tablist" aria-label="Druh zakázky">${tabs}</div>${panels}`;
}

export function promisesMarkup(promises) {
  return promises
    .map((p) => `<li data-reveal><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.text)}</p></li>`)
    .join('');
}

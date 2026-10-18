// Nová verze webu: hlavní stránka
import './style.css';
import { projects } from '../data/projects.js';
import { services } from '../data/services.js';
import { icon } from './icons.js';
import { $, $$, kc, escapeHtml, initNav, initReveal, renderProjects, initLightbox, initFooter } from '../shared.js';
import { initBuilder, priceLabel } from '../builder.js';
import { initContact } from '../contact.js';
import { initTilt } from './common.js';

/* ---------- Záložky (předání i kalkulačky): klik a šipky doleva/doprava ---------- */
function initTabs(tabs, panels, onSelect) {
  if (!tabs.length) return;
  const select = (i, focus = false) => {
    tabs.forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === i));
      t.tabIndex = n === i ? 0 : -1;
      panels[n].classList.toggle('is-active', n === i);
      if (onSelect) panels[n].hidden = n !== i;
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  tabs[0].parentElement.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    select((i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length, true);
  });
  return select;
}

const byId = (id) => services.find((s) => s.id === id);
// součet cen; e-shop má rozpětí, takže vracíme od–do
const sum = (ids) => {
  const list = ids.map(byId).filter(Boolean);
  return [list.reduce((a, s) => a + (s.price || 0), 0), list.reduce((a, s) => a + (s.priceMax || s.price || 0), 0)];
};
const range = ([min, max]) => (min === max ? `${kc(min)} Kč` : `${kc(min)} – ${kc(max)} Kč`);

// zaškrtne ve skládačce vybrané služby a přepne na ni
function applyToBuilder(ids, selectTab) {
  const inputs = $$('[data-services] input');
  inputs.forEach((i) => { i.checked = false; });
  inputs.forEach((i) => {
    if (!ids.includes(i.value)) return;
    i.checked = true;
    i.dispatchEvent(new Event('change', { bubbles: true }));
  });
  if (!ids.length) inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
  selectTab(0, true);
}

/* ---------- Kalkulačka 2: tři otázky a doporučení ---------- */
function initGuide(selectTab) {
  const form = $('[data-guide]');
  if (!form) return;
  const list = $('[data-guide-list]');
  const total = $('[data-guide-total]');
  const picked = () => ['brand', 'web', 'social'].map((n) => form.elements[n].value).filter(Boolean);
  const render = () => {
    const ids = picked();
    list.innerHTML = ids.length
      ? ids.map((id) => `<li><span>${escapeHtml(byId(id).name)}</span><b>${priceLabel(byId(id))}</b></li>`).join('')
      : '<li class="guide__none">Vyberte aspoň jednu věc, se kterou vám můžu pomoct.</li>';
    total.textContent = ids.length ? range(sum(ids)) : '0 Kč';
  };
  form.addEventListener('change', render);
  render();
  // doporučení se přenese do skládačky a přepne se na ni
  $('[data-guide-apply]').addEventListener('click', () => applyToBuilder(picked(), selectTab));
}

/* ---------- Kalkulačka 3: co se vejde do rozpočtu ----------
   Projde všechny rozumné kombinace (jeden web, logo nebo identita, šablony) a ukáže ty,
   jejichž celková cena se vejde. Nahoře ta, která rozpočet využije nejlíp. */
function initBudget(selectTab) {
  const root = $('[data-budget]');
  if (!root) return;
  const input = $('[data-budget-range]', root);
  const out = $('[data-budget-out]', root);
  const list = $('[data-budget-list]', root);
  const combos = [];
  for (const web of ['', 'web-simple', 'web-big', 'eshop'])
    for (const brand of ['', 'logo', 'identity'])
      for (const social of ['', 'social']) {
        const ids = [brand, web, social].filter(Boolean);
        if (ids.length) combos.push({ ids, price: sum(ids) });
      }
  combos.sort((a, b) => b.price[0] - a.price[0] || a.ids.length - b.ids.length);
  const items = (ids) => ids.map((id) => `<li><span>${escapeHtml(byId(id).name)}</span><b>${priceLabel(byId(id))}</b></li>`).join('');
  let shown = [];
  const render = () => {
    const budget = Number(input.value);
    out.textContent = `${kc(budget)} Kč`;
    input.style.setProperty('--p', `${((budget - input.min) / (input.max - input.min)) * 100}%`);
    // nahoře jen kombinace, které se vejdou celé; e-shop (cena od–do) přidáme, když se vejde aspoň jeho spodní hranice
    shown = combos.filter((c) => c.price[1] <= budget).slice(0, 4);
    const eshop = combos.find((c) => c.ids.length === 1 && c.ids[0] === 'eshop');
    if (!shown.some((c) => c.ids.includes('eshop')) && eshop.price[0] <= budget) shown = [...shown.slice(0, 3), eshop];
    if (!shown.length) {
      const cheapest = combos[combos.length - 1];
      list.innerHTML = `<li class="budget__none">Za tuhle částku zatím nic nevyjde. Nejlevnější je ${escapeHtml(byId(cheapest.ids[0]).name.toLowerCase())} za ${range(cheapest.price)}.</li>`;
      return;
    }
    list.innerHTML = shown
      .map((c, i) => {
        const rest = budget - c.price[0];
        return `<li class="pick${i === 0 ? ' pick--best' : ''}">
          <div class="pick__head"><span class="pick__tag">${i === 0 ? 'Nejvíc za vaše peníze' : `Nebo ${i === 1 ? 'třeba' : 'taky'}`}</span><strong>${range(c.price)}</strong></div>
          <ul class="pick__items">${items(c.ids)}</ul>
          <div class="pick__foot"><small>${c.price[0] === c.price[1] ? (rest ? `Zbyde vám ${kc(rest)} Kč` : 'Přesně na korunu') : 'E-shop stojí podle toho, co má umět'}</small><button class="btn btn--${i === 0 ? 'accent' : 'ghost'} btn--sm" type="button" data-budget-pick="${i}">Vybrat ${icon('arrowRight')}</button></div>
        </li>`;
      })
      .join('');
  };
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-budget-pick]');
    if (btn) applyToBuilder(shown[Number(btn.dataset.budgetPick)].ids, selectTab);
  });
  input.addEventListener('input', render);
  render();
}

initNav();
const openGallery = initLightbox();
renderProjects($('[data-projects]'), projects.filter((p) => p.featured), openGallery);
initTabs($$('.seg__btn'), $$('.ho__panel'));
initBuilder();
const selectTool = initTabs($$('.tools-tab'), $$('.tools-panel'), true);
initGuide(selectTool);
initBudget(selectTool);
initContact();
initFooter();
initReveal();
initTilt($('.hero__visual'), [
  [$('.phone'), 10],
  [$('.float--a'), -22],
  [$('.float--b'), 26],
  [$('.float--c'), -16],
]);

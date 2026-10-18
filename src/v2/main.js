// Nová verze webu: hlavní stránka
import './style.css';
import { projects } from '../data/projects.js';
import { services, bundles } from '../data/services.js';
import { $, $$, kc, escapeHtml, initNav, initReveal, renderProjects, initLightbox, initFooter } from '../shared.js';
import { initBuilder, priceLabel } from '../builder.js';
import { initContact } from '../contact.js';
import { initSwatch, initTilt } from './common.js';

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
  $('[data-guide-apply]').addEventListener('click', () => {
    const ids = picked();
    const inputs = $$('[data-services] input');
    inputs.forEach((i) => { i.checked = false; });
    inputs.forEach((i) => {
      if (!ids.includes(i.value)) return;
      i.checked = true;
      i.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (!ids.length) inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    selectTab(0, true);
  });
}

/* ---------- Kalkulačka 3: co se vejde do rozpočtu ---------- */
function initBudget() {
  const root = $('[data-budget]');
  if (!root) return;
  const input = $('[data-budget-range]', root);
  const out = $('[data-budget-out]', root);
  const list = $('[data-budget-list]', root);
  // jednotlivé služby i hotové kombinace s cenou
  const options = [
    ...services.filter((s) => s.price != null).map((s) => ({ name: s.name, note: s.group === 'web' ? 'Web' : 'Grafika', ids: [s.id] })),
    ...bundles.map((b) => ({ name: b.name, note: b.desc, ids: b.items })),
  ]
    .map((o) => ({ ...o, price: sum(o.ids) }))
    .sort((a, b) => a.price[0] - b.price[0]);
  const render = () => {
    const budget = Number(input.value);
    out.textContent = `${kc(budget)} Kč`;
    input.style.setProperty('--p', `${((budget - input.min) / (input.max - input.min)) * 100}%`);
    list.innerHTML = options
      .map((o) => {
        const fits = o.price[0] <= budget;
        return `<li class="${fits ? 'is-fit' : ''}"><span class="budget__mark">${fits ? '✓' : ''}</span><span><strong>${escapeHtml(o.name)}</strong><small>${escapeHtml(o.note)}</small></span><b>${range(o.price)}</b></li>`;
      })
      .join('');
  };
  input.addEventListener('input', render);
  render();
}

initSwatch();
initNav();
const openGallery = initLightbox();
renderProjects($('[data-projects]'), projects.filter((p) => p.featured), openGallery);
initTabs($$('.seg__btn'), $$('.ho__panel'));
initBuilder();
const selectTool = initTabs($$('.tools-tab'), $$('.tools-panel'), true);
initGuide(selectTool);
initBudget();
initContact();
initFooter();
initReveal();
initTilt($('.hero__visual'), [
  [$('.phone'), 10],
  [$('.float--a'), -22],
  [$('.float--b'), 26],
  [$('.float--c'), -16],
]);

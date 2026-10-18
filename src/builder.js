// Skládačka služeb s cenou a okénkem „co obsahuje“. Používá ji hlavní stránka i nová verze webu.
import { groups, services, bundles } from './data/services.js';
import { $, $$, reduceMotion, kc, escapeHtml } from './shared.js';

/* ---------- Skládačka služeb ---------- */
export const priceLabel = (s) =>
  s.price == null ? 'cena dohodou' : s.priceMax ? `${kc(s.price)} – ${kc(s.priceMax)} Kč` : `${kc(s.price)} Kč`;

export function initBuilder() {
  const root = $('[data-services]');
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17 19 7"/></svg>';

  root.innerHTML = groups
    .map(
      (g) => `
      <div class="svc-group" role="group" aria-labelledby="svc-group-${g.id}">
        <h3 id="svc-group-${g.id}">${escapeHtml(g.name)}${g.exclusive ? '<small>vyberte jednu možnost</small>' : '<small>můžete kombinovat</small>'}</h3>
        <div class="svc-list">
          ${services
            .filter((s) => s.group === g.id)
            .map(
              (s) => `
            <div class="svc">
              <input type="checkbox" id="svc-${s.id}" value="${s.id}" data-group="${g.id}" />
              <label for="svc-${s.id}">
                <span class="svc__name">${escapeHtml(s.name)}</span>
                <span class="svc__check">${check}</span>
                <span class="svc__desc">${escapeHtml(s.desc)}</span>
                <span class="svc__price">${priceLabel(s)}</span>
              </label>
              ${s.includes ? `<button class="svc__info" type="button" data-info="${s.id}" aria-label="Co obsahuje: ${escapeHtml(s.name)}">i</button>` : ''}
            </div>`,
            )
            .join('')}
        </div>
      </div>`,
    )
    .join('');

  const bundleRoot = $('[data-bundles]');
  bundleRoot.innerHTML = bundles
    .map((b, i) => `<button class="bundle" type="button" data-bundle="${i}" aria-pressed="false">${escapeHtml(b.name)}<small>${escapeHtml(b.desc)}</small></button>`)
    .join('');

  const inputs = $$('input[type=checkbox]', root);
  const list = $('[data-summary-list]');
  const empty = $('[data-summary-empty]');
  const totalEl = $('[data-total]');
  const totalMaxEl = $('[data-total-max]');
  const dealNote = $('[data-deal-note]');

  const animated = new Map();
  const countTo = (el, target) => {
    const from = animated.get(el) ?? 0;
    animated.set(el, target);
    if (reduceMotion) { el.textContent = kc(target); return; }
    const start = performance.now();
    const dur = 650;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = kc(from + (target - from) * eased);
      if (t < 1 && animated.get(el) === target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  let previous = new Set();
  const selected = () => services.filter((s) => inputs.find((i) => i.value === s.id)?.checked);
  const summaryText = () => {
    const min = totalEl.textContent;
    return totalMaxEl.hidden ? `${min} Kč` : `${min} – ${totalMaxEl.dataset.value} Kč`;
  };

  const render = () => {
    const chosen = selected();
    const ids = new Set(chosen.map((s) => s.id));
    const priced = chosen.filter((s) => s.price != null);
    const min = priced.reduce((sum, s) => sum + s.price, 0);
    const max = priced.reduce((sum, s) => sum + (s.priceMax ?? s.price), 0);

    // seznam: nové položky dostanou animaci, staré zůstanou v klidu
    list.innerHTML = chosen
      .map((s) => `<li${previous.has(s.id) ? ' style="animation:none"' : ''}><span>${escapeHtml(s.name)}</span><span>${priceLabel(s)}</span></li>`)
      .join('');
    previous = ids;
    empty.hidden = chosen.length > 0;

    countTo(totalEl, min);
    totalMaxEl.hidden = !(max > min);
    totalMaxEl.dataset.value = kc(max);
    totalMaxEl.textContent = ` – ${kc(max)}`;
    dealNote.hidden = !chosen.some((s) => s.price == null);

    $$('[data-bundle]', bundleRoot).forEach((b) => {
      const items = bundles[Number(b.dataset.bundle)].items;
      const match = items.length === ids.size && items.every((id) => ids.has(id));
      b.setAttribute('aria-pressed', String(match));
    });
  };

  // ve skupině s exclusive jde mít zaškrtnutou jen jednu službu
  root.addEventListener('change', (e) => {
    const input = e.target;
    const group = groups.find((g) => g.id === input.dataset.group);
    if (input.checked && group?.exclusive) {
      inputs.forEach((i) => { if (i !== input && i.dataset.group === group.id) i.checked = false; });
    }
    // služby, které se navzájem vylučují (např. identita už logo obsahuje)
    const excludes = services.find((s) => s.id === input.value)?.excludes ?? [];
    if (input.checked) inputs.forEach((i) => { if (excludes.includes(i.value)) i.checked = false; });
    render();
  });
  bundleRoot.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bundle]');
    if (!b) return;
    const items = bundles[Number(b.dataset.bundle)].items;
    inputs.forEach((i) => { i.checked = items.includes(i.value); });
    render();
  });

  // ikonka „i“ otevře okénko s tím, co služba obsahuje
  const info = $('[data-pkg]');
  let infoService = null;
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-info]');
    if (!btn) return;
    infoService = services.find((s) => s.id === btn.dataset.info);
    $('[data-pkg-title]', info).textContent = infoService.name;
    $('[data-pkg-price]', info).textContent = priceLabel(infoService);
    $('[data-pkg-list]', info).innerHTML = infoService.includes.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
    syncInfoButton();
    info.showModal();
  });
  const syncInfoButton = () => {
    const input = inputs.find((i) => i.value === infoService.id);
    $('[data-pkg-add]', info).textContent = input.checked ? 'Už je ve skládačce ✓' : 'Přidat do skládačky';
  };
  $('[data-pkg-add]', info).addEventListener('click', () => {
    const input = inputs.find((i) => i.value === infoService.id);
    if (!input.checked) {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    info.close();
  });
  $('[data-pkg-close]', info).addEventListener('click', () => info.close());
  // klik mimo okénko ho zavře
  info.addEventListener('click', (e) => { if (e.target === info) info.close(); });

  // „Poslat poptávku“ předvyplní zprávu ve formuláři
  $('[data-send-selection]').addEventListener('click', () => {
    const chosen = selected();
    if (!chosen.length) return;
    const msg = $('[data-message]');
    const lines = chosen.map((s) => `• ${s.name}`).join('\n');
    msg.value = `Ahoj Davide, zajímá mě:\n${lines}\n\nOrientační cena z webu: ${summaryText()}.\n\nO projektu: `;
  });

  render();
}

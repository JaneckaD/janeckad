import './style.css';
import { site } from './data/site.js';
import { projects } from './data/projects.js';
import { groups, services, bundles } from './data/services.js';
import { moreTile } from './cards.js';
import { $, $$, reduceMotion, finePointer, kc, escapeHtml, initNav, initReveal, renderProjects, initLightbox, initFooter } from './shared.js';

document.documentElement.classList.add('js');

/* ---------- Hero: písmena jména reagují na kurzor ---------- */
function initHero() {
  const nameEl = $('[data-name]');
  const letters = [...nameEl.textContent.trim()];
  // Písmena se kreslí přes CSS (data-ch), takže v textu stránky zůstane jméno jen jednou
  // a vyhledávače i čtečky ho dostanou celé z neviditelného textu
  nameEl.innerHTML = letters
    .map((ch, i) => `<span class="ch" style="--i:${i}" data-ch="${escapeHtml(ch)}" aria-hidden="true"></span>`)
    .join('');
  nameEl.nextElementSibling.prepend(letters.join(''));

  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  // animace v hero běží jen, když je hero vidět
  if ('IntersectionObserver' in window) {
    const heroEl = $('.hero');
    new IntersectionObserver(([e]) => heroEl.classList.toggle('is-paused', !e.isIntersecting)).observe(heroEl);
  }

  if (reduceMotion || !finePointer) return;
  const chars = $$('.ch', nameEl).map((el) => ({ el, cx: 0, cy: 0, wght: 900, wdth: 100, tw: 900, td: 100 }));
  const hero = $('.hero');
  let mouse = null;
  let frame = 0;

  // Středy písmen měříme jen v klidu (při načtení a změně velikosti okna).
  // Kdybychom je měřili každý snímek, měnící se šířka písmen by je posouvala a efekt by škubal.
  const measure = () => {
    const prev = chars.map((c) => c.el.style.fontVariationSettings);
    chars.forEach((c) => { c.el.style.fontVariationSettings = ''; });
    const heroTop = hero.getBoundingClientRect().top;
    chars.forEach((c) => {
      const r = c.el.getBoundingClientRect();
      c.cx = r.left + r.width / 2;
      c.cy = r.top - heroTop + r.height / 2; // vůči hero, ať nevadí scroll
    });
    chars.forEach((c, i) => { c.el.style.fontVariationSettings = prev[i]; });
    chars.forEach((c) => { c.fvs = null; });
  };

  const tick = () => {
    frame = 0;
    const heroTop = hero.getBoundingClientRect().top;
    let moving = false;
    for (const c of chars) {
      if (mouse) {
        const dist = Math.hypot(mouse.x - c.cx, mouse.y - (c.cy + heroTop));
        const t = Math.max(0, 1 - dist / 520); // 1 = kurzor přímo nad písmenem
        const ease = t * t * (3 - 2 * t);
        c.tw = 900 - ease * 700;
        c.td = 100 - ease * 45;
      } else {
        c.tw = 900;
        c.td = 100;
      }
      // plynulé dojíždění k cílové hodnotě
      c.wght += (c.tw - c.wght) * 0.14;
      c.wdth += (c.td - c.wdth) * 0.14;
      if (Math.abs(c.tw - c.wght) > 0.5 || Math.abs(c.td - c.wdth) > 0.05) moving = true;
      else { c.wght = c.tw; c.wdth = c.td; }
      // Hodnoty zaokrouhlujeme na kroky: každá nová kombinace tloušťky a šířky znamená,
      // že prohlížeč musí písmo znovu připravit. S kroky si připravené verze pamatuje.
      const w = Math.round(c.wght / 8) * 8;
      const d = Math.round(c.wdth * 2) / 2;
      const fvs = `'wght' ${w}, 'wdth' ${d}`;
      if (fvs !== c.fvs) { c.fvs = fvs; c.el.style.fontVariationSettings = fvs; }
    }
    if (moving) frame = requestAnimationFrame(tick);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };

  // měření až po dojetí úvodní animace a načtení písma
  document.fonts.ready.then(() => setTimeout(measure, 2000));
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 150); });
  hero.addEventListener('pointermove', (e) => { mouse = { x: e.clientX, y: e.clientY }; schedule(); });
  hero.addEventListener('pointerleave', () => { mouse = null; schedule(); });
}

/* ---------- Magnetické tlačítko ---------- */
function initMagnet() {
  if (reduceMotion || !finePointer) return;
  $$('[data-magnet]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Portfolio: na hlavní stránce jen vybrané projekty ---------- */
function initPortfolio(openGallery) {
  const featured = projects.filter((p) => p.featured);
  renderProjects($('[data-projects]'), featured, openGallery, moreTile(projects.length));
}

/* ---------- Skládačka služeb ---------- */
const priceLabel = (s) =>
  s.price == null ? 'cena dohodou' : s.priceMax ? `${kc(s.price)} – ${kc(s.priceMax)} Kč` : `${kc(s.price)} Kč`;

function initBuilder() {
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

/* ---------- Kontaktní formulář ---------- */
function initContact() {
  const form = $('[data-form]');
  const error = $('[data-form-error]');
  const ok = $('[data-form-ok]');
  const submit = $('[data-form-submit]');
  const mailto = (data) =>
    `mailto:${site.email}?subject=${encodeURIComponent(`Poptávka z webu od ${data.get('name')}`)}&body=${encodeURIComponent(data.get('message'))}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = $$('input:not([name^="_"]), textarea', form);
    let firstInvalid = null;
    fields.forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== '';
      f.setAttribute('aria-invalid', String(!valid));
      if (!valid && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      error.textContent =
        firstInvalid.type === 'email' && firstInvalid.value
          ? 'E-mail nevypadá správně. Zkontrolujte, jestli v něm je zavináč a doména.'
          : 'Vyplňte prosím všechna pole, ať vím, komu a co odpovědět.';
      firstInvalid.focus();
      return;
    }
    error.textContent = '';
    ok.hidden = true;
    const data = new FormData(form);

    // Zprávu doručí služba FormSubmit.co na e-mail ze src/data/site.js (web nepotřebuje vlastní server)
    submit.disabled = true;
    submit.textContent = 'Odesílám…';
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${site.formTarget || site.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          'Jméno': data.get('name'),
          'E-mail': data.get('email'),
          'Zpráva': data.get('message'),
          _replyto: data.get('email'),
          _subject: `Nová poptávka z webu Davix od ${data.get('name')}`,
          _template: 'table',
          _honey: data.get('_honey'),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.status);
      form.reset();
      fields.forEach((f) => f.removeAttribute('aria-invalid'));
      ok.hidden = false;
    } catch {
      error.innerHTML = `Zprávu se nepodařilo odeslat. Zkuste to prosím znovu, nebo mi napište rovnou na <a href="${escapeHtml(mailto(data))}">${escapeHtml(site.email)}</a>.`;
    } finally {
      submit.disabled = false;
      submit.textContent = 'Odeslat zprávu';
    }
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'false');
  });
}

initHero();
initNav();
const openGallery = initLightbox();
initPortfolio(openGallery);
initBuilder();
initContact();
initFooter();
initReveal();
initMagnet();

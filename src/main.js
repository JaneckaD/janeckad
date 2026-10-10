import './style.css';
import { site } from './data/site.js';
import { projects } from './data/projects.js';
import { groups, services, bundles } from './data/services.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const kc = (n) => new Intl.NumberFormat('cs-CZ').format(Math.round(n));
const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

document.documentElement.classList.add('js');

/* ---------- Hero: písmena jména reagují na kurzor ---------- */
function initHero() {
  const nameEl = $('[data-name]');
  const letters = [...nameEl.textContent.trim()];
  nameEl.innerHTML = letters
    .map((ch, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${escapeHtml(ch)}</span>`)
    .join('');

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
      c.el.style.fontVariationSettings = `'wght' ${c.wght.toFixed(0)}, 'wdth' ${c.wdth.toFixed(1)}`;
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

/* ---------- Navigace ---------- */
function initNav() {
  const nav = $('[data-nav]');
  const links = $$('[data-nav-links] a:not(.nav__menu-cta)');
  const pill = $('[data-nav-pill]');
  const toggle = $('[data-nav-toggle]');
  const darkSections = $$('.work, .contact');
  let active = null;
  let hovered = null;

  // tmavá varianta nad tmavými sekcemi + ukazatel, kolik stránky je přečteno
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    const probe = nav.offsetHeight / 2;
    nav.classList.toggle('is-dark', darkSections.some((sec) => {
      const r = sec.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    }));
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  };
  onScroll();
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; onScroll(); });
  }, { passive: true });

  // pilulka jede pod odkazem, na kterém je myš, jinak pod aktuální sekcí
  const movePill = () => {
    const target = hovered || active;
    links.forEach((l) => l.classList.toggle('is-pill', l === target));
    if (!target) { pill.classList.remove('is-on'); return; }
    pill.style.width = `${target.offsetWidth}px`;
    pill.style.transform = `translateX(${target.offsetLeft}px)`;
    pill.classList.add('is-on');
  };
  links.forEach((l) => {
    l.addEventListener('pointerenter', () => { hovered = l; movePill(); });
    l.addEventListener('pointerleave', () => { hovered = null; movePill(); });
  });
  window.addEventListener('resize', movePill);

  if ('IntersectionObserver' in window) {
    const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const link = links.find((l) => l.getAttribute('href') === `#${e.target.id}`);
          if (e.isIntersecting) active = link;
          else if (active === link) active = null;
        }
        links.forEach((l) => (l === active ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
        movePill();
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((sec) => io.observe(sec));
  }

  // mobilní menu
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $('[data-nav-links]').addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/* ---------- Odhalování nadpisů při scrollu ---------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        // sourozenci se odhalí s malým zpožděním za sebou
        const siblings = $$('[data-reveal]', el.parentElement);
        el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 90}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  items.forEach((el) => io.observe(el));
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

/* ---------- Portfolio ---------- */
const icons = {
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
};

function initPortfolio(openGallery) {
  const list = $('[data-projects]');
  list.innerHTML = projects
    .map((p, i) => {
      const hasGallery = Array.isArray(p.gallery) && p.gallery.length > 0;
      const tag = hasGallery ? `${icons.gallery} Zobrazit galerii` : `${icons.link} Navštívit web`;
      const inner = `
        <div class="project__media">
          <img src="${escapeHtml(p.cover)}" alt="" loading="lazy" />
          <span class="project__tag">${tag}</span>
        </div>
        <div class="project__info">
          <h3 class="project__title">${escapeHtml(p.title)}</h3>
          <span class="project__meta">${escapeHtml(p.category)}, ${escapeHtml(p.year)}</span>
        </div>
        <p class="project__desc">${escapeHtml(p.description)}</p>`;
      const el = hasGallery
        ? `<button class="project" type="button" data-index="${i}" aria-haspopup="dialog">${inner}</button>`
        : p.link
          ? `<a class="project" href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${inner}</a>`
          : `<div class="project">${inner}</div>`;
      return `<li data-reveal>${el}</li>`;
    })
    .join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-index]');
    if (btn) openGallery(projects[Number(btn.dataset.index)], btn);
  });
}

/* ---------- Galerie ---------- */
function initLightbox() {
  const dialog = $('[data-lightbox]');
  const img = $('[data-lb-img]', dialog);
  const caption = $('[data-lb-caption]', dialog);
  const thumbs = $('[data-lb-thumbs]', dialog);
  const link = $('[data-lb-link]', dialog);
  let current = null;
  let index = 0;
  let opener = null;

  const show = (i, dir = 1) => {
    const items = current.gallery;
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.src;
    img.alt = item.alt || current.title;
    caption.textContent = item.alt || '';
    img.style.setProperty('--dir', dir);
    img.classList.remove('is-swapping');
    void img.offsetWidth; // restart animace
    img.classList.add('is-swapping');
    $$('button', thumbs).forEach((b, bi) => b.setAttribute('aria-current', String(bi === index)));
    // na mobilu jsou náhledy v posuvném řádku, aktivní ať je vždy vidět
    const active = thumbs.children[index];
    if (active && thumbs.scrollWidth > thumbs.clientWidth) {
      thumbs.scrollTo({ left: active.offsetLeft - (thumbs.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
    }
  };

  const open = (project, trigger) => {
    current = project;
    opener = trigger;
    $('[data-lb-title]', dialog).textContent = project.title;
    $('[data-lb-meta]', dialog).textContent = project.description;
    link.hidden = !project.link;
    if (project.link) link.href = project.link;
    dialog.classList.toggle('lightbox--single', project.gallery.length < 2);
    thumbs.innerHTML = project.gallery
      .map((g, i) => `<button type="button" data-thumb="${i}" aria-label="Obrázek ${i + 1}"><img src="${escapeHtml(g.src)}" alt="" /></button>`)
      .join('');
    project.gallery.forEach((g) => { const pre = new Image(); pre.decoding = 'async'; pre.src = g.src; });
    show(0);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lb-open');
  };

  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    const finish = () => {
      dialog.classList.remove('is-closing');
      dialog.close();
    };
    if (reduceMotion) return finish();
    dialog.classList.add('is-closing');
    setTimeout(finish, 280);
  };

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    document.documentElement.classList.remove('lb-open');
    opener?.focus();
  });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // klik mimo obsah
  $('[data-lb-close]', dialog).addEventListener('click', close);
  $('[data-lb-prev]', dialog).addEventListener('click', () => show(index - 1, -1));
  $('[data-lb-next]', dialog).addEventListener('click', () => show(index + 1, 1));
  thumbs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-thumb]');
    if (b) { const i = Number(b.dataset.thumb); show(i, i < index ? -1 : 1); }
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1, -1);
    if (e.key === 'ArrowRight') show(index + 1, 1);
  });

  // swipe na mobilu
  let startX = null;
  img.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    startX = null;
  });

  return open;
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = $$('input, textarea', form);
    let firstInvalid = null;
    fields.forEach((f) => {
      const ok = f.checkValidity() && f.value.trim() !== '';
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstInvalid) firstInvalid = f;
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
    const data = new FormData(form);
    const subject = `Poptávka z webu od ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`;
    // Zatím otevře e-mailového klienta. Později lze napojit např. na Formspree nebo Netlify Forms.
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'false');
  });

  $('[data-year]').textContent = new Date().getFullYear();
  $('[data-socials]').innerHTML = site.socials
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
    .join('');
}

initHero();
initNav();
const openGallery = initLightbox();
initPortfolio(openGallery);
initBuilder();
initContact();
initReveal();
initMagnet();

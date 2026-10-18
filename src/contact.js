// Kontaktní formulář (odesílá přes FormSubmit.co). Používá ho hlavní stránka i nová verze webu.
import { site } from './data/site.js';
import { $, $$, escapeHtml } from './shared.js';

/* ---------- Kontaktní formulář ---------- */
export function initContact() {
  const form = $('[data-form]');
  const error = $('[data-form-error]');
  const ok = $('[data-form-ok]');
  const submit = $('[data-form-submit]');
  // text tlačítka může být ve vlastním prvku (vedle ikonky), jinak se mění celé tlačítko
  const submitLabel = $('[data-label]', submit) || submit;
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
    submitLabel.textContent = 'Odesílám…';
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
      submitLabel.textContent = 'Odeslat zprávu';
    }
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'false');
  });
}

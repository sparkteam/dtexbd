(function () {
  if (window.dtexPaymentBound) return;
  window.dtexPaymentBound = true;

  function rootOf(node) {
    return node && node.closest('[data-dtex-pay]');
  }

  function sync(root) {
    if (!root) return;
    const bkash = root.querySelector('[data-dtex-pay-choice="bkash"]');
    const panel = root.querySelector('[data-dtex-bkash]');
    const numberInput = root.querySelector('[data-dtex-bkash-number-input]');
    const selected = Boolean(bkash && bkash.checked);
    root.classList.toggle('is-bkash', selected);
    if (panel) panel.hidden = !selected;
    if (numberInput) {
      numberInput.value = selected ? numberInput.dataset.dtexBkashNumberValue || '' : '';
    }
    if (!selected) {
      const error = root.querySelector('[data-dtex-pay-error]');
      const trx = root.querySelector('[data-dtex-trx]');
      if (error) error.hidden = true;
      if (trx) trx.removeAttribute('aria-invalid');
    }
  }

  document.addEventListener('change', function (event) {
    const choice = event.target.closest('[data-dtex-pay-choice]');
    if (!choice) return;
    sync(rootOf(choice));
  });

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-dtex-copy]');
    if (!button) return;
    event.preventDefault();
    const root = rootOf(button);
    const number = root.querySelector('[data-dtex-bkash-number]');
    const value = number ? number.textContent.replace(/\s+/g, '') : '';
    const done = function () {
      const original = button.dataset.dtexCopyLabel || button.textContent;
      button.dataset.dtexCopyLabel = original;
      button.textContent = 'Copied';
      window.setTimeout(function () {
        button.textContent = original;
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(function () {
        fallbackCopy(value);
        done();
      });
    } else {
      fallbackCopy(value);
      done();
    }
  });

  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id !== 'CartDrawer-Form' && form.id !== 'cart') return;
    const root =
      (form.id === 'cart' ? document.querySelector('#main-cart-footer [data-dtex-pay]') : null) ||
      document.querySelector('cart-drawer [data-dtex-pay]') ||
      form.querySelector('[data-dtex-pay]');
    if (!root) return;
    const bkash = root.querySelector('[data-dtex-pay-choice="bkash"]');
    const trx = root.querySelector('[data-dtex-trx]');
    const error = root.querySelector('[data-dtex-pay-error]');
    sync(root);
    if (!bkash || !bkash.checked) {
      if (trx) trx.value = '';
      return;
    }
    const id = (trx.value || '').replace(/\s+/g, '').toUpperCase();
    trx.value = id;
    if (!/^[A-Z0-9]{6,20}$/.test(id)) {
      event.preventDefault();
      if (error) error.hidden = false;
      trx.setAttribute('aria-invalid', 'true');
      trx.focus();
      return;
    }
    if (error) error.hidden = true;
    trx.removeAttribute('aria-invalid');
  });

  function fallbackCopy(value) {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
})();

/* Корзина: хранение в localStorage, выезжающая панель, оформление заявки на заказ. */
window.MZ = window.MZ || {};

MZ.cart = (() => {
  const KEY = 'mz-cart-v1';
  const { $, $$, icon, esc } = MZ.ui;
  let items = load();   // { productId: qty }
  let view = 'cart';    // cart | success
  let lastNumber = '';

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      // выбрасываем товары, которых больше нет в каталоге
      return Object.fromEntries(Object.entries(raw).filter(([id, q]) => MZ.productById(id) && q > 0));
    } catch (e) { return {}; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* приватный режим */ } }

  const qty = id => items[id] || 0;
  const count = () => Object.values(items).reduce((a, b) => a + b, 0);
  const lines = () => Object.entries(items).map(([id, q]) => ({ p: MZ.productById(id), qty: q }));
  const total = () => lines().reduce((s, l) => s + l.p.price * l.qty, 0);

  function set(id, q) {
    q = Math.max(0, Math.min(99, q));
    if (q) items[id] = q; else delete items[id];
    save();
    if (view === 'success') view = 'cart';
    render();
  }

  /* ---------- отрисовка ---------- */

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function renderCounters() {
    const n = count();
    $$('[data-cart-count]').forEach(el => { el.textContent = n; });
    $$('[data-cart-count-text]').forEach(el => { el.textContent = n ? n + ' ' + plural(n, 'товар', 'товара', 'товаров') : ''; });
    $$('[data-cart-sum]').forEach(el => { el.textContent = MZ.lead.money(total()); });
    const bar = $('.cart-bar');
    if (bar) {
      bar.classList.toggle('is-visible', n > 0);
      document.body.classList.toggle('has-cart-bar', n > 0);
    }
    $$('[data-buy]').forEach(el => {
      const q = String(qty(el.dataset.buy));
      if (el.dataset.q === q) return;
      el.dataset.q = q;
      el.innerHTML = MZ.ui.buyHtml(el.dataset.buy, +q, el.hasAttribute('data-buy-light'));
    });
  }

  function renderBody() {
    const body = $('#cartBody');
    if (!body) return;
    if (view === 'success') {
      body.innerHTML = MZ.ui.successHtml('Заказ отправлен!', 'Менеджер свяжется с вами в ближайшее время, чтобы подтвердить заказ и время доставки.', lastNumber) +
        `<button class="btn btn--navy btn--block" type="button" data-close-cart style="margin-top:24px">Продолжить покупки</button>`;
      return;
    }
    const ls = lines();
    if (!ls.length) {
      body.innerHTML = `<div class="cart-empty">
        <img class="em" src="assets/img/logo-160.webp" alt="" width="120" height="120">
        <h3>Корзина пока пуста</h3><p>Добавьте пельмени, манты или котлеты из каталога</p>
        <a class="btn btn--primary" href="catalog.html">Перейти в каталог</a></div>`;
      return;
    }
    const sum = total();
    const d = MZ.rules.delivery(sum);
    const deliveryText = d.cost == null ? 'уточнит менеджер' : d.cost === 0 ? 'бесплатно' : MZ.lead.money(d.cost);
    const grand = sum + (d.cost || 0);

    // форму не перерисовываем, если она уже есть - чтобы не потерять введенные данные
    const keepForm = $('#checkoutForm', body);
    const listHtml = ls.map(({ p, qty: q }) => `
      <div class="cart-line">
        <img src="${p.img}" alt="" width="76" height="57">
        <div><h4>${esc(p.name)}</h4><small>${esc(p.weight)} · ${MZ.lead.money(p.price)}</small>
          <div class="line-sum">${MZ.lead.money(p.price * q)}</div></div>
        <div class="cart-line__right">
          <div class="stepper stepper--light"><button type="button" data-dec="${p.id}" aria-label="Меньше">−</button><span>${q}</span><button type="button" data-inc="${p.id}" aria-label="Больше">+</button></div>
          <button class="remove" type="button" data-remove="${p.id}">Удалить</button>
        </div>
      </div>`).join('');
    const summaryHtml = `
      <div><span>Товары</span><b>${MZ.lead.money(sum)}</b></div>
      <div><span>Доставка</span><b>${deliveryText}</b></div>
      <div class="total"><span>Итого</span><span>${MZ.lead.money(grand)}</span></div>
      ${d.note ? `<span class="note ${d.ok ? '' : 'warn'}">${esc(d.note)}</span>` : ''}`;

    if (keepForm) {
      $('#cartLines', body).innerHTML = listHtml;
      $('#cartSummary', body).innerHTML = summaryHtml;
      $('button[type=submit]', keepForm).disabled = !d.ok;
      return;
    }
    body.innerHTML = `
      <div id="cartLines">${listHtml}</div>
      <div class="summary" id="cartSummary">${summaryHtml}</div>
      <h3 class="checkout-title">Оформление заявки</h3>
      <form id="checkoutForm" novalidate>
        <div class="field"><label for="c-name">Ваше имя</label>
          <input class="input" id="c-name" name="name" autocomplete="name" placeholder="Например, Алишер"><span class="field__err"></span></div>
        <div class="field"><label for="c-phone">Телефон</label>
          <input class="input" id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 (__) ___-__-__"><span class="field__err"></span></div>
        <div class="field"><label for="c-comment">Комментарий</label>
          <textarea class="input" id="c-comment" name="comment" rows="2" placeholder="Адрес и удобное время, если нужно"></textarea></div>
        ${MZ.ui.agreeHtml()}
        <button class="btn btn--primary btn--block" type="submit" ${d.ok ? '' : 'disabled'}>${icon('send')}Отправить заявку</button>
        <div class="form-error"></div>
        <p class="form-note">Оплата при получении. Менеджер перезвонит, чтобы подтвердить заказ.</p>
      </form>`;
    const form = $('#checkoutForm', body);
    MZ.ui.prepareForm(form);
    form.addEventListener('submit', submit);
  }

  function render() {
    renderCounters();
    renderBody();
  }

  /* ---------- оформление ---------- */

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = MZ.ui.readContact(form);
    if (!data) return;
    const sum = total();
    if (!MZ.rules.delivery(sum).ok) return;
    const btn = $('button[type=submit]', form);
    const errBox = $('.form-error', form);
    errBox.classList.remove('is-visible');
    MZ.ui.setBusy(btn, true);

    const res = await MZ.lead.send({
      type: 'order', ...data,
      items: lines().map(({ p, qty: q }) => ({ id: p.id, name: p.name, weight: p.weight, price: p.price, qty: q })),
      total: sum,
      delivery: MZ.rules.delivery(sum)
    });

    if (res.ok) {
      lastNumber = res.number;
      items = {};
      save();
      view = 'success';
      render();
      $('#cartBody').scrollTop = 0;
    } else {
      MZ.ui.setBusy(btn, false);
      errBox.innerHTML = `Не удалось отправить заявку. Проверьте интернет или позвоните нам: <a href="tel:${MZ.config.contacts.phoneHref}">${esc(MZ.config.contacts.phone)}</a>`;
      errBox.classList.add('is-visible');
    }
  }

  /* ---------- открытие/закрытие панели ---------- */

  function open() {
    if (view === 'success' && count()) view = 'cart';
    renderBody();
    MZ.ui.closeModal();
    $('#cartDrawer').classList.add('is-open');
    $('#cartDrawer').setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('is-open');
    document.body.classList.add('no-scroll');
    document.body.classList.remove('menu-open');
  }
  function close() {
    $('#cartDrawer').classList.remove('is-open');
    $('#cartDrawer').setAttribute('aria-hidden', 'true');
    $('#overlay').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (view === 'success') view = 'cart';
  }

  function bump() {
    $$('.cart-btn').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-remove],[data-open-cart],[data-close-cart],#overlay');
    if (!t) return;
    if (t.dataset.add) {
      set(t.dataset.add, 1);
      bump();
      MZ.ui.toast('«' + MZ.productById(t.dataset.add).name + '» в корзине');
    } else if (t.dataset.inc) { set(t.dataset.inc, qty(t.dataset.inc) + 1); bump(); }
    else if (t.dataset.dec) set(t.dataset.dec, qty(t.dataset.dec) - 1);
    else if (t.dataset.remove) set(t.dataset.remove, 0);
    else if (t.hasAttribute('data-open-cart')) open();
    else close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // корзина, измененная в другой вкладке
  window.addEventListener('storage', e => { if (e.key === KEY) { items = load(); render(); } });

  render();
  return { qty, count, total, lines, set, open, close, render };
})();

/* Общий интерфейс: иконки, шапка/подвал, модальные окна, тосты, анимации, формы заявок. */
window.MZ = window.MZ || {};

MZ.ui = (() => {
  const ICONS = {
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
    snow: '<path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    right: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    left: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    truck: '<path d="M10 17h4V5H2v12h3"/><path d="M14 8h4l4 4v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',
    chef: '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.1 5.1 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.1 5.1 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    thermo: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 9v6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M5 13v8h14v-8"/><path d="M10 21v-5h4v5"/>',
    list: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>'
  };
  const icon = (name, attrs = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICONS[name]}</svg>`;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  /* ---------- шапка, подвал, служебные слои ---------- */

  const NAV = [
    { id: 'home', href: 'index.html', label: 'Главная' },
    { id: 'catalog', href: 'catalog.html', label: 'Каталог' },
    { id: 'about', href: 'about.html', label: 'О компании' },
    { id: 'contacts', href: 'contacts.html', label: 'Контакты' }
  ];

  function renderLayout() {
    const page = document.body.dataset.page;
    const c = MZ.config.contacts;
    const header = $('#siteHeader');
    if (header) {
      header.innerHTML = `
        <div class="container header">
          <a class="logo" href="index.html" aria-label="${esc(MZ.config.brand)} — на главную">
            <img src="assets/img/logo-160.webp" alt="" width="58" height="58">
            <span class="logo__text"><b>${esc(MZ.config.brand)}</b><span>домашние полуфабрикаты</span></span>
          </a>
          <nav class="nav" aria-label="Основное меню">
            ${NAV.map(n => `<a href="${n.href}" class="${n.id === page ? 'is-active' : ''}">${n.label}</a>`).join('')}
          </nav>
          <a class="header__phone" href="tel:${c.phoneHref}">${esc(c.phone)}<small>${esc(c.hours.split(',')[0])}</small></a>
          <button class="cart-btn" type="button" data-open-cart aria-label="Корзина">
            ${icon('bag')}<span class="cart-btn__label">Корзина</span><span class="cart-btn__count" data-cart-count>0</span>
          </button>
          <button class="burger" type="button" aria-label="Меню" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
        <div class="mobile-menu" id="mobileMenu">
          ${NAV.map(n => `<a class="mm-link ${n.id === page ? 'is-active' : ''}" href="${n.href}">${n.label}${icon('right', 'width="22" height="22"')}</a>`).join('')}
          <div class="mobile-menu__contacts">
            <a href="tel:${c.phoneHref}">${esc(c.phone)}</a>
            <span style="color:var(--muted)">${esc(c.hours)}</span>
            <button class="btn btn--primary" type="button" data-lead="callback">${icon('phone')}Заказать звонок</button>
          </div>
        </div>`;

      const burger = $('.burger', header);
      burger.addEventListener('click', () => {
        const open = !document.body.classList.contains('menu-open');
        document.body.classList.toggle('menu-open', open);
        document.body.classList.toggle('no-scroll', open);
        burger.setAttribute('aria-expanded', open);
      });
      $$('#mobileMenu a, #mobileMenu button').forEach(a => a.addEventListener('click', () => {
        document.body.classList.remove('menu-open', 'no-scroll');
      }));
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const footer = $('#siteFooter');
    if (footer) {
      footer.innerHTML = `
        <div class="container">
          <div class="footer">
            <div>
              <a class="logo" href="index.html"><img src="assets/img/logo-160.webp" alt="" width="58" height="58">
                <span class="logo__text"><b>${esc(MZ.config.brand)}</b><span>домашние полуфабрикаты</span></span></a>
              <p>Замороженные полуфабрикаты ручной лепки: пельмени, манты, хинкали, котлеты, долма и многое другое.</p>
            </div>
            <div><h4>Разделы</h4><ul>${NAV.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul></div>
            <div><h4>Продукция</h4><ul>${MZ.categories.slice(1).map(cat => `<li><a href="catalog.html#${cat.id}">${cat.name}</a></li>`).join('')}</ul></div>
            <div><h4>Контакты</h4><ul>
              <li><a href="tel:${c.phoneHref}">${esc(c.phone)}</a></li>
              <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
              <li>${esc(c.address)}</li>
              <li>${esc(c.hours)}</li></ul>
              <div class="socials" style="margin-top:16px">
                <a href="${esc(c.telegram)}" aria-label="Telegram">${icon('send')}</a>
                <a href="${esc(c.instagram)}" aria-label="Instagram">${icon('insta')}</a>
              </div>
            </div>
          </div>
          <div class="footer__bottom">
            <span>© ${new Date().getFullYear()} ${esc(MZ.config.brand)}. Все права защищены.</span>
            <span>Демо-версия сайта</span>
          </div>
        </div>`;
    }

    document.body.insertAdjacentHTML('beforeend', `
      <div class="overlay" id="overlay"></div>
      <aside class="drawer" id="cartDrawer" aria-label="Корзина" aria-hidden="true">
        <div class="drawer__head"><h2>Корзина <span data-cart-count-text></span></h2>
          <button class="icon-btn" type="button" data-close-cart aria-label="Закрыть">${icon('x')}</button></div>
        <div class="drawer__body" id="cartBody"></div>
      </aside>
      <div class="modal" id="modal" aria-hidden="true">
        <div class="modal__backdrop" data-close></div>
        <div class="modal__box" role="dialog" aria-modal="true">
          <button class="icon-btn modal__close" type="button" data-close aria-label="Закрыть">${icon('x')}</button>
          <div class="modal__content"></div>
        </div>
      </div>
      <button class="cart-bar" type="button" data-open-cart>
        <span><b data-cart-sum>0</b><small data-cart-count-text></small></span>
        <span class="go">Корзина ${icon('right')}</span>
      </button>
      <div class="toasts" id="toasts"></div>`);
  }

  /* ---------- модальное окно ---------- */

  let lastFocus = null;
  function openModal(html, { wide = false } = {}) {
    const modal = $('#modal');
    const box = $('.modal__box', modal);
    box.classList.toggle('modal__box--wide', wide);
    $('.modal__content', modal).innerHTML = html;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    box.scrollTop = 0;
    setTimeout(() => { const f = $('input, button:not(.modal__close)', box); if (f && window.innerWidth > 640) f.focus(); }, 60);
    return $('.modal__content', modal);
  }
  function closeModal() {
    const modal = $('#modal');
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!$('#cartDrawer.is-open')) document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- тосты ---------- */

  function toast(text, ic = 'checkCircle') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(ic) + '<span>' + esc(text) + '</span>';
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); }, 2200);
  }

  /* ---------- анимации: появление, пауза вне экрана, снег, счётчики ---------- */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function observeReveal(root = document) {
    const els = $$('.reveal:not(.is-in)', root);
    if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }

  // Бесконечные анимации (снег, вращение) ставим на паузу, когда блок не виден
  function pauseOffscreen() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(en => en.target.classList.toggle('anim-off', !en.isIntersecting)));
    $$('[data-anim]').forEach(e => io.observe(e));
    document.addEventListener('visibilitychange', () => document.body.classList.toggle('anim-off', document.hidden));
  }

  function snow(container, count = 18) {
    if (!container || reduceMotion) return;
    const glyphs = ['❄', '❅', '❆', '•'];
    let html = '';
    for (let i = 0; i < count; i++) {
      const size = 8 + Math.random() * 16;
      html += `<i style="left:${Math.random() * 100}%;font-size:${size}px;opacity:${(.25 + Math.random() * .45).toFixed(2)};` +
        `animation-duration:${(9 + Math.random() * 10).toFixed(1)}s;animation-delay:-${(Math.random() * 18).toFixed(1)}s;` +
        `--drift:${Math.round(Math.random() * 80 - 40)}px">${glyphs[i % glyphs.length]}</i>`;
    }
    container.innerHTML = html;
  }

  function counters(root = document) {
    const els = $$('[data-count]', root);
    const run = el => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now(), dur = 1600;
      const step = now => {
        const k = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (reduceMotion || !('IntersectionObserver' in window)) return; // в HTML уже стоят итоговые числа
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: .5 });
    els.forEach(e => { e.textContent = '0' + (e.dataset.suffix || ''); io.observe(e); });
  }

  /* ---------- карточка товара и окно товара ---------- */

  const BADGES = { hit: '<span class="badge">Хит продаж</span>', new: '<span class="badge badge--new">Новинка</span>' };

  function buyHtml(id, qty, light = false) {
    if (!qty) return `<button class="btn btn--sm btn--primary" type="button" data-add="${id}">${icon('bag')}В корзину</button>`;
    return `<div class="stepper ${light ? 'stepper--light' : ''}">
      <button type="button" data-dec="${id}" aria-label="Меньше">−</button><span>${qty}</span>
      <button type="button" data-inc="${id}" aria-label="Больше">+</button></div>`;
  }

  function card(p, extraClass = '') {
    const qty = MZ.cart ? MZ.cart.qty(p.id) : 0;
    return `<article class="card ${extraClass}" data-id="${p.id}">
      <button class="card__media" type="button" data-open="${p.id}" aria-label="Подробнее: ${esc(p.name)}">
        ${BADGES[p.badge] || ''}<img src="${p.img}" alt="${esc(p.name)}" width="320" height="240" loading="lazy">
      </button>
      <div class="card__body">
        <div class="card__meta">${esc(p.weight)}</div>
        <h3 class="card__title"><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
        <p class="card__desc">${esc(p.short)}</p>
        <div class="card__foot">
          <div class="price">${MZ.lead.money(p.price).replace(/ сум$/, '')} <small>сум</small></div>
          <div class="buy" data-buy="${p.id}" data-q="${qty}">${buyHtml(p.id, qty)}</div>
        </div>
      </div>
    </article>`;
  }

  function openProduct(id) {
    const p = MZ.productById(id);
    if (!p) return;
    const cat = MZ.categories.find(c => c.id === p.cat);
    openModal(`
      <div class="pmodal">
        <div class="pmodal__media">${BADGES[p.badge] || ''}<img src="${p.img}" alt="${esc(p.name)}" width="320" height="240"></div>
        <div class="pmodal__body">
          <div class="eyebrow">${icon('snow')}${esc(cat ? cat.name : '')}</div>
          <h2>${esc(p.name)}</h2>
          <div class="pmodal__weight">${esc(p.weight)}</div>
          <p class="pmodal__desc">${esc(p.desc)}</p>
          <dl>
            <div><dt>Состав</dt><dd>${esc(p.composition)}</dd></div>
            <div><dt>Приготовление</dt><dd>${esc(p.cook)}</dd></div>
            <div><dt>Хранение</dt><dd>При −18 °C — 6 месяцев. Повторно не замораживать.</dd></div>
          </dl>
          <div class="pmodal__buy">
            <div class="price">${MZ.lead.money(p.price).replace(/ сум$/, '')} <small>сум</small></div>
            <div class="buy" data-buy="${p.id}" data-buy-light data-q="${MZ.cart.qty(p.id)}">${buyHtml(p.id, MZ.cart.qty(p.id), true)}</div>
          </div>
        </div>
      </div>`, { wide: true });
  }

  /* ---------- формы заявок ---------- */

  function setError(field, on, text) {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('has-error', on);
    const err = $('.field__err', wrap);
    if (err && text) err.textContent = text;
  }

  // Проверка имени и телефона; возвращает данные формы или null
  function readContact(form) {
    const name = form.elements.name;
    const phone = form.elements.phone;
    let ok = true;
    if (name.value.trim().length < 2) { setError(name, true, 'Укажите имя'); ok = false; } else setError(name, false);
    if (!MZ.lead.isPhoneValid(phone.value)) { setError(phone, true, 'Номер целиком: +998 (XX) XXX-XX-XX'); ok = false; } else setError(phone, false);
    if (!ok) { const bad = $('.has-error .input', form); if (bad) bad.focus(); return null; }
    return {
      name: name.value.trim(),
      phone: MZ.lead.formatPhone(phone.value),
      company: form.elements.company ? form.elements.company.value.trim() : '',
      comment: form.elements.comment ? form.elements.comment.value.trim() : ''
    };
  }

  function prepareForm(form) {
    if (form.elements.phone) MZ.lead.maskPhone(form.elements.phone);
    $$('.input', form).forEach(inp => inp.addEventListener('input', () => setError(inp, false)));
  }

  function setBusy(btn, busy, label) {
    if (busy) { btn.dataset.label = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span>' + (label || 'Отправляем…'); btn.disabled = true; }
    else { btn.innerHTML = btn.dataset.label || btn.innerHTML; btn.disabled = false; }
  }

  function successHtml(title, text, number) {
    return `<div class="success">
      <div class="success__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17l9-10"/></svg></div>
      <h3>${esc(title)}</h3><p>${esc(text)}</p>${number ? `<span class="num">№ ${esc(number)}</span>` : ''}</div>`;
  }

  function bindLeadForm(form, type) {
    prepareForm(form);
    const errBox = $('.form-error', form);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = readContact(form);
      if (!data) return;
      const btn = $('button[type=submit]', form);
      setBusy(btn, true);
      if (errBox) errBox.classList.remove('is-visible');
      const res = await MZ.lead.send({ type, ...data });
      if (res.ok) {
        form.innerHTML = successHtml('Спасибо, заявка принята!', 'Менеджер перезвонит вам в рабочее время в течение 15 минут.', res.number);
      } else {
        setBusy(btn, false);
        if (errBox) {
          errBox.innerHTML = `Не удалось отправить заявку. Проверьте интернет или позвоните нам: <a href="tel:${MZ.config.contacts.phoneHref}">${esc(MZ.config.contacts.phone)}</a>`;
          errBox.classList.add('is-visible');
        }
      }
    });
  }

  const LEAD_MODALS = {
    callback: { title: 'Заказать звонок', lead: 'Оставьте номер — перезвоним и поможем с выбором и доставкой.', company: false },
    wholesale: { title: 'Оптовым покупателям', lead: 'Магазинам, кафе и ресторанам — специальные цены и доставка по графику.', company: true }
  };

  function leadFormHtml(type, { company = false, submit = 'Отправить заявку' } = {}) {
    return `<form novalidate>
      <div class="field"><label for="f-name-${type}">Ваше имя</label>
        <input class="input" id="f-name-${type}" name="name" autocomplete="name" placeholder="Например, Алишер"><span class="field__err"></span></div>
      <div class="field"><label for="f-phone-${type}">Телефон</label>
        <input class="input" id="f-phone-${type}" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 (__) ___-__-__"><span class="field__err"></span></div>
      ${company ? `<div class="field"><label for="f-company-${type}">Компания / магазин</label>
        <input class="input" id="f-company-${type}" name="company" placeholder="Необязательно"></div>` : ''}
      <button class="btn btn--primary btn--block" type="submit">${submit}</button>
      <div class="form-error"></div>
      <p class="form-note">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
    </form>`;
  }

  function openLead(type) {
    const m = LEAD_MODALS[type] || LEAD_MODALS.callback;
    const box = openModal(`<h2>${m.title}</h2><p class="modal__lead">${m.lead}</p>${leadFormHtml(type, { company: m.company })}`);
    bindLeadForm($('form', box), type);
  }

  /* ---------- общие обработчики ---------- */

  function init() {
    renderLayout();
    document.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) closeModal();
      const lead = e.target.closest('[data-lead]');
      if (lead) { e.preventDefault(); openLead(lead.dataset.lead); }
      const open = e.target.closest('[data-open]');
      if (open) { e.preventDefault(); openProduct(open.dataset.open); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    observeReveal();
    pauseOffscreen();
  }

  return { icon, esc, $, $$, init, openModal, closeModal, toast, observeReveal, snow, counters, card, buyHtml, openProduct,
    readContact, prepareForm, setBusy, successHtml, bindLeadForm, leadFormHtml, openLead };
})();

MZ.ui.init();

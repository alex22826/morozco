/* Код отдельных страниц: главная (баннер), каталог, о компании, контакты. */
(() => {
  const { $, $$, esc } = MZ.ui;
  const page = document.body.dataset.page;

  $$('.snow').forEach(s => MZ.ui.snow(s, window.innerWidth < 640 ? 10 : 18));

  /* ---------- баннер-слайдер ---------- */
  function initSlider(root) {
    const slides = $$('.slide', root);
    const dots = $('.slider__dots', root);
    if (slides.length < 2) return;
    let cur = 0, timer = null;
    dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Слайд ${i + 1}"></button>`).join('');

    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === cur); s.setAttribute('aria-hidden', k !== cur); });
      $$('button', dots).forEach((d, k) => d.classList.toggle('is-active', k === cur));
    }
    const play = () => { stop(); timer = setInterval(() => go(cur + 1), 6500); };
    const stop = () => clearInterval(timer);

    dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { go($$('button', dots).indexOf(b)); play(); } });
    $('[data-prev]', root).addEventListener('click', () => { go(cur - 1); play(); });
    $('[data-next]', root).addEventListener('click', () => { go(cur + 1); play(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

    // свайп на телефоне
    let x0 = null, y0 = null;
    root.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1)); play(); }
      x0 = null;
    });
    go(0);
    play();
  }

  /* ---------- главная ---------- */
  if (page === 'home') {
    initSlider($('.hero'));
    const popular = [...MZ.products.filter(p => p.badge), ...MZ.products.filter(p => !p.badge)].slice(0, 8);
    $('#popular').innerHTML = popular.map((p, i) => MZ.ui.card(p, 'reveal reveal-d' + (i % 4))).join('');
    MZ.ui.observeReveal($('#popular'));

    const wf = $('#wholesaleForm');
    wf.innerHTML = MZ.ui.leadFormHtml('wholesale', { company: true, submit: 'Получить оптовый прайс' });
    MZ.ui.bindLeadForm($('form', wf), 'wholesale');
  }

  /* ---------- каталог ---------- */
  if (page === 'catalog') {
    const state = { cat: 'all', q: '', sort: 'popular' };
    const grid = $('#catalogGrid');
    const chips = $('#chips');
    const countEl = $('#catalogCount');

    chips.innerHTML = MZ.categories.map(c => {
      const n = c.id === 'all' ? MZ.products.length : MZ.products.filter(p => p.cat === c.id).length;
      return `<button class="chip" type="button" data-cat="${c.id}">${esc(c.name)}<sup>${n}</sup></button>`;
    }).join('');

    function readHash() {
      const h = decodeURIComponent(location.hash.slice(1));
      state.cat = MZ.categories.some(c => c.id === h) ? h : 'all';
    }

    function render() {
      $$('.chip', chips).forEach(c => c.classList.toggle('is-active', c.dataset.cat === state.cat));
      const q = state.q.toLowerCase();
      let list = MZ.products.filter(p => (state.cat === 'all' || p.cat === state.cat) &&
        (!q || (p.name + ' ' + p.short + ' ' + p.composition).toLowerCase().includes(q)));
      if (state.sort === 'cheap') list = list.slice().sort((a, b) => a.price - b.price);
      if (state.sort === 'expensive') list = list.slice().sort((a, b) => b.price - a.price);
      if (state.sort === 'popular') list = list.slice().sort((a, b) => (b.badge === 'hit') - (a.badge === 'hit'));

      const n = list.length;
      countEl.textContent = n ? `Найдено: ${n}` : '';
      grid.innerHTML = n
        ? list.map((p, i) => MZ.ui.card(p, 'is-enter').replace('class="card is-enter"', `class="card is-enter" style="animation-delay:${Math.min(i, 8) * 45}ms"`)).join('')
        : `<div class="empty" style="grid-column:1/-1">${MZ.ui.icon('search')}<h3>Ничего не нашли</h3><p>Попробуйте другой запрос или выберите «Вся продукция».</p></div>`;
    }

    chips.addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state.cat = b.dataset.cat;
      history.replaceState(null, '', state.cat === 'all' ? location.pathname : '#' + state.cat);
      render();
      b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    let t;
    $('#search').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 150); });
    $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
    window.addEventListener('hashchange', () => { readHash(); render(); });

    // тень у панели фильтров, когда она прилипла к шапке
    const toolbar = $('.toolbar');
    const sentinel = document.createElement('div');
    toolbar.before(sentinel);
    new IntersectionObserver(([en]) => toolbar.classList.toggle('is-stuck', !en.isIntersecting),
      { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) + 1}px 0px 0px 0px` }).observe(sentinel);

    readHash();
    render();
  }

  /* ---------- о компании ---------- */
  if (page === 'about') MZ.ui.counters();

  /* ---------- контакты ---------- */
  if (page === 'contacts') {
    const c = MZ.config.contacts;
    $('#contactList').innerHTML = `
      <a class="contact-item reveal" href="tel:${c.phoneHref}"><i>${MZ.ui.icon('phone')}</i><span><small>Отдел продаж</small><b>${esc(c.phone)}</b></span></a>
      <a class="contact-item reveal reveal-d1" href="tel:${c.phone2Href}"><i>${MZ.ui.icon('chat')}</i><span><small>Опт и сотрудничество</small><b>${esc(c.phone2)}</b></span></a>
      <a class="contact-item reveal reveal-d2" href="mailto:${esc(c.email)}"><i>${MZ.ui.icon('mail')}</i><span><small>Почта</small><b>${esc(c.email)}</b></span></a>
      <div class="contact-item reveal reveal-d3"><i>${MZ.ui.icon('pin')}</i><span><small>Адрес склада и офиса</small><b>${esc(c.address)}</b></span></div>
      <div class="contact-item reveal reveal-d3"><i>${MZ.ui.icon('clock')}</i><span><small>Режим работы</small><b>${esc(c.hours)}</b></span></div>`;
    MZ.ui.observeReveal($('#contactList'));

    const cf = $('#contactForm');
    cf.innerHTML = MZ.ui.leadFormHtml('contact', { submit: 'Отправить' })
      .replace('<button class="btn', `<div class="field"><label for="f-comment-contact">Сообщение</label>
        <textarea class="input" id="f-comment-contact" name="comment" rows="3" placeholder="Вопрос, пожелание или удобное время для звонка"></textarea></div><button class="btn`);
    MZ.ui.bindLeadForm($('form', cf), 'callback');

    // карту подгружаем, только когда до неё доскроллили
    const map = $('#map');
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      const { lat, lon } = c.map;
      map.innerHTML = `<iframe title="Карта" loading="lazy" src="https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=15&pt=${lon},${lat},pm2rdm"></iframe>`;
    }, { rootMargin: '200px' }).observe(map);
  }
})();

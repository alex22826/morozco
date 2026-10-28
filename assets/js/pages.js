/* Код отдельных страниц: главная (баннер), каталог, о компании, контакты. */
(() => {
  const { $, $$, esc } = MZ.ui;
  const page = document.body.dataset.page;

  $$('.snow').forEach(s => MZ.ui.snow(s, window.innerWidth < 640 ? 10 : 18));

  /* ---------- баннер-слайдер ---------- */
  function initSlider(root) {
    const slides = $$('.slide', root);
    const dots = $('.slider__dots', root);
    const bgs = $$('.hero__bg img', root); // фото под слайдами, по одному на слайд
    if (slides.length < 2) return;
    let cur = 0, timer = null;
    dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Слайд ${i + 1}"></button>`).join('');

    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === cur); s.setAttribute('aria-hidden', k !== cur); });
      $$('button', dots).forEach((d, k) => d.classList.toggle('is-active', k === cur));
      bgs.forEach((b, k) => b.classList.toggle('is-active', k === cur));
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
    // пустые cats/tags = «Вся продукция»
    const state = { cats: new Set(), tags: new Set(), q: '', sort: 'popular' };
    const TAGS = [{ id: 'hit', name: 'Хиты продаж' }, { id: 'new', name: 'Новинки' }];
    const CATS = MZ.categories.filter(c => c.id !== 'all');
    const grid = $('#catalogGrid');
    const countEl = $('#catalogCount');
    const sheet = $('#filters');
    const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? b : c);
    const goods = n => n + ' ' + plural(n, 'товар', 'товара', 'товаров');

    const checkItem = (group, value, label, count) => `
      <label class="check">
        <input type="checkbox" data-group="${group}" value="${value}">
        <span class="check__box">${MZ.ui.icon('check')}</span>
        <span class="check__label">${esc(label)}</span><span class="check__count">${count}</span>
      </label>`;
    $('#catFilter').innerHTML = checkItem('all', 'all', 'Вся продукция', MZ.products.length) +
      CATS.map(c => checkItem('cat', c.id, c.name, MZ.products.filter(p => p.cat === c.id).length)).join('');
    $('#tagFilter').innerHTML = TAGS.map(t => checkItem('tag', t.id, t.name, MZ.products.filter(p => p.badge === t.id).length)).join('');

    MZ.ui.dropdown($('#sortDd'), {
      label: 'Сортировка', iconName: 'sort', value: state.sort,
      options: [
        { value: 'popular', label: 'Сначала хиты', short: 'Хиты' },
        { value: 'cheap', label: 'Сначала дешевле', short: 'Дешевле' },
        { value: 'expensive', label: 'Сначала дороже', short: 'Дороже' },
        { value: 'name', label: 'По названию', short: 'А-Я' }
      ],
      onChange: v => { state.sort = v; render(); }
    });

    // в адресе - выбранные категории: catalog.html#pelmeni,manty
    function readHash() {
      const ids = decodeURIComponent(location.hash.slice(1)).split(',');
      state.cats = new Set(ids.filter(id => CATS.some(c => c.id === id)));
    }
    function writeHash() {
      const h = [...state.cats].join(',');
      history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
    }

    function filtered() {
      const q = state.q.toLowerCase();
      let list = MZ.products.filter(p =>
        (!state.cats.size || state.cats.has(p.cat)) &&
        (!state.tags.size || state.tags.has(p.badge)) &&
        (!q || (p.name + ' ' + p.short + ' ' + p.composition).toLowerCase().includes(q)));
      const rank = p => (p.badge === 'hit' ? 2 : p.badge === 'new' ? 1 : 0);
      if (state.sort === 'popular') list = list.slice().sort((a, b) => rank(b) - rank(a));
      if (state.sort === 'cheap') list = list.slice().sort((a, b) => a.price - b.price);
      if (state.sort === 'expensive') list = list.slice().sort((a, b) => b.price - a.price);
      if (state.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      return list;
    }

    function syncFilters(n) {
      $$('input[type=checkbox]', sheet).forEach(inp => {
        inp.checked = inp.dataset.group === 'all' ? !state.cats.size
          : inp.dataset.group === 'cat' ? state.cats.has(inp.value) : state.tags.has(inp.value);
      });
      const active = state.cats.size + state.tags.size;
      $('#filterCount').hidden = !active;
      $('#filterCount').textContent = active;
      $('.filters__reset').hidden = !active;
      $('#filtersApply').textContent = n ? 'Показать ' + goods(n) : 'Ничего не найдено';

      const chips = [
        ...[...state.cats].map(id => ({ key: 'cat:' + id, label: CATS.find(c => c.id === id).name })),
        ...[...state.tags].map(id => ({ key: 'tag:' + id, label: TAGS.find(t => t.id === id).name })),
        ...(state.q ? [{ key: 'q:', label: '«' + state.q + '»' }] : [])
      ];
      $('#activeFilters').innerHTML = chips.length
        ? chips.map(c => `<button class="af" type="button" data-remove-filter="${esc(c.key)}" aria-label="Убрать фильтр ${esc(c.label)}">${esc(c.label)}${MZ.ui.icon('x')}</button>`).join('') +
          '<button class="af af--reset" type="button" data-filters-reset>Сбросить все</button>'
        : '';
    }

    function render() {
      const list = filtered();
      const n = list.length;
      syncFilters(n);
      countEl.textContent = n ? goods(n) : '';
      grid.innerHTML = n
        ? list.map((p, i) => MZ.ui.card(p, 'is-enter').replace('class="card is-enter"', `class="card is-enter" style="animation-delay:${Math.min(i, 8) * 40}ms"`)).join('')
        : `<div class="empty" style="grid-column:1/-1">${MZ.ui.icon('search')}<h3>Ничего не нашли</h3>
             <p>Попробуйте другой запрос или снимите часть фильтров.</p>
             <button class="btn btn--navy btn--sm" type="button" data-filters-reset style="margin-top:16px">Показать всю продукцию</button></div>`;
    }

    function reset() {
      state.cats.clear();
      state.tags.clear();
      state.q = '';
      $('#search').value = '';
      writeHash();
      render();
    }

    sheet.addEventListener('change', e => {
      const inp = e.target.closest('input[type=checkbox]');
      if (!inp) return;
      const { group } = inp.dataset;
      if (group === 'all') state.cats.clear();
      else {
        const set = group === 'cat' ? state.cats : state.tags;
        if (inp.checked) set.add(inp.value); else set.delete(inp.value);
        // отмечены все категории - это и есть «Вся продукция»
        if (group === 'cat' && state.cats.size === CATS.length) state.cats.clear();
      }
      writeHash();
      render();
    });

    // на телефоне фильтры - выезжающая снизу панель
    const isSheet = () => window.matchMedia('(max-width: 900px)').matches;
    const syncAria = () => sheet.setAttribute('aria-hidden', isSheet() && !document.body.classList.contains('filters-open'));
    function openSheet() {
      document.body.classList.add('filters-open', 'no-scroll');
      syncAria();
    }
    function closeSheet() {
      if (!document.body.classList.contains('filters-open')) return;
      document.body.classList.remove('filters-open', 'no-scroll');
      syncAria();
      const main = $('.catalog__main');
      if (main.getBoundingClientRect().top < 0) main.scrollIntoView({ behavior: 'smooth' });
    }
    window.addEventListener('resize', syncAria);
    syncAria();

    document.addEventListener('click', e => {
      if (e.target.closest('[data-filters-open]')) openSheet();
      else if (e.target.closest('[data-filters-close]')) closeSheet();
      else if (e.target.closest('[data-filters-reset]')) reset();
      const rm = e.target.closest('[data-remove-filter]');
      if (rm) {
        const [kind, id] = rm.dataset.removeFilter.split(':');
        if (kind === 'cat') state.cats.delete(id);
        if (kind === 'tag') state.tags.delete(id);
        if (kind === 'q') { state.q = ''; $('#search').value = ''; }
        writeHash();
        render();
      }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

    let t;
    $('#search').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 200); });
    $('#search').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
    window.addEventListener('hashchange', () => { readHash(); render(); });

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
    cf.innerHTML = MZ.ui.leadFormHtml('contact', {
      submit: 'Отправить',
      extra: `<div class="field"><label for="f-comment-contact">Сообщение</label>
        <textarea class="input" id="f-comment-contact" name="comment" rows="3" placeholder="Вопрос, пожелание или удобное время для звонка"></textarea></div>`
    });
    MZ.ui.bindLeadForm($('form', cf), 'callback');

    // Карта Яндекса ставит свои cookie: грузим ее только после «Принять все» или по кнопке
    const map = $('#map');
    const { lat, lon } = c.map;
    let mapLoaded = false;
    function loadMap() {
      if (mapLoaded) return;
      mapLoaded = true;
      map.innerHTML = `<iframe title="Карта" loading="lazy" src="https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=15&pt=${lon},${lat},pm2rdm"></iframe>`;
    }
    function mapStub() {
      map.innerHTML = `<div class="map__stub">${MZ.ui.icon('pin')}<b>Карта проезда</b>
        <p>Карта Яндекса использует cookie. Показать ее на странице или открыть в приложении?</p>
        <div class="btns">
          <button class="btn btn--navy btn--sm" type="button" data-map-load>Показать карту</button>
          <a class="btn btn--outline btn--sm" href="https://yandex.ru/maps/?pt=${lon},${lat}&z=16&l=map" target="_blank" rel="noopener">Открыть в Яндекс Картах</a>
        </div></div>`;
    }
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      if (MZ.ui.cookieConsent.get() === 'all') loadMap(); else mapStub();
    }, { rootMargin: '200px' }).observe(map);
    map.addEventListener('click', e => { if (e.target.closest('[data-map-load]')) loadMap(); });
    document.addEventListener('mz:cookie-consent', e => { if (e.detail === 'all' && map.innerHTML) loadMap(); });
  }

  /* ---------- юридические страницы: содержание и подсветка текущего раздела ---------- */
  if (page === 'legal') {
    const heads = $$('.legal__body h2[id]');
    $('#toc').innerHTML = heads.map(h => `<a href="#${h.id}">${esc(h.textContent)}</a>`).join('');
    const links = $$('#toc a');
    const toc = $('.legal__toc');
    // на ПК содержание раскрыто, на телефоне свернуто; реагируем только на смену ширины -
    // мобильные браузеры шлют resize при прокрутке, когда прячется адресная строка
    let lastW = window.innerWidth;
    const syncOpen = () => { toc.open = window.innerWidth > 900; };
    syncOpen();
    window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; syncOpen(); } });
    links.forEach(a => a.addEventListener('click', () => { if (window.innerWidth <= 900) toc.open = false; }));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(h => io.observe(h));
    const current = location.pathname.split('/').pop();
    $$('.legal__docs a').forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === current));
  }
})();

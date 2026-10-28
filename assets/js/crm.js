/* Панель заявок: слушает канал ntfy, хранит заявки и статусы в этом браузере. */
(() => {
  const KEY = 'mz-crm-v1';
  const cfg = MZ.config.leads;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = {
    bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    sound: svg('<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>'),
    mute: svg('<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/>'),
    phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>'),
    copy: svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    ok: svg('<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>')
  };
  const STATUSES = { new: 'Новая', work: 'В работе', done: 'Выполнена', cancel: 'Отменена' };

  /* ---------- хранилище ---------- */
  let db = load();
  function load() {
    try { return Object.assign({ leads: {}, lastId: '', sound: true }, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return { leads: {}, lastId: '', sound: true }; }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* нет места */ } };

  const state = { tab: 'all', q: '', unseen: 0 };
  const openedAt = Date.now();

  /* ---------- приём сообщений ntfy ---------- */
  function accept(msg) {
    if (msg.event !== 'message' || db.leads[msg.id]) return;
    const lead = MZ.lead.parse(msg.message);
    if (!lead.name && !lead.phone) return; // посторонние сообщения в теме
    db.leads[msg.id] = Object.assign(lead, { id: msg.id, time: msg.time * 1000, status: 'new' });
    db.lastId = msg.id;
    save();
    const live = msg.time * 1000 > openedAt - 5000;
    render(live ? msg.id : null);
    if (live) notify(lead);
  }

  let es = null, retry = 0;
  function connect() {
    if (!cfg.ntfyTopic) { setLive('off', 'Канал ntfy не настроен'); return; }
    if (es) es.close();
    const since = db.lastId || '24h';
    es = new EventSource(`${cfg.ntfyServer}/${encodeURIComponent(cfg.ntfyTopic)}/sse?since=${encodeURIComponent(since)}`);
    es.onopen = () => { retry = 0; setLive('on', 'Онлайн'); };
    es.onmessage = e => { try { accept(JSON.parse(e.data)); } catch (err) { console.warn(err); } };
    es.onerror = () => {
      setLive('off', 'Нет связи, переподключаюсь…');
      es.close();
      // переподключаемся с последней полученной заявки, чтобы ничего не пропустить
      setTimeout(connect, Math.min(30000, 2000 * Math.pow(2, retry++)));
    };
  }
  function setLive(mode, text) {
    const el = $('#live');
    el.className = 'live ' + (mode === 'on' ? 'is-on' : mode === 'off' ? 'is-off' : '');
    el.querySelector('span').textContent = text;
  }

  /* ---------- уведомления ---------- */
  function beep() {
    if (!db.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, .18].forEach((t, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = i ? 1046 : 784;
        g.gain.setValueAtTime(.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(.25, ctx.currentTime + t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + t + .3);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + .32);
      });
    } catch (e) { /* звук недоступен */ }
  }
  function notify(lead) {
    beep();
    toast('Новая заявка: ' + (lead.name || '') + (lead.total ? ' · ' + MZ.lead.money(lead.total) : ''));
    if (document.hidden) { state.unseen++; document.title = `(${state.unseen}) Заявки — Moroz'Co`; }
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Новая заявка с сайта', {
          body: [lead.name, lead.phone, lead.total ? MZ.lead.money(lead.total) : lead.typeLabel].filter(Boolean).join(' · '),
          icon: '../assets/img/favicon.png', tag: lead.number
        });
      } catch (e) { /* мобильные браузеры без Notification-конструктора */ }
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { state.unseen = 0; document.title = "Заявки — Moroz'Co"; } });

  function toast(text) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = IC.ok + '<span>' + esc(text) + '</span>';
    box.appendChild(el);
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); }, 3000);
  }

  function renderButtons() {
    const n = $('#btnNotify');
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    n.innerHTML = IC.bell + '<span class="lbl">' + (perm === 'granted' ? 'Уведомления вкл.' : perm === 'denied' ? 'Уведомления запрещены' : 'Включить уведомления') + '</span>';
    n.classList.toggle('is-on', perm === 'granted');
    n.hidden = perm === 'unsupported';
    const s = $('#btnSound');
    s.innerHTML = (db.sound ? IC.sound : IC.mute) + '<span class="lbl">' + (db.sound ? 'Звук вкл.' : 'Звук выкл.') + '</span>';
    s.classList.toggle('is-on', db.sound);
  }

  /* ---------- отрисовка ---------- */
  function fmtTime(ms) {
    const d = new Date(ms), now = new Date();
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return 'сегодня, ' + time;
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'вчера, ' + time;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ', ' + time;
  }

  function render(freshId) {
    const all = Object.values(db.leads).sort((a, b) => b.time - a.time);
    const by = s => all.filter(l => l.status === s).length;
    const today = new Date().toDateString();
    const todayOrders = all.filter(l => new Date(l.time).toDateString() === today && l.type === 'order' && l.status !== 'cancel');

    $('#kpis').innerHTML = `
      <div class="kpi kpi--new"><small>Новые</small><b>${by('new')}</b></div>
      <div class="kpi"><small>В работе</small><b>${by('work')}</b></div>
      <div class="kpi"><small>Заказов сегодня</small><b>${todayOrders.length}</b></div>
      <div class="kpi"><small>Сумма заказов сегодня</small><b>${MZ.lead.money(todayOrders.reduce((s, l) => s + l.total, 0))}</b></div>`;

    $('#tabs').innerHTML = [['all', 'Все', all.length], ...Object.entries(STATUSES).map(([k, v]) => [k, v, by(k)])]
      .map(([k, v, n]) => `<button class="tab ${state.tab === k ? 'is-active' : ''}" type="button" data-tab="${k}">${v}<sup>${n}</sup></button>`).join('');

    const q = state.q.toLowerCase(), qd = q.replace(/\D/g, '');
    const list = all.filter(l => (state.tab === 'all' || l.status === state.tab) &&
      (!q || (l.name || '').toLowerCase().includes(q) || (l.number || '').toLowerCase().includes(q) ||
        (qd.length >= 3 && (l.phone || '').replace(/\D/g, '').includes(qd))));

    $('#leads').innerHTML = list.length ? list.map(l => {
      const tel = (l.phone || '').replace(/[^\d+]/g, '');
      return `<article class="lead ${l.id === freshId ? 'is-fresh' : ''}" data-id="${l.id}" data-status="${l.status}">
        <div class="lead__top"><span>${esc(l.number ? '№ ' + l.number : '')} · ${fmtTime(l.time)}</span>
          <span class="type ${l.type === 'order' ? 'type--order' : ''}">${esc(l.typeLabel || 'Заявка')}</span></div>
        <div class="lead__main">
          <div><div class="lead__name">${esc(l.name || 'Без имени')}</div>${l.company ? `<div class="lead__company">${esc(l.company)}</div>` : ''}</div>
          ${l.total ? `<div class="lead__sum">${MZ.lead.money(l.total)}</div>` : ''}
        </div>
        <div class="lead__phone">
          <a class="tel" href="tel:${tel}">${esc(l.phone || '')}</a>
          <a class="mini mini--call" href="tel:${tel}">${IC.phone}Позвонить</a>
          <button class="mini" type="button" data-copy="${esc(l.phone || '')}">${IC.copy}Копировать</button>
        </div>
        ${l.items.length ? `<ul class="lead__items">${l.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
        ${l.comment ? `<div class="lead__comment">${esc(l.comment)}</div>` : ''}
        <div class="status">${Object.entries(STATUSES).map(([k, v]) => `<button type="button" data-s="${k}" class="${l.status === k ? 'is-active' : ''}">${v}</button>`).join('')}</div>
      </article>`;
    }).join('') : `<div class="crm-empty"><img src="../assets/img/logo-160.webp" alt="">
        <h3>${all.length ? 'Ничего не найдено' : 'Заявок пока нет'}</h3>
        <p>${all.length ? 'Измените фильтр или поиск.' : 'Оформите заказ на сайте или нажмите «Тестовая заявка» — она появится здесь сразу.'}</p></div>`;
  }

  /* ---------- действия ---------- */
  document.addEventListener('click', async e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { state.tab = tab.dataset.tab; render(); return; }
    const st = e.target.closest('[data-s]');
    if (st) {
      const id = st.closest('.lead').dataset.id;
      db.leads[id].status = st.dataset.s;
      save(); render();
      return;
    }
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      try { await navigator.clipboard.writeText(cp.dataset.copy); toast('Номер скопирован'); } catch (err) { toast(cp.dataset.copy); }
    }
  });
  let qt;
  $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 150); });

  $('#btnNotify').addEventListener('click', async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') await Notification.requestPermission();
    renderButtons();
  });
  $('#btnSound').addEventListener('click', () => { db.sound = !db.sound; save(); renderButtons(); if (db.sound) beep(); });

  // Тестовая заявка уходит тем же путём, что и с сайта
  $('#btnTest').addEventListener('click', async e => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const names = ['Алишер', 'Дильноза', 'Тимур', 'Мадина', 'Сардор', 'Ольга'];
    const pick = [
      { name: 'Пельмени «Домашние»', weight: '1 кг', price: 65000 },
      { name: 'Манты с говядиной', weight: '1 кг', price: 68000 },
      { name: 'Сырники', weight: '500 г · 10 шт', price: 30000 },
      { name: 'Котлеты куриные', weight: '800 г · 10 шт', price: 48000 }
    ].filter(() => Math.random() > .4);
    const items = (pick.length ? pick : [{ name: 'Хинкали с говядиной', weight: '1 кг', price: 70000 }])
      .map(i => Object.assign(i, { qty: 1 + Math.floor(Math.random() * 3) }));
    const res = await MZ.lead.send({
      type: 'order',
      name: names[Math.floor(Math.random() * names.length)] + ' (тест)',
      phone: '+998 (90) ' + (100 + Math.floor(Math.random() * 900)) + '-' + (10 + Math.floor(Math.random() * 90)) + '-' + (10 + Math.floor(Math.random() * 90)),
      comment: 'Тестовая заявка из панели',
      items, total: items.reduce((s, i) => s + i.price * i.qty, 0)
    });
    btn.disabled = false;
    if (!res.ok) toast('Не удалось отправить тестовую заявку');
  });

  $('#crmFoot').innerHTML = cfg.ntfyTopic
    ? `Демо-канал: заявки с сайта приходят через <b>ntfy.sh</b>, тема <code>${esc(cfg.ntfyTopic)}</code> (сервер хранит их до 12 часов, здесь — сохраняются в браузере).
       Статусы заявок видны только на этом устройстве. Push на телефон: установите приложение <b>ntfy</b> и подпишитесь на эту тему,
       или откройте <a href="${esc(cfg.ntfyServer)}/${esc(cfg.ntfyTopic)}" target="_blank" rel="noopener">веб-версию</a>.`
    : 'Канал ntfy выключен в config.js — заявки уходят только на вебхук CRM.';

  renderButtons();
  render();
  connect();
})();

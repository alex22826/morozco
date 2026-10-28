/* Заявки: телефон, текст заявки, отправка во внешние каналы и разбор обратно.
   Этот файл общий для сайта и панели /crm/ — формат текста задаётся здесь один раз. */
window.MZ = window.MZ || {};

MZ.lead = (() => {
  const TYPES = {
    order: 'Заказ с сайта',
    callback: 'Обратный звонок',
    wholesale: 'Опт / сотрудничество'
  };

  const money = n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ' + MZ.config.currency;
  const plainMoney = n => money(n).replace(/ /g, ' ');

  /* ---------- телефон (Узбекистан, +998 XX XXX-XX-XX) ---------- */

  // 9 цифр абонентского номера без кода страны
  function localDigits(value) {
    let d = String(value || '').replace(/\D/g, '');
    // код страны может прийти дважды: префикс маски + вставленный «+998…»
    while (d.length > 9 && d.startsWith('998')) d = d.slice(3);
    return d.slice(0, 9);
  }

  function formatPhone(value) {
    const d = localDigits(value);
    let out = '+998';
    if (d.length) out += ' (' + d.slice(0, 2);
    if (d.length >= 2) out += ')';
    if (d.length > 2) out += ' ' + d.slice(2, 5);
    if (d.length > 5) out += '-' + d.slice(5, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    return out;
  }

  const isPhoneValid = value => localDigits(value).length === 9;

  function maskPhone(input) {
    let prev = '';
    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+998 ';
    });
    input.addEventListener('input', e => {
      let d = localDigits(input.value);
      // Backspace по скобке или дефису не удаляет цифру — удаляем её сами
      if (e.inputType && e.inputType.startsWith('delete') && d === prev) d = d.slice(0, -1);
      prev = d;
      input.value = d.length ? formatPhone(d) : '+998 ';
    });
    input.addEventListener('blur', () => {
      if (!localDigits(input.value)) input.value = '';
    });
  }

  /* ---------- заявка ---------- */

  function newNumber() {
    const t = new Date();
    const p = n => String(n).padStart(2, '0');
    return 'MZ-' + p(t.getDate()) + p(t.getMonth() + 1) + '-' + p(t.getHours()) + p(t.getMinutes()) +
      '-' + Math.floor(Math.random() * 90 + 10);
  }

  // Текст заявки: читается глазами (пуш на телефоне) и разбирается parse() в панели
  function toText(lead) {
    const lines = [
      'Тип: ' + (TYPES[lead.type] || lead.type),
      'Имя: ' + lead.name,
      'Телефон: ' + formatPhone(lead.phone)
    ];
    if (lead.company) lines.push('Компания: ' + lead.company);
    if (lead.comment) lines.push('Комментарий: ' + lead.comment.replace(/\s*\n\s*/g, ' / '));
    if (lead.items && lead.items.length) {
      lines.push('Состав:');
      lead.items.forEach(i => lines.push('• ' + i.name + ', ' + i.weight + ' × ' + i.qty + ' = ' + plainMoney(i.price * i.qty)));
      lines.push('Итого: ' + plainMoney(lead.total));
    }
    lines.push('№ ' + lead.number);
    return lines.join('\n');
  }

  function toTitle(lead) {
    const head = lead.type === 'order' ? 'Новый заказ · ' + plainMoney(lead.total) : TYPES[lead.type];
    return head + ' · ' + lead.name;
  }

  // Обратно из текста в объект (для панели заявок)
  function parse(text) {
    const lead = { items: [], raw: text };
    String(text || '').split('\n').forEach(line => {
      const m = line.match(/^(Тип|Имя|Телефон|Компания|Комментарий|Итого):\s*(.*)$/);
      if (m) {
        const key = { 'Тип': 'typeLabel', 'Имя': 'name', 'Телефон': 'phone', 'Компания': 'company', 'Комментарий': 'comment', 'Итого': 'totalLabel' }[m[1]];
        lead[key] = m[2].trim();
      } else if (line.startsWith('• ')) {
        lead.items.push(line.slice(2));
      } else if (line.startsWith('№ ')) {
        lead.number = line.slice(2).trim();
      }
    });
    lead.total = lead.totalLabel ? Number(lead.totalLabel.replace(/\D/g, '')) : 0;
    lead.type = Object.keys(TYPES).find(k => TYPES[k] === lead.typeLabel) || 'other';
    return lead;
  }

  /* ---------- отправка ---------- */

  function withTimeout(promise, ms, ctrl) {
    const t = setTimeout(() => ctrl.abort(), ms);
    return promise.finally(() => clearTimeout(t));
  }

  function post(url, body, headers) {
    const ctrl = new AbortController();
    return withTimeout(fetch(url, { method: 'POST', body, headers, signal: ctrl.signal }), 12000, ctrl)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
  }

  async function send(lead) {
    const cfg = MZ.config.leads;
    lead.number = lead.number || newNumber();
    lead.createdAt = new Date().toISOString();
    lead.page = location.pathname;

    const jobs = [];
    if (cfg.ntfyTopic) {
      jobs.push(post(cfg.ntfyServer, JSON.stringify({
        topic: cfg.ntfyTopic,
        title: toTitle(lead),
        message: toText(lead),
        tags: lead.type === 'order' ? ['snowflake', 'shopping_cart'] : ['snowflake', 'telephone_receiver'],
        priority: 4
      })));
    }
    if (cfg.webhookUrl) {
      jobs.push(post(cfg.webhookUrl, JSON.stringify(lead), { 'Content-Type': 'text/plain;charset=UTF-8' }));
    }
    if (!jobs.length) {
      // Каналы не настроены — демо-режим: заявка остаётся только в этом браузере
      console.warn('[MZ] каналы заявок не настроены, заявка не отправлена', lead);
      return { ok: true, number: lead.number, demo: true };
    }
    const res = await Promise.allSettled(jobs);
    const ok = res.some(r => r.status === 'fulfilled');
    if (!ok) console.error('[MZ] заявка не ушла', res);
    return { ok, number: lead.number };
  }

  return { TYPES, money, plainMoney, localDigits, formatPhone, isPhoneValid, maskPhone, toText, toTitle, parse, send };
})();

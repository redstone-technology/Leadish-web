/* Leadish — booking funnel. Qualifies the lead, then books a day. One question per screen.
   Answers are kept in this browser until the booking is sent, then POSTed to /api/book. */
(function () {
  'use strict';

  var ENDPOINT = window.LEADISH_BOOK_ENDPOINT || '/api/book';
  var DEMO = !!window.LEADISH_BOOK_DEMO;          // preview builds: pretend the send worked
  var STORE = 'leadish-booking-draft';
  var started = Date.now();

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var stage = $('#main'), actions = $('#actions'), next = $('#next'), back = $('#back'), hint = $('#hint'), bar = $('#progress');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Small helpers ── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;            // only ever static markup from this file
      else if (k === 'class') n.className = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var TICK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  function face() { return el('div', { class: 'bk-face', 'aria-hidden': 'true', html: '<svg><use href="#face"/></svg>' }); }
  function first(name) { return String(name || '').trim().split(/\s+/)[0] || ''; }
  function parseDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function niceDate(s, long) {
    if (!s) return '';
    return parseDate(s).toLocaleDateString('en-GB', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric', month: 'short' });
  }

  /* Working days in Qatar: Sunday to Thursday. Offer the next ten, starting two days out. */
  function workingDays() {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 2);
    while (out.length < 10) { if (d.getDay() !== 5 && d.getDay() !== 6) out.push(iso(d)); d.setDate(d.getDate() + 1); }
    return out;
  }

  /* Example answers for the "what do you sell" step, so the fields read like their world. */
  var EXAMPLES = {
    'Real estate': ['Off-plan apartments in Lusail', 'Families and investors'],
    'Cars': ['New SUVs and service plans', 'Families buying their first SUV'],
    'Insurance': ['Health insurance for companies', 'HR managers at small companies'],
    'Telecom': ['Business fibre and mobile plans', 'Small business owners'],
    'Retail': ['Furniture and home decor', 'People moving into a new home'],
    'Software': ['HR software', 'HR teams at mid-size companies'],
    'Agency or media': ['Social media management', 'Restaurants and cafes'],
    'Other': ['Your product or service', 'Your usual customer']
  };
  function example(d, k) { return (EXAMPLES[d.industry] || EXAMPLES.Other)[k]; }

  var TIMES = { Morning: '9 to 12', Midday: '12 to 3', Afternoon: '3 to 6' };
  var SIZES = { '1-5': '1 to 5', '6-10': '6 to 10', '11-25': '11 to 25', '26-50': '26 to 50', '50+': 'More than 50' };

  /* ── The questions: qualify first, then book ── */
  var ROLES = [['Owner or CEO'], ['Head of sales'], ['Sales manager'], ['Team lead'], ['Sales rep'], ['Other', 'Something else']];
  var STEPS = [
    { id: 'intro', type: 'intro',
      q: 'Get a free challenge for your sales team.',
      sub: 'A few quick questions, then pick a day. About a minute.', cta: "Let's go" },

    { id: 'industry', type: 'single', cols: 2, q: 'What does your team sell?',
      options: [['Real estate'], ['Cars'], ['Insurance'], ['Telecom'], ['Retail'], ['Software'], ['Agency or media'], ['Other', 'Something else']] },

    { id: 'offer', type: 'fields', q: 'What do you sell, and who buys it?',
      sub: 'In a few words. It tells us if Leadish fits your team.',
      kicker: function (d) { return d.industry === 'Other' ? 'Got it.' : 'Got it, ' + d.industry.toLowerCase() + '.'; },
      fields: [
        { name: 'product', label: 'What you sell', required: true, placeholder: function (d) { return example(d, 0); } },
        { name: 'customer', label: 'Who buys it', required: true, placeholder: function (d) { return example(d, 1); } }
      ] },

    { id: 'teamSize', type: 'single', q: 'How many salespeople are on your team?',
      kicker: function () { return 'Thanks, that helps.'; },
      options: Object.keys(SIZES).map(function (k) { return [k, SIZES[k]]; }) },

    { id: 'role', type: 'single', cols: 2, q: "What's your role?",
      kicker: function (d) {
        return { '1-5': 'Small team, fast game.', '6-10': 'A good size for one leaderboard.' }[d.teamSize] || 'A big team. Plenty of competition.';
      },
      options: ROLES },

    { id: 'date', type: 'date', q: 'Which day suits you?', sub: "Sunday to Thursday. We'll confirm with you first.",
      kicker: function () { return 'Now pick a day.'; } },

    { id: 'time', type: 'single', q: 'What time?',
      kicker: function (d) { return niceDate(d.date, true) + '. Nice.'; },
      options: Object.keys(TIMES).map(function (k) { return [k, k, TIMES[k]]; }) },

    { id: 'you', type: 'fields', q: 'Who should we ask for?', kicker: function () { return 'Almost done.'; },
      fields: [
        { name: 'name', label: 'Your name', auto: 'name', required: true, placeholder: 'Noor Al-Kuwari' },
        { name: 'company', label: 'Company', auto: 'organization', required: true, placeholder: 'Company name' }
      ] },

    { id: 'contact', type: 'fields', q: 'How do we reach you?', sub: "We'll confirm the day on WhatsApp.",
      kicker: function (d) { return 'Nice to meet you, ' + first(d.name) + '.'; },
      fields: [
        { name: 'phone', label: 'WhatsApp number', type: 'tel', auto: 'tel', inputmode: 'tel', required: true, placeholder: '+974 5555 1234' },
        { name: 'email', label: 'Work email', type: 'email', auto: 'email', inputmode: 'email', optional: true, placeholder: 'you@company.com' }
      ] },

    { id: 'review', type: 'review', q: "Here's your booking.", sub: 'Check it, then send it.', cta: 'Get my free challenge' },

    { id: 'done', type: 'done' }
  ];
  var LAST_Q = STEPS.length - 2;   // review

  /* ── State ── */
  var data = {}, at = 0, returnTo = null, error = null, busy = false;
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.data) { data = saved.data; at = Math.min(saved.at || 0, LAST_Q); }
  } catch (e) {}
  var DATE_AT = STEPS.map(function (s) { return s.id; }).indexOf('date');
  if (data.date && workingDays().indexOf(data.date) < 0) { delete data.date; if (at > DATE_AT) at = DATE_AT; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ at: at, data: data })); } catch (e) {} }

  /* ── Validation ── */
  function phoneOk(v) { var d = String(v || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15 && /^[+\d\s()-]+$/.test(String(v).trim()); }
  function emailOk(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
  function fieldError(f, v) {
    v = String(v || '').trim();
    if (f.required && !v) return f.name === 'phone' ? 'Add a number we can message.' : 'Please fill this in.';
    if (f.required && v.length < 2) return 'A few more words, please.';
    if (f.name === 'phone' && v && !phoneOk(v)) return 'That number looks too short. Include the country code.';
    if (f.name === 'email' && !emailOk(v)) return 'That email looks off. Check for a typo.';
    return '';
  }
  function valid(s) {
    switch (s.type) {
      case 'single': case 'date': return !!data[s.id];
      case 'multi': return Array.isArray(data[s.id]);
      case 'fields': return s.fields.every(function (f) { return !fieldError(f, data[f.name]); });
      default: return true;
    }
  }

  /* ── Render ── */
  function render(dir) {
    var s = STEPS[at];
    document.body.classList.toggle('is-done', s.type === 'done');
    stage.textContent = '';
    var wrap = el('section', { class: 'bk-step bk-step--' + s.type + (dir < 0 ? ' from-back' : ''), 'aria-labelledby': 'q' });
    if (reduce) wrap.style.animation = 'none';

    if (s.type === 'done') { wrap.appendChild(doneView()); stage.appendChild(wrap); footer(s); window.scrollTo(0, 0); requestAnimationFrame(function () { window.scrollTo(0, 0); }); return; }

    var kick = s.kicker ? s.kicker(data) : '';
    var bubble = el('div', { class: 'bk-bubble glass' }, [
      kick ? el('p', { class: 'bk-kicker', text: kick }) : null,
      el('h1', { class: 'bk-q', id: 'q', tabindex: '-1', text: s.q }),
      s.sub ? el('p', { class: 'bk-sub', text: s.sub }) : null
    ]);
    wrap.appendChild(el('div', { class: 'bk-ask' }, [face(), bubble]));

    var body = el('div', { class: 'bk-body' });
    if (s.type === 'single' || s.type === 'multi') body.appendChild(choiceView(s));
    if (s.type === 'date') body.appendChild(dateView(s));
    if (s.type === 'fields') body.appendChild(fieldsView(s));
    if (s.type === 'notes') body.appendChild(notesView());
    if (s.type === 'review') body.appendChild(reviewView());
    if (body.childNodes.length) wrap.appendChild(body);
    wrap.appendChild(actions);
    stage.appendChild(wrap);
    footer(s);

    var focus = $('input, textarea', wrap);
    if (focus && matchMedia('(pointer: fine)').matches) focus.focus({ preventScroll: true });
    else $('#q', wrap).focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function footer(s) {
    var pct = s.type === 'done' ? 100 : Math.round(Math.max(0, at) / LAST_Q * 100);
    bar.style.setProperty('--p', pct + '%');
    bar.setAttribute('aria-valuenow', pct);
    back.hidden = at === 0 || s.type === 'done';

    var label = s.cta || 'Continue';
    if (s.type === 'notes') label = (data.notes || '').trim() ? 'Continue' : 'Skip';
    if (returnTo != null && s.type !== 'review' && s.type !== 'intro') label = 'Back to review';
    next.textContent = label;
    next.disabled = !valid(s);

    hint.textContent = '';
    var n = s.options ? s.options.length : 0;
    if (s.type === 'single' || s.type === 'multi') {
      hint.appendChild(el('span', { class: 'keys' }, ['Press ', el('kbd', { text: '1' }), '–', el('kbd', { text: String(n) }), ' to choose']));
    } else if (s.type === 'review') {
      hint.textContent = "It's free. No card needed.";
    } else if (s.type === 'fields' || s.type === 'notes' || s.type === 'intro' || s.type === 'date') {
      hint.appendChild(el('span', { class: 'keys' }, ['Press ', el('kbd', { text: 'Enter' }), ' to continue']));
    }
  }

  function choiceView(s) {
    var multi = s.type === 'multi';
    var list = el('div', { class: 'opts' + (multi ? ' opts--multi' : ''), role: multi ? 'group' : 'radiogroup', 'aria-labelledby': 'q' });
    if (s.cols) list.style.setProperty('--cols', s.cols);
    s.options.forEach(function (o, idx) {
      var value = o[0], label = o[1] || o[0], sub = o[2];
      var on = multi ? (value === '' ? Array.isArray(data[s.id]) && !data[s.id].length : (data[s.id] || []).indexOf(value) > -1)
                     : data[s.id] === value;
      var b = el('button', {
        type: 'button', class: 'opt glass glass--thin', role: multi ? 'checkbox' : 'radio',
        'aria-checked': String(!!on), 'data-i': idx,
        onclick: function () { pick(s, value, b); }
      }, [
        el('span', { class: 'opt__key', 'aria-hidden': 'true', text: String(idx + 1) }),
        el('span', { class: 'opt__txt' }, [el('span', { class: 'opt__label', text: label }), sub ? el('span', { class: 'opt__sub', text: sub }) : null]),
        el('span', { class: 'opt__tick', 'aria-hidden': 'true', html: TICK })
      ]);
      list.appendChild(b);
    });
    return list;
  }

  function dateView(s) {
    var list = el('div', { class: 'opts opts--dates', role: 'radiogroup', 'aria-labelledby': 'q' });
    workingDays().forEach(function (d, idx) {
      var dt = parseDate(d);
      var b = el('button', {
        type: 'button', class: 'opt opt--date glass glass--thin', role: 'radio', 'aria-checked': String(data.date === d),
        'aria-label': niceDate(d, true), 'data-i': idx,
        onclick: function () { pick(s, d, b); }
      }, [
        el('small', { text: dt.toLocaleDateString('en-GB', { weekday: 'short' }) }),
        el('b', { text: String(dt.getDate()) }),
        el('span', { text: dt.toLocaleDateString('en-GB', { month: 'short' }) })
      ]);
      list.appendChild(b);
    });
    return list;
  }

  function fieldsView(s) {
    var two = s.fields.length === 3;
    var box = el('div', { class: 'flds' + (two ? ' flds--two' : '') });
    s.fields.forEach(function (f) {
      var id = 'f-' + f.name, err = el('p', { class: 'fld__err', id: id + '-err', hidden: true });
      var input = el('input', {
        id: id, name: f.name, type: f.type || 'text', autocomplete: f.auto, inputmode: f.inputmode,
        placeholder: typeof f.placeholder === 'function' ? f.placeholder(data) : f.placeholder, required: !!f.required, maxlength: f.name === 'email' ? 160 : 120,
        'aria-describedby': id + '-err',
        oninput: function () { data[f.name] = input.value; save(); input.removeAttribute('aria-invalid'); err.hidden = true; next.disabled = !valid(s); },
        onblur: function () { var m = input.value ? fieldError(f, input.value) : ''; showErr(input, err, m); }
      });
      input.value = data[f.name] || '';
      if (f.name === 'phone' && !input.value) input.addEventListener('focus', function () { if (!input.value) { input.value = '+974 '; data.phone = input.value; } }, { once: true });
      box.appendChild(el('div', { class: 'fld' + (f.wide ? ' fld--wide' : '') }, [
        el('label', { for: id }, [f.label, f.optional ? el('small', { text: 'Optional' }) : null]), input, err
      ]));
    });
    box.appendChild(el('div', { class: 'hp', 'aria-hidden': 'true' }, [el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', id: 'hp' })]));
    return box;
  }
  function showErr(input, err, msg) {
    if (msg) { input.setAttribute('aria-invalid', 'true'); err.textContent = msg; err.hidden = false; }
    else { input.removeAttribute('aria-invalid'); err.hidden = true; }
  }

  function notesView() {
    var t = el('textarea', {
      id: 'f-notes', maxlength: 1000, rows: 5, 'aria-labelledby': 'q',
      placeholder: 'Buyers always ask for a better payment plan.',
      oninput: function () { data.notes = t.value; save(); footer(STEPS[at]); }
    });
    t.value = data.notes || '';
    return el('div', { class: 'fld' }, [t]);
  }

  function rows(withEdit, only) {
    var list = [
      ['Team', data.industry === 'Other' ? 'Sales team' : data.industry, SIZES[data.teamSize] + ' salespeople', 'industry'],
      ['Sells', data.product, data.customer ? 'Buyers: ' + data.customer : null, 'offer'],
      ['Role', data.role === 'Other' ? 'Something else' : data.role, null, 'role'],
      ['When', niceDate(data.date, true), data.time + ', ' + TIMES[data.time], 'date'],
      ['You', data.name, data.company, 'you'],
      ['Contact', data.phone, data.email || null, 'contact']
    ];
    if (only) list = only.map(function (k) { return list.filter(function (r) { return r[0] === k; })[0]; });
    return list.map(function (r) {
      var stepIdx = STEPS.map(function (s) { return s.id; }).indexOf(r[3]);
      return el('div', { class: 'rev__row' }, [
        el('span', { class: 'rev__k', text: r[0] }),
        el('span', { class: 'rev__v' }, [r[1] || '', r[2] ? el('small', { text: r[2] }) : null]),
        withEdit ? el('button', { type: 'button', class: 'rev__edit', text: 'Change', 'aria-label': 'Change ' + r[0].toLowerCase(),
          onclick: function () { returnTo = LAST_Q; go(stepIdx, -1); } }) : null
      ]);
    });
  }

  function reviewView() {
    var box = el('div');
    box.appendChild(el('div', { class: 'rev glass' }, rows(true)));
    box.appendChild(el('p', { class: 'rev__note', text: "We'll message you within one working day to confirm." }));
    if (error) box.appendChild(errorView());
    return box;
  }

  function summaryText() {
    return [
      'Free team challenge request', '',
      'Company: ' + data.company, 'Name: ' + data.name + ' (' + data.role + ')',
      'WhatsApp: ' + data.phone, data.email ? 'Email: ' + data.email : null,
      'Industry: ' + data.industry, 'Sells: ' + data.product, 'Sells to: ' + data.customer, 'Salespeople: ' + data.teamSize,
      'When: ' + niceDate(data.date, true) + ', ' + data.time + ' (' + TIMES[data.time] + ')'
    ].filter(function (l) { return l !== null; }).join('\n');
  }

  function errorView() {
    var copy = el('button', { type: 'button', class: 'btn btn--glass btn--s', text: 'Copy my booking',
      onclick: function () {
        var t = summaryText();
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { copy.textContent = 'Copied'; }, function () { copy.textContent = 'Copy failed'; });
      } });
    var mail = el('a', { class: 'btn btn--glass btn--s', text: 'Email it to us',
      href: 'mailto:tayeb@leadish.app?subject=' + encodeURIComponent('Free team challenge: ' + (data.company || '')) + '&body=' + encodeURIComponent(summaryText()) });
    return el('div', { class: 'bk-error glass', role: 'alert' }, [
      el('b', { text: "We couldn't send your booking. " }),
      error === 'offline' ? 'Check your connection and try again, or send it to us directly at tayeb@leadish.app.' : 'Try again, or send it to us directly at tayeb@leadish.app.',
      el('div', { class: 'bk-error__acts' }, [copy, mail])
    ]);
  }

  function doneView() {
    var ticket = el('div', { class: 'bk-ticket glass' }, rows(false, ['When', 'You', 'Team', 'Sells']));
    var ics = el('button', { type: 'button', class: 'btn btn--glass', text: 'Add to calendar', onclick: downloadIcs });
    return el('div', { class: 'bk-done' }, [
      face(),
      el('h1', { tabindex: '-1', id: 'q', text: "You're booked." }),
      el('p', { class: 'lede', text: "We'll message " + (data.phone || 'you') + ' on WhatsApp within one working day to confirm the time and place.' }),
      ticket,
      el('div', { class: 'bk-done__acts' }, [ics, el('a', { class: 'btn btn--primary', href: '/', text: 'Back to leadish.app' })])
    ]);
  }

  function downloadIcs() {
    var start = { Morning: 6, Midday: 9, Afternoon: 12 }[data.time] || 6;   // UTC hours; Qatar is UTC+3 all year
    var d = data.date.replace(/-/g, ''), h = String(start).padStart(2, '0'), h2 = String(start + 1).padStart(2, '0');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Leadish//Booking//EN', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@leadish.app', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART:' + d + 'T' + h + '0000Z', 'DTEND:' + d + 'T' + h2 + '0000Z',
      'SUMMARY:Leadish team challenge (to be confirmed)',
      'DESCRIPTION:Free Leadish team challenge for ' + String(data.company || '').replace(/[,;\n]/g, ' ') + '. We will confirm the exact time on WhatsApp.',
      'LOCATION:To be confirmed', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = el('a', { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'leadish-challenge.ics' });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function confetti() {
    if (reduce) return;
    var box = el('div', { class: 'bk-confetti', 'aria-hidden': 'true' });
    var cols = ['var(--you-fill)', 'var(--ai-fill)', 'var(--ribbon)', 'var(--text)'];
    for (var k = 0; k < 46; k++) {
      var c = el('i');
      c.style.left = (Math.random() * 100) + '%';
      c.style.background = cols[k % cols.length];
      c.style.setProperty('--x', ((Math.random() - .5) * 240).toFixed(0) + 'px');
      c.style.setProperty('--r', ((Math.random() * 900) + 180).toFixed(0) + 'deg');
      c.style.setProperty('--d', (1.4 + Math.random() * 1.2).toFixed(2) + 's');
      c.style.setProperty('--w', (Math.random() * .35).toFixed(2) + 's');
      box.appendChild(c);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 3200);
  }

  /* ── Moving through the steps ── */
  function go(to, dir) { at = Math.max(0, Math.min(STEPS.length - 1, to)); if (STEPS[at].type !== 'done') save(); render(dir); }

  var advanceTimer = null;
  function pick(s, value, btn) {
    if (s.type === 'multi') {
      if (value === '') data[s.id] = [];            // "Not sure yet" clears the others
      else {
        var cur = Array.isArray(data[s.id]) ? data[s.id].slice() : [];
        var k = cur.indexOf(value);
        if (k > -1) cur.splice(k, 1); else cur.push(value);
        if (cur.length) data[s.id] = cur; else delete data[s.id];   // un-ticking the last one leaves nothing chosen
      }
      save();
      var arr = data[s.id];
      Array.prototype.forEach.call(btn.parentNode.children, function (b, i) {
        var v = s.options[i][0];
        b.setAttribute('aria-checked', String(v === '' ? Array.isArray(arr) && !arr.length : (arr || []).indexOf(v) > -1));
      });
      btn.classList.add('press'); setTimeout(function () { btn.classList.remove('press'); }, 140);
      next.disabled = !valid(s);
      return;
    }
    data[s.id] = value; save();
    Array.prototype.forEach.call(btn.parentNode.children, function (b) { b.setAttribute('aria-checked', String(b === btn)); });
    btn.classList.add('press'); setTimeout(function () { btn.classList.remove('press'); }, 140);
    next.disabled = false;
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(forward, reduce ? 0 : 340);
  }

  function forward() {
    var s = STEPS[at];
    if (busy) return;
    if (s.type === 'fields') {
      var bad = null;
      s.fields.forEach(function (f) {
        var input = $('#f-' + f.name), m = fieldError(f, input.value);
        showErr(input, $('#f-' + f.name + '-err'), m);
        if (m && !bad) bad = input;
      });
      if (bad) { bad.focus(); return; }
      data.website = ($('#hp') || {}).value || data.website || '';
      s.fields.forEach(function (f) { data[f.name] = String(data[f.name] || '').trim(); });
      save();
    }
    if (!valid(s)) return;
    if (s.type === 'review') return submit();
    if (returnTo != null) { var r = returnTo; returnTo = null; return go(r, 1); }
    go(at + 1, 1);
  }

  function submit() {
    busy = true; error = null;
    next.classList.add('is-busy');
    next.textContent = '';
    next.appendChild(el('span', { class: 'spin', 'aria-hidden': 'true' }));
    next.appendChild(document.createTextNode(' Sending'));
    var payload = {
      industry: data.industry, product: data.product, customer: data.customer, teamSize: data.teamSize, role: data.role,
      date: data.date, time: data.time, name: data.name, company: data.company,
      phone: data.phone, email: data.email || '',
      website: data.website || '', elapsed: Date.now() - started, page: location.href
    };
    var send = DEMO
      ? new Promise(function (ok) { setTimeout(function () { ok({ ok: true }); }, 900); })
      : fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.ok = r.ok && j.ok !== false; return j; }); });
    send.then(function (res) {
      busy = false; next.classList.remove('is-busy');
      if (!res.ok) { error = 'server'; return render(0); }
      try { localStorage.removeItem(STORE); } catch (e) {}
      go(STEPS.length - 1, 1);
      confetti();
    }, function () {
      busy = false; next.classList.remove('is-busy');
      error = navigator.onLine === false ? 'offline' : 'server';
      render(0);
    });
  }

  next.addEventListener('click', forward);
  back.addEventListener('click', function () { if (at > 0) { returnTo = null; go(at - 1, -1); } });

  document.addEventListener('keydown', function (e) {
    var s = STEPS[at], tag = (e.target.tagName || '').toLowerCase();
    if (e.metaKey || e.ctrlKey || e.altKey) {
      if (e.key === 'Enter' && tag === 'textarea') { e.preventDefault(); forward(); }
      return;
    }
    if (tag === 'textarea') return;
    if (e.key === 'Enter') {
      if (tag === 'button' || tag === 'a') return;     // let the focused control act
      e.preventDefault(); if (!next.disabled) forward(); return;
    }
    if (tag === 'input') return;
    if ((s.type === 'single' || s.type === 'multi') && /^[1-9]$/.test(e.key)) {
      var b = stage.querySelector('.opt[data-i="' + (+e.key - 1) + '"]');
      if (b) { e.preventDefault(); b.click(); }
    }
  });

  render(1);
})();

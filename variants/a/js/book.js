/* Leadish — booking funnel. Learns about the team, then books a day. One question per screen.
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

  /* Working days in Qatar: Sunday to Thursday. Offer the next ten, starting three days out.
     The next two days are always blocked so we have time to prepare. These are preferences only:
     we confirm the real day and time on the phone. */
  function workingDays() {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3);
    while (out.length < 10) { if (d.getDay() !== 5 && d.getDay() !== 6) out.push(iso(d)); d.setDate(d.getDate() + 1); }
    return out;
  }

  var TIMES = { Morning: '9 to 12', Midday: '12 to 3', Afternoon: '3 to 6' };
  var SIZES = { '1-5': '1 to 5', '6-10': '6 to 10', '11-25': '11 to 25', '26-50': '26 to 50', '50+': 'More than 50' };

  /* ── The questions: qualify first, then book ── */
  var ROLES = [['Owner or CEO'], ['Head of sales'], ['Sales manager'], ['Team lead'], ['Sales rep'], ['Other', 'Something else']];
  var PRACTICE = [['Regular role-play'], ['Internal training or coaching'], ['External trainers or programmes'],
                  ['Online courses or videos'], ['Mostly on real customers'], ['No set way yet']];

  /* Lead fit. Everyone can finish the flow; only a fit picks a day.
     Not a fit: a small team (1 to 5) and the person can't decide for the company.
     Hot: 6+ salespeople, a decision maker, and no real practice today.
     The server works this out again from the same answers (api/book.js). */
  var DECIDERS = ['Owner or CEO', 'Head of sales', 'Sales manager'];
  var GAPS = ['Mostly on real customers', 'No set way yet', 'Online courses or videos'];
  function fit(d) {
    var small = d.teamSize === '1-5', decider = DECIDERS.indexOf(d.role) > -1;
    if (small && !decider) return 'Not a fit';
    if (!small && decider && GAPS.indexOf(d.practice) > -1) return 'Hot';
    return 'Warm';
  }
  function booking(d) { return fit(d) !== 'Not a fit'; }

  var STEPS = [
    { id: 'intro', type: 'intro',
      q: "Let's put your sales team to the test.",
      sub: 'Answer a few quick questions so we can prepare the right challenge for your team. About two minutes.', cta: "Let's go" },

    { id: 'industry', type: 'single', cols: 2, q: 'What does your team sell?',
      options: [['Real estate'], ['Cars'], ['Insurance'], ['Telecom'], ['Retail'], ['Software'], ['Agency or media'], ['Other', 'Something else']] },

    { id: 'teamSize', type: 'single', q: 'How many salespeople are on your team?',
      kicker: function (d) { return d.industry === 'Other' ? 'Got it.' : 'Got it, ' + d.industry.toLowerCase() + '.'; },
      options: Object.keys(SIZES).map(function (k) { return [k, SIZES[k]]; }) },

    { id: 'role', type: 'single', cols: 2, q: "What's your role?",
      kicker: function (d) {
        return { '1-5': 'A small team. Everyone gets a turn.', '6-10': 'A good size for one leaderboard.' }[d.teamSize] || "A big team. We'll run it in rounds.";
      },
      options: ROLES },

    { id: 'practice', type: 'single', q: 'How does your team practise its sales skills today?',
      kicker: function (d) {
        if (DECIDERS.indexOf(d.role) > -1) return "Good, you're the right person to ask.";
        return d.role === 'Team lead' ? 'Thanks. Your manager may want to join too.' : 'Thanks for telling us.';
      },
      options: PRACTICE },

    { id: 'struggles', type: 'multi', q: 'What should the challenge test?',
      sub: "Pick all that apply. We'll use these to shape your AI customer.",
      kicker: function (d) {
        return {
          'Regular role-play': "Good. Let's see how they do against an AI.",
          'Internal training or coaching': 'Good. This adds practice between sessions.',
          'External trainers or programmes': 'This keeps the practice going after the course.',
          'Online courses or videos': "Watching isn't practising. Let's fix that.",
          'Mostly on real customers': "That's exactly the gap Leadish fills.",
          'No set way yet': "Then this will show you a lot."
        }[d.practice];
      },
      options: [['Opening the call'], ['Handling objections'], ['Talking about price'], ['Closing'], ['Following up'], ['', 'Not sure yet']] },

    { id: 'where', type: 'single', q: 'Where should we run it?', skip: function (d) { return !booking(d); },
      kicker: function (d) { return d.struggles && d.struggles.length ? "Noted. We'll make it hard there." : "That's fine. The scores will show you."; },
      options: [['At their office', 'At your office', 'We come to you, in Doha'], ['Online', 'Online', 'Everyone joins from a link']] },

    { id: 'date', type: 'date', q: 'Which day would work best for your team?', sub: "Sunday to Thursday. Pick what suits you best. We'll confirm the exact day and time when we call.",
      skip: function (d) { return !booking(d); },
      kicker: function (d) { return d.where === 'Online' ? "We'll send the link." : "We'll come to you."; } },

    { id: 'time', type: 'single', q: 'What time usually works best?', skip: function (d) { return !booking(d); },
      kicker: function (d) { return niceDate(d.date, true) + '. Nice.'; },
      options: Object.keys(TIMES).map(function (k) { return [k, k, TIMES[k]]; }) },

    { id: 'you', type: 'fields', q: 'Who should we ask for?',
      kicker: function (d) { return booking(d) ? 'Almost done.' : 'Thanks. Just your details now.'; },
      fields: [
        { name: 'name', label: 'Your name', auto: 'name', required: true, placeholder: 'Noor Al-Kuwari' },
        { name: 'company', label: 'Company', auto: 'organization', required: true, placeholder: 'Company name' }
      ] },

    { id: 'contact', type: 'fields', q: 'How do we reach you?',
      sub: function (d) { return booking(d) ? "We'll confirm the date on WhatsApp." : "We'll reach out on WhatsApp."; },
      kicker: function (d) { return 'Nice to meet you, ' + first(d.name) + '.'; },
      fields: [
        { name: 'phone', label: 'WhatsApp number', type: 'tel', auto: 'tel', inputmode: 'tel', required: true, placeholder: '+974 5555 1234' },
        { name: 'email', label: 'Work email', type: 'email', auto: 'email', inputmode: 'email', required: true, placeholder: 'you@company.com' }
      ] },

    { id: 'notes', type: 'notes', q: 'Anything else we should know?', sub: 'Optional. A tough objection, a deal you keep losing, what you want to test.',
      kicker: function () { return 'Last one.'; } },

    { id: 'done', type: 'done' }
  ];
  var LAST_Q = STEPS.length - 2;   // the last question; answering it sends the booking

  /* ── State ── */
  var data = {}, at = 0, error = null, busy = false;
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.data) { data = saved.data; at = Math.min(saved.at || 0, LAST_Q); }
  } catch (e) {}
  var DATE_AT = STEPS.map(function (s) { return s.id; }).indexOf('date');
  if (data.date && workingDays().indexOf(data.date) < 0) { delete data.date; if (at > DATE_AT) at = DATE_AT; }
  if (skipped(at)) at = step(at, 1);
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ at: at, data: data })); } catch (e) {} }

  /* ── Validation ── */
  function phoneOk(v) { var d = String(v || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15 && /^[+\d\s()-]+$/.test(String(v).trim()); }
  function emailOk(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
  function fieldError(f, v) {
    v = String(v || '').trim();
    if (f.required && !v) return { phone: 'Add a number we can message.', email: 'Add an email we can write to.' }[f.name] || 'Please fill this in.';
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
      s.sub ? el('p', { class: 'bk-sub', text: typeof s.sub === 'function' ? s.sub(data) : s.sub }) : null
    ]);
    wrap.appendChild(el('div', { class: 'bk-ask' }, [face(), bubble]));

    var body = el('div', { class: 'bk-body' });
    if (s.type === 'single' || s.type === 'multi') body.appendChild(choiceView(s));
    if (s.type === 'date') body.appendChild(dateView(s));
    if (s.type === 'fields') body.appendChild(fieldsView(s));
    if (s.type === 'notes') body.appendChild(notesView());
    if (s.type === 'notes' && error) body.appendChild(errorView());
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
    var seen = 0, total = 0;
    for (var k = 1; k <= LAST_Q; k++) { if (!skipped(k)) { total++; if (k <= at) seen++; } }
    var pct = s.type === 'done' ? 100 : Math.round(seen / Math.max(1, total) * 100);
    bar.style.setProperty('--p', pct + '%');
    bar.setAttribute('aria-valuenow', pct);
    back.hidden = at === 0 || s.type === 'done';

    var label = (typeof s.cta === 'function' ? s.cta(data) : s.cta) || 'Continue';
    if (s.type === 'notes') label = (data.notes || '').trim() ? (booking(data) ? 'Book my free challenge' : 'Send my details') : 'Skip';
    next.textContent = label;
    next.disabled = !valid(s);

    hint.textContent = '';
    var n = s.options ? s.options.length : 0;
    if (s.type === 'single' || s.type === 'multi') {
      hint.appendChild(el('span', { class: 'keys' }, ['Press ', el('kbd', { text: '1' }), '–', el('kbd', { text: String(n) }), ' to choose']));
    } else if (s.type === 'notes') {
      hint.textContent = "It's free. No card needed.";
    } else if (s.type === 'fields' || s.type === 'intro' || s.type === 'date') {
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

  function summaryText() {
    return [
      'Free team challenge request', '',
      'Company: ' + data.company, 'Name: ' + data.name + ' (' + data.role + ')',
      'WhatsApp: ' + data.phone, 'Email: ' + data.email,
      'Industry: ' + data.industry, 'Salespeople: ' + data.teamSize,
      'Focus: ' + ((data.struggles || []).join(', ') || 'Not sure yet'),
      'Practice today: ' + data.practice,
      booking(data) ? 'Where: ' + data.where : null,
      booking(data) ? 'Preferred day: ' + niceDate(data.date, true) + ', ' + data.time + ' (' + TIMES[data.time] + ')' : null,
      (data.notes || '').trim() ? 'Notes: ' + data.notes.trim() : null
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
      el('b', { text: "We couldn't send your request. " }),
      error === 'offline' ? 'Check your connection and try again, or send it to us directly at tayeb@leadish.app.' : 'Try again, or send it to us directly at tayeb@leadish.app.',
      el('div', { class: 'bk-error__acts' }, [copy, mail])
    ]);
  }

  /* Slot for the Leadish intro video. To add it, replace this block with a <video> or an embed. */
  function videoSlot() {
    var video = el('video', { class: 'bk-video__media', src: '/assets/leadish-intro.mp4', poster: '/assets/leadish-intro-poster.jpg',
      preload: 'metadata', playsinline: true, 'aria-label': 'Leadish intro video' });
    var start = el('button', { type: 'button', class: 'bk-video__start', 'aria-label': 'Play the Leadish intro video',
      html: '<span class="bk-video__play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.1-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6Z"/></svg></span><span class="bk-video__len">Watch · 1 min</span>' });
    var box = el('figure', { class: 'bk-video glass' }, [video, start]);
    start.addEventListener('click', function () {
      box.classList.add('is-playing');
      video.setAttribute('controls', '');
      var p = video.play(); if (p && p.catch) p.catch(function () {});
      video.focus();
    });
    return box;
  }

  function doneView() {
    var fitLead = booking(data);
    return el('div', { class: 'bk-done' }, [
      face(),
      el('h1', { tabindex: '-1', id: 'q', text: 'Thank you, ' + (first(data.name) || 'there') + '.' }),
      el('p', { class: 'lede', text: fitLead
        ? "Your free challenge request is in. We'll contact you on WhatsApp within one working day to confirm the date and details."
        : "Our free challenges are for sales teams of 6 or more for now. We've saved your details and will reach out on WhatsApp when we can run one for you." }),
      fitLead ? null : el('p', { class: 'bk-done__note', text: 'If your manager wants to book one for a bigger team, send them this page.' }),
      el('p', { class: 'bk-done__kicker', text: 'While you wait, see how Leadish works.' }),
      videoSlot(),
      el('div', { class: 'bk-done__acts' }, [el('a', { class: 'btn btn--glass', href: '/', text: 'Back to leadish.app' })])
    ]);
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
  function skipped(i) { var s = STEPS[i]; return !!(s && s.skip && s.skip(data)); }
  function step(from, dir) { var i = from + dir; while (i > 0 && i < STEPS.length - 1 && skipped(i)) i += dir; return i; }
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
    if (s.type === 'notes') return submit();     // Skip or send: either way the booking goes out now
    go(step(at, 1), 1);
  }

  function submit() {
    busy = true; error = null;
    next.classList.add('is-busy');
    next.textContent = '';
    next.appendChild(el('span', { class: 'spin', 'aria-hidden': 'true' }));
    next.appendChild(document.createTextNode(' Sending'));
    var payload = {
      industry: data.industry, teamSize: data.teamSize, role: data.role, practice: data.practice,
      struggles: data.struggles || [], where: booking(data) ? data.where : '',
      date: booking(data) ? data.date : '', time: booking(data) ? data.time : '', name: data.name, company: data.company,
      phone: data.phone, email: data.email, notes: (data.notes || '').trim(),
      website: data.website || '', elapsed: Date.now() - started, page: location.href,
      source: window.leadishRef ? window.leadishRef().source : '', campaign: window.leadishRef ? window.leadishRef().campaign : ''
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
  back.addEventListener('click', function () { if (at > 0) go(step(at, -1), -1); });

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

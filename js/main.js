/* Leadish landing — small, dependency-free behaviours. The page reads fine without any of this. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ── Finish picker ── */
  var THEME_BG = { light: '#F4F4F8', mist: '#E4E4EC', ink: '#0C1920', violet: '#4A32A8' };
  function setFinish(name, save) {
    root.setAttribute('data-theme', name);
    $$('.finish button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === name)); });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_BG[name]);
    if (save) { try { localStorage.setItem('leadish-finish', name); } catch (e) {} }
  }
  var fromUrl = (location.search.match(/[?&]finish=(light|mist|ink|violet)/) || [])[1];
  setFinish(fromUrl || root.getAttribute('data-theme') || 'light', false);
  $$('.finish button').forEach(function (b) {
    b.addEventListener('click', function () { setFinish(b.dataset.set, true); });
  });

  /* ── Reveal on scroll ── */
  var revealables = $$('.reveal, .ribbon');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── The hero call: one short conversation, on a loop ── */
  var call = $('#call');
  if (call) {
    var SCRIPT = [
      { who: 'ai',  name: 'Khalid', text: "I'm busy. You have one minute.", score: 0, rapport: 12, ring: 88 },
      { who: 'you', name: 'Noor',   text: 'One question, then. What does an empty table cost you on a Tuesday?', score: 6, rapport: 30, ring: 62 },
      { who: 'ai',  name: 'Khalid', text: 'Too much. Go on.', score: 6, rapport: 41, ring: 50 },
      { who: 'you', name: 'Noor',   text: 'Ten minutes on Thursday. I will show you how to fill it.', score: 14, rapport: 52, ring: 28 },
      { who: 'ai',  name: 'Khalid', text: 'Fine. Thursday, after lunch.', score: 21, rapport: 60, ring: 0 }
    ];
    var talk = $('#talk'), line = $('#line'), speaker = $('#speaker');
    var scoreEls = [$('#score2')], rapport = $('#rapport'), ring = $('#ring');
    var outcome = $('#outcome'), clock = $('#clock');
    var step = 1, seconds = 41, timer = null;

    function count(el, to) {
      if (!el) return;
      var from = parseInt(el.textContent, 10) || 0;
      if (from === to || reduce) { el.textContent = to; return; }
      var t0 = performance.now(), dur = 700;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
    function bubble(s) {
      var p = document.createElement('p');
      p.className = 'say say--' + s.who + ' is-new';
      var small = document.createElement('small');
      small.textContent = s.name;
      p.appendChild(small);
      p.appendChild(document.createTextNode(s.text));
      return p;
    }
    function show(i) {
      var s = SCRIPT[i];
      call.setAttribute('data-turn', s.who);
      speaker.textContent = s.name;
      line.textContent = '“' + s.text + '”';
      if (i === 0) talk.textContent = '';
      talk.appendChild(bubble(s));
      while (talk.children.length > 3) talk.removeChild(talk.firstChild);
      scoreEls.forEach(function (el) { count(el, s.score); });
      count(rapport, s.rapport);
      ring.style.strokeDashoffset = s.ring;
      var won = i === SCRIPT.length - 1;
      outcome.textContent = won ? 'Won' : 'In play';
      outcome.classList.toggle('is-won', won);
      if (i === 0) seconds = 4;
    }
    function advance() {
      step = (step + 1) % SCRIPT.length;
      show(step);
      timer = setTimeout(advance, step === SCRIPT.length - 1 ? 5200 : 3400);
    }
    function fmt(n) { var m = Math.floor(n / 60), s = n % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

    if (!reduce && 'IntersectionObserver' in window) {
      var ticker = null;
      new IntersectionObserver(function (entries) {
        var on = entries[0].isIntersecting && !document.hidden;
        clearTimeout(timer); clearInterval(ticker);
        if (on) {
          timer = setTimeout(advance, 2600);
          ticker = setInterval(function () { seconds += 1; clock.textContent = fmt(seconds); }, 1000);
        }
      }, { threshold: 0.3 }).observe(call);
    }
  }

  /* ── Manager's desk: pick a call, see its replay ── */
  var CALLS = [
    { title: 'Noor and Khalid Aziz', sub: 'Restaurants · Hostile · 03:52', img: 'assets/customer-cap.webp', time: '03:52', score: 21, rap: 60,
      rep: 'Noor', ai: 'Khalid', lines: [['ai', "I'm busy. You have one minute."], ['you', 'One question, then. What does an empty table cost you on a Tuesday?'], ['ai', 'Too much. Go on.']] },
    { title: 'Sara and Adel Rasheed', sub: 'Real estate · Neutral · 04:22', img: 'assets/customer-neutral.webp', time: '04:22', score: 18, rap: 50,
      rep: 'Sara', ai: 'Adel', lines: [['ai', 'Why this building and not the one next door?'], ['you', 'The handover date. This one is ready in March.'], ['ai', 'Then show it to me on Sunday.']] },
    { title: 'Omar and Mariam Saleh', sub: 'Gyms & fitness · Guarded · 02:28', img: 'assets/customer-hat.webp', time: '02:28', score: 14, rap: 46,
      rep: 'Omar', ai: 'Mariam', lines: [['ai', 'We already have a supplier.'], ['you', 'What would make you switch?'], ['ai', 'A better price. Send it over.']] },
    { title: 'Maha and Mariam Saleh', sub: 'Gyms & fitness · Guarded · 01:31', img: 'assets/customer-hat.webp', time: '01:31', score: 9, rap: 41,
      rep: 'Maha', ai: 'Mariam', lines: [['ai', 'Just send me an email.'], ['you', 'Sure. What should it answer first?'], ['ai', 'The price.']] },
    { title: 'Yousef and Khalid Aziz', sub: 'Restaurants · Hostile · 01:57', img: 'assets/customer-cap.webp', time: '01:57', score: 5, rap: 25,
      rep: 'Yousef', ai: 'Khalid', lines: [['ai', "I'm busy. You have one minute."], ['you', 'Our package includes three plans, and the first one…'], ['ai', 'Not interested. Goodbye.']] }
  ];
  var rows = $$('#calls tr'), scrub = $('#scrub'), player = $('#player');
  if (scrub) {
    var BARS = 34, playing = null, pos = 0;
    function drawScrub(seed) {
      scrub.textContent = '';
      for (var i = 0; i < BARS; i++) {
        var b = document.createElement('i');
        var h = 28 + Math.abs(Math.sin((i + 1) * (seed + 2) * 0.73) * 58) + ((i * 7 + seed * 13) % 14);
        b.style.setProperty('--h', Math.min(100, h).toFixed(0) + '%');
        scrub.appendChild(b);
      }
      paint(0);
    }
    function paint(n) { pos = n; $$('i', scrub).forEach(function (b, i) { b.classList.toggle('on', i < n); }); }
    function stop() { clearInterval(playing); playing = null; player.classList.remove('is-playing'); $('button', player).setAttribute('aria-label', 'Play recording'); }
    function pick(i) {
      var c = CALLS[i]; if (!c) return;
      stop();
      rows.forEach(function (r, j) { r.setAttribute('aria-current', String(i === j)); });
      $('#r-title').textContent = c.title;
      $('#r-sub').textContent = c.sub;
      $('#r-img').src = c.img;
      $('#r-time').textContent = c.time;
      $('#r-score').textContent = c.score;
      $('#r-rap').textContent = c.rap;
      var t = $('#r-talk'); t.textContent = '';
      c.lines.forEach(function (l, k) {
        var p = document.createElement('p'); p.className = 'say say--' + l[0] + ' is-new';
        p.style.animationDelay = (k * 70) + 'ms';
        var s = document.createElement('small'); s.textContent = l[0] === 'ai' ? c.ai : c.rep;
        p.appendChild(s); p.appendChild(document.createTextNode(l[1])); t.appendChild(p);
      });
      drawScrub(i);
    }
    rows.forEach(function (r, i) {
      r.addEventListener('click', function () { pick(i); });
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
    });
    $('button', player).addEventListener('click', function () {
      if (playing) { stop(); return; }
      if (pos >= BARS) paint(0);
      player.classList.add('is-playing');
      this.setAttribute('aria-label', 'Pause recording');
      playing = setInterval(function () { paint(pos + 1); if (pos >= BARS) stop(); }, 160);
    });
    drawScrub(0);
    paint(12);
  }

  /* ── Leaderboard: scores land, rows trade places ── */
  var board = $('#board');
  if (board && !reduce && 'IntersectionObserver' in window) {
    var START = $$('.row', board).map(function (r) { return { name: $('.row__name', r).textContent, score: +r.dataset.score, tries: +r.dataset.tries }; });
    var MOVES = [['Sara', 23], ['Omar', 19], ['Maha', 16], ['Yousef', 12], ['Omar', 24]];
    var m = 0, loop = null;
    function rowOf(name) { return $$('.row', board).filter(function (r) { return $('.row__name', r).textContent === name; })[0]; }
    function order() {
      var list = $$('.row', board);
      var first = list.map(function (r) { return r.getBoundingClientRect().top; });
      list.slice().sort(function (a, b) { return b.dataset.score - a.dataset.score; }).forEach(function (r) { board.appendChild(r); });
      list.forEach(function (r, i) {
        var dy = first[i] - r.getBoundingClientRect().top;
        if (!dy) return;
        r.style.transition = 'none';
        r.style.transform = 'translateY(' + dy + 'px)';
        requestAnimationFrame(function () {
          r.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)';
          r.style.transform = '';
        });
      });
      $$('.row', board).forEach(function (r, i) { $('.row__pos', r).textContent = i + 1; });
    }
    function paintRow(r, score, tries) {
      r.dataset.score = score; r.dataset.tries = tries;
      $('.row__score', r).textContent = score;
      $$('.row__tries i', r).forEach(function (d, i) { d.classList.toggle('used', i < tries); });
    }
    function play() {
      if (m >= MOVES.length) {
        START.forEach(function (s) { paintRow(rowOf(s.name), s.score, s.tries); });
        m = 0; order(); return;
      }
      var mv = MOVES[m++], r = rowOf(mv[0]);
      paintRow(r, mv[1], Math.min(3, +r.dataset.tries + 1));
      r.classList.remove('bump'); void r.offsetWidth; r.classList.add('bump');
      setTimeout(order, 260);
    }
    new IntersectionObserver(function (entries) {
      clearInterval(loop);
      if (entries[0].isIntersecting) loop = setInterval(play, 2800);
    }, { threshold: 0.4 }).observe(board);
  }
})();

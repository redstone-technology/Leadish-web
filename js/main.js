/* Leadish landing — small, dependency-free behaviours. The page reads fine without any of this. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var canWatch = 'IntersectionObserver' in window;

  /* ── Reveal on scroll ── */
  var revealables = $$('.reveal, .ribbon');
  if (canWatch && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── The practice call: one short conversation, on a loop ── */
  var call = $('#call');
  if (call && canWatch && !reduce) {
    var SCRIPT = [
      ['ai', 'Khalid', "I'm busy. You have one minute."],
      ['you', 'Noor', 'One question, then. What does an empty table cost you on a Tuesday?'],
      ['ai', 'Khalid', 'Too much. Go on.'],
      ['you', 'Noor', 'Ten minutes on Thursday. I will show you how to fill it.'],
      ['ai', 'Khalid', 'Fine. Thursday, after lunch.']
    ];
    var line = $('#line'), speaker = $('#speaker'), clock = $('#clock');
    var step = 0, seconds = 41, timer = null, ticker = null;
    var fmt = function (n) { var a = Math.floor(n / 60), b = n % 60; return (a < 10 ? '0' : '') + a + ':' + (b < 10 ? '0' : '') + b; };
    var advance = function () {
      step = (step + 1) % SCRIPT.length;
      if (step === 0) seconds = 4;
      var s = SCRIPT[step];
      call.setAttribute('data-turn', s[0]);
      speaker.textContent = s[1];
      line.textContent = '“' + s[2] + '”';
      line.classList.remove('is-new'); void line.offsetWidth; line.classList.add('is-new');
      timer = setTimeout(advance, step === SCRIPT.length - 1 ? 4600 : 3200);
    };
    new IntersectionObserver(function (entries) {
      var on = entries[0].isIntersecting && !document.hidden;
      clearTimeout(timer); clearInterval(ticker);
      if (on) {
        timer = setTimeout(advance, 2200);
        ticker = setInterval(function () { seconds += 1; clock.textContent = fmt(seconds); }, 1000);
      }
    }, { threshold: 0.3 }).observe(call);
  }

  /* ── Manager's replay: a little player that fills as it plays ── */
  var player = $('#player'), scrub = $('#scrub');
  if (player && scrub) {
    var BARS = 32, playing = null, pos = 0, btn = $('button', player);
    for (var i = 0; i < BARS; i++) {
      var bar = document.createElement('i');
      var h = 28 + Math.abs(Math.sin((i + 1) * 2 * 0.73) * 58) + ((i * 7) % 14);
      bar.style.setProperty('--h', Math.min(100, h).toFixed(0) + '%');
      scrub.appendChild(bar);
    }
    var bars = $$('i', scrub);
    var paint = function (n) { pos = n; bars.forEach(function (b, k) { b.classList.toggle('on', k < n); }); };
    var stop = function () { clearInterval(playing); playing = null; player.classList.remove('is-playing'); btn.setAttribute('aria-label', 'Play recording'); };
    btn.addEventListener('click', function () {
      if (playing) { stop(); return; }
      if (pos >= BARS) paint(0);
      player.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Pause recording');
      playing = setInterval(function () { paint(pos + 1); if (pos >= BARS) stop(); }, 160);
    });
    paint(12);
  }

  /* ── Leaderboard: scores land, rows trade places ── */
  $$('[data-board]').forEach(function (board) {
    if (reduce || !canWatch) return;
    var START = $$('.row', board).map(function (r) { return { name: $('.row__name', r).textContent, score: +r.dataset.score, tries: +r.dataset.tries }; });
    var MOVES = [['Sara', 23], ['Omar', 19], ['Maha', 16], ['Omar', 24]];
    var m = 0, loop = null;
    var rowOf = function (name) { return $$('.row', board).filter(function (r) { return $('.row__name', r).textContent === name; })[0]; };
    var order = function () {
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
    };
    var paintRow = function (r, score, tries) {
      r.dataset.score = score; r.dataset.tries = tries;
      $('.row__score', r).textContent = score;
      $$('.row__tries i', r).forEach(function (d, i) { d.classList.toggle('used', i < tries); });
    };
    var play = function () {
      if (m >= MOVES.length) {
        START.forEach(function (s) { paintRow(rowOf(s.name), s.score, s.tries); });
        m = 0; order(); return;
      }
      var mv = MOVES[m++], r = rowOf(mv[0]);
      paintRow(r, mv[1], Math.min(3, +r.dataset.tries + 1));
      r.classList.remove('bump'); void r.offsetWidth; r.classList.add('bump');
      setTimeout(order, 260);
    };
    new IntersectionObserver(function (entries) {
      clearInterval(loop);
      if (entries[0].isIntersecting) loop = setInterval(play, 2800);
    }, { threshold: 0.4 }).observe(board);
  });
})();

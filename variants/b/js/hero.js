/* Leadish — the story at the top of the page, told in motion.
   1. The rep's call lights up.  2. Points fly to the leaderboard and rows trade places.
   3. The manager's card plays the recording.  Then it loops. Works on desktop and phone. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  // Underline under "wants to play." draws in once the page is ready.
  requestAnimationFrame(function () { setTimeout(function () { $$('.hl').forEach(function (h) { h.classList.add('in'); }); }, 450); });

  $$('[data-story]').forEach(function (story) {
    if (!story.offsetParent && getComputedStyle(story).position !== 'fixed') return; // hidden on this screen size
    var steps = [1, 2, 3].map(function (n) { return $('[data-step="' + n + '"]', story); });
    if (steps.some(function (s) { return !s; })) return;
    var board = $('[data-hero-board]', story);
    var call = steps[0];

    if (reduce) { steps.forEach(function (s) { s.classList.add('is-active'); }); return; }

    /* ── Leaderboard: who scores next ── */
    var START = board ? $$('.row', board).map(function (r) { return { name: $('.row__name', r).textContent, score: +r.dataset.score }; }) : [];
    var names = START.map(function (s) { return s.name; });
    var MOVES = [['Sara', 6], ['Omar', 9], ['Noor', 5], ['Sara', 4]].filter(function (m) { return names.indexOf(m[0]) > -1; });
    var move = 0;
    function rowOf(name) { return $$('.row', board).filter(function (r) { return $('.row__name', r).textContent === name; })[0]; }
    function reorder() {
      var list = $$('.row', board), first = list.map(function (r) { return r.getBoundingClientRect().top; });
      list.slice().sort(function (a, b) { return b.dataset.score - a.dataset.score; }).forEach(function (r) { board.appendChild(r); });
      list.forEach(function (r, i) {
        var dy = first[i] - r.getBoundingClientRect().top;
        if (!dy) return;
        r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
      });
      $$('.row', board).forEach(function (r, i) { $('.row__pos', r).textContent = i + 1; });
    }
    function setScore(r, v) { r.dataset.score = v; $('.row__score', r).textContent = v; }
    function reset() { START.forEach(function (s) { var r = rowOf(s.name); if (r) setScore(r, s.score); }); move = 0; reorder(); }

    /* ── Points fly from the call to the board ── */
    function fly(points, target, done) {
      var from = ($('.call__line', call) || $('.m-call__line', call) || call).getBoundingClientRect();
      var to = $('.row__score', target).getBoundingClientRect();
      var chip = document.createElement('span');
      chip.className = 'fly-chip';
      chip.textContent = '+' + points;
      document.body.appendChild(chip);
      var x0 = from.left + from.width / 2, y0 = from.top + from.height / 2, x1 = to.left + to.width / 2, y1 = to.top + to.height / 2;
      var midX = (x0 + x1) / 2, midY = Math.min(y0, y1) - 60;
      var a = chip.animate([
        { transform: 'translate(' + x0 + 'px,' + y0 + 'px) translate(-50%,-50%) scale(.6)', opacity: 0 },
        { transform: 'translate(' + x0 + 'px,' + (y0 - 18) + 'px) translate(-50%,-50%) scale(1)', opacity: 1, offset: .18 },
        { transform: 'translate(' + midX + 'px,' + midY + 'px) translate(-50%,-50%) scale(1)', opacity: 1, offset: .6 },
        { transform: 'translate(' + x1 + 'px,' + y1 + 'px) translate(-50%,-50%) scale(.7)', opacity: 0 }
      ], { duration: 1100, easing: 'cubic-bezier(.45,0,.2,1)' });
      a.onfinish = function () { chip.remove(); done(); };
    }

    /* ── The manager's card: the recording plays, the score counts up ── */
    function playRecording(step) {
      var bars = $$('.mgr__scrub i', step);
      bars.forEach(function (b) { b.classList.remove('on'); });
      bars.forEach(function (b, i) { setTimeout(function () { b.classList.add('on'); }, 120 + i * 110); });
      $$('[data-count]', step).forEach(function (el) {
        var to = +el.dataset.count, t0 = performance.now();
        (function tick(now) { var p = Math.min(1, (now - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
      });
      var play = $('.mgr__play, .m-heromgr__play', step);
      if (play) { play.classList.remove('pulse'); void play.offsetWidth; play.classList.add('pulse'); }
    }

    /* ── The loop ── */
    var at = -1, timer = null, running = false;
    function activate(i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (i === 1 && board && MOVES.length) {
        if (move >= MOVES.length) reset();
        var m = MOVES[move++], r = rowOf(m[0]);
        if (r) setTimeout(function () {
          fly(m[1], r, function () {
            setScore(r, +r.dataset.score + m[1]);
            r.classList.remove('bump'); void r.offsetWidth; r.classList.add('bump');
            setTimeout(reorder, 240);
          });
        }, 250);
      }
      if (i === 2) playRecording(steps[2]);
    }
    function next() { at = (at + 1) % 3; activate(at); timer = setTimeout(next, at === 1 ? 3400 : 3000); }
    new IntersectionObserver(function (entries) {
      var on = entries[0].isIntersecting && !document.hidden;
      if (on && !running) { running = true; timer = setTimeout(next, 1200); }
      if (!on && running) { running = false; clearTimeout(timer); }
    }, { threshold: 0.25 }).observe(story);
  });
})();

/* Variant B: the live leaderboard. A rep closes, "+points" flies in, the tag flips to "Closed the deal",
   their blob face changes (happy / sad / thinking), rows trade places and the crown moves to #1. Loops. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var TAGS = { closed: 'Closed the deal', call: 'On a call', hung: 'Hung up on' };
  var KING = null;
  // [name, points, new tag, who goes on a call next]
  var MOVES = [['Sara', 6, 'closed', 'Maha'], ['Maha', 0, 'hung', 'Omar'], ['Omar', 9, 'closed', 'Noor'], ['Noor', 5, 'closed', 'Sara']];

  $$('[data-scoreboard]').forEach(function (sb) {
    if (!sb.offsetParent) return;
    var rows = $('[data-sb-rows]', sb), timer = $('[data-sb-timer]', sb);
    var T = sb.classList.contains('sb--m') ? { closed: 'Closed', call: 'On a call', hung: 'Hung up' } : TAGS;
    var START = $$('.sb__row', rows).map(function (r) { return { name: r.dataset.name, score: +r.dataset.score, tag: r.dataset.tag }; });
    var m = 0, l = 0, secs = 760, loop = null, tick = null;
    function rowOf(n) { return $$('.sb__row', rows).filter(function (r) { return r.dataset.name === n; })[0]; }
    var FACE = { closed: 'happy', hung: 'sad', call: 'thinking' };
    function setFace(r, t) {
      var faces = window.LD_BLOBS && LD_BLOBS[r.dataset.name], old = $('.sb__blob', r);
      if (!faces || !old) return;
      old.insertAdjacentHTML('afterend', faces[FACE[t] || 'idle']); old.remove();
      var n = $('.sb__blob', r); n.classList.add('swap');
    }
    function setTag(r, t) { var was = r.dataset.tag; r.dataset.tag = t; var g = $('.sb__tag', r); g.dataset.t = t; g.textContent = T[t]; if (was !== t) setFace(r, t); }
    function setScore(r, v) { r.dataset.score = v; $('.sb__score', r).textContent = v; }
    /* One crown for the whole board. It sits on the #1 avatar; when the lead changes it lifts off,
       waits for the rows to finish swapping, then lands on the new #1. */
    var crown = $('[data-sb-crown]', sb), crownWait = null;
    function placeCrown() {
      var av = $('.sb__row .sb__av', rows); if (!av || !crown) return;
      var a = av.getBoundingClientRect(), s = sb.getBoundingClientRect();
      crown.style.left = (a.left - s.left + a.width / 2) + 'px';
      crown.style.top = (a.top - s.top + 7) + 'px';
    }
    function moveCrown() {
      if (!crown) return;
      clearTimeout(crownWait);
      crown.classList.remove('pop'); crown.classList.add('off');
      crownWait = setTimeout(function () {
        placeCrown(); crown.classList.remove('off'); void crown.offsetWidth; crown.classList.add('pop');
      }, 800);
    }
    function reorder() {
      var list = $$('.sb__row', rows), sorted = list.slice().sort(function (a, b) { return b.dataset.score - a.dataset.score; });
      var lead = sorted[0], leadChanged = lead.dataset.name !== sb.dataset.lead;
      sb.dataset.lead = lead.dataset.name;
      if (leadChanged) moveCrown();
      if (sorted.every(function (r, i) { return r === list[i]; })) return; // order unchanged: touch nothing
      var first = list.map(function (r) { return r.getBoundingClientRect().top; });
      sorted.forEach(function (r) { rows.appendChild(r); });
      list.forEach(function (r, i) { var dy = first[i] - r.getBoundingClientRect().top; if (dy) r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 750, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
      $$('.sb__row', rows).forEach(function (r, i) { $('.sb__pos', r).textContent = i + 1; });
    }
    sb.dataset.lead = $('.sb__row', rows).dataset.name;
    placeCrown();
    window.addEventListener('resize', function () { if (!crown.classList.contains('off')) placeCrown(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCrown);
    function fly(points, target, done) {
      var from = $('.sb__tag', target).getBoundingClientRect(), to = $('.sb__score', target).getBoundingClientRect();
      var c = document.createElement('span'); c.className = 'sb-fly'; c.textContent = '+' + points; document.body.appendChild(c);
      var x0 = from.left + from.width / 2, y0 = from.top + from.height / 2, x1 = to.left + to.width / 2, y1 = to.top + to.height / 2;
      var a = c.animate([
        { transform: 'translate(' + x0 + 'px,' + y0 + 'px) translate(-50%,-50%) scale(.6)', opacity: 0 },
        { transform: 'translate(' + x0 + 'px,' + (y0 - 30) + 'px) translate(-50%,-50%) scale(1.05)', opacity: 1, offset: .35 },
        { transform: 'translate(' + x1 + 'px,' + y1 + 'px) translate(-50%,-50%) scale(.8)', opacity: 0 }
      ], { duration: 1000, easing: 'cubic-bezier(.45,0,.2,1)' });
      a.onfinish = function () { c.remove(); done(); };
    }
    function step() {
      if (m >= MOVES.length) { START.forEach(function (s) { var r = rowOf(s.name); setScore(r, s.score); setTag(r, s.tag); }); m = 0; reorder(); return; }
      var mv = MOVES[m++], r = rowOf(mv[0]);
      var after = function () {
        setTag(r, mv[2]); if (mv[1]) setScore(r, +r.dataset.score + mv[1]);
        r.classList.remove('bump'); void r.offsetWidth; r.classList.add('bump');
        var nxt = rowOf(mv[3]); if (nxt && nxt !== r) setTag(nxt, 'call');
        setTimeout(reorder, 260);
      };
      if (mv[1]) setTimeout(function () { fly(mv[1], r, after); }, 500); else setTimeout(after, 700);
    }
    if (reduce) return;
    new IntersectionObserver(function (e) {
      clearInterval(loop); clearInterval(tick);
      if (e[0].isIntersecting && !document.hidden) {
        loop = setInterval(step, 3200);
        tick = setInterval(function () { secs = Math.max(0, secs - 1); if (!secs) secs = 760; timer.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'); }, 1000);
      }
    }, { threshold: 0.3 }).observe(sb);
  });
})();

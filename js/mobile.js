/* Leadish — phone page behaviours. Only runs when the phone layout is showing. */
(function () {
  'use strict';
  var m = document.getElementById('m');
  if (!m || getComputedStyle(m).display === 'none') return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero call: the conversation plays on a loop ── */
  var call = document.getElementById('mCall');
  if (call && !reduce && 'IntersectionObserver' in window) {
    var SCRIPT = [
      ['ai', 'Khalid', "I'm busy. You have one minute."],
      ['you', 'Noor', 'One question, then. What does an empty table cost you on a Tuesday?'],
      ['ai', 'Khalid', 'Too much. Go on.'],
      ['you', 'Noor', 'Ten minutes on Thursday. I will show you how to fill it.'],
      ['ai', 'Khalid', 'Fine. Thursday, after lunch.']
    ];
    var line = document.getElementById('mLine'), speaker = document.getElementById('mSpeaker'), clock = document.getElementById('mClock');
    var step = 0, seconds = 41, timer = null, ticker = null;
    function fmt(n) { var a = Math.floor(n / 60), b = n % 60; return (a < 10 ? '0' : '') + a + ':' + (b < 10 ? '0' : '') + b; }
    function advance() {
      step = (step + 1) % SCRIPT.length;
      if (step === 0) seconds = 4;
      var s = SCRIPT[step];
      call.setAttribute('data-turn', s[0]);
      speaker.textContent = s[1];
      line.textContent = '“' + s[2] + '”';
      line.classList.remove('is-new'); void line.offsetWidth; line.classList.add('is-new');
      timer = setTimeout(advance, step === SCRIPT.length - 1 ? 4600 : 3200);
    }
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
  var player = document.getElementById('mPlayer'), scrub = document.getElementById('mScrub');
  if (player && scrub) {
    var BARS = 30, playing = null, pos = 0;
    for (var i = 0; i < BARS; i++) {
      var b = document.createElement('i');
      var h = 28 + Math.abs(Math.sin((i + 1) * 2 * 0.73) * 58) + ((i * 7) % 14);
      b.style.setProperty('--h', Math.min(100, h).toFixed(0) + '%');
      scrub.appendChild(b);
    }
    var bars = scrub.querySelectorAll('i');
    function paint(n) { pos = n; for (var k = 0; k < bars.length; k++) bars[k].classList.toggle('on', k < n); }
    function stop() { clearInterval(playing); playing = null; player.classList.remove('is-playing'); btn.setAttribute('aria-label', 'Play recording'); }
    var btn = player.querySelector('button');
    btn.addEventListener('click', function () {
      if (playing) { stop(); return; }
      if (pos >= BARS) paint(0);
      player.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Pause recording');
      playing = setInterval(function () { paint(pos + 1); if (pos >= BARS) stop(); }, 160);
    });
    paint(11);
  }
})();

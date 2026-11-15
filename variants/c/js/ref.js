/* Leadish — who sent this visitor?
   Reads ?ref= (or utm_source) and utm_campaign / utm_content from the link the person
   arrived on, keeps the latest one for 60 days, and passes it along to /book so each
   booking in Notion shows its Source and Campaign. Example links for partners:
     https://leadish.app/?ref=trifid
     https://leadish.app/book?ref=faress&utm_campaign=video-objections */
(function () {
  'use strict';
  var KEY = 'leadish-ref', DAYS = 60;
  var clean = function (v) { return String(v || '').replace(/[^\w\-. ]/g, '').trim().slice(0, 60); };
  var q = new URLSearchParams(location.search);
  var source = clean(q.get('ref') || q.get('utm_source') || q.get('source'));
  var campaign = clean([q.get('utm_campaign'), q.get('utm_content')].filter(Boolean).join(' / '));
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (stored && Date.now() - stored.t > DAYS * 864e5) stored = null;
  if (source) {
    stored = { source: source, campaign: campaign, t: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(stored)); } catch (e) {}
  }
  var current = stored || { source: '', campaign: '' };
  window.leadishRef = function () { return { source: current.source || '', campaign: current.campaign || '' }; };

  // Keep the tag on every link to the booking page (works even if storage is blocked).
  if (current.source) {
    var add = function () {
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="/book"]'), function (a) {
        var u = new URL(a.getAttribute('href'), location.origin);
        u.searchParams.set('ref', current.source);
        if (current.campaign) u.searchParams.set('utm_campaign', current.campaign);
        a.setAttribute('href', u.pathname + u.search + u.hash);
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
  }
})();

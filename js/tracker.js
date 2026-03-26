/* ═══════════════════════════════════════════════════════
   tracker.js — Silent analytics collector
   Data is stored in localStorage under 'ogt_analytics'.
   Admin dashboard: /admin.html
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Skip tracking on the admin page itself */
  if (location.pathname.includes('admin.html')) return;

  const STORE_KEY   = 'ogt_analytics';
  const MAX_SESSIONS = 500;
  const MAX_CLICKS   = 2000;
  const MOVE_SAMPLE_MS = 1500; /* record pointer position every 1.5 s */

  /* ── helpers ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null') || { sessions: [], clicks: [], moves: [] }; }
    catch (_) { return { sessions: [], clicks: [], moves: [] }; }
  }
  function save(d) {
    try {
      if (d.sessions.length > MAX_SESSIONS) d.sessions = d.sessions.slice(-MAX_SESSIONS);
      if (d.clicks.length  > MAX_CLICKS)   d.clicks   = d.clicks.slice(-MAX_CLICKS);
      if (d.moves.length   > MAX_CLICKS)   d.moves    = d.moves.slice(-MAX_CLICKS);
      localStorage.setItem(STORE_KEY, JSON.stringify(d));
    } catch (_) {}
  }

  /* ── session identity ── */
  function getOrCreateSession() {
    let sid = sessionStorage.getItem('ogt_sid');
    if (!sid) {
      sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('ogt_sid', sid);
    }
    return sid;
  }

  function parseUA(ua) {
    let browser = 'Other', os = 'Other', device = 'Desktop';
    if (/Edg\//.test(ua))         browser = 'Edge';
    else if (/OPR\//.test(ua))    browser = 'Opera';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Firefox\//.test(ua))browser = 'Firefox';
    else if (/Safari\//.test(ua)) browser = 'Safari';
    if (/Windows/.test(ua))       os = 'Windows';
    else if (/Mac OS/.test(ua))   os = 'macOS';
    else if (/Android/.test(ua))  os = 'Android';
    else if (/iOS|iPhone|iPad/.test(ua)) os = 'iOS';
    else if (/Linux/.test(ua))    os = 'Linux';
    if (/Mobi|Android/i.test(ua)) device = 'Mobile';
    else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
    return { browser, os, device };
  }

  const sid      = getOrCreateSession();
  const startMs  = Date.now();
  const page     = location.pathname.split('/').pop() || 'index.html';
  const { browser, os, device } = parseUA(navigator.userAgent);

  /* ── record / update session entry ── */
  let data = load();
  let sessionIdx = data.sessions.findIndex(s => s.id === sid);

  if (sessionIdx === -1) {
    data.sessions.push({
      id:          sid,
      page:        page,
      title:       document.title,
      referrer:    document.referrer || '(direct)',
      browser,
      os,
      device,
      screen:      screen.width + '×' + screen.height,
      language:    navigator.language,
      ts:          new Date().toISOString(),
      duration:    0,
      scrollDepth: 0,
      clickCount:  0,
      moveCount:   0
    });
    sessionIdx = data.sessions.length - 1;
    save(data);
  }

  function updateSession(patch) {
    const d = load();
    if (d.sessions[sessionIdx]) {
      Object.assign(d.sessions[sessionIdx], patch);
      save(d);
    }
  }

  /* ── scroll depth ── */
  let maxScroll = 0;
  window.addEventListener('scroll', function () {
    const el   = document.documentElement;
    const pct  = el.scrollHeight - el.clientHeight > 0
      ? Math.round(window.scrollY / (el.scrollHeight - el.clientHeight) * 100)
      : 100;
    if (pct > maxScroll) {
      maxScroll = pct;
      updateSession({ scrollDepth: pct });
    }
  }, { passive: true });

  /* ── click tracking ── */
  document.addEventListener('click', function (e) {
    const el   = e.target;
    const anc  = el.closest('a');
    const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || '').trim().slice(0, 80);
    const href = (anc && anc.href) ? anc.href.replace(location.origin, '') : '';

    const d = load();
    d.clicks.push({
      sid,
      page,
      tag:  el.tagName.toLowerCase(),
      text: text || el.className.toString().slice(0, 40),
      href,
      xPct: Math.round(e.clientX / window.innerWidth  * 100),
      yPct: Math.round(e.clientY / window.innerHeight * 100),
      xPx:  e.clientX,
      yPx:  e.clientY,
      ts:   new Date().toISOString()
    });
    const s = d.sessions[sessionIdx];
    if (s) s.clickCount = (s.clickCount || 0) + 1;
    save(d);
  });

  /* ── pointer / mouse-move sampling ── */
  let lastMove = 0;
  window.addEventListener('mousemove', function (e) {
    const now = Date.now();
    if (now - lastMove < MOVE_SAMPLE_MS) return;
    lastMove = now;
    const d = load();
    d.moves.push({
      sid,
      page,
      xPct: Math.round(e.clientX / window.innerWidth  * 100),
      yPct: Math.round(e.clientY / window.innerHeight * 100),
      ts:   new Date().toISOString()
    });
    const s = d.sessions[sessionIdx];
    if (s) s.moveCount = (s.moveCount || 0) + 1;
    save(d);
  }, { passive: true });

  /* ── session duration on exit ── */
  function finalise() {
    updateSession({ duration: Math.round((Date.now() - startMs) / 1000) });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') finalise();
  });
  window.addEventListener('pagehide', finalise);
})();

/* Ballarat Total Carpet Cleaning: design preview by Dusk. No data leaves the page. */
(function () {
  'use strict';
  window.__btcc = true;
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-AU'); };

  root.classList.add('ready');

  /* ---------- header, menu, phone bar ---------- */
  var hdr = $('.hdr');
  var mbar = $('.mbar');
  var heroCta = $('[data-hero-cta]');
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('scrolled', y > 8);
    if (mbar) {
      var show = heroCta ? heroCta.getBoundingClientRect().bottom < 0 : y > 260;
      mbar.classList.toggle('show', show);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('.menu-btn');
  var sheet = $('#menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (sheet) sheet.setAttribute('aria-hidden', String(!open));
    if (sheet && 'inert' in sheet) sheet.inert = !open;
    if (open && sheet) { var first = $('a', sheet); if (first) setTimeout(function () { first.focus(); }, 120); }
  }
  if (sheet && 'inert' in sheet) sheet.inert = true;
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); if (menuBtn) menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1080 && root.classList.contains('menu-open')) setMenu(false); });

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- reveal on scroll ---------- */
  var revealTargets = $$('[data-reveal], .wipe, .prow, [data-count], .score-side .stars');
  if ('IntersectionObserver' in window && motion) {
    $$('[data-count]').forEach(function (n) { var d = (n.getAttribute('data-count').split('.')[1] || '').length; n.textContent = (0).toFixed(d); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach(function (t) { io.observe(t); });
  } else {
    revealTargets.forEach(function (t) { t.classList.add('in'); });
  }
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var t0 = performance.now(), dur = 1400;
    (function step(t) {
      var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- word band + reviews: pause buttons ---------- */
  $$('[data-pause]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-pause'));
    btn.addEventListener('click', function () {
      var paused = target.classList.toggle('paused');
      btn.setAttribute('aria-pressed', String(paused));
      $('span', btn).textContent = paused ? 'Play reviews' : 'Pause reviews';
      $('use', btn).setAttribute('href', paused ? '#i-play' : '#i-pause');
    });
  });

  /* ---------- prices: shared estimate ---------- */
  var ROOMS = { '0': 0, '12': 100, '3': 130, '4': 160, '5': null };
  var ROOM_LABEL = { '12': '1 or 2 rooms', '3': '3 rooms', '4': '4 rooms', '5': '5 or more rooms' };
  function estimate(s) {
    var lines = [], total = 0, quote = [];
    if (s.rooms && s.rooms !== '0') {
      if (ROOMS[s.rooms] == null) quote.push('Carpets, ' + ROOM_LABEL[s.rooms]);
      else { total += ROOMS[s.rooms]; lines.push(['Carpets, ' + ROOM_LABEL[s.rooms], money(ROOMS[s.rooms])]); }
      lines.push(['Deodorising', 'Free']);
    }
    if (s.pre) { total += 50; lines.push(['Pre-vacuum', 'from $50']); }
    if (s.couch === '3') { total += 150; lines.push(['Three-seater lounge', 'from $150']); }
    else if (s.couch === 'big') quote.push('Larger or modular lounge');
    if (s.rugs > 0) { total += 50 * s.rugs; lines.push([s.rugs + (s.rugs > 1 ? ' rugs' : ' rug'), 'from ' + money(50 * s.rugs)]); }
    if (s.mattress) quote.push('Mattress');
    if (s.lease) { total += 500; lines.push(['End of lease clean', 'from $500']); }
    return { total: total, lines: lines, quote: quote };
  }
  function tween(el, to) {
    var from = parseFloat(el.getAttribute('data-v') || '0');
    el.setAttribute('data-v', to);
    if (!motion) { el.textContent = money(to); return; }
    var t0 = performance.now();
    (function step(t) {
      if (el.getAttribute('data-v') != to) return;
      var p = clamp((t - t0) / 450, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = money(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    // land on the right figure even where animation frames are paused
    setTimeout(function () { if (el.getAttribute('data-v') == to) el.textContent = money(to); }, 520);
  }

  /* ---------- shared field check for both forms ---------- */
  function validField(f) {
    var input = $('input,select,textarea', f), ok = true, v = (input.value || '').trim();
    if (input.required && !v) ok = false;
    if (ok && input.type === 'tel' && v && v.replace(/\D/g, '').length < 8) ok = false;
    if (ok && input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
    f.classList.toggle('bad', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  /* ---------- instant price card (sends nothing) ---------- */
  var quick = $('[data-quick]');
  if (quick) {
    var qPanels = $$('.hq-panel', quick), qStep = $('[data-hq-n]', quick), qNum = $('.hq-num', quick);
    var qLabel = $('[data-hq-label]', quick), qNote = $('[data-hq-note]', quick), qQ = $('[data-hq-q]', quick);
    var job = null, rugN = 1, qAt = 0;
    var QUESTION = { carpets: 'How many rooms?', couch: 'What size is it?', rugs: 'How many rugs?', lease: 'How many bedrooms?' };
    var pick = function (n) { return (quick.querySelector('input[name="' + n + '"]:checked') || {}).value; };
    function price() {
      if (!job) return { n: 50, label: 'Prices from', note: 'Posted up front by Luke' };
      if (job === 'carpets') {
        var r = pick('rooms'), pre = quick.querySelector('input[name=pre]').checked;
        if (ROOMS[r] == null) return { n: null, label: 'Your price', note: 'Five rooms or more: Luke prices it on the phone' };
        return { n: ROOMS[r] + (pre ? 50 : 0), label: pre ? 'Your price, from' : 'Your price', note: 'Free deodorising included' + (pre ? ', pre-vacuum from $50' : '') };
      }
      if (job === 'couch') return pick('couch') === 'big' ? { n: null, label: 'Your price', note: 'Bigger and modular suites are priced on the phone' } : { n: 150, label: 'Your price, from', note: 'Three-seater lounge suite' };
      if (job === 'rugs') return { n: 50 * rugN, label: 'Your price, from', note: rugN + (rugN > 1 ? ' rugs' : ' rug') + ' at $50 each' };
      var b = pick('beds');
      return { n: 500, label: 'Your price, from', note: 'Vacate clean, ' + (b === '4' ? '4 or more bedrooms' : b + (b === '1' ? ' bedroom' : ' bedrooms')) };
    }
    function showPrice() {
      var p = price();
      qLabel.textContent = p.label; qNote.textContent = p.note;
      if (p.n == null) { qNum.textContent = 'Quote'; qNum.setAttribute('data-v', '0'); }
      else if (+qNum.getAttribute('data-v') !== p.n || qNum.textContent === 'Quote') tween(qNum, p.n);
      if (motion) { qNum.classList.remove('bump'); void qNum.offsetWidth; qNum.classList.add('bump'); }
    }
    function qGo(n) {
      qAt = n;
      quick.classList.add('moved');
      qPanels.forEach(function (p, i) { p.hidden = i !== n; p.classList.toggle('on', i === n); });
      qStep.textContent = n + 1;
      var lg = $('legend', qPanels[n]);
      lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true });
      var r = quick.getBoundingClientRect();
      if (r.top < 70) window.scrollBy({ top: r.top - 90, behavior: motion ? 'smooth' : 'auto' });
    }
    function choose(v) {
      job = v;
      $$('[data-for]', quick).forEach(function (o) { o.hidden = o.getAttribute('data-for') !== v; });
      qQ.textContent = QUESTION[v];
      showPrice();
      setTimeout(function () { qGo(1); }, motion ? 220 : 0);
    }
    // a tap or click on a tile moves straight on; with the keyboard, Enter moves on
    $$('input[name=job]', quick).forEach(function (r) {
      r.addEventListener('click', function (e) { if (e.detail > 0 || e.pointerType) choose(r.value); });
    });
    $$('[data-rug]', quick).forEach(function (b) {
      b.addEventListener('click', function () { rugN = clamp(rugN + +b.getAttribute('data-rug'), 1, 8); $('[data-rugs]', quick).textContent = rugN; showPrice(); });
    });
    quick.addEventListener('change', function (e) { if (e.target.name !== 'job' && e.target.name !== 'name' && e.target.name !== 'phone') showPrice(); });
    $$('[data-hq-back]', quick).forEach(function (b) { b.addEventListener('click', function () { qGo(qAt - 1); }); });
    $$('.fld', quick).forEach(function (f) {
      var input = $('input', f);
      input.addEventListener('blur', function () { if (input.value || f.classList.contains('bad')) validField(f); });
    });
    quick.addEventListener('submit', function (e) {
      e.preventDefault();
      if (qAt === 0) { var c = pick('job'); if (c) choose(c); else $('input[name=job]', quick).focus(); return; }
      if (qAt === 1) { qGo(2); return; }
      var bad = $$('.fld', qPanels[2]).filter(function (f) { return !validField(f); });
      if (bad.length) { $('input', bad[0]).focus(); return; }
      qPanels.forEach(function (p) { p.hidden = true; });
      $('.hq-count', quick).textContent = 'Request sent';
      var done = $('.hq-done', quick), name = (quick.querySelector('[name=name]').value || '').trim().split(' ')[0];
      if (name) $('[data-name]', done).textContent = ', ' + name;
      done.hidden = false; done.focus({ preventScroll: true });
    });
    var jump = $('[data-hq-jump]');
    if (jump) jump.addEventListener('click', function (e) {
      e.preventDefault();
      var top = quick.closest('.hq').getBoundingClientRect().top + window.scrollY - 86;
      if (Math.abs(top - window.scrollY) > 40) window.scrollTo({ top: top, behavior: motion ? 'smooth' : 'auto' });
      var first = $('input[name=job]', quick); if (first && qAt === 0) setTimeout(function () { first.focus({ preventScroll: true }); }, motion ? 500 : 0);
    });
    // rotate the short review quotes on the photo
    var revs = $$('.hq-rev-i');
    if (revs.length > 1 && motion) {
      var ri = 0;
      setInterval(function () {
        if (document.hidden) return;
        revs[ri].classList.remove('on'); revs[ri].setAttribute('aria-hidden', 'true');
        ri = (ri + 1) % revs.length;
        revs[ri].classList.add('on'); revs[ri].removeAttribute('aria-hidden');
      }, 5200);
    }
  }

  /* ---------- how it works: pinned story ---------- */
  var story = $('[data-story]');
  if (story && motion) {
    story.classList.add('pinned');
    var layers = $$('.sm-layer', story), steps = $$('.story-steps li', story), bars = $$('.story-bar i', story);
    var smWand = $('.sm-wand', story), countEl = $('.sm-count', story), cur = 0;
    story.style.setProperty('--steps', steps.length);
    function setStep(n) {
      if (n === cur) return;
      var dir = n > cur ? 'down' : 'up';
      layers.forEach(function (l, i) { l.classList.toggle('on', i <= n); });
      steps.forEach(function (s, i) { s.classList.toggle('on', i === n); });
      bars.forEach(function (b, i) { b.classList.toggle('on', i <= n); });
      if (countEl) countEl.textContent = '0' + (n + 1);
      if (smWand) { smWand.classList.remove('down', 'up'); void smWand.offsetWidth; smWand.classList.add(dir); }
      cur = n;
    }
    steps[0].classList.add('on'); if (bars[0]) bars[0].classList.add('on'); layers[0].classList.add('on');
    function onStory() {
      var r = story.getBoundingClientRect(), total = story.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / Math.max(1, total), 0, 0.999);
      setStep(Math.floor(p * steps.length));
    }
    window.addEventListener('scroll', onStory, { passive: true });
    window.addEventListener('resize', onStory);
    onStory();
  }

  /* ---------- the van band: slow parallax ---------- */
  var local = $('[data-parallax]');
  if (local && motion) {
    var raf = 0;
    var par = function () {
      raf = 0;
      var r = local.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      local.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height), 0, 1).toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(par); }, { passive: true });
    par();
  }

  /* ---------- the reel ---------- */
  $$('[data-reel]').forEach(function (box) {
    var v = $('video', box), btn = $('.reel-btn', box);
    if (!v || !btn) return;
    // the sharper copy of the clip is VP9; Chrome, Edge and Firefox play it, Safari keeps the H.264 copy
    var hd = v.getAttribute('data-hd'), safari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
    if (hd && !safari && v.canPlayType('video/mp4; codecs="vp09.00.40.08"') === 'probably' && window.innerWidth > 380) {
      var src = $('source', v); src.setAttribute('src', hd); v.load();
    }
    var userPaused = false;
    function sync() {
      var playing = !v.paused;
      $('span', btn).textContent = playing ? 'Pause' : 'Play clip';
      $('use', btn).setAttribute('href', playing ? '#i-pause' : '#i-play');
    }
    btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; v.play().catch(function () {}); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    if (motion && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!userPaused) v.play().catch(function () {}); } else v.pause();
      }, { threshold: 0.35 }).observe(box);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && motion && !userPaused) { var r = box.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) v.play().catch(function () {}); } });
    sync();
  });

  /* ---------- filters (gallery, reviews) ---------- */
  $$('[data-filter-for]').forEach(function (bar) {
    var list = document.getElementById(bar.getAttribute('data-filter-for'));
    var items = $$('[data-kind]', list), status = $('[data-filter-status]');
    $$('button', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        $$('button', bar).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var shown = 0;
        items.forEach(function (it) { var on = k === 'all' || it.getAttribute('data-kind').split(' ').indexOf(k) > -1; it.hidden = !on; if (on) shown++; });
        if (status) status.textContent = 'Showing ' + shown + (shown === 1 ? ' item' : ' items');
      });
    });
  });

  /* ---------- gallery viewer ---------- */
  var lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb), lbCap = $('p', lb), list = [], at = 0;
    function show(i) {
      list = $$('.gal-item').filter(function (x) { return !x.hidden; });
      at = (i + list.length) % list.length;
      var it = list[at], im = $('img', it);
      lbImg.src = it.getAttribute('data-full') || im.currentSrc || im.src;
      lbImg.alt = im.alt;
      lbCap.textContent = it.getAttribute('data-cap') || im.alt;
    }
    $$('.gal-item').forEach(function (it) {
      it.addEventListener('click', function () { show($$('.gal-item').filter(function (x) { return !x.hidden; }).indexOf(it)); lb.showModal(); });
    });
    $('[data-lb-prev]', lb).addEventListener('click', function () { show(at - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { show(at + 1); });
    $('[data-lb-close]', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); });
  }

  /* ---------- opening hours: mark today ---------- */
  $$('.hours tr[data-day]').forEach(function (tr) { if (+tr.getAttribute('data-day') === new Date().getDay()) tr.classList.add('today'); });

  /* ---------- quote form (sends nothing) ---------- */
  var form = $('#quote-form');
  if (form) {
    var panels = $$('.qf-panel', form), dots = $$('.qf-steps li'), at2 = 0;
    var params = new URLSearchParams(location.search);
    function pick(name, val) { var x = form.querySelector('input[name="' + name + '"][value="' + val + '"]'); if (x) x.checked = true; }
    if (params.get('rooms')) { pick('need', 'carpets'); pick('rooms', params.get('rooms')); }
    if (params.get('pre')) form.querySelector('input[name=pre]').checked = true;
    if (params.get('couch')) { pick('need', 'couch'); pick('couch', params.get('couch')); }
    if (params.get('rugs')) { pick('need', 'rugs'); var rs = form.querySelector('select[name=rugs]'); if (rs) rs.value = String(clamp(+params.get('rugs'), 1, 6)); }
    if (params.get('mattress')) pick('need', 'mattress');
    if (params.get('lease')) pick('need', 'lease');

    function needs() { return $$('input[name=need]:checked', form).map(function (x) { return x.value; }); }
    function syncBlocks() {
      var n = needs();
      $$('[data-for]', form).forEach(function (b) { b.hidden = n.indexOf(b.getAttribute('data-for')) < 0; });
      $('[data-none]', form).hidden = n.some(function (x) { return ['carpets', 'couch', 'rugs', 'lease'].indexOf(x) > -1; });
      var s = {
        rooms: n.indexOf('carpets') > -1 ? ((form.querySelector('input[name=rooms]:checked') || {}).value || '0') : '0',
        pre: n.indexOf('carpets') > -1 && form.querySelector('input[name=pre]').checked,
        couch: n.indexOf('couch') > -1 ? ((form.querySelector('input[name=couch]:checked') || {}).value || '0') : '0',
        rugs: n.indexOf('rugs') > -1 ? +form.querySelector('select[name=rugs]').value : 0,
        mattress: n.indexOf('mattress') > -1,
        lease: n.indexOf('lease') > -1
      };
      var r = estimate(s), est = $('.qf-est', form);
      est.hidden = !(r.total || r.quote.length);
      $('b', est).textContent = r.total ? 'From ' + money(r.total) : 'On the phone';
      $('small', est).textContent = (r.quote.length ? 'Plus ' + r.quote.join(' and ').toLowerCase() + ', priced on the phone. ' : '') + 'Worked out from the prices Luke posted on Facebook. He confirms the exact price before booking.';
    }
    form.addEventListener('change', syncBlocks);
    syncBlocks();

    function go(n) {
      at2 = n;
      panels.forEach(function (p, i) { p.hidden = i !== n; });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === n); d.classList.toggle('done', i < n); if (i === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      var lg = $('legend', panels[n]); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); }
      var top = $('#quote').getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: motion ? 'smooth' : 'auto' });
    }
    $$('.fld', form).forEach(function (f) {
      var input = $('input,select,textarea', f);
      input.addEventListener('blur', function () { if (input.value || f.classList.contains('bad')) validField(f); });
    });
    $$('[data-next]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        if (at2 === 0) {
          var ok = needs().length > 0;
          panels[0].classList.toggle('bad', !ok);
          if (!ok) { $('input', panels[0]).focus(); return; }
        }
        go(at2 + 1);
      });
    });
    $$('[data-back]', form).forEach(function (b) { b.addEventListener('click', function () { go(at2 - 1); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('.fld', panels[panels.length - 1]).filter(function (f) { return !validField(f); });
      if (bad.length) { $('input,select,textarea', bad[0]).focus(); return; }
      form.hidden = true;
      dots.forEach(function (d) { d.classList.remove('on'); d.classList.add('done'); d.removeAttribute('aria-current'); });
      var done = $('#quote-done');
      done.hidden = false;
      var name = (form.querySelector('[name=name]').value || '').trim().split(' ')[0];
      if (name) $('[data-name]', done).textContent = ', ' + name;
      done.setAttribute('tabindex', '-1'); done.focus();
    });
  }
})();

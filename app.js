(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- tema ---------- */
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  function syncMeta() { metaTheme.content = root.dataset.theme === 'dark' ? '#0B0B0C' : '#FFFFFF'; }
  syncMeta();
  document.querySelectorAll('.theme-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      syncMeta();
      try { localStorage.setItem('kv1-theme', next); } catch (e) {}
    });
  });

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('burger');
  var sheet = document.getElementById('sheet');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    sheet.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(sheet.hidden); });
  sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900 && !sheet.hidden) setMenu(false); });

  /* ---------- kata berganti ---------- */
  var words = document.querySelectorAll('#rotator span');
  var wi = 0;
  setInterval(function () {
    var prev = words[wi];
    prev.classList.remove('on');
    prev.classList.add('out');
    setTimeout(function () { prev.classList.remove('out'); }, 650);
    wi = (wi + 1) % words.length;
    words[wi].classList.add('on');
  }, 2400);

  /* ---------- harga ---------- */
  var PRICES = {
    konten: {
      note: 'Butuh jumlah konten lain atau kombinasi paket? DM aja, nanti kita hitung bareng.',
      plans: [
        { tag: 'satuan', name: '1 konten', desc: 'Satu video atau konten, cocok buat coba dulu.', price: 'Rp50rb', unit: '/konten' },
        { tag: 'paket 3', name: '3 konten', desc: 'Lebih hemat buat posting rutin seminggu.', price: 'Rp120rb', unit: '/paket', hi: true },
        { tag: 'paket 5', name: '5 konten', desc: 'Paling hemat per konten, enak buat stok kampanye.', price: 'Rp190rb', unit: '/paket' }
      ]
    },
    bulanan: {
      note: 'Harga kelola akun adalah harga start dan bisa menyesuaikan kebutuhan akunmu.',
      plans: [
        { tag: 'starter', name: 'Starter', desc: 'Sekitar 8 sampai 12 konten per bulan.', price: 'Rp500rb', unit: '/bulan', start: true },
        { tag: 'growth', name: 'Growth', desc: 'Konten rutin ditambah strategi dan laporan bulanan.', price: 'Rp750rb', unit: '/bulan', start: true, hi: true },
        { tag: 'full', name: 'Kelola penuh', desc: 'Konten, caption, dan jadwal posting aku yang pegang.', price: 'Rp1jt', unit: '/bulan', start: true }
      ]
    },
    lain: {
      note: 'Ceritain kebutuhanmu lewat DM, harga disepakati sebelum mulai.',
      plans: [
        { tag: 'web', name: 'Web dan produk digital', desc: 'Landing page, toko online, atau tool. Harga menyesuaikan fitur.', price: 'Diskusi', unit: 'via DM', hi: true },
        { tag: 'kolab', name: 'Kolaborasi dan sponsor', desc: 'Bentuk kerja sama dan nilainya kita sepakati bareng.', price: 'Diskusi', unit: 'via DM' }
      ]
    }
  };

  function renderPrices(key) {
    var box = document.getElementById('plans');
    box.textContent = '';
    PRICES[key].plans.forEach(function (p) {
      var row = el('div', 'plan' + (p.hi ? ' hi' : ''));
      var n = el('div', 'plan-n');
      n.appendChild(el('small', null, p.tag));
      n.appendChild(el('b', null, p.name));
      var pr = el('div', 'plan-p');
      if (p.start) pr.appendChild(el('div', 'start', 'start'));
      var r = el('div', 'row');
      r.appendChild(el('div', 'price', p.price));
      r.appendChild(el('div', 'unit', p.unit));
      pr.appendChild(r);
      row.appendChild(n);
      row.appendChild(el('div', 'plan-d', p.desc));
      row.appendChild(pr);
      box.appendChild(row);
    });
    document.getElementById('priceNote').textContent = PRICES[key].note;
  }

  function wireTabs(containerId, attr, onPick) {
    var tabs = document.querySelectorAll('#' + containerId + ' .chip');
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.toggle('on', x === b); });
        onPick(b.getAttribute(attr));
      });
    });
  }
  wireTabs('priceTabs', 'data-t', renderPrices);
  renderPrices('konten');

  /* ---------- karya ---------- */
  var TYPE = {
    slide: { tag: 'Slide', empty: 'Tambahkan gambar slide' },
    motion: { tag: 'Motion graphic', empty: 'Tambahkan video motion' },
    produk: { tag: 'Video produk', empty: 'Tambahkan video produk' }
  };

  // Ubah link biasa jadi link embed. Kembalikan null kalau tidak bisa diputar di halaman.
  function toEmbed(url) {
    var u;
    try { u = new URL(url); } catch (e) { return null; }
    var host = u.hostname.replace(/^www\.|^m\./, '');
    var path = u.pathname;
    var m;
    if (host === 'youtu.be') return yt(path.slice(1).split('/')[0]);
    if (/(^|\.)youtube\.com$/.test(host)) {
      if (u.searchParams.get('v')) return yt(u.searchParams.get('v'));
      if ((m = path.match(/^\/(shorts|embed|live)\/([\w-]{6,})/))) return yt(m[2]);
      return null;
    }
    if (/(^|\.)instagram\.com$/.test(host) && (m = path.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/))) {
      var kind = m[1] === 'reels' ? 'reel' : m[1];
      return { src: 'https://www.instagram.com/' + kind + '/' + m[2] + '/embed/', name: 'Instagram' };
    }
    if (/(^|\.)tiktok\.com$/.test(host) && (m = path.match(/\/video\/(\d+)/))) {
      return { src: 'https://www.tiktok.com/embed/v2/' + m[1], name: 'TikTok' };
    }
    if (/(^|\.)vimeo\.com$/.test(host) && (m = path.match(/\/(\d+)/))) {
      return { src: 'https://player.vimeo.com/video/' + m[1], name: 'Vimeo' };
    }
    if (host === 'drive.google.com' && (m = path.match(/\/file\/d\/([\w-]+)/))) {
      return { src: 'https://drive.google.com/file/d/' + m[1] + '/preview', name: 'Google Drive' };
    }
    if (/(^|\.)canva\.com$/.test(host) && (m = path.match(/^\/design\/([\w-]+)(?:\/([\w-]+))?/))) {
      return { src: 'https://www.canva.com/design/' + m[1] + (m[2] ? '/' + m[2] : '') + '/view?embed', name: 'Canva' };
    }
    return null;
    function yt(id) {
      return id ? { src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?rel=0&playsinline=1', name: 'YouTube' } : null;
    }
  }

  function svg(d, fill) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('width', '20'); s.setAttribute('height', '20'); s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', fill ? 'currentColor' : 'none');
    if (!fill) { s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2.2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); }
    var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); s.appendChild(p);
    return s;
  }

  function isHttp(s) { return typeof s === 'string' && /^https?:\/\//i.test(s.trim()); }

  function buildWork(w) {
    var info = TYPE[w.type] || TYPE.slide;
    var card = el('article', 'work');
    var media = el('div', 'media');
    media.style.aspectRatio = w.ratio || '4 / 5';
    var tags = [info.tag];

    var imgs = (w.images || []).filter(Boolean);
    var link = (w.link || '').trim();

    if (w.type === 'slide' && imgs.length) {
      var idx = 0;
      var img = el('img');
      img.alt = w.title || 'Contoh karya';
      img.loading = 'lazy';
      img.src = imgs[0];
      media.appendChild(img);
      if (imgs.length > 1) {
        tags.push(imgs.length + ' slide');
        var dots = el('div', 'dots');
        imgs.forEach(function (_, i) { dots.appendChild(el('i', i === 0 ? 'on' : '')); });
        var go = function (step) {
          idx = (idx + step + imgs.length) % imgs.length;
          img.src = imgs[idx];
          Array.prototype.forEach.call(dots.children, function (d, i) { d.className = i === idx ? 'on' : ''; });
        };
        var l = el('button', 'nav-arrow l'); l.type = 'button'; l.setAttribute('aria-label', 'Slide sebelumnya'); l.appendChild(svg('M15 18l-6-6 6-6'));
        var r = el('button', 'nav-arrow r'); r.type = 'button'; r.setAttribute('aria-label', 'Slide berikutnya'); r.appendChild(svg('M9 18l6-6-6-6'));
        l.addEventListener('click', function () { go(-1); });
        r.addEventListener('click', function () { go(1); });
        var sx = null;
        media.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
        media.addEventListener('touchend', function (e) {
          if (sx === null) return;
          var dx = e.changedTouches[0].clientX - sx;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          sx = null;
        });
        media.appendChild(l); media.appendChild(r); media.appendChild(dots);
      }
    } else if (w.type !== 'slide' && w.src) {
      var v = el('video');
      v.src = w.src;
      if (w.poster) v.poster = w.poster;
      v.controls = true; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
      media.appendChild(v);
    } else if (isHttp(link)) {
      var emb = toEmbed(link);
      if (emb) {
        var f = el('iframe');
        f.src = emb.src;
        f.title = (w.title || 'Karya') + ' di ' + emb.name;
        f.loading = 'lazy';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
        f.setAttribute('allowfullscreen', '');
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        media.appendChild(f);
        tags.push(emb.name);
      } else {
        var a = el('a', 'linkcard');
        a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer';
        var host = ''; try { host = new URL(link).hostname.replace(/^www\./, ''); } catch (e) {}
        var p = el('div', 'play'); p.appendChild(svg('M8 5.5v13l11-6.5z', true));
        a.appendChild(p);
        a.appendChild(el('b', null, (w.type === 'slide' ? 'Lihat' : 'Tonton') + ' karya'));
        a.appendChild(el('small', null, host));
        media.appendChild(a);
        if (host) tags.push(host);
      }
    } else {
      var ph = el('div', 'ph');
      ph.appendChild(svg('M12 5v14M5 12h14'));
      ph.appendChild(el('b', null, info.empty));
      ph.appendChild(el('small', null, 'rasio ' + (w.ratio || '4 / 5')));
      media.appendChild(ph);
    }

    card.appendChild(media);
    var inf = el('div', 'work-info');
    inf.appendChild(el('div', 'work-t', w.title || ''));
    if (w.desc) inf.appendChild(el('div', 'work-d', w.desc));
    var tg = el('div', 'tags');
    tags.forEach(function (t) { tg.appendChild(el('span', null, t)); });
    inf.appendChild(tg);
    card.appendChild(inf);
    return card;
  }

  var DATA = Array.isArray(window.KARYA) ? window.KARYA : [];
  function renderWorks(filter) {
    var box = document.getElementById('works');
    box.textContent = '';
    DATA.filter(function (w) { return filter === 'semua' || w.type === filter; })
        .forEach(function (w) { box.appendChild(buildWork(w)); });
  }
  wireTabs('filters', 'data-f', renderWorks);
  renderWorks('semua');

  /* ---------- kartu melengkung di hero ---------- */
  var arc = document.getElementById('arc');
  var COLORS = [
    { c: '#A6F2D3' }, { c: '#8BE6F2' }, { c: '#06262E', dark: true },
    { c: '#5FE3B8' }, { c: '#D6F6F8' }, { c: '#3CC6DC' }
  ];
  var src = DATA.length ? DATA : [{ type: 'slide', title: 'kv1' }];
  var N = 11;
  var cards = [];
  for (var i = 0; i < N; i++) {
    var w = src[i % src.length];
    var col = COLORS[i % COLORS.length];
    var c = el('a', 'card' + (col.dark ? ' dark' : ''));
    c.href = '#karya';
    c.draggable = false;
    c.style.setProperty('--c', col.c);
    c.setAttribute('aria-label', (w.title || 'Karya') + ', lihat di bagian karya');
    c.appendChild(el('div', 'card-tag', (TYPE[w.type] || TYPE.slide).tag));
    c.appendChild(el('div', 'card-t', w.title || 'kv1'));
    var m = el('div', 'card-m');
    var pic = (w.images && w.images.filter(Boolean)[0]) || w.poster;
    if (pic) {
      var im = el('img'); im.src = pic; im.alt = ''; im.loading = 'lazy'; im.draggable = false;
      m.appendChild(im);
    } else {
      var mk = el('div', 'mock');
      for (var k = 0; k < 4; k++) mk.appendChild(el('i'));
      m.appendChild(mk);
    }
    c.appendChild(m);
    arc.appendChild(c);
    cards.push(c);
  }

  var dragOff = 0, scrollOff = 0, introOff = reduce ? 0 : 4;
  var LIM = (N - 1) / 2 - 1.5;
  function layout() {
    var cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
    var R = cw * 4.2;
    var step = (cw * 0.8) / R * 180 / Math.PI;
    var off = Math.max(-LIM, Math.min(LIM, dragOff + scrollOff)) + introOff;
    cards.forEach(function (card, j) {
      var a = (j - (N - 1) / 2 + off) * step;
      card.style.transformOrigin = '50% ' + (ch + R) + 'px';
      card.style.transform = 'rotate(' + a.toFixed(3) + 'deg)';
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      scrollOff = -Math.min(window.scrollY, 900) / 300;
      layout();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);

  // geser kartu dengan drag atau swipe
  var startX = null, startOff = 0, moved = false;
  arc.addEventListener('pointerdown', function (e) {
    startX = e.clientX; startOff = dragOff; moved = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    dragOff = Math.max(-LIM - scrollOff, Math.min(LIM - scrollOff, startOff + dx / (cards[0].offsetWidth * 0.8)));
    layout();
  });
  window.addEventListener('pointerup', function () { startX = null; });
  window.addEventListener('pointercancel', function () { startX = null; });
  arc.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

  if (reduce) {
    arc.classList.add('ready');
    layout();
  } else {
    arc.classList.add('pre');
    layout();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        arc.classList.remove('pre');
        introOff = 0;
        layout();
        setTimeout(function () { arc.classList.add('ready'); }, 1200);
      });
    });
  }
})();

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

  /* ---------- kalkulator ---------- */
  (function () {
    var PACK = [{ n: 5, p: 190, t: 'paket 5' }, { n: 3, p: 120, t: 'paket 3' }, { n: 1, p: 50, t: 'satuan' }];
    var PLAN = { starter: 500, growth: 750, penuh: 1000 };
    var DM = 'https://www.instagram.com/kv1boyfromars/';
    var box = document.getElementById('calc');
    if (!box) return;
    var range = document.getElementById('cN');
    var st = { n: +range.value, mode: 'konten', fmt: { video: true } };
    var shown = 0, raf = 0, last = null;

    function rp(v) { return v.toLocaleString('id-ID'); }
    function fm(v) { return v >= 1000 ? (v / 1000).toString().replace('.', ',') + 'jt' : rp(v) + 'rb'; }
    function best(n) {
      var cost = [0], pick = [null], i;
      for (i = 1; i <= n; i++) {
        cost[i] = Infinity;
        PACK.forEach(function (k) {
          if (i >= k.n && cost[i - k.n] + k.p < cost[i]) { cost[i] = cost[i - k.n] + k.p; pick[i] = k; }
        });
      }
      var parts = {}, r = n;
      while (r > 0) { var k = pick[r]; parts[k.t] = (parts[k.t] || 0) + 1; r -= k.n; }
      return { total: cost[n], parts: parts };
    }
    function names() {
      var a = Object.keys(st.fmt).filter(function (k) { return st.fmt[k]; });
      return a.length ? a.join(', ') : 'video';
    }
    function count(to) {
      cancelAnimationFrame(raf);
      var el0 = document.getElementById('cTotal'), from = shown;
      if (reduce || from === to) { shown = to; el0.textContent = fm(to); return; }
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3);
        shown = Math.round(from + (to - from) * e);
        el0.textContent = fm(shown);
        if (k < 1) raf = requestAnimationFrame(tick);
      })(t0);
    }
    function render() {
      var n = st.n, b = best(n), total, kind, lines, save = '', note;
      var extra = Math.max(0, n - 12);
      if (st.mode === 'konten') {
        total = b.total; kind = 'Paket konten'; note = 'Harga per paket dan sudah termasuk editing. Format bisa dicampur.';
        lines = Object.keys(b.parts).map(function (t) { return b.parts[t] + ' x ' + t; }).join(' + ');
        if (n * 50 > total) save = 'Hemat Rp' + rp(n * 50 - total) + 'rb dari satuan';
      } else if (st.mode === 'strategi') {
        total = PLAN.growth + extra * 100; kind = 'Kelola akun Growth';
        note = 'Harga start untuk 12 konten, tiap konten tambahan Rp100rb. Strategi dan laporan bulanan sudah termasuk.';
        lines = n + ' konten per bulan ditambah strategi dan laporan.';
      } else {
        total = Math.min(3500, PLAN.penuh + extra * 140); kind = 'Kelola penuh';
        note = 'Harga start untuk 12 konten, tiap konten tambahan Rp140rb, maksimal Rp3,5jt. Caption dan jadwal posting aku yang pegang.';
        lines = n + ' konten per bulan, caption, dan jadwal posting.';
      }
      document.getElementById('cKind').textContent = kind;
      document.getElementById('cBreak').textContent = lines;
      document.getElementById('cSave').textContent = save;
      document.getElementById('cNote').textContent = note;
      document.getElementById('cUnit').textContent = '/bulan';
      count(total);
      last = { total: total, kind: kind, lines: lines };
    }
    function pct() { range.style.setProperty('--p', ((st.n - 1) / 29 * 100) + '%'); }

    range.addEventListener('input', function () {
      st.n = +range.value;
      document.getElementById('cNv').textContent = st.n;
      pct(); render();
    });
    document.querySelectorAll('#cMode button').forEach(function (b) {
      b.addEventListener('click', function () {
        st.mode = b.getAttribute('data-m');
        document.querySelectorAll('#cMode button').forEach(function (x) {
          x.setAttribute('aria-checked', x === b ? 'true' : 'false');
        });
        render();
      });
    });
    document.querySelectorAll('#cFmt .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        var on = !st.fmt[f];
        var cnt = Object.keys(st.fmt).filter(function (k) { return st.fmt[k]; }).length;
        if (!on && cnt === 1) return;
        st.fmt[f] = on;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
    document.getElementById('cGo').addEventListener('click', function () {
      var msg = 'Halo kv1, aku mau tanya ' + last.kind + ': ' + st.n + ' konten per bulan, format ' + names() +
        '. Estimasi di situs Rp' + rp(last.total) + 'rb.';
      var btn = this, old = btn.textContent, ok = false;
      try { navigator.clipboard.writeText(msg).catch(function () { btn.textContent = 'Buka DM, lalu ketik pesanmu'; }); ok = true; } catch (e) { ok = false; }
      btn.textContent = ok ? 'Tersalin, tempel di DM' : 'Buka DM, lalu ketik pesanmu';
      setTimeout(function () { btn.textContent = old; }, 2600);
      window.open(DM, '_blank', 'noopener');
    });
    pct(); render();
  })();

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
    } else if (w.html) {
      var fr = el('iframe');
      fr.src = w.html;
      fr.title = w.title || 'Motion graphic';
      fr.loading = 'lazy';
      fr.setAttribute('tabindex', '-1');
      media.appendChild(fr);
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

  /* ---------- kartu platform melengkung di hero ----------
     Ubah teks, warna, atau urutan kartu di daftar PLATFORM.
     logo: isi path gambar logo resmi (misal 'img/logo/instagram.svg') kalau mau
           pakai logo. Kalau kosong, nama platform tampil sebagai teks. */
  var PLATFORM = [
    { key: 'tiktok',    name: 'TikTok',    sub: 'Video pendek',    dev: 'phone',  logo: '' },
    { key: 'facebook',  name: 'Facebook',  sub: 'Halaman & iklan', dev: 'laptop', logo: '' },
    { key: 'lazada',    name: 'Lazada',    sub: 'Toko online',     dev: 'tablet', logo: '' },
    { key: 'shopee',    name: 'Shopee',    sub: 'Foto produk',     dev: 'phone',  logo: '' },
    { key: 'x',         name: 'X',         sub: 'Thread & post',   dev: 'laptop', logo: '' },
    { key: 'whatsapp',  name: 'WhatsApp',  sub: 'Chat order',      dev: 'phone',  logo: '' },
    { key: 'instagram', name: 'Instagram', sub: 'Feed & reels',    dev: 'phone',  logo: '' }
  ];

  function h(tag, cls, kids) {
    var n = el(tag, cls);
    (kids || []).forEach(function (k) { n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return n;
  }
  function bars(n) { var b = h('div', 'bars'); for (var i = 0; i < n; i++) b.appendChild(el('i')); return b; }
  function icons(n) { var b = h('div', 'ics'); for (var i = 0; i < n; i++) b.appendChild(el('i')); return b; }

  var SCREEN = {
    instagram: function () {
      return [
        h('div', 'ig-top', [el('span', 'ig-av'), el('b', null, 'kv1boyfromars'), el('span', 'dots3')]),
        h('div', 'ig-img', [el('small', null, 'PROMO MINGGU INI'), el('b', null, 'Kopi susu beli 2 gratis 1')]),
        icons(3),
        bars(2)
      ];
    },
    tiktok: function () {
      return [
        h('div', 'tt-side', [el('i', 'av'), el('i'), el('i'), el('i')]),
        h('div', 'tt-cap', [el('b', null, '@kv1boyfromars'), el('span', null, 'Latte art 15 detik #kopi #fyp'), el('em')])
      ];
    },
    shopee: function () {
      return [
        h('div', 'sp-top', [el('span')]),
        h('div', 'sp-img', [el('small', null, 'Terlaris'), el('b', null, 'Keripik Pedas Level 5')]),
        h('div', 'sp-info', [el('b', null, 'Rp25.000'), bars(1)]),
        el('div', 'sp-btn', 'Beli Sekarang')
      ];
    },
    lazada: function () {
      var g = h('div', 'lz-grid');
      [['#FFD6C2', 'Rp49rb'], ['#C9E7FF', 'Rp89rb'], ['#FFE8A3', 'Rp35rb'], ['#D7F5E3', 'Rp120rb']].forEach(function (p) {
        var t = h('div', 'lz-it', [el('span'), el('b', null, p[1])]);
        t.firstChild.style.background = p[0];
        g.appendChild(t);
      });
      return [h('div', 'lz-top', [el('span')]), el('div', 'lz-ban', 'Flash Sale 10.10'), g];
    },
    x: function () {
      return [
        h('div', 'x-post', [
          el('span', 'x-av'),
          h('div', 'x-body', [
            h('div', 'x-name', [el('b', null, 'kv1media'), el('span', null, '@kv1media · 2j')]),
            el('p', null, 'Thread: 5 cara bikin konten usaha kecil yang bikin orang mampir.'),
            h('div', 'x-card', [bars(2)]),
            icons(4)
          ])
        ]),
        h('div', 'x-post dim', [el('span', 'x-av'), h('div', 'x-body', [bars(2)])])
      ];
    },
    facebook: function () {
      return [
        h('div', 'fb-top', [el('span'), el('i')]),
        h('div', 'fb-post', [
          h('div', 'fb-head', [el('span', 'fb-av'), h('div', null, [el('b', null, 'Kedai Kopi Sore'), el('small', null, 'Bersponsor')])]),
          el('p', null, 'Menu baru minggu ini sudah bisa dipesan.'),
          h('div', 'fb-img', [el('b', null, 'Menu baru')]),
          h('div', 'fb-act', [el('span', null, 'Suka'), el('span', null, 'Komentar'), el('span', null, 'Bagikan')])
        ])
      ];
    },
    whatsapp: function () {
      return [
        h('div', 'wa-top', [el('span'), h('div', null, [el('b', null, 'Kedai Kopi Sore'), el('small', null, 'online')])]),
        h('div', 'wa-chat', [
          el('div', 'wa-b in', 'Kak, masih buka order?'),
          el('div', 'wa-b out', 'Masih kak, mau paket berapa?'),
          el('div', 'wa-b in', 'Paket 3 ya, kirim besok bisa?'),
          el('div', 'wa-b out', 'Bisa kak, siap dikirim 🙌')
        ]),
        h('div', 'wa-in', [el('span'), el('i')])
      ];
    }
  };

  function buildCard(p, i) {
    var c = el('a', 'card pf-' + p.key);
    c.href = '#layanan';
    c.draggable = false;
    c.setAttribute('aria-label', p.name + ', ' + p.sub);
    var top = h('div', 'card-top');
    var brand = el('div', 'card-brand', p.name);
    if (p.logo) {
      var lg = el('img', 'card-logo'); lg.src = p.logo; lg.alt = p.name; lg.draggable = false;
      lg.onerror = function () { lg.remove(); brand.textContent = p.name; };
      brand.textContent = ''; brand.appendChild(lg);
    }
    top.appendChild(brand);
    top.appendChild(el('div', 'card-sub', p.sub));
    c.appendChild(top);
    var dev = h('div', 'dev ' + p.dev + (i % 2 ? ' tilt-r' : ' tilt-l'));
    var scr = h('div', 'scr scr-' + p.key, SCREEN[p.key]());
    dev.appendChild(scr);
    if (p.dev === 'laptop') dev.appendChild(el('div', 'base'));
    c.appendChild(dev);
    return c;
  }

  /* ---------- motion graphic layanan: jalan hanya saat terlihat ---------- */
  var mgs = document.querySelectorAll('.mg');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-on', e.isIntersecting); });
    }, { threshold: 0.25 });
    mgs.forEach(function (m) { io.observe(m); });
  } else {
    mgs.forEach(function (m) { m.classList.add('is-on'); });
  }

  var arc = document.getElementById('arc');
  var N = 13;
  var cards = [];
  for (var i = 0; i < N; i++) {
    var card = buildCard(PLATFORM[i % PLATFORM.length], i);
    arc.appendChild(card);
    cards.push(card);
  }

  var dragOff = 0, scrollOff = 0, introOff = reduce ? 0 : 4;
  var LIM = (N - 1) / 2 - 2;
  function gap(cw) { return cw * (window.innerWidth < 720 ? 0.64 : 0.82); }
  function layout() {
    var cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
    var R = cw * (window.innerWidth < 720 ? 3 : 4);
    var step = gap(cw) / R * 180 / Math.PI;
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
    dragOff = Math.max(-LIM - scrollOff, Math.min(LIM - scrollOff, startOff + dx / gap(cards[0].offsetWidth)));
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

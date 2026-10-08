(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- tema ---------- */
  document.getElementById('themeBtn').addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('kv1-theme', next); } catch (e) {}
  });

  /* ---------- kata berganti ---------- */
  var words = document.querySelectorAll('#rotator span');
  var wi = 0;
  setInterval(function () {
    words[wi].classList.remove('on');
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

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderPrices(key) {
    var box = document.getElementById('plans');
    box.textContent = '';
    PRICES[key].plans.forEach(function (p) {
      var row = el('div', 'plan ' + (p.hi ? 'hi' : 'glass'));
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
    var tabs = document.querySelectorAll('#' + containerId + ' .tab');
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
    slide: { tag: 'slide', color: 'var(--mint)', empty: 'Tambahkan gambar slide' },
    motion: { tag: 'motion graphic', color: 'var(--aqua)', empty: 'Tambahkan video motion' },
    produk: { tag: 'video produk', color: 'var(--ice)', empty: 'Tambahkan video produk' }
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
    var card = el('article', 'work glass');
    var media = el('div', 'media');
    media.style.aspectRatio = w.ratio || '4 / 5';
    var tag = el('div', 'tag', info.tag);
    tag.style.background = info.color;

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
        var dots = el('div', 'dots');
        imgs.forEach(function (_, i) { var d = el('i', i === 0 ? 'on' : ''); dots.appendChild(d); });
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
        tag.textContent = info.tag + ' · ' + emb.name;
      } else {
        var a = el('a', 'linkcard');
        a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer';
        var host = ''; try { host = new URL(link).hostname.replace(/^www\./, ''); } catch (e) {}
        var p = el('div', 'play'); p.appendChild(svg('M8 5.5v13l11-6.5z', true));
        a.appendChild(p);
        a.appendChild(el('b', null, (w.type === 'slide' ? 'Lihat' : 'Tonton') + ' karya'));
        a.appendChild(el('small', 'mono', host));
        media.appendChild(a);
      }
    } else {
      var ph = el('div', 'ph');
      ph.appendChild(svg('M12 5v14M5 12h14'));
      ph.appendChild(el('b', null, info.empty));
      ph.appendChild(el('small', null, 'rasio ' + (w.ratio || '4 / 5')));
      media.appendChild(ph);
    }

    media.appendChild(tag);
    card.appendChild(media);
    var inf = el('div', 'work-info');
    inf.appendChild(el('div', 'work-t', w.title || ''));
    if (w.desc) inf.appendChild(el('div', 'work-d', w.desc));
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
})();

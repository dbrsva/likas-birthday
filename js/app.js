/* ==========================================================
   Лике 19! — интерактив
   ========================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------------- данные ---------------- */
  const P = 'assets/photos/';
  const DATA = {
    lika: [
      { src: 'lika-1.jpg', w: 1158, h: 683, cap: 'Камера 1: воздушный поцелуй 😘' },
      { src: 'lika-2.jpg', w: 1158, h: 682, cap: 'Камера 2: взгляд, который сносит миньонов' },
      { src: 'lika-3.jpg', w: 1158, h: 685, cap: 'Камера 3: чистое очарование' },
      { src: 'lika-4.jpg', w: 1158, h: 1030, cap: 'Камера 4: замечена в городе' },
      { src: 'lika-5.jpg', w: 1158, h: 1031, cap: 'Камера 5: позирует как звезда' },
    ],
    people: [
      { src: 'diana-1.jpg', w: 1600, h: 1200, who: 'diana', cap: 'Лика & Диана' },
      { src: 'alina-1.jpg', w: 1200, h: 1600, who: 'alina', cap: 'Лика & Алина' },
      { src: 'sardaana-aita-2.jpg', w: 853, h: 1280, who: 'sardaana-aita', cap: 'Лика, Сардаана и Айта' },
      { src: 'diana-2.jpg', w: 900, h: 1600, who: 'diana', cap: 'Лика & Диана' },
      { src: 'sardaana-aita-1.jpg', w: 1280, h: 960, who: 'sardaana-aita', cap: 'Лика, Сардаана и Айта' },
      { src: 'alina-2.jpg', w: 1200, h: 1600, who: 'alina', cap: 'Лика & Алина' },
      { src: 'diana-3.jpg', w: 1600, h: 1200, who: 'diana', cap: 'Лика & Диана' },
      { src: 'sardaana-aita-3.jpg', w: 1280, h: 853, who: 'sardaana-aita', cap: 'Лика, Сардаана и Айта' },
      { src: 'diana-4.jpg', w: 1200, h: 1600, who: 'diana', cap: 'Лика & Диана' },
      { src: 'arisha-2.jpg', w: 1280, h: 960, who: 'arisha', cap: 'Лика & Ариша' },
      { src: 'eslanda-1.jpg', w: 960, h: 1280, who: 'eslanda', cap: 'Лика & Эсланда' },
      { src: 'arisha-1.jpg', w: 1280, h: 853, who: 'arisha', cap: 'Лика & Ариша' },
      { src: 'eslanda-2.jpg', w: 1280, h: 960, who: 'eslanda', cap: 'Лика & Эсланда' },
    ],
    love: [
      { src: 'lesha-2.jpg', w: 960, h: 1280, cap: 'Лика + Лёша' },
      { src: 'lesha-3.jpg', w: 960, h: 1280, cap: 'Короли праздника 👑' },
      { src: 'lesha-1.jpg', w: 959, h: 1280, cap: 'Просто мы 💛' },
    ],
  };

  /* ---------------- тост ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }

  /* ---------------- конфетти ---------------- */
  const Confetti = (() => {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    const colors = ['#FCE029', '#0035AD', '#0A75BC', '#FFFFFF', '#E0313B', '#F4E11B'];
    let parts = [], raf = 0, W = 0, H = 0, dpr = 1, rain = 0;
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener('resize', resize);
    const star = (r) => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
    const heart = (r) => { ctx.beginPath(); ctx.moveTo(0, r * .35); ctx.bezierCurveTo(-r * 1.2, -r * .5, -r * .4, -r * 1.2, 0, -r * .45); ctx.bezierCurveTo(r * .4, -r * 1.2, r * 1.2, -r * .5, 0, r * .35); ctx.fill(); };
    function add(x, y, n = 40, spread = 1, shapes) {
      if (reduce) n = Math.min(n, 12);
      for (let i = 0; i < n; i++) {
        const a = rand(-Math.PI, 0) * spread + (spread < 1 ? -Math.PI / 2 * (1 - spread) : 0), v = rand(4, 11);
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, r: rand(4, 8), rot: rand(0, 6), vr: rand(-.25, .25),
          c: pick(colors), s: shapes ? pick(shapes) : pick(['rect', 'rect', 'star', 'circle', 'heart']), life: 0, max: rand(90, 160) });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      if (rain > 0) { rain--; if (rain % 3 === 0) add(rand(0, W), -10, 2, .3); }
      parts = parts.filter(p => p.life < p.max && p.y < H + 30);
      for (const p of parts) {
        p.life++; p.vy += .22; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, (p.max - p.life) / 30); ctx.fillStyle = p.c;
        if (p.s === 'rect') ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2);
        else if (p.s === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r * .6, 0, 7); ctx.fill(); }
        else if (p.s === 'star') star(p.r);
        else heart(p.r);
        ctx.restore();
      }
      if (parts.length || rain > 0) raf = requestAnimationFrame(tick); else { raf = 0; ctx.clearRect(0, 0, W, H); }
    }
    return { burst: add, rain: (frames = 240) => { rain = reduce ? 0 : frames; if (!raf) raf = requestAnimationFrame(tick); } };
  })();
  const burstAt = (el, n = 26, shapes) => { const r = el.getBoundingClientRect(); Confetti.burst(r.left + r.width / 2, r.top + r.height / 3, n, 1, shapes); };

  /* ---------------- реплики стикеров ---------------- */
  function say(el, text) {
    if (!text) return;
    const r = el.getBoundingClientRect(), b = document.createElement('div');
    b.className = 'say'; b.textContent = text;
    const x = Math.min(innerWidth - 120, Math.max(120, r.left + r.width / 2));
    b.style.left = x + 'px'; b.style.top = Math.max(70, r.top + 10) + 'px';
    document.body.appendChild(b); setTimeout(() => b.remove(), 2000);
  }
  function boing(el) { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); }
  document.addEventListener('click', e => {
    const s = e.target.closest('.stk');
    if (!s || s.id === 'camera') return;
    boing(s); say(s, s.dataset.say); Music.sfx('boop');
    burstAt(s, 14, ['star', 'heart']);
  });

  /* ---------------- музыка: кнопка ---------------- */
  const soundBtn = $('#soundBtn');
  Music.onChange(on => { soundBtn.setAttribute('aria-pressed', on); soundBtn.setAttribute('aria-label', on ? 'Выключить музыку' : 'Включить музыку'); });
  soundBtn.addEventListener('click', () => { Music.toggle(); });

  /* ---------------- ворота ---------------- */
  const gate = $('#gate');
  $('#gateBtn').addEventListener('click', () => {
    Music.play();
    gate.classList.add('open');
    document.body.classList.remove('locked');
    document.body.classList.add('go');
    setTimeout(() => { gate.classList.add('gone'); Confetti.burst(innerWidth / 2, innerHeight * .35, 90); }, 900);
    setTimeout(() => showBubble('Белло, Лика! Нажми на меня 👑'), 2200);
  });

  /* ---------------- герой ---------------- */
  $$('.banner__row img').forEach((img, i) => { img.style.setProperty('--i', i + (img.parentElement.previousElementSibling ? 5 : 0)); img.style.setProperty('--r', rand(-7, 7).toFixed(1) + 'deg'); });
  const phrases = ['Белло! Сегодня мой день 👑', 'Банана? 🍌 Нет, торт!', 'Би-ду! Би-ду! Это праздник!', '19! Пупупу-у-у!', 'Корона сидит идеально, да?', 'Тулалилу ти амо! 💛', 'Кампай! За Лику!', 'Миньоны, все сюда!'];
  let pi = 0, bubbleT;
  const bubble = $('#heroBubble');
  function showBubble(t) { bubble.textContent = t; bubble.classList.add('show'); clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove('show'), 2600); }
  const heroLika = $('#heroLika');
  heroLika.addEventListener('click', () => {
    heroLika.classList.remove('jump'); void heroLika.offsetWidth; heroLika.classList.add('jump');
    showBubble(phrases[pi++ % phrases.length]); Music.sfx('pop');
    burstAt(heroLika, 40);
  });

  /* ---------------- прогресс + параллакс ---------------- */
  const bar = $('#progressBar'), banana = $('#progressBanana'), fls = $$('.fl'), hero = $('.hero');
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
    bar.style.transform = `scaleX(${p})`; banana.style.transform = `translateX(calc(${p * innerWidth}px - 50%)) rotate(${p * 720}deg)`;
    if (!reduce && scrollY < hero.offsetHeight) fls.forEach(f => f.style.transform = `translateY(${scrollY * -f.dataset.depth}px)`);
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------------- появление при прокрутке ---------------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    $$('.count', e.target).forEach(countUp);
  }), { threshold: .18, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  function countUp(el) {
    const to = +el.dataset.to, t0 = performance.now(), d = 1400;
    const step = now => { const k = Math.min(1, (now - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------------- лайтбокс ---------------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbList = [], lbI = 0, lastFocus = null;
  function openLb(list, i) {
    lbList = list; lbI = i; lastFocus = document.activeElement;
    lb.hidden = false; document.body.style.overflow = 'hidden'; showLb(); $('#lbClose').focus();
  }
  function showLb() {
    const it = lbList[lbI];
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbImg.src = P + it.src; lbImg.alt = it.cap; lbCap.textContent = it.cap;
    const multi = lbList.length > 1; $('#lbPrev').hidden = $('#lbNext').hidden = !multi;
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); }
  const step = d => { lbI = (lbI + d + lbList.length) % lbList.length; showLb(); };
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb__fig')) closeLb(); });
  addEventListener('keydown', e => {
    if (lb.hidden) { if (e.key === 'Escape' && $('#invasion').classList.contains('on')) closeInvasion(); return; }
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
  });
  let sx = null;
  lbImg.addEventListener('pointerdown', e => { sx = e.clientX; });
  lbImg.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50 && lbList.length > 1) step(e.clientX < sx ? 1 : -1); sx = null; });

  /* ---------------- досье: камеры ---------------- */
  const strip = $('#likaStrip');
  DATA.lika.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'spy__item'; b.dataset.cam = `CAM-0${i + 1} · REC`;
    b.setAttribute('aria-label', 'Открыть фото: ' + it.cap);
    b.innerHTML = `<img src="${P + it.src}" alt="${it.cap}" width="${it.w}" height="${it.h}" loading="lazy">`;
    b.addEventListener('click', () => openLb(DATA.lika, i));
    strip.appendChild(b);
  });
  $('.file__photo').addEventListener('click', () => openLb(DATA.lika, 1));

  /* ---------------- перевод на миньонский ---------------- */
  const tr = $('#translateBtn');
  tr.addEventListener('click', () => {
    const on = tr.getAttribute('aria-pressed') !== 'true';
    tr.setAttribute('aria-pressed', on);
    tr.firstElementChild.textContent = on ? 'Вернуть русский' : 'Перевести на миньонский';
    $('#letterRu').hidden = on; $('#letterMn').hidden = !on;
    Music.sfx('pop'); if (on) burstAt(tr, 18, ['star']);
  });

  /* ---------------- галерея друзей ---------------- */
  const mas = $('#masonry');
  DATA.people.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pola'; b.dataset.who = it.who;
    b.style.setProperty('--rot', (i % 2 ? 1 : -1) * rand(1, 3.2) + 'deg');
    b.setAttribute('aria-label', 'Открыть фото: ' + it.cap);
    b.innerHTML = `<span class="pola__tape" aria-hidden="true"></span><img src="${P + it.src}" alt="${it.cap}" width="${it.w}" height="${it.h}" loading="lazy"><span class="pola__cap">${it.cap}</span>`;
    b.addEventListener('click', () => {
      const vis = DATA.people.filter(p => filter === 'all' || p.who === filter);
      openLb(vis, vis.indexOf(it));
    });
    mas.appendChild(b);
  });
  const polas = $$('.pola', mas);
  const masIo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('wait'); e.target.classList.add('pop'); masIo.unobserve(e.target); } }), { threshold: .1 });
  polas.forEach((p, i) => { p.style.setProperty('--i', i % 3); p.classList.add('wait'); masIo.observe(p); });
  let filter = 'all';
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    filter = t.dataset.filter;
    $$('.tab').forEach(x => { x.classList.toggle('is-on', x === t); x.setAttribute('aria-selected', x === t); });
    let k = 0;
    polas.forEach(p => {
      const show = filter === 'all' || p.dataset.who === filter;
      p.classList.toggle('hide', !show);
      if (show) { p.classList.remove('wait', 'pop'); void p.offsetWidth; p.style.setProperty('--i', k++); p.classList.add('pop'); }
    });
    Music.sfx('pop');
  }));

  /* ---------------- фотоаппарат ---------------- */
  $('#camera').addEventListener('click', () => {
    const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
    boing($('#camera')); Music.sfx('shutter'); toast('Щёлк! Вы все — красотки 📸');
  });

  /* ---------------- Лика и Лёша: летящие сердечки ---------------- */
  const sky = $('#loveSky');
  const heartSvg = '<svg viewBox="0 0 32 29"><path d="M16 28.5 13.7 26.4C5.4 18.9 0 14 0 8.1 0 3.3 3.8-.5 8.7-.5c2.7 0 5.4 1.3 7.3 3.3C17.9.8 20.6-.5 23.3-.5 28.2-.5 32 3.3 32 8.1c0 5.9-5.4 10.8-13.7 18.3Z"/></svg>';
  const hn = innerWidth < 700 ? 10 : 16;
  for (let i = 0; i < hn; i++) {
    const h = document.createElement('span'); h.className = 'fh'; h.innerHTML = heartSvg;
    h.style.cssText = `left:${rand(2, 96)}%;--s:${rand(12, 30)}px;--c:${pick(['#FCE029', '#FFFFFF', '#E0313B', '#FCE029'])};--d:${rand(9, 16)}s;--dl:${rand(-16, 0)}s;--dx:${rand(-40, 40)}px`;
    sky.appendChild(h);
  }

  /* ---------------- Лика и Лёша: стопка карточек ---------------- */
  const stack = $('#stack'), dots = $('#stackDots');
  const cards = DATA.love.map((it, i) => {
    const f = document.createElement('figure'); f.className = 'card';
    f.innerHTML = `<img src="${P + it.src}" alt="${it.cap}" width="${it.w}" height="${it.h}" loading="lazy"><figcaption>${it.cap}</figcaption>`;
    stack.appendChild(f);
    const d = document.createElement('span'); dots.appendChild(d);
    return f;
  });
  const rots = [-2, 4, -6];
  let top = 0;
  function layout() {
    cards.forEach((c, i) => {
      const pos = (i - top + cards.length) % cards.length;
      c.style.zIndex = cards.length - pos;
      c.style.setProperty('--rot', (pos === 0 ? rots[0] : rots[pos]) + 'deg');
      c.style.setProperty('--tx', pos * 10 + 'px'); c.style.setProperty('--ty', pos * 6 + 'px'); c.style.setProperty('--sc', 1 - pos * .04);
      c.setAttribute('aria-hidden', pos !== 0);
    });
    $$('span', dots).forEach((d, i) => d.classList.toggle('on', i === top));
  }
  function nextCard(dir = 1) {
    const c = cards[top];
    if (dir > 0) {
      c.classList.add('fly'); c.style.setProperty('--tx', '130%'); c.style.setProperty('--rot', '24deg');
      setTimeout(() => { c.classList.remove('fly'); top = (top + 1) % cards.length; layout(); }, 380);
    } else { top = (top - 1 + cards.length) % cards.length; layout(); }
    Music.sfx('pop');
    const r = stack.getBoundingClientRect(); Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 10, 1, ['heart']);
  }
  layout();
  $('#stackNext').addEventListener('click', () => nextCard(1));
  $('#stackPrev').addEventListener('click', () => nextCard(-1));
  $('#stackZoom').addEventListener('click', () => openLb(DATA.love, top));
  // свайп/перетаскивание верхней карточки
  let drag = null;
  stack.addEventListener('pointerdown', e => {
    const c = cards[top]; if (!c.contains(e.target)) return;
    drag = { x: e.clientX, y: e.clientY, c, moved: false }; c.classList.add('dragging');
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { cancelDrag(); return; } // вертикаль — это прокрутка
    if (Math.abs(dx) > 6) drag.moved = true;
    drag.c.style.setProperty('--tx', dx + 'px'); drag.c.style.setProperty('--rot', dx / 12 + 'deg');
  }, { passive: true });
  function cancelDrag() { if (!drag) return; drag.c.classList.remove('dragging'); drag = null; layout(); }
  addEventListener('pointerup', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, moved = drag.moved; drag.c.classList.remove('dragging'); drag = null;
    if (Math.abs(dx) > 70) nextCard(1); else { layout(); if (!moved) nextCard(1); }
  });
  addEventListener('pointercancel', cancelDrag);

  /* ---------------- измеритель любви ---------------- */
  const hb = $('#heartBtn'), hp = $('#heartPct'), ho = $('#heartOut');
  let love = 0;
  const loveMsgs = [[0, 'Жми ещё!'], [30, 'Тепло… 💛'], [60, 'Горячо! 🔥'], [100, '100%. Миньоны плачут от умиления'], [150, '150%?! Шкала такого не выдерживает'], [250, 'ОШИБКА: любовь не помещается на экран 💛💛💛']];
  hb.addEventListener('click', () => {
    love += love < 100 ? 12 : 25;
    const v = love >= 250 ? '∞' : love + '%';
    hp.textContent = v;
    ho.textContent = loveMsgs.filter(m => love >= m[0]).pop()[1];
    hb.classList.remove('beat'); void hb.offsetWidth; hb.classList.add('beat');
    Music.sfx('boop'); burstAt(hb, love >= 100 ? 26 : 10, ['heart']);
    if (love >= 250) { Confetti.rain(120); love = 0; setTimeout(() => { hp.textContent = '0%'; ho.textContent = 'Перезагрузка… можно снова 💛'; }, 3200); }
  });

  /* ---------------- торт и свечи ---------------- */
  const candlesBox = $('#candles'), TOTAL = 19;
  const candles = [];
  for (let i = 0; i < TOTAL; i++) {
    const back = i % 2 === 1; // два ряда: задний повыше
    const k = i / (TOTAL - 1);
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'candle'; c.setAttribute('aria-label', `Свеча ${i + 1}`);
    c.style.left = (4 + k * 92) + '%';
    c.style.bottom = (back ? 16 : 0) + 'px';
    c.style.setProperty('--h', (back ? 46 : 54) + rand(-4, 4) + 'px');
    c.style.zIndex = back ? 1 : 2;
    c.innerHTML = '<span class="candle__flame"></span><span class="candle__smoke"></span>';
    c.addEventListener('click', () => blow(c));
    candlesBox.appendChild(c); candles.push(c);
  }
  let finished = false;
  function blow(c) {
    if (c.classList.contains('out')) return;
    c.classList.add('out'); c.setAttribute('aria-label', 'Свеча задута'); Music.sfx('blow');
    const left = candles.filter(x => !x.classList.contains('out')).length;
    $('#cakeHint').textContent = left ? `Осталось свечей: ${left}` : 'Ура! Желание загадано ✨';
    if (!left && !finished) { finished = true; stopMic(); setTimeout(celebrate, 600); }
  }
  $('#blowAll').addEventListener('click', () => {
    candles.filter(c => !c.classList.contains('out')).forEach((c, i) => setTimeout(() => blow(c), i * 70));
  });

  // задуть голосом (микрофон доступен только по https или localhost)
  const micBtn = $('#micBtn');
  let micStream = null, micCtx = null;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext) micBtn.hidden = false;
  micBtn.addEventListener('click', async () => {
    if (micStream) { stopMic(); return; }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || window.webkitAudioContext; micCtx = new AC();
      const an = micCtx.createAnalyser(); an.fftSize = 512; micCtx.createMediaStreamSource(micStream).connect(an);
      const buf = new Uint8Array(an.fftSize); let last = 0;
      micBtn.firstElementChild.textContent = 'Дуй в микрофон!';
      toast('Подуй в микрофон телефона 💨');
      const loop = now => {
        if (!micStream) return;
        an.getByteTimeDomainData(buf);
        let sum = 0; for (const v of buf) sum += (v - 128) ** 2;
        const rms = Math.sqrt(sum / buf.length);
        if (rms > 22 && now - last > 110) { last = now; const c = candles.find(x => !x.classList.contains('out')); if (c) blow(c); }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch (e) { toast('Микрофон недоступен — тапай по свечкам 🙂'); stopMic(); }
  });
  function stopMic() {
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null; if (micCtx) { micCtx.close(); micCtx = null; }
    micBtn.firstElementChild.textContent = 'Задуть голосом';
  }

  /* ---------------- финал: нашествие миньонов ---------------- */
  const crowdImgs = ['party-06', 'minion-cheer', 'party-02', 'party-05', 'love-08', 'party-04', 'minion-duck', 'party-00', 'party-03', 'minion-bananas', 'party-08', 'party-07', 'party-01'];
  const crowd = $('#crowd'), inv = $('#invasion');
  const maxCrowd = innerWidth < 600 ? 7 : crowdImgs.length;
  crowdImgs.slice(0, maxCrowd).forEach((n, i) => {
    const im = document.createElement('img'); im.src = `assets/stickers/${n}.webp`; im.alt = ''; im.loading = 'lazy';
    im.style.setProperty('--i', Math.abs(i - Math.floor(maxCrowd / 2))); crowd.appendChild(im);
  });
  function celebrate() {
    $('#cake').classList.add('done');
    inv.classList.add('on'); inv.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    Music.sfx('tada');
    Confetti.burst(innerWidth * .2, innerHeight * .6, 70); Confetti.burst(innerWidth * .8, innerHeight * .6, 70);
    setTimeout(() => Confetti.burst(innerWidth / 2, innerHeight * .4, 90), 500);
    Confetti.rain(360);
    setTimeout(() => $('#againBtn').focus(), 900);
  }
  function closeInvasion() {
    inv.classList.remove('on'); inv.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
  }
  $('#closeInv').addEventListener('click', closeInvasion);
  $('#againBtn').addEventListener('click', () => {
    closeInvasion(); finished = false; $('#cake').classList.remove('done');
    candles.forEach(c => { c.classList.remove('out'); c.setAttribute('aria-label', 'Свеча'); });
    $('#cakeHint').textContent = 'Свечи снова горят — загадай ещё одно желание ✨';
    $('#finale').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------------- пасхалка: очки ---------------- */
  let taps = 0, tapT;
  $('#logo').addEventListener('click', () => {
    taps++; clearTimeout(tapT); tapT = setTimeout(() => taps = 0, 900);
    boing($('#logo'));
    if (taps >= 3) {
      taps = 0;
      const s = $('#siren'); s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
      Music.sfx('beedo'); toast('БИ-ДУ! БИ-ДУ! Тревога: слишком много праздника!');
    } else if (taps === 1) toast('Псс… нажми на очки 3 раза');
  });
})();

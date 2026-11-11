/* ==========================================================
   Музыка и звуки.

   Саундтрек «Гадкого я» защищён авторским правом, поэтому
   законно положить его в проект нельзя. Вместо этого здесь
   прямо в браузере собирается весёлая «миньонская» аранжировка
   «Happy Birthday» (мелодия — общественное достояние):
   казу-соло, маримба, бас «умпа-па», шейкер и колокольчики.

   Хотите свой трек? Положите mp3 в assets/music/ и впишите
   путь ниже, например: const MUSIC_FILE = 'assets/music/song.mp3';
   ========================================================== */
const MUSIC_FILE = 'assets/music/minions_song.mp3';

const Music = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.55;
  audio.setAttribute('playsinline', '');
  let ready = false, wantPlay = false, sfxCtx = null;
  const listeners = [];

  // ---------- нотная запись ----------
  const BPM = 126, SR = 32000, B = 60 / BPM;
  const N = n => { // 'C5' -> частота
    const m = /^([A-G])(#?)(\d)$/.exec(n);
    const idx = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    return 440 * Math.pow(2, (idx - 9) / 12 + (+m[3] - 4));
  };
  // Happy Birthday в C, 3/4. [нота, доля от начала прохода, длительность]
  // проход = 8 тактов по 3 доли, затакт — в последней доле предыдущего такта
  const tune = [
    ['A4', 0, 1], ['G4', 1, 1], ['C5', 2, 1],
    ['B4', 3, 2], ['G4', 5, .75], ['G4', 5.75, .25],
    ['A4', 6, 1], ['G4', 7, 1], ['D5', 8, 1],
    ['C5', 9, 2], ['G4', 11, .75], ['G4', 11.75, .25],
    ['G5', 12, 1], ['E5', 13, 1], ['C5', 14, 1],
    ['B4', 15, 1], ['A4', 16, 1], ['F5', 17, .75], ['F5', 17.75, .25],
    ['E5', 18, 1], ['C5', 19, 1], ['D5', 20, 1],
    ['C5', 21, 2],
  ];
  const chords = [ // по тактам: бас + аккорд
    ['C3', ['E4', 'G4', 'C5']], ['G2', ['D4', 'G4', 'B4']], ['G2', ['D4', 'F4', 'B4']], ['C3', ['E4', 'G4', 'C5']],
    ['C3', ['E4', 'G4', 'A#4']], ['F2', ['F4', 'A4', 'C5']], ['G2', ['E4', 'G4', 'C5']], ['C3', ['E4', 'G4', 'C5']],
  ];

  function render() {
    if (!OAC) return Promise.reject(new Error('no OfflineAudioContext'));
    const INTRO = 3, PASS = 24, beats = INTRO + PASS * 2;
    const len = Math.ceil(beats * B * SR);
    const ctx = new OAC(1, len, SR);
    const master = ctx.createGain(); master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    const T = beat => beat * B;

    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    const marimba = (f, t, vol = .28) => {
      [1, 4].forEach((h, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f * h; o.connect(g).connect(master);
        env(g, t, .004, vol * (i ? .18 : 1), i ? .12 : .45); o.start(t); o.stop(t + .6);
      });
    };
    const bell = (f, t, vol = .1) => {
      [1, 2.76, 5.4].forEach((h, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f * h; o.connect(g).connect(master);
        env(g, t, .002, vol / (i + 1), 1.1 - i * .3); o.start(t); o.stop(t + 1.3);
      });
    };
    const kazoo = (f, t, d, vol = .16) => { // «голос миньона»
      const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      const bp = ctx.createBiquadFilter(), bp2 = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      lfo.frequency.value = 6; lg.gain.value = f * .018; lfo.connect(lg).connect(o.frequency);
      o.frequency.setValueAtTime(f * .94, t); o.frequency.exponentialRampToValueAtTime(f, t + .05);
      bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.4;
      bp2.type = 'peaking'; bp2.frequency.value = 2600; bp2.gain.value = 6;
      o.connect(bp).connect(bp2).connect(g).connect(master);
      const dur = Math.max(.12, d * B * .92);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .03);
      g.gain.setValueAtTime(vol, t + dur - .05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); lfo.start(t); o.stop(t + dur + .02); lfo.stop(t + dur + .02);
    };
    const bass = (f, t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f; o.connect(g).connect(master);
      env(g, t, .006, .42, .32); o.start(t); o.stop(t + .45);
    };
    const noiseBuf = ctx.createBuffer(1, SR * .2, SR);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const shaker = (t, vol = .05) => {
      const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 6500;
      s.connect(hp).connect(g).connect(master); env(g, t, .003, vol, .05); s.start(t); s.stop(t + .1);
    };
    const kick = t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      o.connect(g).connect(master); env(g, t, .002, .5, .16); o.start(t); o.stop(t + .2);
    };
    const clap = t => {
      const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = 1600; bp.Q.value = .8;
      s.connect(bp).connect(g).connect(master); env(g, t, .002, .12, .09); s.start(t); s.stop(t + .15);
    };

    // вступление: такт «умпа-па» + затакт
    bass(N('C3'), T(0)); kick(T(0));
    ['E4', 'G4', 'C5'].forEach(n => { marimba(N(n), T(1), .1); marimba(N(n), T(2), .1); });
    kazoo(N('G4'), T(2), .75); kazoo(N('G4'), T(2.75), .25);

    for (let pass = 0; pass < 2; pass++) {
      const o = INTRO + pass * PASS;
      chords.forEach(([b, ch], bar) => {
        const t0 = o + bar * 3;
        bass(N(b), T(t0)); kick(T(t0));
        ch.forEach(n => { marimba(N(n), T(t0 + 1), .09); marimba(N(n), T(t0 + 2), .09); });
        for (let s = 0; s < 6; s++) shaker(T(t0 + s * .5), s % 2 ? .03 : .05);
        if (pass === 1) { clap(T(t0 + 1)); clap(T(t0 + 2)); }
      });
      tune.forEach(([n, at, d]) => {
        const t = T(o + at), f = N(n);
        if (pass === 0) kazoo(f, t, d);
        else { marimba(f * 2, t, .2); bell(f * 2, t, .07); kazoo(f, t, d, .07); }
      });
      // затакт к следующему проходу (после второго — снова вступление по кругу)
      if (pass === 0) { kazoo(N('G4'), T(o + 23), .75); kazoo(N('G4'), T(o + 23.75), .25); }
      else { bell(N('C6'), T(o + 23), .12); bell(N('G5'), T(o + 23.5), .1); }
    }
    return ctx.startRendering ? new Promise((res, rej) => {
      const p = ctx.startRendering();
      if (p && p.then) p.then(res, rej); else ctx.oncomplete = e => res(e.renderedBuffer);
    }) : Promise.reject(new Error('no render'));
  }

  function toWav(buf) {
    const d = buf.getChannelData(0), n = d.length, out = new DataView(new ArrayBuffer(44 + n * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
    out.setUint32(24, buf.sampleRate, true); out.setUint32(28, buf.sampleRate * 2, true);
    out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, d[i])); out.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true); }
    return new Blob([out], { type: 'audio/wav' });
  }

  function setReady() {
    ready = true;
    if (wantPlay) play();
  }
  const useSynth = () => render().then(buf => { audio.src = URL.createObjectURL(toWav(buf)); setReady(); })
    .catch(err => { console.warn('Музыка не собралась:', err); });
  if (MUSIC_FILE) {
    audio.src = MUSIC_FILE;
    ready = true;
    // если файл не найден — играет запасная мелодия
    audio.addEventListener('error', function onErr() {
      audio.removeEventListener('error', onErr);
      ready = false; useSynth();
    });
  } else {
    useSynth();
  }

  const emit = () => listeners.forEach(fn => fn(isPlaying()));
  audio.addEventListener('play', emit);
  audio.addEventListener('pause', emit);

  function play() {
    wantPlay = true;
    unlockSfx();
    if (!ready) { emit(); return Promise.resolve(); }
    const p = audio.play();
    return (p && p.catch) ? p.catch(() => { wantPlay = false; emit(); }) : Promise.resolve();
  }
  function pause() { wantPlay = false; audio.pause(); emit(); }
  function isPlaying() { return !audio.paused || (wantPlay && !ready); }
  function toggle() { return isPlaying() ? pause() : play(); }

  // ---------- короткие звуки интерфейса ----------
  function unlockSfx() {
    if (!AC) return;
    if (!sfxCtx) sfxCtx = new AC();
    if (sfxCtx.state === 'suspended') sfxCtx.resume();
  }
  function sfx(kind) {
    if (!sfxCtx || !wantPlay) return; // звуки — только когда музыка включена
    const c = sfxCtx, t = c.currentTime, g = c.createGain(), o = c.createOscillator();
    o.connect(g).connect(c.destination);
    o.start(t);
    const ramp = (a, b, d) => { o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + d); };
    g.gain.setValueAtTime(0.0001, t);
    if (kind === 'boop') { o.type = 'sine'; ramp(520, 980, .12); g.gain.exponentialRampToValueAtTime(.18, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .2); o.stop(t + .22); }
    else if (kind === 'pop') { o.type = 'triangle'; ramp(900, 300, .08); g.gain.exponentialRampToValueAtTime(.2, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .1); o.stop(t + .12); }
    else if (kind === 'blow') { o.type = 'sine'; ramp(700, 200, .2); g.gain.exponentialRampToValueAtTime(.08, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.stop(t + .25); }
    else if (kind === 'shutter') { o.type = 'square'; ramp(1800, 600, .05); g.gain.exponentialRampToValueAtTime(.06, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .07); o.stop(t + .08); }
    else if (kind === 'beedo') { // сирена «би-ду»
      o.type = 'square';
      for (let i = 0; i < 6; i++) { o.frequency.setValueAtTime(i % 2 ? 587 : 784, t + i * .25); }
      g.gain.exponentialRampToValueAtTime(.06, t + .02); g.gain.setValueAtTime(.06, t + 1.45); g.gain.exponentialRampToValueAtTime(.0001, t + 1.5); o.stop(t + 1.52);
    }
    else if (kind === 'tada') {
      o.type = 'triangle'; [523, 659, 784, 1047].forEach((f, i) => o.frequency.setValueAtTime(f, t + i * .09));
      g.gain.exponentialRampToValueAtTime(.16, t + .01); g.gain.setValueAtTime(.16, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + .9); o.stop(t + .95);
    }
  }

  return { play, pause, toggle, isPlaying, sfx, unlockSfx, onChange: fn => listeners.push(fn) };
})();

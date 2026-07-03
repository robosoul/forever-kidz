/* =============================================================================
   kit.js  —  shared UI toolkit
   DOM helpers, effects, the Caesar wheel, the reusable decoder widget,
   reference charts, pigpen glyphs, and the secret-link codec.
   Depends on: ciphers.js  (window.Cipher)
   ========================================================================== */
(function () {
  'use strict';
  var C = window.Cipher;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tiny DOM helper ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (!attrs.hasOwnProperty(k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style' && typeof v === 'object') for (var s in v) n.style[s] = v[s];
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    if (kids != null) {
      if (!Array.isArray(kids)) kids = [kids];
      kids.forEach(function (c) {
        if (c == null || c === false) return;
        n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return n;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }

  /* ---------- inline SVG art ---------- */
  // Custom sigil: an eye whose pupil is a keyhole, ringed by a cipher-disk of
  // ticks. "The eye that reads what's locked." Deliberately not a triangle.
  function sigil(stroke) {
    stroke = stroke || 'currentColor';
    var ticks = '';
    for (var i = 0; i < 24; i++) {
      var a = (i / 24) * Math.PI * 2;
      var r1 = 44, r2 = i % 2 ? 40 : 36;
      ticks += '<line x1="' + (50 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (50 + r1 * Math.sin(a)).toFixed(1) +
               '" x2="' + (50 + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (50 + r2 * Math.sin(a)).toFixed(1) + '"/>';
    }
    return '<svg viewBox="0 0 100 100" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round">' +
      '<circle cx="50" cy="50" r="46"/>' + ticks +
      '<path d="M18 50 Q50 24 82 50 Q50 76 18 50 Z" stroke-width="2.4"/>' +
      '<circle cx="50" cy="50" r="12" fill="' + stroke + '" stroke="none"/>' +
      '<circle cx="50" cy="46" r="4.5" fill="#06060c" stroke="none"/>' +
      '<rect x="48.4" y="48" width="3.2" height="9" fill="#06060c" stroke="none"/>' +
      '</svg>';
  }
  var ICON = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  };

  /* wax seal (clickable intro) */
  function waxSeal() {
    return '<svg viewBox="0 0 100 100" class="seal-svg">' +
      '<defs><radialGradient id="wax" cx="40%" cy="35%"><stop offset="0%" stop-color="#f06a5a"/>' +
      '<stop offset="60%" stop-color="#c23a2c"/><stop offset="100%" stop-color="#8f2417"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="46" fill="url(#wax)"/>' +
      '<circle cx="50" cy="50" r="46" fill="none" stroke="#6d180d" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '<g transform="translate(50,50) scale(.62) translate(-50,-50)" opacity=".92">' +
      sigil('#3a0d06') + '</g></svg>';
  }

  /* ---------- effects ---------- */
  function typewriter(node, text, opts) {
    opts = opts || {};
    var speed = opts.speed || 22;
    return new Promise(function (resolve) {
      if (reduced) { node.textContent = text; resolve(); return; }
      node.textContent = '';
      var caret = opts.caret === false ? null : el('span', { class: 'caret', text: ' ' });
      if (caret) node.appendChild(caret);
      var i = 0;
      (function step() {
        if (i >= text.length) { if (caret && opts.keepCaret === false) caret.remove(); resolve(); return; }
        var ch = text[i++];
        node.insertBefore(document.createTextNode(ch), caret || null);
        var d = speed + (/[.,!?…]/.test(ch) ? 260 : 0) + Math.random() * 18;
        setTimeout(step, d);
      })();
    });
  }

  function burst(colors) {
    colors = colors || ['#e8b23a', '#49e58c', '#4bd6e0', '#b98cff', '#e5544a'];
    if (reduced) return;
    var box = el('div', { class: 'burst' });
    for (var i = 0; i < 90; i++) {
      var p = el('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (2.4 + Math.random() * 2.2) + 's';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 5200);
  }

  /* CRT scanline toggle, persisted */
  function initCrt() {
    var on = localStorage.getItem('fk_crt');
    on = on == null ? true : on === '1';           // default ON
    document.body.classList.toggle('crt', on);
    var t = el('div', { class: 'fxtoggle' }, [
      el('button', {
        text: on ? 'CRT: ON' : 'CRT: OFF',
        title: 'Toggle the spooky scanlines',
        onclick: function () {
          on = !on;
          document.body.classList.toggle('crt', on);
          localStorage.setItem('fk_crt', on ? '1' : '0');
          this.textContent = on ? 'CRT: ON' : 'CRT: OFF';
        }
      })
    ]);
    document.body.appendChild(t);
  }

  /* ---------- shared chrome (top bar + footer), so every page matches ---- */
  function chrome(current) {
    var bar = el('div', { class: 'topbar' }, [
      el('a', { class: 'brand', href: 'index.html' }, [
        el('span', { class: 'eye', html: sigil('#e8b23a') }),
        el('span', { text: (window.LETTER && window.LETTER.club) || 'THE ORDER OF FOREVER KIDZ' })
      ]),
      el('nav', { class: 'nav' }, [
        el('a', { href: 'index.html', 'aria-current': current === 'home' ? 'page' : null, text: 'The Transmission' }),
        el('a', { href: 'toolkit.html', 'aria-current': current === 'kit' ? 'page' : null, text: 'Field Kit' })
      ])
    ]);
    document.body.insertBefore(bar, document.body.firstChild);
  }
  function footer(host) {
    host.appendChild(el('div', { class: 'foot' }, [
      el('div', { text: 'TRANSMISSION SECURED · ADULTS: 0 · KIDZ: ∞' }),
      el('div', { style: { marginTop: '6px' }, html: 'For your eyes only. Tell no grown-up.' })
    ]));
  }

  /* =========================================================================
     CAESAR WHEEL
     Inner ring = ciphertext (fixed). Outer ring = plaintext, placed so that
     plaintext p sits above ciphertext (p+shift). Reading the outer letter
     above a ciphertext letter c gives plaintext c-shift.  All glyphs upright.
     ====================================================================== */
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  function caesarWheel(onShift, initialShift) {
    var shift = (initialShift == null) ? 3 : (((initialShift % 26) + 26) % 26);
    var wheel = el('div', { class: 'wheel' });
    var outer = el('div', { class: 'ring outer' });
    var inner = el('div', { class: 'ring inner' });
    var hub = el('div', { class: 'hub' }, [el('b', { text: String(shift) }), el('span', { text: 'SHIFT' })]);
    wheel.appendChild(el('div', { class: 'marker', text: '▼' }));
    wheel.appendChild(outer); wheel.appendChild(inner); wheel.appendChild(hub);

    var Rout = 104, Rin = 66;
    var outLetters = [], inLetters = [];
    ALPHA.forEach(function (ch, k) {
      var lo = el('span', { class: 'lt o', text: ch });
      var li = el('span', { class: 'lt i', text: ch });
      outer.appendChild(lo); inner.appendChild(li);
      outLetters.push(lo); inLetters.push(li);
    });
    // account for smaller wheel on phones
    function radii() {
      var w = wheel.getBoundingClientRect().width || 240;
      return { out: w * 0.43, in: w * 0.275 };
    }
    function place() {
      var R = radii(), step = 360 / 26;
      inLetters.forEach(function (li, k) {
        var a = k * step;
        li.style.transform = 'rotate(' + a + 'deg) translate(0,-' + R.in + 'px) rotate(' + (-a) + 'deg)';
      });
      outLetters.forEach(function (lo, p) {
        var a = ((p + shift) % 26) * step;
        lo.style.transform = 'rotate(' + a + 'deg) translate(0,-' + R.out + 'px) rotate(' + (-a) + 'deg)';
      });
      hub.querySelector('b').textContent = String(shift);
    }
    function set(s) { shift = ((s % 26) + 26) % 26; place(); if (onShift) onShift(shift); }

    var slider = el('input', { type: 'range', min: '0', max: '25', value: String(shift), 'aria-label': 'shift', oninput: function () { set(+this.value); } });
    var minus = el('button', { class: 'btn tiny', text: '−1', onclick: function () { slider.value = ((shift + 25) % 26); set(+slider.value); } });
    var plus = el('button', { class: 'btn tiny', text: '+1', onclick: function () { slider.value = ((shift + 1) % 26); set(+slider.value); } });

    var box = el('div', { class: 'wheelbox' }, [
      wheel,
      el('div', { class: 'controls', style: { justifyContent: 'center' } }, [minus, slider, plus])
    ]);
    setTimeout(place, 0);
    window.addEventListener('resize', place);
    box.setShift = set; box.getShift = function () { return shift; };
    return box;
  }

  /* =========================================================================
     DECODER WIDGET  (used inline in cards + in the Field Kit)
     opts: { fixed, mode, allowModeToggle, initial, showBrute, wheel, key, onOutput }
     ====================================================================== */
  var TYPES = [
    ['caesar', 'Caesar shift'],
    ['atbash', 'Atbash mirror'],
    ['a1z26', 'A1Z26 numbers'],
    ['binary', 'Binary'],
    ['morse', 'Morse code'],
    ['vigenere', 'Vigenère'],
    ['reverse', 'Reverse']
  ];

  function makeDecoder(opts) {
    opts = opts || {};
    var type = opts.fixed || 'caesar';
    var mode = opts.mode || 'decode';
    // In puzzle cards the wheel must START unsolved, so default to wheelStart (0).
    var shift = opts.wheel ? (opts.wheelStart != null ? opts.wheelStart : 0)
                           : ((opts.key != null && type === 'caesar') ? opts.key : 3);
    var keyword = (opts.key != null && type === 'vigenere') ? opts.key : '';

    var root = el('div', { class: 'decoder' });

    // input
    var input = el('textarea', { rows: '2', spellcheck: 'false', placeholder: 'paste the secret here…' });
    if (opts.initial != null) input.value = opts.initial;

    // output
    var out = el('div', { class: 'out empty', text: '…' });

    // type select (only if not fixed)
    var typeSel = null;
    if (!opts.fixed) {
      typeSel = el('select', { onchange: function () { type = this.value; syncControls(); compute(); } });
      TYPES.forEach(function (t) { typeSel.appendChild(el('option', { value: t[0], text: t[1] })); });
    }

    // mode toggle
    var modeSeg = null;
    if (opts.allowModeToggle) {
      var bDec = el('button', { text: 'Decode', 'aria-pressed': mode === 'decode', onclick: function () { mode = 'decode'; syncMode(); compute(); } });
      var bEnc = el('button', { text: 'Encode', 'aria-pressed': mode === 'encode', onclick: function () { mode = 'encode'; syncMode(); compute(); } });
      modeSeg = el('span', { class: 'seg' }, [bDec, bEnc]);
      function syncMode() { bDec.setAttribute('aria-pressed', mode === 'decode'); bEnc.setAttribute('aria-pressed', mode === 'encode'); }
    }

    // caesar control (wheel OR slider)
    var caesarCtl, wheelObj = null;
    if (opts.wheel) {
      wheelObj = caesarWheel(function (s) { shift = s; compute(); }, shift);
      caesarCtl = wheelObj;
    } else {
      var cslider = el('input', { type: 'range', min: '0', max: '25', value: shift, oninput: function () { shift = +this.value; cnum.value = shift; compute(); } });
      var cnum = el('input', { type: 'number', min: '0', max: '25', value: shift, style: { maxWidth: '90px' }, oninput: function () { shift = ((+this.value % 26) + 26) % 26; cslider.value = shift; compute(); } });
      caesarCtl = el('div', {}, [el('label', { text: 'Shift (0–25)' }), el('div', { class: 'controls' }, [cslider, cnum])]);
    }

    // vigenere key
    var vigCtl = el('div', {}, [el('label', { text: 'Keyword' }), el('input', { type: 'text', value: keyword, placeholder: 'e.g. KIDZ', spellcheck: 'false', oninput: function () { keyword = this.value; compute(); } })]);

    // brute force (caesar)
    var bruteBtn = null, bruteBox = el('div', { class: 'brute hidden' });
    if (opts.showBrute) {
      bruteBtn = el('button', { class: 'btn tiny', text: 'Try all 26 shifts', onclick: function () {
        if (!bruteBox.classList.contains('hidden')) { bruteBox.classList.add('hidden'); this.textContent = 'Try all 26 shifts'; return; }
        bruteBox.innerHTML = '';
        C.caesar.all(input.value).forEach(function (r) {
          bruteBox.appendChild(el('div', {}, [el('span', { class: 's', text: '↓' + r.shift }), el('span', { text: r.text })]));
        });
        bruteBox.classList.remove('hidden'); this.textContent = 'Hide shifts';
      }});
    }

    // copy button
    var copyBtn = el('button', { class: 'btn tiny', title: 'Copy result', html: ICON.copy + ' copy', onclick: function () {
      var v = out.textContent; if (!v || out.classList.contains('empty')) return;
      navigator.clipboard && navigator.clipboard.writeText(v);
      var b = this; b.innerHTML = ICON.check + ' copied'; setTimeout(function () { b.innerHTML = ICON.copy + ' copy'; }, 1200);
    }});

    // layout
    var top = el('div', { class: 'drow' });
    if (typeSel) top.appendChild(el('div', {}, [el('label', { text: 'Cipher' }), typeSel]));
    if (modeSeg) top.appendChild(el('div', { style: { flex: '0 0 auto' } }, [el('label', { text: 'Mode' }), modeSeg]));
    var ctlSlot = el('div', { style: { flexBasis: '100%' } });
    top.appendChild(ctlSlot);
    root.appendChild(top);

    if (!opts.hideInput) root.appendChild(el('div', { style: { marginTop: '10px' } }, [el('label', { text: mode === 'encode' ? 'Your message' : 'The code' }), input]));
    else root.appendChild(input), input.classList.add('hidden');

    var actions = el('div', { class: 'controls', style: { marginTop: '10px' } }, [copyBtn]);
    if (bruteBtn) actions.appendChild(bruteBtn);
    root.appendChild(actions);
    root.appendChild(out);
    if (opts.showBrute) root.appendChild(bruteBox);

    input.addEventListener('input', compute);

    function syncControls() {
      ctlSlot.innerHTML = '';
      if (type === 'caesar') ctlSlot.appendChild(caesarCtl);
      else if (type === 'vigenere') ctlSlot.appendChild(vigCtl);
      if (bruteBtn) bruteBtn.classList.toggle('hidden', type !== 'caesar');
      if (type !== 'caesar' && bruteBtn) { bruteBox.classList.add('hidden'); bruteBtn.textContent = 'Try all 26 shifts'; }
    }

    function compute() {
      var src = input.value;
      var key = type === 'caesar' ? shift : (type === 'vigenere' ? keyword : null);
      var result = '';
      try { result = C.run(type, mode, src, key); } catch (e) { result = ''; }
      if (!src.trim() || result === '') { out.classList.add('empty'); out.textContent = src.trim() ? '(need a key)' : '…'; }
      else { out.classList.remove('empty'); out.textContent = result; }
      if (opts.onOutput) opts.onOutput(result, out.textContent);
    }

    syncControls();
    setTimeout(compute, 0);

    return { root: root, compute: compute, getOutput: function () { return out.textContent; }, setInput: function (v) { input.value = v; compute(); }, wheel: wheelObj };
  }

  /* =========================================================================
     REFERENCE CHARTS  (A1Z26, Morse, Pigpen)
     ====================================================================== */
  function chartA1Z26() {
    var g = el('div', { class: 'chart' });
    ALPHA.forEach(function (ch, i) { g.appendChild(el('div', { class: 'cell' }, [el('b', { text: ch }), document.createTextNode(String(i + 1))])); });
    return g;
  }
  function chartMorse() {
    var g = el('div', { class: 'chart' });
    ALPHA.forEach(function (ch) { g.appendChild(el('div', { class: 'cell' }, [el('b', { text: ch }), document.createTextNode(C.morse.table[ch])])); });
    return g;
  }

  /* pigpen glyphs — self-consistent SVG set (grid A–R, X-group S–Z) */
  function pigSymbol(ch) {
    ch = ch.toUpperCase();
    var idx = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(ch);
    if (idx < 0) return '<svg viewBox="0 0 40 40"></svg>';
    var s = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">';
    var T = 'M8 8 H32', R = 'M32 8 V32', B = 'M8 32 H32', L = 'M8 8 V32';
    var gridEdges = {
      A: [R, B], B: [L, R, B], C: [L, B],
      D: [T, R, B], E: [T, R, B, L], F: [T, L, B],
      G: [T, R], H: [T, L, R], I: [T, L]
    };
    if (idx <= 8) { // A–I
      gridEdges[ch].forEach(function (e) { s += '<path d="' + e + '"/>'; });
    } else if (idx <= 17) { // J–R  (A–I + dot)
      var base = 'ABCDEFGHI'[idx - 9];
      gridEdges[base].forEach(function (e) { s += '<path d="' + e + '"/>'; });
      s += '<circle cx="20" cy="20" r="2.6" fill="currentColor" stroke="none"/>';
    } else { // S–Z  chevrons  (S up, T right, U down, V left; W–Z + dot)
      var chevGroup = idx <= 21 ? idx - 18 : idx - 22;   // 0..3
      var chev = [
        'M8 20 L20 6 L32 20',    // up
        'M20 8 L34 20 L20 32',   // right
        'M8 20 L20 34 L32 20',   // down
        'M6 20 L20 8 L20 32'     // left  (approx)
      ];
      // fix left chevron to a proper "<"
      chev[3] = 'M20 8 L6 20 L20 32';
      s += '<path d="' + chev[chevGroup] + '"/>';
      if (idx >= 22) s += '<circle cx="20" cy="20" r="2.6" fill="currentColor" stroke="none"/>';
    }
    return s + '</svg>';
  }
  function chartPigpen() {
    var g = el('div', { class: 'chart' });
    ALPHA.forEach(function (ch) { g.appendChild(el('div', { class: 'cell' }, [el('b', { text: ch }), el('span', { class: 'pig', html: pigSymbol(ch) })])); });
    return g;
  }

  /* =========================================================================
     SECRET-LINK CODEC  (unicode-safe base64url of JSON)
     ====================================================================== */
  function b64encode(str) {
    return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64decode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(escape(atob(str)));
  }
  var Secret = {
    encode: function (obj) { return b64encode(JSON.stringify(obj)); },
    decode: function (s) { try { return JSON.parse(b64decode(s)); } catch (e) { return null; } }
  };

  /* ---------- export ---------- */
  window.Kit = {
    el: el, $: $, sigil: sigil, ICON: ICON, waxSeal: waxSeal,
    typewriter: typewriter, burst: burst, reduced: reduced,
    initCrt: initCrt, chrome: chrome, footer: footer,
    caesarWheel: caesarWheel, makeDecoder: makeDecoder,
    chartA1Z26: chartA1Z26, chartMorse: chartMorse, chartPigpen: chartPigpen, pigSymbol: pigSymbol,
    Secret: Secret, TYPES: TYPES
  };
})();

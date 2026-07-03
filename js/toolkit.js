/* =============================================================================
   toolkit.js  —  THE FIELD KIT
   The workhorse decoder/encoder, a secret-message link maker, and a field
   manual with reference charts.  Depends on: ciphers.js, config.js, kit.js
   ========================================================================== */
(function () {
  'use strict';
  var K = window.Kit, C = window.Cipher, L = window.LETTER;
  var el = K.el;

  document.addEventListener('DOMContentLoaded', function () {
    K.chrome('kit');
    var wrap = el('div', { class: 'wrap' });
    document.body.appendChild(wrap);

    // header
    wrap.appendChild(el('header', { class: 'hero', style: { paddingBottom: '2px' } }, [
      el('span', { class: 'sigil-big', html: K.sigil('#4bd6e0') }),
      el('div', { class: 'kicker', text: L.club }),
      el('h1', { style: { color: 'var(--cyan)' }, text: 'THE FIELD KIT' }),
      el('div', { class: 'sub', text: 'crack anything · hide anything · learn the craft' })
    ]));

    /* ---------------- 1. THE DECODER ---------------- */
    var s1 = section('THE DECODER', 'Paste a code, pick a cipher, and crack it. Switch to ENCODE to scramble your own words. Don’t know the cipher? Try each one — real code-breakers guess and check.');
    var dec = K.makeDecoder({ allowModeToggle: true, showBrute: true, initial: '' });
    s1.appendChild(dec.root);
    wrap.appendChild(s1);

    /* ---------------- 2. MAKE A SECRET ---------------- */
    wrap.appendChild(buildMaker());

    /* ---------------- 3. FIELD MANUAL ---------------- */
    wrap.appendChild(buildManual());

    K.footer(wrap);
    K.initCrt();
  });

  function section(title, blurb) {
    var s = el('section', { class: 'section' }, [el('h2', { text: title })]);
    if (blurb) s.appendChild(el('p', { class: 'dim', text: blurb }));
    return s;
  }

  /* ============ MAKE A SECRET (link generator) ============ */
  function buildMaker() {
    var s = section('MAKE A SECRET', 'For members with clearance (that’s you, Agent Smith). Type a message, lock it, and get a secret link to send. Whoever opens it gets a puzzle — not the answer.');

    var msg = el('textarea', { rows: '3', spellcheck: 'false', placeholder: 'the message you want to hide…' });
    var typeSel = el('select', {});
    [['caesar', 'Caesar shift'], ['vigenere', 'Vigenère (keyword)'], ['atbash', 'Atbash mirror'],
     ['a1z26', 'A1Z26 numbers'], ['binary', 'Binary'], ['morse', 'Morse code'], ['reverse', 'Reverse']]
      .forEach(function (t) { typeSel.appendChild(el('option', { value: t[0], text: t[1] })); });

    var shiftIn = el('input', { type: 'number', min: '1', max: '25', value: '3' });
    var keyIn = el('input', { type: 'text', placeholder: 'e.g. KIDZ', spellcheck: 'false' });
    var shiftBox = el('div', {}, [el('label', { text: 'Shift (1–25)' }), shiftIn]);
    var keyBox = el('div', { class: 'hidden' }, [el('label', { text: 'Keyword' }), keyIn]);
    var note = el('input', { type: 'text', placeholder: 'e.g. "our favourite four-letter word is the key"' });
    var includeKey = el('input', { type: 'checkbox' });

    function syncKey() {
      shiftBox.classList.toggle('hidden', typeSel.value !== 'caesar');
      keyBox.classList.toggle('hidden', typeSel.value !== 'vigenere');
    }
    typeSel.addEventListener('change', syncKey); syncKey();

    var out = el('div', { class: 'hidden', style: { marginTop: '12px' } });

    var gen = el('button', { class: 'btn primary', text: 'Generate secret link', onclick: function () {
      var text = msg.value.trim();
      if (!text) { msg.focus(); return; }
      var type = typeSel.value;
      var key = type === 'caesar' ? (parseInt(shiftIn.value, 10) || 3) : (type === 'vigenere' ? keyIn.value.trim() : null);
      if (type === 'vigenere' && !key) { keyIn.focus(); return; }
      var ct = C.run(type, 'encode', text, key);
      var payload = { c: type, t: ct, n: note.value.trim() || undefined };
      if (includeKey.checked && key != null) payload.k = key;
      var base = location.href.replace(/toolkit\.html.*$/, '').replace(/[^/]*$/, '');
      var link = base + 'secret.html#' + K.Secret.encode(payload);

      out.innerHTML = '';
      out.classList.remove('hidden');
      var linkEl = el('div', { class: 'out-link', text: link });
      var copyBtn = el('button', { class: 'btn tiny', html: K.ICON.copy + ' copy link', onclick: function () {
        navigator.clipboard && navigator.clipboard.writeText(link);
        var b = this; b.innerHTML = K.ICON.check + ' copied!'; setTimeout(function () { b.innerHTML = K.ICON.copy + ' copy link'; }, 1400);
      }});
      out.appendChild(el('label', { text: 'Send this link' }));
      out.appendChild(linkEl);
      out.appendChild(el('div', { class: 'controls', style: { marginTop: '8px' } }, [
        copyBtn,
        el('a', { class: 'btn tiny', href: link, target: '_blank', text: 'preview it →' })
      ]));
      out.appendChild(el('div', { class: 'tiny dim', style: { marginTop: '8px' },
        text: 'Heads up: the code lives inside the link, so it’s puzzle-grade, not spy-grade. Perfect for a clever kid — not for real secrets.' }));
    }});

    var tool = el('div', { class: 'tool makebox' }, [
      el('label', { text: 'Your message' }), msg,
      el('div', { class: 'drow', style: { marginTop: '10px' } }, [
        el('div', {}, [el('label', { text: 'Lock it with' }), typeSel]),
        shiftBox, keyBox
      ]),
      el('div', { style: { marginTop: '10px' } }, [el('label', { text: 'A clue, in your words (optional)' }), note]),
      el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', textTransform: 'none', letterSpacing: '0' } }, [
        includeKey, el('span', { class: 'dim', style: { fontFamily: 'var(--f-body)' }, text: 'Tuck the key inside the link (easier — she can reveal it if stuck)' })
      ]),
      el('div', { class: 'controls', style: { marginTop: '12px' } }, [gen]),
      out
    ]);
    s.appendChild(tool);
    return s;
  }

  /* ============ FIELD MANUAL ============ */
  function buildManual() {
    var s = section('FIELD MANUAL', 'Every code has a trick. Learn the tricks and nothing stays secret from you.');

    var items = [
      ['gold', 'Caesar Shift', 'Slide the whole alphabet along by a few steps. Julius Caesar slid his by 3, so A became D. To crack it, try slides until real words appear — the decoder’s “try all 26” button does it in one go.'],
      ['violet', 'Atbash Mirror', 'Hold the alphabet up to a mirror. A swaps with Z, B with Y, C with X. Flip a message once to hide it, flip it again to read it.'],
      ['amber', 'A1Z26 (Numbers)', 'Letters wearing number costumes. A=1, B=2, all the way to Z=26. A slash ( / ) means a new word begins.'],
      ['green', 'Binary', 'The secret language of computers. Every letter is eight 0s and 1s. 01001011 is one letter — feed it to the decoder to see which.'],
      ['cyan', 'Morse Code', 'Dots and dashes, for talking with flashlights, radios and taps when you can’t make a sound. One space between letters, a slash between words.'],
      ['red', 'Vigenère Lock', 'A Caesar cipher that changes with every letter, steered by a secret keyword. Unbreakable for 300 years — unless you know the word. Then it falls open.'],
      ['gold', 'Pigpen', 'Letters disguised as little grid and X shapes, some with a dot. Match each symbol to the chart below to read them.']
    ];
    items.forEach(function (it) {
      s.appendChild(el('div', { class: 'tool', 'data-accent': it[0] }, [
        el('h3', {}, [el('span', { class: 'dot' }), document.createTextNode(it[1])]),
        el('div', { class: 'what', text: it[2] })
      ]));
    });

    s.appendChild(el('div', { class: 'tool', 'data-accent': 'amber' }, [
      el('h3', { text: 'A1Z26 chart' }), K.chartA1Z26()
    ]));
    s.appendChild(el('div', { class: 'tool', 'data-accent': 'cyan' }, [
      el('h3', { text: 'Morse chart' }), K.chartMorse()
    ]));
    s.appendChild(el('div', { class: 'tool', 'data-accent': 'gold' }, [
      el('h3', { text: 'Pigpen chart' }), K.chartPigpen()
    ]));

    return s;
  }
})();

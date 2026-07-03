/* =============================================================================
   index.js  —  THE TRANSMISSION (the flagship journey)
   Boot -> break the seal -> 6 encrypted transmissions -> the letter.
   Depends on: ciphers.js, config.js, kit.js
   ========================================================================== */
(function () {
  'use strict';
  var K = window.Kit, C = window.Cipher, L = window.LETTER;
  var el = K.el;
  var frags = L.fragments;

  var STORE = 'fk_progress_v1';
  var solved = loadProgress();       // Set of solved fragment ids
  var tries = {};                    // id -> wrong-attempt count

  function loadProgress() {
    try { var s = JSON.parse(localStorage.getItem(STORE)); return new Set((s && s.solved) || []); }
    catch (e) { return new Set(); }
  }
  function saveProgress() { localStorage.setItem(STORE, JSON.stringify({ solved: Array.from(solved) })); }

  function ciphertextFor(f) {
    var plainUpper = f.plain.toUpperCase();
    return C.run(f.cipher, 'encode', plainUpper, f.key);
  }
  function activeIndex() {
    for (var i = 0; i < frags.length; i++) if (!solved.has(frags[i].id)) return i;
    return frags.length; // all done
  }

  /* ======================= BOOT ======================= */
  var bootLines = [
    '[ ESTABLISHING SECURE CHANNEL ................ OK ]',
    '[ WARMING UP THE DECODER RINGS .............. OK ]',
    '[ MEASURING KID-ENERGY ........... OFF THE CHARTS ]',
    '[ SOURCE ............. LUKA / CODENAME: ' + L.senderCodename + ' ]',
    '[ ENCRYPTION ......... 6 LAYERS · CLEARANCE: KIDZ ONLY ]',
    '',
    '> AGENT ' + L.recipient + ', DO YOU ACCEPT THIS MISSION?'
  ];

  function buildBoot() {
    var consoleEl = el('div', { class: 'console' });
    var sealWrap = el('div', { class: 'seal-wrap' }, [
      el('div', { class: 'seal', html: K.waxSeal(), title: 'Break the seal' }),
      el('div', { class: 'type', style: { letterSpacing: '.24em', color: '#e5544a', fontSize: '.8rem' }, text: 'BREAK THE SEAL' })
    ]);
    var boot = el('div', { class: 'boot', id: 'boot' }, [consoleEl, sealWrap]);
    document.body.appendChild(boot);

    // If already fully solved before, skip the ceremony faster
    (async function () {
      for (var i = 0; i < bootLines.length; i++) {
        var line = el('div');
        consoleEl.appendChild(line);
        await K.typewriter(line, bootLines[i], { speed: K.reduced ? 0 : 12, caret: i === bootLines.length - 1 });
      }
      sealWrap.classList.add('show');
    })();

    function open() {
      var s = sealWrap.querySelector('.seal');
      s.classList.add('break');
      setTimeout(function () {
        boot.classList.add('gone');
        setTimeout(function () { boot.remove(); }, 800);
        revealApp();
      }, K.reduced ? 0 : 520);
    }
    sealWrap.querySelector('.seal').addEventListener('click', open);
  }

  var appBuilt = false;
  function revealApp() {
    if (!appBuilt) buildApp();
    var a = active();
    if (a) a.scrollIntoView({ behavior: K.reduced ? 'auto' : 'smooth', block: 'center' });
  }

  /* ======================= APP ======================= */
  var railNodes = [], railLinks = [], cardEls = [], finaleHost;

  function buildApp() {
    appBuilt = true;
    K.chrome('home');
    var wrap = el('div', { class: 'wrap', id: 'app' });
    document.body.appendChild(wrap);

    // hero
    wrap.appendChild(el('header', { class: 'hero' }, [
      el('span', { class: 'sigil-big', html: K.sigil('#e8b23a') }),
      el('div', { class: 'kicker', text: L.club }),
      el('h1', {}, [el('span', { class: 'glitch', 'data-text': 'THE TRANSMISSION', text: 'THE TRANSMISSION' })]),
      el('div', { class: 'sub', text: 'a classified message · decode all six layers' }),
      el('div', { class: 'dossier' }, [
        drow('TO', 'AGENT ' + L.recipient),
        drow('FROM', L.sender + '  ·  codename ' + L.senderCodename),
        drow('CLEARANCE', 'KIDZ ONLY — no boring grown-ups (jk)'),
        drow('PAYLOAD', '6 encrypted transmissions → 1 message'),
        drow('DIRECTIVE', 'decode everything. lose no kid energy.')
      ])
    ]));

    // rail
    wrap.appendChild(buildRail());

    // cards
    frags.forEach(function (f, i) { var c = renderCard(f, i); cardEls.push(c); wrap.appendChild(c); });

    // finale host
    finaleHost = el('section', { id: 'finale' });
    wrap.appendChild(finaleHost);

    // reset link
    wrap.appendChild(el('div', { class: 'center', style: { marginTop: '26px' } }, [
      el('button', { class: 'btn ghost tiny', text: 'reset my progress', onclick: function () {
        if (confirm('Wipe your progress and start the whole mystery over?')) { solved = new Set(); saveProgress(); location.reload(); }
      }})
    ]));

    K.footer(wrap);
    K.initCrt();
    refreshStates(true);
  }
  function drow(k, v) { return el('div', { class: 'row' }, [el('b', { text: k }), el('span', { text: v })]); }

  function buildRail() {
    var rail = el('div', { class: 'rail' });
    frags.forEach(function (f, i) {
      if (i > 0) { var lk = el('span', { class: 'link' }); railLinks.push(lk); rail.appendChild(lk); }
      var node = el('div', { class: 'node', 'data-accent': f.accent, title: 'Transmission ' + (i + 1) }, [el('span', { text: String(i + 1) })]);
      node.addEventListener('click', function () { if (cardEls[i]) cardEls[i].scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      railNodes.push(node); rail.appendChild(node);
    });
    return rail;
  }

  /* ---- a single transmission card ---- */
  function renderCard(f, i) {
    var ct = ciphertextFor(f);
    var card = el('section', { class: 'card', id: f.id, 'data-accent': f.accent });

    // header
    card.appendChild(el('div', { class: 'head' }, [
      el('span', { class: 'num', text: 'TRANSMISSION ' + pad(i + 1) }),
      el('h2', { text: f.title }),
      el('span', { class: 'chip', text: f.cipherName })
    ]));

    // locked body
    var lockedBody = el('div', { class: 'locked-body' }, [
      el('div', { class: 'locked-note', html: K.ICON.lock + '<span>ENCRYPTED — decode the transmission above first.</span>' })
    ]);

    // open body
    var lead = el('p', { class: 'lead', text: f.lead });
    var cipherBox = el('div', { class: 'ciphertext' + (f.cipher === 'binary' || f.cipher === 'morse' ? ' mono-small' : ''), text: ct });

    // hints
    var hintsWrap = el('div', { class: 'hints' });
    var hintN = 0;
    var hintBtn = el('button', { class: 'btn tiny', text: 'Hint', onclick: function () {
      if (hintN >= f.hints.length) { this.disabled = true; return; }
      hintsWrap.appendChild(el('div', { class: 'hint-item', html: '<b>HINT ' + (hintN + 1) + '</b> — ' + f.hints[hintN] }));
      hintN++;
      if (hintN >= f.hints.length) this.textContent = 'No more hints';
      maybeShowStuck();
    }});

    // decoder (opt-in)
    var decWrap = el('div', { class: 'hidden' });
    var decoder = null;
    var decBtn = el('button', { class: 'btn tiny', text: 'Open decoder', onclick: function () {
      if (!decoder) {
        decoder = K.makeDecoder({
          fixed: f.cipher, mode: 'decode', initial: ct,
          wheel: f.cipher === 'caesar', showBrute: f.cipher === 'caesar'
        });
        decWrap.appendChild(el('div', { class: 'tiny dim', style: { margin: '2px 0 8px' }, text:
          f.cipher === 'caesar' ? 'Turn the wheel until the words appear.' :
          f.cipher === 'vigenere' ? 'Type the secret keyword to unlock it.' :
          'The machine will translate it for you.' }));
        decWrap.appendChild(decoder.root);
      }
      var open = decWrap.classList.toggle('hidden');
      this.textContent = open ? 'Open decoder' : 'Hide decoder';
      // the wheel was built while hidden (width 0) — reflow it now it's visible
      if (!open && decoder && decoder.wheel) decoder.wheel.setShift(decoder.wheel.getShift());
    }});

    // answer
    var input = el('input', { type: 'text', spellcheck: 'false', placeholder: 'type what it says…', 'aria-label': 'your answer' });
    var feedback = el('div', { class: 'feedback' });
    var submit = el('button', { class: 'btn primary', text: 'Decode', onclick: function () { check(); } });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    var answer = el('div', { class: 'answer' }, [input, submit]);

    // stuck / reveal
    var stuckBtn = el('button', { class: 'btn ghost tiny hidden', text: "I'm stuck — show me", onclick: function () {
      reveal();
    }});

    function maybeShowStuck() { if ((tries[f.id] || 0) >= 2 || hintN >= 2) stuckBtn.classList.remove('hidden'); }

    function check() {
      var val = input.value;
      if (C.normalize(val) === C.normalize(f.plain)) { win(false); }
      else {
        tries[f.id] = (tries[f.id] || 0) + 1;
        feedback.className = 'feedback bad';
        feedback.textContent = pick(['Not quite. Somewhere an adult is smirking. Try again.',
          'Close, maybe? Nope. The code disagrees.', 'Mmm. The machine says no. Check your spelling of the decoded words.',
          'Not it. Real agents miss too. Again.']);
        maybeShowStuck();
      }
    }
    function reveal() {
      input.value = f.plain;
      win(true);
    }
    function win(wasRevealed) {
      solved.add(f.id); saveProgress();
      feedback.className = 'feedback good';
      feedback.textContent = wasRevealed ? 'Revealed. Adults would’ve quit. You didn’t — that counts.' : 'DECRYPTED. You absolute legend.';
      // solved reveal block
      if (!card.querySelector('.solved')) {
        card.appendChild(el('div', { class: 'solved' }, [
          el('div', { class: 'tiny dim', text: 'DECODED MESSAGE' }),
          el('div', { class: 'plain', text: f.plain })
        ]));
      }
      if (!card.querySelector('.stamp')) card.appendChild(el('div', { class: 'stamp', text: 'DECRYPTED' }));
      if (!K.reduced && !wasRevealed) K.burst([getColor(f.accent)]);
      refreshStates();
      var next = active();
      if (next) setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 650);
      else setTimeout(showFinale, 500);
    }

    var openBody = el('div', { class: 'open-body' }, [
      lead, cipherBox,
      el('div', { class: 'controls' }, [hintBtn, decBtn, stuckBtn]),
      hintsWrap, decWrap, answer, feedback
    ]);

    card.appendChild(lockedBody);
    card.appendChild(openBody);
    card._lockedBody = lockedBody; card._openBody = openBody;
    return card;
  }

  function active() { var i = activeIndex(); return cardEls[i] || null; }

  function refreshStates(initial) {
    var act = activeIndex();
    frags.forEach(function (f, i) {
      var card = cardEls[i];
      var state = solved.has(f.id) ? 'done' : (i === act ? 'active' : 'locked');
      card.setAttribute('data-state', state);
      card._lockedBody.classList.toggle('hidden', state !== 'locked');
      card._openBody.classList.toggle('hidden', state === 'locked');
      // rail
      railNodes[i].classList.toggle('done', state === 'done');
      railNodes[i].classList.toggle('active', state === 'active');
      if (state === 'done') railNodes[i].innerHTML = K.ICON.check;
      if (i > 0) railLinks[i - 1].classList.toggle('done', solved.has(frags[i - 1].id));
      // pre-fill solved reveal on restore
      if (initial && state === 'done' && !card.querySelector('.solved')) {
        card.appendChild(el('div', { class: 'solved' }, [
          el('div', { class: 'tiny dim', text: 'DECODED MESSAGE' }),
          el('div', { class: 'plain', text: f.plain })
        ]));
        card.appendChild(el('div', { class: 'stamp', text: 'DECRYPTED' }));
      }
    });
    if (initial && act >= frags.length) showFinale(true);
  }

  /* ======================= FINALE ======================= */
  var finaleShown = false;
  function showFinale(silent) {
    if (finaleShown) { finaleHost.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    finaleShown = true;
    finaleHost.innerHTML = '';

    var wrap = el('div', { class: 'finale' });
    wrap.appendChild(el('span', { class: 'sigil-big', html: K.sigil('#49e58c') }));
    wrap.appendChild(el('h2', { text: 'CASE CLOSED' }));

    var induction = el('div', { class: 'induction' });
    var paper = el('div', { class: 'letter-paper' }, [
      el('div', { class: 'stampclassified', text: 'DECLASSIFIED' }),
      el('div', { class: 'lp-body' }),
      el('div', { class: 'sign', text: '— Luka' })
    ]);
    var body = paper.querySelector('.lp-body');
    var sign = paper.querySelector('.sign');
    sign.classList.add('hidden');

    var replayRow = el('div', { class: 'controls', style: { justifyContent: 'center', marginTop: '18px' } }, [
      el('a', { class: 'btn', href: 'toolkit.html', text: 'Enter the Field Kit →' }),
      el('button', { class: 'btn ghost', text: 'read it again', onclick: function () { finaleShown = false; showFinale(); } })
    ]);

    wrap.appendChild(induction);
    wrap.appendChild(paper);
    wrap.appendChild(replayRow);
    finaleHost.appendChild(wrap);

    var indText =
      'You cracked every layer — Caesar, numbers, machine-code, Morse, the mirror, and the lock they said couldn’t be picked. ' +
      'The average adult quits at transmission two. You are not an average adult. You are not any kind of adult.\n\n' +
      'By the power vested in nobody, I hereby make it official:\n\n' +
      '★ WELCOME TO ' + L.club + ', AGENT ' + L.recipient + '. ★\nMembership: permanent. Rules: none, except keep the kid energy and never trust a school uniform.\n\n' +
      'Here’s the part I didn’t bother to encode — because I want you to read it straight, no tricks:';

    if (silent) {
      induction.style.whiteSpace = 'pre-wrap';
      induction.textContent = indText;
      body.textContent = L.fullLetter;
      sign.classList.remove('hidden');
      return;
    }

    induction.style.whiteSpace = 'pre-wrap';
    if (!K.reduced) K.burst();
    (async function () {
      await K.typewriter(induction, indText, { speed: 9 });
      await wait(400);
      await K.typewriter(body, L.fullLetter, { speed: 24 });
      sign.classList.remove('hidden');
      if (!K.reduced) K.burst(['#e8b23a', '#e5544a']);
      finaleHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })();
  }

  /* ---- utils ---- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, K.reduced ? 0 : ms); }); }
  function getColor(name) {
    return ({ gold: '#e8b23a', amber: '#f0a552', green: '#49e58c', cyan: '#4bd6e0', violet: '#b98cff', red: '#e5544a' })[name] || '#e8b23a';
  }

  /* ======================= GO ======================= */
  document.addEventListener('DOMContentLoaded', buildBoot);
})();

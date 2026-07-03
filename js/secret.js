/* =============================================================================
   secret.js  —  opens a minted secret message from the URL hash.
   The link carries { c:cipher, t:ciphertext, n:note, k:key? }.
   She gets a puzzle + the decoder — not the answer.
   Depends on: ciphers.js, config.js, kit.js
   ========================================================================== */
(function () {
  'use strict';
  var K = window.Kit, C = window.Cipher, L = window.LETTER;
  var el = K.el;

  var NAMES = { caesar: 'Caesar shift', atbash: 'Atbash mirror', a1z26: 'A1Z26 numbers',
    binary: 'Binary', morse: 'Morse code', vigenere: 'Vigenère lock', reverse: 'Reverse' };

  document.addEventListener('DOMContentLoaded', function () {
    K.chrome();
    var wrap = el('div', { class: 'wrap' });
    document.body.appendChild(wrap);

    var hash = location.hash.replace(/^#/, '');
    var payload = hash ? K.Secret.decode(hash) : null;

    wrap.appendChild(el('header', { class: 'hero', style: { paddingBottom: '2px' } }, [
      el('span', { class: 'sigil-big', html: K.sigil('#e8b23a') }),
      el('div', { class: 'kicker', text: L.club }),
      el('h1', { text: 'A TRANSMISSION FOR YOU' })
    ]));

    if (!payload || !payload.t || !C[payload.c]) {
      wrap.appendChild(el('section', { class: 'card', 'data-state': 'active' }, [
        el('div', { class: 'head' }, [el('h2', { text: 'NO MESSAGE FOUND' })]),
        el('p', { class: 'lead', text: 'This link is empty or scrambled beyond repair. Ask the sender for a fresh one — or go make your own.' }),
        el('div', { class: 'controls' }, [
          el('a', { class: 'btn', href: 'toolkit.html', text: 'Make a secret →' }),
          el('a', { class: 'btn ghost', href: 'index.html', text: 'The Transmission' })
        ])
      ]));
      K.footer(wrap); K.initCrt(); return;
    }

    var accent = ({ caesar: 'gold', vigenere: 'red', atbash: 'violet', a1z26: 'amber', binary: 'green', morse: 'cyan', reverse: 'gold' })[payload.c] || 'gold';
    var card = el('section', { class: 'card', 'data-state': 'active', 'data-accent': accent });
    card.appendChild(el('div', { class: 'head' }, [
      el('span', { class: 'num', text: 'CLASSIFIED' }),
      el('h2', { text: 'DECODE ME' }),
      el('span', { class: 'chip', text: NAMES[payload.c] || payload.c })
    ]));

    if (payload.n) card.appendChild(el('div', { class: 'secret-note', 'data-accent': accent }, [
      el('div', { class: 'tiny dim', text: 'A CLUE FROM THE SENDER' }),
      el('div', { text: payload.n })
    ]));

    card.appendChild(el('div', { class: 'ciphertext' + (payload.c === 'binary' || payload.c === 'morse' ? ' mono-small' : ''), text: payload.t }));

    var decoder = K.makeDecoder({
      fixed: payload.c, mode: 'decode', initial: payload.t,
      wheel: payload.c === 'caesar', showBrute: payload.c === 'caesar'
    });
    card.appendChild(decoder.root);

    // optional key reveal
    if (payload.k != null && payload.k !== '') {
      var revealed = false;
      card.appendChild(el('div', { class: 'controls' }, [
        el('button', { class: 'btn ghost tiny', text: 'stuck? reveal the key', onclick: function () {
          if (revealed) return; revealed = true;
          this.replaceWith(el('div', { class: 'hint-item', 'data-accent': accent,
            html: '<b>THE KEY</b> — ' + (payload.c === 'caesar' ? ('shift by ' + payload.k) : ('keyword: ' + payload.k)) }));
        }})
      ]));
    }

    wrap.appendChild(card);
    wrap.appendChild(el('div', { class: 'center', style: { marginTop: '18px' } }, [
      el('a', { class: 'btn ghost tiny', href: 'toolkit.html', text: 'send one back →' })
    ]));

    K.footer(wrap);
    K.initCrt();
  });
})();

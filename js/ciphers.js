/* =============================================================================
   ciphers.js  —  The cipher engine.
   Pure functions. No DOM. Works in the browser (window.Cipher) and in Node
   (module.exports) so it can be unit-tested.

   Every cipher exposes .encode(text[, key]) and .decode(text[, key]).
   Ciphers that are their own inverse (Atbash) map both to the same op.
   ========================================================================== */
(function (root) {
  'use strict';

  var A = 65, Z = 90, a = 97, z = 122;

  function isUpper(c) { return c >= A && c <= Z; }
  function isLower(c) { return c >= a && c <= z; }

  // ---- Caesar / shift ------------------------------------------------------
  function caesarShift(text, shift) {
    shift = ((shift % 26) + 26) % 26;
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (isUpper(c))      out += String.fromCharCode((c - A + shift) % 26 + A);
      else if (isLower(c)) out += String.fromCharCode((c - a + shift) % 26 + a);
      else                 out += text[i];
    }
    return out;
  }
  var caesar = {
    encode: function (t, k) { return caesarShift(t, Number(k) || 0); },
    decode: function (t, k) { return caesarShift(t, -(Number(k) || 0)); },
    // Return all 26 possible decodings — the classic brute-force crack view.
    all: function (t) {
      var rows = [];
      for (var s = 0; s < 26; s++) rows.push({ shift: s, text: caesarShift(t, -s) });
      return rows;
    }
  };

  // ---- Atbash (mirror alphabet: A<->Z) -------------------------------------
  function atbashApply(text) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (isUpper(c))      out += String.fromCharCode(Z - (c - A));
      else if (isLower(c)) out += String.fromCharCode(z - (c - a));
      else                 out += text[i];
    }
    return out;
  }
  var atbash = { encode: atbashApply, decode: atbashApply };

  // ---- A1Z26 (A=1 .. Z=26) -------------------------------------------------
  // Encoding drops punctuation, keeps word breaks. Numbers within a word are
  // joined by "-", words are separated by " / ".  e.g. HI YOU -> 8-9 / 25-15-21
  var a1z26 = {
    encode: function (text) {
      return String(text).toUpperCase().split(/\s+/).filter(Boolean).map(function (word) {
        var nums = [];
        for (var i = 0; i < word.length; i++) {
          var c = word.charCodeAt(i);
          if (isUpper(c)) nums.push(String(c - A + 1));
        }
        return nums.join('-');
      }).filter(Boolean).join(' / ');
    },
    decode: function (text) {
      return String(text).split('/').map(function (word) {
        return word.trim().split(/[-\s]+/).filter(Boolean).map(function (tok) {
          var n = parseInt(tok, 10);
          if (n >= 1 && n <= 26) return String.fromCharCode(A + n - 1);
          return '';
        }).join('');
      }).filter(Boolean).join(' ');
    }
  };

  // ---- Binary (8-bit ASCII, bytes separated by spaces) ---------------------
  var binary = {
    encode: function (text) {
      var out = [];
      for (var i = 0; i < text.length; i++) {
        var b = text.charCodeAt(i).toString(2);
        while (b.length < 8) b = '0' + b;
        out.push(b);
      }
      return out.join(' ');
    },
    decode: function (text) {
      return String(text).trim().split(/\s+/).filter(Boolean).map(function (byte) {
        var n = parseInt(byte, 2);
        return isNaN(n) ? '' : String.fromCharCode(n);
      }).join('');
    }
  };

  // ---- Morse ---------------------------------------------------------------
  var MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
    H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
    O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
    V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '-': '-....-', '/': '-..-.', ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', '@': '.--.-.'
  };
  var UN_MORSE = {};
  for (var mk in MORSE) if (MORSE.hasOwnProperty(mk)) UN_MORSE[MORSE[mk]] = mk;
  var morse = {
    table: MORSE,
    encode: function (text) {
      return String(text).toUpperCase().split(/\s+/).filter(Boolean).map(function (word) {
        var codes = [];
        for (var i = 0; i < word.length; i++) {
          var ch = word[i];
          if (MORSE[ch]) codes.push(MORSE[ch]);
        }
        return codes.join(' ');
      }).filter(Boolean).join(' / ');
    },
    decode: function (text) {
      return String(text).trim().split(/\s*\/\s*/).map(function (word) {
        return word.trim().split(/\s+/).filter(Boolean).map(function (code) {
          return UN_MORSE[code] || '';
        }).join('');
      }).filter(Boolean).join(' ');
    }
  };

  // ---- Vigenere (keyword cipher) -------------------------------------------
  function vigenere(text, key, dir) {
    key = String(key || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return text;
    var out = '', ki = 0;
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      var k = (key.charCodeAt(ki % key.length) - A) * dir;
      if (isUpper(c))      { out += String.fromCharCode(((c - A + k) % 26 + 26) % 26 + A); ki++; }
      else if (isLower(c)) { out += String.fromCharCode(((c - a + k) % 26 + 26) % 26 + a); ki++; }
      else                 { out += text[i]; }
    }
    return out;
  }
  var vig = {
    encode: function (t, k) { return vigenere(t, k, 1); },
    decode: function (t, k) { return vigenere(t, k, -1); }
  };

  // ---- Pigpen (letters -> geometric-symbol ids; rendered as SVG by the UI) --
  // Standard pigpen layout. id maps to a symbol drawn in kit.js.
  // Grid 1 (no dot):  A B C / D E F / G H I
  // Grid 2 (dot):     J K L / M N O / P Q R
  // X 1 (no dot):     S / T U / V   (upper, left, right, down opens)
  // X 2 (dot):        W / X Y / Z
  var PIGPEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var pigpen = {
    order: PIGPEN,
    encode: function (text) {
      // returns array of tokens: {t:'sym', id:'A'} or {t:'raw', ch:' '}
      var toks = [];
      var up = String(text).toUpperCase();
      for (var i = 0; i < up.length; i++) {
        var ch = up[i];
        if (ch >= 'A' && ch <= 'Z') toks.push({ t: 'sym', id: ch });
        else toks.push({ t: 'raw', ch: up[i] });
      }
      return toks;
    }
  };

  // ---- Reverse (simple, fun) ----------------------------------------------
  var reverse = {
    encode: function (t) { return String(t).split('').reverse().join(''); },
    decode: function (t) { return String(t).split('').reverse().join(''); }
  };

  // ---- Normalisation used for answer-checking ------------------------------
  // Strips everything except letters/digits and uppercases, so a kid's answer
  // matches regardless of spacing, punctuation or case.
  function normalize(s) {
    return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  var Cipher = {
    caesar: caesar,
    atbash: atbash,
    a1z26: a1z26,
    binary: binary,
    morse: morse,
    vigenere: vig,
    pigpen: pigpen,
    reverse: reverse,
    normalize: normalize,
    // generic dispatch used by the decoder widget
    run: function (type, mode, text, key) {
      var c = Cipher[type];
      if (!c || !c[mode]) return '';
      return c[mode](text, key);
    }
  };

  root.Cipher = Cipher;
  if (typeof module !== 'undefined' && module.exports) module.exports = Cipher;

})(typeof window !== 'undefined' ? window : globalThis);

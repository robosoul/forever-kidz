/* =============================================================================
   config.js  —  THE ONE FILE YOU EDIT.

   Everything personal lives here: who it's to, the secret message, and how each
   piece is locked. Change the words, keep the structure.

   HOW A TRANSMISSION WORKS
   - `plain`  : the real words (this is the "answer"). The site scrambles it live
                using `cipher`+`key`, so you never hand-encode anything.
   - `cipher` : one of  caesar | a1z26 | binary | morse | atbash | vigenere
   - `key`    : the shift number (caesar) or keyword (vigenere). Ignored by others.
   - `lead`   : your voice, shown in the clear, to set up the puzzle.
   - `hints`  : shown one at a time when she taps HINT. Go easy -> obvious.

   The answer check is forgiving: spaces, capitals and punctuation don't matter.
   ========================================================================== */
window.LETTER = {

  /* ---- who ---------------------------------------------------------------- */
  recipient: 'SOFIJA',           // <-- her real name
  recipientCodename: 'LADY BOSS',// <-- her secret-agent codename, for the game
  sender:    'LUKA',             // <-- you (what she actually calls you)
  senderCodename: 'AGENT SMITH', // <-- your secret-agent codename, for the game
  club:      'THE ORDER OF FOREVER KIDZ',

  /* ---- the full letter, verbatim, shown assembled at the finale ----------- */
  // The tail end of this (the "Luv ya" sign-off) is the part she never has to
  // decode — it just arrives in the clear, in your hand, at the very end.
  fullLetter:
    "Hey kid, still stupid? Ha ha ha... just kidding. You know I miss you a lot. " +
    "I miss watching TV with you, talking about animation and graphic novels, " +
    "most of all I miss your kid energy. Don't lose it. Screw the school " +
    "uniforms, down with the adults. Forever kidz! Luv ya, your uncle Luka <3",

  /* ---- the puzzle chain --------------------------------------------------- */
  fragments: [
    {
      id: 'f1',
      cipher: 'caesar', key: 3,
      cipherName: 'CAESAR SHIFT',
      accent: 'gold',
      title: 'THE OPENER',
      plain: 'Hey kid, still stupid? Ha ha ha... just kidding.',
      lead: "First contact. I kept it old-school — the OLDEST school. A Roman general " +
            "used this exact trick to write to his armies 2,000 years ago. If it's good " +
            "enough for an empire, it's good enough for you.",
      hints: [
        "It's a shift cipher: every letter marched the same number of steps down the alphabet.",
        "Caesar's lucky number was 3. A→D, B→E, C→F… now spin it back.",
        "Grab the Caesar Wheel below, set the shift to 3, and read it straight off."
      ]
    },
    {
      id: 'f2',
      cipher: 'a1z26',
      cipherName: 'A1Z26 (NUMBERS)',
      accent: 'amber',
      title: 'BY THE NUMBERS',
      plain: 'You know I miss you a lot.',
      lead: "Adults LOVE numbers. Bedtimes, ages, spreadsheets, 'you're too young for that.' " +
            "Let's turn their favorite weapon against them.",
      hints: [
        "These aren't sums. Each number is a letter — just count the alphabet.",
        "A=1, B=2, C=3 … all the way to Z=26. The slash ( / ) means a new word.",
        "So 25=Y, 15=O, 21=U … there's your first word. Keep counting."
      ]
    },
    {
      id: 'f3',
      cipher: 'binary',
      cipherName: 'BINARY',
      accent: 'green',
      title: 'MACHINE WHISPERS',
      plain: 'I miss watching TV with you',
      lead: "This is how the machines talk when they think we're not listening. Just ones and " +
            "zeros. Feed it to the decoder… or crack it by hand and prove you're part robot.",
      hints: [
        "Every block of 8 digits is one letter — it's how computers store text.",
        "Drop the whole thing into the BINARY tool in the Field Kit. 0s and 1s become words.",
        "01001001 = 'I'. That's the start. The machine misses something…"
      ]
    },
    {
      id: 'f4',
      cipher: 'morse',
      cipherName: 'MORSE CODE',
      accent: 'cyan',
      title: 'DOTS IN THE DARK',
      plain: 'talking about animation and graphic novels',
      lead: "Spies and sailors tapped this out with flashlights and radios when they couldn't " +
            "say a word out loud. Dot dot dot. You have to listen with your eyes.",
      hints: [
        "It's Morse code — dots and dashes, one little pattern per letter.",
        "One space splits letters; a slash ( / ) splits words. Use the MORSE tool.",
        ".- = A, -... = B, and so on. Tap it out and it'll spell something we both love."
      ]
    },
    {
      id: 'f5',
      cipher: 'atbash',
      cipherName: 'ATBASH MIRROR',
      accent: 'violet',
      title: 'THROUGH THE LOOKING GLASS',
      plain: "most of all I miss your kid energy. Don't lose it.",
      lead: "This one's a mirror. Flip the whole alphabet backwards and hold the message up to " +
            "the light. What you see on the other side is the truest thing I'll say all letter.",
      hints: [
        "It's Atbash — the alphabet reversed. The first letter swaps with the last.",
        "A↔Z, B↔Y, C↔X … M↔N. Every letter has a mirror twin.",
        "Use the ATBASH tool, or flip each letter yourself — the mirror does the rest."
      ]
    },
    {
      id: 'f6',
      cipher: 'vigenere', key: 'KIDZ',
      cipherName: 'VIGENÈRE LOCK',
      accent: 'red',
      title: 'THE FINAL LOCK',
      plain: 'Screw the school uniforms, down with the adults.',
      lead: "The big one. The lock they said couldn't be picked for 300 years. It needs a secret " +
            "word — and only a real member of the club would ever guess it. Your key: what are " +
            "we, always and forever? Four letters. You already know it.",
      hints: [
        "It's a Vigenère cipher. Useless without the keyword that unlocks it.",
        "The keyword is our name. Four letters. Rhymes with 'squids'. It's KIDZ.",
        "Open the VIGENÈRE tool, type KIDZ as the key, paste the code, and it swings open."
      ]
    }
  ]
};

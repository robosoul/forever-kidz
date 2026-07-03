# The Order of Forever Kidz 🔑👁️

A little cipher-mystery site for a kid who's far away. It opens with a wax seal, then
hands over a secret letter locked behind **six** classic ciphers — Caesar, A1Z26,
binary, Morse, Atbash and Vigenère. Crack all six and the real message assembles itself
on a sheet of aged paper. Aesthetic: field-journal meets classified dossier meets late-night
mystery show (Gravity Falls / X-Files energy, not a copy of either).

It's a static site — pure HTML/CSS/JS, no build step, no server, no tracking. Perfect for
GitHub Pages.

---

## What's in the box

| Page | What it is |
|------|-----------|
| `index.html` | **The Transmission** — the flagship. Break the seal, decode six layers, reach the letter. Send *this* link. |
| `toolkit.html` | **The Field Kit** — a decoder/encoder for every cipher, a reference manual, and a **Make a Secret** link generator for sending new codes later. |
| `secret.html` | Opens a one-off coded message made in the Field Kit (the code rides along in the link). |
| `js/config.js` | **The only file you edit.** The letter, her name, and how each piece is locked. |

---

## 1. Put it online (GitHub Pages, ~2 minutes)

From this folder, with the GitHub CLI signed in as **robosoul**:

```bash
git init && git add -A && git commit -m "The Order of Forever Kidz"
gh repo create forever-kidz --public --source=. --push
gh api -X POST repos/robosoul/forever-kidz/pages -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/'
```

Give Pages a minute, then her link is:

```
https://robosoul.github.io/forever-kidz/
```

*(Prefer clicking? Push the repo, then GitHub → repo → Settings → Pages → Source: `main` / `root` → Save.)*

**One nice touch:** after you know the URL, open `index.html` and set the two
`og:` lines' content so the link shows a slick preview when you message it to her.

---

## 2. Change the letter (or write a whole new one)

Everything personal lives in **`js/config.js`**. No encoding by hand — you type the *real*
words, the site scrambles them live.

```js
recipient: 'KID',          // ← her name or codename, e.g. 'AGENT MAIA'
sender:    'UNCLE LUKA',
closing:   'Forever kidz! Luv ya, your uncle Luka <3',
fullLetter: "…the whole letter, shown assembled at the end…",

fragments: [
  {
    cipher: 'caesar', key: 3,          // caesar | a1z26 | binary | morse | atbash | vigenere
    cipherName: 'CAESAR SHIFT',
    accent: 'gold',                    // gold | amber | green | cyan | violet | red
    title: 'THE OPENER',
    plain: 'Hey kid, still stupid? Ha ha ha... just kidding.',   // the real words = the answer
    lead:  "Your voice, shown in the clear, to set up the puzzle.",
    hints: [ "easy nudge", "the actual key", "basically the answer" ]
  },
  …
]
```

- `plain` is the answer. The site enciphers it for display and checks her typing against it.
- The check is **forgiving** — capitals, spaces and punctuation don't matter. "hey kid still
  stupid" unlocks "Hey kid, still stupid?".
- `key` is the shift number (Caesar) or the keyword (Vigenère). Other ciphers ignore it.
- Want fewer/more puzzles? Add or remove `fragments` entries — the rail, unlock chain and
  finale all adjust automatically.

The current Vigenère keyword is **KIDZ** (fragment 6). Change `key` there if you like.

---

## 3. Send her new codes any time

That's what the Field Kit is for. Go to `toolkit.html` → **Make a Secret**:

1. Type your message, pick a cipher, add a clue in your own words.
2. Hit **Generate secret link** and copy it.
3. Text/email her the link. She opens it and gets a puzzle — with the decoder right there
   and your clue, but *not* the answer.

Leave the "tuck the key inside the link" box unticked to make her work for it (tell her the
key another way), or tick it so she can reveal it if she's stuck.

---

## Preview it on your own machine first

```bash
cd forever-kidz
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Honest small print

- **Puzzle-grade, not spy-grade.** These are classic hand ciphers, and for the Field Kit
  links the code travels inside the URL. It's built to delight a clever kid, not to guard
  real secrets. Don't put anything genuinely sensitive in it.
- Progress is saved in *her* browser only (localStorage). There's a **reset** link at the
  bottom of the mystery.
- Fonts load from Google Fonts for the full look; if she's offline they fall back to clean
  typewriter/monospace fonts and everything still works.
- Motion is gentle and respects "reduce motion" settings. The spooky CRT scanlines have an
  on/off toggle in the corner.

Made with love (and a little mischief). Forever kidz. ∞

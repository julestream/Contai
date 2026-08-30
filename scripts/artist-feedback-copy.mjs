// Text corrections from an artist's review.
//
//   nav.sell         — 'Feltöltés' was too long for a fifth of a phone screen,
//                      and 'Eladás' says the outcome rather than the mechanic
//   home.tagline     — the Hungarian was missing its verb; 'Minden mű egy
//                      találkozás' needs none and is stronger
//   artwork.vacationMsg      — read like an out-of-office reply
//   artwork.guaranteeStrip   — 'ha valami balul sül el' sounded ominous at
//                              the exact moment a buyer needs reassurance
//
// Safe to run twice.
//
//   node scripts/artist-feedback-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── nav.sell ───────────────────────────────────────────────
  {
    label: 'hu — nav.sell',
    from: `      sell: 'Feltöltés',`,
    to: `      sell: 'Eladás',`,
  },

  // ── home.tagline ───────────────────────────────────────────
  {
    label: 'hu — home.tagline',
    from: `      tagline: 'Minden mű mögött egy találkozás.',`,
    to: `      tagline: 'Minden mű egy találkozás.',`,
  },
  {
    label: 'en — home.tagline',
    from: `      tagline: 'Behind every work, a meeting.',`,
    to: `      tagline: 'Every work is a meeting.',`,
  },
  {
    label: 'ro — home.tagline',
    from: `      tagline: 'Fiecare lucrare vine cu o întâlnire.',`,
    to: `      tagline: 'Fiecare lucrare este o întâlnire.',`,
  },

  // ── vacation message ───────────────────────────────────────
  {
    label: 'hu — artwork.vacationMsg',
    from: `      vacationMsg: 'Ez a művész jelenleg távol van. Továbbra is kedvencnek jelölheted a művet és írhatsz neki — a foglalás akkor nyílik meg újra, amikor visszatér.',`,
    to: `      vacationMsg: 'Ez a mű most nem foglalható. Kedvencnek jelölheted, és írhatsz a művésznek — szólunk, amint újra elérhető.',`,
  },
  {
    label: 'en — artwork.vacationMsg',
    from: `      vacationMsg: 'This artist is currently away. You can still favourite this piece and message them — reservations reopen when they\\'re back.',`,
    to: `      vacationMsg: 'This piece can\\'t be reserved just now. You can favourite it and write to the artist — we\\'ll let you know when it opens again.',`,
  },
  {
    label: 'ro — artwork.vacationMsg',
    from: `      vacationMsg: 'Acest artist este momentan plecat. Poți adăuga lucrarea la favorite și îi poți scrie — rezervările se redeschid când revine.',`,
    to: `      vacationMsg: 'Această lucrare nu poate fi rezervată acum. O poți adăuga la favorite și îi poți scrie artistului — te anunțăm când redevine disponibilă.',`,
  },

  // ── guarantee strip ────────────────────────────────────────
  {
    label: 'hu — artwork.guaranteeStrip',
    from: `      guaranteeStrip: 'Contai Garancia — teljes visszatérítés, ha valami balul sül el',`,
    to: `      guaranteeStrip: 'Contai Garancia — a foglalási díjad végig védve van',`,
  },
  {
    label: 'en — artwork.guaranteeStrip',
    from: `      guaranteeStrip: 'Contai Guarantee — full refund if something goes wrong',`,
    to: `      guaranteeStrip: 'Contai Guarantee — your reservation fee is protected throughout',`,
  },
  {
    label: 'ro — artwork.guaranteeStrip',
    from: `      guaranteeStrip: 'Garanția Contai — rambursare completă dacă ceva nu merge bine',`,
    to: `      guaranteeStrip: 'Garanția Contai — taxa ta de rezervare este protejată pe tot parcursul',`,
  },
]

const original = await fs.readFile(FILE, 'utf8')
const pending = edits.filter(e => !original.includes(e.to))

if (pending.length === 0) {
  console.log('All copy already present. Nothing to do.')
  process.exit(0)
}

let ok = true
for (const edit of pending) {
  const count = original.split(edit.from).length - 1
  if (count === 1) console.log(`  ok       ${edit.label}`)
  else { console.log(`  FAILED   ${edit.label} — found ${count} matches, expected 1`); ok = false }
}

if (!ok) {
  console.log('\nNo changes written. The file is untouched.')
  process.exit(1)
}

let updated = original
for (const edit of pending) updated = updated.replace(edit.from, edit.to)

await fs.writeFile(`${FILE}.feedback.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
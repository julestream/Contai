// Replaces the home tagline in all three languages.
//
// The earlier line described the merchandise; this one names what actually
// distinguishes Contai — the buyer meets the artist. It also drops the
// nationality framing, since an artist living in Bucharest need not be
// Romanian.
//
// Each language reads naturally on its own rather than echoing the others
// word for word.
//
//   node scripts/update-tagline.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — home.tagline',
    from: `      tagline: 'Eredeti művek magyar és román alkotóktól — közvetlenül a művésztől, átlátható áron.',`,
    to: `      tagline: 'Minden mű mögött egy találkozás.',`,
  },
  {
    label: 'en — home.tagline',
    from: `      tagline: 'Original work by Hungarian and Romanian artists — bought directly from them, at a price you can see.',`,
    to: `      tagline: 'Behind every work, a meeting.',`,
  },
  {
    label: 'ro — home.tagline',
    from: `      tagline: 'Lucrări originale de la artiști maghiari și români — direct de la ei, la un preț transparent.',`,
    to: `      tagline: 'Fiecare lucrare vine cu o întâlnire.',`,
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

await fs.writeFile(`${FILE}.tagline2.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
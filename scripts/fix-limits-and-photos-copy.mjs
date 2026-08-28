// Two copy fixes, all three languages:
//   1. Bio/statement placeholders now say the real limits (1000 / 600)
//   2. The photo step says plainly: one artwork per listing
//
// Safe to run twice — an edit whose result is already present is skipped.
//
//   node scripts/fix-limits-and-photos-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── onboarding placeholders: corrected character limits ────
  {
    label: 'hu — onboarding placeholders',
    from: `      bioPlaceholder: 'Bemutatkozás (max. 500 karakter)',
      statementPlaceholder: 'Művészi ars poetica (max. 300 karakter)',`,
    to: `      bioPlaceholder: 'Bemutatkozás (max. 1000 karakter)',
      statementPlaceholder: 'Művészi ars poetica (max. 600 karakter)',`,
  },
  {
    label: 'en — onboarding placeholders',
    from: `      bioPlaceholder: 'Bio (max 500 characters)',
      statementPlaceholder: 'Artist statement (max 300 characters)',`,
    to: `      bioPlaceholder: 'Bio (max 1000 characters)',
      statementPlaceholder: 'Artist statement (max 600 characters)',`,
  },
  {
    label: 'ro — onboarding placeholders',
    from: `      bioPlaceholder: 'Descriere (max. 500 de caractere)',
      statementPlaceholder: 'Declarație de artist (max. 300 de caractere)',`,
    to: `      bioPlaceholder: 'Descriere (max. 1000 de caractere)',
      statementPlaceholder: 'Declarație de artist (max. 600 de caractere)',`,
  },

  // ── upload: one artwork per listing ────────────────────────
  {
    label: 'hu — upload.onePerListing',
    from: `      addPhotos: '+ Fotók hozzáadása',`,
    to: `      addPhotos: '+ Fotók hozzáadása',
      onePerListingTitle: 'Egy műalkotás hirdetésenként',
      onePerListingBody: 'Ezek a fotók mind ugyanazt az egy művet mutatják — több nézetből, részletekben, vagy a falon. Ha több művet szeretnél feltölteni, mindegyikhez külön hirdetést hozz létre.',`,
  },
  {
    label: 'en — upload.onePerListing',
    from: `      addPhotos: '+ Add photos',`,
    to: `      addPhotos: '+ Add photos',
      onePerListingTitle: 'One artwork per listing',
      onePerListingBody: 'These photos should all show the same single work — different angles, details, or how it hangs. If you have several works to sell, create a separate listing for each one.',`,
  },
  {
    label: 'ro — upload.onePerListing',
    from: `      addPhotos: '+ Adaugă fotografii',`,
    to: `      addPhotos: '+ Adaugă fotografii',
      onePerListingTitle: 'O singură lucrare per anunț',
      onePerListingBody: 'Aceste fotografii trebuie să arate aceeași lucrare — din unghiuri diferite, detalii sau cum arată pe perete. Dacă ai mai multe lucrări de vânzare, creează un anunț separat pentru fiecare.',`,
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
  if (count === 1) {
    console.log(`  ok       ${edit.label}`)
  } else {
    console.log(`  FAILED   ${edit.label} — found ${count} matches, expected 1`)
    ok = false
  }
}

if (!ok) {
  console.log('')
  console.log('No changes written. The file is untouched.')
  process.exit(1)
}

let updated = original
for (const edit of pending) {
  updated = updated.replace(edit.from, edit.to)
}

await fs.writeFile(`${FILE}.limits.backup`, original)
await fs.writeFile(FILE, updated)

console.log('')
console.log(`Applied ${pending.length} edits.`)
console.log(`Original saved as ${FILE}.limits.backup`)
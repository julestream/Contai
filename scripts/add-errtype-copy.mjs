// Adds upload.errType — shown when an artist tries to continue without
// choosing a category. Safe to run twice.
//
//   node scripts/add-errtype-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — upload.errType',
    from: `      errMedium: 'Válassz technikát.',`,
    to: `      errMedium: 'Válassz technikát.',
      errType: 'Válaszd ki, melyik műfajba tartozik a mű.',`,
  },
  {
    label: 'en — upload.errType',
    from: `      errMedium: 'Please choose a medium.',`,
    to: `      errMedium: 'Please choose a medium.',
      errType: 'Please choose which category the work belongs to.',`,
  },
  {
    label: 'ro — upload.errType',
    from: `      errMedium: 'Alege o tehnică.',`,
    to: `      errMedium: 'Alege o tehnică.',
      errType: 'Alege categoria în care se încadrează lucrarea.',`,
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

await fs.writeFile(`${FILE}.errtype.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
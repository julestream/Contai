// Labels for the scale drawing on the artwork page.
// Safe to run twice.
//
//   node scripts/add-scale-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — artwork.scale',
    from: `      pickupLocation: 'Átvétel helye',`,
    to: `      scaleLabel: 'Mekkora valójában',
      scalePerson: '170 cm magas ember',
      pickupLocation: 'Átvétel helye',`,
  },
  {
    label: 'en — artwork.scale',
    from: `      pickupLocation: 'Pickup location',`,
    to: `      scaleLabel: 'How big it really is',
      scalePerson: 'Person 170 cm tall',
      pickupLocation: 'Pickup location',`,
  },
  {
    label: 'ro — artwork.scale',
    from: `      pickupLocation: 'Locul ridicării',`,
    to: `      scaleLabel: 'Cât de mare este de fapt',
      scalePerson: 'Persoană de 170 cm',
      pickupLocation: 'Locul ridicării',`,
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

await fs.writeFile(`${FILE}.scale.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
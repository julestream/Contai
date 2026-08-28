// Adds filters.style and the shared style labels used by the filter panel.
// Safe to run twice.
//
//   node scripts/add-style-filter-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — filters.style',
    from: `      mood: 'Hangulat',
      colour: 'Szín',`,
    to: `      mood: 'Hangulat',
      style: 'Stílus',
      colour: 'Szín',`,
  },
  {
    label: 'en — filters.style',
    from: `      mood: 'Mood',
      colour: 'Colour',`,
    to: `      mood: 'Mood',
      style: 'Style',
      colour: 'Colour',`,
  },
  {
    label: 'ro — filters.style',
    from: `      mood: 'Dispoziție',
      colour: 'Culoare',`,
    to: `      mood: 'Dispoziție',
      style: 'Stil',
      colour: 'Culoare',`,
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

await fs.writeFile(`${FILE}.style.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
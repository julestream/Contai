// The link inside 'How buying works' pointed at the guide using the home
// carousel's heading, which read oddly out of context.
// Safe to run twice.
//
//   node scripts/rename-process-link.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — artwork.moreAboutProcess',
    from: `      howBuyingLabel: 'Hogyan működik a vásárlás',`,
    to: `      howBuyingLabel: 'Hogyan működik a vásárlás',
      moreAboutProcess: 'Több információ a folyamatról',`,
  },
  {
    label: 'en — artwork.moreAboutProcess',
    from: `      howBuyingLabel: 'How buying works here',`,
    to: `      howBuyingLabel: 'How buying works here',
      moreAboutProcess: 'More about the process',`,
  },
  {
    label: 'ro — artwork.moreAboutProcess',
    from: `      howBuyingLabel: 'Cum funcționează cumpărarea',`,
    to: `      howBuyingLabel: 'Cum funcționează cumpărarea',
      moreAboutProcess: 'Mai multe despre proces',`,
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

await fs.writeFile(`${FILE}.process.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
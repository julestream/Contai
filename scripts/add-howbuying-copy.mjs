// A short account of how buying works, shown on the artwork page under the
// Reserve button.
//
// The existing reserve.step1..4 strings are written for someone who has
// already committed. This answers the earlier question — what am I getting
// into — in a calmer register, before the decision rather than after it.
//
// Safe to run twice.
//
//   node scripts/add-howbuying-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — artwork.howBuying',
    from: `      reserve: 'Foglalás',`,
    to: `      reserve: 'Foglalás',
      howBuyingLabel: 'Hogyan működik a vásárlás',
      howBuying1: 'Most kifizeted az ár 8%-át. A művész leveszi a művet a piactérről, és félreteszi neked.',
      howBuying2: 'Megbeszélitek, mikor és hol találkoztok. A pontos cím csak akkor jelenik meg, amikor mindketten megerősítettétek.',
      howBuying3: 'A saját szemeddel látod a művet, mielőtt a többit kifizetnéd.',
      howBuying4: 'A fennmaradó összeget a helyszínen, közvetlenül a művésznek fizeted.',`,
  },
  {
    label: 'en — artwork.howBuying',
    from: `      reserve: 'Reserve',`,
    to: `      reserve: 'Reserve',
      howBuyingLabel: 'How buying works here',
      howBuying1: 'You pay 8% now. The artist takes the work off the marketplace and sets it aside for you.',
      howBuying2: 'You agree between you when and where to meet. The exact address appears only once you have both confirmed.',
      howBuying3: 'You see the work with your own eyes before paying the rest.',
      howBuying4: 'You pay the balance on the day, directly to the artist.',`,
  },
  {
    label: 'ro — artwork.howBuying',
    from: `      reserve: 'Rezervă',`,
    to: `      reserve: 'Rezervă',
      howBuyingLabel: 'Cum funcționează cumpărarea',
      howBuying1: 'Plătești acum 8%. Artistul retrage lucrarea de pe piață și o pune deoparte pentru tine.',
      howBuying2: 'Stabiliți împreună când și unde vă întâlniți. Adresa exactă apare doar după ce amândoi ați confirmat.',
      howBuying3: 'Vezi lucrarea cu ochii tăi înainte de a plăti restul.',
      howBuying4: 'Plătești restul sumei în ziua respectivă, direct artistului.',`,
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

await fs.writeFile(`${FILE}.howbuying.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
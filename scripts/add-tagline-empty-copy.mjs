// Two additions, all three languages:
//   home.tagline      — one line under Felfedezés saying what Contai is
//   results.emptySoon — a warmer empty state for categories with no work yet
//
// Safe to run twice.
//
//   node scripts/add-tagline-empty-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── home tagline ───────────────────────────────────────────
  {
    label: 'hu — home.tagline',
    from: `      discover: 'Felfedezés',`,
    to: `      discover: 'Felfedezés',
      tagline: 'Eredeti művek magyar és román alkotóktól — közvetlenül a művésztől, átlátható áron.',`,
  },
  {
    label: 'en — home.tagline',
    from: `      discover: 'Discover',`,
    to: `      discover: 'Discover',
      tagline: 'Original work by Hungarian and Romanian artists — bought directly from them, at a price you can see.',`,
  },
  {
    label: 'ro — home.tagline',
    from: `      discover: 'Descoperă',`,
    to: `      discover: 'Descoperă',
      tagline: 'Lucrări originale de la artiști maghiari și români — direct de la ei, la un preț transparent.',`,
  },

  // ── empty category state ───────────────────────────────────
  {
    label: 'hu — results.emptySoon',
    from: `      noMatch: 'Nincs a szűrőknek megfelelő mű.',`,
    to: `      noMatch: 'Nincs a szűrőknek megfelelő mű.',
      emptySoon: 'Ebbe a kategóriába még nem érkezett mű. Folyamatosan bővül a kínálat — nézz vissza hamarosan.',
      emptySoonCta: 'Az összes mű megtekintése',`,
  },
  {
    label: 'en — results.emptySoon',
    from: `      noMatch: 'No works match these filters.',`,
    to: `      noMatch: 'No works match these filters.',
      emptySoon: 'No work in this category yet. New pieces arrive regularly — do look again soon.',
      emptySoonCta: 'See all works',`,
  },
  {
    label: 'ro — results.emptySoon',
    from: `      noMatch: 'Nicio lucrare nu corespunde acestor filtre.',`,
    to: `      noMatch: 'Nicio lucrare nu corespunde acestor filtre.',
      emptySoon: 'Încă nu există lucrări în această categorie. Adăugăm lucrări noi în mod regulat — revino în curând.',
      emptySoonCta: 'Vezi toate lucrările',`,
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

await fs.writeFile(`${FILE}.tagline.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
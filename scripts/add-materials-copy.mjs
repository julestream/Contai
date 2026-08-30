// Adds the material field to the upload flow, in all three languages, and
// extends the existing filter labels with Cardboard and Panel.
//
// The `materials` column has existed and been filterable all along, but the
// upload page never asked for it — so every artwork had none and the filter
// found nothing.
//
// Safe to run twice.
//
//   node scripts/add-materials-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── filter labels: add Cardboard and Panel ─────────────────
  {
    label: 'hu — filters.materialLabels',
    from: `      materialLabels: { Canvas: 'Vászon', Paper: 'Papír', Wood: 'Fa', Metal: 'Fém', Glass: 'Üveg', Ceramic: 'Kerámia', Fabric: 'Textil', Stone: 'Kő' },`,
    to: `      materialLabels: { Canvas: 'Vászon', Paper: 'Papír', Cardboard: 'Karton', Wood: 'Fa', Panel: 'Tábla', Metal: 'Fém', Glass: 'Üveg', Ceramic: 'Kerámia', Fabric: 'Textil', Stone: 'Kő' },`,
  },
  {
    label: 'en — filters.materialLabels',
    from: `      materialLabels: { Canvas: 'Canvas', Paper: 'Paper', Wood: 'Wood', Metal: 'Metal', Glass: 'Glass', Ceramic: 'Ceramic', Fabric: 'Fabric', Stone: 'Stone' },`,
    to: `      materialLabels: { Canvas: 'Canvas', Paper: 'Paper', Cardboard: 'Cardboard', Wood: 'Wood', Panel: 'Panel', Metal: 'Metal', Glass: 'Glass', Ceramic: 'Ceramic', Fabric: 'Fabric', Stone: 'Stone' },`,
  },
  {
    label: 'ro — filters.materialLabels',
    from: `      materialLabels: { Canvas: 'Pânză', Paper: 'Hârtie', Wood: 'Lemn', Metal: 'Metal', Glass: 'Sticlă', Ceramic: 'Ceramică', Fabric: 'Țesătură', Stone: 'Piatră' },`,
    to: `      materialLabels: { Canvas: 'Pânză', Paper: 'Hârtie', Cardboard: 'Carton', Wood: 'Lemn', Panel: 'Panou', Metal: 'Metal', Glass: 'Sticlă', Ceramic: 'Ceramică', Fabric: 'Țesătură', Stone: 'Piatră' },`,
  },

  // ── upload: the field itself ───────────────────────────────
  {
    label: 'hu — upload.material',
    from: `      colours: 'Színek',
      coloursHelp:`,
    to: `      materialLabel: 'Anyag / hordozó',
      materialHelp: 'Mire vagy miből készült a mű. Válaszd ki az összes megfelelőt.',
      materialLabels: { Canvas: 'Vászon', Paper: 'Papír', Cardboard: 'Karton', Wood: 'Fa', Panel: 'Tábla', Metal: 'Fém', Glass: 'Üveg', Ceramic: 'Kerámia', Fabric: 'Textil', Stone: 'Kő' },
      colours: 'Színek',
      coloursHelp:`,
  },
  {
    label: 'en — upload.material',
    from: `      colours: 'Colours',
      coloursHelp:`,
    to: `      materialLabel: 'Material / support',
      materialHelp: 'What the work is made on or from. Pick all that apply.',
      materialLabels: { Canvas: 'Canvas', Paper: 'Paper', Cardboard: 'Cardboard', Wood: 'Wood', Panel: 'Panel', Metal: 'Metal', Glass: 'Glass', Ceramic: 'Ceramic', Fabric: 'Fabric', Stone: 'Stone' },
      colours: 'Colours',
      coloursHelp:`,
  },
  {
    label: 'ro — upload.material',
    from: `      colours: 'Culori',
      coloursHelp:`,
    to: `      materialLabel: 'Material / suport',
      materialHelp: 'Pe ce sau din ce este realizată lucrarea. Alege toate variantele care se potrivesc.',
      materialLabels: { Canvas: 'Pânză', Paper: 'Hârtie', Cardboard: 'Carton', Wood: 'Lemn', Panel: 'Panou', Metal: 'Metal', Glass: 'Sticlă', Ceramic: 'Ceramică', Fabric: 'Țesătură', Stone: 'Piatră' },
      colours: 'Culori',
      coloursHelp:`,
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

await fs.writeFile(`${FILE}.materials.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
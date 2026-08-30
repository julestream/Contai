// Replaces the Drawing & Mixed Media category with Decorative Arts.
//
// That category was created days ago and no artist has used it, so nothing
// moves. Drawing and mixed-media works sit naturally under Prints &
// Graphics — both are works on paper — while glass, ceramics and objects
// had nowhere to go at all.
//
// The database value changes from 'Graphic Art' to 'Decorative Arts' in the
// same pass, so the stored value matches what the site says.
//
//   node scripts/decorative-arts.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── browse tile labels ─────────────────────────────────────
  {
    label: 'hu — browse label',
    from: `      graphicArt: 'RAJZ ÉS VEGYES TECHNIKA',`,
    to: `      graphicArt: 'IPARMŰVÉSZET',`,
  },
  {
    label: 'en — browse label',
    from: `      graphicArt: 'DRAWING & MIXED MEDIA',`,
    to: `      graphicArt: 'DECORATIVE ARTS',`,
  },
  {
    label: 'ro — browse label',
    from: `      graphicArt: 'DESEN ȘI TEHNICĂ MIXTĂ',`,
    to: `      graphicArt: 'ARTE DECORATIVE',`,
  },

  // ── upload type chips ──────────────────────────────────────
  {
    label: 'hu — upload type label',
    from: `'Graphic Art': 'Rajz és vegyes technika', Sculpture: 'Szobor' },`,
    to: `'Decorative Arts': 'Iparművészet', Sculpture: 'Szobor' },`,
  },
  {
    label: 'en — upload type label',
    from: `'Graphic Art': 'Drawing & Mixed Media', Sculpture: 'Sculpture' },`,
    to: `'Decorative Arts': 'Decorative Arts', Sculpture: 'Sculpture' },`,
  },
  {
    label: 'ro — upload type label',
    from: `'Graphic Art': 'Desen și tehnică mixtă', Sculpture: 'Sculptură' },`,
    to: `'Decorative Arts': 'Arte decorative', Sculpture: 'Sculptură' },`,
  },

  // ── what belongs in each: the two that change ──────────────
  {
    label: 'hu — typeHelp',
    from: `        Print: 'Szitanyomat, litográfia, rézkarc, linómetszet, plakát, számozott sorozat.',
        Photography: 'Analóg, digitális, archív nyomat, szignált sorozat.',
        'Graphic Art': 'Papíralapú művek, rajz, kollázs, textil, vegyes technika.',`,
    to: `        Print: 'Szitanyomat, litográfia, rézkarc, linómetszet, rajz, kollázs és egyéb papíralapú művek.',
        Photography: 'Analóg, digitális, archív nyomat, szignált sorozat.',
        'Decorative Arts': 'Üveg, kerámia, ékszer, textil és gyűjthető tárgyak. Használati és díszítő darabok, művészi igénnyel.',`,
  },
  {
    label: 'en — typeHelp',
    from: `        Print: 'Screenprints, lithographs, etchings, linocuts, posters, editions.',
        Photography: 'Analogue, digital, archival, signed editions.',
        'Graphic Art': 'Works on paper, drawing, collage, textile, mixed media.',`,
    to: `        Print: 'Screenprints, lithographs, etchings, linocuts, drawing, collage and other works on paper.',
        Photography: 'Analogue, digital, archival, signed editions.',
        'Decorative Arts': 'Glass, ceramics, jewellery, textile and collectible objects. Functional and decorative pieces made as art.',`,
  },
  {
    label: 'ro — typeHelp',
    from: `        Print: 'Serigrafie, litografie, acvaforte, linogravură, afișe, ediții numerotate.',
        Photography: 'Analogic, digital, tipar de arhivă, ediții semnate.',
        'Graphic Art': 'Lucrări pe hârtie, desen, colaj, textil, tehnică mixtă.',`,
    to: `        Print: 'Serigrafie, litografie, acvaforte, linogravură, desen, colaj și alte lucrări pe hârtie.',
        Photography: 'Analogic, digital, tipar de arhivă, ediții semnate.',
        'Decorative Arts': 'Sticlă, ceramică, bijuterii, textile și obiecte de colecție. Piese funcționale și decorative, făcute ca artă.',`,
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

await fs.writeFile(`${FILE}.decorative.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
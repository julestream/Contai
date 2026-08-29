// Renames the five browse categories and adds a one-line description of
// what belongs in each, shown to artists at upload.
//
// The filter VALUES in the database are unchanged — only the labels move.
// 'Graphic Art' now reads as Drawing & Mixed Media; 'Print' as Prints & Graphics.
//
// Safe to run twice.
//
//   node scripts/rename-categories.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── browse tile labels ─────────────────────────────────────
  {
    label: 'hu — browse labels',
    from: `      paintings: 'FESTMÉNYEK',
      sculptures: 'SZOBROK',
      graphicArt: 'GRAFIKA',
      photography: 'FOTÓ',
      prints: 'NYOMATOK',`,
    to: `      paintings: 'FESTMÉNY',
      sculptures: 'SZOBOR',
      graphicArt: 'RAJZ ÉS VEGYES TECHNIKA',
      photography: 'FOTÓ',
      prints: 'GRAFIKA ÉS NYOMAT',`,
  },
  {
    label: 'en — browse labels',
    from: `      paintings: 'PAINTINGS',
      sculptures: 'SCULPTURES',
      graphicArt: 'GRAPHIC ART',
      photography: 'PHOTOGRAPHY',
      prints: 'PRINTS',`,
    to: `      paintings: 'PAINTINGS',
      sculptures: 'SCULPTURE',
      graphicArt: 'DRAWING & MIXED MEDIA',
      photography: 'PHOTOGRAPHY',
      prints: 'PRINTS & GRAPHICS',`,
  },
  {
    label: 'ro — browse labels',
    from: `      paintings: 'PICTURĂ',
      sculptures: 'SCULPTURĂ',
      graphicArt: 'ARTĂ GRAFICĂ',
      photography: 'FOTOGRAFIE',
      prints: 'GRAVURĂ',`,
    to: `      paintings: 'PICTURĂ',
      sculptures: 'SCULPTURĂ',
      graphicArt: 'DESEN ȘI TEHNICĂ MIXTĂ',
      photography: 'FOTOGRAFIE',
      prints: 'GRAFICĂ ȘI GRAVURĂ',`,
  },

  // ── upload type chips + what belongs in each ───────────────
  {
    label: 'hu — upload type labels & help',
    from: `      typeLabels: { Painting: 'Festmény', Print: 'Nyomat', Photography: 'Fotó', 'Graphic Art': 'Grafika', Sculpture: 'Szobor' },`,
    to: `      typeLabels: { Painting: 'Festmény', Print: 'Grafika és nyomat', Photography: 'Fotó', 'Graphic Art': 'Rajz és vegyes technika', Sculpture: 'Szobor' },
      typeHelp: {
        Painting: 'Olaj, akril, akvarell, enkausztika, gouache.',
        Sculpture: 'Szabadon álló művek, falireliefek, kisplasztikák.',
        Print: 'Szitanyomat, litográfia, rézkarc, linómetszet, plakát, számozott sorozat.',
        Photography: 'Analóg, digitális, archív nyomat, szignált sorozat.',
        'Graphic Art': 'Papíralapú művek, rajz, kollázs, textil, vegyes technika.',
      },`,
  },
  {
    label: 'en — upload type labels & help',
    from: `      typeLabels: { Painting: 'Painting', Print: 'Print', Photography: 'Photography', 'Graphic Art': 'Graphic Art', Sculpture: 'Sculpture' },`,
    to: `      typeLabels: { Painting: 'Painting', Print: 'Prints & Graphics', Photography: 'Photography', 'Graphic Art': 'Drawing & Mixed Media', Sculpture: 'Sculpture' },
      typeHelp: {
        Painting: 'Oil, acrylic, watercolour, encaustic, gouache.',
        Sculpture: 'Freestanding work, wall reliefs, small objects.',
        Print: 'Screenprints, lithographs, etchings, linocuts, posters, editions.',
        Photography: 'Analogue, digital, archival, signed editions.',
        'Graphic Art': 'Works on paper, drawing, collage, textile, mixed media.',
      },`,
  },
  {
    label: 'ro — upload type labels & help',
    from: `      typeLabels: { Painting: 'Pictură', Print: 'Gravură', Photography: 'Fotografie', 'Graphic Art': 'Artă grafică', Sculpture: 'Sculptură' },`,
    to: `      typeLabels: { Painting: 'Pictură', Print: 'Grafică și gravură', Photography: 'Fotografie', 'Graphic Art': 'Desen și tehnică mixtă', Sculpture: 'Sculptură' },
      typeHelp: {
        Painting: 'Ulei, acrilic, acuarelă, encaustică, guașă.',
        Sculpture: 'Lucrări de sine stătătoare, reliefuri murale, obiecte mici.',
        Print: 'Serigrafie, litografie, acvaforte, linogravură, afișe, ediții numerotate.',
        Photography: 'Analogic, digital, tipar de arhivă, ediții semnate.',
        'Graphic Art': 'Lucrări pe hârtie, desen, colaj, textil, tehnică mixtă.',
      },`,
  },

  // ── filter panel uses the same type labels ─────────────────
  {
    label: 'hu — artType help line',
    from: `      artType: 'Műfaj',`,
    to: `      artType: 'Műfaj',
      artTypeHelp: 'Válaszd ki, hova tartozik a mű. Ez alapján találják meg a gyűjtők.',`,
  },
  {
    label: 'en — artType help line',
    from: `      artType: 'Art type',`,
    to: `      artType: 'Art type',
      artTypeHelp: 'Choose where the work belongs. This is how collectors find it.',`,
  },
  {
    label: 'ro — artType help line',
    from: `      artType: 'Gen artistic',`,
    to: `      artType: 'Gen artistic',
      artTypeHelp: 'Alege unde se încadrează lucrarea. Așa o găsesc colecționarii.',`,
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

await fs.writeFile(`${FILE}.rename.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)
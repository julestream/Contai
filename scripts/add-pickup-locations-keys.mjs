// One-off: adds a `pickupLocations` section to each of the three language
// blocks in dictionaries.ts. Verifies every anchor before writing, and
// refuses to run twice.
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'src/i18n/dictionaries.ts'
const src = readFileSync(FILE, 'utf8')

// Anchor on dashboardProfile's closing line — stable, and there are
// exactly three, one per language, in HU / EN / RO order.
const ANCHOR_HU = "      saveProfile: 'Profil mentése',\n    },"
const ANCHOR_EN = "      saveProfile: 'Save profile',\n    },"
const ANCHOR_RO = "      saveProfile: 'Salvează profilul',\n    },"

const BLOCK_HU = `
    pickupLocations: {
      title: 'Átvételi helyek',
      intro: 'Mentsd el az átvételi helyeidet, hogy feltöltéskor ne kelljen újra beírnod. A pontos cím privát marad.',
      addNew: 'Új hely hozzáadása',
      labelLabel: 'Elnevezés',
      labelPlaceholder: 'pl. Műterem, Otthon',
      setDefault: 'Legyen ez az alapértelmezett',
      defaultBadge: 'Alapértelmezett',
      save: 'Hely mentése',
      remove: 'Törlés',
      removeConfirm: 'Biztosan törlöd ezt a helyet?',
      empty: 'Még nincs mentett átvételi helyed.',
      privateNote: 'A pontos címet csak te látod. A vásárló akkor látja meg, amikor egyeztettétek a találkozó időpontját.',
      useSaved: 'Mentett hely használata',
      useSavedNone: 'Nincs mentett hely',
      manageLink: 'Átvételi helyek kezelése',
    },`

const BLOCK_EN = `
    pickupLocations: {
      title: 'Pickup locations',
      intro: 'Save your pickup locations so you do not have to type them in again with every listing. The exact address stays private.',
      addNew: 'Add a location',
      labelLabel: 'Name',
      labelPlaceholder: 'e.g. Studio, Home',
      setDefault: 'Make this my default',
      defaultBadge: 'Default',
      save: 'Save location',
      remove: 'Remove',
      removeConfirm: 'Remove this location?',
      empty: 'You have no saved pickup locations yet.',
      privateNote: 'Only you can see the exact address. The buyer sees it once you have agreed on a meeting time.',
      useSaved: 'Use a saved location',
      useSavedNone: 'No saved locations',
      manageLink: 'Manage pickup locations',
    },`

const BLOCK_RO = `
    pickupLocations: {
      title: 'Locuri de ridicare',
      intro: 'Salvează locurile de ridicare ca să nu le reintroduci la fiecare lucrare. Adresa exactă rămâne privată.',
      addNew: 'Adaugă un loc',
      labelLabel: 'Denumire',
      labelPlaceholder: 'ex. Atelier, Acasă',
      setDefault: 'Setează ca implicit',
      defaultBadge: 'Implicit',
      save: 'Salvează locul',
      remove: 'Șterge',
      removeConfirm: 'Ștergi acest loc?',
      empty: 'Nu ai încă locuri de ridicare salvate.',
      privateNote: 'Doar tu vezi adresa exactă. Cumpărătorul o vede după ce ați stabilit ora întâlnirii.',
      useSaved: 'Folosește un loc salvat',
      useSavedNone: 'Niciun loc salvat',
      manageLink: 'Gestionează locurile de ridicare',
    },`

const steps = [
  { name: 'HU', anchor: ANCHOR_HU, block: BLOCK_HU },
  { name: 'EN', anchor: ANCHOR_EN, block: BLOCK_EN },
  { name: 'RO', anchor: ANCHOR_RO, block: BLOCK_RO },
]

if (src.includes('pickupLocations: {')) {
  console.error('ABORT: dictionaries.ts already contains a pickupLocations section. Nothing written.')
  process.exit(1)
}

// Verify every anchor appears exactly once before changing anything.
for (const s of steps) {
  const count = src.split(s.anchor).length - 1
  if (count !== 1) {
    console.error(`ABORT: ${s.name} anchor matched ${count} times, expected exactly 1. Nothing written.`)
    process.exit(1)
  }
}

let out = src
for (const s of steps) {
  out = out.replace(s.anchor, s.anchor + s.block)
  console.log(`  ${s.name} block inserted`)
}

const added = (out.split('pickupLocations: {').length - 1)
if (added !== 3) {
  console.error(`ABORT: expected 3 inserted sections, found ${added}. Nothing written.`)
  process.exit(1)
}

writeFileSync(FILE, out, 'utf8')
console.log(`Done. dictionaries.ts: ${src.length} -> ${out.length} chars.`)
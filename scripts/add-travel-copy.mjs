// Adds the "artist will travel" copy in all three languages:
//   upload.travelsLabel / travelsHelp — the checkbox at upload
//   results.travellingBand           — the heading above the extra band
//   artwork.travelsBadge             — shown on the artwork page
//
// Safe to run twice: if the new key is already present, that edit is skipped.
//
//   node scripts/add-travel-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── upload checkbox ────────────────────────────────────────
  {
    key: 'travelsLabel',
    label: 'hu — upload.travels',
    from: `      inPerson: 'Személyesen',
      localDelivery: 'Helyi kiszállítás',
      colours: 'Színek',`,
    to: `      inPerson: 'Személyesen',
      localDelivery: 'Helyi kiszállítás',
      travelsLabel: 'Elutazom a vásárlóhoz',
      travelsHelp: 'A műved így más városokban és országokban élő vásárlóknak is megjelenik. Ha valaki távolabbról foglal, vállalod, hogy elutazol az átadásra, vagy találkoztok egy közösen egyeztetett helyen. A foglalási díjat a vásárló mindkét esetben kifizeti — csak akkor jelöld be, ha komolyan gondolod.',
      colours: 'Színek',`,
  },
  {
    key: 'travelsLabel',
    label: 'en — upload.travels',
    from: `      inPerson: 'In person',
      localDelivery: 'Local delivery',
      colours: 'Colours',`,
    to: `      inPerson: 'In person',
      localDelivery: 'Local delivery',
      travelsLabel: 'I\\'ll travel to meet a buyer',
      travelsHelp: 'Your work will also appear to buyers in other cities and countries. If someone reserves from further away, you agree to travel to hand it over, or to meet somewhere you both agree. The buyer pays the reservation fee either way, so only tick this if you mean it.',
      colours: 'Colours',`,
  },
  {
    key: 'travelsLabel',
    label: 'ro — upload.travels',
    from: `      inPerson: 'Personal',
      localDelivery: 'Livrare locală',
      colours: 'Culori',`,
    to: `      inPerson: 'Personal',
      localDelivery: 'Livrare locală',
      travelsLabel: 'Voi călători pentru a întâlni cumpărătorul',
      travelsHelp: 'Lucrarea ta va apărea și cumpărătorilor din alte orașe și țări. Dacă cineva rezervă de mai departe, te angajezi să călătorești pentru predare sau să vă întâlniți într-un loc stabilit de comun acord. Cumpărătorul plătește taxa de rezervare în ambele cazuri — bifează doar dacă chiar intenționezi.',
      colours: 'Culori',`,
  },

  // ── results band heading ───────────────────────────────────
  {
    key: 'travellingBand',
    label: 'hu — results.travellingBand',
    from: `      noMatch: 'Nincs a szűrőknek megfelelő mű.',`,
    to: `      noMatch: 'Nincs a szűrőknek megfelelő mű.',
      travellingBand: 'Művészek, akik elutaznak hozzád',
      travellingBandHelp: 'Ezek a művek máshol találhatók, de az alkotójuk vállalja az utazást az átadáshoz.',`,
  },
  {
    key: 'travellingBand',
    label: 'en — results.travellingBand',
    from: `      noMatch: 'No works match these filters.',`,
    to: `      noMatch: 'No works match these filters.',
      travellingBand: 'Artists who will travel to you',
      travellingBandHelp: 'These works are elsewhere, but the artist has agreed to travel for the handover.',`,
  },
  {
    key: 'travellingBand',
    label: 'ro — results.travellingBand',
    from: `      noMatch: 'Nicio lucrare nu corespunde acestor filtre.',`,
    to: `      noMatch: 'Nicio lucrare nu corespunde acestor filtre.',
      travellingBand: 'Artiști care vor călători la tine',
      travellingBandHelp: 'Aceste lucrări sunt în altă parte, dar artistul s-a angajat să călătorească pentru predare.',`,
  },

  // ── artwork page badge ─────────────────────────────────────
  {
    key: 'travelsBadge',
    label: 'hu — artwork.travelsBadge',
    from: `      pickupLocation: 'Átvétel helye',
      sold: 'Elkelt',`,
    to: `      pickupLocation: 'Átvétel helye',
      travelsBadge: 'A művész elutazik hozzád az átadásra',
      sold: 'Elkelt',`,
  },
  {
    key: 'travelsBadge',
    label: 'en — artwork.travelsBadge',
    from: `      pickupLocation: 'Pickup location',
      sold: 'Sold',`,
    to: `      pickupLocation: 'Pickup location',
      travelsBadge: 'This artist will travel to you for the handover',
      sold: 'Sold',`,
  },
  {
    key: 'travelsBadge',
    label: 'ro — artwork.travelsBadge',
    from: `      pickupLocation: 'Locul ridicării',
      sold: 'Vândut',`,
    to: `      pickupLocation: 'Locul ridicării',
      travelsBadge: 'Acest artist va călători la tine pentru predare',
      sold: 'Vândut',`,
  },
]

const original = await fs.readFile(FILE, 'utf8')

// Skip any edit whose new text is already in the file — so a second run
// is a no-op rather than a duplicate.
const pending = edits.filter(e => !original.includes(e.to))

if (pending.length === 0) {
  console.log('All copy already present. Nothing to do.')
  process.exit(0)
}

let ok = true
for (const edit of pending) {
  const count = original.split(edit.from).length - 1
  if (count === 1) {
    console.log(`  ok       ${edit.label}`)
  } else {
    console.log(`  FAILED   ${edit.label} — found ${count} matches, expected 1`)
    ok = false
  }
}

if (!ok) {
  console.log('')
  console.log('No changes written. The file is untouched.')
  process.exit(1)
}

let updated = original
for (const edit of pending) {
  updated = updated.replace(edit.from, edit.to)
}

await fs.writeFile(`${FILE}.travel.backup`, original)
await fs.writeFile(FILE, updated)

console.log('')
console.log(`Applied ${pending.length} insertions.`)
console.log(`Original saved as ${FILE}.travel.backup`)
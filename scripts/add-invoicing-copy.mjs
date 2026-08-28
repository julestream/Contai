// Adds two new pieces of copy, in all three languages:
//   reserve.invoicingNote  — who invoices what, shown at checkout
//   onboarding.bilingualNote — asking artists to write in English too
//
// Each insertion must match exactly once, or nothing is written at all.
//
//   node scripts/add-invoicing-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── reserve.invoicingNote ──────────────────────────────────
  {
    label: 'hu — reserve.invoicingNote',
    from: `      agreePolicy: 'A fizetéssel elfogadod a Contai foglalási szabályzatát. A díjat levonjuk a teljes árból.',`,
    to: `      agreePolicy: 'A fizetéssel elfogadod a Contai foglalási szabályzatát. A díjat levonjuk a teljes árból.',
      invoicingTitle: 'Két külön fizetés',
      invoicingNote: 'A foglalási díjról a CONTAIT KFT állít ki számlát — ezt most fizeted online. A fennmaradó összeg közvetlenül a művészé: azt személyesen fizeted, és arról a művész számláz neked.',`,
  },
  {
    label: 'en — reserve.invoicingNote',
    from: `      agreePolicy: 'By paying you agree to the Contai reservation policy. The fee is deducted from the total price.',`,
    to: `      agreePolicy: 'By paying you agree to the Contai reservation policy. The fee is deducted from the total price.',
      invoicingTitle: 'Two separate payments',
      invoicingNote: 'The reservation fee is invoiced by CONTAIT KFT — that is what you pay online now. The remaining balance goes directly to the artist: you pay it in person, and the artist invoices you for it.',`,
  },
  {
    label: 'ro — reserve.invoicingNote',
    from: `      agreePolicy: 'Plătind, accepți politica de rezervare Contai. Taxa se scade din prețul total.',`,
    to: `      agreePolicy: 'Plătind, accepți politica de rezervare Contai. Taxa se scade din prețul total.',
      invoicingTitle: 'Două plăți separate',
      invoicingNote: 'Taxa de rezervare este facturată de CONTAIT KFT — aceasta o plătești online acum. Restul sumei merge direct la artist: îl plătești personal, iar artistul îți emite factura pentru el.',`,
  },

  // ── onboarding.bilingualNote ───────────────────────────────
  {
    label: 'hu — onboarding.bilingualNote',
    from: `      confirmLabel: 'Alkotó kortárs művész vagyok, művészeti képzettséggel vagy önálló életművel.',`,
    to: `      bilingualNote: 'A Contai három nyelven működik. A bemutatkozásodat és az ars poeticádat nem fordítjuk le automatikusan — a saját szavaid maradnak. Írd meg őket a saját nyelveden és angolul is, hogy minden gyűjtő elolvashassa.',
      confirmLabel: 'Alkotó kortárs művész vagyok, művészeti képzettséggel vagy önálló életművel.',`,
  },
  {
    label: 'en — onboarding.bilingualNote',
    from: `      confirmLabel: 'I am a practising contemporary artist with formal training or a body of original work.',`,
    to: `      bilingualNote: 'Contai runs in three languages. We do not machine-translate your bio or artist statement — they stay in your own words. Please write them in your own language and in English, so every collector can read them.',
      confirmLabel: 'I am a practising contemporary artist with formal training or a body of original work.',`,
  },
  {
    label: 'ro — onboarding.bilingualNote',
    from: `      confirmLabel: 'Sunt un artist contemporan activ, cu formare artistică sau cu un corpus de lucrări originale.',`,
    to: `      bilingualNote: 'Contai funcționează în trei limbi. Nu îți traducem automat descrierea și declarația de artist — rămân în cuvintele tale. Te rugăm să le scrii în limba ta și în engleză, ca să le poată citi toți colecționarii.',
      confirmLabel: 'Sunt un artist contemporan activ, cu formare artistică sau cu un corpus de lucrări originale.',`,
  },
]

const original = await fs.readFile(FILE, 'utf8')

let ok = true
for (const edit of edits) {
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
for (const edit of edits) {
  updated = updated.replace(edit.from, edit.to)
}

await fs.writeFile(`${FILE}.backup`, original)
await fs.writeFile(FILE, updated)

console.log('')
console.log(`Applied ${edits.length} insertions.`)
console.log(`Original saved as ${FILE}.backup`)
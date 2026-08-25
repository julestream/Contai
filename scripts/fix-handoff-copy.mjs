// One-time copy fix for the post-payment handoff text, all three languages.
//
// Every replacement must match exactly once. If any of them matches zero
// times or more than once, nothing is written at all — so a partial edit
// across three language blocks is impossible.
//
//   node scripts/fix-handoff-copy.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  {
    label: 'hu — confirmedNotified',
    from: `      confirmedNotified: '{artist} értesítést kapott. Javasolj találkozási időpontot, amikor neked megfelel — amint mindketten megerősítitek, itt megjelenik az átvételi cím.',`,
    to: `      confirmedNotified: 'Értesítettük {artist} művészt. A következő lépés a találkozó: javasolj egy időpontot, ami neked megfelel — amint mindketten megerősítitek, itt megjelenik az átvételi cím.',`,
  },
  {
    label: 'hu — confirmedChoice',
    from: `      confirmedChoice: 'Csodálatos választás. Amikor találkoztok, kifizeted a fennmaradó összeget, és az alkalmazásban lévő kóddal erősítitek meg.',`,
    to: `      confirmedChoice: 'Amikor találkoztok, kifizeted a fennmaradó összeget, és az alkalmazásban lévő kóddal erősítitek meg az átvételt.',`,
  },
  {
    label: 'en — confirmedNotified',
    from: `      confirmedNotified: '{artist} has been notified. Propose a meeting time whenever suits you — once you have both confirmed, the pickup address appears here.',`,
    to: `      confirmedNotified: 'We have let {artist} know. Next comes the meeting: propose a time that suits you — once you have both confirmed, the pickup address appears here.',`,
  },
  {
    label: 'en — confirmedChoice',
    from: `      confirmedChoice: 'A beautiful choice. When you meet, you will pay the remaining balance and confirm with the code in your app.',`,
    to: `      confirmedChoice: 'When you meet, you pay the remaining balance and confirm the handover with the code in your app.',`,
  },
  {
    label: 'ro — confirmedNotified',
    from: `      confirmedNotified: '{artist} a fost anunțat. Propune o oră de întâlnire când îți convine — după ce amândoi confirmați, adresa de ridicare apare aici.',`,
    to: `      confirmedNotified: 'Am anunțat artistul {artist}. Urmează întâlnirea: propune o oră care îți convine — după ce amândoi confirmați, adresa de ridicare apare aici.',`,
  },
  {
    label: 'ro — confirmedChoice',
    from: `      confirmedChoice: 'O alegere frumoasă. Când vă întâlniți, plătești restul sumei și confirmi cu codul din aplicație.',`,
    to: `      confirmedChoice: 'Când vă întâlniți, plătești restul sumei și confirmi predarea cu codul din aplicație.',`,
  },
]

const original = await fs.readFile(FILE, 'utf8')

// First pass: check every edit matches exactly once. Nothing is changed yet.
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
  console.log('The text above may already have been edited, or differs slightly.')
  process.exit(1)
}

// Second pass: all six matched, so apply them.
let updated = original
for (const edit of edits) {
  updated = updated.replace(edit.from, edit.to)
}

// Keep a copy of the original next to the file, just in case.
await fs.writeFile(`${FILE}.backup`, original)
await fs.writeFile(FILE, updated)

console.log('')
console.log(`Applied ${edits.length} replacements.`)
console.log(`Original saved as ${FILE}.backup`)
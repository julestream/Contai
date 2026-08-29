// Corrects the Romanian home tagline.
//
// An earlier run of update-tagline.mjs applied the first Romanian wording
// before it was revised. This targets what is actually in the file now.
//
//   node scripts/fix-ro-tagline.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const FROM = `      tagline: 'În spatele fiecărei lucrări, o întâlnire.',`
const TO = `      tagline: 'Fiecare lucrare vine cu o întâlnire.',`

const original = await fs.readFile(FILE, 'utf8')

if (original.includes(TO)) {
  console.log('Already corrected. Nothing to do.')
  process.exit(0)
}

const count = original.split(FROM).length - 1

if (count !== 1) {
  console.log(`FAILED — found ${count} matches, expected 1.`)
  console.log('Nothing written. The lines currently in the file are:')
  for (const line of original.split('\n')) {
    if (line.includes('tagline:')) console.log('   ' + line.trim())
  }
  process.exit(1)
}

await fs.writeFile(`${FILE}.ro.backup`, original)
await fs.writeFile(FILE, original.replace(FROM, TO))
console.log('Applied. Romanian tagline corrected.')
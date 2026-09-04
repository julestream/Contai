// English tagline: 'work' alone reads as labour rather than artwork.
// Hungarian and Romanian already say it clearly and are left alone.
//
//   node scripts/tagline-v3.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const FROM = `      tagline: 'Every work is a meeting.',`
const TO = `      tagline: 'Every piece of art is a meeting.',`

const original = await fs.readFile(FILE, 'utf8')

if (original.includes(TO)) {
  console.log('Already applied. Nothing to do.')
  process.exit(0)
}

const count = original.split(FROM).length - 1
if (count !== 1) {
  console.log(`FAILED — found ${count} matches, expected 1.`)
  console.log('Nothing written. Current tagline lines:')
  for (const line of original.split('\n')) {
    if (line.includes('tagline:')) console.log('   ' + line.trim())
  }
  process.exit(1)
}

await fs.writeFile(`${FILE}.tagline3.backup`, original)
await fs.writeFile(FILE, original.replace(FROM, TO))
console.log('Applied.')
// Removes duplicated dictionary lines left by running an insert script twice.
//
// For each key, keeps the first occurrence in each language block and
// deletes any immediately-repeated identical line.
//
//   node scripts/fix-duplicate-keys.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const original = await fs.readFile(FILE, 'utf8')
const lines = original.split('\n')

const out = []
let removed = 0

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const prev = out[out.length - 1]

  // Two identical adjacent non-empty lines: drop the second.
  if (prev !== undefined && line === prev && line.trim() !== '') {
    removed++
    continue
  }

  out.push(line)
}

if (removed === 0) {
  console.log('No duplicate lines found. File untouched.')
  process.exit(0)
}

await fs.writeFile(`${FILE}.dupfix.backup`, original)
await fs.writeFile(FILE, out.join('\n'))

console.log(`Removed ${removed} duplicated line(s).`)
console.log(`Backup saved as ${FILE}.dupfix.backup`)
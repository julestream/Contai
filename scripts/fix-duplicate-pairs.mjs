// Removes a duplicated two-line pair. The earlier fix only caught
// adjacent identical lines, so an A,B,A,B repeat slipped through.
//
// Deletes the second copy wherever lines i and i+2 are identical
// and lines i+1 and i+3 are identical — i.e. a repeated pair.
//
//   node scripts/fix-duplicate-pairs.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const original = await fs.readFile(FILE, 'utf8')
const lines = original.split('\n')

const out = []
let removed = 0
let i = 0

while (i < lines.length) {
  const a = lines[i]
  const b = lines[i + 1]
  const c = lines[i + 2]
  const d = lines[i + 3]

  const isPairRepeat =
    b !== undefined && c !== undefined && d !== undefined &&
    a.trim() !== '' && b.trim() !== '' &&
    a === c && b === d

  out.push(a)

  if (isPairRepeat) {
    // Keep a and b, skip the repeated c and d.
    out.push(b)
    i += 4
    removed += 2
    continue
  }

  i += 1
}

if (removed === 0) {
  console.log('No duplicated pairs found. File untouched.')
  process.exit(0)
}

await fs.writeFile(`${FILE}.pairfix.backup`, original)
await fs.writeFile(FILE, out.join('\n'))

console.log(`Removed ${removed} duplicated line(s).`)
console.log(`Backup saved as ${FILE}.pairfix.backup`)
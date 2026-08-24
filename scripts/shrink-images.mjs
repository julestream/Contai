// One-time cleanup: shrink images already sitting in Supabase Storage.
//
// Files are overwritten at their existing paths, so every public URL stays
// exactly the same and nothing in the database needs updating.
//
// Originals are copied to ./image-backup/ before anything is overwritten.
//
// Talks to the Storage REST API directly with fetch — the supabase-js client
// pulls in a websocket layer that Node 20 can't provide, and we don't need it.
//
//   node scripts/shrink-images.mjs --dry    <- look, change nothing
//   node scripts/shrink-images.mjs          <- actually do it

import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'

const BUCKET = 'artwork-images'
const DRY_RUN = process.argv.includes('--dry')

// Anything already under this is left alone.
const SKIP_BELOW_BYTES = 500 * 1024

// Longest edge, by top-level folder.
const MAX_DIM = { artworks: 1600, avatars: 400 }
const QUALITY = { artworks: 82, avatars: 85 }

// --- read credentials out of .env.local -------------------------------------

async function loadEnv() {
  const raw = await fs.readFile('.env.local', 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const env = await loadEnv()
const BASE = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
const KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!BASE || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const authHeaders = {
  Authorization: `Bearer ${KEY}`,
  apikey: KEY,
}

// --- storage helpers ---------------------------------------------------------

async function listFolder(prefix, limit, offset) {
  const res = await fetch(`${BASE}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prefix,
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    }),
  })
  if (!res.ok) throw new Error(`list "${prefix}" failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function listAll(prefix = '') {
  const found = []
  let offset = 0

  while (true) {
    const batch = await listFolder(prefix, 100, offset)
    if (!Array.isArray(batch) || batch.length === 0) break

    for (const entry of batch) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name
      // Folders come back with a null id.
      if (entry.id === null || entry.id === undefined) {
        found.push(...(await listAll(full)))
      } else {
        found.push({ path: full, size: entry.metadata?.size ?? 0 })
      }
    }

    if (batch.length < 100) break
    offset += 100
  }

  return found
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/')
}

async function download(objectPath) {
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${encodePath(objectPath)}`, {
    headers: authHeaders,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

async function overwrite(objectPath, buffer) {
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${encodePath(objectPath)}`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'image/jpeg',
      'cache-control': 'max-age=31536000',
      'x-upsert': 'true',
    },
    body: buffer,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`
}

// --- main --------------------------------------------------------------------

console.log(DRY_RUN ? 'DRY RUN — nothing will be changed\n' : 'Shrinking images\n')

const files = await listAll()
const images = files.filter(f => /\.(jpe?g|png|webp|heic|heif)$/i.test(f.path))

images.sort((a, b) => b.size - a.size)

console.log(`Found ${images.length} images in ${BUCKET}`)
console.log(`Largest: ${images[0] ? kb(images[0].size) : 'n/a'}`)
console.log(`Total:   ${kb(images.reduce((sum, f) => sum + f.size, 0))}\n`)

let savedBytes = 0
let changed = 0
let skipped = 0

for (const file of images) {
  const folder = file.path.split('/')[0]
  const maxDim = MAX_DIM[folder] ?? 1600
  const quality = QUALITY[folder] ?? 82

  if (file.size < SKIP_BELOW_BYTES) {
    skipped++
    continue
  }

  if (DRY_RUN) {
    console.log(`would shrink  ${kb(file.size).padStart(9)}  ${file.path}`)
    continue
  }

  let original
  try {
    original = await download(file.path)
  } catch (e) {
    console.log(`SKIP (download failed) ${file.path}: ${e.message}`)
    skipped++
    continue
  }

  // Back it up locally before we touch anything.
  const backupPath = path.join('image-backup', file.path)
  await fs.mkdir(path.dirname(backupPath), { recursive: true })
  await fs.writeFile(backupPath, original)

  // `rotate()` with no argument applies EXIF orientation, so portrait
  // phone photos don't come out sideways.
  let resized
  try {
    resized = await sharp(original)
      .rotate()
      .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()
  } catch (e) {
    console.log(`SKIP (could not process) ${file.path}: ${e.message}`)
    skipped++
    continue
  }

  if (resized.length >= original.length) {
    console.log(`SKIP (no gain) ${file.path}`)
    skipped++
    continue
  }

  try {
    await overwrite(file.path, resized)
  } catch (e) {
    console.log(`FAILED ${file.path}: ${e.message}`)
    continue
  }

  savedBytes += original.length - resized.length
  changed++
  console.log(`${kb(original.length).padStart(9)} -> ${kb(resized.length).padStart(9)}  ${file.path}`)
}

console.log('')
if (DRY_RUN) {
  console.log('Dry run complete. Re-run without --dry to apply.')
} else {
  console.log(`Shrunk ${changed} files, skipped ${skipped}, saved ${kb(savedBytes)}.`)
  console.log('Originals are in ./image-backup/')
}
// Finds files in Storage that no artwork or profile points at.
//
// Two passes, and it errs heavily on the side of keeping things:
//   - every URL in artworks.images is treated as in use, whatever the status
//   - every profiles.avatar_url is treated as in use
//   - anything uploaded in the last 24 hours is left alone, since it may
//     belong to an upload still in progress right now
//
//   node scripts/find-orphans.mjs            <- list only, deletes nothing
//   node scripts/find-orphans.mjs --delete   <- actually delete
//
// Files are downloaded to ./orphan-backup/ before any deletion.

import fs from 'node:fs/promises'
import path from 'node:path'

const BUCKET = 'artwork-images'
const DO_DELETE = process.argv.includes('--delete')
const GRACE_HOURS = 24

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

const authHeaders = { Authorization: `Bearer ${KEY}`, apikey: KEY }

// --- storage -----------------------------------------------------------------

async function listFolder(prefix, limit, offset) {
  const res = await fetch(`${BASE}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit, offset, sortBy: { column: 'name', order: 'asc' } }),
  })
  if (!res.ok) throw new Error(`list "${prefix}": ${res.status} ${await res.text()}`)
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
      if (entry.id === null || entry.id === undefined) {
        found.push(...(await listAll(full)))
      } else {
        found.push({
          path: full,
          size: entry.metadata?.size ?? 0,
          createdAt: entry.created_at || entry.updated_at || null,
        })
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
  if (!res.ok) throw new Error(`${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function remove(paths) {
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: paths }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
}

// --- database ----------------------------------------------------------------

async function selectRows(table, columns) {
  const res = await fetch(`${BASE}/rest/v1/${table}?select=${columns}`, {
    headers: authHeaders,
  })
  if (!res.ok) throw new Error(`select ${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

// A public URL looks like:
//   https://<ref>.supabase.co/storage/v1/object/public/artwork-images/<path>
function urlToPath(url) {
  if (typeof url !== 'string') return null
  const marker = `/object/public/${BUCKET}/`
  const at = url.indexOf(marker)
  if (at === -1) return null
  return decodeURIComponent(url.slice(at + marker.length).split('?')[0])
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`
}

function ageDays(iso) {
  if (!iso) return null
  return (Date.now() - new Date(iso).getTime()) / 86400000
}

// --- main --------------------------------------------------------------------

const artworks = await selectRows('artworks', 'id,title,status,images')
const profiles = await selectRows('profiles', 'id,avatar_url')

const inUse = new Set()

for (const row of artworks) {
  const list = Array.isArray(row.images) ? row.images : []
  for (const url of list) {
    const p = urlToPath(url)
    if (p) inUse.add(p)
  }
}

for (const row of profiles) {
  const p = urlToPath(row.avatar_url)
  if (p) inUse.add(p)
}

const files = await listAll()

const orphans = []
const recent = []

for (const file of files) {
  if (inUse.has(file.path)) continue
  const age = ageDays(file.createdAt)
  if (age !== null && age * 24 < GRACE_HOURS) {
    recent.push(file)
  } else {
    orphans.push(file)
  }
}

orphans.sort((a, b) => b.size - a.size)

console.log(`Artworks:     ${artworks.length}`)
console.log(`Profiles:     ${profiles.length}`)
console.log(`Referenced:   ${inUse.size} files`)
console.log(`In storage:   ${files.length} files`)
console.log(`Orphans:      ${orphans.length} files, ${kb(orphans.reduce((s, f) => s + f.size, 0))}`)
if (recent.length) {
  console.log(`Held back:    ${recent.length} uploaded in the last ${GRACE_HOURS}h`)
}
console.log('')

// Warn loudly if something looks wrong — a referenced file that isn't
// in storage means a listing is showing a broken image.
const missing = [...inUse].filter(p => !files.some(f => f.path === p))
if (missing.length) {
  console.log(`WARNING: ${missing.length} referenced file(s) are NOT in storage:`)
  for (const m of missing) console.log(`  ${m}`)
  console.log('')
}

if (orphans.length === 0) {
  console.log('Nothing to clean up.')
  process.exit(0)
}

for (const file of orphans) {
  const age = ageDays(file.createdAt)
  const when = age === null ? '   ?' : `${age.toFixed(0).padStart(4)}d`
  console.log(`${kb(file.size).padStart(9)}  ${when}  ${file.path}`)
}
console.log('')

if (!DO_DELETE) {
  console.log('Listing only — nothing was deleted.')
  console.log('Re-run with --delete to remove these (backed up first).')
  process.exit(0)
}

console.log('Backing up before deleting...')
for (const file of orphans) {
  try {
    const buf = await download(file.path)
    const dest = path.join('orphan-backup', file.path)
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, buf)
  } catch (e) {
    console.log(`Could not back up ${file.path} (${e.message}) — skipping deletion of this one.`)
    file.skip = true
  }
}

const toDelete = orphans.filter(f => !f.skip).map(f => f.path)

// Delete in batches so one huge request doesn't fail.
for (let i = 0; i < toDelete.length; i += 20) {
  const batch = toDelete.slice(i, i + 20)
  await remove(batch)
  console.log(`Deleted ${Math.min(i + batch.length, toDelete.length)}/${toDelete.length}`)
}

console.log('')
console.log(`Removed ${toDelete.length} orphaned files.`)
console.log('Backups are in ./orphan-backup/')
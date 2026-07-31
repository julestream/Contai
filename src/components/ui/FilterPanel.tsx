'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const MEDIUM_GROUPS: { type: string; mediums: string[] }[] = [
  { type: 'Painting', mediums: ['Oil', 'Acrylic', 'Watercolour', 'Gouache', 'Tempera', 'Fresco', 'Encaustic', 'Pastel', 'Enamel'] },
  { type: 'Sculpture', mediums: ['Bronze', 'Marble', 'Wood', 'Stone', 'Ceramic', 'Clay', 'Resin', 'Glass', 'Metal', 'Plaster', 'Textile', 'Mixed Media'] },
  { type: 'Graphic Art', mediums: ['Pencil', 'Charcoal', 'Ink', 'Marker', 'Pastel', 'Chalk', 'Digital', 'Mixed Media'] },
  { type: 'Photography', mediums: ['Analogue', 'Digital', 'Darkroom Print', 'Instant Film', 'Long Exposure'] },
  { type: 'Print', mediums: ['Lithograph', 'Screen Print', 'Etching', 'Linocut', 'Woodcut', 'Risograph', 'Giclee', 'Monotype'] },
]

const COLOURS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White', 'Grey', 'Gold']
const MATERIALS = ['Canvas', 'Paper', 'Wood', 'Metal', 'Glass', 'Ceramic', 'Fabric', 'Stone']
const MOODS = ['Inspiration', 'Harmony', 'Intrigue', 'Joy', 'Self-reflection']
const SIZES = ['Small', 'Medium', 'Large', 'Extra Large']
const BADGES = [
  { value: 'verified_artist', label: 'Verified Artist' },
  { value: 'established_artist', label: 'Established Artist' },
  { value: 'curator_approved', label: 'Curator Pick' },
]

const COUNTRIES = ['Hungary', 'Romania']
const CITIES: Record<string, string[]> = {
  Hungary: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Other'],
  Romania: ['Bucharest (București)', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Oradea', 'Sibiu', 'Târgu Mureș', 'Other'],
}

function parseList(v: string | null): string[] {
  if (!v) return []
  return v.split(',').filter(Boolean)
}

export default function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const [types, setTypes] = useState<string[]>(parseList(searchParams.get('type')))
  const [mediums, setMediums] = useState<string[]>(parseList(searchParams.get('medium')))
  const [moods, setMoods] = useState<string[]>(parseList(searchParams.get('mood')))
  const [colours, setColours] = useState<string[]>(parseList(searchParams.get('colour')))
  const [materials, setMaterials] = useState<string[]>(parseList(searchParams.get('material')))
  const [sizes, setSizes] = useState<string[]>(parseList(searchParams.get('size')))
  const [badges, setBadges] = useState<string[]>(parseList(searchParams.get('badge')))
  const [framed, setFramed] = useState(searchParams.get('framed') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [country, setCountry] = useState(searchParams.get('country') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    if (list.includes(value)) setList(list.filter(v => v !== value))
    else setList([...list, value])
  }

  function apply() {
    const params = new URLSearchParams()
    if (searchParams.get('q')) params.set('q', searchParams.get('q')!)
    if (types.length) params.set('type', types.join(','))
    if (mediums.length) params.set('medium', mediums.join(','))
    if (moods.length) params.set('mood', moods.join(','))
    if (colours.length) params.set('colour', colours.join(','))
    if (materials.length) params.set('material', materials.join(','))
    if (sizes.length) params.set('size', sizes.join(','))
    if (badges.length) params.set('badge', badges.join(','))
    if (framed) params.set('framed', framed)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    if (country) params.set('country', country)
    if (city) params.set('city', city)
    router.push(`/browse/results?${params.toString()}`)
    setOpen(false)
  }

  function clearAll() {
    setTypes([]); setMediums([]); setMoods([]); setColours([]); setMaterials([])
    setSizes([]); setBadges([]); setFramed(''); setMinPrice(''); setMaxPrice(''); setCountry(''); setCity('')
    const params = new URLSearchParams()
    if (searchParams.get('q')) params.set('q', searchParams.get('q')!)
    router.push(`/browse/results?${params.toString()}`)
    setOpen(false)
  }

  const activeCount =
    types.length + mediums.length + moods.length + colours.length +
    materials.length + sizes.length + badges.length +
    (framed ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + (country || city ? 1 : 0)

  const chip = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: '999px', fontSize: '12.5px', cursor: 'pointer',
    border: active ? '1.5px solid #0a0a0a' : '1px solid #e0dcd3',
    background: active ? '#0a0a0a' : '#fff', color: active ? '#fff' : '#0a0a0a',
    whiteSpace: 'nowrap',
  })

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#999', marginBottom: '8px', marginTop: '20px',
  }

  const groupLabel: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px', marginTop: '12px',
  }

  const input: React.CSSProperties = {
    padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0dcd3',
    fontSize: '14px', color: '#0a0a0a', background: '#fafafa', outline: 'none', width: '100%',
  }

  return (
    <div style={{ padding: '8px 1rem 4px' }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '999px', border: '1px solid #0a0a0a',
          background: '#fff', color: '#0a0a0a', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
        }}
      >
        Filters {activeCount > 0 && `(${activeCount})`}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px 20px 0 0', maxWidth: '430px',
              margin: '0 auto', width: '100%', maxHeight: '85vh', overflowY: 'auto',
              padding: '1.25rem 1.25rem 6rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', paddingBottom: '8px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px' }}>Filters</h2>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: '#999' }}>×</button>
            </div>

            {/* Medium grouped by type */}
            <div style={sectionLabel}>Type & Medium</div>
            {MEDIUM_GROUPS.map(g => (
              <div key={g.type}>
                <div
                  style={{ ...groupLabel, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => toggle(types, setTypes, g.type)}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: '4px', flexShrink: 0,
                    border: types.includes(g.type) ? '1.5px solid #0a0a0a' : '1px solid #ccc',
                    background: types.includes(g.type) ? '#0a0a0a' : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '11px',
                  }}>{types.includes(g.type) ? '✓' : ''}</span>
                  {g.type}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {g.mediums.map(m => (
                    <span key={`${g.type}-${m}`} style={chip(mediums.includes(m))} onClick={() => toggle(mediums, setMediums, m)}>{m}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Mood */}
            <div style={sectionLabel}>Mood</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {MOODS.map(m => <span key={m} style={chip(moods.includes(m))} onClick={() => toggle(moods, setMoods, m)}>{m}</span>)}
            </div>

            {/* Colour */}
            <div style={sectionLabel}>Colour</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {COLOURS.map(c => <span key={c} style={chip(colours.includes(c))} onClick={() => toggle(colours, setColours, c)}>{c}</span>)}
            </div>

            {/* Material */}
            <div style={sectionLabel}>Material</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {MATERIALS.map(m => <span key={m} style={chip(materials.includes(m))} onClick={() => toggle(materials, setMaterials, m)}>{m}</span>)}
            </div>

            {/* Size */}
            <div style={sectionLabel}>Size</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SIZES.map(s => <span key={s} style={chip(sizes.includes(s))} onClick={() => toggle(sizes, setSizes, s)}>{s}</span>)}
            </div>

            {/* Artist */}
            <div style={sectionLabel}>Artist</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {BADGES.map(b => <span key={b.value} style={chip(badges.includes(b.value))} onClick={() => toggle(badges, setBadges, b.value)}>{b.label}</span>)}
            </div>

            {/* Framed */}
            <div style={sectionLabel}>Framed</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={chip(framed === 'true')} onClick={() => setFramed(framed === 'true' ? '' : 'true')}>Framed</span>
              <span style={chip(framed === 'false')} onClick={() => setFramed(framed === 'false' ? '' : 'false')}>Unframed</span>
            </div>

            {/* Price */}
            <div style={sectionLabel}>Price (Ft)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={input} />
              <span style={{ color: '#999' }}>-</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={input} />
            </div>

            {/* Location */}
            <div style={sectionLabel}>Location</div>
            <select value={country} onChange={e => { setCountry(e.target.value); setCity('') }} style={{ ...input, marginBottom: '8px' }}>
              <option value="">Any country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {country && (
              <select value={city} onChange={e => setCity(e.target.value)} style={input}>
                <option value="">Any city</option>
                {CITIES[country]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '28px', position: 'sticky', bottom: 0, background: '#fff', paddingTop: '12px' }}>
              <button onClick={clearAll} style={{
                flex: 1, padding: '12px', borderRadius: '999px', border: '1px solid #e0dcd3',
                background: '#fff', color: '#0a0a0a', fontSize: '14px', cursor: 'pointer',
              }}>Clear all</button>
              <button onClick={apply} style={{
                flex: 2, padding: '12px', borderRadius: '999px', border: 'none',
                background: '#0a0a0a', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 500,
              }}>Show results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
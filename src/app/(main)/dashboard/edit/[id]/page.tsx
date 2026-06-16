'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Gouache', 'Ink', 'Pastel', 'Charcoal', 'Pencil', 'Mixed Media', 'Digital', 'Photography', 'Other']

export default function EditArtworkPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)

  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [price, setPrice] = useState('')
  const [pickupArea, setPickupArea] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }

      const { data: art } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!art) { setError('Artwork not found.'); setLoading(false); return }
      if (art.artist_id !== session.user.id) { setDenied(true); setLoading(false); return }

      setTitle(art.title || '')
      setMedium(art.medium || '')
      setYear(art.year ? String(art.year) : '')
      setWidth(art.width_cm ? String(art.width_cm) : '')
      setHeight(art.height_cm ? String(art.height_cm) : '')
      setPrice(art.price_huf ? String(art.price_huf) : '')
      setPickupArea(art.pickup_area || '')
      setLoading(false)
    }
    load()
  }, [params.id, router])

  async function handleSave() {
    setError('')
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!price || parseFloat(price) <= 0) { setError('Please enter a valid price.'); return }
    setSaving(true)
    setSaved(false)

    const supabase = createClient()
    const priceNum = parseFloat(price)
    const { error: updErr } = await supabase.from('artworks').update({
      title,
      medium,
      year: year ? parseInt(year) : null,
      width_cm: width ? parseFloat(width) : null,
      height_cm: height ? parseFloat(height) : null,
      price_huf: priceNum,
      reservation_fee_huf: Math.round(priceNum * 0.08),
      pickup_area: pickupArea,
    }).eq('id', params.id)

    if (updErr) { setError(updErr.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '8px', border: '1px solid #e0dcd3',
    fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'var(--font-instrument), sans-serif',
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>Loading...</div>
  if (denied) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>You can only edit your own artwork. <Link href="/dashboard">Back to dashboard</Link></div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <Link href="/dashboard" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Back to dashboard</Link>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', margin: '1rem 0 1.5rem' }}>Edit artwork</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Price (HUF)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} inputMode="numeric" />
          {price && parseFloat(price) > 0 && (
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              Reservation fee (8%): {Math.round(parseFloat(price) * 0.08).toLocaleString()} HUF
            </p>
          )}
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Medium</label>
          <select value={medium} onChange={e => setMedium(e.target.value)} style={inputStyle}>
            <option value="">Select medium</option>
            {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Year</label>
          <input value={year} onChange={e => setYear(e.target.value)} style={inputStyle} inputMode="numeric" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Width (cm)</label>
            <input value={width} onChange={e => setWidth(e.target.value)} style={inputStyle} inputMode="numeric" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Height (cm)</label>
            <input value={height} onChange={e => setHeight(e.target.value)} style={inputStyle} inputMode="numeric" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Pickup area</label>
          <input value={pickupArea} onChange={e => setPickupArea(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
      {saved && <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '1rem' }}>Saved</p>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', marginTop: '1.5rem', padding: '15px', borderRadius: '999px', border: 'none',
        background: '#0a0a0a', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>

      <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
        Changes go live immediately. No re-review needed.
      </p>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteArtwork } from './deleteArtwork'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Gouache', 'Ink', 'Pastel', 'Charcoal', 'Pencil', 'Mixed Media', 'Digital', 'Photography', 'Other']

export default function EditArtworkPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)

  const [title, setTitle] = useState('')
  const [artistName, setArtistName] = useState('')
  const [description, setDescription] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [price, setPrice] = useState('')
  const [pickupArea, setPickupArea] = useState('')
  const [signed, setSigned] = useState(false)
  const [status, setStatus] = useState('')

  const [hiding, setHiding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      setArtistName(art.artist_name || '')
      setDescription(art.description || '')
      setMedium(art.medium || '')
      setYear(art.year ? String(art.year) : '')
      setWidth(art.width_cm ? String(art.width_cm) : '')
      setHeight(art.height_cm ? String(art.height_cm) : '')
      setPrice(art.price_huf ? String(art.price_huf) : '')
      setPickupArea(art.pickup_area || '')
      setSigned(!!art.signed)
      setStatus(art.status || '')
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
      artist_name: artistName.trim() || null,
      description: description.trim() || null,
      medium,
      year: year ? parseInt(year) : null,
      width_cm: width ? parseFloat(width) : null,
      height_cm: height ? parseFloat(height) : null,
      price_huf: priceNum,
      reservation_fee_huf: Math.round(priceNum * 0.08),
      pickup_area: pickupArea,
      signed,
    }).eq('id', params.id)

    if (updErr) { setError(updErr.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    router.push('/dashboard')
  }

  async function handleToggleHide() {
    setError('')
    setHiding(true)
    const supabase = createClient()
    const next = status === 'hidden' ? 'live' : 'hidden'
    const { error: hideErr } = await supabase.from('artworks').update({ status: next }).eq('id', params.id)
    if (hideErr) { setError(hideErr.message); setHiding(false); return }
    setStatus(next)
    setHiding(false)
    router.push('/dashboard')
  }

  async function handleDelete() {
    setError('')
    setDeleting(true)
    const result = await deleteArtwork(params.id)
    if (!result.ok) { setError(result.error || 'Could not delete.'); setDeleting(false); return }
    router.push('/dashboard')
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '8px', border: '1px solid #e0dcd3',
    fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'var(--font-instrument), sans-serif',
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>Loading...</div>
  if (denied) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>You can only edit your own artwork. <Link href="/dashboard">Back to dashboard</Link></div>

  const isHidden = status === 'hidden'

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <Link href="/dashboard" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Back to dashboard</Link>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', margin: '1rem 0 1.5rem' }}>Edit artwork</h1>

      {isHidden && (
        <div style={{ padding: '10px 14px', background: '#f5f3ef', borderRadius: '10px', marginBottom: '1rem', fontSize: '13px', color: '#8a857c' }}>
          This artwork is currently hidden. Buyers can't see it until you unhide it.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Artist name (optional)</label>
          <input value={artistName} onChange={e => setArtistName(e.target.value)} style={inputStyle} placeholder="Leave blank if this is your own work" />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 2000))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell buyers about this piece…" />
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right' }}>{description.length}/2000</p>
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={signed} onChange={e => setSigned(e.target.checked)} />
          <span style={{ fontSize: '15px', color: '#0a0a0a' }}>Signed by the artist</span>
        </label>
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

      {/* Hide / Unhide */}
      <button onClick={handleToggleHide} disabled={hiding} style={{
        width: '100%', marginTop: '2rem', padding: '14px', borderRadius: '999px',
        border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a',
        fontSize: '15px', fontWeight: 500, cursor: 'pointer', opacity: hiding ? 0.6 : 1,
      }}>
        {hiding ? 'Updating...' : isHidden ? 'Unhide — make visible again' : 'Hide from buyers'}
      </button>
      <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '8px' }}>
        Hiding keeps the artwork but removes it from the marketplace. You can unhide anytime.
      </p>

      {/* Delete */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{
            width: '100%', padding: '14px', borderRadius: '999px',
            border: '1px solid #e0c4c4', background: '#fff', color: '#b94040',
            fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          }}>
            Delete this artwork
          </button>
        ) : (
          <div style={{ padding: '1rem', border: '1px solid #e0c4c4', borderRadius: '12px', background: '#fdf6f6' }}>
            <p style={{ fontSize: '14px', color: '#b94040', fontWeight: 600, marginBottom: '4px' }}>Delete permanently?</p>
            <p style={{ fontSize: '13px', color: '#8a6060', lineHeight: 1.5, marginBottom: '14px' }}>
              This removes the artwork for good. If it has past offers or reservations, those records are kept and the piece is archived instead. This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '12px', borderRadius: '999px', border: 'none',
                background: '#b94040', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: deleting ? 0.6 : 1,
              }}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} style={{
                flex: 1, padding: '12px', borderRadius: '999px', border: '1px solid #e0dcd3',
                background: '#fff', color: '#0a0a0a', fontSize: '14px', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
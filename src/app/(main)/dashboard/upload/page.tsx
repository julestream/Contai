'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']
const TYPES = ['Painting', 'Print', 'Photography', 'Graphic Art', 'Sculpture']
const MOODS = ['Joy', 'Harmony', 'Self-reflection', 'Inspiration', 'Intrigue']
const STYLES = ['Abstract', 'Figurative', 'Landscape', 'Portrait', 'Still Life', 'Minimalist', 'Expressionist', 'Geometric', 'Surrealist', 'Street Art']
const COLOURS = [
  { name: 'Black', hex: '#0a0a0a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Beige', hex: '#e7dcc8' },
  { name: 'Brown', hex: '#8b5e34' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Navy', hex: '#1e293b' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Gold', hex: '#c8a24a' },
  { name: 'Silver', hex: '#c0c5cc' },
]

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [hasId, setHasId] = useState<boolean | null>(null)

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [title, setTitle] = useState('')
  const [typeOfArt, setTypeOfArt] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [framed, setFramed] = useState(false)
  const [originalOrPrint, setOriginalOrPrint] = useState<'original' | 'print'>('original')

  const [price, setPrice] = useState('')

  const [pickupArea, setPickupArea] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupMethod, setPickupMethod] = useState<'in_person' | 'local_delivery'>('in_person')

  const [colours, setColours] = useState<string[]>([])
  const [multicolour, setMulticolour] = useState(false)
  const [mood, setMood] = useState<string[]>([])
  const [style, setStyle] = useState('')

  const reservationFee = price ? Math.max(500, Math.round(parseFloat(price) * 0.08)) : 0

  useEffect(() => {
    async function checkId() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setHasId(false); return }
      const { data } = await supabase
        .from('verification_documents')
        .select('id')
        .eq('profile_id', session.user.id)
        .eq('document_type', 'id')
        .limit(1)
      setHasId(!!(data && data.length > 0))
    }
    checkId()
  }, [])

  function toggleColour(name: string) {
    setColours(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name])
  }

  function next() {
    setError('')
    if (step === 1 && images.length === 0) { setError('Please add at least one photo.'); return }
    if (step === 2) {
      if (!title.trim()) { setError('Please enter a title.'); return }
      if (!typeOfArt) { setError('Please choose an art type.'); return }
      if (!medium) { setError('Please choose a medium.'); return }
      if (!width.trim() || !height.trim()) { setError('Please enter width and height.'); return }
    }
    if (step === 3 && (!price.trim() || isNaN(parseFloat(price)))) { setError('Please enter a price.'); return }
    if (step === 4 && (!pickupArea.trim() || !pickupAddress.trim())) { setError('Please enter both the pickup area and the exact address.'); return }
    setStep(s => s + 1)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('You are not signed in. Please sign in again, then retry.'); setUploading(false); return }

    const newImages: string[] = []
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `artworks/${session.user.id}/${Date.now()}-${safeName}`
      const { error: upErr } = await supabase.storage.from('artwork-images').upload(path, file, { upsert: true })
      if (upErr) {
        setError('Photo upload failed: ' + upErr.message)
        setUploading(false)
        return
      }
      const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
      newImages.push(data.publicUrl)
    }
    setImages(prev => [...prev, ...newImages])
    setUploading(false)
  }

  async function handleSubmit() {
    setError('')
    if (!hasId) { setError('You need to upload your ID before submitting an artwork for review.'); return }
    if (colours.length === 0 && !multicolour) { setError('Please choose at least one colour (or Multicolour).'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Not logged in'); setLoading(false); return }

    const colourValue = multicolour ? ['Multicolour', ...colours] : colours

    const { error: insertError } = await supabase.from('artworks').insert({
      artist_id: session.user.id,
      title,
      medium,
      year: year ? parseInt(year) : null,
      width_cm: width ? parseFloat(width) : null,
      height_cm: height ? parseFloat(height) : null,
      depth_cm: depth ? parseFloat(depth) : null,
      framed,
      original_or_print: originalOrPrint,
      price_huf: parseFloat(price),
      reservation_fee_huf: reservationFee,
      images: images,
      pickup_area: pickupArea,
      pickup_address: pickupAddress,
      pickup_method: pickupMethod,
      type_of_art: typeOfArt,
      colours: colourValue,
      mood,
      style,
      status: 'under_review',
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const steps = ['Photos', 'Details', 'Pricing', 'Location', 'Colours & tags']
  const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }
  const chip = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: '999px',
    border: active ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
    background: active ? '#0a0a0a' : 'white',
    color: active ? 'white' : '#0a0a0a',
    cursor: 'pointer', fontSize: '14px',
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1rem' }}>List artwork</h1>

      {hasId === false && (
        <div style={{ padding: '14px 16px', backgroundColor: '#fdf0f0', border: '1px solid #f0d0d0', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <p style={{ color: '#b94040', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>ID verification required</p>
          <p style={{ color: '#7a4a4a', fontSize: '13px' }}>
            You can fill this in, but you must upload your ID before you can submit for review.{' '}
            <Link href="/dashboard/verification" style={{ color: '#b94040', textDecoration: 'underline', fontWeight: 600 }}>Upload your ID</Link>
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: i + 1 <= step ? '#0a0a0a' : '#e8e8e8' }} />
        ))}
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '1.5rem' }}>{steps[step - 1]}</h2>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e8e8e8', borderRadius: '12px', padding: '2rem', cursor: 'pointer', color: '#999' }}>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            {uploading ? 'Uploading...' : '+ Add photos'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {images.map((url, i) => (
              <img key={i} src={url} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Art type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeOfArt(t)} style={chip(typeOfArt === t)}>{t}</button>
              ))}
            </div>
          </div>
          <select value={medium} onChange={e => setMedium(e.target.value)} style={inputStyle}>
            <option value="">Select medium</option>
            {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input placeholder="Year (optional)" value={year} onChange={e => setYear(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input placeholder="W cm" value={width} onChange={e => setWidth(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="H cm" value={height} onChange={e => setHeight(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="D cm (opt)" value={depth} onChange={e => setDepth(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['original', 'print'] as const).map(o => (
              <button key={o} onClick={() => setOriginalOrPrint(o)} style={{ ...chip(originalOrPrint === o), flex: 1, textTransform: 'capitalize' }}>{o}</button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={framed} onChange={e => setFramed(e.target.checked)} />
            Framed
          </label>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Price in HUF" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
          {price && !isNaN(parseFloat(price)) && (
            <div style={{ padding: '16px', backgroundColor: '#f5f3ef', borderRadius: '8px', fontSize: '14px' }}>
              <p>Artwork price: {parseInt(price).toLocaleString()} HUF</p>
              <p>Reservation fee (8%): {reservationFee.toLocaleString()} HUF</p>
              <p style={{ color: '#999', marginTop: '8px' }}>Buyers pay the fee online. You collect the rest in person.</p>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Public pickup area (e.g. 7th district)" value={pickupArea} onChange={e => setPickupArea(e.target.value)} style={inputStyle} />
          <input placeholder="Exact pickup address (hidden from buyers)" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['in_person', 'local_delivery'] as const).map(m => (
              <button key={m} onClick={() => setPickupMethod(m)} style={{ ...chip(pickupMethod === m), flex: 1 }}>{m === 'in_person' ? 'In person' : 'Local delivery'}</button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Colours <span style={{ color: '#b94040' }}>*</span></p>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>Pick all that apply, or choose Multicolour.</p>
            <button onClick={() => setMulticolour(v => !v)} style={{ ...chip(multicolour), marginBottom: '12px' }}>Multicolour</button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {COLOURS.map(c => {
                const active = colours.includes(c.name)
                return (
                  <button key={c.name} onClick={() => toggleColour(c.name)} title={c.name}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span style={{ width: '34px', height: '34px', borderRadius: '999px', backgroundColor: c.hex, border: active ? '3px solid #0a0a0a' : '1px solid #d8d4cc' }} />
                    <span style={{ fontSize: '10px', color: active ? '#0a0a0a' : '#999' }}>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Mood (optional)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={chip(mood.includes(m))}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Style (optional)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)} style={chip(style === s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
        {step > 1 && <Button variant="secondary" onClick={() => { setError(''); setStep(s => s - 1) }}>Back</Button>}
        {step < 5
          ? <Button full onClick={next}>Continue</Button>
          : <Button full onClick={handleSubmit} loading={loading} disabled={!hasId}>Submit for review</Button>
        }
      </div>
    </div>
  )
}

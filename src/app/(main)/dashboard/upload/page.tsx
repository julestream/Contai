'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']
const TYPES = ['Painting', 'Print', 'Photography', 'Graphic Art', 'Sculpture']
const MOODS = ['Joy', 'Harmony', 'Self-reflection', 'Inspiration', 'Intrigue']
const STYLES = ['Abstract', 'Figurative', 'Landscape', 'Portrait', 'Still Life', 'Minimalist', 'Expressionist', 'Geometric', 'Surrealist', 'Street Art']
const COLOURS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#a3a3a3', '#92400e']

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 - Photos
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Step 2 - Details
  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [framed, setFramed] = useState(false)
  const [originalOrPrint, setOriginalOrPrint] = useState<'original' | 'print'>('original')

  // Step 3 - Pricing
  const [price, setPrice] = useState('')

  // Step 4 - Location
  const [pickupArea, setPickupArea] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupMethod, setPickupMethod] = useState<'in_person' | 'local_delivery'>('in_person')

  // Step 5 - Filters
  const [typeOfArt, setTypeOfArt] = useState('')
  const [colours, setColours] = useState<string[]>([])
  const [mood, setMood] = useState<string[]>([])
  const [style, setStyle] = useState('')

  const reservationFee = price ? Math.max(500, Math.round(parseFloat(price) * 0.08)) : 0

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const newImages: string[] = []
    for (const file of Array.from(files)) {
      const path = `artworks/${session.user.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('artwork-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
        newImages.push(data.publicUrl)
      }
    }
    setImages(prev => [...prev, ...newImages])
    setUploading(false)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Not logged in')
      setLoading(false)
      return
    }

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
      colours,
      mood,
      style,
      status: 'under_review',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const steps = ['Photos', 'Details', 'Pricing', 'Location', 'Filters']

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1rem' }}>List artwork</h1>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            backgroundColor: i + 1 <= step ? '#0a0a0a' : '#e8e8e8',
          }} />
        ))}
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '1.5rem' }}>{steps[step - 1]}</h2>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #e8e8e8', borderRadius: '12px', padding: '2rem',
            cursor: 'pointer', color: '#999'
          }}>
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
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
          <select value={medium} onChange={e => setMedium(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}>
            <option value="">Select medium</option>
            {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input placeholder="Year" value={year} onChange={e => setYear(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input placeholder="W cm" value={width} onChange={e => setWidth(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
            <input placeholder="H cm" value={height} onChange={e => setHeight(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
            <input placeholder="D cm" value={depth} onChange={e => setDepth(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['original', 'print'] as const).map(o => (
              <button key={o} onClick={() => setOriginalOrPrint(o)} style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                border: originalOrPrint === o ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                background: originalOrPrint === o ? '#0a0a0a' : 'white',
                color: originalOrPrint === o ? 'white' : '#0a0a0a',
                cursor: 'pointer', textTransform: 'capitalize',
              }}>{o}</button>
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
          <input placeholder="Price in HUF" value={price} onChange={e => setPrice(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
          {price && (
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
          <input placeholder="Public pickup area (e.g. 7th district)" value={pickupArea} onChange={e => setPickupArea(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
          <input placeholder="Exact pickup address (hidden from buyers)" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['in_person', 'local_delivery'] as const).map(m => (
              <button key={m} onClick={() => setPickupMethod(m)} style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                border: pickupMethod === m ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                background: pickupMethod === m ? '#0a0a0a' : 'white',
                color: pickupMethod === m ? 'white' : '#0a0a0a',
                cursor: 'pointer', fontSize: '14px',
              }}>{m === 'in_person' ? 'In person' : 'Local delivery'}</button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeOfArt(t)} style={{
                  padding: '8px 16px', borderRadius: '999px',
                  border: typeOfArt === t ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                  background: typeOfArt === t ? '#0a0a0a' : 'white',
                  color: typeOfArt === t ? 'white' : '#0a0a0a',
                  cursor: 'pointer', fontSize: '14px',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Mood</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={{
                  padding: '8px 16px', borderRadius: '999px',
                  border: mood.includes(m) ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                  background: mood.includes(m) ? '#0a0a0a' : 'white',
                  color: mood.includes(m) ? 'white' : '#0a0a0a',
                  cursor: 'pointer', fontSize: '14px',
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Colours</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLOURS.map(c => (
                <button key={c} onClick={() => setColours(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} style={{
                  width: '32px', height: '32px', borderRadius: '999px',
                  backgroundColor: c,
                  border: colours.includes(c) ? '3px solid #0a0a0a' : '2px solid #e8e8e8',
                  cursor: 'pointer',
                }} />
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Style</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)} style={{
                  padding: '8px 16px', borderRadius: '999px',
                  border: style === s ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                  background: style === s ? '#0a0a0a' : 'white',
                  color: style === s ? 'white' : '#0a0a0a',
                  cursor: 'pointer', fontSize: '14px',
                }}>{s}</button>
              ))}
            </div>
          </div>
          {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
        {step > 1 && <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>}
        {step < 5
          ? <Button full onClick={() => setStep(s => s + 1)}>Continue</Button>
          : <Button full onClick={handleSubmit} loading={loading}>Submit for review</Button>
        }
      </div>
    </div>
  )
}

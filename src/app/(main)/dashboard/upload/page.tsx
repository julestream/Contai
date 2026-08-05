'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'
const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']
const TYPES = ['Painting', 'Print', 'Photography', 'Graphic Art', 'Sculpture']
const MOODS = ['Joy', 'Harmony', 'Self-reflection', 'Inspiration', 'Intrigue']
const STYLES = ['Abstract', 'Figurative', 'Landscape', 'Portrait', 'Still Life', 'Minimalist', 'Expressionist', 'Geometric', 'Surrealist', 'Street Art']
const COUNTRIES = ['Hungary', 'Romania']
const CITIES: Record<string, string[]> = {
  Hungary: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Other'],
  Romania: ['Bucharest (București)', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Oradea', 'Sibiu', 'Târgu Mureș', 'Other'],
}
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
  const { t } = useLang()
  const u = (k: string) => t(`upload.${k}`)
  const labels = (map: string, key: string) => {
    const m = t(`upload.${map}`) as any
    return (m && m[key]) || key
  }
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasId, setHasId] = useState<boolean | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [artistName, setArtistName] = useState('')
  const [description, setDescription] = useState('')
  const [typeOfArt, setTypeOfArt] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [framed, setFramed] = useState(false)
  const [signed, setSigned] = useState(false)
  const [originalOrPrint, setOriginalOrPrint] = useState<'original' | 'print'>('original')
  const [price, setPrice] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [pickupArea, setPickupArea] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupMethod, setPickupMethod] = useState<'in_person' | 'local_delivery'>('in_person')
  const [colours, setColours] = useState<string[]>([])
  const [multicolour, setMulticolour] = useState(false)
  const [mood, setMood] = useState<string[]>([])
  const [style, setStyle] = useState('')
  const [certificatePath, setCertificatePath] = useState('')
  const [certUploading, setCertUploading] = useState(false)
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
    if (step === 1 && images.length === 0) { setError(u('errPhoto')); return }
    if (step === 2) {
      if (!title.trim()) { setError(u('errTitle')); return }
      if (!medium) { setError(u('errMedium')); return }
    }
    if (step === 3 && (!price.trim() || isNaN(parseFloat(price)))) { setError(u('errPrice')); return }
    if (step === 4) {
      if (!country) { setError(u('errCountry')); return }
      if (!city) { setError(u('errCity')); return }
      if (!pickupArea.trim() || !pickupAddress.trim()) { setError(u('errPickup')); return }
    }
    setStep(s => s + 1)
  }
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(u('errNotSignedIn')); setUploading(false); return }
    const newImages: string[] = []
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `artworks/${session.user.id}/${Date.now()}-${safeName}`
      const { error: upErr } = await supabase.storage.from('artwork-images').upload(path, file, { upsert: true })
      if (upErr) {
        setError(u('errPhotoUpload') + ' ' + upErr.message)
        setUploading(false)
        return
      }
      const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
      newImages.push(data.publicUrl)
    }
    setImages(prev => [...prev, ...newImages])
    setUploading(false)
  }
  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setCertUploading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(u('errNotSignedIn')); setCertUploading(false); return }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${session.user.id}/certificates/${Date.now()}-${safeName}`
    const { error: upErr } = await supabase.storage.from('verification-docs').upload(path, file, { upsert: true })
    if (upErr) {
      setError(u('errCertUpload') + ' ' + upErr.message)
      setCertUploading(false)
      return
    }
    setCertificatePath(path)
    setCertUploading(false)
  }
  async function handleSubmit() {
    setError('')
    if (!hasId) { setError(u('errId')); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(u('errNotSignedIn')); setLoading(false); return }
    const colourValue = multicolour ? ['Multicolour', ...colours] : colours
    const { error: insertError } = await supabase.from('artworks').insert({
      artist_id: session.user.id,
      artist_name: artistName.trim() || null,
      title,
      description: description.trim() || null,
      medium,
      year: year ? parseInt(year) : null,
      width_cm: width ? parseFloat(width) : null,
      height_cm: height ? parseFloat(height) : null,
      depth_cm: depth ? parseFloat(depth) : null,
      framed,
      signed,
      original_or_print: originalOrPrint,
      price_huf: parseFloat(price),
      reservation_fee_huf: reservationFee,
      images: images,
      country,
      city,
      pickup_area: pickupArea,
      pickup_address: pickupAddress,
      pickup_method: pickupMethod,
      type_of_art: typeOfArt || null,
      colours: colourValue,
      mood,
      style,
      certificate_path: certificatePath || null,
      certificate_status: certificatePath ? 'pending' : 'none',
      status: 'under_review',
    })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/dashboard')
  }
  const steps = [u('stepPhotos'), u('stepDetails'), u('stepPricing'), u('stepLocation'), u('stepColours')]
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
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1rem' }}>{u('listArtwork')}</h1>
      {hasId === false && (
        <div style={{ padding: '14px 16px', backgroundColor: '#fdf0f0', border: '1px solid #f0d0d0', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <p style={{ color: '#b94040', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{u('idRequired')}</p>
          <p style={{ color: '#7a4a4a', fontSize: '13px' }}>
            {u('idRequiredHelp')}{' '}
            <Link href="/dashboard/verification" style={{ color: '#b94040', textDecoration: 'underline', fontWeight: 600 }}>{u('uploadYourId')}</Link>
          </p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: i + 1 <= step ? '#0a0a0a' : '#e8e8e8' }} />
        ))}
      </div>
      <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '20px', marginBottom: '1.5rem' }}>{steps[step - 1]}</h2>
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e8e8e8', borderRadius: '12px', padding: '2rem', cursor: 'pointer', color: '#999' }}>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            {uploading ? u('uploading') : u('addPhotos')}
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
          <input placeholder={u('title')} value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          <div>
            <input placeholder={u('artistName')} value={artistName} onChange={e => setArtistName(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>{u('artistNameHelp')}</p>
          </div>
          <div>
            <textarea
              placeholder={u('descriptionPlaceholder')}
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 2000))}
              rows={4}
              style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'var(--font-instrument), sans-serif' }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px', textAlign: 'right' }}>{description.length}/2000</p>
          </div>
          <select value={medium} onChange={e => setMedium(e.target.value)} style={inputStyle}>
            <option value="">{u('selectMedium')}</option>
            {MEDIUMS.map(m => <option key={m} value={m}>{labels('mediumLabels', m)}</option>)}
          </select>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>{u('artType')} <span style={{ color: '#999', fontWeight: 400 }}>{u('optional')}</span></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TYPES.map(ty => (
                <button key={ty} onClick={() => setTypeOfArt(typeOfArt === ty ? '' : ty)} style={chip(typeOfArt === ty)}>{labels('typeLabels', ty)}</button>
              ))}
            </div>
          </div>
          <input placeholder={u('year')} value={year} onChange={e => setYear(e.target.value)} style={inputStyle} />
          <div>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '6px' }}>{u('dimensions')}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input placeholder={u('wCm')} value={width} onChange={e => setWidth(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
              <input placeholder={u('hCm')} value={height} onChange={e => setHeight(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
              <input placeholder={u('dCm')} value={depth} onChange={e => setDepth(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['original', 'print'] as const).map(o => (
              <button key={o} onClick={() => setOriginalOrPrint(o)} style={{ ...chip(originalOrPrint === o), flex: 1 }}>{u(o)}</button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={framed} onChange={e => setFramed(e.target.checked)} />
            {u('framed')}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={signed} onChange={e => setSigned(e.target.checked)} />
            {u('signedByArtist')}
          </label>
        </div>
      )}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder={u('priceInHuf')} value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
          {price && !isNaN(parseFloat(price)) && (
            <div style={{ padding: '16px', backgroundColor: '#f5f3ef', borderRadius: '8px', fontSize: '14px' }}>
              <p>{u('artworkPriceLine')}: {parseInt(price).toLocaleString()} HUF</p>
              <p>{u('reservationFeeLine')}: {reservationFee.toLocaleString()} HUF</p>
              <p style={{ color: '#999', marginTop: '8px' }}>{u('feeExplain')}</p>
            </div>
          )}
        </div>
      )}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('country')}</label>
            <select value={country} onChange={e => { setCountry(e.target.value); setCity('') }} style={{ ...inputStyle, width: '100%' }}>
              <option value="">{u('selectCountry')}</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {country && (
            <div>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('city')}</label>
              <select value={city} onChange={e => setCity(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                <option value="">{u('selectCity')}</option>
                {CITIES[country]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('pickupAreaLabel')}</label>
            <input placeholder={u('pickupAreaPlaceholder')} value={pickupArea} onChange={e => setPickupArea(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{u('pickupAreaHelp')}</p>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('pickupAddressLabel')}</label>
            <input placeholder={u('pickupAddressPlaceholder')} value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{u('pickupAddressHelp')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['in_person', 'local_delivery'] as const).map(m => (
              <button key={m} onClick={() => setPickupMethod(m)} style={{ ...chip(pickupMethod === m), flex: 1 }}>{m === 'in_person' ? u('inPerson') : u('localDelivery')}</button>
            ))}
          </div>
        </div>
      )}
      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>{u('colours')} <span style={{ color: '#999', fontWeight: 400 }}>{u('optional')}</span></p>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>{u('coloursHelp')}</p>
            <button onClick={() => setMulticolour(v => !v)} style={{ ...chip(multicolour), marginBottom: '12px' }}>{u('multicolour')}</button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {COLOURS.map(c => {
                const active = colours.includes(c.name)
                return (
                  <button key={c.name} onClick={() => toggleColour(c.name)} title={labels('colourLabels', c.name)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span style={{ width: '34px', height: '34px', borderRadius: '999px', backgroundColor: c.hex, border: active ? '3px solid #0a0a0a' : '1px solid #d8d4cc' }} />
                    <span style={{ fontSize: '10px', color: active ? '#0a0a0a' : '#999' }}>{labels('colourLabels', c.name)}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>{u('moodLabel')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={chip(mood.includes(m))}>{t(`mood.${m}`)}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>{u('styleLabel')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(style === s ? '' : s)} style={chip(style === s)}>{labels('styleLabels', s)}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{u('certificate')} <span style={{ color: '#999', fontWeight: 400 }}>{u('optional')}</span></p>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>{u('certHelp')}</p>
            <label style={{ display: 'inline-block', cursor: 'pointer' }}>
              <input type="file" accept="image/jpeg,image/jpg,application/pdf" onChange={handleCertUpload} style={{ display: 'none' }} />
              <span style={{ padding: '8px 16px', borderRadius: '999px', border: '1px solid #0a0a0a', fontSize: '14px' }}>
                {certUploading ? u('uploading') : certificatePath ? u('certificateAdded') : u('addCertificate')}
              </span>
            </label>
          </div>
        </div>
      )}
      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
        {step > 1 && <Button variant="secondary" onClick={() => { setError(''); setStep(s => s - 1) }}>{u('back')}</Button>}
        {step < 5
          ? <Button full onClick={next}>{u('continue')}</Button>
          : <Button full onClick={handleSubmit} loading={loading} disabled={!hasId}>{u('submitForReview')}</Button>
        }
      </div>
    </div>
  )
}
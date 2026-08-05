'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteArtwork } from './deleteArtwork'
import { useLang } from '@/i18n/LanguageProvider'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Gouache', 'Ink', 'Pastel', 'Charcoal', 'Pencil', 'Mixed Media', 'Digital', 'Photography', 'Other']

const COUNTRIES = ['Hungary', 'Romania']
const CITIES: Record<string, string[]> = {
  Hungary: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Other'],
  Romania: ['Bucharest (București)', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Oradea', 'Sibiu', 'Târgu Mureș', 'Other'],
}

export default function EditArtworkPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t } = useLang()
  const c = (k: string) => t(`common.${k}`)
  const e = (k: string) => t(`editArtwork.${k}`)
  const label = (map: string, key: string) => {
    const m = t(map) as any
    return (m && m[key]) || key
  }
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
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
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

      if (!art) { setError(e('notFound')); setLoading(false); return }
      if (art.artist_id !== session.user.id) { setDenied(true); setLoading(false); return }

      setTitle(art.title || '')
      setArtistName(art.artist_name || '')
      setDescription(art.description || '')
      setMedium(art.medium || '')
      setYear(art.year ? String(art.year) : '')
      setWidth(art.width_cm ? String(art.width_cm) : '')
      setHeight(art.height_cm ? String(art.height_cm) : '')
      setPrice(art.price_huf ? String(art.price_huf) : '')
      setCountry(art.country || '')
      setCity(art.city || '')
      setPickupArea(art.pickup_area || '')
      setSigned(!!art.signed)
      setStatus(art.status || '')
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, router])

  async function handleSave() {
    setError('')
    if (!title.trim()) { setError(e('errTitle')); return }
    if (!price || parseFloat(price) <= 0) { setError(e('errPrice')); return }
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
      country: country || null,
      city: city || null,
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
    if (!result.ok) { setError(result.error || e('errDelete')); setDeleting(false); return }
    router.push('/dashboard')
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '8px', border: '1px solid #e0dcd3',
    fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'var(--font-instrument), sans-serif',
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{c('loading')}</div>
  if (denied) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{e('denied')} <Link href="/dashboard">{e('backToDashboard')}</Link></div>

  const isHidden = status === 'hidden'

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <Link href="/dashboard" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>{e('backToDashboard')}</Link>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', margin: '1rem 0 1.5rem' }}>{e('title')}</h1>

      {isHidden && (
        <div style={{ padding: '10px 14px', background: '#f5f3ef', borderRadius: '10px', marginBottom: '1rem', fontSize: '13px', color: '#8a857c' }}>
          {e('hiddenNotice')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('artworkTitle')}</label>
          <input value={title} onChange={ev => setTitle(ev.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('artistName')}</label>
          <input value={artistName} onChange={ev => setArtistName(ev.target.value)} style={inputStyle} placeholder={e('artistNamePlaceholder')} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('description')}</label>
          <textarea value={description} onChange={ev => setDescription(ev.target.value.slice(0, 2000))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder={e('descriptionPlaceholder')} />
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right' }}>{description.length}/2000</p>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('price')}</label>
          <input value={price} onChange={ev => setPrice(ev.target.value)} style={inputStyle} inputMode="numeric" />
          {price && parseFloat(price) > 0 && (
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              {e('reservationFeeLine')} {Math.round(parseFloat(price) * 0.08).toLocaleString()} HUF
            </p>
          )}
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('medium')}</label>
          <select value={medium} onChange={ev => setMedium(ev.target.value)} style={inputStyle}>
            <option value="">{e('selectMedium')}</option>
            {MEDIUMS.map(m => <option key={m} value={m}>{label('filters.mediumLabels', m)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('year')}</label>
          <input value={year} onChange={ev => setYear(ev.target.value)} style={inputStyle} inputMode="numeric" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('width')}</label>
            <input value={width} onChange={ev => setWidth(ev.target.value)} style={inputStyle} inputMode="numeric" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('height')}</label>
            <input value={height} onChange={ev => setHeight(ev.target.value)} style={inputStyle} inputMode="numeric" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{c('country')}</label>
          <select value={country} onChange={ev => { setCountry(ev.target.value); setCity('') }} style={inputStyle}>
            <option value="">{c('selectCountry')}</option>
            {COUNTRIES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        {country && (
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{c('city')}</label>
            <select value={city} onChange={ev => setCity(ev.target.value)} style={inputStyle}>
              <option value="">{c('selectCity')}</option>
              {CITIES[country]?.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        )}
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{e('pickupArea')}</label>
          <input value={pickupArea} onChange={ev => setPickupArea(ev.target.value)} style={inputStyle} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={signed} onChange={ev => setSigned(ev.target.checked)} />
          <span style={{ fontSize: '15px', color: '#0a0a0a' }}>{e('signedByArtist')}</span>
        </label>
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
      {saved && <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '1rem' }}>{c('saved')}</p>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', marginTop: '1.5rem', padding: '15px', borderRadius: '999px', border: 'none',
        background: '#0a0a0a', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
        {saving ? c('saving') : e('saveChanges')}
      </button>

      <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
        {e('liveNote')}
      </p>

      <button onClick={handleToggleHide} disabled={hiding} style={{
        width: '100%', marginTop: '2rem', padding: '14px', borderRadius: '999px',
        border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a',
        fontSize: '15px', fontWeight: 500, cursor: 'pointer', opacity: hiding ? 0.6 : 1,
      }}>
        {hiding ? e('updating') : isHidden ? e('unhide') : e('hide')}
      </button>
      <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '8px' }}>
        {e('hideNote')}
      </p>

      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{
            width: '100%', padding: '14px', borderRadius: '999px',
            border: '1px solid #e0c4c4', background: '#fff', color: '#b94040',
            fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          }}>
            {e('deleteArtwork')}
          </button>
        ) : (
          <div style={{ padding: '1rem', border: '1px solid #e0c4c4', borderRadius: '12px', background: '#fdf6f6' }}>
            <p style={{ fontSize: '14px', color: '#b94040', fontWeight: 600, marginBottom: '4px' }}>{e('deletePermanently')}</p>
            <p style={{ fontSize: '13px', color: '#8a6060', lineHeight: 1.5, marginBottom: '14px' }}>
              {e('deleteWarning')}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '12px', borderRadius: '999px', border: 'none',
                background: '#b94040', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: deleting ? 0.6 : 1,
              }}>
                {deleting ? e('deleting') : e('confirmDelete')}
              </button>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} style={{
                flex: 1, padding: '12px', borderRadius: '999px', border: '1px solid #e0dcd3',
                background: '#fff', color: '#0a0a0a', fontSize: '14px', cursor: 'pointer',
              }}>
                {c('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
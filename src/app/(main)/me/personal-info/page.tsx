'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import { resizeImage } from '@/lib/resizeImage'

const COUNTRIES = ['Hungary', 'Romania']
const CITIES: Record<string, string[]> = {
  Hungary: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Other'],
  Romania: ['Bucharest (București)', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Oradea', 'Sibiu', 'Târgu Mureș', 'Other'],
}

export default function PersonalInfoPage() {
  const router = useRouter()
  const { t } = useLang()
  const c = (k: string) => t(`common.${k}`)
  const p = (k: string) => t(`mePages.personalInfo.${k}`)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      setEmail(session.user.email || '')
      const { data } = await supabase
        .from('profiles')
        .select('full_name, country, city, avatar_url')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setFullName(data.full_name || '')
        setCountry(data.country || '')
        setCity(data.city || '')
        setAvatarUrl(data.avatar_url || '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploadingAvatar(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setUploadingAvatar(false); return }
    // Avatars display at 72px — 400px is generous even on retina screens.
    const resized = await resizeImage(file, 400, 0.85)
    const safeName = resized.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `avatars/${session.user.id}-${Date.now()}-${safeName}`
    const { error: upErr } = await supabase.storage
      .from('artwork-images')
      .upload(path, resized, {
        upsert: true,
        contentType: resized.type,
        cacheControl: '31536000',
      })
    if (upErr) { setError(c('photoUploadFailed') + ' ' + upErr.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setUploadingAvatar(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(c('notSignedIn')); setSaving(false); return }
    const { error: updErr } = await supabase.from('profiles').update({
      full_name: fullName,
      country: country || null,
      city: city || null,
      avatar_url: avatarUrl,
    }).eq('id', session.user.id)
    if (updErr) { setError(updErr.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '8px', border: '1px solid #e0dcd3',
    fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'var(--font-instrument), sans-serif',
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{c('loading')}</div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{p('title')}</h1>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '999px', backgroundColor: '#f5f3ef', overflow: 'hidden', flexShrink: 0 }}>
          {avatarUrl && <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          <span style={{ padding: '8px 16px', borderRadius: '999px', border: '1px solid #0a0a0a', fontSize: '14px' }}>
            {uploadingAvatar ? c('uploading') : avatarUrl ? c('changePhoto') : c('addPhoto')}
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{c('name')}</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} placeholder={c('yourName')} />
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{c('country')}</label>
          <select value={country} onChange={e => { setCountry(e.target.value); setCity('') }} style={inputStyle}>
            <option value="">{c('selectCountry')}</option>
            {COUNTRIES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        {country && (
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{c('city')}</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={inputStyle}>
              <option value="">{c('selectCity')}</option>
              {CITIES[country]?.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{p('cityHelp')}</p>
          </div>
        )}

        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{p('email')}</label>
          <input value={email} disabled style={{ ...inputStyle, background: '#f5f3ef', color: '#999' }} />
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{p('emailHelp')}</p>
        </div>
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
      {saved && <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '1rem' }}>{c('saved')}</p>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', marginTop: '1.5rem', padding: '15px', borderRadius: '999px', border: 'none',
        background: '#0a0a0a', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
        {saving ? c('saving') : c('save')}
      </button>
    </div>
  )
}
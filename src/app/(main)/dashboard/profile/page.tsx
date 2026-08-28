'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'
import { resizeImage } from '@/lib/resizeImage'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']

// Match the onboarding limits — room for two languages.
const BIO_MAX = 1000
const STATEMENT_MAX = 600

export default function EditProfilePage() {
  const router = useRouter()
  const { t } = useLang()
  const c = (k: string) => t(`common.${k}`)
  const d = (k: string) => t(`dashboardProfile.${k}`)
  const label = (map: string, key: string) => {
    const m = t(map) as any
    return (m && m[key]) || key
  }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [statement, setStatement] = useState('')
  const [city, setCity] = useState('')
  const [mediums, setMediums] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, artist_statement, city, mediums, avatar_url')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setStatement(data.artist_statement || '')
        setCity(data.city || '')
        setMediums(data.mediums || [])
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

  function toggleMedium(m: string) {
    setMediums(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
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
      bio,
      artist_statement: statement,
      city,
      mediums,
      avatar_url: avatarUrl,
    }).eq('id', session.user.id)
    if (updErr) { setError(updErr.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    router.push('/dashboard')
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '8px', border: '1px solid #e0dcd3',
    fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'var(--font-instrument), sans-serif',
  }
  const chip = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: '999px',
    border: active ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
    background: active ? '#0a0a0a' : '#fff', color: active ? '#fff' : '#0a0a0a',
    cursor: 'pointer', fontSize: '13px',
  })
  const countStyle: React.CSSProperties = {
    fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right',
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{c('loading')}</div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>{d('title')}</h1>

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
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{c('city')}</label>
          <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} placeholder={d('cityPlaceholder')} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{d('bio')}</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={6}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder={d('bioPlaceholder')}
          />
          <p style={countStyle}>{bio.length}/{BIO_MAX}</p>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{d('statement')}</label>
          <textarea
            value={statement}
            onChange={e => setStatement(e.target.value.slice(0, STATEMENT_MAX))}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder={d('statementPlaceholder')}
          />
          <p style={countStyle}>{statement.length}/{STATEMENT_MAX}</p>
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>{d('mediums')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {MEDIUMS.map(m => <button key={m} onClick={() => toggleMedium(m)} style={chip(mediums.includes(m))}>{label('upload.mediumLabels', m)}</button>)}
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
      {saved && <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '1rem' }}>{c('saved')}</p>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', marginTop: '1.5rem', padding: '15px', borderRadius: '999px', border: 'none',
        background: '#0a0a0a', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
        {saving ? c('saving') : d('saveProfile')}
      </button>
    </div>
  )
}
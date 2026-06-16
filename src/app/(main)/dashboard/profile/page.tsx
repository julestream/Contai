'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']

export default function EditProfilePage() {
  const router = useRouter()
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
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `avatars/${session.user.id}-${Date.now()}-${safeName}`
    const { error: upErr } = await supabase.storage.from('artwork-images').upload(path, file, { upsert: true })
    if (upErr) { setError('Photo upload failed: ' + upErr.message); setUploadingAvatar(false); return }
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
    if (!session) { setError('Not signed in'); setSaving(false); return }
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

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Edit profile</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '999px', backgroundColor: '#f5f3ef', overflow: 'hidden', flexShrink: 0 }}>
          {avatarUrl && <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          <span style={{ padding: '8px 16px', borderRadius: '999px', border: '1px solid #0a0a0a', fontSize: '14px' }}>
            {uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Add photo'}
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} placeholder="Your name" />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>City</label>
          <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} placeholder="e.g. Budapest" />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A short introduction" />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>Artist statement</label>
          <textarea value={statement} onChange={e => setStatement(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="About your work and practice" />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>Mediums</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {MEDIUMS.map(m => <button key={m} onClick={() => toggleMedium(m)} style={chip(mediums.includes(m))}>{m}</button>)}
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
      {saved && <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '1rem' }}>Saved</p>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', marginTop: '1.5rem', padding: '15px', borderRadius: '999px', border: 'none',
        background: '#0a0a0a', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
        {saving ? 'Saving...' : 'Save profile'}
      </button>
    </div>
  )
}
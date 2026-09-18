'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'
import BackLink from '@/components/ui/BackLink'

// Kept in step with the upload form. A saved location that offers a city
// the upload form does not know would prefill a value the artist cannot
// re-select after editing.
const COUNTRIES = ['Hungary', 'Romania']
const CITIES: Record<string, string[]> = {
  Hungary: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Other'],
  Romania: ['Bucharest (București)', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Oradea', 'Sibiu', 'Târgu Mureș', 'Other'],
}

type PickupLocation = {
  id: string
  label: string
  country: string | null
  city: string | null
  pickup_area: string | null
  pickup_address: string | null
  pickup_method: string
  travels_for_handoff: boolean
  is_default: boolean
}

const BLANK = {
  label: '',
  country: '',
  city: '',
  pickup_area: '',
  pickup_address: '',
  pickup_method: 'in_person' as 'in_person' | 'local_delivery',
  travels_for_handoff: false,
  is_default: false,
}

export default function PickupLocationsPage() {
  const router = useRouter()
  const { t } = useLang()
  const c = (k: string) => t(`common.${k}`)
  const u = (k: string) => t(`upload.${k}`)
  const p = (k: string) => t(`pickupLocations.${k}`)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [locations, setLocations] = useState<PickupLocation[]>([])
  const [form, setForm] = useState({ ...BLANK })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      const { data, error: selErr } = await supabase
        .from('pickup_locations')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })
      if (selErr) setError(selErr.message)
      setLocations(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  function startNew() {
    setForm({ ...BLANK, is_default: locations.length === 0 })
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  function startEdit(loc: PickupLocation) {
    setForm({
      label: loc.label || '',
      country: loc.country || '',
      city: loc.city || '',
      pickup_area: loc.pickup_area || '',
      pickup_address: loc.pickup_address || '',
      pickup_method: (loc.pickup_method === 'local_delivery' ? 'local_delivery' : 'in_person'),
      travels_for_handoff: loc.travels_for_handoff,
      is_default: loc.is_default,
    })
    setEditingId(loc.id)
    setShowForm(true)
    setError('')
  }

  async function handleSave() {
    setError('')
    if (!form.label.trim()) { setError(p('labelLabel')); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(c('notSignedIn')); setSaving(false); return }

    // Only one default per artist — the unique index enforces this, so the
    // old default has to be cleared first or the write is rejected.
    if (form.is_default) {
      const { error: clearErr } = await supabase
        .from('pickup_locations')
        .update({ is_default: false })
        .eq('artist_id', session.user.id)
        .eq('is_default', true)
      if (clearErr) { setError(clearErr.message); setSaving(false); return }
    }

    const payload = {
      artist_id: session.user.id,
      label: form.label.trim(),
      country: form.country || null,
      city: form.city || null,
      pickup_area: form.pickup_area.trim() || null,
      pickup_address: form.pickup_address.trim() || null,
      pickup_method: form.pickup_method,
      travels_for_handoff: form.travels_for_handoff,
      is_default: form.is_default,
    }

    const { error: writeErr } = editingId
      ? await supabase.from('pickup_locations').update(payload).eq('id', editingId)
      : await supabase.from('pickup_locations').insert(payload)

    if (writeErr) { setError(writeErr.message); setSaving(false); return }

    const { data } = await supabase
      .from('pickup_locations')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
    setLocations(data || [])
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm({ ...BLANK })
  }

  async function handleRemove(id: string) {
    if (!confirm(p('removeConfirm'))) return
    setError('')
    const supabase = createClient()
    const { error: delErr } = await supabase.from('pickup_locations').delete().eq('id', id)
    if (delErr) { setError(delErr.message); return }
    setLocations(prev => prev.filter(l => l.id !== id))
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

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{c('loading')}</div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '1.5rem', paddingBottom: '6rem' }}>
      <BackLink />
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginTop: '1rem', marginBottom: '0.5rem' }}>
        {p('title')}
      </h1>
      <p style={{ fontSize: '13px', color: '#5a5246', lineHeight: 1.6, marginBottom: '1.5rem' }}>{p('intro')}</p>

      {locations.length === 0 && !showForm && (
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '1.5rem' }}>{p('empty')}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
        {locations.map(loc => (
          <div key={loc.id} style={{ padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '15px' }}>
                  {loc.label}
                  {loc.is_default && (
                    <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px', background: '#f5f3ef', color: '#5a5246' }}>
                      {p('defaultBadge')}
                    </span>
                  )}
                </p>
                <p style={{ fontSize: '13px', color: '#999', marginTop: '3px' }}>
                  {[loc.city, loc.pickup_area].filter(Boolean).join(' · ') || '—'}
                </p>
                {loc.pickup_address && (
                  <p style={{ fontSize: '13px', color: '#5a5246', marginTop: '3px', wordBreak: 'break-word' }}>{loc.pickup_address}</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => startEdit(loc)} style={{ ...chip(false), fontSize: '12px', padding: '6px 12px' }}>{c('edit')}</button>
                <button onClick={() => handleRemove(loc.id)} style={{ ...chip(false), fontSize: '12px', padding: '6px 12px', color: '#b94040', borderColor: '#f0d0d0' }}>{p('remove')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!showForm && (
        <button onClick={startNew} style={{
          width: '100%', padding: '14px', borderRadius: '999px', border: '1px solid #0a0a0a',
          background: '#fff', color: '#0a0a0a', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        }}>
          {p('addNew')}
        </button>
      )}

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '1.25rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{p('labelLabel')}</label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={inputStyle} placeholder={p('labelPlaceholder')} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('country')}</label>
            <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value, city: '' }))} style={inputStyle}>
              <option value="">{u('selectCountry')}</option>
              {COUNTRIES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>

          {form.country && (
            <div>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('city')}</label>
              <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle}>
                <option value="">{u('selectCity')}</option>
                {CITIES[form.country]?.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('pickupAreaLabel')}</label>
            <input value={form.pickup_area} onChange={e => setForm(f => ({ ...f, pickup_area: e.target.value }))} style={inputStyle} placeholder={u('pickupAreaPlaceholder')} />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{u('pickupAreaHelp')}</p>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{u('pickupAddressLabel')}</label>
            <input value={form.pickup_address} onChange={e => setForm(f => ({ ...f, pickup_address: e.target.value }))} style={inputStyle} placeholder={u('pickupAddressPlaceholder')} />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', lineHeight: 1.5 }}>{p('privateNote')}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['in_person', 'local_delivery'] as const).map(m => (
              <button key={m} onClick={() => setForm(f => ({ ...f, pickup_method: m }))} style={{ ...chip(form.pickup_method === m), flex: 1 }}>
                {m === 'in_person' ? u('inPerson') : u('localDelivery')}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.travels_for_handoff}
              onChange={e => setForm(f => ({ ...f, travels_for_handoff: e.target.checked }))}
              style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{u('travelsLabel')}</span>
          </label>

          <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
              style={{ width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>{p('setDefault')}</span>
          </label>

          {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setShowForm(false); setEditingId(null); setError('') }} style={{
              flex: 1, padding: '13px', borderRadius: '999px', border: '1px solid #e0dcd3',
              background: '#fff', fontSize: '15px', cursor: 'pointer',
            }}>
              {c('cancel')}
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: '13px', borderRadius: '999px', border: 'none',
              background: '#0a0a0a', color: '#fff', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? c('saving') : p('save')}
            </button>
          </div>
        </div>
      )}

      {error && !showForm && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}
    </div>
  )
}
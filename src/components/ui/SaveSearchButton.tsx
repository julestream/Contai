'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, Check } from 'lucide-react'

// Build a human-readable label from the active filters
function buildLabel(params: URLSearchParams): string {
  const parts: string[] = []
  const map: [string, string][] = [
    ['type', ''], ['medium', ''], ['mood', ''], ['colour', ''],
    ['material', ''], ['size', ''], ['badge', ''], ['location', ''],
  ]
  for (const [key] of map) {
    const v = params.get(key)
    if (v) parts.push(v.split(',').join(', '))
  }
  if (params.get('q')) parts.push(`"${params.get('q')}"`)
  const min = params.get('min_price')
  const max = params.get('max_price')
  if (min || max) {
    parts.push(`${min ? Number(min).toLocaleString() : '0'}–${max ? Number(max).toLocaleString() : '∞'} Ft`)
  }
  if (params.get('framed') === 'true') parts.push('Framed')
  if (params.get('framed') === 'false') parts.push('Unframed')
  return parts.length ? parts.join(' · ') : 'All works'
}

export default function SaveSearchButton() {
  const searchParams = useSearchParams()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Only meaningful if at least one filter is active
  const queryString = searchParams.toString()
  const hasFilters = queryString.length > 0

  if (!hasFilters) return null

  async function save() {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Sign in to save searches')
      setSaving(false)
      return
    }
    const label = buildLabel(new URLSearchParams(queryString))
    const { error: insErr } = await supabase.from('saved_searches').insert({
      user_id: session.user.id,
      label,
      query_string: queryString,
    })
    if (insErr) {
      setError('Could not save')
      setSaving(false)
      return
    }
    setSaving(false)
    setSaved(true)
  }

  return (
    <div style={{ padding: '0 1rem 8px' }}>
      <button
        onClick={save}
        disabled={saving || saved}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '999px',
          border: '1px solid #0a0a0a',
          background: saved ? '#0a0a0a' : '#fff',
          color: saved ? '#fff' : '#0a0a0a',
          fontSize: '13px', cursor: saved ? 'default' : 'pointer',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saved ? <Check size={15} /> : <Bookmark size={15} />}
        {saved ? 'Saved to your searches' : saving ? 'Saving…' : 'Save this search'}
      </button>
      {error && <p style={{ color: '#b94040', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
    </div>
  )
}
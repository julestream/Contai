'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Changing your mind about a listing you already approved. Deliberately
// only reversible moves — hide, unhide, send back for review. Permanent
// deletion stays on the artwork's own edit page, where it takes a
// confirmation step; a delete button in a list is too easy to hit.
export default function StatusActions({
  artworkId,
  status,
  featured,
}: {
  artworkId: string
  status: string
  featured?: boolean
}) {
  const [loading, setLoading] = useState('')
  const [isFeatured, setIsFeatured] = useState(!!featured)
  const [error, setError] = useState('')
  const router = useRouter()

  async function setStatus(next: string) {
    setLoading(next)
    setError('')
    const supabase = createClient()
    const { error: updErr } = await supabase
      .from('artworks')
      .update({ status: next })
      .eq('id', artworkId)
    if (updErr) {
      setError(updErr.message)
      setLoading('')
      return
    }
    router.refresh()
    setLoading('')
  }

  // Home's 'Curatorial picks' falls back to the newest work when nothing is
  // featured — which quietly turns a curated shelf into a second 'newest'
  // row. This is how the shelf becomes real.
  async function toggleFeatured() {
    setLoading('featured')
    setError('')
    const next = !isFeatured
    const supabase = createClient()
    const { error: updErr } = await supabase
      .from('artworks')
      .update({ featured: next })
      .eq('id', artworkId)
    if (updErr) {
      setError(updErr.message)
      setLoading('')
      return
    }
    setIsFeatured(next)
    router.refresh()
    setLoading('')
  }

  const btn = (bg: string, color: string, border: string): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: '999px',
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontSize: '13px',
    cursor: 'pointer',
  })

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {status === 'live' && (
          <button onClick={() => setStatus('hidden')} disabled={!!loading} style={btn('#fff', '#0a0a0a', '#d8d4cc')}>
            {loading === 'hidden' ? '…' : 'Hide from buyers'}
          </button>
        )}
        {(status === 'hidden' || status === 'rejected') && (
          <button onClick={() => setStatus('live')} disabled={!!loading} style={btn('#0a0a0a', '#fff', '#0a0a0a')}>
            {loading === 'live' ? '…' : 'Make live'}
          </button>
        )}
        {status !== 'under_review' && status !== 'sold' && status !== 'reserved' && (
          <button onClick={() => setStatus('under_review')} disabled={!!loading} style={btn('#fff', '#8a857c', '#e0dcd3')}>
            {loading === 'under_review' ? '…' : 'Back to review'}
          </button>
        )}
        <button
          onClick={toggleFeatured}
          disabled={!!loading}
          style={btn(
            isFeatured ? '#f3efe6' : '#fff',
            isFeatured ? '#8a6d3b' : '#8a857c',
            isFeatured ? '#e4d9c2' : '#e0dcd3'
          )}
        >
          {loading === 'featured' ? '…' : isFeatured ? '★ Curatorial pick' : '☆ Add to picks'}
        </button>
      </div>
      {error && <p style={{ color: '#b94040', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
    </div>
  )
}
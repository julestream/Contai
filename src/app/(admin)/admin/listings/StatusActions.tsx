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
}: {
  artworkId: string
  status: string
}) {
  const [loading, setLoading] = useState('')
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
      </div>
      {error && <p style={{ color: '#b94040', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
    </div>
  )
}
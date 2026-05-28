'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function ApproveRejectButtons({ artworkId }: { artworkId: string }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('artworks').update({ status: 'live' }).eq('id', artworkId)
    router.refresh()
    setLoading(false)
  }

  async function handleReject() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('artworks').update({ status: 'rejected' }).eq('id', artworkId)
    await supabase.from('admin_notes').insert({ artwork_id: artworkId, note: reason })
    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {!rejecting ? (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={handleApprove} loading={loading}>✓ Approve</Button>
          <Button variant="secondary" onClick={() => setRejecting(true)}>✗ Reject</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            placeholder="Reason for rejection..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px', outline: 'none', resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={handleReject} loading={loading}>Confirm reject</Button>
            <Button variant="ghost" onClick={() => setRejecting(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}

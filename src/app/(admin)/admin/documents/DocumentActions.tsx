'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function DocumentActions({ docId, profileId, docType }: { docId: string, profileId: string, docType: string }) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [showReject, setShowReject] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('verification_documents').update({ status: 'approved' }).eq('id', docId)

    if (docType === 'id') {
      await supabase.from('badges').insert({
        profile_id: profileId,
        badge_type: 'verified_artist',
      })
    }
    router.refresh()
    setLoading(false)
  }

  async function handleReject() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('verification_documents').update({ status: 'rejected', notes }).eq('id', docId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
      {!showReject ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" onClick={handleApprove} loading={loading}>Approve</Button>
          <Button size="sm" variant="secondary" onClick={() => setShowReject(true)}>Reject</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            placeholder="Rejection reason..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" onClick={handleReject} loading={loading}>Confirm</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}

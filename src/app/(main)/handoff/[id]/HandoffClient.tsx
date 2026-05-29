'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HandoffClient({ reservation, userId }: any) {
  const [address, setAddress] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [showIssue, setShowIssue] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [issueNotes, setIssueNotes] = useState('')
  const [issueSubmitted, setIssueSubmitted] = useState(false)
  const [submittingIssue, setSubmittingIssue] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const router = useRouter()
  const artwork = reservation.artworks

  useEffect(() => {
    if (!reservation.reservation_expires_at) return
    const interval = setInterval(() => {
      const expires = new Date(reservation.reservation_expires_at).getTime()
      const now = Date.now()
      const diff = expires - now
      if (diff <= 0) { setTimeLeft('Expired'); clearInterval(interval); return }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m remaining`)
    }, 1000)
    return () => clearInterval(interval)
  }, [reservation.reservation_expires_at])

  useEffect(() => {
    async function fetchAddress() {
      if (!['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup', 'handoff_completed'].includes(reservation.status)) return
      const res = await fetch(`/api/address/${reservation.id}`)
      if (res.ok) {
        const data = await res.json()
        setAddress(data.address)
      }
    }
    fetchAddress()
  }, [reservation.id, reservation.status])

  useEffect(() => {
    async function findConversation() {
      const supabase = createClient()
      const { data } = await supabase
        .from('conversations')
        .select('id')
        .eq('artwork_id', artwork.id)
        .eq('buyer_id', userId)
        .single()
      if (data) setConversationId(data.id)
    }
    findConversation()
  }, [artwork.id, userId])

  async function handleConfirmHandoff() {
    setConfirming(true)
    const supabase = createClient()
    await supabase.from('reservations').update({ status: 'handoff_completed' }).eq('id', reservation.id)
    await supabase.from('artworks').update({ status: 'sold' }).eq('id', artwork.id)
    router.refresh()
    setConfirming(false)
  }

  async function handleReportIssue() {
    setSubmittingIssue(true)
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: reservation.id, issueType, issueNotes }),
    })
    if (res.ok) setIssueSubmitted(true)
    setSubmittingIssue(false)
  }

  const isPaid = ['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup', 'handoff_completed'].includes(reservation.status)
  const isCompleted = reservation.status === 'handoff_completed'
  const images = artwork?.images as string[]

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', alignItems: 'center' }}>
        {images?.length > 0 && (
          <img src={images[0]} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
        )}
        <div>
          <p style={{ fontWeight: 600 }}>{artwork?.title}</p>
          <p style={{ color: '#666', fontSize: '14px' }}>{artwork?.profiles?.full_name}</p>
          <p style={{ color: '#666', fontSize: '14px' }}>{artwork?.pickup_area}</p>
        </div>
      </div>

      {isCompleted ? (
        <div style={{ padding: '1rem', backgroundColor: '#eef4f1', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '18px' }}>✓ Handoff completed!</p>
          <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '4px' }}>The artwork is yours.</p>
        </div>
      ) : (
        <>
          {timeLeft && (
            <div style={{ padding: '12px', backgroundColor: '#f5f3ef', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>⏱ {timeLeft}</p>
            </div>
          )}

          {isPaid && reservation.handoff_code && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Your handoff code — show this to the artist:</p>
              <div style={{
                padding: '1.5rem', backgroundColor: '#f5f3ef', borderRadius: '12px',
                textAlign: 'center', fontFamily: 'monospace', fontSize: '32px',
                fontWeight: 700, letterSpacing: '0.1em', color: '#0a0a0a',
              }}>
                {reservation.handoff_code}
              </div>
            </div>
          )}

          {address && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Pickup address:</p>
              <p style={{ fontWeight: 600 }}>{address}</p>
            </div>
          )}

          {/* Message artist button */}
          {isPaid && conversationId && (
            <button
              onClick={() => router.push(`/messages/${conversationId}`)}
              style={{
                width: '100%', padding: '14px', backgroundColor: 'white',
                color: '#0a0a0a', border: '1px solid #0a0a0a', borderRadius: '999px',
                fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginBottom: '12px',
              }}
            >
              💬 Message artist to arrange meetup
            </button>
          )}

          {isPaid && !conversationId && (
            <button
              onClick={async () => {
                const supabase = createClient()
                const { data } = await supabase.from('conversations').insert({
                  artwork_id: artwork.id,
                  buyer_id: userId,
                  artist_id: artwork.artist_id,
                }).select('id').single()
                if (data) router.push(`/messages/${data.id}`)
              }}
              style={{
                width: '100%', padding: '14px', backgroundColor: 'white',
                color: '#0a0a0a', border: '1px solid #0a0a0a', borderRadius: '999px',
                fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginBottom: '12px',
              }}
            >
              💬 Message artist to arrange meetup
            </button>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Fee paid', done: isPaid },
              { label: 'Address revealed', done: !!address },
              { label: 'Handoff confirmed', done: isCompleted },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '999px',
                  backgroundColor: step.done ? '#2d6a4f' : '#e8e8e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px', flexShrink: 0,
                }}>
                  {step.done ? '✓' : i + 1}
                </div>
                <p style={{ fontSize: '14px', color: step.done ? '#0a0a0a' : '#999' }}>{step.label}</p>
              </div>
            ))}
          </div>

          {isPaid && !isCompleted && (
            <button onClick={handleConfirmHandoff} disabled={confirming} style={{
              width: '100%', padding: '16px', backgroundColor: '#2d6a4f',
              color: 'white', border: 'none', borderRadius: '999px',
              fontSize: '16px', fontWeight: 500, cursor: 'pointer', marginBottom: '12px',
            }}>
              {confirming ? 'Confirming...' : '✓ I received the artwork'}
            </button>
          )}

          {isPaid && !isCompleted && !showIssue && !issueSubmitted && (
            <button onClick={() => setShowIssue(true)} style={{
              width: '100%', padding: '12px', backgroundColor: 'transparent',
              color: '#b94040', border: '1px solid #b94040', borderRadius: '999px',
              fontSize: '14px', cursor: 'pointer',
            }}>
              Report an issue
            </button>
          )}

          {showIssue && !issueSubmitted && (
            <div style={{ padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px', marginTop: '12px' }}>
              <p style={{ fontWeight: 600, marginBottom: '12px' }}>What went wrong?</p>
              {[
                { key: 'artist_no_show', label: 'Artist did not show up' },
                { key: 'buyer_no_show', label: 'Buyer did not show up' },
                { key: 'not_as_described', label: 'Artwork not as described' },
              ].map(type => (
                <button key={type.key} onClick={() => setIssueType(type.key)} style={{
                  display: 'block', width: '100%', padding: '10px 12px',
                  marginBottom: '8px', borderRadius: '8px', textAlign: 'left',
                  border: issueType === type.key ? '2px solid #b94040' : '1px solid #e8e8e8',
                  background: issueType === type.key ? '#fdf0f0' : 'white',
                  cursor: 'pointer', fontSize: '14px',
                }}>
                  {type.label}
                </button>
              ))}
              <textarea
                placeholder="Additional notes..."
                value={issueNotes}
                onChange={e => setIssueNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '14px', outline: 'none', resize: 'none', marginBottom: '12px' }}
              />
              <button onClick={handleReportIssue} disabled={!issueType || submittingIssue} style={{
                width: '100%', padding: '12px', backgroundColor: '#b94040',
                color: 'white', border: 'none', borderRadius: '999px',
                fontSize: '14px', cursor: 'pointer',
              }}>
                {submittingIssue ? 'Submitting...' : 'Submit issue'}
              </button>
            </div>
          )}

          {issueSubmitted && (
            <div style={{ padding: '1rem', backgroundColor: '#fdf0f0', borderRadius: '12px', marginTop: '12px', textAlign: 'center' }}>
              <p style={{ color: '#b94040', fontWeight: 600 }}>Issue reported</p>
              <p style={{ color: '#b94040', fontSize: '14px', marginTop: '4px' }}>We'll respond within 24 hours.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

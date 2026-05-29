'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HandoffClient({ reservation, userId }: any) {
  const [address, setAddress] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()
  const artwork = reservation.artworks

  // Countdown timer
  useEffect(() => {
    if (!reservation.reservation_expires_at) return
    const interval = setInterval(() => {
      const expires = new Date(reservation.reservation_expires_at).getTime()
      const now = Date.now()
      const diff = expires - now
      if (diff <= 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m remaining`)
    }, 1000)
    return () => clearInterval(interval)
  }, [reservation.reservation_expires_at])

  // Fetch address
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

  async function handleConfirmHandoff() {
    setConfirming(true)
    const supabase = createClient()
    await supabase.from('reservations').update({ status: 'handoff_completed' }).eq('id', reservation.id)
    await supabase.from('artworks').update({ status: 'sold' }).eq('id', artwork.id)
    router.refresh()
    setConfirming(false)
  }

  const isPaid = ['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup', 'handoff_completed'].includes(reservation.status)
  const isCompleted = reservation.status === 'handoff_completed'

  const images = artwork?.images as string[]

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '2rem', paddingBottom: '6rem' }}>
      {/* Artwork summary */}
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

      {/* Status */}
      {isCompleted ? (
        <div style={{ padding: '1rem', backgroundColor: '#eef4f1', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '18px' }}>✓ Handoff completed!</p>
          <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '4px' }}>The artwork is yours.</p>
        </div>
      ) : (
        <>
          {/* Countdown */}
          {timeLeft && (
            <div style={{ padding: '12px', backgroundColor: '#f5f3ef', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>⏱ {timeLeft}</p>
            </div>
          )}

          {/* Handoff code */}
          {isPaid && reservation.handoff_code && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Your handoff code — show this to the artist:</p>
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f5f3ef',
                borderRadius: '12px',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#0a0a0a',
              }}>
                {reservation.handoff_code}
              </div>
            </div>
          )}

          {/* Address */}
          {address && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Pickup address:</p>
              <p style={{ fontWeight: 600 }}>{address}</p>
            </div>
          )}

          {/* Progress steps */}
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

          {/* Confirm handoff button */}
          {isPaid && !isCompleted && (
            <button
              onClick={handleConfirmHandoff}
              disabled={confirming}
              style={{
                width: '100%', padding: '16px', backgroundColor: '#2d6a4f',
                color: 'white', border: 'none', borderRadius: '999px',
                fontSize: '16px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {confirming ? 'Confirming...' : '✓ I received the artwork'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

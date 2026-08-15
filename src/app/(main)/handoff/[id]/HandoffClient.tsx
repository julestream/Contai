'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'

// Pieces at or above this price get the secure gallery + Contai-present handoff.
// Stored in HUF (≈ €1,500). Tune this number anytime as rates drift.
const HIGH_VALUE_HUF = 600000

export default function HandoffClient({ reservation, userId, isBuyer, isArtist, justPaid }: any) {
  const { t, lang } = useLang()
  const h = (k: string) => t(`handoff.${k}`)
  const [address, setAddress] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [showIssue, setShowIssue] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [issueNotes, setIssueNotes] = useState('')
  const [issueSubmitted, setIssueSubmitted] = useState(false)
  const [submittingIssue, setSubmittingIssue] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const artwork = reservation.artworks

  // Scheduling state
  const [proposing, setProposing] = useState(false)
  const [proposedInput, setProposedInput] = useState('')
  const [showProposeInput, setShowProposeInput] = useState(false)

  const meetingAt: string | null = reservation.meeting_at
  const meetingConfirmedAt: string | null = reservation.meeting_confirmed_at
  const proposedByMe = reservation.meeting_proposed_by === userId
  const artistName = artwork?.profiles?.full_name || ''

  const salePrice = reservation.agreed_price ?? reservation.agreed_price_huf ?? artwork?.price_huf ?? 0
  const isHighValue = (reservation.agreed_price_huf ?? artwork?.price_huf ?? 0) >= HIGH_VALUE_HUF

  const localeMap: Record<string, string> = { hu: 'hu-HU', en: 'en-GB', ro: 'ro-RO' }
  function formatMeeting(iso: string) {
    try {
      return new Date(iso).toLocaleString(localeMap[lang] || 'en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  useEffect(() => {
    if (!reservation.reservation_expires_at) return
    const interval = setInterval(() => {
      const expires = new Date(reservation.reservation_expires_at).getTime()
      const diff = expires - Date.now()
      if (diff <= 0) { setTimeLeft(h('expired')); clearInterval(interval); return }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(h('remaining').replace('{h}', String(hours)).replace('{m}', String(minutes)))
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation.reservation_expires_at, lang])

  useEffect(() => {
    async function fetchAddress() {
      if (!isBuyer) return
      if (!meetingConfirmedAt) return
      const res = await fetch(`/api/address/${reservation.id}`)
      if (res.ok) {
        const data = await res.json()
        setAddress(data.address)
      }
    }
    fetchAddress()
  }, [reservation.id, meetingConfirmedAt, isBuyer])

  async function saveMeeting(action: 'propose' | 'confirm') {
    setProposing(true)
    setError('')
    try {
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          action,
          meetingAt: action === 'propose' ? new Date(proposedInput).toISOString() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || h('errMeeting')); setProposing(false); return }
      setShowProposeInput(false)
      router.refresh()
    } catch {
      setError(h('errMeeting'))
    }
    setProposing(false)
  }

  async function handleConfirmHandoff() {
    setConfirming(true)
    setError('')
    try {
      const res = await fetch('/api/confirm-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || h('errConfirm')); setConfirming(false); return }
      router.refresh()
    } catch {
      setError(h('errConfirm'))
    }
    setConfirming(false)
  }

  async function handleReportIssue() {
    setSubmittingIssue(true)
    setError('')
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id, issueType, issueNotes }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || h('errIssue')); setSubmittingIssue(false); return }
      setIssueSubmitted(true)
    } catch {
      setError(h('errIssue'))
    }
    setSubmittingIssue(false)
  }

  const isPaid = ['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup', 'handoff_completed'].includes(reservation.status)
  const isCompleted = reservation.status === 'handoff_completed'
  const images = artwork?.images as string[]

  const boxStyle: React.CSSProperties = {
    padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px', marginBottom: '1.5rem',
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '2rem', paddingBottom: '6rem' }}>
      {/* Touchpoint 1 — the moment just after payment */}
      {justPaid && isBuyer && !isCompleted && (
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', lineHeight: 1.25, marginBottom: '1rem' }}>
            {h('confirmedTitle').replace('{title}', artwork?.title || '')}
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#333', marginBottom: '0.9rem' }}>
            {h('confirmedNotified').replace('{artist}', artistName)}
          </p>
          <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#333', marginBottom: '0.9rem' }}>
            {h('confirmedChoice')}
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#8a8170' }}>
            {h('confirmedGuarantee')}
          </p>
        </div>
      )}

      {/* Artist framing */}
      {isArtist && !isCompleted && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '22px', marginBottom: '8px' }}>
            {h('artistTitle')}
          </h1>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#666' }}>{h('artistScheduling')}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', alignItems: 'center' }}>
        {images?.length > 0 && (
          <img src={images[0]} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600 }}>{artwork?.title}</p>
          <p style={{ color: '#666', fontSize: '14px' }}>{artistName}</p>
          <p style={{ color: '#666', fontSize: '14px' }}>{artwork?.pickup_area}</p>
        </div>
      </div>

      {/* High-value secure handoff notice */}
      {isHighValue && !isCompleted && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#f3efe6', border: '1px solid #e4d9c2' }}>
          <p style={{ fontWeight: 600, fontSize: '15px', color: '#0a0a0a', marginBottom: '6px' }}>{h('secureTitle')}</p>
          <p style={{ fontSize: '13.5px', color: '#5a5246', lineHeight: 1.6 }}>{h('secureBody')}</p>
          <p style={{ fontSize: '12.5px', color: '#8a8170', lineHeight: 1.6, marginTop: '8px' }}>{h('secureLocations')}</p>
        </div>
      )}

      {isCompleted ? (
        <div style={{ padding: '1rem', backgroundColor: '#eef4f1', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '18px' }}>{h('completedTitle')}</p>
          <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '4px' }}>{h('completedBody')}</p>
        </div>
      ) : (
        <>
          {timeLeft && (
            <div style={{ padding: '12px', backgroundColor: '#f5f3ef', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>{timeLeft}</p>
            </div>
          )}

          {/* ── Scheduling ─────────────────────────────────────── */}
          {isPaid && (
            <div style={boxStyle}>
              <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{h('schedulingTitle')}</p>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.55, marginBottom: '14px' }}>{h('schedulingBody')}</p>

              {meetingConfirmedAt ? (
                <div style={{ padding: '12px', background: '#eef4f1', borderRadius: '8px' }}>
                  <p style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '14px' }}>{h('meetingConfirmed')}</p>
                  <p style={{ color: '#2d6a4f', fontSize: '14px', marginTop: '2px' }}>{meetingAt && formatMeeting(meetingAt)}</p>
                </div>
              ) : meetingAt && !showProposeInput ? (
                <>
                  <p style={{ fontSize: '13px', color: '#666' }}>{h('proposedFor')}</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, margin: '2px 0 12px' }}>{formatMeeting(meetingAt)}</p>

                  {proposedByMe ? (
                    <p style={{ fontSize: '13px', color: '#999' }}>{h('waitingConfirm')}</p>
                  ) : (
                    <button onClick={() => saveMeeting('confirm')} disabled={proposing} style={{
                      width: '100%', padding: '13px', borderRadius: '999px', border: 'none',
                      background: '#0a0a0a', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                      marginBottom: '8px', opacity: proposing ? 0.6 : 1,
                    }}>
                      {proposing ? h('saving') : h('confirmTime')}
                    </button>
                  )}

                  <button onClick={() => { setShowProposeInput(true); setProposedInput('') }} style={{
                    width: '100%', padding: '11px', borderRadius: '999px',
                    border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a',
                    fontSize: '14px', cursor: 'pointer', marginTop: proposedByMe ? '10px' : 0,
                  }}>
                    {h('proposeAnother')}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="datetime-local"
                    value={proposedInput}
                    onChange={e => setProposedInput(e.target.value)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px',
                      border: '1px solid #e0dcd3', fontSize: '15px', outline: 'none', marginBottom: '10px',
                      fontFamily: 'var(--font-instrument), sans-serif',
                    }}
                  />
                  <button onClick={() => saveMeeting('propose')} disabled={proposing || !proposedInput} style={{
                    width: '100%', padding: '13px', borderRadius: '999px', border: 'none',
                    background: proposedInput ? '#0a0a0a' : '#d8d4cc', color: '#fff',
                    fontSize: '15px', fontWeight: 600,
                    cursor: proposedInput ? 'pointer' : 'not-allowed',
                    opacity: proposing ? 0.6 : 1,
                  }}>
                    {proposing ? h('saving') : h('proposeTime')}
                  </button>
                </>
              )}
            </div>
          )}

          {isPaid && reservation.handoff_code && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{h('yourCode')}</p>
              <div style={{
                padding: '1.5rem', backgroundColor: '#f5f3ef', borderRadius: '12px',
                textAlign: 'center', fontFamily: 'monospace', fontSize: '32px',
                fontWeight: 700, letterSpacing: '0.1em', color: '#0a0a0a',
              }}>
                {reservation.handoff_code}
              </div>
            </div>
          )}

          {/* Address — buyers only, and only once both have agreed */}
          {isBuyer && (
            address ? (
              <div style={boxStyle}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                  {isHighValue ? h('secureLocationLabel') : h('pickupAddressLabel')}
                </p>
                <p style={{ fontWeight: 600 }}>{address}</p>
              </div>
            ) : (
              <div style={{ ...boxStyle, background: '#faf8f5' }}>
                <p style={{ fontSize: '13px', color: '#8a857c', lineHeight: 1.55 }}>{h('addressLocked')}</p>
              </div>
            )
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            {[
              { label: h('stepFeePaid'), done: isPaid },
              { label: h('stepAddressRevealed'), done: !!meetingConfirmedAt },
              { label: h('stepHandoffConfirmed'), done: isCompleted },
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

          {isBuyer && isPaid && !isCompleted && (
            <button onClick={handleConfirmHandoff} disabled={confirming} style={{
              width: '100%', padding: '16px', backgroundColor: '#2d6a4f',
              color: 'white', border: 'none', borderRadius: '999px',
              fontSize: '16px', fontWeight: 500, cursor: 'pointer', marginBottom: '12px',
            }}>
              {confirming ? h('confirming') : h('receivedArtwork')}
            </button>
          )}

          {isPaid && !isCompleted && !showIssue && !issueSubmitted && (
            <button onClick={() => setShowIssue(true)} style={{
              width: '100%', padding: '12px', backgroundColor: 'transparent',
              color: '#b94040', border: '1px solid #b94040', borderRadius: '999px',
              fontSize: '14px', cursor: 'pointer',
            }}>
              {h('reportIssue')}
            </button>
          )}

          {showIssue && !issueSubmitted && (
            <div style={{ padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px', marginTop: '12px' }}>
              <p style={{ fontWeight: 600, marginBottom: '12px' }}>{h('whatWentWrong')}</p>
              {[
                { key: 'artist_no_show', label: h('issueArtistNoShow') },
                { key: 'buyer_no_show', label: h('issueBuyerNoShow') },
                { key: 'not_as_described', label: h('issueNotAsDescribed') },
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
                placeholder={h('additionalNotes')}
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
                {submittingIssue ? h('submitting') : h('submitIssue')}
              </button>
            </div>
          )}

          {issueSubmitted && (
            <div style={{ padding: '1rem', backgroundColor: '#fdf0f0', borderRadius: '12px', marginTop: '12px', textAlign: 'center' }}>
              <p style={{ color: '#b94040', fontWeight: 600 }}>{h('issueReported')}</p>
              <p style={{ color: '#b94040', fontSize: '14px', marginTop: '4px' }}>{h('issueResponse')}</p>
            </div>
          )}

          {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>{error}</p>}
        </>
      )}
    </div>
  )
}
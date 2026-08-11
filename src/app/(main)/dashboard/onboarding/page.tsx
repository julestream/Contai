'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useLang()
  const o = (k: string) => t(`onboarding.${k}`)
  const label = (map: string, key: string) => {
    const m = t(map) as any
    return (m && m[key]) || key
  }

  // Intro gate — artists confirm the standard before they begin.
  const [started, setStarted] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [statement, setStatement] = useState('')
  const [city, setCity] = useState('')
  const [pickupArea, setPickupArea] = useState('')
  const [mediums, setMediums] = useState<string[]>([])

  function toggleMedium(m: string) {
    setMediums(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function handleFinish() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setError(o('errNotLoggedIn'))
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        artist_statement: statement,
        city,
        pickup_area: pickupArea,
        mediums,
        artist_terms_accepted_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const steps = [o('stepIdentity'), o('stepAbout'), o('stepLocation'), o('stepPractice'), o('stepReview')]

  // ── Intro screen ──────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo />
        </div>

        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', lineHeight: 1.25, marginBottom: '1.25rem' }}>
          {o('introTitle')}
        </h1>

        <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#333', marginBottom: '1rem' }}>
          {o('introLead')}
        </p>

        <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#333', marginBottom: '1.25rem' }}>
          {o('introStandard')}
        </p>

        <div style={{ padding: '14px 16px', background: '#f5f3ef', borderRadius: '12px', marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#5a5246', margin: 0 }}>
            {o('introReview')}
          </p>
        </div>

        <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.75rem' }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px', lineHeight: 1.55, color: '#0a0a0a' }}>
            {o('confirmLabel')}
          </span>
        </label>

        <button
          onClick={() => setStarted(true)}
          disabled={!accepted}
          style={{
            width: '100%', padding: '15px', borderRadius: '999px', border: 'none',
            background: accepted ? '#0a0a0a' : '#d8d4cc',
            color: accepted ? '#f5f3ef' : '#fff',
            fontSize: '16px', fontWeight: 600,
            cursor: accepted ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-instrument), sans-serif',
            transition: 'background 0.2s',
          }}
        >
          {o('begin')}
        </button>
      </div>
    )
  }

  // ── Onboarding steps ──────────────────────────────────────────
  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Logo />
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            backgroundColor: i + 1 <= step ? '#0a0a0a' : '#e8e8e8',
          }} />
        ))}
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '1.5rem' }}>
        {steps[step - 1]}
      </h2>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            placeholder={o('fullName')}
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
          />
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            placeholder={o('bioPlaceholder')}
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 500))}
            rows={4}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none', resize: 'none' }}
          />
          <span style={{ fontSize: '12px', color: '#999' }}>{bio.length}/500</span>
          <textarea
            placeholder={o('statementPlaceholder')}
            value={statement}
            onChange={e => setStatement(e.target.value.slice(0, 300))}
            rows={3}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none', resize: 'none' }}
          />
          <span style={{ fontSize: '12px', color: '#999' }}>{statement.length}/300</span>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            placeholder={o('cityPlaceholder')}
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
          />
          <input
            placeholder={o('pickupAreaPlaceholder')}
            value={pickupArea}
            onChange={e => setPickupArea(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
          />
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {MEDIUMS.map(m => (
            <button
              key={m}
              onClick={() => toggleMedium(m)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: mediums.includes(m) ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                background: mediums.includes(m) ? '#0a0a0a' : 'white',
                color: mediums.includes(m) ? 'white' : '#0a0a0a',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >{label('upload.mediumLabels', m)}</button>
          ))}
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f5f3ef', borderRadius: '8px' }}>
            <p><strong>{o('reviewName')}</strong> {fullName}</p>
            <p><strong>{o('reviewBio')}</strong> {bio}</p>
            <p><strong>{o('reviewLocation')}</strong> {city}</p>
            <p><strong>{o('reviewPickup')}</strong> {pickupArea}</p>
            <p><strong>{o('reviewMediums')}</strong> {mediums.map(m => label('upload.mediumLabels', m)).join(', ')}</p>
          </div>
          {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(s => s - 1)}>{o('back')}</Button>
        )}
        {step < 5 ? (
          <Button full onClick={() => setStep(s => s + 1)}>{o('continue')}</Button>
        ) : (
          <Button full onClick={handleFinish} loading={loading}>{o('finish')}</Button>
        )}
      </div>
    </div>
  )
}
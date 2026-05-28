'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import { useRouter } from 'next/navigation'

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Drawing', 'Print', 'Linocut', 'Mixed Media', 'Sculpture', 'Photography', 'Other']

export default function OnboardingPage() {
  const router = useRouter()
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
      setError('Not logged in. Please sign in again.')
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
      })
      .eq('id', session.user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const steps = ['Identity', 'About', 'Location', 'Practice', 'Review']

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
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
          />
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            placeholder="Bio (max 500 characters)"
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 500))}
            rows={4}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none', resize: 'none' }}
          />
          <span style={{ fontSize: '12px', color: '#999' }}>{bio.length}/500</span>
          <textarea
            placeholder="Artist statement (max 300 characters)"
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
            placeholder="City / district in Budapest"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
          />
          <input
            placeholder="Public pickup area (e.g. 7th district)"
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
            >{m}</button>
          ))}
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f5f3ef', borderRadius: '8px' }}>
            <p><strong>Name:</strong> {fullName}</p>
            <p><strong>Bio:</strong> {bio}</p>
            <p><strong>Location:</strong> {city}</p>
            <p><strong>Pickup area:</strong> {pickupArea}</p>
            <p><strong>Mediums:</strong> {mediums.join(', ')}</p>
          </div>
          {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>
        )}
        {step < 5 ? (
          <Button full onClick={() => setStep(s => s + 1)}>Continue</Button>
        ) : (
          <Button full onClick={handleFinish} loading={loading}>Finish</Button>
        )}
      </div>
    </div>
  )
}

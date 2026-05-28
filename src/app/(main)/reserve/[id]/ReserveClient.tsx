'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

export default function ReserveClient({ artwork }: { artwork: any }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fee = artwork.reservation_fee_huf
  const remaining = artwork.price_huf - fee

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId: artwork.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '2rem', paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Logo />
      </div>

      {step === 1 && (
        <>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Reserve artwork</h1>

          {/* Artwork summary */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'center' }}>
            {(artwork.images as string[])?.length > 0 && (
              <img src={(artwork.images as string[])[0]} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <div>
              <p style={{ fontWeight: 600 }}>{artwork.title}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>{(artwork as any).profiles?.full_name}</p>
            </div>
          </div>

          {/* Payment breakdown */}
          <div style={{ padding: '1rem', backgroundColor: '#f5f3ef', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Artwork price</span>
              <span style={{ fontSize: '14px' }}>{artwork.price_huf?.toLocaleString()} HUF</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Reservation fee (8%)</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{fee?.toLocaleString()} HUF</span>
            </div>
            <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Remaining to pay in person</span>
              <span style={{ fontSize: '14px' }}>{remaining?.toLocaleString()} HUF</span>
            </div>
          </div>

          {/* What happens */}
          <div style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#444' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>What happens next:</p>
            <p>1. Pay the reservation fee online</p>
            <p>2. Get the artist's address revealed</p>
            <p>3. Arrange pickup within 48 hours</p>
            <p>4. Pay the remaining balance in person</p>
          </div>

          {/* Guarantee */}
          <div style={{ padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
            🛡 Contai Guarantee — full refund if something goes wrong
          </div>

          <Button full onClick={() => setStep(2)}>Continue to payment</Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Confirm reservation</h1>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'center', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            {(artwork.images as string[])?.length > 0 && (
              <img src={(artwork.images as string[])[0]} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <div>
              <p style={{ fontWeight: 600 }}>{artwork.title}</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '4px' }}>{fee?.toLocaleString()} HUF</p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.5rem' }}>
            By paying you agree to the Contai reservation policy. The fee is deducted from the total price.
          </p>

          {error && <p style={{ color: '#b94040', fontSize: '14px', marginBottom: '1rem' }}>{error}</p>}

          <Button full onClick={handlePay} loading={loading}>
            Pay {fee?.toLocaleString()} HUF
          </Button>
          <Button full variant="ghost" onClick={() => setStep(1)}>Back</Button>
        </>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Price from '@/components/ui/Price'

export default function ReserveClient({ artwork, agreedOffer }: { artwork: any, agreedOffer: any }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Use agreed offer price if present, otherwise listed price
  const effectivePrice = agreedOffer ? agreedOffer.amount_huf : artwork.price_huf
  const fee = agreedOffer ? Math.max(500, Math.round(agreedOffer.amount_huf * 0.08)) : artwork.reservation_fee_huf
  const remaining = effectivePrice - fee

  // What pickup options does the artist offer? (artwork.pickup_method)
  const offersDelivery = artwork.pickup_method === 'local_delivery'
  const [deliveryChoice, setDeliveryChoice] = useState<'pickup' | 'delivery'>('pickup')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkId: artwork.id,
          offerId: agreedOffer ? agreedOffer.id : null,
          deliveryChoice,
        }),
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
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Reserve artwork</h1>

          {agreedOffer && (
            <div style={{ padding: '10px 14px', backgroundColor: '#eef2ee', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '14px', color: '#3a5a44' }}>
              Agreed price from your accepted offer: <Price huf={agreedOffer.amount_huf} />
            </div>
          )}

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
              <Price huf={effectivePrice} style={{ fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Reservation fee (8%)</span>
              <Price huf={fee} style={{ fontSize: '14px', fontWeight: 600 }} />
            </div>
            <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Remaining to pay in person</span>
              <Price huf={remaining} style={{ fontSize: '14px' }} />
            </div>
          </div>

          {/* Pickup / delivery choice */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>How would you like to receive it?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeliveryChoice('pickup')}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                  border: deliveryChoice === 'pickup' ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
                  background: deliveryChoice === 'pickup' ? '#0a0a0a' : '#fff', color: deliveryChoice === 'pickup' ? '#fff' : '#0a0a0a' }}>
                In-person pickup
              </button>
              {offersDelivery && (
                <button onClick={() => setDeliveryChoice('delivery')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                    border: deliveryChoice === 'delivery' ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
                    background: deliveryChoice === 'delivery' ? '#0a0a0a' : '#fff', color: deliveryChoice === 'delivery' ? '#fff' : '#0a0a0a' }}>
                  Local delivery
                </button>
              )}
            </div>
            {deliveryChoice === 'delivery' && (
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Delivery details and any cost are arranged directly with the artist in your messages.
              </p>
            )}
          </div>

          {/* What happens */}
          <div style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#444' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>What happens next:</p>
            <p>1. Pay the reservation fee online</p>
            <p>2. Get the artist's address revealed</p>
            <p>3. Arrange {deliveryChoice === 'delivery' ? 'delivery' : 'pickup'} within 48 hours</p>
            <p>4. Pay the remaining balance in person</p>
          </div>

          {/* Guarantee */}
          <div style={{ padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
            Contai Guarantee — full refund if something goes wrong
          </div>

          <Button full onClick={() => setStep(2)}>Continue to payment</Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Confirm reservation</h1>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'center', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            {(artwork.images as string[])?.length > 0 && (
              <img src={(artwork.images as string[])[0]} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <div>
              <p style={{ fontWeight: 600 }}>{artwork.title}</p>
              <Price huf={fee} style={{ display: 'block', fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px', marginTop: '4px' }} />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{deliveryChoice === 'delivery' ? 'Local delivery' : 'In-person pickup'}</p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.5rem' }}>
            By paying you agree to the Contai reservation policy. The fee is deducted from the total price.
          </p>

          {error && <p style={{ color: '#b94040', fontSize: '14px', marginBottom: '1rem' }}>{error}</p>}

          <Button full onClick={handlePay} loading={loading}>
            Pay <Price huf={fee} />
          </Button>
          <Button full variant="ghost" onClick={() => setStep(1)}>Back</Button>
        </>
      )}
    </div>
  )
}
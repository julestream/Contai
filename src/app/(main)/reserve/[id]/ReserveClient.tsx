'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Price from '@/components/ui/Price'
import { useLang } from '@/i18n/LanguageProvider'
import { useCurrency } from '@/currency/CurrencyProvider'
import { reservationFee, normaliseCurrency } from '@/lib/fees'

export default function ReserveClient({ artwork, agreedOffer }: { artwork: any, agreedOffer: any }) {
  const { t } = useLang()
  const { currency: viewerCurrency } = useCurrency()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // The artist's currency governs the transaction; an accepted offer inherits it.
  const currency = normaliseCurrency(agreedOffer?.currency ?? artwork.price_currency)
  const effectivePrice = agreedOffer
    ? (agreedOffer.amount ?? agreedOffer.amount_huf)
    : (artwork.price_amount ?? artwork.price_huf)
  const fee = agreedOffer
    ? reservationFee(effectivePrice, currency)
    : (artwork.reservation_fee_amount ?? reservationFee(effectivePrice, currency))
  const remaining = effectivePrice - fee
  const showConverted = viewerCurrency !== currency

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
        setError(data.error || t('reserve.somethingWrong'))
        setLoading(false)
      }
    } catch {
      setError(t('reserve.somethingWrong'))
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
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>{t('reserve.reserveArtwork')}</h1>

          {agreedOffer && (
            <div style={{ padding: '10px 14px', backgroundColor: '#eef2ee', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '14px', color: '#3a5a44' }}>
              {t('reserve.agreedPrice')} <Price amount={effectivePrice} currency={currency} native />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'center' }}>
            {(artwork.images as string[])?.length > 0 && (
              <img src={(artwork.images as string[])[0]} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600 }}>{artwork.title}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>{(artwork as any).profiles?.full_name}</p>
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f5f3ef', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>{t('reserve.artworkPrice')}</span>
              <Price amount={effectivePrice} currency={currency} native style={{ fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>{t('reserve.reservationFee')}</span>
              <Price amount={fee} currency={currency} native style={{ fontSize: '14px', fontWeight: 600 }} />
            </div>
            <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>{t('reserve.remainingInPerson')}</span>
              <Price amount={remaining} currency={currency} native style={{ fontSize: '14px' }} />
            </div>
            {showConverted && (
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', textAlign: 'right' }}>
                <Price amount={effectivePrice} currency={currency} />
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>{t('reserve.howReceive')}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeliveryChoice('pickup')}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                  border: deliveryChoice === 'pickup' ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
                  background: deliveryChoice === 'pickup' ? '#0a0a0a' : '#fff', color: deliveryChoice === 'pickup' ? '#fff' : '#0a0a0a' }}>
                {t('reserve.inPersonPickup')}
              </button>
              {offersDelivery && (
                <button onClick={() => setDeliveryChoice('delivery')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                    border: deliveryChoice === 'delivery' ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
                    background: deliveryChoice === 'delivery' ? '#0a0a0a' : '#fff', color: deliveryChoice === 'delivery' ? '#fff' : '#0a0a0a' }}>
                  {t('reserve.localDelivery')}
                </button>
              )}
            </div>
            {deliveryChoice === 'delivery' && (
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                {t('reserve.deliveryNote')}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#444' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>{t('reserve.whatHappens')}</p>
            <p>1. {t('reserve.step1')}</p>
            <p>2. {t('reserve.step2')}</p>
            <p>3. {deliveryChoice === 'delivery' ? t('reserve.step3delivery') : t('reserve.step3pickup')}</p>
            <p>4. {t('reserve.step4')}</p>
          </div>

          <div style={{ padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
            {t('artwork.guaranteeStrip')}
          </div>

          <Button full onClick={() => setStep(2)}>{t('reserve.continuePayment')}</Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>{t('reserve.confirmReservation')}</h1>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'center', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            {(artwork.images as string[])?.length > 0 && (
              <img src={(artwork.images as string[])[0]} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600 }}>{artwork.title}</p>
              <Price amount={fee} currency={currency} native style={{ display: 'block', fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px', marginTop: '4px' }} />
              {showConverted && (
                <Price amount={fee} currency={currency} style={{ display: 'block', fontSize: '12px', color: '#999', marginTop: '2px' }} />
              )}
              <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{deliveryChoice === 'delivery' ? t('reserve.localDelivery') : t('reserve.inPersonPickup')}</p>
            </div>
          </div>

          {/* Who invoices what. The last thing read before paying. */}
          <div style={{ padding: '14px 16px', background: '#f5f3ef', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>
              {t('reserve.invoicingTitle')}
            </p>
            <p style={{ fontSize: '13px', color: '#5a5246', lineHeight: 1.6 }}>
              {t('reserve.invoicingNote')}
            </p>
          </div>

          <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.5rem' }}>
            {t('reserve.agreePolicy')}
          </p>

          {error && <p style={{ color: '#b94040', fontSize: '14px', marginBottom: '1rem' }}>{error}</p>}

          <Button full onClick={handlePay} loading={loading}>
            {t('reserve.pay')} <Price amount={fee} currency={currency} native />
          </Button>
          <Button full variant="ghost" onClick={() => setStep(1)}>{t('reserve.back')}</Button>
        </>
      )}
    </div>
  )
}
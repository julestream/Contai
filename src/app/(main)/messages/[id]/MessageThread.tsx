'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Send, X } from 'lucide-react'
import Price from '@/components/ui/Price'
import { useLang } from '@/i18n/LanguageProvider'
import { useCurrency } from '@/currency/CurrencyProvider'
import { reservationFee, normaliseCurrency } from '@/lib/fees'

const SYMBOL: Record<string, string> = { HUF: 'Ft', EUR: '€', RON: 'lei' }

export default function MessageThread({ conversation, initialMessages, initialOffers, currentUserId }: any) {
  const router = useRouter()
  const { t } = useLang()
  const { currency: viewerCurrency } = useCurrency()
  const autoOffer = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('makeOffer') === '1'

  const [messages, setMessages] = useState(initialMessages)
  const [offers, setOffers] = useState(initialOffers || [])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showOfferInput, setShowOfferInput] = useState(autoOffer)
  const [offerAmount, setOfferAmount] = useState('')
  const [working, setWorking] = useState(false)
  const [showSafety, setShowSafety] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const artwork = conversation.artworks
  const images = artwork?.images as string[]
  const isArtist = currentUserId === conversation.artist_id
  const isBuyer = currentUserId === conversation.buyer_id

  // Offers are always denominated in the artist's currency.
  const currency = normaliseCurrency(artwork?.price_currency)
  const artworkPrice = artwork?.price_amount ?? artwork?.price_huf

  const latestOffer = offers.length > 0 ? offers[offers.length - 1] : null

  function offerValue(o: any) {
    return o.amount ?? o.amount_huf
  }
  function offerCurrency(o: any) {
    return normaliseCurrency(o.currency)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, offers])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`thread-${conversation.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` },
        (payload) => setMessages((prev: any[]) => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers', filter: `conversation_id=eq.${conversation.id}` },
        (payload) => setOffers((prev: any[]) => prev.some(o => o.id === payload.new.id) ? prev : [...prev, payload.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'offers', filter: `conversation_id=eq.${conversation.id}` },
        (payload) => setOffers((prev: any[]) => prev.map(o => o.id === payload.new.id ? payload.new : o)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversation.id])

  async function sendMessage() {
    if (!content.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: inserted } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: session.user.id,
      content: content.trim(),
    }).select('*').single()
    if (inserted) setMessages((prev: any[]) => prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted])
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id)
    setContent('')
    setSending(false)
  }

  async function submitOffer(proposedBy: 'buyer' | 'artist') {
    const amount = parseFloat(offerAmount)
    if (!amount || amount <= 0) return
    setWorking(true)
    const supabase = createClient()
    if (latestOffer && latestOffer.status === 'pending') {
      await supabase.from('offers').update({ status: 'countered' }).eq('id', latestOffer.id)
      setOffers((prev: any[]) => prev.map(o => o.id === latestOffer.id ? { ...o, status: 'countered' } : o))
    }
    const { data: newOffer } = await supabase.from('offers').insert({
      conversation_id: conversation.id,
      artwork_id: artwork.id,
      buyer_id: conversation.buyer_id,
      artist_id: conversation.artist_id,
      // Authoritative
      amount,
      currency,
      // Legacy column — only meaningful for forint deals
      amount_huf: currency === 'HUF' ? Math.round(amount) : null,
      status: 'pending',
      proposed_by: proposedBy,
    }).select('*').single()
    if (newOffer) setOffers((prev: any[]) => prev.some(o => o.id === newOffer.id) ? prev : [...prev, newOffer])
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id)
    setOfferAmount('')
    setShowOfferInput(false)
    setWorking(false)
  }

  async function respondToOffer(offerId: string, newStatus: 'accepted' | 'declined') {
    setWorking(true)
    const supabase = createClient()
    await supabase.from('offers').update({ status: newStatus }).eq('id', offerId)
    setOffers((prev: any[]) => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o))
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversation.id)
    setWorking(false)
  }

  const timeline = [
    ...messages.map((m: any) => ({ kind: 'message', at: m.created_at, data: m })),
    ...offers.map((o: any) => ({ kind: 'offer', at: o.created_at, data: o })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', height: 'calc(100dvh - 56px)', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {images?.length > 0 && (
          <img src={images[0]} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{artwork?.title}</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            {artworkPrice ? <Price amount={artworkPrice} currency={currency} native /> : null}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {timeline.map((item) => {
          if (item.kind === 'message') {
            const msg = item.data
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={'m' + msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: isMe ? '#0a0a0a' : '#f5f3ef',
                  color: isMe ? 'white' : '#0a0a0a', fontSize: '14px',
                }}>
                  {msg.content}
                </div>
              </div>
            )
          } else {
            const offer = item.data
            const oValue = offerValue(offer)
            const oCurrency = offerCurrency(offer)
            const fee = reservationFee(oValue, oCurrency)
            const showConverted = viewerCurrency !== oCurrency
            const isLatest = latestOffer && offer.id === latestOffer.id
            const fromMe = (offer.proposed_by === 'buyer' && isBuyer) || (offer.proposed_by === 'artist' && isArtist)
            return (
              <div key={'o' + offer.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <div style={{ width: '85%', border: '1px solid #d8d4cc', borderRadius: '14px', padding: '14px', background: '#fff' }}>
                  <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {offer.proposed_by === 'buyer' ? t('messages.buyerOffer') : t('messages.artistCounter')}
                  </p>
                  <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '22px', margin: '4px 0 0' }}>
                    <Price amount={oValue} currency={oCurrency} native />
                  </p>
                  {showConverted && (
                    <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 4px' }}>
                      <Price amount={oValue} currency={oCurrency} />
                    </p>
                  )}
                  <p style={{ fontSize: '12px', color: '#999', marginTop: showConverted ? 0 : '4px' }}>
                    {t('messages.reservationFeeLine')} <Price amount={fee} currency={oCurrency} native />
                  </p>

                  {offer.status === 'accepted' && <p style={{ fontSize: '13px', color: '#2d6a4f', fontWeight: 600, marginTop: '8px' }}>{t('messages.accepted')}</p>}
                  {offer.status === 'declined' && <p style={{ fontSize: '13px', color: '#b94040', fontWeight: 600, marginTop: '8px' }}>{t('messages.declined')}</p>}
                  {offer.status === 'countered' && <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>{t('messages.countered')}</p>}

                  {isLatest && offer.status === 'pending' && !fromMe && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => respondToOffer(offer.id, 'accepted')} disabled={working}
                        style={{ flex: 1, padding: '10px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>
                        {t('messages.accept')}
                      </button>
                      <button onClick={() => { setShowOfferInput(true); setOfferAmount(String(oValue)) }} disabled={working}
                        style={{ flex: 1, padding: '10px', borderRadius: '999px', border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a', fontSize: '14px', cursor: 'pointer' }}>
                        {t('messages.counter')}
                      </button>
                      <button onClick={() => respondToOffer(offer.id, 'declined')} disabled={working}
                        style={{ width: '100%', padding: '8px', borderRadius: '999px', border: 'none', background: 'transparent', color: '#b94040', fontSize: '13px', cursor: 'pointer' }}>
                        {t('messages.decline')}
                      </button>
                    </div>
                  )}

                  {isLatest && offer.status === 'pending' && fromMe && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>{t('messages.waitingResponse')}</p>
                  )}

                  {isLatest && offer.status === 'accepted' && isBuyer && (
                    <button onClick={() => router.push(`/reserve/${artwork.id}?offer=${offer.id}`)}
                      style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      {t('messages.reserveAt')} <Price amount={oValue} currency={oCurrency} native />
                    </button>
                  )}
                </div>
              </div>
            )
          }
        })}
        <div ref={bottomRef} />
      </div>

      {/* Safety notice */}
      {showSafety && (
        <div style={{ flexShrink: 0, padding: '10px 14px', background: '#fbf3e2', borderTop: '1px solid #f0e2c4', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <p style={{ fontSize: '12px', color: '#7a5d1e', lineHeight: 1.45, flex: 1, margin: 0 }}>{t('messages.safety')}</p>
          <button onClick={() => setShowSafety(false)} aria-label={t('messages.cancel')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b89b5e', flexShrink: 0, padding: 0, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Offer composer */}
      {showOfferInput && (
        <div style={{ flexShrink: 0, padding: '12px 1rem', borderTop: '1px solid #e8e8e8', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e0dcd3', borderRadius: '999px', padding: '0 14px' }}>
            <input
              value={offerAmount}
              onChange={e => setOfferAmount(e.target.value)}
              placeholder={t('common.priceLabel')}
              inputMode="numeric"
              style={{ flex: 1, minWidth: 0, padding: '12px 0', border: 'none', fontSize: '15px', outline: 'none', background: 'transparent' }}
            />
            <span style={{ fontSize: '14px', color: '#999', flexShrink: 0 }}>{SYMBOL[currency]}</span>
          </div>
          <button onClick={() => submitOffer(isArtist ? 'artist' : 'buyer')} disabled={working}
            style={{ padding: '12px 18px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}>
            {t('messages.send')}
          </button>
          <button onClick={() => { setShowOfferInput(false); setOfferAmount('') }}
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>
            {t('messages.cancel')}
          </button>
        </div>
      )}

      {/* Composer */}
      <div style={{ flexShrink: 0, padding: '12px 1rem', borderTop: '1px solid #e8e8e8', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {!showOfferInput && (
          <button onClick={() => setShowOfferInput(true)}
            style={{ padding: '10px 14px', borderRadius: '999px', border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}>
            {t('messages.offer')}
          </button>
        )}
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          placeholder={t('messages.messagePlaceholder')}
          style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '999px', border: '1px solid #e0dcd3', fontSize: '15px', outline: 'none' }}
        />
        <button onClick={sendMessage} disabled={sending} aria-label={t('messages.send')}
          style={{ padding: '12px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
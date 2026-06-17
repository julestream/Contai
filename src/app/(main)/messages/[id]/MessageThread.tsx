'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

export default function MessageThread({ conversation, initialMessages, initialOffers, currentUserId }: any) {
  const router = useRouter()
  const autoOffer = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('makeOffer') === '1'

  const [messages, setMessages] = useState(initialMessages)
  const [offers, setOffers] = useState(initialOffers || [])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showOfferInput, setShowOfferInput] = useState(autoOffer)
  const [offerAmount, setOfferAmount] = useState('')
  const [working, setWorking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const artwork = conversation.artworks
  const images = artwork?.images as string[]
  const isArtist = currentUserId === conversation.artist_id
  const isBuyer = currentUserId === conversation.buyer_id

  const latestOffer = offers.length > 0 ? offers[offers.length - 1] : null

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
    const amount = parseInt(offerAmount)
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
      amount_huf: amount,
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
    <div style={{ maxWidth: '430px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {images?.length > 0 && (
          <img src={images[0]} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
        )}
        <div>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{artwork?.title}</p>
          <p style={{ fontSize: '12px', color: '#999' }}>{artwork?.price_huf?.toLocaleString()} HUF</p>
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
            const fee = Math.max(500, Math.round(offer.amount_huf * 0.08))
            const isLatest = latestOffer && offer.id === latestOffer.id
            const fromMe = (offer.proposed_by === 'buyer' && isBuyer) || (offer.proposed_by === 'artist' && isArtist)
            return (
              <div key={'o' + offer.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <div style={{ width: '85%', border: '1px solid #d8d4cc', borderRadius: '14px', padding: '14px', background: '#fff' }}>
                  <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {offer.proposed_by === 'buyer' ? 'Buyer offer' : 'Artist counter'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '22px', margin: '4px 0' }}>
                    {offer.amount_huf.toLocaleString()} HUF
                  </p>
                  <p style={{ fontSize: '12px', color: '#999' }}>Reservation fee (8%): {fee.toLocaleString()} HUF</p>

                  {offer.status === 'accepted' && <p style={{ fontSize: '13px', color: '#2d6a4f', fontWeight: 600, marginTop: '8px' }}>Accepted</p>}
                  {offer.status === 'declined' && <p style={{ fontSize: '13px', color: '#b94040', fontWeight: 600, marginTop: '8px' }}>Declined</p>}
                  {offer.status === 'countered' && <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>Countered</p>}

                  {isLatest && offer.status === 'pending' && !fromMe && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => respondToOffer(offer.id, 'accepted')} disabled={working}
                        style={{ flex: 1, padding: '10px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>
                        Accept
                      </button>
                      <button onClick={() => { setShowOfferInput(true); setOfferAmount(String(offer.amount_huf)) }} disabled={working}
                        style={{ flex: 1, padding: '10px', borderRadius: '999px', border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a', fontSize: '14px', cursor: 'pointer' }}>
                        Counter
                      </button>
                      <button onClick={() => respondToOffer(offer.id, 'declined')} disabled={working}
                        style={{ width: '100%', padding: '8px', borderRadius: '999px', border: 'none', background: 'transparent', color: '#b94040', fontSize: '13px', cursor: 'pointer' }}>
                        Decline
                      </button>
                    </div>
                  )}

                  {isLatest && offer.status === 'pending' && fromMe && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>Waiting for a response...</p>
                  )}

                  {isLatest && offer.status === 'accepted' && isBuyer && (
                    <button onClick={() => router.push(`/reserve/${artwork.id}?offer=${offer.id}`)}
                      style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      Reserve at {offer.amount_huf.toLocaleString()} HUF
                    </button>
                  )}
                </div>
              </div>
            )
          }
        })}
        <div ref={bottomRef} />
      </div>

      {/* Offer composer */}
      {showOfferInput && (
        <div style={{ padding: '12px 1rem', borderTop: '1px solid #e8e8e8', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={offerAmount}
            onChange={e => setOfferAmount(e.target.value)}
            placeholder="Your price in HUF"
            inputMode="numeric"
            style={{ flex: 1, padding: '12px', borderRadius: '999px', border: '1px solid #e0dcd3', fontSize: '15px', outline: 'none' }}
          />
          <button onClick={() => submitOffer(isArtist ? 'artist' : 'buyer')} disabled={working}
            style={{ padding: '12px 18px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>
            Send
          </button>
          <button onClick={() => { setShowOfferInput(false); setOfferAmount('') }}
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Composer */}
      <div style={{ padding: '12px 1rem', borderTop: '1px solid #e8e8e8', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {!showOfferInput && (
          <button onClick={() => setShowOfferInput(true)}
            style={{ padding: '10px 14px', borderRadius: '999px', border: '1px solid #0a0a0a', background: '#fff', color: '#0a0a0a', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}>
            Offer
          </button>
        )}
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Message..."
          style={{ flex: 1, padding: '12px', borderRadius: '999px', border: '1px solid #e0dcd3', fontSize: '15px', outline: 'none' }}
        />
        <button onClick={sendMessage} disabled={sending} aria-label="Send"
          style={{ padding: '12px', borderRadius: '999px', border: 'none', background: '#0a0a0a', color: '#fff', cursor: 'pointer', display: 'flex' }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
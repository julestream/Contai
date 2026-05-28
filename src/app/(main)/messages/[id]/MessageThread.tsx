'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Send } from 'lucide-react'

export default function MessageThread({ conversation, initialMessages, currentUserId }: any) {
  const [messages, setMessages] = useState(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const artwork = conversation.artworks
  const images = artwork?.images as string[]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`,
      }, (payload) => {
        setMessages((prev: any[]) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversation.id])

  async function sendMessage() {
    if (!content.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: session.user.id,
      content: content.trim(),
    })

    await supabase.from('conversations').update({
      last_message_at: new Date().toISOString(),
    }).eq('id', conversation.id)

    setContent('')
    setSending(false)
  }

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

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: isMe ? '#0a0a0a' : '#f5f3ef',
                color: isMe ? 'white' : '#0a0a0a',
                fontSize: '14px',
              }}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem', borderTop: '1px solid #e8e8e8', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Message..."
          style={{ flex: 1, padding: '10px 16px', borderRadius: '999px', border: '1px solid #e8e8e8', fontSize: '14px', outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !content.trim()}
          style={{ width: '40px', height: '40px', borderRadius: '999px', backgroundColor: '#0a0a0a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  )
}

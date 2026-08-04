import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export default async function MessagesListPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const m = getDict(lang).messages

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, artworks(title, images), buyer:profiles!conversations_buyer_id_fkey(full_name), artist:profiles!conversations_artist_id_fkey(full_name)')
    .or(`buyer_id.eq.${user.id},artist_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  const convIds = (conversations || []).map((c: any) => c.id)

  let unreadConvIds = new Set<string>()
  if (convIds.length > 0) {
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .neq('sender_id', user.id)
      .eq('read', false)
    unreadConvIds = new Set((unreadMessages || []).map((m: any) => m.conversation_id))
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{m.messages}</h1>
      </div>

      {(!conversations || conversations.length === 0) && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          {m.noConversations}
        </div>
      )}

      <div>
        {conversations?.map(conv => {
          const artwork = (conv as any).artworks
          const images = artwork?.images as string[]
          const otherPerson = (conv as any).buyer_id === user.id
            ? (conv as any).artist?.full_name
            : (conv as any).buyer?.full_name
          const isUnread = unreadConvIds.has(conv.id)

          return (
            <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '1rem', borderBottom: '1px solid #e8e8e8',
                background: isUnread ? '#fdfaf6' : 'transparent',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {images?.length > 0 ? (
                    <img src={images[0]} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '52px', height: '52px', backgroundColor: '#f5f3ef', borderRadius: '8px' }} />
                  )}
                  {isUnread && (
                    <span style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#e53e3e', border: '2px solid #ffffff',
                    }} />
                  )}
                </div>
                <div>
                  <p style={{ fontWeight: isUnread ? 700 : 600, fontSize: '14px', color: '#0a0a0a' }}>{otherPerson}</p>
                  <p style={{ fontSize: '13px', color: isUnread ? '#0a0a0a' : '#999', marginTop: '2px' }}>{artwork?.title}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MessageThread from './MessageThread'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const m = getDict(lang).messages

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, artworks(id, title, images, price_huf), buyer:profiles!conversations_buyer_id_fkey(full_name), artist:profiles!conversations_artist_id_fkey(full_name)')
    .eq('id', params.id)
    .maybeSingle()

  if (!conversation) redirect('/messages')
  const isParticipant = conversation.buyer_id === user.id || conversation.artist_id === user.id
  if (!isParticipant) redirect('/messages')

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', params.id)
    .neq('sender_id', user.id)
    .eq('read', false)

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto' }}>
      <div style={{ padding: '0.75rem 1rem 0' }}>
        <Link href="/messages" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>{m.allMessages}</Link>
      </div>
      <MessageThread
        conversation={conversation}
        initialMessages={messages || []}
        initialOffers={offers || []}
        currentUserId={user.id}
      />
    </div>
  )
}
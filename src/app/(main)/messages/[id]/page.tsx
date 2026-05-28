import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MessageThread from './MessageThread'

export default async function MessagePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, artworks(id, title, images, price_huf), buyer:profiles!conversations_buyer_id_fkey(full_name), artist:profiles!conversations_artist_id_fkey(full_name)')
    .eq('id', params.id)
    .single()

  if (!conversation) redirect('/messages')

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(full_name)')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <MessageThread
      conversation={conversation}
      initialMessages={messages || []}
      currentUserId={user.id}
    />
  )
}

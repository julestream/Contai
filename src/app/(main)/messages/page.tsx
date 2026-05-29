import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, artworks(title, images), buyer:profiles!conversations_buyer_id_fkey(full_name), artist:profiles!conversations_artist_id_fkey(full_name)')
    .or(`buyer_id.eq.${user.id},artist_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }}>Messages</h1>
      </div>

      {(!conversations || conversations.length === 0) && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          No conversations yet.
        </div>
      )}

      <div>
        {conversations?.map(conv => {
          const artwork = (conv as any).artworks
          const images = artwork?.images as string[]
          const otherPerson = (conv as any).buyer_id === user.id
            ? (conv as any).artist?.full_name
            : (conv as any).buyer?.full_name

          return (
            <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '1rem', borderBottom: '1px solid #e8e8e8',
              }}>
                {images?.length > 0 ? (
                  <img src={images[0]} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '52px', height: '52px', backgroundColor: '#f5f3ef', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#0a0a0a' }}>{otherPerson}</p>
                  <p style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{artwork?.title}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

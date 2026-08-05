import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const n = (getDict(lang) as any).notifications
  const statusMessages = (n.statusMessages || {}) as Record<string, string>

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: buyerReservations } = await supabase
    .from('reservations')
    .select('*, artworks(title, images)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, artworks(title, images), buyer:profiles!conversations_buyer_id_fkey(full_name), artist:profiles!conversations_artist_id_fkey(full_name)')
    .or(`buyer_id.eq.${user.id},artist_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  function getStatusMessage(status: string) {
    return statusMessages[status] || status
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return n.daysAgo.replace('{n}', String(days))
    if (hours > 0) return n.hoursAgo.replace('{n}', String(hours))
    return n.justNow
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }}>{n.title}</h1>
      </div>

      <div style={{ padding: '1rem', borderBottom: '1px solid #e8e8e8' }}>
        <p style={{ fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', marginBottom: '1rem' }}>{n.updates}</p>

        {buyerReservations?.map(res => {
          const artwork = (res as any).artworks
          const images = artwork?.images as string[]
          return (
            <Link key={res.id} href={`/handoff/${res.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f5f3ef' }}>
                {images?.length > 0 ? (
                  <img src={images[0]} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#f5f3ef', borderRadius: '6px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', color: '#0a0a0a' }}>{getStatusMessage(res.status)}</p>
                  <p style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{artwork?.title}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#999', flexShrink: 0 }}>{timeAgo(res.created_at)}</p>
              </div>
            </Link>
          )
        })}

        {(!buyerReservations || buyerReservations.length === 0) && (
          <p style={{ color: '#999', fontSize: '14px' }}>{n.noUpdates}</p>
        )}
      </div>

      <div style={{ padding: '1rem' }}>
        <p style={{ fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', marginBottom: '1rem' }}>{n.messages}</p>

        {conversations?.map(conv => {
          const artwork = (conv as any).artworks
          const images = artwork?.images as string[]
          const otherPerson = (conv as any).buyer_id === user.id
            ? (conv as any).artist?.full_name
            : (conv as any).buyer?.full_name

          return (
            <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f5f3ef' }}>
                {images?.length > 0 ? (
                  <img src={images[0]} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#f5f3ef', borderRadius: '6px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', color: '#0a0a0a', fontWeight: 600 }}>{otherPerson}</p>
                  <p style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{artwork?.title}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#999', flexShrink: 0 }}>{timeAgo(conv.last_message_at)}</p>
              </div>
            </Link>
          )
        })}

        {(!conversations || conversations.length === 0) && (
          <p style={{ color: '#999', fontSize: '14px' }}>{n.noMessages}</p>
        )}
      </div>
    </div>
  )
}
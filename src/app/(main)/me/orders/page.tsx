import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  reserved: 'Reserved',
  completed: 'Completed',
  cancelled: 'Cancelled',
  issue: 'Issue reported',
}
const STATUS_COLOR: Record<string, string> = {
  reserved: '#3a5a44',
  completed: '#3a4a66',
  cancelled: '#999',
  issue: '#9c5a3c',
}

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: orders } = await supabase
    .from('reservations')
    .select('*, artworks(title, images)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>Orders</h1>
      </div>

      {(!orders || orders.length === 0) && (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#999' }}>
          You have no orders yet. When you reserve a piece, it will appear here.
        </div>
      )}

      <div style={{ padding: '0 1rem' }}>
        {orders?.map(o => {
          const artwork = (o as any).artworks
          const img = (artwork?.images as string[])?.[0]
          const status = o.status as string
          return (
            <Link key={o.id} href={`/handoff/${o.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: '12px', padding: '1rem 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                {img ? (
                  <img src={img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#f5f3ef', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', color: '#0a0a0a', fontWeight: 500 }}>{artwork?.title || 'Artwork'}</p>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    Reservation fee: {o.reservation_fee_huf?.toLocaleString()} Ft
                  </p>
                  {o.agreed_price_huf ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      Agreed price: {o.agreed_price_huf?.toLocaleString()} Ft
                    </p>
                  ) : null}
                  <span style={{ fontSize: '12px', color: STATUS_COLOR[status] || '#666', fontWeight: 600 }}>
                    {STATUS_LABEL[status] || status}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  reserved: '#3a5a44',
  completed: '#3a4a66',
  cancelled: '#999',
  issue: '#9c5a3c',
}

export default async function OrdersPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const mp = (getDict(lang) as any).mePages
  const o = mp.orders
  const statusLabels = (mp.statusLabels || {}) as Record<string, string>

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
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{o.title}</h1>
      </div>

      {(!orders || orders.length === 0) && (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#999' }}>
          {o.empty}
        </div>
      )}

      <div style={{ padding: '0 1rem' }}>
        {orders?.map(r => {
          const artwork = (r as any).artworks
          const img = (artwork?.images as string[])?.[0]
          const status = r.status as string
          return (
            <Link key={r.id} href={`/handoff/${r.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: '12px', padding: '1rem 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                {img ? (
                  <img src={img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#f5f3ef', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', color: '#0a0a0a', fontWeight: 500 }}>{artwork?.title || o.artworkFallback}</p>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    {o.reservationFee} {r.reservation_fee_huf?.toLocaleString()} Ft
                  </p>
                  {r.agreed_price_huf ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {o.agreedPrice} {r.agreed_price_huf?.toLocaleString()} Ft
                    </p>
                  ) : null}
                  <span style={{ fontSize: '12px', color: STATUS_COLOR[status] || '#666', fontWeight: 600 }}>
                    {statusLabels[status] || status}
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
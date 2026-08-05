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

export default async function SalesPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const mp = (getDict(lang) as any).mePages
  const s = mp.sales
  const statusLabels = (mp.statusLabels || {}) as Record<string, string>

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // Find this artist's artworks, then reservations on them
  const { data: myArtworks } = await supabase
    .from('artworks')
    .select('id')
    .eq('artist_id', user.id)

  const artworkIds = (myArtworks || []).map((a: any) => a.id)

  let sales: any[] = []
  if (artworkIds.length > 0) {
    const { data } = await supabase
      .from('reservations')
      .select('*, artworks(title, images)')
      .in('artwork_id', artworkIds)
      .order('created_at', { ascending: false })
    sales = data || []
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{s.title}</h1>
      </div>

      {sales.length === 0 && (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#999' }}>
          {s.empty}
        </div>
      )}

      <div style={{ padding: '0 1rem' }}>
        {sales.map(sale => {
          const artwork = (sale as any).artworks
          const img = (artwork?.images as string[])?.[0]
          const status = sale.status as string
          return (
            <Link key={sale.id} href={`/handoff/${sale.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: '12px', padding: '1rem 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                {img ? (
                  <img src={img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#f5f3ef', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', color: '#0a0a0a', fontWeight: 500 }}>{artwork?.title || mp.orders.artworkFallback}</p>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    {mp.orders.reservationFee} {sale.reservation_fee_huf?.toLocaleString()} Ft
                  </p>
                  {sale.agreed_price_huf ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {mp.orders.agreedPrice} {sale.agreed_price_huf?.toLocaleString()} Ft
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
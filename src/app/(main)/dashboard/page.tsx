import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ConnectButton from './ConnectButton'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const dict = getDict(lang)
  const d = (dict as any).dashboard
  const statusLabels = (d?.statusLabels || {}) as Record<string, string>

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: allArtworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false })

  // Hide archived ("removed") pieces from the dashboard, but keep them in the database
  const artworks = (allArtworks || []).filter(a => a.status !== 'removed')

  const stats = {
    listed: artworks?.filter(a => a.status === 'live').length || 0,
    underReview: artworks?.filter(a => a.status === 'under_review').length || 0,
    reserved: artworks?.filter(a => a.status === 'reserved').length || 0,
    sold: artworks?.filter(a => a.status === 'sold').length || 0,
  }

  function statusPill(status: string) {
    const map: Record<string, { bg: string; color: string }> = {
      live: { bg: '#eef4f1', color: '#2d6a4f' },
      under_review: { bg: '#fef3c7', color: '#92400e' },
      sold: { bg: '#f5f3ef', color: '#666' },
      reserved: { bg: '#e8eef4', color: '#2b4a6f' },
      hidden: { bg: '#ece9e3', color: '#8a857c' },
      rejected: { bg: '#fdf0f0', color: '#b94040' },
    }
    return map[status] || { bg: '#fdf0f0', color: '#b94040' }
  }

  function statusText(status: string) {
    return statusLabels[status] || (status ? status.replace(/_/g, ' ') : '')
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', backgroundColor: '#f5f3ef', borderBottom: '1px solid #e8e8e8' }}>
        <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.artistLabel}</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginTop: '4px' }}>
          {profile?.full_name || d.yourDashboard}
        </h1>

        <Link href={`/artist/${user.id}`} style={{ fontSize: '13px', color: '#0a0a0a', textDecoration: 'underline', display: 'inline-block', marginTop: '6px' }}>
          {d.viewPublicProfile}
        </Link>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginTop: '1rem' }}>
          {[
            { key: 'live', label: d.statLive, value: stats.listed },
            { key: 'review', label: d.statReview, value: stats.underReview },
            { key: 'reserved', label: d.statReserved, value: stats.reserved },
            { key: 'sold', label: d.statSold, value: stats.sold },
          ].map(stat => (
            <div key={stat.key} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '22px' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#666', lineHeight: 1.2 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e8e8e8', display: 'flex', gap: '8px' }}>
        <Link href="/dashboard/upload" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ padding: '12px 8px', backgroundColor: '#0a0a0a', color: 'white', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 500, lineHeight: 1.25 }}>
            {d.listArtwork}
          </div>
        </Link>
        <Link href="/dashboard/profile" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ padding: '12px 8px', border: '1px solid #e8e8e8', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#0a0a0a', lineHeight: 1.25 }}>
            {d.editProfile}
          </div>
        </Link>
        <Link href="/dashboard/verification" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ padding: '12px 8px', border: '1px solid #e8e8e8', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#0a0a0a', lineHeight: 1.25 }}>
            {d.verification}
          </div>
        </Link>
      </div>

      {/* Artworks list */}
      <div style={{ padding: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px', marginBottom: '1rem' }}>{d.yourListings}</h2>

        {artworks?.length === 0 && (
          <p style={{ color: '#999', fontSize: '14px' }}>{d.noArtworks}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {artworks?.map(artwork => {
            const images = artwork.images as string[]
            const pill = statusPill(artwork.status)
            return (
              <Link key={artwork.id} href={`/dashboard/edit/${artwork.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', opacity: artwork.status === 'hidden' ? 0.6 : 1 }}>
                  {images?.length > 0 ? (
                    <img src={images[0]} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', backgroundColor: '#f5f3ef', borderRadius: '6px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{artwork.title}</p>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{artwork.price_huf?.toLocaleString()} HUF</p>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    backgroundColor: pill.bg,
                    color: pill.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {statusText(artwork.status)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Stripe Connect - Coming Soon */}
      <div style={{ margin: '1rem', padding: '1.5rem', border: '1px dashed #e8e8e8', borderRadius: '12px' }}>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>{d.payouts}</p>
        <p style={{ fontSize: '13px', color: '#999', marginBottom: '1rem' }}>
          {d.payoutsSoon}
        </p>
        <ConnectButton hasAccount={!!profile?.stripe_account_id} />
      </div>
    </div>
  )
}
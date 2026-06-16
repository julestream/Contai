import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ConnectButton from './ConnectButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    listed: artworks?.filter(a => a.status === 'live').length || 0,
    underReview: artworks?.filter(a => a.status === 'under_review').length || 0,
    reserved: artworks?.filter(a => a.status === 'reserved').length || 0,
    sold: artworks?.filter(a => a.status === 'sold').length || 0,
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', backgroundColor: '#f5f3ef', borderBottom: '1px solid #e8e8e8' }}>
        <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Artist</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginTop: '4px' }}>
          {profile?.full_name || 'Your Dashboard'}
        </h1>

        <Link href={`/artist/${user.id}`} style={{ fontSize: '13px', color: '#0a0a0a', textDecoration: 'underline', display: 'inline-block', marginTop: '6px' }}>
          View my public profile
        </Link>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginTop: '1rem' }}>
          {[
            { label: 'Live', value: stats.listed },
            { label: 'Review', value: stats.underReview },
            { label: 'Reserved', value: stats.reserved },
            { label: 'Sold', value: stats.sold },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '22px' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#666' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e8e8e8', display: 'flex', gap: '8px' }}>
        <Link href="/dashboard/upload" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ padding: '12px', backgroundColor: '#0a0a0a', color: 'white', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 500 }}>
            + List artwork
          </div>
        </Link>
        <Link href="/dashboard/profile" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', textAlign: 'center', fontSize: '14px' }}>Edit profile</div>
        </Link>
        <Link href="/dashboard/verification" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{ padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', textAlign: 'center', fontSize: '14px' }}>
            Verification
          </div>
        </Link>
      </div>

      {/* Artworks list */}
      <div style={{ padding: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px', marginBottom: '1rem' }}>Your listings</h2>

        {artworks?.length === 0 && (
          <p style={{ color: '#999', fontSize: '14px' }}>No artworks yet. List your first work!</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {artworks?.map(artwork => {
            const images = artwork.images as string[]
            return (
              <Link key={artwork.id} href={`/dashboard/edit/${artwork.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
                  {images?.length > 0 ? (
                    <img src={images[0]} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', backgroundColor: '#f5f3ef', borderRadius: '6px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{artwork.title}</p>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{artwork.price_huf?.toLocaleString()} HUF</p>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    backgroundColor: artwork.status === 'live' ? '#eef4f1' : artwork.status === 'under_review' ? '#fef3c7' : artwork.status === 'sold' ? '#f5f3ef' : '#fdf0f0',
                    color: artwork.status === 'live' ? '#2d6a4f' : artwork.status === 'under_review' ? '#92400e' : artwork.status === 'sold' ? '#666' : '#b94040',
                    textTransform: 'capitalize',
                  }}>
                    {artwork.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Stripe Connect - Coming Soon */}
      <div style={{ margin: '1rem', padding: '1.5rem', border: '1px dashed #e8e8e8', borderRadius: '12px' }}>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>Bank account payouts</p>
        <p style={{ fontSize: '13px', color: '#999', marginBottom: '1rem' }}>
          Coming soon — not required for local handoff sales.
        </p>
        <ConnectButton hasAccount={!!profile?.stripe_account_id} />
      </div>
    </div>
  )
}
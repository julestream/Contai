import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Price from '@/components/ui/Price'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function ArtistProfilePage({ params }: { params: { id: string } }) {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const a = (getDict(lang) as any).artistPage

  const supabase = createClient()

  const { data: artist } = await supabase
    .from('profiles')
    .select('id, full_name, bio, artist_statement, city, mediums, avatar_url')
    .eq('id', params.id)
    .single()

  if (!artist) redirect('/browse')

  const { data: badges } = await supabase
    .from('badges')
    .select('badge_type')
    .eq('profile_id', params.id)

  const { data: works } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', params.id)
    .in('status', ['live', 'sold'])
    .order('created_at', { ascending: false })

  const available = (works || []).filter(w => w.status === 'live')
  const sold = (works || []).filter(w => w.status === 'sold')
  const mediums: string[] = artist.mediums || []

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ padding: '2rem 1.5rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ width: '96px', height: '96px', borderRadius: '999px', backgroundColor: '#f5f3ef', overflow: 'hidden', margin: '0 auto 1rem' }}>
          {artist.avatar_url && <img src={artist.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px' }}>{artist.full_name || a.artistFallback}</h1>
        {artist.city && <p style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>{artist.city}</p>}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
            {badges.map((b: any, i: number) => <Badge key={i} type={b.badge_type} />)}
          </div>
        )}

        {/* Mediums - comma separated */}
        {mediums.length > 0 && (
          <p style={{ marginTop: '14px', fontSize: '13px', color: '#666' }}>{mediums.join(' · ')}</p>
        )}
      </div>

      {/* Bio & statement
          pre-wrap matters here: artists write in two languages and separate
          them with a blank line. Without it every break collapses and the
          languages run into one another. */}
      {(artist.bio || artist.artist_statement) && (
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee' }}>
          {artist.bio && (
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#0a0a0a', whiteSpace: 'pre-wrap' }}>
              {artist.bio}
            </p>
          )}
          {artist.artist_statement && (
            <p style={{
              fontSize: '14px', lineHeight: 1.6, color: '#555',
              marginTop: artist.bio ? '1.25rem' : 0,
              paddingTop: artist.bio ? '1.25rem' : 0,
              borderTop: artist.bio ? '1px solid #f0efec' : 'none',
              fontStyle: 'italic', whiteSpace: 'pre-wrap',
            }}>
              {artist.artist_statement}
            </p>
          )}
        </div>
      )}

      {/* Available works */}
      <div style={{ padding: '1.5rem 1rem 0.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px' }}>{a.availableWorks}</h2>
      </div>
      {available.length === 0 ? (
        <p style={{ padding: '0 1.5rem 1.5rem', color: '#999', fontSize: '14px' }}>{a.noWorks}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#eee' }}>
          {available.map(w => {
            const images = w.images as string[]
            return (
              <Link key={w.id} href={`/artwork/${w.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', padding: '12px' }}>
                  {images?.length > 0 ? (
                    <img src={images[0]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef', borderRadius: '4px', marginBottom: '8px' }} />
                  )}
                  <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '14px' }}>{w.title}</p>
                  <Price
                    amount={w.price_amount ?? w.price_huf}
                    currency={w.price_currency || 'HUF'}
                    style={{ display: 'block', fontSize: '13px', color: '#444', marginTop: '4px' }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Sold works */}
      {sold.length > 0 && (
        <>
          <div style={{ padding: '2rem 1rem 0.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px' }}>{a.soldWorks}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#eee' }}>
            {sold.map(w => {
              const images = w.images as string[]
              return (
                <div key={w.id} style={{ backgroundColor: 'white', padding: '12px', position: 'relative' }}>
                  {images?.length > 0 ? (
                    <img src={images[0]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px', opacity: 0.7 }} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef', borderRadius: '4px', marginBottom: '8px' }} />
                  )}
                  <span style={{ position: 'absolute', top: '20px', left: '20px', background: '#0a0a0a', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>{a.sold}</span>
                  <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '14px' }}>{w.title}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
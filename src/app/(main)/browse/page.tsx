import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { type?: string; size?: string; verified?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('artworks')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  if (searchParams.type) {
    query = query.eq('type_of_art', searchParams.type)
  }

  const { data: artworks } = await query

  const types = ['Painting', 'Print', 'Photography', 'Graphic Art', 'Sculpture']

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1rem' }}>Browse</h1>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <Link href="/browse" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '13px', whiteSpace: 'nowrap',
              border: !searchParams.type ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
              background: !searchParams.type ? '#0a0a0a' : 'white',
              color: !searchParams.type ? 'white' : '#0a0a0a',
            }}>All</div>
          </Link>
          {types.map(t => (
            <Link key={t} href={`/browse?type=${t}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '6px 14px', borderRadius: '999px', fontSize: '13px', whiteSpace: 'nowrap',
                border: searchParams.type === t ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
                background: searchParams.type === t ? '#0a0a0a' : 'white',
                color: searchParams.type === t ? 'white' : '#0a0a0a',
              }}>{t}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ padding: '12px 1rem', color: '#999', fontSize: '13px' }}>
        {artworks?.length || 0} works
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#e8e8e8' }}>
        {artworks?.map(artwork => (
          <Link key={artwork.id} href={`/artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', padding: '12px' }}>
              {(artwork.images as string[])?.length > 0 ? (
                <img
                  src={(artwork.images as string[])[0]}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                />
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef', borderRadius: '4px', marginBottom: '8px' }} />
              )}
              <p style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {(artwork as any).profiles?.full_name || 'Artist'}
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', marginTop: '2px', color: '#0a0a0a' }}>
                {artwork.title}
              </p>
              <p style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>
                {artwork.price_huf?.toLocaleString()} HUF
              </p>
            </div>
          </Link>
        ))}
      </div>

      {artworks?.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          No artworks found.
        </div>
      )}
    </div>
  )
}

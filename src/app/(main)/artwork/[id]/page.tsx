import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MessageArtistButton from '@/components/ui/MessageArtistButton'

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*, profiles(id, full_name, avatar_url, city, pickup_area)')
    .eq('id', params.id)
    .single()

  if (!artwork) redirect('/browse')

  const images = artwork.images as string[]
  const artist = (artwork as any).profiles

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '8rem' }}>
      {/* Image */}
      {images?.length > 0 ? (
        <img src={images[0]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef' }} />
      )}

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
          {images.map((url, i) => (
            <img key={i} src={url} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
          ))}
        </div>
      )}

      <div style={{ padding: '1.5rem' }}>
        {/* Artist & favorite */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {artist?.full_name || 'Artist'}
          </p>
          <FavoriteButton artworkId={artwork.id} />
        </div>

        {/* Title & Price */}
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', marginTop: '4px' }}>{artwork.title}</h1>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginTop: '8px' }}>
          {artwork.price_huf?.toLocaleString()} HUF
        </p>

        {/* Details */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f5f3ef', borderRadius: '8px', fontSize: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {artwork.medium && <p><span style={{ color: '#999' }}>Medium</span><br />{artwork.medium}</p>}
            {artwork.year && <p><span style={{ color: '#999' }}>Year</span><br />{artwork.year}</p>}
            {artwork.width_cm && <p><span style={{ color: '#999' }}>Size</span><br />{artwork.width_cm} × {artwork.height_cm} cm</p>}
            {artwork.original_or_print && <p><span style={{ color: '#999' }}>Type</span><br />{artwork.original_or_print}</p>}
            {artwork.framed && <p><span style={{ color: '#999' }}>Framed</span><br />Yes</p>}
            <p><span style={{ color: '#999' }}>Pickup</span><br />{artwork.pickup_area}</p>
          </div>
        </div>

        {/* Reserve button */}
        <Link href={`/reserve/${artwork.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            marginTop: '1.5rem',
            padding: '16px',
            backgroundColor: '#0a0a0a',
            color: 'white',
            borderRadius: '999px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 500,
          }}>
            Reserve · {artwork.reservation_fee_huf?.toLocaleString()} HUF
          </div>
        </Link>

        {/* Message artist button */}
        <MessageArtistButton artworkId={artwork.id} artistId={artist?.id} />

        {/* Guarantee strip */}
        <div style={{ marginTop: '1rem', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
          🛡 Contai Guarantee — full refund if something goes wrong
        </div>

        {/* Artist card */}
        <Link href={`/artist/${artist?.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '999px', backgroundColor: '#f5f3ef', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>{artist?.full_name}</p>
              <p style={{ color: '#999', fontSize: '13px' }}>{artist?.city}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

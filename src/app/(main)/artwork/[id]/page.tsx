import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MessageArtistButton from '@/components/ui/MessageArtistButton'
import MakeOfferButton from '@/components/ui/MakeOfferButton'
import Badge from '@/components/ui/Badge'
import RecordView from '@/components/ui/RecordView'
import Price from '@/components/ui/Price'
import ArtworkGallery from '@/components/ui/ArtworkGallery'

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*, profiles(id, full_name, avatar_url, city, pickup_area, vacation_mode)')
    .eq('id', params.id)
    .single()

  if (!artwork) redirect('/browse')

  const images = artwork.images as string[]
  const artist = (artwork as any).profiles
  const displayArtist = artwork.artist_name || artist?.full_name || 'Artist'
  const onVacation = !!artist?.vacation_mode
  const isSold = artwork.status === 'sold'
  const isOwner = user?.id === artwork.artist_id
  const hasCertificate = artwork.certificate_status === 'approved'

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '8rem' }}>
      <RecordView artworkId={artwork.id} />

      {/* Image gallery (clickable thumbnails + floating back button) */}
      <ArtworkGallery images={images} />

      <div style={{ padding: '1.5rem' }}>
        {/* Owner edit banner */}
        {isOwner && (
          <Link href={`/dashboard/edit/${artwork.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              marginBottom: '1rem', padding: '12px', backgroundColor: '#0a0a0a', color: '#fff',
              borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 500,
            }}>
              Edit this listing
            </div>
          </Link>
        )}

        {/* Artist & favorite */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {displayArtist}
          </p>
          <FavoriteButton artworkId={artwork.id} />
        </div>

        {/* Title & Price */}
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', marginTop: '4px' }}>{artwork.title}</h1>
        <Price huf={artwork.price_huf} style={{ display: 'block', fontFamily: 'var(--font-instrument), sans-serif', fontSize: '22px', marginTop: '8px' }} />

        {/* Description */}
        {artwork.description && (
          <p style={{ marginTop: '1rem', fontSize: '15px', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' }}>
            {artwork.description}
          </p>
        )}

        {/* Certificate badge */}
        {hasCertificate && (
          <div style={{ marginTop: '12px' }}>
            <Badge type="certificate" />
          </div>
        )}

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

        {/* Reserve / status area */}
        {isSold ? (
          <div style={{
            marginTop: '1.5rem', padding: '16px', backgroundColor: '#eee', color: '#666',
            borderRadius: '999px', textAlign: 'center', fontSize: '16px', fontWeight: 500,
          }}>
            Sold
          </div>
        ) : onVacation ? (
          <div style={{
            marginTop: '1.5rem', padding: '16px', backgroundColor: '#f5f3ef', color: '#8a857c',
            borderRadius: '12px', textAlign: 'center', fontSize: '14px', lineHeight: 1.5,
          }}>
            This artist is currently away.<br />You can still favourite this piece and message them — reservations reopen when they're back.
          </div>
        ) : (
          <Link href={`/reserve/${artwork.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              marginTop: '1.5rem', padding: '16px', backgroundColor: '#0a0a0a', color: 'white',
              borderRadius: '999px', textAlign: 'center', fontSize: '16px', fontWeight: 500,
            }}>
              Reserve · <Price huf={artwork.reservation_fee_huf} />
            </div>
          </Link>
        )}

        {/* Make an offer (negotiation) */}
        {!isSold && !isOwner && !onVacation && (
          <MakeOfferButton artworkId={artwork.id} artistId={artist?.id} />
        )}

        {/* Message artist button */}
        {!isOwner && <MessageArtistButton artworkId={artwork.id} artistId={artist?.id} />}

        {/* Guarantee strip */}
        <div style={{ marginTop: '1rem', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
          Contai Guarantee — full refund if something goes wrong
        </div>

        {/* Artist card (the account that listed it) */}
        <Link href={`/artist/${artist?.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '999px', backgroundColor: '#f5f3ef', flexShrink: 0, overflow: 'hidden' }}>
              {artist?.avatar_url && <img src={artist.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#0a0a0a' }}>{artist?.full_name}</p>
              <p style={{ color: '#999', fontSize: '13px' }}>{artist?.city}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
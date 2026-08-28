import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MessageArtistButton from '@/components/ui/MessageArtistButton'
import MakeOfferButton from '@/components/ui/MakeOfferButton'
import Badge from '@/components/ui/Badge'
import RecordView from '@/components/ui/RecordView'
import Price from '@/components/ui/Price'
import ArtworkGallery from '@/components/ui/ArtworkGallery'
import HighValueNotice from '@/components/ui/HighValueNotice'

// Compared against the normalised HUF figure so the threshold works across currencies.
const HIGH_VALUE_HUF = 600000

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const a = getDict(lang).artwork

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*, profiles(id, full_name, avatar_url, city, country, pickup_area, vacation_mode)')
    .eq('id', params.id)
    .single()

  if (!artwork) redirect('/browse')

  const images = artwork.images as string[]
  const artist = (artwork as any).profiles
  const displayArtist = artwork.artist_name || artist?.full_name || a.artistFallback
  const onVacation = !!artist?.vacation_mode
  const isSold = artwork.status === 'sold'
  const isOwner = user?.id === artwork.artist_id
  const hasCertificate = artwork.certificate_status === 'approved'
  const isHighValue = (artwork.price_huf || 0) >= HIGH_VALUE_HUF
  const travels = !!artwork.travels_for_handoff

  // The artist's own currency is authoritative; fall back to legacy HUF rows.
  const priceCurrency = artwork.price_currency || 'HUF'
  const priceAmount = artwork.price_amount ?? artwork.price_huf
  const feeAmount = artwork.reservation_fee_amount ?? artwork.reservation_fee_huf

  const city = artwork.city || artist?.city || null
  const country = artwork.country || artist?.country || null
  const location = [artwork.pickup_area, city, country].filter(Boolean).join(', ')

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '8rem' }}>
      <RecordView artworkId={artwork.id} />

      <ArtworkGallery images={images} />

      <div style={{ padding: '1.5rem' }}>
        {isOwner && (
          <Link href={`/dashboard/edit/${artwork.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              marginBottom: '1rem', padding: '12px', backgroundColor: '#0a0a0a', color: '#fff',
              borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 500,
            }}>
              {a.editListing}
            </div>
          </Link>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {displayArtist}
          </p>
          <FavoriteButton artworkId={artwork.id} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', marginTop: '4px' }}>{artwork.title}</h1>
        <Price
          amount={priceAmount}
          currency={priceCurrency}
          style={{ display: 'block', fontFamily: 'var(--font-instrument), sans-serif', fontSize: '22px', marginTop: '8px' }}
        />

        {/* Location line — prominent for pickup-only */}
        {(city || country) && (
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span aria-hidden style={{ fontSize: '13px' }}>📍</span>
            {[city, country].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Sits directly under the location, because that is the line that
            raises the question this answers. */}
        {travels && !isSold && (
          <p style={{
            fontSize: '13px', color: '#3a5a44', marginTop: '8px',
            padding: '8px 12px', background: '#eef2ee', borderRadius: '8px',
            lineHeight: 1.5,
          }}>
            {a.travelsBadge}
          </p>
        )}

        {hasCertificate && (
          <div style={{ marginTop: '12px' }}>
            <Badge type="certificate" />
          </div>
        )}

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f5f3ef', borderRadius: '8px', fontSize: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {artwork.medium && <p><span style={{ color: '#999' }}>{a.medium}</span><br />{artwork.medium}</p>}
            {artwork.year && <p><span style={{ color: '#999' }}>{a.year}</span><br />{artwork.year}</p>}
            {artwork.width_cm && <p><span style={{ color: '#999' }}>{a.size}</span><br />{artwork.width_cm} × {artwork.height_cm} cm</p>}
            {artwork.original_or_print && <p><span style={{ color: '#999' }}>{a.type}</span><br />{artwork.original_or_print}</p>}
            {artwork.framed && <p><span style={{ color: '#999' }}>{a.framed}</span><br />{a.yes}</p>}
            {artwork.signed && <p><span style={{ color: '#999' }}>{a.signed}</span><br />{a.yes}</p>}
            {location && <p style={{ gridColumn: '1 / -1' }}><span style={{ color: '#999' }}>{a.pickupLocation}</span><br />{location}</p>}
          </div>
        </div>

        {artwork.description && (
          <p style={{ marginTop: '1.5rem', fontSize: '15px', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' }}>
            {artwork.description}
          </p>
        )}

        {isSold ? (
          <div style={{
            marginTop: '1.5rem', padding: '16px', backgroundColor: '#eee', color: '#666',
            borderRadius: '999px', textAlign: 'center', fontSize: '16px', fontWeight: 500,
          }}>
            {a.sold}
          </div>
        ) : onVacation ? (
          <div style={{
            marginTop: '1.5rem', padding: '16px', backgroundColor: '#f5f3ef', color: '#8a857c',
            borderRadius: '12px', textAlign: 'center', fontSize: '14px', lineHeight: 1.5,
          }}>
            {a.vacationMsg}
          </div>
        ) : (
          <Link href={`/reserve/${artwork.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              marginTop: '1.5rem', padding: '16px', backgroundColor: '#0a0a0a', color: 'white',
              borderRadius: '999px', textAlign: 'center', fontSize: '16px', fontWeight: 500,
            }}>
              {a.reserve} · <Price amount={feeAmount} currency={priceCurrency} />
            </div>
          </Link>
        )}

        {isHighValue && !isSold && <HighValueNotice />}

        {!isSold && !isOwner && !onVacation && (
          <MakeOfferButton artworkId={artwork.id} artistId={artist?.id} />
        )}

        {!isOwner && <MessageArtistButton artworkId={artwork.id} artistId={artist?.id} />}

        <div style={{ marginTop: '1rem', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
          {a.guaranteeStrip}
        </div>

        <Link href={`/artist/${artist?.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '999px', backgroundColor: '#f5f3ef', flexShrink: 0, overflow: 'hidden' }}>
              {artist?.avatar_url && <img src={artist.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#0a0a0a' }}>{artist?.full_name}</p>
              <p style={{ color: '#999', fontSize: '13px' }}>{[artist?.city, artist?.country].filter(Boolean).join(', ')}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
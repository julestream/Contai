import Link from 'next/link'
import Price from '@/components/ui/Price'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { frameStyle, artStyle, artistStyle, titleStyle, priceStyle } from '@/lib/browseStyle'

export default function ArtworkCard({ artwork }: { artwork: any }) {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const fallback = (getDict(lang) as any).card.artistFallback

  const img = (artwork.images as string[])?.[0]
  const displayArtist = artwork.artist_name || artwork.profiles?.full_name || fallback
  const artistId = artwork.artist_id || artwork.profiles?.id

  return (
    <div style={{ width: '100%' }}>
      {/* Only the image and title lead to the artwork. The artist's name is
          its own link — a buyer who likes a piece usually wants to see what
          else that person makes, and had no way through from here. */}
      <Link href={`/artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
        <div style={frameStyle}>
          {img && <img src={img} alt={artwork.title || ''} style={artStyle} />}
        </div>
      </Link>

      {artistId ? (
        <Link href={`/artist/${artistId}`} style={{ textDecoration: 'none' }}>
          <p style={artistStyle}>{displayArtist}</p>
        </Link>
      ) : (
        <p style={artistStyle}>{displayArtist}</p>
      )}

      <Link href={`/artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
        <p style={titleStyle}>{artwork.title}</p>
        <Price
          amount={artwork.price_amount ?? artwork.price_huf}
          currency={artwork.price_currency || 'HUF'}
          style={priceStyle}
        />
      </Link>
    </div>
  )
}
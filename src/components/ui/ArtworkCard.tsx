import Link from 'next/link'

export default function ArtworkCard({ artwork }: { artwork: any }) {
  const img = (artwork.images as string[])?.[0]
  return (
    <Link href={`/artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ width: '100%' }}>
        {img ? (
          <img src={img} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
        ) : (
          <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef', borderRadius: '6px', marginBottom: '8px' }} />
        )}
        <p style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {artwork.profiles?.full_name || 'Artist'}
        </p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', marginTop: '2px', color: '#0a0a0a' }}>
          {artwork.title}
        </p>
        <p style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>
          {artwork.price_huf?.toLocaleString()} HUF
        </p>
      </div>
    </Link>
  )
}

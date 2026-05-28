import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FavoritesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Please <Link href="/signin">sign in</Link> to view favorites.</p>
      </div>
    )
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, artworks(*, profiles(full_name))')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }}>Favorites</h1>
        <p style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>{favorites?.length || 0} saved works</p>
      </div>

      {favorites?.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          <p>No favorites yet.</p>
          <Link href="/browse" style={{ color: '#0a0a0a', fontWeight: 600 }}>Browse artworks</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#e8e8e8' }}>
        {favorites?.map(fav => {
          const artwork = (fav as any).artworks
          if (!artwork) return null
          const images = artwork.images as string[]
          return (
            <Link key={fav.id} href={`/artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'white', padding: '12px' }}>
                {images?.length > 0 ? (
                  <img src={images[0]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef', borderRadius: '4px', marginBottom: '8px' }} />
                )}
                <p style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>
                  {artwork.profiles?.full_name}
                </p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', marginTop: '2px' }}>{artwork.title}</p>
                <p style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>{artwork.price_huf?.toLocaleString()} HUF</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

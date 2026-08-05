import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Price from '@/components/ui/Price'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const f = (getDict(lang) as any).favorites

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>
          <Link href="/signin" style={{ color: '#0a0a0a', fontWeight: 600 }}>{f.signInLink}</Link>{' '}
          {f.signInSuffix}
        </p>
      </div>
    )
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, artworks(*, profiles(full_name))')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  const count = favorites?.length || 0

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }}>{f.title}</h1>
        <p style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>
          {count} {count === 1 ? f.savedWork : f.savedWorks}
        </p>
      </div>

      {count === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          <p>{f.empty}</p>
          <Link href="/browse" style={{ color: '#0a0a0a', fontWeight: 600 }}>{f.browseArtworks}</Link>
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
                <Price huf={artwork.price_huf} style={{ display: 'block', fontSize: '13px', color: '#444', marginTop: '4px' }} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
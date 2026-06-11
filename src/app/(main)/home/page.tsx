import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ArtworkCard from '@/components/ui/ArtworkCard'

const MOODS = ['Joy', 'Harmony', 'Self-reflection', 'Inspiration', 'Intrigue']
const MOOD_BG: Record<string, string> = {
  Joy: '#f4e4c1', Harmony: '#d8e4d0', 'Self-reflection': '#d6dde8',
  Inspiration: '#ecd9e0', Intrigue: '#dcd6e8',
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 1rem', marginBottom: '12px' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '19px', color: '#0a0a0a' }}>{title}</h2>
      {href && (
        <Link href={href} style={{ fontSize: '12px', color: '#666', textDecoration: 'none', letterSpacing: '0.04em' }}>
          VIEW ALL
        </Link>
      )}
    </div>
  )
}

function HRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 1rem 4px', scrollbarWidth: 'none' }}>
      {children}
    </div>
  )
}

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Newest additions
  const { data: newest } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(6)

  // Curatorial picks (for now: a selection of live works; later: a 'featured' flag)
  const { data: picks } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: true })
    .limit(6)

  // Your favorites
  let favorites: any[] = []
  if (user) {
    const { data: favRows } = await supabase
      .from('favorites')
      .select('artwork_id, artworks(*, profiles(full_name))')
      .eq('user_id', user.id)
      .limit(6)
    favorites = (favRows || []).map((f: any) => f.artworks).filter(Boolean)
  }

  const news = [
    { id: 1, title: 'Welcome to Contai', tag: 'Editorial' },
    { id: 2, title: 'Meet the artists', tag: 'Stories' },
    { id: 3, title: 'How reservations work', tag: 'Guide' },
    { id: 4, title: 'Budapest art scene', tag: 'City' },
  ]

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.25rem 1rem 0.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px' }}>Discover</h1>
      </div>

      {/* News carousel */}
      <div style={{ margin: '12px 0 28px' }}>
        <HRow>
          {news.map(n => (
            <div key={n.id} style={{
              flexShrink: 0, width: '260px', height: '150px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#1a1a1a,#3a3a3a)', color: '#fff',
              padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <span style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{n.tag}</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', marginTop: '4px' }}>{n.title}</span>
            </div>
          ))}
        </HRow>
      </div>

      {/* Newest additions */}
      <section style={{ marginBottom: '28px' }}>
        <SectionHeader title="Newest additions" href="/browse" />
        <HRow>
          {newest?.map(a => (
            <div key={a.id} style={{ flexShrink: 0, width: '150px' }}>
              <ArtworkCard artwork={a} />
            </div>
          ))}
        </HRow>
      </section>

      {/* Shop by mood */}
      <section style={{ marginBottom: '28px' }}>
        <SectionHeader title="Shop by mood" href="/browse" />
        <HRow>
          {MOODS.map(m => (
            <Link key={m} href={`/browse?mood=${m}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: '120px', height: '90px', borderRadius: '12px', background: MOOD_BG[m] || '#eee',
                display: 'flex', alignItems: 'flex-end', padding: '10px',
              }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#0a0a0a' }}>{m}</span>
              </div>
            </Link>
          ))}
        </HRow>
      </section>

      {/* Curatorial picks */}
      <section style={{ marginBottom: '28px' }}>
        <SectionHeader title="Curatorial picks" href="/browse" />
        <HRow>
          {picks?.map(a => (
            <div key={a.id} style={{ flexShrink: 0, width: '150px' }}>
              <ArtworkCard artwork={a} />
            </div>
          ))}
        </HRow>
      </section>

      {/* Recently viewed - coming soon */}
      <section style={{ marginBottom: '28px' }}>
        <SectionHeader title="Recently viewed" />
        <p style={{ padding: '0 1rem', color: '#bbb', fontSize: '13px' }}>Coming soon</p>
      </section>

      {/* Your favorites */}
      {user && favorites.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <SectionHeader title="Your favorites" href="/favorites" />
          <HRow>
            {favorites.map(a => (
              <div key={a.id} style={{ flexShrink: 0, width: '150px' }}>
                <ArtworkCard artwork={a} />
              </div>
            ))}
          </HRow>
        </section>
      )}
    </div>
  )
}

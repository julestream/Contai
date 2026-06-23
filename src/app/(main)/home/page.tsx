export const dynamic = 'force-dynamic'

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
      <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '19px', color: '#0a0a0a' }}>{title}</h2>
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

  // Your favorites + Recommended for you + Recently viewed
  let favorites: any[] = []
  let recommended: any[] = []
  let recentlyViewed: any[] = []
  if (user) {
    const { data: favRows } = await supabase
      .from('favorites')
      .select('artwork_id, artworks(*, profiles(full_name))')
      .eq('profile_id', user.id)
      .limit(6)
    favorites = (favRows || []).map((f: any) => f.artworks).filter(Boolean)

    // Recommended based on saved preferred art types
    const { data: prof } = await supabase
      .from('profiles')
      .select('preferred_types')
      .eq('id', user.id)
      .single()
    const prefTypes: string[] = prof?.preferred_types || []
    if (prefTypes.length > 0) {
      const { data: recs } = await supabase
        .from('artworks')
        .select('*, profiles(full_name)')
        .eq('status', 'live')
        .in('type_of_art', prefTypes)
        .order('created_at', { ascending: false })
        .limit(6)
      recommended = recs || []
    }

    // Recently viewed
    const { data: rvRows } = await supabase
      .from('recently_viewed')
      .select('artwork_id, viewed_at, artworks(*, profiles(full_name))')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(8)
    recentlyViewed = (rvRows || [])
      .map((r: any) => r.artworks)
      .filter((a: any) => a && a.status === 'live')
  }

  // Carousel cards, ordered warm -> cold by gradient
  const news = [
    { id: 1, title: 'Presenting', emphasis: 'Contai', tag: 'About', href: '/about' },
    { id: 2, title: 'Meet the', emphasis: 'artists', tag: 'Stories', href: '/artists-feature' },
    { id: 3, title: 'Find your', emphasis: 'art mood', tag: 'Quiz', href: '/quiz' },
    { id: 4, title: 'How', emphasis: 'reservations', titleAfter: 'work', tag: 'Guide', href: '/how-it-works' },
    { id: 5, title: 'Contai', emphasis: 'news', tag: 'News', href: '/news' },
    { id: 6, title: 'The Contai', emphasis: 'Guarantee', tag: 'Guarantee', href: '/guarantee' },
  ]

  function cardBackground(tag: string): string {
    switch (tag) {
      case 'About': return 'linear-gradient(150deg,#5e2a38,#7c3a4a)'       // burgundy
      case 'Stories': return 'linear-gradient(150deg,#a8552c,#c06f3a)'     // burned orange
      case 'Quiz': return 'linear-gradient(150deg,#4e5a2f,#65733f)'        // moss olive
      case 'Guide': return 'linear-gradient(150deg,#16615a,#1f7a6f)'       // peacock teal
      case 'News': return 'linear-gradient(150deg,#2b3c66,#3d5181)'        // indigo
      case 'Guarantee': return 'linear-gradient(150deg,#4a3358,#634470)'   // aubergine
      default: return 'linear-gradient(150deg,#1a1a1a,#3a3a3a)'
    }
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.25rem 1rem 0.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px' }}>Discover</h1>
      </div>

      {/* Recommended for you */}
      {recommended.length > 0 && (
        <section style={{ margin: '12px 0 28px' }}>
          <SectionHeader title="Recommended for you" href="/browse" />
          <HRow>
            {recommended.map(a => (
              <div key={a.id} style={{ flexShrink: 0, width: '150px' }}>
                <ArtworkCard artwork={a} />
              </div>
            ))}
          </HRow>
        </section>
      )}

      {/* Discover carousel */}
      <div style={{ margin: '12px 0 28px' }}>
        <HRow>
          {news.map(n => (
            <Link key={n.id} href={n.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: '248px', height: '158px', borderRadius: '14px',
                background: cardBackground(n.tag),
                color: '#f2ebe2', padding: '18px', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '10.5px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.74 }}>{n.tag}</span>
                  <div style={{ width: '26px', height: '1px', background: 'currentColor', opacity: 0.5, marginTop: '9px' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, fontSize: '21px', lineHeight: 1.12, letterSpacing: '-0.01em' }}>
                  {n.title} <span style={{ fontStyle: 'italic', fontWeight: 400 }}>{n.emphasis}</span>{n.titleAfter ? ` ${n.titleAfter}` : ''}
                </div>
                <span style={{ position: 'absolute', bottom: '16px', right: '18px', fontSize: '17px', opacity: 0.55 }}>→</span>
              </div>
            </Link>
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
            <Link key={m} href={`/browse/results?mood=${m}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: '120px', height: '90px', borderRadius: '12px', background: MOOD_BG[m] || '#eee',
                display: 'flex', alignItems: 'flex-end', padding: '10px',
              }}>
                <span style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '15px', color: '#0a0a0a' }}>{m}</span>
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

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <SectionHeader title="Recently viewed" />
          <HRow>
            {recentlyViewed.map(a => (
              <div key={a.id} style={{ flexShrink: 0, width: '150px' }}>
                <ArtworkCard artwork={a} />
              </div>
            ))}
          </HRow>
        </section>
      )}

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
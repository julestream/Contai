export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ArtworkCard from '@/components/ui/ArtworkCard'

const MOODS = ['Joy', 'Harmony', 'Self-reflection', 'Inspiration', 'Intrigue']
const MOOD_IMG: Record<string, string> = {
  Joy: '/moods/joy.png',
  Harmony: '/moods/harmony.png',
  'Self-reflection': '/moods/self-reflection.png',
  Inspiration: '/moods/inspiration.png',
  Intrigue: '/moods/intrigue.png',
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

  // Curatorial picks — featured first, fall back to newest if none featured
  let { data: picks } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)
  if (!picks || picks.length === 0) {
    const { data: fallbackPicks } = await supabase
      .from('artworks')
      .select('*, profiles(full_name)')
      .eq('status', 'live')
      .order('created_at', { ascending: true })
      .limit(6)
    picks = fallbackPicks || []
  }

  let favorites: any[] = []
  let recommended: any[] = []
  let recentlyViewed: any[] = []
  let nearYou: any[] = []
  let nearCity: string | null = null
  if (user) {
    const { data: favRows } = await supabase
      .from('favorites')
      .select('artwork_id, artworks(*, profiles(full_name))')
      .eq('profile_id', user.id)
      .limit(6)
    favorites = (favRows || []).map((f: any) => f.artworks).filter(Boolean)

    // One profile fetch for preferences + location
    const { data: prof } = await supabase
      .from('profiles')
      .select('preferred_types, city, country')
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

    // Near you — artworks in the buyer's own city
    if (prof?.city) {
      nearCity = prof.city
      const { data: near } = await supabase
        .from('artworks')
        .select('*, profiles(full_name)')
        .eq('status', 'live')
        .eq('city', prof.city)
        .order('created_at', { ascending: false })
        .limit(6)
      nearYou = near || []
    }

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

  // Carousel cards, warm -> cold
  const news = [
    { id: 1, eyebrow: 'About', title: 'Presenting', emphasis: 'Contai', tag: 'About', href: '/about' },
    { id: 2, eyebrow: 'Stories', title: 'Meet the', emphasis: 'artists', tag: 'Stories', href: '/artists-feature' },
    { id: 3, eyebrow: 'Quiz', title: 'Find your', emphasis: 'art mood', tag: 'Quiz', href: '/quiz' },
    { id: 4, eyebrow: 'Guide', title: 'How', emphasis: 'reservations', titleAfter: 'work', tag: 'Guide', href: '/how-it-works' },
    { id: 5, eyebrow: 'Thank you', title: 'For our', emphasis: 'testers', tag: 'News', href: '/news' },
    { id: 6, eyebrow: 'Guarantee', title: 'The Contai', emphasis: 'Guarantee', tag: 'Guarantee', href: '/guarantee' },
  ]

  function cardBackground(tag: string): string {
    switch (tag) {
      case 'About': return 'linear-gradient(150deg,#5e2a38,#7c3a4a)'
      case 'Stories': return 'linear-gradient(150deg,#a8552c,#c06f3a)'
      case 'Quiz': return 'linear-gradient(150deg,#4e5a2f,#65733f)'
      case 'Guide': return 'linear-gradient(150deg,#16615a,#1f7a6f)'
      case 'News': return 'linear-gradient(150deg,#2b3c66,#3d5181)'
      case 'Guarantee': return 'linear-gradient(150deg,#4a3358,#634470)'
      default: return 'linear-gradient(150deg,#1a1a1a,#3a3a3a)'
    }
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.25rem 1rem 0.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px' }}>Discover</h1>
      </div>

      {/* Near you */}
      {nearYou.length > 0 && (
        <section style={{ margin: '12px 0 28px' }}>
          <SectionHeader title={`Near you in ${nearCity}`} href={`/browse/results?city=${encodeURIComponent(nearCity || '')}`} />
          <HRow>
            {nearYou.map(a => (
              <div key={a.id} style={{ flexShrink: 0, width: '150px' }}>
                <ArtworkCard artwork={a} />
              </div>
            ))}
          </HRow>
        </section>
      )}

      {/* Recommended for you */}
      {recommended.length > 0 && (
        <section style={{ margin: '12px 0 28px' }}>
          <SectionHeader title="Recommended for you" href="/browse/newest" />
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
                  <span style={{ fontSize: '10.5px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.74 }}>{n.eyebrow}</span>
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
        <SectionHeader title="Newest additions" href="/browse/newest" />
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
        <SectionHeader title="Shop by mood" href="/browse/results" />
        <HRow>
          {MOODS.map(m => (
            <Link key={m} href={`/browse/results?mood=${m}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: '120px', height: '90px', borderRadius: '12px', overflow: 'hidden',
                position: 'relative', background: '#2a2a2a',
              }}>
                <img
                  src={MOOD_IMG[m]}
                  alt={m}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 100%)',
                }} />
                <span style={{
                  position: 'absolute', left: '10px', bottom: '8px',
                  fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '15px', color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}>{m}</span>
              </div>
            </Link>
          ))}
        </HRow>
      </section>

      {/* Curatorial picks */}
      <section style={{ marginBottom: '28px' }}>
        <SectionHeader title="Curatorial picks" href="/browse/curatorial" />
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
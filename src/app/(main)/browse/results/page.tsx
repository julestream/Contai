import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ArtworkCard from '@/components/ui/ArtworkCard'
import { Suspense } from 'react'
import FilterPanel from '@/components/ui/FilterPanel'
import SaveSearchButton from '@/components/ui/SaveSearchButton'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { pageWrap, innerWrap, headerWrap, headingStyle, countStyle, GRID, emptyStyle } from '@/lib/browseStyle'

export const dynamic = 'force-dynamic'

function parseList(v?: string): string[] {
  if (!v) return []
  return v.split(',').filter(Boolean)
}

export default async function BrowseResultsPage({
  searchParams,
}: {
  searchParams: {
    type?: string; mood?: string; q?: string; medium?: string; colour?: string;
    material?: string; size?: string; badge?: string; framed?: string;
    min_price?: string; max_price?: string; country?: string; city?: string;
  }
}) {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const dict = getDict(lang) as any
  const r = dict.results
  const typeLabels = (dict.upload?.typeLabels || {}) as Record<string, string>

  const supabase = createClient()

  const types = parseList(searchParams.type)
  const mediums = parseList(searchParams.medium)
  const moods = parseList(searchParams.mood)
  const colours = parseList(searchParams.colour)
  const materials = parseList(searchParams.material)
  const sizes = parseList(searchParams.size)
  const badges = parseList(searchParams.badge)

  // Every filter except location. Reused for the travelling band below,
  // which is the same search with the place restriction lifted.
  function applyFilters(q: any) {
    if (types.length) q = q.in('type_of_art', types)
    if (mediums.length) q = q.in('medium', mediums)
    if (sizes.length) q = q.in('size_category', sizes)
    if (moods.length) q = q.overlaps('mood', moods)
    if (colours.length) q = q.overlaps('colours', colours)
    if (materials.length) q = q.overlaps('materials', materials)
    if (searchParams.framed === 'true') q = q.eq('framed', true)
    if (searchParams.framed === 'false') q = q.eq('framed', false)
    if (searchParams.min_price) q = q.gte('price_huf', Number(searchParams.min_price))
    if (searchParams.max_price) q = q.lte('price_huf', Number(searchParams.max_price))
    if (searchParams.q) q = q.or(`title.ilike.%${searchParams.q}%,style.ilike.%${searchParams.q}%`)
    return q
  }

  // Artist badge filter: find matching artist ids first
  let badgeArtistIds: string[] | null = null
  if (badges.length) {
    const { data: badgeRows } = await supabase
      .from('badges')
      .select('profile_id')
      .in('badge_type', badges)
    badgeArtistIds = [...new Set((badgeRows || []).map((b: any) => b.profile_id))]
  }

  function applyBadges(q: any) {
    if (!badgeArtistIds) return q
    if (badgeArtistIds.length) return q.in('artist_id', badgeArtistIds)
    return q.eq('artist_id', '00000000-0000-0000-0000-000000000000') // no match
  }

  let query = supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  query = applyFilters(query)
  query = applyBadges(query)
  if (searchParams.country) query = query.eq('country', searchParams.country)
  if (searchParams.city) query = query.eq('city', searchParams.city)

  const { data: artworks } = await query

  // ── Artists who will travel ──────────────────────────────────
  // Only worth showing when a place filter is active — otherwise these
  // works are already in the main results.
  const hasPlaceFilter = !!(searchParams.country || searchParams.city)
  let travelling: any[] = []

  if (hasPlaceFilter) {
    let tq = supabase
      .from('artworks')
      .select('*, profiles(full_name)')
      .eq('status', 'live')
      .eq('travels_for_handoff', true)
      .order('created_at', { ascending: false })

    tq = applyFilters(tq)
    tq = applyBadges(tq)

    // Everywhere except where the buyer already looked.
    if (searchParams.city) tq = tq.neq('city', searchParams.city)
    else if (searchParams.country) tq = tq.neq('country', searchParams.country)

    const { data } = await tq
    travelling = data || []
  }

  const heading = types.length === 1
    ? (typeLabels[types[0]] || types[0])
    : (searchParams.q ? `"${searchParams.q}"` : r.allWorks)

  return (
    <div style={pageWrap}>
      <div style={innerWrap}>
        <div style={headerWrap}>
          <Link href="/browse" style={{ textDecoration: 'none', color: '#1a1a1a', fontSize: '20px' }}>←</Link>
          <h1 style={headingStyle}>{heading}</h1>
        </div>

        <Suspense>
          <FilterPanel />
        </Suspense>

        <Suspense>
          <SaveSearchButton />
        </Suspense>

        <div style={countStyle}>
          {artworks?.length || 0} {r.works}
        </div>

        <div style={GRID}>
          {artworks?.map(x => <ArtworkCard key={x.id} artwork={x} />)}
        </div>

        {artworks?.length === 0 && travelling.length === 0 && (
          <div style={emptyStyle}>{r.noMatch}</div>
        )}

        {travelling.length > 0 && (
          <>
            <div style={{ padding: '2.5rem 1.15rem 0' }}>
              <h2 style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: '19px', color: '#1a1a1a', marginBottom: '4px',
              }}>
                {r.travellingBand}
              </h2>
              <p style={{ fontSize: '12.5px', color: '#a49d92', lineHeight: 1.5 }}>
                {r.travellingBandHelp}
              </p>
            </div>
            <div style={{ ...GRID, paddingTop: '20px' }}>
              {travelling.map(x => <ArtworkCard key={x.id} artwork={x} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
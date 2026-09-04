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
    type?: string; mood?: string; style?: string; q?: string; medium?: string; colour?: string;
    material?: string; size?: string; badge?: string; framed?: string;
    min_price?: string; max_price?: string; country?: string; city?: string;
  }
}) {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const dict = getDict(lang) as any
  const r = dict.results
  const typeLabels = (dict.upload?.typeLabels || {}) as Record<string, string>
  // The same descriptions artists see when listing — so both sides of the
  // marketplace share one definition of what belongs where.
  const typeHelp = (dict.upload?.typeHelp || {}) as Record<string, string>

  const supabase = createClient()

  const types = parseList(searchParams.type)
  const mediums = parseList(searchParams.medium)
  const moods = parseList(searchParams.mood)
  const styles = parseList(searchParams.style)
  const colours = parseList(searchParams.colour)
  const materials = parseList(searchParams.material)
  const sizes = parseList(searchParams.size)
  const badges = parseList(searchParams.badge)

  // A free-text search should find an artist by name, not just a title.
  // Names live in two places: artist_name on the artwork (used when
  // listing on someone's behalf) and the uploading account's profile.
  let searchArtistIds: string[] = []
  if (searchParams.q) {
    const { data: matchingArtists } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${searchParams.q}%`)
    searchArtistIds = (matchingArtists || []).map((p: any) => p.id)
  }

  // Every filter except location. Reused for the travelling band below,
  // which is the same search with the place restriction lifted.
  function applyFilters(q: any) {
    if (types.length) q = q.in('type_of_art', types)
    if (mediums.length) q = q.in('medium', mediums)
    if (sizes.length) q = q.in('size_category', sizes)
    if (moods.length) q = q.overlaps('mood', moods)
    // style is an array now — an artwork matches if it carries any of them.
    if (styles.length) q = q.overlaps('style', styles)
    if (colours.length) q = q.overlaps('colours', colours)
    if (materials.length) q = q.overlaps('materials', materials)
    if (searchParams.framed === 'true') q = q.eq('framed', true)
    if (searchParams.framed === 'false') q = q.eq('framed', false)
    if (searchParams.min_price) q = q.gte('price_huf', Number(searchParams.min_price))
    if (searchParams.max_price) q = q.lte('price_huf', Number(searchParams.max_price))
    if (searchParams.q) {
      const term = searchParams.q
      const clauses = [
        `title.ilike.%${term}%`,
        `artist_name.ilike.%${term}%`,
      ]
      if (searchArtistIds.length) {
        clauses.push(`artist_id.in.(${searchArtistIds.join(',')})`)
      }
      q = q.or(clauses.join(','))
    }
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
    .select('*, profiles(id, full_name)')
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
      .select('*, profiles(id, full_name)')
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

  // Only when exactly one category is being viewed — with several selected
  // there is no single thing to describe.
  const description = types.length === 1 ? typeHelp[types[0]] : null

  const isEmpty = (artworks?.length || 0) === 0 && travelling.length === 0

  // A category the buyer arrived at from a browse tile, with nothing in it
  // yet, is a different situation from a filtered search that found nothing.
  const isEmptyCategory =
    isEmpty &&
    types.length === 1 &&
    !searchParams.q &&
    !mediums.length && !moods.length && !styles.length &&
    !colours.length && !materials.length && !sizes.length && !badges.length &&
    !searchParams.framed && !searchParams.min_price && !searchParams.max_price &&
    !searchParams.country && !searchParams.city

  return (
    <div style={pageWrap}>
      <div style={innerWrap}>
        <div style={headerWrap}>
          <Link href="/browse" style={{ textDecoration: 'none', color: '#1a1a1a', fontSize: '20px' }}>←</Link>
          <h1 style={headingStyle}>{heading}</h1>
        </div>

        {description && (
          <p style={{
            padding: '6px 1.15rem 0',
            fontSize: '13px', lineHeight: 1.55, color: '#8a857c',
          }}>
            {description}
          </p>
        )}

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

        {isEmptyCategory ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontSize: '16px', lineHeight: 1.6, color: '#5a5246',
              marginBottom: '1.25rem', maxWidth: '300px', margin: '0 auto 1.25rem',
            }}>
              {r.emptySoon}
            </p>
            <Link href="/browse/results" style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-block', padding: '11px 22px', borderRadius: '999px',
                border: '1px solid #0a0a0a', color: '#0a0a0a', fontSize: '14px',
              }}>
                {r.emptySoonCta}
              </span>
            </Link>
          </div>
        ) : isEmpty ? (
          <div style={emptyStyle}>{r.noMatch}</div>
        ) : null}

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
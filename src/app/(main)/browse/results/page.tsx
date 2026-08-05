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

  let query = supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  if (types.length) query = query.in('type_of_art', types)
  if (mediums.length) query = query.in('medium', mediums)
  if (sizes.length) query = query.in('size_category', sizes)
  if (moods.length) query = query.overlaps('mood', moods)
  if (colours.length) query = query.overlaps('colours', colours)
  if (materials.length) query = query.overlaps('materials', materials)
  if (searchParams.framed === 'true') query = query.eq('framed', true)
  if (searchParams.framed === 'false') query = query.eq('framed', false)
  if (searchParams.min_price) query = query.gte('price_huf', Number(searchParams.min_price))
  if (searchParams.max_price) query = query.lte('price_huf', Number(searchParams.max_price))
  if (searchParams.country) query = query.eq('country', searchParams.country)
  if (searchParams.city) query = query.eq('city', searchParams.city)
  if (searchParams.q) query = query.or(`title.ilike.%${searchParams.q}%,style.ilike.%${searchParams.q}%`)

  // Artist badge filter: find matching artist ids first
  if (badges.length) {
    const { data: badgeRows } = await supabase
      .from('badges')
      .select('profile_id')
      .in('badge_type', badges)
    const artistIds = [...new Set((badgeRows || []).map((b: any) => b.profile_id))]
    if (artistIds.length) query = query.in('artist_id', artistIds)
    else query = query.eq('artist_id', '00000000-0000-0000-0000-000000000000') // no match
  }

  const { data: artworks } = await query

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

        {artworks?.length === 0 && <div style={emptyStyle}>{r.noMatch}</div>}
      </div>
    </div>
  )
}
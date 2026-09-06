import { createClient } from '@/lib/supabase/server'
import ArtworkCard from '@/components/ui/ArtworkCard'
import BackLink from '@/components/ui/BackLink'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { pageWrap, headerWrap, headingStyle, countStyle, emptyStyle } from '@/lib/browseStyle'

export const dynamic = 'force-dynamic'

export default async function CuratorialPage() {
  const supabase = createClient()
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const b = getDict(lang).browse

  const { data: featured } = await supabase
    .from('artworks')
    .select('*, profiles(id, full_name)')
    .eq('status', 'live')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(60)

  let artworks = featured || []
  let usingFallback = false
  if (artworks.length === 0) {
    const { data: newest } = await supabase
      .from('artworks')
      .select('*, profiles(id, full_name)')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(60)
    artworks = newest || []
    usingFallback = true
  }

  return (
    <div style={pageWrap}>
      <div className="content-column">
        <div style={headerWrap}>
          <BackLink />
          <h1 style={headingStyle}>{b.curatorialTitle}</h1>
        </div>
        <div style={countStyle}>
          {usingFallback ? b.selectionComing : `${artworks.length} ${b.selectedWorks}`}
        </div>
        <div className="artwork-grid">
          {artworks.map(a => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
        {artworks.length === 0 && <div style={emptyStyle}>{b.noWorksYet}</div>}
      </div>
    </div>
  )
}
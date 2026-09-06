import { createClient } from '@/lib/supabase/server'
import ArtworkCard from '@/components/ui/ArtworkCard'
import BackLink from '@/components/ui/BackLink'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { pageWrap, headerWrap, headingStyle, countStyle, emptyStyle } from '@/lib/browseStyle'

export const dynamic = 'force-dynamic'

export default async function NewestPage() {
  const supabase = createClient()
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const b = getDict(lang).browse

  const { data: newest } = await supabase
    .from('artworks')
    .select('*, profiles(id, full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(60)

  const artworks = newest || []

  return (
    <div style={pageWrap}>
      <div className="content-column">
        <div style={headerWrap}>
          <BackLink />
          <h1 style={headingStyle}>{b.newestTitle}</h1>
        </div>
        <div style={countStyle}>
          {artworks.length} {b.works}
        </div>
        <div className="artwork-grid">
          {artworks.map(a => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
        {artworks.length === 0 && <div style={emptyStyle}>{b.noWorksYet}</div>}
      </div>
    </div>
  )
}
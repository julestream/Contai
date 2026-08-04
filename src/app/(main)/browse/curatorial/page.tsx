import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ArtworkCard from '@/components/ui/ArtworkCard'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function CuratorialPage() {
  const supabase = createClient()
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const b = getDict(lang).browse

  const { data: featured } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(60)

  let artworks = featured || []
  let usingFallback = false
  if (artworks.length === 0) {
    const { data: newest } = await supabase
      .from('artworks')
      .select('*, profiles(full_name)')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(60)
    artworks = newest || []
    usingFallback = true
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.25rem 1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{b.curatorialTitle}</h1>
      </div>
      <div style={{ padding: '4px 1rem 12px', color: '#999', fontSize: '13px' }}>
        {usingFallback ? b.selectionComing : `${artworks.length} ${b.selectedWorks}`}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 1rem' }}>
        {artworks.map(a => <ArtworkCard key={a.id} artwork={a} />)}
      </div>
      {artworks.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>{b.noWorksYet}</div>}
    </div>
  )
}
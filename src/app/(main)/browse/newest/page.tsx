import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ArtworkCard from '@/components/ui/ArtworkCard'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default async function NewestPage() {
  const supabase = createClient()
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const b = getDict(lang).browse

  const { data: newest } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(60)

  const artworks = newest || []

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.25rem 1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{b.newestTitle}</h1>
      </div>
      <div style={{ padding: '4px 1rem 12px', color: '#999', fontSize: '13px' }}>
        {artworks.length} {b.works}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 1rem' }}>
        {artworks.map(a => <ArtworkCard key={a.id} artwork={a} />)}
      </div>
      {artworks.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>{b.noWorksYet}</div>}
    </div>
  )
}
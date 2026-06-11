import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ArtworkCard from '@/components/ui/ArtworkCard'

export default async function BrowseResultsPage({
  searchParams,
}: {
  searchParams: { type?: string; mood?: string; q?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  if (searchParams.type) query = query.eq('type_of_art', searchParams.type)
  if (searchParams.mood) query = query.contains('mood', [searchParams.mood])
  if (searchParams.q) query = query.or(`title.ilike.%${searchParams.q}%,style.ilike.%${searchParams.q}%`)

  const { data: artworks } = await query

  const heading = searchParams.type || searchParams.mood || (searchParams.q ? `"${searchParams.q}"` : 'All works')

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ padding: '1.25rem 1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/browse" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '22px' }}>{heading}</h1>
      </div>
      <div style={{ padding: '4px 1rem 12px', color: '#999', fontSize: '13px' }}>
        {artworks?.length || 0} works
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 1rem' }}>
        {artworks?.map(a => <ArtworkCard key={a.id} artwork={a} />)}
      </div>

      {artworks?.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No works found in this category yet.</div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

export default function SavedSearchesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searches, setSearches] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      const { data } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      setSearches(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  async function remove(id: string) {
    setSearches(prev => prev.filter(s => s.id !== id))
    const supabase = createClient()
    await supabase.from('saved_searches').delete().eq('id', id)
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>Saved searches</h1>
      </div>

      {searches.length === 0 && (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#999' }}>
          No saved searches yet. When you filter artworks in Browse, you can save the search to find it again here.
        </div>
      )}

      <div style={{ padding: '0 1rem' }}>
        {searches.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
            <Search size={18} color="#999" style={{ flexShrink: 0 }} />
            <Link href={`/browse/results?${s.query_string}`} style={{ textDecoration: 'none', flex: 1 }}>
              <span style={{ fontSize: '15px', color: '#0a0a0a' }}>{s.label || 'Saved search'}</span>
            </Link>
            <button onClick={() => remove(s.id)} aria-label="Remove"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '4px', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
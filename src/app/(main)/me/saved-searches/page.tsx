'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useLang } from '@/i18n/LanguageProvider'

export default function SavedSearchesPage() {
  const router = useRouter()
  const { t } = useLang()
  const c = (k: string) => t(`common.${k}`)
  const s = (k: string) => t(`mePages.savedSearches.${k}`)
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
    setSearches(prev => prev.filter(x => x.id !== id))
    const supabase = createClient()
    await supabase.from('saved_searches').delete().eq('id', id)
  }

  if (loading) return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{c('loading')}</div>

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{s('title')}</h1>
      </div>

      {searches.length === 0 && (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#999' }}>
          {s('empty')}
        </div>
      )}

      <div style={{ padding: '0 1rem' }}>
        {searches.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
            <Search size={18} color="#999" style={{ flexShrink: 0 }} />
            <Link href={`/browse/results?${item.query_string}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '15px', color: '#0a0a0a' }}>{item.label || s('fallback')}</span>
            </Link>
            <button onClick={() => remove(item.id)} aria-label={s('remove')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '4px', display: 'flex', flexShrink: 0 }}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
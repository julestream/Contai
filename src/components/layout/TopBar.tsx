'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bell, MessageCircle, Search, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher'
import { useLang } from '@/i18n/LanguageProvider'

export default function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLang()
  const [q, setQ] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (data?.role === 'admin') setIsAdmin(true)
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    async function checkUnread() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const userId = session.user.id

      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userId},artist_id.eq.${userId}`)

      if (!convs || convs.length === 0) {
        setHasUnread(false)
        return
      }

      const convIds = convs.map((c: any) => c.id)

      const { data: unread } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', convIds)
        .neq('sender_id', userId)
        .eq('read', false)
        .limit(1)

      setHasUnread(!!(unread && unread.length > 0))
    }
    checkUnread()
  }, [pathname])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/browse/results?q=${encodeURIComponent(term)}` : '/browse')
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#0a0a0a', borderBottom: '1px solid #1c1c1c' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <Link href="/notifications" aria-label={t('nav.notifications')} style={{ color: '#ffffff', flexShrink: 0 }}>
          <Bell size={24} />
        </Link>
        <form onSubmit={submit} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1f1f1f', borderRadius: 999, padding: '9px 14px' }}>
            <Search size={18} color="#888" style={{ flexShrink: 0 }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, width: '100%', minWidth: 0, color: '#ffffff' }}
            />
          </div>
        </form>
        <div style={{ flexShrink: 0 }}>
          <CurrencySwitcher compact />
        </div>
        {isAdmin && (
          <Link href="/admin" aria-label={t('nav.admin')} style={{ color: '#c8a24a', flexShrink: 0 }}>
            <Shield size={24} />
          </Link>
        )}
        <Link href="/messages" aria-label={t('nav.messages')} style={{ position: 'relative', color: '#ffffff', flexShrink: 0 }}>
          <MessageCircle size={24} />
          {hasUnread && (
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#e53e3e',
              border: '2px solid #0a0a0a',
            }} />
          )}
        </Link>
      </div>
    </div>
  )
}
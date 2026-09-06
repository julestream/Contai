'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bell, MessageCircle, Search, Shield, Home, LayoutGrid, Plus, Heart, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher'
import LanguageDropdown from '@/components/ui/LanguageDropdown'
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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  // On a laptop a bottom tab bar reads as a phone app, so above 900px the
  // same five destinations move up here beside the search.
  const navItems = [
    { href: '/home', label: t('nav.home'), Icon: Home },
    { href: '/browse', label: t('nav.browse'), Icon: LayoutGrid },
    { href: '/dashboard/upload', label: t('nav.sell'), Icon: Plus },
    { href: '/favorites', label: t('nav.favorites'), Icon: Heart },
    { href: '/me', label: t('nav.me'), Icon: User },
  ]

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#0a0a0a', borderBottom: '1px solid #1c1c1c' }}>
      <div className="page-width" style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>

        {/* Desktop navigation — hidden on phones, where the tab bar serves. */}
        <nav className="desktop-only" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navItems.map(({ href, label, Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 11px', borderRadius: 999,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    fontSize: 13.5,
                    color: active ? '#0a0a0a' : '#c8c8c8',
                    background: active ? '#ffffff' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.3 : 2} />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>

        <Link href="/notifications" aria-label={t('nav.notifications')} className="mobile-only" style={{ color: '#ffffff', flexShrink: 0 }}>
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

        {/* Notifications sit on the right on desktop, beside the other
            controls, rather than out on its own at the far left. */}
        <Link href="/notifications" aria-label={t('nav.notifications')} className="desktop-only" style={{ color: '#ffffff', flexShrink: 0 }}>
          <Bell size={22} />
        </Link>

        <LanguageDropdown />
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
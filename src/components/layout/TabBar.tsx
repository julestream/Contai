'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Plus, Heart, User } from 'lucide-react'
import { useLang } from '@/i18n/LanguageProvider'

export default function TabBar() {
  const pathname = usePathname()
  const { t } = useLang()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const Item = (href: string, label: string, Icon: any) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          textDecoration: 'none',
          color: active ? '#ffffff' : '#a8a8a8',
          fontSize: 11,
          fontWeight: active ? 700 : 400,
        }}
      >
        <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{label}</span>
      </Link>
    )
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#0a0a0a',
          borderTop: '1px solid #1c1c1c',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        {Item('/home', t('nav.home'), Home)}
        {Item('/browse', t('nav.browse'), LayoutGrid)}
        <Link
          href="/dashboard/upload"
          aria-label={t('nav.sell')}
          style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: '#ffffff',
              color: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -18,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Plus size={26} strokeWidth={2.4} />
          </span>
        </Link>
        {Item('/favorites', t('nav.favorites'), Heart)}
        {Item('/me', t('nav.me'), User)}
      </div>
    </nav>
  )
}
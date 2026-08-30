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
        key={href}
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

  const browseActive = isActive('/browse')

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
          alignItems: 'flex-start',
          padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        {Item('/home', t('nav.home'), Home)}
        {/* Sell is an ordinary slot now, with a word rather than a bare +.
            It was the largest thing on the bar while serving only artists —
            on a marketplace built for buyers, browsing deserves that place. */}
        {Item('/dashboard/upload', t('nav.sell'), Plus)}

        <Link
          href="/browse"
          aria-label={t('nav.browse')}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            textDecoration: 'none',
            color: browseActive ? '#ffffff' : '#a8a8a8',
            fontSize: 11,
            fontWeight: browseActive ? 700 : 400,
          }}
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
              flexShrink: 0,
            }}
          >
            <LayoutGrid size={24} strokeWidth={2.2} />
          </span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {t('nav.browse')}
          </span>
        </Link>

        {Item('/favorites', t('nav.favorites'), Heart)}
        {Item('/me', t('nav.me'), User)}
      </div>
    </nav>
  )
}
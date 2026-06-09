'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Plus, Heart, User } from 'lucide-react'

export default function TabBar() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const Item = (href: string, label: string, Icon: any) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          textDecoration: 'none',
          color: active ? '#0a0a0a' : '#999999',
          fontSize: 11,
          fontWeight: active ? 700 : 400,
        }}
      >
        <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        <span>{label}</span>
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
        background: '#ffffff',
        borderTop: '1px solid #e8e8e8',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        {Item('/', 'Home', Home)}
        {Item('/browse', 'Browse', LayoutGrid)}
        <Link
          href="/dashboard/upload"
          aria-label="Sell"
          style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: '#0a0a0a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -18,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <Plus size={26} strokeWidth={2.4} />
          </span>
        </Link>
        {Item('/favorites', 'Favorites', Heart)}
        {Item('/me', 'Me', User)}
      </div>
    </nav>
  )
}

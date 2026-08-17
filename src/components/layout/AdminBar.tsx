'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AdminBar() {
  const pathname = usePathname()
  const tabs = [
    { href: '/admin/handovers', label: 'Handovers' },
    { href: '/admin/listings', label: 'Listings' },
    { href: '/admin/documents', label: 'Documents' },
    { href: '/admin/issues', label: 'Issues' },
    { href: '/admin/artists', label: 'Artists' },
  ]

  return (
    <div style={{ borderBottom: '1px solid #e8e8e8', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 1rem' }}>
        <Link href="/admin" style={{ textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#0a0a0a', flexShrink: 0 }}>
          Admin
        </Link>
        <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {tabs.map(t => {
            const active = pathname.startsWith(t.href)
            return (
              <Link key={t.href} href={t.href} style={{
                textDecoration: 'none', fontSize: 14, padding: '6px 12px', borderRadius: 999,
                color: active ? '#ffffff' : '#666',
                background: active ? '#0a0a0a' : 'transparent',
                fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap',
              }}>
                {t.label}
              </Link>
            )
          })}
        </div>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#999', flexShrink: 0 }}>
          <ArrowLeft size={15} /> Site
        </Link>
      </div>
    </div>
  )
}
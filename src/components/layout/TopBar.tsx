'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bell, MessageCircle, Search } from 'lucide-react'

export default function TopBar() {
  const router = useRouter()
  const [q, setQ] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/browse/results?q=${encodeURIComponent(term)}` : '/browse')
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#0a0a0a', borderBottom: '1px solid #1c1c1c' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <Link href="/notifications" aria-label="Notifications" style={{ color: '#ffffff', flexShrink: 0 }}>
          <Bell size={24} />
        </Link>
        <form onSubmit={submit} style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1f1f1f', borderRadius: 999, padding: '9px 14px' }}>
            <Search size={18} color="#888" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search for items, members..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, width: '100%', color: '#ffffff' }}
            />
          </div>
        </form>
        <Link href="/messages" aria-label="Messages" style={{ color: '#ffffff', flexShrink: 0 }}>
          <MessageCircle size={24} />
        </Link>
      </div>
    </div>
  )
}
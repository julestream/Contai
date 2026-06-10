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
    router.push(term ? `/browse?q=${encodeURIComponent(term)}` : '/browse')
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#ffffff', borderBottom: '1px solid #eee' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <Link href="/notifications" aria-label="Notifications" style={{ color: '#0a0a0a', flexShrink: 0 }}>
          <Bell size={24} />
        </Link>
        <form onSubmit={submit} style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f2f2f2', borderRadius: 999, padding: '9px 14px' }}>
            <Search size={18} color="#999" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search for items, members..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, width: '100%', color: '#0a0a0a' }}
            />
          </div>
        </form>
        <Link href="/messages" aria-label="Messages" style={{ color: '#0a0a0a', flexShrink: 0 }}>
          <MessageCircle size={24} />
        </Link>
      </div>
    </div>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallback = '/browse' }: { fallback?: string }) {
  const router = useRouter()

  // Work out a friendly label for where "back" goes, based on the previous page.
  function backLabel(): string {
    if (typeof document === 'undefined') return 'Back'
    const ref = document.referrer
    if (!ref) return 'Back'
    try {
      const path = new URL(ref).pathname
      if (path === '/home' || path === '/') return 'Home'
      if (path.startsWith('/browse/newest')) return 'Newest'
      if (path.startsWith('/browse/curatorial')) return 'Curatorial'
      if (path.startsWith('/browse')) return 'Browse'
      if (path.startsWith('/favorites')) return 'Favorites'
      if (path.startsWith('/search')) return 'Search'
      if (path.startsWith('/artist')) return 'Artist'
      if (path.startsWith('/dashboard')) return 'Dashboard'
      return 'Back'
    } catch {
      return 'Back'
    }
  }

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button onClick={goBack} aria-label="Go back"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#6b6b6b', fontSize: '14px', padding: 0,
        fontFamily: 'var(--font-instrument), sans-serif',
      }}>
      <span style={{
        width: 30, height: 30, borderRadius: 999,
        background: '#f0ece5', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ArrowLeft size={17} color="#0a0a0a" />
      </span>
      <span>{backLabel()}</span>
    </button>
  )
}
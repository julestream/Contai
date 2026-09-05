'use client'
import { useRouter } from 'next/navigation'

// These pages are reached from several places — the home carousel, a link
// inside an artwork page, the footer. A hardcoded '/home' sent everyone to
// the same place regardless, so a buyer reading about the process lost the
// piece they were looking at.
export default function BackLink({ fallback = '/home' }: { fallback?: string }) {
  const router = useRouter()

  function goBack() {
    // Arriving directly — a shared link, or a new tab — leaves nothing to
    // go back to, so fall back to somewhere sensible.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      onClick={goBack}
      aria-label="Back"
      style={{
        background: 'none', border: 'none', padding: 0,
        color: '#0a0a0a', fontSize: '20px', cursor: 'pointer',
        lineHeight: 1, fontFamily: 'inherit',
      }}
    >
      ←
    </button>
  )
}
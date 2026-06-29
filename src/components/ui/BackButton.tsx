'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallback = '/browse' }: { fallback?: string }) {
  const router = useRouter()

  function goBack() {
    // If there's history to go back to, use it (returns to the exact row/scroll spot).
    // Otherwise (e.g. opened via direct link), fall back to a sensible page.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button onClick={goBack} aria-label="Go back"
      style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 10,
        width: '38px', height: '38px', borderRadius: '999px', border: 'none', cursor: 'pointer',
        background: 'rgba(10,10,10,0.55)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}>
      <ArrowLeft size={20} />
    </button>
  )
}
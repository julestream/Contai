'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallback = '/browse' }: { fallback?: string }) {
  const router = useRouter()

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
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#0a0a0a', fontSize: '14px', padding: 0,
      }}>
      <ArrowLeft size={20} />
    </button>
  )
}
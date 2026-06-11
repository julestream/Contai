'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

export default function HomePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'checking' | 'showing' | 'fading'>('checking')

  useEffect(() => {
    const seen = sessionStorage.getItem('contai_splash_seen')
    if (seen) {
      router.replace('/home')
      return
    }
    sessionStorage.setItem('contai_splash_seen', '1')
    setPhase('showing')
    const fade = setTimeout(() => setPhase('fading'), 4500)
    const go = setTimeout(() => router.replace('/home'), 5300)
    return () => { clearTimeout(fade); clearTimeout(go) }
  }, [router])

  if (phase === 'checking') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 700ms ease',
      }}
    >
      <Logo dark size={1.6} />
      <div
        style={{
          width: 26,
          height: 26,
          border: '2px solid rgba(255,255,255,0.25)',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          animation: 'contai-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes contai-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

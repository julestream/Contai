'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/ui/Logo'

export default function SplashScreen() {
  const [show, setShow] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('contai_splash_seen')
    if (seen) return
    sessionStorage.setItem('contai_splash_seen', '1')
    setShow(true)
    // 15% shorter than the original 4000/5000. Long enough to register,
    // short enough not to stand between someone and the art.
    const fade = setTimeout(() => setHidden(true), 3400)
    const remove = setTimeout(() => setShow(false), 4250)
    return () => { clearTimeout(fade); clearTimeout(remove) }
  }, [])

  if (!show) return null

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
        opacity: hidden ? 0 : 1,
        transition: 'opacity 850ms ease',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      <Logo dark size={1.6} link={false} />
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
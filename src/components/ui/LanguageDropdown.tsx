'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/i18n/LanguageProvider'
import { LANGUAGES } from '@/i18n/dictionaries'

// A compact two-letter control for the dark top bar.
//
// The codes are never translated: someone who cannot read the current
// interface still recognises RO as their own language. That is the whole
// point of this control, so it has to work for a reader who understands
// nothing else on the page.
export default function LanguageDropdown() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when tapping anywhere else.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Language"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          padding: '6px 9px', borderRadius: '999px',
          border: '1px solid #333', background: open ? '#1f1f1f' : 'transparent',
          color: '#ffffff', cursor: 'pointer',
          fontSize: '12.5px', letterSpacing: '0.06em',
          fontFamily: 'var(--font-instrument), sans-serif',
          lineHeight: 1,
        }}
      >
        {current.code.toUpperCase()}
        <span style={{ fontSize: '8px', opacity: 0.7, marginTop: '1px' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#1f1f1f', border: '1px solid #333', borderRadius: '10px',
          overflow: 'hidden', minWidth: '112px', zIndex: 60,
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}>
          {LANGUAGES.map(l => {
            const active = l.code === lang
            return (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '11px 13px',
                  border: 'none', background: active ? '#2c2c2c' : 'transparent',
                  color: '#ffffff', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-instrument), sans-serif', fontSize: '14px',
                }}
              >
                <span style={{
                  fontSize: '11.5px', letterSpacing: '0.08em',
                  color: active ? '#ffffff' : '#8a8a8a', minWidth: '20px',
                }}>
                  {l.code.toUpperCase()}
                </span>
                {/* The endonym — 'Magyar', not 'Hungarian' — so it is
                    readable to the person looking for it. */}
                <span style={{ color: active ? '#ffffff' : '#c8c8c8' }}>{l.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
'use client'
import { useState, useRef, useEffect } from 'react'
import { useCurrency, Currency } from '@/currency/CurrencyProvider'

const OPTIONS: { value: Currency; label: string; name: string }[] = [
  { value: 'HUF', label: 'Ft', name: 'Forint' },
  { value: 'EUR', label: '€', name: 'Euro' },
  { value: 'RON', label: 'lei', name: 'Leu' },
]

export default function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency()
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

  // ── Compact: the dark top bar. A dropdown, matching the language
  //    control beside it — three inline buttons crowded the row.
  if (compact) {
    const current = OPTIONS.find(o => o.value === currency) || OPTIONS[0]

    return (
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Currency"
          aria-expanded={open}
          style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            padding: '6px 9px', borderRadius: '999px',
            border: '1px solid #333', background: open ? '#1f1f1f' : 'transparent',
            color: '#ffffff', cursor: 'pointer',
            fontSize: '12.5px', letterSpacing: '0.03em',
            fontFamily: 'var(--font-instrument), sans-serif',
            lineHeight: 1,
          }}
        >
          {current.label}
          <span style={{ fontSize: '8px', opacity: 0.7, marginTop: '1px' }}>▾</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: '#1f1f1f', border: '1px solid #333', borderRadius: '10px',
            overflow: 'hidden', minWidth: '112px', zIndex: 60,
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}>
            {OPTIONS.map(o => {
              const active = o.value === currency
              return (
                <button
                  key={o.value}
                  onClick={() => { setCurrency(o.value); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '11px 13px',
                    border: 'none', background: active ? '#2c2c2c' : 'transparent',
                    color: '#ffffff', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-instrument), sans-serif', fontSize: '14px',
                  }}
                >
                  <span style={{
                    fontSize: '12.5px', color: active ? '#ffffff' : '#8a8a8a',
                    minWidth: '20px',
                  }}>
                    {o.label}
                  </span>
                  <span style={{ color: active ? '#ffffff' : '#c8c8c8' }}>{o.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Full: light backgrounds elsewhere in the app. Unchanged.
  return (
    <div style={{ display: 'inline-flex', gap: '6px', background: '#f5f3ef', borderRadius: '999px', padding: '4px' }}>
      {OPTIONS.map(o => {
        const active = currency === o.value
        return (
          <button key={o.value} onClick={() => setCurrency(o.value)}
            style={{
              padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: active ? 600 : 400,
              background: active ? '#0a0a0a' : 'transparent',
              color: active ? '#fff' : '#0a0a0a',
            }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
'use client'
import { useCurrency, Currency } from '@/currency/CurrencyProvider'

const OPTIONS: { value: Currency; label: string }[] = [
  { value: 'HUF', label: 'Ft' },
  { value: 'EUR', label: '€' },
  { value: 'RON', label: 'lei' },
]

export default function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency()

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', gap: '2px', background: '#1f1f1f', borderRadius: '999px', padding: '3px' }}>
        {OPTIONS.map(o => {
          const active = currency === o.value
          return (
            <button key={o.value} onClick={() => setCurrency(o.value)}
              style={{
                padding: '4px 9px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 600 : 400, lineHeight: 1,
                background: active ? '#c8a24a' : 'transparent',
                color: active ? '#0a0a0a' : '#bbb',
              }}>
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }

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
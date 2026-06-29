'use client'
import { useCurrency, Currency } from '@/currency/CurrencyProvider'

const OPTIONS: { value: Currency; label: string }[] = [
  { value: 'HUF', label: 'Ft' },
  { value: 'EUR', label: '€' },
  { value: 'RON', label: 'lei' },
]

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
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
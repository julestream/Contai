'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'

// Reserving here is unusual: pay a deposit, meet a stranger, pay the rest in
// person. That is the thing a buyer hesitates over, and until now it was
// only explained after they had already tapped Reserve.
//
// A visible label rather than a question mark: someone unfamiliar with the
// model does not know there is anything to ask about.
export default function HowBuyingWorks() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  const steps = [
    t('artwork.howBuying1'),
    t('artwork.howBuying2'),
    t('artwork.howBuying3'),
    t('artwork.howBuying4'),
  ]

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '6px', width: '100%', padding: '10px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a857c',
          fontFamily: 'var(--font-instrument), sans-serif',
        }}
      >
        {t('artwork.howBuyingLabel')}
        <span style={{
          fontSize: '9px',
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 160ms ease',
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          padding: '14px 16px 6px', background: '#f5f3ef',
          borderRadius: '10px', marginTop: '2px',
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '11px', marginBottom: '12px' }}>
              <span style={{
                flexShrink: 0, width: '20px', height: '20px', borderRadius: '999px',
                background: '#e4ddd0', color: '#5a5246',
                fontSize: '11px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#5a5246', margin: 0 }}>
                {s}
              </p>
            </div>
          ))}
          <Link
            href="/how-it-works"
            style={{
              display: 'inline-block', fontSize: '12.5px', color: '#0a0a0a',
              textDecoration: 'none', borderBottom: '1px solid #d8d2c6',
              marginBottom: '10px',
            }}
          >
            {t('artwork.moreAboutProcess')} →
          </Link>
        </div>
      )}
    </div>
  )
}
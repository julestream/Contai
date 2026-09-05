'use client'

import { useLang } from '@/i18n/LanguageProvider'
import BackLink from '@/components/ui/BackLink'
import { getInfo } from '@/i18n/infopages'

export default function HelpPage() {
  const { lang } = useLang()
  const help = getInfo(lang).help

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* The language switcher lives in the top bar now, on every page —
          a second one here was a leftover from before that existed. */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1rem 0.5rem' }}>
        <BackLink fallback="/me" />
      </div>

      <div style={{ padding: '0.5rem 1.25rem 0' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{help.title}</h1>
      </div>

      <div style={{ padding: '0.5rem 1.25rem' }}>
        {help.faq.map((item, i) => (
          <div key={i} style={{ padding: '1.25rem 0', borderBottom: '1px solid #eee' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>{item.q}</p>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
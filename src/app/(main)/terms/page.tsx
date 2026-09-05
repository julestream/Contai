'use client'

import { useLang } from '@/i18n/LanguageProvider'
import BackLink from '@/components/ui/BackLink'
import { getPolicy } from '@/i18n/policies'

export default function TermsPage() {
  const { lang } = useLang()
  const doc = getPolicy(lang, 'terms')

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* The language switcher lives in the top bar now, on every page —
          a second one here was a leftover from before that existed. */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1rem 0.5rem' }}>
        <BackLink />
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', color: '#0a0a0a' }}>{doc.title}</h1>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{doc.updated}</p>
        <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginTop: '1rem' }}>{doc.intro}</p>

        {doc.sections.map((s, i) => (
          <div key={i} style={{ marginTop: '1.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '17px', marginBottom: '8px' }}>{s.heading}</h2>
            {s.body.map((b, j) => (
              <p key={j} style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '6px' }}>{b}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
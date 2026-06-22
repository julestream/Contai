'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { getPolicy } from '@/i18n/policies'

export default function PrivacyPage() {
  const { lang } = useLang()
  const doc = getPolicy(lang, 'privacy')

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <LanguageSwitcher />
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
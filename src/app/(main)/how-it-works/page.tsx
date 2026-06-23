'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { getHowItWorks } from '@/i18n/howitworks'

export default function HowItWorksPage() {
  const { lang } = useLang()
  const doc = getHowItWorks(lang)

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <LanguageSwitcher />
      </div>

      <div style={{ padding: '0.5rem 1.25rem 0' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px' }}>{doc.title}</h1>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, marginTop: '8px' }}>{doc.intro}</p>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        {doc.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '14px', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '999px', flexShrink: 0,
              background: '#1c2b3a', color: '#f2ebe2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-fraunces), Georgia, serif',
            }}>{i + 1}</div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#0a0a0a', marginBottom: '4px' }}>{s.title}</p>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '1.5rem', padding: '16px', borderRadius: '12px', background: '#f5f3ef' }}>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>{doc.closing}</p>
        </div>
      </div>
    </div>
  )
}
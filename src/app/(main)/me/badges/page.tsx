'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { getInfo } from '@/i18n/infopages'

export default function BadgesPage() {
  const { lang } = useLang()
  const badges = getInfo(lang).badges

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <LanguageSwitcher />
      </div>

      <div style={{ padding: '0.5rem 1.25rem 0' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{badges.title}</h1>
      </div>

      <div style={{ padding: '0.5rem 1.25rem' }}>
        <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {badges.intro}
        </p>

        {badges.items.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '999px', background: b.color, marginTop: '5px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a' }}>{b.name}</p>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5, marginTop: '2px' }}>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
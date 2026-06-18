'use client'

import { useLang } from '@/i18n/LanguageProvider'
import { LANGUAGES } from '@/i18n/dictionaries'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {LANGUAGES.map(l => {
        const active = l.code === lang
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            aria-label={l.label}
            title={l.label}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px', borderRadius: '999px', cursor: 'pointer',
              fontSize: '13px',
              border: active ? '1.5px solid #0a0a0a' : '1px solid #e0dcd3',
              background: active ? '#0a0a0a' : '#fff',
              color: active ? '#fff' : '#0a0a0a',
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{l.flag}</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l.code}</span>
          </button>
        )
      })}
    </div>
  )
}
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default function GetPaidPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const g = (getDict(lang) as any).mePages.getPaid

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{g.title}</h1>
      </div>

      <div style={{ padding: '0.5rem 1.25rem' }}>
        <p style={{ fontSize: '15px', color: '#333', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {g.intro}
        </p>

        <div style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>{g.step1Title}</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{g.step1Body}</p>
        </div>

        <div style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>{g.step2Title}</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{g.step2Body}</p>
        </div>

        <div style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>{g.step3Title}</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{g.step3Body}</p>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '16px', borderRadius: '12px', background: '#f5f3ef' }}>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>{g.note}</p>
        </div>

        <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.6, marginTop: '1.25rem' }}>
          {g.taxNote}
        </p>
      </div>
    </div>
  )
}
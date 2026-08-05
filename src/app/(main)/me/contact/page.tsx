import Link from 'next/link'
import { Mail } from 'lucide-react'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const k = (getDict(lang) as any).mePages.contact

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{k.title}</h1>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: '15px', color: '#333', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {k.intro}
        </p>

        <a href="mailto:hello@contaigallery.com" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px', borderRadius: '12px', background: '#0a0a0a', color: '#fff',
          }}>
            <Mail size={20} color="#c8a24a" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>hello@contaigallery.com</span>
          </div>
        </a>
      </div>
    </div>
  )
}
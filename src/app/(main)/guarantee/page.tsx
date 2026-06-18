'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { ShieldCheck } from 'lucide-react'

export default function GuaranteePage() {
  const { t } = useLang()

  const refunds: string[] = t('guarantee.refunds')
  const how: string[] = t('guarantee.how')
  const notCovered: string[] = t('guarantee.notCovered')

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Top bar: back + language switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '999px', background: '#0a0a0a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={28} color="#c8a24a" />
          </div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', color: '#0a0a0a' }}>
          {t('guarantee.title')}
        </h1>
        <p style={{ fontSize: '15px', color: '#666', marginTop: '8px', lineHeight: 1.4 }}>
          {t('guarantee.subtitle')}
        </p>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Intro */}
        <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
          {t('guarantee.intro')}
        </p>

        {/* Refund conditions */}
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '17px', marginTop: '1.75rem', marginBottom: '10px' }}>
          {t('guarantee.refundTitle')}
        </h2>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          {refunds.map((r, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '6px' }}>{r}</li>
          ))}
        </ul>
        <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginTop: '12px', background: '#f5f3ef', padding: '12px', borderRadius: '8px' }}>
          {t('guarantee.refundNote')}
        </p>

        {/* How it works */}
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '17px', marginTop: '1.75rem', marginBottom: '10px' }}>
          {t('guarantee.howTitle')}
        </h2>
        <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
          {how.map((h, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '8px' }}>{h}</li>
          ))}
        </ol>

        {/* Not covered */}
        <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '17px', marginTop: '1.75rem', marginBottom: '10px' }}>
          {t('guarantee.notCoveredTitle')}
        </h2>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          {notCovered.map((n, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '6px' }}>{n}</li>
          ))}
        </ul>

        {/* Promise */}
        <div style={{ marginTop: '2rem', padding: '16px', border: '1px solid #e8e8e8', borderRadius: '12px', background: '#fafafa' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '17px', marginBottom: '8px' }}>
            {t('guarantee.promiseTitle')}
          </h2>
          <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
            {t('guarantee.promise')}
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { getAbout } from '@/i18n/about'

export default function AboutPage() {
  const { lang } = useLang()
  const doc = getAbout(lang)

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9c5a3c' }}>{doc.tag}</span>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '28px', color: '#0a0a0a', marginTop: '6px' }}>
          {doc.title}
        </h1>
        <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontStyle: 'italic', fontSize: '17px', color: '#666', marginTop: '6px' }}>
          {doc.subtitle}
        </p>
      </div>

      {/* Body: paragraphs interleaved with photos */}
      <div style={{ padding: '1rem 1.25rem' }}>
        {doc.paragraphs.map((para, i) => (
          <div key={i}>
            <p style={{ fontSize: '15px', color: '#333', lineHeight: 1.7, marginBottom: '1.25rem' }}>{para}</p>

            {/* Place a photo after paragraphs (2nd, 3rd, 4th get the first three photos) */}
            {i >= 1 && doc.photos[i - 1] && (
              <figure style={{ margin: '0 0 1.5rem' }}>
                <img
                  src={doc.photos[i - 1].src}
                  alt={doc.photos[i - 1].caption}
                  style={{ width: '100%', borderRadius: '12px', display: 'block', objectFit: 'cover' }}
                />
                <figcaption style={{ fontSize: '12.5px', color: '#999', marginTop: '8px', lineHeight: 1.4 }}>
                  {doc.photos[i - 1].caption}
                </figcaption>
              </figure>
            )}
          </div>
        ))}

        {/* Fourth photo after the last paragraph */}
        {doc.photos[3] && (
          <figure style={{ margin: '0 0 1.5rem' }}>
            <img
              src={doc.photos[3].src}
              alt={doc.photos[3].caption}
              style={{ width: '100%', borderRadius: '12px', display: 'block', objectFit: 'cover' }}
            />
            <figcaption style={{ fontSize: '12.5px', color: '#999', marginTop: '8px', lineHeight: 1.4 }}>
              {doc.photos[3].caption}
            </figcaption>
          </figure>
        )}

        {/* Closing */}
        <div style={{ marginTop: '0.5rem', padding: '18px', borderRadius: '12px', background: '#f5f3ef' }}>
          <p style={{ fontSize: '15px', color: '#333', lineHeight: 1.7 }}>{doc.closing}</p>
        </div>
      </div>
    </div>
  )
}
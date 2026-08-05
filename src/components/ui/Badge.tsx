'use client'
import { useState } from 'react'
import { useLang } from '@/i18n/LanguageProvider'

type BadgeType = 'verified_artist' | 'established_artist' | 'curator_approved' | 'certificate'

const BADGE_STYLE: Record<BadgeType, { color: string; bg: string }> = {
  verified_artist: { color: '#3a5a44', bg: '#eef2ee' },
  established_artist: { color: '#9c5a3c', bg: '#f6ece3' },
  curator_approved: { color: '#6b4a6b', bg: '#f1ebf0' },
  certificate: { color: '#3a4a66', bg: '#eaeef4' },
}

export default function Badge({ type }: { type: BadgeType }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const { t } = useLang()
  const style = BADGE_STYLE[type]
  const copy = t(`badges.${type}`) as any
  if (!style || !copy || typeof copy !== 'object') return null

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 12px', borderRadius: '999px',
        backgroundColor: style.bg, color: style.color,
        fontSize: '12px', fontWeight: 600, letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}>
        {copy.label}
      </div>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        aria-label={t('badges.helpLabel')}
        style={{
          width: '15px', height: '15px', borderRadius: '999px',
          border: '1px solid #c8c8c8', background: 'none', color: '#999',
          cursor: 'pointer', fontSize: '9px', lineHeight: 1, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, flexShrink: 0,
        }}
      >?</button>
      {showTooltip && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 10,
          backgroundColor: 'white', border: '1px solid #e8e8e8',
          borderRadius: '8px', padding: '12px', fontSize: '13px',
          color: '#444', width: '220px', marginTop: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          lineHeight: 1.5,
        }}>
          {copy.description}
          <button onClick={() => setShowTooltip(false)} style={{ display: 'block', marginTop: '8px', color: '#0a0a0a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
            {t('badges.gotIt')}
          </button>
        </div>
      )}
    </div>
  )
}
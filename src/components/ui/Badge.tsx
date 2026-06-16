'use client'
import { useState } from 'react'

type BadgeType = 'verified_artist' | 'established_artist' | 'curator_approved' | 'certificate'

const BADGE_CONFIG: Record<BadgeType, { label: string; color: string; bg: string; description: string }> = {
  verified_artist: {
    label: 'Verified Artist',
    color: '#3a5a44',
    bg: '#eef2ee',
    description: 'Identity confirmed by Contai. This artist has completed our verification process.',
  },
  established_artist: {
    label: 'Established Artist',
    color: '#9c5a3c',
    bg: '#f6ece3',
    description: 'An active artist with a proven track record of sales and reviewed credentials on Contai.',
  },
  curator_approved: {
    label: 'Curator Pick',
    color: '#6b4a6b',
    bg: '#f1ebf0',
    description: 'Hand-selected by the Contai editorial team for exceptional work.',
  },
  certificate: {
    label: 'Certificate',
    color: '#3a4a66',
    bg: '#eaeef4',
    description: 'A certificate of authenticity is on file for this artwork.',
  },
}

export default function Badge({ type }: { type: BadgeType }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = BADGE_CONFIG[type]
  if (!config) return null

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 12px', borderRadius: '999px',
        backgroundColor: config.bg, color: config.color,
        fontSize: '12px', fontWeight: 600, letterSpacing: '0.01em',
      }}>
        {config.label}
      </div>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        aria-label="What does this badge mean?"
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
          {config.description}
          <button onClick={() => setShowTooltip(false)} style={{ display: 'block', marginTop: '8px', color: '#0a0a0a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
            Got it
          </button>
        </div>
      )}
    </div>
  )
}
'use client'
import { useState } from 'react'

type BadgeType = 'verified_artist' | 'certificate' | 'curator_approved'

const BADGE_CONFIG = {
  verified_artist: {
    label: 'Verified Artist',
    color: '#2d6a4f',
    bg: '#eef4f1',
    icon: '✓',
    description: 'Identity confirmed by Contai. This artist has completed our review process.',
  },
  certificate: {
    label: 'Certificate',
    color: '#92400e',
    bg: '#fef3c7',
    icon: '◈',
    description: 'A certificate of authenticity or provenance document is on file for this artist.',
  },
  curator_approved: {
    label: 'Curator Pick',
    color: '#6d28d9',
    bg: '#ede9fe',
    icon: '◆',
    description: 'This artist has been personally selected by the Contai editorial team.',
  },
}

export default function Badge({ type }: { type: BadgeType }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = BADGE_CONFIG[type]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', borderRadius: '999px',
        backgroundColor: config.bg, color: config.color,
        fontSize: '12px', fontWeight: 600,
      }}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '12px', padding: '0 2px' }}
      >?</button>
      {showTooltip && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 10,
          backgroundColor: 'white', border: '1px solid #e8e8e8',
          borderRadius: '8px', padding: '12px', fontSize: '13px',
          color: '#444', width: '220px', marginTop: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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

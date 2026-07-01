'use client'
import { Shield } from 'lucide-react'

const COPY: Record<string, string> = {
  hu: 'Nagy értékű műalkotás. A Contai biztonságos, felügyelt átadást szervez — a Contai Garancia teljes védelmével.',
  en: 'High-value artwork. Contai arranges a secure, supervised handoff — fully covered by the Contai Guarantee.',
  ro: 'Operă de valoare ridicată. Contai organizează un transfer sigur și supravegheat — protejat integral de Garanția Contai.',
}

export default function HighValueNotice() {
  const lang = (typeof document !== 'undefined' && document.cookie.match(/contai_lang=(\w+)/)?.[1]) || 'hu'
  const text = COPY[lang] || COPY.hu

  return (
    <div style={{
      marginTop: '1rem', padding: '12px 14px', borderRadius: '12px',
      background: '#f3f0e8', border: '1px solid #e2dcc9',
      display: 'flex', gap: '10px', alignItems: 'flex-start',
    }}>
      <Shield size={18} color="#c8a24a" style={{ flexShrink: 0, marginTop: '1px' }} />
      <p style={{ fontSize: '13px', color: '#6b5d3a', lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { useLang } from '@/i18n/LanguageProvider'

export default function ConnectButton({ hasAccount }: { hasAccount: boolean }) {
  const [loading, setLoading] = useState(false)
  const { t } = useLang()

  async function handleConnect() {
    setLoading(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

  if (hasAccount) {
    return <p style={{ fontSize: '13px', color: '#2d6a4f' }}>✓ {t('dashboard.bankConnected')}</p>
  }

  return (
    <button onClick={handleConnect} disabled={loading} style={{
      padding: '10px 20px', backgroundColor: 'white', border: '1px solid #e8e8e8',
      borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#666',
    }}>
      {loading ? t('dashboard.connecting') : t('dashboard.connectBank')}
    </button>
  )
}
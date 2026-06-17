'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CertificateActions({ artworkId, certificatePath, status }: { artworkId: string; certificatePath: string | null; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [viewError, setViewError] = useState('')

  async function setStatus(newStatus: string) {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('artworks').update({ certificate_status: newStatus }).eq('id', artworkId)
    router.refresh()
    setLoading(false)
  }

  async function viewCertificate() {
    if (!certificatePath) return
    setViewError('')
    try {
      const res = await fetch('/api/admin/certificate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: certificatePath }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) { setViewError('Could not open certificate.'); return }
      window.open(data.url, '_blank')
    } catch {
      setViewError('Could not open certificate.')
    }
  }

  return (
    <div style={{ marginTop: '1rem', padding: '12px', borderRadius: '8px', backgroundColor: '#eaeef4' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#3a4a66', marginBottom: '8px' }}>
        Certificate of authenticity — {status}
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={viewCertificate} style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid #3a4a66', background: 'white', color: '#3a4a66', fontSize: '13px', cursor: 'pointer' }}>
          View file
        </button>
        {status !== 'approved' && (
          <button onClick={() => setStatus('approved')} disabled={loading} style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', background: '#2d6a4f', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
            Approve certificate
          </button>
        )}
        {status !== 'rejected' && (
          <button onClick={() => setStatus('rejected')} disabled={loading} style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', background: '#b94040', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
            Reject
          </button>
        )}
      </div>
      {viewError && <p style={{ color: '#b94040', fontSize: '12px', marginTop: '6px' }}>{viewError}</p>}
    </div>
  )
}
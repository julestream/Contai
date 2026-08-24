'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import { resizeImage } from '@/lib/resizeImage'

const DOC_KEYS = ['id', 'cv', 'certificate', 'provenance']

export default function VerificationPage() {
  const { t } = useLang()
  const v = (k: string) => t(`verification.${k}`)
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadDocs() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('profile_id', session.user.id)
    setDocuments(data || [])
  }

  useEffect(() => { loadDocs() }, [])

  async function handleUpload(docType: string, ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(docType)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(v('errNotSignedIn')); setUploading(null); return }

    // Documents have to stay legible for review, so a gentler ceiling than
    // artwork photos. PDFs pass through untouched. Shrinking here also means
    // the full-resolution original of someone's ID never leaves their phone.
    const prepared = await resizeImage(file, 2000, 0.88)

    const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${session.user.id}/${docType}-${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(path, prepared, { upsert: true, contentType: prepared.type })

    if (uploadError) {
      setError(v('errUpload') + ' ' + uploadError.message)
      setUploading(null)
      return
    }

    const { error: insertError } = await supabase.from('verification_documents').insert({
      profile_id: session.user.id,
      document_type: docType,
      storage_path: path,
      status: 'pending',
    })
    if (insertError) {
      setError(v('errSave') + ' ' + insertError.message)
      setUploading(null)
      return
    }

    await loadDocs()
    setUploading(null)
  }

  function getDocStatus(docType: string) {
    return documents.find(d => d.document_type === docType)
  }

  const hasId = !!getDocStatus('id')
  const docTypes = (t('verification.docTypes') || {}) as Record<string, { label: string; description: string }>
  const statusLabels = (t('verification.statusLabels') || {}) as Record<string, string>

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '0.5rem' }}>{v('title')}</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '2rem' }}>
        {v('intro')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DOC_KEYS.map(key => {
          const existing = getDocStatus(key)
          const doc = docTypes[key] || { label: key, description: '' }
          return (
            <div key={key} style={{ padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '15px' }}>{doc.label}</p>
                  <p style={{ color: '#999', fontSize: '13px', marginTop: '2px' }}>{doc.description}</p>
                </div>
                {existing ? (
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    backgroundColor: existing.status === 'approved' ? '#eef4f1' : existing.status === 'rejected' ? '#fdf0f0' : '#f5f3ef',
                    color: existing.status === 'approved' ? '#2d6a4f' : existing.status === 'rejected' ? '#b94040' : '#666',
                  }}>
                    {statusLabels[existing.status] || existing.status}
                  </span>
                ) : (
                  <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={uploading !== null}
                      onChange={ev => handleUpload(key, ev)}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      padding: '8px 16px', borderRadius: '999px', fontSize: '13px',
                      backgroundColor: '#0a0a0a', color: 'white', fontWeight: 500, whiteSpace: 'nowrap',
                    }}>
                      {uploading === key ? v('uploading') : v('upload')}
                    </span>
                  </label>
                )}
              </div>
              {existing && key === 'id' && (
                <p style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '10px' }}>
                  {v('idUploadedNote')}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}

      {hasId && (
        <Link href="/dashboard/upload" style={{ textDecoration: 'none' }}>
          <div style={{
            marginTop: '2rem', padding: '16px', backgroundColor: '#0a0a0a', color: 'white',
            borderRadius: '999px', textAlign: 'center', fontSize: '16px', fontWeight: 600,
          }}>
            {v('continueToUpload')}
          </div>
        </Link>
      )}
    </div>
  )
}